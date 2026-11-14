import { computeBalances, totalsByCurrency } from '@/features/accounts/balances';
import { activeAlerts, evaluateBudget, reachedThreshold } from '@/features/budgets/budgets';
import { debtRepayment, monthlyBudget, paymentForMonths, salaryBreakdown, savingsGoalPlan, splitExpense } from '@/features/calculators/calculators';
import { nextOccurrence, occurrencesBetween } from '@/features/recurring/schedule';
import { buildInsights } from '@/features/reports/insights';
import { dailySpending, monthlyTrend, savingsRate, summarize, type StatTx } from '@/features/reports/stats';
import { goalProgress } from '@/features/savings-goals/goals';
import { monthlyEstimate, upcomingBillings, yearlyEstimate } from '@/features/subscriptions/estimates';
import type { Schedule } from '@/types';

const tx = (p: Partial<StatTx> & Pick<StatTx, 'type' | 'amount'>): StatTx => ({ currency: 'USD', categoryId: 'food', date: '2026-11-10', accountId: 'a', ...p });

describe('balances', () => {
  const accounts = [
    { id: 'a', initialBalance: 100_00 },
    { id: 'b', initialBalance: 0 },
  ];
  it('applies every transaction type, transfers move money between accounts', () => {
    const b = computeBalances(accounts, [
      { type: 'income', amount: 2000_00, accountId: 'a', toAccountId: null, toAmount: null },
      { type: 'expense', amount: 50_25, accountId: 'a', toAccountId: null, toAmount: null },
      { type: 'refund', amount: 10_00, accountId: 'a', toAccountId: null, toAmount: null },
      { type: 'transfer', amount: 500_00, accountId: 'a', toAccountId: 'b', toAmount: 500_00 },
      { type: 'adjustment', amount: -75, accountId: 'b', toAccountId: null, toAmount: null },
    ]);
    expect(b).toEqual({ a: 100_00 + 2000_00 - 50_25 + 10_00 - 500_00, b: 500_00 - 75 });
  });

  it('a transfer leaves the global total unchanged', () => {
    const before = computeBalances(accounts, []);
    const after = computeBalances(accounts, [{ type: 'transfer', amount: 42_00, accountId: 'a', toAccountId: 'b', toAmount: 42_00 }]);
    const sum = (r: Record<string, number>) => Object.values(r).reduce((x, y) => x + y, 0);
    expect(sum(after)).toBe(sum(before));
  });

  it('totals per currency and skips archived accounts', () => {
    expect(
      totalsByCurrency(
        [
          { id: 'a', currency: 'USD', archived: false },
          { id: 'b', currency: 'EUR', archived: false },
          { id: 'c', currency: 'USD', archived: true },
        ],
        { a: 10, b: 20, c: 1000 },
      ),
    ).toEqual({ USD: 10, EUR: 20 });
  });
});

describe('statistics', () => {
  it('excludes transfers and adjustments from income and spending', () => {
    const s = summarize(
      [
        tx({ type: 'income', amount: 3000_00, categoryId: 'salary' }),
        tx({ type: 'expense', amount: 120_00 }),
        tx({ type: 'refund', amount: 20_00 }),
        tx({ type: 'transfer', amount: 1000_00, categoryId: null }),
        tx({ type: 'adjustment', amount: -5_00, categoryId: null }),
      ],
      'USD',
    );
    expect(s.income).toBe(3000_00);
    expect(s.spending).toBe(100_00);
    expect(s.spendingByCategory).toEqual({ food: 100_00 });
    expect(s.net).toBe(2900_00);
  });

  it('never adds other currencies without a rate, converts with a manual rate', () => {
    const list = [tx({ type: 'expense', amount: 10_00 }), tx({ type: 'expense', amount: 100_00, currency: 'MAD' })];
    expect(summarize(list, 'USD')).toMatchObject({ spending: 10_00, excludedCount: 1 });
    expect(summarize(list, 'USD', { MAD: '0.1' })).toMatchObject({ spending: 20_00, excludedCount: 0 });
  });

  it('builds daily and monthly series and savings rate', () => {
    const list = [tx({ type: 'expense', amount: 5_00, date: '2026-11-01' }), tx({ type: 'expense', amount: 7_00, date: '2026-11-03' }), tx({ type: 'income', amount: 100_00, date: '2026-10-05' })];
    const daily = dailySpending(list, { start: '2026-11-01', end: '2026-11-03' }, 'USD');
    expect(daily.map((d) => d.amount)).toEqual([5_00, 0, 7_00]);
    expect(monthlyTrend(list, ['2026-10', '2026-11'], 'USD')).toEqual([
      { month: '2026-10', income: 100_00, spending: 0 },
      { month: '2026-11', income: 0, spending: 12_00 },
    ]);
    expect(savingsRate({ income: 0, spending: 10 })).toBeNull();
    expect(savingsRate({ income: 1000, spending: 750 })).toBe(0.25);
  });

  it('only produces insights backed by enough data', () => {
    const few = summarize([tx({ type: 'expense', amount: 10_00 })], 'USD');
    expect(buildInsights(few, null)).toEqual([]);
    const prev = summarize([tx({ type: 'expense', amount: 100_00, categoryId: 'restaurants' }), tx({ type: 'expense', amount: 50_00 }), tx({ type: 'expense', amount: 50_00 })], 'USD');
    const cur = summarize([tx({ type: 'expense', amount: 88_00, categoryId: 'restaurants' }), tx({ type: 'expense', amount: 60_00 }), tx({ type: 'expense', amount: 52_00 })], 'USD');
    const insights = buildInsights(cur, prev);
    expect(insights).toContainEqual({ key: 'largestCategory', categoryId: 'food', sharePct: 56 });
    expect(insights).toContainEqual({ key: 'categoryLess', categoryId: 'restaurants', pct: 12 });
    expect(insights.find((i) => i.key === 'savingsRate')).toBeUndefined(); // no income -> no invented rate
  });
});

