import { configureForegroundHandling, ensureChannel, REMINDER_CHANNEL_ID, requestPermission, type PermissionResult } from '@factory/notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import type { TFunction } from 'i18next';

import type { Repositories } from '@/database';
import { activeAlerts, evaluateBudget } from '@/features/budgets/budgets';
import { summarize } from '@/features/reports/stats';
import { nextBillingDate } from '@/features/subscriptions/estimates';
import type { Category } from '@/types';
import { addDays, fromDayKey, monthEnd, monthOf, monthStart, type DayKey } from '@/utils/dates';

import { recordError } from './analytics';

/**
 * Optional LOCAL notifications (no server, no push token):
 * - budget alerts when a configured threshold is crossed (each threshold notified once per month);
 * - subscription renewal reminders.
 * Notification texts never contain amounts or balances (they can appear on the lock screen).
 */
const SUB_IDS_KEY = 'spendwise:subscription-reminder-ids';

export function initNotifications(): void {
  configureForegroundHandling();
}

export async function askNotificationPermission(channelName: string): Promise<PermissionResult> {
  try {
    return await requestPermission(channelName);
  } catch (e) {
    recordError(e, 'notifications_permission');
    return 'denied';
  }
}

export async function checkBudgetAlerts(r: Repositories, t: TFunction, today: DayKey, nameOf: (c: Category) => string): Promise<void> {
  const settings = await r.settings.getAll();
  if (!settings.budgetNotifications) return;
  const month = monthOf(today);
  const b = await r.budgets.getByMonth(month);
  if (!b) return;
  const txs = await r.transactions.list({ from: monthStart(month), to: monthEnd(month) });
  const s = summarize(txs, b.budget.currency, Object.fromEntries((await r.rates.list()).map((x) => [x.currency, x.rate])));
  const e = evaluateBudget(b.budget, b.limits, s.spendingByCategory, s.spending, settings.alertThresholds);
  const categories = new Map((await r.categories.list({ includeArchived: true })).map((c) => [c.id, c]));
  await ensureChannel(t('notifications.channel'));
  for (const line of activeAlerts([e.total, ...e.categories])) {
    if (line.reached === null) continue;
    if (!(await r.budgets.markAlert(b.budget.id, line.scope, line.reached))) continue;
    const cat = categories.get(line.scope);
    const name = line.scope === 'total' ? t('budgets.total') : cat ? nameOf(cat) : '';
    await Notifications.scheduleNotificationAsync({
      content: { title: t('notifications.budgetTitle'), body: t('notifications.budgetBody', { name, pct: line.reached }) },
      trigger: null,
    }).catch((err) => recordError(err, 'notifications_budget'));
  }
}

/** Re-schedules every subscription reminder from scratch (idempotent). */
export async function rescheduleSubscriptionReminders(r: Repositories, t: TFunction, today: DayKey): Promise<void> {
  try {
    const previous: string[] = JSON.parse((await AsyncStorage.getItem(SUB_IDS_KEY)) ?? '[]');
    await Promise.all(previous.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined)));
    const ids: string[] = [];
    const settings = await r.settings.getAll();
    if (settings.subscriptionReminders) {
      await ensureChannel(t('notifications.channel'));
      for (const sub of await r.subscriptions.list()) {
        if (!sub.active || sub.reminderDays === null) continue;
        const billing = nextBillingDate(sub, today);
        if (!billing) continue;
        const at = fromDayKey(addDays(billing, -sub.reminderDays));
        at.setHours(9, 0, 0, 0);
        if (at.getTime() <= Date.now()) continue;
        const id = await Notifications.scheduleNotificationAsync({
          content: { title: t('notifications.subTitle'), body: t('notifications.subBody', { name: sub.name, count: sub.reminderDays }) },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at, channelId: REMINDER_CHANNEL_ID },
        });
        ids.push(id);
      }
    }
    await AsyncStorage.setItem(SUB_IDS_KEY, JSON.stringify(ids));
  } catch (e) {
    recordError(e, 'notifications_subscriptions');
  }
}

export async function cancelAllReminders(): Promise<void> {
  try {
    const previous: string[] = JSON.parse((await AsyncStorage.getItem(SUB_IDS_KEY)) ?? '[]');
    await Promise.all(previous.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined)));
    await AsyncStorage.removeItem(SUB_IDS_KEY);
  } catch (e) {
    recordError(e, 'notifications_cancel');
  }
}
