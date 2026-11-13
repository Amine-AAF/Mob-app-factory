import { ensureChannel } from '@factory/notifications';
import * as Notifications from 'expo-notifications';

import { recordError } from './analytics';
import { clock } from './clock';

/**
 * One-shot local notification at the end of a rest or timer, so the user is alerted
 * even when FitTrack is in the background or the screen is locked. The in-app timer
 * never depends on it: the countdown is recomputed from the stored end instant.
 * Content is generic ("Rest is over") — never any workout or body data.
 */
export const REST_ALERT_ID = 'fittrack-rest-end';
export const TIMER_CHANNEL_ID = 'workout-timer';

export async function scheduleRestAlert(at: number, title: string, body: string): Promise<void> {
  try {
    await cancelRestAlert();
    const seconds = Math.round((at - clock.now().getTime()) / 1000);
    if (seconds < 3) return;
    const perm = await Notifications.getPermissionsAsync();
    if (!perm.granted) return;
    await ensureChannel(title);
    await Notifications.scheduleNotificationAsync({
      identifier: REST_ALERT_ID,
      content: { title, body, data: { url: '/workout/active' } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds, repeats: false },
    });
  } catch (e) {
    recordError(e, 'rest_alert_schedule');
  }
}

export async function cancelRestAlert(): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(REST_ALERT_ID);
  } catch {
    // Nothing scheduled.
  }
}
