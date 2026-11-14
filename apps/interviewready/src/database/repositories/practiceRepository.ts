import { fromJson, toJson, type SqlDatabase } from '@factory/storage';

import type { AnswerFields } from '@/features/answer-builder/templates';
import type { LearningPlan } from '@/features/learning-path/plan';
import type { Rating } from '@/features/mock-interview/session';
import { clock } from '@/services/clock';
import type { AnswerStructure, Difficulty, JobRoleId } from '@/types/content';

/**
 * Personal practice data: Answer Builder drafts, mock interviews and learning paths.
 * Everything typed by the user stays in this local database and is never sent to analytics.
 */

export interface SavedAnswer {
  id: number;
  questionId: string | null;
  title: string;
  structure: AnswerStructure;
  fields: AnswerFields;
  jobRole: JobRoleId | null;
  level: Difficulty | null;
  skill: string | null;
  status: 'draft' | 'final';
  updatedAt: string;
}

export interface MockSessionRecord {
  id: number;
  jobRole: string;
  level: Difficulty;
  minutes: number;
  timerEnabled: boolean;
  questionCount: number;
  startedAt: string;
  completedAt: string | null;
  selfScore: number | null;
}

export interface MockAnswerRecord {
  position: number;
  questionId: string;
  answer: string;
  notes: string;
  skipped: boolean;
  secondsSpent: number;
  rating: Rating | null;
}

export interface PathRecord {
  id: number;
  jobRole: string;
  level: Difficulty;
  goal: string;
  days: number;
  startDay: string;
  plan: LearningPlan;
  status: 'active' | 'completed' | 'archived';
}

export const ANSWER_TEXT_MAX = 6000;

