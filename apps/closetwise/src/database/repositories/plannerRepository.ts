import type { SqlDatabase } from '@factory/storage';

import { newId } from '@/domain/ids';
import { duplicateWeekPlan, weekDays } from '@/domain/planner';
import type { DayKey, OutfitSchedule, UsageEntry } from '@/domain/types';

import { bool, clean, nowIso, type Row } from './helpers';

const toSchedule = (r: Row): OutfitSchedule => ({
  id: String(r.id),
  date: String(r.date),
  outfitId: (r.outfit_id as string | null) ?? null,
  occasionId: (r.occasion_id as string | null) ?? null,
  notes: (r.notes as string | null) ?? null,
  remind: bool(r.remind),
  wornLogged: bool(r.worn_logged),
  createdAt: String(r.created_at),
});

export type ScheduleInput = Pick<OutfitSchedule, 'date' | 'outfitId' | 'occasionId' | 'notes' | 'remind'>;

export function createPlannerRepository(db: SqlDatabase) {
  const usage = {
    /** Logs that items were worn on a day. Idempotent per (item, day). */
    async logWear(itemIds: readonly string[], day: DayKey, outfitId: string | null = null): Promise<number> {
      let added = 0;
      await db.withTransactionAsync(async () => {
        for (const itemId of new Set(itemIds)) {
          const r = await db.runAsync(
            `INSERT INTO outfit_usage_history (id, item_id, outfit_id, worn_on, created_at) VALUES (?, ?, ?, ?, ?)
             ON CONFLICT(item_id, worn_on) DO UPDATE SET outfit_id = COALESCE(excluded.outfit_id, outfit_usage_history.outfit_id)`,
            [newId('use'), itemId, outfitId, day, nowIso()],
          );
          added += r.changes;
        }
      });
      return added;
    },

    async logOutfitWear(outfitId: string, day: DayKey): Promise<number> {
      const rows = await db.getAllAsync<{ item_id: string }>('SELECT item_id FROM outfit_items WHERE outfit_id = ?', [outfitId]);
      return usage.logWear(
        rows.map((r) => r.item_id),
        day,
        outfitId,
      );
    },

    async removeWear(itemId: string, day: DayKey): Promise<void> {
      await db.runAsync('DELETE FROM outfit_usage_history WHERE item_id = ? AND worn_on = ?', [itemId, day]);
    },

    async removeOutfitWear(outfitId: string, day: DayKey): Promise<void> {
      await db.withTransactionAsync(async () => {
        await db.runAsync('DELETE FROM outfit_usage_history WHERE outfit_id = ? AND worn_on = ?', [outfitId, day]);
        // Keep plans consistent: a plan for this outfit on that day is no longer "worn".
        await db.runAsync('UPDATE outfit_schedules SET worn_logged = 0, updated_at = ? WHERE outfit_id = ? AND date = ?', [nowIso(), outfitId, day]);
      });
    },

    async list(opts: { from?: DayKey; itemId?: string } = {}): Promise<UsageEntry[]> {
      const where: string[] = [];
      const params: string[] = [];
      if (opts.from) {
        where.push('worn_on >= ?');
        params.push(opts.from);
      }
      if (opts.itemId) {
        where.push('item_id = ?');
        params.push(opts.itemId);
      }
      const rows = await db.getAllAsync<Row>(
        `SELECT * FROM outfit_usage_history ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY worn_on DESC`,
        params,
      );
      return rows.map((r) => ({ id: String(r.id), itemId: String(r.item_id), outfitId: (r.outfit_id as string | null) ?? null, wornOn: String(r.worn_on) }));
    },

    /** Days with at least one wear, newest first (history view). */
    async days(limit = 60): Promise<{ day: DayKey; items: number; outfitIds: string[] }[]> {
      const rows = await db.getAllAsync<Row>(
        `SELECT worn_on AS day, COUNT(*) AS items, group_concat(DISTINCT outfit_id) AS outfits
         FROM outfit_usage_history GROUP BY worn_on ORDER BY worn_on DESC LIMIT ?`,
        [limit],
      );
      return rows.map((r) => ({ day: String(r.day), items: Number(r.items), outfitIds: r.outfits ? String(r.outfits).split(',') : [] }));
    },
  };

  const schedules = {
    async range(from: DayKey, to: DayKey): Promise<OutfitSchedule[]> {
      const rows = await db.getAllAsync<Row>('SELECT * FROM outfit_schedules WHERE date >= ? AND date <= ? ORDER BY date, created_at', [from, to]);
      return rows.map(toSchedule);
    },

    async forDate(day: DayKey): Promise<OutfitSchedule[]> {
      return schedules.range(day, day);
    },

    async upcoming(from: DayKey, limit = 50): Promise<OutfitSchedule[]> {
      const rows = await db.getAllAsync<Row>('SELECT * FROM outfit_schedules WHERE date >= ? ORDER BY date, created_at LIMIT ?', [from, limit]);
      return rows.map(toSchedule);
    },

    async get(id: string): Promise<OutfitSchedule | null> {
      const r = await db.getFirstAsync<Row>('SELECT * FROM outfit_schedules WHERE id = ?', [id]);
      return r ? toSchedule(r) : null;
    },

    async save(input: ScheduleInput, id?: string): Promise<string> {
      const now = nowIso();
      if (id) {
        await db.runAsync('UPDATE outfit_schedules SET date = ?, outfit_id = ?, occasion_id = ?, notes = ?, remind = ?, updated_at = ? WHERE id = ?', [
          input.date,
          input.outfitId,
          input.occasionId,
          clean(input.notes),
          input.remind ? 1 : 0,
          now,
          id,
        ]);
        return id;
      }
      const newIdValue = newId('sch');
      await db.runAsync(
        'INSERT INTO outfit_schedules (id, date, outfit_id, occasion_id, notes, remind, worn_logged, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)',
        [newIdValue, input.date, input.outfitId, input.occasionId, clean(input.notes), input.remind ? 1 : 0, now, now],
      );
      return newIdValue;
    },

    async remove(id: string): Promise<void> {
      await db.runAsync('DELETE FROM outfit_schedules WHERE id = ?', [id]);
    },

    /** Logs the planned outfit as worn on its date (once). */
    async markWorn(id: string): Promise<boolean> {
      const s = await schedules.get(id);
      if (!s?.outfitId || s.wornLogged) return false;
      await db.withTransactionAsync(async () => {
        await usage.logOutfitWear(s.outfitId!, s.date);
        await db.runAsync('UPDATE outfit_schedules SET worn_logged = 1, updated_at = ? WHERE id = ?', [nowIso(), id]);
      });
      return true;
    },

    async unmarkWorn(id: string): Promise<void> {
      const s = await schedules.get(id);
      if (!s?.outfitId || !s.wornLogged) return;
      await db.withTransactionAsync(async () => {
        await usage.removeOutfitWear(s.outfitId!, s.date);
        await db.runAsync('UPDATE outfit_schedules SET worn_logged = 0, updated_at = ? WHERE id = ?', [nowIso(), id]);
      });
    },

    async duplicateWeek(fromWeekDay: DayKey, toWeekDay: DayKey, overwrite = false): Promise<number> {
      const from = weekDays(fromWeekDay);
      const to = weekDays(toWeekDay);
      const source = await schedules.range(from[0]!, from[6]!);
      const target = await schedules.range(to[0]!, to[6]!);
      const copies = duplicateWeekPlan(source, fromWeekDay, toWeekDay, target, overwrite);
      await db.withTransactionAsync(async () => {
        if (overwrite) {
          const days = [...new Set(copies.map((c) => c.date))];
          for (const d of days) await db.runAsync('DELETE FROM outfit_schedules WHERE date = ?', [d]);
        }
        for (const c of copies) await schedules.save(c);
      });
      return copies.length;
    },
  };

  return { schedules, usage };
}
