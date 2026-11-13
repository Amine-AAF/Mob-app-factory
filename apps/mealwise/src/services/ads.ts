import { resolveAdUnits, shouldShowBanner } from '@factory/monetization';
import Constants from 'expo-constants';

import manifest from '../../app.manifest.json';

import { recordError } from './analytics';

/**
 * AdMob orchestration with Google UMP consent.
 * - Development & preview builds always use Google's test ad units.
 * - Production ad unit IDs come from EXPO_PUBLIC_ADMOB_BANNER_ID (protected CI variable).
 * - Ads are requested only after consent information is gathered and only if `canRequestAds`.
 * - Only a banner on browsing screens. Never on a recipe, in cooking mode or
 *   in the grocery list while shopping, and no interstitials at all.
 * - No recipe, list or pantry content is ever passed to the ad SDK (no keywords, no content URL).
 */
const variant = (Constants.expoConfig?.extra?.variant as string | undefined) ?? 'development';

export const adUnits = resolveAdUnits({
  isDev: variant !== 'production',
  production: { banner: process.env.EXPO_PUBLIC_ADMOB_BANNER_ID },
});

/** Screens where a banner is allowed (browse screens only). */
export const AD_SCREENS = ['home', 'recipes', 'planner', 'grocery_history', 'profile'] as const;
export type AdScreen = (typeof AD_SCREENS)[number];

let state: { initialized: boolean; canRequestAds: boolean; privacyOptionsRequired: boolean } = {
  initialized: false,
  canRequestAds: false,
  privacyOptionsRequired: false,
};
const listeners = new Set<() => void>();

export function adsState() {
  return state;
}

export function onAdsStateChange(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function setState(patch: Partial<typeof state>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

type MobileAdsModule = typeof import('react-native-google-mobile-ads');

function sdk(): MobileAdsModule | null {
  if (process.env.NODE_ENV === 'test') return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('react-native-google-mobile-ads') as MobileAdsModule;
  } catch {
    return null; // e.g. Expo Go, where the native module is absent.
  }
}

/** Gathers UMP consent (the form is shown only where legally required), then initialises the SDK. */
export async function initAds(): Promise<void> {
  if (state.initialized) return;
  const ads = sdk();
  if (!ads) return;
  try {
    const consent = await ads.AdsConsent.gatherConsent();
    setState({
      canRequestAds: consent.canRequestAds,
      privacyOptionsRequired: consent.privacyOptionsRequirementStatus === ads.AdsConsentPrivacyOptionsRequirementStatus.REQUIRED,
    });
    if (consent.canRequestAds) {
      await ads.default().initialize();
      setState({ initialized: true });
    }
  } catch (e) {
    recordError(e, 'ads_init');
  }
}

/** Lets users change their consent choice at any time (Settings > Privacy). */
export async function showPrivacyOptions(): Promise<void> {
  const ads = sdk();
  if (!ads) return;
  try {
    await ads.AdsConsent.showPrivacyOptionsForm();
    const info = await ads.AdsConsent.getConsentInfo();
    setState({ canRequestAds: info.canRequestAds });
  } catch (e) {
    recordError(e, 'ads_privacy_options');
  }
}

export function bannerAllowed(input: { isPremium: boolean; sessionCount: number; screen: string }): boolean {
  if (!adUnits.banner) return false;
  return shouldShowBanner({
    isPremium: input.isPremium,
    sessionCount: input.sessionCount,
    screenAllowsAds: (AD_SCREENS as readonly string[]).includes(input.screen),
    consentObtained: state.initialized && state.canRequestAds,
    graceSessions: manifest.monetization.ads?.graceSessions ?? 0,
  });
}

export { sdk as adsSdk };
