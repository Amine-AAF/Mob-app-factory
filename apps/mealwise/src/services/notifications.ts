import type { TFunction } from 'i18next';
import { addDays, fromDayKey } from '@factory/app-core';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { alertDay } from '@/domain/pantry';
import { DEFAULT_SLOT_TIMES, slotDate } from '@/domain/planner';
import type { DayKey, MealSlot, PantryItem, PlanEntry } from '@/domain/types';

/**
 * Local notifications only (no server, no push token). Four configurable kinds:
 * meal preparation, weekly planning, shopping, pantry expiry. Plus the
 * cooking-mode timer. Everything can be turned off in Settings.
 *
 * The schedule is computed by the pure `buildSchedule` (unit-tested), then
 * `syncNotifications` replaces every MealWise notification with it.
 */
export interface WeeklyReminder {
  enabled: boolean;
  /** 1 = Sunday … 7 = Saturday (expo-notifications convention). */
  weekday: number;
  hour: number;
  minute: number;
}

export interface NotificationSettings {
  mealPrep: { enabled: boolean; minutesBefore: number };
  weeklyPlanning: WeeklyReminder;
  shopping: WeeklyReminder;
  expiry: { enabled: boolean; daysBefore: number; hour: number };
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  mealPrep: { enabled: false, minutesBefore: 45 },
  weeklyPlanning: { enabled: false, weekday: 1, hour: 18, minute: 0 },
  shopping: { enabled: false, weekday: 7, hour: 10, minute: 0 },
  expiry: { enabled: false, daysBefore: 2, hour: 9 },
};

export const NOTIFICATION_PREFIX = 'mw-';
const TIMER_PREFIX = 'mwt-';
export const CHANNELS = { meals: 'mealwise-meals', pantry: 'mealwise-pantry', timers: 'mealwise-timers' } as const;

/** Android keeps a limited number of alarms per app: cap what we schedule. */
const MAX_MEAL_REMINDERS = 21;
const MAX_EXPIRY_REMINDERS = 20;

export type Translate = TFunction;

export interface PlannedNotification {
  id: string;
  channelId: string;
  title: string;
  body: string;
  trigger: { kind: 'date'; date: Date } | { kind: 'weekly'; weekday: number; hour: number; minute: number };
}

export interface ScheduleInput {
  settings: NotificationSettings;
  now: Date;
  today: DayKey;
  slotTimes?: Record<MealSlot, number>;
  /** Upcoming plan entries with a resolved title. */
  meals: (Pick<PlanEntry, 'id' | 'day' | 'slot' | 'cookedAt'> & { title: string })[];
  pantry: Pick<PantryItem, 'id' | 'name' | 'expiresOn' | 'consumedAt'>[];
  t: Translate;
}

export function buildSchedule(input: ScheduleInput): PlannedNotification[] {
  const { settings, now, t } = input;
  const out: PlannedNotification[] = [];
  const times = input.slotTimes ?? DEFAULT_SLOT_TIMES;

  if (settings.mealPrep.enabled) {
    const horizon = addDays(input.today, 7);
    input.meals
      .filter((m) => !m.cookedAt && m.day >= input.today && m.day <= horizon)
      .map((m) => ({ m, at: new Date(slotDate(m.day, m.slot, times).getTime() - settings.mealPrep.minutesBefore * 60_000) }))
      .filter((x) => x.at.getTime() > now.getTime() + 60_000)
      .sort((a, b) => a.at.getTime() - b.at.getTime())
      .slice(0, MAX_MEAL_REMINDERS)
      .forEach(({ m, at }) =>
        out.push({
          id: `${NOTIFICATION_PREFIX}meal-${m.id}`,
          channelId: CHANNELS.meals,
          title: t('notifications.mealPrepTitle', { meal: t(`slots.${m.slot}`) }),
          body: t('notifications.mealPrepBody', { title: m.title, minutes: settings.mealPrep.minutesBefore }),
          trigger: { kind: 'date', date: at },
        }),
      );
  }

  const weekly = (key: 'weeklyPlanning' | 'shopping', title: string, body: string) => {
    const r = settings[key];
    if (!r.enabled) return;
    out.push({
      id: `${NOTIFICATION_PREFIX}${key}`,
      channelId: CHANNELS.meals,
      title,
      body,
      trigger: { kind: 'weekly', weekday: clampInt(r.weekday, 1, 7), hour: clampInt(r.hour, 0, 23), minute: clampInt(r.minute, 0, 59) },
    });
  };
  weekly('weeklyPlanning', t('notifications.planningTitle'), t('notifications.planningBody'));
  weekly('shopping', t('notifications.shoppingTitle'), t('notifications.shoppingBody'));

  if (settings.expiry.enabled) {
    input.pantry
      .filter((p) => !p.consumedAt && p.expiresOn)
      .map((p) => {
        const day = alertDay(p.expiresOn as DayKey, input.today, settings.expiry.daysBefore);
        if (!day) return null;
        const at = fromDayKey(day);
        at.setHours(clampInt(settings.expiry.hour, 0, 23), 0, 0, 0);
        // Today's alert hour already passed: warn in a minute instead of never.
        if (at.getTime() <= now.getTime()) {
          if (day !== input.today) return null;
          at.setTime(now.getTime() + 2 * 60_000);
        }
        return { p, at };
      })
      .filter((x): x is { p: (typeof input.pantry)[number]; at: Date } => x !== null)
      .sort((a, b) => a.at.getTime() - b.at.getTime())
      .slice(0, MAX_EXPIRY_REMINDERS)
      .forEach(({ p, at }) =>
        out.push({
          id: `${NOTIFICATION_PREFIX}expiry-${p.id}`,
          channelId: CHANNELS.pantry,
          title: t('notifications.expiryTitle'),
          body: t('notifications.expiryBody', { name: p.name, date: p.expiresOn }),
          trigger: { kind: 'date', date: at },
        }),
      );
  }
  return out;
}

