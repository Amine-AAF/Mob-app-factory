import type { SrsCard } from '@factory/app-core';
import { placeholders, type SqlDatabase } from '@factory/storage';

import type { RoundAnswer } from '@/features/quizzes/engine';
import { clock } from '@/services/clock';

/** Item kinds that can be scheduled for spaced repetition. */
export type ReviewItemType = 'quiz' | 'question';

export type QuizMode = 'quiz' | 'review' | 'flashcards';

export interface QuizAttempt {
  id: number;
  mode: QuizMode;
  category: string | null;
  total: number;
  correct: number;
  completedAt: string;
}

interface CardRow {
  item_id: string;
  repetitions: number;
  interval_days: number;
  ease: number;
  due_day: string;
}

/**
 * Quiz attempts and spaced-repetition cards. Only ids of bundled content and
 * numbers are stored: no free text, so nothing personal leaves this table.
 */
export function createReviewRepository(db: SqlDatabase) {
  return {
    /** Saves a finished quiz and its answers atomically. Returns the attempt id. */
    async saveAttempt(input: { mode: QuizMode; category: string | null; startedAt: string; answers: readonly RoundAnswer[] }): Promise<number> {
      let id = 0;
      const correct = input.answers.filter((a) => a.correct).length;
      await db.withTransactionAsync(async () => {
        const res = await db.runAsync(
          'INSERT INTO quiz_attempts (mode, category, total, correct, started_at, completed_at) VALUES (?, ?, ?, ?, ?, ?)',
          [input.mode, input.category, input.answers.length, correct, input.startedAt, clock.now().toISOString()],
        );
        id = res.lastInsertRowId;
        for (const [position, a] of input.answers.entries()) {
          await db.runAsync('INSERT INTO quiz_responses (attempt_id, position, quiz_id, chosen_index, correct) VALUES (?, ?, ?, ?, ?)', [
            id,
            position,
            a.itemId,
            a.chosenIndex,
            a.correct ? 1 : 0,
          ]);
        }
      });
      return id;
    },

    async recentAttempts(limit = 20): Promise<QuizAttempt[]> {
      const rows = await db.getAllAsync<{ id: number; mode: string; category: string | null; total: number; correct: number; completed_at: string }>(
        'SELECT id, mode, category, total, correct, completed_at FROM quiz_attempts ORDER BY completed_at DESC, id DESC LIMIT ?',
        [Math.max(1, Math.floor(limit))],
      );
      return rows.map((r) => ({ id: r.id, mode: r.mode as QuizMode, category: r.category, total: r.total, correct: r.correct, completedAt: r.completed_at }));
    },

    /** Accuracy per quiz item (for "difficult questions" and statistics). */
    async itemStats(): Promise<Map<string, { answered: number; correct: number }>> {
      const rows = await db.getAllAsync<{ quiz_id: string; answered: number; correct: number }>(
        'SELECT quiz_id, COUNT(*) AS answered, SUM(correct) AS correct FROM quiz_responses GROUP BY quiz_id',
        [],
      );
      return new Map(rows.map((r) => [r.quiz_id, { answered: r.answered, correct: r.correct ?? 0 }]));
    },

    async getCards(type: ReviewItemType, ids?: readonly string[]): Promise<Map<string, SrsCard>> {
      const rows = ids?.length
        ? await db.getAllAsync<CardRow>(
            `SELECT item_id, repetitions, interval_days, ease, due_day FROM srs_cards WHERE item_type = ? AND item_id IN ${placeholders(ids.length)}`,
            [type, ...ids],
          )
        : await db.getAllAsync<CardRow>('SELECT item_id, repetitions, interval_days, ease, due_day FROM srs_cards WHERE item_type = ?', [type]);
      return new Map(rows.map((r) => [r.item_id, { repetitions: r.repetitions, intervalDays: r.interval_days, ease: r.ease, dueDay: r.due_day }]));
    },

    async saveCard(type: ReviewItemType, itemId: string, card: SrsCard, lapsed: boolean): Promise<void> {
      await db.runAsync(
        `INSERT INTO srs_cards (item_type, item_id, repetitions, interval_days, ease, due_day, lapses, last_reviewed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(item_type, item_id) DO UPDATE SET repetitions = excluded.repetitions, interval_days = excluded.interval_days,
           ease = excluded.ease, due_day = excluded.due_day, lapses = srs_cards.lapses + excluded.lapses, last_reviewed_at = excluded.last_reviewed_at`,
        [type, itemId, card.repetitions, card.intervalDays, card.ease, card.dueDay, lapsed ? 1 : 0, clock.now().toISOString()],
      );
    },

    async dueCount(type: ReviewItemType, today: string): Promise<number> {
      const r = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM srs_cards WHERE item_type = ? AND due_day <= ?', [type, today]);
      return r?.n ?? 0;
    },
  };
}
