import type { SqlDatabase } from '@factory/storage';

import { PRIORITIES, TASK_STATUSES, type Priority, type TaskStatus } from '@/constants/domain';
import { DEPARTURE_TASKS, taskTitle } from '@/content/departureTasks';
import type { Checklist, ChecklistItem, Id, Instant, LocalDate } from '@/types/models';
import { clock } from '@/utils/clock';
import { addDays, isValidDate } from '@/utils/dates';
import { createId } from '@/utils/ids';

export type TaskValidationCode = 'title_required' | 'title_too_long' | 'invalid_date' | 'invalid_priority' | 'invalid_status' | 'invalid_reminder' | 'not_found';

export class TaskValidationError extends Error {
  constructor(
    public readonly code: TaskValidationCode,
    public readonly field?: string,
  ) {
    super(`Invalid task: ${code}`);
    this.name = 'TaskValidationError';
  }
}

interface ItemRow {
  id: string;
  checklist_id: string;
  title: string;
  notes: string;
  due_date: string | null;
  priority: string;
  status: string;
  reminder_at: string | null;
  notification_id: string | null;
  position: number;
}

const toItem = (r: ItemRow): ChecklistItem => ({
  id: r.id,
  checklistId: r.checklist_id,
  title: r.title,
  notes: r.notes,
  dueDate: r.due_date,
  priority: r.priority as Priority,
  status: r.status as TaskStatus,
  reminderAt: r.reminder_at,
  notificationId: r.notification_id,
  position: r.position,
});

export interface TaskInput {
  title: string;
  notes?: string;
  dueDate?: LocalDate | null;
  priority?: Priority;
  status?: TaskStatus;
  /** UTC instant; scheduling the notification is done by services/reminders.ts. */
  reminderAt?: Instant | null;
}

function normalize(input: TaskInput) {
  const title = input.title.trim();
  if (!title) throw new TaskValidationError('title_required', 'title');
  if (title.length > 160) throw new TaskValidationError('title_too_long', 'title');
  const dueDate = input.dueDate?.trim() || null;
  if (dueDate && !isValidDate(dueDate)) throw new TaskValidationError('invalid_date', 'dueDate');
  const priority = input.priority ?? 'medium';
  if (!PRIORITIES.includes(priority)) throw new TaskValidationError('invalid_priority', 'priority');
  const status = input.status ?? 'todo';
  if (!TASK_STATUSES.includes(status)) throw new TaskValidationError('invalid_status', 'status');
  const reminderAt = input.reminderAt ?? null;
  if (reminderAt && Number.isNaN(Date.parse(reminderAt))) throw new TaskValidationError('invalid_reminder', 'reminderAt');
  return { title, notes: input.notes?.trim() ?? '', dueDate, priority, status, reminderAt };
}

/** Tasks ordered for display: open first (by due date, priority), done last. */
export function sortTasks(items: ChecklistItem[]): ChecklistItem[] {
  const rank = { high: 0, medium: 1, low: 2 } as const;
  return [...items].sort(
    (a, b) =>
      Number(a.status === 'done') - Number(b.status === 'done') ||
      (a.dueDate ?? '9999-12-31').localeCompare(b.dueDate ?? '9999-12-31') ||
      rank[a.priority] - rank[b.priority] ||
      a.position - b.position,
  );
}

export function taskProgress(items: Pick<ChecklistItem, 'status'>[]): number | null {
  return items.length ? items.filter((i) => i.status === 'done').length / items.length : null;
}

