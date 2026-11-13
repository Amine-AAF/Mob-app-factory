import { computeStreak, newCard, reviewCard, isMastered, toDayKey, XP_REWARDS, type DayKey, type ReviewGrade, type SrsCard } from '@factory/app-core';
import type { SqlDatabase } from '@factory/storage';

import type { ModuleId } from '@/content/types';
import { evaluateAchievements, type AchievementId, type AchievementStats } from '@/features/progress/achievements';

type ActivityField = 'lessons_completed' | 'quizzes_completed' | 'cards_reviewed' | 'speaking_done';

export interface CompletionResult {
  firstCompletion: boolean;
  xpEarned: number;
  bestScore: number;
  newAchievements: AchievementId[];
}

export interface DayActivity {
  day: DayKey;
  xp: number;
  lessonsCompleted: number;
  quizzesCompleted: number;
  cardsReviewed: number;
  speakingDone: number;
}

export interface ProgressStats extends AchievementStats {
  totalXp: number;
  todayXp: number;
  lessonsByModule: Record<ModuleId, number>;
  averageQuizScore: number | null;
  favorites: number;
  cardsDueToday: number;
  activeDays: DayKey[];
}

export function createProgressRepository(db: SqlDatabase) {
  const iso = (d: Date) => d.toISOString();

  async function addActivity(now: Date, xp: number, field?: ActivityField): Promise<void> {
    const day = toDayKey(now);
    // Field names come from a closed union, never from user input.
    const inc = field ? `, ${field} = ${field} + 1` : '';
    await db.runAsync(
      `INSERT INTO daily_activity (day, xp, ${field ?? 'lessons_completed'}, updated_at) VALUES (?, ?, ?, ?)
       ON CONFLICT(day) DO UPDATE SET xp = xp + excluded.xp${inc}, updated_at = excluded.updated_at`,
      [day, xp, field ? 1 : 0, iso(now)],
    );
  }

  async function unlockNew(now: Date): Promise<AchievementId[]> {
    const stats = await repo.getStats(now);
    const unlocked = new Set((await db.getAllAsync<{ id: string }>('SELECT id FROM user_achievements', [])).map((r) => r.id));
    const fresh = evaluateAchievements(stats).filter((id) => !unlocked.has(id));
    for (const id of fresh) {
      await db.runAsync('INSERT OR IGNORE INTO user_achievements (id, unlocked_at) VALUES (?, ?)', [id, iso(now)]);
    }
    return fresh;
  }

  const repo = {
    async startLesson(lessonId: string, now: Date): Promise<void> {
      await db.runAsync(
        `INSERT INTO learning_progress (item_type, item_id, status, attempts, started_at, updated_at)
         VALUES ('lesson', ?, 'started', 0, ?, ?)
         ON CONFLICT(item_type, item_id) DO UPDATE SET updated_at = excluded.updated_at`,
        [lessonId, iso(now), iso(now)],
      );
    },

    /**
     * Records a finished lesson quiz. XP for the lesson is granted only on the
     * first completion so replays never inflate progress.
     */
    async completeLesson(lessonId: string, scorePercent: number, now: Date): Promise<CompletionResult> {
      const score = Math.max(0, Math.min(100, Math.round(scorePercent)));
      let result: CompletionResult = { firstCompletion: false, xpEarned: 0, bestScore: score, newAchievements: [] };
      await db.withTransactionAsync(async () => {
        const existing = await db.getFirstAsync<{ status: string; best_score: number | null }>(
          "SELECT status, best_score FROM learning_progress WHERE item_type = 'lesson' AND item_id = ?",
          [lessonId],
        );
        const first = existing?.status !== 'completed';
        const best = Math.max(score, existing?.best_score ?? 0);
        await db.runAsync(
          `INSERT INTO learning_progress (item_type, item_id, status, best_score, last_score, attempts, started_at, completed_at, updated_at)
           VALUES ('lesson', ?, 'completed', ?, ?, 1, ?, ?, ?)
           ON CONFLICT(item_type, item_id) DO UPDATE SET
             status = 'completed', best_score = ?, last_score = ?, attempts = attempts + 1,
             completed_at = COALESCE(completed_at, excluded.completed_at), updated_at = excluded.updated_at`,
          [lessonId, best, score, iso(now), iso(now), iso(now), best, score],
        );
        let xp = 0;
        if (first) xp += XP_REWARDS.lessonCompleted + (score === 100 ? XP_REWARDS.quizPerfect : 0);
        else if (score === 100 && (existing?.best_score ?? 0) < 100) xp += XP_REWARDS.quizPerfect;
        await addActivity(now, xp, first ? 'lessons_completed' : 'quizzes_completed');
        if (first) await db.runAsync('UPDATE daily_activity SET quizzes_completed = quizzes_completed + 1 WHERE day = ?', [toDayKey(now)]);
        const newAchievements = await unlockNew(now);
        result = { firstCompletion: first, xpEarned: xp, bestScore: best, newAchievements };
      });
      return result;
    },

    async completeDailyChallenge(challengeId: string, now: Date): Promise<{ xpEarned: number; alreadyDone: boolean; newAchievements: AchievementId[] }> {
      let out = { xpEarned: 0, alreadyDone: true, newAchievements: [] as AchievementId[] };
      await db.withTransactionAsync(async () => {
        const res = await db.runAsync('INSERT OR IGNORE INTO daily_challenge_completions (day, challenge_id, completed_at) VALUES (?, ?, ?)', [
          toDayKey(now),
          challengeId,
          iso(now),
        ]);
        if (res.changes === 0) return;
        await addActivity(now, XP_REWARDS.dailyChallenge);
        out = { xpEarned: XP_REWARDS.dailyChallenge, alreadyDone: false, newAchievements: await unlockNew(now) };
      });
      return out;
    },

    async isDailyChallengeDone(now: Date): Promise<boolean> {
      return !!(await db.getFirstAsync('SELECT day FROM daily_challenge_completions WHERE day = ?', [toDayKey(now)]));
    },

    async recordSpeaking(exerciseId: string, now: Date): Promise<{ xpEarned: number; newAchievements: AchievementId[] }> {
      let out = { xpEarned: 0, newAchievements: [] as AchievementId[] };
      await db.withTransactionAsync(async () => {
        await db.runAsync(
          `INSERT INTO learning_progress (item_type, item_id, status, attempts, started_at, completed_at, updated_at)
           VALUES ('speaking', ?, 'completed', 1, ?, ?, ?)
           ON CONFLICT(item_type, item_id) DO UPDATE SET attempts = attempts + 1, updated_at = excluded.updated_at`,
          [exerciseId, iso(now), iso(now), iso(now)],
        );
        await addActivity(now, XP_REWARDS.speakingExercise, 'speaking_done');
        out = { xpEarned: XP_REWARDS.speakingExercise, newAchievements: await unlockNew(now) };
      });
      return out;
    },

    async speakingDoneOn(now: Date): Promise<number> {
      const r = await db.getFirstAsync<{ n: number }>('SELECT speaking_done AS n FROM daily_activity WHERE day = ?', [toDayKey(now)]);
      return r?.n ?? 0;
    },

    async reviewFlashcard(vocabId: string, grade: ReviewGrade, now: Date): Promise<SrsCard> {
      const today = toDayKey(now);
      let next: SrsCard = newCard(today);
      await db.withTransactionAsync(async () => {
        const row = await db.getFirstAsync<{ repetitions: number; interval_days: number; ease: number; due_day: string }>(
          'SELECT repetitions, interval_days, ease, due_day FROM srs_cards WHERE vocab_id = ?',
          [vocabId],
        );
        const current: SrsCard = row ? { repetitions: row.repetitions, intervalDays: row.interval_days, ease: row.ease, dueDay: row.due_day } : newCard(today);
        next = reviewCard(current, grade, today);
        await db.runAsync(
          `INSERT INTO srs_cards (vocab_id, repetitions, interval_days, ease, due_day, last_reviewed_at) VALUES (?, ?, ?, ?, ?, ?)
           ON CONFLICT(vocab_id) DO UPDATE SET repetitions = excluded.repetitions, interval_days = excluded.interval_days,
             ease = excluded.ease, due_day = excluded.due_day, last_reviewed_at = excluded.last_reviewed_at`,
          [vocabId, next.repetitions, next.intervalDays, next.ease, next.dueDay, iso(now)],
        );
        await addActivity(now, XP_REWARDS.flashcardReviewed, 'cards_reviewed');
        await unlockNew(now);
      });
      return next;
    },

    /** Vocabulary ids ordered for a study session: due cards first, then new cards. */
    async flashcardQueue(candidateIds: string[], now: Date, limit = 20): Promise<string[]> {
      const today = toDayKey(now);
      const rows = await db.getAllAsync<{ vocab_id: string; due_day: string }>('SELECT vocab_id, due_day FROM srs_cards', []);
      const known = new Map(rows.map((r) => [r.vocab_id, r.due_day]));
      const due = candidateIds.filter((id) => known.has(id) && (known.get(id) as string) <= today).sort((a, b) => (known.get(a) as string).localeCompare(known.get(b) as string));
      const fresh = candidateIds.filter((id) => !known.has(id));
      return [...due, ...fresh].slice(0, limit);
    },

    async toggleFavorite(vocabId: string, now: Date): Promise<boolean> {
      const exists = await db.getFirstAsync('SELECT vocab_id FROM vocabulary_favorites WHERE vocab_id = ?', [vocabId]);
      if (exists) {
        await db.runAsync('DELETE FROM vocabulary_favorites WHERE vocab_id = ?', [vocabId]);
        return false;
      }
      await db.runAsync('INSERT OR IGNORE INTO vocabulary_favorites (vocab_id, created_at) VALUES (?, ?)', [vocabId, iso(now)]);
      return true;
    },

    async favoriteIds(): Promise<Set<string>> {
      return new Set((await db.getAllAsync<{ vocab_id: string }>('SELECT vocab_id FROM vocabulary_favorites', [])).map((r) => r.vocab_id));
    },

    async lessonStatuses(): Promise<Map<string, { status: 'started' | 'completed'; bestScore: number | null; updatedAt: string }>> {
      const rows = await db.getAllAsync<{ item_id: string; status: 'started' | 'completed'; best_score: number | null; updated_at: string }>(
        "SELECT item_id, status, best_score, updated_at FROM learning_progress WHERE item_type = 'lesson'",
        [],
      );
      return new Map(rows.map((r) => [r.item_id, { status: r.status, bestScore: r.best_score, updatedAt: r.updated_at }]));
    },

    async activity(days: DayKey[]): Promise<DayActivity[]> {
      if (days.length === 0) return [];
      const rows = await db.getAllAsync<{ day: string; xp: number; lessons_completed: number; quizzes_completed: number; cards_reviewed: number; speaking_done: number }>(
        `SELECT * FROM daily_activity WHERE day >= ? AND day <= ?`,
        [days[0] as string, days[days.length - 1] as string],
      );
      const map = new Map(rows.map((r) => [r.day, r]));
      return days.map((day) => {
        const r = map.get(day);
        return { day, xp: r?.xp ?? 0, lessonsCompleted: r?.lessons_completed ?? 0, quizzesCompleted: r?.quizzes_completed ?? 0, cardsReviewed: r?.cards_reviewed ?? 0, speakingDone: r?.speaking_done ?? 0 };
      });
    },

    async getStats(now: Date): Promise<ProgressStats> {
      const today = toDayKey(now);
      const activity = await db.getAllAsync<{ day: string; xp: number }>('SELECT day, xp FROM daily_activity WHERE xp > 0 OR lessons_completed > 0 OR cards_reviewed > 0 OR speaking_done > 0 ORDER BY day', []);
      const activeDays = activity.map((a) => a.day);
      const streak = computeStreak(activeDays, today);
      const totalXp = activity.reduce((s, a) => s + a.xp, 0);
      const todayXp = activity.find((a) => a.day === today)?.xp ?? 0;

      const byModule = await db.getAllAsync<{ module_id: ModuleId; n: number }>(
        `SELECT l.module_id, COUNT(*) AS n FROM learning_progress p JOIN lessons l ON l.id = p.item_id
         WHERE p.item_type = 'lesson' AND p.status = 'completed' GROUP BY l.module_id`,
        [],
      );
      const lessonsByModule: Record<ModuleId, number> = { workplace: 0, technical: 0, interview: 0 };
      byModule.forEach((r) => (lessonsByModule[r.module_id] = r.n));

      const quiz = await db.getFirstAsync<{ avg: number | null; perfect: number }>(
        "SELECT AVG(best_score) AS avg, SUM(CASE WHEN best_score = 100 THEN 1 ELSE 0 END) AS perfect FROM learning_progress WHERE item_type = 'lesson' AND status = 'completed'",
        [],
      );
      const cards = await db.getAllAsync<{ interval_days: number; due_day: string }>('SELECT interval_days, due_day FROM srs_cards', []);
      const counts = await db.getFirstAsync<{ fav: number; challenges: number; speaking: number }>(
        `SELECT (SELECT COUNT(*) FROM vocabulary_favorites) AS fav,
                (SELECT COUNT(*) FROM daily_challenge_completions) AS challenges,
                (SELECT COALESCE(SUM(speaking_done), 0) FROM daily_activity) AS speaking`,
        [],
      );
      const lessonsCompleted = Object.values(lessonsByModule).reduce((a, b) => a + b, 0);
      return {
        totalXp,
        todayXp,
        currentStreak: streak.current,
        longestStreak: streak.longest,
        lessonsCompleted,
        lessonsByModule,
        interviewLessonsCompleted: lessonsByModule.interview,
        perfectQuizzes: quiz?.perfect ?? 0,
        averageQuizScore: quiz?.avg == null ? null : Math.round(quiz.avg),
        wordsLearned: cards.filter((c) => isMastered({ intervalDays: c.interval_days })).length,
        cardsReviewed: cards.length,
        cardsDueToday: cards.filter((c) => c.due_day <= today).length,
        favorites: counts?.fav ?? 0,
        challengesCompleted: counts?.challenges ?? 0,
        speakingDone: counts?.speaking ?? 0,
        activeDays,
      };
    },

    async achievements(): Promise<{ id: AchievementId; unlockedAt: string }[]> {
      const rows = await db.getAllAsync<{ id: AchievementId; unlocked_at: string }>('SELECT id, unlocked_at FROM user_achievements ORDER BY unlocked_at', []);
      return rows.map((r) => ({ id: r.id, unlockedAt: r.unlocked_at }));
    },
  };
  return repo;
}

export type ProgressRepository = ReturnType<typeof createProgressRepository>;
