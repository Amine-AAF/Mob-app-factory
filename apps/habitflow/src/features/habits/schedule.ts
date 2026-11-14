import { addDays, diffDays, fromDayKey, startOfWeek, type DayKey } from '@factory/app-core';

import type { Frequency, HabitWithSchedules, Schedule, Weekday } from '@/types';

/**
 * Pure scheduling rules. A habit is either:
 *  - day-based (daily, chosen weekdays, every N days): each scheduled day is one occurrence;
 *  - period-based (X times per week / month): each week/month is one occurrence with a count target.
 * Days that are not scheduled never break a streak.
 */
export type PeriodKind = 'week' | 'month';

export function isPeriodBased(f: Frequency): f is Extract<Frequency, { type: 'timesPerWeek' | 'timesPerMonth' }> {
  return f.type === 'timesPerWeek' || f.type === 'timesPerMonth';
}

export function periodKind(f: Frequency): PeriodKind | null {
  return f.type === 'timesPerWeek' ? 'week' : f.type === 'timesPerMonth' ? 'month' : null;
}

export function weekdayOf(day: DayKey): Weekday {
  return fromDayKey(day).getDay() as Weekday;
}

export function startOfMonth(day: DayKey): DayKey {
  return `${day.slice(0, 7)}-01`;
}

export function endOfMonth(day: DayKey): DayKey {
  const d = fromDayKey(startOfMonth(day));
  return addDays(startOfMonth(day), new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate() - 1);
}

export function periodBounds(kind: PeriodKind, day: DayKey): { start: DayKey; end: DayKey } {
  if (kind === 'week') {
    const start = startOfWeek(day);
    return { start, end: addDays(start, 6) };
  }
  return { start: startOfMonth(day), end: endOfMonth(day) };
}

/** Inclusive list of day keys from `from` to `to`. Empty when to < from. */
export function daysBetween(from: DayKey, to: DayKey): DayKey[] {
  const n = diffDays(from, to);
  return n < 0 ? [] : Array.from({ length: n + 1 }, (_, i) => addDays(from, i));
}

/** True when the habit exists and is not archived on `day`. */
export function isActiveOn(h: HabitWithSchedules, day: DayKey): boolean {
  if (day < h.startDate) return false;
  if (h.archivedOn && day >= h.archivedOn) return false;
  return true;
}

/** The schedule version in force on `day` (the latest one effective on or before it). */
export function scheduleOn(h: HabitWithSchedules, day: DayKey): Schedule | null {
  if (!isActiveOn(h, day)) return null;
  let found: Schedule | null = null;
  for (const s of h.schedules) if (s.effectiveFrom <= day && (!found || s.effectiveFrom >= found.effectiveFrom)) found = s;
  // A schedule always exists from the start date; fall back to the oldest one defensively.
  return found ?? h.schedules[0] ?? null;
}

export function matchesDay(s: Schedule, day: DayKey): boolean {
  const f = s.frequency;
  switch (f.type) {
    case 'daily':
      return true;
    case 'weekdays':
      return f.days.includes(weekdayOf(day));
    case 'interval': {
      const n = Math.max(1, Math.floor(f.everyDays));
      const d = diffDays(s.effectiveFrom, day);
      return d >= 0 && d % n === 0;
    }
    case 'timesPerWeek':
    case 'timesPerMonth':
      return false;
  }
}

/** Day-based habits: is `day` one of its scheduled occurrences? Period-based habits always return false. */
export function isScheduledDay(h: HabitWithSchedules, day: DayKey): boolean {
  const s = scheduleOn(h, day);
  return !!s && matchesDay(s, day);
}

export function describeFrequencyKey(f: Frequency): { key: string; params: Record<string, number | string> } {
  switch (f.type) {
    case 'daily':
      return { key: 'frequency.summary.daily', params: {} };
    case 'weekdays':
      return { key: 'frequency.summary.weekdays', params: { count: f.days.length } };
    case 'timesPerWeek':
      return { key: 'frequency.summary.timesPerWeek', params: { count: f.count } };
    case 'timesPerMonth':
      return { key: 'frequency.summary.timesPerMonth', params: { count: f.count } };
    case 'interval':
      return { key: 'frequency.summary.interval', params: { count: f.everyDays } };
  }
}

/** Validates user input; returns an error key or null. */
export function validateFrequency(f: Frequency): string | null {
  switch (f.type) {
    case 'weekdays':
      return f.days.length === 0 ? 'errors.pickDays' : null;
    case 'timesPerWeek':
      return f.count >= 1 && f.count <= 7 && Number.isInteger(f.count) ? null : 'errors.timesPerWeek';
    case 'timesPerMonth':
      return f.count >= 1 && f.count <= 31 && Number.isInteger(f.count) ? null : 'errors.timesPerMonth';
    case 'interval':
      return f.everyDays >= 2 && f.everyDays <= 365 && Number.isInteger(f.everyDays) ? null : 'errors.interval';
    default:
      return null;
  }
}

export function sameFrequency(a: Frequency, b: Frequency): boolean {
  return JSON.stringify(normalizeFrequency(a)) === JSON.stringify(normalizeFrequency(b));
}

export function normalizeFrequency(f: Frequency): Frequency {
  return f.type === 'weekdays' ? { type: 'weekdays', days: [...new Set(f.days)].sort() as Weekday[] } : f;
}
