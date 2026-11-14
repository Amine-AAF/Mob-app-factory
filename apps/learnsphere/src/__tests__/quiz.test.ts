import type { QuizQuestion } from '@/content/types';
import { emptyAnswer, gradeAnswer, isAnswered, normalizeShortAnswer, optionOrder, partialCredit, pickQuestions, quizStats, remainingSeconds, scoreQuiz } from '@/features/quiz/engine';

const single: QuizQuestion = { id: 'q1', type: 'single', difficulty: 1, prompt: 'p', explanation: 'e', options: ['a', 'b', 'c', 'd'], correct: 2 };
const multiple: QuizQuestion = { id: 'q2', type: 'multiple', difficulty: 2, prompt: 'p', explanation: 'e', options: ['a', 'b', 'c', 'd'], correct: [0, 3] };
const tf: QuizQuestion = { id: 'q3', type: 'true_false', difficulty: 1, prompt: 'p', explanation: 'e', correct: false };
const short: QuizQuestion = { id: 'q4', type: 'short_answer', difficulty: 3, prompt: 'p', explanation: 'e', accepted: ['Mitochondria', '1/4'] };
const matching: QuizQuestion = { id: 'q5', type: 'matching', difficulty: 2, prompt: 'p', explanation: 'e', pairs: [{ left: 'H2O', right: 'water' }, { left: 'NaCl', right: 'salt' }, { left: 'CO2', right: 'carbon dioxide' }] };

describe('quiz grading', () => {
  it('grades single and multiple choice', () => {
    expect(gradeAnswer(single, { type: 'single', choice: 2 })).toBe(true);
    expect(gradeAnswer(single, { type: 'single', choice: 1 })).toBe(false);
    expect(gradeAnswer(multiple, { type: 'multiple', choices: [3, 0] })).toBe(true);
    expect(gradeAnswer(multiple, { type: 'multiple', choices: [0] })).toBe(false);
    expect(gradeAnswer(multiple, { type: 'multiple', choices: [0, 1, 3] })).toBe(false);
  });

  it('grades true/false and rejects answers of the wrong type', () => {
    expect(gradeAnswer(tf, { type: 'true_false', value: false })).toBe(true);
    expect(gradeAnswer(tf, { type: 'true_false', value: null })).toBe(false);
    expect(gradeAnswer(tf, { type: 'single', choice: 0 })).toBe(false);
  });

  it('grades short answers ignoring case, accents, spaces and final punctuation', () => {
    expect(gradeAnswer(short, { type: 'short_answer', text: '  mitochondria. ' })).toBe(true);
    expect(gradeAnswer(short, { type: 'short_answer', text: '1 / 4' })).toBe(true);
    expect(gradeAnswer(short, { type: 'short_answer', text: '' })).toBe(false);
    expect(normalizeShortAnswer('Élève  Très')).toBe('eleve tres');
  });

  it('grades matching and gives partial credit for statistics', () => {
    expect(gradeAnswer(matching, { type: 'matching', matches: [0, 1, 2] })).toBe(true);
    expect(gradeAnswer(matching, { type: 'matching', matches: [1, 0, 2] })).toBe(false);
    expect(partialCredit(matching, { type: 'matching', matches: [1, 0, 2] })).toBeCloseTo(1 / 3);
    expect(partialCredit(multiple, { type: 'multiple', choices: [0, 1] })).toBe(0);
    expect(partialCredit(multiple, { type: 'multiple', choices: [0] })).toBe(0.5);
  });

  it('knows when a question is answered', () => {
    expect(isAnswered(emptyAnswer(single))).toBe(false);
    expect(isAnswered(emptyAnswer(matching))).toBe(false);
    expect(isAnswered({ type: 'matching', matches: [0, 1, 2] })).toBe(true);
    expect(isAnswered({ type: 'short_answer', text: ' ' })).toBe(false);
  });

  it('scores a full quiz', () => {
    const qs = [single, multiple, tf, short, matching];
    const result = scoreQuiz(qs, [{ type: 'single', choice: 2 }, { type: 'multiple', choices: [0] }, { type: 'true_false', value: false }, { type: 'short_answer', text: 'x' }, { type: 'matching', matches: [0, 1, 2] }]);
    expect(result).toMatchObject({ total: 5, correct: 3, score: 60 });
    expect(scoreQuiz(qs, []).correct).toBe(0);
  });

  it('picks questions deterministically per seed and filters by difficulty', () => {
    const pool = Array.from({ length: 40 }, (_, i) => ({ ...single, id: `q${i}`, difficulty: ((i % 3) + 1) as 1 | 2 | 3 }));
    const a = pickQuestions(pool, { count: 10, seed: 42 });
    expect(a).toHaveLength(10);
    expect(pickQuestions(pool, { count: 10, seed: 42 }).map((q) => q.id)).toEqual(a.map((q) => q.id));
    expect(new Set(a.map((q) => q.id)).size).toBe(10);
    expect(pickQuestions(pool, { count: 50, seed: 1, difficulty: 3 }).every((q) => q.difficulty === 3)).toBe(true);
    expect(optionOrder(4, 7).sort()).toEqual([0, 1, 2, 3]);
  });

  it('computes the exam countdown from timestamps (robust to backgrounding)', () => {
    expect(remainingSeconds(0, null, 5_000)).toBeNull();
    expect(remainingSeconds(0, 600, 0)).toBe(600);
    expect(remainingSeconds(0, 600, 599_100)).toBe(1);
    // App was in the background for 20 minutes: time is up, never negative.
    expect(remainingSeconds(0, 600, 1_200_000)).toBe(0);
  });

  it('aggregates quiz statistics', () => {
    expect(quizStats([]).attempts).toBe(0);
    const s = quizStats([
      { bankId: 'math', score: 80, correct: 8, total: 10, mode: 'practice', day: '2026-11-10' },
      { bankId: 'math', score: 40, correct: 2, total: 5, mode: 'exam', day: '2026-11-11' },
    ]);
    expect(s).toEqual({ attempts: 2, average: 60, best: 80, questions: 15, accuracy: 10 / 15 });
  });
});
