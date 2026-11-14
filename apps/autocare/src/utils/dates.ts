import { fromDayKey, toDayKey } from '@factory/app-core';

import type { DayKey } from '@/types';

export { addDays, diffDays, fromDayKey, toDayKey } from '@factory/app-core';

/** Strict "YYYY-MM-DD" validation (rejects 2026-02-30). */
export function isValidDay(value: string | null | undefined): value is DayKey {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number) as [number, number, number];
  if (y < 1900 || y > 2200 || m < 1 || m > 12 || d < 1) return false;
  return d <= new Date(y, m, 0).getDate();
}

/** Adds calendar months, clamping to the end of the month (Jan 31 + 1 month = Feb 28/29). */
export function addMonths(day: DayKey, months: number): DayKey {
  const date = fromDayKey(day);
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(date.getDate(), lastDay));
  return toDayKey(target);
}

export function monthKey(day: DayKey): string {
  return day.slice(0, 7);
}

export function yearOf(day: DayKey): number {
  return Number(day.slice(0, 4));
}

/** The `count` month keys ending with the month of `end`, oldest first. */
export function lastNMonths(end: DayKey, count: number): string[] {
  return Array.from({ length: count }, (_, i) => monthKey(addMonths(`${monthKey(end)}-01`, i - (count - 1))));
}

export function startOfMonth(day: DayKey): DayKey {
  return `${monthKey(day)}-01`;
}

export function endOfMonth(day: DayKey): DayKey {
  const d = fromDayKey(startOfMonth(day));
  return toDayKey(new Date(d.getFullYear(), d.getMonth() + 1, 0));
}
