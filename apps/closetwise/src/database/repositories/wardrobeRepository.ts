import { toJson, type SqlDatabase } from '@factory/storage';

import type { CareStatus, Condition, SizeSystem } from '@/domain/catalog';
import { newId } from '@/domain/ids';
import type { WardrobeItem, WardrobeItemInput } from '@/domain/types';

import { bool, clean, nowIso, strArray, type Row } from './helpers';
import type { createTaxonomyRepository } from './taxonomyRepository';

const SELECT = `
  SELECT i.*, b.name AS brand_name,
    (SELECT COUNT(*) FROM outfit_usage_history u WHERE u.item_id = i.id) AS wear_count,
    (SELECT MAX(worn_on) FROM outfit_usage_history u WHERE u.item_id = i.id) AS last_worn_on,
    (SELECT group_concat(occasion_id) FROM item_occasions io WHERE io.item_id = i.id) AS occasion_ids
  FROM wardrobe_items i
  LEFT JOIN brands b ON b.id = i.brand_id`;

export function toItem(r: Row): WardrobeItem {
  return {
    id: String(r.id),
    name: String(r.name),
    categoryId: String(r.category_id),
    subcategory: (r.subcategory as string | null) ?? null,
    primaryColor: (r.primary_color as string | null) ?? null,
    secondaryColors: strArray(r.secondary_colors),
    brandId: (r.brand_id as string | null) ?? null,
    brandName: (r.brand_name as string | null) ?? null,
    size: (r.size as string | null) ?? null,
    sizeSystem: (r.size_system as SizeSystem | null) ?? null,
    seasons: Number(r.seasons ?? 0),
    styleId: (r.style_id as string | null) ?? null,
    occasionIds: r.occasion_ids ? String(r.occasion_ids).split(',').sort() : [],
    purchaseDate: (r.purchase_date as string | null) ?? null,
    purchasePrice: r.purchase_price == null ? null : Number(r.purchase_price),
    currency: (r.currency as string | null) ?? null,
    condition: (r.condition as Condition | null) ?? null,
    notes: (r.notes as string | null) ?? null,
    photoPath: (r.photo_path as string | null) ?? null,
    thumbPath: (r.thumb_path as string | null) ?? null,
    favorite: bool(r.favorite),
    archived: bool(r.archived),
    careStatus: ((r.care_status as CareStatus | null) ?? 'clean') as CareStatus,
    createdAt: String(r.created_at),
    updatedAt: String(r.updated_at),
    wearCount: Number(r.wear_count ?? 0),
    lastWornOn: (r.last_worn_on as string | null) ?? null,
  };
}

