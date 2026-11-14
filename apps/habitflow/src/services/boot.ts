import { getLocales } from 'expo-localization';
import { openDatabaseAsync } from 'expo-sqlite';
import type { i18n } from 'i18next';

import { DATABASE_NAME, initDatabase, setRepositories, type Repositories } from '@/database';
import { initI18n } from '@/i18n';
import { usePreferences } from '@/store/preferences';
import { useSession } from '@/store/session';

import { initAds } from './ads';
import { recordError, setAnalyticsConsent } from './analytics';
import { clock } from './clock';
import { initMonetization } from './monetization';
import { initNotifications, syncNotifications } from './reminders';

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
 * App start-up. Everything the first screen needs is local: no network call
 * blocks the UI; store, ads and reminder work run in the background.
 * Existing databases are migrated in place (`user_version`), so updates keep data.
 */
export async function boot(): Promise<{ i18n: i18n; repos: Repositories }> {
  await waitForHydration();
  const prefs = usePreferences.getState();
  const i18n = await initI18n(prefs.interfaceLanguage, getLocales().map((l) => l.languageCode));

  const db = await openDatabaseAsync(DATABASE_NAME);
  const repos = await initDatabase(db);
  setRepositories(repos);
  useSession.getState().setToday(clock.today());
  useSession.getState().markDbReady();

  prefs.set({ sessionCount: prefs.sessionCount + 1 });
  setAnalyticsConsent(prefs.analyticsConsent);
  initNotifications();

  initMonetization(db).catch((e) => recordError(e, 'boot_monetization'));
  if (prefs.onboardingCompleted) startPostOnboardingServices(repos, i18n);
  return { i18n, repos };
}

export function startPostOnboardingServices(repos: Repositories, i18n: i18n): void {
  initAds().catch((e) => recordError(e, 'boot_ads'));
  syncNotifications(repos, i18n.t).catch((e) => recordError(e, 'boot_reminders'));
}
