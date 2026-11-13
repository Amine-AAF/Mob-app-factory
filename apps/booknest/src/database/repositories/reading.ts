import type { SqlDatabase, SqlValue } from '@factory/storage';

import { clock } from '@/services/clock';
import type { AudiobookProgress, AudiobookUpdate, CalendarDay, ReadingRecord, ReadingSession, ReadingStatus, SessionTimer } from '@/types';
import { newId } from '@/utils';

type Row = Record<string, SqlValue>;
const s = (v: SqlValue | undefined): string | null => (v == null ? null : String(v));
const n = (v: SqlValue | undefined): number | null => (v == null ? null : Number(v));

export function mapRecord(r: Row): ReadingRecord {
  return {
    id: String(r.id),
    bookId: String(r.book_id),
    attempt: Number(r.attempt),
    status: String(r.status) as ReadingStatus,
    startedOn: s(r.started_on),
    finishedOn: s(r.finished_on),
    currentPage: Number(r.current_page),
    isCurrent: Number(r.is_current) === 1,
    notes: s(r.notes),
    createdAt: String(r.created_at),
    updatedAt: String(r.updated_at),
  };
}

export function mapSession(r: Row): ReadingSession {
  return {
    id: String(r.id),
    bookId: String(r.book_id),
    recordId: s(r.record_id),
    day: String(r.day),
    startedAt: String(r.started_at),
    endedAt: String(r.ended_at),
    durationSec: Number(r.duration_sec),
    startPage: n(r.start_page),
    endPage: n(r.end_page),
    startPositionSec: n(r.start_position_sec),
    endPositionSec: n(r.end_position_sec),
    notes: s(r.notes),
    source: String(r.source) as 'timer' | 'manual',
    createdAt: String(r.created_at),
  };
}

export interface SessionWrite {
  bookId: string;
  recordId: string | null;
  day: string;
  startedAt: string;
  endedAt: string;
  durationSec: number;
  startPage: number | null;
  endPage: number | null;
  startPositionSec?: number | null;
  endPositionSec?: number | null;
  notes: string | null;
  source: 'timer' | 'manual';
}

