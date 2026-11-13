import initSqlJs, { type Database } from 'sql.js';
// Structurally identical to @factory/storage's SqlDatabase (kept local to avoid a package cycle).
type SqlParams = (string | number | null)[];
interface SqlRunResult {
  changes: number;
  lastInsertRowId: number;
}
export interface TestSqlDatabase {
  execAsync(source: string): Promise<void>;
  runAsync(source: string, params: SqlParams): Promise<SqlRunResult>;
  getAllAsync<T>(source: string, params: SqlParams): Promise<T[]>;
  getFirstAsync<T>(source: string, params: SqlParams): Promise<T | null>;
  withTransactionAsync(task: () => Promise<void>): Promise<void>;
}

/**
 * In-memory SQLite for Node tests (sql.js = SQLite compiled to WebAssembly),
 * exposing the same async interface as expo-sqlite.
 */
export async function createTestDatabase(): Promise<TestSqlDatabase & { close(): void; raw: Database }> {
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  db.exec('PRAGMA foreign_keys = ON');
  let depth = 0;

  const all = <T>(source: string, params: SqlParams): T[] => {
    const stmt = db.prepare(source);
    try {
      stmt.bind(params);
      const rows: T[] = [];
      while (stmt.step()) rows.push(stmt.getAsObject() as T);
      return rows;
    } finally {
      stmt.free();
    }
  };

  return {
    raw: db,
    close: () => db.close(),
    async execAsync(source) {
      db.exec(source);
    },
    async runAsync(source, params): Promise<SqlRunResult> {
      db.run(source, params);
      const changes = db.getRowsModified();
      const last = all<{ id: number }>('SELECT last_insert_rowid() AS id', [])[0]?.id ?? 0;
      return { changes, lastInsertRowId: last };
    },
    async getAllAsync<T>(source: string, params: SqlParams) {
      return all<T>(source, params);
    },
    async getFirstAsync<T>(source: string, params: SqlParams) {
      return all<T>(source, params)[0] ?? null;
    },
    async withTransactionAsync(task) {
      // Nested calls join the outer transaction (savepoints would also work).
      if (depth > 0) return task();
      depth++;
      db.exec('BEGIN');
      try {
        await task();
        db.exec('COMMIT');
      } catch (e) {
        db.exec('ROLLBACK');
        throw e;
      } finally {
        depth--;
      }
    },
  };
}

/** Fixed clock helper for deterministic date-dependent tests. */
export function fixedDate(iso: string): Date {
  return new Date(iso);
}
