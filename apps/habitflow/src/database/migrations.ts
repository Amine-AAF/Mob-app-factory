import type { Migration } from '@factory/storage';

/**
 * Schema history. NEVER edit a shipped migration: add a new one with the next
 * version. `migrate` (from @factory/storage) applies them through `user_version`,
 * each in its own transaction, so an app update keeps existing data.
 *
 * Every user table carries `updated_at` so a sync engine could be added later.
 */
export const migrations: Migration[] = [
  {
    version: 1,
    name: 'initial schema',
    async up(db) {
      await db.execAsync(`
        CREATE TABLE habits (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          icon TEXT NOT NULL,
          color TEXT NOT NULL,
          category TEXT NOT NULL,
          start_date TEXT NOT NULL,
          duration_min INTEGER,
          notes TEXT,
          template_id TEXT,
          sort_order INTEGER NOT NULL DEFAULT 0,
          archived_on TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        -- Versioned rules: a change creates a row effective from that day, so past days keep their rules.
        CREATE TABLE habit_schedules (
          habit_id TEXT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
          effective_from TEXT NOT NULL,
          frequency TEXT NOT NULL,
          tracking TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          PRIMARY KEY (habit_id, effective_from)
        );

        -- One row per habit and local day: duplicates are impossible.
        CREATE TABLE habit_logs (
          habit_id TEXT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
          day TEXT NOT NULL,
          value REAL NOT NULL DEFAULT 0,
          target REAL NOT NULL DEFAULT 1,
          status TEXT NOT NULL CHECK (status IN ('done', 'partial', 'skipped')),
          note TEXT,
          completed_at TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          PRIMARY KEY (habit_id, day)
        );
        CREATE INDEX idx_habit_logs_day ON habit_logs (day);

        -- XP can only be granted once per habit and day (primary key).
        CREATE TABLE xp_ledger (
          habit_id TEXT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
          day TEXT NOT NULL,
          xp INTEGER NOT NULL,
          created_at TEXT NOT NULL,
          PRIMARY KEY (habit_id, day)
        );

        CREATE TABLE tasks (
          id TEXT PRIMARY KEY NOT NULL,
          title TEXT NOT NULL,
          notes TEXT,
          priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
          due_day TEXT NOT NULL,
          time TEXT,
          done INTEGER NOT NULL DEFAULT 0,
          done_at TEXT,
          habit_id TEXT REFERENCES habits(id) ON DELETE SET NULL,
          sort_order INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX idx_tasks_due ON tasks (due_day);

        CREATE TABLE reminders (
          id TEXT PRIMARY KEY NOT NULL,
          habit_id TEXT REFERENCES habits(id) ON DELETE CASCADE,
          hour INTEGER NOT NULL,
          minute INTEGER NOT NULL,
          days TEXT NOT NULL DEFAULT '[]',
          enabled INTEGER NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE achievements (
          id TEXT PRIMARY KEY NOT NULL,
          unlocked_at TEXT NOT NULL
        );

        CREATE TABLE user_settings (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE subscription_cache (
          key TEXT PRIMARY KEY NOT NULL,
          state TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);
    },
  },
];

export const SCHEMA_VERSION = migrations.length;

/** User-owned tables, parents first (restore order). The subscription cache is never exported. */
export const USER_TABLES = ['habits', 'habit_schedules', 'habit_logs', 'xp_ledger', 'tasks', 'reminders', 'achievements', 'user_settings'] as const;
