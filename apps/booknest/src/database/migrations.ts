import type { Migration } from '@factory/storage';

/**
 * BookNest schema. Rules:
 * - Never edit a shipped migration: append a new one (versions are contiguous).
 * - Ids are TEXT (generated on device) so backups and imports never collide on autoincrement ids.
 * - Calendar days are 'YYYY-MM-DD' (local), instants are ISO-8601 UTC strings.
 * - Money is stored in minor units (cents) with an ISO-4217 currency code.
 * - Cover images are files in the app's document directory; only their URI is stored here.
 */
const V1 = `
CREATE TABLE authors (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  name_key TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE UNIQUE INDEX idx_authors_key ON authors(name_key);

CREATE TABLE genres (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  name_key TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE UNIQUE INDEX idx_genres_key ON genres(name_key);

CREATE TABLE books (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL CHECK (length(trim(title)) > 0),
  subtitle TEXT,
  original_title TEXT,
  author_id TEXT REFERENCES authors(id) ON DELETE SET NULL,
  genre_id TEXT REFERENCES genres(id) ON DELETE SET NULL,
  cover_uri TEXT,
  cover_thumb_uri TEXT,
  isbn TEXT,
  publisher TEXT,
  published_year INTEGER CHECK (published_year IS NULL OR published_year BETWEEN 0 AND 3000),
  page_count INTEGER CHECK (page_count IS NULL OR page_count > 0),
  language TEXT,
  format TEXT NOT NULL DEFAULT 'paperback' CHECK (format IN ('paperback','hardcover','ebook','audiobook')),
  acquired_on TEXT,
  purchase_price_cents INTEGER CHECK (purchase_price_cents IS NULL OR purchase_price_cents >= 0),
  currency TEXT,
  description TEXT,
  notes TEXT,
  is_favorite INTEGER NOT NULL DEFAULT 0,
  is_archived INTEGER NOT NULL DEFAULT 0,
  title_key TEXT NOT NULL,
  search_text TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_books_title_key ON books(title_key);
CREATE INDEX idx_books_author ON books(author_id);
CREATE INDEX idx_books_genre ON books(genre_id);
CREATE INDEX idx_books_isbn ON books(isbn) WHERE isbn IS NOT NULL;
CREATE INDEX idx_books_archived_updated ON books(is_archived, updated_at);

-- One row per reading attempt. The current attempt (is_current = 1) carries the book status;
-- previous attempts are kept as re-reading history.
CREATE TABLE reading_records (
  id TEXT PRIMARY KEY NOT NULL,
  book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  attempt INTEGER NOT NULL DEFAULT 1 CHECK (attempt >= 1),
  status TEXT NOT NULL CHECK (status IN ('want_to_read','reading','completed','on_hold','abandoned')),
  started_on TEXT,
  finished_on TEXT,
  current_page INTEGER NOT NULL DEFAULT 0 CHECK (current_page >= 0),
  is_current INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE UNIQUE INDEX idx_records_current ON reading_records(book_id) WHERE is_current = 1;
CREATE INDEX idx_records_book ON reading_records(book_id, attempt);
CREATE INDEX idx_records_status ON reading_records(status, is_current);
CREATE INDEX idx_records_finished ON reading_records(finished_on);

CREATE TABLE reading_sessions (
  id TEXT PRIMARY KEY NOT NULL,
  book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  record_id TEXT REFERENCES reading_records(id) ON DELETE SET NULL,
  day TEXT NOT NULL,
  started_at TEXT NOT NULL,
  ended_at TEXT NOT NULL,
  duration_sec INTEGER NOT NULL CHECK (duration_sec >= 0),
  start_page INTEGER CHECK (start_page IS NULL OR start_page >= 0),
  end_page INTEGER CHECK (end_page IS NULL OR end_page >= 0),
  start_position_sec INTEGER,
  end_position_sec INTEGER,
  notes TEXT,
  source TEXT NOT NULL CHECK (source IN ('timer','manual')),
  created_at TEXT NOT NULL
);
CREATE INDEX idx_sessions_day ON reading_sessions(day);
CREATE INDEX idx_sessions_book ON reading_sessions(book_id, started_at);

-- The running timer survives app kills: elapsed time is derived from timestamps, never ticked.
CREATE TABLE session_timer (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  started_at TEXT NOT NULL,
  paused_at TEXT,
  paused_ms INTEGER NOT NULL DEFAULT 0,
  start_page INTEGER,
  start_position_sec INTEGER
);

CREATE TABLE reading_goals (
  id TEXT PRIMARY KEY NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('books_per_year','pages_per_month','minutes_per_day','days_per_week','custom')),
  title TEXT,
  target INTEGER NOT NULL CHECK (target > 0),
  unit TEXT,
  manual_progress INTEGER NOT NULL DEFAULT 0,
  challenge_id TEXT,
  period_start TEXT NOT NULL,
  period_end TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_goals_active ON reading_goals(is_active, type);

CREATE TABLE quotes (
  id TEXT PRIMARY KEY NOT NULL,
  book_id TEXT REFERENCES books(id) ON DELETE CASCADE,
  text TEXT NOT NULL CHECK (length(trim(text)) > 0),
  author_name TEXT,
  page INTEGER CHECK (page IS NULL OR page >= 0),
  tags TEXT NOT NULL DEFAULT '[]',
  comment TEXT,
  is_favorite INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_quotes_book ON quotes(book_id, created_at);
CREATE INDEX idx_quotes_created ON quotes(created_at);

CREATE TABLE reading_notes (
  id TEXT PRIMARY KEY NOT NULL,
  book_id TEXT REFERENCES books(id) ON DELETE SET NULL,
  kind TEXT NOT NULL DEFAULT 'note' CHECK (kind IN ('impression','summary','reflection','character','idea','opinion','note')),
  title TEXT,
  body TEXT NOT NULL CHECK (length(trim(body)) > 0),
  tags TEXT NOT NULL DEFAULT '[]',
  is_favorite INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_notes_created ON reading_notes(created_at);
CREATE INDEX idx_notes_book ON reading_notes(book_id);

-- Private reviews (one per book). Never presented as public reviews.
CREATE TABLE reviews (
  book_id TEXT PRIMARY KEY NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating IS NULL OR rating BETWEEN 1 AND 5),
  body TEXT,
  pros TEXT,
  cons TEXT,
  read_on TEXT,
  recommend TEXT CHECK (recommend IS NULL OR recommend IN ('yes','maybe','no')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_reviews_rating ON reviews(rating);

CREATE TABLE collections (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  preset_key TEXT,
  icon TEXT NOT NULL DEFAULT 'bookmark',
  color TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_pinned INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE collection_books (
  collection_id TEXT NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  added_at TEXT NOT NULL,
  PRIMARY KEY (collection_id, book_id)
);
CREATE INDEX idx_collection_books_book ON collection_books(book_id);

CREATE TABLE wishlist_items (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL CHECK (length(trim(title)) > 0),
  author TEXT,
  cover_uri TEXT,
  estimated_price_cents INTEGER CHECK (estimated_price_cents IS NULL OR estimated_price_cents >= 0),
  currency TEXT,
  store TEXT,
  url TEXT,
  priority INTEGER NOT NULL DEFAULT 2 CHECK (priority BETWEEN 1 AND 3),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'want_to_buy' CHECK (status IN ('want_to_buy','want_to_read','purchased','added_to_library')),
  book_id TEXT REFERENCES books(id) ON DELETE SET NULL,
  acquired_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_wishlist_status ON wishlist_items(status, priority);

CREATE TABLE audiobook_progress (
  book_id TEXT PRIMARY KEY NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  total_seconds INTEGER CHECK (total_seconds IS NULL OR total_seconds > 0),
  position_seconds INTEGER NOT NULL DEFAULT 0 CHECK (position_seconds >= 0),
  playback_speed REAL CHECK (playback_speed IS NULL OR (playback_speed >= 0.5 AND playback_speed <= 3.5)),
  started_on TEXT,
  finished_on TEXT,
  updated_at TEXT NOT NULL
);

-- Every progress change (page or audio position). "Pages read" and "listened" stats come from here,
-- so a book jumping from page 0 to 300 counts 300 pages once, on the day it was entered.
CREATE TABLE progress_updates (
  id TEXT PRIMARY KEY NOT NULL,
  book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  record_id TEXT REFERENCES reading_records(id) ON DELETE SET NULL,
  day TEXT NOT NULL,
  unit TEXT NOT NULL CHECK (unit IN ('page','second')),
  from_value INTEGER NOT NULL CHECK (from_value >= 0),
  to_value INTEGER NOT NULL CHECK (to_value >= 0),
  created_at TEXT NOT NULL
);
CREATE INDEX idx_progress_day ON progress_updates(day, unit);
CREATE INDEX idx_progress_book ON progress_updates(book_id, created_at);

CREATE TABLE notification_settings (
  kind TEXT PRIMARY KEY NOT NULL CHECK (kind IN ('daily','weekly_goal','monthly_goal','challenge','resume_book','yearly_goal')),
  enabled INTEGER NOT NULL DEFAULT 0,
  hour INTEGER NOT NULL DEFAULT 20 CHECK (hour BETWEEN 0 AND 23),
  minute INTEGER NOT NULL DEFAULT 0 CHECK (minute BETWEEN 0 AND 59),
  weekday INTEGER CHECK (weekday IS NULL OR weekday BETWEEN 0 AND 6),
  updated_at TEXT NOT NULL
);

CREATE TABLE subscription_cache (
  key TEXT PRIMARY KEY NOT NULL,
  state TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Reading calendar: derived per-day activity (never stored twice, so it can't drift).
CREATE VIEW reading_calendar AS
  SELECT day, SUM(duration_sec) AS seconds, 0 AS pages, COUNT(*) AS sessions, 0 AS finished
    FROM reading_sessions GROUP BY day
  UNION ALL
  SELECT day, 0, SUM(MAX(0, to_value - from_value)), 0, 0
    FROM progress_updates WHERE unit = 'page' GROUP BY day
  UNION ALL
  SELECT finished_on AS day, 0, 0, 0, COUNT(*) AS finished
    FROM reading_records WHERE status = 'completed' AND finished_on IS NOT NULL GROUP BY finished_on;
`;

