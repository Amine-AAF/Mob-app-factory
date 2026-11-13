import type { SqlDatabase } from '@factory/storage';

import { combineQuantities, planRegeneration, type GroceryDraft } from '@/domain/grocery';
import type { DayKey, GroceryCategory, GroceryItem, GroceryList, UnitId, UnitSystem } from '@/domain/types';

interface ListRow {
  id: number;
  name: string;
  start_day: string | null;
  end_day: string | null;
  completed_at: string | null;
  spent: number | null;
  created_at: string;
}
interface ItemRow {
  id: number;
  list_id: number;
  key: string;
  name: string;
  category: string;
  quantity: number | null;
  unit: string;
  checked: number;
  price: number | null;
  manual: number;
  note: string | null;
  position: number;
}

const toList = (r: ListRow): GroceryList => ({ id: r.id, name: r.name, createdAt: r.created_at, startDay: r.start_day, endDay: r.end_day, completedAt: r.completed_at, spent: r.spent });
const toItem = (r: ItemRow): GroceryItem => ({
  id: r.id,
  listId: r.list_id,
  key: r.key,
  name: r.name,
  category: r.category as GroceryCategory,
  quantity: r.quantity,
  unit: r.unit as UnitId,
  checked: r.checked === 1,
  price: r.price,
  manual: r.manual === 1,
  note: r.note,
  position: r.position,
});

export interface ManualItemInput {
  key: string;
  name: string;
  category: GroceryCategory;
  quantity: number | null;
  unit: UnitId;
  price?: number | null;
  note?: string | null;
}

