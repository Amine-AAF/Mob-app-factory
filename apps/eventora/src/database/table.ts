import { fromJson, toJson, type SqlDatabase, type SqlValue } from '@factory/storage';

/**
 * Tiny typed table mapper: one declaration per entity maps camelCase fields to
 * snake_case columns and converts booleans / JSON / nullable values. Every
 * query uses bound parameters; identifiers only come from these declarations.
 */
export type ColumnKind = 'text' | 'textOrNull' | 'int' | 'real' | 'realOrNull' | 'bool' | 'json';

export type Columns<T> = { [K in keyof T]-?: [column: string, kind: ColumnKind] };

export interface Table<T extends { id: string }> {
  name: string;
  fromRow(row: Record<string, SqlValue>): T;
  insert(db: SqlDatabase, value: T): Promise<void>;
  update(db: SqlDatabase, id: string, patch: Partial<Omit<T, 'id'>>): Promise<void>;
  get(db: SqlDatabase, id: string): Promise<T | null>;
  where(db: SqlDatabase, clause: string, params: SqlValue[], orderBy?: string): Promise<T[]>;
  remove(db: SqlDatabase, id: string): Promise<void>;
  count(db: SqlDatabase, clause: string, params: SqlValue[]): Promise<number>;
}

const SAFE = /^[a-z_][a-z0-9_]*$/;

function encode(kind: ColumnKind, v: unknown): SqlValue {
  switch (kind) {
    case 'bool':
      return v ? 1 : 0;
    case 'json':
      return toJson(v);
    case 'int':
      return Math.round(Number(v) || 0);
    case 'real':
      return Number(v) || 0;
    case 'realOrNull':
      return v == null || !Number.isFinite(Number(v)) ? null : Number(v);
    case 'textOrNull':
      return v == null || v === '' ? null : String(v);
    default:
      return v == null ? '' : String(v);
  }
}

function decode(kind: ColumnKind, v: SqlValue | undefined): unknown {
  switch (kind) {
    case 'bool':
      return v === 1 || v === '1';
    case 'json':
      return fromJson(typeof v === 'string' ? v : null, null);
    case 'int':
    case 'real':
      return typeof v === 'number' ? v : Number(v ?? 0) || 0;
    case 'realOrNull':
      return v == null ? null : Number(v);
    case 'textOrNull':
      return v == null || v === '' ? null : String(v);
    default:
      return v == null ? '' : String(v);
  }
}

export function defineTable<T extends { id: string }>(name: string, columns: Columns<T>): Table<T> {
  const entries = Object.entries(columns) as [keyof T & string, [string, ColumnKind]][];
  for (const [, [col]] of entries) if (!SAFE.test(col)) throw new Error(`Unsafe column ${col}`);
  if (!SAFE.test(name)) throw new Error(`Unsafe table ${name}`);
  const idCol = columns.id[0];

  const fromRow = (row: Record<string, SqlValue>): T => {
    const out: Record<string, unknown> = {};
    for (const [key, [col, kind]] of entries) out[key] = decode(kind, row[col]);
    return out as T;
  };

  return {
    name,
    fromRow,
    async insert(db, value) {
      const cols = entries.map(([, [c]]) => c);
      const params = entries.map(([k, [, kind]]) => encode(kind, value[k]));
      await db.runAsync(`INSERT INTO ${name} (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`, params);
    },
    async update(db, id, patch) {
      const keys = entries.filter(([k]) => k !== 'id' && Object.prototype.hasOwnProperty.call(patch, k));
      if (keys.length === 0) return;
      const sets = keys.map(([, [c]]) => `${c} = ?`).join(', ');
      const params = keys.map(([k, [, kind]]) => encode(kind, (patch as Record<string, unknown>)[k]));
      await db.runAsync(`UPDATE ${name} SET ${sets} WHERE ${idCol} = ?`, [...params, id]);
    },
    async get(db, id) {
      const row = await db.getFirstAsync<Record<string, SqlValue>>(`SELECT * FROM ${name} WHERE ${idCol} = ?`, [id]);
      return row ? fromRow(row) : null;
    },
    async where(db, clause, params, orderBy) {
      const rows = await db.getAllAsync<Record<string, SqlValue>>(`SELECT * FROM ${name}${clause ? ` WHERE ${clause}` : ''}${orderBy ? ` ORDER BY ${orderBy}` : ''}`, params);
      return rows.map(fromRow);
    },
    async remove(db, id) {
      await db.runAsync(`DELETE FROM ${name} WHERE ${idCol} = ?`, [id]);
    },
    async count(db, clause, params) {
      const r = await db.getFirstAsync<{ n: number }>(`SELECT COUNT(*) AS n FROM ${name}${clause ? ` WHERE ${clause}` : ''}`, params);
      return r?.n ?? 0;
    },
  };
}
