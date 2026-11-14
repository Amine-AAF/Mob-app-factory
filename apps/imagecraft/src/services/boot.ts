import { addDays } from '@factory/app-core';
import { getLocales } from 'expo-localization';
import { openDatabaseAsync } from 'expo-sqlite';
import type { i18n } from 'i18next';

import { DATABASE_NAME, initDatabase, setRepositories, type Repositories } from '@/database';
import { pruneUnreferencedSources } from '@/features/projects/projectsService';
import { initI18n } from '@/i18n';
import { useSession } from '@/store/session';

import { initAds } from './ads';
import { recordError, setAnalyticsConsent } from './analytics';
import { clock } from './clock';
import { processingEnv } from './env';
import { initMonetization } from './monetization';
import { refreshUsage } from './usageActions';

/**
 * App start-up. Everything needed for the first screen is local: no network call blocks
 * the UI, and the app is fully usable offline.
 */
export async function boot(): Promise<{ i18n: i18n; repos: Repositories }> {
  const db = await openDatabaseAsync(DATABASE_NAME);
  const repos = await initDatabase(db);
  setRepositories(repos);

  const [preferences, settings] = await Promise.all([repos.preferences.get(), repos.settings.all()]);
  const i18n = await initI18n(preferences.language, getLocales().map((l) => l.languageCode));

  const sessionCount = settings.sessionCount + 1;
  await repos.settings.set('sessionCount', sessionCount);
  useSession.getState().set({ preferences, onboardingCompleted: settings.onboardingCompleted, analyticsConsent: settings.analyticsConsent, sessionCount });
  setAnalyticsConsent(settings.analyticsConsent);

  // Temporary files of interrupted jobs (app killed, crash) never linger.
  const { workspace } = processingEnv();
  await workspace.sweepTemporaryFiles().catch((e) => recordError(e, 'boot_sweep'));
  await pruneUnreferencedSources().catch((e) => recordError(e, 'boot_prune_sources'));
  await repos.usage.prune(addDays(clock.today(), -7)).catch(() => undefined);
  await refreshUsage();

  useSession.getState().set({ ready: true });

  // Background work: must never block or crash start-up.
  initMonetization(repos).catch((e) => recordError(e, 'boot_monetization'));
  if (settings.onboardingCompleted) startPostOnboardingServices();

  return { i18n, repos };
}

/** Ads (and their consent form) only start once the user has finished the onboarding. */
export function startPostOnboardingServices(): void {
  initAds().catch((e) => recordError(e, 'boot_ads'));
}
