import { configureForegroundHandling, getPermission, requestPermission, type PermissionResult } from '@factory/notifications';
import * as Notifications from 'expo-notifications';
import type { TFunction } from 'i18next';
import { Platform } from 'react-native';

import type { Repositories } from '@/database';
import { NOTIFICATION_PREFIX, planNotifications, type PlannedNotification } from '@/domain/reminders';
import { usePreferences } from '@/store/preferences';

import { recordError } from './analytics';
import { clock } from './clock';

/**
 * Event reminders (local only: no server, no push token).
 * The full set is re-planned after data changes and diffed with what the OS
 * has scheduled: obsolete reminders are cancelled, new ones scheduled.
 */
export const EVENT_CHANNEL_ID = 'event-reminders';

export function initNotifications(): void {
  configureForegroundHandling();
}

async function ensureChannel(t: TFunction): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(EVENT_CHANNEL_ID, { name: t('notifications.channelName'), importance: Notifications.AndroidImportance.DEFAULT });
}

export async function askPermission(t: TFunction): Promise<PermissionResult> {
  await ensureChannel(t);
  return requestPermission(t('notifications.channelName'));
}

export async function plan(repos: Repositories): Promise<PlannedNotification[]> {
  const prefs = usePreferences.getState();
  const [events, tasks, expenses, vendors, guests, settings] = await Promise.all([
    repos.events.list(),
    repos.tasks.listAll(),
    repos.budget.allExpenses(),
    repos.vendors.listAll(),
    repos.guests.listAll(),
    repos.settings.notifications(),
  ]);
  return planNotifications({
    now: clock.now(),
    masterEnabled: prefs.notificationsEnabled,
    showEventNames: prefs.notificationEventNames,
    settings,
    events,
    tasks,
    expenses,
    vendors,
    guests,
  });
}

let syncing: Promise<void> | null = null;
let again = false;

/** Re-plans every reminder. Safe to call often (coalesced). Never throws. */
export function syncNotifications(repos: Repositories, t: TFunction): Promise<void> {
  if (syncing) {
    again = true;
    return syncing;
  }
  syncing = (async () => {
    try {
      do {
        again = false;
        await doSync(repos, t);
      } while (again);
    } catch (e) {
      recordError(e, 'notifications_sync');
    } finally {
      syncing = null;
    }
  })();
  return syncing;
}

async function doSync(repos: Repositories, t: TFunction): Promise<void> {
  const planned = (await getPermission()) === 'granted' ? await plan(repos) : [];
  const scheduled = (await Notifications.getAllScheduledNotificationsAsync()).filter((n) => n.identifier.startsWith(NOTIFICATION_PREFIX));
  const wanted = new Map(planned.map((p) => [p.id, p]));
  // Texts depend on language/settings, so reminders are rescheduled rather than compared field by field.
  await Promise.all(scheduled.map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)));
  if (wanted.size === 0) return;
  await ensureChannel(t);
  for (const p of planned) {
    await Notifications.scheduleNotificationAsync({
      identifier: p.id,
      content: { title: t(p.titleKey, p.params), body: t(p.bodyKey, { ...p.params, count: Number(p.params.count ?? 0) }), data: { eventId: p.eventId, kind: p.kind } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: p.fireAt, channelId: EVENT_CHANNEL_ID },
    });
  }
}

export async function cancelAll(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(scheduled.filter((n) => n.identifier.startsWith(NOTIFICATION_PREFIX)).map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)));
}

export async function sendTest(t: TFunction): Promise<PermissionResult> {
  const permission = await askPermission(t);
  if (permission === 'granted') {
    await Notifications.scheduleNotificationAsync({
      content: { title: t('notifications.test.title'), body: t('notifications.test.body') },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 5, channelId: EVENT_CHANNEL_ID },
    });
  }
  return permission;
}
