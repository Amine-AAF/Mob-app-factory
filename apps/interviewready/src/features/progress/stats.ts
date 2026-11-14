import { lastNDays } from '@factory/app-core';

import type { CategoryId, QuizCore } from '@/types/content';

/** Advanced statistics computed locally from the user's own data. */

export interface DayActivityLike {
  day: string;
  questionsStudied: number;
  quizzesCompleted: number;
  mocksCompleted: number;
  cardsReviewed: number;
  answersSaved: number;
}

export interface DailyPoint {
  day: string;
  total: number;
}

/** Activity per day over the last `days` days (missing days count as 0), oldest first. */
export function activitySeries(rows: readonly DayActivityLike[], today: string, days = 14): DailyPoint[] {
  const byDay = new Map(rows.map((r) => [r.day, r.questionsStudied + r.quizzesCompleted + r.mocksCompleted + r.cardsReviewed + r.answersSaved]));
  return lastNDays(today, days).map((day) => ({ day, total: byDay.get(day) ?? 0 }));
}

export interface CategoryAccuracy {
  category: CategoryId;
  answered: number;
  correct: number;
  /** 0..1 */
  accuracy: number;
}

/**
 * Quiz accuracy per category, weakest first. Categories need at least `minAnswers`
 * answers to be ranked, so one unlucky answer does not label a category as weak.
 */
export function categoryAccuracy(stats: ReadonlyMap<string, { answered: number; correct: number }>, quizzes: readonly QuizCore[], minAnswers = 3): CategoryAccuracy[] {
  const byCategory = new Map<CategoryId, { answered: number; correct: number }>();
  for (const q of quizzes) {
    const s = stats.get(q.id);
    if (!s) continue;
    const acc = byCategory.get(q.category) ?? { answered: 0, correct: 0 };
    byCategory.set(q.category, { answered: acc.answered + s.answered, correct: acc.correct + s.correct });
  }
  return [...byCategory.entries()]
    .filter(([, v]) => v.answered >= minAnswers)
    .map(([category, v]) => ({ category, ...v, accuracy: v.correct / v.answered }))
    .sort((a, b) => a.accuracy - b.accuracy || b.answered - a.answered);
}

export interface MockPoint {
  startedAt: string;
  score: number;
}

/** Completed, self-rated mock interviews in chronological order (for a trend). */
export function mockTrend(mocks: readonly { startedAt: string; completedAt: string | null; selfScore: number | null }[]): MockPoint[] {
  return mocks
    .filter((m) => m.completedAt && m.selfScore !== null)
    .map((m) => ({ startedAt: m.startedAt, score: m.selfScore as number }))
    .sort((a, b) => (a.startedAt < b.startedAt ? -1 : 1));
}

/** Difference between the average of the last three sessions and the first three. */
export function mockImprovement(points: readonly MockPoint[]): number | null {
  if (points.length < 2) return null;
  const n = Math.min(3, Math.floor(points.length / 2));
  const avg = (xs: readonly MockPoint[]) => xs.reduce((s, p) => s + p.score, 0) / xs.length;
  return Math.round((avg(points.slice(-n)) - avg(points.slice(0, n))) * 10) / 10;
}
