import type { i18n } from 'i18next';

import { repos } from '@/database';
import type { UserPreferences } from '@/database/repositories/settingsRepositories';
import { INTERFACE_LANGUAGES, type InterfaceLanguage } from '@/i18n';
import { useSession } from '@/store/session';

import { setAnalyticsConsent } from './analytics';
import { startPostOnboardingServices } from './boot';
import { processingEnv } from './env';
import { resetLocalEntitlement } from './monetization';
import { refreshUsage } from './operations/perform';

export async function updatePreferences(patch: Partial<UserPreferences>): Promise<void> {
  const next = await repos().preferences.update(patch);
  useSession.getState().set({ preferences: next });
}

export async function changeLanguage(i18n: i18n, language: InterfaceLanguage | null, deviceLanguage: string | null): Promise<void> {
  await updatePreferences({ language });
  const effective = language ?? (INTERFACE_LANGUAGES.find((l) => l === deviceLanguage) as InterfaceLanguage | undefined) ?? 'en';
  await i18n.changeLanguage(effective);
}

export async function changeAnalyticsConsent(granted: boolean): Promise<void> {
  await repos().settings.set('analyticsConsent', granted);
  setAnalyticsConsent(granted);
  useSession.getState().set({ analyticsConsent: granted });
}

export async function completeOnboarding(analyticsConsent: boolean): Promise<void> {
  await repos().settings.set('onboardingCompleted', true);
  await changeAnalyticsConsent(analyticsConsent);
  useSession.getState().set({ onboardingCompleted: true });
  startPostOnboardingServices();
}

/** Removes history rows. With `deleteFiles`, also deletes every output file FilePilot created. */
export async function clearHistory(deleteFiles: boolean): Promise<void> {
  if (deleteFiles) await processingEnv().workspace.deleteAllOutputs();
  await repos().operations.clear();
  useSession.getState().bump();
}

export async function deleteOperation(id: string, deleteFiles: boolean): Promise<void> {
  const op = await repos().operations.get(id);
  if (deleteFiles && op) for (const o of op.outputs) await processingEnv().workspace.deleteOutput(o.uri);
  await repos().operations.delete(id);
  useSession.getState().bump();
}

/** Total size of files in FilePilot's private outputs folder. */
export async function outputsUsage(): Promise<{ files: number; bytes: number }> {
  const { fs, workspace } = processingEnv();
  const dir = workspace.outputsDir();
  const names = await fs.list(dir);
  let bytes = 0;
  for (const n of names) bytes += (await fs.size(fs.join(dir, n))) ?? 0;
  return { files: names.length, bytes };
}

export async function clearTemporaryFiles(): Promise<number> {
  return processingEnv().workspace.sweepTemporaryFiles();
}

/**
 * "Delete all my data": outputs, temp files, history, preferences, usage, cached entitlement.
 * The store subscription itself is not affected (it can be restored).
 */
export async function deleteAllData(): Promise<void> {
  const r = repos();
  await processingEnv().workspace.deleteAllOutputs();
  await processingEnv().workspace.sweepTemporaryFiles();
  await r.db.execAsync('DELETE FROM operation_outputs; DELETE FROM file_operations; DELETE FROM daily_usage; DELETE FROM app_settings;');
  await r.preferences.update({ language: null, theme: 'system', defaultImageQuality: 80, defaultOutputFormat: 'jpeg' });
  await resetLocalEntitlement(r);
  setAnalyticsConsent(false);
  useSession.getState().set({ preferences: await r.preferences.get(), onboardingCompleted: false, analyticsConsent: false });
  await refreshUsage();
  useSession.getState().bump();
}
