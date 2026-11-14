import { FREE_STATE } from '@factory/monetization';
import { createTestDatabase } from '@factory/testing';

import { LimitReachedError } from '@/config/limits';
import { initDatabase, setRepositories, type Repositories } from '@/database';
import { migrations, SCHEMA_VERSION, USER_TABLES } from '@/database/migrations';
import { ProgressError } from '@/features/tracking/progress';
import { SessionError } from '@/features/sessions/timer';
import { clock } from '@/services/clock';
import { addBook, BookValidationError, deleteBook, setArchived, updateBook } from '@/services/libraryService';
import {
  addManualSession,
  finishSession,
  pauseSession,
  restartReading,
  resumeSession,
  setStatus,
  startTimer,
  updateAudio,
  updatePage,
} from '@/services/readingService';
import { useSession } from '@/store/session';

jest.mock('@/services/covers', () => ({ deleteCoverFiles: jest.fn(), cleanOrphanCovers: jest.fn() }));

const at = (iso: string) => clock.set(() => new Date(iso));
const premium = (on: boolean) => useSession.getState().setEntitlement(on ? { ...FREE_STATE, isPremium: true, source: 'store' } : FREE_STATE);

let db: Awaited<ReturnType<typeof createTestDatabase>>;
let r: Repositories;

async function newBook(title: string, extra: Record<string, unknown> = {}) {
  const res = await addBook(r, { title, authorName: 'Ursula K. Le Guin', pageCount: 300, ...extra }, { allowDuplicate: true });
  if (res.status !== 'created') throw new Error('expected created');
  return res.id;
}

beforeEach(async () => {
  db = await createTestDatabase();
  r = await initDatabase(db);
  setRepositories(r);
  premium(false);
  at('2026-11-10T09:00:00');
});
afterEach(() => {
  clock.set(null);
  db.close();
});

describe('schema & migrations', () => {
  it('migrates to the latest version and creates every user table', async () => {
    const v = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version', []);
    expect(v?.user_version).toBe(SCHEMA_VERSION);
    expect(migrations.map((m) => m.version)).toEqual(migrations.map((_, i) => i + 1));
    for (const table of USER_TABLES) {
      await expect(db.getAllAsync(`SELECT * FROM ${table} LIMIT 1`, [])).resolves.toBeDefined();
    }
    const settings = await r.organize.notificationSettings();
    expect(settings).toHaveLength(6);
    expect(settings.every((s) => !s.enabled)).toBe(true);
  });

  it('is idempotent when re-run on an existing database', async () => {
    await expect(initDatabase(db)).resolves.toBeDefined();
  });

  it('enforces foreign keys and cascades book deletion', async () => {
    const id = await newBook('The Dispossessed');
    await r.content.saveQuote({ bookId: id, text: 'True journey is return.' });
    await r.content.saveReview(id, { rating: 5 });
    await deleteBook(r, id);
    expect(await r.content.quoteCount()).toBe(0);
    expect(await r.content.review(id)).toBeNull();
    expect(await r.reading.history(id)).toEqual([]);
    // Orphan author removed too.
    expect(await r.books.authors()).toEqual([]);
    await expect(db.runAsync('INSERT INTO reading_records (id, book_id, status, created_at, updated_at) VALUES (?,?,?,?,?)', ['x', 'missing', 'reading', 'a', 'a'])).rejects.toThrow();
  });
});

