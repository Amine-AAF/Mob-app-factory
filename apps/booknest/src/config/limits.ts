/**
 * Free vs Premium. Limits are generous enough to be useful for free and are
 * enforced in the service layer (never by hiding data the user already has:
 * going over a limit after a lapsed subscription keeps everything readable and
 * editable, only *adding* more is blocked).
 */
export const FREE_LIMITS = {
  books: 100,
  /** User-created collections (the suggested presets are always free). */
  customCollections: 3,
  quotes: 100,
  journalEntries: 50,
  activeGoals: 3,
  /** Session history and calendar depth shown for free, in days. Data is never deleted. */
  historyDays: 90,
} as const;

export type PremiumFeature =
  | 'unlimited_books'
  | 'unlimited_collections'
  | 'unlimited_quotes'
  | 'unlimited_journal'
  | 'unlimited_goals'
  | 'custom_goals'
  | 'advanced_stats'
  | 'full_history'
  | 'advanced_journal'
  | 'csv_export'
  | 'pdf_export'
  | 'themes'
  | 'advanced_backup'
  | 'no_ads';

export const PREMIUM_FEATURES: readonly PremiumFeature[] = [
  'unlimited_books',
  'unlimited_collections',
  'advanced_stats',
  'unlimited_goals',
  'full_history',
  'advanced_journal',
  'csv_export',
  'pdf_export',
  'themes',
  'advanced_backup',
  'no_ads',
];

export type LimitKind = 'books' | 'customCollections' | 'quotes' | 'journalEntries' | 'activeGoals';

export class LimitReachedError extends Error {
  constructor(public readonly kind: LimitKind, public readonly limit: number) {
    super(`Free limit reached: ${kind} (${limit})`);
    this.name = 'LimitReachedError';
  }
}

export function assertWithinLimit(kind: LimitKind, currentCount: number, isPremium: boolean, adding = 1): void {
  if (isPremium) return;
  const limit = FREE_LIMITS[kind];
  if (currentCount + adding > limit) throw new LimitReachedError(kind, limit);
}

/** How many more items fit for a free user (Infinity for Premium). */
export function remainingQuota(kind: LimitKind, currentCount: number, isPremium: boolean): number {
  return isPremium ? Infinity : Math.max(0, FREE_LIMITS[kind] - currentCount);
}
