import { resolveAdUnits, resolveInterstitialUnit, shouldShowBanner, shouldShowInterstitial } from '@factory/monetization';
import Constants from 'expo-constants';

import manifest from '../../app.manifest.json';
import type { BannerScreen } from '@/features/premium/limits';
import { usePreferences } from '@/store/preferences';
import { useSession } from '@/store/session';

import { recordError } from './analytics';

/**
 * AdMob with Google UMP consent.
 * - Development & preview builds always use Google's public test ad units.
 * - Production unit IDs come from EXPO_PUBLIC_ADMOB_* (protected CI variables); an
 *   unconfigured placement is simply disabled.
 * - Banners only on browse screens (Home, Trips, Places, Budget tab). Never on documents,
 *   itinerary editing, expense entry, exports, forms or the paywall.
 * - Interstitials only at a natural break (back on the trip list after browsing trips),
 *   frequency-capped; rewarded ads only when the user asks for an extra trip slot.
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
  return () => {
    listeners.delete(fn);
  };
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
    return null; // Expo Go or unit tests: no native module.
  }
}

const graceSessions = manifest.monetization.ads?.graceSessions ?? 0;
const consentObtained = () => state.initialized && state.canRequestAds;
const isPremium = () => useSession.getState().entitlement.isPremium;

/** Gathers UMP consent (the form appears only where legally required), then initialises the SDK. Skipped for Premium users. */
export async function initAds(): Promise<void> {
  if (state.initialized || isPremium()) return;
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

/** Lets EEA/UK users change their consent choice at any time (Settings). */
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

export function bannerAllowed(screen: BannerScreen | null): boolean {
  if (!adUnits.banner) return false;
  return shouldShowBanner({
    isPremium: isPremium(),
    consentObtained: consentObtained(),
    sessionCount: usePreferences.getState().sessionCount,
    graceSessions,
    screenAllowsAds: screen !== null,
  });
}

/** A trip was opened and browsed: counts towards the interstitial frequency cap. */
export function countTripVisitForAds(): void {
  const p = usePreferences.getState();
  p.set({ activitiesSinceInterstitial: p.activitiesSinceInterstitial + 1 });
}

export function interstitialAllowed(now: number): boolean {
  if (!adUnits.interstitial) return false;
  const p = usePreferences.getState();
  return shouldShowInterstitial({
    isPremium: isPremium(),
    consentObtained: consentObtained(),
    sessionCount: p.sessionCount,
    graceSessions,
    atNaturalBreak: true,
    activitiesSinceLast: p.activitiesSinceInterstitial,
    msSinceLast: p.lastInterstitialAt ? now - p.lastInterstitialAt : Infinity,
  });
}

/**
 * Shows a preloaded interstitial if the policy allows it (called when the trip list
 * regains focus, i.e. at a natural break). Never blocks or interrupts an operation.
 */
let interstitial: { loaded: boolean; show: () => Promise<void> } | null = null;

export function preloadInterstitial(): void {
  const sdk = adsSdk();
  if (!sdk || !adUnits.interstitial || !consentObtained() || isPremium() || interstitial) return;
  const ad = sdk.InterstitialAd.createForAdRequest(adUnits.interstitial);
  const entry = { loaded: false, show: () => ad.show() };
  ad.addAdEventListener(sdk.AdEventType.LOADED, () => {
    entry.loaded = true;
  });
  ad.addAdEventListener(sdk.AdEventType.CLOSED, () => {
    interstitial = null;
  });
  ad.addAdEventListener(sdk.AdEventType.ERROR, () => {
    interstitial = null;
  });
  interstitial = entry;
  ad.load();
}

export async function maybeShowInterstitial(now: number = Date.now()): Promise<boolean> {
  if (!interstitial?.loaded || !interstitialAllowed(now)) {
    preloadInterstitial();
    return false;
  }
  try {
    await interstitial.show();
    usePreferences.getState().set({ lastInterstitialAt: now, activitiesSinceInterstitial: 0 });
    return true;
  } catch (e) {
    recordError(e, 'interstitial_show');
    return false;
  }
}
