import { createTestDatabase } from '@factory/testing';

import { CHALLENGES } from '@/content';
import { createRepositories, initDatabase, type Repositories } from '@/database';
import { seedContentIfNeeded } from '@/database/contentRepository';
import { SCHEMA_VERSION } from '@/database/migrations';
import type { Challenge, QuestionResult } from '@/engine';
import { deleteAllUserData, exportUserData, importUserData } from '@/services/backupService';
import { clock } from '@/services/clock';
import { dailyFor, settleDaily } from '@/services/dailyService';
import { AccessError, beginGame, buildQueue, grantAdHint, hintBalance, refreshAchievements, settleQuestion, spendHint } from '@/services/gameService';
import { useSession } from '@/store/session';

const challenge = (id: string) => CHALLENGES.find((c) => c.id === id) as Challenge;
const result = (c: Challenge, over: Partial<QuestionResult> = {}): QuestionResult => ({ challengeId: c.id, correct: true, attempts: 1, hintUsed: false, revealed: false, timeMs: 4200, ...over });

async function fresh(): Promise<Repositories> {
  return initDatabase(await createTestDatabase());
}

beforeEach(() => {
  clock.set(() => new Date(2026, 10, 13, 12, 0, 0)); // 13 Nov 2026, local time
  useSession.setState({ pendingAchievements: [], dataVersion: 0 });
});
afterAll(() => clock.set(null));

describe('schema and seeding', () => {
  it('migrates and seeds the challenges table from the bundle', async () => {
    const r = await fresh();
    expect(await r.content.count()).toBe(CHALLENGES.length);
    const c = await r.content.get('ded-m-004');
    expect(c).toEqual(challenge('ded-m-004'));
    expect((await r.content.list('memory', 'hard')).length).toBe(20);
    const v = await r.db.getFirstAsync<{ user_version: number }>('PRAGMA user_version', []);
    expect(v?.user_version).toBe(SCHEMA_VERSION);
  });

  it('re-seeds content on a new content version without touching progress', async () => {
    const r = await fresh();
    const s = await beginGame({ mode: 'standard', category: 'sequence', difficulty: 'easy', timer: 0 }, r);
    await settleQuestion(s, challenge('seq-e-001'), result(challenge('seq-e-001')), r);
    expect(await seedContentIfNeeded(r.db, CHALLENGES.slice(0, 10), 999)).toBe(true);
    expect(await r.content.count()).toBe(10);
    expect(await r.progress.totalXp()).toBe(10);
    expect(await seedContentIfNeeded(r.db, CHALLENGES.slice(0, 10), 999)).toBe(false);
  });
});

describe('XP rewards', () => {
  it('awards XP once per challenge and never for wrong answers', async () => {
    const r = await fresh();
    const s = await beginGame({ mode: 'standard', category: 'pattern', difficulty: 'medium', timer: 0 }, r);
    const c = challenge('pat-m-001');
    expect((await settleQuestion(s, c, result(c, { correct: false, attempts: 2, revealed: true }), r)).xp).toBe(0);
    // Solved later, after having seen the solution: reduced XP.
    expect((await settleQuestion(s, c, result(c), r)).xp).toBe(5);
    // Replays never pay twice, even when perfect.
    expect((await settleQuestion(s, c, result(c), r)).xp).toBe(0);
    expect(await r.progress.totalXp()).toBe(5);

    const d = challenge('pat-m-002');
    expect((await settleQuestion(s, d, result(d, { attempts: 2, hintUsed: true }), r)).xp).toBe(5);
    const e = challenge('pat-m-003');
    expect((await settleQuestion(s, e, result(e), r)).xp).toBe(20);
    expect(await r.progress.totalXp()).toBe(30);
  });

  it('cannot duplicate a reward even when the ledger insert is replayed', async () => {
    const r = await fresh();
    const s = await beginGame({ mode: 'standard', category: 'sequence', difficulty: 'easy', timer: 0 }, r);
    const c = challenge('seq-e-010');
    await Promise.all([settleQuestion(s, c, result(c), r), settleQuestion(s, c, result(c), r)]);
    expect(await r.progress.totalXp()).toBe(10);
    const ledger = await r.db.getAllAsync('SELECT * FROM xp_ledger', []);
    expect(ledger).toHaveLength(1);
  });

  it('records the daily challenge once per day', async () => {
    const r = await fresh();
    const daily = dailyFor('2026-11-13');
    const first = await settleDaily(daily, result(daily.challenge), r);
    expect(first.xp).toBeGreaterThan(0);
    const again = await settleDaily(daily, result(daily.challenge), r);
    expect(again.xp).toBe(0);
    expect((await r.progress.getDaily('2026-11-13'))?.status).toBe('completed');
    expect(await r.progress.totalXp()).toBe(first.xp);
  });
});

