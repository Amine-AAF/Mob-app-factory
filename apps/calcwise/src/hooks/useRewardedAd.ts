import { useCallback, useEffect, useRef, useState } from 'react';

import { adsSdk, adsState, adUnits } from '@/services/ads';

/**
 * Loads a rewarded ad that the user explicitly chooses to watch. The reward is
 * granted only on the SDK's EARNED_REWARD event (never on close or error).
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
