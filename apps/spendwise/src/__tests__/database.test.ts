import { BackupError } from '@factory/storage';
import { createTestDatabase } from '@factory/testing';

import { DEFAULT_CATEGORIES, systemCategoryId } from '@/constants';
import { initDatabase, type Repositories } from '@/database';
import { SCHEMA_VERSION } from '@/database/migrations';
import { computeBalances } from '@/features/accounts/balances';
import { deleteAllData, exportBackup, readBackup, restoreBackup } from '@/features/backup/backup';
import { CsvError } from '@/features/backup/csv';
import { commitImport, exportTransactionsCsv, prepareImport } from '@/features/backup/importExport';
import { evaluateBudget } from '@/features/budgets/budgets';
import { summarize } from '@/features/reports/stats';
import type { TransactionInput } from '@/types';

const FOOD = systemCategoryId('food');
const SALARY = systemCategoryId('salary');
const nameOf = (c: { systemKey: string | null; name: string | null }) => c.name ?? c.systemKey ?? '';

async function setup() {
  const db = await createTestDatabase();
  const r = await initDatabase(db);
  const checking = await r.accounts.create({ name: 'Checking', type: 'bank', currency: 'USD', initialBalance: 1000_00, color: '#000000', icon: 'card' });
  const savings = await r.accounts.create({ name: 'Savings', type: 'savings', currency: 'USD', initialBalance: 0, color: '#000000', icon: 'card' });
  return { db, r, checking, savings };
}

const base = (accountId: string, p: Partial<TransactionInput> = {}): TransactionInput => ({
  type: 'expense',
  amount: 10_00,
  accountId,
  toAccountId: null,
  toAmount: null,
  categoryId: FOOD,
  date: '2026-11-10',
  time: null,
  description: '',
  notes: '',
  paymentMethod: null,
  ...p,
});

async function allTx(r: Repositories) {
  return r.transactions.list({});
}

describe('schema & seeding', () => {
  it('migrates to the current version and seeds categories idempotently', async () => {
    const db = await createTestDatabase();
    await initDatabase(db);
    const r = await initDatabase(db);
    const v = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version', []);
    expect(v?.user_version).toBe(SCHEMA_VERSION);
    expect(await r.categories.list({})).toHaveLength(DEFAULT_CATEGORIES.length);
  });
});

