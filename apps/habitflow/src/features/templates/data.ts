import type { Frequency, HabitCategory, Tracking } from '@/types';

/**
 * Original habit templates. Names and descriptions are translated in
 * `src/i18n/locales/<lng>.json` under `templates.items.<id>`.
 * `free: true` templates are available without Premium.
 */
export const TEMPLATE_GROUPS = ['morning', 'health', 'fitness', 'reading', 'learning', 'productivity', 'mindfulness', 'finance', 'lifestyle', 'detox'] as const;
export type TemplateGroup = (typeof TEMPLATE_GROUPS)[number];

export interface HabitTemplate {
  id: string;
  group: TemplateGroup;
  category: HabitCategory;
  icon: string;
  color: string;
  frequency: Frequency;
  tracking: Tracking;
  durationMin: number | null;
  free: boolean;
}

const daily: Frequency = { type: 'daily' };
const check: Tracking = { mode: 'check', target: 1, unit: null };
const minutes = (n: number): Tracking => ({ mode: 'duration', target: n, unit: 'min' });
const qty = (n: number, unit: string): Tracking => ({ mode: 'quantity', target: n, unit });
const weekly = (count: number): Frequency => ({ type: 'timesPerWeek', count });
const workdays: Frequency = { type: 'weekdays', days: [1, 2, 3, 4, 5] };

const t = (id: string, group: TemplateGroup, category: HabitCategory, icon: string, color: string, frequency: Frequency, tracking: Tracking, durationMin: number | null, free = false): HabitTemplate => ({
  id, group, category, icon, color, frequency, tracking, durationMin, free,
});

