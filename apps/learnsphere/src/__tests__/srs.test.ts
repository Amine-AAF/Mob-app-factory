import { addDays } from '@factory/app-core';

import { canCreate, DEFAULT_SRS, effectiveSrs, FREE_LIMITS, remaining } from '@/config/limits';
import { cardMaturity, clampModifier, previewIntervals, retentionRate, scheduleReview, selectDueCards, type SchedulingState } from '@/features/flashcards/scheduler';

const TODAY = '2026-11-13';
const fresh = (): SchedulingState => ({ repetitions: 0, intervalDays: 0, ease: 2.5, dueDay: TODAY, lapses: 0 });

describe('spaced repetition (simplified SM-2)', () => {
  it('schedules first reviews at 1 day (3 when easy), then 6 days (8 when easy)', () => {
    const medium1 = scheduleReview(fresh(), 'medium', TODAY);
    expect(medium1).toMatchObject({ repetitions: 1, intervalDays: 1, dueDay: addDays(TODAY, 1) });
    expect(scheduleReview(fresh(), 'easy', TODAY).intervalDays).toBe(3);
    const medium2 = scheduleReview(medium1, 'medium', addDays(TODAY, 1));
    expect(medium2.intervalDays).toBe(6);
    expect(scheduleReview(medium1, 'easy', addDays(TODAY, 1)).intervalDays).toBe(8);
  });

  it('grows later intervals by the ease factor, slower for hard and faster for easy', () => {
    const card: SchedulingState = { repetitions: 2, intervalDays: 10, ease: 2.5, dueDay: TODAY, lapses: 0 };
    const hard = scheduleReview(card, 'hard', TODAY).intervalDays;
    const medium = scheduleReview(card, 'medium', TODAY).intervalDays;
    const easy = scheduleReview(card, 'easy', TODAY).intervalDays;
    expect(medium).toBe(25);
    expect(hard).toBeLessThan(medium);
    expect(easy).toBeGreaterThan(medium);
  });

  it('a forgotten card lapses: due tomorrow, repetitions reset, lapse counted, ease lowered', () => {
    const card: SchedulingState = { repetitions: 4, intervalDays: 40, ease: 2.5, dueDay: TODAY, lapses: 1 };
    const next = scheduleReview(card, 'again', TODAY);
    expect(next).toMatchObject({ repetitions: 0, intervalDays: 1, dueDay: addDays(TODAY, 1), lapses: 2 });
    expect(next.ease).toBeLessThan(2.5);
  });

  it('never lets ease drop below 1.3', () => {
    let card = fresh();
    for (let i = 0; i < 20; i++) card = scheduleReview(card, 'again', TODAY);
    expect(card.ease).toBeGreaterThanOrEqual(1.3);
  });

  it('applies the premium interval modifier and the maximum interval', () => {
    const card: SchedulingState = { repetitions: 3, intervalDays: 100, ease: 2.5, dueDay: TODAY, lapses: 0 };
    expect(scheduleReview(card, 'medium', TODAY).intervalDays).toBe(250);
    expect(scheduleReview(card, 'medium', TODAY, { intervalModifier: 0.5 }).intervalDays).toBe(125);
    expect(scheduleReview(card, 'easy', TODAY, { maxIntervalDays: 180 }).intervalDays).toBe(180);
    expect(scheduleReview(fresh(), 'medium', TODAY, { intervalModifier: 0.5 }).intervalDays).toBe(1);
    expect(clampModifier(9)).toBe(2);
    expect(clampModifier(Number.NaN)).toBe(1);
  });

  it('previews the next interval for every grade', () => {
    expect(previewIntervals(fresh(), TODAY)).toEqual({ again: 1, hard: 1, medium: 1, easy: 3 });
  });

  it('selects due reviews by history (most overdue, most lapses, lowest ease) then new cards', () => {
    const base = { repetitions: 1, ease: 2.5, lapses: 0, lastReviewedAt: '2026-11-01T10:00:00Z' };
    const cards = [
      { id: 'future', ...base, dueDay: addDays(TODAY, 2) },
      { id: 'new1', ...base, repetitions: 0, lastReviewedAt: null, dueDay: TODAY },
      { id: 'due-today', ...base, dueDay: TODAY },
      { id: 'overdue-3', ...base, dueDay: addDays(TODAY, -3) },
      { id: 'due-today-lapsed', ...base, lapses: 3, dueDay: TODAY },
      { id: 'due-today-hard', ...base, ease: 1.5, dueDay: TODAY },
      { id: 'new2', ...base, repetitions: 0, lastReviewedAt: null, dueDay: TODAY },
    ];
    expect(selectDueCards(cards, TODAY).map((c) => c.id)).toEqual(['overdue-3', 'due-today-lapsed', 'due-today-hard', 'due-today', 'new1', 'new2']);
    expect(selectDueCards(cards, TODAY, { newCards: 1, reviews: 2 }).map((c) => c.id)).toEqual(['overdue-3', 'due-today-lapsed', 'new1']);
  });

  it('computes retention and maturity', () => {
    expect(retentionRate([])).toBeNull();
    expect(retentionRate(['again', 'medium', 'easy', 'hard'])).toBe(0.75);
    expect(cardMaturity({ lastReviewedAt: null, intervalDays: 0 })).toBe('new');
    expect(cardMaturity({ lastReviewedAt: 'x', intervalDays: 3 })).toBe('learning');
    expect(cardMaturity({ lastReviewedAt: 'x', intervalDays: 10 })).toBe('young');
    expect(cardMaturity({ lastReviewedAt: 'x', intervalDays: 30 })).toBe('mature');
  });
});

describe('free and premium limits', () => {
  it('enforces free limits and lifts them for premium', () => {
    expect(canCreate('subjects', FREE_LIMITS.subjects - 1, false)).toBe(true);
    expect(canCreate('subjects', FREE_LIMITS.subjects, false)).toBe(false);
    expect(canCreate('subjects', 999, true)).toBe(true);
    expect(remaining('flashcards', 290, false)).toBe(10);
    expect(remaining('flashcards', 290, true)).toBeNull();
  });

  it('free learners always use default SRS settings', () => {
    const custom = { newCardsPerDay: 80, maxReviewsPerDay: 500, intervalModifier: 0.7 };
    expect(effectiveSrs(custom, false)).toEqual(DEFAULT_SRS);
    expect(effectiveSrs(custom, true)).toEqual(custom);
  });
});
