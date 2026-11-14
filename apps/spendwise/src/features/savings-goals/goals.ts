import type { SavingsContribution } from '@/types';
import { diffMonths, monthOf, type DayKey } from '@/utils/dates';

export interface GoalProgress {
  saved: number;
  remaining: number;
  /** 0..1 (capped at 1 for display; `saved` may exceed the target). */
  ratio: number;
  percent: number;
  reached: boolean;
  /** Months left until the target date (>= 1), null without a date or when the date is past. */
  monthsLeft: number | null;
  /** Monthly amount needed to reach the target in time, rounded UP to the minor unit. */
  recommendedMonthly: number | null;
  overdue: boolean;
}

/**
 * Goal progress from its contributions (contributions are tracking-only, never expenses).
 * monthsLeft = calendar months from this month to the target month, at least 1
 * (a target date in the current month still leaves one month to save).
 */
export function goalProgress(target: number, contributions: readonly Pick<SavingsContribution, 'amount'>[], targetDate: DayKey | null, today: DayKey): GoalProgress {
  const saved = contributions.reduce((a, c) => a + c.amount, 0);
  const remaining = Math.max(0, target - saved);
  const reached = saved >= target;
  const ratio = target > 0 ? Math.min(1, Math.max(0, saved / target)) : 0;
  const percent = target > 0 ? Math.max(0, Math.floor((saved * 100) / target)) : 0;
  let monthsLeft: number | null = null;
  let recommendedMonthly: number | null = null;
  let overdue = false;
  if (targetDate) {
    if (targetDate < today) overdue = !reached;
    else {
      monthsLeft = Math.max(1, diffMonths(monthOf(today), monthOf(targetDate)));
      recommendedMonthly = reached ? 0 : Math.ceil(remaining / monthsLeft);
    }
  }
  return { saved, remaining, ratio, percent: Math.min(percent, 999), reached, monthsLeft, recommendedMonthly, overdue };
}

/** A withdrawal can't take the saved amount below zero. */
export function canWithdraw(saved: number, amount: number): boolean {
  return amount > 0 && amount <= saved;
}
