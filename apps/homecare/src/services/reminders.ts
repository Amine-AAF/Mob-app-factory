import { configureForegroundHandling, getPermission, type PermissionResult } from '@factory/notifications';
import * as Notifications from 'expo-notifications';
import type { TFunction } from 'i18next';
import { Platform } from 'react-native';

import type { Repositories } from '@/database';
import { toDayKey } from '@/domain/dates';
import { planReminders, type PlannedReminder } from '@/domain/reminderPlan';
import { NOTIFICATION_CATEGORIES, type NotificationCategory } from '@/domain/types';

import { recordError } from './analytics';
import { clock } from './clock';

/**
 * Local notifications (no push server). One Android channel per category so users can
 * also tune each kind in system settings. Every identifier we create starts with
 * `homecare:` so a sync only cancels our own notifications.
 */
export const ID_PREFIX = 'homecare:';
const MASTER_KEY = 'notifications.master';

export const channelId = (c: NotificationCategory) => `homecare-${c}`;

let syncing: Promise<SyncResult> | null = null;
let pending = false;

export interface SyncResult {
  scheduled: number;
  permission: PermissionResult;
}

export function initNotifications(): void {
  configureForegroundHandling();
}

async function ensureChannels(t: TFunction): Promise<void> {
  if (Platform.OS !== 'android') return;
  for (const c of NOTIFICATION_CATEGORIES) {
    await Notifications.setNotificationChannelAsync(channelId(c), {
      name: t(`notifications.channels.${c}`),
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

/** Android 13+ runtime prompt. Channels must exist first for the prompt to appear. */
export async function requestNotificationPermission(t: TFunction): Promise<PermissionResult> {
  await ensureChannels(t);
  const current = await Notifications.getPermissionsAsync();
  if (current.status === 'granted') return 'granted';
  if (!current.canAskAgain) return 'denied';
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted' ? 'granted' : 'denied';
}

export async function isMasterEnabled(r: Repositories): Promise<boolean> {
  return r.settings.get(MASTER_KEY, true);
}

export async function setMasterEnabled(r: Repositories, enabled: boolean): Promise<void> {
  await r.settings.set(MASTER_KEY, enabled);
}

export async function cancelAll(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(scheduled.filter((n) => n.identifier.startsWith(ID_PREFIX)).map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)));
}

/** Gathers everything that can produce a reminder, across all homes. */
export async function buildPlan(r: Repositories, now: Date): Promise<PlannedReminder[]> {
  const homes = await r.homes.list();
  const ids = homes.map((h) => h.id);
  const today = toDayKey(now);
  const [maintenance, warranties, documents, recurringExpenses, repairs, household, settings, masterEnabled] = await Promise.all([
    r.maintenance.scheduled(ids),
    r.assets.withWarranty(ids, today),
    r.documents.withExpiry(ids, today),
    r.expenses.activeRecurring(ids),
    r.repairs.scheduled(ids, today),
    r.household.openWithDue(ids),
    r.settings.notificationSettings(),
    isMasterEnabled(r),
  ]);
  return planReminders({
    now,
    masterEnabled,
    settings,
    sources: {
      maintenance,
      warranties,
      documents,
      recurringExpenses,
      repairs,
      household: household.map((h) => ({ ...h, completed: !!h.completedAt })),
    },
  });
}

async function doSync(r: Repositories, t: TFunction): Promise<SyncResult> {
  const permission = await getPermission();
  await cancelAll();
  if (permission !== 'granted') return { scheduled: 0, permission };
  await ensureChannels(t);
  const plan = await buildPlan(r, clock.now());
  for (const p of plan) {
    await Notifications.scheduleNotificationAsync({
      identifier: `${ID_PREFIX}${p.id}`,
      content: {
        title: t(`notifications.kinds.${p.kind}.title`, { name: p.params.name }),
        body: t(`notifications.kinds.${p.kind}.body`, { name: p.params.name, date: p.params.date }),
        data: { route: p.route },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: p.fireAt, channelId: channelId(p.category) },
    });
  }
  return { scheduled: plan.length, permission };
}

/**
 * Cancels and re-schedules all HomeCare reminders. Calls are coalesced: a sync requested
 * while one runs triggers exactly one more sync afterwards. Never throws.
 */
export function syncReminders(r: Repositories, t: TFunction): Promise<SyncResult> {
  if (syncing) {
    pending = true;
    return syncing;
  }
  syncing = doSync(r, t)
    .catch((e): SyncResult => {
      recordError(e, 'reminders_sync');
      return { scheduled: 0, permission: 'undetermined' };
    })
    .finally(() => {
      syncing = null;
      if (pending) {
        pending = false;
        void syncReminders(r, t);
      }
    });
  return syncing;
}

/** Sends a test notification in ~5 s to check the device settings. */
export async function sendTest(t: TFunction): Promise<PermissionResult> {
  const permission = await requestNotificationPermission(t);
  if (permission !== 'granted') return permission;
  await Notifications.scheduleNotificationAsync({
    identifier: `${ID_PREFIX}test`,
    content: { title: t('notifications.testTitle'), body: t('notifications.testBody') },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 5, channelId: channelId('maintenance') },
  });
  return permission;
}

/** Route stored in a tapped notification (validated: internal paths only). */
export function routeFromNotification(data: unknown): string | null {
  const route = (data as { route?: unknown } | null)?.route;
  return typeof route === 'string' && /^\/[a-z/_-]*[A-Za-z0-9_/-]*$/.test(route) ? route : null;
}