describe('budgets', () => {
  it('computes spent, remaining and progress (example from the spec)', () => {
    const r = evaluateBudget({ totalLimit: null }, [{ categoryId: 'food', limit: 3000_00 }], { food: 2100_00 }, 2100_00, [50, 75, 90, 100]);
    expect(r.categories[0]).toMatchObject({ limit: 3000_00, spent: 2100_00, remaining: 900_00, percent: 70, reached: 50, over: false });
    expect(r.total.limit).toBe(3000_00);
  });

  it('reaches thresholds with exact integer comparisons', () => {
    expect(reachedThreshold(7499, 10000, [50, 75, 90, 100])).toBe(50);
    expect(reachedThreshold(7500, 10000, [50, 75, 90, 100])).toBe(75);
    expect(reachedThreshold(10001, 10000, [50, 75, 90, 100])).toBe(100);
    expect(reachedThreshold(9000, 10000, [100])).toBeNull();
    expect(reachedThreshold(0, 0, [50])).toBeNull();
  });

  it('lists the most severe alerts first and handles over-budget', () => {
    const r = evaluateBudget({ totalLimit: 500_00 }, [{ categoryId: 'a', limit: 100_00 }, { categoryId: 'b', limit: 100_00 }], { a: 120_00, b: 80_00 }, 200_00, [75, 90, 100]);
    const alerts = activeAlerts([r.total, ...r.categories]);
    expect(alerts.map((a) => [a.scope, a.reached])).toEqual([
      ['a', 100],
      ['b', 75],
    ]);
    expect(r.categories[0]).toMatchObject({ scope: 'a', remaining: -20_00, over: true });
  });
});

describe('recurring schedules', () => {
  const monthly: Schedule = { frequency: 'monthly', interval: 1, startDate: '2026-01-31', endDate: null };
  it('handles end of month and leap years', () => {
    expect(occurrencesBetween(monthly, '2026-01-01', '2026-05-31')).toEqual(['2026-01-31', '2026-02-28', '2026-03-31', '2026-04-30', '2026-05-31']);
    expect(occurrencesBetween({ frequency: 'yearly', interval: 1, startDate: '2028-02-29', endDate: null }, '2028-01-01', '2030-12-31')).toEqual(['2028-02-29', '2029-02-28', '2030-02-28']);
  });

  it('respects intervals, custom days and end dates', () => {
    expect(occurrencesBetween({ frequency: 'weekly', interval: 2, startDate: '2026-11-02', endDate: '2026-12-01' }, '2026-11-01', '2026-12-31')).toEqual(['2026-11-02', '2026-11-16', '2026-11-30']);
    expect(occurrencesBetween({ frequency: 'custom', interval: 10, startDate: '2026-12-25', endDate: null }, '2026-12-01', '2027-01-15')).toEqual(['2026-12-25', '2027-01-04', '2027-01-14']);
    expect(nextOccurrence({ ...monthly, endDate: '2026-03-01' }, '2026-03-02')).toBeNull();
    expect(nextOccurrence(monthly, '2026-02-01')).toBe('2026-02-28');
  });

  it('skips ahead efficiently for old schedules', () => {
    const daily: Schedule = { frequency: 'daily', interval: 1, startDate: '2000-01-01', endDate: null };
    expect(occurrencesBetween(daily, '2026-11-12', '2026-11-13')).toEqual(['2026-11-12', '2026-11-13']);
  });
});

