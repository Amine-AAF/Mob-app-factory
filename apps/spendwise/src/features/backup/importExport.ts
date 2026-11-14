import { ACCOUNT_ICONS, FALLBACK_CATEGORY, PALETTE } from '@/constants';
import type { Repositories } from '@/database';
import type { Category } from '@/types';
import type { DateRange } from '@/utils/dates';
import { newId } from '@/utils/id';

import { fingerprint, previewImport, transactionsToCsv, type ImportContext, type ImportPreview } from './transactionsCsv';

/** Resolves a category to its display name (custom name, else translated system name). */
export type CategoryNamer = (c: Category) => string;

export async function exportTransactionsCsv(r: Repositories, nameOf: CategoryNamer, range?: DateRange): Promise<{ csv: string; count: number }> {
  const [txs, accounts, categories] = await Promise.all([
    r.transactions.list({ from: range?.start, to: range?.end, order: 'asc' }),
    r.accounts.list({ includeArchived: true }),
    r.categories.list({ includeArchived: true }),
  ]);
  const acc = new Map(accounts.map((a) => [a.id, a]));
  const cat = new Map(categories.map((c) => [c.id, nameOf(c)]));
  const csv = transactionsToCsv(
    txs.map((t) => ({
      date: t.date,
      type: t.type,
      amount: t.amount,
      currency: t.currency,
      account: acc.get(t.accountId)?.name ?? '',
      category: t.categoryId ? (cat.get(t.categoryId) ?? '') : '',
      toAccount: t.toAccountId ? (acc.get(t.toAccountId)?.name ?? '') : '',
      toAmount: t.toAmount,
      toCurrency: t.toAccountId ? (acc.get(t.toAccountId)?.currency ?? null) : null,
      description: t.description,
      notes: t.notes,
      paymentMethod: t.paymentMethod ?? '',
      time: t.time ?? '',
    })),
  );
  return { csv, count: txs.length };
}

export async function buildImportContext(r: Repositories, nameOf: CategoryNamer): Promise<ImportContext> {
  const [accounts, categories, txs] = await Promise.all([r.accounts.list({ includeArchived: true }), r.categories.list({ includeArchived: true }), r.transactions.list({})]);
  const accName = new Map(accounts.map((a) => [a.id, a.name]));
  const catMap = new Map<string, { id: string; kind: 'expense' | 'income' }>();
  for (const c of categories) {
    catMap.set(nameOf(c).trim().toLowerCase(), { id: c.id, kind: c.kind });
    if (c.systemKey) catMap.set(c.systemKey, { id: c.id, kind: c.kind });
  }
  return {
    accounts: new Map(accounts.map((a) => [a.name.trim().toLowerCase(), { id: a.id, currency: a.currency }])),
    categories: catMap,
    fallbackCategory: FALLBACK_CATEGORY,
    existing: new Set(txs.map((t) => fingerprint({ date: t.date, type: t.type, amount: t.amount, currency: t.currency, accountKey: accName.get(t.accountId) ?? '', description: t.description }))),
  };
}

export async function prepareImport(r: Repositories, text: string, nameOf: CategoryNamer): Promise<ImportPreview> {
  return previewImport(text, await buildImportContext(r, nameOf));
}

/**
 * Writes a validated preview in ONE database transaction: either every row is imported or none.
 * Duplicates are skipped unless `includeDuplicates`. Missing accounts are created first.
 */
export async function commitImport(r: Repositories, preview: ImportPreview, opts: { includeDuplicates: boolean }): Promise<{ imported: number; accountsCreated: number }> {
  let imported = 0;
  const db = r.db;
  await db.withTransactionAsync(async () => {
    const ids = new Map<string, string>();
    for (const a of await r.accounts.list({ includeArchived: true })) ids.set(a.name.trim().toLowerCase(), a.id);
    let order = 1000;
    for (const a of preview.newAccounts) {
      const key = a.name.trim().toLowerCase();
      if (ids.has(key)) continue;
      const id = newId('acc');
      await db.runAsync('INSERT INTO accounts (id, name, type, currency, initial_balance, color, icon, archived, sort_order, created_at) VALUES (?, ?, ?, ?, 0, ?, ?, 0, ?, ?)', [
        id,
        a.name.trim().slice(0, 60),
        'custom',
        a.currency,
        PALETTE[order % PALETTE.length]!,
        ACCOUNT_ICONS.custom,
        order++,
        new Date().toISOString(),
      ]);
      ids.set(key, id);
    }
    for (const row of preview.rows) {
      if (row.duplicate && !opts.includeDuplicates) continue;
      const accountId = row.accountId ?? ids.get(row.accountName.trim().toLowerCase());
      const toAccountId = row.toAccountName ? (row.toAccountId ?? ids.get(row.toAccountName.trim().toLowerCase()) ?? null) : null;
      if (!accountId || (row.type === 'transfer' && !toAccountId)) throw new Error('import_account_missing');
      await r.transactions.insertRaw({
        type: row.type,
        amount: row.amount,
        currency: row.currency,
        accountId,
        toAccountId,
        toAmount: row.type === 'transfer' ? row.toAmount : null,
        categoryId: row.categoryId,
        date: row.date,
        time: row.time,
        description: row.description,
        notes: row.notes,
        paymentMethod: row.paymentMethod,
        recurringRuleId: null,
      });
      imported++;
    }
  });
  return { imported, accountsCreated: preview.newAccounts.length };
}
