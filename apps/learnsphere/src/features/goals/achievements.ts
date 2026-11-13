import { ACHIEVEMENTS, type AchievementDef, type AchievementMetric } from '@/content/achievements';

export type AchievementStats = Record<AchievementMetric, number>;

export const EMPTY_STATS: AchievementStats = {
  streak: 0,
  totalMinutes: 0,
  focusSessions: 0,
  cardsReviewed: 0,
  cardsCreated: 0,
  quizzesCompleted: 0,
  perfectQuizzes: 0,
  notesCreated: 0,
  subjectsCreated: 0,
  sessionsDone: 0,
  chaptersCompleted: 0,
  goalsMet: 0,
};

/** Achievements newly reached by `stats` that are not yet unlocked. Badges are never revoked. */
export function newlyUnlocked(stats: AchievementStats, unlocked: ReadonlySet<string>, defs: readonly AchievementDef[] = ACHIEVEMENTS): AchievementDef[] {
  return defs.filter((a) => !unlocked.has(a.id) && stats[a.metric] >= a.threshold);
}

export function achievementProgress(def: AchievementDef, stats: AchievementStats): number {
  return Math.min(1, stats[def.metric] / def.threshold);
}
