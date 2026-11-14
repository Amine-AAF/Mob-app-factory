import { addDays, atLocalTime, type DayKey, toDayKey } from './dates';
import type { NotificationCategory, NotificationSetting } from './types';

/**
 * Pure planning of local notifications from the user's data. The service layer
 * (services/reminders.ts) cancels everything HomeCare scheduled and schedules
 * this plan again: on start-up, after every data change and after a settings change.
 * Re-planning on start-up is what makes reminders follow time-zone changes.
 */
export const DEFAULT_NOTIFICATION_SETTINGS: Record<NotificationCategory, Omit<NotificationSetting, 'category'>> = {
  maintenance: { enabled: true, daysBefore: 1, hour: 9, minute: 0 },
  warranty: { enabled: true, daysBefore: 30, hour: 10, minute: 0 },
  document: { enabled: true, daysBefore: 30, hour: 10, minute: 0 },
  recurring_expense: { enabled: true, daysBefore: 2, hour: 9, minute: 0 },
  repair: { enabled: true, daysBefore: 1, hour: 18, minute: 0 },
  household: { enabled: true, daysBefore: 0, hour: 9, minute: 0 },
};

/** Android caps alarms per app (~500); we only keep the soonest ones and re-plan often. */
export const MAX_SCHEDULED = 48;

export interface ReminderSources {
  maintenance: { id: string; title: string; nextDue: DayKey | null; reminderEnabled: boolean; reminderDaysBefore: number | null }[];
  warranties: { id: string; name: string; warrantyEnd: DayKey | null }[];
  documents: { id: string; title: string; type: string; expiryDate: DayKey | null; reminderDaysBefore: number | null }[];
  recurringExpenses: { id: string; title: string; nextDate: DayKey; reminderEnabled: boolean; active: boolean }[];
  repairs: { id: string; title: string; scheduledOn: DayKey | null; status: string }[];
  household: { id: string; title: string; dueDate: DayKey | null; completed: boolean; reminderEnabled: boolean }[];
}

export type ReminderKind =
  | 'maintenance_due'
  | 'warranty_expiring'
  | 'document_expiring'
  | 'contract_renewal'
  | 'bill_due'
  | 'repair_scheduled'
  | 'household_due'
  | 'household_overdue';

export interface PlannedReminder {
  /** Stable identifier: re-planning replaces instead of duplicating. */
  id: string;
  category: NotificationCategory;
  kind: ReminderKind;
  fireAt: Date;
  /** Interpolation values for the i18n title/body (`notifications.kinds.<kind>`). */
  params: { name: string; date: DayKey };
  /** Deep link opened when the notification is tapped. */
  route: string;
}

export interface PlanInput {
  sources: ReminderSources;
  settings: Record<NotificationCategory, Omit<NotificationSetting, 'category'>>;
  /** Global switch (Settings > Notifications). */
  masterEnabled: boolean;
  now: Date;
}

/**
 * When to fire for an event on `eventDay`, `daysBefore` days ahead at hour:minute.
 * If that moment already passed but the event is still ahead (or today), fire at the
 * next available slot instead of dropping the reminder. Returns null when too late.
 */
export function fireDate(eventDay: DayKey, daysBefore: number, hour: number, minute: number, now: Date): Date | null {
  const ideal = atLocalTime(addDays(eventDay, -Math.max(0, daysBefore)), hour, minute);
  if (ideal.getTime() > now.getTime()) return ideal;
  const today = toDayKey(now);
  if (eventDay < today) return null;
  const todaySlot = atLocalTime(today, hour, minute);
  if (todaySlot.getTime() > now.getTime() && today <= eventDay) return todaySlot;
  const tomorrow = addDays(today, 1);
  if (tomorrow <= eventDay) return atLocalTime(tomorrow, hour, minute);
  return null;
}

const RENEWABLE_DOCS = new Set(['contract', 'insurance']);

