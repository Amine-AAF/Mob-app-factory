import { BUDGET_CATEGORIES, type BudgetCategory } from '@/constants/domain';
import type { Expense, LocalDate } from '@/types/models';
import { dateRange, diffDays, isValidDate, tripDayCount } from '@/utils/dates';

/**
 * Budget figures computed from recorded expenses only. Nothing is estimated or
 * invented: when data is missing the value is null and the UI says so.
 */
export interface CategoryLine {
  category: BudgetCategory;
  plannedMinor: number | null;
  spentMinor: number;
  remainingMinor: number | null;
  ratio: number | null;
}

export interface BudgetOverview {
  totalPlannedMinor: number | null;
  spentMinor: number;
  remainingMinor: number | null;
  ratio: number | null;
  categories: CategoryLine[];
}

export function budgetOverview(
  expenses: Pick<Expense, 'category' | 'tripAmountMinor'>[],
  planned: Partial<Record<BudgetCategory, number>>,
  tripBudgetMinor: number | null,
): BudgetOverview {
  const spentBy = new Map<BudgetCategory, number>();
  for (const e of expenses) spentBy.set(e.category, (spentBy.get(e.category) ?? 0) + e.tripAmountMinor);
  const categories = BUDGET_CATEGORIES.map((category) => {
    const p = planned[category] ?? null;
    const spent = spentBy.get(category) ?? 0;
    return { category, plannedMinor: p, spentMinor: spent, remainingMinor: p === null ? null : p - spent, ratio: p ? spent / p : null };
  });
  const spentMinor = categories.reduce((s, c) => s + c.spentMinor, 0);
  const sumPlanned = categories.some((c) => c.plannedMinor !== null) ? categories.reduce((s, c) => s + (c.plannedMinor ?? 0), 0) : null;
  // The trip's total budget wins; otherwise the sum of category budgets.
  const totalPlannedMinor = tripBudgetMinor ?? sumPlanned;
  return {
    totalPlannedMinor,
    spentMinor,
    remainingMinor: totalPlannedMinor === null ? null : totalPlannedMinor - spentMinor,
    ratio: totalPlannedMinor ? spentMinor / totalPlannedMinor : null,
    categories,
  };
}

export interface BudgetInsights {
  biggestCategory: { category: BudgetCategory; spentMinor: number; share: number } | null;
  /** Average per day over the days elapsed so far (or the whole trip once finished); null without data. */
  averageDailyMinor: number | null;
  daysCounted: number | null;
  /** Remaining budget per remaining trip day, only while the trip is ongoing or upcoming. */
  dailyAllowanceMinor: number | null;
  byDay: { date: LocalDate; spentMinor: number; plannedMinor: number | null }[];
}

export function budgetInsights(
  expenses: Pick<Expense, 'category' | 'tripAmountMinor' | 'date'>[],
  trip: { startDate: LocalDate | null; endDate: LocalDate | null },
  remainingMinor: number | null,
  today: LocalDate,
  dayBudgets: Map<LocalDate, number> = new Map(),
): BudgetInsights {
  const total = expenses.reduce((s, e) => s + e.tripAmountMinor, 0);
  const byCat = new Map<BudgetCategory, number>();
  for (const e of expenses) byCat.set(e.category, (byCat.get(e.category) ?? 0) + e.tripAmountMinor);
  const biggest = [...byCat].sort((a, b) => b[1] - a[1])[0];

  const hasDates = isValidDate(trip.startDate) && isValidDate(trip.endDate);
  let daysCounted: number | null = null;
  if (hasDates && expenses.length) {
    const end = today < trip.endDate! ? today : trip.endDate!;
    daysCounted = end >= trip.startDate! ? diffDays(trip.startDate!, end) + 1 : null;
  } else if (expenses.length) {
    // No trip dates: count the distinct days that have expenses.
    daysCounted = new Set(expenses.map((e) => e.date)).size;
  }

  const byDayMap = new Map<LocalDate, number>();
  for (const e of expenses) byDayMap.set(e.date, (byDayMap.get(e.date) ?? 0) + e.tripAmountMinor);
  const dates = hasDates ? dateRange(trip.startDate!, trip.endDate!) : [...byDayMap.keys()].sort();
  const byDay = dates.map((date) => ({ date, spentMinor: byDayMap.get(date) ?? 0, plannedMinor: dayBudgets.get(date) ?? null }));

  let dailyAllowanceMinor: number | null = null;
  if (hasDates && remainingMinor !== null && today <= trip.endDate!) {
    const from = today > trip.startDate! ? today : trip.startDate!;
    const left = tripDayCount(from, trip.endDate!);
    if (left) dailyAllowanceMinor = Math.floor(remainingMinor / left);
  }

  return {
    biggestCategory: biggest && total > 0 ? { category: biggest[0], spentMinor: biggest[1], share: biggest[1] / total } : null,
    averageDailyMinor: daysCounted ? Math.round(total / daysCounted) : null,
    daysCounted,
    dailyAllowanceMinor,
    byDay,
  };
}
