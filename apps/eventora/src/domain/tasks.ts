import { daysBetween } from './time';
import type { Task, TaskPriority, TaskStatus } from './types';

/** Task logic: overdue detection, progress, grouping for list and calendar views. */

export function isOpen(t: Pick<Task, 'status'>): boolean {
  return t.status === 'todo' || t.status === 'in_progress';
}

export function isOverdue(t: Pick<Task, 'status' | 'dueDate'>, today: string): boolean {
  return isOpen(t) && !!t.dueDate && t.dueDate < today;
}

export function isDueSoon(t: Pick<Task, 'status' | 'dueDate'>, today: string, withinDays = 7): boolean {
  if (!isOpen(t) || !t.dueDate || t.dueDate < today) return false;
  return daysBetween(today, t.dueDate) <= withinDays;
}

/** Preparation progress: completed / (all − cancelled). */
export function taskProgress(tasks: readonly Pick<Task, 'status'>[]): { done: number; total: number; ratio: number } {
  const relevant = tasks.filter((t) => t.status !== 'cancelled');
  const done = relevant.filter((t) => t.status === 'completed').length;
  return { done, total: relevant.length, ratio: relevant.length === 0 ? 0 : done / relevant.length };
}

const PRIORITY_RANK: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };
const STATUS_RANK: Record<TaskStatus, number> = { in_progress: 0, todo: 1, completed: 2, cancelled: 3 };

/** Open first, then by due date (undated last), priority, manual order. */
export function sortTasks<T extends Task>(tasks: readonly T[]): T[] {
  return [...tasks].sort((a, b) => {
    const oa = isOpen(a) ? 0 : 1;
    const ob = isOpen(b) ? 0 : 1;
    if (oa !== ob) return oa - ob;
    if (STATUS_RANK[a.status] !== STATUS_RANK[b.status] && (!isOpen(a) || !isOpen(b))) return STATUS_RANK[a.status] - STATUS_RANK[b.status];
    const da = a.dueDate ?? '9999-12-31';
    const db = b.dueDate ?? '9999-12-31';
    if (da !== db) return da.localeCompare(db);
    if (PRIORITY_RANK[a.priority] !== PRIORITY_RANK[b.priority]) return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    return a.sortOrder - b.sortOrder;
  });
}

export type TaskBucket = 'overdue' | 'today' | 'week' | 'later' | 'undated' | 'done';

export function bucketOf(t: Task, today: string): TaskBucket {
  if (!isOpen(t)) return 'done';
  if (!t.dueDate) return 'undated';
  if (t.dueDate < today) return 'overdue';
  if (t.dueDate === today) return 'today';
  return daysBetween(today, t.dueDate) <= 7 ? 'week' : 'later';
}

export function groupByBucket<T extends Task>(tasks: readonly T[], today: string): Record<TaskBucket, T[]> {
  const out: Record<TaskBucket, T[]> = { overdue: [], today: [], week: [], later: [], undated: [], done: [] };
  for (const t of sortTasks(tasks)) out[bucketOf(t, today)].push(t);
  return out;
}

/** Tasks indexed by due date, for the calendar view. */
export function tasksByDate<T extends Task>(tasks: readonly T[]): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const t of tasks) {
    if (!t.dueDate || t.status === 'cancelled') continue;
    map.set(t.dueDate, [...(map.get(t.dueDate) ?? []), t]);
  }
  return map;
}

/** Status transition when the checkbox is tapped. */
export function toggleDone(status: TaskStatus): TaskStatus {
  return status === 'completed' ? 'todo' : 'completed';
}
