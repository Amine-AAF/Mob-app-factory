import { addDays } from '@factory/app-core';
import { configureForegroundHandling, ensureChannel, getPermission, REMINDER_CHANNEL_ID, requestPermission, sendTestNotification, type PermissionResult } from '@factory/notifications';
import * as Notifications from 'expo-notifications';
import type { TFunction } from 'i18next';

import type { Repositories } from '@/database';
import { plannedDays } from '@/features/planner/plan';
import { HORIZON_DAYS, NOTIFICATION_PREFIX, planNotifications, toExpoWeekday } from '@/features/reminders/plan';

import { recordError } from './analytics';
import { clock } from './clock';

/**
 * Local notifications (no server, no push token). Everything is opt-in and configurable
 * per kind in Settings › Notifications. Texts are generic: no body data, no loads.
 * The scheduled set is rebuilt from the database after any planner/settings change,
 * at start-up and on language change.
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
    const today = clock.today();
    const [settings, routine, runs, goals, routineStart] = await Promise.all([
      r.settings.notifications(),
      r.planner.routine(),
      r.goals.challenges(),
      r.goals.list(),
      r.settings.get<string | null>('routine_start', null),
    ]);
    if (!settings.some((s) => s.enabled)) return 0;
    const entries = await r.planner.entries(today, addDays(today, HORIZON_DAYS));
    const plan = planNotifications({
      settings,
      planned: plannedDays(today, entries, routine, routineStart, HORIZON_DAYS),
      today,
      now: clock.now(),
      hasActiveChallenge: runs.some((x) => x.status === 'active'),
      hasWeeklyGoal: goals.some((g) => g.active && g.kind.startsWith('weekly_')),
    });
    if (plan.length === 0) return 0;
    await ensureChannel(t('notifications.channelName'));
    for (const p of plan) {
      await Notifications.scheduleNotificationAsync({
        identifier: p.identifier,
        content: { title: t(p.titleKey), body: t(p.bodyKey), data: { url: '/' } },
        trigger:
          p.trigger.type === 'date'
            ? { type: Notifications.SchedulableTriggerInputTypes.DATE, date: p.trigger.at, channelId: REMINDER_CHANNEL_ID }
            : { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: toExpoWeekday(p.trigger.weekday), hour: p.trigger.hour, minute: p.trigger.minute, channelId: REMINDER_CHANNEL_ID },
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
  if (permission === 'granted') await sendTestNotification({ title: t('notifications.workout.title'), body: t('notifications.workout.body'), channelName: t('notifications.channelName') });
  return permission;
}
