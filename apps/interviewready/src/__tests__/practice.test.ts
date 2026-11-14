import { createTestDatabase } from '@factory/testing';

import { allQuestionCores, allQuestions } from '@/content';
import { initDatabase, repos, setRepositories } from '@/database';
import { checkAnswer, composeAnswer, missingSections, speakingSeconds, STRUCTURE_SECTIONS, wordCount } from '@/features/answer-builder/templates';
import { buildDeck, summarizeAnswer, toFlashcard } from '@/features/flashcards/deck';
import { currentDayIndex, generatePlan, planProgress } from '@/features/learning-path/plan';
import { averageRating, QUESTIONS_PER_DURATION, secondsPerQuestion, selectMockQuestions, summarizeMock } from '@/features/mock-interview/session';
import { nextCard } from '@/features/quizzes/engine';
import { matchesRole } from '@/features/questions/search';
import { formatTimer } from '@/components/practice';
import { clock } from '@/services/clock';
import { createLearningPath, finishMockInterview, gradeFlashcard, remainingFreeMocks, saveBuilderAnswer, startMockInterview } from '@/services/practice';
import { usePreferences } from '@/store/preferences';

const cores = allQuestionCores();
const en = allQuestions('en');

describe('mock interview selection', () => {
  it('selects the right number of unique questions for each duration', () => {
    for (const minutes of [5, 10, 20] as const) {
      const ids = selectMockQuestions({ cores, role: 'backend-developer', level: 'intermediate', minutes, includePremium: false, seed: 7 });
      expect(ids).toHaveLength(QUESTIONS_PER_DURATION[minutes]);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('opens with an introduction question and respects role and premium access', () => {
    const ids = selectMockQuestions({ cores, role: 'finance-analyst', level: 'beginner', minutes: 20, includePremium: false, seed: 42 });
    const picked = ids.map((id) => cores.find((c) => c.id === id)!);
    expect(picked[0]!.topic).toBe('introduction');
    expect(picked.every((q) => !q.premium && matchesRole(q, 'finance-analyst'))).toBe(true);
    expect(picked.some((q) => q.category === 'job-specific')).toBe(true);
  });

  it('is deterministic for a seed and varies across seeds', () => {
    const a = selectMockQuestions({ cores, role: null, level: 'intermediate', minutes: 10, includePremium: true, seed: 1 });
    expect(selectMockQuestions({ cores, role: null, level: 'intermediate', minutes: 10, includePremium: true, seed: 1 })).toEqual(a);
    expect(selectMockQuestions({ cores, role: null, level: 'intermediate', minutes: 10, includePremium: true, seed: 999 })).not.toEqual(a);
  });

  it('computes the timer budget and formats it', () => {
    expect(secondsPerQuestion(10)).toBe(120);
    expect(formatTimer(75)).toBe('1:15');
    expect(formatTimer(-5)).toBe('-0:05');
  });

  it('summarises a session from the self-assessment grid', () => {
    expect(averageRating({ structure: 4, clarity: 2 })).toBe(3);
    expect(averageRating({})).toBeNull();
    expect(averageRating({ structure: 9 })).toBeNull();
    const s = summarizeMock([
      { questionId: 'a', answer: 'I led the migration.', skipped: false, rating: { structure: 4, examples: 2, clarity: 4 } },
      { questionId: 'b', answer: '', skipped: true, rating: null },
      { questionId: 'c', answer: 'Some answer', skipped: false, rating: { structure: 5, examples: 3 } },
    ]);
    expect(s).toEqual({ total: 3, answered: 2, skipped: 1, averageScore: 3.7, weakest: 'examples' });
  });
});

describe('answer builder', () => {
  const star = {
    situation: 'Our checkout API was slow during sales.',
    task: 'I had to cut response time before Black Friday.',
    action: 'I profiled the service, added a cache and fixed two slow queries with the team.',
    result: 'Response time dropped by 40% and conversion rose 3%.',
  };

  it('composes sections in template order and skips empty ones', () => {
    expect(composeAnswer('star', { result: 'R', situation: 'S' })).toBe('S\n\nR');
    expect(missingSections('star', { situation: 'S' })).toEqual(['task', 'action', 'result']);
    expect(STRUCTURE_SECTIONS['present-past-future']).toEqual(['present', 'past', 'future']);
  });

  it('counts words and estimates speaking time', () => {
    expect(wordCount('  one two\nthree ')).toBe(3);
    expect(speakingSeconds(Array(130).fill('word').join(' '))).toBe(60);
  });

  it('runs transparent writing checks', () => {
    const checks = Object.fromEntries(checkAnswer('star', star).map((c) => [c.key, c.ok]));
    expect(checks.complete).toBe(true);
    expect(checks['result-measurable']).toBe(true);
    expect(checks['first-person']).toBe(true);
    const weak = Object.fromEntries(checkAnswer('star', { ...star, result: 'It went well.', action: 'We fixed it.' }).map((c) => [c.key, c.ok]));
    expect(weak['result-measurable']).toBe(false);
    expect(weak['first-person']).toBe(false);
    expect(checkAnswer('technical', { definition: 'x' }).map((c) => c.key)).toEqual(['complete', 'length']);
  });
});

describe('flashcards', () => {
  it('summarises long answers by whole sentences', () => {
    const text = 'First sentence is here. Second one follows! Third one is long enough to exceed the limit?';
    expect(summarizeAnswer(text, 50)).toBe('First sentence is here. Second one follows!');
    expect(toFlashcard(en[0]!).front).toBe(en[0]!.question);
  });

  it('puts due cards first, then new ones, and respects premium and category', () => {
    const javaFree = en.filter((q) => q.category === 'java' && !q.premium);
    const cards = new Map([[javaFree[3]!.id, nextCard(undefined, 0, '2026-11-01')]]);
    const deck = buildDeck({ questions: en, cards, today: '2026-11-14', category: 'java', includePremium: false, size: 5, seed: 3 });
    expect(deck[0]!.id).toBe(javaFree[3]!.id);
    expect(deck).toHaveLength(5);
    expect(deck.every((q) => q.category === 'java' && !q.premium)).toBe(true);
  });
});

describe('learning path', () => {
  it('builds a plan with study, quizzes, reviews and weekly mock interviews', () => {
    const plan = generatePlan({ cores, role: 'backend-developer', level: 'intermediate', length: 14, includePremium: false });
    expect(plan.days).toHaveLength(14);
    const kinds = plan.days.flatMap((d) => d.tasks.map((t) => t.kind));
    expect(kinds.filter((k) => k === 'mock')).toHaveLength(2);
    expect(kinds).toContain('review');
    expect(kinds).toContain('quiz');
    const studied = plan.days.flatMap((d) => d.tasks.flatMap((t) => (t.kind === 'study' ? t.questionIds : [])));
    expect(new Set(studied).size).toBe(studied.length);
    for (const id of studied) {
      const core = cores.find((c) => c.id === id)!;
      expect(core.premium).toBe(false);
      expect(matchesRole(core, 'backend-developer')).toBe(true);
    }
  });

  it('starts with questions at or below the chosen level', () => {
    const plan = generatePlan({ cores, role: 'project-manager', level: 'beginner', length: 7, includePremium: true });
    const first = plan.days[0]!.tasks.find((t) => t.kind === 'study');
    expect(first && first.kind === 'study' && first.questionIds.every((id) => cores.find((c) => c.id === id)!.difficulty === 'beginner')).toBe(true);
  });

  it('tracks the current day and progress', () => {
    expect(currentDayIndex('2026-11-10', '2026-11-14', 14)).toBe(4);
    expect(currentDayIndex('2026-11-10', '2026-12-30', 14)).toBe(13);
    expect(currentDayIndex('2026-11-10', '2026-11-01', 14)).toBe(0);
    const plan = generatePlan({ cores, role: null, level: 'beginner', length: 7, includePremium: false });
    const first = plan.days[0]!.tasks[0]!.id;
    expect(planProgress(plan, new Set([first])).done).toBe(1);
  });
});

describe('practice services and persistence', () => {
  beforeEach(async () => {
    clock.set(() => new Date('2026-11-14T10:00:00'));
    usePreferences.setState({ bonusMocks: null });
    setRepositories(await initDatabase(await createTestDatabase()));
  });
  afterEach(() => clock.set(null));

  it('limits free mock interviews per day and stores a full session', async () => {
    expect(await remainingFreeMocks()).toBe(1);
    const started = await startMockInterview({ role: 'it-support', level: 'beginner', minutes: 5, timerEnabled: true, isPremium: false });
    expect(started.status).toBe('started');
    expect(await remainingFreeMocks()).toBe(0);
    expect((await startMockInterview({ role: null, level: 'beginner', minutes: 5, timerEnabled: false, isPremium: false })).status).toBe('limit-reached');
    expect((await startMockInterview({ role: null, level: 'beginner', minutes: 5, timerEnabled: false, isPremium: true })).status).toBe('started');

    if (started.status !== 'started') throw new Error('not started');
    const summary = await finishMockInterview(
      started.sessionId,
      started.questionIds.map((questionId, i) => ({ questionId, answer: i === 0 ? '' : 'My answer', notes: 'n', skipped: i === 0, secondsSpent: 30, rating: i === 0 ? null : { structure: 4, clarity: 3 } })),
      'it-support',
    );
    expect(summary.answered).toBe(started.questionIds.length - 1);
    const finished = (await repos().practice.listMocks()).find((m) => m.id === started.sessionId);
    expect(finished?.completedAt).not.toBeNull();
    const stored = await repos().practice.getMockAnswers(started.sessionId);
    expect(stored[1]).toMatchObject({ answer: 'My answer', rating: { structure: 4, clarity: 3 } });
  });

  it('honours bonus mock sessions for the current day only', async () => {
    usePreferences.setState({ bonusMocks: { day: '2026-11-14', count: 2 } });
    expect(await remainingFreeMocks()).toBe(3);
    usePreferences.setState({ bonusMocks: { day: '2026-11-13', count: 2 } });
    expect(await remainingFreeMocks()).toBe(1);
  });

  it('saves, updates and deletes builder answers', async () => {
    const id = await saveBuilderAnswer({ questionId: 'beh-001', title: 'Leading without authority', structure: 'star', fields: { situation: 'S' }, jobRole: null, level: 'beginner', skill: 'leadership', status: 'draft' });
    await saveBuilderAnswer({ id, questionId: 'beh-001', title: 'Leading without authority', structure: 'star', fields: { situation: 'S2', action: 'A' }, jobRole: null, level: 'beginner', skill: 'leadership', status: 'final' });
    const [saved] = await repos().practice.listAnswers();
    expect(saved).toMatchObject({ id, status: 'final', fields: { situation: 'S2', action: 'A' } });
    const [day] = await repos().activity.range('2026-11-14', '2026-11-14');
    expect(day?.answersSaved).toBe(1);
    await repos().practice.deleteAnswer(id);
    expect(await repos().practice.listAnswers()).toEqual([]);
  });

  it('grades flashcards into spaced repetition', async () => {
    await gradeFlashcard('gen-001', 0);
    const cards = await repos().review.getCards('question', ['gen-001']);
    expect(cards.get('gen-001')?.dueDay).toBe('2026-11-15');
  });

  it('creates a path, archives the previous one and tracks tasks', async () => {
    const first = await createLearningPath({ role: 'data-scientist', level: 'intermediate', goal: 'new-job', length: 7, isPremium: false });
    const second = await createLearningPath({ role: 'data-scientist', level: 'intermediate', goal: 'new-job', length: 14, isPremium: false });
    expect(second).not.toBe(first);
    const active = await repos().practice.activePath();
    expect(active?.id).toBe(second);
    expect(active?.plan.days).toHaveLength(14);
    const task = active!.plan.days[0]!.tasks[0]!;
    await repos().practice.setTaskDone(second, 0, task.id, true);
    await repos().practice.setTaskDone(second, 0, task.id, true);
    expect(await repos().practice.completedTasks(second)).toEqual(new Set([task.id]));
    await repos().practice.setTaskDone(second, 0, task.id, false);
    expect((await repos().practice.completedTasks(second)).size).toBe(0);
  });
});
