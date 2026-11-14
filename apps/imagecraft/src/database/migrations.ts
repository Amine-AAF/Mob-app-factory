import type { Migration } from '@factory/storage';

/**
 * Schema history. Never edit a shipped migration: add a new one.
 *
 * Privacy: SQLite only holds METADATA (names, sizes, formats, dates, edit settings).
 * Image pixels are never stored in the database; pictures live as files in the
 * app's private storage and are deleted with their project.
 */
export const migrations: Migration[] = [
  {
    version: 1,
    name: 'initial schema',
    async up(db) {
      await db.execAsync(`
        CREATE TABLE projects (
          id TEXT PRIMARY KEY NOT NULL,
          kind TEXT NOT NULL CHECK (kind IN ('edit', 'resize', 'compress', 'convert', 'social', 'collage', 'batch')),
          title TEXT NOT NULL,
          source_uri TEXT,
          source_name TEXT,
          edit_state TEXT,
          operations TEXT NOT NULL DEFAULT '[]',
          output_uri TEXT,
          output_name TEXT,
          output_format TEXT CHECK (output_format IS NULL OR output_format IN ('jpeg', 'png', 'webp')),
          output_bytes INTEGER,
          output_width INTEGER,
          output_height INTEGER,
          input_bytes INTEGER,
          item_count INTEGER NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX idx_projects_updated ON projects (updated_at DESC);

        CREATE TABLE tool_usage (
          tool_id TEXT PRIMARY KEY NOT NULL,
          uses INTEGER NOT NULL DEFAULT 0,
          last_used_at TEXT NOT NULL
        );

        CREATE TABLE user_preferences (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          language TEXT,
          theme TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('system', 'light', 'dark')),
          default_format TEXT NOT NULL DEFAULT 'jpeg' CHECK (default_format IN ('jpeg', 'png', 'webp')),
          default_quality INTEGER NOT NULL DEFAULT 85 CHECK (default_quality BETWEEN 1 AND 100),
          keep_projects INTEGER NOT NULL DEFAULT 1 CHECK (keep_projects IN (0, 1))
        );
        INSERT INTO user_preferences (id) VALUES (1);

        CREATE TABLE subscription_cache (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          entitlement TEXT NOT NULL,
          product_id TEXT,
          expiration_date TEXT,
          last_verified_at TEXT,
          state TEXT NOT NULL
        );

        CREATE TABLE app_settings (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL
        );

        CREATE TABLE daily_usage (
          day TEXT PRIMARY KEY NOT NULL,
          rewarded_unlocks INTEGER NOT NULL DEFAULT 0,
          unlocks_used INTEGER NOT NULL DEFAULT 0
        );
      `);
    },
  },
];
