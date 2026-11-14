import { getLocales } from 'expo-localization';
import { openDatabaseAsync } from 'expo-sqlite';
import type { i18n } from 'i18next';

import { DATABASE_NAME, initDatabase, setRepositories, type Repositories } from '@/database';
import { defaultWeightUnit } from '@/domain/units';
import { initI18n } from '@/i18n';
import { defaultCurrency, usePreferences } from '@/store/preferences';
import { useSession } from '@/store/session';

import { initAds } from './ads';
import { recordError, setAnalyticsConsent } from './analytics';
import { clearExports } from './files';
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
 * App start-up. Everything needed for the first screen is local: no network call
 * blocks the UI (offline-first). Ads, store and notifications run in the background.
 */
export async function boot(): Promise<{ i18n: i18n; repos: Repositories }> {
  await waitForHydration();
  const prefs = usePreferences.getState();
  const locales = getLocales();
  const i18n = await initI18n(prefs.interfaceLanguage, locales.map((l) => l.languageCode), locales[0]?.languageTag);

  const db = await openDatabaseAsync(DATABASE_NAME);
  const repos = await initDatabase(db);
  setRepositories(repos);
  useSession.getState().setPetCount(await repos.pets.countActive());
  useSession.getState().markDbReady();

  if (prefs.sessionCount === 0) {
    // First launch: regional defaults for units and currency (editable in Settings).
    prefs.set({ weightUnit: defaultWeightUnit(locales[0]?.regionCode), currency: defaultCurrency(locales[0]?.currencyCode) });
  }
  prefs.set({ sessionCount: prefs.sessionCount + 1 });
  setAnalyticsConsent(prefs.analyticsConsent);
  initNotifications();
  clearExports();

  // Background work: must never block or crash start-up.
  initMonetization(db).catch((e) => recordError(e, 'boot_monetization'));
  if (prefs.onboardingCompleted) startPostOnboardingServices(repos, i18n);
  return { i18n, repos };
}

export function startPostOnboardingServices(repos: Repositories, i18n: i18n): void {
  initAds().catch((e) => recordError(e, 'boot_ads'));
  syncNotifications(repos, i18n.t).catch((e) => recordError(e, 'boot_notifications'));
}
