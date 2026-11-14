import { REMINDER_CHANNEL_ID, configureForegroundHandling, getPermission, requestPermission, type PermissionResult } from '@factory/notifications';
import * as Notifications from 'expo-notifications';

import { repos } from '@/database';
import type { ChecklistItem, Instant } from '@/types/models';
import { clock } from '@/utils/clock';

import { recordError } from './analytics';

/**
 * Local task reminders (no server, no push token). A reminder is a one-shot notification
 * at a UTC instant computed from the local date/time the user picked on this phone.
 * The notification content never includes more than the task title the user typed.
 */
const ID_PREFIX = 'task-';

export function initReminders(): void {
  try {
    configureForegroundHandling();
  } catch (e) {
    recordError(e, 'reminders_init');
  }
}

export async function reminderPermission(): Promise<PermissionResult> {
  return getPermission().catch(() => 'undetermined' as const);
}

export async function askReminderPermission(channelName: string): Promise<PermissionResult> {
  return requestPermission(channelName).catch(() => 'denied' as const);
}

/** Builds the reminder instant from a local date ("YYYY-MM-DD") and time ("HH:mm") on this device. */
export function reminderInstant(date: string, time: string): Instant {
  const [y, m, d] = date.split('-').map(Number) as [number, number, number];
  const [hh, mm] = time.split(':').map(Number) as [number, number];
  return new Date(y, m - 1, d, hh, mm, 0, 0).toISOString();
}

export function isFutureInstant(instant: Instant | null, now: Date = clock.now()): boolean {
  return !!instant && Date.parse(instant) > now.getTime();
}

/** Schedules (or replaces) the reminder of a task; returns the notification id, or null if not scheduled. */
export async function scheduleTaskReminder(item: Pick<ChecklistItem, 'id' | 'title' | 'reminderAt' | 'status' | 'notificationId'>, heading: string): Promise<string | null> {
  await cancelReminder(item.notificationId);
  if (item.status === 'done' || !isFutureInstant(item.reminderAt)) {
    await repos().checklists.setNotificationId(item.id, null);
    return null;
  }
  if ((await reminderPermission()) !== 'granted') return null;
  const id = await Notifications.scheduleNotificationAsync({
    identifier: `${ID_PREFIX}${item.id}`,
    content: { title: heading, body: item.title },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(item.reminderAt!), channelId: REMINDER_CHANNEL_ID },
  });
  await repos().checklists.setNotificationId(item.id, id);
  return id;
}

export async function cancelReminder(notificationId: string | null | undefined): Promise<void> {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // Already fired or removed.
  }
}

export async function cancelReminders(ids: string[]): Promise<void> {
  await Promise.all(ids.map(cancelReminder));
}

/** Cancels every TravelWise task reminder (used by "Delete all my data"). */
export async function cancelAllTaskReminders(): Promise<void> {
  try {
    const all = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(all.filter((n) => n.identifier.startsWith(ID_PREFIX)).map((n) => cancelReminder(n.identifier)));
  } catch (e) {
    recordError(e, 'reminders_cancel_all');
  }
}
