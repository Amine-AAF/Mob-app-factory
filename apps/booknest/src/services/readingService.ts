import { toDayKey } from '@factory/app-core';

import type { Repositories } from '@/database';
import { elapsedSec, pauseTimer, resumeTimer, SessionError, validateManualSession, type ManualSessionInput } from '@/features/sessions/timer';
import { applyStatus, ProgressError, statusAfterPageUpdate, validateAudioPosition, validateDates, validatePage } from '@/features/tracking/progress';
import { useSession } from '@/store/session';
import type { ReadingStatus, SessionTimer } from '@/types';
import { cleanText } from '@/utils';

import { minutesBucket, track } from './analytics';
import { clock } from './clock';
import { checkGoalCelebrations } from './goalService';

/* ------------------------------------------------------------ tracker */

async function afterChange(r: Repositories, bookId: string) {
  await r.books.touch(bookId);
  await checkGoalCelebrations(r);
  useSession.getState().bump();
}

export async function setStatus(r: Repositories, bookId: string, status: ReadingStatus): Promise<void> {
  const [book, rec] = await Promise.all([r.books.get(bookId), r.reading.current(bookId)]);
  if (!book || !rec) return;
  const today = clock.today();
  const next = applyStatus({ status: rec.status, startedOn: rec.startedOn, finishedOn: rec.finishedOn, currentPage: rec.currentPage }, status, book.pageCount, today);
  await r.reading.updateRecord(rec.id, next);
  if (next.currentPage !== rec.currentPage) {
    await r.reading.addProgressUpdate({ bookId, recordId: rec.id, day: today, unit: 'page', from: rec.currentPage, to: next.currentPage });
  }
  if (book.format === 'audiobook') {
    const audio = await r.reading.audio(bookId);
    if (audio) {
      const done = status === 'completed';
      const pos = done && audio.totalSeconds ? audio.totalSeconds : audio.positionSeconds;
      if (pos !== audio.positionSeconds) await r.reading.addProgressUpdate({ bookId, recordId: rec.id, day: today, unit: 'second', from: audio.positionSeconds, to: pos });
      await r.reading.saveAudio({ ...audio, positionSeconds: pos, startedOn: next.startedOn, finishedOn: done ? next.finishedOn : null });
    }
  }
  if (status === 'completed' && rec.status !== 'completed') track('book_completed', { format: book.format, reread: rec.attempt > 1 });
  await afterChange(r, bookId);
}

/** Updates the current page; may move the status forward (to "reading" or "completed"). */
export async function updatePage(r: Repositories, bookId: string, page: number, opts: { day?: string } = {}): Promise<ReadingStatus> {
  const [book, rec] = await Promise.all([r.books.get(bookId), r.reading.current(bookId)]);
  if (!book || !rec) throw new ProgressError('invalid_total');
  validatePage(page, book.pageCount);
  // Backdated sessions record their progress on the day they happened.
  const today = opts.day ?? clock.today();
  const status = statusAfterPageUpdate(rec.status, page, book.pageCount);
  const next = status !== rec.status ? applyStatus({ ...rec }, status, book.pageCount, today) : { ...rec };
  await r.reading.updateRecord(rec.id, { status, currentPage: page, startedOn: next.startedOn ?? (page > 0 ? (rec.startedOn ?? today) : rec.startedOn), finishedOn: next.finishedOn });
  await r.reading.addProgressUpdate({ bookId, recordId: rec.id, day: today, unit: 'page', from: rec.currentPage, to: page });
  if (status === 'completed' && rec.status !== 'completed') track('book_completed', { format: book.format, reread: rec.attempt > 1 });
  await afterChange(r, bookId);
  return status;
}

export async function updateDates(r: Repositories, bookId: string, startedOn: string | null, finishedOn: string | null): Promise<void> {
  const rec = await r.reading.current(bookId);
  if (!rec) return;
  validateDates(startedOn, finishedOn, clock.today());
  await r.reading.updateRecord(rec.id, { startedOn, finishedOn: rec.status === 'completed' ? finishedOn : null });
  await afterChange(r, bookId);
}

export async function updateRecordNotes(r: Repositories, bookId: string, notes: string | null) {
  const rec = await r.reading.current(bookId);
  if (!rec) return;
  await r.reading.updateRecord(rec.id, { notes: cleanText(notes) });
  useSession.getState().bump();
}

/** Re-read: archives the current attempt in the history and starts a new one at page 0. */
export async function restartReading(r: Repositories, bookId: string): Promise<void> {
  await r.reading.startNewAttempt(bookId, clock.today());
  const audio = await r.reading.audio(bookId);
  if (audio) await r.reading.saveAudio({ ...audio, positionSeconds: 0, startedOn: clock.today(), finishedOn: null });
  await afterChange(r, bookId);
}

/* ----------------------------------------------------------- audiobooks */

