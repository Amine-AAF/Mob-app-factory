import { findDuplicate, type DuplicateCandidate, type DuplicateMatch } from '@/features/library/duplicates';
import { BOOK_FORMATS, type BookFormat, type BookInput, type ReadingStatus } from '@/types';
import { cleanText, isDayKey, parseIntOrNull, parseMoneyToCents } from '@/utils';

/* ------------------------------------------------------------------ parser */

export class CsvError extends Error {
  constructor(public readonly code: 'empty' | 'unterminated_quote' | 'no_header' | 'missing_title_column' | 'too_large') {
    super(`CSV error: ${code}`);
    this.name = 'CsvError';
  }
}

export const MAX_IMPORT_ROWS = 20_000;

/** RFC 4180 parser: quoted fields, escaped quotes, CRLF/LF, BOM, auto-detected `,` or `;` delimiter. */
export function parseCsv(raw: string): string[][] {
  const text = raw.replace(/^﻿/, '');
  if (!text.trim()) throw new CsvError('empty');
  const firstLine = text.slice(0, text.search(/\r?\n|$/));
  const delimiter = (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ';' : ',';
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') (field += '"'), i++;
        else quoted = false;
      } else field += ch;
      continue;
    }
    if (ch === '"' && field === '') quoted = true;
    else if (ch === delimiter) (row.push(field), (field = ''));
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      field = '';
      if (row.some((c) => c.trim() !== '')) rows.push(row);
      row = [];
    } else field += ch;
  }
  if (quoted) throw new CsvError('unterminated_quote');
  row.push(field);
  if (row.some((c) => c.trim() !== '')) rows.push(row);
  if (rows.length - 1 > MAX_IMPORT_ROWS) throw new CsvError('too_large');
  return rows;
}