describe('transactions', () => {
  it('creates, edits, duplicates and deletes with exact balances', async () => {
    const { r, checking } = await setup();
    const t = await r.transactions.create(base(checking.id, { amount: 12_34, description: 'Groceries' }));
    expect(t.currency).toBe('USD');
    await r.transactions.update(t.id, base(checking.id, { amount: 20_00, description: 'Groceries' }));
    const copy = await r.transactions.duplicate(t.id, '2026-11-11');
    expect(copy.id).not.toBe(t.id);
    expect((await r.accounts.balances())[checking.id]).toBe(1000_00 - 40_00);
    await r.transactions.remove(copy.id);
    expect((await r.accounts.balances())[checking.id]).toBe(1000_00 - 20_00);
  });

  it('rejects zero, negative and malformed amounts but accepts very large ones', async () => {
    const { r, checking } = await setup();
    await expect(r.transactions.create(base(checking.id, { amount: 0 }))).rejects.toMatchObject({ code: 'amount' });
    await expect(r.transactions.create(base(checking.id, { amount: -5 }))).rejects.toMatchObject({ code: 'amount' });
    await expect(r.transactions.create(base(checking.id, { amount: 1.5 }))).rejects.toMatchObject({ code: 'amount' });
    await expect(r.transactions.create(base(checking.id, { categoryId: null }))).rejects.toMatchObject({ code: 'category' });
    await r.transactions.create(base(checking.id, { type: 'income', categoryId: SALARY, amount: 9_999_999_999_999 }));
    expect((await r.accounts.balances())[checking.id]).toBe(1000_00 + 9_999_999_999_999);
  });

  it('transfers move money but are not income nor spending', async () => {
    const { r, checking, savings } = await setup();
    await r.transactions.create(base(checking.id, { type: 'transfer', toAccountId: savings.id, amount: 300_00, categoryId: FOOD }));
    const b = await r.accounts.balances();
    expect(b[checking.id]).toBe(700_00);
    expect(b[savings.id]).toBe(300_00);
    const txs = await allTx(r);
    expect(txs[0]?.categoryId).toBeNull(); // categories are dropped from transfers
    expect(summarize(txs, 'USD')).toMatchObject({ income: 0, spending: 0 });
    await expect(r.transactions.create(base(checking.id, { type: 'transfer', toAccountId: checking.id }))).rejects.toMatchObject({ code: 'same_account' });
  });

  it('requires a destination amount for cross-currency transfers', async () => {
    const { r, checking } = await setup();
    const eur = await r.accounts.create({ name: 'Euro', type: 'bank', currency: 'EUR', initialBalance: 0, color: '#000000', icon: 'card' });
    await expect(r.transactions.create(base(checking.id, { type: 'transfer', toAccountId: eur.id, amount: 100_00 }))).rejects.toMatchObject({ code: 'to_amount' });
    await r.transactions.create(base(checking.id, { type: 'transfer', toAccountId: eur.id, amount: 100_00, toAmount: 92_50 }));
    expect((await r.accounts.balances())[eur.id]).toBe(92_50);
  });

  it('SQL balances match the reference implementation', async () => {
    const { r, checking, savings } = await setup();
    await r.transactions.create(base(checking.id, { type: 'income', categoryId: SALARY, amount: 2500_00 }));
    await r.transactions.create(base(checking.id, { amount: 33_33 }));
    await r.transactions.create(base(checking.id, { type: 'refund', amount: 3_33 }));
    await r.transactions.create(base(savings.id, { type: 'adjustment', amount: -1_01, categoryId: null }));
    await r.transactions.create(base(checking.id, { type: 'transfer', toAccountId: savings.id, amount: 500_00 }));
    const accounts = await r.accounts.list();
    expect(await r.accounts.balances()).toEqual(computeBalances(accounts, await allTx(r)));
  });

  it('searches, filters and sorts by date', async () => {
    const { r, checking } = await setup();
    await r.transactions.create(base(checking.id, { description: 'Coffee 100%', date: '2026-11-01' }));
    await r.transactions.create(base(checking.id, { description: 'Lunch', date: '2026-11-05' }));
    await r.transactions.create(base(checking.id, { type: 'income', categoryId: SALARY, description: 'Pay', date: '2026-10-30' }));
    expect((await r.transactions.list({ search: '100%' })).map((t) => t.description)).toEqual(['Coffee 100%']);
    expect((await r.transactions.list({ types: ['income'] })).map((t) => t.description)).toEqual(['Pay']);
    expect((await r.transactions.list({ from: '2026-11-01', to: '2026-11-30' })).map((t) => t.description)).toEqual(['Lunch', 'Coffee 100%']);
  });
});

describe('accounts with history', () => {
  it('cannot be hard-deleted nor change currency, can be archived', async () => {
    const { r, checking, savings } = await setup();
    await r.transactions.create(base(checking.id));
    expect(await r.accounts.remove(checking.id)).toBe('has_history');
    await expect(r.accounts.update(checking.id, { ...checking, currency: 'EUR' })).rejects.toMatchObject({ code: 'currency_locked' });
    await r.accounts.setArchived(checking.id, true);
    expect((await r.accounts.list()).map((a) => a.id)).toEqual([savings.id]);
    expect(await allTx(r)).toHaveLength(1); // history kept
    expect(await r.accounts.remove(savings.id)).toBe('deleted');
  });
});

describe('categories', () => {
  it('custom categories are editable, archivable, deletable only when unused', async () => {
    const { r, checking } = await setup();
    const id = await r.categories.create({ kind: 'expense', name: 'Pets', icon: 'paw-outline', color: '#123456' });
    await r.categories.update(id, { name: 'Pets & vet', icon: 'paw-outline', color: '#654321' });
    await r.transactions.create(base(checking.id, { categoryId: id }));
    expect(await r.categories.remove(id)).toBe('in_use');
    expect(await r.categories.remove(FOOD)).toBe('system');
    await r.categories.setArchived(id, true);
    expect((await r.categories.list({ kind: 'expense' })).some((c) => c.id === id)).toBe(false);
    expect((await r.categories.list({ kind: 'expense', includeArchived: true })).find((c) => c.id === id)?.name).toBe('Pets & vet');
  });
});

