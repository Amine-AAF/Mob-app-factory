import type { Category, Difficulty } from './types';

/**
 * Achievements are evaluated from statistics computed from the player's real
 * answer history (SQLite). Nothing is ever granted from fabricated numbers.
 */
export interface PlayerStats {
  solvedTotal: number;
  solvedByCategory: Record<Category, number>;
  solvedByDifficulty: Record<Difficulty, number>;
  solvedWithoutHint: number;
  bestStreak: number;
  dailyCompleted: number;
  perfectSessions: number;
  bestTimedCorrect: number;
  level: number;
}

export const emptyStats = (): PlayerStats => ({
  solvedTotal: 0,
  solvedByCategory: { sequence: 0, pattern: 0, deduction: 0, memory: 0 },
  solvedByDifficulty: { easy: 0, medium: 0, hard: 0 },
  solvedWithoutHint: 0,
  bestStreak: 0,
  dailyCompleted: 0,
  perfectSessions: 0,
  bestTimedCorrect: 0,
  level: 1,
});

export interface AchievementDef {
  id: string;
  icon: string;
  target: number;
  progress: (s: PlayerStats) => number;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first_challenge', icon: 'flag', target: 1, progress: (s) => s.solvedTotal },
  { id: 'logic_beginner', icon: 'git-network', target: 10, progress: (s) => s.solvedByCategory.deduction },
  { id: 'number_expert', icon: 'calculator', target: 30, progress: (s) => s.solvedByCategory.sequence },
  { id: 'pattern_master', icon: 'shapes', target: 30, progress: (s) => s.solvedByCategory.pattern },
  { id: 'memory_ace', icon: 'albums', target: 20, progress: (s) => s.solvedByCategory.memory },
  { id: 'well_rounded', icon: 'compass', target: 5, progress: (s) => Math.min(s.solvedByCategory.sequence, s.solvedByCategory.pattern, s.solvedByCategory.deduction, s.solvedByCategory.memory) },
  { id: 'streak_7', icon: 'flame', target: 7, progress: (s) => s.bestStreak },
  { id: 'streak_30', icon: 'bonfire', target: 30, progress: (s) => s.bestStreak },
  { id: 'perfect_session', icon: 'sparkles', target: 1, progress: (s) => s.perfectSessions },
  { id: 'daily_champion', icon: 'calendar', target: 7, progress: (s) => s.dailyCompleted },
  { id: 'speed_thinker', icon: 'stopwatch', target: 10, progress: (s) => s.bestTimedCorrect },
  { id: 'no_help_needed', icon: 'bulb', target: 25, progress: (s) => s.solvedWithoutHint },
  { id: 'hard_mode', icon: 'trophy', target: 10, progress: (s) => s.solvedByDifficulty.hard },
  { id: 'level_10', icon: 'ribbon', target: 10, progress: (s) => s.level },
];

/** Ids whose condition is met by these stats. */
export function earnedAchievements(stats: PlayerStats): string[] {
  return ACHIEVEMENTS.filter((a) => a.progress(stats) >= a.target).map((a) => a.id);
}

/** Achievements newly earned compared with the already-unlocked set. */
export function newlyEarned(stats: PlayerStats, unlocked: ReadonlySet<string>): string[] {
  return earnedAchievements(stats).filter((id) => !unlocked.has(id));
}

export function achievementProgress(def: AchievementDef, stats: PlayerStats): number {
  return Math.min(1, def.progress(stats) / def.target);
}
