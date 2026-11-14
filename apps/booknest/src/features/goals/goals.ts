import { addDays, fromDayKey, startOfWeek, toDayKey } from '@factory/app-core';

import type { ReadingGoal } from '@/types';

/**
 * Goal progress is computed from local activity, never stored (except for custom goals,
 * whose progress the user enters). Recurring goals (pages per month, minutes per day,
 * days per week) are evaluated on the current period and can be compared with past ones.
 */
export interface ActivityData {
  /** Finish days of completed reading attempts (re-reads count as books read again). */
  finishedDays: string[];
  /** Forward pages per day (from progress updates). */
  pagesByDay: Map<string, number>;
  /** Reading seconds per day (from sessions). */
  secondsByDay: Map<string, number>;
  /** Days with any reading activity (session or progress). */
  activeDays: Set<string>;
}

export interface Period {
  start: string;
  end: string;
}

export interface GoalProgress {
  goal: ReadingGoal;
  period: Period;
  value: number;
  target: number;
  ratio: number;
  remaining: number;
  reached: boolean;
}

function monthPeriod(day: string): Period {
  const d = fromDayKey(day);
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return { start: toDayKey(start), end: toDayKey(end) };
}

function yearPeriod(day: string): Period {
  const y = day.slice(0, 4);
  return { start: `${y}-01-01`, end: `${y}-12-31` };
}

function weekPeriod(day: string): Period {
  const start = startOfWeek(day);
  return { start, end: addDays(start, 6) };
}

/** The period of `goal` containing `day` (offset = -1 for the previous period, etc.). */
export function goalPeriod(goal: Pick<ReadingGoal, 'type' | 'periodStart' | 'periodEnd'>, day: string, offset = 0): Period {
  switch (goal.type) {
    case 'books_per_year': {
      const y = Number(day.slice(0, 4)) + offset;
      return yearPeriod(`${y}-01-01`);
    }
    case 'pages_per_month': {
      const d = fromDayKey(day);
      return monthPeriod(toDayKey(new Date(d.getFullYear(), d.getMonth() + offset, 1)));
    }
    case 'minutes_per_day': {
      const k = addDays(day, offset);
      return { start: k, end: k };
    }
    case 'days_per_week':
      return weekPeriod(addDays(day, offset * 7));
    case 'custom':
      return { start: goal.periodStart, end: goal.periodEnd ?? '9999-12-31' };
  }
}

const inRange = (day: string, p: Period) => day >= p.start && day <= p.end;

function sumIn(map: Map<string, number>, p: Period): number {
  let total = 0;
  for (const [day, v] of map) if (inRange(day, p)) total += v;
  return total;
}

export function isWeekendChallenge(goal: Pick<ReadingGoal, 'challengeId'>): boolean {
  return goal.challengeId === 'weekend';
}

export function goalValue(goal: ReadingGoal, period: Period, data: ActivityData): number {
  switch (goal.type) {
    case 'books_per_year':
      return data.finishedDays.filter((d) => inRange(d, period)).length;
    case 'pages_per_month':
      return sumIn(data.pagesByDay, period);
    case 'minutes_per_day':
      return Math.floor(sumIn(data.secondsByDay, period) / 60);
    case 'days_per_week': {
      let count = 0;
      for (const d of data.activeDays) {
        if (!inRange(d, period)) continue;
        const wd = fromDayKey(d).getDay();
        if (isWeekendChallenge(goal) && wd !== 0 && wd !== 6) continue;
        count++;
      }
      return count;
    }
    case 'custom':
      return goal.manualProgress;
  }
}

export function computeGoalProgress(goal: ReadingGoal, data: ActivityData, today: string, offset = 0): GoalProgress {
  const period = goalPeriod(goal, today, offset);
  const value = goalValue(goal, period, data);
  const ratio = goal.target > 0 ? Math.min(1, value / goal.target) : 0;
  return { goal, period, value, target: goal.target, ratio, remaining: Math.max(0, goal.target - value), reached: value >= goal.target };
}

/** Values of the last `count` periods (oldest first), for "compare with previous periods". */
export function goalHistory(goal: ReadingGoal, data: ActivityData, today: string, count: number): GoalProgress[] {
  if (goal.type === 'custom') return [computeGoalProgress(goal, data, today)];
  return Array.from({ length: count }, (_, i) => computeGoalProgress(goal, data, today, i - (count - 1)));
}

/**
 * Expected pace for the yearly goal, shown as information only ("on track", "ahead"),
 * never as a reproach. Returns null early in the year when it means nothing.
 */
export function yearlyPace(progress: GoalProgress, today: string): { expected: number; status: 'ahead' | 'on_track' | 'behind' } | null {
  if (progress.goal.type !== 'books_per_year') return null;
  const start = fromDayKey(progress.period.start).getTime();
  const end = fromDayKey(progress.period.end).getTime();
  const now = fromDayKey(today).getTime();
  const elapsed = (now - start) / (end - start);
  if (elapsed < 0.05) return null;
  const expected = Math.round(progress.target * Math.min(1, elapsed));
  const status = progress.value > expected ? 'ahead' : progress.value >= expected - 1 ? 'on_track' : 'behind';
  return { expected, status };
}

export function validateGoalTarget(type: ReadingGoal['type'], target: number): boolean {
  if (!Number.isInteger(target) || target <= 0) return false;
  const max = { books_per_year: 1000, pages_per_month: 100_000, minutes_per_day: 1440, days_per_week: 7, custom: 1_000_000 }[type];
  return target <= max;
}

/** Default target per goal type, used to pre-fill the form. */
export const DEFAULT_TARGETS: Record<ReadingGoal['type'], number> = {
  books_per_year: 12,
  pages_per_month: 500,
  minutes_per_day: 20,
  days_per_week: 4,
  custom: 10,
};

export function buildActivity(input: {
  finishedDays: string[];
  pages: { day: string; amount: number }[];
  sessions: { day: string; durationSec: number }[];
}): ActivityData {
  const pagesByDay = new Map<string, number>();
  const secondsByDay = new Map<string, number>();
  const activeDays = new Set<string>();
  for (const p of input.pages) {
    pagesByDay.set(p.day, (pagesByDay.get(p.day) ?? 0) + p.amount);
    if (p.amount > 0) activeDays.add(p.day);
  }
  for (const s of input.sessions) {
    secondsByDay.set(s.day, (secondsByDay.get(s.day) ?? 0) + s.durationSec);
    activeDays.add(s.day);
  }
  return { finishedDays: input.finishedDays, pagesByDay, secondsByDay, activeDays };
}
