import { addDays, diffDays, startOfWeek } from '@factory/app-core';

import type { CardioActivity, ChallengeRun, DayKey, FitnessGoal, GoalKind } from '@/types';
import type { CompletedSession } from '@/features/stats/stats';
import { activeDays, weekStreak } from '@/features/stats/stats';

/**
 * Goals, challenges and badges. Design rules (see docs/product-principles.md):
 * - Progress is shown positively ("3 of 4"), never as failure or guilt.
 * - Rest days are part of training: no daily-streak pressure, challenges count
 *   sessions over a window and always allow rest days.
 * - Copy reminds users to skip training when in pain or injured.
 */

export interface GoalContext {
  today: DayKey;
  sessions: readonly CompletedSession[];
  cardio: readonly CardioActivity[];
  /** Best reps / heaviest weight (kg) per exercise. */
  bestReps: (exerciseId: string) => number | null;
  bestWeight: (exerciseId: string) => number | null;
  weeklyTarget: number;
}

export interface GoalProgress {
  current: number;
  target: number;
  ratio: number;
  reached: boolean;
}

const prog = (current: number, target: number): GoalProgress => ({ current, target, ratio: target > 0 ? Math.min(1, current / target) : 0, reached: current >= target });

export function goalProgress(goal: FitnessGoal, ctx: GoalContext): GoalProgress {
  const weekFrom = startOfWeek(ctx.today);
  const weekTo = addDays(weekFrom, 6);
  const inWeek = (d: DayKey) => d >= weekFrom && d <= weekTo;
  const weekSessions = ctx.sessions.filter((s) => inWeek(s.day));
  const weekCardio = ctx.cardio.filter((c) => inWeek(c.day));
  switch (goal.kind) {
    case 'weekly_sessions':
      return prog(weekSessions.length, goal.target);
    case 'weekly_minutes': {
      const sec = weekSessions.reduce((a, s) => a + (s.durationSec ?? 0), 0) + weekCardio.reduce((a, c) => a + c.durationSec, 0);
      return prog(Math.round(sec / 60), goal.target);
    }
    case 'exercise_reps':
      return prog(goal.exerciseId ? (ctx.bestReps(goal.exerciseId) ?? 0) : 0, goal.target);
    case 'exercise_weight':
      return prog(goal.exerciseId ? (ctx.bestWeight(goal.exerciseId) ?? 0) : 0, goal.target);
    case 'consistency_weeks':
      return prog(weekStreak(activeDays(ctx.sessions, ctx.cardio), ctx.today, ctx.weeklyTarget).current, goal.target);
    case 'weekly_cardio_km':
      return prog(Math.round(weekCardio.reduce((a, c) => a + (c.distanceM ?? 0), 0) / 100) / 10, goal.target);
    case 'weekly_cardio_minutes':
      return prog(Math.round(weekCardio.reduce((a, c) => a + c.durationSec, 0) / 60), goal.target);
  }
}

export const GOAL_NEEDS_EXERCISE: Record<GoalKind, boolean> = {
  weekly_sessions: false,
  weekly_minutes: false,
  exercise_reps: true,
  exercise_weight: true,
  consistency_weeks: false,
  weekly_cardio_km: false,
  weekly_cardio_minutes: false,
};

/* ------------------------------------------------------------------ challenges */

export interface ChallengeDef {
  id: string;
  /** Sessions (workouts or cardio) to complete… */
  target: number;
  /** …within this many days from the start (null = no time limit). */
  windowDays: number | null;
  /** Measure: 'sessions' = workouts + cardio; 'weeks' = weeks hitting the weekly target; 'records' = new personal records. */
  measure: 'sessions' | 'weeks' | 'records';
  premium: boolean;
}

