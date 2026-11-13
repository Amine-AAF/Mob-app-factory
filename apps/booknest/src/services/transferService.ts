import { createBackup, parseBackup, restoreBackup, wipeTables, BackupError, type BackupFile, type SqlDatabase, type SqlValue } from '@factory/storage';

import { remainingQuota } from '@/config/limits';
import type { Repositories } from '@/database';
import { SCHEMA_VERSION, USER_TABLES } from '@/database/migrations';
import { libraryToCsv, previewImport, type ExportBook, type ImportPreview } from '@/features/transfer/csv';
import { isPremiumNow, useSession } from '@/store/session';
import type { ReadingNote } from '@/types';
import { normalizeKey } from '@/utils';

import { track } from './analytics';
import { clock } from './clock';

export const APP_ID = 'booknest';

/**
 * Backup format (documented in apps/booknest/docs/backup-format.md):
 * the factory JSON envelope (`format: "factory-backup"`, `formatVersion`, `schemaVersion`)
 * plus an optional `covers` map (file name → base64 JPEG) for the advanced backup.
 * Device state (subscription cache, running timer) is never exported.
 */
export interface BookNestBackup extends BackupFile {
  booknest?: { backupVersion: 1; includesCovers: boolean };
  covers?: Record<string, string>;
}

export async function exportBackup(db: SqlDatabase, opts: { covers?: Record<string, string>; now?: Date } = {}): Promise<{ json: string; fileName: string; backup: BookNestBackup }> {
  const now = opts.now ?? clock.now();
  const base = await createBackup(db, { appId: APP_ID, tables: USER_TABLES, now });
  const backup: BookNestBackup = { ...base, booknest: { backupVersion: 1, includesCovers: !!opts.covers }, ...(opts.covers ? { covers: opts.covers } : {}) };
  const stamp = now.toISOString().slice(0, 10);
  return { json: JSON.stringify(backup), fileName: `booknest-backup-${stamp}.json`, backup };
}

export interface BackupSummary {
  createdAt: string;
  schemaVersion: number;
  books: number;
  sessions: number;
  quotes: number;
  notes: number;
  includesCovers: boolean;
}

export function describeBackup(raw: string): BackupSummary {
  const b = parseBackup(raw, APP_ID) as BookNestBackup;
  if (b.schemaVersion > SCHEMA_VERSION) throw new BackupError('newer_schema');
  return {
    createdAt: b.createdAt,
    schemaVersion: b.schemaVersion,
    books: b.tables.books?.length ?? 0,
    sessions: b.tables.reading_sessions?.length ?? 0,
    quotes: b.tables.quotes?.length ?? 0,
    notes: b.tables.reading_notes?.length ?? 0,
    includesCovers: !!b.covers && Object.keys(b.covers).length > 0,
  };
}

/** Points cover columns at restored files; drops references to files that don't exist on this device. */
function remapCovers(backup: BookNestBackup, restored: Map<string, string>, exists: (uri: string) => boolean): BookNestBackup {
  const fix = (uri: SqlValue): SqlValue => {
    if (typeof uri !== 'string') return uri;
    const name = uri.split('/').pop() ?? '';
    return restored.get(name) ?? (exists(uri) ? uri : null);
  };
  const tables = { ...backup.tables };
  tables.books = (tables.books ?? []).map((b) => ({ ...b, cover_uri: fix(b.cover_uri ?? null), cover_thumb_uri: fix(b.cover_thumb_uri ?? null) }));
  tables.wishlist_items = (tables.wishlist_items ?? []).map((w) => ({ ...w, cover_uri: fix(w.cover_uri ?? null) }));
  return { ...backup, tables };
}

export interface RestoreOptions {
  mode: 'replace' | 'merge';
  /** Writes backup covers to disk (returns file name → uri). Injected for tests. */
  writeCovers?: (files: Record<string, string>) => Map<string, string>;
  fileExists?: (uri: string) => boolean;
}

/**
 * Restores a backup.
 * - `replace` deletes current data first (the UI requires an explicit confirmation);
 * - `merge` keeps current data and only adds rows that don't exist yet (authors and
 *   genres are matched by name so books are linked to the existing ones).
 */
export async function restoreFromBackup(db: SqlDatabase, raw: string, opts: RestoreOptions): Promise<{ rows: number }> {
  let backup = parseBackup(raw, APP_ID) as BookNestBackup;
  if (backup.schemaVersion > SCHEMA_VERSION) throw new BackupError('newer_schema');
  const restored = backup.covers && opts.writeCovers ? opts.writeCovers(backup.covers) : new Map<string, string>();
  backup = remapCovers(backup, restored, opts.fileExists ?? (() => true));

  let rows = 0;
  if (opts.mode === 'replace') {
    rows = (await restoreBackup(db, backup, { tables: USER_TABLES, currentSchemaVersion: SCHEMA_VERSION })).restoredRows;
  } else {
    rows = await mergeBackup(db, backup);
  }
  useSession.getState().bump();
  return { rows };
}