describe('library', () => {
  it('creates books with authors and genres deduplicated by name', async () => {
    await newBook('A Wizard of Earthsea', { genreName: 'Fantasy' });
    await newBook('The Left Hand of Darkness', { authorName: 'ursula k le guin', genreName: 'fantasy ' });
    const authors = await r.books.authors();
    expect(authors).toHaveLength(1);
    expect(authors[0]!.books).toBe(2);
    expect(await r.books.genres()).toHaveLength(1);
  });

  it('validates fields and keeps books without ISBN or page count', async () => {
    await expect(addBook(r, { title: '  ' })).rejects.toBeInstanceOf(BookValidationError);
    await expect(addBook(r, { title: 'X', pageCount: -3 })).rejects.toBeInstanceOf(BookValidationError);
    await expect(addBook(r, { title: 'X', acquiredOn: '2030-01-01' })).rejects.toBeInstanceOf(BookValidationError);
    const res = await addBook(r, { title: 'Untitled notebook' });
    expect(res.status).toBe('created');
    const list = await r.books.list();
    expect(list[0]).toMatchObject({ title: 'Untitled notebook', pageCount: null, status: 'want_to_read' });
  });

  it('detects duplicates by ISBN (10 vs 13) and by title + author', async () => {
    await addBook(r, { title: 'Dune', authorName: 'Frank Herbert', isbn: '0-441-17271-7' });
    const byIsbn = await addBook(r, { title: 'Dune (Deluxe)', authorName: 'F. Herbert', isbn: '9780441172719' });
    expect(byIsbn).toMatchObject({ status: 'duplicate', match: { reason: 'isbn' } });
    const byTitle = await addBook(r, { title: 'DUNE!', authorName: 'frank herbert' });
    expect(byTitle).toMatchObject({ status: 'duplicate', match: { reason: 'title_author' } });
    const forced = await addBook(r, { title: 'Dune', authorName: 'Frank Herbert' }, { allowDuplicate: true });
    expect(forced.status).toBe('created');
  });

  it('searches accent-insensitively across title, author and ISBN; filters and sorts', async () => {
    const a = await newBook('Cien años de soledad', { authorName: 'Gabriel García Márquez', genreName: 'Classics', isbn: '9780060883287' });
    const b = await newBook('Le Petit Prince', { authorName: 'Antoine de Saint-Exupéry', pageCount: 96 });
    await newBook('Archived one');
    await setArchived(r, (await r.books.list({ search: 'archived' }))[0]!.id, true);
    expect((await r.books.list({ search: 'anos soledad' })).map((x) => x.id)).toEqual([a]);
    expect((await r.books.list({ search: 'garcia' })).map((x) => x.id)).toEqual([a]);
    expect((await r.books.list({ search: '9780060883287' })).map((x) => x.id)).toEqual([a]);
    expect((await r.books.list({ search: 'exupery petit' })).map((x) => x.id)).toEqual([b]);
    expect(await r.books.list({ search: 'archived' })).toHaveLength(0);
    expect(await r.books.list({ archived: true })).toHaveLength(1);
    await r.books.setFavorite(b, true);
    expect((await r.books.list({ favoritesOnly: true })).map((x) => x.id)).toEqual([b]);
    expect((await r.books.list({ genreId: (await r.books.genres())[0]!.id })).map((x) => x.id)).toEqual([a]);
    expect((await r.books.list({ sort: 'title' })).map((x) => x.title)).toEqual(['Cien años de soledad', 'Le Petit Prince']);
    await updatePage(r, b, 48);
    expect((await r.books.list({ sort: 'progress' }))[0]!.id).toBe(b);
    expect((await r.books.list({ status: 'reading' })).map((x) => x.id)).toEqual([b]);
  });

  it('enforces the free limit of 100 books, unlimited with Premium', async () => {
    for (let i = 0; i < 100; i++) await r.books.create({ title: `Book ${i}` });
    await expect(addBook(r, { title: 'One too many' })).rejects.toBeInstanceOf(LimitReachedError);
    premium(true);
    await expect(addBook(r, { title: 'One too many' })).resolves.toMatchObject({ status: 'created' });
  });

  it('lists thousands of books quickly', async () => {
    premium(true);
    await db.withTransactionAsync(async () => {
      for (let i = 0; i < 3000; i++) await r.books.create({ title: `Volume ${i}`, authorName: `Author ${i % 200}`, genreName: `Genre ${i % 12}`, pageCount: 100 + i });
    });
    const t0 = Date.now();
    const all = await r.books.list({ sort: 'title' });
    const found = await r.books.list({ search: 'volume 2999' });
    expect(all).toHaveLength(3000);
    expect(found.map((b) => b.title)).toEqual(['Volume 2999']);
    // Generous bound: sql.js (WASM) under Jest is far slower than SQLite on a device.
    expect(Date.now() - t0).toBeLessThan(10_000);
  });

  it('refuses a page count below the current page when editing', async () => {
    const id = await newBook('Long book', { pageCount: 500 });
    await updatePage(r, id, 400);
    await expect(updateBook(r, id, { title: 'Long book', pageCount: 300 })).rejects.toBeInstanceOf(BookValidationError);
  });
});

describe('reading tracker', () => {
  it('computes progress and moves statuses consistently', async () => {
    const id = await newBook('Progress', { pageCount: 200 });
    expect(await updatePage(r, id, 50)).toBe('reading');
    let rec = await r.reading.current(id);
    expect(rec).toMatchObject({ status: 'reading', currentPage: 50, startedOn: '2026-11-10' });
    await expect(updatePage(r, id, 201)).rejects.toBeInstanceOf(ProgressError);
    await expect(updatePage(r, id, -1)).rejects.toBeInstanceOf(ProgressError);
    at('2026-11-12T20:00:00');
    expect(await updatePage(r, id, 200)).toBe('completed');
    rec = await r.reading.current(id);
    expect(rec).toMatchObject({ status: 'completed', finishedOn: '2026-11-12', currentPage: 200 });
    // Pages read are counted from forward progress, on the day they happened.
    expect(await r.reading.progressByDay('page')).toEqual([
      { day: '2026-11-10', bookId: id, amount: 50 },
      { day: '2026-11-12', bookId: id, amount: 150 },
    ]);
  });

  it('marks as completed directly and supports re-reads with history', async () => {
    const id = await newBook('Reread me', { pageCount: 120 });
    await setStatus(r, id, 'completed');
    // Never started: the start date stays unknown rather than invented.
    expect(await r.reading.current(id)).toMatchObject({ status: 'completed', currentPage: 120, startedOn: null, finishedOn: '2026-11-10' });
    at('2026-11-11T08:00:00');
    await restartReading(r, id);
    const history = await r.reading.history(id);
    expect(history.map((h) => [h.attempt, h.status, h.isCurrent])).toEqual([
      [2, 'reading', true],
      [1, 'completed', false],
    ]);
    expect(history[0]).toMatchObject({ currentPage: 0, startedOn: '2026-11-11' });
  });

  it('handles books without page count (progress unknown, completion still possible)', async () => {
    const res = await addBook(r, { title: 'No pages' });
    const id = res.status === 'created' ? res.id : '';
    await updatePage(r, id, 30);
    expect(await r.reading.current(id)).toMatchObject({ status: 'reading', currentPage: 30 });
    await setStatus(r, id, 'completed');
    expect(await r.reading.current(id)).toMatchObject({ status: 'completed', currentPage: 30 });
  });

  it('tracks audiobook position and completion', async () => {
    const id = await newBook('Audio', { format: 'audiobook', pageCount: null });
    await updateAudio(r, id, { totalSeconds: 36000, positionSeconds: 9000, playbackSpeed: 1.5 });
    expect(await r.reading.audio(id)).toMatchObject({ positionSeconds: 9000, totalSeconds: 36000, playbackSpeed: 1.5, startedOn: '2026-11-10' });
    expect((await r.reading.current(id))!.status).toBe('reading');
    await expect(updateAudio(r, id, { positionSeconds: 40000 })).rejects.toBeInstanceOf(ProgressError);
    await updateAudio(r, id, { positionSeconds: 36000 });
    expect((await r.reading.current(id))!.status).toBe('completed');
    expect((await r.reading.audioHistory(id)).map((h) => h.toSeconds)).toEqual([36000, 9000]);
    const list = await r.books.list();
    expect(list[0]!.audioProgress).toBe(1);
  });
});

