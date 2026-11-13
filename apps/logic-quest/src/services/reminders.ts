import {
  cancelDailyReminder,
  configureForegroundHandling,
  getPermission,
  requestPermission,
  scheduleDailyReminder,
  sendTestNotification,
  type PermissionResult,
} from '@factory/notifications';
import type { TFunction } from 'i18next';

import type { PreferencesRepository } from '@/database/progressRepository';

export interface ReminderSettings {
  enabled: boolean;
  hour: number;
  minute: number;
}

export const DEFAULT_REMINDER: ReminderSettings = { enabled: false, hour: 19, minute: 0 };
const KEY = 'reminder';

const content = (t: TFunction) => ({
  title: t('notifications.reminderTitle'),
  body: t('notifications.reminderBody'),
  channelName: t('notifications.channelName'),
});

export function initNotifications(): void {
  configureForegroundHandling();
}

export async function loadReminder(prefs: PreferencesRepository): Promise<ReminderSettings> {
  return prefs.get(KEY, DEFAULT_REMINDER);
}

/** Saves settings and (re)schedules. Returns the permission outcome so the UI can explain a denial. */
export async function saveReminder(prefs: PreferencesRepository, settings: ReminderSettings, t: TFunction): Promise<{ settings: ReminderSettings; permission: PermissionResult }> {
  if (!settings.enabled) {
    await cancelDailyReminder();
    await prefs.set(KEY, settings);
    return { settings, permission: await getPermission() };
  }
  const permission = await requestPermission(t('notifications.channelName'));
  if (permission !== 'granted') {
    const off = { ...settings, enabled: false };
    await prefs.set(KEY, off);
    return { settings: off, permission };
  }
  await scheduleDailyReminder(settings.hour, settings.minute, content(t));
  await prefs.set(KEY, settings);
  return { settings, permission };
}

/** Re-schedules with the current language (called at startup and when the language changes). */
export async function refreshReminder(prefs: PreferencesRepository, t: TFunction): Promise<void> {
  const settings = await loadReminder(prefs);
  if (settings.enabled && (await getPermission()) === 'granted') {
    await scheduleDailyReminder(settings.hour, settings.minute, content(t));
  }
}

export async function testReminder(t: TFunction): Promise<PermissionResult> {
  const permission = await requestPermission(t('notifications.channelName'));
  if (permission === 'granted') await sendTestNotification(content(t));
  return permission;
}
