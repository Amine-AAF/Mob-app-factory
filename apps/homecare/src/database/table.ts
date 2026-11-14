import type { SqlDatabase, SqlValue } from '@factory/storage';

/**
 * Tiny typed table helper: camelCase entities ↔ snake_case columns.
 * Column names are compile-time constants from the repositories (never user input).
 */
const IDENT = /^[a-z_][a-z0-9_]*$/;

export const toSnake = (s: string) => s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
export const toCamel = (s: string) => s.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());

export type Row = Record<string, SqlValue>;

export function rowToEntity<T>(row: Row, booleans: readonly string[] = []): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    const key = toCamel(k);
    out[key] = booleans.includes(key) ? v === 1 : v;
  }
  return out as T;
}

function toSql(value: unknown): SqlValue {
  if (value === undefined || value === null) return null;
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') return value;
  throw new Error(`Unsupported SQL value: ${typeof value}`);
}

export interface Table<T extends { id: string }> {
  name: string;
  insert(entity: Partial<T> & { id: string }): Promise<void>;
  update(id: string, patch: Partial<T>): Promise<number>;
  get(id: string): Promise<T | null>;
  delete(id: string): Promise<number>;
  select(where?: string, params?: SqlValue[], orderBy?: string): Promise<T[]>;
  count(where?: string, params?: SqlValue[]): Promise<number>;
}

export function createTable<T extends { id: string }>(db: SqlDatabase, name: string, booleans: readonly (keyof T & string)[] = []): Table<T> {
  if (!IDENT.test(name)) throw new Error(`Unsafe table ${name}`);
  const map = (r: Row) => rowToEntity<T>(r, booleans);
  const cols = (obj: object) =>
    Object.entries(obj)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => {
        const col = toSnake(k);
        if (!IDENT.test(col)) throw new Error(`Unsafe column ${col}`);
        return [col, toSql(v)] as const;
      });
  return {
    name,
    async insert(entity) {
      const entries = cols(entity);
      await db.runAsync(`INSERT INTO ${name} (${entries.map(([c]) => c).join(', ')}) VALUES (${entries.map(() => '?').join(', ')})`, entries.map(([, v]) => v));
    },
    async update(id, patch) {
      const entries = cols(patch).filter(([c]) => c !== 'id');
      if (entries.length === 0) return 0;
      const r = await db.runAsync(`UPDATE ${name} SET ${entries.map(([c]) => `${c} = ?`).join(', ')} WHERE id = ?`, [...entries.map(([, v]) => v), id]);
      return r.changes;
    },
    async get(id) {
      const r = await db.getFirstAsync<Row>(`SELECT * FROM ${name} WHERE id = ?`, [id]);
      return r ? map(r) : null;
    },
    async delete(id) {
      return (await db.runAsync(`DELETE FROM ${name} WHERE id = ?`, [id])).changes;
    },
    async select(where, params = [], orderBy) {
      const rows = await db.getAllAsync<Row>(`SELECT * FROM ${name}${where ? ` WHERE ${where}` : ''}${orderBy ? ` ORDER BY ${orderBy}` : ''}`, params);
      return rows.map(map);
    },
    async count(where, params = []) {
      const r = await db.getFirstAsync<{ n: number }>(`SELECT COUNT(*) AS n FROM ${name}${where ? ` WHERE ${where}` : ''}`, params);
      return r?.n ?? 0;
    },
  };
}

/** Escapes LIKE wildcards in user search text. Use with `ESCAPE '\\'`. */
export function likePattern(search: string): string {
  return `%${search.trim().toLowerCase().replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}
