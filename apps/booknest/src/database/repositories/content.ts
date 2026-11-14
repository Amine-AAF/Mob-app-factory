import { fromJson, toJson, type SqlDatabase, type SqlValue } from '@factory/storage';

import { clock } from '@/services/clock';
import type { NoteKind, Quote, ReadingNote, Recommendation, Review } from '@/types';
import { cleanText, newId, normalizeKey } from '@/utils';

type Row = Record<string, SqlValue>;
const s = (v: SqlValue | undefined): string | null => (v == null ? null : String(v));
const n = (v: SqlValue | undefined): number | null => (v == null ? null : Number(v));

export function normalizeTags(tags: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of tags) {
    const t = raw.trim().replace(/^#/, '').slice(0, 40);
    const key = t.toLowerCase();
    if (t && !seen.has(key)) {
      seen.add(key);
      out.push(t);
    }
  }
  return out.slice(0, 12);
}

function mapQuote(r: Row): Quote {
  return {
    id: String(r.id),
    bookId: s(r.book_id),
    bookTitle: s(r.book_title),
    text: String(r.text),
    authorName: s(r.author_name),
    page: n(r.page),
    tags: fromJson<string[]>(s(r.tags), []),
    comment: s(r.comment),
    isFavorite: Number(r.is_favorite) === 1,
    createdAt: String(r.created_at),
    updatedAt: String(r.updated_at),
  };
}

function mapNote(r: Row): ReadingNote {
  return {
    id: String(r.id),
    bookId: s(r.book_id),
    bookTitle: s(r.book_title),
    kind: String(r.kind) as NoteKind,
    title: s(r.title),
    body: String(r.body),
    tags: fromJson<string[]>(s(r.tags), []),
    isFavorite: Number(r.is_favorite) === 1,
    createdAt: String(r.created_at),
    updatedAt: String(r.updated_at),
  };
}

export interface QuoteInput {
  bookId: string | null;
  text: string;
  authorName?: string | null;
  page?: number | null;
  tags?: string[];
  comment?: string | null;
  isFavorite?: boolean;
}

export interface NoteInput {
  bookId: string | null;
  kind: NoteKind;
  title?: string | null;
  body: string;
  tags?: string[];
  isFavorite?: boolean;
}

export interface ReviewInput {
  rating: number | null;
  body?: string | null;
  pros?: string | null;
  cons?: string | null;
  readOn?: string | null;
  recommend?: Recommendation | null;
}

/** Text search shared by quotes and journal (accent-insensitive, every word must match). */
function matches(haystack: (string | null)[], query: string | undefined): boolean {
  if (!query) return true;
  const text = normalizeKey(haystack.filter(Boolean).join(' '));
  return normalizeKey(query).split(' ').filter(Boolean).every((tok) => text.includes(tok));
}