export function createReadingRepository(db: SqlDatabase) {
  return {
    async current(bookId: string): Promise<ReadingRecord | null> {
      const r = await db.getFirstAsync<Row>('SELECT * FROM reading_records WHERE book_id = ? AND is_current = 1', [bookId]);
      return r ? mapRecord(r) : null;
    },

    async history(bookId: string): Promise<ReadingRecord[]> {
      const rows = await db.getAllAsync<Row>('SELECT * FROM reading_records WHERE book_id = ? ORDER BY attempt DESC', [bookId]);
      return rows.map(mapRecord);
    },

    async allRecords(): Promise<ReadingRecord[]> {
      const rows = await db.getAllAsync<Row>('SELECT * FROM reading_records', []);
      return rows.map(mapRecord);
    },

    async updateRecord(id: string, patch: Partial<Pick<ReadingRecord, 'status' | 'startedOn' | 'finishedOn' | 'currentPage' | 'notes'>>): Promise<void> {
      const map: Record<string, string> = { status: 'status', startedOn: 'started_on', finishedOn: 'finished_on', currentPage: 'current_page', notes: 'notes' };
      const keys = Object.keys(patch).filter((k) => k in map) as (keyof typeof patch)[];
      if (!keys.length) return;
      await db.runAsync(
        `UPDATE reading_records SET ${keys.map((k) => `${map[k]} = ?`).join(', ')}, updated_at = ? WHERE id = ?`,
        [...keys.map((k) => (patch[k] ?? null) as SqlValue), clock.iso(), id],
      );
    },

    /** Closes the current attempt and opens a new one (re-read). History is preserved. */
    async startNewAttempt(bookId: string, today: string): Promise<string> {
      const id = newId();
      const now = clock.iso();
      await db.withTransactionAsync(async () => {
        const prev = await db.getFirstAsync<{ attempt: number }>('SELECT MAX(attempt) AS attempt FROM reading_records WHERE book_id = ?', [bookId]);
        await db.runAsync('UPDATE reading_records SET is_current = 0, updated_at = ? WHERE book_id = ? AND is_current = 1', [now, bookId]);
        await db.runAsync(
          `INSERT INTO reading_records (id, book_id, attempt, status, started_on, current_page, is_current, created_at, updated_at) VALUES (?, ?, ?, 'reading', ?, 0, 1, ?, ?)`,
          [id, bookId, (prev?.attempt ?? 0) + 1, today, now, now],
        );
      });
      return id;
    },

    async deleteAttempt(recordId: string): Promise<void> {
      await db.runAsync('DELETE FROM reading_records WHERE id = ? AND is_current = 0', [recordId]);
    },

    /* ------------------------------------------------------------ sessions */

    async addSession(w: SessionWrite): Promise<string> {
      const id = newId();
      await db.runAsync(
        `INSERT INTO reading_sessions (id, book_id, record_id, day, started_at, ended_at, duration_sec, start_page, end_page, start_position_sec, end_position_sec, notes, source, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, w.bookId, w.recordId, w.day, w.startedAt, w.endedAt, w.durationSec, w.startPage, w.endPage, w.startPositionSec ?? null, w.endPositionSec ?? null, w.notes, w.source, clock.iso()],
      );
      return id;
    },

    async deleteSession(id: string): Promise<void> {
      await db.runAsync('DELETE FROM reading_sessions WHERE id = ?', [id]);
    },

    async sessionsForBook(bookId: string): Promise<ReadingSession[]> {
      const rows = await db.getAllAsync<Row>('SELECT * FROM reading_sessions WHERE book_id = ? ORDER BY started_at DESC', [bookId]);
      return rows.map(mapSession);
    },

    async sessions(opts: { from?: string; to?: string; limit?: number } = {}): Promise<(ReadingSession & { bookTitle: string })[]> {
      const where: string[] = [];
      const params: SqlValue[] = [];
      if (opts.from) (where.push('s.day >= ?'), params.push(opts.from));
      if (opts.to) (where.push('s.day <= ?'), params.push(opts.to));
      const rows = await db.getAllAsync<Row>(
        `SELECT s.*, b.title AS book_title FROM reading_sessions s JOIN books b ON b.id = s.book_id
          ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY s.started_at DESC${opts.limit ? ` LIMIT ${Math.floor(opts.limit)}` : ''}`,
        params,
      );
      return rows.map((r) => ({ ...mapSession(r), bookTitle: String(r.book_title) }));
    },

    async lastSessionByBook(): Promise<Map<string, string>> {
      const rows = await db.getAllAsync<{ book_id: string; last: string }>('SELECT book_id, MAX(ended_at) AS last FROM reading_sessions GROUP BY book_id', []);
      return new Map(rows.map((r) => [r.book_id, r.last]));
    },

    /* --------------------------------------------------------------- timer */

    async timer(): Promise<SessionTimer | null> {
      const r = await db.getFirstAsync<Row>('SELECT * FROM session_timer WHERE id = 1', []);
      if (!r) return null;
      return { bookId: String(r.book_id), startedAt: String(r.started_at), pausedAt: s(r.paused_at), pausedMs: Number(r.paused_ms), startPage: n(r.start_page), startPositionSec: n(r.start_position_sec) };
    },

    async saveTimer(t: SessionTimer): Promise<void> {
      await db.runAsync(
        `INSERT INTO session_timer (id, book_id, started_at, paused_at, paused_ms, start_page, start_position_sec) VALUES (1, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET book_id = excluded.book_id, started_at = excluded.started_at, paused_at = excluded.paused_at,
           paused_ms = excluded.paused_ms, start_page = excluded.start_page, start_position_sec = excluded.start_position_sec`,
        [t.bookId, t.startedAt, t.pausedAt, t.pausedMs, t.startPage, t.startPositionSec],
      );
    },

    async clearTimer(): Promise<void> {
      await db.runAsync('DELETE FROM session_timer', []);
    },

    /* ----------------------------------------------------------- calendar */

    async calendar(from: string, to: string): Promise<CalendarDay[]> {
      return db.getAllAsync<CalendarDay>(
        `SELECT day, SUM(seconds) AS seconds, SUM(pages) AS pages, SUM(sessions) AS sessions, SUM(finished) AS finished
           FROM reading_calendar WHERE day >= ? AND day <= ? GROUP BY day ORDER BY day`,
        [from, to],
      );
    },

    async finishedOn(day: string): Promise<{ id: string; title: string }[]> {
      return db.getAllAsync(
        `SELECT b.id, b.title FROM reading_records r JOIN books b ON b.id = r.book_id WHERE r.status = 'completed' AND r.finished_on = ?`,
        [day],
      );
    },

    async startedOn(day: string): Promise<{ id: string; title: string }[]> {
      return db.getAllAsync(`SELECT b.id, b.title FROM reading_records r JOIN books b ON b.id = r.book_id WHERE r.started_on = ?`, [day]);
    },

    /* ----------------------------------------------------------- audiobooks */

    async audio(bookId: string): Promise<AudiobookProgress | null> {
      const r = await db.getFirstAsync<Row>('SELECT * FROM audiobook_progress WHERE book_id = ?', [bookId]);
      if (!r) return null;
      return {
        bookId,
        totalSeconds: n(r.total_seconds),
        positionSeconds: Number(r.position_seconds),
        playbackSpeed: n(r.playback_speed),
        startedOn: s(r.started_on),
        finishedOn: s(r.finished_on),
        updatedAt: String(r.updated_at),
      };
    },

    async saveAudio(p: Omit<AudiobookProgress, 'updatedAt'>): Promise<void> {
      await db.runAsync(
        `INSERT INTO audiobook_progress (book_id, total_seconds, position_seconds, playback_speed, started_on, finished_on, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(book_id) DO UPDATE SET total_seconds = excluded.total_seconds, position_seconds = excluded.position_seconds,
           playback_speed = excluded.playback_speed, started_on = excluded.started_on, finished_on = excluded.finished_on, updated_at = excluded.updated_at`,
        [p.bookId, p.totalSeconds, p.positionSeconds, p.playbackSpeed, p.startedOn, p.finishedOn, clock.iso()],
      );
    },

    /* ----------------------------------------------------- progress updates */

    async addProgressUpdate(u: { bookId: string; recordId: string | null; day: string; unit: 'page' | 'second'; from: number; to: number }): Promise<void> {
      if (u.from === u.to) return;
      await db.runAsync('INSERT INTO progress_updates (id, book_id, record_id, day, unit, from_value, to_value, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
        newId(), u.bookId, u.recordId, u.day, u.unit, u.from, u.to, clock.iso(),
      ]);
    },

    async audioHistory(bookId: string): Promise<AudiobookUpdate[]> {
      const rows = await db.getAllAsync<Row>("SELECT * FROM progress_updates WHERE book_id = ? AND unit = 'second' ORDER BY created_at DESC", [bookId]);
      return rows.map((r) => ({ id: String(r.id), bookId, day: String(r.day), fromSeconds: Number(r.from_value), toSeconds: Number(r.to_value), createdAt: String(r.created_at) }));
    },

    /** Forward progress per day ("pages read" / "seconds listened"). Going backwards never subtracts. */
    async progressByDay(unit: 'page' | 'second', from?: string, to?: string): Promise<{ day: string; amount: number; bookId: string }[]> {
      return db.getAllAsync(
        `SELECT day, book_id AS bookId, SUM(MAX(0, to_value - from_value)) AS amount FROM progress_updates
          WHERE unit = ? AND day >= ? AND day <= ? GROUP BY day, book_id ORDER BY day`,
        [unit, from ?? '0000-01-01', to ?? '9999-12-31'],
      );
    },
  };
}

export type ReadingRepository = ReturnType<typeof createReadingRepository>;
