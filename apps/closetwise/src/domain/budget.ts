import type { DayKey, ShoppingRecord } from './types';

/**
 * Shopping statistics. Amounts are always grouped by currency: records in another
 * currency than the budget currency are reported separately and never converted
 * (no exchange-rate API, and a stale rate would be misleading).
 */
export interface CurrencyTotal {
  currency: string;
  total: number;
  count: number;
}

const round = (n: number) => Math.round(n * 100) / 100;

export function totalsByCurrency(records: readonly ShoppingRecord[]): CurrencyTotal[] {
  const map = new Map<string, CurrencyTotal>();
  for (const r of records) {
    const cur = map.get(r.currency) ?? { currency: r.currency, total: 0, count: 0 };
    cur.total = round(cur.total + r.price);
    cur.count++;
    map.set(r.currency, cur);
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.currency.localeCompare(b.currency));
}

export const inMonth = (records: readonly ShoppingRecord[], monthKey: string) => records.filter((r) => r.purchasedOn.startsWith(monthKey));
export const inYear = (records: readonly ShoppingRecord[], year: number) => records.filter((r) => r.purchasedOn.startsWith(`${year}-`));
export const inRange = (records: readonly ShoppingRecord[], from: DayKey, to: DayKey) => records.filter((r) => r.purchasedOn >= from && r.purchasedOn <= to);

export function totalIn(records: readonly ShoppingRecord[], currency: string): number {
  return round(records.filter((r) => r.currency === currency).reduce((s, r) => s + r.price, 0));
}

export type BudgetLevel = 'none' | 'ok' | 'warning' | 'over';

export interface BudgetStatus {
  level: BudgetLevel;
  spent: number;
  budget: number | null;
  remaining: number | null;
  ratio: number | null;
  /** Spending in other currencies this month (not counted against the budget). */
  otherCurrencies: CurrencyTotal[];
}

export function budgetStatus(records: readonly ShoppingRecord[], monthKey: string, budget: number | null, currency: string, warnAtPercent = 80): BudgetStatus {
  const month = inMonth(records, monthKey);
  const spent = totalIn(month, currency);
  const otherCurrencies = totalsByCurrency(month.filter((r) => r.currency !== currency));
  if (budget == null || budget <= 0) return { level: 'none', spent, budget: null, remaining: null, ratio: null, otherCurrencies };
  const ratio = spent / budget;
  const level: BudgetLevel = ratio > 1 ? 'over' : ratio * 100 >= warnAtPercent ? 'warning' : 'ok';
  return { level, spent, budget, remaining: round(budget - spent), ratio, otherCurrencies };
}

/** True when adding `added` makes the month cross the warning threshold (alert once). */
export function crossesThreshold(before: number, added: number, budget: number | null, warnAtPercent: number): 'warning' | 'over' | null {
  if (budget == null || budget <= 0 || added <= 0) return null;
  const after = before + added;
  if (before <= budget && after > budget) return 'over';
  const t = (budget * warnAtPercent) / 100;
  if (before < t && after >= t) return 'warning';
  return null;
}

export function byCategory(records: readonly ShoppingRecord[], currency: string): { categoryId: string | null; total: number; count: number }[] {
  const map = new Map<string | null, { total: number; count: number }>();
  for (const r of records) {
    if (r.currency !== currency) continue;
    const cur = map.get(r.categoryId) ?? { total: 0, count: 0 };
    cur.total = round(cur.total + r.price);
    cur.count++;
    map.set(r.categoryId, cur);
  }
  return [...map.entries()].map(([categoryId, v]) => ({ categoryId, ...v })).sort((a, b) => b.total - a.total);
}

/** Monthly totals for the 12 months of `year` in one currency (for the yearly chart). */
export function monthlySeries(records: readonly ShoppingRecord[], year: number, currency: string): number[] {
  const out = Array.from({ length: 12 }, () => 0);
  for (const r of records) {
    if (r.currency !== currency || !r.purchasedOn.startsWith(`${year}-`)) continue;
    const m = Number(r.purchasedOn.slice(5, 7)) - 1;
    out[m] = round(out[m]! + r.price);
  }
  return out;
}

/** Relative change between two periods; null when the previous period is zero. */
export function periodChange(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

/** Parses a user-typed amount in any locale style ("12,50", "1 299.90", "1.299,90"). */
export function parseAmount(input: string): number | null {
  let s = input.replace(/[\s  ]/g, '').replace(/[^\d.,-]/g, '');
  if (!s) return null;
  const lastComma = s.lastIndexOf(',');
  const lastDot = s.lastIndexOf('.');
  if (lastComma > -1 && lastDot > -1) {
    // The last separator is the decimal one.
    s = lastComma > lastDot ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
  } else if (lastComma > -1) {
    const decimals = s.length - lastComma - 1;
    s = decimals === 3 && s.indexOf(',') === lastComma ? s.replace(',', '') : s.replace(/,/g, '.');
  }
  const n = Number(s);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100) / 100;
}
