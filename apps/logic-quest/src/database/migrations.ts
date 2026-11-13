import type { Migration } from '@factory/storage';

/**
 * Schema v1. `challenges` is re-seeded from the bundle when CONTENT_VERSION
 * changes; user tables are never dropped. User tables carry timestamps so a
 * sync engine could be added later without a schema rewrite.
 *
 * Duplicate XP is impossible at the database level: every reward is a row of
 * `xp_ledger` whose primary key is (source, source_id).
 */
export const migrations: Migration[] = [
  {
    version: 1,
    name: 'initial_schema',
    async up(db) {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS content_meta (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);

        -- Bundled content -------------------------------------------------------
        CREATE TABLE IF NOT EXISTS challenges (
          id TEXT PRIMARY KEY NOT NULL,
          category TEXT NOT NULL,
          difficulty TEXT NOT NULL,
          skill TEXT NOT NULL,
          position INTEGER NOT NULL,
          premium INTEGER NOT NULL,
          est_seconds INTEGER NOT NULL,
          xp INTEGER NOT NULL,
          payload TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_challenges_category ON challenges(category, difficulty, position);

        -- User data -------------------------------------------------------------
        CREATE TABLE IF NOT EXISTS game_sessions (
          id TEXT PRIMARY KEY NOT NULL,
          mode TEXT NOT NULL,              -- standard | timed | daily | mixed
          category TEXT NOT NULL,          -- a category or 'mixed'
          difficulty TEXT NOT NULL,        -- a difficulty or 'any'
          time_limit_s INTEGER NOT NULL,   -- 0 = untimed
          day TEXT NOT NULL,               -- local YYYY-MM-DD
          started_at TEXT NOT NULL,
          ended_at TEXT,
          end_reason TEXT,
          answered INTEGER NOT NULL DEFAULT 0,
          correct INTEGER NOT NULL DEFAULT 0,
          hints_used INTEGER NOT NULL DEFAULT 0,
          xp_earned INTEGER NOT NULL DEFAULT 0,
          perfect INTEGER NOT NULL DEFAULT 0,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_sessions_day ON game_sessions(day);

        CREATE TABLE IF NOT EXISTS answers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session_id TEXT NOT NULL,
          challenge_id TEXT NOT NULL,
          category TEXT NOT NULL,
          difficulty TEXT NOT NULL,
          day TEXT NOT NULL,
          correct INTEGER NOT NULL,
          attempts INTEGER NOT NULL,
          hint_used INTEGER NOT NULL,
          revealed INTEGER NOT NULL,
          time_ms INTEGER NOT NULL,
          xp_awarded INTEGER NOT NULL,
          answered_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_answers_day ON answers(day);
        CREATE INDEX IF NOT EXISTS idx_answers_challenge ON answers(challenge_id);

        CREATE TABLE IF NOT EXISTS user_progress (
          challenge_id TEXT PRIMARY KEY NOT NULL,
          category TEXT NOT NULL,
          difficulty TEXT NOT NULL,
          solved INTEGER NOT NULL DEFAULT 0,
          first_solved_at TEXT,
          attempts_total INTEGER NOT NULL DEFAULT 0,
          revealed INTEGER NOT NULL DEFAULT 0,
          best_time_ms INTEGER,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS xp_ledger (
          source TEXT NOT NULL,            -- 'challenge' | 'daily'
          source_id TEXT NOT NULL,
          xp INTEGER NOT NULL,
          day TEXT NOT NULL,
          created_at TEXT NOT NULL,
          PRIMARY KEY (source, source_id)
        );
        CREATE INDEX IF NOT EXISTS idx_ledger_day ON xp_ledger(day);

        CREATE TABLE IF NOT EXISTS achievements (
          id TEXT PRIMARY KEY NOT NULL,
          unlocked_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS daily_challenges (
          day TEXT PRIMARY KEY NOT NULL,
          challenge_id TEXT NOT NULL,
          template_id TEXT NOT NULL,
          difficulty TEXT NOT NULL,
          status TEXT NOT NULL,            -- 'completed' | 'failed'
          attempts INTEGER NOT NULL,
          hint_used INTEGER NOT NULL,
          xp_awarded INTEGER NOT NULL,
          completed_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS hint_wallet (
          day TEXT PRIMARY KEY NOT NULL,
          used INTEGER NOT NULL DEFAULT 0,
          ad_bonus INTEGER NOT NULL DEFAULT 0,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS user_preferences (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS subscription_cache (
          key TEXT PRIMARY KEY NOT NULL,   -- 'entitlement' | 'ads_removed'
          state TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);
    },
  },
];

export const SCHEMA_VERSION = migrations.length;

/** Tables included in backups and erased by "Delete all my data". */
export const USER_TABLES = ['game_sessions', 'answers', 'user_progress', 'xp_ledger', 'achievements', 'daily_challenges', 'hint_wallet', 'user_preferences'] as const;

export const CONTENT_TABLES = ['challenges'] as const;
