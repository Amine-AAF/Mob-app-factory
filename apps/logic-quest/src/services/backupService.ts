import { createBackup, parseBackup, restoreBackup, wipeTables, type BackupFile, type SqlDatabase } from '@factory/storage';

import { SCHEMA_VERSION, USER_TABLES } from '@/database/migrations';

export const APP_ID = 'logic-quest';

/** Portable JSON export of every user-owned table (the bundled content is never exported). */
export async function exportUserData(db: SqlDatabase, now = new Date()): Promise<{ json: string; fileName: string; backup: BackupFile }> {
  const backup = await createBackup(db, { appId: APP_ID, tables: USER_TABLES, now });
  const stamp = now.toISOString().slice(0, 10);
  return { json: JSON.stringify(backup, null, 2), fileName: `logic-quest-backup-${stamp}.json`, backup };
}

/** Replaces local progress with a backup (rejects other apps' and newer-schema files). */
export async function importUserData(db: SqlDatabase, raw: string): Promise<{ restoredRows: number }> {
  const backup = parseBackup(raw, APP_ID);
  return restoreBackup(db, backup, { tables: USER_TABLES, currentSchemaVersion: SCHEMA_VERSION });
}

/** Erases every user-owned row, including the cached subscription state. */
export async function deleteAllUserData(db: SqlDatabase): Promise<void> {
  await wipeTables(db, [...USER_TABLES, 'subscription_cache']);
}
