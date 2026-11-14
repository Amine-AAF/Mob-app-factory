import { createTestDatabase } from '@factory/testing';

import { initDatabase, type Repositories } from '@/database';
import { SCHEMA_VERSION, USER_TABLES } from '@/database/migrations';
import { NOTE_MAX_LENGTH } from '@/database/repositories/libraryRepository';
import { deleteAllUserData } from '@/services/backup';
import { clock } from '@/services/clock';

let db: Awaited<ReturnType<typeof createTestDatabase>>;
let repos: Repositories;

beforeEach(async () => {
  clock.set(() => new Date('2026-11-13T09:00:00'));
  db = await createTestDatabase();
  repos = await initDatabase(db);
});

afterEach(() => {
  clock.set(null);
  db.close();
});

describe('database', () => {
  it('migrates to the latest schema and is idempotent', async () => {
    const v = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version', []);
    expect(v?.user_version).toBe(SCHEMA_VERSION);
    await expect(initDatabase(db)).resolves.toBeDefined();
    for (const table of USER_TABLES) {
      await expect(db.getAllAsync(`SELECT * FROM ${table}`, [])).resolves.toEqual([]);
    }
  });

  it('saves and updates the profile', async () => {
    expect(await repos.profile.get()).toBeNull();
    await repos.profile.save({ jobRole: 'backend-developer', level: 'intermediate', goal: 'new-job', daysAvailable: 14 });
    await repos.profile.save({ jobRole: null, level: 'beginner', goal: 'practice', daysAvailable: null });
    expect(await repos.profile.get()).toEqual({ jobRole: null, level: 'beginner', goal: 'practice', daysAvailable: null });
  });

  it('toggles favorites without duplicates', async () => {
    await repos.library.setFavorite('gen-001', true);
    await repos.library.setFavorite('gen-001', true);
    await repos.library.setFavorite('beh-003', true);
    expect(await repos.library.favoriteCount()).toBe(2);
    expect(await repos.library.isFavorite('gen-001')).toBe(true);
    await repos.library.setFavorite('gen-001', false);
    expect(await repos.library.favoriteIds()).toEqual(['beh-003']);
  });

  it('saves notes, deletes empty ones and truncates overlong input', async () => {
    await repos.library.saveNote('gen-001', 'Mention the payment migration.');
    expect(await repos.library.getNote('gen-001')).toBe('Mention the payment migration.');
    await repos.library.saveNote('gen-001', '   ');
    expect(await repos.library.getNote('gen-001')).toBe('');
    await repos.library.saveNote('gen-002', 'x'.repeat(NOTE_MAX_LENGTH + 50));
    expect((await repos.library.getNote('gen-002')).length).toBe(NOTE_MAX_LENGTH);
  });

  it('stores user text safely (quotes and SQL-like input are data, not code)', async () => {
    const tricky = "It's fine'); DROP TABLE notes; --";
    await repos.library.saveNote('gen-003', tricky);
    expect(await repos.library.getNote('gen-003')).toBe(tricky);
    expect(await repos.library.notedIds()).toEqual(['gen-003']);
  });

  it('tracks views and studied state; markStudied reports only the first time', async () => {
    await repos.library.recordView('sw-001');
    await repos.library.recordView('sw-001');
    expect(await repos.library.markStudied('sw-001')).toBe(true);
    expect(await repos.library.markStudied('sw-001')).toBe(false);
    expect(await repos.library.markStudied('db-004')).toBe(true);
    const history = await repos.library.recentHistory();
    expect(history.find((h) => h.questionId === 'sw-001')?.viewCount).toBe(2);
    expect(await repos.library.studiedIds()).toEqual(new Set(['sw-001', 'db-004']));
    await repos.library.markStudied('sw-001', false);
    expect((await repos.library.studiedIds()).has('sw-001')).toBe(false);
  });

  it('logs the question of the day once per day', async () => {
    await repos.library.logDaily('2026-11-13', 'gen-001');
    await repos.library.logDaily('2026-11-13', 'gen-999');
    await repos.library.markDailyStudied('2026-11-13');
    expect(await repos.library.dailyHistory()).toEqual([{ day: '2026-11-13', questionId: 'gen-001', studied: true }]);
  });

  it('aggregates daily activity counters', async () => {
    await repos.activity.increment('questions_studied');
    await repos.activity.increment('questions_studied', 2);
    await repos.activity.increment('quizzes_completed');
    const [day] = await repos.activity.range('2026-11-01', '2026-11-30');
    expect(day).toMatchObject({ day: '2026-11-13', questionsStudied: 3, quizzesCompleted: 1, mocksCompleted: 0 });
    expect(await repos.activity.activeDays()).toEqual(['2026-11-13']);
  });

  it('keeps data when the database is opened again (app restart)', async () => {
    await repos.library.setFavorite('gen-010', true);
    const reopened = await initDatabase(db);
    expect(await reopened.library.favoriteIds()).toEqual(['gen-010']);
  });

  it('erases every user table', async () => {
    await repos.profile.save({ jobRole: 'it-support', level: 'beginner', goal: 'first-job', daysAvailable: 7 });
    await repos.library.setFavorite('gen-001', true);
    await repos.library.saveNote('gen-001', 'note');
    await repos.activity.increment('answers_saved');
    await deleteAllUserData(db);
    for (const table of USER_TABLES) {
      expect(await db.getAllAsync(`SELECT * FROM ${table}`, [])).toEqual([]);
    }
  });
});
