import { isDue, seededShuffle, type ReviewGrade, type SrsCard } from '@factory/app-core';

import type { CategoryId, Question } from '@/types/content';

/**
 * Flashcards are built from library questions: the front is the question, the back
 * is the first part of the expected answer plus the key tips. The user grades their
 * own recall (again / hard / good / easy), which feeds spaced repetition.
 */
export interface FlashcardContent {
  id: string;
  front: string;
  back: string;
  keyPoints: string[];
}

export const FLASHCARD_GRADES: readonly ReviewGrade[] = [0, 1, 2, 3];

/** First sentences of the answer, capped so the card stays readable. */
export function summarizeAnswer(answer: string, maxChars = 320): string {
  const sentences = answer.match(/[^.!?]+[.!?]+(\s|$)/gu) ?? [answer];
  let out = '';
  for (const s of sentences) {
    if ((out + s).length > maxChars && out.length > 0) break;
    out += s;
  }
  return out.trim();
}

export function toFlashcard(q: Question): FlashcardContent {
  return { id: q.id, front: q.question, back: summarizeAnswer(q.expectedAnswer), keyPoints: q.tips.slice(0, 2) };
}

export interface DeckInput {
  questions: readonly Question[];
  cards: ReadonlyMap<string, SrsCard>;
  today: string;
  category?: CategoryId | null;
  includePremium: boolean;
  size: number;
  seed: number;
}

/** Due cards first (most overdue first), then new cards in a seeded random order. */
export function buildDeck(input: DeckInput): Question[] {
  const pool = input.questions.filter((q) => (input.includePremium || !q.premium) && (!input.category || q.category === input.category));
  const due = pool
    .filter((q) => {
      const c = input.cards.get(q.id);
      return c !== undefined && isDue(c, input.today);
    })
    .sort((a, b) => (input.cards.get(a.id)!.dueDay < input.cards.get(b.id)!.dueDay ? -1 : 1));
  const fresh = seededShuffle(
    pool.filter((q) => !input.cards.has(q.id)),
    input.seed,
  );
  return [...due, ...fresh].slice(0, Math.max(0, input.size));
}
