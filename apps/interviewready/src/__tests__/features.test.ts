import { createTestDatabase } from '@factory/testing';

import { allQuestionCores, allQuestions } from '@/content';
import { initDatabase, repos, setRepositories } from '@/database';
import { dailyTarget } from '@/features/progress/plan';
import { preparationProgress, streak } from '@/features/progress/summary';
import { dailyQuestionId } from '@/features/questions/daily';
import { canReadAnswer, matchesRole, normalize, searchQuestions } from '@/features/questions/search';
import { clock } from '@/services/clock';
import { finishQuiz, saveNote, setStudied, toggleFavorite } from '@/services/library';
import { FREE_LIMITS } from '@/constants/limits';

const en = allQuestions('en');
const fr = allQuestions('fr');
const cores = allQuestionCores();

describe('search and filters', () => {
  it('normalises case and accents', () => {
    expect(normalize('Négociation SALARIALE')).toBe('negociation salariale');
  });

  it('finds questions by words in the question first', () => {
    const results = searchQuestions(en, { query: 'salary expectations' });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]!.question.toLowerCase()).toContain('salary');
  });

  it('searches translated content ignoring accents', () => {
    const results = searchQuestions(fr, { query: 'negociation' });
    expect(results.length).toBeGreaterThan(0);
  });

  it('requires every search term to match', () => {
    expect(searchQuestions(en, { query: 'kubernetes zzzunknownword' })).toEqual([]);
  });

  it('filters by category, topic, difficulty, role, ids and free access', () => {
    const java = searchQuestions(en, { categories: ['java'], difficulties: ['advanced'] });
    expect(java.length).toBeGreaterThan(0);
    expect(java.every((q) => q.category === 'java' && q.difficulty === 'advanced')).toBe(true);
    expect(searchQuestions(en, { topics: ['rag'] }).every((q) => q.topic === 'rag')).toBe(true);
    const hr = searchQuestions(en, { jobRole: 'hr-specialist' });
    expect(hr.some((q) => q.category === 'java')).toBe(false);
    expect(hr.some((q) => q.category === 'general')).toBe(true);
    expect(searchQuestions(en, { ids: new Set(['gen-001', 'beh-001']) }).map((q) => q.id).sort()).toEqual(['beh-001', 'gen-001']);
    expect(searchQuestions(en, { freeOnly: true }).every((q) => !q.premium)).toBe(true);
  });

  it('treats questions without role tags as relevant for every role', () => {
    expect(matchesRole({ jobRoles: [] }, 'finance-analyst')).toBe(true);
    expect(matchesRole({ jobRoles: ['backend-developer'] }, 'finance-analyst')).toBe(false);
  });

  it('locks Premium answers for free users only', () => {
    expect(canReadAnswer({ premium: true }, false)).toBe(false);
    expect(canReadAnswer({ premium: true }, true)).toBe(true);
    expect(canReadAnswer({ premium: false }, false)).toBe(true);
  });
});

describe('question of the day', () => {
  it('is deterministic for a given date and role', () => {
    expect(dailyQuestionId('2026-11-14', cores, 'backend-developer')).toBe(dailyQuestionId('2026-11-14', cores, 'backend-developer'));
  });

  it('changes from one day to the next and does not depend on pack order', () => {
    const ids = new Set(['2026-11-14', '2026-11-15', '2026-11-16', '2026-11-17'].map((d) => dailyQuestionId(d, cores, null)));
    expect(ids.size).toBeGreaterThan(1);
    expect(dailyQuestionId('2026-11-14', [...cores].reverse(), null)).toBe(dailyQuestionId('2026-11-14', cores, null));
  });

  it('only picks free questions relevant to the role', () => {
    for (let d = 1; d <= 28; d++) {
      const day = `2026-12-${String(d).padStart(2, '0')}`;
      const core = cores.find((q) => q.id === dailyQuestionId(day, cores, 'marketing-specialist'))!;
      expect(core.premium).toBe(false);
      expect(matchesRole(core, 'marketing-specialist')).toBe(true);
    }
  });

  it('handles an empty pool', () => {
    expect(dailyQuestionId('2026-11-14', [], null)).toBeNull();
  });
});

describe('progress', () => {
  it('computes preparation progress for a role and per category', () => {
    const p = preparationProgress(cores, new Set(['gen-001', 'java-001', 'job-055']), 'backend-developer');
    expect(p.studied).toBe(2); // job-055 is an HR-specialist question
    expect(p.total).toBe(cores.filter((q) => matchesRole(q, 'backend-developer')).length);
    expect(p.byCategory.find((c) => c.category === 'java')?.studied).toBe(1);
  });

  it('computes streaks from active days', () => {
    expect(streak(['2026-11-12', '2026-11-13', '2026-11-14'], '2026-11-14').current).toBe(3);
    expect(streak([], '2026-11-14').current).toBe(0);
  });

  it('bounds the daily study target', () => {
    expect(dailyTarget(200, 14)).toBe(15);
    expect(dailyTarget(20, 30)).toBe(3);
    expect(dailyTarget(100, null)).toBe(5);
  });
});

describe('library actions', () => {
  beforeEach(async () => {
    clock.set(() => new Date('2026-11-14T10:00:00'));
    setRepositories(await initDatabase(await createTestDatabase()));
  });
  afterEach(() => clock.set(null));

  it('enforces the free favorites limit but not for Premium', async () => {
    const ids = cores.slice(0, FREE_LIMITS.favorites + 1).map((q) => q.id);
    for (const id of ids.slice(0, FREE_LIMITS.favorites)) expect(await toggleFavorite(id, false)).toBe('added');
    expect(await toggleFavorite(ids[FREE_LIMITS.favorites]!, false)).toBe('limit-reached');
    expect(await toggleFavorite(ids[FREE_LIMITS.favorites]!, true)).toBe('added');
    expect(await toggleFavorite(ids[0]!, false)).toBe('removed');
  });

  it('counts a studied question once in daily activity and logs the daily question', async () => {
    await repos().library.logDaily('2026-11-14', 'gen-001');
    await setStudied('gen-001', true, true);
    await setStudied('gen-001', true, true);
    const [day] = await repos().activity.range('2026-11-14', '2026-11-14');
    expect(day?.questionsStudied).toBe(1);
    expect((await repos().library.dailyHistory())[0]?.studied).toBe(true);
  });

  it('saves notes and finishes quizzes with spaced repetition', async () => {
    await saveNote('gen-002', 'My example: the CRM migration.');
    expect(await repos().library.getNote('gen-002')).toBe('My example: the CRM migration.');
    const score = await finishQuiz({
      mode: 'quiz',
      category: null,
      startedAt: '2026-11-14T09:55:00.000Z',
      answers: [
        { itemId: 'q-sw-001', chosenIndex: 1, correct: true },
        { itemId: 'q-sw-002', chosenIndex: 0, correct: false },
      ],
    });
    expect(score).toEqual({ correct: 1, total: 2, percent: 50 });
    expect(await repos().review.dueCount('quiz', '2026-11-15')).toBeGreaterThanOrEqual(1);
  });
});
