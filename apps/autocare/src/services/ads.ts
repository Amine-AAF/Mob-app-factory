import { resolveAdUnits, shouldShowBanner } from '@factory/monetization';
import Constants from 'expo-constants';

import manifest from '../../app.manifest.json';

import { recordError } from './analytics';

/**
 * AdMob (banner only) with Google UMP consent.
 * - Development & preview builds always use Google's test ad units.
 * - Production unit IDs come from EXPO_PUBLIC_ADMOB_BANNER_ID (protected CI variable).
 * - Ads are requested only after consent information is gathered and only if `canRequestAds`.
 * - Banners appear on overview lists only (Home, Vehicles, Expenses list) — NEVER on a form
 *   (fuel fill, expense, maintenance entry…), the paywall, settings or document viewer.
 * - Ad requests carry no vehicle data: no keywords, no content URL, no custom targeting.
 */
const variant = (Constants.expoConfig?.extra?.variant as string | undefined) ?? 'development';
const isDev = variant !== 'production';

export const adUnits = resolveAdUnits({ isDev, production: { banner: process.env.EXPO_PUBLIC_ADMOB_BANNER_ID } });

/** Screens where a banner may appear. Everything else is ad-free by construction. */
export const AD_SCREENS = ['home', 'vehicles', 'expenses_list', 'maintenance_list'] as const;
export type AdScreen = (typeof AD_SCREENS)[number];

let state = { initialized: false, canRequestAds: false, privacyOptionsRequired: false };
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

export function adsSdk(): MobileAdsModule | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('react-native-google-mobile-ads') as MobileAdsModule;
  } catch {
    return null; // Expo Go or tests: the native module is absent.
  }
}

/** Gathers UMP consent (the form shows only where legally required) then initializes the SDK. */
export async function initAds(): Promise<void> {
  if (state.initialized) return;
  const ads = adsSdk();
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

/** Lets EEA/UK users change their consent choice at any time (Settings > Privacy). */
export async function showPrivacyOptions(): Promise<void> {
  const ads = adsSdk();
  if (!ads) return;
  try {
    await ads.AdsConsent.showPrivacyOptionsForm();
    const info = await ads.AdsConsent.getConsentInfo();
    setState({ canRequestAds: info.canRequestAds });
  } catch (e) {
    recordError(e, 'ads_privacy_options');
  }
}

const graceSessions = manifest.monetization.ads?.graceSessions ?? 0;

export function bannerAllowed(input: { isPremium: boolean; sessionCount: number; screen: string }): boolean {
  if (!adUnits.banner) return false;
  return shouldShowBanner({
    isPremium: input.isPremium,
    consentObtained: state.initialized && state.canRequestAds,
    sessionCount: input.sessionCount,
    graceSessions,
    screenAllowsAds: (AD_SCREENS as readonly string[]).includes(input.screen),
  });
}
