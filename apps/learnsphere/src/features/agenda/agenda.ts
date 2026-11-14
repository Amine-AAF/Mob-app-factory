import { diffDays, toDayKey, type DayKey } from '@factory/app-core';

export type AgendaKind = 'exam' | 'test' | 'certification' | 'assignment' | 'project' | 'other';
export type Priority = 'low' | 'medium' | 'high';

export const EXAM_KINDS = ['exam', 'test', 'certification'] as const;
export const DEADLINE_KINDS = ['assignment', 'project', 'other'] as const;

export function tableForKind(kind: AgendaKind): 'exams' | 'deadlines' {
  return (EXAM_KINDS as readonly string[]).includes(kind) ? 'exams' : 'deadlines';
}

export interface AgendaItem {
  id: string;
  table: 'exams' | 'deadlines';
  kind: AgendaKind;
  title: string;
  subjectId: string | null;
  day: DayKey;
  minute: number | null;
  priority: Priority;
  notes: string;
  done: boolean;
  checklistDone: number;
  checklistTotal: number;
}

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  state: 'past' | 'today' | 'tomorrow' | 'soon' | 'later';
}

/** Countdown to an item (end of the day when no time is set). */
export function countdown(day: DayKey, minute: number | null, now: Date): Countdown {
  const [y, m, d] = day.split('-').map(Number) as [number, number, number];
  const target = new Date(y, m - 1, d, minute == null ? 23 : Math.floor(minute / 60), minute == null ? 59 : minute % 60);
  const ms = target.getTime() - now.getTime();
  const dayDiff = diffDays(toDayKey(now), day);
  const totalMin = Math.max(0, Math.floor(ms / 60_000));
  const state: Countdown['state'] = ms < 0 ? 'past' : dayDiff === 0 ? 'today' : dayDiff === 1 ? 'tomorrow' : dayDiff <= 7 ? 'soon' : 'later';
  return { days: Math.max(0, dayDiff), hours: Math.floor((totalMin % 1440) / 60), minutes: totalMin % 60, state };
}

const PRIORITY_RANK: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

/** Upcoming first (by date, then priority, then time); done or past items at the end, most recent first. */
export function sortAgenda<T extends AgendaItem>(items: readonly T[], today: DayKey): T[] {
  return [...items].sort((a, b) => {
    const aClosed = a.done || a.day < today;
    const bClosed = b.done || b.day < today;
    if (aClosed !== bClosed) return aClosed ? 1 : -1;
    if (a.day !== b.day) return (a.day < b.day ? -1 : 1) * (aClosed ? -1 : 1);
    if (a.priority !== b.priority) return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    return (a.minute ?? 1440) - (b.minute ?? 1440);
  });
}

/** Preparation readiness 0..1 from the checklist (null when there is no checklist). */
export function readiness(item: Pick<AgendaItem, 'checklistDone' | 'checklistTotal'>): number | null {
  return item.checklistTotal > 0 ? item.checklistDone / item.checklistTotal : null;
}
