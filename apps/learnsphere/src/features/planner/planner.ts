import { addDays, diffDays, fromDayKey, startOfWeek, toDayKey, type DayKey } from '@factory/app-core';

/* ------------------------------------------------------------------ Recurrence */

/**
 * Recurring sessions are materialised (one row per occurrence) so each occurrence can be
 * completed, skipped or rescheduled independently. The rule is stored on the series.
 */
export interface RecurrenceRule {
  /** 'daily' = every day, 'weekly' = on `weekdays` (1 = Monday … 7 = Sunday). */
  frequency: 'daily' | 'weekly';
  weekdays: number[];
  /** Every N weeks (weekly) or every N days (daily). */
  interval: number;
  startDay: DayKey;
  /** Inclusive. */
  untilDay: DayKey;
}

/** ISO weekday: 1 = Monday … 7 = Sunday. */
export function isoWeekday(day: DayKey): number {
  const d = fromDayKey(day).getDay();
  return d === 0 ? 7 : d;
}

/** Hard cap so a mistaken rule can't create thousands of rows. */
export const MAX_OCCURRENCES = 366;

export function expandRecurrence(rule: RecurrenceRule): DayKey[] {
  const interval = Math.max(1, Math.floor(rule.interval || 1));
  const out: DayKey[] = [];
  if (rule.untilDay < rule.startDay) return out;
  if (rule.frequency === 'daily') {
    for (let d = rule.startDay; d <= rule.untilDay && out.length < MAX_OCCURRENCES; d = addDays(d, interval)) out.push(d);
    return out;
  }
  const weekdays = new Set(rule.weekdays.filter((w) => w >= 1 && w <= 7));
  if (weekdays.size === 0) return out;
  const firstWeek = startOfWeek(rule.startDay);
  for (let d = rule.startDay; d <= rule.untilDay && out.length < MAX_OCCURRENCES; d = addDays(d, 1)) {
    const weekIndex = Math.floor(diffDays(firstWeek, startOfWeek(d)) / 7);
    if (weekIndex % interval === 0 && weekdays.has(isoWeekday(d))) out.push(d);
  }
  return out;
}

/* ------------------------------------------------------------------ Calendar views */

export type PlannerView = 'day' | 'week' | 'month';

