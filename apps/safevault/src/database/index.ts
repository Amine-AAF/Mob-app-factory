import { fromJson, migrate, toJson, type SqlDatabase } from '@factory/storage';

import { migrations } from './migrations';

export const DATABASE_NAME = 'safevault.db';

/** Migrates the schema. Works with expo-sqlite and the sql.js test adapter. */
export async function initDatabase(db: SqlDatabase): Promise<number> {
  // secure_delete overwrites deleted content with zeros instead of leaving it in free pages.
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA secure_delete = ON;');
  return migrate(db, migrations);
}

/** Non-secret key/value settings (theme, language, timers). Never put vault content here. */
export function createSettingsRepository(db: SqlDatabase) {
  return {
    async get<T>(key: string, fallback: T): Promise<T> {
      const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', [key]);
      return row ? fromJson<T>(row.value, fallback) : fallback;
    },
    async set<T>(key: string, value: T): Promise<void> {
      await db.runAsync('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', [key, toJson(value)]);
    },
  };
}

export async function logBackup(db: SqlDatabase, kind: 'export' | 'import', itemCount: number, formatVersion: number, at: number): Promise<void> {
  await db.runAsync('INSERT INTO backup_log (kind, created_at, item_count, format_version) VALUES (?, ?, ?, ?)', [kind, at, itemCount, formatVersion]);
}

export async function lastBackup(db: SqlDatabase, kind: 'export' | 'import' = 'export'): Promise<{ createdAt: number; itemCount: number } | null> {
  const row = await db.getFirstAsync<{ created_at: number; item_count: number }>('SELECT created_at, item_count FROM backup_log WHERE kind = ? ORDER BY created_at DESC LIMIT 1', [kind]);
  return row ? { createdAt: row.created_at, itemCount: row.item_count } : null;
}
