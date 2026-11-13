import type { SqlDatabase, SqlValue } from './sql';

/**
 * Portable JSON backup of user-owned tables (never of bundled content,
 * which is re-seeded from the app bundle).
 */
export interface BackupFile {
  format: 'factory-backup';
  formatVersion: 1;
  appId: string;
  schemaVersion: number;
  createdAt: string;
  tables: Record<string, Record<string, SqlValue>[]>;
}

const IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_]*$/;

function assertIdentifier(name: string): void {
  if (!IDENTIFIER.test(name)) throw new Error(`Unsafe SQL identifier: ${name}`);
}

export async function createBackup(
  db: SqlDatabase,
  opts: { appId: string; tables: readonly string[]; now?: Date },
): Promise<BackupFile> {
  const version = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version', []);
  const tables: BackupFile['tables'] = {};
  for (const table of opts.tables) {
    assertIdentifier(table);
    tables[table] = await db.getAllAsync<Record<string, SqlValue>>(`SELECT * FROM ${table}`, []);
  }
  return {
    format: 'factory-backup',
    formatVersion: 1,
    appId: opts.appId,
    schemaVersion: version?.user_version ?? 0,
    createdAt: (opts.now ?? new Date()).toISOString(),
    tables,
  };
}

export function parseBackup(raw: string, expectedAppId: string): BackupFile {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new BackupError('invalid_json');
  }
  const file = data as Partial<BackupFile>;
  if (file?.format !== 'factory-backup' || file.formatVersion !== 1 || typeof file.tables !== 'object' || !file.tables) {
    throw new BackupError('invalid_format');
  }
  if (file.appId !== expectedAppId) throw new BackupError('wrong_app');
  return file as BackupFile;
}

export class BackupError extends Error {
  constructor(public readonly code: 'invalid_json' | 'invalid_format' | 'wrong_app' | 'newer_schema') {
    super(`Backup error: ${code}`);
    this.name = 'BackupError';
  }
}

/**
 * Replaces the content of the given tables with the backup rows, atomically.
 * Unknown columns are ignored so older backups restore into newer schemas.
 */
export async function restoreBackup(
  db: SqlDatabase,
  backup: BackupFile,
  opts: { tables: readonly string[]; currentSchemaVersion: number },
): Promise<{ restoredRows: number }> {
  if (backup.schemaVersion > opts.currentSchemaVersion) throw new BackupError('newer_schema');
  let restoredRows = 0;
  await db.withTransactionAsync(async () => {
    for (const table of opts.tables) {
      assertIdentifier(table);
      const columns = new Set(
        (await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${table})`, [])).map((c) => c.name),
      );
      await db.runAsync(`DELETE FROM ${table}`, []);
      for (const row of backup.tables[table] ?? []) {
        const keys = Object.keys(row).filter((k) => columns.has(k) && IDENTIFIER.test(k));
        if (keys.length === 0) continue;
        const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`;
        await db.runAsync(sql, keys.map((k) => row[k] ?? null));
        restoredRows++;
      }
    }
  });
  return { restoredRows };
}

export async function wipeTables(db: SqlDatabase, tables: readonly string[]): Promise<void> {
  await db.withTransactionAsync(async () => {
    for (const table of tables) {
      assertIdentifier(table);
      await db.runAsync(`DELETE FROM ${table}`, []);
    }
  });
}
