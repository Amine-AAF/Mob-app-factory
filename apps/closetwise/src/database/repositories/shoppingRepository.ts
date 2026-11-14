import type { SqlDatabase } from '@factory/storage';

import type { WishlistStatus } from '@/domain/catalog';
import { newId } from '@/domain/ids';
import type { ShoppingRecord, WishlistItem } from '@/domain/types';

import { clean, nowIso, type Row } from './helpers';

const toRecord = (r: Row): ShoppingRecord => ({
  id: String(r.id),
  itemName: String(r.item_name),
  itemId: (r.item_id as string | null) ?? null,
  brand: (r.brand as string | null) ?? null,
  categoryId: (r.category_id as string | null) ?? null,
  purchasedOn: String(r.purchased_on),
  price: Number(r.price),
  currency: String(r.currency),
  store: (r.store as string | null) ?? null,
  size: (r.size as string | null) ?? null,
  notes: (r.notes as string | null) ?? null,
  receiptPath: (r.receipt_path as string | null) ?? null,
  createdAt: String(r.created_at),
});

const toWish = (r: Row): WishlistItem => ({
  id: String(r.id),
  name: String(r.name),
  photoPath: (r.photo_path as string | null) ?? null,
  thumbPath: (r.thumb_path as string | null) ?? null,
  brand: (r.brand as string | null) ?? null,
  categoryId: (r.category_id as string | null) ?? null,
  estimatedPrice: r.estimated_price == null ? null : Number(r.estimated_price),
  currency: (r.currency as string | null) ?? null,
  url: (r.url as string | null) ?? null,
  store: (r.store as string | null) ?? null,
  priority: (Number(r.priority) || 2) as 1 | 2 | 3,
  notes: (r.notes as string | null) ?? null,
  status: String(r.status) as WishlistStatus,
  createdAt: String(r.created_at),
  updatedAt: String(r.updated_at),
});

export type ShoppingInput = Omit<ShoppingRecord, 'id' | 'createdAt'>;
export type WishlistInput = Omit<WishlistItem, 'id' | 'createdAt' | 'updatedAt'>;

/** Only http(s) links are kept: no javascript:, intent: or file: URIs. */
export function sanitizeUrl(url: string | null | undefined): string | null {
  const u = clean(url);
  if (!u) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(u) ? u : `https://${u}`;
  return /^https?:\/\/[^\s/$.?#][^\s]*$/i.test(withScheme) ? withScheme : null;
}

export function createShoppingRepository(db: SqlDatabase) {
  return {
    async list(): Promise<ShoppingRecord[]> {
      return (await db.getAllAsync<Row>('SELECT * FROM shopping_records ORDER BY purchased_on DESC, created_at DESC', [])).map(toRecord);
    },
    async get(id: string): Promise<ShoppingRecord | null> {
      const r = await db.getFirstAsync<Row>('SELECT * FROM shopping_records WHERE id = ?', [id]);
      return r ? toRecord(r) : null;
    },
    async save(input: ShoppingInput, id?: string): Promise<string> {
      const name = clean(input.itemName);
      if (!name) throw new Error('name_required');
      if (!Number.isFinite(input.price) || input.price < 0) throw new Error('invalid_price');
      const now = nowIso();
      const v = [name, input.itemId, clean(input.brand), input.categoryId, input.purchasedOn, input.price, input.currency, clean(input.store), clean(input.size), clean(input.notes), input.receiptPath];
      if (id) {
        await db.runAsync(
          'UPDATE shopping_records SET item_name = ?, item_id = ?, brand = ?, category_id = ?, purchased_on = ?, price = ?, currency = ?, store = ?, size = ?, notes = ?, receipt_path = ?, updated_at = ? WHERE id = ?',
          [...v, now, id],
        );
        return id;
      }
      const nid = newId('shp');
      await db.runAsync(
        'INSERT INTO shopping_records (item_name, item_id, brand, category_id, purchased_on, price, currency, store, size, notes, receipt_path, id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [...v, nid, now, now],
      );
      return nid;
    },
    async remove(id: string): Promise<string | null> {
      const r = await db.getFirstAsync<{ receipt_path: string | null }>('SELECT receipt_path FROM shopping_records WHERE id = ?', [id]);
      await db.runAsync('DELETE FROM shopping_records WHERE id = ?', [id]);
      return r?.receipt_path ?? null;
    },
  };
}

export function createWishlistRepository(db: SqlDatabase) {
  return {
    async list(): Promise<WishlistItem[]> {
      return (await db.getAllAsync<Row>('SELECT * FROM wishlist_items ORDER BY CASE status WHEN \'wanted\' THEN 0 WHEN \'planned\' THEN 1 WHEN \'purchased\' THEN 2 ELSE 3 END, priority, created_at DESC', [])).map(toWish);
    },
    async get(id: string): Promise<WishlistItem | null> {
      const r = await db.getFirstAsync<Row>('SELECT * FROM wishlist_items WHERE id = ?', [id]);
      return r ? toWish(r) : null;
    },
    async save(input: WishlistInput, id?: string): Promise<string> {
      const name = clean(input.name);
      if (!name) throw new Error('name_required');
      const now = nowIso();
      const v = [
        name,
        input.photoPath,
        input.thumbPath,
        clean(input.brand),
        input.categoryId,
        input.estimatedPrice,
        input.currency,
        sanitizeUrl(input.url),
        clean(input.store),
        input.priority,
        clean(input.notes),
        input.status,
      ];
      if (id) {
        await db.runAsync(
          'UPDATE wishlist_items SET name = ?, photo_path = ?, thumb_path = ?, brand = ?, category_id = ?, estimated_price = ?, currency = ?, url = ?, store = ?, priority = ?, notes = ?, status = ?, updated_at = ? WHERE id = ?',
          [...v, now, id],
        );
        return id;
      }
      const nid = newId('wsh');
      await db.runAsync(
        'INSERT INTO wishlist_items (name, photo_path, thumb_path, brand, category_id, estimated_price, currency, url, store, priority, notes, status, id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [...v, nid, now, now],
      );
      return nid;
    },
    async setStatus(id: string, status: WishlistStatus): Promise<void> {
      await db.runAsync('UPDATE wishlist_items SET status = ?, updated_at = ? WHERE id = ?', [status, nowIso(), id]);
    },
    async remove(id: string): Promise<{ photoPath: string | null; thumbPath: string | null } | null> {
      const w = await this.get(id);
      await db.runAsync('DELETE FROM wishlist_items WHERE id = ?', [id]);
      return w ? { photoPath: w.photoPath, thumbPath: w.thumbPath } : null;
    },
  };
}
