import { addDays, fromDayKey } from '@factory/app-core';

import type { NotificationKind, NotificationSetting } from '@/types';

/**
 * Pure notification planner. The scheduled set is rebuilt from settings + data at
 * every sync (start-up, data or settings change), so it never drifts.
 *
 * Tone: encouraging, never guilt-inducing. No "you missed", no streak-loss threats;
 * nothing at all is scheduled for goals already reached, and the "resume a book"
 * nudge fires at most once per pause.
 */
export const NOTIFICATION_PREFIX = 'booknest-';

export type PlannedTrigger =
  | { type: 'daily'; hour: number; minute: number }
  | { type: 'weekly'; weekday: number; hour: number; minute: number }
  | { type: 'date'; at: Date };

export interface PlannedNotification {
  identifier: string;
  kind: NotificationKind;
  trigger: PlannedTrigger;
  /** i18n keys + params, resolved by the service. */
  titleKey: string;
  bodyKey: string;
  params?: Record<string, string | number>;
  url: string;
}

export interface PlanContext {
  now: Date;
  today: string;
  /** Active goals by type, with whether the current period is already reached. */
  goals: { type: string; reached: boolean; challengeId: string | null }[];
  /** Most recent in-progress book and its last activity day. */
  resumeCandidate: { bookId: string; title: string; lastActivityDay: string } | null;
}

export const RESUME_AFTER_DAYS = 3;

function at(day: string, hour: number, minute: number): Date {
  const d = fromDayKey(day);
  d.setHours(hour, minute, 0, 0);
  return d;
}

/** Next date (strictly in the future) for a day-of-month at hour:minute. */
function nextMonthly(now: Date, dayOfMonth: number, hour: number, minute: number): Date {
  const candidate = new Date(now.getFullYear(), now.getMonth(), dayOfMonth, hour, minute, 0, 0);
  if (candidate.getTime() > now.getTime()) return candidate;
  return new Date(now.getFullYear(), now.getMonth() + 1, dayOfMonth, hour, minute, 0, 0);
}

export function planNotifications(settings: NotificationSetting[], ctx: PlanContext): PlannedNotification[] {
  const out: PlannedNotification[] = [];
  const has = (type: string, pred: (g: PlanContext['goals'][number]) => boolean = () => true) => ctx.goals.some((g) => g.type === type && pred(g));
  const open = (type: string) => has(type, (g) => !g.reached);

  for (const s of settings) {
    if (!s.enabled) continue;
    const id = `${NOTIFICATION_PREFIX}${s.kind}`;
    switch (s.kind) {
      case 'daily':
        out.push({ identifier: id, kind: s.kind, trigger: { type: 'daily', hour: s.hour, minute: s.minute }, titleKey: 'notifications.daily.title', bodyKey: 'notifications.daily.body', url: '/' });
        break;
      case 'weekly_goal':
        if (open('days_per_week') || open('minutes_per_day'))
          out.push({ identifier: id, kind: s.kind, trigger: { type: 'weekly', weekday: s.weekday ?? 0, hour: s.hour, minute: s.minute }, titleKey: 'notifications.weekly.title', bodyKey: 'notifications.weekly.body', url: '/goals' });
        break;
      case 'monthly_goal':
        if (open('pages_per_month'))
          out.push({ identifier: id, kind: s.kind, trigger: { type: 'date', at: nextMonthly(ctx.now, 20, s.hour, s.minute) }, titleKey: 'notifications.monthly.title', bodyKey: 'notifications.monthly.body', url: '/goals' });
        break;
      case 'challenge': {
        const weekend = ctx.goals.some((g) => g.challengeId === 'weekend' && !g.reached);
        const anyChallenge = ctx.goals.some((g) => g.challengeId && !g.reached);
        if (anyChallenge)
          out.push({
            identifier: id,
            kind: s.kind,
            trigger: { type: 'weekly', weekday: weekend ? 6 : (s.weekday ?? 6), hour: s.hour, minute: s.minute },
            titleKey: 'notifications.challenge.title',
            bodyKey: weekend ? 'notifications.challenge.weekendBody' : 'notifications.challenge.body',
            url: '/goals',
          });
        break;
      }
      case 'resume_book': {
        const c = ctx.resumeCandidate;
        if (!c) break;
        const when = at(addDays(c.lastActivityDay, RESUME_AFTER_DAYS), s.hour, s.minute);
        // Once that moment has passed we stay quiet: one gentle nudge per pause, no repetition.
        if (when.getTime() > ctx.now.getTime())
          out.push({ identifier: id, kind: s.kind, trigger: { type: 'date', at: when }, titleKey: 'notifications.resume.title', bodyKey: 'notifications.resume.body', params: { title: c.title }, url: `/book/${c.bookId}` });
        break;
      }
      case 'yearly_goal': {
        if (!open('books_per_year')) break;
        const year = ctx.now.getFullYear();
        const candidates = [new Date(year, 6, 1, s.hour, s.minute), new Date(year, 11, 1, s.hour, s.minute), new Date(year + 1, 6, 1, s.hour, s.minute)];
        const next = candidates.find((d) => d.getTime() > ctx.now.getTime());
        if (next) out.push({ identifier: id, kind: s.kind, trigger: { type: 'date', at: next }, titleKey: 'notifications.yearly.title', bodyKey: 'notifications.yearly.body', url: '/goals' });
        break;
      }
    }
  }
  return out;
}

/** expo-notifications weekly triggers use 1 = Sunday … 7 = Saturday. */
export function toExpoWeekday(jsWeekday: number): number {
  return (((jsWeekday % 7) + 7) % 7) + 1;
}
