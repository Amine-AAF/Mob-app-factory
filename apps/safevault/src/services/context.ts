import type { SqlDatabase } from '@factory/storage';

import { createSettingsRepository } from '@/database';
import { mergeSettings, useApp, type AppSettings } from '@/store/app';
import { createVaultService, type VaultService } from '@/vault/vaultService';

/** Singletons wired at boot (or by tests). */
interface Context {
  db: SqlDatabase;
  vault: VaultService;
  settings: ReturnType<typeof createSettingsRepository>;
}

let ctx: Context | null = null;

export function setContext(db: SqlDatabase, vault: VaultService = createVaultService({ db })): Context {
  ctx = { db, vault, settings: createSettingsRepository(db) };
  return ctx;
}

export function getContext(): Context {
  if (!ctx) throw new Error('context_not_ready');
  return ctx;
}

export function vaultService(): VaultService {
  return getContext().vault;
}

export async function loadSettings(): Promise<AppSettings> {
  const s = mergeSettings(await getContext().settings.get<Partial<AppSettings> | null>('app', null));
  useApp.getState().applySettings(s);
  return s;
}

export async function updateSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
  const next = { ...useApp.getState().settings, ...patch };
  useApp.getState().applySettings(next);
  await getContext().settings.set('app', next);
  return next;
}