export function createPracticeRepository(db: SqlDatabase) {
  const now = () => clock.now().toISOString();

  return {
    // Answer Builder ------------------------------------------------------------
    async saveAnswer(input: Omit<SavedAnswer, 'id' | 'updatedAt'> & { id?: number }): Promise<number> {
      const fields = Object.fromEntries(Object.entries(input.fields).map(([k, v]) => [k, v.slice(0, ANSWER_TEXT_MAX)]));
      const t = now();
      if (input.id) {
        await db.runAsync(
          'UPDATE answers SET question_id = ?, title = ?, structure = ?, fields = ?, job_role = ?, level = ?, skill = ?, status = ?, updated_at = ? WHERE id = ?',
          [input.questionId, input.title.slice(0, 200), input.structure, toJson(fields), input.jobRole, input.level, input.skill, input.status, t, input.id],
        );
        return input.id;
      }
      const res = await db.runAsync(
        'INSERT INTO answers (question_id, title, structure, fields, job_role, level, skill, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [input.questionId, input.title.slice(0, 200), input.structure, toJson(fields), input.jobRole, input.level, input.skill, input.status, t, t],
      );
      return res.lastInsertRowId;
    },

    async listAnswers(): Promise<SavedAnswer[]> {
      const rows = await db.getAllAsync<{
        id: number;
        question_id: string | null;
        title: string;
        structure: string;
        fields: string;
        job_role: string | null;
        level: string | null;
        skill: string | null;
        status: string;
        updated_at: string;
      }>('SELECT * FROM answers ORDER BY updated_at DESC, id DESC', []);
      return rows.map((r) => ({
        id: r.id,
        questionId: r.question_id,
        title: r.title,
        structure: r.structure as AnswerStructure,
        fields: fromJson<AnswerFields>(r.fields, {}),
        jobRole: r.job_role as JobRoleId | null,
        level: r.level as Difficulty | null,
        skill: r.skill,
        status: r.status === 'final' ? 'final' : 'draft',
        updatedAt: r.updated_at,
      }));
    },

    async getAnswer(id: number): Promise<SavedAnswer | null> {
      return (await this.listAnswers()).find((a) => a.id === id) ?? null;
    },

    async deleteAnswer(id: number): Promise<void> {
      await db.runAsync('DELETE FROM answers WHERE id = ?', [id]);
    },

    // Mock interviews --------------------------------------------------------------
    async startMock(input: { jobRole: string; level: Difficulty; minutes: number; timerEnabled: boolean; questionIds: readonly string[] }): Promise<number> {
      let id = 0;
      const t = now();
      await db.withTransactionAsync(async () => {
        const res = await db.runAsync(
          'INSERT INTO mock_sessions (job_role, level, minutes, timer_enabled, question_count, started_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [input.jobRole, input.level, input.minutes, input.timerEnabled ? 1 : 0, input.questionIds.length, t, t],
        );
        id = res.lastInsertRowId;
        for (const [position, questionId] of input.questionIds.entries()) {
          await db.runAsync('INSERT INTO mock_answers (session_id, position, question_id) VALUES (?, ?, ?)', [id, position, questionId]);
        }
      });
      return id;
    },

    async saveMockAnswer(sessionId: number, a: Omit<MockAnswerRecord, 'questionId'>): Promise<void> {
      await db.runAsync(
        'UPDATE mock_answers SET answer = ?, notes = ?, skipped = ?, seconds_spent = ?, rating = ? WHERE session_id = ? AND position = ?',
        [a.answer.slice(0, ANSWER_TEXT_MAX), a.notes.slice(0, ANSWER_TEXT_MAX), a.skipped ? 1 : 0, Math.max(0, Math.round(a.secondsSpent)), a.rating ? toJson(a.rating) : null, sessionId, a.position],
      );
    },

    async completeMock(sessionId: number, selfScore: number | null, notes: string | null): Promise<void> {
      const t = now();
      await db.runAsync('UPDATE mock_sessions SET completed_at = ?, self_score = ?, notes = ?, updated_at = ? WHERE id = ?', [t, selfScore, notes, t, sessionId]);
    },

    async getMockAnswers(sessionId: number): Promise<MockAnswerRecord[]> {
      const rows = await db.getAllAsync<{ position: number; question_id: string; answer: string; notes: string; skipped: number; seconds_spent: number; rating: string | null }>(
        'SELECT position, question_id, answer, notes, skipped, seconds_spent, rating FROM mock_answers WHERE session_id = ? ORDER BY position',
        [sessionId],
      );
      return rows.map((r) => ({
        position: r.position,
        questionId: r.question_id,
        answer: r.answer,
        notes: r.notes,
        skipped: r.skipped === 1,
        secondsSpent: r.seconds_spent,
        rating: fromJson<Rating | null>(r.rating, null),
      }));
    },

    async listMocks(limit = 20): Promise<MockSessionRecord[]> {
      const rows = await db.getAllAsync<{
        id: number;
        job_role: string;
        level: string;
        minutes: number;
        timer_enabled: number;
        question_count: number;
        started_at: string;
        completed_at: string | null;
        self_score: number | null;
      }>('SELECT * FROM mock_sessions ORDER BY started_at DESC, id DESC LIMIT ?', [Math.max(1, Math.floor(limit))]);
      return rows.map((r) => ({
        id: r.id,
        jobRole: r.job_role,
        level: r.level as Difficulty,
        minutes: r.minutes,
        timerEnabled: r.timer_enabled === 1,
        questionCount: r.question_count,
        startedAt: r.started_at,
        completedAt: r.completed_at,
        selfScore: r.self_score,
      }));
    },

    /** Mock interviews started on a local day (for the free daily limit). */
    async mocksStartedOn(day: string): Promise<number> {
      const rows = await db.getAllAsync<{ started_at: string }>('SELECT started_at FROM mock_sessions', []);
      return rows.filter((r) => clock.dayOf(r.started_at) === day).length;
    },

    // Learning paths -----------------------------------------------------------------
    async createPath(input: Omit<PathRecord, 'id' | 'status'>): Promise<number> {
      const t = now();
      let id = 0;
      await db.withTransactionAsync(async () => {
        await db.runAsync("UPDATE learning_paths SET status = 'archived', updated_at = ? WHERE status = 'active'", [t]);
        const res = await db.runAsync(
          "INSERT INTO learning_paths (job_role, level, goal, days, start_day, plan, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?)",
          [input.jobRole, input.level, input.goal, input.days, input.startDay, toJson(input.plan), t, t],
        );
        id = res.lastInsertRowId;
      });
      return id;
    },

    async activePath(): Promise<PathRecord | null> {
      const r = await db.getFirstAsync<{ id: number; job_role: string; level: string; goal: string; days: number; start_day: string; plan: string; status: string }>(
        "SELECT * FROM learning_paths WHERE status IN ('active', 'completed') ORDER BY id DESC LIMIT 1",
        [],
      );
      if (!r) return null;
      const plan = fromJson<LearningPlan | null>(r.plan, null);
      if (!plan) return null;
      return { id: r.id, jobRole: r.job_role, level: r.level as Difficulty, goal: r.goal, days: r.days, startDay: r.start_day, plan, status: r.status as PathRecord['status'] };
    },

    async completedTasks(pathId: number): Promise<Set<string>> {
      const rows = await db.getAllAsync<{ task_id: string }>('SELECT task_id FROM path_progress WHERE path_id = ?', [pathId]);
      return new Set(rows.map((r) => r.task_id));
    },

    async setTaskDone(pathId: number, dayIndex: number, taskId: string, done: boolean): Promise<void> {
      if (done) {
        await db.runAsync('INSERT OR IGNORE INTO path_progress (path_id, day_index, task_id, completed_at) VALUES (?, ?, ?, ?)', [pathId, dayIndex, taskId, now()]);
      } else {
        await db.runAsync('DELETE FROM path_progress WHERE path_id = ? AND task_id = ?', [pathId, taskId]);
      }
    },

    async setPathStatus(pathId: number, status: PathRecord['status']): Promise<void> {
      await db.runAsync('UPDATE learning_paths SET status = ?, updated_at = ? WHERE id = ?', [status, now(), pathId]);
    },
  };
}
