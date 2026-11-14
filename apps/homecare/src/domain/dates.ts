import { addDays, diffDays, fromDayKey, toDayKey, type DayKey } from '@factory/app-core';

export { addDays, diffDays, fromDayKey, toDayKey, type DayKey };

const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/;

/** True for a real calendar date written as YYYY-MM-DD (rejects 2026-02-30). */
export function isDayKey(value: unknown): value is DayKey {
  if (typeof value !== 'string' || !DAY_KEY.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number) as [number, number, number];
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/**
 * Adds calendar months, clamping to the last day of the target month:
 * 2026-01-31 + 1 month = 2026-02-28. Repeated additions are computed from the
 * original anchor by callers that need to avoid drift (see recurrence.ts).
 */
export function addMonths(key: DayKey, months: number): DayKey {
  const [y, m, d] = key.split('-').map(Number) as [number, number, number];
  const total = y * 12 + (m - 1) + months;
  const year = Math.floor(total / 12);
  const monthIndex = total - year * 12;
  const day = Math.min(d, daysInMonth(year, monthIndex));
  return toDayKey(new Date(year, monthIndex, day));
}

export function addYears(key: DayKey, years: number): DayKey {
  return addMonths(key, years * 12);
}

/** "2026-11" for grouping by month. */
export function monthKey(key: DayKey): string {
  return key.slice(0, 7);
}

export function startOfMonth(key: DayKey): DayKey {
  return `${key.slice(0, 7)}-01`;
}

export function endOfMonth(key: DayKey): DayKey {
  return addDays(addMonths(startOfMonth(key), 1), -1);
}

/** The `count` month keys ending with the month of `end`, oldest first. */
export function lastNMonths(end: DayKey, count: number): string[] {
  const start = startOfMonth(end);
  return Array.from({ length: count }, (_, i) => monthKey(addMonths(start, i - (count - 1))));
}

/**
 * Local Date for a day key at hour:minute in the device's *current* time zone.
 * Reminders are re-planned on every app start, so a time-zone change is picked up
 * and a "9:00" reminder keeps firing at 9:00 local time.
 */
export function atLocalTime(key: DayKey, hour: number, minute: number): Date {
  const date = fromDayKey(key);
  date.setHours(hour, minute, 0, 0);
  return date;
}