export function toCsv(rows: (string | number | null | undefined)[][]): string {
  const esc = (v: string | number | null | undefined) => {
    if (v == null) return '';
    const s = String(v);
    // Neutralise spreadsheet formula injection on export.
    const safe = /^[=+\-@\t]/.test(s) && !/^-?\d+([.,]\d+)?$/.test(s) ? `'${s}` : s;
    return /[",;\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  return `﻿${rows.map((r) => r.map(esc).join(',')).join('\r\n')}\r\n`;
}

/* ------------------------------------------------------------- import map */

type Field =
  | 'title' | 'subtitle' | 'originalTitle' | 'author' | 'isbn' | 'isbn13' | 'publisher' | 'year' | 'pages' | 'language' | 'format'
  | 'genre' | 'status' | 'rating' | 'review' | 'startedOn' | 'finishedOn' | 'acquiredOn' | 'price' | 'currency' | 'notes' | 'description' | 'favorite';

/** Header aliases (lowercased). Includes the column names of common reading-app exports. */
const ALIASES: Record<Field, string[]> = {
  title: ['title', 'titre', 'título', 'titulo', 'book title'],
  subtitle: ['subtitle', 'sous-titre', 'subtítulo', 'subtitulo'],
  originalTitle: ['original title', 'original_title', 'titre original', 'título original'],
  author: ['author', 'authors', 'auteur', 'autor', 'author l-f'],
  isbn: ['isbn', 'isbn10'],
  isbn13: ['isbn13', 'isbn-13'],
  publisher: ['publisher', 'éditeur', 'editeur', 'editorial'],
  year: ['year', 'year published', 'original publication year', 'published', 'publication year', 'année', 'año'],
  pages: ['pages', 'number of pages', 'page count', 'nombre de pages', 'páginas', 'paginas'],
  language: ['language', 'langue', 'idioma'],
  format: ['format', 'binding', 'reliure', 'formato'],
  genre: ['genre', 'genres', 'género', 'genero', 'category'],
  status: ['status', 'exclusive shelf', 'shelf', 'statut', 'estado', 'read status'],
  rating: ['rating', 'my rating', 'note', 'calificación', 'stars'],
  review: ['review', 'my review', 'avis', 'reseña'],
  startedOn: ['started', 'date started', 'start date', 'started on', 'début'],
  finishedOn: ['finished', 'date read', 'finished on', 'end date', 'date finished', 'fin'],
  acquiredOn: ['date added', 'acquired', 'acquired on', 'date acquired', 'acquisition'],
  price: ['price', 'purchase price', 'prix', 'precio'],
  currency: ['currency', 'devise', 'moneda'],
  notes: ['notes', 'private notes', 'personal notes'],
  description: ['description', 'summary', 'résumé'],
  favorite: ['favorite', 'favourite', 'favori', 'favorito'],
};

export function mapHeader(header: string[]): Partial<Record<Field, number>> {
  const map: Partial<Record<Field, number>> = {};
  header.forEach((h, i) => {
    const key = h.trim().toLowerCase();
    for (const [field, aliases] of Object.entries(ALIASES) as [Field, string[]][]) {
      if (map[field] == null && aliases.includes(key)) map[field] = i;
    }
  });
  return map;
}

const STATUS_ALIASES: Record<string, ReadingStatus> = {
  'to-read': 'want_to_read', 'to read': 'want_to_read', 'want to read': 'want_to_read', want_to_read: 'want_to_read', 'à lire': 'want_to_read', 'por leer': 'want_to_read',
  'currently-reading': 'reading', 'currently reading': 'reading', reading: 'reading', 'en cours': 'reading', leyendo: 'reading',
  read: 'completed', completed: 'completed', finished: 'completed', lu: 'completed', terminé: 'completed', leído: 'completed', leido: 'completed',
  'on hold': 'on_hold', on_hold: 'on_hold', paused: 'on_hold', 'en pause': 'on_hold', pausado: 'on_hold',
  abandoned: 'abandoned', dnf: 'abandoned', 'did not finish': 'abandoned', abandonné: 'abandoned', abandonado: 'abandoned',
};

function parseFormat(v: string | null): BookFormat | null {
  if (!v) return null;
  const s = v.toLowerCase();
  if ((BOOK_FORMATS as readonly string[]).includes(s)) return s as BookFormat;
  if (/audio/.test(s)) return 'audiobook';
  if (/kindle|ebook|e-book|epub|numérique|digital/.test(s)) return 'ebook';
  if (/hard|relié|tapa dura|cartonné/.test(s)) return 'hardcover';
  if (/paper|mass market|broché|poche|tapa blanda|bolsillo/.test(s)) return 'paperback';
  return null;
}

/** Accepts YYYY-MM-DD, YYYY/MM/DD and DD/MM/YYYY. Returns null otherwise. */
function parseDay(v: string | null): string | null {
  if (!v) return null;
  const s = v.trim();
  let m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (m) {
    const k = `${m[1]}-${m[2]!.padStart(2, '0')}-${m[3]!.padStart(2, '0')}`;
    return isDayKey(k) ? k : null;
  }
  m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (m) {
    const k = `${m[3]}-${m[2]!.padStart(2, '0')}-${m[1]!.padStart(2, '0')}`;
    return isDayKey(k) ? k : null;
  }
  return null;
}

/** Spreadsheet exports often wrap ISBNs as ="0123456789". */
const unwrapIsbn = (v: string | null) => (v ? v.replace(/^="?|"$/g, '').trim() || null : null);

export type RowIssue = 'missing_title' | 'invalid_pages' | 'invalid_year' | 'invalid_rating' | 'invalid_date' | 'invalid_price' | 'finish_before_start' | 'pages_beyond_total';

export interface ImportRow {
  line: number;
  book: BookInput;
  status: ReadingStatus;
  rating: number | null;
  review: string | null;
  startedOn: string | null;
  finishedOn: string | null;
  errors: RowIssue[];
  warnings: RowIssue[];
  duplicate: DuplicateMatch | null;
}

export interface ImportPreview {
  rows: ImportRow[];
  valid: number;
  invalid: number;
  duplicates: number;
  unknownColumns: string[];
}

export function previewImport(raw: string, existing: readonly DuplicateCandidate[], today: string): ImportPreview {
  const table = parseCsv(raw);
  const header = table[0];
  if (!header) throw new CsvError('no_header');
  const map = mapHeader(header);
  if (map.title == null) throw new CsvError('missing_title_column');
  const mapped = new Set(Object.values(map));
  const unknownColumns = header.filter((h, i) => !mapped.has(i) && h.trim()).map((h) => h.trim());

  // Duplicates are checked against the library and against earlier rows of the same file.
  const seen: DuplicateCandidate[] = [...existing];
  const rows: ImportRow[] = [];
  table.slice(1).forEach((cells, idx) => {
    const get = (f: Field) => (map[f] != null ? cleanText(cells[map[f]!]) : null);
    const errors: RowIssue[] = [];
    const warnings: RowIssue[] = [];
    const title = get('title');
    if (!title) errors.push('missing_title');

    const pagesRaw = get('pages');
    const pages = parseIntOrNull(pagesRaw);
    if (pagesRaw && (pages == null || pages <= 0 || pages > 50_000)) warnings.push('invalid_pages');
    const yearRaw = get('year');
    const year = parseIntOrNull(yearRaw);
    if (yearRaw && (year == null || year < 0 || year > Number(today.slice(0, 4)) + 2)) warnings.push('invalid_year');
    const ratingRaw = get('rating');
    const ratingNum = ratingRaw ? Number(ratingRaw.replace(',', '.')) : null;
    // "0" means "not rated" in several exports.
    const rating = ratingNum != null && Number.isFinite(ratingNum) && ratingNum >= 1 && ratingNum <= 5 ? Math.round(ratingNum) : null;
    if (ratingRaw && ratingNum !== 0 && rating == null) warnings.push('invalid_rating');

    const dates = { startedOn: get('startedOn'), finishedOn: get('finishedOn'), acquiredOn: get('acquiredOn') };
    const parsed = { startedOn: parseDay(dates.startedOn), finishedOn: parseDay(dates.finishedOn), acquiredOn: parseDay(dates.acquiredOn) };
    for (const k of Object.keys(dates) as (keyof typeof dates)[]) {
      if (dates[k] && !parsed[k]) warnings.push('invalid_date');
      if (parsed[k] && parsed[k]! > today) (warnings.push('invalid_date'), (parsed[k] = null));
    }
    if (parsed.startedOn && parsed.finishedOn && parsed.finishedOn < parsed.startedOn) (warnings.push('finish_before_start'), (parsed.startedOn = null));

    const priceRaw = get('price');
    const price = priceRaw ? parseMoneyToCents(priceRaw.replace(/[^\d.,]/g, '')) : null;
    if (priceRaw && price == null) warnings.push('invalid_price');

    let status = STATUS_ALIASES[(get('status') ?? '').toLowerCase()] ?? (parsed.finishedOn ? 'completed' : 'want_to_read');
    if (status !== 'completed' && parsed.finishedOn) status = 'completed';

    const book: BookInput = {
      title: title ?? '',
      subtitle: get('subtitle'),
      originalTitle: get('originalTitle'),
      authorName: get('author'),
      genreName: get('genre')?.split(/[,|]/)[0]?.trim() || null,
      isbn: unwrapIsbn(get('isbn13')) ?? unwrapIsbn(get('isbn')),
      publisher: get('publisher'),
      publishedYear: warnings.includes('invalid_year') ? null : year,
      pageCount: warnings.includes('invalid_pages') ? null : pages,
      language: get('language'),
      format: parseFormat(get('format')) ?? 'paperback',
      acquiredOn: parsed.acquiredOn,
      purchasePriceCents: price,
      currency: get('currency')?.slice(0, 3).toUpperCase() ?? null,
      description: get('description'),
      notes: get('notes'),
      isFavorite: /^(1|true|yes|oui|sí|si|x)$/i.test(get('favorite') ?? ''),
    };
    const duplicate = title ? findDuplicate(book, seen) : null;
    if (title) seen.push({ id: `import-${idx}`, title, authorName: book.authorName ?? null, isbn: book.isbn ?? null });
    rows.push({ line: idx + 2, book, status, rating, review: get('review'), startedOn: parsed.startedOn, finishedOn: parsed.finishedOn, errors, warnings: [...new Set(warnings)], duplicate });
  });

  const invalid = rows.filter((r) => r.errors.length).length;
  return { rows, valid: rows.length - invalid, invalid, duplicates: rows.filter((r) => !r.errors.length && r.duplicate).length, unknownColumns };
}

/* ------------------------------------------------------------------ export */

export const EXPORT_HEADER = [
  'Title', 'Subtitle', 'Original Title', 'Author', 'ISBN', 'Publisher', 'Year', 'Pages', 'Language', 'Format', 'Genre', 'Status',
  'Current Page', 'Started', 'Finished', 'Rating', 'Review', 'Favorite', 'Archived', 'Acquired', 'Price', 'Currency', 'Notes', 'Description',
] as const;

export interface ExportBook {
  title: string; subtitle: string | null; originalTitle: string | null; authorName: string | null; isbn: string | null; publisher: string | null;
  publishedYear: number | null; pageCount: number | null; language: string | null; format: string; genreName: string | null; status: string;
  currentPage: number; startedOn: string | null; finishedOn: string | null; rating: number | null; review: string | null; isFavorite: boolean;
  isArchived: boolean; acquiredOn: string | null; purchasePriceCents: number | null; currency: string | null; notes: string | null; description: string | null;
}

export function libraryToCsv(books: ExportBook[]): string {
  return toCsv([
    [...EXPORT_HEADER],
    ...books.map((b) => [
      b.title, b.subtitle, b.originalTitle, b.authorName, b.isbn, b.publisher, b.publishedYear, b.pageCount, b.language, b.format, b.genreName, b.status,
      b.currentPage, b.startedOn, b.finishedOn, b.rating, b.review, b.isFavorite ? 1 : 0, b.isArchived ? 1 : 0, b.acquiredOn,
      b.purchasePriceCents != null ? (b.purchasePriceCents / 100).toFixed(2) : null, b.currency, b.notes, b.description,
    ]),
  ]);
}
