import type { HabitCategory } from '@/types';

/** Habit colors, chosen to stay readable as fills under white text in both themes. */
export const HABIT_COLORS = ['#5A4FCF', '#2E86DE', '#0E9F8E', '#3C9D4E', '#D9822B', '#D6455D', '#B8509E', '#7A5C3E', '#4B5563', '#0F766E'] as const;

/** Ionicons names offered in the habit editor. */
export const HABIT_ICONS = [
  'water', 'book', 'barbell', 'walk', 'bicycle', 'leaf', 'moon', 'sunny', 'alarm', 'bed', 'nutrition', 'cafe',
  'heart', 'fitness', 'body', 'flower', 'musical-notes', 'brush', 'code-slash', 'language', 'school', 'bulb',
  'create', 'checkbox', 'timer', 'wallet', 'cash', 'trending-up', 'home', 'people', 'call', 'phone-portrait',
  'tv', 'game-controller', 'restaurant', 'medkit', 'happy', 'star', 'rocket', 'planet',
] as const;

export const CATEGORY_ICONS: Record<HabitCategory, string> = {
  health: 'heart',
  fitness: 'barbell',
  learning: 'school',
  productivity: 'checkbox',
  mindfulness: 'flower',
  growth: 'trending-up',
  finance: 'wallet',
  lifestyle: 'home',
  custom: 'star',
};

/**
 * Free plan limits. The data model has no limit; only the UI gates creation.
 * Free stays genuinely useful: tracking, streaks, calendar, reminders and backup are never gated.
 */
export const FREE_LIMITS = {
  activeHabits: 8,
  /** Months of history in the Insights charts for free users (all data is kept). */
  insightsWeeks: 4,
} as const;

/** Hours during which a rewarded ad unlocks advanced insights. */
export const REWARDED_INSIGHTS_HOURS = 24;

/** Hard cap on scheduled local notifications so HabitFlow never floods the user. */
export const MAX_SCHEDULED_NOTIFICATIONS = 48;

export const DEFAULT_WEEKLY_GOAL_PERCENT = 80;
