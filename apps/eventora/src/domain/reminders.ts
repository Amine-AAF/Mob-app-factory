import { isActive } from './events';
import { isPending } from './guests';
import { isOpen } from './tasks';
import { isValidDate } from './time';
import type { EventRecord, Expense, Guest, NotificationKind, NotificationSetting, Task, Vendor } from './types';

/**
 * Local notification planner (pure). Produces the full list of reminders the
 * app should have scheduled; the service layer diffs it with the OS.
 *
 * Privacy: notification texts never contain guest names, contact details,
 * dietary information or amounts. The event name is included only when the
 * user opted in (`showEventNames`), because the lock screen is visible to others.
 */

export const DEFAULT_NOTIFICATION_SETTINGS: Record<NotificationKind, NotificationSetting> = {
  task_due: { kind: 'task_due', enabled: true, leadDays: 0, hour: 9 },
  deadline_soon: { kind: 'deadline_soon', enabled: true, leadDays: 3, hour: 9 },
  event_upcoming: { kind: 'event_upcoming', enabled: true, leadDays: 7, hour: 10 },
  rsvp_followup: { kind: 'rsvp_followup', enabled: true, leadDays: 21, hour: 18 },
  payment_due: { kind: 'payment_due', enabled: true, leadDays: 2, hour: 9 },
  vendor_meeting: { kind: 'vendor_meeting', enabled: true, leadDays: 0, hour: 9 },
};

export interface PlannedNotification {
  id: string;
  kind: NotificationKind;
  fireAt: Date;
  eventId: string;
  /** i18n keys + safe params (counts, days). */
  titleKey: string;
  bodyKey: string;
  params: Record<string, string | number>;
}

export interface PlannerInput {
  now: Date;
  masterEnabled: boolean;
  showEventNames: boolean;
  settings: Record<NotificationKind, NotificationSetting>;
  events: readonly EventRecord[];
  tasks: readonly Task[];
  expenses: readonly Expense[];
  vendors: readonly Vendor[];
  guests: readonly Guest[];
  /** Safety cap (Android limits scheduled alarms per app). */
  max?: number;
}

/** Device-local date at `hour`:00, `leadDays` before `date`. */
export function localFireDate(date: string, leadDays: number, hour: number): Date | null {
  if (!isValidDate(date)) return null;
  const [y, m, d] = date.split('-').map(Number) as [number, number, number];
  return new Date(y, m - 1, d - leadDays, hour, 0, 0, 0);
}

export const NOTIFICATION_PREFIX = 'eventora-';

export function planNotifications(input: PlannerInput): PlannedNotification[] {
  if (!input.masterEnabled) return [];
  const out: PlannedNotification[] = [];
  const now = input.now.getTime();
  const activeEvents = new Map(input.events.filter((e) => isActive(e.status)).map((e) => [e.id, e]));
  const label = (eventId: string) => {
    const e = activeEvents.get(eventId);
    return input.showEventNames && e ? e.name : '';
  };
  const titleKey = (base: string, eventId: string) => (label(eventId) ? `${base}Named` : base);
  const push = (n: Omit<PlannedNotification, 'params'> & { params?: Record<string, string | number> }) => {
    if (n.fireAt.getTime() > now) out.push({ ...n, params: { event: label(n.eventId), ...(n.params ?? {}) } });
  };
  const s = input.settings;

  for (const t of input.tasks) {
    if (!isOpen(t) || !t.dueDate || !activeEvents.has(t.eventId)) continue;
    if (s.task_due.enabled) {
      const at = localFireDate(t.dueDate, s.task_due.leadDays, s.task_due.hour);
      if (at) push({ id: `${NOTIFICATION_PREFIX}task-${t.id}`, kind: 'task_due', fireAt: at, eventId: t.eventId, titleKey: titleKey('notifications.taskDue.title', t.eventId), bodyKey: 'notifications.taskDue.body' });
    }
    if (s.deadline_soon.enabled && s.deadline_soon.leadDays > 0 && t.priority === 'high') {
      const at = localFireDate(t.dueDate, s.deadline_soon.leadDays, s.deadline_soon.hour);
      if (at) push({ id: `${NOTIFICATION_PREFIX}soon-${t.id}`, kind: 'deadline_soon', fireAt: at, eventId: t.eventId, titleKey: titleKey('notifications.deadlineSoon.title', t.eventId), bodyKey: 'notifications.deadlineSoon.body', params: { days: s.deadline_soon.leadDays } });
    }
  }

  for (const e of activeEvents.values()) {
    if (s.event_upcoming.enabled) {
      const at = localFireDate(e.startDate, s.event_upcoming.leadDays, s.event_upcoming.hour);
      if (at) push({ id: `${NOTIFICATION_PREFIX}event-${e.id}`, kind: 'event_upcoming', fireAt: at, eventId: e.id, titleKey: titleKey('notifications.eventUpcoming.title', e.id), bodyKey: 'notifications.eventUpcoming.body', params: { days: s.event_upcoming.leadDays } });
    }
    if (s.rsvp_followup.enabled) {
      const pending = input.guests.filter((g) => g.eventId === e.id && isPending(g.rsvpStatus)).length;
      const at = localFireDate(e.startDate, s.rsvp_followup.leadDays, s.rsvp_followup.hour);
      if (pending > 0 && at) push({ id: `${NOTIFICATION_PREFIX}rsvp-${e.id}`, kind: 'rsvp_followup', fireAt: at, eventId: e.id, titleKey: titleKey('notifications.rsvpFollowup.title', e.id), bodyKey: 'notifications.rsvpFollowup.body', params: { count: pending } });
    }
  }

  if (s.payment_due.enabled) {
    for (const x of input.expenses) {
      if (x.paymentStatus === 'paid' || !x.dueDate || !activeEvents.has(x.eventId)) continue;
      const at = localFireDate(x.dueDate, s.payment_due.leadDays, s.payment_due.hour);
      if (at) push({ id: `${NOTIFICATION_PREFIX}pay-${x.id}`, kind: 'payment_due', fireAt: at, eventId: x.eventId, titleKey: titleKey('notifications.paymentDue.title', x.eventId), bodyKey: 'notifications.paymentDue.body' });
    }
  }

  if (s.vendor_meeting.enabled) {
    for (const v of input.vendors) {
      if (!v.meetingAt || v.status === 'cancelled' || !activeEvents.has(v.eventId)) continue;
      const meeting = new Date(v.meetingAt);
      if (Number.isNaN(meeting.getTime())) continue;
      const lead = s.vendor_meeting.leadDays > 0 ? s.vendor_meeting.leadDays * 86_400_000 : 60 * 60_000;
      push({ id: `${NOTIFICATION_PREFIX}vendor-${v.id}`, kind: 'vendor_meeting', fireAt: new Date(meeting.getTime() - lead), eventId: v.eventId, titleKey: titleKey('notifications.vendorMeeting.title', v.eventId), bodyKey: 'notifications.vendorMeeting.body' });
    }
  }

  return out.sort((a, b) => a.fireAt.getTime() - b.fireAt.getTime()).slice(0, input.max ?? 60);
}
