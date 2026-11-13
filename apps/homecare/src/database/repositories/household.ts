import type { SqlDatabase, SqlValue } from '@factory/storage';

import { addDays, type DayKey } from '@/domain/dates';
import { newId } from '@/domain/ids';
import { addInterval, type Recurrence } from '@/domain/recurrence';
import type { ChecklistItem, HouseholdMember, HouseholdTask } from '@/domain/types';

import { createTable, likePattern } from '../table';

export type HouseholdInput = Omit<HouseholdTask, 'id' | 'homeId' | 'createdAt' | 'updatedAt' | 'completedAt' | 'checklist'>;

export function householdRecurrence(task: Pick<HouseholdTask, 'recurrence' | 'intervalValue' | 'intervalUnit'>): Recurrence {
  return { frequency: task.recurrence, intervalValue: task.intervalValue, intervalUnit: task.intervalUnit };
}

/**
 * Next due date of a recurring chore after it is done. Anchored on the due date so a
 * weekly "take out the trash on Tuesday" stays on Tuesdays; if the chore was very late,
 * we skip ahead to the first occurrence after today instead of piling up past dates.
 */
export function nextChoreDue(task: Pick<HouseholdTask, 'recurrence' | 'intervalValue' | 'intervalUnit' | 'dueDate'>, today: DayKey): DayKey | null {
  const r = householdRecurrence(task);
  if (task.recurrence === 'once') return null;
  let next = addInterval(task.dueDate ?? today, r);
  for (let guard = 0; next && next <= today && guard < 1000; guard++) next = addInterval(next, r);
  return next;
}

