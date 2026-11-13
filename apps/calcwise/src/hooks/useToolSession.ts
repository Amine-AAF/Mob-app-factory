import { useCallback, useEffect, useRef } from 'react';

import { LIMITS, type ToolId } from '@/constants/tools';
import { reposOrNull } from '@/database';
import { adsSdk, adsState, adUnits, countActivityForAds, interstitialAllowed, markInterstitialShown } from '@/services/ads';
import { recordError, track } from '@/services/analytics';
import type { NewEntry } from '@/services/CalculationHistory';
import { clock } from '@/services/clock';
import { isPremiumNow, useSession } from '@/store/session';

/** Saves an entry to the local history, honouring the free-tier limit. */
export async function saveToHistory(entry: NewEntry): Promise<void> {
  const r = reposOrNull();
  if (!r) return;
  try {
    await r.history.add(entry, { limit: isPremiumNow() ? null : LIMITS.freeHistory });
    useSession.getState().bump();
  } catch (e) {
    recordError(e, 'history_add');
  }
}

/* ----------------------------------------------- Interstitial (singleton) */

let interstitial: { show: () => Promise<void>; loaded: boolean } | null = null;

function preloadInterstitial(): void {
  const sdk = adsSdk();
  if (interstitial || !sdk || !adUnits.interstitial || !adsState().canRequestAds || isPremiumNow()) return;
  try {
    const ad = sdk.InterstitialAd.createForAdRequest(adUnits.interstitial);
    const holder = { show: () => ad.show(), loaded: false };
    ad.addAdEventListener(sdk.AdEventType.LOADED, () => (holder.loaded = true));
    ad.addAdEventListener(sdk.AdEventType.CLOSED, () => (interstitial = null));
    ad.addAdEventListener(sdk.AdEventType.ERROR, () => (interstitial = null));
    interstitial = holder;
    ad.load();
  } catch (e) {
    recordError(e, 'interstitial_load');
  }
}

function showInterstitialAtBreak(): void {
  const now = clock.now().getTime();
  if (!interstitial?.loaded || !interstitialAllowed({ isPremium: isPremiumNow(), now })) return;
  markInterstitialShown(now);
  interstitial.show().catch((e) => recordError(e, 'interstitial_show'));
}

/**
 * Lifecycle of a tool screen:
 * - tracks `tool_used` (tool id only) on open;
 * - `setResult(entry)` keeps the latest valid result while the user types (nothing is saved per keystroke);
 * - on leaving the screen, the latest result is saved to the history, `calculation_completed`
 *   is tracked and, at that natural break only, a frequency-capped interstitial may be shown.
 */
export function useToolSession(tool: ToolId) {
  const latest = useRef<NewEntry | null>(null);

  useEffect(() => {
    track('tool_used', { tool });
    preloadInterstitial();
    return () => {
      const entry = latest.current;
      if (!entry) return;
      saveToHistory(entry).catch(() => undefined);
      track('calculation_completed', { tool });
      countActivityForAds();
      showInterstitialAtBreak();
    };
  }, [tool]);

  const setResult = useCallback((entry: Omit<NewEntry, 'tool'> | null) => {
    latest.current = entry ? { ...entry, tool } : null;
  }, [tool]);

  return { setResult };
}
