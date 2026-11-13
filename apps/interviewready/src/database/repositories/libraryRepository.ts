import type { SqlDatabase } from '@factory/storage';

import { clock } from '@/services/clock';

/**
 * Favorites, personal notes, study history and the question-of-the-day log.
 * All local; nothing here is ever sent anywhere.
 */

export interface HistoryEntry {
  questionId: string;
  viewCount: number;
  lastViewedAt: string;
  studiedAt: string | null;
}

export interface DailyEntry {
  day: string;
  questionId: string;
  studied: boolean;
}

export const NOTE_MAX_LENGTH = 5000;

export function createLibraryRepository(db: SqlDatabase) {
  const now = () => clock.now().toISOString();

  return {
    // Favorites ---------------------------------------------------------------
    async favoriteIds(): Promise<string[]> {
      const rows = await db.getAllAsync<{ question_id: string }>('SELECT question_id FROM favorites ORDER BY created_at DESC', []);
      return rows.map((r) => r.question_id);
    },

    async favoriteCount(): Promise<number> {
      const r = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM favorites', []);
      return r?.n ?? 0;
    },

    async isFavorite(questionId: string): Promise<boolean> {
      const r = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM favorites WHERE question_id = ?', [questionId]);
      return (r?.n ?? 0) > 0;
    },

    async setFavorite(questionId: string, favorite: boolean): Promise<void> {
      if (favorite) await db.runAsync('INSERT OR IGNORE INTO favorites (question_id, created_at) VALUES (?, ?)', [questionId, now()]);
      else await db.runAsync('DELETE FROM favorites WHERE question_id = ?', [questionId]);
    },

    // Notes -------------------------------------------------------------------
    async getNote(questionId: string): Promise<string> {
      const r = await db.getFirstAsync<{ body: string }>('SELECT body FROM notes WHERE question_id = ?', [questionId]);
      return r?.body ?? '';
    },

    /** Saves a note; an empty note deletes it. Overlong input is truncated, never rejected. */
    async saveNote(questionId: string, body: string): Promise<void> {
      const text = body.slice(0, NOTE_MAX_LENGTH);
      if (text.trim().length === 0) {
        await db.runAsync('DELETE FROM notes WHERE question_id = ?', [questionId]);
        return;
      }
      await db.runAsync(
        'INSERT INTO notes (question_id, body, updated_at) VALUES (?, ?, ?) ON CONFLICT(question_id) DO UPDATE SET body = excluded.body, updated_at = excluded.updated_at',
        [questionId, text, now()],
      );
    },

    async notedIds(): Promise<string[]> {
      const rows = await db.getAllAsync<{ question_id: string }>('SELECT question_id FROM notes ORDER BY updated_at DESC', []);
      return rows.map((r) => r.question_id);
    },

    // Study history -------------------------------------------------------------
    async recordView(questionId: string): Promise<void> {
      const t = now();
      await db.runAsync(
        `INSERT INTO study_history (question_id, view_count, first_viewed_at, last_viewed_at, updated_at) VALUES (?, 1, ?, ?, ?)
         ON CONFLICT(question_id) DO UPDATE SET view_count = view_count + 1, last_viewed_at = excluded.last_viewed_at, updated_at = excluded.updated_at`,
        [questionId, t, t, t],
      );
    },

    /** Marks as studied (idempotent). Returns true only the first time, for activity counters. */
    async markStudied(questionId: string, studied = true): Promise<boolean> {
      const t = now();
      const before = await db.getFirstAsync<{ studied_at: string | null }>('SELECT studied_at FROM study_history WHERE question_id = ?', [questionId]);
      if (!before) {
        await db.runAsync(
          'INSERT INTO study_history (question_id, view_count, first_viewed_at, last_viewed_at, studied_at, updated_at) VALUES (?, 0, ?, ?, ?, ?)',
          [questionId, t, t, studied ? t : null, t],
        );
        return studied;
      }
      await db.runAsync('UPDATE study_history SET studied_at = ?, updated_at = ? WHERE question_id = ?', [studied ? (before.studied_at ?? t) : null, t, questionId]);
      return studied && before.studied_at === null;
    },

    async studiedIds(): Promise<Set<string>> {
      const rows = await db.getAllAsync<{ question_id: string }>('SELECT question_id FROM study_history WHERE studied_at IS NOT NULL', []);
      return new Set(rows.map((r) => r.question_id));
    },

    async recentHistory(limit = 20): Promise<HistoryEntry[]> {
      const rows = await db.getAllAsync<{ question_id: string; view_count: number; last_viewed_at: string; studied_at: string | null }>(
        'SELECT question_id, view_count, last_viewed_at, studied_at FROM study_history ORDER BY last_viewed_at DESC LIMIT ?',
        [Math.max(1, Math.floor(limit))],
      );
      return rows.map((r) => ({ questionId: r.question_id, viewCount: r.view_count, lastViewedAt: r.last_viewed_at, studiedAt: r.studied_at }));
    },

    // Question of the day --------------------------------------------------------
    /** Logs the day's question once (first view wins, so the history is stable). */
    async logDaily(day: string, questionId: string): Promise<void> {
      await db.runAsync('INSERT OR IGNORE INTO daily_questions (day, question_id, viewed_at, studied) VALUES (?, ?, ?, 0)', [day, questionId, now()]);
    },

    async markDailyStudied(day: string): Promise<void> {
      await db.runAsync('UPDATE daily_questions SET studied = 1 WHERE day = ?', [day]);
    },

    async dailyHistory(limit = 30): Promise<DailyEntry[]> {
      const rows = await db.getAllAsync<{ day: string; question_id: string; studied: number }>(
        'SELECT day, question_id, studied FROM daily_questions ORDER BY day DESC LIMIT ?',
        [Math.max(1, Math.floor(limit))],
      );
      return rows.map((r) => ({ day: r.day, questionId: r.question_id, studied: r.studied === 1 }));
    },
  };
}
