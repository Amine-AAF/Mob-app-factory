/**
 * Free vs Premium. Kept in one place so the paywall copy, the gates and the tests agree.
 * Free stays genuinely useful: full exercise library (except the advanced level), all
 * free templates, workout tracking, rest timer, stopwatch, countdown, basic statistics,
 * body weight + waist tracking, and a full JSON backup (data portability is never paywalled).
 */
export const FREE_LIMITS = {
  /** Programs built from scratch or duplicated (template copies don't count). */
  ownPrograms: 3,
  customExercises: 5,
  /** History & charts look-back for free users. */
  historyDays: 90,
  /** Body measurement kinds available for free. */
  measurementKinds: ['weight', 'waist'] as const,
  activeGoals: 3,
} as const;

export type PremiumFeature =
  | 'programs'
  | 'custom_exercises'
  | 'advanced_library'
  | 'detailed_stats'
  | 'full_history'
  | 'body_advanced'
  | 'photos'
  | 'advanced_timers'
  | 'premium_templates'
  | 'csv_export'
  | 'goals'
  | 'challenges'
  | 'no_ads';
