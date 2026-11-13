import { migrate, type SqlDatabase } from '@factory/storage';

import { migrations } from './migrations';
import { createOperationsRepository } from './repositories/operationsRepository';
import { createPreferencesRepository, createSettingsRepository, createSubscriptionCacheRepository, createUsageRepository } from './repositories/settingsRepositories';

export const DATABASE_NAME = 'filepilot.db';

export interface Repositories {
  db: SqlDatabase;
  operations: ReturnType<typeof createOperationsRepository>;
  preferences: ReturnType<typeof createPreferencesRepository>;
  settings: ReturnType<typeof createSettingsRepository>;
  subscription: ReturnType<typeof createSubscriptionCacheRepository>;
  usage: ReturnType<typeof createUsageRepository>;
}

/** Migrates and wires repositories. Works with expo-sqlite or the sql.js test adapter. */
export async function initDatabase(db: SqlDatabase): Promise<Repositories> {
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  await migrate(db, migrations);
  return createRepositories(db);
}

export function createRepositories(db: SqlDatabase): Repositories {
  return {
    db,
    operations: createOperationsRepository(db),
    preferences: createPreferencesRepository(db),
    settings: createSettingsRepository(db),
    subscription: createSubscriptionCacheRepository(db),
    usage: createUsageRepository(db),
  };
}

let current: Repositories | null = null;

export function setRepositories(repos: Repositories): void {
  current = repos;
}

/** Repositories singleton, available once boot finished. */
export function repos(): Repositories {
  if (!current) throw new Error('Database not initialised yet');
  return current;
}
