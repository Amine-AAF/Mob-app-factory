import { useCallback, useEffect, useRef, useState } from 'react';

import { adsSdk, adUnits, rewardedAvailable } from '@/services/ads';

/**
 * Rewarded ad the user explicitly chooses to watch for extra free operations.
 * The reward is granted only on the SDK's EARNED_REWARD event. Never auto-shown.
 */
export function useRewardedAd(isPremium: boolean) {
  const enabled = rewardedAvailable(isPremium);
  const [ready, setReady] = useState(false);
  const adRef = useRef<{ show: () => Promise<void> } | null>(null);
  const rewardCb = useRef<(() => void) | null>(null);

  useEffect(() => {
    const sdk = adsSdk();
    if (!enabled || !sdk || !adUnits.rewarded) return undefined;
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

  return { available: enabled, ready, show };
}
