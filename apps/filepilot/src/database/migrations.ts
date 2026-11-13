import type { Migration } from '@factory/storage';

/**
 * Schema history. Never edit a shipped migration: add a new one.
 *
 * Privacy: only metadata is stored (names, sizes, dates, status). File contents are
 * never written to SQLite; outputs live as files in the app's private storage.
 */
export const migrations: Migration[] = [
  {
    version: 1,
    name: 'initial schema',
    async up(db) {
      await db.execAsync(`
        CREATE TABLE file_operations (
          id TEXT PRIMARY KEY NOT NULL,
          operation_type TEXT NOT NULL,
          original_file_name TEXT NOT NULL,
          output_file_name TEXT,
          original_size INTEGER NOT NULL DEFAULT 0,
          output_size INTEGER,
          input_count INTEGER NOT NULL DEFAULT 1,
          output_count INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL,
          completed_at TEXT,
          status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed', 'cancelled', 'interrupted')),
          error_code TEXT
        );
        CREATE INDEX idx_file_operations_created ON file_operations (created_at DESC);

        CREATE TABLE operation_outputs (
          operation_id TEXT NOT NULL REFERENCES file_operations (id) ON DELETE CASCADE,
          position INTEGER NOT NULL,
          file_name TEXT NOT NULL,
          uri TEXT NOT NULL,
          size INTEGER NOT NULL,
          mime_type TEXT NOT NULL,
          PRIMARY KEY (operation_id, position)
        );

        CREATE TABLE user_preferences (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          language TEXT,
          theme TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('system', 'light', 'dark')),
          default_image_quality INTEGER NOT NULL DEFAULT 80 CHECK (default_image_quality BETWEEN 1 AND 100),
          default_output_format TEXT NOT NULL DEFAULT 'jpeg' CHECK (default_output_format IN ('jpeg', 'png', 'webp'))
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
          operations INTEGER NOT NULL DEFAULT 0,
          bonus INTEGER NOT NULL DEFAULT 0,
          rewarded_count INTEGER NOT NULL DEFAULT 0
        );
      `);
    },
  },
];