describe('progress, statistics and streaks', () => {
  it('computes dashboard statistics from recorded answers only', async () => {
    const r = await fresh();
    expect((await r.progress.stats('2026-11-13')).solvedTotal).toBe(0);
    const days = ['2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13'];
    for (const [i, day] of days.entries()) {
      clock.set(() => new Date(`${day}T10:00:00`));
      const s = await beginGame({ mode: 'standard', category: 'sequence', difficulty: 'easy', timer: 0 }, r);
      const c = challenge(`seq-e-00${i + 1}`);
      await settleQuestion(s, c, result(c), r);
      const w = challenge(`ded-e-00${i + 1}`);
      await settleQuestion(s, w, result(w, { correct: false, revealed: true, attempts: 2 }), r);
    }
    const stats = await r.progress.stats('2026-11-13');
    expect(stats).toMatchObject({ solvedTotal: 4, answered: 8, correctAnswers: 4, successRate: 0.5, currentStreak: 4, bestStreak: 4, totalXp: 40 });
    expect(stats.categoryPerformance.sequence).toEqual({ answered: 4, correct: 4 });
    expect(stats.categoryPerformance.deduction).toEqual({ answered: 4, correct: 0 });
    expect(stats.weekly).toHaveLength(7);
    expect(stats.weekly.at(-1)).toMatchObject({ day: '2026-11-13', xp: 10, answered: 2 });
    expect(stats.difficultyDistribution.easy).toBe(4);
    // Missing a day breaks the current streak, not the best one.
    expect((await r.progress.stats('2026-11-15')).currentStreak).toBe(0);
    expect((await r.progress.stats('2026-11-15')).bestStreak).toBe(4);
  });

  it('unlocks achievements from real activity only, once', async () => {
    const r = await fresh();
    expect(await refreshAchievements('2026-11-13', r)).toEqual([]);
    const s = await beginGame({ mode: 'standard', category: 'memory', difficulty: 'easy', timer: 0 }, r);
    const c = challenge('mem-e-001');
    const { achievements } = await settleQuestion(s, c, result(c), r);
    expect(achievements).toEqual(['first_challenge']);
    expect(useSession.getState().takeAchievements()).toEqual(['first_challenge']);
    expect(await refreshAchievements('2026-11-13', r)).toEqual([]);
    expect([...(await r.progress.unlockedAchievements()).keys()]).toEqual(['first_challenge']);
  });

  it('persists progress across an app restart', async () => {
    const db = await createTestDatabase();
    const r1 = await initDatabase(db);
    const s = await beginGame({ mode: 'standard', category: 'pattern', difficulty: 'easy', timer: 0 }, r1);
    await settleQuestion(s, challenge('pat-e-001'), result(challenge('pat-e-001')), r1);
    const r2 = await initDatabase(db); // same file, fresh repositories
    expect(await r2.progress.solvedIds()).toEqual(new Set(['pat-e-001']));
    expect(await r2.progress.totalXp()).toBe(10);
    expect(await r2.progress.lastSession()).toMatchObject({ category: 'pattern', difficulty: 'easy' });
    expect(createRepositories(db).progress).toBeDefined();
  });
});