describe('reading sessions', () => {
  it('derives duration from timestamps, excluding pauses (survives background/kill)', async () => {
    const id = await newBook('Timed', { pageCount: 300 });
    at('2026-11-10T20:00:00');
    await startTimer(r, id);
    await expect(startTimer(r, id)).rejects.toBeInstanceOf(SessionError);
    at('2026-11-10T20:10:00');
    await pauseSession(r);
    // App killed while paused: only stored timestamps matter.
    at('2026-11-10T21:00:00');
    await resumeSession(r);
    at('2026-11-10T21:20:00');
    await finishSession(r, { endPage: 40, notes: 'Great chapter' });
    const [s] = await r.reading.sessionsForBook(id);
    expect(s).toMatchObject({ durationSec: 30 * 60, startPage: 0, endPage: 40, source: 'timer', day: '2026-11-10' });
    expect(await r.reading.timer()).toBeNull();
    expect((await r.reading.current(id))!.currentPage).toBe(40);
  });

  it('rejects inconsistent sessions', async () => {
    const id = await newBook('Manual', { pageCount: 100 });
    const base = { startedAt: new Date('2026-11-09T10:00:00'), endedAt: new Date('2026-11-09T11:00:00'), startPage: 10, endPage: 30 };
    await expect(addManualSession(r, id, { ...base, endedAt: new Date('2026-11-09T09:00:00') })).rejects.toBeInstanceOf(SessionError);
    await expect(addManualSession(r, id, { ...base, endPage: 5 })).rejects.toBeInstanceOf(SessionError);
    await expect(addManualSession(r, id, { ...base, endPage: 101 })).rejects.toBeInstanceOf(SessionError);
    await expect(addManualSession(r, id, { ...base, startedAt: new Date('2026-11-11T10:00:00'), endedAt: new Date('2026-11-11T11:00:00') })).rejects.toBeInstanceOf(SessionError);
    await addManualSession(r, id, base);
    expect((await r.reading.sessionsForBook(id))[0]).toMatchObject({ durationSec: 3600, source: 'manual' });
    expect((await r.reading.current(id))!.currentPage).toBe(30);
  });

  it('keeps an interrupted timer across restarts and allows correcting a forgotten one', async () => {
    const id = await newBook('Forgotten');
    at('2026-11-10T08:00:00');
    await startTimer(r, id);
    // New repositories instance = app restart.
    const restarted = await initDatabase(db);
    expect(await restarted.reading.timer()).toMatchObject({ bookId: id, pausedAt: null });
    at('2026-11-10T20:00:00');
    await finishSession(restarted, { durationOverrideSec: 45 * 60 });
    expect((await restarted.reading.sessionsForBook(id))[0]!.durationSec).toBe(2700);
  });
});

describe('calendar view', () => {
  it('aggregates sessions, pages and finished books per day', async () => {
    const id = await newBook('Cal', { pageCount: 100 });
    await addManualSession(r, id, { startedAt: new Date('2026-11-09T10:00:00'), endedAt: new Date('2026-11-09T10:30:00'), startPage: 0, endPage: 20 });
    at('2026-11-10T12:00:00');
    await setStatus(r, id, 'completed');
    const days = await r.reading.calendar('2026-11-01', '2026-11-30');
    expect(days).toEqual([
      { day: '2026-11-09', seconds: 1800, pages: 20, sessions: 1, finished: 0 },
      { day: '2026-11-10', seconds: 0, pages: 80, sessions: 0, finished: 1 },
    ]);
  });
});
