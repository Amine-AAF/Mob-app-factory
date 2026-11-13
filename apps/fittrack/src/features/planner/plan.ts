import { addDays, fromDayKey, startOfWeek } from '@factory/app-core';

import type { DayKey, RoutineSlot, ScheduleEntry, Weekday } from '@/types';

/**
 * Calendar resolution. A day shows:
 *  1. its explicit schedule entries (planned / done / skipped, and "moved" markers), and
 *  2. the weekly routine slot for its weekday, UNLESS an explicit entry created from
 *     the routine exists for that day (moved, skipped, replaced or done).
 * Routine occurrences are virtual until the user acts on them, so editing the routine
 * changes future weeks without rewriting history.
 */

/** ISO weekday (0 = Monday … 6 = Sunday) of a local day key. */
export function weekdayOf(day: DayKey): Weekday {
  const js = fromDayKey(day).getDay(); // 0 = Sunday
  return ((js + 6) % 7) as Weekday;
}

export interface PlannedItem {
  /** Explicit entry id, or `routine:<day>` for a virtual routine occurrence. */
  key: string;
  day: DayKey;
  kind: 'workout' | 'rest';
  status: ScheduleEntry['status'];
  programId: string | null;
  programDayId: string | null;
  time: string | null;
  fromRoutine: boolean;
  virtual: boolean;
  entry: ScheduleEntry | null;
}

export const routineKey = (day: DayKey) => `routine:${day}`;

export function itemsForDay(day: DayKey, entries: readonly ScheduleEntry[], routine: readonly RoutineSlot[], routineStart: DayKey | null): PlannedItem[] {
  const own = entries.filter((e) => e.day === day);
  const items: PlannedItem[] = own.map((e) => ({
    key: e.id, day, kind: e.kind, status: e.status, programId: e.programId, programDayId: e.programDayId,
    time: e.time, fromRoutine: e.fromRoutine, virtual: false, entry: e,
  }));
  const overridden = own.some((e) => e.fromRoutine);
  const slot = routine.find((r) => r.weekday === weekdayOf(day));
  if (slot && !overridden && (!routineStart || day >= routineStart)) {
    items.push({
      key: routineKey(day), day, kind: slot.kind, status: 'planned', programId: slot.programId, programDayId: slot.programDayId,
      time: slot.time, fromRoutine: true, virtual: true, entry: null,
    });
  }
  // Workouts first, then by time; moved markers last.
  const rank = (i: PlannedItem) => (i.status === 'moved' ? 2 : i.kind === 'rest' ? 1 : 0);
  return items.sort((a, b) => rank(a) - rank(b) || (a.time ?? '99').localeCompare(b.time ?? '99'));
}

/** Items that count as "to do" (visible, planned workouts). */
export const isPlannedWorkout = (i: PlannedItem) => i.kind === 'workout' && i.status === 'planned';

/** Monday-first week of a day. */
export function weekDays(day: DayKey): DayKey[] {
  const start = startOfWeek(day);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/** 6×7 grid (Monday-first) covering the month of `day`; days outside the month are included for layout. */
export function monthGrid(day: DayKey): DayKey[][] {
  const [y, m] = day.split('-').map(Number) as [number, number];
  const first = `${y}-${String(m).padStart(2, '0')}-01`;
  const start = startOfWeek(first);
  return Array.from({ length: 6 }, (_, w) => Array.from({ length: 7 }, (_, d) => addDays(start, w * 7 + d)));
}

export const sameMonth = (a: DayKey, b: DayKey) => a.slice(0, 7) === b.slice(0, 7);

/** Next planned workout from `today` (inclusive) within `horizon` days. */
export function nextPlanned(today: DayKey, entries: readonly ScheduleEntry[], routine: readonly RoutineSlot[], routineStart: DayKey | null, horizon = 14): PlannedItem | null {
  for (let i = 0; i <= horizon; i++) {
    const day = addDays(today, i);
    const found = itemsForDay(day, entries, routine, routineStart).find(isPlannedWorkout);
    if (found) return found;
  }
  return null;
}

/** Days that should hold a reminder (planned workouts) within the horizon. */
export function plannedDays(from: DayKey, entries: readonly ScheduleEntry[], routine: readonly RoutineSlot[], routineStart: DayKey | null, horizon: number): PlannedItem[] {
  const out: PlannedItem[] = [];
  for (let i = 0; i < horizon; i++) {
    const day = addDays(from, i);
    out.push(...itemsForDay(day, entries, routine, routineStart).filter(isPlannedWorkout));
  }
  return out;
}

/** Validation of a "move/postpone" target: never into the past, never onto the same day. */
export function canMove(from: DayKey, to: DayKey, today: DayKey): boolean {
  return to !== from && to >= today;
}
