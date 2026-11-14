import { addDays, startOfWeek, type DayKey } from '@factory/app-core';

import { indexLogs, rangeRate, summarizeDay, type DaySummary, type LogIndex } from '@/features/tracking/progress';
import type { HabitWithSchedules, Snapshot } from '@/types';

import { completionRate, occurrences, streakOf, type Occurrence, type StreakInfo } from './streaks';

/**
 * Every number shown in HabitFlow is computed here from the user's real local
 * logs. Nothing is estimated, sampled or invented: when there is not enough
 * data, values are `null` and the UI says so.
 */
export interface HabitStats {
  habitId: string;
  streak: StreakInfo;
  totalCompleted: number;
  completionRate: number | null;
  weeklyRate: number | null;
  monthlyRate: number | null;
  occurrences: Occurrence[];
}

export function habitStats(h: HabitWithSchedules, idx: LogIndex, today: DayKey): HabitStats {
  const logs = idx.get(h.id);
  const occ = occurrences(h, logs, today);
  let totalCompleted = 0;
  if (logs) for (const l of logs.values()) if (l.status === 'done') totalCompleted++;
  return {
    habitId: h.id,
    streak: streakOf(occ),
    totalCompleted,
    completionRate: completionRate(occ),
    weeklyRate: completionRate(occ, addDays(today, -6)),
    monthlyRate: completionRate(occ, addDays(today, -29)),
    occurrences: occ,
  };
}

export interface OverviewStats {
  today: DaySummary;
  dailyRate: number | null;
  weeklyRate: number | null;
  monthlyRate: number | null;
  thisWeek: number | null;
  lastWeek: number | null;
  totalCompletions: number;
  /** Habits with at least 3 measured occurrences, best first. */
  ranking: { habit: HabitWithSchedules; rate: number; stats: HabitStats }[];
  bestCurrentStreak: { habit: HabitWithSchedules; streak: StreakInfo } | null;
  perHabit: Map<string, HabitStats>;
  /** Last 7 days (oldest first) for the weekly chart. */
  last7: DaySummary[];
  /** Completion rate of the last 8 weeks (oldest first, Monday-based). */
  weeks: { start: DayKey; rate: number | null }[];
}

const MIN_OCCURRENCES_FOR_RANKING = 3;

export function overview(snapshot: Snapshot, today: DayKey): OverviewStats {
  const idx = indexLogs(snapshot.logs);
  const perHabit = new Map<string, HabitStats>();
  for (const h of snapshot.habits) perHabit.set(h.id, habitStats(h, idx, today));

  const ranking = snapshot.habits
    .filter((h) => !h.archivedOn)
    .map((habit) => ({ habit, stats: perHabit.get(habit.id)! }))
    .filter((r) => r.stats.completionRate !== null && r.stats.occurrences.filter((o) => o.state === 'hit' || o.state === 'miss').length >= MIN_OCCURRENCES_FOR_RANKING)
    .map((r) => ({ ...r, rate: r.stats.completionRate! }))
    .sort((a, b) => b.rate - a.rate || b.stats.streak.current - a.stats.streak.current);

  let bestCurrentStreak: OverviewStats['bestCurrentStreak'] = null;
  for (const h of snapshot.habits) {
    const s = perHabit.get(h.id)!.streak;
    if (s.current > 0 && (!bestCurrentStreak || s.current > bestCurrentStreak.streak.current)) bestCurrentStreak = { habit: h, streak: s };
  }

  const monday = startOfWeek(today);
  const weeks = Array.from({ length: 8 }, (_, i) => {
    const start = addDays(monday, (i - 7) * 7);
    return { start, rate: rangeRate(snapshot, start, addDays(start, 6), today, idx).rate };
  });

  return {
    today: summarizeDay(snapshot, today, today, idx),
    dailyRate: rangeRate(snapshot, today, today, today, idx).rate,
    weeklyRate: rangeRate(snapshot, addDays(today, -6), today, today, idx).rate,
    monthlyRate: rangeRate(snapshot, addDays(today, -29), today, today, idx).rate,
    thisWeek: rangeRate(snapshot, monday, today, today, idx).rate,
    lastWeek: rangeRate(snapshot, addDays(monday, -7), addDays(monday, -1), today, idx).rate,
    totalCompletions: snapshot.logs.filter((l) => l.status === 'done').length,
    ranking,
    bestCurrentStreak,
    perHabit,
    last7: Array.from({ length: 7 }, (_, i) => summarizeDay(snapshot, addDays(today, i - 6), today, idx)),
    weeks,
  };
}
