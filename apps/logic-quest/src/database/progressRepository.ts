import { addDays, computeStreak, lastNDays, type DayKey } from '@factory/app-core';
import { fromJson, toJson, type SqlDatabase } from '@factory/storage';

import {
  CATEGORIES,
  computeDailyXp,
  computeXp,
  DIFFICULTIES,
  emptySolvedCounts,
  emptyStats,
  playerLevel,
  type Category,
  type Challenge,
  type Difficulty,
  type PlayerStats,
  type QuestionResult,
  type SessionMode,
  type SessionSummary,
  type SolvedCounts,
} from '@/engine';

export interface SessionMeta {
  id: string;
  mode: SessionMode;
  category: Category | 'mixed';
  difficulty: Difficulty | 'any';
  timeLimitS: number;
  day: DayKey;
  startedAt: string;
}

export interface DailyRecord {
  day: DayKey;
  challengeId: string;
  templateId: string;
  difficulty: Difficulty;
  status: 'completed' | 'failed';
  attempts: number;
  hintUsed: boolean;
  xpAwarded: number;
  completedAt: string;
}

export interface DashboardStats extends PlayerStats {
  totalXp: number;
  currentStreak: number;
  gamesCompleted: number;
  answered: number;
  correctAnswers: number;
  successRate: number;
  categoryPerformance: Record<Category, { answered: number; correct: number }>;
  weekly: { day: DayKey; xp: number; answered: number }[];
  difficultyDistribution: Record<Difficulty, number>;
}

const b = (v: boolean) => (v ? 1 : 0);