export function createContentRepository(db: SqlDatabase) {
  return {
    /* -------------------------------------------------------------- quotes */
    async saveQuote(input: QuoteInput, id?: string): Promise<string> {
      const now = clock.iso();
      const vals = [input.bookId, input.text.trim(), cleanText(input.authorName), input.page ?? null, toJson(normalizeTags(input.tags ?? [])), cleanText(input.comment), input.isFavorite ? 1 : 0];
      if (id) {
        await db.runAsync('UPDATE quotes SET book_id = ?, text = ?, author_name = ?, page = ?, tags = ?, comment = ?, is_favorite = ?, updated_at = ? WHERE id = ?', [...vals, now, id]);
        return id;
      }
      const newIdValue = newId();
      await db.runAsync('INSERT INTO quotes (book_id, text, author_name, page, tags, comment, is_favorite, id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [...vals, newIdValue, now, now]);
      return newIdValue;
    },
    async getQuote(id: string): Promise<Quote | null> {
      const r = await db.getFirstAsync<Row>('SELECT q.*, b.title AS book_title FROM quotes q LEFT JOIN books b ON b.id = q.book_id WHERE q.id = ?', [id]);
      return r ? mapQuote(r) : null;
    },
    async deleteQuote(id: string) {
      await db.runAsync('DELETE FROM quotes WHERE id = ?', [id]);
    },
    async setQuoteFavorite(id: string, v: boolean) {
      await db.runAsync('UPDATE quotes SET is_favorite = ?, updated_at = ? WHERE id = ?', [v ? 1 : 0, clock.iso(), id]);
    },
    async quotes(opts: { bookId?: string | null; search?: string; favoritesOnly?: boolean; tag?: string | null; limit?: number } = {}): Promise<Quote[]> {
      const where: string[] = [];
      const params: SqlValue[] = [];
      if (opts.bookId) {
        where.push('q.book_id = ?');
        params.push(opts.bookId);
      }
      if (opts.favoritesOnly) where.push('q.is_favorite = 1');
      const rows = await db.getAllAsync<Row>(
        `SELECT q.*, b.title AS book_title FROM quotes q LEFT JOIN books b ON b.id = q.book_id ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY q.created_at DESC`,
        params,
      );
      const out = rows
        .map(mapQuote)
        .filter((q) => matches([q.text, q.comment, q.authorName, q.bookTitle, q.tags.join(' ')], opts.search))
        .filter((q) => !opts.tag || q.tags.some((t) => t.toLowerCase() === opts.tag!.toLowerCase()));
      return opts.limit ? out.slice(0, opts.limit) : out;
    },
    async quoteCount(): Promise<number> {
      return (await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) AS c FROM quotes', []))?.c ?? 0;
    },

    /* ------------------------------------------------------------- journal */
    async saveNote(input: NoteInput, id?: string): Promise<string> {
      const now = clock.iso();
      const vals = [input.bookId, input.kind, cleanText(input.title), input.body.trim(), toJson(normalizeTags(input.tags ?? [])), input.isFavorite ? 1 : 0];
      if (id) {
        await db.runAsync('UPDATE reading_notes SET book_id = ?, kind = ?, title = ?, body = ?, tags = ?, is_favorite = ?, updated_at = ? WHERE id = ?', [...vals, now, id]);
        return id;
      }
      const nid = newId();
      await db.runAsync('INSERT INTO reading_notes (book_id, kind, title, body, tags, is_favorite, id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [...vals, nid, now, now]);
      return nid;
    },
    async getNote(id: string): Promise<ReadingNote | null> {
      const r = await db.getFirstAsync<Row>('SELECT n.*, b.title AS book_title FROM reading_notes n LEFT JOIN books b ON b.id = n.book_id WHERE n.id = ?', [id]);
      return r ? mapNote(r) : null;
    },
    async deleteNote(id: string) {
      await db.runAsync('DELETE FROM reading_notes WHERE id = ?', [id]);
    },
    async setNoteFavorite(id: string, v: boolean) {
      await db.runAsync('UPDATE reading_notes SET is_favorite = ?, updated_at = ? WHERE id = ?', [v ? 1 : 0, clock.iso(), id]);
    },
    async notes(opts: { bookId?: string | null; search?: string; favoritesOnly?: boolean; tag?: string | null; kind?: NoteKind | null } = {}): Promise<ReadingNote[]> {
      const where: string[] = [];
      const params: SqlValue[] = [];
      if (opts.bookId) {
        where.push('n.book_id = ?');
        params.push(opts.bookId);
      }
      if (opts.kind) {
        where.push('n.kind = ?');
        params.push(opts.kind);
      }
      if (opts.favoritesOnly) where.push('n.is_favorite = 1');
      const rows = await db.getAllAsync<Row>(
        `SELECT n.*, b.title AS book_title FROM reading_notes n LEFT JOIN books b ON b.id = n.book_id ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY n.created_at DESC`,
        params,
      );
      return rows
        .map(mapNote)
        .filter((x) => matches([x.title, x.body, x.bookTitle, x.tags.join(' ')], opts.search))
        .filter((x) => !opts.tag || x.tags.some((t) => t.toLowerCase() === opts.tag!.toLowerCase()));
    },
    async noteCount(): Promise<number> {
      return (await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) AS c FROM reading_notes', []))?.c ?? 0;
    },
    async allTags(): Promise<string[]> {
      const rows = await db.getAllAsync<{ tags: string }>("SELECT tags FROM quotes WHERE tags != '[]' UNION ALL SELECT tags FROM reading_notes WHERE tags != '[]'", []);
      return normalizeTags(rows.flatMap((r) => fromJson<string[]>(r.tags, [])));
    },

    /* ------------------------------------------------------------- reviews */
    async review(bookId: string): Promise<Review | null> {
      const r = await db.getFirstAsync<Row>('SELECT * FROM reviews WHERE book_id = ?', [bookId]);
      if (!r) return null;
      return {
        bookId,
        rating: n(r.rating),
        body: s(r.body),
        pros: s(r.pros),
        cons: s(r.cons),
        readOn: s(r.read_on),
        recommend: s(r.recommend) as Recommendation | null,
        createdAt: String(r.created_at),
        updatedAt: String(r.updated_at),
      };
    },
    async saveReview(bookId: string, input: ReviewInput): Promise<void> {
      const now = clock.iso();
      const rating = input.rating == null ? null : Math.min(5, Math.max(1, Math.round(input.rating)));
      await db.runAsync(
        `INSERT INTO reviews (book_id, rating, body, pros, cons, read_on, recommend, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(book_id) DO UPDATE SET rating = excluded.rating, body = excluded.body, pros = excluded.pros, cons = excluded.cons,
           read_on = excluded.read_on, recommend = excluded.recommend, updated_at = excluded.updated_at`,
        [bookId, rating, cleanText(input.body), cleanText(input.pros), cleanText(input.cons), input.readOn ?? null, input.recommend ?? null, now, now],
      );
    },
    async deleteReview(bookId: string) {
      await db.runAsync('DELETE FROM reviews WHERE book_id = ?', [bookId]);
    },
    /** Personal ranking: best rated first, ties broken by most recent review. */
    async ranking(limit = 50): Promise<{ bookId: string; title: string; authorName: string | null; rating: number; coverThumbUri: string | null; recommend: Recommendation | null }[]> {
      const rows = await db.getAllAsync<Row>(
        `SELECT rv.book_id, rv.rating, rv.recommend, b.title, b.cover_thumb_uri, a.name AS author_name FROM reviews rv
           JOIN books b ON b.id = rv.book_id LEFT JOIN authors a ON a.id = b.author_id
          WHERE rv.rating IS NOT NULL ORDER BY rv.rating DESC, rv.updated_at DESC LIMIT ?`,
        [limit],
      );
      return rows.map((r) => ({ bookId: String(r.book_id), title: String(r.title), authorName: s(r.author_name), rating: Number(r.rating), coverThumbUri: s(r.cover_thumb_uri), recommend: s(r.recommend) as Recommendation | null }));
    },
    async allReviews(): Promise<Review[]> {
      const rows = await db.getAllAsync<Row>('SELECT * FROM reviews', []);
      return rows.map((r) => ({ bookId: String(r.book_id), rating: n(r.rating), body: s(r.body), pros: s(r.pros), cons: s(r.cons), readOn: s(r.read_on), recommend: s(r.recommend) as Recommendation | null, createdAt: String(r.created_at), updatedAt: String(r.updated_at) }));
    },
  };
}

export type ContentRepository = ReturnType<typeof createContentRepository>;
