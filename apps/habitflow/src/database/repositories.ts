import { fromJson, placeholders, toJson, type SqlDatabase } from '@factory/storage';

import { normalizeFrequency } from '@/features/habits/schedule';
import { statusFor } from '@/features/tracking/progress';
import type { DayKey, Frequency, Habit, HabitCategory, HabitLog, HabitWithSchedules, LogStatus, PlannerTask, Priority, Reminder, Schedule, Snapshot, Tracking, Weekday } from '@/types';
import { newId } from '@/utils';

/* ---------- row mapping ---------- */

interface HabitRow {
  id: string; name: string; description: string | null; icon: string; color: string; category: string; start_date: string;
  duration_min: number | null; notes: string | null; template_id: string | null; sort_order: number; archived_on: string | null;
  created_at: string; updated_at: string;
}
interface ScheduleRow { habit_id: string; effective_from: string; frequency: string; tracking: string }
interface LogRow {
  habit_id: string; day: string; value: number; target: number; status: string; note: string | null;
  completed_at: string | null; created_at: string; updated_at: string;
}
interface TaskRow {
  id: string; title: string; notes: string | null; priority: string; due_day: string; time: string | null; done: number;
  done_at: string | null; habit_id: string | null; sort_order: number; created_at: string; updated_at: string;
}
interface ReminderRow { id: string; habit_id: string | null; hour: number; minute: number; days: string; enabled: number; created_at: string; updated_at: string }

const toHabit = (r: HabitRow): Habit => ({
  id: r.id, name: r.name, description: r.description, icon: r.icon, color: r.color, category: r.category as HabitCategory,
  startDate: r.start_date, durationMin: r.duration_min, notes: r.notes, templateId: r.template_id, sortOrder: r.sort_order,
  archivedOn: r.archived_on, createdAt: r.created_at, updatedAt: r.updated_at,
});
const toSchedule = (r: ScheduleRow): Schedule => ({
  habitId: r.habit_id, effectiveFrom: r.effective_from,
  frequency: fromJson<Frequency>(r.frequency, { type: 'daily' }),
  tracking: fromJson<Tracking>(r.tracking, { mode: 'check', target: 1, unit: null }),
});
const toLog = (r: LogRow): HabitLog => ({
  habitId: r.habit_id, day: r.day, value: r.value, target: r.target, status: r.status as LogStatus, note: r.note,
  completedAt: r.completed_at, createdAt: r.created_at, updatedAt: r.updated_at,
});
const toTask = (r: TaskRow): PlannerTask => ({
  id: r.id, title: r.title, notes: r.notes, priority: r.priority as Priority, dueDay: r.due_day, time: r.time, done: r.done === 1,
  doneAt: r.done_at, habitId: r.habit_id, sortOrder: r.sort_order, createdAt: r.created_at, updatedAt: r.updated_at,
});
const toReminder = (r: ReminderRow): Reminder => ({
  id: r.id, habitId: r.habit_id, hour: r.hour, minute: r.minute, days: fromJson<Weekday[]>(r.days, []), enabled: r.enabled === 1,
  createdAt: r.created_at, updatedAt: r.updated_at,
});

/* ---------- habits & schedules ---------- */

export interface HabitInput {
  name: string;
  description: string | null;
  icon: string;
  color: string;
  category: HabitCategory;
  startDate: DayKey;
  durationMin: number | null;
  notes: string | null;
  templateId: string | null;
  frequency: Frequency;
  tracking: Tracking;
}

