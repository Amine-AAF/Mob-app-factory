import { FREE_STATE } from '@factory/monetization';
import { BackupError } from '@factory/storage';
import { createTestDatabase } from '@factory/testing';

import { LimitReachedError } from '@/config/limits';
import { initDatabase, setRepositories, type Repositories } from '@/database';
import { discover, similarBooks } from '@/features/discover/recommend';
import { buildActivity, computeGoalProgress, goalHistory, yearlyPace } from '@/features/goals/goals';
import { planNotifications, toExpoWeekday } from '@/features/reminders/plan';
import { bestPeriods, monthlySeries, overview, personalRecords, yearlyComparison } from '@/features/statistics/stats';
import { CsvError, parseCsv, previewImport, toCsv } from '@/features/transfer/csv';
import { clock } from '@/services/clock';
import { ContentValidationError, createCollection, moveWishToLibrary, saveNote, saveQuote, saveWish, setBookCollections, wishlistBudget } from '@/services/contentService';
import { checkGoalCelebrations, createGoal, evaluateGoals, GoalValidationError, joinChallenge, setCustomProgress } from '@/services/goalService';
import { addBook } from '@/services/libraryService';
import { addManualSession, setStatus, updatePage } from '@/services/readingService';
import { loadStatsInput } from '@/services/statsService';
import { commitCsvImport, deleteAllUserData, describeBackup, exportBackup, exportLibraryCsv, previewCsvImport, restoreFromBackup } from '@/services/transferService';
import { useSession } from '@/store/session';
import type { NotificationSetting, ReadingGoal } from '@/types';

jest.mock('@/services/covers', () => ({ deleteCoverFiles: jest.fn(), cleanOrphanCovers: jest.fn() }));

const at = (iso: string) => clock.set(() => new Date(iso));
const premium = (on: boolean) => useSession.getState().setEntitlement(on ? { ...FREE_STATE, isPremium: true, source: 'store' } : FREE_STATE);

let db: Awaited<ReturnType<typeof createTestDatabase>>;
let r: Repositories;

async function book(title: string, extra: Record<string, unknown> = {}) {
  const res = await addBook(r, { title, pageCount: 200, ...extra }, { allowDuplicate: true });
  if (res.status !== 'created') throw new Error('dup');
  return res.id;
}

beforeEach(async () => {
  db = await createTestDatabase();
  r = await initDatabase(db);
  setRepositories(r);
  premium(false);
  useSession.setState({ celebrations: [] });
  at('2026-11-10T09:00:00');
});
afterEach(() => {
  clock.set(null);
  db.close();
});

