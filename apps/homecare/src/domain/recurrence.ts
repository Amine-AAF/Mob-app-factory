import { addDays, addMonths, addYears, diffDays, type DayKey } from './dates';

/**
 * Recurrence rules shared by maintenance tasks, household tasks and recurring expenses.
 *
 * The proposed frequencies are generic organisation presets, not technical
 * recommendations: users can change any interval (see templates disclaimer).
 */
export const MAINTENANCE_FREQUENCIES = ['once', 'daily', 'weekly', 'monthly', 'quarterly', 'semiannual', 'annual', 'custom'] as const;
export type Frequency = (typeof MAINTENANCE_FREQUENCIES)[number];

export const INTERVAL_UNITS = ['day', 'week', 'month', 'year'] as const;
export type IntervalUnit = (typeof INTERVAL_UNITS)[number];

export interface Recurrence {
  frequency: Frequency;
  /** Only for `custom`. */
  intervalValue?: number | null;
  intervalUnit?: IntervalUnit | null;
}

/** Normalises a recurrence to "every N units"; null for one-off. */
export function toInterval(r: Recurrence): { value: number; unit: IntervalUnit } | null {
  switch (r.frequency) {
    case 'once':
      return null;
    case 'daily':
      return { value: 1, unit: 'day' };
    case 'weekly':
      return { value: 1, unit: 'week' };
    case 'monthly':
      return { value: 1, unit: 'month' };
    case 'quarterly':
      return { value: 3, unit: 'month' };
    case 'semiannual':
      return { value: 6, unit: 'month' };
    case 'annual':
      return { value: 1, unit: 'year' };
    case 'custom': {
      const value = Math.floor(Number(r.intervalValue));
      if (!Number.isFinite(value) || value < 1 || !r.intervalUnit) return null;
      return { value: Math.min(value, 1000), unit: r.intervalUnit };
    }
  }
}

export function isValidRecurrence(r: Recurrence): boolean {
  return r.frequency === 'once' || toInterval(r) !== null;
}

/** Adds `times` intervals to `from` (month arithmetic is clamped, see addMonths). */
export function addInterval(from: DayKey, r: Recurrence, times = 1): DayKey | null {
  const interval = toInterval(r);
  if (!interval) return null;
  const n = interval.value * times;
  switch (interval.unit) {
    case 'day':
      return addDays(from, n);
    case 'week':
      return addDays(from, n * 7);
    case 'month':
      return addMonths(from, n);
    case 'year':
      return addYears(from, n);
  }
}

/**
 * Next due date after a completion. Maintenance is anchored on the day the work
 * was actually done (cleaning a filter late moves the next cleaning too).
 * One-off tasks return null (nothing left to do).
 */
export function nextDueAfterCompletion(doneOn: DayKey, r: Recurrence): DayKey | null {
  return addInterval(doneOn, r);
}

/**
 * Occurrences of a schedule anchored on `start` that fall in (after, until],
 * computed from the anchor (start + k·interval) so month-end dates never drift
 * (Jan 31 → Feb 28 → Mar 31, not Mar 28). Capped to protect against huge catch-ups.
 */
export function occurrencesBetween(start: DayKey, r: Recurrence, after: DayKey | null, until: DayKey, max = 120): DayKey[] {
  const out: DayKey[] = [];
  if (!toInterval(r)) {
    if ((after === null || start > after) && start <= until) out.push(start);
    return out;
  }
  for (let k = 0; out.length < max; k++) {
    const date = k === 0 ? start : addInterval(start, r, k);
    if (!date || date > until) break;
    if (after === null || date > after) out.push(date);
    if (k > 100_000) break;
  }
  return out;
}

/** First occurrence of an anchored schedule strictly after `after`. */
export function nextOccurrenceAfter(start: DayKey, r: Recurrence, after: DayKey): DayKey | null {
  if (start > after) return start;
  const interval = toInterval(r);
  if (!interval) return null;
  // Jump close to the target, then step (keeps catch-up O(1) for old anchors).
  const approxDays = { day: 1, week: 7, month: 30.44, year: 365.25 }[interval.unit] * interval.value;
  let k = Math.max(1, Math.floor(diffDays(start, after) / approxDays) - 1);
  for (let guard = 0; guard < 1000; guard++, k++) {
    const date = addInterval(start, r, k);
    if (!date) return null;
    if (date > after) return date;
  }
  return null;
}

export type DueStatus = 'overdue' | 'today' | 'soon' | 'upcoming' | 'done' | 'none';

export const DUE_SOON_DAYS = 7;

/** Urgency bucket for a due date relative to today. */
export function dueStatus(nextDue: DayKey | null | undefined, today: DayKey, soonDays = DUE_SOON_DAYS): DueStatus {
  if (!nextDue) return 'none';
  const d = diffDays(today, nextDue);
  if (d < 0) return 'overdue';
  if (d === 0) return 'today';
  if (d <= soonDays) return 'soon';
  return 'upcoming';
}

/** Postpones a due date by N days; a task already overdue is postponed from today. */
export function postpone(nextDue: DayKey, days: number, today: DayKey): DayKey {
  const base = nextDue < today ? today : nextDue;
  return addDays(base, Math.max(1, Math.floor(days)));
}
