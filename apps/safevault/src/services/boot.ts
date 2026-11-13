import { getLocales } from 'expo-localization';
import { openDatabaseAsync } from 'expo-sqlite';
import type { i18n } from 'i18next';

import { selectEngine } from '@/crypto/kdf';
import { DATABASE_NAME, initDatabase } from '@/database';
import { initI18n } from '@/i18n';
import { initVaultStore } from '@/store/vault';

import { getContext, loadSettings, setContext } from './context';
import { logEvent } from './log';
import { initMonetization } from './monetization';
import { applyScreenProtection } from './screenSecurity';

/**
 * Start-up. Fully offline: nothing here needs the network.
 * Order matters: screen protection is applied before any vault screen can render.
 */
export async function boot(): Promise<{ i18n: i18n }> {
  const db = await openDatabaseAsync(DATABASE_NAME);
  await initDatabase(db);
  setContext(db);
  const settings = await loadSettings();
  await applyScreenProtection(settings.screenProtection);
  const i18n = await initI18n(settings.language, getLocales().map((l) => l.languageCode));
  // Validates the native Argon2id implementation against the known-answer test.
  await selectEngine();
  await initVaultStore();
  initMonetization(getContext().db).catch((e) => logEvent('boot_monetization', e));
  return { i18n };
}