describe('goals', () => {
  const goal = (type: ReadingGoal['type'], target: number, extra: Partial<ReadingGoal> = {}): ReadingGoal => ({
    id: 'g', type, title: null, target, unit: null, manualProgress: 0, challengeId: null, periodStart: '2026-01-01', periodEnd: null,
    isActive: true, completedAt: null, createdAt: '', updatedAt: '', ...extra,
  });
  const data = buildActivity({
    finishedDays: ['2026-02-01', '2026-11-02', '2025-12-30'],
    pages: [{ day: '2026-11-08', amount: 120 }, { day: '2026-11-09', amount: 30 }, { day: '2026-10-20', amount: 400 }],
    sessions: [{ day: '2026-11-10', durationSec: 1500 }, { day: '2026-11-08', durationSec: 600 }, { day: '2026-11-07', durationSec: 300 }],
  });

  it('computes each goal type over its current period', () => {
    expect(computeGoalProgress(goal('books_per_year', 12), data, '2026-11-10')).toMatchObject({ value: 2, remaining: 10, reached: false });
    expect(computeGoalProgress(goal('pages_per_month', 100), data, '2026-11-10')).toMatchObject({ value: 150, reached: true, ratio: 1 });
    expect(computeGoalProgress(goal('minutes_per_day', 20), data, '2026-11-10')).toMatchObject({ value: 25, reached: true });
    // Week of Mon 9 Nov → Sun 15 Nov: active on 9 (pages) and 10 (session).
    expect(computeGoalProgress(goal('days_per_week', 4), data, '2026-11-10')).toMatchObject({ value: 2, remaining: 2 });
    // Weekend challenge counts Saturday/Sunday only (7 & 8 Nov in the previous week).
    expect(computeGoalProgress(goal('days_per_week', 2, { challengeId: 'weekend' }), data, '2026-11-10', -1)).toMatchObject({ value: 2, reached: true });
    expect(computeGoalProgress(goal('custom', 10, { manualProgress: 4 }), data, '2026-11-10')).toMatchObject({ value: 4 });
  });

  it('compares with previous periods and reports pace without judgement', () => {
    const months = goalHistory(goal('pages_per_month', 300), data, '2026-11-10', 3);
    expect(months.map((m) => [m.period.start, m.value])).toEqual([['2026-09-01', 0], ['2026-10-01', 400], ['2026-11-01', 150]]);
    const p = computeGoalProgress(goal('books_per_year', 12), data, '2026-11-10');
    expect(yearlyPace(p, '2026-11-10')).toMatchObject({ status: 'behind' });
    expect(yearlyPace(p, '2026-01-05')).toBeNull();
  });

  it('creates goals within limits, gates custom goals, joins challenges and celebrates once', async () => {
    await expect(createGoal(r, { type: 'custom', target: 5, periodStart: '2026-11-01' })).rejects.toBeInstanceOf(GoalValidationError);
    await expect(createGoal(r, { type: 'days_per_week', target: 9, periodStart: '2026-11-01' })).rejects.toBeInstanceOf(GoalValidationError);
    await joinChallenge(r, 'books_12');
    const id = await book('Quick read', { pageCount: 10 });
    await createGoal(r, { type: 'pages_per_month', target: 10, periodStart: '2026-11-01' });
    await createGoal(r, { type: 'minutes_per_day', target: 15, periodStart: '2026-11-01' });
    await expect(createGoal(r, { type: 'days_per_week', target: 3, periodStart: '2026-11-01' })).rejects.toBeInstanceOf(LimitReachedError);
    await updatePage(r, id, 10);
    expect(useSession.getState().celebrations).toHaveLength(1);
    expect(await checkGoalCelebrations(r)).toEqual([]);
    const progress = await evaluateGoals(r, '2026-11-10');
    expect(progress.find((p) => p.goal.challengeId === 'books_12')).toMatchObject({ value: 1, target: 12 });
    premium(true);
    const custom = await createGoal(r, { type: 'custom', title: 'Read 3 classics', target: 3, periodStart: '2026-11-01', periodEnd: '2026-12-31' });
    await setCustomProgress(r, custom, 3);
    expect((await r.organize.goal(custom))!.completedAt).not.toBeNull();
  });
});

describe('quotes, journal, reviews', () => {
  it('saves, searches, filters and limits quotes', async () => {
    const id = await book('Meditations', { authorName: 'Marcus Aurelius' });
    await expect(saveQuote(r, { bookId: id, text: '   ' })).rejects.toBeInstanceOf(ContentValidationError);
    await expect(saveQuote(r, { bookId: id, text: 'x'.repeat(2001) })).rejects.toBeInstanceOf(ContentValidationError);
    await saveQuote(r, { bookId: id, text: 'The impediment to action advances action.', page: 52, tags: ['stoic', '#Stoic', 'action'] });
    await saveQuote(r, { bookId: null, text: 'Ce qui est essentiel est invisible.', authorName: 'Saint-Exupéry' });
    const all = await r.content.quotes();
    expect(all).toHaveLength(2);
    expect(all.find((q) => q.bookId)!.tags).toEqual(['stoic', 'action']);
    expect((await r.content.quotes({ search: 'essentiel invisible' })).map((q) => q.authorName)).toEqual(['Saint-Exupéry']);
    expect(await r.content.quotes({ bookId: id })).toHaveLength(1);
    expect(await r.content.quotes({ tag: 'STOIC' })).toHaveLength(1);
    for (let i = 0; i < 98; i++) await r.content.saveQuote({ bookId: null, text: `q${i}` });
    await expect(saveQuote(r, { bookId: null, text: 'over' })).rejects.toBeInstanceOf(LimitReachedError);
  });

  it('keeps journal entries when their book is deleted', async () => {
    const id = await book('Journal book');
    await saveNote(r, { bookId: id, kind: 'impression', title: 'First thoughts', body: 'Slow start, great ending.', tags: ['favorite'] });
    await r.books.remove(id);
    const [note] = await r.content.notes();
    expect(note).toMatchObject({ bookId: null, kind: 'impression', tags: ['favorite'] });
    expect(await r.content.notes({ search: 'ending' })).toHaveLength(1);
  });

  it('builds a personal ranking from private ratings', async () => {
    const a = await book('Alpha');
    const b = await book('Beta');
    await r.content.saveReview(a, { rating: 4, recommend: 'yes' });
    await r.content.saveReview(b, { rating: 5, pros: 'Characters', cons: 'Length' });
    expect((await r.content.ranking()).map((x) => x.title)).toEqual(['Beta', 'Alpha']);
    expect((await r.books.list({ minRating: 5 })).map((x) => x.title)).toEqual(['Beta']);
  });
});

