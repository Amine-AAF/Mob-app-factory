import { fromJson, toJson, type SqlDatabase, type SqlValue } from '@factory/storage';

/**
 * Tiny typed mapper between domain objects (camelCase) and rows (snake_case).
 * Column names are compile-time constants from the specs below, never user input,
 * and every value goes through bound parameters.
 */
type Kind = 'text' | 'num' | 'bool' | 'json';
export type TableSpec<T> = { [K in keyof T]-?: readonly [column: string, kind: Kind] };

export function toRow<T>(spec: TableSpec<T>, obj: Partial<T>): Record<string, SqlValue> {
  const row: Record<string, SqlValue> = {};
  for (const key of Object.keys(spec) as (keyof T)[]) {
    if (!(key in obj)) continue;
    const [col, kind] = spec[key];
    const v = obj[key] as unknown;
    row[col] = v === undefined || v === null ? null : kind === 'bool' ? (v ? 1 : 0) : kind === 'json' ? toJson(v) : (v as SqlValue);
  }
  return row;
}

export function fromRow<T>(spec: TableSpec<T>, row: Record<string, SqlValue>, jsonFallbacks: Partial<Record<keyof T, unknown>> = {}): T {
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(spec) as (keyof T)[]) {
    const [col, kind] = spec[key];
    const v = row[col];
    out[key as string] =
      kind === 'bool' ? v === 1 || v === '1' : kind === 'json' ? fromJson(v as string | null, jsonFallbacks[key] ?? null) : kind === 'num' ? (v === null || v === undefined ? null : Number(v)) : (v ?? null);
  }
  return out as T;
}

export interface Table<T extends { id: string }> {
  name: string;
  spec: TableSpec<T>;
  get(id: string): Promise<T | null>;
  where(sqlWhere: string, params: SqlValue[], orderBy?: string): Promise<T[]>;
  insert(obj: T): Promise<void>;
  update(id: string, patch: Partial<T>): Promise<void>;
  remove(id: string): Promise<void>;
  count(sqlWhere?: string, params?: SqlValue[]): Promise<number>;
}

export function createTable<T extends { id: string }>(db: SqlDatabase, name: string, spec: TableSpec<T>, jsonFallbacks: Partial<Record<keyof T, unknown>> = {}): Table<T> {
  const map = (r: Record<string, SqlValue>) => fromRow(spec, r, jsonFallbacks);
  return {
    name,
    spec,
    async get(id) {
      const r = await db.getFirstAsync<Record<string, SqlValue>>(`SELECT * FROM ${name} WHERE id = ?`, [id]);
      return r ? map(r) : null;
    },
    async where(sqlWhere, params, orderBy) {
      const rows = await db.getAllAsync<Record<string, SqlValue>>(`SELECT * FROM ${name} WHERE ${sqlWhere}${orderBy ? ` ORDER BY ${orderBy}` : ''}`, params);
      return rows.map(map);
    },
    async insert(obj) {
      const row = toRow(spec, obj);
      const cols = Object.keys(row);
      await db.runAsync(`INSERT INTO ${name} (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`, cols.map((c) => row[c] ?? null));
    },
    async update(id, patch) {
      const row = toRow(spec, patch);
      delete row.id;
      const cols = Object.keys(row);
      if (!cols.length) return;
      await db.runAsync(`UPDATE ${name} SET ${cols.map((c) => `${c} = ?`).join(', ')} WHERE id = ?`, [...cols.map((c) => row[c] ?? null), id]);
    },
    async remove(id) {
      await db.runAsync(`DELETE FROM ${name} WHERE id = ?`, [id]);
    },
    async count(sqlWhere = '1 = 1', params = []) {
      const r = await db.getFirstAsync<{ n: number }>(`SELECT COUNT(*) AS n FROM ${name} WHERE ${sqlWhere}`, params);
      return r?.n ?? 0;
    },
  };
}
