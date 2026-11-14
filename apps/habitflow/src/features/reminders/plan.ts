import { MAX_SCHEDULED_NOTIFICATIONS } from '@/constants';
import type { HabitWithSchedules, Reminder, Weekday } from '@/types';

/**
 * Pure planning of local notifications from the user's reminders.
 *
 * - One notification per (reminder, weekday) — expo-notifications WEEKLY triggers —
 *   or a single DAILY trigger when the reminder applies every day.
 * - A habit reminder only fires on days the habit is scheduled (for "chosen weekdays"
 *   habits), never for archived habits or disabled reminders.
 * - The total is capped so HabitFlow never floods the user (and stays well under
 *   Android's alarm limits).
 */
export const NOTIFICATION_PREFIX = 'habitflow-';

export interface PlannedNotification {
  identifier: string;
  reminderId: string;
  habitId: string | null;
  hour: number;
  minute: number;
  /** null = every day (DAILY trigger); otherwise JS weekday 0–6. */
  weekday: Weekday | null;
}

const ALL_DAYS: Weekday[] = [0, 1, 2, 3, 4, 5, 6];

export function planNotifications(reminders: readonly Reminder[], habits: readonly HabitWithSchedules[], today: string): PlannedNotification[] {
  const byId = new Map(habits.map((h) => [h.id, h]));
  const out: PlannedNotification[] = [];
  const sorted = [...reminders].sort((a, b) => Number(a.habitId !== null) - Number(b.habitId !== null) || a.hour - b.hour || a.minute - b.minute);
  for (const r of sorted) {
    if (!r.enabled) continue;
    let days: Weekday[] = r.days.length ? [...new Set(r.days)].sort() : ALL_DAYS;
    if (r.habitId) {
      const h = byId.get(r.habitId);
      if (!h || (h.archivedOn && h.archivedOn <= today)) continue;
      const current = h.schedules.filter((s) => s.effectiveFrom <= today).at(-1) ?? h.schedules.at(-1);
      if (current?.frequency.type === 'weekdays') {
        const allowed = new Set(current.frequency.days);
        days = days.filter((d) => allowed.has(d));
      }
      // Flexible (X per week/month) and interval habits: remind on the chosen days (all by default).
      if (days.length === 0) continue;
    }
    if (days.length === 7) {
      out.push({ identifier: `${NOTIFICATION_PREFIX}${r.id}-all`, reminderId: r.id, habitId: r.habitId, hour: r.hour, minute: r.minute, weekday: null });
    } else {
      for (const d of days) out.push({ identifier: `${NOTIFICATION_PREFIX}${r.id}-${d}`, reminderId: r.id, habitId: r.habitId, hour: r.hour, minute: r.minute, weekday: d });
    }
  }
  return out.slice(0, MAX_SCHEDULED_NOTIFICATIONS);
}

/** expo-notifications weekly triggers use 1 = Sunday … 7 = Saturday. */
export function toExpoWeekday(d: Weekday): number {
  return d + 1;
}