describe('collections & wishlist', () => {
  it('puts a book in several collections and limits custom collections', async () => {
    const id = await book('Foundation', { genreName: 'Science fiction' });
    const fav = await createCollection(r, { name: 'Favorites', presetKey: 'favorites' });
    const scifi = await createCollection(r, { name: 'Sci-fi', presetKey: 'science_fiction' });
    await setBookCollections(r, id, [fav, scifi]);
    expect((await r.organize.collections()).map((c) => c.bookCount)).toEqual([1, 1]);
    expect((await r.books.list({ collectionId: scifi })).map((b) => b.id)).toEqual([id]);
    await setBookCollections(r, id, [scifi]);
    expect(await r.organize.collectionsOfBook(id)).toEqual([scifi]);
    for (let i = 0; i < 3; i++) await createCollection(r, { name: `Mine ${i}` });
    await expect(createCollection(r, { name: 'Fourth' })).rejects.toBeInstanceOf(LimitReachedError);
    await expect(createCollection(r, { name: 'Preset ok', presetKey: 'history' })).resolves.toBeTruthy();
  });

  it('manages wishlist statuses, budget and moving to the library', async () => {
    await expect(saveWish(r, { title: 'Bad url', url: 'javascript:alert(1)' })).rejects.toBeInstanceOf(ContentValidationError);
    const w1 = await saveWish(r, { title: 'The Name of the Rose', author: 'Umberto Eco', estimatedPriceCents: 1299, currency: 'usd', priority: 1 });
    await saveWish(r, { title: 'No price', currency: 'USD' });
    await saveWish(r, { title: 'Euro book', estimatedPriceCents: 900, currency: 'EUR' });
    const budget = wishlistBudget(await r.organize.wishlist(), 'USD', '2026-11');
    expect(budget).toMatchObject({ pendingCents: 1299, pendingWithoutPrice: 1, otherCurrencies: 1 });
    await r.organize.setWishStatus(w1, 'purchased');
    const moved = await moveWishToLibrary(r, w1);
    expect(moved.status).toBe('created');
    expect(await r.organize.wish(w1)).toMatchObject({ status: 'added_to_library' });
    expect((await r.books.list())[0]).toMatchObject({ title: 'The Name of the Rose', authorName: 'Umberto Eco' });
    expect(wishlistBudget(await r.organize.wishlist(), 'USD', '2026-11').spentThisMonthCents).toBe(1299);
    expect((await r.organize.wishlist({ sort: 'priority' }))[0]!.title).toBe('The Name of the Rose');
  });
});

