import { BackupError } from '@factory/storage';
import { createTestDatabase } from '@factory/testing';

import { quizPacks } from '@/content';
import { initDatabase, repos, setRepositories } from '@/database';
import { SCHEMA_VERSION, USER_TABLES } from '@/database/migrations';
import { activitySeries, categoryAccuracy, mockImprovement, mockTrend } from '@/features/progress/stats';
import { deleteAllUserData, exportUserData, formatAnswersExport, importUserData } from '@/services/backup';
import { clock } from '@/services/clock';
import { createLearningPath, finishMockInterview, saveBuilderAnswer, startMockInterview } from '@/services/practice';
import { finishQuiz, saveNote, setStudied, toggleFavorite } from '@/services/library';

async function seedUserData() {
  await repos().profile.save({ jobRole: 'backend-developer', level: 'intermediate', goal: 'new-job', daysAvailable: 14 });
  await toggleFavorite('gen-001', true);
  await saveNote('gen-001', "Mention the payments migration — it's my best story.");
  await setStudied('beh-001', true);
  await finishQuiz({ mode: 'quiz', category: 'java', startedAt: '2026-11-14T09:00:00.000Z', answers: [{ itemId: 'q-java-001', chosenIndex: 2, correct: true }] });
  await saveBuilderAnswer({ questionId: 'beh-001', title: 'Leading without authority', structure: 'star', fields: { situation: 'S', action: 'I coordinated' }, jobRole: null, level: 'beginner', skill: 'leadership', status: 'draft' });
  const mock = await startMockInterview({ role: 'backend-developer', level: 'intermediate', minutes: 5, timerEnabled: false, isPremium: true });
  if (mock.status !== 'started') throw new Error('mock not started');
  await finishMockInterview(
    mock.sessionId,
    mock.questionIds.map((questionId) => ({ questionId, answer: 'My answer', notes: '', skipped: false, secondsSpent: 60, rating: { structure: 4 } })),
    'backend-developer',
  );
  const pathId = await createLearningPath({ role: 'backend-developer', level: 'intermediate', goal: 'new-job', length: 7, isPremium: false });
  const path = await repos().practice.activePath();
  await repos().practice.setTaskDone(pathId, 0, path!.plan.days[0]!.tasks[0]!.id, true);
  await repos().library.logDaily('2026-11-14', 'gen-001');
  return mock.sessionId;
}

async function counts(): Promise<Record<string, number>> {
  const out: Record<string, number> = {};
  for (const t of USER_TABLES) out[t] = (await repos().db.getFirstAsync<{ n: number }>(`SELECT COUNT(*) AS n FROM ${t}`, []))?.n ?? 0;
  return out;
}

describe('backup, restore and deletion', () => {
  beforeEach(async () => {
    clock.set(() => new Date('2026-11-14T10:00:00'));
    setRepositories(await initDatabase(await createTestDatabase()));
  });
  afterEach(() => clock.set(null));

  it('round-trips every user table, including child rows and special characters', async () => {
    const sessionId = await seedUserData();
    const before = await counts();
    expect(Object.values(before).every((n) => n > 0)).toBe(true);

    const { json, fileName, backup } = await exportUserData(repos().db, new Date('2026-11-14T10:00:00Z'));
    expect(fileName).toBe('interviewready-backup-2026-11-14.json');
    expect(backup.appId).toBe('interviewready');
    expect(backup.schemaVersion).toBe(SCHEMA_VERSION);

    await deleteAllUserData(repos().db);
    expect(Object.values(await counts()).every((n) => n === 0)).toBe(true);

    const { restoredRows } = await importUserData(repos().db, json);
    expect(restoredRows).toBe(Object.values(before).reduce((a, b) => a + b, 0));
    expect(await counts()).toEqual(before);
    expect(await repos().library.getNote('gen-001')).toBe("Mention the payments migration — it's my best story.");
    expect((await repos().practice.getMockAnswers(sessionId)).every((a) => a.answer === 'My answer')).toBe(true);
    expect((await repos().practice.activePath())?.plan.days).toHaveLength(7);
  });

  it('rejects invalid files and backups from other apps', async () => {
    await expect(importUserData(repos().db, 'not json')).rejects.toEqual(new BackupError('invalid_json'));
    await expect(importUserData(repos().db, JSON.stringify({ hello: 'world' }))).rejects.toEqual(new BackupError('invalid_format'));
    const { backup } = await exportUserData(repos().db);
    await expect(importUserData(repos().db, JSON.stringify({ ...backup, appId: 'devspeak' }))).rejects.toEqual(new BackupError('wrong_app'));
  });

  it('refuses backups from a newer schema without touching current data', async () => {
    await toggleFavorite('gen-005', true);
    const { backup } = await exportUserData(repos().db);
    await expect(importUserData(repos().db, JSON.stringify({ ...backup, schemaVersion: SCHEMA_VERSION + 1 }))).rejects.toEqual(new BackupError('newer_schema'));
    expect(await repos().library.favoriteIds()).toEqual(['gen-005']);
  });

  it('ignores unknown columns from other versions when restoring', async () => {
    const { backup } = await exportUserData(repos().db);
    backup.tables.favorites = [{ question_id: 'gen-009', created_at: '2026-11-01T00:00:00.000Z', obsolete_column: 'x' }];
    await importUserData(repos().db, JSON.stringify(backup));
    expect(await repos().library.favoriteIds()).toEqual(['gen-009']);
  });
});