export function createChecklistRepository(db: SqlDatabase) {
  async function itemRow(id: Id) {
    const r = await db.getFirstAsync<ItemRow>('SELECT * FROM checklist_items WHERE id = ?', [id]);
    if (!r) throw new TaskValidationError('not_found');
    return r;
  }

  const repo = {
    /** The trip's pre-departure checklist, created on first use. */
    async ensureChecklist(tripId: Id, name: string): Promise<Checklist> {
      const row = await db.getFirstAsync<{ id: string; trip_id: string; name: string; created_at: string }>('SELECT * FROM checklists WHERE trip_id = ? ORDER BY created_at LIMIT 1', [tripId]);
      if (row) return { id: row.id, tripId: row.trip_id, name: row.name, createdAt: row.created_at };
      const id = createId();
      const now = clock.instant();
      await db.runAsync('INSERT INTO checklists (id, trip_id, name, created_at) VALUES (?, ?, ?, ?)', [id, tripId, name, now]);
      return { id, tripId, name, createdAt: now };
    },

    async items(tripId: Id): Promise<ChecklistItem[]> {
      const rows = await db.getAllAsync<ItemRow>('SELECT i.* FROM checklist_items i JOIN checklists c ON c.id = i.checklist_id WHERE c.trip_id = ?', [tripId]);
      return sortTasks(rows.map(toItem));
    },

    async get(id: Id): Promise<ChecklistItem | null> {
      const r = await db.getFirstAsync<ItemRow>('SELECT * FROM checklist_items WHERE id = ?', [id]);
      return r ? toItem(r) : null;
    },

    async add(checklistId: Id, input: TaskInput): Promise<ChecklistItem> {
      const t = normalize(input);
      const pos = (await db.getFirstAsync<{ p: number | null }>('SELECT MAX(position) AS p FROM checklist_items WHERE checklist_id = ?', [checklistId]))?.p ?? -1;
      const id = createId();
      await db.runAsync(
        'INSERT INTO checklist_items (id, checklist_id, title, notes, due_date, priority, status, reminder_at, notification_id, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, ?)',
        [id, checklistId, t.title, t.notes, t.dueDate, t.priority, t.status, t.reminderAt, pos + 1],
      );
      return (await repo.get(id))!;
    },

    async update(id: Id, input: TaskInput): Promise<ChecklistItem> {
      await itemRow(id);
      const t = normalize(input);
      await db.runAsync('UPDATE checklist_items SET title = ?, notes = ?, due_date = ?, priority = ?, status = ?, reminder_at = ? WHERE id = ?', [
        t.title,
        t.notes,
        t.dueDate,
        t.priority,
        t.status,
        t.reminderAt,
        id,
      ]);
      return (await repo.get(id))!;
    },

    async setStatus(id: Id, status: TaskStatus): Promise<void> {
      if (!TASK_STATUSES.includes(status)) throw new TaskValidationError('invalid_status', 'status');
      await db.runAsync('UPDATE checklist_items SET status = ? WHERE id = ?', [status, id]);
    },

    async setNotificationId(id: Id, notificationId: string | null): Promise<void> {
      await db.runAsync('UPDATE checklist_items SET notification_id = ? WHERE id = ?', [notificationId, id]);
    },

    /** Deletes a task; returns its scheduled notification id so the caller can cancel it. */
    async remove(id: Id): Promise<string | null> {
      const r = await db.getFirstAsync<{ notification_id: string | null }>('SELECT notification_id FROM checklist_items WHERE id = ?', [id]);
      await db.runAsync('DELETE FROM checklist_items WHERE id = ?', [id]);
      return r?.notification_id ?? null;
    },

    /**
     * Adds the suggested departure tasks not already present (by title), in the user's
     * language, with a due date relative to departure when the trip has dates (never in the past).
     */
    async addSuggested(tripId: Id, checklistName: string, lang: string, opts: { international: boolean; startDate: LocalDate | null; today: LocalDate }): Promise<number> {
      const list = await repo.ensureChecklist(tripId, checklistName);
      const existing = new Set((await repo.items(tripId)).map((i) => i.title.toLowerCase()));
      let added = 0;
      await db.withTransactionAsync(async () => {
        for (const s of DEPARTURE_TASKS) {
          if (s.international && !opts.international) continue;
          const title = taskTitle(s, lang);
          if (existing.has(title.toLowerCase())) continue;
          let due: LocalDate | null = null;
          if (opts.startDate && isValidDate(opts.startDate)) {
            const proposed = addDays(opts.startDate, -s.daysBefore);
            due = proposed < opts.today ? (opts.today <= opts.startDate ? opts.today : null) : proposed;
          }
          await repo.add(list.id, { title, priority: s.priority, dueDate: due });
          added++;
        }
      });
      return added;
    },

    /** Pending reminders (for rescheduling after a restore or reinstall). */
    async pendingReminders(after: Instant): Promise<ChecklistItem[]> {
      const rows = await db.getAllAsync<ItemRow>("SELECT * FROM checklist_items WHERE reminder_at IS NOT NULL AND reminder_at > ? AND status <> 'done'", [after]);
      return rows.map(toItem);
    },

    /** Notification ids of a trip's tasks (to cancel them when the trip is deleted). */
    async notificationIds(tripId: Id): Promise<string[]> {
      const rows = await db.getAllAsync<{ n: string }>(
        'SELECT i.notification_id AS n FROM checklist_items i JOIN checklists c ON c.id = i.checklist_id WHERE c.trip_id = ? AND i.notification_id IS NOT NULL',
        [tripId],
      );
      return rows.map((r) => r.n);
    },
  };
  return repo;
}

export type ChecklistRepository = ReturnType<typeof createChecklistRepository>;
