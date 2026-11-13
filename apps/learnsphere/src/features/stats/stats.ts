import { addDays, computeStreak, diffDays, fromDayKey, lastNDays, startOfWeek, toDayKey, type DayKey } from '@factory/app-core';

/**
 * Pure statistics over local rows. Inputs are plain arrays so they can be tested without SQLite.
 */
export interface LogEntry {
  day: DayKey;
  minutes: number;
  subjectId: string | null;
}

/** Minutes per day for the last `days` days ending at `today` (oldest first, zeros included). */
export function minutesPerDay(log: readonly LogEntry[], today: DayKey, days: number): { day: DayKey; minutes: number }[] {
  const keys = lastNDays(today, days);
  const map = new Map<DayKey, number>(keys.map((k) => [k, 0]));
  for (const e of log) if (map.has(e.day)) map.set(e.day, (map.get(e.day) ?? 0) + e.minutes);
  return keys.map((day) => ({ day, minutes: map.get(day) ?? 0 }));
}

export function minutesBySubject(log: readonly LogEntry[], from?: DayKey, to?: DayKey): { subjectId: string | null; minutes: number }[] {
  const map = new Map<string | null, number>();
  for (const e of log) {
    if ((from && e.day < from) || (to && e.day > to)) continue;
    map.set(e.subjectId, (map.get(e.subjectId) ?? 0) + e.minutes);
  }
  return [...map.entries()].map(([subjectId, minutes]) => ({ subjectId, minutes })).sort((a, b) => b.minutes - a.minutes);
}

export function totalMinutes(log: readonly LogEntry[], from?: DayKey, to?: DayKey): number {
  return log.reduce((s, e) => ((from && e.day < from) || (to && e.day > to) ? s : s + e.minutes), 0);
}

/** A day counts as a learning day when anything was studied or reviewed. */
export function learningStreak(activeDays: Iterable<DayKey>, today: DayKey) {
  return computeStreak(activeDays, today);
}

export function monthStart(day: DayKey): DayKey {
  const d = fromDayKey(day);
  return toDayKey(new Date(d.getFullYear(), d.getMonth(), 1));
}

export function monthEnd(day: DayKey): DayKey {
  const d = fromDayKey(day);
  return toDayKey(new Date(d.getFullYear(), d.getMonth() + 1, 0));
}

export interface PeriodComparison {
  current: number;
  previous: number;
  /** Relative change, null when the previous period is 0. */
  change: number | null;
}

function compare(current: number, previous: number): PeriodComparison {
  return { current, previous, change: previous > 0 ? (current - previous) / previous : null };
}

/** This week (Monday → today) vs the same number of days last week. */
export function weekOverWeek(log: readonly LogEntry[], today: DayKey): PeriodComparison {
  const start = startOfWeek(today);
  const span = diffDays(start, today);
  const prevStart = addDays(start, -7);
  return compare(totalMinutes(log, start, today), totalMinutes(log, prevStart, addDays(prevStart, span)));
}

/** This month (1st → today) vs the same days of the previous month (capped to its length). */
export function monthOverMonth(log: readonly LogEntry[], today: DayKey): PeriodComparison {
  const start = monthStart(today);
  const dayOfMonth = fromDayKey(today).getDate();
  const prevStart = monthStart(addDays(start, -1));
  const prevLength = fromDayKey(monthEnd(prevStart)).getDate();
  const prevEnd = addDays(prevStart, Math.min(dayOfMonth, prevLength) - 1);
  return compare(totalMinutes(log, start, today), totalMinutes(log, prevStart, prevEnd));
}

/** Weekly totals for the last `weeks` weeks (oldest first). */
export function weeklyTotals(log: readonly LogEntry[], today: DayKey, weeks: number): { weekStart: DayKey; minutes: number }[] {
  const current = startOfWeek(today);
  return Array.from({ length: weeks }, (_, i) => {
    const weekStart = addDays(current, (i - (weeks - 1)) * 7);
    return { weekStart, minutes: totalMinutes(log, weekStart, addDays(weekStart, 6)) };
  });
}

export function averagePerActiveDay(log: readonly LogEntry[]): number {
  const days = new Set(log.filter((e) => e.minutes > 0).map((e) => e.day));
  return days.size ? Math.round(totalMinutes(log) / days.size) : 0;
}

export function progressRatio(done: number, total: number): number {
  return total > 0 ? Math.min(1, done / total) : 0;
}
