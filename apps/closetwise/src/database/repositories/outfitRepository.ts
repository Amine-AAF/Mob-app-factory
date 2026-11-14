import type { SqlDatabase } from '@factory/storage';

import type { Slot } from '@/domain/catalog';
import { newId } from '@/domain/ids';
import { signatureOf } from '@/domain/suggestions';
import type { Outfit, OutfitInput, OutfitItemRef } from '@/domain/types';

import { bool, clean, nowIso, type Row } from './helpers';

const SELECT = `
  SELECT o.*,
    (SELECT COUNT(DISTINCT worn_on) FROM outfit_usage_history u WHERE u.outfit_id = o.id) AS wear_count,
    (SELECT MAX(worn_on) FROM outfit_usage_history u WHERE u.outfit_id = o.id) AS last_worn_on
  FROM outfits o`;

export function createOutfitRepository(db: SqlDatabase) {
  async function itemsFor(outfitIds: readonly string[]): Promise<Map<string, OutfitItemRef[]>> {
    const map = new Map<string, OutfitItemRef[]>();
    if (outfitIds.length === 0) return map;
    const rows = await db.getAllAsync<Row>(
      `SELECT outfit_id, item_id, slot, position FROM outfit_items WHERE outfit_id IN (${outfitIds.map(() => '?').join(',')}) ORDER BY position`,
      [...outfitIds],
    );
    for (const r of rows) {
      const list = map.get(String(r.outfit_id)) ?? [];
      list.push({ itemId: String(r.item_id), slot: String(r.slot) as Slot, position: Number(r.position) });
      map.set(String(r.outfit_id), list);
    }
    return map;
  }

  function toOutfit(r: Row, items: OutfitItemRef[]): Outfit {
    return {
      id: String(r.id),
      name: String(r.name),
      styleId: (r.style_id as string | null) ?? null,
      occasionId: (r.occasion_id as string | null) ?? null,
      seasons: Number(r.seasons ?? 0),
      notes: (r.notes as string | null) ?? null,
      favorite: bool(r.favorite),
      source: r.source === 'suggestion' ? 'suggestion' : 'manual',
      items,
      createdAt: String(r.created_at),
      updatedAt: String(r.updated_at),
      wearCount: Number(r.wear_count ?? 0),
      lastWornOn: (r.last_worn_on as string | null) ?? null,
    };
  }

  async function writeItems(outfitId: string, items: readonly OutfitItemRef[]) {
    await db.runAsync('DELETE FROM outfit_items WHERE outfit_id = ?', [outfitId]);
    const seen = new Set<string>();
    let position = 0;
    for (const it of items) {
      if (seen.has(it.itemId)) continue;
      seen.add(it.itemId);
      await db.runAsync('INSERT INTO outfit_items (outfit_id, item_id, slot, position) VALUES (?, ?, ?, ?)', [outfitId, it.itemId, it.slot, position++]);
    }
  }

  const repo = {
    async list(): Promise<Outfit[]> {
      const rows = await db.getAllAsync<Row>(`${SELECT} ORDER BY o.created_at DESC, o.id`, []);
      const items = await itemsFor(rows.map((r) => String(r.id)));
      return rows.map((r) => toOutfit(r, items.get(String(r.id)) ?? []));
    },

    async get(id: string): Promise<Outfit | null> {
      const r = await db.getFirstAsync<Row>(`${SELECT} WHERE o.id = ?`, [id]);
      if (!r) return null;
      return toOutfit(r, (await itemsFor([id])).get(id) ?? []);
    },

    async count(): Promise<number> {
      return (await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM outfits', []))?.n ?? 0;
    },

    async create(input: OutfitInput): Promise<string> {
      if (!clean(input.name)) throw new Error('name_required');
      if (input.items.length === 0) throw new Error('items_required');
      const id = newId('out');
      const now = nowIso();
      await db.withTransactionAsync(async () => {
        await db.runAsync(
          'INSERT INTO outfits (id, name, style_id, occasion_id, seasons, notes, favorite, source, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [id, clean(input.name)!, input.styleId, input.occasionId, input.seasons, clean(input.notes), input.favorite ? 1 : 0, input.source, now, now],
        );
        await writeItems(id, input.items);
      });
      return id;
    },

    async update(id: string, input: OutfitInput): Promise<void> {
      if (!clean(input.name)) throw new Error('name_required');
      if (input.items.length === 0) throw new Error('items_required');
      await db.withTransactionAsync(async () => {
        await db.runAsync('UPDATE outfits SET name = ?, style_id = ?, occasion_id = ?, seasons = ?, notes = ?, favorite = ?, updated_at = ? WHERE id = ?', [
          clean(input.name)!,
          input.styleId,
          input.occasionId,
          input.seasons,
          clean(input.notes),
          input.favorite ? 1 : 0,
          nowIso(),
          id,
        ]);
        await writeItems(id, input.items);
      });
    },

    async duplicate(id: string, copyName: string): Promise<string | null> {
      const o = await repo.get(id);
      if (!o) return null;
      return repo.create({ ...o, name: copyName, favorite: false, source: 'manual' });
    },

    async setFavorite(id: string, favorite: boolean): Promise<void> {
      await db.runAsync('UPDATE outfits SET favorite = ?, updated_at = ? WHERE id = ?', [favorite ? 1 : 0, nowIso(), id]);
    },

    async remove(id: string): Promise<void> {
      await db.runAsync('DELETE FROM outfits WHERE id = ?', [id]);
    },

    /** Outfits are emptied when all their items were deleted: remove those. */
    async removeEmpty(): Promise<number> {
      const r = await db.runAsync('DELETE FROM outfits WHERE id NOT IN (SELECT DISTINCT outfit_id FROM outfit_items)', []);
      return r.changes;
    },

    async signatures(): Promise<Set<string>> {
      const outfits = await repo.list();
      return new Set(outfits.map((o) => signatureOf(o.items.map((i) => i.itemId))));
    },

    async containingItem(itemId: string): Promise<string[]> {
      const rows = await db.getAllAsync<{ outfit_id: string }>('SELECT outfit_id FROM outfit_items WHERE item_id = ?', [itemId]);
      return rows.map((r) => r.outfit_id);
    },
  };
  return repo;
}
