import { addDays, diffDays, startOfWeek, type DayKey } from '@factory/app-core';

import { monthEnd, monthStart } from '../stats/stats';

export type GoalPeriod = 'daily' | 'weekly' | 'monthly' | 'challenge';
export type GoalMetric = 'minutes' | 'sessions' | 'chapters' | 'flashcards' | 'quizzes';

export interface Goal {
  id: string;
  title: string;
  period: GoalPeriod;
  metric: GoalMetric;
  target: number;
  subjectId: string | null;
  startDay: DayKey | null;
  endDay: DayKey | null;
  active: boolean;
}

/** Daily activity counters (one row per day and subject), aggregated from the database. */
export interface ActivityRow {
  day: DayKey;
  subjectId: string | null;
  minutes: number;
  sessions: number;
  chapters: number;
  flashcards: number;
  quizzes: number;
}

export function periodRange(goal: Pick<Goal, 'period' | 'startDay' | 'endDay'>, today: DayKey): { from: DayKey; to: DayKey } {
  switch (goal.period) {
    case 'daily':
      return { from: today, to: today };
    case 'weekly': {
      const from = startOfWeek(today);
      return { from, to: addDays(from, 6) };
    }
    case 'monthly':
      return { from: monthStart(today), to: monthEnd(today) };
    case 'challenge':
      return { from: goal.startDay ?? today, to: goal.endDay ?? today };
  }
}

export interface GoalProgress {
  goal: Goal;
  value: number;
  ratio: number;
  met: boolean;
  from: DayKey;
  to: DayKey;
  daysLeft: number;
}

export function goalProgress(goal: Goal, activity: readonly ActivityRow[], today: DayKey): GoalProgress {
  const { from, to } = periodRange(goal, today);
  const value = activity
    .filter((a) => a.day >= from && a.day <= to && (goal.subjectId === null || a.subjectId === goal.subjectId))
    .reduce((s, a) => s + a[goal.metric], 0);
  return {
    goal,
    value,
    ratio: goal.target > 0 ? Math.min(1, value / goal.target) : 0,
    met: value >= goal.target,
    from,
    to,
    daysLeft: Math.max(1, diffDays(today, to) + 1),
  };
}

/** Share of goals reached among the given goals (null when there is none). */
export function goalCompletionRate(progress: readonly GoalProgress[]): number | null {
  if (progress.length === 0) return null;
  return progress.filter((p) => p.met).length / progress.length;
}

/**
 * Number of days on which every active daily goal was met. Used for the "goal getter" badge.
 * Days without activity are simply not counted (never penalised).
 */
export function daysAllDailyGoalsMet(goals: readonly Goal[], activity: readonly ActivityRow[]): number {
  const daily = goals.filter((g) => g.active && g.period === 'daily');
  if (daily.length === 0) return 0;
  const days = new Set(activity.map((a) => a.day));
  let count = 0;
  for (const day of days) if (daily.every((g) => goalProgress(g, activity, day).met)) count++;
  return count;
}
