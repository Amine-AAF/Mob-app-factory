import { getLocales } from 'expo-localization';
import { openDatabaseAsync } from 'expo-sqlite';
import type { i18n } from 'i18next';

import { DATABASE_NAME, initDatabase, setRepositories, type Repositories } from '@/database';
import { initI18n } from '@/i18n';
import { usePreferences } from '@/store/preferences';
import { useSession } from '@/store/session';

import { initAds } from './ads';
import { recordError, setAnalyticsConsent } from './analytics';
import { referencedPaths } from './backupCore';
import { reloadSettings, reloadTaxonomy, setI18nForServices } from './data';
import { initMonetization } from './monetization';
import { cleanupOrphanPhotos, purgeTemporaryFiles } from './photos';
import { initNotifications, refreshNotifications } from './reminders';

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
 * Start-up. Everything needed for the first screen is local; no network call blocks the UI.
 * hydrate prefs → i18n → open SQLite → migrate → load taxonomy/settings → render.
 * Store, ads, notifications and file hygiene run in the background and can't block start-up.
 */
export async function boot(): Promise<{ i18n: i18n; repos: Repositories }> {
  await waitForHydration();
  const prefs = usePreferences.getState();
  const i18n = await initI18n(prefs.interfaceLanguage, getLocales().map((l) => l.languageCode));
  setI18nForServices(i18n);

  const db = await openDatabaseAsync(DATABASE_NAME);
  const repos = await initDatabase(db);
  setRepositories(repos);
  await Promise.all([reloadTaxonomy(repos), reloadSettings(repos)]);
  useSession.getState().markDbReady();

  prefs.set({ sessionCount: prefs.sessionCount + 1 });
  setAnalyticsConsent(prefs.analyticsConsent);
  initNotifications();

  initMonetization(db).catch((e) => recordError(e, 'boot_monetization'));
  setTimeout(() => {
    try {
      purgeTemporaryFiles();
      referencedPaths(repos)
        .then((paths) => cleanupOrphanPhotos(paths))
        .catch((e) => recordError(e, 'boot_orphans'));
    } catch (e) {
      recordError(e, 'boot_files');
    }
  }, 3000);
  if (prefs.onboardingCompleted) startPostOnboardingServices(repos, i18n);
  return { i18n, repos };
}

export function startPostOnboardingServices(repos: Repositories, i18n: i18n): void {
  initAds().catch((e) => recordError(e, 'boot_ads'));
  refreshNotifications(repos, i18n.t).catch((e) => recordError(e, 'boot_notifications'));
}
