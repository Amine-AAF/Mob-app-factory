import type { SqlDatabase, SqlValue } from '@factory/storage';

import { addDays, type DayKey } from '@/domain/dates';
import { newId } from '@/domain/ids';
import type { Asset, AssetCategory, AssetEvent, AssetStatus } from '@/domain/types';

import { createTable, likePattern } from '../table';

export type AssetInput = Omit<Asset, 'id' | 'homeId' | 'createdAt' | 'updatedAt'>;

export interface AssetFilters {
  search?: string;
  category?: AssetCategory | null;
  roomId?: string | null;
  status?: AssetStatus | null;
}

export function createAssetsRepository(db: SqlDatabase, now: () => Date) {
  const assets = createTable<Asset>(db, 'assets');
  const events = createTable<AssetEvent>(db, 'asset_events');
  const stamp = () => now().toISOString();

  const log = (assetId: string, kind: AssetEvent['kind'], detail: string | null) =>
    events.insert({ id: newId('ae_'), assetId, kind, detail, createdAt: stamp() });

  return {
    get: (id: string) => assets.get(id),
    count: (homeId: string) => assets.count('home_id = ?', [homeId]),

    list(homeId: string, f: AssetFilters = {}): Promise<Asset[]> {
      const where = ['home_id = ?'];
      const params: SqlValue[] = [homeId];
      if (f.search?.trim()) {
        where.push("(LOWER(name) LIKE ? ESCAPE '\\' OR LOWER(COALESCE(brand,'')) LIKE ? ESCAPE '\\' OR LOWER(COALESCE(model,'')) LIKE ? ESCAPE '\\' OR LOWER(COALESCE(serial_number,'')) LIKE ? ESCAPE '\\')");
        const p = likePattern(f.search);
        params.push(p, p, p, p);
      }
      if (f.category) {
        where.push('category = ?');
        params.push(f.category);
      }
      if (f.roomId) {
        where.push('room_id = ?');
        params.push(f.roomId);
      }
      if (f.status) {
        where.push('status = ?');
        params.push(f.status);
      }
      return assets.select(where.join(' AND '), params, 'name COLLATE NOCASE ASC');
    },

    async create(homeId: string, input: AssetInput): Promise<Asset> {
      const id = newId('a_');
      const ts = stamp();
      await db.withTransactionAsync(async () => {
        await assets.insert({ ...input, id, homeId, name: input.name.trim(), createdAt: ts, updatedAt: ts });
        await log(id, 'created', null);
      });
      return (await assets.get(id)) as Asset;
    },

    /** Updates and records a status change in the asset timeline. */
    async update(id: string, patch: Partial<AssetInput>): Promise<void> {
      const before = await assets.get(id);
      if (!before) return;
      await db.withTransactionAsync(async () => {
        await assets.update(id, { ...patch, updatedAt: stamp() });
        if (patch.status && patch.status !== before.status) await log(id, 'status', `${before.status}>${patch.status}`);
      });
    },

    remove: (id: string) => assets.delete(id),

    events: (assetId: string) => events.select('asset_id = ?', [assetId], 'created_at DESC'),

    /** Warranties ending between `today - pastDays` and `today + windowDays`, soonest first. */
    warrantiesEnding(homeId: string, today: DayKey, windowDays: number, pastDays = 0): Promise<Asset[]> {
      return assets.select(
        "home_id = ? AND warranty_end IS NOT NULL AND warranty_end BETWEEN ? AND ? AND status != 'replaced'",
        [homeId, addDays(today, -pastDays), addDays(today, windowDays)],
        'warranty_end ASC',
      );
    },

    /** Every asset with a future warranty end, for reminder planning. */
    withWarranty: (homeIds: string[], from: DayKey) =>
      homeIds.length
        ? assets.select(`home_id IN (${homeIds.map(() => '?').join(',')}) AND warranty_end >= ? AND status != 'replaced'`, [...homeIds, from], 'warranty_end ASC')
        : Promise.resolve([]),

    async countByStatus(homeId: string): Promise<Record<AssetStatus, number>> {
      const rows = await db.getAllAsync<{ status: AssetStatus; n: number }>('SELECT status, COUNT(*) AS n FROM assets WHERE home_id = ? GROUP BY status', [homeId]);
      const out: Record<AssetStatus, number> = { active: 0, in_repair: 0, replaced: 0, out_of_service: 0 };
      rows.forEach((r) => (out[r.status] = r.n));
      return out;
    },
  };
}

export type AssetsRepository = ReturnType<typeof createAssetsRepository>;
