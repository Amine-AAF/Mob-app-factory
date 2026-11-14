import { round } from './care';
import { monthKey } from './dates';
import { EXPENSE_CATEGORIES, type DayKey, type Expense, type ExpenseCategory } from './types';

export interface CurrencyTotal {
  currency: string;
  total: number;
}

/**
 * Totals are always grouped by currency: PetCare never converts currencies
 * (no exchange-rate API), so mixing them would produce wrong numbers.
 */
export function totalsByCurrency(expenses: readonly Pick<Expense, 'amount' | 'currency'>[]): CurrencyTotal[] {
  const map = new Map<string, number>();
  for (const e of expenses) map.set(e.currency, (map.get(e.currency) ?? 0) + e.amount);
  return [...map.entries()].map(([currency, total]) => ({ currency, total: round(total) })).sort((a, b) => b.total - a.total);
}

export function inMonth(expenses: readonly Expense[], day: DayKey): Expense[] {
  const m = monthKey(day);
  return expenses.filter((e) => monthKey(e.date) === m);
}

export function inYear(expenses: readonly Expense[], year: number): Expense[] {
  return expenses.filter((e) => e.date.startsWith(`${year}-`));
}

/** Per-category totals in one currency, sorted descending, zero categories omitted. */
export function byCategory(expenses: readonly Expense[], currency: string): { category: ExpenseCategory; total: number }[] {
  return EXPENSE_CATEGORIES.map((category) => ({
    category,
    total: round(expenses.filter((e) => e.currency === currency && e.category === category).reduce((s, e) => s + e.amount, 0)),
  }))
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);
}

/** 12 monthly totals (Jan..Dec) for one currency and year. */
export function monthlySeries(expenses: readonly Expense[], year: number, currency: string): number[] {
  const months = Array.from({ length: 12 }, () => 0);
  for (const e of inYear(expenses, year)) {
    if (e.currency !== currency) continue;
    const m = Number(e.date.slice(5, 7)) - 1;
    months[m] = round((months[m] ?? 0) + e.amount);
  }
  return months;
}

export interface BudgetState {
  spent: number;
  budget: number;
  ratio: number;
  level: 'ok' | 'warning' | 'over';
}

export function budgetState(spent: number, budget: number | null): BudgetState | null {
  if (!budget || budget <= 0) return null;
  const ratio = spent / budget;
  return { spent: round(spent), budget, ratio, level: ratio > 1 ? 'over' : ratio >= 0.8 ? 'warning' : 'ok' };
}

/** Parses a user-typed amount ("12,50", "1 234.5"). Returns null when invalid or negative. */
export function parseAmount(raw: string): number | null {
  const cleaned = raw.replace(/[\s  ]/g, '').replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? round(n) : null;
}
