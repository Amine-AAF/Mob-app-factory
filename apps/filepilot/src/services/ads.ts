import { resolveAdUnits, resolveInterstitialUnit, shouldShowBanner, shouldShowInterstitial } from '@factory/monetization';
import Constants from 'expo-constants';

import manifest from '../../app.manifest.json';

import { recordError } from './analytics';
import { clock } from './clock';

/**
 * AdMob orchestration with Google UMP consent, following the factory policy
 * (@factory/monetization). FilePilot-specific placement rules:
 * - Banners only on browsing screens (dashboard, history). Never on a tool screen while
 *   the user selects files, never during processing, never next to Save/Share buttons.
 * - Rewarded ads only when the user explicitly asks for extra free operations.
 * - Interstitials only at a natural boundary (leaving a result with "Done"), frequency-capped.
 * - Premium users never see ads.
 * Development & preview builds always use Google's test ad units.
 */
const variant = (Constants.expoConfig?.extra?.variant as string | undefined) ?? 'development';
const isDev = variant !== 'production';

export const adUnits = {
  ...resolveAdUnits({ isDev, production: { banner: process.env.EXPO_PUBLIC_ADMOB_BANNER_ID, rewarded: process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID } }),
  interstitial: resolveInterstitialUnit({ isDev, production: process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID }),
};

const graceSessions = manifest.monetization.ads?.graceSessions ?? 0;

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
    return null; // native module absent (Jest, Expo Go)
  }
}

/** Gathers UMP consent (form shown only where legally required), then initialises the SDK. */
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

const consentObtained = () => state.initialized && state.canRequestAds;

export function bannerAllowed(input: { isPremium: boolean; sessionCount: number }): boolean {
  if (!adUnits.banner) return false;
  return shouldShowBanner({ ...input, consentObtained: consentObtained(), graceSessions, screenAllowsAds: true });
}

export function rewardedAvailable(isPremium: boolean): boolean {
  return !isPremium && Boolean(adUnits.rewarded) && consentObtained();
}

/* ------------------------------------------------------------- Interstitial */

let interstitial: { loaded: boolean; show: () => Promise<void> } | null = null;

function loadInterstitial() {
  const sdk = adsSdk();
  if (!sdk || !adUnits.interstitial || !consentObtained()) return;
  const ad = sdk.InterstitialAd.createForAdRequest(adUnits.interstitial);
  const holder = { loaded: false, show: () => ad.show() };
  ad.addAdEventListener(sdk.AdEventType.LOADED, () => (holder.loaded = true));
  ad.addAdEventListener(sdk.AdEventType.CLOSED, () => {
    interstitial = null;
    loadInterstitial();
  });
  ad.addAdEventListener(sdk.AdEventType.ERROR, () => (interstitial = null));
  interstitial = holder;
  ad.load();
}

/** Preloads an interstitial while the user is on a result screen (never during processing). */
export function prepareInterstitial(isPremium: boolean): void {
  if (!isPremium && !interstitial) loadInterstitial();
}

/**
 * Called only when the user leaves a result screen with "Done" (natural boundary).
 * Returns true if an ad was shown. Counters persist in app settings.
 */
export async function maybeShowInterstitial(input: { isPremium: boolean; sessionCount: number; operationsSinceLast: number; lastShownAt: number }): Promise<boolean> {
  const allowed = shouldShowInterstitial({
    isPremium: input.isPremium,
    consentObtained: consentObtained(),
    sessionCount: input.sessionCount,
    graceSessions,
    atNaturalBreak: true,
    activitiesSinceLast: input.operationsSinceLast,
    msSinceLast: input.lastShownAt ? clock.now().getTime() - input.lastShownAt : Infinity,
  });
  if (!allowed || !interstitial?.loaded) return false;
  try {
    await interstitial.show();
    return true;
  } catch (e) {
    recordError(e, 'interstitial_show');
    return false;
  }
}
