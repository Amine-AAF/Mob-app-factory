import { addDays } from '@factory/app-core';
import type { TFunction } from 'i18next';

import { loadSnapshot, repos, type HabitInput, type Repositories, type TaskInput } from '@/database';
import { earnedBadges, xpForCompletion } from '@/features/gamification/rewards';
import { sameFrequency, scheduleOn } from '@/features/habits/schedule';
import { overview } from '@/features/statistics/stats';
import { useSession } from '@/store/session';
import type { DayKey, Tracking } from '@/types';

import { recordError, track } from './analytics';
import { clock } from './clock';
import { feedback } from './feedback';
import { syncNotifications } from './reminders';

/**
 * Every user action that changes habits, logs or tasks goes through here so that
 * XP, badges, reminders and screen refreshes always follow the same rules.
 * Nothing in HabitFlow ever writes a log on its own: past days are only changed
 * by an explicit user action.
 */

export class TrackingError extends Error {
  constructor(public readonly code: 'future_day' | 'not_scheduled' | 'not_found') {
    super(code);
  }
}

async function refreshBadges(r: Repositories): Promise<void> {
  try {
    const snapshot = await loadSnapshot(r.db);
    const today = clock.today();
    const ids = earnedBadges({
      snapshot,
      overview: overview(snapshot, today),
      tasksCompleted: await r.tasks.completedCount(),
      completionHour: (l) => (l.completedAt ? new Date(l.completedAt).getHours() : null),
    });
    const fresh = await r.achievements.unlock(ids, clock.now());
    for (const id of fresh) track('achievement_unlocked', { achievement_id: id });
    useSession.getState().pushAchievements(fresh);
  } catch (e) {
    recordError(e, 'badges');
  }
}

/** Sets the value logged for a habit on a day (0 = undo). Returns the XP change. */
export async function setValue(habitId: string, day: DayKey, value: number, extra: { note?: string | null; skipped?: boolean } = {}, r: Repositories = repos()) {
  const today = clock.today();
  if (day > today) throw new TrackingError('future_day');
  const habit = await r.habits.get(habitId);
  if (!habit) throw new TrackingError('not_found');
  const schedule = scheduleOn(habit, day);
  if (!schedule) throw new TrackingError('not_scheduled');
  const result = await r.logs.write(habitId, day, schedule.tracking, { value, ...extra }, { now: clock.now(), xp: xpForCompletion(day, today) });
  if (result.newlyDone) {
    feedback.success();
    track('habit_completed', { tracking: schedule.tracking.mode, backfill: day < today });
  }
  await refreshBadges(r);
  useSession.getState().bump();
  return result;
}

/** Quick check-in: done ↔ not done (for quantities: target ↔ 0). */
export async function toggle(habitId: string, day: DayKey, r: Repositories = repos()) {
  const [habit, log] = await Promise.all([r.habits.get(habitId), r.logs.get(habitId, day)]);
  if (!habit) throw new TrackingError('not_found');
  const s = scheduleOn(habit, day);
  if (!s) throw new TrackingError('not_scheduled');
  const done = log?.status === 'done';
  return setValue(habitId, day, done ? 0 : s.tracking.mode === 'check' ? 1 : s.tracking.target, { note: log?.note ?? null }, r);
}

export async function increment(habitId: string, day: DayKey, delta: number, r: Repositories = repos()) {
  const log = await r.logs.get(habitId, day);
  const current = log && log.status !== 'skipped' ? log.value : 0;
  return setValue(habitId, day, Math.max(0, Math.round((current + delta) * 100) / 100), { note: log?.note ?? null }, r);
}

export async function skip(habitId: string, day: DayKey, r: Repositories = repos()) {
  const log = await r.logs.get(habitId, day);
  if (log?.status === 'skipped') return setValue(habitId, day, 0, { note: log.note }, r);
  return setValue(habitId, day, 0, { skipped: true, note: log?.note ?? null }, r);
}

