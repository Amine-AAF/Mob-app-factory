import type { Migration } from '@factory/storage';

/**
 * Schema v1. Only USER data lives in SQLite: the question library and quizzes are
 * bundled, typed and validated (src/content), so they are always available offline
 * and never need re-seeding. User tables reference content by its stable id.
 *
 * User tables carry `updated_at` so a future (optional) sync engine can diff them.
 * Never edit a shipped migration: add a new one.
 */
export const migrations: Migration[] = [
  {
    version: 1,
    name: 'initial_schema',
    async up(db) {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS app_meta (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);

        CREATE TABLE IF NOT EXISTS user_profile (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          job_role TEXT,
          level TEXT NOT NULL,
          goal TEXT NOT NULL,
          days_available INTEGER,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        -- Library usage ---------------------------------------------------------
        CREATE TABLE IF NOT EXISTS favorites (
          question_id TEXT PRIMARY KEY NOT NULL,
          created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS notes (
          question_id TEXT PRIMARY KEY NOT NULL,
          body TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS study_history (
          question_id TEXT PRIMARY KEY NOT NULL,
          view_count INTEGER NOT NULL DEFAULT 0,
          first_viewed_at TEXT NOT NULL,
          last_viewed_at TEXT NOT NULL,
          studied_at TEXT,                -- set when the user marks the question as studied
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_history_last ON study_history(last_viewed_at);
        CREATE TABLE IF NOT EXISTS daily_questions (
          day TEXT PRIMARY KEY NOT NULL,  -- local YYYY-MM-DD
          question_id TEXT NOT NULL,
          viewed_at TEXT NOT NULL,
          studied INTEGER NOT NULL DEFAULT 0
        );

        -- Personal answers (question answers and Answer Builder drafts) ----------
        CREATE TABLE IF NOT EXISTS answers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          question_id TEXT,               -- null for free-form Answer Builder drafts
          title TEXT NOT NULL,
          structure TEXT NOT NULL,        -- star | motivation | present-past-future | technical | negotiation
          fields TEXT NOT NULL,           -- JSON: { [sectionKey]: text }
          job_role TEXT,
          level TEXT,
          skill TEXT,
          status TEXT NOT NULL,           -- draft | final
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_answers_question ON answers(question_id);

        -- Mock interviews -------------------------------------------------------
        CREATE TABLE IF NOT EXISTS mock_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          job_role TEXT NOT NULL,
          level TEXT NOT NULL,
          minutes INTEGER NOT NULL,
          timer_enabled INTEGER NOT NULL,
          question_count INTEGER NOT NULL,
          started_at TEXT NOT NULL,
          completed_at TEXT,
          self_score REAL,                -- average of the self-assessment grid (1-5), null if not rated
          notes TEXT,
          updated_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS mock_answers (
          session_id INTEGER NOT NULL REFERENCES mock_sessions(id) ON DELETE CASCADE,
          position INTEGER NOT NULL,
          question_id TEXT NOT NULL,
          answer TEXT NOT NULL DEFAULT '',
          notes TEXT NOT NULL DEFAULT '',
          skipped INTEGER NOT NULL DEFAULT 0,
          seconds_spent INTEGER NOT NULL DEFAULT 0,
          rating TEXT,                    -- JSON self-assessment grid, e.g. {"structure":4,"clarity":3}
          PRIMARY KEY (session_id, position)
        );

        -- Review: quizzes, flashcards, spaced repetition ----------------------------
        CREATE TABLE IF NOT EXISTS quiz_attempts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          mode TEXT NOT NULL,             -- quiz | review | flashcards
          category TEXT,
          total INTEGER NOT NULL,
          correct INTEGER NOT NULL,
          started_at TEXT NOT NULL,
          completed_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS quiz_responses (
          attempt_id INTEGER NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
          position INTEGER NOT NULL,
          quiz_id TEXT NOT NULL,
          chosen_index INTEGER NOT NULL,
          correct INTEGER NOT NULL,
          PRIMARY KEY (attempt_id, position)
        );
        CREATE INDEX IF NOT EXISTS idx_quiz_responses_quiz ON quiz_responses(quiz_id);
        CREATE TABLE IF NOT EXISTS srs_cards (
          item_type TEXT NOT NULL,        -- question | quiz
          item_id TEXT NOT NULL,
          repetitions INTEGER NOT NULL,
          interval_days INTEGER NOT NULL,
          ease REAL NOT NULL,
          due_day TEXT NOT NULL,
          lapses INTEGER NOT NULL DEFAULT 0,
          last_reviewed_at TEXT NOT NULL,
          PRIMARY KEY (item_type, item_id)
        );
        CREATE INDEX IF NOT EXISTS idx_srs_due ON srs_cards(due_day);

        -- Learning paths ----------------------------------------------------------
        CREATE TABLE IF NOT EXISTS learning_paths (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          job_role TEXT NOT NULL,
          level TEXT NOT NULL,
          goal TEXT NOT NULL,
          days INTEGER NOT NULL,
          start_day TEXT NOT NULL,
          plan TEXT NOT NULL,             -- JSON snapshot of the generated plan (stable even if content grows)
          status TEXT NOT NULL,           -- active | completed | archived
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS path_progress (
          path_id INTEGER NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
          day_index INTEGER NOT NULL,
          task_id TEXT NOT NULL,
          completed_at TEXT NOT NULL,
          PRIMARY KEY (path_id, day_index, task_id)
        );

        -- Activity & monetization ---------------------------------------------------
        CREATE TABLE IF NOT EXISTS daily_activity (
          day TEXT PRIMARY KEY NOT NULL,
          questions_studied INTEGER NOT NULL DEFAULT 0,
          quizzes_completed INTEGER NOT NULL DEFAULT 0,
          mocks_completed INTEGER NOT NULL DEFAULT 0,
          cards_reviewed INTEGER NOT NULL DEFAULT 0,
          answers_saved INTEGER NOT NULL DEFAULT 0,
          updated_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS subscription_cache (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          state TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);
    },
  },
];

export const SCHEMA_VERSION = migrations.length;

/**
 * Tables included in backups and erased by "Delete all my data".
 * Order matters for restore (parents before children).
 */
export const USER_TABLES = [
  'user_profile',
  'favorites',
  'notes',
  'study_history',
  'daily_questions',
  'answers',
  'mock_sessions',
  'mock_answers',
  'quiz_attempts',
  'quiz_responses',
  'srs_cards',
  'learning_paths',
  'path_progress',
  'daily_activity',
] as const;
export type UserTable = (typeof USER_TABLES)[number];
