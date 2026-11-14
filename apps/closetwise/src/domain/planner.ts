import { addDays, diffDays, fromDayKey, startOfWeek, toDayKey } from '@factory/app-core';

import type { DayKey, OutfitSchedule } from './types';

/** Monday-first 6x7 grid covering the month of `monthKey` ("YYYY-MM"). */
export function monthGrid(monthKey: string): { day: DayKey; inMonth: boolean }[] {
  const first = `${monthKey}-01`;
  const start = startOfWeek(first);
  return Array.from({ length: 42 }, (_, i) => {
    const day = addDays(start, i);
    return { day, inMonth: day.startsWith(monthKey) };
  });
}

export function monthKeyOf(day: DayKey): string {
  return day.slice(0, 7);
}

export function shiftMonth(monthKey: string, delta: number): string {
  const [y, m] = monthKey.split('-').map(Number) as [number, number];
  const d = new Date(y, m - 1 + delta, 1);
  return toDayKey(d).slice(0, 7);
}

export function weekDays(anyDay: DayKey): DayKey[] {
  const start = startOfWeek(anyDay);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/**
 * Copies a week's plans to another week (same weekday). Existing plans on the
 * target days are kept: duplicates are only added for days that have no plan yet,
 * unless `overwrite` is true.
 */
export function duplicateWeekPlan(
  source: readonly OutfitSchedule[],
  fromWeek: DayKey,
  toWeek: DayKey,
  existingTarget: readonly OutfitSchedule[],
  overwrite = false,
): Omit<OutfitSchedule, 'id' | 'createdAt'>[] {
  const fromStart = startOfWeek(fromWeek);
  const toStart = startOfWeek(toWeek);
  const offset = diffDays(fromStart, toStart);
  if (offset === 0) return [];
  const busy = new Set(existingTarget.map((s) => s.date));
  return source
    .filter((s) => diffDays(fromStart, s.date) >= 0 && diffDays(fromStart, s.date) < 7)
    .map((s) => ({ ...s, date: addDays(s.date, offset) }))
    .filter((s) => overwrite || !busy.has(s.date))
    .map(({ date, outfitId, occasionId, notes, remind }) => ({ date, outfitId, occasionId, notes, remind, wornLogged: false }));
}

export function isPast(day: DayKey, today: DayKey): boolean {
  return diffDays(day, today) > 0;
}

export function dateOf(day: DayKey): Date {
  return fromDayKey(day);
}
