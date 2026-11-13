import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AccessibilityInfo } from 'react-native';

import type { Translate } from '@/engine';
import { contentTranslator } from '@/i18n';
import { adsSdk, adsState, adUnits, markInterstitialShown } from '@/services/ads';
import { clock } from '@/services/clock';
import { usePreferences } from '@/store/preferences';
import { useSession } from '@/store/session';

/**
 * Runs an async loader; re-runs when deps or the global dataVersion change.
 * Stale results are ignored; previous data stays visible while reloading.
 */
export function useAsync<T>(loader: () => Promise<T>, deps: unknown[]): { data: T | undefined; loading: boolean; error: Error | null; reload: () => void } {
  const dataVersion = useSession((s) => s.dataVersion);
  const dbReady = useSession((s) => s.dbReady);
  const [nonce, setNonce] = useState(0);
  const key = JSON.stringify([dataVersion, nonce, ...deps]);
  const [result, setResult] = useState<{ key: string; data: T | undefined; error: Error | null }>({ key: '', data: undefined, error: null });

  useEffect(() => {
    if (!dbReady) return;
    let cancelled = false;
    loader()
      .then((data) => !cancelled && setResult({ key, data, error: null }))
      .catch((e: unknown) => !cancelled && setResult((r) => ({ key, data: r.data, error: e instanceof Error ? e : new Error(String(e)) })));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `loader` is re-created each render; deps are explicit
  }, [dbReady, key]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  return { data: result.data, loading: result.key !== key, error: result.error, reload };
}

/** Engine translator for challenge content in the current interface language. */
export function useContentT(): Translate {
  const { i18n } = useTranslation();
  // The i18n instance is stable across language changes, so the language is an explicit input.
  const lng = i18n.language;
  return useMemo(() => contentTranslator(i18n, lng), [i18n, lng]);
}

/** True when animations should be minimized (system setting or in-app override). */
export function useReducedMotion(): boolean {
  const pref = usePreferences((s) => s.motion);
  const [system, setSystem] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then(setSystem)
      .catch(() => undefined);
    const sub = AccessibilityInfo.addEventListener?.('reduceMotionChanged', setSystem);
    return () => sub?.remove();
  }, []);
  return pref === 'reduce' || (pref === 'system' && system);
}

/** Current time in ms, refreshed every `intervalMs` while `active`. */
export function useNow(intervalMs: number, active: boolean): number {
  const [now, setNow] = useState(() => clock.now().getTime());
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(clock.now().getTime()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, active]);
  return now;
}

/** Rewarded ad that the player explicitly chooses to watch; reward only on EARNED_REWARD. */
export function useRewardedAd(enabled: boolean) {
  const [ready, setReady] = useState(false);
  const adRef = useRef<{ show: () => Promise<void> } | null>(null);
  const rewardCb = useRef<(() => void) | null>(null);

  useEffect(() => {
    const sdk = adsSdk();
    if (!enabled || !sdk || !adUnits.rewarded || !adsState().canRequestAds) return;
    const ad = sdk.RewardedAd.createForAdRequest(adUnits.rewarded);
    const subs = [
      ad.addAdEventListener(sdk.RewardedAdEventType.LOADED, () => setReady(true)),
      ad.addAdEventListener(sdk.RewardedAdEventType.EARNED_REWARD, () => rewardCb.current?.()),
      ad.addAdEventListener(sdk.AdEventType.CLOSED, () => {
        setReady(false);
        ad.load();
      }),
      ad.addAdEventListener(sdk.AdEventType.ERROR, () => setReady(false)),
    ];
    adRef.current = ad;
    ad.load();
    return () => subs.forEach((unsub) => unsub());
  }, [enabled]);

  const show = useCallback(
    async (onReward: () => void) => {
      if (!adRef.current || !ready) return false;
      rewardCb.current = onReward;
      await adRef.current.show();
      return true;
    },
    [ready],
  );
  return { ready, show };
}

/** Interstitial preloaded on the results screen and shown only when the player leaves it. */
export function useInterstitial(enabled: boolean) {
  const adRef = useRef<{ show: () => Promise<void> } | null>(null);
  const [ready, setReady] = useState(false);
  const onClosed = useRef<(() => void) | null>(null);

  useEffect(() => {
    const sdk = adsSdk();
    if (!enabled || !sdk || !adUnits.interstitial || !adsState().canRequestAds) return;
    const ad = sdk.InterstitialAd.createForAdRequest(adUnits.interstitial);
    const subs = [
      ad.addAdEventListener(sdk.AdEventType.LOADED, () => setReady(true)),
      ad.addAdEventListener(sdk.AdEventType.CLOSED, () => onClosed.current?.()),
      ad.addAdEventListener(sdk.AdEventType.ERROR, () => setReady(false)),
    ];
    adRef.current = ad;
    ad.load();
    return () => subs.forEach((unsub) => unsub());
  }, [enabled]);

  /** Shows the ad if loaded, then calls `then`; otherwise calls `then` immediately. */
  const showThen = useCallback(
    async (then: () => void) => {
      if (!enabled || !ready || !adRef.current) return then();
      onClosed.current = then;
      markInterstitialShown(clock.now().getTime());
      try {
        await adRef.current.show();
      } catch {
        then();
      }
    },
    [enabled, ready],
  );
  return { showThen };
}