describe('statistics', () => {
  it('never invents numbers from missing data', async () => {
    await book('Nothing yet');
    const stats = overview(await loadStatsInput(r), 2026);
    expect(stats).toMatchObject({ booksRead: 0, pagesRead: null, readingSeconds: null, avgBooksPerMonth: null, avgSessionSec: null });
    expect(personalRecords(await loadStatsInput(r))).toMatchObject({ longestSessionSec: null, longestStreak: null, fastestBook: null });
    expect(bestPeriods(await loadStatsInput(r))).toBeNull();
  });

  it('computes books, pages, time, genres, authors, monthly and yearly figures', async () => {
    const a = await book('One', { authorName: 'Le Guin', genreName: 'Fantasy', pageCount: 100 });
    const b = await book('Two', { authorName: 'Le Guin', genreName: 'Fantasy', pageCount: null });
    const c = await book('Three', { authorName: 'Asimov', genreName: 'Science fiction', pageCount: 300 });
    at('2026-03-01T10:00:00');
    await updatePage(r, a, 40);
    at('2026-03-04T10:00:00');
    await setStatus(r, a, 'completed');
    await addManualSession(r, c, { startedAt: new Date('2026-03-04T07:00:00'), endedAt: new Date('2026-03-04T08:00:00'), startPage: 0, endPage: 30 });
    at('2026-05-10T10:00:00');
    await setStatus(r, b, 'completed');
    await r.content.saveReview(a, { rating: 5 });
    at('2026-11-10T09:00:00');
    await setStatus(r, c, 'abandoned');
    const input = await loadStatsInput(r);
    const o = overview(input, 2026);
    expect(o).toMatchObject({ booksRead: 2, abandoned: 1, pagesRead: 130, finishedWithoutPages: 1, readingSeconds: 3600, sessionCount: 1 });
    expect(o.topAuthors[0]).toMatchObject({ name: 'Le Guin', count: 2, avgRating: 5 });
    expect(o.topGenres[0]!.name).toBe('Fantasy');
    expect(o.avgBooksPerMonth).toBeGreaterThan(0);
    const months = monthlySeries(input, 2026);
    expect(months[2]).toMatchObject({ month: '2026-03', books: 1, pages: 130, minutes: 60 });
    expect(months[4]!.books).toBe(1);
    expect(yearlyComparison(input)[0]).toMatchObject({ year: 2026, booksRead: 2 });
    const rec = personalRecords(input);
    expect(rec.fastestBook).toMatchObject({ title: 'One', days: 4 });
    expect(rec.mostPagesInDay).toMatchObject({ day: '2026-03-04', pages: 90 });
    expect(bestPeriods(input)!.dayparts.morning).toBe(3600);
  });
});

describe('discover', () => {
  it('suggests from favourite genres/authors, unfinished and forgotten wishlist, with reasons', async () => {
    const done = await book('Loved', { genreName: 'Fantasy', authorName: 'A' });
    await setStatus(r, done, 'completed');
    await r.content.saveReview(done, { rating: 5 });
    await book('Next fantasy', { genreName: 'Fantasy', authorName: 'Z' });
    await book('Unrelated', { genreName: 'Cooking', authorName: 'Q' });
    const stale = await book('Paused', { genreName: 'History' });
    at('2026-10-01T09:00:00');
    await updatePage(r, stale, 20);
    await r.organize.saveWish({ title: 'Old wish' });
    at('2026-12-15T09:00:00');
    const books = await r.books.list();
    const res = discover({ books, lastActivity: new Map(), wishlist: await r.organize.wishlist(), today: '2026-12-15' });
    expect(res.topGenres[0]).toBe('Fantasy');
    expect(res.forYou.map((s) => [s.title, s.reason])).toEqual([['Next fantasy', 'favorite_genre']]);
    expect(res.unfinished.map((s) => s.title)).toEqual(['Paused']);
    expect(res.forgottenWishlist.map((w) => w.item.title)).toEqual(['Old wish']);
    expect(res.randomPick).not.toBeNull();
    expect(similarBooks(done, books).map((s) => s.title)).toEqual(['Next fantasy']);
  });
});

