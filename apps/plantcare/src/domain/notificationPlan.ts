import { addDays, diffDays } from '@factory/app-core';

import type { CareTask, DayKey, NotificationSetting, Plant, TaskType } from './types';

/**
 * Builds the local notification plan from the care schedule. Pure and deterministic.
 *
 * Anti-spam rules (never excessive or repetitive):
 * - at most ONE notification per day, grouping every task due that day;
 * - overdue tasks produce a single "you have overdue care" reminder today, never daily nagging;
 * - only the next `horizonDays` days are scheduled (re-planned at every app start / change);
 * - respects the global switch, per task type, per plant and per task settings.
 */
export interface PlannedNotification {
  id: string;
  day: DayKey;
  hour: number;
  minute: number;
  /** Tasks grouped in this notification. */
  items: { taskId: string; plantId: string; plantName: string; type: TaskType }[];
  overdue: boolean;
}

export interface PlanInput {
  tasks: CareTask[];
  plants: Pick<Plant, 'id' | 'nickname'>[];
  settings: NotificationSetting[];
  globalEnabled: boolean;
  hour: number;
  minute: number;
  today: DayKey;
  /** Current local time in minutes since midnight; reminders already passed today are not scheduled. */
  nowMinutes: number;
  horizonDays?: number;
}

export const NOTIFICATION_HORIZON_DAYS = 14;

/** Resolution order: plant-level setting > global type setting > enabled. */
export function isTypeEnabled(settings: NotificationSetting[], plantId: string, type: TaskType): boolean {
  const plant = settings.find((s) => s.plantId === plantId && s.taskType === type);
  if (plant) return plant.enabled;
  const global = settings.find((s) => s.plantId === null && s.taskType === type);
  return global ? global.enabled : true;
}

export function planNotifications(input: PlanInput): PlannedNotification[] {
  if (!input.globalEnabled) return [];
  const horizon = input.horizonDays ?? NOTIFICATION_HORIZON_DAYS;
  const names = new Map(input.plants.map((p) => [p.id, p.nickname]));
  const last = addDays(input.today, horizon - 1);
  const passedToday = input.nowMinutes >= input.hour * 60 + input.minute;

  const byDay = new Map<DayKey, PlannedNotification['items']>();
  const overdue: PlannedNotification['items'] = [];
  for (const t of input.tasks) {
    if (!t.active || !t.nextDue || !t.remindersEnabled) continue;
    if (!names.has(t.plantId)) continue;
    if (!isTypeEnabled(input.settings, t.plantId, t.type)) continue;
    const item = { taskId: t.id, plantId: t.plantId, plantName: names.get(t.plantId)!, type: t.type };
    if (diffDays(input.today, t.nextDue) < 0) overdue.push(item);
    else if (t.nextDue <= last) byDay.set(t.nextDue, [...(byDay.get(t.nextDue) ?? []), item]);
  }

  const out: PlannedNotification[] = [];
  for (const [day, items] of [...byDay.entries()].sort(([a], [b]) => (a < b ? -1 : 1))) {
    if (day === input.today && passedToday) continue;
    const merged = day === input.today ? [...items, ...overdue] : items;
    out.push({ id: `care-${day}`, day, hour: input.hour, minute: input.minute, items: merged, overdue: day === input.today && overdue.length > 0 });
  }
  // Overdue only (nothing new due today): one gentle reminder today if the time has not passed.
  if (overdue.length > 0 && !byDay.has(input.today) && !passedToday) {
    out.unshift({ id: `care-${input.today}`, day: input.today, hour: input.hour, minute: input.minute, items: overdue, overdue: true });
  }
  return out;
}
