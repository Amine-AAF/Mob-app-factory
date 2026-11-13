import { addDays, computeStreak, diffDays, fromDayKey } from '@factory/app-core';

import type { ReadingRecord } from '@/types';

/**
 * Reading statistics. Every metric is computed only from data that exists:
 * when nothing is known the value is `null` (displayed as "—" with an explanation),
 * never 0 pretending to be real. Coverage counters (e.g. finished books without a
 * page count) are returned so the UI can say what a number is based on.
 */
export interface StatsBook {
  id: string;
  title: string;
  authorName: string | null;
  genreName: string | null;
  pageCount: number | null;
  format: string;
}

export interface StatsInput {
  books: StatsBook[];
  records: ReadingRecord[];
  sessions: { day: string; startedAt: string; durationSec: number; bookId: string }[];
  pages: { day: string; amount: number; bookId: string }[];
  ratings: Map<string, number>;
  today: string;
}

export interface Ranked {
  name: string;
  count: number;
  avgRating: number | null;
}

export interface MonthPoint {
  month: string; // YYYY-MM
  books: number;
  pages: number;
  minutes: number;
}

export interface YearSummary {
  year: number;
  booksRead: number;
  pagesRead: number;
  minutes: number;
  abandoned: number;
}

export interface PersonalRecords {
  longestSessionSec: number | null;
  mostPagesInDay: { day: string; pages: number } | null;
  longestStreak: number | null;
  currentStreak: number;
  fastestBook: { bookId: string; title: string; days: number } | null;
  longestBook: { bookId: string; title: string; pages: number } | null;
  bestMonth: { month: string; books: number } | null;
}

export interface OverviewStats {
  booksRead: number;
  booksReadDistinct: number;
  abandoned: number;
  inProgress: number;
  wantToRead: number;
  pagesRead: number | null;
  /** Finished books whose page count is unknown (pages metrics exclude them). */
  finishedWithoutPages: number;
  readingSeconds: number | null;
  sessionCount: number;
  avgBooksPerMonth: number | null;
  avgSessionSec: number | null;
  topGenres: Ranked[];
  topAuthors: Ranked[];
}

const inYear = (day: string | null, year: number | null) => !!day && (year == null || day.startsWith(String(year)));

export function completedAttempts(records: ReadingRecord[], year: number | null = null): ReadingRecord[] {
  return records.filter((r) => r.status === 'completed' && r.finishedOn && inYear(r.finishedOn, year));
}

function rank(entries: { name: string | null; rating: number | null }[], limit: number): Ranked[] {
  const map = new Map<string, { count: number; ratings: number[] }>();
  for (const e of entries) {
    if (!e.name) continue;
    const m = map.get(e.name) ?? { count: 0, ratings: [] };
    m.count++;
    if (e.rating != null) m.ratings.push(e.rating);
    map.set(e.name, m);
  }
  return [...map.entries()]
    .map(([name, m]) => ({ name, count: m.count, avgRating: m.ratings.length ? m.ratings.reduce((a, b) => a + b, 0) / m.ratings.length : null }))
    .sort((a, b) => b.count - a.count || (b.avgRating ?? 0) - (a.avgRating ?? 0) || a.name.localeCompare(b.name))
    .slice(0, limit);
}