describe('notification planning', () => {
  const settings = (overrides: Partial<Record<NotificationSetting['kind'], boolean>>): NotificationSetting[] =>
    (['daily', 'weekly_goal', 'monthly_goal', 'challenge', 'resume_book', 'yearly_goal'] as const).map((kind) => ({ kind, enabled: !!overrides[kind], hour: 19, minute: 0, weekday: 0 }));
  const now = new Date('2026-11-10T09:00:00');

  it('schedules only enabled reminders, skips reached goals and never repeats a resume nudge', () => {
    const ctx = {
      now,
      today: '2026-11-10',
      goals: [{ type: 'books_per_year', reached: false, challengeId: 'books_12' }, { type: 'pages_per_month', reached: true, challengeId: null }],
      resumeCandidate: { bookId: 'b1', title: 'Dune', lastActivityDay: '2026-11-09' },
    };
    expect(planNotifications(settings({}), ctx)).toEqual([]);
    const plan = planNotifications(settings({ daily: true, monthly_goal: true, resume_book: true, yearly_goal: true, challenge: true, weekly_goal: true }), ctx);
    expect(plan.map((p) => p.kind).sort()).toEqual(['challenge', 'daily', 'resume_book', 'yearly_goal']);
    const resume = plan.find((p) => p.kind === 'resume_book')!;
    expect(resume.trigger).toEqual({ type: 'date', at: new Date('2026-11-12T19:00:00') });
    expect(resume.params).toEqual({ title: 'Dune' });
    expect(planNotifications(settings({ resume_book: true }), { ...ctx, resumeCandidate: { ...ctx.resumeCandidate, lastActivityDay: '2026-11-01' } })).toEqual([]);
    expect(toExpoWeekday(0)).toBe(1);
    expect(toExpoWeekday(6)).toBe(7);
  });
});

describe('CSV import & export', () => {
  it('parses quotes, escaped quotes, CRLF, semicolons and BOM', () => {
    expect(parseCsv('﻿Title;Author\r\n"Hello; world";"Say ""hi"""\r\n')).toEqual([['Title', 'Author'], ['Hello; world', 'Say "hi"']]);
    expect(() => parseCsv('Title\n"unterminated')).toThrow(CsvError);
    expect(() => parseCsv('   ')).toThrow(CsvError);
    expect(() => previewImport('Author,Pages\nA,1', [], '2026-11-10')).toThrow(CsvError);
  });

  it('previews rows with validation errors, warnings and duplicates (file and library)', async () => {
    await book('Existing', { authorName: 'Someone' });
    const csv = [
      'Title,Author,ISBN13,Number of Pages,Exclusive Shelf,My Rating,Date Read,Binding',
      'Existing,Someone,,120,read,4,2026/03/02,Paperback',
      ',Nobody,,10,to-read,0,,',
      'New one,Writer,="9780441172719",abc,currently-reading,7,2031-01-01,Kindle Edition',
      'New one,Writer,,,to-read,,,',
    ].join('\n');
    const p = await previewCsvImport(r, csv);
    expect(p).toMatchObject({ valid: 3, invalid: 1, duplicates: 2 });
    expect(p.rows[0]).toMatchObject({ status: 'completed', rating: 4, finishedOn: '2026-03-02', duplicate: { reason: 'title_author' } });
    expect(p.rows[1]!.errors).toEqual(['missing_title']);
    expect(p.rows[2]).toMatchObject({ status: 'reading', rating: null, finishedOn: null });
    expect(p.rows[2]!.book).toMatchObject({ isbn: '9780441172719', pageCount: null, format: 'ebook' });
    expect(p.rows[2]!.warnings).toEqual(expect.arrayContaining(['invalid_pages', 'invalid_rating', 'invalid_date']));
    expect(p.rows[3]!.duplicate).not.toBeNull();

    const out = await commitCsvImport(r, p, { includeDuplicates: false });
    expect(out).toEqual({ imported: 1, skippedDuplicates: 2, skippedInvalid: 1, skippedLimit: 0 });
    expect((await r.books.list({ search: 'new one' }))[0]).toMatchObject({ status: 'reading' });
  });

  it('round-trips the library through CSV export and neutralises formulas', async () => {
    const id = await book('=HYPERLINK("x")', { authorName: 'Ana, "the" writer', notes: 'line1\nline2' });
    await setStatus(r, id, 'completed');
    await r.content.saveReview(id, { rating: 3 });
    const { csv } = await exportLibraryCsv(db);
    expect(csv).toContain(`"'=HYPERLINK(""x"")"`);
    const fresh = await createTestDatabase();
    const r2 = await initDatabase(fresh);
    setRepositories(r2);
    const p = previewImport(csv, [], '2026-11-10');
    expect(p.rows[0]!.book).toMatchObject({ authorName: 'Ana, "the" writer', notes: 'line1\nline2' });
    expect(p.rows[0]).toMatchObject({ status: 'completed', rating: 3 });
    fresh.close();
    setRepositories(r);
    expect(toCsv([['a', null, 3]])).toBe('﻿a,,3\r\n');
  });

  it('stops at the free limit and reports skipped rows', async () => {
    for (let i = 0; i < 99; i++) await r.books.create({ title: `B${i}` });
    const p = previewImport('Title\nX1\nX2\nX3', [], '2026-11-10');
    expect(await commitCsvImport(r, p, { includeDuplicates: true })).toMatchObject({ imported: 1, skippedLimit: 2 });
  });
});

