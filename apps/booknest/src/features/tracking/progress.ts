import type { ReadingStatus } from '@/types';

/**
 * Reading progress rules. Progress is only reported when the page count is known:
 * a book without a page count has an "unknown" progress, never a made-up 0 %.
 */
export class ProgressError extends Error {
  constructor(public readonly code: 'negative_page' | 'page_beyond_total' | 'invalid_total' | 'finish_before_start' | 'future_date') {
    super(`Progress error: ${code}`);
    this.name = 'ProgressError';
  }
}

export function progressRatio(currentPage: number, totalPages: number | null | undefined): number | null {
  if (!totalPages || totalPages <= 0) return null;
  const ratio = currentPage / totalPages;
  return Math.min(1, Math.max(0, ratio));
}

export function progressPercent(currentPage: number, totalPages: number | null | undefined): number | null {
  const r = progressRatio(currentPage, totalPages);
  return r == null ? null : Math.round(r * 100);
}

/** Validates a page update. Throws on inconsistent values instead of silently clamping them. */
export function validatePage(page: number, totalPages: number | null | undefined): number {
  if (!Number.isInteger(page) || page < 0) throw new ProgressError('negative_page');
  if (totalPages != null) {
    if (!Number.isInteger(totalPages) || totalPages <= 0) throw new ProgressError('invalid_total');
    if (page > totalPages) throw new ProgressError('page_beyond_total');
  }
  return page;
}

export function validateDates(startedOn: string | null, finishedOn: string | null, today: string): void {
  if (startedOn && startedOn > today) throw new ProgressError('future_date');
  if (finishedOn && finishedOn > today) throw new ProgressError('future_date');
  if (startedOn && finishedOn && finishedOn < startedOn) throw new ProgressError('finish_before_start');
}

export interface StatusChange {
  status: ReadingStatus;
  startedOn: string | null;
  finishedOn: string | null;
  currentPage: number;
}

/**
 * Applies the side effects of a status change:
 * - starting to read sets the start date (if missing); completing a book that was never
 *   started leaves the start date unknown (no invented "read in one day" records);
 * - completing sets the finish date and jumps to the last page (when known);
 * - going back to "reading" from "completed" clears the finish date.
 */
export function applyStatus(
  prev: StatusChange,
  next: ReadingStatus,
  totalPages: number | null,
  today: string,
): StatusChange {
  const out: StatusChange = { ...prev, status: next };
  if (next === 'reading' && !out.startedOn) out.startedOn = today;
  if (next === 'completed') {
    out.finishedOn = prev.finishedOn ?? today;
    if (totalPages) out.currentPage = totalPages;
  } else if (next === 'reading' || next === 'want_to_read') {
    out.finishedOn = null;
  }
  if (next === 'want_to_read') {
    out.startedOn = null;
    out.currentPage = 0;
  }
  return out;
}

/** A page update moves a "want to read" book to "reading" and a book at its last page to "completed". */
export function statusAfterPageUpdate(status: ReadingStatus, page: number, totalPages: number | null): ReadingStatus {
  if (totalPages && page >= totalPages) return 'completed';
  if (status === 'want_to_read' || status === 'on_hold') return page > 0 ? 'reading' : status;
  return status;
}

/** Audiobook progress from seconds (null when the total duration is unknown). */
export function audioRatio(positionSeconds: number, totalSeconds: number | null | undefined): number | null {
  if (!totalSeconds || totalSeconds <= 0) return null;
  return Math.min(1, Math.max(0, positionSeconds / totalSeconds));
}

export function validateAudioPosition(position: number, total: number | null): number {
  if (!Number.isInteger(position) || position < 0) throw new ProgressError('negative_page');
  if (total != null && position > total) throw new ProgressError('page_beyond_total');
  return position;
}

/** Listening time left at a given playback speed, in seconds (null if unknown). */
export function audioRemainingSeconds(position: number, total: number | null, speed: number | null): number | null {
  if (!total) return null;
  const left = Math.max(0, total - position);
  return Math.round(left / (speed && speed > 0 ? speed : 1));
}
