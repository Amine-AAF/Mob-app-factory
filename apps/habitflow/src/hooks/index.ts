import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, AppState } from 'react-native';

import { adsSdk, adsState, adUnits, markInterstitialShown } from '@/services/ads';
import { clock } from '@/services/clock';
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

/**
 * The current local day. Updates when the app comes back to the foreground and
 * right after midnight, so "Today" rolls over without a restart. A time-zone
 * change simply yields the new local day; existing logs keep their own day key.
 */
export function useToday(): string {
  const today = useSession((s) => s.today);
  useEffect(() => {
    const refresh = () => useSession.getState().setToday(clock.today());
    refresh();
    const sub = AppState.addEventListener('change', (s) => s === 'active' && refresh());
    const now = clock.now();
    const msToMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 2).getTime() - now.getTime();
    const timer = setTimeout(refresh, Math.max(1000, msToMidnight));
    return () => {
      sub.remove();
      clearTimeout(timer);
    };
  }, [today]);
  return today || clock.today();
}

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then(setReduced)
      .catch(() => undefined);
    const sub = AccessibilityInfo.addEventListener?.('reduceMotionChanged', setReduced);
    return () => sub?.remove();
  }, []);
  return reduced;
}

/** Rewarded ad the user explicitly chooses to watch; the reward is granted only on EARNED_REWARD. */
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

/** Interstitial preloaded on the editor and shown only after a new habit is saved (frequency-capped). */
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
