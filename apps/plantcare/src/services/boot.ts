import { getLocales } from 'expo-localization';
import { openDatabaseAsync } from 'expo-sqlite';
import type { i18n } from 'i18next';

import { initDatabase, setRepositories, type Repositories } from '@/database';
import { DATABASE_NAME } from '@/database';
import { defaultTemperatureUnit, defaultUnitSystem } from '@/domain/units';
import { initI18n, setRegionLocale } from '@/i18n';
import { usePreferences } from '@/store/preferences';
import { useSession } from '@/store/session';

import { initAds } from './ads';
import { recordError, setAnalyticsConsent } from './analytics';
import { clock } from './clock';
import { purgeExports } from './dataService';
import { initMonetization } from './monetization';
import { initNotifications, refreshReminders } from './reminders';

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
 * Start-up. Everything needed for the first screen is local: no network call blocks the UI
 * (offline-first). Store/ads initialisation runs in the background and can fail safely.
 */
export async function boot(): Promise<{ i18n: i18n; repos: Repositories }> {
  await waitForHydration();
  const prefs = usePreferences.getState();
  const locales = getLocales();
  setRegionLocale(locales[0]?.languageTag ?? null);
  const i18n = await initI18n(prefs.interfaceLanguage, locales.map((l) => l.languageCode));

  // First launch: units follow the device region (US → imperial, °F).
  const region = locales[0]?.regionCode ?? null;
  if (prefs.units === null || prefs.temperature === null) {
    prefs.set({ units: prefs.units ?? defaultUnitSystem(region), temperature: prefs.temperature ?? defaultTemperatureUnit(region) });
  }

  const db = await openDatabaseAsync(DATABASE_NAME);
  const repos = await initDatabase(db, clock.now);
  setRepositories(repos);
  useSession.getState().markDbReady();

  prefs.set({ sessionCount: prefs.sessionCount + 1 });
  setAnalyticsConsent(prefs.analyticsConsent);
  initNotifications();
  purgeExports();

  initMonetization(db).catch((e) => recordError(e, 'boot_monetization'));
  if (prefs.onboardingCompleted) startPostOnboardingServices(repos, i18n);
  return { i18n, repos };
}

export function startPostOnboardingServices(repos: Repositories, i18n: i18n): void {
  initAds().catch((e) => recordError(e, 'boot_ads'));
  refreshReminders(repos, i18n.t).catch((e) => recordError(e, 'boot_reminders'));
}
