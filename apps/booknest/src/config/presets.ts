import type { IconName } from '@factory/design-system';

import type { GoalType } from '@/types';

/** Suggested collections (names are translated at display time via `collections.presets.<key>`). */
export const COLLECTION_PRESETS: { key: string; icon: IconName }[] = [
  { key: 'favorites', icon: 'heart' },
  { key: 'must_read', icon: 'flame' },
  { key: 'classics', icon: 'library' },
  { key: 'science_fiction', icon: 'planet' },
  { key: 'personal_development', icon: 'leaf' },
  { key: 'business', icon: 'briefcase' },
  { key: 'philosophy', icon: 'bulb' },
  { key: 'history', icon: 'hourglass' },
  { key: 'travel', icon: 'airplane' },
  { key: 'this_year', icon: 'calendar' },
];

export const COLLECTION_ICONS: IconName[] = ['bookmark', 'heart', 'star', 'flame', 'library', 'planet', 'leaf', 'briefcase', 'bulb', 'hourglass', 'airplane', 'calendar', 'moon', 'musical-notes', 'school', 'rose'];

export interface ChallengePreset {
  id: string;
  type: GoalType;
  target: number;
  icon: IconName;
}

/** Reading challenges. Each one is a regular goal the user can edit or delete; nothing imposes a pace. */
export const CHALLENGES: ChallengePreset[] = [
  { id: 'books_12', type: 'books_per_year', target: 12, icon: 'book' },
  { id: 'books_24', type: 'books_per_year', target: 24, icon: 'library' },
  { id: 'books_50', type: 'books_per_year', target: 50, icon: 'trophy' },
  { id: 'daily', type: 'days_per_week', target: 7, icon: 'sunny' },
  { id: 'weekend', type: 'days_per_week', target: 2, icon: 'cafe' },
];

/** Common book genres offered as suggestions (users can type any genre). */
export const GENRE_SUGGESTIONS = [
  'fiction', 'classics', 'science_fiction', 'fantasy', 'mystery', 'thriller', 'romance', 'historical_fiction', 'biography',
  'history', 'philosophy', 'science', 'business', 'personal_development', 'poetry', 'travel', 'comics', 'children', 'essay',
] as const;

/** Common book languages (ISO 639-1) for the book language picker; any code can be typed. */
export const BOOK_LANGUAGES = ['en', 'fr', 'es', 'de', 'it', 'pt', 'ar', 'nl', 'ru', 'ja', 'zh'] as const;

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'MAD', 'CAD', 'CHF', 'MXN', 'ARS', 'COP', 'CLP', 'BRL', 'JPY'] as const;
