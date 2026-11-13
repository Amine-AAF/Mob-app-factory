import type { SqlDatabase, SqlValue } from '@factory/storage';

import { clock } from '@/services/clock';
import type { Book, BookFormat, BookInput, BookListItem, ReadingStatus } from '@/types';
import { cleanText, newId, normalizeIsbn, normalizeKey } from '@/utils';

import type { DuplicateCandidate } from '@/features/library/duplicates';

type Row = Record<string, SqlValue>;
const s = (v: SqlValue | undefined): string | null => (v == null ? null : String(v));
const n = (v: SqlValue | undefined): number | null => (v == null ? null : Number(v));

const BOOK_SELECT = `
  SELECT b.*, a.name AS author_name, g.name AS genre_name
    FROM books b
    LEFT JOIN authors a ON a.id = b.author_id
    LEFT JOIN genres g ON g.id = b.genre_id`;

export function mapBook(r: Row): Book {
  return {
    id: String(r.id),
    title: String(r.title),
    subtitle: s(r.subtitle),
    originalTitle: s(r.original_title),
    authorId: s(r.author_id),
    authorName: s(r.author_name),
    genreId: s(r.genre_id),
    genreName: s(r.genre_name),
    coverUri: s(r.cover_uri),
    coverThumbUri: s(r.cover_thumb_uri),
    isbn: s(r.isbn),
    publisher: s(r.publisher),
    publishedYear: n(r.published_year),
    pageCount: n(r.page_count),
    language: s(r.language),
    format: String(r.format) as BookFormat,
    acquiredOn: s(r.acquired_on),
    purchasePriceCents: n(r.purchase_price_cents),
    currency: s(r.currency),
    description: s(r.description),
    notes: s(r.notes),
    isFavorite: Number(r.is_favorite) === 1,
    isArchived: Number(r.is_archived) === 1,
    createdAt: String(r.created_at),
    updatedAt: String(r.updated_at),
  };
}

export type LibrarySort = 'recent' | 'added' | 'title' | 'author' | 'rating' | 'progress' | 'year';

export interface LibraryQuery {
  search?: string;
  status?: ReadingStatus | null;
  format?: BookFormat | null;
  genreId?: string | null;
  authorId?: string | null;
  collectionId?: string | null;
  favoritesOnly?: boolean;
  archived?: boolean;
  minRating?: number | null;
  sort?: LibrarySort;
  limit?: number;
  offset?: number;
}

const SORTS: Record<LibrarySort, string> = {
  recent: 'b.updated_at DESC',
  added: 'b.created_at DESC',
  title: 'b.title_key ASC',
  author: "COALESCE(a.name_key, 'zzzz') ASC, b.title_key ASC",
  rating: 'COALESCE(rv.rating, 0) DESC, b.title_key ASC',
  progress: "CASE WHEN b.page_count > 0 THEN CAST(r.current_page AS REAL) / b.page_count ELSE -1 END DESC, b.updated_at DESC",
  year: 'COALESCE(b.published_year, -1) DESC, b.title_key ASC',
};

export function searchText(input: { title: string; subtitle?: string | null; originalTitle?: string | null; authorName?: string | null; isbn?: string | null; publisher?: string | null }): string {
  return normalizeKey([input.title, input.subtitle, input.originalTitle, input.authorName, input.isbn, input.publisher].filter(Boolean).join(' '));
}

