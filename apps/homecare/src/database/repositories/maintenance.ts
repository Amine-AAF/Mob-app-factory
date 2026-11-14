import type { SqlDatabase, SqlValue } from '@factory/storage';

import type { DayKey } from '@/domain/dates';
import { newId } from '@/domain/ids';
import { nextDueAfterCompletion, postpone } from '@/domain/recurrence';
import type { MaintenanceHistoryEntry, MaintenanceTask } from '@/domain/types';

import { createTable, likePattern, rowToEntity, type Row } from '../table';

export type MaintenanceInput = Omit<MaintenanceTask, 'id' | 'homeId' | 'createdAt' | 'updatedAt' | 'active'> & { active?: boolean };

export interface CompleteInput {
  doneOn: DayKey;
  costMinor?: number | null;
  currency?: string | null;
  durationMinutes?: number | null;
  notes?: string | null;
}

const BOOLS = ['reminderEnabled', 'active'] as const;

export function createMaintenanceRepository(db: SqlDatabase, now: () => Date) {
  const tasks = createTable<MaintenanceTask>(db, 'maintenance_tasks', [...BOOLS]);
  const history = createTable<MaintenanceHistoryEntry>(db, 'maintenance_history');
  const stamp = () => now().toISOString();

  return {
    get: (id: string) => tasks.get(id),

    list(homeId: string, opts: { search?: string; includeInactive?: boolean; assetId?: string; roomId?: string } = {}): Promise<MaintenanceTask[]> {
      const where = ['home_id = ?'];
      const params: SqlValue[] = [homeId];
      if (!opts.includeInactive) where.push('active = 1');
      if (opts.assetId) {
        where.push('asset_id = ?');
        params.push(opts.assetId);
      }
      if (opts.roomId) {
        where.push('room_id = ?');
        params.push(opts.roomId);
      }
      if (opts.search?.trim()) {
        where.push("LOWER(title) LIKE ? ESCAPE '\\'");
        params.push(likePattern(opts.search));
      }
      // Tasks without a due date (completed one-offs) go last.
      return tasks.select(where.join(' AND '), params, "CASE WHEN next_due IS NULL THEN 1 ELSE 0 END, next_due ASC, title COLLATE NOCASE");
    },

    /** Active tasks due on or before `until` (includes overdue). */
    dueUntil: (homeId: string, until: DayKey) => tasks.select('home_id = ? AND active = 1 AND next_due IS NOT NULL AND next_due <= ?', [homeId, until], 'next_due ASC'),

    /** All active tasks with a due date, across homes (reminder planning). */
    scheduled: (homeIds: string[]) =>
      homeIds.length ? tasks.select(`home_id IN (${homeIds.map(() => '?').join(',')}) AND active = 1 AND next_due IS NOT NULL`, homeIds, 'next_due ASC') : Promise.resolve([]),

    async create(homeId: string, input: MaintenanceInput): Promise<MaintenanceTask> {
      const id = newId('m_');
      const ts = stamp();
      await tasks.insert({ active: true, ...input, id, homeId, title: input.title.trim(), createdAt: ts, updatedAt: ts });
      return (await tasks.get(id)) as MaintenanceTask;
    },

    async update(id: string, patch: Partial<MaintenanceInput>): Promise<void> {
      await tasks.update(id, { ...patch, updatedAt: stamp() });
    },

    remove: (id: string) => tasks.delete(id),

    /**
     * Marks the task done: writes history, sets last_done and computes the next due
     * date from the completion day. A one-off task keeps its row (for history) with no due date.
     */
    async complete(id: string, input: CompleteInput): Promise<MaintenanceTask | null> {
      const task = await tasks.get(id);
      if (!task) return null;
      const next = nextDueAfterCompletion(input.doneOn, task);
      await db.withTransactionAsync(async () => {
        await history.insert({
          id: newId('mh_'),
          taskId: id,
          homeId: task.homeId,
          assetId: task.assetId,
          action: 'completed',
          doneOn: input.doneOn,
          previousDue: task.nextDue,
          newDue: next,
          costMinor: input.costMinor ?? null,
          currency: input.costMinor != null ? (input.currency ?? task.currency) : null,
          durationMinutes: input.durationMinutes ?? null,
          notes: input.notes?.trim() || null,
          createdAt: stamp(),
        });
        await tasks.update(id, { lastDone: input.doneOn, nextDue: next, updatedAt: stamp() });
      });
      return tasks.get(id);
    },

    async postpone(id: string, days: number, today: DayKey): Promise<MaintenanceTask | null> {
      const task = await tasks.get(id);
      if (!task?.nextDue) return task;
      const newDue = postpone(task.nextDue, days, today);
      await db.withTransactionAsync(async () => {
        await history.insert({ id: newId('mh_'), taskId: id, homeId: task.homeId, assetId: task.assetId, action: 'postponed', doneOn: today, previousDue: task.nextDue, newDue, createdAt: stamp() });
        await tasks.update(id, { nextDue: newDue, updatedAt: stamp() });
      });
      return tasks.get(id);
    },

    /** Re-activates a completed one-off task with a new due date. */
    async reschedule(id: string, due: DayKey): Promise<void> {
      await tasks.update(id, { nextDue: due, active: true, updatedAt: stamp() });
    },

    async history(homeId: string, opts: { taskId?: string; assetId?: string; since?: DayKey | null; limit?: number } = {}): Promise<MaintenanceHistoryEntry[]> {
      const where = ['h.home_id = ?'];
      const params: SqlValue[] = [homeId];
      if (opts.taskId) {
        where.push('h.task_id = ?');
        params.push(opts.taskId);
      }
      if (opts.assetId) {
        where.push('h.asset_id = ?');
        params.push(opts.assetId);
      }
      if (opts.since) {
        where.push('h.done_on >= ?');
        params.push(opts.since);
      }
      const rows = await db.getAllAsync<Row>(
        `SELECT h.*, t.title AS task_title FROM maintenance_history h JOIN maintenance_tasks t ON t.id = h.task_id
         WHERE ${where.join(' AND ')} ORDER BY h.done_on DESC, h.created_at DESC LIMIT ?`,
        [...params, opts.limit ?? 500],
      );
      return rows.map((r) => rowToEntity<MaintenanceHistoryEntry>(r));
    },

    /** Completed count since a day (dashboard "done this month"). */
    async completedSince(homeId: string, since: DayKey): Promise<number> {
      const r = await db.getFirstAsync<{ n: number }>("SELECT COUNT(*) AS n FROM maintenance_history WHERE home_id = ? AND action = 'completed' AND done_on >= ?", [homeId, since]);
      return r?.n ?? 0;
    },
  };
}

export type MaintenanceRepository = ReturnType<typeof createMaintenanceRepository>;