describe('budgets', () => {
  it('saves, evaluates, copies from the previous month and keeps history', async () => {
    const { r, checking } = await setup();
    await r.budgets.save('2026-10', { currency: 'USD', totalLimit: 2000_00, limits: [{ categoryId: FOOD, limit: 300_00 }] });
    const copied = await r.budgets.copyFromPrevious('2026-11');
    expect(copied?.month).toBe('2026-11');
    await r.budgets.save('2026-11', { currency: 'USD', totalLimit: 2500_00, limits: [{ categoryId: FOOD, limit: 400_00 }] });
    expect((await r.budgets.getByMonth('2026-10'))?.limits[0]?.limit).toBe(300_00); // previous month untouched
    expect(await r.budgets.copyFromPrevious('2026-11')).toBeNull(); // never overwrites
    await r.transactions.create(base(checking.id, { amount: 380_00, date: '2026-11-03' }));
    await r.transactions.create(base(checking.id, { amount: 99_00, date: '2026-10-31' })); // other month
    const month = await r.budgets.getByMonth('2026-11');
    const s = summarize(await r.transactions.list({ from: '2026-11-01', to: '2026-11-30' }), 'USD');
    const e = evaluateBudget(month!.budget, month!.limits, s.spendingByCategory, s.spending, [75, 90, 100]);
    expect(e.categories[0]).toMatchObject({ spent: 380_00, remaining: 20_00, percent: 95, reached: 90 });
    expect(await r.budgets.markAlert(month!.budget.id, FOOD, 90)).toBe(true);
    expect(await r.budgets.markAlert(month!.budget.id, FOOD, 90)).toBe(false);
    expect(await r.budgets.months()).toEqual(['2026-11', '2026-10']);
  });
});

describe('recurring transactions', () => {
  const rule = (accountId: string) => ({
    type: 'expense' as const,
    amount: 1200_00,
    accountId,
    toAccountId: null,
    categoryId: systemCategoryId('housing'),
    description: 'Rent',
    frequency: 'monthly' as const,
    interval: 1,
    startDate: '2026-08-31',
    endDate: null,
    autoPost: true,
    active: true,
  });

  it('generates due occurrences once, never future ones, idempotently', async () => {
    const { r, checking } = await setup();
    await r.recurring.create(rule(checking.id));
    expect(await r.recurring.runAutoPost('2026-11-13')).toBe(3); // Aug 31, Sep 30, Oct 31
    expect(await r.recurring.runAutoPost('2026-11-13')).toBe(0);
    await Promise.all([r.recurring.runAutoPost('2026-11-30'), r.recurring.runAutoPost('2026-11-30')]);
    const dates = (await allTx(r)).map((t) => t.date).sort();
    expect(dates).toEqual(['2026-08-31', '2026-09-30', '2026-10-31', '2026-11-30']);
    expect((await r.recurring.upcoming('2026-11-30', 40)).map((o) => o.date)).toEqual(['2026-12-31']);
  });

  it('does not re-create an occurrence the user deleted', async () => {
    const { r, checking } = await setup();
    await r.recurring.create({ ...rule(checking.id), startDate: '2026-11-01' });
    await r.recurring.runAutoPost('2026-11-13');
    const [t] = await allTx(r);
    await r.transactions.remove(t!.id);
    expect(await r.recurring.runAutoPost('2026-11-13')).toBe(0);
    expect(await allTx(r)).toHaveLength(0);
  });

  it('manual rules wait for confirmation; skip and confirm are idempotent', async () => {
    const { r, checking } = await setup();
    const created = await r.recurring.create({ ...rule(checking.id), startDate: '2026-10-15', autoPost: false });
    expect(await r.recurring.runAutoPost('2026-11-20')).toBe(0);
    expect((await r.recurring.due('2026-11-20')).map((d) => d.date)).toEqual(['2026-10-15', '2026-11-15']);
    await r.recurring.skip(created.id, '2026-10-15');
    expect(await r.recurring.confirm(created.id, '2026-11-15')).toBe(true);
    expect(await r.recurring.confirm(created.id, '2026-11-15')).toBe(false);
    expect(await r.recurring.due('2026-11-20')).toEqual([]);
    expect(await allTx(r)).toHaveLength(1);
  });

  it('a transaction marked "repeat" becomes the first occurrence (no duplicate on that date)', async () => {
    const { r, checking } = await setup();
    const tx = await r.transactions.create(base(checking.id, { amount: 1200_00, date: '2026-11-01' }));
    const created = await r.recurring.create({ ...rule(checking.id), startDate: '2026-11-01' });
    await r.recurring.attachExisting(created.id, '2026-11-01', tx.id);
    expect(await r.recurring.runAutoPost('2026-12-05')).toBe(1); // only Dec 1
    expect((await allTx(r)).map((t) => [t.date, t.recurringRuleId])).toEqual([
      ['2026-12-01', created.id],
      ['2026-11-01', created.id],
    ]);
  });

  it('inactive and ended rules generate nothing; deleting a rule keeps its history', async () => {
    const { r, checking } = await setup();
    const a = await r.recurring.create({ ...rule(checking.id), startDate: '2026-11-01', active: false });
    await r.recurring.create({ ...rule(checking.id), startDate: '2026-01-01', endDate: '2026-02-15' });
    expect(await r.recurring.runAutoPost('2026-11-13')).toBe(2);
    await r.recurring.setActive(a.id, true);
    expect(await r.recurring.runAutoPost('2026-11-13')).toBe(1);
    await r.recurring.remove(a.id);
    expect(await allTx(r)).toHaveLength(3);
  });
});

