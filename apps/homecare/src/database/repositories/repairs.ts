import type { SqlDatabase, SqlValue } from '@factory/storage';

import type { DayKey } from '@/domain/dates';
import { newId } from '@/domain/ids';
import type { Repair, RepairStatus } from '@/domain/types';

import { createTable, likePattern } from '../table';

export type RepairInput = Omit<Repair, 'id' | 'homeId' | 'createdAt' | 'updatedAt'>;

export const OPEN_REPAIR_STATUSES: readonly RepairStatus[] = ['reported', 'scheduled', 'in_progress'];

export function createRepairsRepository(db: SqlDatabase, now: () => Date) {
  const repairs = createTable<Repair>(db, 'repairs', ['underWarranty']);
  const stamp = () => now().toISOString();

  return {
    get: (id: string) => repairs.get(id),

    list(homeId: string, f: { status?: RepairStatus | 'open' | null; assetId?: string | null; search?: string; since?: DayKey | null } = {}): Promise<Repair[]> {
      const where = ['home_id = ?'];
      const params: SqlValue[] = [homeId];
      const add = (clause: string, ...values: SqlValue[]) => {
        where.push(clause);
        params.push(...values);
      };
      if (f.status === 'open') add(`status IN (${OPEN_REPAIR_STATUSES.map(() => '?').join(',')})`, ...OPEN_REPAIR_STATUSES);
      else if (f.status) add('status = ?', f.status);
      if (f.assetId) add('asset_id = ?', f.assetId);
      if (f.since) add('reported_on >= ?', f.since);
      if (f.search?.trim()) {
        where.push("(LOWER(title) LIKE ? ESCAPE '\\' OR LOWER(COALESCE(provider,'')) LIKE ? ESCAPE '\\' OR LOWER(COALESCE(problem,'')) LIKE ? ESCAPE '\\')");
        const p = likePattern(f.search);
        params.push(p, p, p);
      }
      return repairs.select(where.join(' AND '), params, 'COALESCE(scheduled_on, reported_on) DESC, created_at DESC');
    },

    /** Open interventions with a date between today and `until`. */
    upcoming: (homeId: string, today: DayKey, until: DayKey) =>
      repairs.select("home_id = ? AND status IN ('reported','scheduled','in_progress') AND scheduled_on BETWEEN ? AND ?", [homeId, today, until], 'scheduled_on ASC'),

    scheduled: (homeIds: string[], from: DayKey) =>
      homeIds.length
        ? repairs.select(`home_id IN (${homeIds.map(() => '?').join(',')}) AND status IN ('reported','scheduled') AND scheduled_on >= ?`, [...homeIds, from], 'scheduled_on ASC')
        : Promise.resolve([]),

    countOpen: (homeId: string) => repairs.count("home_id = ? AND status IN ('reported','scheduled','in_progress')", [homeId]),

    async create(homeId: string, input: RepairInput): Promise<Repair> {
      const id = newId('rp_');
      const ts = stamp();
      await repairs.insert({ ...input, id, homeId, title: input.title.trim(), createdAt: ts, updatedAt: ts });
      return (await repairs.get(id)) as Repair;
    },

    async update(id: string, patch: Partial<RepairInput>): Promise<void> {
      await repairs.update(id, { ...patch, updatedAt: stamp() });
    },

    /** Moves to a status and fills the matching date when missing. */
    async setStatus(id: string, status: RepairStatus, today: DayKey): Promise<void> {
      const current = await repairs.get(id);
      if (!current) return;
      const patch: Partial<Repair> = { status, updatedAt: stamp() };
      if (status === 'completed' && !current.completedOn) patch.completedOn = today;
      if (status === 'scheduled' && !current.scheduledOn) patch.scheduledOn = today;
      await repairs.update(id, patch);
    },

    remove: (id: string) => repairs.delete(id),
  };
}

export type RepairsRepository = ReturnType<typeof createRepairsRepository>;
