import type { SqlDatabase, SqlValue } from '@factory/storage';

import { validateTransaction, ValidationError } from '@/features/transactions/validation';
import type { Account, PaymentMethod, Transaction, TransactionInput, TransactionType } from '@/types';
import type { DayKey } from '@/utils/dates';
import { newId } from '@/utils/id';

interface TxRow {
  id: string;
  type: string;
  amount: number;
  currency: string;
  account_id: string;
  to_account_id: string | null;
  to_amount: number | null;
  category_id: string | null;
  date: string;
  time: string | null;
  description: string;
  notes: string;
  payment_method: string | null;
  recurring_rule_id: string | null;
  created_at: string;
  updated_at: string;
}

export const mapTx = (r: TxRow): Transaction => ({
  id: r.id,
  type: r.type as TransactionType,
  amount: r.amount,
  currency: r.currency,
  accountId: r.account_id,
  toAccountId: r.to_account_id,
  toAmount: r.to_amount,
  categoryId: r.category_id,
  date: r.date,
  time: r.time,
  description: r.description,
  notes: r.notes,
  paymentMethod: r.payment_method as PaymentMethod | null,
  recurringRuleId: r.recurring_rule_id,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export interface TxFilter {
  search?: string;
  types?: TransactionType[];
  accountId?: string;
  categoryId?: string;
  from?: DayKey;
  to?: DayKey;
  limit?: number;
  offset?: number;
  order?: 'desc' | 'asc';
}

function buildWhere(f: TxFilter): { sql: string; params: SqlValue[] } {
  const where: string[] = [];
  const params: SqlValue[] = [];
  if (f.search?.trim()) {
    const like = `%${f.search.trim().replace(/[%_\\]/g, (c) => `\\${c}`)}%`;
    where.push("(description LIKE ? ESCAPE '\\' OR notes LIKE ? ESCAPE '\\')");
    params.push(like, like);
  }
  if (f.types?.length) {
    where.push(`type IN (${f.types.map(() => '?').join(', ')})`);
    params.push(...f.types);
  }
  if (f.accountId) {
    where.push('(account_id = ? OR to_account_id = ?)');
    params.push(f.accountId, f.accountId);
  }
  if (f.categoryId) {
    where.push('category_id = ?');
    params.push(f.categoryId);
  }
  if (f.from) {
    where.push('date >= ?');
    params.push(f.from);
  }
  if (f.to) {
    where.push('date <= ?');
    params.push(f.to);
  }
  return { sql: where.length ? `WHERE ${where.join(' AND ')}` : '', params };
}

const nowIso = () => new Date().toISOString();

export function createTransactionsRepository(db: SqlDatabase) {
  async function accountMap(): Promise<Map<string, Pick<Account, 'id' | 'currency' | 'archived'>>> {
    const rows = await db.getAllAsync<{ id: string; currency: string; archived: number }>('SELECT id, currency, archived FROM accounts', []);
    return new Map(rows.map((r) => [r.id, { id: r.id, currency: r.currency, archived: r.archived === 1 }]));
  }

  /** Normalises fields that depend on the type, and derives the currency from the account. */
  function normalize(input: TransactionInput, accounts: Map<string, Pick<Account, 'id' | 'currency' | 'archived'>>) {
    const from = accounts.get(input.accountId);
    const isTransfer = input.type === 'transfer';
    const to = isTransfer && input.toAccountId ? accounts.get(input.toAccountId) : undefined;
    const sameCurrency = !!to && to.currency === from?.currency;
    return {
      ...input,
      currency: from?.currency ?? '',
      toAccountId: isTransfer ? input.toAccountId : null,
      toAmount: isTransfer ? (sameCurrency ? input.amount : input.toAmount) : null,
      categoryId: isTransfer || input.type === 'adjustment' ? null : input.categoryId,
      description: input.description.trim().slice(0, 200),
      notes: input.notes.trim().slice(0, 1000),
      time: input.time || null,
    };
  }

  const repo = {
    async create(input: TransactionInput): Promise<Transaction> {
      const accounts = await accountMap();
      const error = validateTransaction(input, accounts);
      if (error) throw new ValidationError(error);
      const t = normalize(input, accounts);
      const id = newId('tx');
      const ts = nowIso();
      await db.runAsync(
        `INSERT INTO transactions (id, type, amount, currency, account_id, to_account_id, to_amount, category_id, date, time, description, notes, payment_method, recurring_rule_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, t.type, t.amount, t.currency, t.accountId, t.toAccountId, t.toAmount, t.categoryId, t.date, t.time, t.description, t.notes, t.paymentMethod, input.recurringRuleId ?? null, ts, ts],
      );
      return (await repo.get(id))!;
    },
    async update(id: string, input: TransactionInput): Promise<Transaction> {
      const existing = await repo.get(id);
      if (!existing) throw new ValidationError('not_found');
      const accounts = await accountMap();
      const error = validateTransaction(input, accounts);
      if (error) throw new ValidationError(error);
      const t = normalize(input, accounts);
      await db.runAsync(
        `UPDATE transactions SET type = ?, amount = ?, currency = ?, account_id = ?, to_account_id = ?, to_amount = ?, category_id = ?, date = ?, time = ?,
           description = ?, notes = ?, payment_method = ?, updated_at = ? WHERE id = ?`,
        [t.type, t.amount, t.currency, t.accountId, t.toAccountId, t.toAmount, t.categoryId, t.date, t.time, t.description, t.notes, t.paymentMethod, nowIso(), id],
      );
      return (await repo.get(id))!;
    },
    /** Deleting a generated transaction keeps its ledger entry, so it is never re-generated. */
    async remove(id: string): Promise<void> {
      await db.withTransactionAsync(async () => {
        await db.runAsync('UPDATE recurring_occurrences SET transaction_id = NULL WHERE transaction_id = ?', [id]);
        await db.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
      });
    },
    /** Copy dated `date` (default: same date). The copy is a manual transaction (not linked to a rule). */
    async duplicate(id: string, date?: DayKey): Promise<Transaction> {
      const t = await repo.get(id);
      if (!t) throw new ValidationError('not_found');
      return repo.create({ ...t, date: date ?? t.date, recurringRuleId: null });
    },
    async get(id: string): Promise<Transaction | null> {
      const r = await db.getFirstAsync<TxRow>('SELECT * FROM transactions WHERE id = ?', [id]);
      return r ? mapTx(r) : null;
    },
    async list(f: TxFilter = {}): Promise<Transaction[]> {
      const w = buildWhere(f);
      const dir = f.order === 'asc' ? 'ASC' : 'DESC';
      const rows = await db.getAllAsync<TxRow>(
        `SELECT * FROM transactions ${w.sql} ORDER BY date ${dir}, COALESCE(time, '') ${dir}, created_at ${dir} LIMIT ? OFFSET ?`,
        [...w.params, f.limit ?? 10_000, f.offset ?? 0],
      );
      return rows.map(mapTx);
    },
    async count(f: TxFilter = {}): Promise<number> {
      const w = buildWhere(f);
      return (await db.getFirstAsync<{ n: number }>(`SELECT COUNT(*) AS n FROM transactions ${w.sql}`, w.params))?.n ?? 0;
    },
    async earliestDate(): Promise<DayKey | null> {
      return (await db.getFirstAsync<{ d: string | null }>('SELECT MIN(date) AS d FROM transactions', []))?.d ?? null;
    },
    /** Raw insert used by import/recurring generation inside an outer DB transaction (already validated). */
    async insertRaw(t: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
      const id = newId('tx');
      const ts = nowIso();
      await db.runAsync(
        `INSERT INTO transactions (id, type, amount, currency, account_id, to_account_id, to_amount, category_id, date, time, description, notes, payment_method, recurring_rule_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, t.type, t.amount, t.currency, t.accountId, t.toAccountId, t.toAmount, t.categoryId, t.date, t.time, t.description, t.notes, t.paymentMethod, t.recurringRuleId, ts, ts],
      );
      return id;
    },
  };
  return repo;
}
