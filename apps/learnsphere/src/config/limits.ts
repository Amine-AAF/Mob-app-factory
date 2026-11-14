/**
 * Free vs Premium. The free plan is genuinely useful; Premium removes limits and adds depth.
 * Every limit is enforced through these helpers (tested) and explained in the UI before it blocks.
 */
export const FREE_LIMITS = {
  /** Active (non-archived) subjects. Archiving frees a slot. */
  subjects: 3,
  /** Courses per subject. */
  coursesPerSubject: 5,
  /** Total flashcards. */
  flashcards: 300,
  /** Days of history in statistics charts. */
  statsDays: 7,
  /** User-written quiz questions. */
  customQuestions: 50,
} as const;

export const PREMIUM_FEATURES = [
  'unlimitedSubjects',
  'advancedFlashcards',
  'advancedSrs',
  'detailedStats',
  'exportNotes',
  'premiumTemplates',
  'customization',
  'noAds',
] as const;
export type PremiumFeature = (typeof PREMIUM_FEATURES)[number];

export type LimitKey = keyof typeof FREE_LIMITS;

export function canCreate(key: LimitKey, currentCount: number, isPremium: boolean): boolean {
  return isPremium || currentCount < FREE_LIMITS[key];
}

export function remaining(key: LimitKey, currentCount: number, isPremium: boolean): number | null {
  return isPremium ? null : Math.max(0, FREE_LIMITS[key] - currentCount);
}

/** Premium "advanced SRS" settings; free users always get the defaults. */
export interface SrsSettings {
  newCardsPerDay: number;
  maxReviewsPerDay: number;
  intervalModifier: number;
}

export const DEFAULT_SRS: SrsSettings = { newCardsPerDay: 20, maxReviewsPerDay: 200, intervalModifier: 1 };

export function effectiveSrs(settings: SrsSettings, isPremium: boolean): SrsSettings {
  return isPremium ? settings : DEFAULT_SRS;
}
