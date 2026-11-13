import { createBackup, parseBackup, restoreBackup, wipeTables, type BackupFile, type SqlDatabase } from '@factory/storage';

import { SCHEMA_VERSION, USER_TABLES, USER_TABLES_DELETE_ORDER } from '@/database/migrations';

export const APP_ID = 'eventora';

/**
 * JSON backup of every user table. Images and documents are not embedded
 * (they would make the file huge); their references are kept and simply show
 * as missing after a restore on another device.
 */
export async function exportUserData(db: SqlDatabase, now = new Date()): Promise<{ json: string; fileName: string; backup: BackupFile }> {
  const backup = await createBackup(db, { appId: APP_ID, tables: USER_TABLES, now });
  const stamp = now.toISOString().slice(0, 10);
  return { json: JSON.stringify(backup, null, 2), fileName: `eventora-backup-${stamp}`, backup };
}

export async function importUserData(db: SqlDatabase, raw: string): Promise<{ restoredRows: number }> {
  const backup = parseBackup(raw, APP_ID);
  // Foreign keys are checked per statement; restore parents first (USER_TABLES order).
  return restoreBackup(db, backup, { tables: USER_TABLES, currentSchemaVersion: SCHEMA_VERSION });
}

/** Erases every user-owned row (bundled event types stay). */
export async function deleteAllUserData(db: SqlDatabase): Promise<void> {
  await wipeTables(db, [...USER_TABLES_DELETE_ORDER, 'subscription_cache']);
}
