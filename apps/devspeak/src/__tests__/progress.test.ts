import { createTestDatabase } from '@factory/testing';

import { initDatabase, type Repositories } from '@/database';
import { deleteAllUserData, exportUserData, importUserData } from '@/services/backupService';

const at = (iso: string) => new Date(iso);

async function setup(): Promise<Repositories> {
  return initDatabase(await createTestDatabase());
}

describe('progress repository', () => {
  it('awards lesson XP only once (no duplicate progress)', async () => {
    const r = await setup();
    const first = await r.progress.completeLesson('wp-01', 67, at('2026-04-01T09:00:00'));
    const again = await r.progress.completeLesson('wp-01', 67, at('2026-04-01T09:10:00'));
    expect(first).toMatchObject({ firstCompletion: true, xpEarned: 50 });
    expect(again).toMatchObject({ firstCompletion: false, xpEarned: 0 });
    const stats = await r.progress.getStats(at('2026-04-01T10:00:00'));
    expect(stats.lessonsCompleted).toBe(1);
    expect(stats.totalXp).toBe(50);
    const rows = await r.db.getAllAsync("SELECT * FROM learning_progress WHERE item_id = 'wp-01'", []);
    expect(rows).toHaveLength(1);
  });

  it('keeps the best score and grants the perfect bonus once', async () => {
    const r = await setup();
    await r.progress.completeLesson('wp-02', 33, at('2026-04-01T09:00:00'));
    const perfect = await r.progress.completeLesson('wp-02', 100, at('2026-04-01T09:05:00'));
    const perfectAgain = await r.progress.completeLesson('wp-02', 100, at('2026-04-01T09:06:00'));
    const worse = await r.progress.completeLesson('wp-02', 0, at('2026-04-01T09:07:00'));
    expect(perfect.xpEarned).toBe(20);
    expect(perfectAgain.xpEarned).toBe(0);
    expect(worse.bestScore).toBe(100);
  });

  it('computes streaks from real activity across days', async () => {
    const r = await setup();
    await r.progress.completeLesson('wp-01', 100, at('2026-04-01T20:00:00'));
    await r.progress.completeLesson('wp-02', 100, at('2026-04-02T08:00:00'));
    await r.progress.completeLesson('wp-03', 100, at('2026-04-03T23:30:00'));
    expect((await r.progress.getStats(at('2026-04-03T23:59:00'))).currentStreak).toBe(3);
    expect((await r.progress.getStats(at('2026-04-04T12:00:00'))).currentStreak).toBe(3); // still alive
    const broken = await r.progress.getStats(at('2026-04-05T12:00:00'));
    expect(broken.currentStreak).toBe(0);
    expect(broken.longestStreak).toBe(3);
  });

  it('allows one daily challenge completion per local day', async () => {
    const r = await setup();
    const a = await r.progress.completeDailyChallenge('dc-01', at('2026-04-01T10:00:00'));
    const b = await r.progress.completeDailyChallenge('dc-01', at('2026-04-01T18:00:00'));
    const c = await r.progress.completeDailyChallenge('dc-02', at('2026-04-02T10:00:00'));
    expect([a.xpEarned, b.xpEarned, c.xpEarned]).toEqual([30, 0, 30]);
    expect(b.alreadyDone).toBe(true);
    expect(await r.progress.isDailyChallengeDone(at('2026-04-02T23:00:00'))).toBe(true);
  });

  it('unlocks achievements exactly once', async () => {
    const r = await setup();
    const res = await r.progress.completeLesson('wp-01', 100, at('2026-04-01T10:00:00'));
    expect(res.newAchievements).toEqual(expect.arrayContaining(['first_lesson', 'perfect_quiz']));
    const again = await r.progress.completeLesson('wp-02', 100, at('2026-04-01T10:05:00'));
    expect(again.newAchievements).not.toContain('first_lesson');
    expect((await r.progress.achievements()).filter((a) => a.id === 'first_lesson')).toHaveLength(1);
  });

  it('runs spaced repetition and queues due cards first', async () => {
    const r = await setup();
    const day1 = at('2026-04-01T10:00:00');
    await r.progress.reviewFlashcard('v-001', 2, day1);
    await r.progress.reviewFlashcard('v-002', 3, day1);
    const queue = await r.progress.flashcardQueue(['v-001', 'v-002', 'v-003'], at('2026-04-02T10:00:00'));
    expect(queue).toEqual(['v-001', 'v-003']); // v-001 due tomorrow, v-002 in 3 days, v-003 new
    const stats = await r.progress.getStats(at('2026-04-02T10:00:00'));
    expect(stats.cardsReviewed).toBe(2);
  });

  it('toggles favorites idempotently', async () => {
    const r = await setup();
    expect(await r.progress.toggleFavorite('v-010', at('2026-04-01'))).toBe(true);
    expect(await r.progress.toggleFavorite('v-010', at('2026-04-01'))).toBe(false);
    expect((await r.progress.favoriteIds()).size).toBe(0);
  });

  it('searches vocabulary by term, definition and translation, safely', async () => {
    const r = await setup();
    const all = await r.content.searchVocabulary({});
    expect(all).toHaveLength(100);
    const first = all[0]!;
    const hits = await r.content.searchVocabulary({ query: first.term.slice(0, 4) });
    expect(hits.map((h) => h.id)).toContain(first.id);
    expect(await r.content.searchVocabulary({ query: '%' })).toHaveLength(0);
    expect(await r.content.searchVocabulary({ query: "'; DROP TABLE vocabulary; --" })).toHaveLength(0);
    expect((await r.content.searchVocabulary({ category: 'devops' })).every((w) => w.category === 'devops')).toBe(true);
  });

  it('persists and validates the learning profile', async () => {
    const r = await setup();
    expect(await r.profile.get()).toBeNull();
    await r.profile.save({ englishLevel: 'advanced', role: 'devops', objectives: ['interviews'], dailyMinutes: 15, displayName: 'Sam' }, at('2026-04-01'));
    expect(await r.profile.get()).toMatchObject({ englishLevel: 'advanced', role: 'devops', dailyMinutes: 15 });
    await expect(r.profile.save({ englishLevel: 'advanced', role: 'devops', objectives: [], dailyMinutes: 15 }, at('2026-04-01'))).rejects.toThrow();
  });
});

describe('backup, restore and deletion', () => {
  it('exports, wipes and restores user progress without data loss', async () => {
    const r = await setup();
    await r.profile.save({ englishLevel: 'beginner', role: 'qa', objectives: ['meetings'], dailyMinutes: 5 }, at('2026-04-01'));
    await r.progress.completeLesson('wp-01', 100, at('2026-04-01T10:00:00'));
    await r.progress.toggleFavorite('v-005', at('2026-04-01T10:00:00'));
    const before = await r.progress.getStats(at('2026-04-01T11:00:00'));
    const { json } = await exportUserData(r.db, at('2026-04-01T11:00:00'));

    await deleteAllUserData(r.db);
    expect(await r.profile.get()).toBeNull();
    expect((await r.progress.getStats(at('2026-04-01T11:00:00'))).lessonsCompleted).toBe(0);
    expect((await r.content.countContent()).lessons).toBeGreaterThan(0); // content untouched

    await importUserData(r.db, json);
    expect(await r.progress.getStats(at('2026-04-01T11:00:00'))).toEqual(before);
    expect(await r.profile.get()).toMatchObject({ role: 'qa' });
  });
});
