import { resolveAdUnits, resolveInterstitialUnit, shouldShowBanner, shouldShowInterstitial } from '@factory/monetization';
import Constants from 'expo-constants';

import manifest from '../../app.manifest.json';
import { usePreferences } from '@/store/preferences';

import { recordError } from './analytics';

/**
 * AdMob orchestration with Google UMP consent.
 * - Development & preview builds always use Google's test ad units.
 * - Production unit IDs come from EXPO_PUBLIC_ADMOB_* (protected CI variables).
 * - Ads are requested only after consent information is gathered and only if `canRequestAds`.
 * - Never during an active puzzle: banners live on browse screens only, interstitials
 *   only when leaving a results screen, rewarded ads only when the player asks for a hint.
 */
const variant = (Constants.expoConfig?.extra?.variant as string | undefined) ?? 'development';
const isDev = variant !== 'production';

export const adUnits = {
  ...resolveAdUnits({ isDev, production: { banner: process.env.EXPO_PUBLIC_ADMOB_BANNER_ID, rewarded: process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID } }),
  interstitial: resolveInterstitialUnit({ isDev, production: process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID }),
};

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

function sdk(): MobileAdsModule | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('react-native-google-mobile-ads') as MobileAdsModule;
  } catch {
    return null; // e.g. Expo Go or tests, where the native module is absent.
  }
}

/** Gathers UMP consent (the form shows only where legally required) then initializes the SDK. */
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

/** Lets EEA/UK users change their consent choice at any time (Settings > Privacy). */
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

const graceSessions = manifest.monetization.ads?.graceSessions ?? 0;
const consentObtained = () => state.initialized && state.canRequestAds;

export function bannerAllowed(input: { adsDisabled: boolean; sessionCount: number }): boolean {
  if (!adUnits.banner) return false;
  return shouldShowBanner({ isPremium: input.adsDisabled, consentObtained: consentObtained(), sessionCount: input.sessionCount, graceSessions, screenAllowsAds: true });
}

export function rewardedAvailable(adsDisabled: boolean): boolean {
  return !adsDisabled && !!adUnits.rewarded && consentObtained();
}

/** Interstitial decision at a natural break (leaving the results screen). */
export function interstitialAllowed(input: { adsDisabled: boolean; now: number }): boolean {
  if (!adUnits.interstitial) return false;
  const p = usePreferences.getState();
  return shouldShowInterstitial({
    isPremium: input.adsDisabled,
    consentObtained: consentObtained(),
    sessionCount: p.sessionCount,
    graceSessions,
    atNaturalBreak: true,
    activitiesSinceLast: p.activitiesSinceInterstitial,
    msSinceLast: p.lastInterstitialAt ? input.now - p.lastInterstitialAt : Infinity,
  });
}

export function markInterstitialShown(now: number): void {
  usePreferences.getState().set({ lastInterstitialAt: now, activitiesSinceInterstitial: 0 });
}

export function countActivityForAds(): void {
  const p = usePreferences.getState();
  p.set({ activitiesSinceInterstitial: p.activitiesSinceInterstitial + 1 });
}

export { sdk as adsSdk };
