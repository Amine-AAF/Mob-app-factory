import { crossesThreshold, inMonth, totalIn, totalsByCurrency, type BudgetLevel } from '@/domain/budget';
import { shiftMonth } from '@/domain/planner';
import type { ShoppingRecord, WishlistItem } from '@/domain/types';

/**
 * Pure helpers for the Shopping tracker and the Wishlist screens.
 * Amounts are always kept per currency: nothing here converts or adds different currencies.
 */

export interface MonthSection {
  /** "YYYY-MM" */
  key: string;
  data: ShoppingRecord[];
}

/** Groups records (already sorted newest first) by purchase month, keeping the order. */
export function monthSections(records: readonly ShoppingRecord[]): MonthSection[] {
  const out: MonthSection[] = [];
  const index = new Map<string, MonthSection>();
  for (const r of records) {
    const key = r.purchasedOn.slice(0, 7);
    let section = index.get(key);
    if (!section) {
      section = { key, data: [] };
      index.set(key, section);
      out.push(section);
    }
    section.data.push(r);
  }
  return out;
}

export const previousMonthKey = (monthKey: string) => shiftMonth(monthKey, -1);

export function budgetTone(level: BudgetLevel): 'success' | 'warning' | 'danger' | 'primary' {
  if (level === 'over') return 'danger';
  if (level === 'warning') return 'warning';
  if (level === 'ok') return 'success';
  return 'primary';
}

/**
 * Whether saving a purchase makes the current month cross the budget warning threshold or the budget.
 * Handles edits: the previous version of the record (if it counted) is replaced by the new one.
 * Only purchases in the budget currency and the given month count.
 */
export function purchaseCrossing(input: {
  records: readonly ShoppingRecord[];
  previous: Pick<ShoppingRecord, 'id' | 'price' | 'currency' | 'purchasedOn'> | null;
  next: Pick<ShoppingRecord, 'price' | 'currency' | 'purchasedOn'>;
  monthKey: string;
  budget: number | null;
  budgetCurrency: string;
  warnPercent: number;
}): 'warning' | 'over' | null {
  const { next, previous, monthKey, budgetCurrency } = input;
  if (next.currency !== budgetCurrency || !next.purchasedOn.startsWith(monthKey)) return null;
  const month = inMonth(
    input.records.filter((r) => r.id !== previous?.id),
    monthKey,
  );
  const others = totalIn(month, budgetCurrency);
  const counted = previous && previous.currency === budgetCurrency && previous.purchasedOn.startsWith(monthKey) ? previous.price : 0;
  const before = others + counted;
  const added = Math.round((next.price - counted) * 100) / 100;
  return crossesThreshold(before, added, input.budget, input.warnPercent);
}

export interface CurrencyComparison {
  currency: string;
  current: number;
  previous: number;
}

/** Totals of two periods side by side, one row per currency present in either period. */
export function compareByCurrency(current: readonly ShoppingRecord[], previous: readonly ShoppingRecord[], primaryCurrency: string): CurrencyComparison[] {
  const cur = new Map(totalsByCurrency(current).map((c) => [c.currency, c.total]));
  const prev = new Map(totalsByCurrency(previous).map((c) => [c.currency, c.total]));
  const currencies = [...new Set([primaryCurrency, ...cur.keys(), ...prev.keys()])];
  return currencies
    .map((currency) => ({ currency, current: cur.get(currency) ?? 0, previous: prev.get(currency) ?? 0 }))
    .filter((c) => c.currency === primaryCurrency || c.current > 0 || c.previous > 0);
}

/** Estimated value of wishlist entries still wanted or planned, per currency. */
export function wishlistTotals(items: readonly WishlistItem[], fallbackCurrency: string): { currency: string; total: number; count: number }[] {
  const map = new Map<string, { total: number; count: number }>();
  for (const w of items) {
    if (w.status !== 'wanted' && w.status !== 'planned') continue;
    if (w.estimatedPrice == null || w.estimatedPrice < 0) continue;
    const c = w.currency ?? fallbackCurrency;
    const cur = map.get(c) ?? { total: 0, count: 0 };
    cur.total = Math.round((cur.total + w.estimatedPrice) * 100) / 100;
    cur.count++;
    map.set(c, cur);
  }
  return [...map.entries()].map(([currency, v]) => ({ currency, ...v })).sort((a, b) => b.count - a.count || a.currency.localeCompare(b.currency));
}

/** Only plain web links may be opened (the wishlist never connects to a shop). */
export const isOpenableUrl = (url: string | null | undefined): url is string => !!url && /^https?:\/\//i.test(url);