export function createHabitsRepository(db: SqlDatabase) {
  async function attachSchedules(habits: Habit[]): Promise<HabitWithSchedules[]> {
    if (habits.length === 0) return [];
    const rows = await db.getAllAsync<ScheduleRow>(
      `SELECT habit_id, effective_from, frequency, tracking FROM habit_schedules WHERE habit_id IN (${placeholders(habits.length)}) ORDER BY effective_from`,
      habits.map((h) => h.id),
    );
    const by = new Map<string, Schedule[]>();
    for (const r of rows) (by.get(r.habit_id) ?? by.set(r.habit_id, []).get(r.habit_id)!).push(toSchedule(r));
    return habits.map((h) => ({ ...h, schedules: by.get(h.id) ?? [] }));
  }

  return {
    async list(opts: { includeArchived?: boolean } = {}): Promise<HabitWithSchedules[]> {
      const rows = await db.getAllAsync<HabitRow>(
        `SELECT * FROM habits ${opts.includeArchived ? '' : 'WHERE archived_on IS NULL'} ORDER BY sort_order, created_at`,
        [],
      );
      return attachSchedules(rows.map(toHabit));
    },

    async get(id: string): Promise<HabitWithSchedules | null> {
      const row = await db.getFirstAsync<HabitRow>('SELECT * FROM habits WHERE id = ?', [id]);
      return row ? (await attachSchedules([toHabit(row)]))[0]! : null;
    },

    async countActive(): Promise<number> {
      const r = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM habits WHERE archived_on IS NULL', []);
      return r?.n ?? 0;
    },

    async create(input: HabitInput, now: Date): Promise<string> {
      const id = newId('h_');
      const iso = now.toISOString();
      const max = await db.getFirstAsync<{ m: number | null }>('SELECT MAX(sort_order) AS m FROM habits', []);
      await db.withTransactionAsync(async () => {
        await db.runAsync(
          `INSERT INTO habits (id, name, description, icon, color, category, start_date, duration_min, notes, template_id, sort_order, archived_on, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)`,
          [id, input.name, input.description, input.icon, input.color, input.category, input.startDate, input.durationMin, input.notes, input.templateId, (max?.m ?? -1) + 1, iso, iso],
        );
        await db.runAsync(
          'INSERT INTO habit_schedules (habit_id, effective_from, frequency, tracking, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
          [id, input.startDate, toJson(normalizeFrequency(input.frequency)), toJson(input.tracking), iso, iso],
        );
      });
      return id;
    },

    /** Updates descriptive fields. Rule changes go through `setSchedule`. */
    async updateDetails(id: string, input: Omit<HabitInput, 'frequency' | 'tracking' | 'startDate'>, now: Date): Promise<void> {
      await db.runAsync(
        'UPDATE habits SET name = ?, description = ?, icon = ?, color = ?, category = ?, duration_min = ?, notes = ?, updated_at = ? WHERE id = ?',
        [input.name, input.description, input.icon, input.color, input.category, input.durationMin, input.notes, now.toISOString(), id],
      );
    },

    /**
     * New rules effective from `from` (usually today, never earlier than the
     * habit's start). Past days keep the previous schedule.
     */
    async setSchedule(id: string, from: DayKey, frequency: Frequency, tracking: Tracking, now: Date): Promise<void> {
      const iso = now.toISOString();
      await db.runAsync(
        `INSERT INTO habit_schedules (habit_id, effective_from, frequency, tracking, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(habit_id, effective_from) DO UPDATE SET frequency = excluded.frequency, tracking = excluded.tracking, updated_at = excluded.updated_at`,
        [id, from, toJson(normalizeFrequency(frequency)), toJson(tracking), iso, iso],
      );
      // Future-dated versions (none are created by the UI) would hide this change.
      await db.runAsync('DELETE FROM habit_schedules WHERE habit_id = ? AND effective_from > ?', [id, from]);
      await db.runAsync('UPDATE habits SET updated_at = ? WHERE id = ?', [iso, id]);
    },

    async archive(id: string, from: DayKey, now: Date): Promise<void> {
      await db.runAsync('UPDATE habits SET archived_on = ?, updated_at = ? WHERE id = ?', [from, now.toISOString(), id]);
    },

    async unarchive(id: string, now: Date): Promise<void> {
      await db.runAsync('UPDATE habits SET archived_on = NULL, updated_at = ? WHERE id = ?', [now.toISOString(), id]);
    },

    /** Permanent: removes the habit with its schedules, logs, XP and reminders (cascade). */
    async remove(id: string): Promise<void> {
      await db.runAsync('DELETE FROM habits WHERE id = ?', [id]);
    },

    async setOrder(ids: readonly string[], now: Date): Promise<void> {
      const iso = now.toISOString();
      await db.withTransactionAsync(async () => {
        for (const [i, id] of ids.entries()) await db.runAsync('UPDATE habits SET sort_order = ?, updated_at = ? WHERE id = ?', [i, iso, id]);
      });
    },
  };
}