export function createWardrobeRepository(db: SqlDatabase, taxonomy: ReturnType<typeof createTaxonomyRepository>) {
  async function writeOccasions(itemId: string, occasionIds: readonly string[]) {
    await db.runAsync('DELETE FROM item_occasions WHERE item_id = ?', [itemId]);
    for (const occ of new Set(occasionIds)) {
      await db.runAsync('INSERT OR IGNORE INTO item_occasions (item_id, occasion_id) VALUES (?, ?)', [itemId, occ]);
    }
  }

  function values(input: WardrobeItemInput, brandId: string | null) {
    return [
      clean(input.name) ?? '',
      input.categoryId,
      clean(input.subcategory),
      input.primaryColor,
      toJson([...new Set(input.secondaryColors.filter((c) => c !== input.primaryColor))]),
      brandId,
      clean(input.size),
      input.sizeSystem,
      input.seasons,
      input.styleId,
      input.purchaseDate,
      input.purchasePrice,
      input.purchasePrice == null ? (input.currency ?? null) : input.currency,
      input.condition,
      clean(input.notes),
      input.photoPath,
      input.thumbPath,
      input.favorite ? 1 : 0,
      input.archived ? 1 : 0,
      input.careStatus,
    ];
  }

  const repo = {
    async list(opts: { archived?: boolean | 'all' } = {}): Promise<WardrobeItem[]> {
      const archived = opts.archived ?? false;
      const where = archived === 'all' ? '' : `WHERE i.archived = ${archived ? 1 : 0}`;
      const rows = await db.getAllAsync<Row>(`${SELECT} ${where} ORDER BY i.created_at DESC, i.id`, []);
      return rows.map(toItem);
    },

    async get(id: string): Promise<WardrobeItem | null> {
      const r = await db.getFirstAsync<Row>(`${SELECT} WHERE i.id = ?`, [id]);
      return r ? toItem(r) : null;
    },

    async getMany(ids: readonly string[]): Promise<WardrobeItem[]> {
      if (ids.length === 0) return [];
      const rows = await db.getAllAsync<Row>(`${SELECT} WHERE i.id IN (${ids.map(() => '?').join(',')})`, [...ids]);
      return rows.map(toItem);
    },

    async count(includeArchived = false): Promise<number> {
      const r = await db.getFirstAsync<{ n: number }>(`SELECT COUNT(*) AS n FROM wardrobe_items ${includeArchived ? '' : 'WHERE archived = 0'}`, []);
      return r?.n ?? 0;
    },

    async create(input: WardrobeItemInput): Promise<string> {
      if (!clean(input.name)) throw new Error('name_required');
      const id = newId('itm');
      const now = nowIso();
      await db.withTransactionAsync(async () => {
        const brandId = await taxonomy.brandId(input.brandName);
        await db.runAsync(
          `INSERT INTO wardrobe_items (name, category_id, subcategory, primary_color, secondary_colors, brand_id, size, size_system, seasons,
            style_id, purchase_date, purchase_price, currency, condition, notes, photo_path, thumb_path, favorite, archived, care_status,
            id, created_at, updated_at) VALUES (${Array.from({ length: 23 }, () => '?').join(',')})`,
          [...values(input, brandId), id, now, now],
        );
        await writeOccasions(id, input.occasionIds);
      });
      return id;
    },

    async update(id: string, input: WardrobeItemInput): Promise<void> {
      if (!clean(input.name)) throw new Error('name_required');
      await db.withTransactionAsync(async () => {
        const brandId = await taxonomy.brandId(input.brandName);
        await db.runAsync(
          `UPDATE wardrobe_items SET name = ?, category_id = ?, subcategory = ?, primary_color = ?, secondary_colors = ?, brand_id = ?, size = ?,
            size_system = ?, seasons = ?, style_id = ?, purchase_date = ?, purchase_price = ?, currency = ?, condition = ?, notes = ?,
            photo_path = ?, thumb_path = ?, favorite = ?, archived = ?, care_status = ?, updated_at = ? WHERE id = ?`,
          [...values(input, brandId), nowIso(), id],
        );
        await writeOccasions(id, input.occasionIds);
        await taxonomy.pruneBrands();
      });
    },

    async setFavorite(id: string, favorite: boolean): Promise<void> {
      await db.runAsync('UPDATE wardrobe_items SET favorite = ?, updated_at = ? WHERE id = ?', [favorite ? 1 : 0, nowIso(), id]);
    },

    async setArchived(id: string, archived: boolean): Promise<void> {
      await db.runAsync('UPDATE wardrobe_items SET archived = ?, updated_at = ? WHERE id = ?', [archived ? 1 : 0, nowIso(), id]);
    },

    async setCareStatus(ids: readonly string[], status: CareStatus): Promise<void> {
      if (ids.length === 0) return;
      await db.runAsync(`UPDATE wardrobe_items SET care_status = ?, updated_at = ? WHERE id IN (${ids.map(() => '?').join(',')})`, [status, nowIso(), ...ids]);
    },

    async setPhoto(id: string, photoPath: string | null, thumbPath: string | null): Promise<void> {
      await db.runAsync('UPDATE wardrobe_items SET photo_path = ?, thumb_path = ?, updated_at = ? WHERE id = ?', [photoPath, thumbPath, nowIso(), id]);
    },

    /** Deletes the item; outfits/plans/usage referencing it are cleaned by FK cascades. Returns its files. */
    async remove(id: string): Promise<{ photoPath: string | null; thumbPath: string | null } | null> {
      const item = await repo.get(id);
      if (!item) return null;
      await db.withTransactionAsync(async () => {
        await db.runAsync('DELETE FROM wardrobe_items WHERE id = ?', [id]);
        await taxonomy.pruneBrands();
      });
      return { photoPath: item.photoPath, thumbPath: item.thumbPath };
    },

    async subcategories(categoryId: string): Promise<string[]> {
      const rows = await db.getAllAsync<{ s: string }>(
        'SELECT DISTINCT subcategory AS s FROM wardrobe_items WHERE category_id = ? AND subcategory IS NOT NULL ORDER BY s COLLATE NOCASE',
        [categoryId],
      );
      return rows.map((r) => r.s);
    },
  };
  return repo;
}