/** Overview for one year (or all time when `year` is null). */
export function overview(input: StatsInput, year: number | null): OverviewStats {
  const byId = new Map(input.books.map((b) => [b.id, b]));
  const done = completedAttempts(input.records, year);
  const current = input.records.filter((r) => r.isCurrent);
  const abandoned = input.records.filter((r) => r.status === 'abandoned' && (year == null || inYear(r.updatedAt.slice(0, 10), year))).length;
  const sessions = input.sessions.filter((s) => inYear(s.day, year));
  const pages = input.pages.filter((p) => inYear(p.day, year));
  const pagesRead = pages.reduce((a, p) => a + p.amount, 0);
  const seconds = sessions.reduce((a, s) => a + s.durationSec, 0);

  // Average per month over the months that actually elapsed since the first finished book.
  let avgBooksPerMonth: number | null = null;
  if (done.length) {
    const first = done.map((r) => r.finishedOn!).sort()[0]!;
    const start = year != null && first < `${year}-01-01` ? `${year}-01-01` : first;
    const endDay = year != null && input.today > `${year}-12-31` ? `${year}-12-31` : input.today;
    const months = Math.max(1, Math.ceil((diffDays(start, endDay) + 1) / 30.44));
    avgBooksPerMonth = Math.round((done.length / months) * 10) / 10;
  }

  const finishedBooks = done.map((r) => byId.get(r.bookId)).filter((b): b is StatsBook => !!b);
  return {
    booksRead: done.length,
    booksReadDistinct: new Set(done.map((r) => r.bookId)).size,
    abandoned,
    inProgress: current.filter((r) => r.status === 'reading').length,
    wantToRead: current.filter((r) => r.status === 'want_to_read').length,
    pagesRead: pages.length ? pagesRead : null,
    finishedWithoutPages: finishedBooks.filter((b) => !b.pageCount && b.format !== 'audiobook').length,
    readingSeconds: sessions.length ? seconds : null,
    sessionCount: sessions.length,
    avgBooksPerMonth,
    avgSessionSec: sessions.length ? Math.round(seconds / sessions.length) : null,
    topGenres: rank(finishedBooks.map((b) => ({ name: b.genreName, rating: input.ratings.get(b.id) ?? null })), 5),
    topAuthors: rank(finishedBooks.map((b) => ({ name: b.authorName, rating: input.ratings.get(b.id) ?? null })), 5),
  };
}

export function monthlySeries(input: StatsInput, year: number): MonthPoint[] {
  const points: MonthPoint[] = Array.from({ length: 12 }, (_, i) => ({ month: `${year}-${String(i + 1).padStart(2, '0')}`, books: 0, pages: 0, minutes: 0 }));
  const idx = (day: string) => (day.startsWith(String(year)) ? Number(day.slice(5, 7)) - 1 : -1);
  for (const r of completedAttempts(input.records, year)) points[idx(r.finishedOn!)]!.books++;
  for (const p of input.pages) {
    const i = idx(p.day);
    if (i >= 0) points[i]!.pages += p.amount;
  }
  const secs = new Array<number>(12).fill(0);
  for (const s of input.sessions) {
    const i = idx(s.day);
    if (i >= 0) secs[i]! += s.durationSec;
  }
  secs.forEach((v, i) => (points[i]!.minutes = Math.round(v / 60)));
  return points;
}

export function yearlyComparison(input: StatsInput): YearSummary[] {
  const years = new Set<number>();
  input.records.forEach((r) => r.finishedOn && years.add(Number(r.finishedOn.slice(0, 4))));
  input.sessions.forEach((s) => years.add(Number(s.day.slice(0, 4))));
  input.pages.forEach((p) => years.add(Number(p.day.slice(0, 4))));
  return [...years]
    .sort((a, b) => b - a)
    .map((year) => {
      const o = overview(input, year);
      return { year, booksRead: o.booksRead, pagesRead: o.pagesRead ?? 0, minutes: Math.round((o.readingSeconds ?? 0) / 60), abandoned: o.abandoned };
    });
}

/** Share of reading time per weekday (0 = Sunday) and per part of the day, from timed sessions only. */
export function bestPeriods(input: StatsInput): { weekdays: number[]; dayparts: Record<'morning' | 'afternoon' | 'evening' | 'night', number>; total: number } | null {
  if (!input.sessions.length) return null;
  const weekdays = new Array<number>(7).fill(0);
  const dayparts = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  let total = 0;
  for (const s of input.sessions) {
    weekdays[fromDayKey(s.day).getDay()]! += s.durationSec;
    const h = new Date(s.startedAt).getHours();
    const part = h >= 5 && h < 12 ? 'morning' : h >= 12 && h < 18 ? 'afternoon' : h >= 18 && h < 23 ? 'evening' : 'night';
    dayparts[part] += s.durationSec;
    total += s.durationSec;
  }
  return { weekdays, dayparts, total };
}

