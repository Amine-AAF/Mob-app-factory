import { getLocales } from 'expo-localization';
import { openDatabaseAsync } from 'expo-sqlite';
import type { i18n } from 'i18next';

import { DATABASE_NAME, initDatabase, setRepositories, type Repositories } from '@/database';
import { initI18n, setRegion } from '@/i18n';
import { usePreferences } from '@/store/preferences';
import { useSession } from '@/store/session';

import { initAds } from './ads';
import { recordError, setAnalyticsConsent } from './analytics';
import { clock } from './clock';
import { initMonetization } from './monetization';
import { initNotifications, syncNotifications } from './notifications';

function waitForHydration(): Promise<void> {
  if (usePreferences.getState().hydrated) return Promise.resolve();
  return new Promise((resolve) => {
    const unsub = usePreferences.subscribe((s) => {
      if (s.hydrated) {
        unsub();
        resolve();
      }
    });
  });
}

/**
 * App start-up. Everything needed for the first screen is local: no network
 * call blocks the UI.
 */
export async function boot(): Promise<{ i18n: i18n; repos: Repositories }> {
  await waitForHydration();
  const prefs = usePreferences.getState();
  const locales = getLocales();
  setRegion(locales[0]?.languageTag ?? null);
  const i18n = await initI18n(prefs.interfaceLanguage, locales.map((l) => l.languageCode));

  const db = await openDatabaseAsync(DATABASE_NAME);
  const repos = await initDatabase(db, clock);
  setRepositories(repos);
  useSession.getState().markDbReady();

  prefs.set({ sessionCount: prefs.sessionCount + 1 });
  setAnalyticsConsent(prefs.analyticsConsent);
  initNotifications();

  // Background work: must never block or crash start-up.
  initMonetization(db).catch((e) => recordError(e, 'boot_monetization'));
  if (prefs.onboardingCompleted) startPostOnboardingServices(repos, i18n);
  return { i18n, repos };
}

export function startPostOnboardingServices(repos: Repositories, i18n: i18n): void {
  initAds().catch((e) => recordError(e, 'boot_ads'));
  syncNotifications(repos, i18n.t).catch((e) => recordError(e, 'boot_notifications'));
}
