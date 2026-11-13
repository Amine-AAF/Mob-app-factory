import { assertWithinLimit } from '@/config/limits';
import type { NoteInput, QuoteInput, Repositories, ReviewInput, WishlistInput } from '@/database';
import { isPremiumNow, useSession } from '@/store/session';
import type { WishlistStatus } from '@/types';

import { track } from './analytics';
import { clock } from './clock';
import { addBook, type AddBookResult } from './libraryService';

/**
 * Quotes, journal, reviews, collections and wishlist.
 * Quotes and notes are typed by the user and stay private on the device:
 * they are never sent to analytics, ads or notifications.
 */
export class ContentValidationError extends Error {
  constructor(public readonly code: 'empty_text' | 'text_too_long' | 'invalid_page' | 'invalid_rating' | 'invalid_url' | 'empty_name') {
    super(`Content error: ${code}`);
    this.name = 'ContentValidationError';
  }
}

/** Quotes are personal highlights, not bulk copies of a book. */
export const MAX_QUOTE_LENGTH = 2000;
export const MAX_NOTE_LENGTH = 20_000;

const bump = () => useSession.getState().bump();

export async function saveQuote(r: Repositories, input: QuoteInput, id?: string): Promise<string> {
  const text = input.text?.trim() ?? '';
  if (!text) throw new ContentValidationError('empty_text');
  if (text.length > MAX_QUOTE_LENGTH) throw new ContentValidationError('text_too_long');
  if (input.page != null && (!Number.isInteger(input.page) || input.page < 0)) throw new ContentValidationError('invalid_page');
  if (!id) assertWithinLimit('quotes', await r.content.quoteCount(), isPremiumNow());
  const qid = await r.content.saveQuote({ ...input, text }, id);
  if (!id) track('quote_added', { with_page: input.page != null });
  bump();
  return qid;
}

export async function deleteQuote(r: Repositories, id: string) {
  await r.content.deleteQuote(id);
  bump();
}

export async function saveNote(r: Repositories, input: NoteInput, id?: string): Promise<string> {
  const body = input.body?.trim() ?? '';
  if (!body) throw new ContentValidationError('empty_text');
  if (body.length > MAX_NOTE_LENGTH) throw new ContentValidationError('text_too_long');
  if (!id) assertWithinLimit('journalEntries', await r.content.noteCount(), isPremiumNow());
  const nid = await r.content.saveNote({ ...input, body }, id);
  if (!id) track('journal_entry_added', { kind: input.kind });
  bump();
  return nid;
}

export async function deleteNote(r: Repositories, id: string) {
  await r.content.deleteNote(id);
  bump();
}

export async function saveReview(r: Repositories, bookId: string, input: ReviewInput) {
  if (input.rating != null && (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5)) throw new ContentValidationError('invalid_rating');
  await r.content.saveReview(bookId, input);
  bump();
}

/* -------------------------------------------------------------- collections */

export async function createCollection(r: Repositories, input: { name: string; icon?: string; presetKey?: string | null }): Promise<string> {
  if (!input.name.trim()) throw new ContentValidationError('empty_name');
  if (!input.presetKey) assertWithinLimit('customCollections', await r.organize.customCollectionCount(), isPremiumNow());
  const id = await r.organize.createCollection(input);
  bump();
  return id;
}

export async function setBookCollections(r: Repositories, bookId: string, collectionIds: string[]) {
  const current = new Set(await r.organize.collectionsOfBook(bookId));
  const next = new Set(collectionIds);
  await r.db.withTransactionAsync(async () => {
    for (const id of next) if (!current.has(id)) await r.organize.addToCollection(id, bookId);
    for (const id of current) if (!next.has(id)) await r.organize.removeFromCollection(id, bookId);
  });
  bump();
}

/* ----------------------------------------------------------------- wishlist */

export function validateUrl(url: string | null | undefined): string | null {
  const u = url?.trim();
  if (!u) return null;
  if (!/^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(u)) throw new ContentValidationError('invalid_url');
  return u;
}

export async function saveWish(r: Repositories, input: WishlistInput, id?: string): Promise<string> {
  if (!input.title?.trim()) throw new ContentValidationError('empty_name');
  const wid = await r.organize.saveWish({ ...input, url: validateUrl(input.url) }, id);
  bump();
  return wid;
}

export async function setWishStatus(r: Repositories, id: string, status: WishlistStatus) {
  await r.organize.setWishStatus(id, status);
  bump();
}

/** Moves a wishlist item into the library (keeps the wishlist row as acquisition history). */
export async function moveWishToLibrary(r: Repositories, id: string, opts: { allowDuplicate?: boolean } = {}): Promise<AddBookResult> {
  const item = await r.organize.wish(id);
  if (!item) throw new ContentValidationError('empty_name');
  const result = await addBook(
    r,
    {
      title: item.title,
      authorName: item.author,
      coverUri: item.coverUri,
      coverThumbUri: item.coverUri,
      purchasePriceCents: item.status === 'purchased' ? item.estimatedPriceCents : null,
      currency: item.currency,
      acquiredOn: item.status === 'purchased' ? (item.acquiredAt?.slice(0, 10) ?? clock.today()) : null,
      notes: item.notes,
    },
    { allowDuplicate: opts.allowDuplicate, source: 'wishlist' },
  );
  // On a duplicate the UI asks: link to the existing book (linkWishToBook) or add anyway.
  if (result.status === 'created') await r.organize.setWishStatus(id, 'added_to_library', result.id);
  bump();
  return result;
}

export async function linkWishToBook(r: Repositories, id: string, bookId: string) {
  await r.organize.setWishStatus(id, 'added_to_library', bookId);
  bump();
}

export async function deleteWish(r: Repositories, id: string) {
  await r.organize.deleteWish(id);
  bump();
}

/** Budget: estimated cost of what is still wanted vs. what was spent this month. */
export function wishlistBudget(items: { status: WishlistStatus; estimatedPriceCents: number | null; currency: string | null; acquiredAt: string | null }[], currency: string, month: string) {
  const sameCurrency = items.filter((i) => (i.currency ?? currency) === currency);
  const pending = sameCurrency.filter((i) => i.status === 'want_to_buy');
  const spent = sameCurrency.filter((i) => (i.status === 'purchased' || i.status === 'added_to_library') && i.acquiredAt?.startsWith(month));
  const sum = (xs: typeof items) => xs.reduce((a, i) => a + (i.estimatedPriceCents ?? 0), 0);
  return {
    pendingCents: sum(pending),
    pendingWithoutPrice: pending.filter((i) => i.estimatedPriceCents == null).length,
    spentThisMonthCents: sum(spent),
    otherCurrencies: items.length - sameCurrency.length,
  };
}
