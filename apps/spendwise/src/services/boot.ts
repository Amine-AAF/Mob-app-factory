import { getLocales } from 'expo-localization';
import { openDatabaseAsync } from 'expo-sqlite';
import type { i18n } from 'i18next';
import { AppState } from 'react-native';

import { DATABASE_NAME, initDatabase, repos, setRepositories, type Repositories } from '@/database';
import { categoryName, initI18n } from '@/i18n';
import { usePreferences } from '@/store/preferences';
import { useSession } from '@/store/session';

import { initAds } from './ads';
import { recordError, setAnalyticsConsent } from './analytics';
import { clock } from './clock';
import { initMonetization } from './monetization';
import { checkBudgetAlerts, initNotifications, rescheduleSubscriptionReminders } from './notifications';

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

let i18nInstance: i18n | null = null;

/**
 * Generates due recurring transactions (idempotent) and refreshes alerts/reminders.
 * Runs at start-up and every time the app returns to the foreground.
 */
export async function runDailyMaintenance(r: Repositories = repos()): Promise<void> {
  const today = clock.today();
  const created = await r.recurring.runAutoPost(today);
  if (created > 0) useSession.getState().bump();
  if (i18nInstance) {
    const t = i18nInstance.t.bind(i18nInstance);
    await checkBudgetAlerts(r, t, today, (c) => categoryName(c, t));
    await rescheduleSubscriptionReminders(r, t, today);
  }
}

/** Everything needed for the first screen is local: no network call blocks the UI. */
export async function boot(): Promise<{ i18n: i18n; repos: Repositories }> {
  await waitForHydration();
  const prefs = usePreferences.getState();
  const i18n = await initI18n(prefs.interfaceLanguage, getLocales().map((l) => l.languageCode));
  i18nInstance = i18n;

  const db = await openDatabaseAsync(DATABASE_NAME);
  const r = await initDatabase(db);
  setRepositories(r);
  useSession.getState().setSettings(await r.settings.getAll());
  useSession.getState().markDbReady();

  prefs.set({ sessionCount: prefs.sessionCount + 1 });
  setAnalyticsConsent(prefs.analyticsConsent);
  initNotifications();

  initMonetization(db).catch((e) => recordError(e, 'boot_monetization'));
  runDailyMaintenance(r).catch((e) => recordError(e, 'boot_maintenance'));
  AppState.addEventListener('change', (s) => {
    if (s === 'active') runDailyMaintenance(r).catch((e) => recordError(e, 'resume_maintenance'));
  });
  if (prefs.onboardingCompleted) startPostOnboardingServices();
  return { i18n, repos: r };
}

export function startPostOnboardingServices(): void {
  initAds().catch((e) => recordError(e, 'boot_ads'));
}

/** Reloads settings from SQLite (after a restore or a settings change) and refreshes screens. */
export async function reloadSession(): Promise<void> {
  useSession.getState().setSettings(await repos().settings.getAll());
  useSession.getState().bump();
}
