import type { PlannerTask, Priority } from '@/types';

/** Light daily planner rules (no projects, no sub-tasks — on purpose). */
export const PRIORITIES: readonly Priority[] = ['high', 'medium', 'low'];
const RANK: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

export function isValidTime(time: string | null): boolean {
  if (time === null) return true;
  const m = /^(\d{2}):(\d{2})$/.exec(time);
  return !!m && Number(m[1]) <= 23 && Number(m[2]) <= 59;
}

/** Open tasks first, in the user's manual order; finished tasks at the bottom. */
export function sortTasks(tasks: readonly PlannerTask[]): PlannerTask[] {
  return [...tasks].sort((a, b) => Number(a.done) - Number(b.done) || a.sortOrder - b.sortOrder || RANK[a.priority] - RANK[b.priority] || a.createdAt.localeCompare(b.createdAt));
}

/**
 * Moves a task up/down among the open tasks of its day and returns the new
 * sort orders to persist (dense 0..n-1, so repeated moves never drift).
 */
export function reorder(tasks: readonly PlannerTask[], id: string, direction: -1 | 1): { id: string; sortOrder: number }[] {
  const open = sortTasks(tasks).filter((t) => !t.done);
  const i = open.findIndex((t) => t.id === id);
  const j = i + direction;
  if (i < 0 || j < 0 || j >= open.length) return [];
  [open[i], open[j]] = [open[j]!, open[i]!];
  return open.map((t, sortOrder) => ({ id: t.id, sortOrder })).filter((u) => tasks.find((t) => t.id === u.id)?.sortOrder !== u.sortOrder);
}

/** Overdue = still open and due before today; they are shown on today's list. */
export function isOverdue(task: PlannerTask, today: string): boolean {
  return !task.done && task.dueDay < today;
}
