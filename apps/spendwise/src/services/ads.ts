import { resolveAdUnits, resolveInterstitialUnit, shouldShowBanner, shouldShowInterstitial } from '@factory/monetization';
import Constants from 'expo-constants';

import manifest from '../../app.manifest.json';
import { usePreferences } from '@/store/preferences';

import { recordError } from './analytics';

/**
 * AdMob orchestration with Google UMP consent (adapted from DevSpeak).
 *
 * SpendWise ad rules:
 * - Banners only on screens WITHOUT personal amounts (Settings, Calculators hub).
 * - Never while entering a transaction, viewing amounts, exporting, or during any operation.
 * - Interstitials only at a natural break (leaving a calculator result), frequency-capped.
 * - Rewarded ads are optional (temporary unlock of detailed reports).
 * - Ad requests carry NO financial data (no keywords, no content URLs, no custom targeting).
 * Development & preview builds always use Google's test ad units.
 */
const variant = (Constants.expoConfig?.extra?.variant as string | undefined) ?? 'development';
const isDev = variant !== 'production';

export const adUnits = {
  ...resolveAdUnits({
    isDev,
    production: { banner: process.env.EXPO_PUBLIC_ADMOB_BANNER_ID, rewarded: process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID },
  }),
  interstitial: resolveInterstitialUnit({ isDev, production: process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID }),
};

/** Screens allowed to display a banner: none of them shows personal amounts. */
export const AD_SCREENS = ['settings', 'calculators'] as const;
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
    return null; // e.g. Expo Go / tests, where the native module is absent.
  }
}

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

export function bannerAllowed(input: { isPremium: boolean; screen: AdScreen }): boolean {
  if (!adUnits.banner) return false;
  return shouldShowBanner({
    isPremium: input.isPremium,
    sessionCount: usePreferences.getState().sessionCount,
    screenAllowsAds: (AD_SCREENS as readonly string[]).includes(input.screen),
    consentObtained: state.initialized && state.canRequestAds,
    graceSessions,
  });
}

/**
 * Called when the user LEAVES a calculator result (natural break). Shows at most one
 * interstitial every 4 such breaks and 5 minutes. Never call it from a form or an export.
 */
export async function maybeShowInterstitial(isPremium: boolean): Promise<void> {
  const prefs = usePreferences.getState();
  const actions = prefs.actionsSinceInterstitial + 1;
  prefs.set({ actionsSinceInterstitial: actions });
  const ads = sdk();
  if (!ads || !adUnits.interstitial) return;
  const allowed = shouldShowInterstitial({
    isPremium,
    consentObtained: state.initialized && state.canRequestAds,
    sessionCount: prefs.sessionCount,
    graceSessions,
    atNaturalBreak: true,
    activitiesSinceLast: actions,
    msSinceLast: prefs.lastInterstitialAt ? Date.now() - prefs.lastInterstitialAt : Infinity,
    minActivitiesBetween: 4,
    minIntervalMs: 5 * 60_000,
  });
  if (!allowed) return;
  try {
    const ad = ads.InterstitialAd.createForAdRequest(adUnits.interstitial);
    await new Promise<void>((resolve) => {
      const offLoaded = ad.addAdEventListener(ads.AdEventType.LOADED, () => void ad.show());
      const offClosed = ad.addAdEventListener(ads.AdEventType.CLOSED, () => done());
      const offError = ad.addAdEventListener(ads.AdEventType.ERROR, () => done());
      const done = () => {
        offLoaded();
        offClosed();
        offError();
        resolve();
      };
      ad.load();
    });
    usePreferences.getState().set({ lastInterstitialAt: Date.now(), actionsSinceInterstitial: 0 });
  } catch (e) {
    recordError(e, 'ads_interstitial');
  }
}

export { sdk as adsSdk };
