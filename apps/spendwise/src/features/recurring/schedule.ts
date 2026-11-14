import type { Schedule } from '@/types';
import { addDays, addMonthsAnchored, diffDays, type DayKey } from '@/utils/dates';

/**
 * Pure schedule arithmetic shared by recurring rules and subscriptions.
 *
 * Occurrence #n is always computed from the START date (never chained from the
 * previous occurrence), so month-end dates do not drift:
 *   monthly from Jan 31 -> Feb 28 (29) -> Mar 31 -> Apr 30 …
 *   yearly from Feb 29  -> Feb 28 on non-leap years.
 */
export function occurrenceAt(s: Pick<Schedule, 'frequency' | 'interval' | 'startDate'>, n: number): DayKey {
  const k = Math.max(1, Math.floor(s.interval));
  switch (s.frequency) {
    case 'daily':
      return addDays(s.startDate, n * k);
    case 'weekly':
      return addDays(s.startDate, 7 * n * k);
    case 'monthly':
      return addMonthsAnchored(s.startDate, n * k);
    case 'yearly':
      return addMonthsAnchored(s.startDate, 12 * n * k);
    case 'custom':
      return addDays(s.startDate, n * k);
  }
}

/** Lower bound of the occurrence index whose date can be >= `from` (cheap skip-ahead). */
function firstIndexFrom(s: Schedule, from: DayKey): number {
  const days = diffDays(s.startDate, from);
  if (days <= 0) return 0;
  const k = Math.max(1, Math.floor(s.interval));
  const approxPeriodDays = { daily: 1, weekly: 7, monthly: 31, yearly: 366, custom: 1 }[s.frequency] * k;
  return Math.max(0, Math.floor(days / approxPeriodDays) - 1);
}

/** All occurrence dates in [from, to] (inclusive), oldest first, capped by `limit`. */
export function occurrencesBetween(s: Schedule, from: DayKey, to: DayKey, limit = 1000): DayKey[] {
  const out: DayKey[] = [];
  if (to < from) return out;
  const last = s.endDate && s.endDate < to ? s.endDate : to;
  for (let n = firstIndexFrom(s, from); out.length < limit; n++) {
    const d = occurrenceAt(s, n);
    if (d > last) break;
    if (d >= from) out.push(d);
  }
  return out;
}

/** First occurrence on or after `from`, or null when the schedule has ended. */
export function nextOccurrence(s: Schedule, from: DayKey): DayKey | null {
  const end = s.endDate ?? '9999-12-31';
  for (let n = firstIndexFrom(s, from); ; n++) {
    const d = occurrenceAt(s, n);
    if (d > end) return null;
    if (d >= from) return d;
  }
}

/**
 * Number of occurrences per year as an exact rational (used to normalise prices).
 * Conventions (documented): 365 days/year, 52 weeks/year, 12 months/year.
 */
export function periodsPerYear(s: Pick<Schedule, 'frequency' | 'interval'>): { num: bigint; den: bigint } {
  const k = BigInt(Math.max(1, Math.floor(s.interval)));
  switch (s.frequency) {
    case 'daily':
    case 'custom':
      return { num: 365n, den: k };
    case 'weekly':
      return { num: 52n, den: k };
    case 'monthly':
      return { num: 12n, den: k };
    case 'yearly':
      return { num: 1n, den: k };
  }
}

export function isValidSchedule(s: Schedule): boolean {
  return Number.isInteger(s.interval) && s.interval >= 1 && s.interval <= 3650 && (!s.endDate || s.endDate >= s.startDate);
}
