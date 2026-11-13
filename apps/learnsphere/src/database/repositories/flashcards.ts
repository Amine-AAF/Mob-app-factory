import { toDayKey } from '@factory/app-core';
import { fromJson, toJson, type SqlDatabase } from '@factory/storage';

import { scheduleReview, selectDueCards, type FlashcardGrade, type SchedulerOptions, type SelectionLimits } from '@/features/flashcards/scheduler';
import { clock } from '@/services/clock';
import { newId } from '@/utils/id';
import { likePattern } from '@/utils/text';

export type CardDifficulty = 'easy' | 'medium' | 'hard';

export interface Flashcard {
  id: string;
  subjectId: string | null;
  chapterId: string | null;
  front: string;
  back: string;
  tags: string[];
  difficulty: CardDifficulty;
  favorite: boolean;
  repetitions: number;
  intervalDays: number;
  ease: number;
  dueDay: string;
  lapses: number;
  lastReviewedAt: string | null;
  createdAt: string;
}

export type FlashcardInput = Pick<Flashcard, 'subjectId' | 'chapterId' | 'front' | 'back' | 'tags' | 'difficulty'>;

interface CardRow {
  id: string;
  subject_id: string | null;
  chapter_id: string | null;
  front: string;
  back: string;
  tags: string;
  difficulty: CardDifficulty;
  favorite: number;
  repetitions: number;
  interval_days: number;
  ease: number;
  due_day: string;
  lapses: number;
  last_reviewed_at: string | null;
  created_at: string;
}

const toCard = (r: CardRow): Flashcard => ({
  id: r.id,
  subjectId: r.subject_id,
  chapterId: r.chapter_id,
  front: r.front,
  back: r.back,
  tags: fromJson<string[]>(r.tags, []),
  difficulty: r.difficulty,
  favorite: r.favorite === 1,
  repetitions: r.repetitions,
  intervalDays: r.interval_days,
  ease: r.ease,
  dueDay: r.due_day,
  lapses: r.lapses,
  lastReviewedAt: r.last_reviewed_at,
  createdAt: r.created_at,
});

export interface CardQuery {
  subjectId?: string | null;
  query?: string;
  favoritesOnly?: boolean;
  difficulty?: CardDifficulty | null;
}

export interface ReviewRecord {
  id: string;
  flashcardId: string;
  grade: FlashcardGrade;
  day: string;
  reviewedAt: string;
  intervalBefore: number;
  intervalAfter: number;
}