describe('subscriptions', () => {
  const base = { currency: 'USD', active: true, startDate: '2026-01-15', endDate: null, interval: 1 };
  it('normalises different periodicities, rounding once per currency', () => {
    const subs = [
      { ...base, price: 15_99, frequency: 'monthly' as const },
      { ...base, price: 119_88, frequency: 'yearly' as const },
      { ...base, price: 10_00, frequency: 'weekly' as const },
      { ...base, price: 5_00, frequency: 'monthly' as const, active: false },
      { ...base, price: 1000, frequency: 'monthly' as const, currency: 'JPY' },
    ];
    // 15.99 + 119.88/12 (9.99) + 10*52/12 (43.333…) = 69.3133… -> 69.31
    expect(monthlyEstimate(subs)).toEqual({ USD: 69_31, JPY: 1000 });
    expect(yearlyEstimate(subs)).toEqual({ USD: 15_99 * 12 + 119_88 + 10_00 * 52, JPY: 12000 });
  });

  it('lists upcoming billings within the window', () => {
    const list = [
      { ...base, id: 's1', price: 1, frequency: 'monthly' as const },
      { ...base, id: 's2', price: 1, frequency: 'yearly' as const, startDate: '2026-06-01' },
    ];
    expect(upcomingBillings(list, '2026-11-13', 30).map((x) => [x.sub.id, x.date])).toEqual([['s1', '2026-11-15']]);
  });
});

describe('savings goals', () => {
  it('computes progress and recommended monthly savings', () => {
    const p = goalProgress(10000_00, [{ amount: 2500_00 }, { amount: 500_00 }, { amount: -1000_00 }], '2027-05-20', '2026-11-13');
    expect(p).toMatchObject({ saved: 2000_00, remaining: 8000_00, percent: 20, monthsLeft: 6, recommendedMonthly: 1333_34, reached: false });
  });

  it('handles reached, overdue and same-month targets', () => {
    expect(goalProgress(100, [{ amount: 150 }], null, '2026-11-13')).toMatchObject({ reached: true, remaining: 0, ratio: 1 });
    expect(goalProgress(100, [], '2026-10-01', '2026-11-13')).toMatchObject({ overdue: true, recommendedMonthly: null });
    expect(goalProgress(100, [], '2026-11-30', '2026-11-13')).toMatchObject({ monthsLeft: 1, recommendedMonthly: 100 });
  });
});

describe('calculators', () => {
  it('monthly budget', () => {
    const r = monthlyBudget({ income: 3000_00, expenses: [1000_00, 250_50], savingsPct: '10' });
    expect(r).toMatchObject({ ok: true, savings: 300_00, planned: 1250_50, available: 1449_50, reference: { needs: 1500_00, wants: 900_00, savings: 600_00 } });
    expect(monthlyBudget({ income: 1, expenses: [], savingsPct: '150' }).ok).toBe(false);
  });

  it('savings goal plan', () => {
    expect(savingsGoalPlan({ target: 1000_00, current: 100_00, months: 7 })).toMatchObject({ monthly: 128_58 });
    expect(savingsGoalPlan({ target: 1000_00, current: 0, monthly: 300_00 })).toMatchObject({ months: 4 });
  });

  it('expense split sums exactly to the total', () => {
    const r = splitExpense({ total: 100_00, people: 3, tipPct: '15' });
    expect(r.ok && r.tip).toBe(15_00);
    expect(r.ok && r.shares).toEqual([38_34, 38_33, 38_33]);
    const w = splitExpense({ total: 90_00, people: 2, weights: [2, 1] });
    expect(w.ok && w.shares).toEqual([60_00, 30_00]);
  });

  it('salary breakdown', () => {
    const r = salaryBreakdown({ amount: 52000_00, period: 'year', hoursPerWeek: '40', deductionPct: '25' });
    expect(r.ok && r.gross).toEqual({ year: 52000_00, month: 4333_33, biweekly: 2000_00, week: 1000_00, day: 200_00, hour: 25_00 });
    expect(r.ok && r.net.year).toBe(39000_00);
    const h = salaryBreakdown({ amount: 20_00, period: 'hour', hoursPerWeek: '37.5', deductionPct: '0' });
    expect(h.ok && h.gross.year).toBe(39000_00);
  });

  it('debt repayment schedule and minimum payment', () => {
    const r = debtRepayment({ balance: 1000_00, aprPct: '12', payment: 100_00 });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.months).toBe(11);
      expect(r.schedule[0]).toEqual({ month: 1, payment: 100_00, interest: 10_00, principal: 90_00, balance: 910_00 });
      expect(r.schedule[r.schedule.length - 1]!.balance).toBe(0);
      expect(r.totalPaid).toBe(r.schedule.reduce((a, m) => a + m.payment, 0));
    }
    expect(debtRepayment({ balance: 1000_00, aprPct: '24', payment: 20_00 })).toMatchObject({ ok: false, error: 'payment_too_low' });
    expect(debtRepayment({ balance: 1200_00, aprPct: '0', payment: 100_00 })).toMatchObject({ ok: true, months: 12, totalInterest: 0 });
    const p = paymentForMonths({ balance: 1000_00, aprPct: '12', months: 12 });
    expect(p).not.toBeNull();
    const at = debtRepayment({ balance: 1000_00, aprPct: '12', payment: p! });
    const below = debtRepayment({ balance: 1000_00, aprPct: '12', payment: p! - 1 });
    expect(at.ok && at.months).toBe(12);
    expect(below.ok && below.months).toBe(13);
  });
});