const IDENT = /^[A-Za-z_][A-Za-z0-9_]*$/;

async function mergeBackup(db: SqlDatabase, backup: BackupFile): Promise<number> {
  let inserted = 0;
  await db.withTransactionAsync(async () => {
    // Map backup author/genre ids onto existing rows with the same name.
    const remap: Record<'authors' | 'genres', Map<string, string>> = { authors: new Map(), genres: new Map() };
    for (const table of ['authors', 'genres'] as const) {
      for (const row of backup.tables[table] ?? []) {
        const key = typeof row.name_key === 'string' ? row.name_key : normalizeKey(String(row.name ?? ''));
        const existing = await db.getFirstAsync<{ id: string }>(`SELECT id FROM ${table} WHERE name_key = ?`, [key]);
        if (existing) remap[table].set(String(row.id), existing.id);
      }
    }
    for (const table of USER_TABLES) {
      const columns = new Set((await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${table})`, [])).map((c) => c.name));
      for (const original of backup.tables[table] ?? []) {
        const row = { ...original };
        if ((table === 'authors' || table === 'genres') && remap[table].has(String(row.id))) continue;
        if (table === 'books') {
          if (row.author_id != null) row.author_id = remap.authors.get(String(row.author_id)) ?? row.author_id;
          if (row.genre_id != null) row.genre_id = remap.genres.get(String(row.genre_id)) ?? row.genre_id;
        }
        const keys = Object.keys(row).filter((k) => columns.has(k) && IDENT.test(k));
        if (!keys.length) continue;
        const res = await db.runAsync(`INSERT OR IGNORE INTO ${table} (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`, keys.map((k) => row[k] ?? null));
        inserted += res.changes;
      }
    }
  });
  return inserted;
}

/** Erases every user-owned row and device state. Settings rows are recreated with defaults (all off). */
export async function deleteAllUserData(db: SqlDatabase): Promise<void> {
  await wipeTables(db, ['session_timer', ...[...USER_TABLES].reverse(), 'subscription_cache']);
  await db.execAsync(`INSERT INTO notification_settings (kind, enabled, hour, minute, weekday, updated_at) VALUES
    ('daily',0,20,30,NULL,'1970-01-01T00:00:00.000Z'),('weekly_goal',0,10,0,0,'1970-01-01T00:00:00.000Z'),('monthly_goal',0,10,0,NULL,'1970-01-01T00:00:00.000Z'),
    ('challenge',0,10,0,6,'1970-01-01T00:00:00.000Z'),('resume_book',0,19,0,NULL,'1970-01-01T00:00:00.000Z'),('yearly_goal',0,10,0,NULL,'1970-01-01T00:00:00.000Z')`);
  useSession.getState().bump();
}

/* ------------------------------------------------------------------- CSV */

export async function previewCsvImport(r: Repositories, raw: string): Promise<ImportPreview> {
  return previewImport(raw, await r.books.duplicateCandidates(), clock.today());
}

export interface ImportOutcome {
  imported: number;
  skippedDuplicates: number;
  skippedInvalid: number;
  skippedLimit: number;
}

/** Imports the valid rows of a preview in one transaction. Duplicates are skipped unless asked. */
export async function commitCsvImport(r: Repositories, preview: ImportPreview, opts: { includeDuplicates: boolean }): Promise<ImportOutcome> {
  const premium = isPremiumNow();
  let quota = remainingQuota('books', await r.books.count(), premium);
  const out: ImportOutcome = { imported: 0, skippedDuplicates: 0, skippedInvalid: 0, skippedLimit: 0 };
  await r.db.withTransactionAsync(async () => {
    for (const row of preview.rows) {
      if (row.errors.length) {
        out.skippedInvalid++;
        continue;
      }
      if (row.duplicate && !opts.includeDuplicates) {
        out.skippedDuplicates++;
        continue;
      }
      if (quota <= 0) {
        out.skippedLimit++;
        continue;
      }
      const id = await r.books.create(row.book, { status: row.status });
      const rec = await r.reading.current(id);
      if (rec) {
        const completed = row.status === 'completed';
        const currentPage = completed && row.book.pageCount ? row.book.pageCount : 0;
        await r.reading.updateRecord(rec.id, { startedOn: row.startedOn ?? (completed ? row.finishedOn : null), finishedOn: completed ? row.finishedOn : null, currentPage });
      }
      if (row.rating != null || row.review) await r.content.saveReview(id, { rating: row.rating, body: row.review, readOn: row.finishedOn });
      if (row.book.format === 'audiobook') await r.reading.saveAudio({ bookId: id, totalSeconds: null, positionSeconds: 0, playbackSpeed: null, startedOn: null, finishedOn: null });
      quota--;
      out.imported++;
    }
  });
  track('import_completed', { kind: 'csv', rows: out.imported });
  useSession.getState().bump();
  return out;
}

export async function loadExportBooks(db: SqlDatabase): Promise<ExportBook[]> {
  const rows = await db.getAllAsync<Record<string, SqlValue>>(
    `SELECT b.*, a.name AS author_name, g.name AS genre_name, r.status, r.current_page, r.started_on, r.finished_on, rv.rating, rv.body AS review
       FROM books b LEFT JOIN authors a ON a.id = b.author_id LEFT JOIN genres g ON g.id = b.genre_id
       LEFT JOIN reading_records r ON r.book_id = b.id AND r.is_current = 1 LEFT JOIN reviews rv ON rv.book_id = b.id
      ORDER BY b.title_key`,
    [],
  );
  const s = (v: SqlValue | undefined) => (v == null ? null : String(v));
  const n = (v: SqlValue | undefined) => (v == null ? null : Number(v));
  return rows.map((b) => ({
    title: String(b.title), subtitle: s(b.subtitle), originalTitle: s(b.original_title), authorName: s(b.author_name), isbn: s(b.isbn), publisher: s(b.publisher),
    publishedYear: n(b.published_year), pageCount: n(b.page_count), language: s(b.language), format: String(b.format), genreName: s(b.genre_name),
    status: s(b.status) ?? 'want_to_read', currentPage: n(b.current_page) ?? 0, startedOn: s(b.started_on), finishedOn: s(b.finished_on), rating: n(b.rating),
    review: s(b.review), isFavorite: Number(b.is_favorite) === 1, isArchived: Number(b.is_archived) === 1, acquiredOn: s(b.acquired_on),
    purchasePriceCents: n(b.purchase_price_cents), currency: s(b.currency), notes: s(b.notes), description: s(b.description),
  }));
}

export async function exportLibraryCsv(db: SqlDatabase): Promise<{ csv: string; fileName: string }> {
  const csv = libraryToCsv(await loadExportBooks(db));
  track('export_completed', { kind: 'csv' });
  return { csv, fileName: `booknest-library-${clock.today()}.csv` };
}

/* ------------------------------------------------------------------ PDF */

const esc = (v: string | number | null | undefined) =>
  v == null ? '' : String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Printable library catalogue (HTML rendered to PDF by expo-print). */
export function libraryHtml(books: ExportBook[], labels: { title: string; generated: string; columns: string[]; status: (s: string) => string }): string {
  const rows = books
    .filter((b) => !b.isArchived)
    .map((b) => `<tr><td><b>${esc(b.title)}</b>${b.subtitle ? `<br/><i>${esc(b.subtitle)}</i>` : ''}</td><td>${esc(b.authorName)}</td><td>${esc(labels.status(b.status))}</td><td>${b.rating ? '★'.repeat(b.rating) : ''}</td><td>${esc(b.finishedOn)}</td></tr>`)
    .join('');
  return `<!doctype html><html><head><meta charset="utf-8"/><style>
    body{font-family:Georgia,serif;color:#2a211c;margin:32px} h1{color:#8A3B2E;font-weight:normal;margin:0 0 4px}
    p{color:#7a6a5c;margin:0 0 20px;font-size:12px} table{width:100%;border-collapse:collapse;font-size:11px}
    th{text-align:left;border-bottom:2px solid #8A3B2E;padding:6px 4px;font-family:sans-serif;text-transform:uppercase;font-size:9px;letter-spacing:1px}
    td{border-bottom:1px solid #e7dccb;padding:6px 4px;vertical-align:top}</style></head><body>
    <h1>${esc(labels.title)}</h1><p>${esc(labels.generated)}</p>
    <table><thead><tr>${labels.columns.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></body></html>`;
}

/** Journal export as Markdown (private file the user chooses to share or keep). */
export function journalMarkdown(notes: ReadingNote[], labels: { title: string; kind: (k: string) => string; date: (iso: string) => string }): string {
  const lines = [`# ${labels.title}`, ''];
  for (const n of notes) {
    lines.push(`## ${n.title ?? labels.kind(n.kind)}`, `*${labels.date(n.createdAt)}${n.bookTitle ? ` · ${n.bookTitle}` : ''}*`, '');
    lines.push(n.body, '');
    if (n.tags.length) lines.push(n.tags.map((t) => `#${t}`).join(' '), '');
  }
  return lines.join('\n');
}
