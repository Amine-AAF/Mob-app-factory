import { assertWithinLimit } from '@/config/limits';
import type { Repositories } from '@/database';
import { findDuplicate, type DuplicateMatch } from '@/features/library/duplicates';
import { isPremiumNow, useSession } from '@/store/session';
import type { BookInput, ReadingStatus } from '@/types';
import { isDayKey } from '@/utils';

import { track } from './analytics';
import { clock } from './clock';
import { deleteCoverFiles } from './covers';

export class BookValidationError extends Error {
  constructor(public readonly field: 'title' | 'pageCount' | 'publishedYear' | 'acquiredOn' | 'price') {
    super(`Invalid book field: ${field}`);
    this.name = 'BookValidationError';
  }
}

export function validateBook(input: BookInput, today: string): void {
  if (!input.title?.trim()) throw new BookValidationError('title');
  if (input.pageCount != null && (!Number.isInteger(input.pageCount) || input.pageCount <= 0 || input.pageCount > 50_000)) throw new BookValidationError('pageCount');
  if (input.publishedYear != null && (!Number.isInteger(input.publishedYear) || input.publishedYear < 0 || input.publishedYear > Number(today.slice(0, 4)) + 2)) throw new BookValidationError('publishedYear');
  if (input.acquiredOn != null && (!isDayKey(input.acquiredOn) || input.acquiredOn > today)) throw new BookValidationError('acquiredOn');
  if (input.purchasePriceCents != null && (input.purchasePriceCents < 0 || !Number.isInteger(input.purchasePriceCents))) throw new BookValidationError('price');
}

export type AddBookResult = { status: 'created'; id: string } | { status: 'duplicate'; match: DuplicateMatch };

/**
 * Adds a book after validation, free-limit and duplicate checks.
 * A duplicate is reported (with the matching book) unless `allowDuplicate` is set,
 * so the UI can offer "open existing" or "add anyway" (e.g. a second copy).
 */
export async function addBook(
  r: Repositories,
  input: BookInput,
  opts: { allowDuplicate?: boolean; status?: ReadingStatus; source?: string } = {},
): Promise<AddBookResult> {
  validateBook(input, clock.today());
  assertWithinLimit('books', await r.books.count(), isPremiumNow());
  if (!opts.allowDuplicate) {
    const match = findDuplicate(input, await r.books.duplicateCandidates());
    if (match) return { status: 'duplicate', match };
  }
  const id = await r.books.create(input, { status: opts.status });
  if (input.format === 'audiobook') await r.reading.saveAudio({ bookId: id, totalSeconds: null, positionSeconds: 0, playbackSpeed: null, startedOn: null, finishedOn: null });
  track('book_added', { format: input.format ?? 'paperback', source: opts.source ?? 'manual', has_cover: !!input.coverUri });
  useSession.getState().bump();
  return { status: 'created', id };
}

export async function updateBook(r: Repositories, id: string, input: BookInput): Promise<void> {
  validateBook(input, clock.today());
  const before = await r.books.get(id);
  if (!before) return;
  const record = await r.reading.current(id);
  // Shrinking the page count below the current page would make progress > 100 %.
  if (record && input.pageCount != null && record.currentPage > input.pageCount) throw new BookValidationError('pageCount');
  await r.books.update(id, input);
  if (input.format === 'audiobook' && !(await r.reading.audio(id))) {
    await r.reading.saveAudio({ bookId: id, totalSeconds: null, positionSeconds: 0, playbackSpeed: null, startedOn: null, finishedOn: null });
  }
  // Replaced covers: remove the previous files.
  const stale = [before.coverUri, before.coverThumbUri].filter((u) => u && u !== input.coverUri && u !== input.coverThumbUri) as string[];
  if (stale.length) deleteCoverFiles(stale);
  useSession.getState().bump();
}

export async function deleteBook(r: Repositories, id: string): Promise<void> {
  const book = await r.books.get(id);
  if (!book) return;
  await r.books.remove(id);
  // Detach wishlist entries that pointed to it (FK sets book_id NULL) and delete cover files.
  deleteCoverFiles([book.coverUri, book.coverThumbUri].filter(Boolean) as string[]);
  useSession.getState().bump();
}

export async function toggleFavorite(r: Repositories, id: string, value: boolean) {
  await r.books.setFavorite(id, value);
  useSession.getState().bump();
}

export async function setArchived(r: Repositories, id: string, value: boolean) {
  await r.books.setArchived(id, value);
  useSession.getState().bump();
}
