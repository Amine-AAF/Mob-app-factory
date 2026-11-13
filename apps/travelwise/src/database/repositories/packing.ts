import { placeholders, type SqlDatabase } from '@factory/storage';

import { PACKING_CATEGORIES, PRIORITIES, type PackingCategory, type Priority } from '@/constants/domain';
import { catalogName, templateItems, type PackingTemplateKey } from '@/content/packingCatalog';
import type { Id, PackingItem, PackingList } from '@/types/models';
import { clock } from '@/utils/clock';
import { createId } from '@/utils/ids';

import { bool } from '../rows';

export type PackingValidationCode = 'name_required' | 'name_too_long' | 'invalid_quantity' | 'invalid_category' | 'invalid_priority' | 'not_found';

export class PackingValidationError extends Error {
  constructor(
    public readonly code: PackingValidationCode,
    public readonly field?: string,
  ) {
    super(`Invalid packing data: ${code}`);
    this.name = 'PackingValidationError';
  }
}

interface ListRow {
  id: string;
  trip_id: string | null;
  name: string;
  is_template: number;
  template_key: string | null;
  created_at: string;
}

interface ItemRow {
  id: string;
  list_id: string;
  name: string;
  category: string;
  quantity: number;
  notes: string;
  priority: string;
  packed: number;
  position: number;
}

const toList = (r: ListRow): PackingList => ({ id: r.id, tripId: r.trip_id, name: r.name, isTemplate: r.is_template === 1, templateKey: r.template_key, createdAt: r.created_at });
const toItem = (r: ItemRow): PackingItem => ({
  id: r.id,
  listId: r.list_id,
  name: r.name,
  category: r.category as PackingCategory,
  quantity: r.quantity,
  notes: r.notes,
  priority: r.priority as Priority,
  packed: r.packed === 1,
  position: r.position,
});

export interface PackingItemInput {
  name: string;
  category?: PackingCategory;
  quantity?: number;
  notes?: string;
  priority?: Priority;
  packed?: boolean;
}

export interface PackingListWithItems extends PackingList {
  items: PackingItem[];
  packed: number;
  total: number;
}

const MAX_NAME = 120;

function normalizeItem(input: PackingItemInput) {
  const name = input.name.trim();
  if (!name) throw new PackingValidationError('name_required', 'name');
  if (name.length > MAX_NAME) throw new PackingValidationError('name_too_long', 'name');
  const quantity = input.quantity ?? 1;
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) throw new PackingValidationError('invalid_quantity', 'quantity');
  const category = input.category ?? 'custom';
  if (!PACKING_CATEGORIES.includes(category)) throw new PackingValidationError('invalid_category', 'category');
  const priority = input.priority ?? 'medium';
  if (!PRIORITIES.includes(priority)) throw new PackingValidationError('invalid_priority', 'priority');
  return { name, quantity, category, priority, notes: input.notes?.trim() ?? '', packed: !!input.packed };
}

/** Packing progress as a ratio, null for an empty list (never a made-up value). */
export function packingProgress(items: Pick<PackingItem, 'packed'>[]): number | null {
  return items.length ? items.filter((i) => i.packed).length / items.length : null;
}

