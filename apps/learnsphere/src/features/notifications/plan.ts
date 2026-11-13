import { addDays, fromDayKey, type DayKey } from '@factory/app-core';

/**
 * Pure planning of local notifications. The service (services/notifications.ts) cancels every
 * LearnSphere notification and schedules exactly this plan, so the device always mirrors the
 * current data and settings (idempotent, no duplicates).
 *
 * Restraint by design: every kind is off by default, each kind is individually configurable,
 * at most MAX_DATED notifications are scheduled, and wording is encouraging, never guilt-inducing.
 */
export const NOTIFICATION_KINDS = ['session', 'review', 'exam', 'deadline', 'daily_goal', 'flashcards'] as const;
export type NotificationKind = (typeof NOTIFICATION_KINDS)[number];

export interface NotificationSetting {
  enabled: boolean;
  hour: number;
  minute: number;
  /** Session reminders only: minutes before the session. */
  leadMinutes: number;
}

export type NotificationSettings = Record<NotificationKind, NotificationSetting>;

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  session: { enabled: false, hour: 0, minute: 0, leadMinutes: 10 },
  review: { enabled: false, hour: 18, minute: 0, leadMinutes: 0 },
  exam: { enabled: false, hour: 9, minute: 0, leadMinutes: 0 },
  deadline: { enabled: false, hour: 9, minute: 0, leadMinutes: 0 },
  daily_goal: { enabled: false, hour: 19, minute: 0, leadMinutes: 0 },
  flashcards: { enabled: false, hour: 20, minute: 0, leadMinutes: 0 },
};

export type NotificationTrigger =
  | { type: 'date'; at: number }
  | { type: 'daily'; hour: number; minute: number }
  | { type: 'weekly'; weekday: number; hour: number; minute: number };

export interface PlannedNotification {
  id: string;
  kind: NotificationKind;
  trigger: NotificationTrigger;
  /** i18n keys under `notifications.*` + interpolation params. */
  titleKey: string;
  bodyKey: string;
  params: Record<string, string | number>;
}

export interface NotificationPlanInput {
  now: Date;
  settings: NotificationSettings;
  sessions: { id: string; title: string; day: DayKey; startMinute: number; status: string }[];
  exams: { id: string; title: string; day: DayKey }[];
  deadlines: { id: string; title: string; day: DayKey; done: boolean }[];
}

export const MAX_DATED = 48;
export const SESSION_HORIZON_DAYS = 7;
/** Exam reminders: one week before, the day before and the morning of the exam. */
export const EXAM_OFFSETS = [7, 1, 0];
/** Deadline reminders: two days before and on the day. */
export const DEADLINE_OFFSETS = [2, 0];

function at(day: DayKey, minuteOfDay: number): number {
  const d = fromDayKey(day);
  d.setHours(Math.floor(minuteOfDay / 60), minuteOfDay % 60, 0, 0);
  return d.getTime();
}

export function buildNotificationPlan(input: NotificationPlanInput): PlannedNotification[] {
  const { settings, now } = input;
  const nowMs = now.getTime();
  const dated: PlannedNotification[] = [];
  const horizon = addDays(toKey(now), SESSION_HORIZON_DAYS);

  if (settings.session.enabled) {
    for (const s of input.sessions) {
      if (s.status !== 'planned' || s.day > horizon) continue;
      const when = at(s.day, s.startMinute) - settings.session.leadMinutes * 60_000;
      if (when <= nowMs) continue;
      dated.push({ id: `ls-session-${s.id}`, kind: 'session', trigger: { type: 'date', at: when }, titleKey: 'notifications.sessionTitle', bodyKey: 'notifications.sessionBody', params: { title: s.title, minutes: settings.session.leadMinutes } });
    }
  }
  if (settings.exam.enabled) {
    const minute = settings.exam.hour * 60 + settings.exam.minute;
    for (const e of input.exams) {
      for (const offset of EXAM_OFFSETS) {
        const when = at(addDays(e.day, -offset), minute);
        if (when <= nowMs) continue;
        dated.push({ id: `ls-exam-${e.id}-${offset}`, kind: 'exam', trigger: { type: 'date', at: when }, titleKey: offset === 0 ? 'notifications.examTodayTitle' : 'notifications.examTitle', bodyKey: 'notifications.examBody', params: { title: e.title, count: offset } });
      }
    }
  }
  if (settings.deadline.enabled) {
    const minute = settings.deadline.hour * 60 + settings.deadline.minute;
    for (const d of input.deadlines) {
      if (d.done) continue;
      for (const offset of DEADLINE_OFFSETS) {
        const when = at(addDays(d.day, -offset), minute);
        if (when <= nowMs) continue;
        dated.push({ id: `ls-deadline-${d.id}-${offset}`, kind: 'deadline', trigger: { type: 'date', at: when }, titleKey: offset === 0 ? 'notifications.deadlineTodayTitle' : 'notifications.deadlineTitle', bodyKey: 'notifications.deadlineBody', params: { title: d.title, count: offset } });
      }
    }
  }

  const repeating: PlannedNotification[] = [];
  if (settings.daily_goal.enabled) {
    repeating.push({ id: 'ls-daily-goal', kind: 'daily_goal', trigger: { type: 'daily', hour: settings.daily_goal.hour, minute: settings.daily_goal.minute }, titleKey: 'notifications.dailyGoalTitle', bodyKey: 'notifications.dailyGoalBody', params: {} });
  }
  if (settings.flashcards.enabled) {
    repeating.push({ id: 'ls-flashcards', kind: 'flashcards', trigger: { type: 'daily', hour: settings.flashcards.hour, minute: settings.flashcards.minute }, titleKey: 'notifications.flashcardsTitle', bodyKey: 'notifications.flashcardsBody', params: {} });
  }
  if (settings.review.enabled) {
    // Weekly review on Sunday (expo weekday: 1 = Sunday).
    repeating.push({ id: 'ls-weekly-review', kind: 'review', trigger: { type: 'weekly', weekday: 1, hour: settings.review.hour, minute: settings.review.minute }, titleKey: 'notifications.reviewTitle', bodyKey: 'notifications.reviewBody', params: {} });
  }

  dated.sort((a, b) => (a.trigger as { at: number }).at - (b.trigger as { at: number }).at);
  return [...repeating, ...dated.slice(0, MAX_DATED)];
}

function toKey(d: Date): DayKey {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
