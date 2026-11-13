import { addDays, fromDayKey, toDayKey, type DayKey } from '@factory/app-core';

export const WEEKLY_ACTIVE_DAYS_GOAL = 5;

/** Builds a Monday-first month grid of day keys for the month containing `today` (null = padding cell). */
export function monthGrid(today: DayKey): (DayKey | null)[] {
  const d = fromDayKey(today);
  const first = toDayKey(new Date(d.getFullYear(), d.getMonth(), 1));
  const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const lead = (fromDayKey(first).getDay() + 6) % 7;
  const cells: (DayKey | null)[] = Array.from({ length: lead }, () => null);
  for (let i = 0; i < daysInMonth; i++) cells.push(addDays(first, i));
  while (cells.length % 7) cells.push(null);
  return cells;
}
