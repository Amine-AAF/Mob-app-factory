import { addDays, type DayKey } from '@factory/app-core';

import { daysBetween, isActiveOn, isPeriodBased, isScheduledDay, periodBounds, periodKind, scheduleOn } from '@/features/habits/schedule';
import { doneCount, periodTargetOn } from '@/features/tracking/progress';
import type { HabitLog, HabitWithSchedules } from '@/types';

/**
 * One occurrence = one unit a streak is measured in:
 *  - a scheduled day for day-based habits;
 *  - a week or month for "X times per week/month" habits.
 *
 * `hit` keeps the streak going, `miss` breaks it, `neutral` (skipped day,
 * period with no available day) and `pending` (today / current period not yet
 * reached) leave it untouched. Unscheduled days are not occurrences at all,
 * so they can never break a streak.
 */
export type OccurrenceState = 'hit' | 'miss' | 'neutral' | 'pending';

export interface Occurrence {
  start: DayKey;
  end: DayKey;
  unit: 'day' | 'week' | 'month';
  target: number;
  done: number;
  state: OccurrenceState;
}

export function occurrences(h: HabitWithSchedules, logs: Map<DayKey, HabitLog> | undefined, today: DayKey): Occurrence[] {
  const out: Occurrence[] = [];
  const last = h.archivedOn && addDays(h.archivedOn, -1) < today ? addDays(h.archivedOn, -1) : today;
  if (last < h.startDate) return out;

  let day = h.startDate;
  while (day <= last) {
    const s = scheduleOn(h, day);
    if (!s) {
      day = addDays(day, 1);
      continue;
    }
    if (isPeriodBased(s.frequency)) {
      const kind = periodKind(s.frequency)!;
      const { start, end } = periodBounds(kind, day);
      const p = periodTargetOn(h, day, logs);
      const done = doneCount(logs, start, end);
      const closed = end < today && (!h.archivedOn || end < h.archivedOn);
      let state: OccurrenceState;
      if (!p || p.target === 0) state = 'neutral';
      else if (done >= p.target) state = 'hit';
      else if (closed) state = 'miss';
      // An archived habit's last, unfinished period is not held against it.
      else state = end < today ? 'neutral' : 'pending';
      out.push({ start, end, unit: kind, target: p?.target ?? 0, done: Math.min(done, p?.target ?? done), state });
      day = addDays(end, 1);
      continue;
    }
    if (isScheduledDay(h, day)) {
      const log = logs?.get(day);
      let state: OccurrenceState;
      if (log?.status === 'done') state = 'hit';
      else if (log?.status === 'skipped') state = 'neutral';
      else state = day < today ? 'miss' : 'pending';
      out.push({ start: day, end: day, unit: 'day', target: 1, done: state === 'hit' ? 1 : 0, state });
    }
    day = addDays(day, 1);
  }
  return out;
}

export interface StreakInfo {
  current: number;
  best: number;
  unit: 'day' | 'week' | 'month';
}

export function streakOf(occ: readonly Occurrence[], unit: StreakInfo['unit'] = 'day'): StreakInfo {
  let current = 0;
  let best = 0;
  for (const o of occ) {
    if (o.state === 'hit') best = Math.max(best, ++current);
    else if (o.state === 'miss') current = 0;
  }
  return { current, best, unit: occ.at(-1)?.unit ?? unit };
}

/**
 * Completion rate over occurrences ending on or after `from` (all when omitted).
 * Pending occurrences only count once reached, so an unfinished today never lowers the rate.
 */
export function completionRate(occ: readonly Occurrence[], from?: DayKey): number | null {
  let target = 0;
  let done = 0;
  for (const o of occ) {
    if (from && o.end < from) continue;
    if (o.state === 'neutral' || (o.state === 'pending' && o.done < o.target)) continue;
    target += o.target;
    done += Math.min(o.done, o.target);
  }
  return target ? done / target : null;
}

/** Days on which the habit is active between two days — used by calendars. */
export function activeDays(h: HabitWithSchedules, from: DayKey, to: DayKey): DayKey[] {
  return daysBetween(from, to).filter((d) => isActiveOn(h, d));
}
