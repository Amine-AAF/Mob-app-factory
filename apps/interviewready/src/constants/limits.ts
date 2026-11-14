/**
 * Free-tier limits. Premium removes them. Values are product decisions kept in one place
 * so they can be tuned without touching screens.
 */
export const FREE_LIMITS = {
  /** Maximum number of favorite questions on the free plan. */
  favorites: 25,
  /** Questions per quiz session. */
  quizLength: 10,
  /** Mock interviews per local day on the free plan (Phase 4). */
  mockInterviewsPerDay: 1,
  /** Longest learning path on the free plan, in days (30 and 60 days are Premium). */
  pathMaxDays: 14,
} as const;

/** Raised by a service when a Premium-only action is attempted without Premium (defense in depth behind the UI gate). */
export class PremiumRequiredError extends Error {
  constructor(readonly feature: string) {
    super(`premium_required:${feature}`);
    this.name = 'PremiumRequiredError';
  }
}
