/**
 * Badges. Unlocked from aggregated, local statistics (see features/goals/achievements.ts).
 * Wording (`achievements.<id>.title|desc`) celebrates progress and never shames missed days.
 */
export type AchievementMetric =
  | 'streak'
  | 'totalMinutes'
  | 'focusSessions'
  | 'cardsReviewed'
  | 'cardsCreated'
  | 'quizzesCompleted'
  | 'perfectQuizzes'
  | 'notesCreated'
  | 'subjectsCreated'
  | 'sessionsDone'
  | 'chaptersCompleted'
  | 'goalsMet';

export interface AchievementDef {
  id: string;
  metric: AchievementMetric;
  threshold: number;
  icon: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first_subject', metric: 'subjectsCreated', threshold: 1, icon: 'folder-open' },
  { id: 'first_note', metric: 'notesCreated', threshold: 1, icon: 'create' },
  { id: 'note_taker', metric: 'notesCreated', threshold: 25, icon: 'document-text' },
  { id: 'first_card', metric: 'cardsCreated', threshold: 1, icon: 'albums' },
  { id: 'deck_builder', metric: 'cardsCreated', threshold: 100, icon: 'copy' },
  { id: 'reviewer_50', metric: 'cardsReviewed', threshold: 50, icon: 'repeat' },
  { id: 'reviewer_500', metric: 'cardsReviewed', threshold: 500, icon: 'infinite' },
  { id: 'first_quiz', metric: 'quizzesCompleted', threshold: 1, icon: 'help-circle' },
  { id: 'quiz_10', metric: 'quizzesCompleted', threshold: 10, icon: 'checkbox' },
  { id: 'perfect_score', metric: 'perfectQuizzes', threshold: 1, icon: 'star' },
  { id: 'first_focus', metric: 'focusSessions', threshold: 1, icon: 'timer' },
  { id: 'focus_25', metric: 'focusSessions', threshold: 25, icon: 'hourglass' },
  { id: 'hours_10', metric: 'totalMinutes', threshold: 600, icon: 'time' },
  { id: 'hours_50', metric: 'totalMinutes', threshold: 3000, icon: 'medal' },
  { id: 'streak_3', metric: 'streak', threshold: 3, icon: 'flame' },
  { id: 'streak_7', metric: 'streak', threshold: 7, icon: 'bonfire' },
  { id: 'streak_30', metric: 'streak', threshold: 30, icon: 'rocket' },
  { id: 'planner_10', metric: 'sessionsDone', threshold: 10, icon: 'calendar' },
  { id: 'chapters_10', metric: 'chaptersCompleted', threshold: 10, icon: 'library' },
  { id: 'goal_getter', metric: 'goalsMet', threshold: 5, icon: 'flag' },
];
