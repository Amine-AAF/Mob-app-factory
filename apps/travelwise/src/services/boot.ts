import { getLocales } from 'expo-localization';
import { openDatabaseAsync } from 'expo-sqlite';
import type { i18n } from 'i18next';

import { DATABASE_NAME, initDatabase, setRepositories, type Repositories } from '@/database';
import { initI18n } from '@/i18n';
import { usePreferences } from '@/store/preferences';
import { useSession } from '@/store/session';

import { recordError, setAnalyticsConsent } from './analytics';
import { cleanTemporaryFiles } from './files';
import { initReminders } from './reminders';

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

/** App start-up. Everything is local: no network call ever blocks the first screen. */
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
  initReminders();

  // Background, best effort: leftovers from interrupted imports/exports.
  setTimeout(() => {
    try {
      cleanTemporaryFiles();
    } catch (e) {
      recordError(e, 'boot_cleanup');
    }
  }, 2000);

  return { i18n, repos };
}
