import type { ExchangeRate, Transaction } from '@/types';
import { daysBetweenInclusive, monthOf, type DateRange, type DayKey, type MonthKey } from '@/utils/dates';
import { convertMinor } from '@/utils/money';

/**
 * Statistics rules (see docs/financial-calculations.md):
 * - Spending  = expenses − refunds (refunds reduce the spending of their category).
 * - Income    = income transactions only.
 * - Transfers and adjustments are EXCLUDED from income/spending (they move or correct money).
 * - Only amounts in the target currency are summed. Other currencies are converted only when
 *   the user saved a manual rate; otherwise they are excluded and counted in `excludedCount`.
 */
export type StatTx = Pick<Transaction, 'type' | 'amount' | 'currency' | 'categoryId' | 'date' | 'accountId'>;

export interface Summary {
  currency: string;
  income: number;
  spending: number;
  net: number;
  spendingByCategory: Record<string, number>;
  incomeByCategory: Record<string, number>;
  /** Number of income/expense/refund transactions included. */
  count: number;
  /** Transactions left out because their currency has no exchange rate. */
  excludedCount: number;
}

export const UNCATEGORIZED = '__none__';

export function rateMap(rates: readonly ExchangeRate[]): Record<string, string> {
  return Object.fromEntries(rates.map((r) => [r.currency, r.rate]));
}

/** Amount of `tx` in `currency`, or null when it cannot be converted. */
export function amountIn(tx: Pick<StatTx, 'amount' | 'currency'>, currency: string, rates: Record<string, string>): number | null {
  if (tx.currency === currency) return tx.amount;
  const rate = rates[tx.currency];
  return rate ? convertMinor(tx.amount, tx.currency, currency, rate) : null;
}

export function summarize(txs: readonly StatTx[], currency: string, rates: Record<string, string> = {}): Summary {
  const s: Summary = { currency, income: 0, spending: 0, net: 0, spendingByCategory: {}, incomeByCategory: {}, count: 0, excludedCount: 0 };
  for (const tx of txs) {
    if (tx.type === 'transfer' || tx.type === 'adjustment') continue;
    const amount = amountIn(tx, currency, rates);
    if (amount === null) {
      s.excludedCount++;
      continue;
    }
    const cat = tx.categoryId ?? UNCATEGORIZED;
    s.count++;
    if (tx.type === 'income') {
      s.income += amount;
      s.incomeByCategory[cat] = (s.incomeByCategory[cat] ?? 0) + amount;
    } else {
      const signed = tx.type === 'refund' ? -amount : amount;
      s.spending += signed;
      s.spendingByCategory[cat] = (s.spendingByCategory[cat] ?? 0) + signed;
    }
  }
  s.net = s.income - s.spending;
  return s;
}

/** Categories sorted by amount, descending, ignoring zero/negative totals. */
export function rankCategories(byCategory: Record<string, number>): { categoryId: string; amount: number }[] {
  return Object.entries(byCategory)
    .filter(([, v]) => v > 0)
    .map(([categoryId, amount]) => ({ categoryId, amount }))
    .sort((a, b) => b.amount - a.amount || a.categoryId.localeCompare(b.categoryId));
}

/** Spending per day over the range (refunds subtract). */
export function dailySpending(txs: readonly StatTx[], range: DateRange, currency: string, rates: Record<string, string> = {}): { day: DayKey; amount: number }[] {
  const map = new Map(daysBetweenInclusive(range).map((d) => [d, 0]));
  for (const tx of txs) {
    if ((tx.type !== 'expense' && tx.type !== 'refund') || !map.has(tx.date)) continue;
    const a = amountIn(tx, currency, rates);
    if (a === null) continue;
    map.set(tx.date, (map.get(tx.date) ?? 0) + (tx.type === 'refund' ? -a : a));
  }
  return [...map.entries()].map(([day, amount]) => ({ day, amount }));
}

/** Income and spending per month for the given months. */
export function monthlyTrend(txs: readonly StatTx[], months: readonly MonthKey[], currency: string, rates: Record<string, string> = {}): { month: MonthKey; income: number; spending: number }[] {
  const byMonth = new Map(months.map((m) => [m, [] as StatTx[]]));
  for (const tx of txs) byMonth.get(monthOf(tx.date))?.push(tx);
  return months.map((m) => {
    const s = summarize(byMonth.get(m) ?? [], currency, rates);
    return { month: m, income: s.income, spending: s.spending };
  });
}

/** Savings rate = (income − spending) / income; null without income (never invented). */
export function savingsRate(s: Pick<Summary, 'income' | 'spending'>): number | null {
  if (s.income <= 0) return null;
  return (s.income - s.spending) / s.income;
}

/** Percentage change rounded to an integer; null when the base is zero. */
export function percentChange(previous: number, current: number): number | null {
  if (previous <= 0) return null;
  return Math.round(((current - previous) * 100) / previous);
}
