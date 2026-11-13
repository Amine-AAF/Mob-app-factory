import { addDays, type DayKey } from './dates';

/**
 * Simplified SM-2 spaced repetition.
 * Grades: 0 = again (forgot), 1 = hard, 2 = good, 3 = easy.
 */
export type ReviewGrade = 0 | 1 | 2 | 3;

export interface SrsCard {
  repetitions: number;
  intervalDays: number;
  ease: number;
  dueDay: DayKey;
}

export const MIN_EASE = 1.3;
export const DEFAULT_EASE = 2.5;

export function newCard(today: DayKey): SrsCard {
  return { repetitions: 0, intervalDays: 0, ease: DEFAULT_EASE, dueDay: today };
}

export function reviewCard(card: SrsCard, grade: ReviewGrade, today: DayKey): SrsCard {
  // Map 0..3 to SM-2 quality 2..5
  const q = grade + 2;
  const ease = Math.max(MIN_EASE, card.ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));

  if (grade === 0) {
    return { repetitions: 0, intervalDays: 1, ease, dueDay: addDays(today, 1) };
  }

  let interval: number;
  if (card.repetitions === 0) interval = grade === 3 ? 3 : 1;
  else if (card.repetitions === 1) interval = grade === 3 ? 8 : 6;
  else interval = Math.round(card.intervalDays * ease * (grade === 1 ? 0.8 : grade === 3 ? 1.3 : 1));

  interval = Math.max(1, interval);
  return { repetitions: card.repetitions + 1, intervalDays: interval, ease, dueDay: addDays(today, interval) };
}

export function isDue(card: SrsCard, today: DayKey): boolean {
  return card.dueDay <= today;
}

/** A card is considered "learned" once it survived a review with an interval of at least 6 days. */
export function isMastered(card: Pick<SrsCard, 'intervalDays'>): boolean {
  return card.intervalDays >= 6;
}