export function createHouseholdRepository(db: SqlDatabase, now: () => Date) {
  const tasks = createTable<HouseholdTask>(db, 'household_tasks', ['reminderEnabled']);
  const items = createTable<ChecklistItem>(db, 'household_checklist_items', ['done']);
  const members = createTable<HouseholdMember>(db, 'household_members');
  const stamp = () => now().toISOString();

  const withChecklist = async (task: HouseholdTask | null) => (task ? { ...task, checklist: await items.select('task_id = ?', [task.id], 'position ASC') } : null);

  return {
    get: async (id: string) => withChecklist(await tasks.get(id)),

    list(homeId: string, f: { open?: boolean; search?: string; assigneeId?: string | null } = {}): Promise<HouseholdTask[]> {
      const where = ['home_id = ?'];
      const params: SqlValue[] = [homeId];
      if (f.open !== undefined) where.push(f.open ? 'completed_at IS NULL' : 'completed_at IS NOT NULL');
      if (f.assigneeId) {
        where.push('assignee_id = ?');
        params.push(f.assigneeId);
      }
      if (f.search?.trim()) {
        where.push("LOWER(title) LIKE ? ESCAPE '\\'");
        params.push(likePattern(f.search));
      }
      return tasks.select(where.join(' AND '), params, f.open === false ? 'completed_at DESC' : "CASE WHEN due_date IS NULL THEN 1 ELSE 0 END, due_date ASC, title COLLATE NOCASE");
    },

    openDueUntil: (homeId: string, until: DayKey) => tasks.select('home_id = ? AND completed_at IS NULL AND due_date IS NOT NULL AND due_date <= ?', [homeId, until], 'due_date ASC'),

    openWithDue: (homeIds: string[]) =>
      homeIds.length ? tasks.select(`home_id IN (${homeIds.map(() => '?').join(',')}) AND completed_at IS NULL AND due_date IS NOT NULL`, homeIds, 'due_date ASC') : Promise.resolve([]),

    async create(homeId: string, input: HouseholdInput, checklist: string[] = []): Promise<HouseholdTask> {
      const id = newId('ht_');
      const ts = stamp();
      await db.withTransactionAsync(async () => {
        await tasks.insert({ ...input, id, homeId, title: input.title.trim(), createdAt: ts, updatedAt: ts });
        let position = 0;
        for (const label of checklist.map((l) => l.trim()).filter(Boolean)) {
          await items.insert({ id: newId('hc_'), taskId: id, label, done: false, position: position++ });
        }
      });
      return (await withChecklist(await tasks.get(id))) as HouseholdTask;
    },

    /** Updates fields; when `checklist` is given, labels are synced (done flags kept by label). */
    async update(id: string, patch: Partial<HouseholdInput>, checklist?: string[]): Promise<void> {
      await db.withTransactionAsync(async () => {
        await tasks.update(id, { ...patch, updatedAt: stamp() });
        if (checklist) {
          const existing = await items.select('task_id = ?', [id]);
          const doneByLabel = new Map(existing.map((i) => [i.label, i.done]));
          await db.runAsync('DELETE FROM household_checklist_items WHERE task_id = ?', [id]);
          let position = 0;
          for (const label of checklist.map((l) => l.trim()).filter(Boolean)) {
            await items.insert({ id: newId('hc_'), taskId: id, label, done: doneByLabel.get(label) ?? false, position: position++ });
          }
        }
      });
    },

    async toggleItem(itemId: string, done: boolean): Promise<void> {
      await items.update(itemId, { done });
    },

    remove: (id: string) => tasks.delete(id),

    /**
     * Completes the chore. One-off: marked completed. Recurring: logged in history,
     * moved to its next due date and its checklist reset.
     */
    async complete(id: string, today: DayKey, memberId?: string | null): Promise<HouseholdTask | null> {
      const task = await tasks.get(id);
      if (!task) return null;
      await db.withTransactionAsync(async () => {
        await db.runAsync('INSERT INTO household_task_history (id, task_id, home_id, member_id, completed_on, created_at) VALUES (?, ?, ?, ?, ?, ?)', [
          newId('hh_'),
          id,
          task.homeId,
          memberId ?? task.assigneeId,
          today,
          stamp(),
        ]);
        if (task.recurrence === 'once') {
          await tasks.update(id, { completedAt: stamp(), updatedAt: stamp() });
        } else {
          await tasks.update(id, { dueDate: nextChoreDue(task, today), updatedAt: stamp() });
          await db.runAsync('UPDATE household_checklist_items SET done = 0 WHERE task_id = ?', [id]);
        }
      });
      return withChecklist(await tasks.get(id));
    },

    async reopen(id: string): Promise<void> {
      await tasks.update(id, { completedAt: null, updatedAt: stamp() });
    },

    async postpone(id: string, days: number, today: DayKey): Promise<void> {
      const task = await tasks.get(id);
      if (!task) return;
      const base = task.dueDate && task.dueDate >= today ? task.dueDate : today;
      await tasks.update(id, { dueDate: addDays(base, Math.max(1, days)), updatedAt: stamp() });
    },

    async history(homeId: string, opts: { since?: DayKey | null; taskId?: string } = {}) {
      const where = ['h.home_id = ?'];
      const params: SqlValue[] = [homeId];
      if (opts.since) {
        where.push('h.completed_on >= ?');
        params.push(opts.since);
      }
      if (opts.taskId) {
        where.push('h.task_id = ?');
        params.push(opts.taskId);
      }
      return db.getAllAsync<{ id: string; task_id: string; title: string; completed_on: string; member_name: string | null }>(
        `SELECT h.id, h.task_id, t.title, h.completed_on, m.name AS member_name FROM household_task_history h
         JOIN household_tasks t ON t.id = h.task_id LEFT JOIN household_members m ON m.id = h.member_id
         WHERE ${where.join(' AND ')} ORDER BY h.completed_on DESC, h.created_at DESC LIMIT 300`,
        params,
      );
    },

    completedSince: async (homeId: string, since: DayKey) =>
      (await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM household_task_history WHERE home_id = ? AND completed_on >= ?', [homeId, since]))?.n ?? 0,

    /* Members (optional, local only — no account, no sharing) */

    listMembers: (homeId: string) => members.select('home_id = ?', [homeId], 'created_at ASC'),
    async addMember(homeId: string, name: string, color: string): Promise<HouseholdMember> {
      const id = newId('hm_');
      await members.insert({ id, homeId, name: name.trim(), color, createdAt: stamp() });
      return (await members.get(id)) as HouseholdMember;
    },
    renameMember: (id: string, name: string) => members.update(id, { name: name.trim() }),
    removeMember: (id: string) => members.delete(id),
  };
}

export type HouseholdRepository = ReturnType<typeof createHouseholdRepository>;
