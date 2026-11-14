import { configureForegroundHandling, getPermission, type PermissionResult } from '@factory/notifications';
import * as Notifications from 'expo-notifications';
import type { TFunction } from 'i18next';
import { Platform } from 'react-native';

import type { Repositories } from '@/database';
import { planNotifications, PREFIX, type PlannedNotification } from '@/domain/notificationPlan';

import { recordError } from './analytics';
import { clock } from './clock';

/**
 * Local notifications only (no push server, no token). The plan computed by
 * `planNotifications` is reconciled with what the OS has scheduled.
 *
 * Android: POST_NOTIFICATIONS is requested only when the user turns a reminder on
 * (never at first launch). When it is denied, reminders stay visible in the app and
 * the settings screen explains how to enable them; nothing crashes.
 */
const CHANNELS = { health: 'petcare-health', care: 'petcare-care' } as const;

export function initNotifications(): void {
  configureForegroundHandling();
}

async function ensureChannels(t: TFunction): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNELS.health, { name: t('notif.channelHealth'), importance: Notifications.AndroidImportance.HIGH });
  await Notifications.setNotificationChannelAsync(CHANNELS.care, { name: t('notif.channelCare'), importance: Notifications.AndroidImportance.DEFAULT });
}

export async function notificationPermission(): Promise<PermissionResult> {
  try {
    return await getPermission();
  } catch {
    return 'undetermined';
  }
}

export async function askNotificationPermission(t: TFunction): Promise<PermissionResult> {
  try {
    // Android 13+ shows the POST_NOTIFICATIONS prompt only once a channel exists: create ours first
    // (the shared helper would create its own "daily-reminder" channel, which PetCare doesn't use).
    await ensureChannels(t);
    const current = await Notifications.getPermissionsAsync();
    if (current.status === 'granted') return 'granted';
    if (!current.canAskAgain) return 'denied';
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted' ? 'granted' : 'denied';
  } catch (e) {
    recordError(e, 'notif_permission');
    return 'denied';
  }
}

function trigger(n: PlannedNotification): Notifications.NotificationTriggerInput {
  const channelId = CHANNELS[n.channel];
  switch (n.trigger.type) {
    case 'date':
      return { type: Notifications.SchedulableTriggerInputTypes.DATE, date: n.trigger.date, channelId };
    case 'daily':
      return { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: n.trigger.hour, minute: n.trigger.minute, channelId };
    case 'weekly':
      // expo-notifications weekdays: 1 = Sunday … 7 = Saturday. Ours: 1 = Monday … 7 = Sunday.
      return { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: (n.trigger.weekday % 7) + 1, hour: n.trigger.hour, minute: n.trigger.minute, channelId };
  }
}

export async function buildPlan(r: Repositories): Promise<PlannedNotification[]> {
  const [pets, vaccinations, treatments, appointments, feeding, food, settings] = await Promise.all([
    r.pets.listAll(),
    r.vaccinations.all(),
    r.treatments.all(),
    r.appointments.upcoming(new Date(clock.now().getTime() - 24 * 3600_000).toISOString()),
    r.feeding.all(),
    r.food.all(),
    r.notificationSettings.all(),
  ]);
  return planNotifications({ now: clock.now(), pets, vaccinations, treatments, appointments, feeding, food, settings });
}

let running: Promise<number> | null = null;
let again = false;

/**
 * Cancels PetCare's scheduled notifications and schedules the current plan.
 * Serialised: concurrent calls coalesce into one extra run. Returns how many were scheduled.
 */
export function syncNotifications(r: Repositories, t: TFunction): Promise<number> {
  if (running) {
    again = true;
    return running;
  }
  running = (async () => {
    let count = 0;
    do {
      again = false;
      count = await reconcile(r, t);
    } while (again);
    return count;
  })().finally(() => {
    running = null;
  });
  return running;
}

async function reconcile(r: Repositories, t: TFunction): Promise<number> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(scheduled.filter((n) => n.identifier.startsWith(PREFIX)).map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)));
    if ((await notificationPermission()) !== 'granted') return 0;
    await ensureChannels(t);
    const plan = await buildPlan(r);
    for (const n of plan) {
      await Notifications.scheduleNotificationAsync({
        identifier: n.id,
        content: { title: t(n.titleKey, n.params), body: t(n.bodyKey, n.params), data: { url: n.url } },
        trigger: trigger(n),
      });
    }
    return plan.length;
  } catch (e) {
    recordError(e, 'notif_sync');
    return 0;
  }
}

export async function cancelAllNotifications(): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(scheduled.filter((n) => n.identifier.startsWith(PREFIX)).map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)));
  } catch (e) {
    recordError(e, 'notif_cancel');
  }
}

export async function sendTestNotification(t: TFunction): Promise<PermissionResult> {
  const permission = await askNotificationPermission(t);
  if (permission === 'granted') {
    await Notifications.scheduleNotificationAsync({
      identifier: `${PREFIX}test`,
      content: { title: t('notif.testTitle'), body: t('notif.testBody') },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 5, channelId: CHANNELS.care },
    });
  }
  return permission;
}
