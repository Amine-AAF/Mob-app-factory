import { BackupError, createBackup, parseBackup, restoreBackup, wipeTables, type BackupFile } from '@factory/storage';

import manifest from '../../app.manifest.json';
import type { Repositories } from '@/database';
import { SCHEMA_VERSION, seedTaxonomy, USER_TABLES } from '@/database/migrations';
import type { WardrobeItem } from '@/domain/types';

import { clock } from './clock';

/**
 * Backup = JSON file with every user table (factory-backup format) plus, optionally,
 * the photos as base64 under `photos`. Pure: file access is injected so it is testable.
 */
export interface ClosetBackup extends BackupFile {
  photos?: Record<string, string>;
}

export interface PhotoIO {
  read(paths: string[]): Promise<Record<string, string>>;
  write(photos: Record<string, unknown>): Promise<number>;
  cleanup(referenced: string[]): number;
}

/** Every file path referenced by the database (photos, thumbnails, receipts). */
export async function referencedPaths(r: Repositories): Promise<string[]> {
  const rows = await r.db.getAllAsync<{ p: string | null }>(
    `SELECT photo_path AS p FROM wardrobe_items UNION SELECT thumb_path FROM wardrobe_items
     UNION SELECT photo_path FROM wishlist_items UNION SELECT thumb_path FROM wishlist_items
     UNION SELECT receipt_path FROM shopping_records`,
    [],
  );
  return rows.map((x) => x.p).filter((p): p is string => !!p);
}

export async function buildBackup(r: Repositories, opts: { includePhotos: boolean; photos?: PhotoIO }): Promise<ClosetBackup> {
  const backup: ClosetBackup = await createBackup(r.db, { appId: manifest.id, tables: USER_TABLES, now: clock.now() });
  if (opts.includePhotos && opts.photos) backup.photos = await opts.photos.read(await referencedPaths(r));
  return backup;
}

export type RestoreResult = { ok: true; rows: number; photos: number; missingPhotos: number } | { ok: false; error: BackupError['code'] };

/**
 * Replaces all user data with the backup, atomically. Built-in taxonomy is re-seeded,
 * photos are written back when included, and files no row references are removed.
 * Rows whose photo is absent from the backup keep working: the UI shows a placeholder.
 */
export async function restoreFromText(r: Repositories, text: string, photos?: PhotoIO): Promise<RestoreResult> {
  let backup: ClosetBackup;
  try {
    backup = parseBackup(text, manifest.id) as ClosetBackup;
  } catch (e) {
    return { ok: false, error: e instanceof BackupError ? e.code : 'invalid_format' };
  }
  try {
    let rows = 0;
    await r.db.withTransactionAsync(async () => {
      // Children first, so foreign keys never block the wipe.
      await wipeTables(r.db, [...USER_TABLES].reverse());
      rows = (await restoreBackup(r.db, backup, { tables: USER_TABLES, currentSchemaVersion: SCHEMA_VERSION })).restoredRows;
      await seedTaxonomy(r.db, clock.now().toISOString());
    });
    let written = 0;
    let missing = 0;
    const referenced = await referencedPaths(r);
    if (photos) {
      if (backup.photos && typeof backup.photos === 'object') written = await photos.write(backup.photos);
      const restored = new Set(Object.keys(backup.photos ?? {}));
      missing = referenced.filter((p) => !restored.has(p)).length;
      photos.cleanup(referenced);
    }
    return { ok: true, rows, photos: written, missingPhotos: missing };
  } catch (e) {
    return { ok: false, error: e instanceof BackupError ? e.code : 'invalid_format' };
  }
}

/** "Delete all my data": wipes user tables and restores built-in defaults. */
export async function wipeAllData(r: Repositories): Promise<void> {
  await r.db.withTransactionAsync(async () => {
    await wipeTables(r.db, [...USER_TABLES].reverse());
    await seedTaxonomy(r.db, clock.now().toISOString());
  });
}

const csvCell = (v: unknown) => {
  const s = v == null ? '' : String(v);
  // Neutralise spreadsheet formulas (CSV injection) and quote when needed.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return /[",\n;]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

export function itemsToCsv(items: readonly WardrobeItem[], labels: { category: (id: string) => string; tag: (id: string | null) => string }): string {
  const header = ['name', 'category', 'subcategory', 'color', 'brand', 'size', 'style', 'purchase_date', 'price', 'currency', 'condition', 'care_status', 'wears', 'favorite', 'archived', 'notes'];
  const lines = items.map((i) =>
    [
      i.name,
      labels.category(i.categoryId),
      i.subcategory,
      i.primaryColor,
      i.brandName,
      i.size,
      labels.tag(i.styleId),
      i.purchaseDate,
      i.purchasePrice,
      i.currency,
      i.condition,
      i.careStatus,
      i.wearCount,
      i.favorite ? 1 : 0,
      i.archived ? 1 : 0,
      i.notes,
    ]
      .map(csvCell)
      .join(','),
  );
  return [header.join(','), ...lines].join('\n');
}
