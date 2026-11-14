import { getLocales } from 'expo-localization';
import { openDatabaseAsync } from 'expo-sqlite';
import type { i18n, TFunction } from 'i18next';

import { DATABASE_NAME, initDatabase, setRepositories, type Repositories } from '@/database';
import { toDayKey } from '@/domain/dates';
import { initI18n, setDateOrder } from '@/i18n';
import { usePreferences } from '@/store/preferences';
import { useSession } from '@/store/session';

import { initAds } from './ads';
import { recordError, setAnalyticsConsent } from './analytics';
import { clock } from './clock';
import { purgeTemporaryFiles, removeUnreferencedFiles } from './files';
import { initMonetization } from './monetization';
import { initNotifications, syncReminders } from './reminders';

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

/** Loads homes into the session and makes sure the active home still exists. */
export async function refreshHomes(r: Repositories): Promise<void> {
  const homes = await r.homes.list();
  useSession.getState().setHomes(homes);
  const prefs = usePreferences.getState();
  if (!homes.some((h) => h.id === prefs.activeHomeId)) prefs.set({ activeHomeId: homes[0]?.id ?? null });
}

/**
 * Daily housekeeping, safe to run repeatedly: records due recurring expenses for every
 * home, then re-plans reminders (picks up time-zone changes and new data).
 */
export async function runHousekeeping(r: Repositories, t: TFunction): Promise<void> {
  const today = toDayKey(clock.now());
  for (const h of await r.homes.list()) {
    await r.expenses.catchUp(h.id, today);
  }
  await syncReminders(r, t);
}

/** Removes files no record references anymore (cascaded deletions, failed imports). */
export async function cleanOrphanFiles(r: Repositories): Promise<void> {
  for (const o of await r.photos.orphans()) await r.photos.remove(o.id);
  const referenced = [...(await r.documents.filePaths()), ...(await r.photos.allPaths())];
  removeUnreferencedFiles(referenced);
}

/**
 * App start-up. Everything needed for the first screen is local: no network call blocks the UI.
 */
export async function boot(): Promise<{ i18n: i18n; repos: Repositories }> {
  await waitForHydration();
  const prefs = usePreferences.getState();
  const locales = getLocales();
  const i18n = await initI18n(prefs.interfaceLanguage, locales.map((l) => l.languageCode), locales[0]?.languageTag);
  setDateOrder(prefs.dateFormat);

  const db = await openDatabaseAsync(DATABASE_NAME);
  const repos = await initDatabase(db, clock.now);
  setRepositories(repos);
  await refreshHomes(repos);
  useSession.getState().markDbReady();

  prefs.set({ sessionCount: prefs.sessionCount + 1 });
  setAnalyticsConsent(prefs.analyticsConsent);
  initNotifications();

  // Background work: must never block or crash start-up.
  purgeTemporaryFiles();
  initMonetization(db).catch((e) => recordError(e, 'boot_monetization'));
  runHousekeeping(repos, i18n.t)
    .then(() => useSession.getState().bump())
    .catch((e) => recordError(e, 'boot_housekeeping'));
  cleanOrphanFiles(repos).catch((e) => recordError(e, 'boot_cleanup'));
  if (prefs.onboardingCompleted) initAds().catch((e) => recordError(e, 'boot_ads'));

  return { i18n, repos };
}