/** The 7 days of the (Monday-based) week containing `day`. */
export function weekDays(day: DayKey): DayKey[] {
  const start = startOfWeek(day);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/** 6×7 grid for a month view (Monday first); `inMonth` false for padding days. */
export function monthGrid(day: DayKey): { day: DayKey; inMonth: boolean }[] {
  const date = fromDayKey(day);
  const first = toDayKey(new Date(date.getFullYear(), date.getMonth(), 1));
  const start = startOfWeek(first);
  const month = date.getMonth();
  return Array.from({ length: 42 }, (_, i) => {
    const d = addDays(start, i);
    return { day: d, inMonth: fromDayKey(d).getMonth() === month };
  });
}

export function shiftView(day: DayKey, view: PlannerView, direction: 1 | -1): DayKey {
  if (view === 'day') return addDays(day, direction);
  if (view === 'week') return addDays(day, 7 * direction);
  const d = fromDayKey(day);
  return toDayKey(new Date(d.getFullYear(), d.getMonth() + direction, 1));
}

export function viewRange(day: DayKey, view: PlannerView): { from: DayKey; to: DayKey } {
  if (view === 'day') return { from: day, to: day };
  if (view === 'week') {
    const w = weekDays(day);
    return { from: w[0] as DayKey, to: w[6] as DayKey };
  }
  const grid = monthGrid(day);
  return { from: (grid[0] as { day: DayKey }).day, to: (grid[41] as { day: DayKey }).day };
}

export function formatMinuteOfDay(minute: number): { hour: number; minute: number } {
  const m = ((Math.round(minute) % 1440) + 1440) % 1440;
  return { hour: Math.floor(m / 60), minute: m % 60 };
}

/* ------------------------------------------------------------------ Sessions */

export interface PlannedSession {
  id: string;
  subjectId: string | null;
  day: DayKey;
  startMinute: number;
  durationMin: number;
  status: 'planned' | 'done' | 'skipped';
}

/** Planned sessions in the past that were neither done nor skipped. */
export function missedSessions<T extends PlannedSession>(sessions: readonly T[], now: Date): T[] {
  const today = toDayKey(now);
  const minuteNow = now.getHours() * 60 + now.getMinutes();
  return sessions.filter((s) => s.status === 'planned' && (s.day < today || (s.day === today && s.startMinute + s.durationMin < minuteNow)));
}

/** Completion rate of sessions whose time has passed (done / (done + skipped + missed)). */
export function completionRate(sessions: readonly PlannedSession[], now: Date): number | null {
  const past = sessions.filter((s) => s.status !== 'planned' || missedSessions([s], now).length > 0);
  if (past.length === 0) return null;
  return past.filter((s) => s.status === 'done').length / past.length;
}

/** Detects overlaps with existing sessions on the same day (used as a gentle warning). */
export function overlaps<T extends PlannedSession>(candidate: Pick<PlannedSession, 'day' | 'startMinute' | 'durationMin'> & { id?: string }, existing: readonly T[]): T[] {
  const end = candidate.startMinute + candidate.durationMin;
  return existing.filter((s) => s.id !== candidate.id && s.day === candidate.day && s.status !== 'skipped' && s.startMinute < end && candidate.startMinute < s.startMinute + s.durationMin);
}

/* ------------------------------------------------------------------ Suggestions */

/**
 * Local, rule-based suggestions (no AI): they combine deadlines, goals, unfinished sessions
 * and the time the learner said they have available each day. Every suggestion carries the
 * reason it was made so the UI can explain it.
 */
export type SuggestionReason = 'exam_soon' | 'deadline_soon' | 'missed_session' | 'goal_behind' | 'cards_due' | 'balance';

export interface Suggestion {
  subjectId: string | null;
  minutes: number;
  reason: SuggestionReason;
  /** Higher first. */
  priority: number;
  /** Extra info for the message, e.g. days left or item title. */
  daysLeft?: number;
  refTitle?: string;
}

export interface SuggestionInput {
  today: DayKey;
  /** Minutes per day the learner wants to study (settings). */
  availableMinutes: number;
  /** Minutes already planned or done today. */
  plannedTodayMinutes: number;
  exams: { subjectId: string | null; title: string; day: DayKey; priority: 'low' | 'medium' | 'high' }[];
  deadlines: { subjectId: string | null; title: string; day: DayKey; priority: 'low' | 'medium' | 'high'; done: boolean }[];
  missed: { subjectId: string | null; durationMin: number; title: string }[];
  /** Weekly minutes goal progress per subject (null = global). */
  goals: { subjectId: string | null; target: number; progress: number; daysLeftInPeriod: number }[];
  dueCards: number;
  /** Subjects with their last study day (for balance). */
  subjects: { id: string; lastStudiedDay: DayKey | null }[];
}

const PRIORITY_WEIGHT = { low: 0.8, medium: 1, high: 1.3 } as const;

export function buildSuggestions(input: SuggestionInput, max = 4): Suggestion[] {
  const budget = Math.max(0, input.availableMinutes - input.plannedTodayMinutes);
  if (budget < 10) return [];
  const out: Suggestion[] = [];

  for (const exam of input.exams) {
    const daysLeft = diffDays(input.today, exam.day);
    if (daysLeft < 0 || daysLeft > 21) continue;
    // Closer exams get more time: from 25 min (3 weeks) to 60 min (tomorrow).
    const minutes = roundTo5(25 + (35 * (21 - daysLeft)) / 21);
    out.push({ subjectId: exam.subjectId, minutes, reason: 'exam_soon', priority: (100 - daysLeft * 4) * PRIORITY_WEIGHT[exam.priority], daysLeft, refTitle: exam.title });
  }
  for (const d of input.deadlines) {
    if (d.done) continue;
    const daysLeft = diffDays(input.today, d.day);
    if (daysLeft < 0 || daysLeft > 10) continue;
    out.push({ subjectId: d.subjectId, minutes: daysLeft <= 2 ? 45 : 30, reason: 'deadline_soon', priority: (90 - daysLeft * 6) * PRIORITY_WEIGHT[d.priority], daysLeft, refTitle: d.title });
  }
  for (const m of input.missed.slice(0, 3)) {
    out.push({ subjectId: m.subjectId, minutes: roundTo5(Math.min(60, Math.max(15, m.durationMin))), reason: 'missed_session', priority: 60, refTitle: m.title });
  }
  for (const g of input.goals) {
    const remaining = g.target - g.progress;
    if (remaining <= 0) continue;
    const perDay = remaining / Math.max(1, g.daysLeftInPeriod);
    out.push({ subjectId: g.subjectId, minutes: roundTo5(Math.min(90, Math.max(15, perDay))), reason: 'goal_behind', priority: 50 + Math.min(30, perDay / 3) });
  }
  if (input.dueCards > 0) {
    // ~20 s per card, at least 5 minutes.
    out.push({ subjectId: null, minutes: roundTo5(Math.max(5, (input.dueCards * 20) / 60)), reason: 'cards_due', priority: 55 });
  }
  const neglected = input.subjects
    .map((s) => ({ ...s, idle: s.lastStudiedDay ? diffDays(s.lastStudiedDay, input.today) : 99 }))
    .filter((s) => s.idle >= 5)
    .sort((a, b) => b.idle - a.idle)[0];
  if (neglected) out.push({ subjectId: neglected.id, minutes: 25, reason: 'balance', priority: 30 + Math.min(15, neglected.idle) });

  // Keep the best suggestion per (subject, reason), sort by priority, fit within the time budget.
  const seen = new Set<string>();
  const ranked = out
    .sort((a, b) => b.priority - a.priority)
    .filter((s) => {
      const key = `${s.subjectId ?? '-'}:${s.reason}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  const result: Suggestion[] = [];
  let left = budget;
  for (const s of ranked) {
    if (result.length >= max || left < 5) break;
    const minutes = Math.min(s.minutes, roundDownTo5(left));
    if (minutes < 5) continue;
    result.push({ ...s, minutes });
    left -= minutes;
  }
  return result;
}

const roundTo5 = (n: number) => Math.max(5, Math.round(n / 5) * 5);
const roundDownTo5 = (n: number) => Math.floor(n / 5) * 5;

/** First free slot (≥ fromMinute) of `duration` minutes on a day, between 06:00 and 23:00. */
export function findFreeSlot(sessions: readonly PlannedSession[], day: DayKey, duration: number, fromMinute = 8 * 60): number | null {
  const busy = sessions.filter((s) => s.day === day && s.status !== 'skipped').sort((a, b) => a.startMinute - b.startMinute);
  let start = Math.max(6 * 60, Math.ceil(fromMinute / 15) * 15);
  for (const s of busy) {
    if (start + duration <= s.startMinute) return start;
    start = Math.max(start, Math.ceil((s.startMinute + s.durationMin) / 15) * 15);
  }
  return start + duration <= 23 * 60 ? start : null;
}
