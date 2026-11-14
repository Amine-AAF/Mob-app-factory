import { seededShuffle } from '@factory/app-core';

import type { CategoryId, Difficulty, JobRoleId, QuestionCore } from '@/types/content';

import { matchesRole } from '../questions/search';

/**
 * Mock interview logic. No AI evaluation: the session selects realistic questions,
 * the user answers in writing, then rates themself with a transparent grid.
 */

export const MOCK_DURATIONS = [5, 10, 20] as const;
export type MockDuration = (typeof MOCK_DURATIONS)[number];

/** Number of questions per duration (about 2 minutes per answer plus transitions). */
export const QUESTIONS_PER_DURATION: Record<MockDuration, number> = { 5: 3, 10: 5, 20: 8 };

/** Self-assessment criteria, rated 1 to 5. */
export const RATING_CRITERIA = ['structure', 'relevance', 'examples', 'clarity', 'confidence'] as const;
export type RatingCriterion = (typeof RATING_CRITERIA)[number];
export type Rating = Partial<Record<RatingCriterion, number>>;

const LEVEL_ORDER: Difficulty[] = ['beginner', 'intermediate', 'advanced'];

/** Questions at the chosen level or one level below, so sessions are realistic but achievable. */
function levelOk(q: QuestionCore, level: Difficulty): boolean {
  const target = LEVEL_ORDER.indexOf(level);
  const actual = LEVEL_ORDER.indexOf(q.difficulty);
  return actual <= target && actual >= target - 1;
}

const OPENING_TOPICS = new Set(['introduction']);
const SOFT: CategoryId[] = ['general', 'behavioral'];

export interface MockSelectionInput {
  cores: readonly QuestionCore[];
  role: JobRoleId | null;
  level: Difficulty;
  minutes: MockDuration;
  includePremium: boolean;
  seed: number;
}

/**
 * Builds an interview that feels like a real one: it opens with an introduction
 * question, alternates soft-skill and role-specific questions, and closes with
 * a motivation or HR question when the session is long enough.
 */
export function selectMockQuestions(input: MockSelectionInput): string[] {
  const count = QUESTIONS_PER_DURATION[input.minutes];
  const pool = input.cores.filter((q) => (input.includePremium || !q.premium) && (!input.role || matchesRole(q, input.role)));
  const atLevel = pool.filter((q) => levelOk(q, input.level));
  const source = atLevel.length >= count ? atLevel : pool;
  const shuffled = seededShuffle(source, input.seed);

  const opening = shuffled.find((q) => OPENING_TOPICS.has(q.topic)) ?? pool.find((q) => OPENING_TOPICS.has(q.topic));
  const soft = shuffled.filter((q) => SOFT.includes(q.category) && !OPENING_TOPICS.has(q.topic));
  const specific = shuffled.filter((q) => !SOFT.includes(q.category) && q.category !== 'hr-salary');
  const closing = shuffled.filter((q) => q.category === 'hr-salary' || q.topic === 'motivation');

  const picked: string[] = [];
  const take = (q: QuestionCore | undefined) => {
    if (q && !picked.includes(q.id) && picked.length < count) picked.push(q.id);
  };
  take(opening);
  const middleSlots = count - picked.length - (count >= 5 ? 1 : 0);
  let s = 0;
  let r = 0;
  for (let i = 0; i < middleSlots; i++) {
    // Role-specific content takes priority when a role is chosen.
    const preferSpecific = input.role ? i % 2 === 0 : i % 3 === 2;
    const next = preferSpecific ? (specific[r++] ?? soft[s++]) : (soft[s++] ?? specific[r++]);
    take(next);
  }
  if (count >= 5) take(closing.find((q) => !picked.includes(q.id)));
  // Top up if some groups were too small.
  for (const q of shuffled) take(q);
  return picked;
}

/** Suggested time per answer in seconds (the timer is optional). */
export function secondsPerQuestion(minutes: MockDuration): number {
  return Math.floor((minutes * 60) / QUESTIONS_PER_DURATION[minutes]);
}

export function averageRating(rating: Rating | null | undefined): number | null {
  const values = RATING_CRITERIA.map((c) => rating?.[c]).filter((v): v is number => typeof v === 'number' && v >= 1 && v <= 5);
  if (!values.length) return null;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}

export interface MockAnswerInput {
  questionId: string;
  answer: string;
  skipped: boolean;
  rating?: Rating | null;
}

export interface MockSummary {
  total: number;
  answered: number;
  skipped: number;
  averageScore: number | null;
  /** Criterion with the lowest average, to suggest what to practise next. */
  weakest: RatingCriterion | null;
}

export function summarizeMock(answers: readonly MockAnswerInput[]): MockSummary {
  const answered = answers.filter((a) => !a.skipped && a.answer.trim().length > 0).length;
  const perAnswer = answers.map((a) => averageRating(a.rating)).filter((v): v is number => v !== null);
  const totals = new Map<RatingCriterion, { sum: number; n: number }>();
  for (const a of answers) {
    for (const c of RATING_CRITERIA) {
      const v = a.rating?.[c];
      if (typeof v === 'number') {
        const t = totals.get(c) ?? { sum: 0, n: 0 };
        totals.set(c, { sum: t.sum + v, n: t.n + 1 });
      }
    }
  }
  let weakest: RatingCriterion | null = null;
  let low = Infinity;
  for (const [c, t] of totals) {
    const avg = t.sum / t.n;
    if (avg < low) {
      low = avg;
      weakest = c;
    }
  }
  return {
    total: answers.length,
    answered,
    skipped: answers.length - answered,
    averageScore: perAnswer.length ? Math.round((perAnswer.reduce((a, b) => a + b, 0) / perAnswer.length) * 10) / 10 : null,
    weakest,
  };
}
