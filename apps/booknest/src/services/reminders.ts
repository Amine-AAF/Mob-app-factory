import { configureForegroundHandling, ensureChannel, getPermission, REMINDER_CHANNEL_ID, requestPermission, sendTestNotification, type PermissionResult } from '@factory/notifications';
import * as Notifications from 'expo-notifications';
import type { TFunction } from 'i18next';

import type { Repositories } from '@/database';
import { NOTIFICATION_PREFIX, planNotifications, toExpoWeekday, type PlanContext } from '@/features/reminders/plan';

import { recordError } from './analytics';
import { clock } from './clock';
import { evaluateGoals } from './goalService';

/**
 * Local notifications only (no server, no push token). @factory/notifications gives
 * the channel, the Android 13+ permission flow and foreground handling; BookNest
 * plans its own set (daily, weekly, monthly, challenge, resume, yearly) and rebuilds
 * it from the database at each sync so it never drifts. Notification text never
 * contains notes or quotes; the "resume" nudge only names the book.
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

export async function buildPlanContext(r: Repositories): Promise<PlanContext> {
  const today = clock.today();
  const progress = await evaluateGoals(r, today);
  const reading = await r.books.list({ status: 'reading', sort: 'recent', limit: 1 });
  const last = await r.reading.lastSessionByBook();
  const top = reading[0];
  return {
    now: clock.now(),
    today,
    goals: progress.map((p) => ({ type: p.goal.type, reached: p.reached, challengeId: p.goal.challengeId })),
    resumeCandidate: top ? { bookId: top.id, title: top.title, lastActivityDay: (last.get(top.id) ?? top.updatedAt).slice(0, 10) } : null,
  };
}

export async function syncNotifications(r: Repositories, t: TFunction): Promise<number> {
  try {
    await cancelOwn();
    if ((await getPermission()) !== 'granted') return 0;
    const plan = planNotifications(await r.organize.notificationSettings(), await buildPlanContext(r));
    if (plan.length === 0) return 0;
    await ensureChannel(t('notifications.channelName'));
    for (const p of plan) {
      const trigger: Notifications.NotificationTriggerInput =
        p.trigger.type === 'daily'
          ? { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: p.trigger.hour, minute: p.trigger.minute, channelId: REMINDER_CHANNEL_ID }
          : p.trigger.type === 'weekly'
            ? { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: toExpoWeekday(p.trigger.weekday), hour: p.trigger.hour, minute: p.trigger.minute, channelId: REMINDER_CHANNEL_ID }
            : { type: Notifications.SchedulableTriggerInputTypes.DATE, date: p.trigger.at, channelId: REMINDER_CHANNEL_ID };
      await Notifications.scheduleNotificationAsync({
        identifier: p.identifier,
        content: { title: t(p.titleKey, p.params ?? {}), body: t(p.bodyKey, p.params ?? {}), data: { url: p.url } },
        trigger,
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
  if (permission === 'granted') await sendTestNotification({ title: t('notifications.daily.title'), body: t('notifications.daily.body'), channelName: t('notifications.channelName') });
  return permission;
}
