import { addDays, fromDayKey } from '@factory/app-core';

import type { DayKey, NotificationKind, NotificationSetting, OutfitSchedule, Trip } from './types';

/**
 * Pure computation of the local notifications to schedule. The service layer cancels
 * everything with the ClosetWise prefix and re-schedules this list.
 *
 * Privacy: notification texts are generic i18n keys. They never include photos, item
 * names, destinations, amounts or any other personal detail (lock-screen safe).
 */
export const NOTIFICATION_PREFIX = 'closetwise';
/** Android caps pending alarms (~500); stay far below it. */
export const MAX_SCHEDULED = 48;

export interface PlannedNotification {
  id: string;
  kind: NotificationKind;
  at: Date;
  titleKey: string;
  bodyKey: string;
  /** Repeat weekly at the same weekday/time (goals) instead of a one-shot date. */
  weekly?: { weekday: number; hour: number; minute: number };
  /** Repeat monthly (budget check) on the given day. */
  monthly?: { day: number; hour: number; minute: number };
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSetting[] = [
  { kind: 'planned_outfit', enabled: false, hour: 7, minute: 30, param: 0 },
  { kind: 'trip_prep', enabled: false, hour: 19, minute: 0, param: 2 },
  { kind: 'checklist', enabled: false, hour: 20, minute: 0, param: 1 },
  { kind: 'budget', enabled: false, hour: 10, minute: 0, param: 80 },
  { kind: 'goals', enabled: false, hour: 18, minute: 0, param: 0 },
];

function at(day: DayKey, hour: number, minute: number): Date {
  const d = fromDayKey(day);
  d.setHours(hour, minute, 0, 0);
  return d;
}

export function planNotifications(input: {
  settings: readonly NotificationSetting[];
  schedules: readonly OutfitSchedule[];
  trips: readonly Trip[];
  hasActiveGoals: boolean;
  hasBudget: boolean;
  now: Date;
}): PlannedNotification[] {
  const s = new Map(input.settings.map((x) => [x.kind, x]));
  const out: PlannedNotification[] = [];
  const future = (d: Date) => d.getTime() > input.now.getTime();

  const outfit = s.get('planned_outfit');
  if (outfit?.enabled) {
    const days = [...new Set(input.schedules.filter((x) => x.remind && x.outfitId).map((x) => x.date))].sort();
    for (const day of days) {
      const when = at(day, outfit.hour, outfit.minute);
      if (future(when)) out.push({ id: `${NOTIFICATION_PREFIX}-outfit-${day}`, kind: 'planned_outfit', at: when, titleKey: 'notifications.content.outfitTitle', bodyKey: 'notifications.content.outfitBody' });
    }
  }

  const trip = s.get('trip_prep');
  const checklist = s.get('checklist');
  for (const t of input.trips) {
    if (trip?.enabled && t.reminderDays !== null) {
      const lead = t.reminderDays ?? trip.param;
      const when = at(addDays(t.departureDate, -Math.max(0, lead)), trip.hour, trip.minute);
      if (future(when)) out.push({ id: `${NOTIFICATION_PREFIX}-trip-${t.id}`, kind: 'trip_prep', at: when, titleKey: 'notifications.content.tripTitle', bodyKey: 'notifications.content.tripBody' });
    }
    if (checklist?.enabled) {
      const when = at(addDays(t.departureDate, -Math.max(0, checklist.param)), checklist.hour, checklist.minute);
      if (future(when)) out.push({ id: `${NOTIFICATION_PREFIX}-checklist-${t.id}`, kind: 'checklist', at: when, titleKey: 'notifications.content.checklistTitle', bodyKey: 'notifications.content.checklistBody' });
    }
  }

  const budget = s.get('budget');
  if (budget?.enabled && input.hasBudget) {
    // Gentle monthly check-in on the 25th; threshold alerts are sent when a purchase is added.
    out.push({
      id: `${NOTIFICATION_PREFIX}-budget-monthly`,
      kind: 'budget',
      at: input.now,
      titleKey: 'notifications.content.budgetTitle',
      bodyKey: 'notifications.content.budgetBody',
      monthly: { day: 25, hour: budget.hour, minute: budget.minute },
    });
  }

  const goals = s.get('goals');
  if (goals?.enabled && input.hasActiveGoals) {
    out.push({
      id: `${NOTIFICATION_PREFIX}-goals-weekly`,
      kind: 'goals',
      at: input.now,
      titleKey: 'notifications.content.goalsTitle',
      bodyKey: 'notifications.content.goalsBody',
      weekly: { weekday: 1, hour: goals.hour, minute: goals.minute }, // Sunday (expo: 1 = Sunday)
    });
  }

  const repeating = out.filter((n) => n.weekly || n.monthly);
  const oneShot = out.filter((n) => !n.weekly && !n.monthly).sort((a, b) => a.at.getTime() - b.at.getTime());
  return [...repeating, ...oneShot].slice(0, MAX_SCHEDULED);
}