export async function updateAudio(
  r: Repositories,
  bookId: string,
  patch: { positionSeconds?: number; totalSeconds?: number | null; playbackSpeed?: number | null },
): Promise<void> {
  const rec = await r.reading.current(bookId);
  const prev = (await r.reading.audio(bookId)) ?? { bookId, totalSeconds: null, positionSeconds: 0, playbackSpeed: null, startedOn: null, finishedOn: null, updatedAt: '' };
  const total = patch.totalSeconds !== undefined ? patch.totalSeconds : prev.totalSeconds;
  if (total != null && (!Number.isInteger(total) || total <= 0)) throw new ProgressError('invalid_total');
  const position = validateAudioPosition(patch.positionSeconds ?? Math.min(prev.positionSeconds, total ?? Infinity), total);
  const today = clock.today();
  const finished = total != null && position >= total;
  await r.reading.saveAudio({
    bookId,
    totalSeconds: total,
    positionSeconds: position,
    playbackSpeed: patch.playbackSpeed !== undefined ? patch.playbackSpeed : prev.playbackSpeed,
    startedOn: prev.startedOn ?? (position > 0 ? today : null),
    finishedOn: finished ? (prev.finishedOn ?? today) : null,
  });
  if (rec) {
    await r.reading.addProgressUpdate({ bookId, recordId: rec.id, day: today, unit: 'second', from: prev.positionSeconds, to: position });
    const status: ReadingStatus = finished ? 'completed' : position > 0 && (rec.status === 'want_to_read' || rec.status === 'on_hold') ? 'reading' : rec.status;
    if (status !== rec.status) {
      const next = applyStatus({ ...rec }, status, null, today);
      await r.reading.updateRecord(rec.id, { status, startedOn: next.startedOn, finishedOn: next.finishedOn });
    }
  }
  await afterChange(r, bookId);
}

/* ------------------------------------------------------------- sessions */

export async function startTimer(r: Repositories, bookId: string): Promise<SessionTimer> {
  if (await r.reading.timer()) throw new SessionError('timer_running');
  const [rec, audio] = await Promise.all([r.reading.current(bookId), r.reading.audio(bookId)]);
  const timer: SessionTimer = { bookId, startedAt: clock.iso(), pausedAt: null, pausedMs: 0, startPage: rec?.currentPage ?? null, startPositionSec: audio?.positionSeconds ?? null };
  await r.reading.saveTimer(timer);
  if (rec && (rec.status === 'want_to_read' || rec.status === 'on_hold')) await setStatus(r, bookId, 'reading');
  useSession.getState().bump();
  return timer;
}

export async function pauseSession(r: Repositories): Promise<SessionTimer> {
  const t = await r.reading.timer();
  if (!t) throw new SessionError('no_timer');
  const next = pauseTimer(t, clock.now());
  await r.reading.saveTimer(next);
  useSession.getState().bump();
  return next;
}

export async function resumeSession(r: Repositories): Promise<SessionTimer> {
  const t = await r.reading.timer();
  if (!t) throw new SessionError('no_timer');
  const next = resumeTimer(t, clock.now());
  await r.reading.saveTimer(next);
  useSession.getState().bump();
  return next;
}

export async function discardSession(r: Repositories): Promise<void> {
  await r.reading.clearTimer();
  useSession.getState().bump();
}

/**
 * Ends the running session: duration from timestamps (pauses excluded), end page
 * validated and applied to the book progress. `durationOverrideSec` lets the user
 * correct a forgotten timer before saving.
 */
export async function finishSession(r: Repositories, input: { endPage?: number | null; endPositionSec?: number | null; notes?: string | null; durationOverrideSec?: number }): Promise<string> {
  const t = await r.reading.timer();
  if (!t) throw new SessionError('no_timer');
  const book = await r.books.get(t.bookId);
  const rec = await r.reading.current(t.bookId);
  const now = clock.now();
  const duration = input.durationOverrideSec ?? elapsedSec(t, now);
  if (duration <= 0) throw new SessionError('end_before_start');
  const endPage = input.endPage ?? null;
  if (endPage != null) {
    validatePage(endPage, book?.pageCount ?? null);
    if (t.startPage != null && endPage < t.startPage) throw new SessionError('invalid_pages');
  }
  const endedAt = now.toISOString();
  const startedAt = new Date(now.getTime() - duration * 1000).toISOString();
  const id = await r.reading.addSession({
    bookId: t.bookId,
    recordId: rec?.id ?? null,
    day: toDayKey(new Date(startedAt)),
    startedAt,
    endedAt,
    durationSec: duration,
    startPage: t.startPage,
    endPage,
    startPositionSec: t.startPositionSec,
    endPositionSec: input.endPositionSec ?? null,
    notes: cleanText(input.notes),
    source: 'timer',
  });
  await r.reading.clearTimer();
  if (endPage != null && rec && endPage !== rec.currentPage) await updatePage(r, t.bookId, endPage);
  if (input.endPositionSec != null) await updateAudio(r, t.bookId, { positionSeconds: input.endPositionSec });
  track('session_logged', { source: 'timer', minutes_bucket: minutesBucket(duration) });
  await afterChange(r, t.bookId);
  return id;
}

export async function addManualSession(r: Repositories, bookId: string, input: ManualSessionInput & { notes?: string | null; applyProgress?: boolean }): Promise<string> {
  const [book, rec] = await Promise.all([r.books.get(bookId), r.reading.current(bookId)]);
  if (!book) throw new SessionError('invalid_pages');
  const duration = validateManualSession(input, clock.now(), book.pageCount);
  const id = await r.reading.addSession({
    bookId,
    recordId: rec?.id ?? null,
    day: toDayKey(input.startedAt),
    startedAt: input.startedAt.toISOString(),
    endedAt: input.endedAt.toISOString(),
    durationSec: duration,
    startPage: input.startPage,
    endPage: input.endPage,
    notes: cleanText(input.notes),
    source: 'manual',
  });
  if (input.applyProgress !== false && input.endPage != null && rec && input.endPage > rec.currentPage) await updatePage(r, bookId, input.endPage, { day: toDayKey(input.startedAt) });
  track('session_logged', { source: 'manual', minutes_bucket: minutesBucket(duration) });
  await afterChange(r, bookId);
  return id;
}

export async function deleteSession(r: Repositories, id: string): Promise<void> {
  await r.reading.deleteSession(id);
  useSession.getState().bump();
}
