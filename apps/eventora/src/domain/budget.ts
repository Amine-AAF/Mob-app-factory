import { convertExplicit, sumByCurrency, type CurrencyTotals } from './money';
import { BUDGET_CATEGORIES, type BudgetCategory, type CategoryBudget, type Expense } from './types';

/**
 * Budget summary. Everything is expressed in the event currency; expenses in
 * another currency count towards the event totals ONLY when the user gave an
 * explicit exchange rate. Otherwise they are listed in `unconverted`.
 */
export interface BudgetSummary {
  currency: string;
  initialMinor: number;
  plannedMinor: number; // sum of category envelopes
  estimatedMinor: number;
  spentMinor: number; // actual amounts of paid / deposit expenses
  committedMinor: number; // max(estimated, actual) of every expense
  remainingMinor: number; // initial − committed
  overBudget: boolean;
  unpaidMinor: number;
  /** Expenses in other currencies without a rate, per currency (actual or estimated). */
  unconverted: CurrencyTotals;
  convertedCount: number;
  byCategory: CategoryLine[];
}

export interface CategoryLine {
  category: BudgetCategory;
  plannedMinor: number;
  estimatedMinor: number;
  spentMinor: number;
  count: number;
}

/** An expense's amounts in the event currency, or null if it can't be converted. */
export function inEventCurrency(e: Expense, currency: string): { estimated: number; actual: number } | null {
  const est = convertExplicit({ amountMinor: e.estimatedMinor, currency: e.currency }, currency, e.fxRate);
  const act = convertExplicit({ amountMinor: e.actualMinor, currency: e.currency }, currency, e.fxRate);
  if (!est || !act) return null;
  return { estimated: est.amountMinor, actual: act.amountMinor };
}

export function summarizeBudget(input: {
  currency: string;
  initialMinor: number;
  envelopes: readonly CategoryBudget[];
  expenses: readonly Expense[];
}): BudgetSummary {
  const lines = new Map<BudgetCategory, CategoryLine>(
    BUDGET_CATEGORIES.map((c) => [c, { category: c, plannedMinor: 0, estimatedMinor: 0, spentMinor: 0, count: 0 }]),
  );
  for (const env of input.envelopes) {
    const line = lines.get(env.category);
    if (line) line.plannedMinor += env.plannedMinor;
  }
  let estimated = 0;
  let spent = 0;
  let committed = 0;
  let unpaid = 0;
  let convertedCount = 0;
  const unconverted: Expense[] = [];
  for (const e of input.expenses) {
    const amounts = inEventCurrency(e, input.currency);
    if (!amounts) {
      unconverted.push(e);
      continue;
    }
    if (e.currency !== input.currency) convertedCount++;
    const line = lines.get(e.category) ?? lines.get('other');
    const paidPart = e.paymentStatus === 'unpaid' ? 0 : amounts.actual;
    estimated += amounts.estimated;
    spent += paidPart;
    committed += Math.max(amounts.estimated, amounts.actual);
    unpaid += Math.max(0, Math.max(amounts.estimated, amounts.actual) - paidPart);
    if (line) {
      line.estimatedMinor += amounts.estimated;
      line.spentMinor += paidPart;
      line.count++;
    }
  }
  const planned = [...lines.values()].reduce((n, l) => n + l.plannedMinor, 0);
  return {
    currency: input.currency,
    initialMinor: input.initialMinor,
    plannedMinor: planned,
    estimatedMinor: estimated,
    spentMinor: spent,
    committedMinor: committed,
    remainingMinor: input.initialMinor - committed,
    overBudget: input.initialMinor > 0 && committed > input.initialMinor,
    unpaidMinor: unpaid,
    unconverted: sumByCurrency(unconverted.map((e) => ({ amountMinor: Math.max(e.actualMinor, e.estimatedMinor), currency: e.currency }))),
    convertedCount,
    byCategory: [...lines.values()].filter((l) => l.plannedMinor > 0 || l.count > 0),
  };
}

/** Cumulative spend per month ("YYYY-MM"), event currency only, for the evolution chart. */
export function spendingEvolution(expenses: readonly Expense[], currency: string): { month: string; cumulativeMinor: number; monthMinor: number }[] {
  const perMonth = new Map<string, number>();
  for (const e of expenses) {
    if (e.paymentStatus === 'unpaid') continue;
    const amounts = inEventCurrency(e, currency);
    const date = e.paymentDate ?? e.createdAt.slice(0, 10);
    if (!amounts || !date) continue;
    const m = date.slice(0, 7);
    perMonth.set(m, (perMonth.get(m) ?? 0) + amounts.actual);
  }
  let running = 0;
  return [...perMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, monthMinor]) => {
      running += monthMinor;
      return { month, monthMinor, cumulativeMinor: running };
    });
}

export function validateExpense(e: Pick<Expense, 'title' | 'estimatedMinor' | 'actualMinor' | 'currency' | 'fxRate'>, eventCurrency: string): string[] {
  const errors: string[] = [];
  if (!e.title.trim()) errors.push('title');
  if (e.estimatedMinor < 0 || e.actualMinor < 0) errors.push('amount');
  if (!/^[A-Z]{3}$/.test(e.currency)) errors.push('currency');
  if (e.currency !== eventCurrency && e.fxRate != null && (!Number.isFinite(e.fxRate) || e.fxRate <= 0)) errors.push('fxRate');
  return errors;
}
