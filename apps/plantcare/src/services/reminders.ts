import { addDays, fromDayKey } from '@factory/app-core';
import { configureForegroundHandling, ensureChannel, getPermission, requestPermission, REMINDER_CHANNEL_ID, type PermissionResult } from '@factory/notifications';
import * as Notifications from 'expo-notifications';
import type { TFunction } from 'i18next';

import type { Repositories } from '@/database';
import { planNotifications, type PlannedNotification } from '@/domain/notificationPlan';
import { usePreferences } from '@/store/preferences';

import { recordError } from './analytics';
import { clock } from './clock';

/**
 * Local care reminders (no push server). The whole plan is recomputed after every change
 * that can affect it (task done, schedule edited, settings changed, app start), so stale
 * notifications never fire. Uses the shared channel from @factory/notifications.
 */
const PREFIX = 'care-';

export function initNotifications(): void {
  try {
    configureForegroundHandling();
  } catch (e) {
    recordError(e, 'notifications_init');
  }
}

export { getPermission };

export async function askPermission(t: TFunction): Promise<PermissionResult> {
  try {
    return await requestPermission(t('notifications.channel'));
  } catch (e) {
    recordError(e, 'notifications_permission');
    return 'denied';
  }
}

export function notificationText(n: PlannedNotification, t: TFunction): { title: string; body: string } {
  const first = n.items[0]!;
  const title = n.overdue ? t('notifications.overdueTitle') : t('notifications.title');
  if (n.items.length === 1) return { title, body: t(`notifications.single.${first.type}`, { plant: first.plantName }) };
  const plants = [...new Set(n.items.map((i) => i.plantName))];
  return { title, body: t('notifications.multi', { count: n.items.length, plants: plants.slice(0, 3).join(', ') + (plants.length > 3 ? '…' : '') }) };
}

async function cancelCareNotifications(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(scheduled.filter((n) => n.identifier.startsWith(PREFIX)).map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)));
}

/** Rebuilds all scheduled care notifications. Safe to call often; never throws. */
export async function refreshReminders(r: Repositories, t: TFunction): Promise<number> {
  try {
    const prefs = usePreferences.getState();
    await cancelCareNotifications();
    if (!prefs.notificationsEnabled) return 0;
    if ((await getPermission()) !== 'granted') return 0; // permission refused: the app works, without reminders
    const [tasks, plants, settings] = await Promise.all([r.tasks.listActive(), r.plants.list(), r.notifications.all()]);
    const plan = planNotifications({
      tasks,
      plants,
      settings,
      globalEnabled: prefs.notificationsEnabled,
      hour: prefs.reminderHour,
      minute: prefs.reminderMinute,
      today: clock.today(),
      nowMinutes: clock.minutesOfDay(),
    });
    await ensureChannel(t('notifications.channel'));
    for (const n of plan) {
      const date = fromDayKey(n.day);
      date.setHours(n.hour, n.minute, 0, 0);
      const { title, body } = notificationText(n, t);
      await Notifications.scheduleNotificationAsync({
        identifier: n.id,
        content: { title, body, data: { url: n.items.length === 1 ? `/plant/${n.items[0]!.plantId}` : '/(tabs)/calendar' } },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date, channelId: REMINDER_CHANNEL_ID },
      });
    }
    return plan.length;
  } catch (e) {
    recordError(e, 'notifications_refresh');
    return 0;
  }
}

/** Test notification ~5 s later, for the settings screen. */
export async function sendTest(t: TFunction): Promise<void> {
  await ensureChannel(t('notifications.channel'));
  await Notifications.scheduleNotificationAsync({
    content: { title: t('notifications.title'), body: t('notifications.test') },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 5, channelId: REMINDER_CHANNEL_ID },
  });
}

export { addDays };
