import { createTestDatabase } from '@factory/testing';

import { allQuizzes, contentStats } from '@/content';
import { initDatabase } from '@/database';
import {
  answerRound,
  buildQuiz,
  correctDisplayIndex,
  filterItems,
  gradeFromAnswer,
  nextCard,
  reviewQueue,
  scoreAnswers,
  toRound,
} from '@/features/quizzes/engine';
import { clock } from '@/services/clock';
import { CONTENT_LOCALES, type QuizItem } from '@/types/content';

const en = allQuizzes('en');

describe('quiz content', () => {
  it('provides at least 150 quiz items in every language', () => {
    expect(contentStats().quizzes).toBeGreaterThanOrEqual(150);
    for (const l of CONTENT_LOCALES) expect(allQuizzes(l)).toHaveLength(en.length);
  });

  it('mixes multiple-choice and true/false items with free items in every category', () => {
    expect(en.some((q) => q.type === 'mcq')).toBe(true);
    expect(en.some((q) => q.type === 'true-false')).toBe(true);
    for (const c of new Set(en.map((q) => q.category))) {
      expect(en.some((q) => q.category === c && !q.premium)).toBe(true);
    }
  });

  it('keeps options aligned across languages (same count, correct index in range)', () => {
    const fr = new Map(allQuizzes('fr').map((q) => [q.id, q]));
    const es = new Map(allQuizzes('es').map((q) => [q.id, q]));
    for (const q of en) {
      for (const other of [fr.get(q.id), es.get(q.id)]) {
        expect(other?.options?.length).toBe(q.options?.length);
        expect(other?.correctIndex).toBe(q.correctIndex);
      }
    }
  });
});

describe('quiz engine', () => {
  const mcq = en.find((q) => q.type === 'mcq')!;
  const tf = en.find((q) => q.type === 'true-false')!;

  it('shuffles MCQ options deterministically and maps answers back to the original index', () => {
    const a = toRound(mcq, 42);
    const b = toRound(mcq, 42);
    expect(a.order).toEqual(b.order);
    expect([...a.order].sort()).toEqual(mcq.options!.map((_, i) => i));
    const display = correctDisplayIndex(a);
    expect(answerRound(a, display)).toEqual({ itemId: mcq.id, chosenIndex: mcq.correctIndex, correct: true });
    const wrong = (display + 1) % a.order.length;
    expect(answerRound(a, wrong).correct).toBe(false);
  });

  it('never reorders True/False', () => {
    const round = toRound(tf, 7);
    expect(round.order).toEqual([0, 1]);
    expect(answerRound(round, tf.correctIndex).correct).toBe(true);
  });

  it('rejects an option that does not exist', () => {
    expect(() => answerRound(toRound(mcq, 1), 9)).toThrow(RangeError);
  });

  it('builds quizzes of the requested size without duplicates', () => {
    const rounds = buildQuiz(en, 10, 123);
    expect(rounds).toHaveLength(10);
    expect(new Set(rounds.map((r) => r.item.id)).size).toBe(10);
    expect(buildQuiz(en, 10, 123).map((r) => r.item.id)).toEqual(rounds.map((r) => r.item.id));
    expect(buildQuiz(en.slice(0, 3), 10, 1)).toHaveLength(3);
  });

  it('filters by category, difficulty and premium access', () => {
    const free = filterItems(en, { includePremium: false });
    expect(free.every((q) => !q.premium)).toBe(true);
    const java = filterItems(en, { includePremium: true, categories: ['java'], difficulties: ['beginner'] });
    expect(java.length).toBeGreaterThan(0);
    expect(java.every((q) => q.category === 'java' && q.difficulty === 'beginner')).toBe(true);
  });

  it('computes scores, including the empty quiz edge case', () => {
    expect(scoreAnswers([])).toEqual({ correct: 0, total: 0, percent: 0 });
    const answers = [
      { itemId: 'a', chosenIndex: 0, correct: true },
      { itemId: 'b', chosenIndex: 1, correct: false },
      { itemId: 'c', chosenIndex: 2, correct: true },
    ];
    expect(scoreAnswers(answers)).toEqual({ correct: 2, total: 3, percent: 67 });
  });

  it('schedules spaced repetition: wrong answers come back tomorrow, right ones later', () => {
    const today = '2026-11-14';
    const wrong = nextCard(undefined, gradeFromAnswer(false), today);
    expect(wrong.dueDay).toBe('2026-11-15');
    const right = nextCard(undefined, gradeFromAnswer(true), today);
    const again = nextCard(right, gradeFromAnswer(true), '2026-11-15');
    expect(again.intervalDays).toBeGreaterThan(right.intervalDays);
  });

  it('puts due (difficult) items before new ones in the review queue', () => {
    const items = en.slice(0, 4) as QuizItem[];
    const cards = new Map([
      [items[2]!.id, nextCard(undefined, 0, '2026-11-10')], // due 11-11
      [items[0]!.id, nextCard(undefined, 2, '2026-11-14')], // due later
    ]);
    const queue = reviewQueue(items, cards, '2026-11-14', 10).map((q) => q.id);
    expect(queue[0]).toBe(items[2]!.id);
    expect(queue).not.toContain(items[0]!.id);
    expect(queue).toEqual([items[2]!.id, items[1]!.id, items[3]!.id]);
  });
});

describe('quiz persistence', () => {
  beforeEach(() => clock.set(() => new Date('2026-11-14T10:00:00')));
  afterEach(() => clock.set(null));

  it('saves attempts atomically and reports per-item accuracy', async () => {
    const db = await createTestDatabase();
    const repos = await initDatabase(db);
    const id = await repos.review.saveAttempt({
      mode: 'quiz',
      category: 'java',
      startedAt: '2026-11-14T09:50:00.000Z',
      answers: [
        { itemId: 'q-java-001', chosenIndex: 2, correct: true },
        { itemId: 'q-java-002', chosenIndex: 1, correct: false },
      ],
    });
    expect(id).toBeGreaterThan(0);
    const [attempt] = await repos.review.recentAttempts();
    expect(attempt).toMatchObject({ mode: 'quiz', category: 'java', total: 2, correct: 1 });
    const stats = await repos.review.itemStats();
    expect(stats.get('q-java-002')).toEqual({ answered: 1, correct: 0 });
    db.close();
  });

  it('stores and updates spaced-repetition cards and counts due items', async () => {
    const db = await createTestDatabase();
    const repos = await initDatabase(db);
    const card = nextCard(undefined, 0, '2026-11-14');
    await repos.review.saveCard('quiz', 'q-sw-001', card, true);
    await repos.review.saveCard('quiz', 'q-sw-001', nextCard(card, 2, '2026-11-15'), false);
    const cards = await repos.review.getCards('quiz', ['q-sw-001', 'q-sw-002']);
    expect(cards.size).toBe(1);
    expect(cards.get('q-sw-001')?.repetitions).toBe(1);
    expect(await repos.review.dueCount('quiz', '2026-11-30')).toBe(1);
    expect(await repos.review.dueCount('question', '2026-11-30')).toBe(0);
    db.close();
  });
});
