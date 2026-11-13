/**
 * Minimal async SQL interface. It matches the subset of expo-sqlite's
 * `SQLiteDatabase` that repositories use, so the real database can be passed
 * directly and tests can substitute an in-memory sql.js implementation.
 */
export type SqlValue = string | number | null;
export type SqlParams = SqlValue[];

export interface SqlRunResult {
  changes: number;
  lastInsertRowId: number;
}

export interface SqlDatabase {
  execAsync(source: string): Promise<void>;
  runAsync(source: string, params: SqlParams): Promise<SqlRunResult>;
  getAllAsync<T>(source: string, params: SqlParams): Promise<T[]>;
  getFirstAsync<T>(source: string, params: SqlParams): Promise<T | null>;
  withTransactionAsync(task: () => Promise<void>): Promise<void>;
}

export interface Migration {
  /** Strictly increasing, starting at 1. Never edit a shipped migration: add a new one. */
  version: number;
  name: string;
  up(db: SqlDatabase): Promise<void>;
}

/**
 * Applies pending migrations using SQLite's `user_version` pragma.
 * Each migration runs in its own transaction; a failure leaves the
 * database at the last successful version.
 */
export async function migrate(db: SqlDatabase, migrations: readonly Migration[]): Promise<number> {
  const sorted = [...migrations].sort((a, b) => a.version - b.version);
  sorted.forEach((m, i) => {
    if (m.version !== i + 1) throw new Error(`Migrations must be contiguous from 1 (got ${m.version} at #${i + 1})`);
  });

  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version', []);
  let current = row?.user_version ?? 0;

  for (const m of sorted) {
    if (m.version <= current) continue;
    await db.withTransactionAsync(async () => {
      await m.up(db);
      // PRAGMA does not accept bound parameters; version is a trusted integer.
      await db.execAsync(`PRAGMA user_version = ${Math.floor(m.version)}`);
    });
    current = m.version;
  }
  return current;
}

/** JSON column helpers with a safe fallback for corrupted rows. */
export function toJson(value: unknown): string {
  return JSON.stringify(value);
}

export function fromJson<T>(raw: string | null | undefined, fallback: T): T {
  if (raw == null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Builds "(?, ?, ?)" placeholder lists. */
export function placeholders(count: number): string {
  return `(${Array.from({ length: count }, () => '?').join(', ')})`;
}
