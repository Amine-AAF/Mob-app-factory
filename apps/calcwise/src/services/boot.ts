import { getLocales } from 'expo-localization';
import { openDatabaseAsync } from 'expo-sqlite';
import type { i18n } from 'i18next';

import { DATABASE_NAME, initDatabase, setRepositories, type Repositories } from '@/database';
import { initI18n } from '@/i18n';
import { usePreferences } from '@/store/preferences';
import { useSession } from '@/store/session';

import { initAds } from './ads';
import { recordError, setAnalyticsConsent } from './analytics';
import { initMonetization } from './monetization';

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
 * App start-up. Everything needed for the first screen is local: no network call
 * blocks the UI; store and ads initialization run in the background.
 */
export async function boot(): Promise<{ i18n: i18n; repos: Repositories }> {
  await waitForHydration();
  const prefs = usePreferences.getState();
  const i18n = await initI18n(prefs.interfaceLanguage, getLocales().map((l) => l.languageCode));

  const db = await openDatabaseAsync(DATABASE_NAME);
  const repos = await initDatabase(db);
  setRepositories(repos);
  useSession.getState().markDbReady();

  prefs.set({ sessionCount: prefs.sessionCount + 1 });
  setAnalyticsConsent(prefs.analyticsConsent);

  // Background work: must never block or crash start-up.
  initMonetization(db).catch((e) => recordError(e, 'boot_monetization'));
  if (prefs.onboardingCompleted) startPostOnboardingServices();

  return { i18n, repos };
}

/** Ads consent is requested after onboarding so the first screen is never a consent form. */
export function startPostOnboardingServices(): void {
  initAds().catch((e) => recordError(e, 'boot_ads'));
}