const DEFAULT_NOTIFICATIONS = `
INSERT INTO notification_settings (kind, enabled, hour, minute, weekday, updated_at) VALUES
  ('daily', 0, 20, 30, NULL, '1970-01-01T00:00:00.000Z'),
  ('weekly_goal', 0, 10, 0, 0, '1970-01-01T00:00:00.000Z'),
  ('monthly_goal', 0, 10, 0, NULL, '1970-01-01T00:00:00.000Z'),
  ('challenge', 0, 10, 0, 6, '1970-01-01T00:00:00.000Z'),
  ('resume_book', 0, 19, 0, NULL, '1970-01-01T00:00:00.000Z'),
  ('yearly_goal', 0, 10, 0, NULL, '1970-01-01T00:00:00.000Z');
`;

export const migrations: Migration[] = [
  {
    version: 1,
    name: 'initial_schema',
    async up(db) {
      await db.execAsync(V1);
      await db.execAsync(DEFAULT_NOTIFICATIONS);
    },
  },
];

export const SCHEMA_VERSION = migrations.length;

/**
 * User-owned tables, in parent → child order (restore inserts in this order).
 * The subscription cache and the running timer are device state and are not exported.
 */
export const USER_TABLES = [
  'authors',
  'genres',
  'books',
  'reading_records',
  'reading_sessions',
  'reading_goals',
  'quotes',
  'reading_notes',
  'reviews',
  'collections',
  'collection_books',
  'wishlist_items',
  'audiobook_progress',
  'progress_updates',
  'notification_settings',
] as const;
export type UserTable = (typeof USER_TABLES)[number];