describe('subscriptions and savings goals', () => {
  it('stores subscriptions without creating transactions', async () => {
    const { r } = await setup();
    const id = await r.subscriptions.create({ name: 'Music', kind: 'streaming', price: 9_99, currency: 'USD', frequency: 'monthly', interval: 1, startDate: '2026-01-05', endDate: null, categoryId: null, reminderDays: 2, active: true, notes: '' });
    await r.subscriptions.setActive(id, false);
    expect((await r.subscriptions.get(id))?.active).toBe(false);
    expect(await allTx(r)).toHaveLength(0);
  });

  it('tracks contributions and withdrawals without affecting spending', async () => {
    const { r } = await setup();
    const id = await r.goals.create({ name: 'Emergency', target: 5000_00, currency: 'USD', targetDate: null, description: '', color: '#000000', icon: 'shield' }, 1000_00, '2026-11-01');
    await r.goals.addContribution(id, 250_00, '2026-11-05');
    await r.goals.addContribution(id, -100_00, '2026-11-06', 'repair');
    await expect(r.goals.addContribution(id, -5000_00, '2026-11-07')).rejects.toMatchObject({ code: 'withdraw_too_much' });
    expect((await r.goals.list())[0]?.saved).toBe(1150_00);
    const history = await r.goals.contributions(id);
    expect(history).toHaveLength(3);
    const initial = history.find((c) => c.note === 'initial')!;
    await r.goals.addContribution(id, -1100_00, '2026-11-08');
    await expect(r.goals.removeContribution(initial.id)).rejects.toMatchObject({ code: 'withdraw_too_much' });
    expect(await allTx(r)).toHaveLength(0);
  });
});

describe('CSV export / import', () => {
  it('round-trips transactions and skips duplicates', async () => {
    const { r, checking, savings } = await setup();
    await r.transactions.create(base(checking.id, { amount: 12_50, description: '=HYPERLINK("x")', notes: 'a, "quoted"\nline' }));
    await r.transactions.create(base(checking.id, { type: 'transfer', toAccountId: savings.id, amount: 50_00 }));
    const { csv, count } = await exportTransactionsCsv(r, nameOf);
    expect(count).toBe(2);
    expect(csv).toContain("'=HYPERLINK"); // formula injection neutralised
    const preview = await prepareImport(r, csv, nameOf);
    expect(preview.errors).toEqual([]);
    expect(preview.duplicates).toBe(2);
    expect(await commitImport(r, preview, { includeDuplicates: false })).toMatchObject({ imported: 0 });
    expect(await allTx(r)).toHaveLength(2);
  });

  it('imports into a fresh database, creating missing accounts', async () => {
    const r = await initDatabase(await createTestDatabase());
    const csv = 'date;type;amount;currency;account;category;to_account;description\n2026-11-01;income;2500.00;EUR;Bank;salary;;Pay\n2026-11-02;expense;12,30;EUR;Bank;Unknown;;Bread\n2026-11-03;transfer;100;EUR;Bank;;Cash box;\n';
    const preview = await prepareImport(r, csv, nameOf);
    expect(preview.errors).toEqual([]);
    expect(preview.newAccounts.map((a) => a.name)).toEqual(['Bank', 'Cash box']);
    expect(preview.fallbackCategories).toBe(1);
    await commitImport(r, preview, { includeDuplicates: false });
    const accounts = await r.accounts.list();
    const b = await r.accounts.balances();
    expect(accounts.map((a) => [a.name, b[a.id]])).toEqual([
      ['Bank', 2500_00 - 12_30 - 100_00],
      ['Cash box', 100_00],
    ]);
  });

  it('reports row errors for malformed files and rejects unusable ones', async () => {
    const r = await initDatabase(await createTestDatabase());
    const csv = 'date,type,amount,currency,account\n2026-13-01,expense,1,USD,A\n2026-11-01,gift,1,USD,A\n2026-11-01,expense,abc,USD,A\n2026-11-01,expense,1,XXX,A\n2026-11-01,expense,1,USD,\n2026-11-01,expense,1,USD,A\n';
    const p = await prepareImport(r, csv, nameOf);
    expect(p.errors.map((e) => e.code)).toEqual(['date', 'type', 'amount', 'currency', 'account']);
    expect(p.rows).toHaveLength(1);
    await expect(prepareImport(r, 'foo,bar\n1,2', nameOf)).rejects.toBeInstanceOf(CsvError);
    await expect(prepareImport(r, '', nameOf)).rejects.toBeInstanceOf(CsvError);
    await expect(prepareImport(r, 'date,type,amount,currency,account\n"unterminated', nameOf)).rejects.toBeInstanceOf(CsvError);
  });
});