describe('backup & restore', () => {
  async function seed() {
    const id = await book('Backup me', { authorName: 'Author', genreName: 'Essay', coverUri: 'file:///docs/covers/abc.jpg', coverThumbUri: 'file:///docs/covers/abc_t.jpg' });
    await updatePage(r, id, 50);
    await saveQuote(r, { bookId: id, text: 'A private quote.' });
    await saveNote(r, { bookId: id, kind: 'summary', body: 'Private notes.' });
    await r.reading.saveTimer({ bookId: id, startedAt: clock.iso(), pausedAt: null, pausedMs: 0, startPage: 0, startPositionSec: null });
    return id;
  }

  it('exports a versioned backup without device state and describes it', async () => {
    await seed();
    const { json, backup } = await exportBackup(db);
    expect(backup).toMatchObject({ format: 'factory-backup', formatVersion: 1, appId: 'booknest', booknest: { backupVersion: 1, includesCovers: false } });
    expect(backup.tables).not.toHaveProperty('session_timer');
    expect(backup.tables).not.toHaveProperty('subscription_cache');
    expect(describeBackup(json)).toMatchObject({ books: 1, quotes: 1, notes: 1, includesCovers: false });
  });

  it('rejects malformed, foreign and newer backups', async () => {
    expect(() => describeBackup('{oops')).toThrow(BackupError);
    expect(() => describeBackup(JSON.stringify({ format: 'factory-backup', formatVersion: 1, appId: 'habitflow', tables: {} }))).toThrow(BackupError);
    const { backup } = await exportBackup(db);
    await expect(restoreFromBackup(db, JSON.stringify({ ...backup, schemaVersion: 99 }), { mode: 'replace' })).rejects.toThrow(BackupError);
  });

  it('replaces or merges, remapping covers and existing authors', async () => {
    const id = await seed();
    const { json } = await exportBackup(db, { covers: { 'abc.jpg': 'AAAA' } });
    await deleteAllUserData(db);
    expect(await r.books.count()).toBe(0);
    expect(await r.organize.notificationSettings()).toHaveLength(6);

    await restoreFromBackup(db, json, { mode: 'replace', writeCovers: (files) => new Map(Object.keys(files).map((k) => [k, `file:///new/covers/${k}`])), fileExists: () => false });
    const restored = await r.books.get(id);
    expect(restored).toMatchObject({ title: 'Backup me', coverUri: 'file:///new/covers/abc.jpg', coverThumbUri: null });
    expect((await r.reading.current(id))!.currentPage).toBe(50);

    // Merge into a library that already has the same author and another book.
    await deleteAllUserData(db);
    await book('Local only', { authorName: 'author' });
    await restoreFromBackup(db, json, { mode: 'merge' });
    expect((await r.books.list({ sort: 'title' })).map((b) => b.title)).toEqual(['Backup me', 'Local only']);
    expect(await r.books.authors()).toEqual([expect.objectContaining({ books: 2 })]);
    // Merging twice adds nothing.
    await restoreFromBackup(db, json, { mode: 'merge' });
    expect(await r.books.count()).toBe(2);
  });
});