describe('answers export', () => {
  it('formats builder and mock answers as a readable document', () => {
    const text = formatAnswersExport(
      {
        answers: [{ id: 1, questionId: null, title: 'Why this company', structure: 'motivation', fields: { motivation: 'Your product.', skills: 'Data.' }, jobRole: null, level: null, skill: null, status: 'final', updatedAt: '' }],
        mocks: [
          {
            startedAt: '2026-11-14T09:00:00.000Z',
            answers: [
              { position: 0, questionId: 'gen-001', answer: 'I am a developer.', notes: 'Shorter', skipped: false, secondsSpent: 60, rating: null },
              { position: 1, questionId: 'gen-002', answer: '', notes: '', skipped: true, secondsSpent: 0, rating: null },
            ],
          },
          { startedAt: '2026-11-13T09:00:00.000Z', answers: [{ position: 0, questionId: 'gen-003', answer: '', notes: '', skipped: true, secondsSpent: 0, rating: null }] },
        ],
      },
      { title: 'My answers', builderSection: 'Builder', mockSection: 'Mocks', question: (id) => `Q ${id}`, skipped: '(skipped)', notes: 'Notes' },
    );
    expect(text).toContain('# My answers');
    expect(text).toContain('### Why this company\n\nYour product.\n\nData.');
    expect(text).toContain('**Q gen-001**\n\nI am a developer.');
    expect(text).toContain('_Notes: Shorter_');
    expect(text).toContain('(skipped)');
    // A session with no written answer at all is left out.
    expect(text).not.toContain('2026-11-13');
  });
});

describe('advanced statistics', () => {
  it('fills missing days in the activity series', () => {
    const series = activitySeries(
      [{ day: '2026-11-13', questionsStudied: 2, quizzesCompleted: 1, mocksCompleted: 0, cardsReviewed: 3, answersSaved: 0 }],
      '2026-11-14',
      3,
    );
    expect(series).toEqual([
      { day: '2026-11-12', total: 0 },
      { day: '2026-11-13', total: 6 },
      { day: '2026-11-14', total: 0 },
    ]);
  });

  it('ranks categories by quiz accuracy with a minimum sample', () => {
    const quizzes = quizPacks.flatMap((p) => p.core);
    const java = quizzes.filter((q) => q.category === 'java').slice(0, 2);
    const fe = quizzes.filter((q) => q.category === 'frontend').slice(0, 2);
    const db = quizzes.find((q) => q.category === 'databases')!;
    const stats = new Map([
      [java[0]!.id, { answered: 2, correct: 2 }],
      [java[1]!.id, { answered: 2, correct: 1 }],
      [fe[0]!.id, { answered: 3, correct: 1 }],
      [db.id, { answered: 1, correct: 0 }],
    ]);
    const ranked = categoryAccuracy(stats, quizzes);
    expect(ranked.map((r) => r.category)).toEqual(['frontend', 'java']);
    expect(ranked[1]!.accuracy).toBe(0.75);
  });

  it('computes the mock interview trend and improvement', () => {
    const points = mockTrend([
      { startedAt: '2026-11-03', completedAt: 'x', selfScore: 3 },
      { startedAt: '2026-11-01', completedAt: 'x', selfScore: 2 },
      { startedAt: '2026-11-05', completedAt: null, selfScore: null },
      { startedAt: '2026-11-07', completedAt: 'x', selfScore: 4 },
    ]);
    expect(points.map((p) => p.score)).toEqual([2, 3, 4]);
    expect(mockImprovement(points)).toBe(2);
    expect(mockImprovement(points.slice(0, 1))).toBeNull();
  });
});
