import { addDays, type DayKey } from './dates';
import { nextOccurrenceAfter, occurrencesBetween, type Recurrence } from './recurrence';
import type { ExpenseFrequency, RecurringExpense } from './types';

export function expenseRecurrence(frequency: ExpenseFrequency): Recurrence {
  return { frequency };
}

/** Max occurrences recorded in one catch-up (e.g. app unused for years). */
export const MAX_CATCH_UP = 36;

export interface CatchUpPlan {
  /** Occurrence dates to record as expenses, oldest first. */
  dates: DayKey[];
  /** New `next_date` after recording them. */
  nextDate: DayKey;
  /** False when the schedule passed its end date. */
  stillActive: boolean;
}

/**
 * Which occurrences of a recurring expense are due and not recorded yet.
 * Pure and idempotent: dates before `nextDate` are never returned again, and the
 * database additionally enforces one row per (recurring_id, occurrence_date).
 */
export function planCatchUp(rec: Pick<RecurringExpense, 'startDate' | 'nextDate' | 'endDate' | 'frequency' | 'active'>, today: DayKey): CatchUpPlan {
  const r = expenseRecurrence(rec.frequency);
  if (!rec.active) return { dates: [], nextDate: rec.nextDate, stillActive: false };
  const until = rec.endDate && rec.endDate < today ? rec.endDate : today;
  const dates = rec.nextDate > until ? [] : occurrencesBetween(rec.startDate, r, addDays(rec.nextDate, -1), until, MAX_CATCH_UP);
  const last = dates[dates.length - 1];
  const nextDate = last ? (nextOccurrenceAfter(rec.startDate, r, last) ?? rec.nextDate) : rec.nextDate;
  const stillActive = !rec.endDate || nextDate <= rec.endDate;
  return { dates, nextDate, stillActive };
}

/** First occurrence on or after `from` for a new schedule starting at `start`. */
export function firstOccurrenceFrom(start: DayKey, frequency: ExpenseFrequency, from: DayKey): DayKey {
  if (start >= from) return start;
  return nextOccurrenceAfter(start, expenseRecurrence(frequency), addDays(from, -1)) ?? start;
}

/** Approximate monthly cost (for the recurring summary only, same currency). */
export function monthlyEquivalentMinor(amountMinor: number, frequency: ExpenseFrequency): number {
  const perYear = { weekly: 52, monthly: 12, quarterly: 4, semiannual: 2, annual: 1 }[frequency];
  return Math.round((amountMinor * perYear) / 12);
}
