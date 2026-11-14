import { createBackup, parseBackup, restoreBackup, wipeTables, type BackupFile, type SqlDatabase } from '@factory/storage';

import { SCHEMA_VERSION, USER_TABLES } from '@/database/migrations';

export const APP_ID = 'habitflow';

/**
 * Portable JSON export of every user-owned table — format documented in
 * apps/habitflow/docs/backup-format.md. The subscription cache is never exported.
 */
export async function exportUserData(db: SqlDatabase, now = new Date()): Promise<{ json: string; fileName: string; backup: BackupFile }> {
  const backup = await createBackup(db, { appId: APP_ID, tables: USER_TABLES, now });
  const stamp = now.toISOString().slice(0, 10);
  return { json: JSON.stringify(backup, null, 2), fileName: `habitflow-backup-${stamp}.json`, backup };
}

/** Summary shown before a destructive restore. */
export function describeBackup(raw: string): { habits: number; logs: number; tasks: number; createdAt: string } {
  const b = parseBackup(raw, APP_ID);
  return { habits: b.tables.habits?.length ?? 0, logs: b.tables.habit_logs?.length ?? 0, tasks: b.tables.tasks?.length ?? 0, createdAt: b.createdAt };
}

/** Replaces local data with a backup, atomically (rejects other apps' and newer-schema files). */
export async function importUserData(db: SqlDatabase, raw: string): Promise<{ restoredRows: number }> {
  const backup = parseBackup(raw, APP_ID);
  return restoreBackup(db, backup, { tables: USER_TABLES, currentSchemaVersion: SCHEMA_VERSION });
}

/** Erases every user-owned row, including the cached subscription state. */
export async function deleteAllUserData(db: SqlDatabase): Promise<void> {
  // Children first is not required (ON DELETE CASCADE), but keeps the wipe explicit.
  await wipeTables(db, ['xp_ledger', 'habit_logs', 'habit_schedules', 'reminders', 'tasks', 'achievements', 'user_settings', 'habits', 'subscription_cache']);
}
