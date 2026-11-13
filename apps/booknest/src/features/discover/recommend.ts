import { dayIndex, diffDays } from '@factory/app-core';

import type { BookListItem, WishlistItem } from '@/types';

/**
 * Local discovery. These are transparent rules over the user's own library —
 * not machine learning and not "AI". Every suggestion carries the reason it was
 * picked, so the UI can say why ("Because you rated Fantasy books highly").
 *
 * External catalogues can be plugged in later through `CatalogProvider`; none is
 * bundled or required, and the app never calls the network for discovery.
 */
export type ReasonCode = 'favorite_genre' | 'favorite_author' | 'similar_genre' | 'similar_author' | 'forgotten' | 'unfinished' | 'random' | 'on_hold';

export interface Suggestion {
  bookId: string;
  title: string;
  authorName: string | null;
  coverThumbUri: string | null;
  reason: ReasonCode;
  /** Genre or author name the reason refers to, when relevant. */
  about: string | null;
  score: number;
}

export interface WishSuggestion {
  item: WishlistItem;
  ageDays: number;
}

export interface DiscoverInput {
  books: BookListItem[];
  /** Book id → last activity day (session, progress or status change). */
  lastActivity: Map<string, string>;
  wishlist: WishlistItem[];
  today: string;
}

export interface DiscoverResult {
  topGenres: string[];
  forYou: Suggestion[];
  unfinished: Suggestion[];
  forgottenWishlist: WishSuggestion[];
  randomPick: Suggestion | null;
}

/** Affinity: finished books count, high ratings boost, abandoned books lower it. */
function affinity(books: BookListItem[], key: (b: BookListItem) => string | null): Map<string, number> {
  const scores = new Map<string, number>();
  for (const b of books) {
    const k = key(b);
    if (!k) continue;
    let delta = 0;
    if (b.status === 'completed') delta = 1 + (b.rating != null ? (b.rating - 3) * 0.75 : 0);
    else if (b.status === 'abandoned') delta = -0.75;
    else if (b.isFavorite) delta = 0.5;
    if (b.isFavorite) delta += 0.5;
    if (delta !== 0) scores.set(k, (scores.get(k) ?? 0) + delta);
  }
  return scores;
}

const toSuggestion = (b: BookListItem, reason: ReasonCode, about: string | null, score: number): Suggestion => ({
  bookId: b.id,
  title: b.title,
  authorName: b.authorName,
  coverThumbUri: b.coverThumbUri,
  reason,
  about,
  score,
});

export const FORGOTTEN_WISHLIST_DAYS = 60;
export const STALE_READING_DAYS = 14;

export function discover(input: DiscoverInput, limit = 8): DiscoverResult {
  const genres = affinity(input.books, (b) => b.genreName);
  const authors = affinity(input.books, (b) => b.authorName);
  const topGenres = [...genres.entries()].filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).map(([g]) => g);

  const candidates = input.books.filter((b) => b.status === 'want_to_read' && !b.isArchived);
  const forYou: Suggestion[] = [];
  for (const b of candidates) {
    const g = b.genreName ? (genres.get(b.genreName) ?? 0) : 0;
    const a = b.authorName ? (authors.get(b.authorName) ?? 0) : 0;
    if (g <= 0 && a <= 0) continue;
    const byAuthor = a >= g;
    forYou.push(toSuggestion(b, byAuthor ? 'favorite_author' : 'favorite_genre', byAuthor ? b.authorName : b.genreName, g + a * 1.2 + (b.isFavorite ? 0.5 : 0)));
  }
  forYou.sort((x, y) => y.score - x.score || x.title.localeCompare(y.title));

  const unfinished = input.books
    .filter((b) => (b.status === 'reading' || b.status === 'on_hold') && !b.isArchived)
    .map((b) => {
      const last = input.lastActivity.get(b.id) ?? b.updatedAt.slice(0, 10);
      return { b, idle: diffDays(last, input.today) };
    })
    .filter(({ b, idle }) => b.status === 'on_hold' || idle >= STALE_READING_DAYS)
    .sort((x, y) => y.idle - x.idle)
    .map(({ b, idle }) => toSuggestion(b, b.status === 'on_hold' ? 'on_hold' : 'unfinished', null, idle));

  const forgottenWishlist = input.wishlist
    .filter((w) => w.status === 'want_to_buy' || w.status === 'want_to_read')
    .map((item) => ({ item, ageDays: diffDays(item.updatedAt.slice(0, 10), input.today) }))
    .filter((w) => w.ageDays >= FORGOTTEN_WISHLIST_DAYS)
    .sort((a, b) => a.item.priority - b.item.priority || b.ageDays - a.ageDays);

  // Deterministic "pick of the day": stable during the day, changes tomorrow.
  const pool = candidates.length ? candidates : [];
  const pick = pool.length ? pool[((dayIndex(input.today) % pool.length) + pool.length) % pool.length]! : null;

  return {
    topGenres: topGenres.slice(0, 3),
    forYou: forYou.slice(0, limit),
    unfinished: unfinished.slice(0, limit),
    forgottenWishlist: forgottenWishlist.slice(0, limit),
    randomPick: pick ? toSuggestion(pick, 'random', null, 0) : null,
  };
}

/** Books in the library similar to `bookId` (same author first, then same genre). */
export function similarBooks(bookId: string, books: BookListItem[], limit = 6): Suggestion[] {
  const ref = books.find((b) => b.id === bookId);
  if (!ref) return [];
  const out: Suggestion[] = [];
  for (const b of books) {
    if (b.id === bookId || b.isArchived) continue;
    if (ref.authorName && b.authorName === ref.authorName) out.push(toSuggestion(b, 'similar_author', b.authorName, 2 + (b.status === 'want_to_read' ? 1 : 0)));
    else if (ref.genreName && b.genreName === ref.genreName) out.push(toSuggestion(b, 'similar_genre', b.genreName, 1 + (b.status === 'want_to_read' ? 1 : 0)));
  }
  return out.sort((x, y) => y.score - x.score || x.title.localeCompare(y.title)).slice(0, limit);
}

/** Random pick on demand ("surprise me"), from want-to-read books. */
export function randomWantToRead(books: BookListItem[], rand: () => number = Math.random): BookListItem | null {
  const pool = books.filter((b) => b.status === 'want_to_read' && !b.isArchived);
  return pool.length ? pool[Math.floor(rand() * pool.length)]! : null;
}

/**
 * Extension point for optional external catalogues (e.g. a public books API
 * the user explicitly enables). Not implemented in the MVP: BookNest ships with
 * `localCatalog` only and works fully offline.
 */
export interface CatalogBook {
  title: string;
  authorName: string | null;
  isbn: string | null;
  pageCount: number | null;
  publishedYear: number | null;
  publisher: string | null;
}

export interface CatalogProvider {
  id: string;
  /** True when the provider may use the network (must be opt-in in Settings). */
  requiresNetwork: boolean;
  searchByIsbn(isbn: string): Promise<CatalogBook | null>;
  searchByText(query: string): Promise<CatalogBook[]>;
}

export const localCatalog: CatalogProvider = {
  id: 'local',
  requiresNetwork: false,
  async searchByIsbn() {
    return null;
  },
  async searchByText() {
    return [];
  },
};
