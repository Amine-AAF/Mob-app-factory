import { configureForegroundHandling, ensureChannel, getPermission, REMINDER_CHANNEL_ID, requestPermission, sendTestNotification, type PermissionResult } from '@factory/notifications';
import * as Notifications from 'expo-notifications';
import type { TFunction } from 'i18next';

import type { Repositories } from '@/database';
import { NOTIFICATION_PREFIX, planNotifications, type PlannedNotification, type VehicleContext } from '@/features/reminders/plan';
import { usePreferences } from '@/store/preferences';
import { useSession } from '@/store/session';
import { fromDayKey } from '@/utils/dates';

import { recordError } from './analytics';
import { clock } from './clock';

/**
 * Local reminders (no server, no push token). The scheduled set is always rebuilt
 * from the database ("sync") after any change, at start-up and on language change,
 * so it can never drift. Mileage-based reminders are projections and their text
 * says so ("estimated from your mileage entries").
 *
 * @factory/notifications only handles one global daily reminder; the date-based
 * planning here is a candidate for the shared package (see factory/tracking/autocare.md).
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

export async function loadContexts(r: Repositories): Promise<VehicleContext[]> {
  const vehicles = await r.vehicles.list();
  return Promise.all(
    vehicles.map(async (vehicle) => {
      const [readings, schedules, deadlines, policies, documents, tires] = await Promise.all([
        r.odometer.list(vehicle.id),
        r.schedules.list(vehicle.id),
        r.deadlines.list(vehicle.id),
        r.insurance.list(vehicle.id),
        r.documents.list(vehicle.id),
        r.tires.list(vehicle.id),
      ]);
      return { vehicle, readings, schedules, deadlines, policies, documents, tires };
    }),
  );
}

export function notificationContent(n: PlannedNotification, vehicleName: string, t: TFunction): { title: string; body: string } {
  const label =
    n.message === 'maintenance_due' || n.message === 'maintenance_estimated'
      ? n.title ?? t(`maintenanceTypes.${n.subtype}`)
      : n.message === 'deadline'
        ? n.title ?? t(`deadlineTypes.${n.subtype}`)
        : n.message === 'document'
          ? n.title ?? t(`documentCategories.${n.subtype}`)
          : n.message === 'tire'
            ? t(`tireSeasons.${n.subtype}`)
            : (n.title ?? '');
  const body = t(`notifications.body.${n.message}`, { label, count: n.daysLeft, vehicle: vehicleName });
  return { title: vehicleName, body };
}

export async function syncNotifications(r: Repositories, t: TFunction): Promise<number> {
  try {
    await cancelOwn();
    if (!usePreferences.getState().notificationsEnabled) return 0;
    if ((await getPermission()) !== 'granted') return 0;
    const [contexts, settings] = await Promise.all([loadContexts(r), r.notificationSettings.all()]);
    const advanced = useSession.getState().entitlement.isPremium;
    const plan = planNotifications(contexts, settings, clock.today(), { advanced });
    if (plan.length === 0) return 0;
    await ensureChannel(t('notifications.channelName'));
    const names = new Map(contexts.map((c) => [c.vehicle.id, c.vehicle.name]));
    const now = clock.now().getTime();
    let count = 0;
    for (const p of plan) {
      const at = fromDayKey(p.day);
      at.setHours(p.hour, p.minute, 0, 0);
      if (at.getTime() <= now + 60_000) continue; // never in the past
      await Notifications.scheduleNotificationAsync({
        identifier: p.identifier,
        content: { ...notificationContent(p, names.get(p.vehicleId) ?? '', t), data: { url: p.url } },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at, channelId: REMINDER_CHANNEL_ID },
      });
      count++;
    }
    return count;
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
  if (permission === 'granted') await sendTestNotification({ title: t('notifications.testTitle'), body: t('notifications.testBody'), channelName: t('notifications.channelName') });
  return permission;
}
