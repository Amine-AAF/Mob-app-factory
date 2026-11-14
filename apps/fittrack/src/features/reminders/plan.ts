import { addDays, fromDayKey } from '@factory/app-core';

import type { PlannedItem } from '@/features/planner/plan';
import type { DayKey, NotificationSetting, Weekday } from '@/types';

/**
 * Pure planning of local notifications. The set of scheduled notifications is
 * always rebuilt from the database ("sync"), so it can never drift. Content keys
 * are i18n keys; the text never contains body data or exercise loads.
 */
export const NOTIFICATION_PREFIX = 'fittrack-';
export const MAX_SCHEDULED = 40; // Android keeps ~50 alarms per app; stay well below.
export const HORIZON_DAYS = 14;

export interface PlannedNotification {
  identifier: string;
  kind: NotificationSetting['kind'];
  /** Exact date (one-shot) or weekly repeat. */
  trigger: { type: 'date'; at: Date } | { type: 'weekly'; weekday: Weekday; hour: number; minute: number };
  titleKey: string;
  bodyKey: string;
}

/** Expo weekly triggers use 1 = Sunday … 7 = Saturday. */
export const toExpoWeekday = (w: Weekday) => ((w + 1) % 7) + 1;

function at(day: DayKey, hour: number, minute: number): Date {
  const d = fromDayKey(day);
  d.setHours(hour, minute, 0, 0);
  return d;
}

export function planNotifications(input: {
  settings: readonly NotificationSetting[];
  planned: readonly PlannedItem[];
  today: DayKey;
  now: Date;
  hasActiveChallenge: boolean;
  hasWeeklyGoal: boolean;
}): PlannedNotification[] {
  const out: PlannedNotification[] = [];
  const s = (k: NotificationSetting['kind']) => input.settings.find((x) => x.kind === k && x.enabled);

  // 1. Workout reminders: one per planned workout day in the horizon, at the entry time or the default time.
  const wr = s('workout_reminder');
  if (wr) {
    const days = new Set<DayKey>();
    for (const p of input.planned) {
      if (days.has(p.day) || p.day < input.today || p.day > addDays(input.today, HORIZON_DAYS - 1)) continue;
      const [h, m] = p.time ? (p.time.split(':').map(Number) as [number, number]) : [wr.hour, wr.minute];
      const when = at(p.day, h, m);
      if (when.getTime() <= input.now.getTime()) continue;
      days.add(p.day);
      out.push({ identifier: `${NOTIFICATION_PREFIX}workout-${p.day}`, kind: 'workout_reminder', trigger: { type: 'date', at: when }, titleKey: 'notifications.workout.title', bodyKey: 'notifications.workout.body' });
    }
  }

  // 2. Routine reminder on chosen weekdays (independent from the calendar).
  const rt = s('routine');
  if (rt) for (const w of rt.weekdays) out.push({ identifier: `${NOTIFICATION_PREFIX}routine-${w}`, kind: 'routine', trigger: { type: 'weekly', weekday: w, hour: rt.hour, minute: rt.minute }, titleKey: 'notifications.routine.title', bodyKey: 'notifications.routine.body' });

  // 3. Weekly goal check-in (only when a weekly goal exists).
  const wg = s('weekly_goal');
  if (wg && input.hasWeeklyGoal) out.push({ identifier: `${NOTIFICATION_PREFIX}weekly-goal`, kind: 'weekly_goal', trigger: { type: 'weekly', weekday: wg.weekdays[0] ?? 4, hour: wg.hour, minute: wg.minute }, titleKey: 'notifications.weeklyGoal.title', bodyKey: 'notifications.weeklyGoal.body' });

  // 4. Challenge nudge every other day while a challenge runs (gentle, never daily pressure).
  const ch = s('challenge');
  if (ch && input.hasActiveChallenge) {
    for (let i = 1; i < HORIZON_DAYS; i += 2) {
      const day = addDays(input.today, i);
      out.push({ identifier: `${NOTIFICATION_PREFIX}challenge-${day}`, kind: 'challenge', trigger: { type: 'date', at: at(day, ch.hour, ch.minute) }, titleKey: 'notifications.challenge.title', bodyKey: 'notifications.challenge.body' });
    }
  }

  // 5. Optional weekly progress summary (opens the app; the notification itself contains no figures).
  const ps = s('progress_summary');
  if (ps) out.push({ identifier: `${NOTIFICATION_PREFIX}summary`, kind: 'progress_summary', trigger: { type: 'weekly', weekday: ps.weekdays[0] ?? 6, hour: ps.hour, minute: ps.minute }, titleKey: 'notifications.summary.title', bodyKey: 'notifications.summary.body' });

  return out.slice(0, MAX_SCHEDULED);
}
