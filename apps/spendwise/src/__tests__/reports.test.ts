import { createTestDatabase } from '@factory/testing';

import { systemCategoryId } from '@/constants';
import { initDatabase } from '@/database';
import { loadReport } from '@/features/reports/loadReport';
import type { TransactionInput } from '@/types';

const FOOD = systemCategoryId('food');
const RESTAURANTS = systemCategoryId('restaurants');
const SALARY = systemCategoryId('salary');

async function setup() {
  const r = await initDatabase(await createTestDatabase());
  const a = await r.accounts.create({ name: 'A', type: 'bank', currency: 'USD', initialBalance: 0, color: '#000000', icon: 'card' });
  const b = await r.accounts.create({ name: 'B', type: 'cash', currency: 'USD', initialBalance: 0, color: '#000000', icon: 'card' });
  const tx = (p: Partial<TransactionInput>): TransactionInput => ({
    type: 'expense',
    amount: 10_00,
    accountId: a.id,
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
  return { r, a, b, tx };
}

describe('loadReport', () => {
  it('totals match the recorded transactions and exclude transfers', async () => {
    const { r, a, b, tx } = await setup();
    await r.transactions.create(tx({ type: 'income', categoryId: SALARY, amount: 3000_00 }));
    await r.transactions.create(tx({ amount: 120_00 }));
    await r.transactions.create(tx({ amount: 30_00, categoryId: RESTAURANTS, accountId: b.id }));
    await r.transactions.create(tx({ type: 'transfer', toAccountId: b.id, amount: 500_00, accountId: a.id }));
    await r.transactions.create(tx({ amount: 999_00, date: '2026-10-05' })); // previous month
    const rep = await loadReport(r, 'month', '2026-11-13', {}, 'USD');
    expect(rep.summary).toMatchObject({ income: 3000_00, spending: 150_00, net: 2850_00 });
    expect(rep.previous.spending).toBe(999_00);
    expect(rep.spendingCategories).toEqual([
      { categoryId: FOOD, amount: 120_00 },
      { categoryId: RESTAURANTS, amount: 30_00 },
    ]);
    expect(rep.daily?.find((d) => d.day === '2026-11-10')?.amount).toBe(150_00);
    expect(rep.trend.map((m) => m.month)).toEqual(['2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11']);
    expect(rep.trend[5]).toEqual({ month: '2026-11', income: 3000_00, spending: 150_00 });
    expect(rep.savingsRate).toBeCloseTo(0.95);
  });

  it('filters by account and by category', async () => {
    const { r, b, tx } = await setup();
    await r.transactions.create(tx({ amount: 120_00 }));
    await r.transactions.create(tx({ amount: 30_00, categoryId: RESTAURANTS, accountId: b.id }));
    expect((await loadReport(r, 'month', '2026-11-13', { accountId: b.id }, 'USD')).summary.spending).toBe(30_00);
    expect((await loadReport(r, 'month', '2026-11-13', { categoryId: FOOD }, 'USD')).summary.spending).toBe(120_00);
  });

  it('uses budgets for the month view and counts recurring spending', async () => {
    const { r, a, tx } = await setup();
    await r.budgets.save('2026-11', { currency: 'USD', totalLimit: null, limits: [{ categoryId: FOOD, limit: 200_00 }] });
    await r.transactions.create(tx({ amount: 100_00 }));
    await r.recurring.create({ type: 'expense', amount: 15_00, accountId: a.id, toAccountId: null, categoryId: FOOD, description: 'Gym', frequency: 'monthly', interval: 1, startDate: '2026-11-01', endDate: null, autoPost: true, active: true });
    await r.recurring.runAutoPost('2026-11-13');
    const rep = await loadReport(r, 'month', '2026-11-13', {}, 'USD');
    expect(rep.recurringSpending).toBe(15_00);
    expect(rep.budget?.categories[0]).toMatchObject({ spent: 115_00, limit: 200_00 });
    expect((await loadReport(r, 'year', '2026-11-13', {}, 'USD')).budget).toBeNull();
  });

  it('produces no insight with too little data', async () => {
    const { r, tx } = await setup();
    await r.transactions.create(tx({}));
    const rep = await loadReport(r, 'month', '2026-11-13', {}, 'USD');
    expect(rep.insights).toEqual([]);
    const empty = await loadReport(r, 'week', '2026-01-05', {}, 'USD');
    expect(empty.summary.count).toBe(0);
    expect(empty.savingsRate).toBeNull();
  });

  it('year view returns 12 monthly points', async () => {
    const { r, tx } = await setup();
    await r.transactions.create(tx({ date: '2026-03-01' }));
    const rep = await loadReport(r, 'year', '2026-11-13', {}, 'USD');
    expect(rep.daily).toBeNull();
    expect(rep.trend).toHaveLength(12);
    expect(rep.trend[2]?.spending).toBe(10_00);
  });
});
