import { migrate, wipeTables, type SqlDatabase } from '@factory/storage';

import { USER_TABLES, migrations } from './migrations';
import { createSettingsRepository } from './repositories/settings';
import { createTripRepository } from './repositories/trips';

export const DATABASE_NAME = 'travelwise.db';

export interface Repositories {
  db: SqlDatabase;
  trips: ReturnType<typeof createTripRepository>;
  settings: ReturnType<typeof createSettingsRepository>;
}

/** Migrates and wires repositories. Pure: works with expo-sqlite or the sql.js test adapter. */
export async function initDatabase(db: SqlDatabase): Promise<Repositories> {
  // foreign_keys must be ON for every connection: trip deletion relies on ON DELETE CASCADE.
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  await migrate(db, migrations);
  return createRepositories(db);
}

export function createRepositories(db: SqlDatabase): Repositories {
  return { db, trips: createTripRepository(db), settings: createSettingsRepository(db) };
}

/** Deletes every row of every user table (used by "Delete all my data"). Files are removed by the caller. */
export async function wipeAllData(db: SqlDatabase): Promise<void> {
  await wipeTables(db, USER_TABLES);
}

let current: Repositories | null = null;

export function setRepositories(repos: Repositories | null): void {
  current = repos;
}

/** Repositories singleton, available once the root layout finished booting. */
export function repos(): Repositories {
  if (!current) throw new Error('Database not initialised yet');
  return current;
}