export function createBooksRepository(db: SqlDatabase) {
  async function upsertNamed(table: 'authors' | 'genres', name: string | null | undefined): Promise<string | null> {
    const clean = cleanText(name);
    if (!clean) return null;
    const key = normalizeKey(clean);
    if (!key) return null;
    const existing = await db.getFirstAsync<{ id: string }>(`SELECT id FROM ${table} WHERE name_key = ?`, [key]);
    if (existing) return existing.id;
    const id = newId();
    await db.runAsync(`INSERT INTO ${table} (id, name, name_key, created_at) VALUES (?, ?, ?, ?)`, [id, clean, key, clock.iso()]);
    return id;
  }

  /** Authors and genres no book refers to anymore are removed. */
  async function pruneOrphans(): Promise<void> {
    await db.runAsync('DELETE FROM authors WHERE id NOT IN (SELECT author_id FROM books WHERE author_id IS NOT NULL)', []);
    await db.runAsync('DELETE FROM genres WHERE id NOT IN (SELECT genre_id FROM books WHERE genre_id IS NOT NULL)', []);
  }

  function columns(input: BookInput, authorId: string | null, genreId: string | null) {
    const title = input.title.trim();
    return {
      title,
      subtitle: cleanText(input.subtitle),
      original_title: cleanText(input.originalTitle),
      author_id: authorId,
      genre_id: genreId,
      cover_uri: input.coverUri ?? null,
      cover_thumb_uri: input.coverThumbUri ?? null,
      // Keep what the user typed if it is not a checksum-valid ISBN (old or local editions).
      isbn: normalizeIsbn(input.isbn) ?? cleanText(input.isbn),
      publisher: cleanText(input.publisher),
      published_year: input.publishedYear ?? null,
      page_count: input.pageCount && input.pageCount > 0 ? input.pageCount : null,
      language: cleanText(input.language),
      format: input.format ?? 'paperback',
      acquired_on: input.acquiredOn ?? null,
      purchase_price_cents: input.purchasePriceCents ?? null,
      currency: cleanText(input.currency)?.toUpperCase() ?? null,
      description: cleanText(input.description),
      notes: cleanText(input.notes),
      is_favorite: input.isFavorite ? 1 : 0,
      title_key: normalizeKey(title),
      search_text: searchText({ ...input, title }),
    };
  }

  return {
    upsertAuthor: (name: string | null | undefined) => upsertNamed('authors', name),
    upsertGenre: (name: string | null | undefined) => upsertNamed('genres', name),

    /** Inserts the book and its first reading record (status "want to read" unless given). */
    async create(input: BookInput, opts: { id?: string; status?: ReadingStatus } = {}): Promise<string> {
      const id = opts.id ?? newId();
      const now = clock.iso();
      await db.withTransactionAsync(async () => {
        const authorId = await upsertNamed('authors', input.authorName);
        const genreId = await upsertNamed('genres', input.genreName);
        const cols = { id, ...columns(input, authorId, genreId), is_archived: 0, created_at: now, updated_at: now };
        const keys = Object.keys(cols);
        await db.runAsync(`INSERT INTO books (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`, Object.values(cols) as SqlValue[]);
        await db.runAsync(
          `INSERT INTO reading_records (id, book_id, attempt, status, current_page, is_current, created_at, updated_at) VALUES (?, ?, 1, ?, 0, 1, ?, ?)`,
          [newId(), id, opts.status ?? 'want_to_read', now, now],
        );
      });
      return id;
    },

    async update(id: string, input: BookInput): Promise<void> {
      await db.withTransactionAsync(async () => {
        const authorId = await upsertNamed('authors', input.authorName);
        const genreId = await upsertNamed('genres', input.genreName);
        const cols = { ...columns(input, authorId, genreId), updated_at: clock.iso() };
        const keys = Object.keys(cols);
        await db.runAsync(`UPDATE books SET ${keys.map((k) => `${k} = ?`).join(', ')} WHERE id = ?`, [...(Object.values(cols) as SqlValue[]), id]);
        await pruneOrphans();
      });
    },

    async get(id: string): Promise<Book | null> {
      const r = await db.getFirstAsync<Row>(`${BOOK_SELECT} WHERE b.id = ?`, [id]);
      return r ? mapBook(r) : null;
    },

    async remove(id: string): Promise<void> {
      await db.withTransactionAsync(async () => {
        await db.runAsync('DELETE FROM books WHERE id = ?', [id]);
        await pruneOrphans();
      });
    },

    pruneOrphans,

    async setFavorite(id: string, value: boolean) {
      await db.runAsync('UPDATE books SET is_favorite = ?, updated_at = ? WHERE id = ?', [value ? 1 : 0, clock.iso(), id]);
    },

    async setArchived(id: string, value: boolean) {
      await db.runAsync('UPDATE books SET is_archived = ?, updated_at = ? WHERE id = ?', [value ? 1 : 0, clock.iso(), id]);
    },

    async setCover(id: string, coverUri: string | null, thumbUri: string | null) {
      await db.runAsync('UPDATE books SET cover_uri = ?, cover_thumb_uri = ?, updated_at = ? WHERE id = ?', [coverUri, thumbUri, clock.iso(), id]);
    },

    async touch(id: string) {
      await db.runAsync('UPDATE books SET updated_at = ? WHERE id = ?', [clock.iso(), id]);
    },

    async count(opts: { includeArchived?: boolean } = {}): Promise<number> {
      const r = await db.getFirstAsync<{ c: number }>(`SELECT COUNT(*) AS c FROM books${opts.includeArchived === false ? ' WHERE is_archived = 0' : ''}`, []);
      return r?.c ?? 0;
    },

    /** Library list: one indexed query with the joins needed for display, filters and sorting. */
    async list(q: LibraryQuery = {}): Promise<BookListItem[]> {
      const where: string[] = ['b.is_archived = ?'];
      const params: SqlValue[] = [q.archived ? 1 : 0];
      const tokens = q.search ? normalizeKey(q.search).split(' ').filter(Boolean) : [];
      for (const tok of tokens) {
        where.push('b.search_text LIKE ?');
        params.push(`%${tok}%`);
      }
      if (q.status) (where.push('r.status = ?'), params.push(q.status));
      if (q.format) (where.push('b.format = ?'), params.push(q.format));
      if (q.genreId) (where.push('b.genre_id = ?'), params.push(q.genreId));
      if (q.authorId) (where.push('b.author_id = ?'), params.push(q.authorId));
      if (q.favoritesOnly) where.push('b.is_favorite = 1');
      if (q.minRating) (where.push('rv.rating >= ?'), params.push(q.minRating));
      if (q.collectionId) (where.push('b.id IN (SELECT book_id FROM collection_books WHERE collection_id = ?)'), params.push(q.collectionId));
      const limit = q.limit != null ? ` LIMIT ${Math.max(0, Math.floor(q.limit))} OFFSET ${Math.max(0, Math.floor(q.offset ?? 0))}` : '';
      const rows = await db.getAllAsync<Row>(
        `SELECT b.id, b.title, a.name AS author_name, b.cover_thumb_uri, b.format, b.page_count, b.is_favorite, b.is_archived, b.updated_at,
                r.status, r.current_page, rv.rating, g.name AS genre_name, ap.position_seconds, ap.total_seconds
           FROM books b
           LEFT JOIN authors a ON a.id = b.author_id
           LEFT JOIN genres g ON g.id = b.genre_id
           LEFT JOIN reading_records r ON r.book_id = b.id AND r.is_current = 1
           LEFT JOIN reviews rv ON rv.book_id = b.id
           LEFT JOIN audiobook_progress ap ON ap.book_id = b.id
          WHERE ${where.join(' AND ')}
          ORDER BY ${SORTS[q.sort ?? 'recent']}${limit}`,
        params,
      );
      return rows.map(mapListItem);
    },

    async duplicateCandidates(): Promise<DuplicateCandidate[]> {
      const rows = await db.getAllAsync<Row>('SELECT b.id, b.title, a.name AS author_name, b.isbn FROM books b LEFT JOIN authors a ON a.id = b.author_id', []);
      return rows.map((r) => ({ id: String(r.id), title: String(r.title), authorName: s(r.author_name), isbn: s(r.isbn) }));
    },

    async authors(): Promise<{ id: string; name: string; books: number }[]> {
      return db.getAllAsync('SELECT a.id, a.name, COUNT(b.id) AS books FROM authors a JOIN books b ON b.author_id = a.id GROUP BY a.id ORDER BY a.name_key', []);
    },

    async genres(): Promise<{ id: string; name: string; books: number }[]> {
      return db.getAllAsync('SELECT g.id, g.name, COUNT(b.id) AS books FROM genres g JOIN books b ON b.genre_id = g.id GROUP BY g.id ORDER BY g.name_key', []);
    },

    async coverUris(): Promise<string[]> {
      const rows = await db.getAllAsync<{ u: string }>(
        'SELECT cover_uri AS u FROM books WHERE cover_uri IS NOT NULL UNION SELECT cover_thumb_uri FROM books WHERE cover_thumb_uri IS NOT NULL UNION SELECT cover_uri FROM wishlist_items WHERE cover_uri IS NOT NULL',
        [],
      );
      return rows.map((r) => r.u);
    },
  };
}

export function mapListItem(r: Row): BookListItem {
  const total = n(r.total_seconds);
  const pos = n(r.position_seconds);
  return {
    id: String(r.id),
    title: String(r.title),
    authorName: s(r.author_name),
    coverThumbUri: s(r.cover_thumb_uri),
    format: String(r.format) as BookFormat,
    pageCount: n(r.page_count),
    status: (s(r.status) ?? 'want_to_read') as ReadingStatus,
    currentPage: n(r.current_page) ?? 0,
    isFavorite: Number(r.is_favorite) === 1,
    isArchived: Number(r.is_archived) === 1,
    rating: n(r.rating),
    genreName: s(r.genre_name),
    updatedAt: String(r.updated_at),
    audioProgress: total && pos != null ? Math.min(1, pos / total) : null,
  };
}

export type BooksRepository = ReturnType<typeof createBooksRepository>;
