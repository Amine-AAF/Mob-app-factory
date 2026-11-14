import { isDue, newCard, reviewCard, scorePercent, seededShuffle, type ReviewGrade, type SrsCard } from '@factory/app-core';

import type { CategoryId, Difficulty, QuizItem } from '@/types/content';

/**
 * Pure quiz logic: selection, option shuffling, grading, scoring and spaced repetition.
 * No React, no storage: fully unit-testable. Persistence lives in the quiz repository.
 */

export interface QuizFilter {
  categories?: readonly CategoryId[];
  difficulties?: readonly Difficulty[];
  /** Free users only get free items; Premium users get everything. */
  includePremium: boolean;
}

export interface QuizRound {
  item: QuizItem;
  /**
   * Display order of options: order[displayIndex] = original option index.
   * True/false rounds always use [0, 1] (True, False) so the labels never move.
   */
  order: number[];
}

export interface RoundAnswer {
  itemId: string;
  /** Index in the ORIGINAL option list (already mapped back from the display order). */
  chosenIndex: number;
  correct: boolean;
}

export interface QuizScore {
  correct: number;
  total: number;
  percent: number;
}

export function filterItems(items: readonly QuizItem[], filter: QuizFilter): QuizItem[] {
  return items.filter(
    (i) =>
      (filter.includePremium || !i.premium) &&
      (!filter.categories?.length || filter.categories.includes(i.category)) &&
      (!filter.difficulties?.length || filter.difficulties.includes(i.difficulty)),
  );
}

function optionCount(item: QuizItem): number {
  return item.type === 'true-false' ? 2 : (item.options?.length ?? 0);
}

/** Builds a round with options shuffled deterministically from the seed (MCQ only). */
export function toRound(item: QuizItem, seed: number): QuizRound {
  const indexes = Array.from({ length: optionCount(item) }, (_, i) => i);
  return { item, order: item.type === 'mcq' ? seededShuffle(indexes, seed) : indexes };
}

/** Picks `count` items in a seeded random order and shuffles their options. */
export function buildQuiz(items: readonly QuizItem[], count: number, seed: number): QuizRound[] {
  return seededShuffle(items, seed)
    .slice(0, Math.max(0, count))
    .map((item, i) => toRound(item, seed + i + 1));
}

/** Grades a choice made on the DISPLAYED option list. */
export function answerRound(round: QuizRound, displayIndex: number): RoundAnswer {
  const chosenIndex = round.order[displayIndex];
  if (chosenIndex === undefined) throw new RangeError(`Option ${displayIndex} does not exist`);
  return { itemId: round.item.id, chosenIndex, correct: chosenIndex === round.item.correctIndex };
}

/** Display index of the correct answer, used to highlight it after answering. */
export function correctDisplayIndex(round: QuizRound): number {
  return round.order.indexOf(round.item.correctIndex);
}

export function scoreAnswers(answers: readonly RoundAnswer[]): QuizScore {
  const correct = answers.filter((a) => a.correct).length;
  return { correct, total: answers.length, percent: scorePercent(correct, answers.length) };
}

/**
 * Spaced repetition: a wrong answer resets the card (review tomorrow), a correct one
 * schedules it further away. Flashcards use self-assessed grades directly.
 */
export function gradeFromAnswer(correct: boolean): ReviewGrade {
  return correct ? 2 : 0;
}

export function nextCard(card: SrsCard | undefined, grade: ReviewGrade, today: string): SrsCard {
  return reviewCard(card ?? newCard(today), grade, today);
}

/**
 * Review queue: due cards first (most overdue first), then items never answered,
 * so "difficult questions" come back before new material.
 */
export function reviewQueue(items: readonly QuizItem[], cards: ReadonlyMap<string, SrsCard>, today: string, limit: number): QuizItem[] {
  const due = items
    .filter((i) => {
      const c = cards.get(i.id);
      return c !== undefined && isDue(c, today);
    })
    .sort((a, b) => (cards.get(a.id)!.dueDay < cards.get(b.id)!.dueDay ? -1 : 1));
  const fresh = items.filter((i) => !cards.has(i.id));
  return [...due, ...fresh].slice(0, Math.max(0, limit));
}
