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
} as const;
