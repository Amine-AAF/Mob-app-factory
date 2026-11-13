import { resolveAdUnits, shouldShowBanner } from '@factory/monetization';
import Constants from 'expo-constants';

import manifest from '../../app.manifest.json';

import { recordError } from './analytics';

/**
 * AdMob with Google UMP consent. BookNest only uses small banners, and only on
 * browsing screens (Library, Discover, Wishlist, Statistics). Never while reading
 * (timer, book detail, progress update), writing (notes, journal, reviews) or
 * saving a quote, and never on onboarding or the paywall.
 * - Development & preview builds always use Google's test ad units.
 * - Production unit IDs come from EXPO_PUBLIC_ADMOB_* (protected CI variables).
 * - No ad request before consent information is gathered and `canRequestAds` is true.
 * - Ads never receive any reading content (no custom targeting keywords).
 */
const variant = (Constants.expoConfig?.extra?.variant as string | undefined) ?? 'development';
const isDev = variant !== 'production';

export const adUnits = resolveAdUnits({ isDev, production: { banner: process.env.EXPO_PUBLIC_ADMOB_BANNER_ID, rewarded: undefined } });

/** Screens where a banner may appear. Everything else is ad-free by design. */
export const AD_SCREENS = ['library', 'discover', 'wishlist', 'stats'] as const;
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
    return null; // e.g. Expo Go or tests, where the native module is absent.
  }
}

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