describe('game access rules', () => {
  it('enforces Premium and difficulty unlocks when building a queue', async () => {
    const r = await fresh();
    await expect(buildQueue({ mode: 'standard', category: 'sequence', difficulty: 'hard', timer: 0 }, false, r)).rejects.toEqual(new AccessError('premium'));
    await expect(buildQueue({ mode: 'mixed', category: 'mixed', difficulty: 'any', timer: 0 }, false, r)).rejects.toEqual(new AccessError('premium'));
    await expect(buildQueue({ mode: 'standard', category: 'sequence', difficulty: 'medium', timer: 180 }, false, r)).rejects.toEqual(new AccessError('premium'));
    await expect(buildQueue({ mode: 'standard', category: 'sequence', difficulty: 'medium', timer: 0 }, false, r)).rejects.toEqual(new AccessError('locked'));
    const easy = await buildQueue({ mode: 'standard', category: 'sequence', difficulty: 'easy', timer: 0 }, false, r);
    expect(easy.map((c) => c.id)).toEqual(['seq-e-001', 'seq-e-002', 'seq-e-003', 'seq-e-004', 'seq-e-005']);
    const timed = await buildQueue({ mode: 'standard', category: 'mixed', difficulty: 'easy', timer: 60 }, false, r);
    expect(timed.length).toBeGreaterThan(20);
    expect(timed.every((c) => c.category !== 'memory')).toBe(true);
  });

  it('limits free hints per day and adds rewarded-ad hints', async () => {
    const r = await fresh();
    const c = challenge('seq-e-001');
    for (let i = 0; i < 3; i++) expect(await spendHint(false, c, 'free', r)).toBe(true);
    expect(await spendHint(false, c, 'free', r)).toBe(false);
    expect(await hintBalance(false, r)).toEqual({ remaining: 0, canEarn: true });
    await grantAdHint(r);
    expect(await spendHint(false, c, 'rewarded_ad', r)).toBe(true);
    expect(await spendHint(true, c, 'premium', r)).toBe(true);
    // A new local day resets the allowance.
    clock.set(() => new Date(2026, 10, 14, 9, 0, 0));
    expect((await hintBalance(false, r)).remaining).toBe(3);
  });
});

describe('backup, restore and deletion', () => {
  it('round-trips progress through an export file', async () => {
    const r = await fresh();
    const s = await beginGame({ mode: 'standard', category: 'sequence', difficulty: 'easy', timer: 0 }, r);
    await settleQuestion(s, challenge('seq-e-001'), result(challenge('seq-e-001')), r);
    await r.preferences.set('reminder', { enabled: true, hour: 8, minute: 30 });
    const { json, fileName } = await exportUserData(r.db, new Date('2026-11-13T12:00:00Z'));
    expect(fileName).toBe('logic-quest-backup-2026-11-13.json');

    const other = await fresh();
    const { restoredRows } = await importUserData(other.db, json);
    expect(restoredRows).toBeGreaterThan(3);
    expect(await other.progress.totalXp()).toBe(10);
    expect(await other.preferences.get('reminder', null)).toEqual({ enabled: true, hour: 8, minute: 30 });
    await expect(importUserData(other.db, json.replace('"logic-quest"', '"devspeak"'))).rejects.toMatchObject({ code: 'wrong_app' });
    await expect(importUserData(other.db, 'not json')).rejects.toMatchObject({ code: 'invalid_json' });
  });

  it('deletes all user data but keeps the bundled content', async () => {
    const r = await fresh();
    const s = await beginGame({ mode: 'standard', category: 'sequence', difficulty: 'easy', timer: 0 }, r);
    await settleQuestion(s, challenge('seq-e-001'), result(challenge('seq-e-001')), r);
    await r.db.runAsync("INSERT INTO subscription_cache (key, state, updated_at) VALUES ('entitlement', '{}', 'x')", []);
    await deleteAllUserData(r.db);
    for (const table of ['answers', 'game_sessions', 'xp_ledger', 'user_progress', 'subscription_cache']) {
      expect((await r.db.getFirstAsync<{ n: number }>(`SELECT COUNT(*) AS n FROM ${table}`, []))?.n).toBe(0);
    }
    expect(await r.content.count()).toBe(CHALLENGES.length);
  });
});
