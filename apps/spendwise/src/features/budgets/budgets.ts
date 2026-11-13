import type { BudgetCategoryLimit } from '@/types';

/** Alert thresholds offered in settings (percent of the limit). */
export const ALL_THRESHOLDS = [50, 75, 90, 100] as const;
export type Threshold = (typeof ALL_THRESHOLDS)[number];

export interface BudgetLine {
  /** Category id, or 'total' for the global budget. */
  scope: string;
  limit: number;
  spent: number;
  remaining: number;
  /** Consumption ratio (can exceed 1). */
  ratio: number;
  /** Rounded percentage for display. */
  percent: number;
  /** Highest enabled threshold reached, or null. Exact integer comparison (no float). */
  reached: number | null;
  over: boolean;
}

export function reachedThreshold(spent: number, limit: number, thresholds: readonly number[]): number | null {
  if (limit <= 0) return spent > 0 && thresholds.length ? Math.max(...thresholds) : null;
  let best: number | null = null;
  for (const t of thresholds) if (spent * 100 >= limit * t && (best === null || t > best)) best = t;
  return best;
}

export function budgetLine(scope: string, limit: number, spent: number, thresholds: readonly number[]): BudgetLine {
  const ratio = limit > 0 ? spent / limit : spent > 0 ? 1 : 0;
  return {
    scope,
    limit,
    spent,
    remaining: limit - spent,
    ratio,
    percent: limit > 0 ? Math.round((spent * 100) / limit) : spent > 0 ? 100 : 0,
    reached: reachedThreshold(spent, limit, thresholds),
    over: spent > limit,
  };
}

/**
 * Budget vs actual for one month. Spending figures must come from `summarize()` for the
 * same month and currency (expenses − refunds, transfers excluded).
 */
export function evaluateBudget(
  budget: { totalLimit: number | null },
  limits: readonly Pick<BudgetCategoryLimit, 'categoryId' | 'limit'>[],
  spendingByCategory: Record<string, number>,
  totalSpending: number,
  thresholds: readonly number[],
): { total: BudgetLine; categories: BudgetLine[] } {
  const totalLimit = budget.totalLimit ?? limits.reduce((a, l) => a + l.limit, 0);
  const categories = limits
    .map((l) => budgetLine(l.categoryId, l.limit, Math.max(0, spendingByCategory[l.categoryId] ?? 0), thresholds))
    .sort((a, b) => b.ratio - a.ratio);
  return { total: budgetLine('total', totalLimit, Math.max(0, totalSpending), thresholds), categories };
}

/** Alerts worth showing: lines whose reached threshold is set, most severe first. */
export function activeAlerts(lines: readonly BudgetLine[]): BudgetLine[] {
  return lines.filter((l) => l.reached !== null && l.limit > 0).sort((a, b) => (b.reached ?? 0) - (a.reached ?? 0) || b.ratio - a.ratio);
}
