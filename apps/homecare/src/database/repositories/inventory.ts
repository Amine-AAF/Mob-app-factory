import type { SqlDatabase, SqlValue } from '@factory/storage';

import { newId } from '@/domain/ids';
import type { Money } from '@/domain/money';
import type { InventoryCategory, InventoryItem } from '@/domain/types';

import { createTable, likePattern } from '../table';

export type InventoryInput = Omit<InventoryItem, 'id' | 'homeId' | 'createdAt' | 'updatedAt'>;

export interface InventorySummary {
  items: number;
  quantity: number;
  /** Estimated value per currency (quantity × unit value), never mixed. */
  value: Money[];
  byCategory: { category: InventoryCategory; items: number; quantity: number }[];
}

export function createInventoryRepository(db: SqlDatabase, now: () => Date) {
  const items = createTable<InventoryItem>(db, 'inventory_items');
  const stamp = () => now().toISOString();

  return {
    get: (id: string) => items.get(id),
    count: (homeId: string) => items.count('home_id = ?', [homeId]),

    list(homeId: string, f: { search?: string; category?: InventoryCategory | null; roomId?: string | null } = {}): Promise<InventoryItem[]> {
      const where = ['home_id = ?'];
      const params: SqlValue[] = [homeId];
      if (f.search?.trim()) {
        where.push("(LOWER(name) LIKE ? ESCAPE '\\' OR LOWER(COALESCE(notes,'')) LIKE ? ESCAPE '\\')");
        const p = likePattern(f.search);
        params.push(p, p);
      }
      if (f.category) {
        where.push('category = ?');
        params.push(f.category);
      }
      if (f.roomId) {
        where.push('room_id = ?');
        params.push(f.roomId);
      }
      return items.select(where.join(' AND '), params, 'name COLLATE NOCASE ASC');
    },

    async create(homeId: string, input: InventoryInput): Promise<InventoryItem> {
      const id = newId('i_');
      const ts = stamp();
      await items.insert({ ...input, id, homeId, name: input.name.trim(), quantity: Math.max(1, Math.floor(input.quantity || 1)), createdAt: ts, updatedAt: ts });
      return (await items.get(id)) as InventoryItem;
    },

    async update(id: string, patch: Partial<InventoryInput>): Promise<void> {
      await items.update(id, { ...patch, updatedAt: stamp() });
    },

    remove: (id: string) => items.delete(id),

    async summary(homeId: string): Promise<InventorySummary> {
      const totals = await db.getFirstAsync<{ items: number; quantity: number | null }>('SELECT COUNT(*) AS items, SUM(quantity) AS quantity FROM inventory_items WHERE home_id = ?', [homeId]);
      const value = await db.getAllAsync<{ currency: string; total: number }>(
        'SELECT currency, SUM(quantity * estimated_value_minor) AS total FROM inventory_items WHERE home_id = ? AND estimated_value_minor IS NOT NULL AND currency IS NOT NULL GROUP BY currency ORDER BY total DESC',
        [homeId],
      );
      const byCategory = await db.getAllAsync<{ category: InventoryCategory; items: number; quantity: number }>(
        'SELECT category, COUNT(*) AS items, SUM(quantity) AS quantity FROM inventory_items WHERE home_id = ? GROUP BY category ORDER BY items DESC',
        [homeId],
      );
      return {
        items: totals?.items ?? 0,
        quantity: totals?.quantity ?? 0,
        value: value.map((v) => ({ currency: v.currency, amountMinor: v.total })),
        byCategory,
      };
    },
  };
}

export type InventoryRepository = ReturnType<typeof createInventoryRepository>;