export function createGroceryRepository(db: SqlDatabase) {
  const touch = (listId: number, now: Date) => db.runAsync('UPDATE grocery_lists SET updated_at = ? WHERE id = ?', [now.toISOString(), listId]);

  const insertItem = async (listId: number, d: GroceryDraft | ManualItemInput, manual: boolean, position: number) => {
    const res = await db.runAsync(
      'INSERT INTO grocery_items (list_id, key, name, category, quantity, unit, checked, price, manual, note, position) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)',
      [listId, d.key, d.name, d.category, d.quantity, d.unit, 'price' in d ? (d.price ?? null) : null, manual ? 1 : 0, 'note' in d ? (d.note ?? null) : null, position],
    );
    return res.lastInsertRowId;
  };

  const repo = {
    async lists(): Promise<GroceryList[]> {
      return (await db.getAllAsync<ListRow>('SELECT * FROM grocery_lists ORDER BY created_at DESC, id DESC', [])).map(toList);
    },
    async getList(id: number): Promise<GroceryList | null> {
      const r = await db.getFirstAsync<ListRow>('SELECT * FROM grocery_lists WHERE id = ?', [id]);
      return r ? toList(r) : null;
    },
    /** The list being shopped: the most recent one not completed. */
    async active(): Promise<GroceryList | null> {
      const r = await db.getFirstAsync<ListRow>('SELECT * FROM grocery_lists WHERE completed_at IS NULL ORDER BY created_at DESC, id DESC LIMIT 1', []);
      return r ? toList(r) : null;
    },
    async items(listId: number): Promise<GroceryItem[]> {
      return (await db.getAllAsync<ItemRow>('SELECT * FROM grocery_items WHERE list_id = ? ORDER BY position, id', [listId])).map(toItem);
    },
    async item(id: number): Promise<GroceryItem | null> {
      const r = await db.getFirstAsync<ItemRow>('SELECT * FROM grocery_items WHERE id = ?', [id]);
      return r ? toItem(r) : null;
    },
    async summaries(): Promise<(GroceryList & { total: number; done: number; estimated: number | null })[]> {
      const rows = await db.getAllAsync<ListRow & { total: number; done: number; estimated: number | null }>(
        `SELECT l.*, COUNT(i.id) AS total, COALESCE(SUM(i.checked), 0) AS done, SUM(i.price) AS estimated
         FROM grocery_lists l LEFT JOIN grocery_items i ON i.list_id = l.id GROUP BY l.id ORDER BY l.created_at DESC, l.id DESC`,
        [],
      );
      return rows.map((r) => ({ ...toList(r), total: r.total, done: r.done, estimated: r.estimated }));
    },
    async createList(name: string, range: { start: DayKey | null; end: DayKey | null }, drafts: readonly GroceryDraft[] = [], now = new Date()): Promise<number> {
      let id = 0;
      await db.withTransactionAsync(async () => {
        const ts = now.toISOString();
        const res = await db.runAsync('INSERT INTO grocery_lists (name, start_day, end_day, completed_at, spent, created_at, updated_at) VALUES (?, ?, ?, NULL, NULL, ?, ?)', [
          name.trim() || 'List',
          range.start,
          range.end,
          ts,
          ts,
        ]);
        id = res.lastInsertRowId;
        let pos = 0;
        for (const d of drafts) await insertItem(id, d, false, pos++);
      });
      return id;
    },
    /** Replaces generated items with a fresh generation, keeping manual items and user edits. */
    async regenerate(listId: number, drafts: readonly GroceryDraft[], range: { start: DayKey | null; end: DayKey | null }, now = new Date()): Promise<void> {
      const existing = await repo.items(listId);
      const plan = planRegeneration(existing, drafts);
      await db.withTransactionAsync(async () => {
        for (const id of plan.remove) await db.runAsync('DELETE FROM grocery_items WHERE id = ?', [id]);
        for (const { id, draft } of plan.update) {
          await db.runAsync('UPDATE grocery_items SET name = ?, category = ?, quantity = ?, unit = ? WHERE id = ?', [draft.name, draft.category, draft.quantity, draft.unit, id]);
        }
        let pos = existing.length;
        for (const d of plan.insert) await insertItem(listId, d, false, pos++);
        await db.runAsync('UPDATE grocery_lists SET start_day = ?, end_day = ?, updated_at = ? WHERE id = ?', [range.start, range.end, now.toISOString(), listId]);
      });
    },
    /**
     * Adds a manual item. If the same ingredient is already on the list (unchecked)
     * with a compatible unit, quantities are added; otherwise a separate line is created.
     */
    async addManual(listId: number, input: ManualItemInput, system: UnitSystem, now = new Date()): Promise<{ id: number; merged: boolean }> {
      const same = (await repo.items(listId)).filter((i) => i.key === input.key && !i.checked);
      for (const item of same) {
        const combined = combineQuantities(item, input, system);
        if (combined) {
          await db.runAsync('UPDATE grocery_items SET quantity = ?, unit = ? WHERE id = ?', [combined.quantity, combined.unit, item.id]);
          await touch(listId, now);
          return { id: item.id, merged: true };
        }
      }
      const pos = ((await db.getFirstAsync<{ p: number | null }>('SELECT MAX(position) AS p FROM grocery_items WHERE list_id = ?', [listId]))?.p ?? -1) + 1;
      const id = await insertItem(listId, input, true, pos);
      await touch(listId, now);
      return { id, merged: false };
    },
    async updateItem(id: number, patch: Partial<Pick<GroceryItem, 'name' | 'quantity' | 'unit' | 'category' | 'price' | 'note' | 'checked'>>): Promise<void> {
      const r = await db.getFirstAsync<ItemRow>('SELECT * FROM grocery_items WHERE id = ?', [id]);
      if (!r) return;
      const next = { ...toItem(r), ...patch };
      await db.runAsync('UPDATE grocery_items SET name = ?, quantity = ?, unit = ?, category = ?, price = ?, note = ?, checked = ? WHERE id = ?', [
        next.name.trim() || r.name,
        next.unit === 'to_taste' ? null : next.quantity,
        next.unit,
        next.category,
        next.price,
        next.note,
        next.checked ? 1 : 0,
        id,
      ]);
    },
    async toggle(id: number): Promise<void> {
      await db.runAsync('UPDATE grocery_items SET checked = 1 - checked WHERE id = ?', [id]);
    },
    async removeItem(id: number): Promise<void> {
      await db.runAsync('DELETE FROM grocery_items WHERE id = ?', [id]);
    },
    async uncheckAll(listId: number): Promise<void> {
      await db.runAsync('UPDATE grocery_items SET checked = 0 WHERE list_id = ?', [listId]);
    },
    async removeChecked(listId: number): Promise<number> {
      return (await db.runAsync('DELETE FROM grocery_items WHERE list_id = ? AND checked = 1', [listId])).changes;
    },
    async rename(listId: number, name: string, now = new Date()): Promise<void> {
      if (!name.trim()) return;
      await db.runAsync('UPDATE grocery_lists SET name = ?, updated_at = ? WHERE id = ?', [name.trim(), now.toISOString(), listId]);
    },
    /** Marks the list as done; an amount spent is also recorded as an expense for the budget. */
    async complete(listId: number, spent: number | null, day: DayKey, now = new Date()): Promise<void> {
      await db.withTransactionAsync(async () => {
        await db.runAsync('UPDATE grocery_lists SET completed_at = ?, spent = ?, updated_at = ? WHERE id = ?', [now.toISOString(), spent, now.toISOString(), listId]);
        if (spent !== null && spent > 0) {
          await db.runAsync('INSERT INTO expenses (day, amount, note, list_id, created_at) VALUES (?, ?, NULL, ?, ?)', [day, spent, listId, now.toISOString()]);
        }
      });
    },
    async reopen(listId: number, now = new Date()): Promise<void> {
      await db.runAsync('UPDATE grocery_lists SET completed_at = NULL, updated_at = ? WHERE id = ?', [now.toISOString(), listId]);
    },
    /** Starts a new list from an old one (all items unchecked, prices kept). */
    async reuse(listId: number, name: string, now = new Date()): Promise<number> {
      const items = await repo.items(listId);
      let id = 0;
      await db.withTransactionAsync(async () => {
        const ts = now.toISOString();
        id = (await db.runAsync('INSERT INTO grocery_lists (name, start_day, end_day, completed_at, spent, created_at, updated_at) VALUES (?, NULL, NULL, NULL, NULL, ?, ?)', [name, ts, ts]))
          .lastInsertRowId;
        let pos = 0;
        for (const i of items) {
          await db.runAsync(
            'INSERT INTO grocery_items (list_id, key, name, category, quantity, unit, checked, price, manual, note, position) VALUES (?, ?, ?, ?, ?, ?, 0, ?, 1, ?, ?)',
            [id, i.key, i.name, i.category, i.quantity, i.unit, i.price, i.note, pos++],
          );
        }
      });
      return id;
    },
    async removeList(listId: number): Promise<void> {
      await db.runAsync('DELETE FROM grocery_lists WHERE id = ?', [listId]);
    },
  };
  return repo;
}

export type GroceryRepository = ReturnType<typeof createGroceryRepository>;
