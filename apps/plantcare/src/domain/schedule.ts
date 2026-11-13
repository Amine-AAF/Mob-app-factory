import { addDays, diffDays, fromDayKey, toDayKey } from '@factory/app-core';

import type { CareTask, DayKey, Priority, TaskType } from './types';

/**
 * Pure scheduling rules for recurring care tasks.
 *
 * Recurrence is "every N days after the last completion" (not a fixed calendar grid):
 * plants are watered when they need it, so when a watering happens late the next one
 * moves with it. The interval is always chosen by the user — there is no universal
 * frequency per species (season, pot, substrate and climate all change real needs).
 */

export const MIN_INTERVAL_DAYS = 1;
export const MAX_INTERVAL_DAYS = 365;

export type DueStatus = 'overdue' | 'today' | 'upcoming' | 'none';

export function isValidInterval(n: number | null): boolean {
  return n === null || (Number.isInteger(n) && n >= MIN_INTERVAL_DAYS && n <= MAX_INTERVAL_DAYS);
}

export function dueStatus(task: Pick<CareTask, 'nextDue' | 'active'>, today: DayKey): DueStatus {
  if (!task.active || !task.nextDue) return 'none';
  const d = diffDays(today, task.nextDue);
  if (d < 0) return 'overdue';
  if (d === 0) return 'today';
  return 'upcoming';
}

/** Days until due (negative when overdue), or null when nothing is planned. */
export function daysUntil(task: Pick<CareTask, 'nextDue' | 'active'>, today: DayKey): number | null {
  if (!task.active || !task.nextDue) return null;
  return diffDays(today, task.nextDue);
}

/**
 * Applies a completion. A recurring task is re-planned `interval` days after the day it
 * was actually done; a one-off task becomes inactive. Completing a task "in the future"
 * (doneOn > today) is not allowed by the UI but is handled consistently here.
 */
export function afterCompletion(task: CareTask, doneOn: DayKey): Pick<CareTask, 'nextDue' | 'active'> {
  if (task.intervalDays == null) return { nextDue: null, active: false };
  return { nextDue: addDays(doneOn, task.intervalDays), active: true };
}

/** Skipping keeps the rhythm: the next occurrence is one interval after the skipped due date. */
export function afterSkip(task: CareTask, today: DayKey): Pick<CareTask, 'nextDue' | 'active'> {
  if (task.intervalDays == null) return { nextDue: null, active: false };
  const base = task.nextDue && task.nextDue > today ? task.nextDue : today;
  return { nextDue: addDays(base, task.intervalDays), active: true };
}

/** Postpone by N days from the later of today and the current due date. */
export function afterPostpone(task: CareTask, days: number, today: DayKey): Pick<CareTask, 'nextDue'> {
  if (!Number.isInteger(days) || days < 1 || days > 60) throw new Error(`Invalid postpone: ${days}`);
  const base = task.nextDue && task.nextDue > today ? task.nextDue : today;
  return { nextDue: addDays(base, days) };
}

/** Planned occurrences of a task inside [from, to] (inclusive), for calendar views. */
export function occurrencesBetween(task: Pick<CareTask, 'nextDue' | 'intervalDays' | 'active'>, from: DayKey, to: DayKey, max = 62): DayKey[] {
  if (!task.active || !task.nextDue || to < from) return [];
  const out: DayKey[] = [];
  let day = task.nextDue;
  if (task.intervalDays == null) return day >= from && day <= to ? [day] : [];
  // Overdue tasks are shown on their due day only (not projected backwards).
  if (day < from) {
    const steps = Math.ceil(diffDays(day, from) / task.intervalDays);
    day = addDays(day, steps * task.intervalDays);
  }
  while (day <= to && out.length < max) {
    out.push(day);
    day = addDays(day, task.intervalDays);
  }
  return out;
}

const PRIORITY_RANK: Record<Priority, number> = { high: 0, normal: 1, low: 2 };
const TYPE_RANK: Record<TaskType, number> = {
  watering: 0,
  health_check: 1,
  pest_check: 2,
  fertilizing: 3,
  repotting: 4,
  pruning: 5,
  leaf_cleaning: 6,
  rotation: 7,
  seasonal: 8,
};

/** Overdue first (oldest first), then by priority, then watering before other chores. */
export function compareTasks(a: CareTask, b: CareTask): number {
  const da = a.nextDue ?? '9999-12-31';
  const db = b.nextDue ?? '9999-12-31';
  if (da !== db) return da < db ? -1 : 1;
  if (a.priority !== b.priority) return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
  return TYPE_RANK[a.type] - TYPE_RANK[b.type];
}

export interface DayAgenda {
  overdue: CareTask[];
  today: CareTask[];
  upcoming: CareTask[];
}

export function buildAgenda(tasks: CareTask[], today: DayKey, horizonDays = 7): DayAgenda {
  const limit = addDays(today, horizonDays);
  const agenda: DayAgenda = { overdue: [], today: [], upcoming: [] };
  for (const t of [...tasks].sort(compareTasks)) {
    const s = dueStatus(t, today);
    if (s === 'overdue') agenda.overdue.push(t);
    else if (s === 'today') agenda.today.push(t);
    else if (s === 'upcoming' && t.nextDue! <= limit) agenda.upcoming.push(t);
  }
  return agenda;
}

/** Monday-first month grid (6 rows × 7 days) of day keys; days outside the month are included for layout. */
export function monthGrid(year: number, monthIndex: number): DayKey[] {
  const first = new Date(year, monthIndex, 1);
  const weekday = (first.getDay() + 6) % 7; // Monday = 0
  const start = addDays(toDayKey(first), -weekday);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

export function weekDays(anchor: DayKey): DayKey[] {
  const weekday = (fromDayKey(anchor).getDay() + 6) % 7;
  const start = addDays(anchor, -weekday);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/**
 * Starting suggestions shown as editable chips when creating a watering schedule.
 * They are deliberately presented as a starting point to adjust after checking the soil,
 * never applied automatically.
 */
export const WATERING_SUGGESTIONS: Record<'low' | 'moderate' | 'high', number[]> = {
  low: [10, 14, 21],
  moderate: [5, 7, 10],
  high: [2, 3, 4],
};
