import { createBackup, parseBackup, restoreBackup, wipeTables, type BackupFile, type SqlDatabase } from '@factory/storage';

import { SCHEMA_VERSION, USER_TABLES } from '@/database/migrations';

/**
 * Backup strategy
 * - Export: a JSON file with every user table (homes → photos metadata), shared through the
 *   Android share sheet so the user decides where it goes (Drive, e-mail, USB…). Nothing is
 *   uploaded automatically.
 * - Files (documents, photos) are NOT embedded: they can be large and are exported one by one
 *   from their screen. After a restore on another phone, records whose file is missing show
 *   "File not found on this device" with an option to attach it again.
 * - Restore replaces all user data atomically (single transaction); a failure leaves the
 *   current data untouched. Older backups restore into newer schemas (unknown columns ignored).
 */
export const APP_ID = 'homecare';

export async function exportUserData(db: SqlDatabase, now = new Date()): Promise<{ json: string; fileName: string; backup: BackupFile }> {
  const backup = await createBackup(db, { appId: APP_ID, tables: USER_TABLES, now });
  const stamp = now.toISOString().slice(0, 10);
  return { json: JSON.stringify(backup, null, 2), fileName: `homecare-backup-${stamp}.json`, backup };
}

export async function importUserData(db: SqlDatabase, raw: string): Promise<{ restoredRows: number }> {
  const backup = parseBackup(raw, APP_ID);
  return restoreBackup(db, backup, { tables: USER_TABLES, currentSchemaVersion: SCHEMA_VERSION });
}

/** Erases every user-owned row (children first is not needed: one transaction, FK cascades). */
export async function deleteAllUserData(db: SqlDatabase): Promise<void> {
  await wipeTables(db, [...[...USER_TABLES].reverse(), 'subscription_cache']);
}
