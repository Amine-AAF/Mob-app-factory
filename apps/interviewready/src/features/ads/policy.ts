/**
 * Ad placement policy for InterviewReady. Pure and tested: screens declare which
 * placement they are, and only the allow-listed ones may ever show an ad.
 *
 * Product rules (brief, section "Monétisation"):
 * - No ad during a mock interview, while writing an answer, or inside any exercise.
 * - Banners only on browse screens, clearly separated from content.
 * - Interstitials only at a natural break (leaving a results screen), frequency-capped
 *   by the shared `shouldShowInterstitial` policy.
 * - Rewarded ads only when the user explicitly asks for a reward (an extra mock interview).
 */

export const AD_SCREENS = [
  // Browse screens
  'home',
  'explore',
  'questions',
  'progress',
  // Study and exercise screens: never any ad
  'question',
  'quiz',
  'mock-setup',
  'mock-session',
  'mock-summary',
  'builder',
  'builder-edit',
  'flashcards',
  'path',
  // Flows where an ad would be misleading or intrusive
  'onboarding',
  'paywall',
  'settings',
  'data',
] as const;
export type AdScreen = (typeof AD_SCREENS)[number];

/** Screens where an anchored banner may appear (still subject to consent, Premium and grace sessions). */
export const BANNER_SCREENS: ReadonlySet<AdScreen> = new Set<AdScreen>(['home', 'explore', 'questions', 'progress']);

/** Screens where the user is actively practising: no banner, no interstitial, no rewarded prompt. */
export const EXERCISE_SCREENS: ReadonlySet<AdScreen> = new Set<AdScreen>(['quiz', 'mock-session', 'builder-edit', 'flashcards']);

export function bannerAllowedOn(screen: AdScreen): boolean {
  return BANNER_SCREENS.has(screen);
}

/** Natural breaks at which an interstitial may be considered. */
export const NATURAL_BREAKS = ['quiz-results-exit'] as const;
export type NaturalBreak = (typeof NATURAL_BREAKS)[number];

export function isNaturalBreak(value: string): value is NaturalBreak {
  return (NATURAL_BREAKS as readonly string[]).includes(value);
}

/** Maximum extra mock interviews a free user can unlock with rewarded ads per local day. */
export const MAX_BONUS_MOCKS_PER_DAY = 2;

export type BonusMocks = { day: string; count: number } | null;

export function bonusMocksToday(bonus: BonusMocks, today: string): number {
  return bonus?.day === today ? bonus.count : 0;
}

export function canEarnBonusMock(bonus: BonusMocks, today: string): boolean {
  return bonusMocksToday(bonus, today) < MAX_BONUS_MOCKS_PER_DAY;
}

/** Grants one bonus mock for `today`; a previous day's bonus does not carry over. Capped. */
export function grantBonusMock(bonus: BonusMocks, today: string): { day: string; count: number } {
  return { day: today, count: Math.min(MAX_BONUS_MOCKS_PER_DAY, bonusMocksToday(bonus, today) + 1) };
}
