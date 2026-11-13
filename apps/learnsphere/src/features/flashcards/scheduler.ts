import { addDays, diffDays, reviewCard, type DayKey, type ReviewGrade, type SrsCard } from '@factory/app-core';

/**
 * LearnSphere spaced repetition — a simplified SM-2 variant.
 *
 * Grades shown to the learner and their SM-2 quality (0..5 scale):
 *   again  (forgot)    -> quality 2  : the card lapses: repetitions reset, due tomorrow, lapse counted
 *   hard   (difficult) -> quality 3  : interval grows slowly (×0.8 of the normal growth)
 *   medium (good)      -> quality 4  : normal growth (interval × ease)
 *   easy               -> quality 5  : faster growth (×1.3) and ease increases
 *
 * First intervals: 1 day (3 if "easy"), then 6 days (8 if "easy"), then interval × ease.
 * Ease starts at 2.5 and never drops under 1.3. The core math is the shared, tested
 * `reviewCard` of @factory/app-core; this module adds LearnSphere's grade mapping,
 * the premium interval modifier, a maximum interval and the selection of cards to review.
 */
export type FlashcardGrade = 'again' | 'hard' | 'medium' | 'easy';

export const GRADE_TO_SM2: Record<FlashcardGrade, ReviewGrade> = { again: 0, hard: 1, medium: 2, easy: 3 };

export interface SchedulingState extends SrsCard {
  lapses: number;
}

export interface SchedulerOptions {
  /** Premium "advanced" setting: multiplies every interval > 1 day (0.5 = denser reviews, 1.5 = sparser). */
  intervalModifier?: number;
  /** Upper bound for intervals in days. */
  maxIntervalDays?: number;
}

export const DEFAULT_MAX_INTERVAL = 365;

export function scheduleReview(card: SchedulingState, grade: FlashcardGrade, today: DayKey, options: SchedulerOptions = {}): SchedulingState {
  const next = reviewCard(card, GRADE_TO_SM2[grade], today);
  const modifier = clampModifier(options.intervalModifier ?? 1);
  const max = Math.max(1, options.maxIntervalDays ?? DEFAULT_MAX_INTERVAL);
  let interval = next.intervalDays;
  if (interval > 1 && modifier !== 1) interval = Math.max(2, Math.round(interval * modifier));
  interval = Math.min(max, interval);
  return {
    repetitions: next.repetitions,
    ease: Math.round(next.ease * 1000) / 1000,
    intervalDays: interval,
    dueDay: addDays(today, interval),
    lapses: card.lapses + (grade === 'again' ? 1 : 0),
  };
}

export function clampModifier(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(2, Math.max(0.5, value));
}

/** Predicted next interval per grade, displayed under the grade buttons. */
export function previewIntervals(card: SchedulingState, today: DayKey, options?: SchedulerOptions): Record<FlashcardGrade, number> {
  return {
    again: scheduleReview(card, 'again', today, options).intervalDays,
    hard: scheduleReview(card, 'hard', today, options).intervalDays,
    medium: scheduleReview(card, 'medium', today, options).intervalDays,
    easy: scheduleReview(card, 'easy', today, options).intervalDays,
  };
}

export interface CardForSelection {
  id: string;
  dueDay: DayKey;
  repetitions: number;
  lapses: number;
  ease: number;
  lastReviewedAt: string | null;
}

export interface SelectionLimits {
  /** Maximum never-reviewed cards introduced per session. */
  newCards: number;
  /** Maximum review (already seen) cards per session. */
  reviews: number;
}

export const DEFAULT_LIMITS: SelectionLimits = { newCards: 20, reviews: 200 };

/**
 * Picks the cards to review today from their history:
 * 1. Due review cards first — most overdue first, then the ones the learner struggles with
 *    (more lapses, lower ease).
 * 2. Then new cards (never reviewed), oldest first, capped by `newCards`.
 * Cards due in the future are never selected (except in "cram" mode, handled by the caller).
 */
export function selectDueCards<T extends CardForSelection>(cards: readonly T[], today: DayKey, limits: SelectionLimits = DEFAULT_LIMITS): T[] {
  const reviews = cards
    .filter((c) => c.lastReviewedAt !== null && c.dueDay <= today)
    .sort((a, b) => {
      const overdue = diffDays(a.dueDay, today) - diffDays(b.dueDay, today);
      if (overdue !== 0) return -overdue;
      if (a.lapses !== b.lapses) return b.lapses - a.lapses;
      return a.ease - b.ease;
    })
    .slice(0, Math.max(0, limits.reviews));
  const fresh = cards.filter((c) => c.lastReviewedAt === null && c.dueDay <= today).slice(0, Math.max(0, limits.newCards));
  return [...reviews, ...fresh];
}

/** Retention = share of reviews that were not "again". */
export function retentionRate(grades: readonly FlashcardGrade[]): number | null {
  if (grades.length === 0) return null;
  return grades.filter((g) => g !== 'again').length / grades.length;
}

export type CardMaturity = 'new' | 'learning' | 'young' | 'mature';

export function cardMaturity(card: { lastReviewedAt: string | null; intervalDays: number }): CardMaturity {
  if (card.lastReviewedAt === null) return 'new';
  if (card.intervalDays < 6) return 'learning';
  if (card.intervalDays < 21) return 'young';
  return 'mature';
}
