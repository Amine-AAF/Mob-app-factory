import type { i18n } from 'i18next';

import { repos } from '@/database';
import type { UserPreferences } from '@/database/repositories/settingsRepositories';
import { clearAllProjects } from '@/features/projects/projectsService';
import { useSession } from '@/store/session';

import { setAnalyticsConsent } from './analytics';
import { resetLocalEntitlement } from './monetization';

export async function updatePreferences(patch: Partial<UserPreferences>, i18nInstance?: i18n): Promise<void> {
  const next = await repos().preferences.update(patch);
  useSession.getState().set({ preferences: next });
  if (patch.language !== undefined && i18nInstance) await i18nInstance.changeLanguage(next.language ?? 'en');
}

export async function setAnalytics(granted: boolean): Promise<void> {
  await repos().settings.set('analyticsConsent', granted);
  setAnalyticsConsent(granted);
  useSession.getState().set({ analyticsConsent: granted });
}

export async function completeOnboarding(): Promise<void> {
  await repos().settings.set('onboardingCompleted', true);
  useSession.getState().set({ onboardingCompleted: true });
}

/**
 * "Delete all data": history, results, private copies, tool usage, cached entitlement.
 * Pictures already saved to the gallery or exported elsewhere are the user's and stay.
 * A store subscription is not cancelled by this (managed in Google Play).
 */
export async function deleteAllData(): Promise<void> {
  await clearAllProjects();
  await repos().toolUsage.clear();
  await repos().settings.clear();
  await resetLocalEntitlement(repos());
  await setAnalytics(false);
  useSession.getState().bump();
}
