import { addDays, diffDays, type DayKey } from './dates';

/**
 * Streak: number of consecutive active days ending today or yesterday.
 * A streak is still "alive" if the user was active yesterday but not yet today.
 */
export function computeStreak(activeDays: Iterable<DayKey>, today: DayKey): { current: number; longest: number } {
  const days = Array.from(new Set(activeDays)).filter((d) => diffDays(d, today) >= 0).sort();
  if (days.length === 0) return { current: 0, longest: 0 };

  let longest = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = days[i - 1] as DayKey;
    const cur = days[i] as DayKey;
    run = diffDays(prev, cur) === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  }

  const set = new Set(days);
  let cursor: DayKey = set.has(today) ? today : addDays(today, -1);
  let current = 0;
  while (set.has(cursor)) {
    current++;
    cursor = addDays(cursor, -1);
  }
  return { current, longest };
}

/** XP needed to reach `level` from level 1. Gentle quadratic curve. */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  const n = level - 1;
  return 50 * n * (n + 1); // L2=100, L3=300, L4=600, L5=1000 ...
}

export interface LevelInfo {
  level: number;
  xpIntoLevel: number;
  xpForNext: number;
  progress: number; // 0..1
}

export function levelFromXp(xp: number): LevelInfo {
  const safeXp = Math.max(0, Math.floor(xp));
  let level = 1;
  while (xpForLevel(level + 1) <= safeXp) level++;
  const base = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return {
    level,
    xpIntoLevel: safeXp - base,
    xpForNext: next - base,
    progress: (safeXp - base) / (next - base),
  };
}

export const XP_REWARDS = {
  lessonCompleted: 50,
  quizPerfect: 20,
  quizAnswerCorrect: 5,
  flashcardReviewed: 2,
  dailyChallenge: 30,
  speakingExercise: 10,
} as const;

/** Quiz score in percent, rounded. */
export function scorePercent(correct: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((Math.min(correct, total) / total) * 100);
}
