import { useCallback, useEffect, useRef, useState } from 'react';

import { adsSdk, adsState, adUnits } from '@/services/ads';

/**
 * A rewarded ad the user explicitly chooses to watch (e.g. for an extra trip slot).
 * The reward is granted only on the SDK's EARNED_REWARD event; nothing is granted if
 * the ad is skipped or fails.
 */
export function useRewardedAd(enabled: boolean) {
  const [ready, setReady] = useState(false);
  const adRef = useRef<{ show: () => Promise<void> } | null>(null);
  const rewardCb = useRef<(() => void) | null>(null);

  const load = useCallback(() => {
    const sdk = adsSdk();
    if (!enabled || !sdk || !adUnits.rewarded || !adsState().canRequestAds) return () => undefined;
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

  useEffect(() => load(), [load]);

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