export const CHALLENGES: ChallengeDef[] = [
  // 4 sessions in 7 days leaves 3 rest days: consistent but never daily.
  { id: 'seven_day', target: 4, windowDays: 7, measure: 'sessions', premium: false },
  { id: 'thirty_day', target: 12, windowDays: 30, measure: 'sessions', premium: false },
  { id: 'hundred_sessions', target: 100, windowDays: null, measure: 'sessions', premium: false },
  { id: 'weekly_consistency', target: 4, windowDays: null, measure: 'weeks', premium: false },
  { id: 'personal_record', target: 3, windowDays: 30, measure: 'records', premium: true },
];

export interface ChallengeProgress {
  current: number;
  target: number;
  ratio: number;
  daysLeft: number | null;
  status: 'active' | 'completed' | 'expired';
}

export function challengeProgress(
  run: ChallengeRun,
  def: ChallengeDef,
  ctx: { today: DayKey; sessions: readonly CompletedSession[]; cardio: readonly CardioActivity[]; recordDays: readonly DayKey[]; weeklyTarget: number },
): ChallengeProgress {
  const end = def.windowDays ? addDays(run.startedDay, def.windowDays - 1) : null;
  const within = (d: DayKey) => d >= run.startedDay && (!end || d <= end);
  let current = 0;
  if (def.measure === 'sessions') current = ctx.sessions.filter((s) => within(s.day)).length + ctx.cardio.filter((c) => within(c.day)).length;
  else if (def.measure === 'records') current = ctx.recordDays.filter(within).length;
  else {
    const days = activeDays(
      ctx.sessions.filter((s) => within(s.day)),
      ctx.cardio.filter((c) => within(c.day)),
    );
    current = weekStreak(days, ctx.today, ctx.weeklyTarget).current;
  }
  const done = run.status === 'completed' || current >= def.target;
  const expired = !done && end !== null && ctx.today > end;
  return {
    current: Math.min(current, def.target),
    target: def.target,
    ratio: Math.min(1, current / def.target),
    daysLeft: end ? Math.max(0, diffDays(ctx.today, end) + 1) : null,
    status: done ? 'completed' : expired ? 'expired' : 'active',
  };
}

/* ------------------------------------------------------------------ badges */

export interface BadgeContext {
  sessions: number;
  cardio: number;
  records: number;
  bestWeekStreak: number;
  programsCreated: number;
  measurements: number;
  totalMinutes: number;
  challengesCompleted: number;
}

export interface BadgeDef {
  id: string;
  icon: string;
  unlocked: (c: BadgeContext) => boolean;
}

export const BADGES: BadgeDef[] = [
  { id: 'first_workout', icon: 'barbell', unlocked: (c) => c.sessions >= 1 },
  { id: 'ten_workouts', icon: 'ribbon', unlocked: (c) => c.sessions >= 10 },
  { id: 'fifty_workouts', icon: 'medal', unlocked: (c) => c.sessions >= 50 },
  { id: 'hundred_workouts', icon: 'trophy', unlocked: (c) => c.sessions >= 100 },
  { id: 'first_cardio', icon: 'walk', unlocked: (c) => c.cardio >= 1 },
  { id: 'first_record', icon: 'trending-up', unlocked: (c) => c.records >= 1 },
  { id: 'ten_records', icon: 'flame', unlocked: (c) => c.records >= 10 },
  { id: 'steady_month', icon: 'calendar', unlocked: (c) => c.bestWeekStreak >= 4 },
  { id: 'builder', icon: 'construct', unlocked: (c) => c.programsCreated >= 1 },
  { id: 'tracker', icon: 'body', unlocked: (c) => c.measurements >= 1 },
  { id: 'ten_hours', icon: 'time', unlocked: (c) => c.totalMinutes >= 600 },
  { id: 'challenger', icon: 'flag', unlocked: (c) => c.challengesCompleted >= 1 },
];

export function newlyUnlocked(ctx: BadgeContext, already: ReadonlySet<string>): string[] {
  return BADGES.filter((b) => !already.has(b.id) && b.unlocked(ctx)).map((b) => b.id);
}
