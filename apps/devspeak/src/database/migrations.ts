import type { Migration } from '@factory/storage';

/**
 * Schema v1. Content tables are re-seeded from the bundle; user tables are
 * never dropped. Future cloud sync: user tables carry `updated_at` so a sync
 * engine can diff them later.
 */
export const migrations: Migration[] = [
  {
    version: 1,
    name: 'initial_schema',
    async up(db) {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS content_meta (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);

        -- Bundled content ------------------------------------------------------
        CREATE TABLE IF NOT EXISTS learning_modules (
          id TEXT PRIMARY KEY NOT NULL,
          position INTEGER NOT NULL,
          icon TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS lessons (
          id TEXT PRIMARY KEY NOT NULL,
          module_id TEXT NOT NULL REFERENCES learning_modules(id),
          topic TEXT NOT NULL,
          position INTEGER NOT NULL,
          title TEXT NOT NULL,
          title_translation TEXT NOT NULL,
          level TEXT NOT NULL,
          premium INTEGER NOT NULL,
          minutes INTEGER NOT NULL,
          roles TEXT NOT NULL,
          interview_path TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module_id, position);
        CREATE TABLE IF NOT EXISTS lesson_sections (
          lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
          kind TEXT NOT NULL,
          position INTEGER NOT NULL,
          payload TEXT NOT NULL,
          PRIMARY KEY (lesson_id, kind)
        );
        CREATE TABLE IF NOT EXISTS vocabulary (
          id TEXT PRIMARY KEY NOT NULL,
          term TEXT NOT NULL,
          term_lower TEXT NOT NULL,
          definition TEXT NOT NULL,
          translation TEXT NOT NULL,
          example TEXT NOT NULL,
          category TEXT NOT NULL,
          difficulty TEXT NOT NULL,
          pronounceable INTEGER NOT NULL,
          premium INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_vocab_category ON vocabulary(category);
        CREATE TABLE IF NOT EXISTS quiz_questions (
          id TEXT PRIMARY KEY NOT NULL,
          owner_type TEXT NOT NULL,      -- 'lesson' | 'challenge'
          owner_id TEXT NOT NULL,
          position INTEGER NOT NULL,
          type TEXT NOT NULL,
          prompt TEXT NOT NULL,
          explanation TEXT NOT NULL,
          correct_position INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_quiz_owner ON quiz_questions(owner_type, owner_id, position);
        CREATE TABLE IF NOT EXISTS quiz_answers (
          question_id TEXT NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
          position INTEGER NOT NULL,
          text TEXT NOT NULL,
          PRIMARY KEY (question_id, position)
        );
        CREATE TABLE IF NOT EXISTS daily_challenges (
          id TEXT PRIMARY KEY NOT NULL,
          position INTEGER NOT NULL,
          payload TEXT NOT NULL
        );

        -- User data -------------------------------------------------------------
        CREATE TABLE IF NOT EXISTS user_profile (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          english_level TEXT NOT NULL,
          role TEXT NOT NULL,
          objectives TEXT NOT NULL,
          daily_minutes INTEGER NOT NULL,
          display_name TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS user_preferences (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS learning_progress (
          item_type TEXT NOT NULL,       -- 'lesson' | 'challenge' | 'speaking'
          item_id TEXT NOT NULL,
          status TEXT NOT NULL,          -- 'started' | 'completed'
          best_score INTEGER,
          last_score INTEGER,
          attempts INTEGER NOT NULL DEFAULT 0,
          started_at TEXT NOT NULL,
          completed_at TEXT,
          updated_at TEXT NOT NULL,
          PRIMARY KEY (item_type, item_id)
        );
        CREATE TABLE IF NOT EXISTS daily_activity (
          day TEXT PRIMARY KEY NOT NULL, -- local YYYY-MM-DD
          xp INTEGER NOT NULL DEFAULT 0,
          lessons_completed INTEGER NOT NULL DEFAULT 0,
          quizzes_completed INTEGER NOT NULL DEFAULT 0,
          cards_reviewed INTEGER NOT NULL DEFAULT 0,
          speaking_done INTEGER NOT NULL DEFAULT 0,
          updated_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS daily_challenge_completions (
          day TEXT PRIMARY KEY NOT NULL,
          challenge_id TEXT NOT NULL,
          completed_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS vocabulary_favorites (
          vocab_id TEXT PRIMARY KEY NOT NULL,
          created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS srs_cards (
          vocab_id TEXT PRIMARY KEY NOT NULL,
          repetitions INTEGER NOT NULL,
          interval_days INTEGER NOT NULL,
          ease REAL NOT NULL,
          due_day TEXT NOT NULL,
          last_reviewed_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_srs_due ON srs_cards(due_day);
        CREATE TABLE IF NOT EXISTS user_achievements (
          id TEXT PRIMARY KEY NOT NULL,
          unlocked_at TEXT NOT NULL
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

/** Tables included in backups and erased by "Delete all my data". */
export const USER_TABLES = [
  'user_profile',
  'user_preferences',
  'learning_progress',
  'daily_activity',
  'daily_challenge_completions',
  'vocabulary_favorites',
  'srs_cards',
  'user_achievements',
] as const;

export const CONTENT_TABLES = ['quiz_answers', 'quiz_questions', 'lesson_sections', 'lessons', 'learning_modules', 'vocabulary', 'daily_challenges'] as const;
