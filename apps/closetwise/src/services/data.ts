import type { i18n } from 'i18next';

import { repos, type Repositories } from '@/database';
import type { AppSettings } from '@/database/repositories/careGoalsSettingsRepository';
import { useSession } from '@/store/session';

import { recordError } from './analytics';
import { refreshNotifications } from './reminders';

/**
 * Glue between repositories and the UI: reloads cached reference data and asks screens
 * to refresh after writes. Screens call `afterWrite()` after any mutation.
 */
export async function reloadTaxonomy(r: Repositories = repos()): Promise<void> {
  const [categories, styles, occasions] = await Promise.all([r.taxonomy.categories(), r.taxonomy.tags('styles', true), r.taxonomy.tags('occasions', true)]);
  useSession.getState().setTaxonomy({ categories, styles, occasions });
}

export async function reloadSettings(r: Repositories = repos()): Promise<AppSettings> {
  const s = await r.settings.get();
  useSession.getState().setSettings(s);
  return s;
}

export async function updateSettings(patch: Partial<AppSettings>): Promise<void> {
  await repos().settings.set(patch);
  await reloadSettings();
}

let i18nRef: i18n | null = null;
export function setI18nForServices(instance: i18n): void {
  i18nRef = instance;
}

/** Call after any write: refreshes screens, and re-plans notifications when dates may have changed. */
export function afterWrite(opts: { notifications?: boolean; taxonomy?: boolean } = {}): void {
  useSession.getState().bump();
  if (opts.taxonomy) reloadTaxonomy().catch((e) => recordError(e, 'reload_taxonomy'));
  if (opts.notifications && i18nRef) refreshNotifications(repos(), i18nRef.t).catch((e) => recordError(e, 'refresh_notifications'));
}
