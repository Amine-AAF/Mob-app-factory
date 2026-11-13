import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Local (on-device) reminders. No push server, no FCM token required.
 */
export const REMINDER_CHANNEL_ID = 'daily-reminder';
const REMINDER_ID_PREFIX = 'daily-reminder';

export interface ReminderContent {
  title: string;
  body: string;
  channelName: string;
}

export function configureForegroundHandling(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export async function ensureChannel(name: string): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
    name,
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export type PermissionResult = 'granted' | 'denied' | 'undetermined';

export async function getPermission(): Promise<PermissionResult> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted' ? 'granted' : status === 'denied' ? 'denied' : 'undetermined';
}

/** Android 13+ shows the POST_NOTIFICATIONS runtime prompt. Requires a channel first. */
export async function requestPermission(channelName: string): Promise<PermissionResult> {
  await ensureChannel(channelName);
  const current = await Notifications.getPermissionsAsync();
  if (current.status === 'granted') return 'granted';
  if (!current.canAskAgain) return 'denied';
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted' ? 'granted' : 'denied';
}

export function isValidTime(hour: number, minute: number): boolean {
  return Number.isInteger(hour) && Number.isInteger(minute) && hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
}

/** Replaces any existing daily reminder with one at hour:minute local time. */
export async function scheduleDailyReminder(hour: number, minute: number, content: ReminderContent): Promise<string> {
  if (!isValidTime(hour, minute)) throw new Error(`Invalid reminder time ${hour}:${minute}`);
  await cancelDailyReminder();
  await ensureChannel(content.channelName);
  return Notifications.scheduleNotificationAsync({
    identifier: `${REMINDER_ID_PREFIX}-${hour}-${minute}`,
    content: { title: content.title, body: content.body },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: REMINDER_CHANNEL_ID,
    },
  });
}

export async function cancelDailyReminder(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.identifier.startsWith(REMINDER_ID_PREFIX))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}

/** Fires a notification in ~5 s, used by the "Send a test notification" button. */
export async function sendTestNotification(content: ReminderContent): Promise<void> {
  await ensureChannel(content.channelName);
  await Notifications.scheduleNotificationAsync({
    content: { title: content.title, body: content.body },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 5, channelId: REMINDER_CHANNEL_ID },
  });
}
