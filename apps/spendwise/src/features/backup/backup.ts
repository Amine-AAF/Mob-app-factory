import { BackupError, createBackup, parseBackup, type BackupFile, type SqlDatabase, type SqlValue } from '@factory/storage';

import { SCHEMA_VERSION, USER_TABLES } from '@/database/migrations';
import { isSupportedCurrency } from '@/utils/money';

export const APP_ID = 'spendwise';

/** Full local backup (JSON). Nothing is uploaded: the file is handed to the system share sheet. */
export async function exportBackup(db: SqlDatabase, now = new Date()): Promise<{ json: string; fileName: string; backup: BackupFile }> {
  const backup = await createBackup(db, { appId: APP_ID, tables: USER_TABLES, now });
  const stamp = now.toISOString().slice(0, 10);
  return { json: JSON.stringify(backup, null, 2), fileName: `spendwise-backup-${stamp}.json`, backup };
}

export interface BackupSummary {
  createdAt: string;
  schemaVersion: number;
  counts: Record<string, number>;
}

const MONEY_COLUMNS: Record<string, string[]> = {
  accounts: ['initial_balance'],
  transactions: ['amount'],
  budgets: [],
  budget_categories: ['limit_amount'],
  subscriptions: ['price'],
  savings_goals: ['target'],
  savings_contributions: ['amount'],
};

/**
 * Parses AND validates a backup before anything is touched: format, app id, schema version,
 * row shapes, integer amounts and currency codes. Throws BackupError.
 */
export function readBackup(raw: string): { backup: BackupFile; summary: BackupSummary } {
  const backup = parseBackup(raw, APP_ID);
  if (backup.schemaVersion > SCHEMA_VERSION) throw new BackupError('newer_schema');
  const counts: Record<string, number> = {};
  for (const table of USER_TABLES) {
    const rows = backup.tables[table] ?? [];
    if (!Array.isArray(rows)) throw new BackupError('invalid_format');
    for (const row of rows) {
      if (!row || typeof row !== 'object' || Array.isArray(row)) throw new BackupError('invalid_format');
      for (const col of MONEY_COLUMNS[table] ?? []) {
        const v = row[col];
        if (v !== null && v !== undefined && !Number.isSafeInteger(v)) throw new BackupError('invalid_format');
      }
      if ('currency' in row && typeof row.currency === 'string' && !isSupportedCurrency(row.currency)) throw new BackupError('invalid_format');
    }
    counts[table] = rows.length;
  }
  return { backup, summary: { createdAt: backup.createdAt, schemaVersion: backup.schemaVersion, counts } };
}

const IDENT = /^[A-Za-z_][A-Za-z0-9_]*$/;

/**
 * Replaces ALL user data with the backup, atomically.
 * Foreign keys are deferred to the commit, children are deleted first and parents inserted
 * first. Columns unknown to the current schema are ignored (older/newer minor backups);
 * missing columns take their schema defaults. Any failure rolls everything back.
 *
 * (The shared @factory/storage `restoreBackup` deletes tables in the given order, which breaks
 * with foreign keys; see factory/tracking/spendwise.md › Candidats à la mutualisation.)
 */
export async function restoreBackup(db: SqlDatabase, backup: BackupFile): Promise<{ restoredRows: number }> {
  let restoredRows = 0;
  await db.withTransactionAsync(async () => {
    await db.execAsync('PRAGMA defer_foreign_keys = ON');
    for (const table of [...USER_TABLES].reverse()) await db.runAsync(`DELETE FROM ${table}`, []);
    for (const table of USER_TABLES) {
      const columns = new Set((await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${table})`, [])).map((c) => c.name));
      for (const row of backup.tables[table] ?? []) {
        const keys = Object.keys(row).filter((k) => columns.has(k) && IDENT.test(k));
        if (!keys.length) continue;
        await db.runAsync(
          `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`,
          keys.map((k) => (row[k] ?? null) as SqlValue),
        );
        restoredRows++;
      }
    }
    const broken = await db.getAllAsync<{ table: string }>('PRAGMA foreign_key_check', []);
    if (broken.length) throw new BackupError('invalid_format');
  });
  return { restoredRows };
}

/** "Delete all my data": every user table, including the entitlement cache. */
export async function deleteAllData(db: SqlDatabase): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.execAsync('PRAGMA defer_foreign_keys = ON');
    for (const table of [...USER_TABLES].reverse()) await db.runAsync(`DELETE FROM ${table}`, []);
    await db.runAsync('DELETE FROM subscription_cache', []);
  });
}
