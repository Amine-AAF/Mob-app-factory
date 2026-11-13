import { fromJson, toJson, type SqlDatabase } from '@factory/storage';

import type { QuizQuestion } from '@/content/types';
import type { Answer, QuizMode } from '@/features/quiz/engine';
import { clock } from '@/services/clock';
import { newId } from '@/utils/id';

interface QuestionRow {
  id: string;
  bank_id: string;
  subject_id: string | null;
  source: 'bundle' | 'user';
  type: QuizQuestion['type'];
  difficulty: number;
  prompt: string;
  payload: string;
  explanation: string;
  tags: string;
}

export interface StoredQuestion {
  question: QuizQuestion;
  bankId: string;
  subjectId: string | null;
  source: 'bundle' | 'user';
}

/** Type-specific fields stored as JSON in `payload`. */
export function questionPayload(q: QuizQuestion): Record<string, unknown> {
  switch (q.type) {
    case 'single':
      return { options: q.options, correct: q.correct };
    case 'multiple':
      return { options: q.options, correct: q.correct };
    case 'true_false':
      return { correct: q.correct };
    case 'short_answer':
      return { accepted: q.accepted };
    case 'matching':
      return { pairs: q.pairs };
  }
}

export function rowToQuestion(r: QuestionRow): QuizQuestion {
  const payload = fromJson<Record<string, unknown>>(r.payload, {});
  return {
    id: r.id,
    type: r.type,
    difficulty: (r.difficulty === 2 || r.difficulty === 3 ? r.difficulty : 1) as 1 | 2 | 3,
    prompt: r.prompt,
    explanation: r.explanation,
    tags: fromJson<string[]>(r.tags, []),
    ...payload,
  } as QuizQuestion;
}

export interface QuizAttempt {
  id: string;
  bankId: string;
  subjectId: string | null;
  mode: QuizMode;
  startedAt: string;
  finishedAt: string;
  day: string;
  durationMs: number;
  timeLimitS: number | null;
  total: number;
  correct: number;
  score: number;
  answers: { questionId: string; correct: boolean; answer: Answer }[];
}

export function createQuizRepository(db: SqlDatabase) {
  const now = () => clock.now().toISOString();

  return {
    async questions(bankId: string): Promise<QuizQuestion[]> {
      return (await db.getAllAsync<QuestionRow>('SELECT * FROM quiz_questions WHERE bank_id = ? ORDER BY id', [bankId])).map(rowToQuestion);
    },

    async questionsByIds(ids: string[]): Promise<QuizQuestion[]> {
      if (ids.length === 0) return [];
      const rows = await db.getAllAsync<QuestionRow>(`SELECT * FROM quiz_questions WHERE id IN (${ids.map(() => '?').join(', ')})`, ids);
      const byId = new Map(rows.map((r) => [r.id, rowToQuestion(r)]));
      return ids.map((id) => byId.get(id)).filter((q): q is QuizQuestion => !!q);
    },

    async bankCounts(): Promise<Record<string, number>> {
      const rows = await db.getAllAsync<{ bank_id: string; n: number }>('SELECT bank_id, COUNT(*) AS n FROM quiz_questions GROUP BY bank_id', []);
      return Object.fromEntries(rows.map((r) => [r.bank_id, r.n]));
    },

    async countUserQuestions(): Promise<number> {
      return (await db.getFirstAsync<{ n: number }>("SELECT COUNT(*) AS n FROM quiz_questions WHERE source = 'user'", []))?.n ?? 0;
    },

    async getUserQuestion(id: string): Promise<StoredQuestion | null> {
      const r = await db.getFirstAsync<QuestionRow>("SELECT * FROM quiz_questions WHERE id = ? AND source = 'user'", [id]);
      return r ? { question: rowToQuestion(r), bankId: r.bank_id, subjectId: r.subject_id, source: r.source } : null;
    },

    /** User questions live in a bank named after their subject. */
    /** Inserts (id = 'draft' or empty) or updates a user question. */
    async saveUserQuestion(subjectId: string, question: QuizQuestion): Promise<string> {
      const id = question.id && question.id !== 'draft' ? question.id : newId('uq');
      const full = { ...question, id } as QuizQuestion;
      const t = now();
      await db.runAsync(
        `INSERT INTO quiz_questions (id, bank_id, subject_id, source, type, difficulty, prompt, payload, explanation, tags, created_at, updated_at)
         VALUES (?, ?, ?, 'user', ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET type = excluded.type, difficulty = excluded.difficulty, prompt = excluded.prompt,
           payload = excluded.payload, explanation = excluded.explanation, tags = excluded.tags, updated_at = excluded.updated_at`,
        [id, subjectId, subjectId, full.type, full.difficulty, full.prompt.trim(), toJson(questionPayload(full)), full.explanation.trim(), toJson(full.tags ?? []), t, t],
      );
      return id;
    },

    async removeUserQuestion(id: string): Promise<void> {
      await db.runAsync("DELETE FROM quiz_questions WHERE id = ? AND source = 'user'", [id]);
    },

    async saveAttempt(a: Omit<QuizAttempt, 'id'>): Promise<string> {
      const id = newId('qa');
      await db.runAsync(
        'INSERT INTO quiz_attempts (id, bank_id, subject_id, mode, started_at, finished_at, day, duration_ms, time_limit_s, total, correct, score, answers) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, a.bankId, a.subjectId, a.mode, a.startedAt, a.finishedAt, a.day, Math.round(a.durationMs), a.timeLimitS, a.total, a.correct, a.score, toJson(a.answers)],
      );
      return id;
    },

    async attempts(opts: { id?: string; bankId?: string; since?: string; limit?: number } = {}): Promise<QuizAttempt[]> {
      const where: string[] = [];
      const params: (string | number)[] = [];
      if (opts.id) {
        where.push('id = ?');
        params.push(opts.id);
      }
      if (opts.bankId) {
        where.push('bank_id = ?');
        params.push(opts.bankId);
      }
      if (opts.since) {
        where.push('day >= ?');
        params.push(opts.since);
      }
      params.push(opts.limit ?? 200);
      const rows = await db.getAllAsync<{
        id: string;
        bank_id: string;
        subject_id: string | null;
        mode: QuizMode;
        started_at: string;
        finished_at: string;
        day: string;
        duration_ms: number;
        time_limit_s: number | null;
        total: number;
        correct: number;
        score: number;
        answers: string;
      }>(`SELECT * FROM quiz_attempts ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY finished_at DESC LIMIT ?`, params);
      return rows.map((r) => ({
        id: r.id,
        bankId: r.bank_id,
        subjectId: r.subject_id,
        mode: r.mode,
        startedAt: r.started_at,
        finishedAt: r.finished_at,
        day: r.day,
        durationMs: r.duration_ms,
        timeLimitS: r.time_limit_s,
        total: r.total,
        correct: r.correct,
        score: r.score,
        answers: fromJson(r.answers, []),
      }));
    },

    async getAttempt(id: string): Promise<QuizAttempt | null> {
      return (await this.attempts({ id, limit: 1 }))[0] ?? null;
    },
  };
}

export type QuizRepository = ReturnType<typeof createQuizRepository>;
