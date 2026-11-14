import { configureForegroundHandling, ensureChannel, getPermission, REMINDER_CHANNEL_ID, requestPermission, sendTestNotification, type PermissionResult } from '@factory/notifications';
import * as Notifications from 'expo-notifications';
import type { TFunction } from 'i18next';

import type { Repositories } from '@/database';
import { NOTIFICATION_PREFIX, planNotifications, toExpoWeekday } from '@/features/reminders/plan';

import { recordError } from './analytics';
import { clock } from './clock';

/**
 * Local reminders (no server, no push token). @factory/notifications provides the
 * channel, the Android 13+ permission flow and foreground handling; it only knows
 * one global daily reminder, so HabitFlow plans its own per-habit, per-weekday
 * notifications here (candidate for the shared package — see factory/tracking/habitflow.md).
 *
 * The scheduled set is always rebuilt from the database ("sync"), so it can never
 * drift: after any reminder/habit change, at start-up and on language change.
 */
export function initNotifications(): void {
  configureForegroundHandling();
}

export { getPermission };

export async function ensurePermission(t: TFunction): Promise<PermissionResult> {
  return requestPermission(t('notifications.channelName'));
}

async function cancelOwn(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(scheduled.filter((n) => n.identifier.startsWith(NOTIFICATION_PREFIX)).map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)));
}

export async function syncNotifications(r: Repositories, t: TFunction): Promise<number> {
  try {
    await cancelOwn();
    if ((await getPermission()) !== 'granted') return 0;
    const [reminders, habits] = await Promise.all([r.reminders.all(), r.habits.list()]);
    const plan = planNotifications(reminders, habits, clock.today());
    if (plan.length === 0) return 0;
    await ensureChannel(t('notifications.channelName'));
    const names = new Map(habits.map((h) => [h.id, h.name]));
    for (const p of plan) {
      const name = p.habitId ? names.get(p.habitId) : null;
      const content = name
        ? { title: name, body: t('notifications.habitBody') }
        : { title: t('notifications.generalTitle'), body: t('notifications.generalBody') };
      await Notifications.scheduleNotificationAsync({
        identifier: p.identifier,
        content: { ...content, data: { url: '/' } },
        trigger:
          p.weekday === null
            ? { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: p.hour, minute: p.minute, channelId: REMINDER_CHANNEL_ID }
            : { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: toExpoWeekday(p.weekday), hour: p.hour, minute: p.minute, channelId: REMINDER_CHANNEL_ID },
      });
    }
    return plan.length;
  } catch (e) {
    recordError(e, 'reminders_sync');
    return 0;
  }
}

export async function cancelAllReminders(): Promise<void> {
  await cancelOwn().catch(() => undefined);
}

export async function testReminder(t: TFunction): Promise<PermissionResult> {
  const permission = await ensurePermission(t);
  if (permission === 'granted') await sendTestNotification({ title: t('notifications.generalTitle'), body: t('notifications.generalBody'), channelName: t('notifications.channelName') });
  return permission;
}