export function createFlashcardsRepository(db: SqlDatabase) {
  const now = () => clock.now().toISOString();

  function where(q: CardQuery): { sql: string; params: string[] } {
    const parts: string[] = [];
    const params: string[] = [];
    if (q.subjectId) {
      parts.push('subject_id = ?');
      params.push(q.subjectId);
    }
    if (q.favoritesOnly) parts.push('favorite = 1');
    if (q.difficulty) {
      parts.push('difficulty = ?');
      params.push(q.difficulty);
    }
    if (q.query?.trim()) {
      parts.push("(LOWER(front) LIKE ? ESCAPE '\\' OR LOWER(back) LIKE ? ESCAPE '\\' OR LOWER(tags) LIKE ? ESCAPE '\\')");
      const p = likePattern(q.query);
      params.push(p, p, p);
    }
    return { sql: parts.length ? `WHERE ${parts.join(' AND ')}` : '', params };
  }

  return {
    async list(q: CardQuery = {}): Promise<Flashcard[]> {
      const w = where(q);
      return (await db.getAllAsync<CardRow>(`SELECT * FROM flashcards ${w.sql} ORDER BY created_at DESC`, w.params)).map(toCard);
    },

    async get(id: string): Promise<Flashcard | null> {
      const r = await db.getFirstAsync<CardRow>('SELECT * FROM flashcards WHERE id = ?', [id]);
      return r ? toCard(r) : null;
    },

    async count(): Promise<number> {
      return (await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM flashcards', []))?.n ?? 0;
    },

    async create(input: FlashcardInput): Promise<string> {
      const id = newId('f');
      const t = now();
      await db.runAsync('INSERT INTO flashcards (id, subject_id, chapter_id, front, back, tags, difficulty, due_day, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
        id,
        input.subjectId,
        input.chapterId,
        input.front.trim(),
        input.back.trim(),
        toJson(input.tags),
        input.difficulty,
        clock.today(),
        t,
        t,
      ]);
      return id;
    },

    async update(id: string, input: FlashcardInput): Promise<void> {
      await db.runAsync('UPDATE flashcards SET subject_id = ?, chapter_id = ?, front = ?, back = ?, tags = ?, difficulty = ?, updated_at = ? WHERE id = ?', [
        input.subjectId,
        input.chapterId,
        input.front.trim(),
        input.back.trim(),
        toJson(input.tags),
        input.difficulty,
        now(),
        id,
      ]);
    },

    async setFavorite(id: string, favorite: boolean): Promise<void> {
      await db.runAsync('UPDATE flashcards SET favorite = ?, updated_at = ? WHERE id = ?', [favorite ? 1 : 0, now(), id]);
    },

    async remove(id: string): Promise<void> {
      await db.runAsync('DELETE FROM flashcards WHERE id = ?', [id]);
    },

    /** Resets the learning history of a card (keeps its content). */
    async resetProgress(id: string): Promise<void> {
      await db.runAsync('UPDATE flashcards SET repetitions = 0, interval_days = 0, ease = 2.5, lapses = 0, due_day = ?, last_reviewed_at = NULL, updated_at = ? WHERE id = ?', [clock.today(), now(), id]);
    },

    /** Cards to review today, chosen from their review history (see selectDueCards). */
    async dueCards(q: CardQuery, limits: SelectionLimits): Promise<Flashcard[]> {
      const today = clock.today();
      const w = where(q);
      const rows = await db.getAllAsync<CardRow>(`SELECT * FROM flashcards ${w.sql ? `${w.sql} AND` : 'WHERE'} due_day <= ? ORDER BY created_at ASC`, [...w.params, today]);
      // New cards already introduced today count against the daily new-card limit.
      const introduced = await db.getFirstAsync<{ n: number }>(
        "SELECT COUNT(DISTINCT r.flashcard_id) AS n FROM flashcard_reviews r WHERE r.day = ? AND NOT EXISTS (SELECT 1 FROM flashcard_reviews p WHERE p.flashcard_id = r.flashcard_id AND p.day < ?)",
        [today, today],
      );
      const reviewedToday = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM flashcard_reviews WHERE day = ?', [today]);
      const cards = rows.map(toCard);
      return selectDueCards(cards, today, {
        newCards: Math.max(0, limits.newCards - (introduced?.n ?? 0)),
        reviews: Math.max(0, limits.reviews - Math.max(0, (reviewedToday?.n ?? 0) - (introduced?.n ?? 0))),
      });
    },

    async dueCount(): Promise<number> {
      return (await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM flashcards WHERE due_day <= ?', [clock.today()]))?.n ?? 0;
    },

    /** Applies a grade: updates the scheduling state and records the review, atomically. */
    async review(id: string, grade: FlashcardGrade, options: SchedulerOptions = {}, durationMs = 0): Promise<Flashcard | null> {
      let updated: Flashcard | null = null;
      await db.withTransactionAsync(async () => {
        const r = await db.getFirstAsync<CardRow>('SELECT * FROM flashcards WHERE id = ?', [id]);
        if (!r) return;
        const card = toCard(r);
        const today = toDayKey(clock.now());
        const next = scheduleReview({ repetitions: card.repetitions, intervalDays: card.intervalDays, ease: card.ease, dueDay: card.dueDay, lapses: card.lapses }, grade, today, options);
        const t = now();
        await db.runAsync('UPDATE flashcards SET repetitions = ?, interval_days = ?, ease = ?, due_day = ?, lapses = ?, last_reviewed_at = ?, updated_at = ? WHERE id = ?', [
          next.repetitions,
          next.intervalDays,
          next.ease,
          next.dueDay,
          next.lapses,
          t,
          t,
          id,
        ]);
        await db.runAsync('INSERT INTO flashcard_reviews (id, flashcard_id, grade, day, reviewed_at, interval_before, interval_after, duration_ms) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
          newId('fr'),
          id,
          grade,
          today,
          t,
          card.intervalDays,
          next.intervalDays,
          Math.max(0, Math.round(durationMs)),
        ]);
        updated = { ...card, ...next, lastReviewedAt: t };
      });
      return updated;
    },

    async history(id: string): Promise<ReviewRecord[]> {
      const rows = await db.getAllAsync<{ id: string; flashcard_id: string; grade: FlashcardGrade; day: string; reviewed_at: string; interval_before: number; interval_after: number }>(
        'SELECT * FROM flashcard_reviews WHERE flashcard_id = ? ORDER BY reviewed_at DESC',
        [id],
      );
      return rows.map((r) => ({ id: r.id, flashcardId: r.flashcard_id, grade: r.grade, day: r.day, reviewedAt: r.reviewed_at, intervalBefore: r.interval_before, intervalAfter: r.interval_after }));
    },

    async reviewsSince(day: string): Promise<{ day: string; grade: FlashcardGrade; subjectId: string | null }[]> {
      return db.getAllAsync<{ day: string; grade: FlashcardGrade; subjectId: string | null }>(
        'SELECT r.day, r.grade, f.subject_id AS subjectId FROM flashcard_reviews r JOIN flashcards f ON f.id = r.flashcard_id WHERE r.day >= ? ORDER BY r.day',
        [day],
      );
    },

    async maturity(): Promise<{ new: number; learning: number; young: number; mature: number }> {
      const r = await db.getFirstAsync<{ n: number; l: number; y: number; m: number }>(
        `SELECT SUM(CASE WHEN last_reviewed_at IS NULL THEN 1 ELSE 0 END) AS n,
                SUM(CASE WHEN last_reviewed_at IS NOT NULL AND interval_days < 6 THEN 1 ELSE 0 END) AS l,
                SUM(CASE WHEN last_reviewed_at IS NOT NULL AND interval_days >= 6 AND interval_days < 21 THEN 1 ELSE 0 END) AS y,
                SUM(CASE WHEN last_reviewed_at IS NOT NULL AND interval_days >= 21 THEN 1 ELSE 0 END) AS m
         FROM flashcards`,
        [],
      );
      return { new: r?.n ?? 0, learning: r?.l ?? 0, young: r?.y ?? 0, mature: r?.m ?? 0 };
    },
  };
}

export type FlashcardsRepository = ReturnType<typeof createFlashcardsRepository>;
