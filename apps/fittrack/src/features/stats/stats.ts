import { addDays, computeStreak, diffDays, startOfWeek } from '@factory/app-core';

import type { CardioActivity, DayKey, ExerciseCategory, WorkoutSession } from '@/types';

/**
 * Statistics are aggregations of what the user actually logged. Nothing is
 * interpolated or invented: periods without data show as empty, not as zero trends.
 */

export type CompletedSession = Pick<WorkoutSession, 'id' | 'day' | 'durationSec' | 'startedAt' | 'name'>;

export interface SetFact {
  sessionId: string;
  day: DayKey;
  exerciseId: string;
  category: ExerciseCategory;
}

/** Days with at least one completed workout or cardio activity. */
export function activeDays(sessions: readonly CompletedSession[], cardio: readonly Pick<CardioActivity, 'day'>[] = []): Set<DayKey> {
  return new Set([...sessions.map((s) => s.day), ...cardio.map((c) => c.day)]);
}

/** Current / longest run of consecutive active days (rest days break it — see weekStreak for a gentler metric). */
export function dayStreak(days: Set<DayKey>, today: DayKey) {
  return computeStreak(days, today);
}

/**
 * Consecutive weeks (Monday-first) reaching `perWeek` active days, counting the current
 * week only once it is reached (an in-progress week never breaks the streak).
 */