export async function setNote(habitId: string, day: DayKey, note: string | null, r: Repositories = repos()) {
  const log = await r.logs.get(habitId, day);
  return setValue(habitId, day, log?.status === 'skipped' ? 0 : (log?.value ?? 0), { note, skipped: log?.status === 'skipped' }, r);
}

export async function createHabit(input: HabitInput, t: TFunction, r: Repositories = repos()): Promise<string> {
  const id = await r.habits.create(input, clock.now());
  track('habit_created', { category: input.category, frequency: input.frequency.type, tracking: input.tracking.mode, from_template: !!input.templateId });
  await refreshBadges(r);
  useSession.getState().bump();
  void syncNotifications(r, t);
  return id;
}

/**
 * Updates a habit. Descriptive fields change everywhere; rule changes (frequency,
 * target) only apply from today, so past days and statistics are never rewritten.
 * Today's own log is re-evaluated against the new target.
 */
export async function updateHabit(id: string, input: HabitInput, t: TFunction, r: Repositories = repos()): Promise<void> {
  const habit = await r.habits.get(id);
  if (!habit) throw new TrackingError('not_found');
  const now = clock.now();
  const today = clock.today();
  await r.habits.updateDetails(id, input, now);
  const current = scheduleOn(habit, today) ?? habit.schedules.at(-1);
  if (!current || !sameFrequency(current.frequency, input.frequency) || !sameTracking(current.tracking, input.tracking)) {
    const from = today < habit.startDate ? habit.startDate : today;
    await r.habits.setSchedule(id, from, input.frequency, input.tracking, now);
    const todayLog = await r.logs.get(id, today);
    if (todayLog && todayLog.status !== 'skipped' && from === today) {
      await r.logs.write(id, today, input.tracking, { value: todayLog.value, note: todayLog.note }, { now, xp: xpForCompletion(today, today) });
    }
  }
  await refreshBadges(r);
  useSession.getState().bump();
  void syncNotifications(r, t);
}

function sameTracking(a: Tracking, b: Tracking): boolean {
  return a.mode === b.mode && a.target === b.target && (a.unit ?? null) === (b.unit ?? null);
}

export async function archiveHabit(id: string, t: TFunction, r: Repositories = repos()): Promise<void> {
  const habit = await r.habits.get(id);
  if (!habit) return;
  // Archived from tomorrow: today's check-in (if any) still counts.
  const today = clock.today();
  const from = habit.startDate > today ? habit.startDate : addDays(today, 1);
  await r.habits.archive(id, from, clock.now());
  track('habit_archived', { category: habit.category });
  useSession.getState().bump();
  void syncNotifications(r, t);
}

export async function unarchiveHabit(id: string, t: TFunction, r: Repositories = repos()): Promise<void> {
  await r.habits.unarchive(id, clock.now());
  useSession.getState().bump();
  void syncNotifications(r, t);
}

export async function deleteHabit(id: string, t: TFunction, r: Repositories = repos()): Promise<void> {
  await r.habits.remove(id);
  useSession.getState().bump();
  void syncNotifications(r, t);
}

/* ---------- planner ---------- */

export async function createTask(input: TaskInput, r: Repositories = repos()): Promise<string> {
  const id = await r.tasks.create(input, clock.now());
  track('planner_task_created', { priority: input.priority, linked: !!input.habitId });
  useSession.getState().bump();
  return id;
}

export async function updateTask(id: string, input: TaskInput, r: Repositories = repos()): Promise<void> {
  await r.tasks.update(id, input, clock.now());
  useSession.getState().bump();
}

export async function toggleTask(id: string, done: boolean, r: Repositories = repos()): Promise<void> {
  await r.tasks.setDone(id, done, clock.now());
  if (done) feedback.success();
  if (done) await refreshBadges(r);
  useSession.getState().bump();
}

export async function deleteTask(id: string, r: Repositories = repos()): Promise<void> {
  await r.tasks.remove(id);
  useSession.getState().bump();
}

export async function reorderTasks(updates: { id: string; sortOrder: number }[], r: Repositories = repos()): Promise<void> {
  if (!updates.length) return;
  await r.tasks.setOrders(updates, clock.now());
  useSession.getState().bump();
}
