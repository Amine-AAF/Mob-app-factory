import { fromJson, toJson, type SqlDatabase, type SqlValue } from '@factory/storage';
// Copied from apps/petcare/src/database/table.ts (candidate for @factory/storage, see factory docs §4).

/**
 * Tiny typed mapper between camelCase domain objects and snake_case rows.
 * Column and table names come from code (never from user input) and are
 * checked against an identifier pattern; values are always bound parameters.
 */
export type ColumnType = 'text' | 'int' | 'real' | 'bool' | 'json';

export type ColumnMap<T> = { [K in keyof T]?: readonly [column: string, type: ColumnType] };

const IDENT = /^[a-z_][a-z0-9_]*$/;

function assertIdent(name: string): string {
  if (!IDENT.test(name)) throw new Error(`Unsafe identifier: ${name}`);
  return name;
}

function encode(value: unknown, type: ColumnType): SqlValue {
  if (value === undefined || value === null) return type === 'json' ? '[]' : null;
  switch (type) {
    case 'bool':
      return value ? 1 : 0;
    case 'json':
      return toJson(value);
    case 'int':
      return Math.round(Number(value));
    case 'real':
      return Number(value);
    default:
      return String(value);
  }
}

function decode(value: SqlValue | undefined, type: ColumnType): unknown {
  if (value === undefined || value === null) return type === 'json' ? [] : type === 'bool' ? false : null;
  switch (type) {
    case 'bool':
      return Number(value) === 1;
    case 'json':
      return fromJson(String(value), []);
    case 'int':
    case 'real':
      return Number(value);
    default:
      return String(value);
  }
}

export interface Table<T extends { id: string }> {
  readonly name: string;
  fromRow(row: Record<string, SqlValue>): T;
  toRow(entity: Partial<T>): Record<string, SqlValue>;
  insert(entity: T): Promise<T>;
  update(id: string, patch: Partial<T>): Promise<void>;
  remove(id: string): Promise<void>;
  get(id: string): Promise<T | null>;
  /** `where` is a trusted SQL fragment written in code; values go in `params`. */
  list(where?: string, params?: SqlValue[], orderBy?: string): Promise<T[]>;
  count(where?: string, params?: SqlValue[]): Promise<number>;
}

export function defineTable<T extends { id: string }>(db: SqlDatabase, name: string, columns: ColumnMap<T>): Table<T> {
  assertIdent(name);
  const entries = Object.entries(columns) as [keyof T & string, readonly [string, ColumnType]][];
  entries.forEach(([, [c]]) => assertIdent(c));

  const fromRow = (row: Record<string, SqlValue>): T => {
    const out: Record<string, unknown> = {};
    for (const [field, [column, type]] of entries) out[field] = decode(row[column], type);
    return out as T;
  };

  const toRow = (entity: Partial<T>): Record<string, SqlValue> => {
    const row: Record<string, SqlValue> = {};
    for (const [field, [column, type]] of entries) {
      if (field in entity) row[column] = encode(entity[field], type);
    }
    return row;
  };

  return {
    name,
    fromRow,
    toRow,
    async insert(entity) {
      const row = toRow(entity);
      const keys = Object.keys(row);
      await db.runAsync(`INSERT INTO ${name} (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`, keys.map((k) => row[k] ?? null));
      return entity;
    },
    async update(id, patch) {
      const row = toRow(patch);
      delete row.id;
      const keys = Object.keys(row);
      if (keys.length === 0) return;
      await db.runAsync(`UPDATE ${name} SET ${keys.map((k) => `${k} = ?`).join(', ')} WHERE id = ?`, [...keys.map((k) => row[k] ?? null), id]);
    },
    async remove(id) {
      await db.runAsync(`DELETE FROM ${name} WHERE id = ?`, [id]);
    },
    async get(id) {
      const row = await db.getFirstAsync<Record<string, SqlValue>>(`SELECT * FROM ${name} WHERE id = ?`, [id]);
      return row ? fromRow(row) : null;
    },
    async list(where, params = [], orderBy) {
      const sql = `SELECT * FROM ${name}${where ? ` WHERE ${where}` : ''}${orderBy ? ` ORDER BY ${orderBy}` : ''}`;
      return (await db.getAllAsync<Record<string, SqlValue>>(sql, params)).map(fromRow);
    },
    async count(where, params = []) {
      const r = await db.getFirstAsync<{ n: number }>(`SELECT COUNT(*) AS n FROM ${name}${where ? ` WHERE ${where}` : ''}`, params);
      return Number(r?.n ?? 0);
    },
  };
}