export function weekStreak(days: Set<DayKey>, today: DayKey, perWeek: number): { current: number; best: number } {
  if (days.size === 0 || perWeek <= 0) return { current: 0, best: 0 };
  const counts = new Map<DayKey, number>();
  for (const d of days) {
    const w = startOfWeek(d);
    counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  const thisWeek = startOfWeek(today);
  const earliest = [...counts.keys()].sort()[0]!;
  let best = 0;
  let run = 0;
  for (let w = earliest; w <= thisWeek; w = addDays(w, 7)) {
    const ok = (counts.get(w) ?? 0) >= perWeek;
    if (ok) run++;
    else if (w !== thisWeek) run = 0;
    best = Math.max(best, run);
  }
  return { current: run, best };
}

export interface WeekSummary {
  sessions: number;
  minutes: number;
  activeDays: number;
}

export function summarizeRange(sessions: readonly CompletedSession[], cardio: readonly CardioActivity[], from: DayKey, to: DayKey): WeekSummary {
  const inRange = (d: DayKey) => d >= from && d <= to;
  const s = sessions.filter((x) => inRange(x.day));
  const c = cardio.filter((x) => inRange(x.day));
  const seconds = s.reduce((a, x) => a + (x.durationSec ?? 0), 0) + c.reduce((a, x) => a + x.durationSec, 0);
  return { sessions: s.length, minutes: Math.round(seconds / 60), activeDays: activeDays(s, c).size };
}

export function thisWeek(sessions: readonly CompletedSession[], cardio: readonly CardioActivity[], today: DayKey): WeekSummary {
  const from = startOfWeek(today);
  return summarizeRange(sessions, cardio, from, addDays(from, 6));
}

/** Sessions per week over the last `weeks` weeks (oldest first), for a bar chart. */
export function weeklyFrequency(sessions: readonly CompletedSession[], today: DayKey, weeks: number): { weekStart: DayKey; sessions: number; minutes: number }[] {
  const start = addDays(startOfWeek(today), -7 * (weeks - 1));
  const out = Array.from({ length: weeks }, (_, i) => ({ weekStart: addDays(start, i * 7), sessions: 0, minutes: 0 }));
  for (const s of sessions) {
    const idx = Math.floor(diffDays(start, startOfWeek(s.day)) / 7);
    const slot = out[idx];
    if (slot) {
      slot.sessions++;
      slot.minutes += Math.round((s.durationSec ?? 0) / 60);
    }
  }
  return out;
}

/** Average sessions per week over the weeks since the first session (max `weeks`). */
export function averagePerWeek(sessions: readonly CompletedSession[], today: DayKey, weeks = 8): number | null {
  if (sessions.length === 0) return null;
  const first = sessions.reduce((m, s) => (s.day < m ? s.day : m), sessions[0]!.day);
  const span = Math.min(weeks, Math.floor(diffDays(startOfWeek(first), startOfWeek(today)) / 7) + 1);
  const from = addDays(startOfWeek(today), -7 * (span - 1));
  const n = sessions.filter((s) => s.day >= from).length;
  return n / span;
}

/** Monthly totals ("YYYY-MM") over the last `months` months, oldest first. */
export function monthly(sessions: readonly CompletedSession[], cardio: readonly CardioActivity[], today: DayKey, months: number): { month: string; sessions: number; minutes: number; cardio: number }[] {
  const [y, m] = today.split('-').map(Number) as [number, number];
  const keys = Array.from({ length: months }, (_, i) => {
    const d = new Date(y, m - 1 - (months - 1 - i), 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const map = new Map(keys.map((k) => [k, { month: k, sessions: 0, minutes: 0, cardio: 0 }]));
  for (const s of sessions) {
    const e = map.get(s.day.slice(0, 7));
    if (e) {
      e.sessions++;
      e.minutes += Math.round((s.durationSec ?? 0) / 60);
    }
  }
  for (const c of cardio) {
    const e = map.get(c.day.slice(0, 7));
    if (e) {
      e.cardio++;
      e.minutes += Math.round(c.durationSec / 60);
    }
  }
  return keys.map((k) => map.get(k)!);
}

/** Per-year totals (all history), most recent first. */
export function yearly(sessions: readonly CompletedSession[], cardio: readonly CardioActivity[]): { year: string; sessions: number; minutes: number; activeDays: number }[] {
  const years = new Set([...sessions.map((s) => s.day.slice(0, 4)), ...cardio.map((c) => c.day.slice(0, 4))]);
  return [...years]
    .sort((a, b) => b.localeCompare(a))
    .map((year) => {
      const r = summarizeRange(sessions, cardio, `${year}-01-01`, `${year}-12-31`);
      return { year, sessions: r.sessions, minutes: r.minutes, activeDays: r.activeDays };
    });
}

/** Most practised exercises by number of sessions they appeared in (ties: more sets). */
export function topExercises(facts: readonly SetFact[], limit = 5): { exerciseId: string; sessions: number; sets: number }[] {
  const by = new Map<string, { sessions: Set<string>; sets: number }>();
  for (const f of facts) {
    const e = by.get(f.exerciseId) ?? { sessions: new Set<string>(), sets: 0 };
    e.sessions.add(f.sessionId);
    e.sets++;
    by.set(f.exerciseId, e);
  }
  return [...by.entries()]
    .map(([exerciseId, v]) => ({ exerciseId, sessions: v.sessions.size, sets: v.sets }))
    .sort((a, b) => b.sessions - a.sessions || b.sets - a.sets || a.exerciseId.localeCompare(b.exerciseId))
    .slice(0, limit);
}

/** Share of completed sets per exercise category (ratios sum to 1; empty without data). */
export function categoryDistribution(facts: readonly SetFact[]): { category: ExerciseCategory; sets: number; ratio: number }[] {
  if (facts.length === 0) return [];
  const by = new Map<ExerciseCategory, number>();
  for (const f of facts) by.set(f.category, (by.get(f.category) ?? 0) + 1);
  return [...by.entries()].map(([category, sets]) => ({ category, sets, ratio: sets / facts.length })).sort((a, b) => b.sets - a.sets);
}

export function totals(sessions: readonly CompletedSession[], cardio: readonly CardioActivity[]) {
  const seconds = sessions.reduce((a, s) => a + (s.durationSec ?? 0), 0) + cardio.reduce((a, c) => a + c.durationSec, 0);
  return { sessions: sessions.length, cardio: cardio.length, minutes: Math.round(seconds / 60) };
}