export const TEMPLATES: readonly HabitTemplate[] = [
  // Morning routine
  t('wake_early', 'morning', 'lifestyle', 'alarm', '#D9822B', daily, check, null, true),
  t('morning_water', 'morning', 'health', 'water', '#2E86DE', daily, check, 1, true),
  t('make_bed', 'morning', 'lifestyle', 'bed', '#7A5C3E', daily, check, 2),
  t('morning_stretch', 'morning', 'fitness', 'body', '#0E9F8E', daily, minutes(10), 10),
  t('plan_day', 'morning', 'productivity', 'create', '#5A4FCF', daily, check, 5),
  // Health
  t('drink_water', 'health', 'health', 'water', '#2E86DE', daily, qty(2, 'L'), null, true),
  t('fruit_veg', 'health', 'health', 'nutrition', '#3C9D4E', daily, qty(5, 'servings'), null),
  t('sleep_before_11', 'health', 'health', 'moon', '#4B5563', daily, check, null, true),
  t('no_sugary_drinks', 'health', 'health', 'cafe', '#D6455D', daily, check, null),
  t('take_vitamins', 'health', 'health', 'medkit', '#B8509E', daily, check, 1),
  // Fitness
  t('walk_steps', 'fitness', 'fitness', 'walk', '#3C9D4E', daily, qty(8000, 'steps'), 60, true),
  t('exercise_30', 'fitness', 'fitness', 'barbell', '#D6455D', weekly(3), minutes(30), 30, true),
  t('stretch_10', 'fitness', 'fitness', 'body', '#0E9F8E', daily, minutes(10), 10),
  t('cycling', 'fitness', 'fitness', 'bicycle', '#2E86DE', weekly(2), minutes(45), 45),
  t('pushups', 'fitness', 'fitness', 'fitness', '#D9822B', workdays, qty(20, 'reps'), 5),
  // Reading
  t('read_20', 'reading', 'learning', 'book', '#7A5C3E', daily, minutes(20), 20, true),
  t('read_pages', 'reading', 'learning', 'book', '#5A4FCF', daily, qty(20, 'pages'), 25),
  t('read_before_bed', 'reading', 'learning', 'moon', '#4B5563', daily, check, 15),
  t('read_article', 'reading', 'growth', 'bulb', '#D9822B', workdays, check, 10),
  // Learning
  t('learn_words', 'learning', 'learning', 'language', '#0E9F8E', daily, qty(10, 'words'), 10, true),
  t('practice_coding', 'learning', 'learning', 'code-slash', '#5A4FCF', workdays, minutes(30), 30, true),
  t('educational_video', 'learning', 'learning', 'school', '#2E86DE', weekly(3), check, 20),
  t('study_hour', 'learning', 'learning', 'school', '#B8509E', workdays, minutes(60), 60),
  t('learn_english', 'learning', 'learning', 'language', '#D6455D', daily, minutes(15), 15),
  // Productivity
  t('top_three', 'productivity', 'productivity', 'checkbox', '#5A4FCF', workdays, check, 5, true),
  t('deep_work', 'productivity', 'productivity', 'timer', '#0F766E', workdays, minutes(90), 90),
  t('inbox_zero', 'productivity', 'productivity', 'mail', '#2E86DE', workdays, check, 15),
  t('weekly_review', 'productivity', 'productivity', 'create', '#D9822B', weekly(1), check, 30),
  // Mindfulness
  t('meditate', 'mindfulness', 'mindfulness', 'flower', '#B8509E', daily, minutes(10), 10, true),
  t('gratitude', 'mindfulness', 'mindfulness', 'heart', '#D6455D', daily, qty(3, 'things'), 5),
  t('journal', 'mindfulness', 'mindfulness', 'create', '#7A5C3E', daily, check, 10),
  t('breathing', 'mindfulness', 'mindfulness', 'leaf', '#0E9F8E', daily, minutes(5), 5),
  // Personal finance
  t('track_expenses', 'finance', 'finance', 'wallet', '#3C9D4E', daily, check, 5, true),
  t('no_spend_day', 'finance', 'finance', 'cash', '#0F766E', weekly(2), check, null),
  t('save_money', 'finance', 'finance', 'trending-up', '#2E86DE', weekly(1), check, 5),
  t('review_budget', 'finance', 'finance', 'stats-chart', '#5A4FCF', { type: 'timesPerMonth', count: 1 }, check, 30),
  // Lifestyle
  t('call_family', 'lifestyle', 'lifestyle', 'call', '#D9822B', weekly(2), check, 15),
  t('cook_home', 'lifestyle', 'lifestyle', 'restaurant', '#3C9D4E', weekly(4), check, 45),
  t('tidy_10', 'lifestyle', 'lifestyle', 'home', '#7A5C3E', daily, minutes(10), 10),
  t('creative_time', 'lifestyle', 'growth', 'brush', '#B8509E', weekly(3), minutes(20), 20),
  // Digital detox
  t('no_social_media', 'detox', 'mindfulness', 'phone-portrait', '#4B5563', daily, check, null, true),
  t('no_phone_morning', 'detox', 'mindfulness', 'sunny', '#D9822B', daily, check, null),
  t('screen_limit', 'detox', 'productivity', 'timer', '#D6455D', daily, check, null),
  t('offline_evening', 'detox', 'lifestyle', 'moon', '#0F766E', { type: 'interval', everyDays: 2 }, check, null),
];

export function templateById(id: string): HabitTemplate | undefined {
  return TEMPLATES.find((tpl) => tpl.id === id);
}

/** Suggestions shown during onboarding for each personal goal. */
export const GOAL_SUGGESTIONS: Record<string, string[]> = {
  health: ['drink_water', 'sleep_before_11', 'morning_water'],
  fitness: ['walk_steps', 'exercise_30', 'morning_stretch'],
  learning: ['read_20', 'learn_words', 'practice_coding'],
  productivity: ['top_three', 'plan_day', 'wake_early'],
  mindfulness: ['meditate', 'no_social_media', 'gratitude'],
  finance: ['track_expenses', 'no_spend_day', 'save_money'],
};
export const ONBOARDING_GOALS = Object.keys(GOAL_SUGGESTIONS);