function clampInt(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(Number.isFinite(n) ? n : min)));
}

export function configureNotifications(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
  });
}

export async function ensureChannels(t: Translate): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNELS.meals, { name: t('notifications.channelMeals'), importance: Notifications.AndroidImportance.DEFAULT });
  await Notifications.setNotificationChannelAsync(CHANNELS.pantry, { name: t('notifications.channelPantry'), importance: Notifications.AndroidImportance.DEFAULT });
  await Notifications.setNotificationChannelAsync(CHANNELS.timers, { name: t('notifications.channelTimers'), importance: Notifications.AndroidImportance.HIGH });
}

export type Permission = 'granted' | 'denied' | 'undetermined';

export async function getPermission(): Promise<Permission> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted' ? 'granted' : status === 'denied' ? 'denied' : 'undetermined';
}

/** Android 13+ runtime prompt (channels must exist first). */
export async function requestPermission(t: Translate): Promise<Permission> {
  await ensureChannels(t);
  const current = await Notifications.getPermissionsAsync();
  if (current.status === 'granted') return 'granted';
  if (!current.canAskAgain) return 'denied';
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted' ? 'granted' : 'denied';
}

export function anyEnabled(s: NotificationSettings): boolean {
  return s.mealPrep.enabled || s.weeklyPlanning.enabled || s.shopping.enabled || s.expiry.enabled;
}

/** Replaces all scheduled MealWise reminders (timers are left alone). Returns the number scheduled. */
export async function applySchedule(planned: readonly PlannedNotification[]): Promise<number> {
  const existing = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(existing.filter((n) => n.identifier.startsWith(NOTIFICATION_PREFIX)).map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)));
  if (planned.length === 0 || (await getPermission()) !== 'granted') return 0;
  for (const p of planned) {
    await Notifications.scheduleNotificationAsync({
      identifier: p.id,
      content: { title: p.title, body: p.body },
      trigger:
        p.trigger.kind === 'date'
          ? { type: Notifications.SchedulableTriggerInputTypes.DATE, date: p.trigger.date, channelId: p.channelId }
          : { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: p.trigger.weekday, hour: p.trigger.hour, minute: p.trigger.minute, channelId: p.channelId },
    });
  }
  return planned.length;
}

/** Cooking-mode timer: fires even if the app is in the background. Returns the id to cancel it. */
export async function scheduleTimer(seconds: number, title: string, body: string): Promise<string | null> {
  if ((await getPermission()) !== 'granted' || seconds < 1) return null;
  return Notifications.scheduleNotificationAsync({
    identifier: `${TIMER_PREFIX}${Date.now()}`,
    content: { title, body },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: Math.round(seconds), channelId: CHANNELS.timers },
  });
}

export async function cancelTimer(id: string | null): Promise<void> {
  if (id) await Notifications.cancelScheduledNotificationAsync(id);
}
