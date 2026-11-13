import { fromJson, toJson, type SqlDatabase } from '@factory/storage';

import { DEFAULT_CATEGORIES, systemCategoryId } from '@/constants';
import { ValidationError } from '@/features/transactions/validation';
import type { Account, AccountType, Category, CategoryKind, ExchangeRate } from '@/types';
import { newId } from '@/utils/id';
import { isSupportedCurrency, parseDecimal } from '@/utils/money';

const now = () => new Date().toISOString();

/* ------------------------------------------------------------------ Settings */

export interface AppSettings {
  mainCurrency: string | null;
  alertThresholds: number[];
  budgetNotifications: boolean;
  subscriptionReminders: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  mainCurrency: null,
  alertThresholds: [75, 90, 100],
  budgetNotifications: false,
  subscriptionReminders: false,
};

export function createSettingsRepository(db: SqlDatabase) {
  return {
    async getAll(): Promise<AppSettings> {
      const rows = await db.getAllAsync<{ key: string; value: string }>('SELECT key, value FROM user_settings', []);
      const out: AppSettings = { ...DEFAULT_SETTINGS };
      for (const r of rows) {
        if (r.key in out) (out as unknown as Record<string, unknown>)[r.key] = fromJson(r.value, (DEFAULT_SETTINGS as unknown as Record<string, unknown>)[r.key]);
      }
      return out;
    },
    async set<K extends keyof AppSettings>(key: K, value: AppSettings[K]): Promise<void> {
      if (key === 'mainCurrency' && value !== null && !isSupportedCurrency(String(value))) throw new ValidationError('currency');
      await db.runAsync('INSERT INTO user_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', [key, toJson(value)]);
    },
  };
}

/* ------------------------------------------------------------------ Accounts */

interface AccountRow {
  id: string;
  name: string;
  type: string;
  currency: string;
  initial_balance: number;
  color: string;
  icon: string;
  archived: number;
  sort_order: number;
  created_at: string;
}

const mapAccount = (r: AccountRow): Account => ({
  id: r.id,
  name: r.name,
  type: r.type as AccountType,
  currency: r.currency,
  initialBalance: r.initial_balance,
  color: r.color,
  icon: r.icon,
  archived: r.archived === 1,
  sortOrder: r.sort_order,
  createdAt: r.created_at,
});

export type AccountInput = Pick<Account, 'name' | 'type' | 'currency' | 'initialBalance' | 'color' | 'icon'>;

/**
 * Balance of each account computed in SQL from the initial balance and ALL transactions
 * (same rules as features/accounts/balances.ts, which the tests cross-check).
 */
const BALANCES_SQL = `
  SELECT a.id AS id, a.initial_balance + COALESCE((
    SELECT SUM(CASE
      WHEN t.type = 'expense' THEN -t.amount
      WHEN t.type IN ('income', 'refund', 'adjustment') THEN t.amount
      WHEN t.type = 'transfer' THEN -t.amount
      ELSE 0 END)
    FROM transactions t WHERE t.account_id = a.id), 0) + COALESCE((
    SELECT SUM(COALESCE(t.to_amount, t.amount)) FROM transactions t WHERE t.type = 'transfer' AND t.to_account_id = a.id), 0) AS balance
  FROM accounts a`;