export function createPackingRepository(db: SqlDatabase) {
  async function insertItems(listId: Id, items: ReturnType<typeof normalizeItem>[], start = 0) {
    for (const [i, it] of items.entries()) {
      await db.runAsync('INSERT INTO packing_items (id, list_id, name, category, quantity, notes, priority, packed, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [
        createId(),
        listId,
        it.name,
        it.category,
        it.quantity,
        it.notes,
        it.priority,
        bool(it.packed),
        start + i,
      ]);
    }
  }

  async function withItems(lists: PackingList[]): Promise<PackingListWithItems[]> {
    if (!lists.length) return [];
    const rows = await db.getAllAsync<ItemRow>(`SELECT * FROM packing_items WHERE list_id IN ${placeholders(lists.length)} ORDER BY position`, lists.map((l) => l.id));
    const by = new Map<Id, PackingItem[]>();
    for (const it of rows.map(toItem)) by.set(it.listId, [...(by.get(it.listId) ?? []), it]);
    return lists.map((l) => {
      const items = by.get(l.id) ?? [];
      return { ...l, items, packed: items.filter((i) => i.packed).length, total: items.length };
    });
  }

  async function listRow(id: Id) {
    const row = await db.getFirstAsync<ListRow>('SELECT * FROM packing_lists WHERE id = ?', [id]);
    if (!row) throw new PackingValidationError('not_found');
    return row;
  }

  const repo = {
    async listsForTrip(tripId: Id): Promise<PackingListWithItems[]> {
      const rows = await db.getAllAsync<ListRow>('SELECT * FROM packing_lists WHERE trip_id = ? AND is_template = 0 ORDER BY created_at', [tripId]);
      return withItems(rows.map(toList));
    },

    async getList(id: Id): Promise<PackingListWithItems | null> {
      const row = await db.getFirstAsync<ListRow>('SELECT * FROM packing_lists WHERE id = ?', [id]);
      return row ? (await withItems([toList(row)]))[0]! : null;
    },

    /** User-made templates (lists saved with `is_template = 1`, not attached to a trip). */
    async userTemplates(): Promise<PackingListWithItems[]> {
      const rows = await db.getAllAsync<ListRow>('SELECT * FROM packing_lists WHERE is_template = 1 ORDER BY name', []);
      return withItems(rows.map(toList));
    },

    async createList(tripId: Id, name: string, items: PackingItemInput[] = []): Promise<PackingListWithItems> {
      const n = name.trim();
      if (!n) throw new PackingValidationError('name_required', 'name');
      const normalized = items.map(normalizeItem);
      const id = createId();
      await db.withTransactionAsync(async () => {
        await db.runAsync('INSERT INTO packing_lists (id, trip_id, name, is_template, template_key, created_at) VALUES (?, ?, ?, 0, NULL, ?)', [id, tripId, n, clock.instant()]);
        await insertItems(id, normalized);
      });
      return (await repo.getList(id))!;
    },

    /** Creates a trip list from a built-in template, names copied in the user's language. */
    async createFromBuiltIn(tripId: Id, key: PackingTemplateKey, name: string, lang: string): Promise<PackingListWithItems> {
      const items = templateItems(key).map((c) => ({ name: catalogName(c, lang), category: c.category, priority: c.priority, quantity: c.quantity ?? 1 }));
      const list = await repo.createList(tripId, name, items);
      await db.runAsync('UPDATE packing_lists SET template_key = ? WHERE id = ?', [key, list.id]);
      return (await repo.getList(list.id))!;
    },

    /** Creates a trip list from one of the user's own templates (nothing packed). */
    async createFromUserTemplate(tripId: Id, templateId: Id, name?: string): Promise<PackingListWithItems> {
      const tpl = await repo.getList(templateId);
      if (!tpl || !tpl.isTemplate) throw new PackingValidationError('not_found');
      return repo.createList(tripId, name?.trim() || tpl.name, tpl.items.map((i) => ({ ...i, packed: false })));
    },

    /** Saves a copy of a list as a reusable personal template (unpacked). */
    async saveAsTemplate(listId: Id, name: string): Promise<PackingListWithItems> {
      const src = await repo.getList(listId);
      if (!src) throw new PackingValidationError('not_found');
      const n = name.trim();
      if (!n) throw new PackingValidationError('name_required', 'name');
      const id = createId();
      await db.withTransactionAsync(async () => {
        await db.runAsync('INSERT INTO packing_lists (id, trip_id, name, is_template, template_key, created_at) VALUES (?, NULL, ?, 1, NULL, ?)', [id, n, clock.instant()]);
        await insertItems(id, src.items.map((i) => normalizeItem({ ...i, packed: false })));
      });
      return (await repo.getList(id))!;
    },

    async renameList(id: Id, name: string): Promise<void> {
      await listRow(id);
      const n = name.trim();
      if (!n) throw new PackingValidationError('name_required', 'name');
      await db.runAsync('UPDATE packing_lists SET name = ? WHERE id = ?', [n, id]);
    },

    async deleteList(id: Id): Promise<void> {
      await db.runAsync('DELETE FROM packing_lists WHERE id = ?', [id]);
    },

    async addItem(listId: Id, input: PackingItemInput): Promise<PackingItem> {
      await listRow(listId);
      const it = normalizeItem(input);
      const pos = (await db.getFirstAsync<{ p: number | null }>('SELECT MAX(position) AS p FROM packing_items WHERE list_id = ?', [listId]))?.p ?? -1;
      const id = createId();
      await db.runAsync('INSERT INTO packing_items (id, list_id, name, category, quantity, notes, priority, packed, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [
        id,
        listId,
        it.name,
        it.category,
        it.quantity,
        it.notes,
        it.priority,
        bool(it.packed),
        pos + 1,
      ]);
      return toItem((await db.getFirstAsync<ItemRow>('SELECT * FROM packing_items WHERE id = ?', [id]))!);
    },

    async updateItem(id: Id, input: PackingItemInput): Promise<void> {
      const it = normalizeItem(input);
      const r = await db.runAsync('UPDATE packing_items SET name = ?, category = ?, quantity = ?, notes = ?, priority = ?, packed = ? WHERE id = ?', [
        it.name,
        it.category,
        it.quantity,
        it.notes,
        it.priority,
        bool(it.packed),
        id,
      ]);
      if (!r.changes) throw new PackingValidationError('not_found');
    },

    async setPacked(id: Id, packed: boolean): Promise<void> {
      await db.runAsync('UPDATE packing_items SET packed = ? WHERE id = ?', [bool(packed), id]);
    },

    async deleteItem(id: Id): Promise<void> {
      await db.runAsync('DELETE FROM packing_items WHERE id = ?', [id]);
    },

    /** Unpacks everything (e.g. before the return trip). */
    async resetList(listId: Id): Promise<void> {
      await db.runAsync('UPDATE packing_items SET packed = 0 WHERE list_id = ?', [listId]);
    },
  };
  return repo;
}

export type PackingRepository = ReturnType<typeof createPackingRepository>;