describe('backup & restore', () => {
  it('restores a full backup atomically despite foreign keys', async () => {
    const { db, r, checking, savings } = await setup();
    await r.transactions.create(base(checking.id, { type: 'transfer', toAccountId: savings.id, amount: 10_00 }));
    await r.budgets.save('2026-11', { currency: 'USD', totalLimit: null, limits: [{ categoryId: FOOD, limit: 100_00 }] });
    await r.recurring.create({ type: 'expense', amount: 1_00, accountId: checking.id, toAccountId: null, categoryId: FOOD, description: '', frequency: 'daily', interval: 1, startDate: '2026-11-12', endDate: null, autoPost: true, active: true });
    await r.recurring.runAutoPost('2026-11-13');
    await r.settings.set('mainCurrency', 'USD');
    const { json } = await exportBackup(db);
    const before = await r.accounts.balances();

    await r.transactions.create(base(checking.id, { amount: 999_00 }));
    const { backup, summary } = readBackup(json);
    expect(summary.counts.transactions).toBe(3);
    await restoreBackup(db, backup);
    expect(await r.accounts.balances()).toEqual(before);
    expect((await r.settings.getAll()).mainCurrency).toBe('USD');
    expect(await r.recurring.runAutoPost('2026-11-13')).toBe(0); // ledger restored too
  });

  it('restores an older backup with missing columns and rejects invalid ones', async () => {
    const { db } = await setup();
    const old = JSON.stringify({
      format: 'factory-backup',
      formatVersion: 1,
      appId: 'spendwise',
      schemaVersion: 0,
      createdAt: '2026-01-01T00:00:00.000Z',
      tables: { accounts: [{ id: 'acc_old', name: 'Old', type: 'cash', currency: 'USD', created_at: '2026-01-01', legacy_field: 1 }] },
    });
    const { backup } = readBackup(old);
    await restoreBackup(db, backup);
    const r = await initDatabase(db);
    expect((await r.accounts.list()).map((a) => [a.name, a.initialBalance])).toEqual([['Old', 0]]);

    expect(() => readBackup('not json')).toThrow(BackupError);
    expect(() => readBackup(JSON.stringify({ format: 'factory-backup', formatVersion: 1, appId: 'devspeak', schemaVersion: 1, tables: {} }))).toThrow(BackupError);
    expect(() => readBackup(JSON.stringify({ format: 'factory-backup', formatVersion: 1, appId: 'spendwise', schemaVersion: 99, tables: {} }))).toThrow(BackupError);
    expect(() => readBackup(JSON.stringify({ format: 'factory-backup', formatVersion: 1, appId: 'spendwise', schemaVersion: 1, tables: { transactions: [{ amount: 1.5 }] } }))).toThrow(BackupError);
  });

  it('rolls back a restore that would break referential integrity', async () => {
    const { db, r, checking } = await setup();
    await r.transactions.create(base(checking.id));
    const bad = { format: 'factory-backup' as const, formatVersion: 1 as const, appId: 'spendwise', schemaVersion: 1, createdAt: '', tables: { transactions: [{ id: 't1', type: 'expense', amount: 100, currency: 'USD', account_id: 'missing', date: '2026-11-01', created_at: '', updated_at: '' }] } };
    await expect(restoreBackup(db, bad)).rejects.toBeInstanceOf(BackupError);
    expect(await allTx(r)).toHaveLength(1);
  });

  it('deletes all data on request', async () => {
    const { db, r, checking } = await setup();
    await r.transactions.create(base(checking.id));
    await deleteAllData(db);
    expect(await r.accounts.list()).toEqual([]);
    expect(await allTx(r)).toEqual([]);
  });
});
