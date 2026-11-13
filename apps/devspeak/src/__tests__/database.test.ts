import { createTestDatabase } from '@factory/testing';

import { dailyChallenges, lessons, vocabulary } from '@/content';
import { initDatabase } from '@/database';
import { SCHEMA_VERSION } from '@/database/migrations';
import { seedContentIfNeeded } from '@/database/seed';

describe('SQLite database', () => {
  it('migrates and seeds all bundled content', async () => {
    const db = await createTestDatabase();
    const r = await initDatabase(db);
    const v = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version', []);
    expect(v?.user_version).toBe(SCHEMA_VERSION);
    expect(await r.content.countContent()).toEqual({ lessons: lessons.length, words: vocabulary.length, challenges: dailyChallenges.length });
  });

  it('is idempotent: re-running init does not duplicate content', async () => {
    const db = await createTestDatabase();
    await initDatabase(db);
    const r = await initDatabase(db);
    expect((await r.content.countContent()).lessons).toBe(lessons.length);
    expect(await seedContentIfNeeded(db)).toBe(false);
  });

  it('round-trips a full lesson with sections and quiz', async () => {
    const r = await initDatabase(await createTestDatabase());
    const source = lessons[0]!;
    const lesson = await r.content.getLesson(source.id);
    expect(lesson?.title).toBe(source.title);
    expect(lesson?.dialogue.lines).toHaveLength(source.dialogue.lines.length);
    expect(lesson?.vocabulary).toEqual(source.vocabulary);
    const quiz = await r.content.getQuiz('lesson', source.id);
    expect(quiz).toEqual(source.quiz);
  });

  it('re-seeding a new content version keeps user progress', async () => {
    const db = await createTestDatabase();
    const r = await initDatabase(db);
    await r.progress.completeLesson('wp-01', 100, new Date('2026-03-02T10:00:00'));
    expect(await seedContentIfNeeded(db, 999)).toBe(true);
    const stats = await r.progress.getStats(new Date('2026-03-02T12:00:00'));
    expect(stats.lessonsCompleted).toBe(1);
  });
});
