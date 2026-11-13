/**
 * Ad configuration resolution. Pure logic: the SDK binding lives in the app
 * (or in `./admob` for apps that use AdMob).
 */

/** Google's public test ad unit IDs for Android. Safe to commit. */
export const ADMOB_TEST_IDS = {
  appId: 'ca-app-pub-3940256099942544~3347511713',
  banner: 'ca-app-pub-3940256099942544/9214589741',
  rewarded: 'ca-app-pub-3940256099942544/5224354917',
  interstitial: 'ca-app-pub-3940256099942544/1033173712',
} as const;

export interface AdUnitIds {
  banner: string;
  rewarded: string;
}

export interface ResolveAdUnitsInput {
  /** True for development / preview builds. */
  isDev: boolean;
  production?: Partial<AdUnitIds>;
}

/**
 * Development builds ALWAYS use Google test IDs. Production builds use the
 * configured IDs and return null for a placement that is not configured,
 * which disables that placement (never falls back to test IDs in production).
 */
export function resolveAdUnits(input: ResolveAdUnitsInput): { banner: string | null; rewarded: string | null; test: boolean } {
  if (input.isDev) return { banner: ADMOB_TEST_IDS.banner, rewarded: ADMOB_TEST_IDS.rewarded, test: true };
  const valid = (id?: string) => (id && /^ca-app-pub-\d+\/\d+$/.test(id) && !id.startsWith('ca-app-pub-3940256099942544') ? id : null);
  return { banner: valid(input.production?.banner), rewarded: valid(input.production?.rewarded), test: false };
}

export interface AdPolicyInput {
  isPremium: boolean;
  consentObtained: boolean;
  sessionCount: number;
  graceSessions: number;
  /** Placements are never shown on screens where the user is actively learning. */
  screenAllowsAds: boolean;
}

export function shouldShowBanner(input: AdPolicyInput): boolean {
  return !input.isPremium && input.consentObtained && input.screenAllowsAds && input.sessionCount > input.graceSessions;
}

/* ------------------------------------------------------------- Interstitials */

const PROD_UNIT = /^ca-app-pub-\d+\/\d+$/;

/**
 * Interstitial unit resolution, kept separate from `resolveAdUnits` so apps
 * without interstitials are unaffected. Same rules: test ID in development,
 * never a test ID (or a fallback) in production.
 */
export function resolveInterstitialUnit(input: { isDev: boolean; production?: string }): string | null {
  if (input.isDev) return ADMOB_TEST_IDS.interstitial;
  const id = input.production;
  return id && PROD_UNIT.test(id) && !id.startsWith('ca-app-pub-3940256099942544') ? id : null;
}

export interface InterstitialPolicyInput {
  isPremium: boolean;
  /** True when the user bought a "remove ads" product. */
  adsRemoved?: boolean;
  consentObtained: boolean;
  sessionCount: number;
  graceSessions: number;
  /** Must be true only at a natural break (e.g. leaving a results screen), never mid-activity. */
  atNaturalBreak: boolean;
  /** Completed activities since the last interstitial was shown. */
  activitiesSinceLast: number;
  /** Milliseconds since the last interstitial (Infinity if never shown). */
  msSinceLast: number;
  /** Frequency caps. Defaults: at most one every 3 activities and 4 minutes. */
  minActivitiesBetween?: number;
  minIntervalMs?: number;
}

export const INTERSTITIAL_DEFAULTS = { minActivitiesBetween: 3, minIntervalMs: 4 * 60_000 } as const;

/** Conservative, frequency-capped interstitial policy (AdMob "natural break" guidance). */
export function shouldShowInterstitial(input: InterstitialPolicyInput): boolean {
  const minActivities = input.minActivitiesBetween ?? INTERSTITIAL_DEFAULTS.minActivitiesBetween;
  const minInterval = input.minIntervalMs ?? INTERSTITIAL_DEFAULTS.minIntervalMs;
  return (
    !input.isPremium &&
    !input.adsRemoved &&
    input.consentObtained &&
    input.atNaturalBreak &&
    input.sessionCount > input.graceSessions &&
    input.activitiesSinceLast >= minActivities &&
    input.msSinceLast >= minInterval
  );
}
