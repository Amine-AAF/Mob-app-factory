import { createBackup, parseBackup, restoreBackup, wipeTables, type BackupFile, type SqlDatabase, type SqlValue } from '@factory/storage';

import { MIXED_TABLES, SCHEMA_VERSION, USER_TABLES } from '@/database/migrations';
import { seedContentIfNeeded } from '@/database/seed';

export const APP_ID = 'learnsphere';

/**
 * Full local backup (JSON) of every user table. For tables mixing bundled and user rows,
 * only user rows are exported; bundled content is re-seeded from the app.
 */
export async function exportUserData(db: SqlDatabase, now = new Date()): Promise<{ json: string; fileName: string; backup: BackupFile }> {
  const backup = await createBackup(db, { appId: APP_ID, tables: [...USER_TABLES, ...MIXED_TABLES], now });
  for (const table of MIXED_TABLES) {
    backup.tables[table] = (backup.tables[table] ?? []).filter((r: Record<string, SqlValue>) => r.source === 'user');
  }
  const stamp = now.toISOString().slice(0, 10);
  return { json: JSON.stringify(backup), fileName: `learnsphere-backup-${stamp}.json`, backup };
}

/** Replaces all user data with the backup, atomically, then restores bundled content. */
export async function importUserData(db: SqlDatabase, raw: string): Promise<{ restoredRows: number }> {
  const backup = parseBackup(raw, APP_ID);
  // Restore mixed tables as user-only rows, bundled rows are re-seeded right after.
  const result = await restoreBackup(db, backup, { tables: [...USER_TABLES, ...MIXED_TABLES], currentSchemaVersion: SCHEMA_VERSION });
  await seedContentIfNeeded(db, true);
  return result;
}

/** "Delete all my data": erases every user row; bundled content is not personal data and stays. */
export async function deleteAllUserData(db: SqlDatabase): Promise<void> {
  await db.withTransactionAsync(async () => {
    // Children first so foreign keys never block.
    await wipeTables(db, [...USER_TABLES].reverse());
    await db.runAsync("DELETE FROM quiz_questions WHERE source = 'user'", []);
    await db.runAsync("DELETE FROM templates WHERE source = 'user'", []);
    await db.runAsync('DELETE FROM subscription_cache', []);
  });
}
