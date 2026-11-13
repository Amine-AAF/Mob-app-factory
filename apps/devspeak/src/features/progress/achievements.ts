import type { IconName } from '@factory/design-system';

export interface AchievementStats {
  lessonsCompleted: number;
  interviewLessonsCompleted: number;
  perfectQuizzes: number;
  currentStreak: number;
  longestStreak: number;
  wordsLearned: number;
  cardsReviewed: number;
  challengesCompleted: number;
  speakingDone: number;
  totalXp: number;
}

export interface AchievementDefinition {
  id: string;
  icon: IconName;
  /** Returns progress in [0, 1]; 1 = unlocked. */
  progress: (s: AchievementStats) => number;
}

const ratio = (value: number, target: number) => Math.min(1, value / target);

export const ACHIEVEMENTS = [
  { id: 'first_lesson', icon: 'flag-outline', progress: (s) => ratio(s.lessonsCompleted, 1) },
  { id: 'lessons_10', icon: 'library-outline', progress: (s) => ratio(s.lessonsCompleted, 10) },
  { id: 'lessons_30', icon: 'school-outline', progress: (s) => ratio(s.lessonsCompleted, 30) },
  { id: 'perfect_quiz', icon: 'star-outline', progress: (s) => ratio(s.perfectQuizzes, 1) },
  { id: 'perfect_10', icon: 'sparkles-outline', progress: (s) => ratio(s.perfectQuizzes, 10) },
  { id: 'streak_3', icon: 'flame-outline', progress: (s) => ratio(s.longestStreak, 3) },
  { id: 'streak_7', icon: 'flame', progress: (s) => ratio(s.longestStreak, 7) },
  { id: 'streak_30', icon: 'trophy-outline', progress: (s) => ratio(s.longestStreak, 30) },
  { id: 'words_25', icon: 'albums-outline', progress: (s) => ratio(s.wordsLearned, 25) },
  { id: 'cards_50', icon: 'layers-outline', progress: (s) => ratio(s.cardsReviewed, 50) },
  { id: 'challenges_7', icon: 'calendar-outline', progress: (s) => ratio(s.challengesCompleted, 7) },
  { id: 'interview_ready', icon: 'mic-outline', progress: (s) => ratio(s.interviewLessonsCompleted, 5) },
  { id: 'speaker_10', icon: 'chatbubbles-outline', progress: (s) => ratio(s.speakingDone, 10) },
  { id: 'xp_1000', icon: 'rocket-outline', progress: (s) => ratio(s.totalXp, 1000) },
] as const satisfies readonly AchievementDefinition[];

export type AchievementId = (typeof ACHIEVEMENTS)[number]['id'];

export function evaluateAchievements(stats: AchievementStats): AchievementId[] {
  return ACHIEVEMENTS.filter((a) => a.progress(stats) >= 1).map((a) => a.id);
}