/* ---------- logs & XP ---------- */

export interface LogWrite {
  value: number;
  /** Explicit skip ("not today") — excused, never breaks a streak. */
  skipped?: boolean;
  note?: string | null;
}

export function createLogsRepository(db: SqlDatabase) {
  return {
    async all(): Promise<HabitLog[]> {
      return (await db.getAllAsync<LogRow>('SELECT * FROM habit_logs ORDER BY day', [])).map(toLog);
    },

    async between(from: DayKey, to: DayKey): Promise<HabitLog[]> {
      return (await db.getAllAsync<LogRow>('SELECT * FROM habit_logs WHERE day >= ? AND day <= ? ORDER BY day', [from, to])).map(toLog);
    },

    async forHabit(habitId: string): Promise<HabitLog[]> {
      return (await db.getAllAsync<LogRow>('SELECT * FROM habit_logs WHERE habit_id = ? ORDER BY day', [habitId])).map(toLog);
    },

    async get(habitId: string, day: DayKey): Promise<HabitLog | null> {
      const r = await db.getFirstAsync<LogRow>('SELECT * FROM habit_logs WHERE habit_id = ? AND day = ?', [habitId, day]);
      return r ? toLog(r) : null;
    },

    /**
     * Writes the log of one habit for one day (insert or update — never a duplicate)
     * and keeps the XP ledger consistent with it. A value of 0 without a note or skip
     * deletes the log (undo). Returns the resulting log and the XP delta.
     */
    async write(habitId: string, day: DayKey, tracking: Tracking, input: LogWrite, opts: { now: Date; xp: number }): Promise<{ log: HabitLog | null; xpDelta: number; newlyDone: boolean }> {
      const iso = opts.now.toISOString();
      let result: { log: HabitLog | null; xpDelta: number; newlyDone: boolean } = { log: null, xpDelta: 0, newlyDone: false };
      await db.withTransactionAsync(async () => {
        const prevRow = await db.getFirstAsync<LogRow>('SELECT * FROM habit_logs WHERE habit_id = ? AND day = ?', [habitId, day]);
        const prev = prevRow ? toLog(prevRow) : null;
        const value = Math.max(0, input.value);
        const note = input.note === undefined ? (prev?.note ?? null) : input.note;
        const status: LogStatus | null = input.skipped ? 'skipped' : statusFor(value, tracking);
        const target = tracking.mode === 'check' ? 1 : tracking.target;

        if (!status && !note) {
          await db.runAsync('DELETE FROM habit_logs WHERE habit_id = ? AND day = ?', [habitId, day]);
        } else {
          const completedAt = status === 'done' ? (prev?.status === 'done' ? prev.completedAt : iso) : null;
          // A note alone is stored as a zero-value partial entry that counts as nothing.
          const finalStatus: LogStatus = status ?? 'partial';
          await db.runAsync(
            `INSERT INTO habit_logs (habit_id, day, value, target, status, note, completed_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(habit_id, day) DO UPDATE SET value = excluded.value, target = excluded.target, status = excluded.status,
               note = excluded.note, completed_at = excluded.completed_at, updated_at = excluded.updated_at`,
            [habitId, day, input.skipped ? 0 : value, target, finalStatus, note, completedAt, prev?.createdAt ?? iso, iso],
          );
        }

        let xpDelta = 0;
        if (status === 'done') {
          if (opts.xp > 0) {
            const r = await db.runAsync('INSERT OR IGNORE INTO xp_ledger (habit_id, day, xp, created_at) VALUES (?, ?, ?, ?)', [habitId, day, opts.xp, iso]);
            if (r.changes > 0) xpDelta = opts.xp;
          }
        } else {
          const had = await db.getFirstAsync<{ xp: number }>('SELECT xp FROM xp_ledger WHERE habit_id = ? AND day = ?', [habitId, day]);
          if (had) {
            await db.runAsync('DELETE FROM xp_ledger WHERE habit_id = ? AND day = ?', [habitId, day]);
            xpDelta = -had.xp;
          }
        }
        const row = await db.getFirstAsync<LogRow>('SELECT * FROM habit_logs WHERE habit_id = ? AND day = ?', [habitId, day]);
        result = { log: row ? toLog(row) : null, xpDelta, newlyDone: status === 'done' && prev?.status !== 'done' };
      });
      return result;
    },

    async totalXp(): Promise<number> {
      const r = await db.getFirstAsync<{ xp: number | null }>('SELECT SUM(xp) AS xp FROM xp_ledger', []);
      return r?.xp ?? 0;
    },
  };
}

