import { addDays, type DayKey } from '@factory/app-core';

import { daysBetween, isActiveOn, isPeriodBased, isScheduledDay, periodBounds, periodKind, scheduleOn } from '@/features/habits/schedule';
import type { HabitLog, HabitWithSchedules, LogStatus, Snapshot, Tracking } from '@/types';

/** Index logs by habit then day for O(1) lookups. */
export type LogIndex = Map<string, Map<DayKey, HabitLog>>;

export function indexLogs(logs: readonly HabitLog[]): LogIndex {
  const idx: LogIndex = new Map();
  for (const l of logs) {
    let m = idx.get(l.habitId);
    if (!m) idx.set(l.habitId, (m = new Map()));
    m.set(l.day, l);
  }
  return idx;
}

/** Status of a value against a target. `check` habits are done at 1. */
export function statusFor(value: number, tracking: Pick<Tracking, 'mode' | 'target'>): Exclude<LogStatus, 'skipped'> | null {
  const target = tracking.mode === 'check' ? 1 : Math.max(tracking.target, 0);
  if (value <= 0) return null;
  return value >= target ? 'done' : 'partial';
}

/** Fraction of the day's target reached, in [0, 1]. Skipped and absent logs count as 0. */
export function logRatio(log: HabitLog | undefined): number {
  if (!log || log.status === 'skipped') return 0;
  if (log.status === 'done') return 1;
  return log.target > 0 ? Math.min(1, log.value / log.target) : 0;
}

/** Number of `done` logs of a habit between two days (inclusive). */
export function doneCount(logs: Map<DayKey, HabitLog> | undefined, from: DayKey, to: DayKey): number {
  if (!logs) return 0;
  let n = 0;
  for (const [day, l] of logs) if (day >= from && day <= to && l.status === 'done') n++;
  return n;
}

export interface PeriodTarget {
  start: DayKey;
  end: DayKey;
  /** Count required in this period (prorated for the first and archived periods). */
  target: number;
}

/**
 * Target of a period-based habit for the period containing `day`.
 * A habit created mid-week only has the remaining days: the target is capped
 * by the number of active, non-skipped days in the period.
 */
export function periodTargetOn(h: HabitWithSchedules, day: DayKey, logs: Map<DayKey, HabitLog> | undefined): PeriodTarget | null {
  const s = scheduleOn(h, day);
  if (!s || !isPeriodBased(s.frequency)) return null;
  const kind = periodKind(s.frequency)!;
  const { start, end } = periodBounds(kind, day);
  const days = daysBetween(start, end).filter((d) => isActiveOn(h, d));
  const first = days[0];
  if (!first) return null;
  // The rules of a period are those in force on its first active day.
  const rules = scheduleOn(h, first);
  if (!rules || !isPeriodBased(rules.frequency)) return null;
  const skipped = days.filter((d) => logs?.get(d)?.status === 'skipped').length;
  return { start, end, target: Math.max(0, Math.min(rules.frequency.count, days.length - skipped)) };
}

export interface DueHabit {
  habit: HabitWithSchedules;
  log: HabitLog | undefined;
  tracking: Tracking;
  /** For period-based habits: progress in the current period. */
  period: { done: number; target: number } | null;
}

/**
 * Habits that belong to `day`'s list:
 *  - day-based habits scheduled that day;
 *  - period-based habits whose period target was not yet met before that day,
 *    or that were logged that day.
 */
export function habitsForDay(snapshot: Snapshot, day: DayKey, idx: LogIndex = indexLogs(snapshot.logs)): DueHabit[] {
  const out: DueHabit[] = [];
  for (const h of snapshot.habits) {
    const s = scheduleOn(h, day);
    if (!s) continue;
    const logs = idx.get(h.id);
    const log = logs?.get(day);
    if (isPeriodBased(s.frequency)) {
      const p = periodTargetOn(h, day, logs);
      if (!p || p.target === 0) continue;
      const before = doneCount(logs, p.start, addDays(day, -1));
      const total = doneCount(logs, p.start, p.end);
      if (before < p.target || log) out.push({ habit: h, log, tracking: s.tracking, period: { done: total, target: p.target } });
    } else if (isScheduledDay(h, day)) {
      out.push({ habit: h, log, tracking: s.tracking, period: null });
    }
  }
  return out.sort((a, b) => a.habit.sortOrder - b.habit.sortOrder || a.habit.createdAt.localeCompare(b.habit.createdAt));
}

export type DayState = 'none' | 'complete' | 'partial' | 'missed' | 'pending';

export interface DaySummary {
  day: DayKey;
  /** Habits expected that day (skipped ones excluded). */
  expected: number;
  completed: number;
  /** Sum of per-habit ratios / expected, in [0, 1]. Quantities give partial credit. */
  ratio: number;
  state: DayState;
}

export function summarizeDay(snapshot: Snapshot, day: DayKey, today: DayKey, idx: LogIndex = indexLogs(snapshot.logs)): DaySummary {
  const due = habitsForDay(snapshot, day, idx).filter((d) => d.log?.status !== 'skipped');
  const expected = due.length;
  const completed = due.filter((d) => d.log?.status === 'done').length;
  const ratio = expected ? due.reduce((acc, d) => acc + logRatio(d.log), 0) / expected : 0;
  let state: DayState;
  if (day > today || expected === 0) state = 'none';
  else if (completed === expected) state = 'complete';
  else if (ratio > 0) state = day === today ? 'pending' : 'partial';
  else state = day === today ? 'pending' : 'missed';
  return { day, expected, completed, ratio, state };
}

/** Aggregate rate over a range of days (only days up to `today`). */
export function rangeRate(snapshot: Snapshot, from: DayKey, to: DayKey, today: DayKey, idx: LogIndex = indexLogs(snapshot.logs)): { expected: number; completed: number; rate: number | null } {
  let expected = 0;
  let completed = 0;
  for (const day of daysBetween(from, to < today ? to : today)) {
    const s = summarizeDay(snapshot, day, today, idx);
    expected += s.expected;
    completed += s.completed;
  }
  return { expected, completed, rate: expected ? completed / expected : null };
}
