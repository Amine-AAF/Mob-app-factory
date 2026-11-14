import type { SqlDatabase } from '@factory/storage';

import { newId } from '@/domain/ids';
import type { Category, Tag } from '@/domain/types';

import { bool, clean, nowIso, type Row } from './helpers';

export type TagTable = 'styles' | 'occasions';

const toTag = (r: Row): Tag => ({
  id: String(r.id),
  key: (r.key as string | null) ?? null,
  name: (r.name as string | null) ?? null,
  builtin: bool(r.builtin),
  archived: bool(r.archived),
});

export function createTaxonomyRepository(db: SqlDatabase) {
  return {
    async categories(): Promise<Category[]> {
      const rows = await db.getAllAsync<Row>('SELECT id, key, sort FROM categories ORDER BY sort', []);
      return rows.map((r) => ({ id: String(r.id), key: String(r.key), sort: Number(r.sort) }));
    },

    async tags(table: TagTable, includeArchived = false): Promise<Tag[]> {
      const rows = await db.getAllAsync<Row>(
        `SELECT * FROM ${table} ${includeArchived ? '' : 'WHERE archived = 0'} ORDER BY builtin DESC, created_at, rowid`,
        [],
      );
      return rows.map(toTag);
    },

    /** Adds a custom style/occasion. Returns the existing one if the name is already used. */
    async addTag(table: TagTable, name: string): Promise<Tag> {
      const n = clean(name);
      if (!n) throw new Error('empty_name');
      const existing = await db.getFirstAsync<Row>(`SELECT * FROM ${table} WHERE name = ? COLLATE NOCASE`, [n]);
      if (existing) {
        if (bool(existing.archived)) await db.runAsync(`UPDATE ${table} SET archived = 0 WHERE id = ?`, [String(existing.id)]);
        return { ...toTag(existing), archived: false };
      }
      const id = newId(table === 'styles' ? 'sty' : 'occ');
      await db.runAsync(`INSERT INTO ${table} (id, name, builtin, created_at) VALUES (?, ?, 0, ?)`, [id, n, nowIso()]);
      return { id, key: null, name: n, builtin: false, archived: false };
    },

    async renameTag(table: TagTable, id: string, name: string): Promise<void> {
      const n = clean(name);
      if (!n) throw new Error('empty_name');
      await db.runAsync(`UPDATE ${table} SET name = ? WHERE id = ? AND builtin = 0`, [n, id]);
    },

    /** Archived tags disappear from pickers but stay on items/outfits that use them. */
    async setTagArchived(table: TagTable, id: string, archived: boolean): Promise<void> {
      await db.runAsync(`UPDATE ${table} SET archived = ? WHERE id = ?`, [archived ? 1 : 0, id]);
    },

    async brands(): Promise<{ id: string; name: string; count: number }[]> {
      const rows = await db.getAllAsync<Row>(
        `SELECT b.id, b.name, COUNT(i.id) AS count FROM brands b
         LEFT JOIN wardrobe_items i ON i.brand_id = b.id AND i.archived = 0
         GROUP BY b.id ORDER BY count DESC, b.name COLLATE NOCASE`,
        [],
      );
      return rows.map((r) => ({ id: String(r.id), name: String(r.name), count: Number(r.count) }));
    },

    /** Finds or creates a brand by name (case-insensitive). */
    async brandId(name: string | null): Promise<string | null> {
      const n = clean(name);
      if (!n) return null;
      const existing = await db.getFirstAsync<{ id: string }>('SELECT id FROM brands WHERE name = ? COLLATE NOCASE', [n]);
      if (existing) return existing.id;
      const id = newId('brd');
      await db.runAsync('INSERT INTO brands (id, name, created_at) VALUES (?, ?, ?)', [id, n, nowIso()]);
      return id;
    },

    /** Removes brands no item references anymore. */
    async pruneBrands(): Promise<void> {
      await db.runAsync('DELETE FROM brands WHERE id NOT IN (SELECT brand_id FROM wardrobe_items WHERE brand_id IS NOT NULL)', []);
    },
  };
}