export function createProgressRepository(db: SqlDatabase) {
  async function ledgerAdd(source: 'challenge' | 'daily', sourceId: string, xp: number, day: DayKey, now: string): Promise<number> {
    if (xp <= 0) return 0;
    // The primary key makes a second reward for the same source a no-op.
    const r = await db.runAsync('INSERT OR IGNORE INTO xp_ledger (source, source_id, xp, day, created_at) VALUES (?, ?, ?, ?, ?)', [source, sourceId, xp, day, now]);
    return r.changes > 0 ? xp : 0;
  }

  async function hasLedger(source: string, sourceId: string): Promise<boolean> {
    return !!(await db.getFirstAsync('SELECT 1 AS x FROM xp_ledger WHERE source = ? AND source_id = ?', [source, sourceId]));
  }

  const repo = {
    async startSession(meta: SessionMeta): Promise<void> {
      await db.runAsync(
        'INSERT INTO game_sessions (id, mode, category, difficulty, time_limit_s, day, started_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [meta.id, meta.mode, meta.category, meta.difficulty, meta.timeLimitS, meta.day, meta.startedAt, meta.startedAt],
      );
    },

    /**
     * Persists a settled question and grants XP at most once per challenge.
     * Returns the XP actually awarded (0 for wrong answers and replays).
     */
    async recordAnswer(input: { sessionId: string; challenge: Challenge; result: QuestionResult; day: DayKey; now: string }): Promise<{ xp: number; firstSolve: boolean }> {
      const { challenge: c, result: r, day, now } = input;
      let xp = 0;
      let firstSolve = false;
      await db.withTransactionAsync(async () => {
        const progress = await db.getFirstAsync<{ solved: number; revealed: number }>('SELECT solved, revealed FROM user_progress WHERE challenge_id = ?', [c.id]);
        const alreadyRewarded = await hasLedger('challenge', c.id);
        const proposed = computeXp({ baseXp: c.xp, correct: r.correct, attempt: r.attempts, hintUsed: r.hintUsed, previouslyRevealed: !!progress?.revealed, alreadyRewarded });
        xp = r.correct ? await ledgerAdd('challenge', c.id, proposed, day, now) : 0;
        firstSolve = r.correct && !progress?.solved;
        await db.runAsync(
          'INSERT INTO answers (session_id, challenge_id, category, difficulty, day, correct, attempts, hint_used, revealed, time_ms, xp_awarded, answered_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [input.sessionId, c.id, c.category, c.difficulty, day, b(r.correct), r.attempts, b(r.hintUsed), b(r.revealed), Math.round(r.timeMs), xp, now],
        );
        await db.runAsync(
          `INSERT INTO user_progress (challenge_id, category, difficulty, solved, first_solved_at, attempts_total, revealed, best_time_ms, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(challenge_id) DO UPDATE SET
             solved = MAX(solved, excluded.solved),
             first_solved_at = COALESCE(first_solved_at, excluded.first_solved_at),
             attempts_total = attempts_total + excluded.attempts_total,
             revealed = MAX(revealed, excluded.revealed),
             best_time_ms = CASE WHEN excluded.best_time_ms IS NULL THEN best_time_ms WHEN best_time_ms IS NULL THEN excluded.best_time_ms ELSE MIN(best_time_ms, excluded.best_time_ms) END,
             updated_at = excluded.updated_at`,
          [c.id, c.category, c.difficulty, b(r.correct), r.correct ? now : null, r.attempts, b(r.revealed && !r.correct), r.correct ? Math.round(r.timeMs) : null, now],
        );
        await db.runAsync(
          'UPDATE game_sessions SET answered = answered + 1, correct = correct + ?, hints_used = hints_used + ?, xp_earned = xp_earned + ?, updated_at = ? WHERE id = ?',
          [b(r.correct), b(r.hintUsed), xp, now, input.sessionId],
        );
      });
      return { xp, firstSolve };
    },

    async finishSession(id: string, summary: SessionSummary, endReason: string, now: string): Promise<void> {
      await db.runAsync('UPDATE game_sessions SET ended_at = ?, end_reason = ?, perfect = ?, updated_at = ? WHERE id = ? AND ended_at IS NULL', [now, endReason, b(summary.perfect), now, id]);
    },

    /** Daily challenge: one record and at most one reward per local day. */
    async recordDaily(input: { day: DayKey; challenge: Challenge; templateId: string; result: QuestionResult; now: string }): Promise<{ xp: number; record: DailyRecord }> {
      const { day, challenge: c, result: r, now } = input;
      let xp = 0;
      await db.withTransactionAsync(async () => {
        const existing = await db.getFirstAsync<{ status: string }>('SELECT status FROM daily_challenges WHERE day = ?', [day]);
        if (existing) return; // Settled already: no second attempt, no second reward.
        const proposed = computeDailyXp(c.difficulty, { correct: r.correct, attempt: r.attempts, hintUsed: r.hintUsed, alreadyRewarded: await hasLedger('daily', day) });
        xp = r.correct ? await ledgerAdd('daily', day, proposed, day, now) : 0;
        await db.runAsync(
          'INSERT INTO daily_challenges (day, challenge_id, template_id, difficulty, status, attempts, hint_used, xp_awarded, completed_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [day, c.id, input.templateId, c.difficulty, r.correct ? 'completed' : 'failed', r.attempts, b(r.hintUsed), xp, now, now],
        );
        // The daily also counts as activity for streaks and stats.
        await db.runAsync(
          'INSERT INTO answers (session_id, challenge_id, category, difficulty, day, correct, attempts, hint_used, revealed, time_ms, xp_awarded, answered_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [`daily-${day}`, c.id, c.category, c.difficulty, day, b(r.correct), r.attempts, b(r.hintUsed), b(r.revealed), Math.round(r.timeMs), xp, now],
        );
      });
      return { xp, record: (await repo.getDaily(day)) as DailyRecord };
    },

    async getDaily(day: DayKey): Promise<DailyRecord | null> {
      const r = await db.getFirstAsync<{ day: string; challenge_id: string; template_id: string; difficulty: Difficulty; status: 'completed' | 'failed'; attempts: number; hint_used: number; xp_awarded: number; completed_at: string }>(
        'SELECT * FROM daily_challenges WHERE day = ?',
        [day],
      );
      return r ? { day: r.day, challengeId: r.challenge_id, templateId: r.template_id, difficulty: r.difficulty, status: r.status, attempts: r.attempts, hintUsed: !!r.hint_used, xpAwarded: r.xp_awarded, completedAt: r.completed_at } : null;
    },

    async solvedIds(): Promise<Set<string>> {
      return new Set((await db.getAllAsync<{ challenge_id: string }>('SELECT challenge_id FROM user_progress WHERE solved = 1', [])).map((r) => r.challenge_id));
    },

    async solvedCounts(): Promise<SolvedCounts> {
      const counts = emptySolvedCounts();
      const rows = await db.getAllAsync<{ category: Category; difficulty: Difficulty; n: number }>('SELECT category, difficulty, COUNT(*) AS n FROM user_progress WHERE solved = 1 GROUP BY category, difficulty', []);
      for (const r of rows) if (counts[r.category]) counts[r.category][r.difficulty] = r.n;
      return counts;
    },

    async totalXp(): Promise<number> {
      return (await db.getFirstAsync<{ xp: number | null }>('SELECT SUM(xp) AS xp FROM xp_ledger', []))?.xp ?? 0;
    },

    async activeDays(): Promise<DayKey[]> {
      return (await db.getAllAsync<{ day: string }>('SELECT DISTINCT day FROM answers ORDER BY day', [])).map((r) => r.day);
    },

    async lastSession(): Promise<{ mode: SessionMode; category: Category | 'mixed'; difficulty: Difficulty | 'any'; timeLimitS: number } | null> {
      const r = await db.getFirstAsync<{ mode: SessionMode; category: Category | 'mixed'; difficulty: Difficulty | 'any'; time_limit_s: number }>(
        "SELECT mode, category, difficulty, time_limit_s FROM game_sessions WHERE mode != 'daily' AND answered > 0 ORDER BY started_at DESC LIMIT 1",
        [],
      );
      return r ? { mode: r.mode, category: r.category, difficulty: r.difficulty, timeLimitS: r.time_limit_s } : null;
    },

    /** Recent first-try outcomes for a category+difficulty (difficulty suggestions). */
    async recentFirstTry(category: Category, difficulty: Difficulty, limit = 10): Promise<boolean[]> {
      const rows = await db.getAllAsync<{ ok: number }>('SELECT (correct = 1 AND attempts = 1 AND hint_used = 0) AS ok FROM answers WHERE category = ? AND difficulty = ? ORDER BY id DESC LIMIT ?', [category, difficulty, limit]);
      return rows.map((r) => !!r.ok);
    },

    /* ------------------------------------------------------------- hints */

    async hintWallet(day: DayKey): Promise<{ used: number; adBonus: number }> {
      const r = await db.getFirstAsync<{ used: number; ad_bonus: number }>('SELECT used, ad_bonus FROM hint_wallet WHERE day = ?', [day]);
      return { used: r?.used ?? 0, adBonus: r?.ad_bonus ?? 0 };
    },

    async spendHint(day: DayKey, now: string): Promise<void> {
      await db.runAsync('INSERT INTO hint_wallet (day, used, ad_bonus, updated_at) VALUES (?, 1, 0, ?) ON CONFLICT(day) DO UPDATE SET used = used + 1, updated_at = excluded.updated_at', [day, now]);
    },

    async addAdHint(day: DayKey, now: string): Promise<void> {
      await db.runAsync('INSERT INTO hint_wallet (day, used, ad_bonus, updated_at) VALUES (?, 0, 1, ?) ON CONFLICT(day) DO UPDATE SET ad_bonus = ad_bonus + 1, updated_at = excluded.updated_at', [day, now]);
    },

    /* ------------------------------------------------------ achievements */

    async unlockedAchievements(): Promise<Map<string, string>> {
      return new Map((await db.getAllAsync<{ id: string; unlocked_at: string }>('SELECT id, unlocked_at FROM achievements', [])).map((r) => [r.id, r.unlocked_at]));
    },

    /** Inserts achievements; returns only the ones that were not unlocked before. */
    async unlockAchievements(ids: string[], now: string): Promise<string[]> {
      const fresh: string[] = [];
      for (const id of ids) {
        const r = await db.runAsync('INSERT OR IGNORE INTO achievements (id, unlocked_at) VALUES (?, ?)', [id, now]);
        if (r.changes > 0) fresh.push(id);
      }
      return fresh;
    },

    /* ------------------------------------------------------------- stats */

    /** Every statistic is computed from recorded answers, sessions and the XP ledger. */
    async stats(today: DayKey): Promise<DashboardStats> {
      const s = emptyStats();
      const solved = await db.getAllAsync<{ category: Category; difficulty: Difficulty; n: number }>('SELECT category, difficulty, COUNT(*) AS n FROM user_progress WHERE solved = 1 GROUP BY category, difficulty', []);
      for (const r of solved) {
        if (!(r.category in s.solvedByCategory)) continue;
        s.solvedByCategory[r.category] += r.n;
        s.solvedByDifficulty[r.difficulty] += r.n;
        s.solvedTotal += r.n;
      }
      s.solvedWithoutHint =
        (await db.getFirstAsync<{ n: number }>("SELECT COUNT(DISTINCT challenge_id) AS n FROM answers WHERE correct = 1 AND hint_used = 0 AND session_id NOT LIKE 'daily-%'", []))?.n ?? 0;
      const streak = computeStreak(await repo.activeDays(), today);
      s.bestStreak = streak.longest;
      s.dailyCompleted = (await db.getFirstAsync<{ n: number }>("SELECT COUNT(*) AS n FROM daily_challenges WHERE status = 'completed'", []))?.n ?? 0;
      s.perfectSessions = (await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM game_sessions WHERE perfect = 1', []))?.n ?? 0;
      s.bestTimedCorrect = (await db.getFirstAsync<{ n: number | null }>("SELECT MAX(correct) AS n FROM game_sessions WHERE mode = 'timed'", []))?.n ?? 0;
      const totalXp = await repo.totalXp();
      s.level = playerLevel(totalXp).level;

      const totals = await db.getFirstAsync<{ answered: number; correct: number | null }>('SELECT COUNT(*) AS answered, SUM(correct) AS correct FROM answers', []);
      const answered = totals?.answered ?? 0;
      const correctAnswers = totals?.correct ?? 0;
      const gamesCompleted = (await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM game_sessions WHERE ended_at IS NOT NULL AND answered > 0', []))?.n ?? 0;

      const categoryPerformance = Object.fromEntries(CATEGORIES.map((c) => [c, { answered: 0, correct: 0 }])) as DashboardStats['categoryPerformance'];
      for (const r of await db.getAllAsync<{ category: Category; answered: number; correct: number }>('SELECT category, COUNT(*) AS answered, SUM(correct) AS correct FROM answers GROUP BY category', [])) {
        if (categoryPerformance[r.category]) categoryPerformance[r.category] = { answered: r.answered, correct: r.correct ?? 0 };
      }

      const days = lastNDays(today, 7);
      const xpByDay = new Map((await db.getAllAsync<{ day: string; xp: number }>('SELECT day, SUM(xp) AS xp FROM xp_ledger WHERE day >= ? GROUP BY day', [days[0] as string])).map((r) => [r.day, r.xp]));
      const answeredByDay = new Map((await db.getAllAsync<{ day: string; n: number }>('SELECT day, COUNT(*) AS n FROM answers WHERE day >= ? GROUP BY day', [days[0] as string])).map((r) => [r.day, r.n]));
      const weekly = days.map((day) => ({ day, xp: xpByDay.get(day) ?? 0, answered: answeredByDay.get(day) ?? 0 }));

      const difficultyDistribution = Object.fromEntries(DIFFICULTIES.map((d) => [d, s.solvedByDifficulty[d]])) as Record<Difficulty, number>;

      return {
        ...s,
        totalXp,
        currentStreak: streak.current,
        gamesCompleted,
        answered,
        correctAnswers,
        successRate: answered ? correctAnswers / answered : 0,
        categoryPerformance,
        weekly,
        difficultyDistribution,
      };
    },

    /** Activity for the last `days` days (streak calendar). */
    async activityCalendar(today: DayKey, days = 28): Promise<{ day: DayKey; active: boolean }[]> {
      const active = new Set(await repo.activeDays());
      return lastNDays(today, days).map((day) => ({ day, active: active.has(day) }));
    },

    async yesterdayActive(today: DayKey): Promise<boolean> {
      return !!(await db.getFirstAsync('SELECT 1 AS x FROM answers WHERE day = ? LIMIT 1', [addDays(today, -1)]));
    },
  };
  return repo;
}

export type ProgressRepository = ReturnType<typeof createProgressRepository>;

export function createPreferencesRepository(db: SqlDatabase) {
  return {
    async get<T>(key: string, fallback: T): Promise<T> {
      const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM user_preferences WHERE key = ?', [key]);
      return row ? fromJson<T>(row.value, fallback) : fallback;
    },
    async set<T>(key: string, value: T, now = new Date().toISOString()): Promise<void> {
      await db.runAsync('INSERT INTO user_preferences (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at', [key, toJson(value), now]);
    },
  };
}

export type PreferencesRepository = ReturnType<typeof createPreferencesRepository>;