export function planReminders({ sources, settings, masterEnabled, now }: PlanInput): PlannedReminder[] {
  if (!masterEnabled) return [];
  const out: PlannedReminder[] = [];
  const push = (r: Omit<PlannedReminder, 'fireAt'>, day: DayKey, daysBefore: number) => {
    const s = settings[r.category];
    const at = fireDate(day, daysBefore, s.hour, s.minute, now);
    if (at) out.push({ ...r, fireAt: at });
  };

  if (settings.maintenance.enabled) {
    for (const t of sources.maintenance) {
      if (!t.nextDue || !t.reminderEnabled) continue;
      push({ id: `maintenance:${t.id}`, category: 'maintenance', kind: 'maintenance_due', params: { name: t.title, date: t.nextDue }, route: `/maintenance/${t.id}` }, t.nextDue, t.reminderDaysBefore ?? settings.maintenance.daysBefore);
    }
  }
  if (settings.warranty.enabled) {
    for (const a of sources.warranties) {
      if (!a.warrantyEnd) continue;
      push({ id: `warranty:${a.id}`, category: 'warranty', kind: 'warranty_expiring', params: { name: a.name, date: a.warrantyEnd }, route: `/assets/${a.id}` }, a.warrantyEnd, settings.warranty.daysBefore);
    }
  }
  if (settings.document.enabled) {
    for (const d of sources.documents) {
      if (!d.expiryDate) continue;
      const kind: ReminderKind = RENEWABLE_DOCS.has(d.type) ? 'contract_renewal' : 'document_expiring';
      push({ id: `document:${d.id}`, category: 'document', kind, params: { name: d.title, date: d.expiryDate }, route: `/documents/${d.id}` }, d.expiryDate, d.reminderDaysBefore ?? settings.document.daysBefore);
    }
  }
  if (settings.recurring_expense.enabled) {
    for (const r of sources.recurringExpenses) {
      if (!r.active || !r.reminderEnabled) continue;
      push({ id: `bill:${r.id}`, category: 'recurring_expense', kind: 'bill_due', params: { name: r.title, date: r.nextDate }, route: '/expenses/recurring' }, r.nextDate, settings.recurring_expense.daysBefore);
    }
  }
  if (settings.repair.enabled) {
    for (const r of sources.repairs) {
      if (!r.scheduledOn || (r.status !== 'scheduled' && r.status !== 'reported')) continue;
      push({ id: `repair:${r.id}`, category: 'repair', kind: 'repair_scheduled', params: { name: r.title, date: r.scheduledOn }, route: `/repairs/${r.id}` }, r.scheduledOn, settings.repair.daysBefore);
    }
  }
  if (settings.household.enabled) {
    const today = toDayKey(now);
    for (const h of sources.household) {
      if (!h.dueDate || h.completed || !h.reminderEnabled) continue;
      if (h.dueDate >= today) {
        push({ id: `household:${h.id}`, category: 'household', kind: 'household_due', params: { name: h.title, date: h.dueDate }, route: `/household/${h.id}` }, h.dueDate, settings.household.daysBefore);
      }
      // One "overdue" nudge the day after the due date; for a chore already late, at the
      // next reminder slot (today if the hour is still ahead, otherwise tomorrow).
      const s = settings.household;
      let lateAt = atLocalTime(h.dueDate >= today ? addDays(h.dueDate, 1) : today, s.hour, s.minute);
      if (lateAt.getTime() <= now.getTime()) lateAt = atLocalTime(addDays(today, 1), s.hour, s.minute);
      out.push({ id: `household-late:${h.id}`, category: 'household', kind: 'household_overdue', params: { name: h.title, date: h.dueDate }, route: `/household/${h.id}`, fireAt: lateAt });
    }
  }

  return out.sort((a, b) => a.fireAt.getTime() - b.fireAt.getTime()).slice(0, MAX_SCHEDULED);
}
