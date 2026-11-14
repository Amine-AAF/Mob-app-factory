import { useCallback, useEffect, useRef, useState } from 'react';

import { adsSdk, adsState, adUnits, markInterstitialShown, onAdsStateChange } from '@/services/ads';
import { clock } from '@/services/clock';

/** Re-renders the caller when the consent / SDK state changes. */
export function useAdsStateVersion(): number {
  const [version, setVersion] = useState(0);
  useEffect(() => onAdsStateChange(() => setVersion((n) => n + 1)), []);
  return version;
}

/**
 * Rewarded ad that the user explicitly chooses to watch. The reward is granted only
 * on the SDK's EARNED_REWARD event, never on the click itself.
 */
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
    return () => {
      subs.forEach((unsub) => unsub());
      adRef.current = null;
    };
  }, [enabled]);

  const show = useCallback(
    async (onReward: () => void) => {
      if (!enabled || !adRef.current || !ready) return false;
      rewardCb.current = onReward;
      await adRef.current.show();
      return true;
    },
    [enabled, ready],
  );
  return { ready: enabled && ready, show };
}

/**
 * Interstitial preloaded on a results screen and shown only when the user leaves it
 * (a natural break). If it is not loaded, navigation continues immediately.
 */
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
    return () => {
      subs.forEach((unsub) => unsub());
      adRef.current = null;
    };
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
