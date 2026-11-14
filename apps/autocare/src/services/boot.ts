import { getLocales } from 'expo-localization';
import { openDatabaseAsync } from 'expo-sqlite';
import type { i18n, TFunction } from 'i18next';

import { DATABASE_NAME, initDatabase, repos, setRepositories, type Repositories } from '@/database';
import { initI18n } from '@/i18n';
import { usePreferences } from '@/store/preferences';
import { useSession } from '@/store/session';

import { initAds } from './ads';
import { recordError, setAnalyticsConsent } from './analytics';
import { clock } from './clock';
import { cleanTemporaryFiles } from './fileStore';
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

let translate: TFunction | null = null;

/**
 * App start-up. Everything the first screen needs is local: no network call
 * blocks the UI; store, ads and reminder work run in the background.
 * Existing databases are migrated in place (`user_version`), so updates keep data.
 */
export async function boot(): Promise<{ i18n: i18n; repos: Repositories }> {
  await waitForHydration();
  const prefs = usePreferences.getState();
  const i18n = await initI18n(prefs.interfaceLanguage, getLocales().map((l) => l.languageCode));
  translate = i18n.t.bind(i18n);

  const db = await openDatabaseAsync(DATABASE_NAME);
  const r = await initDatabase(db);
  setRepositories(r);
  useSession.getState().setToday(clock.today());

  // Generated occurrences of recurring expenses (rent of a parking spot, financing…).
  await r.expenses.materializeRecurring(clock.today(), clock.now()).catch((e) => recordError(e, 'boot_recurring'));
  useSession.getState().markDbReady();

  prefs.set({ sessionCount: prefs.sessionCount + 1 });
  setAnalyticsConsent(prefs.analyticsConsent);
  initNotifications();
  cleanTemporaryFiles();

  initMonetization(db).catch((e) => recordError(e, 'boot_monetization'));
  if (prefs.onboardingCompleted) startPostOnboardingServices(r, i18n);
  return { i18n, repos: r };
}

export function startPostOnboardingServices(r: Repositories, i18n: i18n): void {
  initAds().catch((e) => recordError(e, 'boot_ads'));
  syncNotifications(r, i18n.t.bind(i18n)).catch((e) => recordError(e, 'boot_reminders'));
}

let pending: ReturnType<typeof setTimeout> | null = null;

/**
 * Call after every write: screens reload (dataVersion) and the notification set
 * is rebuilt shortly after (debounced, so a burst of edits schedules once).
 */
export function afterWrite(): void {
  useSession.getState().bump();
  if (pending) clearTimeout(pending);
  pending = setTimeout(() => {
    pending = null;
    if (translate) syncNotifications(repos(), translate).catch((e) => recordError(e, 'reminders_after_write'));
  }, 800);
}

export function setTranslator(t: TFunction): void {
  translate = t;
}
