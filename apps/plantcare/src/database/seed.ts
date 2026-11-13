import { toJson, type SqlDatabase } from '@factory/storage';

import { LIBRARY_VERSION, SPECIES } from '@/content/species';
import { PLANT_CATEGORIES } from '@/domain/types';

/**
 * Bundled reference data (categories + plant library). Re-seeded when LIBRARY_VERSION changes.
 * Upserts keep existing species ids stable so user plants/wishlist items stay linked.
 */
export async function seedLibraryIfNeeded(db: SqlDatabase, version = LIBRARY_VERSION): Promise<boolean> {
  const row = await db.getFirstAsync<{ value: string }>("SELECT value FROM app_meta WHERE key = 'library_version'", []);
  if (row && Number(row.value) === version) return false;

  await db.withTransactionAsync(async () => {
    for (const [i, id] of PLANT_CATEGORIES.entries()) {
      await db.runAsync('INSERT INTO plant_categories (id, sort) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET sort = excluded.sort', [id, i]);
    }
    for (const s of SPECIES) {
      await db.runAsync(
        `INSERT INTO plant_species (id, scientific_name, family, category_id, data, core) VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET scientific_name = excluded.scientific_name, family = excluded.family,
           category_id = excluded.category_id, data = excluded.data, core = excluded.core`,
        [s.id, s.scientificName, s.family, s.category, toJson(s), s.core ? 1 : 0],
      );
    }
    await db.runAsync("INSERT INTO app_meta (key, value) VALUES ('library_version', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value", [String(version)]);
  });
  return true;
}
