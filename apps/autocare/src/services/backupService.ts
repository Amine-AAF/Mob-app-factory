import { createBackup, parseBackup, restoreBackup, wipeTables, type BackupFile, type SqlDatabase } from '@factory/storage';

import { SCHEMA_VERSION, USER_TABLES } from '@/database/migrations';

export const APP_ID = 'autocare';

/**
 * Portable JSON export of every user-owned table — format documented in
 * apps/autocare/docs/backup-format.md. The subscription cache is never exported.
 *
 * Attached files (PDF/images) are NOT embedded: they can be large and stay in the
 * app's private storage. After a restore on another device, documents whose file
 * is absent are shown as "file not on this device" (metadata is kept).
 */
export async function exportUserData(db: SqlDatabase, now = new Date()): Promise<{ json: string; fileName: string; backup: BackupFile }> {
  const backup = await createBackup(db, { appId: APP_ID, tables: USER_TABLES, now });
  const stamp = now.toISOString().slice(0, 10);
  return { json: JSON.stringify(backup, null, 2), fileName: `autocare-backup-${stamp}.json`, backup };
}

/** Summary shown before a destructive restore. */
export function describeBackup(raw: string): { vehicles: number; fuel: number; maintenance: number; expenses: number; createdAt: string } {
  const b = parseBackup(raw, APP_ID);
  return {
    vehicles: b.tables.vehicles?.length ?? 0,
    fuel: b.tables.fuel_records?.length ?? 0,
    maintenance: b.tables.maintenance_records?.length ?? 0,
    expenses: b.tables.expenses?.length ?? 0,
    createdAt: b.createdAt,
  };
}

/** Replaces local data with a backup, atomically (rejects other apps' and newer-schema files). */
export async function importUserData(db: SqlDatabase, raw: string): Promise<{ restoredRows: number }> {
  const backup = parseBackup(raw, APP_ID);
  return restoreBackup(db, backup, { tables: USER_TABLES, currentSchemaVersion: SCHEMA_VERSION });
}

/** Erases every user-owned row, including the cached subscription state. Children first. */
export async function deleteAllUserData(db: SqlDatabase): Promise<void> {
  await wipeTables(db, [...[...USER_TABLES].reverse(), 'subscription_cache']);
}