/* ---------- planner ---------- */

export interface TaskInput {
  title: string;
  notes: string | null;
  priority: Priority;
  dueDay: DayKey;
  time: string | null;
  habitId: string | null;
}

export function createTasksRepository(db: SqlDatabase) {
  return {
    /** Tasks due on `day`, plus open overdue tasks when `day` is today. */
    async forDay(day: DayKey, includeOverdue: boolean): Promise<PlannerTask[]> {
      const rows = await db.getAllAsync<TaskRow>(
        includeOverdue ? 'SELECT * FROM tasks WHERE due_day = ? OR (due_day < ? AND done = 0) ORDER BY sort_order, created_at' : 'SELECT * FROM tasks WHERE due_day = ? ORDER BY sort_order, created_at',
        includeOverdue ? [day, day] : [day],
      );
      return rows.map(toTask);
    },

    async get(id: string): Promise<PlannerTask | null> {
      const r = await db.getFirstAsync<TaskRow>('SELECT * FROM tasks WHERE id = ?', [id]);
      return r ? toTask(r) : null;
    },

    async create(input: TaskInput, now: Date): Promise<string> {
      const id = newId('t_');
      const iso = now.toISOString();
      const max = await db.getFirstAsync<{ m: number | null }>('SELECT MAX(sort_order) AS m FROM tasks WHERE due_day = ?', [input.dueDay]);
      await db.runAsync(
        'INSERT INTO tasks (id, title, notes, priority, due_day, time, done, done_at, habit_id, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 0, NULL, ?, ?, ?, ?)',
        [id, input.title, input.notes, input.priority, input.dueDay, input.time, input.habitId, (max?.m ?? -1) + 1, iso, iso],
      );
      return id;
    },

    async update(id: string, input: TaskInput, now: Date): Promise<void> {
      await db.runAsync('UPDATE tasks SET title = ?, notes = ?, priority = ?, due_day = ?, time = ?, habit_id = ?, updated_at = ? WHERE id = ?', [
        input.title, input.notes, input.priority, input.dueDay, input.time, input.habitId, now.toISOString(), id,
      ]);
    },

    async setDone(id: string, done: boolean, now: Date): Promise<void> {
      const iso = now.toISOString();
      await db.runAsync('UPDATE tasks SET done = ?, done_at = ?, updated_at = ? WHERE id = ?', [done ? 1 : 0, done ? iso : null, iso, id]);
    },

    async setOrders(updates: readonly { id: string; sortOrder: number }[], now: Date): Promise<void> {
      const iso = now.toISOString();
      await db.withTransactionAsync(async () => {
        for (const u of updates) await db.runAsync('UPDATE tasks SET sort_order = ?, updated_at = ? WHERE id = ?', [u.sortOrder, iso, u.id]);
      });
    },

    async remove(id: string): Promise<void> {
      await db.runAsync('DELETE FROM tasks WHERE id = ?', [id]);
    },

    async completedCount(): Promise<number> {
      const r = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM tasks WHERE done = 1', []);
      return r?.n ?? 0;
    },
  };
}