/** Minutes per week for the last `weeks` weeks (oldest first) — habit evolution. */
export function weeklyMinutes(input: StatsInput, weeks: number): { weekStart: string; minutes: number }[] {
  const end = input.today;
  const out: { weekStart: string; minutes: number }[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const to = addDays(end, -7 * i);
    const from = addDays(to, -6);
    const sec = input.sessions.filter((s) => s.day >= from && s.day <= to).reduce((a, s) => a + s.durationSec, 0);
    out.push({ weekStart: from, minutes: Math.round(sec / 60) });
  }
  return out;
}

export function activeDays(input: Pick<StatsInput, 'sessions' | 'pages'>): Set<string> {
  const days = new Set<string>();
  input.sessions.forEach((s) => days.add(s.day));
  input.pages.forEach((p) => p.amount > 0 && days.add(p.day));
  return days;
}

export function personalRecords(input: StatsInput): PersonalRecords {
  const byId = new Map(input.books.map((b) => [b.id, b]));
  const longestSessionSec = input.sessions.length ? Math.max(...input.sessions.map((s) => s.durationSec)) : null;

  const perDay = new Map<string, number>();
  input.pages.forEach((p) => perDay.set(p.day, (perDay.get(p.day) ?? 0) + p.amount));
  let mostPagesInDay: PersonalRecords['mostPagesInDay'] = null;
  for (const [day, pages] of perDay) if (pages > 0 && (!mostPagesInDay || pages > mostPagesInDay.pages)) mostPagesInDay = { day, pages };

  const days = activeDays(input);
  const streak = computeStreak(days, input.today);

  let fastestBook: PersonalRecords['fastestBook'] = null;
  let longestBook: PersonalRecords['longestBook'] = null;
  for (const r of completedAttempts(input.records)) {
    const b = byId.get(r.bookId);
    if (!b) continue;
    if (r.startedOn && r.finishedOn) {
      const d = diffDays(r.startedOn, r.finishedOn) + 1;
      if (d > 0 && (!fastestBook || d < fastestBook.days)) fastestBook = { bookId: b.id, title: b.title, days: d };
    }
    if (b.pageCount && (!longestBook || b.pageCount > longestBook.pages)) longestBook = { bookId: b.id, title: b.title, pages: b.pageCount };
  }

  const perMonth = new Map<string, number>();
  completedAttempts(input.records).forEach((r) => perMonth.set(r.finishedOn!.slice(0, 7), (perMonth.get(r.finishedOn!.slice(0, 7)) ?? 0) + 1));
  let bestMonth: PersonalRecords['bestMonth'] = null;
  for (const [month, books] of perMonth) if (!bestMonth || books > bestMonth.books) bestMonth = { month, books };

  return {
    longestSessionSec,
    mostPagesInDay,
    longestStreak: days.size ? streak.longest : null,
    currentStreak: streak.current,
    fastestBook,
    longestBook,
    bestMonth,
  };
}

/** Text summary for "share my stats" (contains no notes, quotes or titles unless asked). */
export function shareSummary(o: OverviewStats, year: number, fmt: { minutes: (sec: number) => string }, t: (k: string, p?: Record<string, unknown>) => string): string {
  const lines = [t('stats.share.title', { year }), t('stats.share.books', { count: o.booksRead })];
  if (o.pagesRead != null) lines.push(t('stats.share.pages', { count: o.pagesRead }));
  if (o.readingSeconds != null) lines.push(t('stats.share.time', { time: fmt.minutes(o.readingSeconds) }));
  if (o.topGenres[0]) lines.push(t('stats.share.genre', { genre: o.topGenres[0].name }));
  lines.push(t('stats.share.footer'));
  return lines.join('\n');
}
