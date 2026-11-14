import { repos } from '@/database';
import { useSession } from '@/store/session';

import { maybeShowInterstitial, prepareInterstitial } from './ads';
import { recordError } from './analytics';
import { clock } from './clock';

/** Called when a result is displayed: counts the export and preloads (never shows) an ad. */
export async function onResultShown(): Promise<void> {
  try {
    const settings = repos().settings;
    await settings.set('exportsSinceInterstitial', (await settings.get('exportsSinceInterstitial')) + 1);
    prepareInterstitial(useSession.getState().entitlement.isPremium);
  } catch (e) {
    recordError(e, 'result_shown');
  }
}

/**
 * Called when the user closes a finished result with "Done": the only natural break where
 * an interstitial may appear (frequency-capped by @factory/monetization, never for Premium,
 * never while anything is processing).
 */
export async function onResultDone(): Promise<void> {
  try {
    const { entitlement, sessionCount } = useSession.getState();
    const settings = repos().settings;
    const shown = await maybeShowInterstitial({
      isPremium: entitlement.isPremium,
      sessionCount,
      exportsSinceLast: await settings.get('exportsSinceInterstitial'),
      lastShownAt: await settings.get('lastInterstitialAt'),
    });
    if (shown) {
      await settings.set('lastInterstitialAt', clock.now().getTime());
      await settings.set('exportsSinceInterstitial', 0);
    }
  } catch (e) {
    recordError(e, 'result_done');
  }
}
