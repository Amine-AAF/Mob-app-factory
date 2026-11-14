import { resolveAdUnits, resolveInterstitialUnit, shouldShowBanner, shouldShowInterstitial } from '@factory/monetization';
import Constants from 'expo-constants';

import manifest from '../../app.manifest.json';
import { bannerAllowedOn, canEarnBonusMock, grantBonusMock, type AdScreen, type NaturalBreak } from '@/features/ads/policy';
import { usePreferences } from '@/store/preferences';

import { recordError, track } from './analytics';
import { clock } from './clock';

/**
 * AdMob orchestration with Google UMP consent.
 * - Development and preview builds always use Google's test ad units.
 * - Production unit ids come from EXPO_PUBLIC_ADMOB_* (protected CI variables, never committed).
 *   A placement without a valid production id is disabled, never replaced by a test id.
 * - Ads are requested only after consent information is gathered and only if `canRequestAds`.
 * - Where ads may appear is decided by `features/ads/policy.ts`: never during a mock interview,
 *   while writing an answer, or inside a quiz / flashcard session.
 */
const variant = (Constants.expoConfig?.extra?.variant as string | undefined) ?? 'development';
const isDev = variant !== 'production';

export const adUnits = {
  ...resolveAdUnits({ isDev, production: { banner: process.env.EXPO_PUBLIC_ADMOB_BANNER_ID, rewarded: process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID } }),
  interstitial: resolveInterstitialUnit({ isDev, production: process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID }),
};

type AdsState = { initialized: boolean; canRequestAds: boolean; privacyOptionsRequired: boolean };
let state: AdsState = { initialized: false, canRequestAds: false, privacyOptionsRequired: false };
const listeners = new Set<() => void>();

export function adsState(): AdsState {
  return state;
}

export function onAdsStateChange(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function setState(patch: Partial<AdsState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

/** Test hook: resets the in-memory consent state. */
export function resetAdsStateForTests(next?: Partial<AdsState>): void {
  state = { initialized: false, canRequestAds: false, privacyOptionsRequired: false, ...next };
}

type MobileAdsModule = typeof import('react-native-google-mobile-ads');

function sdk(): MobileAdsModule | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('react-native-google-mobile-ads') as MobileAdsModule;
  } catch {
    return null; // Expo Go or tests, where the native module is absent.
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

/** Lets users where it is required (EEA, UK, Switzerland) change their consent at any time. */
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

export function bannerAllowed(input: { isPremium: boolean; sessionCount: number; screen: AdScreen }): boolean {
  if (!adUnits.banner) return false;
  return shouldShowBanner({
    isPremium: input.isPremium,
    consentObtained: consentObtained(),
    sessionCount: input.sessionCount,
    graceSessions,
    screenAllowsAds: bannerAllowedOn(input.screen),
  });
}

/** A rewarded ad can be offered only if the user is free, consent allows it and today's cap is not reached. */
export function rewardedAvailable(isPremium: boolean): boolean {
  if (isPremium || !adUnits.rewarded || !consentObtained()) return false;
  return canEarnBonusMock(usePreferences.getState().bonusMocks, clock.today());
}

/** Called only on the SDK's EARNED_REWARD event, never on a simple click. */
export function grantRewardedMock(): void {
  const p = usePreferences.getState();
  p.set({ bonusMocks: grantBonusMock(p.bonusMocks, clock.today()) });
  track('rewarded_ad_completed', { placement: 'bonus_mock' });
}

/** Interstitial decision at a natural break; the frequency caps come from the shared policy. */
export function interstitialAllowed(input: { isPremium: boolean; at: NaturalBreak; now: number }): boolean {
  if (!adUnits.interstitial) return false;
  const p = usePreferences.getState();
  return shouldShowInterstitial({
    isPremium: input.isPremium,
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

/** Counts a completed activity (quiz, mock interview) towards the interstitial frequency cap. */
export function countActivityForAds(): void {
  const p = usePreferences.getState();
  p.set({ activitiesSinceInterstitial: p.activitiesSinceInterstitial + 1 });
}

export { sdk as adsSdk };
