import { createBackup, migrate, parseBackup, restoreBackup, wipeTables, type BackupFile, type SqlDatabase } from '@factory/storage';

import { migrations, SCHEMA_VERSION, USER_TABLES } from './migrations';
import { createRepositories, type Repositories } from './repositories';
import { seedLibraryIfNeeded } from './seed';

export const DATABASE_NAME = 'plantcare.db';
export const APP_ID = 'plantcare';

export type { Repositories };

/** Migrates, seeds and wires repositories. Works with expo-sqlite or the sql.js test adapter. */
export async function initDatabase(db: SqlDatabase, now?: () => Date): Promise<Repositories> {
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  await migrate(db, migrations);
  await seedLibraryIfNeeded(db);
  const repos = createRepositories(db, now);
  await repos.seasonal.ensureBuiltIns();
  return repos;
}

let current: Repositories | null = null;

export function setRepositories(r: Repositories): void {
  current = r;
}

/** Repositories singleton, available after boot. */
export function repos(): Repositories {
  if (!current) throw new Error('Database not initialised yet');
  return current;
}

export function hasRepositories(): boolean {
  return current !== null;
}

/* ------------------------------------------------------------------ backup */

/** JSON backup of user data. Photos are referenced by relative path (exported separately as files). */
export function backupUserData(db: SqlDatabase, now?: Date): Promise<BackupFile> {
  return createBackup(db, { appId: APP_ID, tables: USER_TABLES, now });
}

export async function restoreUserData(db: SqlDatabase, raw: string): Promise<{ restoredRows: number }> {
  const backup = parseBackup(raw, APP_ID);
  // Foreign keys stay ON: tables are restored parents-first, inside one transaction.
  return restoreBackup(db, backup, { tables: USER_TABLES, currentSchemaVersion: SCHEMA_VERSION });
}

/** "Delete all my data": wipes user tables (children first) and keeps the bundled library. */
export async function wipeUserData(db: SqlDatabase): Promise<void> {
  await wipeTables(db, [...USER_TABLES].reverse());
  await db.runAsync("DELETE FROM app_meta WHERE key = 'seasonal_seeded'", []);
  await db.runAsync('DELETE FROM subscription_cache', []);
}
