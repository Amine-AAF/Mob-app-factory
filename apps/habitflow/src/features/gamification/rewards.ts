import { diffDays, levelFromXp, type DayKey, type LevelInfo } from '@factory/app-core';

import type { OverviewStats } from '@/features/statistics/stats';
import type { HabitLog, Snapshot } from '@/types';

/**
 * Discreet, anti-abuse gamification.
 *
 * XP is never accumulated by increments that could be replayed: it is stored in
 * an `xp_ledger` table whose primary key is (habit_id, day). A completion grants
 * XP once; undoing it removes the row, re-doing it adds the same row back, so the
 * total never exceeds one reward per habit and day.
 *
 * Retroactive edits don't farm XP: a completion only earns XP when it is recorded
 * on the day itself or the next day (a forgotten check-in). Older back-fills are
 * kept for history and statistics but earn nothing.
 */
export const XP_PER_COMPLETION = 10;
export const XP_GRACE_DAYS = 1;

export function xpForCompletion(logDay: DayKey, recordedOn: DayKey): number {
  const late = diffDays(logDay, recordedOn);
  return late >= 0 && late <= XP_GRACE_DAYS ? XP_PER_COMPLETION : 0;
}

export function levelInfo(totalXp: number): LevelInfo {
  return levelFromXp(totalXp);
}

export const BADGES = [
  { id: 'first_habit', icon: 'sparkles' },
  { id: 'first_check', icon: 'checkmark-circle' },
  { id: 'perfect_day', icon: 'sunny' },
  { id: 'streak_7', icon: 'flame' },
  { id: 'streak_30', icon: 'bonfire' },
  { id: 'early_bird', icon: 'alarm' },
  { id: 'reading_champion', icon: 'book' },
  { id: 'weekly_achiever', icon: 'ribbon' },
  { id: 'completions_100', icon: 'trophy' },
  { id: 'planner_pro', icon: 'list-circle' },
] as const;
export type BadgeId = (typeof BADGES)[number]['id'];

export interface BadgeContext {
  snapshot: Snapshot;
  overview: OverviewStats;
  tasksCompleted: number;
  /** Local hour of each completion, from `completedAt`. */
  completionHour: (log: HabitLog) => number | null;
}

const EARLY_HOUR = 8;
const EARLY_COUNT = 5;
const READING_COUNT = 20;

/** Badges whose condition is met by the real data. Unlocking is idempotent (primary key). */
export function earnedBadges(ctx: BadgeContext): BadgeId[] {
  const { snapshot, overview } = ctx;
  const done = snapshot.logs.filter((l) => l.status === 'done');
  const earned: BadgeId[] = [];
  if (snapshot.habits.length > 0) earned.push('first_habit');
  if (done.length > 0) earned.push('first_check');
  // Badges are persisted once unlocked, so checking the recent window is enough.
  if (overview.last7.some((d) => d.state === 'complete' && d.expected >= 2)) earned.push('perfect_day');
  const bestStreak = Math.max(0, ...[...overview.perHabit.values()].filter((s) => s.streak.unit === 'day').map((s) => s.streak.best));
  if (bestStreak >= 7) earned.push('streak_7');
  if (bestStreak >= 30) earned.push('streak_30');
  if (done.filter((l) => (ctx.completionHour(l) ?? 24) < EARLY_HOUR).length >= EARLY_COUNT) earned.push('early_bird');
  const readingIds = new Set(snapshot.habits.filter((h) => h.category === 'learning' || h.icon === 'book' || h.templateId?.startsWith('read')).map((h) => h.id));
  if (done.filter((l) => readingIds.has(l.habitId)).length >= READING_COUNT) earned.push('reading_champion');
  if (overview.weeks.slice(0, -1).some((w) => w.rate === 1) || overview.lastWeek === 1) earned.push('weekly_achiever');
  if (done.length >= 100) earned.push('completions_100');
  if (ctx.tasksCompleted >= 20) earned.push('planner_pro');
  return earned;
}

/**
 * Weekly goal: share of the week's scheduled habits completed so far, compared
 * to the user's chosen target (e.g. 80 %).
 */
export function weeklyGoalProgress(thisWeekRate: number | null, targetPercent: number): { percent: number; reached: boolean } {
  const percent = thisWeekRate === null ? 0 : Math.round(thisWeekRate * 100);
  return { percent, reached: thisWeekRate !== null && percent >= targetPercent };
}