/* ---------- reminders ---------- */

export function createRemindersRepository(db: SqlDatabase) {
  return {
    async all(): Promise<Reminder[]> {
      return (await db.getAllAsync<ReminderRow>('SELECT * FROM reminders ORDER BY hour, minute', [])).map(toReminder);
    },
    async forHabit(habitId: string | null): Promise<Reminder[]> {
      const rows = habitId
        ? await db.getAllAsync<ReminderRow>('SELECT * FROM reminders WHERE habit_id = ? ORDER BY hour, minute', [habitId])
        : await db.getAllAsync<ReminderRow>('SELECT * FROM reminders WHERE habit_id IS NULL ORDER BY hour, minute', []);
      return rows.map(toReminder);
    },
    async save(r: Pick<Reminder, 'habitId' | 'hour' | 'minute' | 'days' | 'enabled'> & { id?: string }, now: Date): Promise<string> {
      const iso = now.toISOString();
      const id = r.id ?? newId('r_');
      await db.runAsync(
        `INSERT INTO reminders (id, habit_id, hour, minute, days, enabled, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET hour = excluded.hour, minute = excluded.minute, days = excluded.days, enabled = excluded.enabled, updated_at = excluded.updated_at`,
        [id, r.habitId, r.hour, r.minute, toJson([...new Set(r.days)].sort()), r.enabled ? 1 : 0, iso, iso],
      );
      return id;
    },
    async remove(id: string): Promise<void> {
      await db.runAsync('DELETE FROM reminders WHERE id = ?', [id]);
    },
  };
}

/* ---------- achievements & settings ---------- */

export function createAchievementsRepository(db: SqlDatabase) {
  return {
    async unlocked(): Promise<{ id: string; unlockedAt: string }[]> {
      return (await db.getAllAsync<{ id: string; unlocked_at: string }>('SELECT id, unlocked_at FROM achievements ORDER BY unlocked_at', [])).map((r) => ({ id: r.id, unlockedAt: r.unlocked_at }));
    },
    /** Inserts missing badges; returns the ones unlocked by this call. Idempotent. */
    async unlock(ids: readonly string[], now: Date): Promise<string[]> {
      const fresh: string[] = [];
      for (const id of ids) {
        const r = await db.runAsync('INSERT OR IGNORE INTO achievements (id, unlocked_at) VALUES (?, ?)', [id, now.toISOString()]);
        if (r.changes > 0) fresh.push(id);
      }
      return fresh;
    },
  };
}

export function createSettingsRepository(db: SqlDatabase) {
  return {
    async get<T>(key: string, fallback: T): Promise<T> {
      const r = await db.getFirstAsync<{ value: string }>('SELECT value FROM user_settings WHERE key = ?', [key]);
      return r ? fromJson<T>(r.value, fallback) : fallback;
    },
    async set(key: string, value: unknown, now = new Date()): Promise<void> {
      await db.runAsync(
        'INSERT INTO user_settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at',
        [key, toJson(value), now.toISOString()],
      );
    },
  };
}

export type SettingsRepository = ReturnType<typeof createSettingsRepository>;

/** Loads everything statistics need. Archived habits are included so history stays truthful. */
export async function loadSnapshot(db: SqlDatabase): Promise<Snapshot> {
  const [habits, logs] = await Promise.all([createHabitsRepository(db).list({ includeArchived: true }), createLogsRepository(db).all()]);
  return { habits, logs };
}
