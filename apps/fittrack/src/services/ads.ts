import { resolveAdUnits, resolveInterstitialUnit, shouldShowBanner, shouldShowInterstitial } from '@factory/monetization';
import Constants from 'expo-constants';

import manifest from '../../app.manifest.json';
import { usePreferences } from '@/store/preferences';

import { recordError } from './analytics';

/**
 * AdMob orchestration with Google UMP consent.
 * - Development & preview builds always use Google's test ad units.
 * - Production unit IDs come from EXPO_PUBLIC_ADMOB_* (protected CI variables).
 * - Ads are requested only after consent is gathered and only if `canRequestAds`.
 * - NEVER during an active workout, a timer, or while logging a performance/measurement:
 *   banners live only on browse screens (library, programs list, statistics), and the
 *   single interstitial placement is after adopting a template (capped), never around workouts.
 * - No personal or fitness data is passed to the ad SDK (no custom targeting).
 */
const variant = (Constants.expoConfig?.extra?.variant as string | undefined) ?? 'development';
const isDev = variant !== 'production';

export const adUnits = {
  banner: resolveAdUnits({ isDev, production: { banner: process.env.EXPO_PUBLIC_ADMOB_BANNER_ID } }).banner,
  interstitial: resolveInterstitialUnit({ isDev, production: process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID }),
};

/** Screens where ads may appear. Anything else (workout, timers, logging forms) never shows ads. */
export const AD_SCREENS = ['library', 'programs', 'statistics'] as const;
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

/** Lets EEA/UK users change their consent choice at any time (Settings › Privacy). */
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

export function bannerAllowed(input: { adsDisabled: boolean; sessionCount: number; screen: string; workoutActive: boolean }): boolean {
  if (!adUnits.banner) return false;
  const screenAllowsAds = (AD_SCREENS as readonly string[]).includes(input.screen) && !input.workoutActive;
  return shouldShowBanner({ isPremium: input.adsDisabled, consentObtained: consentObtained(), sessionCount: input.sessionCount, graceSessions, screenAllowsAds });
}

/** Interstitial decision at the one natural break (after adopting a template), never during a workout. */
export function interstitialAllowed(input: { adsDisabled: boolean; now: number; workoutActive: boolean }): boolean {
  if (!adUnits.interstitial || input.workoutActive) return false;
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
