import { addDays } from '@factory/app-core';
import type { SqlDatabase } from '@factory/storage';

import type { AchievementStats } from '@/features/goals/achievements';
import { daysAllDailyGoalsMet, type ActivityRow, type Goal, type GoalMetric, type GoalPeriod } from '@/features/goals/goals';
import { learningStreak } from '@/features/stats/stats';
import { clock } from '@/services/clock';
import { newId } from '@/utils/id';

interface GoalRow {
  id: string;
  title: string;
  period: GoalPeriod;
  metric: GoalMetric;
  target: number;
  subject_id: string | null;
  start_day: string | null;
  end_day: string | null;
  active: number;
}

const toGoal = (r: GoalRow): Goal => ({
  id: r.id,
  title: r.title,
  period: r.period,
  metric: r.metric,
  target: r.target,
  subjectId: r.subject_id,
  startDay: r.start_day,
  endDay: r.end_day,
  active: r.active === 1,
});

export type GoalInput = Omit<Goal, 'id' | 'active'>;

export function createGoalsRepository(db: SqlDatabase) {
  const now = () => clock.now().toISOString();

  const repo = {
    async list(activeOnly = true): Promise<Goal[]> {
      return (await db.getAllAsync<GoalRow>(`SELECT * FROM study_goals ${activeOnly ? 'WHERE active = 1' : ''} ORDER BY period, created_at`, [])).map(toGoal);
    },

    async create(input: GoalInput): Promise<string> {
      const id = newId('g');
      const t = now();
      await db.runAsync('INSERT INTO study_goals (id, title, period, metric, target, subject_id, start_day, end_day, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
        id,
        input.title.trim(),
        input.period,
        input.metric,
        Math.max(1, Math.round(input.target)),
        input.subjectId,
        input.startDay,
        input.endDay,
        t,
        t,
      ]);
      return id;
    },

    async update(id: string, input: GoalInput): Promise<void> {
      await db.runAsync('UPDATE study_goals SET title = ?, period = ?, metric = ?, target = ?, subject_id = ?, start_day = ?, end_day = ?, updated_at = ? WHERE id = ?', [
        input.title.trim(),
        input.period,
        input.metric,
        Math.max(1, Math.round(input.target)),
        input.subjectId,
        input.startDay,
        input.endDay,
        now(),
        id,
      ]);
    },

    async setActive(id: string, active: boolean): Promise<void> {
      await db.runAsync('UPDATE study_goals SET active = ?, updated_at = ? WHERE id = ?', [active ? 1 : 0, now(), id]);
    },

    async remove(id: string): Promise<void> {
      await db.runAsync('DELETE FROM study_goals WHERE id = ?', [id]);
    },

    /** Daily activity per subject since `from`, aggregated from every source table. */
    async activity(from: string): Promise<ActivityRow[]> {
      const rows = await db.getAllAsync<{ day: string; subject_id: string | null; minutes: number; sessions: number; chapters: number; flashcards: number; quizzes: number }>(
        `SELECT day, subject_id, SUM(minutes) AS minutes, SUM(sessions) AS sessions, SUM(chapters) AS chapters, SUM(flashcards) AS flashcards, SUM(quizzes) AS quizzes FROM (
           SELECT day, subject_id, minutes, 0 AS sessions, 0 AS chapters, 0 AS flashcards, 0 AS quizzes FROM study_log WHERE day >= ?
           UNION ALL SELECT day, subject_id, 0, 1, 0, 0, 0 FROM study_sessions WHERE status = 'done' AND day >= ?
           UNION ALL SELECT r.day, f.subject_id, 0, 0, 0, 1, 0 FROM flashcard_reviews r JOIN flashcards f ON f.id = r.flashcard_id WHERE r.day >= ?
           UNION ALL SELECT day, subject_id, 0, 0, 0, 0, 1 FROM quiz_attempts WHERE day >= ?
           UNION ALL SELECT ch.completed_day, c.subject_id, 0, 0, 1, 0, 0 FROM chapters ch JOIN courses c ON c.id = ch.course_id WHERE ch.completed_day IS NOT NULL AND ch.completed_day >= ?
         ) GROUP BY day, subject_id`,
        [from, from, from, from, from],
      );
      return rows.map((r) => ({ day: r.day, subjectId: r.subject_id, minutes: r.minutes, sessions: r.sessions, chapters: r.chapters, flashcards: r.flashcards, quizzes: r.quizzes }));
    },

    /** Every local day with any learning activity (study time, reviews, quizzes, completed sessions). */
    async activeDays(from = '2000-01-01'): Promise<string[]> {
      const rows = await db.getAllAsync<{ day: string }>(
        `SELECT DISTINCT day FROM (
           SELECT day FROM study_log WHERE minutes > 0 AND day >= ?
           UNION SELECT day FROM flashcard_reviews WHERE day >= ?
           UNION SELECT day FROM quiz_attempts WHERE day >= ?
           UNION SELECT day FROM study_sessions WHERE status = 'done' AND day >= ?
         ) ORDER BY day`,
        [from, from, from, from],
      );
      return rows.map((r) => r.day);
    },

    async achievementStats(): Promise<AchievementStats> {
      const one = async (sql: string) => (await db.getFirstAsync<{ n: number | null }>(sql, []))?.n ?? 0;
      const today = clock.today();
      const days = await repo.activeDays(addDays(today, -400));
      const goals = await repo.list(true);
      const activity = goals.some((g) => g.period === 'daily') ? await repo.activity(addDays(today, -365)) : [];
      return {
        streak: learningStreak(days, today).longest,
        totalMinutes: await one('SELECT SUM(minutes) AS n FROM study_log'),
        focusSessions: await one('SELECT COUNT(*) AS n FROM focus_sessions WHERE focus_minutes > 0'),
        cardsReviewed: await one('SELECT COUNT(*) AS n FROM flashcard_reviews'),
        cardsCreated: await one('SELECT COUNT(*) AS n FROM flashcards'),
        quizzesCompleted: await one('SELECT COUNT(*) AS n FROM quiz_attempts'),
        perfectQuizzes: await one('SELECT COUNT(*) AS n FROM quiz_attempts WHERE score = 100 AND total >= 5'),
        notesCreated: await one('SELECT COUNT(*) AS n FROM notes'),
        subjectsCreated: await one('SELECT COUNT(*) AS n FROM subjects'),
        sessionsDone: await one("SELECT COUNT(*) AS n FROM study_sessions WHERE status = 'done'"),
        chaptersCompleted: await one('SELECT COUNT(*) AS n FROM chapters WHERE completed_at IS NOT NULL'),
        goalsMet: daysAllDailyGoalsMet(goals, activity),
      };
    },

    async unlockedAchievements(): Promise<{ id: string; unlockedAt: string; seen: boolean }[]> {
      const rows = await db.getAllAsync<{ id: string; unlocked_at: string; seen: number }>('SELECT * FROM achievements ORDER BY unlocked_at DESC', []);
      return rows.map((r) => ({ id: r.id, unlockedAt: r.unlocked_at, seen: r.seen === 1 }));
    },

    async unlock(ids: string[]): Promise<void> {
      if (ids.length === 0) return;
      await db.withTransactionAsync(async () => {
        for (const id of ids) await db.runAsync('INSERT OR IGNORE INTO achievements (id, unlocked_at, seen) VALUES (?, ?, 0)', [id, now()]);
      });
    },

    async markAchievementsSeen(): Promise<void> {
      await db.runAsync('UPDATE achievements SET seen = 1 WHERE seen = 0', []);
    },
  };
  return repo;
}

export type GoalsRepository = ReturnType<typeof createGoalsRepository>;
