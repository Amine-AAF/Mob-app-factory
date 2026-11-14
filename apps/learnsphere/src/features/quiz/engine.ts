import { scorePercent, seededShuffle } from '@factory/app-core';

import type { QuizQuestion } from '@/content/types';
import { normalizeText } from '@/utils/text';

/**
 * Quiz engine: pure question selection, answer grading and scoring.
 * - Practice mode: feedback after each question.
 * - Exam mode: no feedback until the end, optional time limit (computed from timestamps).
 */
export type QuizMode = 'practice' | 'exam';

export type Answer =
  | { type: 'single'; choice: number | null }
  | { type: 'multiple'; choices: number[] }
  | { type: 'true_false'; value: boolean | null }
  | { type: 'short_answer'; text: string }
  /** matches[i] = index of the right item chosen for left item i (in the original pair order). */
  | { type: 'matching'; matches: (number | null)[] };

export function emptyAnswer(q: QuizQuestion): Answer {
  switch (q.type) {
    case 'single':
      return { type: 'single', choice: null };
    case 'multiple':
      return { type: 'multiple', choices: [] };
    case 'true_false':
      return { type: 'true_false', value: null };
    case 'short_answer':
      return { type: 'short_answer', text: '' };
    case 'matching':
      return { type: 'matching', matches: q.pairs.map(() => null) };
  }
}

export function isAnswered(answer: Answer): boolean {
  switch (answer.type) {
    case 'single':
      return answer.choice !== null;
    case 'multiple':
      return answer.choices.length > 0;
    case 'true_false':
      return answer.value !== null;
    case 'short_answer':
      return answer.text.trim().length > 0;
    case 'matching':
      return answer.matches.every((m) => m !== null);
  }
}

/** Normalization used for short answers: accents, case, spaces and trailing punctuation are ignored. */
export function normalizeShortAnswer(value: string): string {
  return normalizeText(value).replace(/[.!?;:]+$/g, '').replace(/\s*([/^×*+-])\s*/g, '$1');
}

export function gradeAnswer(q: QuizQuestion, answer: Answer): boolean {
  if (answer.type !== q.type) return false;
  switch (q.type) {
    case 'single':
      return (answer as Extract<Answer, { type: 'single' }>).choice === q.correct;
    case 'multiple': {
      const chosen = new Set((answer as Extract<Answer, { type: 'multiple' }>).choices);
      return chosen.size === q.correct.length && q.correct.every((i) => chosen.has(i));
    }
    case 'true_false':
      return (answer as Extract<Answer, { type: 'true_false' }>).value === q.correct;
    case 'short_answer': {
      const given = normalizeShortAnswer((answer as Extract<Answer, { type: 'short_answer' }>).text);
      return given.length > 0 && q.accepted.some((a) => normalizeShortAnswer(a) === given);
    }
    case 'matching': {
      const matches = (answer as Extract<Answer, { type: 'matching' }>).matches;
      return matches.length === q.pairs.length && matches.every((m, i) => m === i);
    }
  }
}

/** Partial credit for matching / multiple (used for statistics only; the score counts fully correct answers). */
export function partialCredit(q: QuizQuestion, answer: Answer): number {
  if (gradeAnswer(q, answer)) return 1;
  if (q.type === 'matching' && answer.type === 'matching') {
    return answer.matches.filter((m, i) => m === i).length / q.pairs.length;
  }
  if (q.type === 'multiple' && answer.type === 'multiple') {
    const right = answer.choices.filter((c) => q.correct.includes(c)).length;
    const wrong = answer.choices.length - right;
    return Math.max(0, (right - wrong) / q.correct.length);
  }
  return 0;
}

export interface QuizConfig {
  mode: QuizMode;
  count: number;
  /** Seconds, exam mode only. null = untimed. */
  timeLimitS: number | null;
  difficulty?: 1 | 2 | 3 | null;
  seed: number;
}

/** Picks `count` questions deterministically for a seed, optionally filtered by difficulty. */
export function pickQuestions<Q extends QuizQuestion>(pool: readonly Q[], config: Pick<QuizConfig, 'count' | 'difficulty' | 'seed'>): Q[] {
  const filtered = config.difficulty ? pool.filter((q) => q.difficulty === config.difficulty) : [...pool];
  return seededShuffle(filtered, config.seed).slice(0, Math.max(1, config.count));
}

/** Display order of options for a question (stable per seed). Returns original indexes. */
export function optionOrder(length: number, seed: number): number[] {
  return seededShuffle(
    Array.from({ length }, (_, i) => i),
    seed,
  );
}

export interface QuizResult {
  total: number;
  correct: number;
  score: number;
  perQuestion: { id: string; correct: boolean; credit: number }[];
}

export function scoreQuiz(questions: readonly QuizQuestion[], answers: readonly Answer[]): QuizResult {
  const perQuestion = questions.map((q, i) => {
    const a = answers[i] ?? emptyAnswer(q);
    return { id: q.id, correct: gradeAnswer(q, a), credit: partialCredit(q, a) };
  });
  const correct = perQuestion.filter((p) => p.correct).length;
  return { total: questions.length, correct, score: scorePercent(correct, questions.length), perQuestion };
}

/** Remaining time from timestamps (robust to backgrounding). null when untimed. */
export function remainingSeconds(startedAtMs: number, timeLimitS: number | null, nowMs: number): number | null {
  if (timeLimitS == null) return null;
  return Math.max(0, Math.ceil((startedAtMs + timeLimitS * 1000 - nowMs) / 1000));
}

export interface AttemptSummary {
  bankId: string;
  score: number;
  correct: number;
  total: number;
  mode: QuizMode;
  day: string;
}

export function quizStats(attempts: readonly AttemptSummary[]) {
  if (attempts.length === 0) return { attempts: 0, average: 0, best: 0, questions: 0, accuracy: 0 };
  const questions = attempts.reduce((s, a) => s + a.total, 0);
  const correct = attempts.reduce((s, a) => s + a.correct, 0);
  return {
    attempts: attempts.length,
    average: Math.round(attempts.reduce((s, a) => s + a.score, 0) / attempts.length),
    best: Math.max(...attempts.map((a) => a.score)),
    questions,
    accuracy: questions ? correct / questions : 0,
  };
}
