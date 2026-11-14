import { addDays, diffDays } from '@factory/app-core';

import type { Slot } from '@/domain/catalog';
import type { DayKey, OutfitItemRef, OutfitSchedule } from '@/domain/types';

/** Free users see this many days of wear history; Premium sees everything. */
export const FREE_HISTORY_DAYS = 14;

export function groupByDate(schedules: readonly OutfitSchedule[]): Map<DayKey, OutfitSchedule[]> {
  const map = new Map<DayKey, OutfitSchedule[]>();
  for (const s of schedules) {
    const list = map.get(s.date) ?? [];
    list.push(s);
    map.set(s.date, list);
  }
  return map;
}

/** "Mark as worn" only makes sense for today or past days. */
export function canMarkWorn(day: DayKey, today: DayKey): boolean {
  return diffDays(day, today) >= 0;
}

export const isValidDayKey = (s: unknown): s is DayKey => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(new Date(`${s}T00:00:00`).getTime());

/** Days kept in the free history window (today and the 13 previous days). */
export function withinFreeHistory(day: DayKey, today: DayKey): boolean {
  const d = diffDays(day, today);
  return d >= 0 && d < FREE_HISTORY_DAYS;
}

export function historyCutoff(today: DayKey): DayKey {
  return addDays(today, -(FREE_HISTORY_DAYS - 1));
}

const COVER_ORDER: Slot[] = ['onepiece', 'top', 'outerwear', 'bottom', 'shoes', 'bag', 'accessory', 'extra'];

/** The most representative piece of an outfit, used for tiny calendar thumbnails. */
export function coverItemId(refs: readonly OutfitItemRef[], exists: (id: string) => boolean): string | null {
  for (const slot of COVER_ORDER) {
    const r = refs.find((x) => x.slot === slot && exists(x.itemId));
    if (r) return r.itemId;
  }
  return null;
}
