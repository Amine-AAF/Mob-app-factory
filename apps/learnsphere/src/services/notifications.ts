import { addDays } from '@factory/app-core';
import { configureForegroundHandling, getPermission, type PermissionResult } from '@factory/notifications';
import * as Notifications from 'expo-notifications';
import type { TFunction } from 'i18next';
import { Platform } from 'react-native';

import type { Repositories } from '@/database';
import { buildNotificationPlan, type PlannedNotification } from '@/features/notifications/plan';

import { recordError } from './analytics';
import { clock } from './clock';

/**
 * Local notifications only (no push server, no token). Every LearnSphere notification id starts
 * with "ls-"; rescheduling cancels them all and schedules the current plan (idempotent).
 */
export const CHANNEL_REMINDERS = 'learnsphere-reminders';
export const CHANNEL_FOCUS = 'learnsphere-focus';
const PREFIX = 'ls-';
const FOCUS_PREFIX = 'ls-focus-';

export function initNotifications(): void {
  configureForegroundHandling();
}

async function ensureChannels(t: TFunction): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_REMINDERS, { name: t('notifications.channelReminders'), importance: Notifications.AndroidImportance.DEFAULT });
  await Notifications.setNotificationChannelAsync(CHANNEL_FOCUS, { name: t('notifications.channelFocus'), importance: Notifications.AndroidImportance.HIGH });
}

/** Android 13+ runtime prompt. Asked only when the learner enables a reminder or starts a focus session. */
export async function ensurePermission(t: TFunction): Promise<PermissionResult> {
  await ensureChannels(t);
  const current = await Notifications.getPermissionsAsync();
  if (current.status === 'granted') return 'granted';
  if (!current.canAskAgain) return 'denied';
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted' ? 'granted' : 'denied';
}

export { getPermission };

function toTrigger(n: PlannedNotification): Notifications.NotificationTriggerInput {
  switch (n.trigger.type) {
    case 'date':
      return { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(n.trigger.at), channelId: CHANNEL_REMINDERS };
    case 'daily':
      return { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: n.trigger.hour, minute: n.trigger.minute, channelId: CHANNEL_REMINDERS };
    case 'weekly':
      return { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: n.trigger.weekday, hour: n.trigger.hour, minute: n.trigger.minute, channelId: CHANNEL_REMINDERS };
  }
}

async function cancelByPrefix(prefix: string, exclude?: string): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.identifier.startsWith(prefix) && !(exclude && n.identifier.startsWith(exclude)))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}

/** Rebuilds every reminder from current data and settings. Safe to call often. */
export async function rescheduleAll(repos: Repositories, t: TFunction): Promise<number> {
  try {
    const settings = await repos.settings.notificationSettings();
    const anyEnabled = Object.values(settings).some((s) => s.enabled);
    await cancelByPrefix(PREFIX, FOCUS_PREFIX);
    if (!anyEnabled || (await getPermission()) !== 'granted') return 0;
    await ensureChannels(t);
    const today = clock.today();
    const [sessions, agenda] = await Promise.all([repos.planner.sessionsBetween(today, addDays(today, 8)), repos.agenda.list({ from: today })]);
    const plan = buildNotificationPlan({
      now: clock.now(),
      settings,
      sessions,
      exams: agenda.filter((a) => a.table === 'exams'),
      deadlines: agenda.filter((a) => a.table === 'deadlines'),
    });
    for (const n of plan) {
      await Notifications.scheduleNotificationAsync({
        identifier: n.id,
        content: { title: t(n.titleKey, n.params), body: t(n.bodyKey, n.params) },
        trigger: toTrigger(n),
      });
    }
    return plan.length;
  } catch (e) {
    recordError(e, 'notifications_reschedule');
    return 0;
  }
}

/** Phase-end alerts for a running focus timer (so the learner is told even with the app closed). */
export async function scheduleFocusAlerts(boundaries: { at: number; next: string }[], t: TFunction): Promise<void> {
  try {
    await cancelFocusAlerts();
    if ((await getPermission()) !== 'granted') return;
    await ensureChannels(t);
    for (const [i, b] of boundaries.slice(0, 24).entries()) {
      await Notifications.scheduleNotificationAsync({
        identifier: `${FOCUS_PREFIX}${i}`,
        content: { title: t(`notifications.focus_${b.next}_title`), body: t(`notifications.focus_${b.next}_body`) },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(b.at), channelId: CHANNEL_FOCUS },
      });
    }
  } catch (e) {
    recordError(e, 'focus_alerts');
  }
}

export async function cancelFocusAlerts(): Promise<void> {
  try {
    await cancelByPrefix(FOCUS_PREFIX);
  } catch (e) {
    recordError(e, 'focus_alerts_cancel');
  }
}

export async function sendTestNotification(t: TFunction): Promise<PermissionResult> {
  const permission = await ensurePermission(t);
  if (permission === 'granted') {
    await Notifications.scheduleNotificationAsync({
      content: { title: t('notifications.testTitle'), body: t('notifications.testBody') },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 5, channelId: CHANNEL_REMINDERS },
    });
  }
  return permission;
}
