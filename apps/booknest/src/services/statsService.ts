import type { Repositories } from '@/database';
import type { StatsInput } from '@/features/statistics/stats';

import { clock } from './clock';

/** Loads everything the statistics, calendar and dashboard need, in a few queries. */
export async function loadStatsInput(r: Repositories): Promise<StatsInput> {
  const [books, records, sessions, pages, reviews] = await Promise.all([
    r.db.getAllAsync<{ id: string; title: string; authorName: string | null; genreName: string | null; pageCount: number | null; format: string }>(
      `SELECT b.id, b.title, a.name AS authorName, g.name AS genreName, b.page_count AS pageCount, b.format
         FROM books b LEFT JOIN authors a ON a.id = b.author_id LEFT JOIN genres g ON g.id = b.genre_id`,
      [],
    ),
    r.reading.allRecords(),
    r.db.getAllAsync<{ day: string; startedAt: string; durationSec: number; bookId: string }>(
      'SELECT day, started_at AS startedAt, duration_sec AS durationSec, book_id AS bookId FROM reading_sessions',
      [],
    ),
    r.reading.progressByDay('page'),
    r.content.allReviews(),
  ]);
  const ratings = new Map<string, number>();
  reviews.forEach((rv) => rv.rating != null && ratings.set(rv.bookId, rv.rating));
  return { books, records, sessions, pages, ratings, today: clock.today() };
}
