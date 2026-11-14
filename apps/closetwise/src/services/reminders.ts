import { addDays } from '@factory/app-core';
import { configureForegroundHandling, ensureChannel, getPermission, requestPermission, type PermissionResult } from '@factory/notifications';
import * as Notifications from 'expo-notifications';
import type { TFunction } from 'i18next';

import type { Repositories } from '@/database';
import { NOTIFICATION_PREFIX, planNotifications } from '@/domain/notificationPlan';

import { recordError } from './analytics';
import { clock } from './clock';

/**
 * Local notifications only (no push server, no token). Every kind is opt-in and can be
 * turned off in Settings > Notifications. Texts are generic and never contain photos,
 * item names, destinations or amounts.
 */
export const CHANNEL_ID = 'daily-reminder'; // channel created by @factory/notifications

export function initNotifications(): void {
  try {
    configureForegroundHandling();
  } catch (e) {
    recordError(e, 'notifications_init');
  }
}

export { getPermission };

export async function askPermission(t: TFunction): Promise<PermissionResult> {
  return requestPermission(t('notifications.channelName'));
}

async function cancelOurs(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(scheduled.filter((n) => n.identifier.startsWith(NOTIFICATION_PREFIX)).map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)));
}

/** Re-computes and re-schedules every ClosetWise notification. Safe to call often. */
export async function refreshNotifications(r: Repositories, t: TFunction): Promise<number> {
  try {
    const settings = await r.settings.notifications();
    await cancelOurs();
    if (!settings.some((s) => s.enabled)) return 0;
    if ((await getPermission()) !== 'granted') return 0;
    const today = clock.today();
    const [schedules, trips, goals, app] = await Promise.all([r.schedules.range(today, addDays(today, 60)), r.trips.list(), r.goals.list(), r.settings.get()]);
    const plan = planNotifications({
      settings,
      schedules,
      trips: trips.filter((x) => x.departureDate >= today),
      hasActiveGoals: goals.some((g) => g.status === 'active'),
      hasBudget: app.monthlyBudget != null && app.monthlyBudget > 0,
      now: clock.now(),
    });
    await ensureChannel(t('notifications.channelName'));
    for (const n of plan) {
      const content = { title: t(n.titleKey), body: t(n.bodyKey) };
      const trigger: Notifications.NotificationTriggerInput = n.weekly
        ? { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: n.weekly.weekday, hour: n.weekly.hour, minute: n.weekly.minute, channelId: CHANNEL_ID }
        : n.monthly
          ? { type: Notifications.SchedulableTriggerInputTypes.MONTHLY, day: n.monthly.day, hour: n.monthly.hour, minute: n.monthly.minute, channelId: CHANNEL_ID }
          : { type: Notifications.SchedulableTriggerInputTypes.DATE, date: n.at, channelId: CHANNEL_ID };
      await Notifications.scheduleNotificationAsync({ identifier: n.id, content, trigger });
    }
    return plan.length;
  } catch (e) {
    recordError(e, 'notifications_refresh');
    return 0;
  }
}

/** Immediate budget alert after a purchase crosses the threshold (once per month and level). */
export async function sendBudgetAlert(level: 'warning' | 'over', t: TFunction): Promise<void> {
  try {
    if ((await getPermission()) !== 'granted') return;
    await ensureChannel(t('notifications.channelName'));
    await Notifications.scheduleNotificationAsync({
      identifier: `${NOTIFICATION_PREFIX}-budget-alert`,
      content: { title: t('notifications.content.budgetAlertTitle'), body: t(level === 'over' ? 'notifications.content.budgetOverBody' : 'notifications.content.budgetWarningBody') },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 2, channelId: CHANNEL_ID },
    });
  } catch (e) {
    recordError(e, 'budget_alert');
  }
}

export async function cancelAllNotifications(): Promise<void> {
  try {
    await cancelOurs();
  } catch (e) {
    recordError(e, 'notifications_cancel');
  }
}