export function createAccountsRepository(db: SqlDatabase) {
  return {
    async list(opts: { includeArchived?: boolean } = {}): Promise<Account[]> {
      const rows = await db.getAllAsync<AccountRow>(
        `SELECT * FROM accounts ${opts.includeArchived ? '' : 'WHERE archived = 0'} ORDER BY archived, sort_order, created_at`,
        [],
      );
      return rows.map(mapAccount);
    },
    async get(id: string): Promise<Account | null> {
      const r = await db.getFirstAsync<AccountRow>('SELECT * FROM accounts WHERE id = ?', [id]);
      return r ? mapAccount(r) : null;
    },
    async count(): Promise<number> {
      return (await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM accounts WHERE archived = 0', []))?.n ?? 0;
    },
    async create(input: AccountInput): Promise<Account> {
      if (!input.name.trim()) throw new ValidationError('name');
      if (!isSupportedCurrency(input.currency)) throw new ValidationError('currency');
      if (!Number.isSafeInteger(input.initialBalance)) throw new ValidationError('amount');
      const id = newId('acc');
      const order = (await db.getFirstAsync<{ n: number }>('SELECT COALESCE(MAX(sort_order), 0) + 1 AS n FROM accounts', []))?.n ?? 1;
      await db.runAsync(
        'INSERT INTO accounts (id, name, type, currency, initial_balance, color, icon, archived, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)',
        [id, input.name.trim().slice(0, 60), input.type, input.currency, input.initialBalance, input.color, input.icon, order, now()],
      );
      return (await this.get(id))!;
    },
    /** The currency of an account with transactions can't change (it would corrupt its history). */
    async update(id: string, input: AccountInput): Promise<void> {
      const current = await this.get(id);
      if (!current) throw new ValidationError('account');
      if (!input.name.trim()) throw new ValidationError('name');
      if (input.currency !== current.currency && (await this.hasHistory(id))) throw new ValidationError('currency_locked');
      await db.runAsync('UPDATE accounts SET name = ?, type = ?, currency = ?, initial_balance = ?, color = ?, icon = ? WHERE id = ?', [
        input.name.trim().slice(0, 60),
        input.type,
        input.currency,
        input.initialBalance,
        input.color,
        input.icon,
        id,
      ]);
    },
    async setArchived(id: string, archived: boolean): Promise<void> {
      await db.runAsync('UPDATE accounts SET archived = ? WHERE id = ?', [archived ? 1 : 0, id]);
    },
    async hasHistory(id: string): Promise<boolean> {
      const r = await db.getFirstAsync<{ n: number }>(
        `SELECT (SELECT COUNT(*) FROM transactions WHERE account_id = ?1 OR to_account_id = ?1)
              + (SELECT COUNT(*) FROM recurring_rules WHERE account_id = ?1 OR to_account_id = ?1) AS n`,
        [id],
      );
      return (r?.n ?? 0) > 0;
    },
    /** Hard delete is only allowed for accounts without history; otherwise archive it. */
    async remove(id: string): Promise<'deleted' | 'has_history'> {
      if (await this.hasHistory(id)) return 'has_history';
      await db.runAsync('DELETE FROM accounts WHERE id = ?', [id]);
      return 'deleted';
    },
    async balances(): Promise<Record<string, number>> {
      const rows = await db.getAllAsync<{ id: string; balance: number }>(BALANCES_SQL, []);
      return Object.fromEntries(rows.map((r) => [r.id, r.balance]));
    },
  };
}

/* ------------------------------------------------------------------ Categories */

interface CategoryRow {
  id: string;
  kind: string;
  system_key: string | null;
  name: string | null;
  icon: string;
  color: string;
  archived: number;
  sort_order: number;
}

const mapCategory = (r: CategoryRow): Category => ({
  id: r.id,
  kind: r.kind as CategoryKind,
  systemKey: r.system_key,
  name: r.name,
  icon: r.icon,
  color: r.color,
  archived: r.archived === 1,
  sortOrder: r.sort_order,
});

export type CategoryInput = Pick<Category, 'kind' | 'icon' | 'color'> & { name: string };

export function createCategoriesRepository(db: SqlDatabase) {
  return {
    /** Inserts missing built-in categories. Idempotent (stable ids + INSERT OR IGNORE). */
    async seedDefaults(): Promise<void> {
      await db.withTransactionAsync(async () => {
        let i = 0;
        for (const c of DEFAULT_CATEGORIES) {
          await db.runAsync('INSERT OR IGNORE INTO categories (id, kind, system_key, name, icon, color, archived, sort_order) VALUES (?, ?, ?, NULL, ?, ?, 0, ?)', [
            systemCategoryId(c.key),
            c.kind,
            c.key,
            c.icon,
            c.color,
            i++,
          ]);
        }
      });
    },
    async list(opts: { kind?: CategoryKind; includeArchived?: boolean } = {}): Promise<Category[]> {
      const where: string[] = [];
      const params: string[] = [];
      if (opts.kind) {
        where.push('kind = ?');
        params.push(opts.kind);
      }
      if (!opts.includeArchived) where.push('archived = 0');
      const rows = await db.getAllAsync<CategoryRow>(
        `SELECT * FROM categories ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY kind, archived, sort_order, name`,
        params,
      );
      return rows.map(mapCategory);
    },
    async customCount(): Promise<number> {
      return (await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM categories WHERE system_key IS NULL AND archived = 0', []))?.n ?? 0;
    },
    async create(input: CategoryInput): Promise<string> {
      const name = input.name.trim();
      if (!name) throw new ValidationError('name');
      const id = newId('cat');
      const order = (await db.getFirstAsync<{ n: number }>('SELECT COALESCE(MAX(sort_order), 0) + 1 AS n FROM categories', []))?.n ?? 100;
      await db.runAsync('INSERT INTO categories (id, kind, system_key, name, icon, color, archived, sort_order) VALUES (?, ?, NULL, ?, ?, ?, 0, ?)', [
        id,
        input.kind,
        name.slice(0, 40),
        input.icon,
        input.color,
        order,
      ]);
      return id;
    },
    /** The kind of a category never changes (it would silently move history between income and spending). */
    async update(id: string, input: Omit<CategoryInput, 'kind'>): Promise<void> {
      const name = input.name.trim();
      await db.runAsync('UPDATE categories SET name = ?, icon = ?, color = ? WHERE id = ?', [name ? name.slice(0, 40) : null, input.icon, input.color, id]);
    },
    async setArchived(id: string, archived: boolean): Promise<void> {
      await db.runAsync('UPDATE categories SET archived = ? WHERE id = ?', [archived ? 1 : 0, id]);
    },
    /** Only unused custom categories can be deleted; used ones are archived instead. */
    async remove(id: string): Promise<'deleted' | 'in_use' | 'system'> {
      const c = await db.getFirstAsync<CategoryRow>('SELECT * FROM categories WHERE id = ?', [id]);
      if (!c) return 'deleted';
      if (c.system_key) return 'system';
      const used = await db.getFirstAsync<{ n: number }>(
        `SELECT (SELECT COUNT(*) FROM transactions WHERE category_id = ?1) + (SELECT COUNT(*) FROM budget_categories WHERE category_id = ?1)
              + (SELECT COUNT(*) FROM recurring_rules WHERE category_id = ?1) + (SELECT COUNT(*) FROM subscriptions WHERE category_id = ?1) AS n`,
        [id],
      );
      if ((used?.n ?? 0) > 0) return 'in_use';
      await db.runAsync('DELETE FROM categories WHERE id = ?', [id]);
      return 'deleted';
    },
  };
}

/* ------------------------------------------------------------------ Exchange rates */

export function createRatesRepository(db: SqlDatabase) {
  return {
    async list(): Promise<ExchangeRate[]> {
      const rows = await db.getAllAsync<{ currency: string; rate: string; source: string; updated_at: string }>('SELECT * FROM exchange_rates ORDER BY currency', []);
      return rows.map((r) => ({ currency: r.currency, rate: r.rate, source: 'manual', updatedAt: r.updated_at }));
    },
    async set(currency: string, rate: string): Promise<void> {
      const parsed = parseDecimal(rate);
      if (!isSupportedCurrency(currency) || !parsed || parsed.num === 0n) throw new ValidationError('rate');
      await db.runAsync(
        "INSERT INTO exchange_rates (currency, rate, source, updated_at) VALUES (?, ?, 'manual', ?) ON CONFLICT(currency) DO UPDATE SET rate = excluded.rate, updated_at = excluded.updated_at",
        [currency, rate.trim().replace(',', '.'), now()],
      );
    },
    async remove(currency: string): Promise<void> {
      await db.runAsync('DELETE FROM exchange_rates WHERE currency = ?', [currency]);
    },
  };
}
