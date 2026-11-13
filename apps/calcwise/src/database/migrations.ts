import type { Migration } from '@factory/storage';

/**
 * Schema v1. All tables are user data stored only on the device.
 * Rows carry timestamps so a sync engine could be added later without a rewrite.
 */
export const migrations: Migration[] = [
  {
    version: 1,
    name: 'initial_schema',
    async up(db) {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          tool TEXT NOT NULL,            -- ToolId
          expression TEXT NOT NULL,      -- canonical expression, or '' for form tools
          result TEXT NOT NULL,          -- canonical decimal string of the main result
          payload TEXT,                  -- JSON HistoryPayload for form tools (inputs + outputs)
          search_text TEXT NOT NULL,     -- lowercase text used by history search
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_history_created ON history(created_at DESC, id DESC);

        CREATE TABLE IF NOT EXISTS favorites (
          tool_id TEXT PRIMARY KEY NOT NULL,
          position INTEGER NOT NULL,
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS subscription_cache (
          key TEXT PRIMARY KEY NOT NULL,
          state TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);
    },
  },
];

export const SCHEMA_VERSION = migrations.length;

/** Tables erased by "Delete all my data". */
export const USER_TABLES = ['history', 'favorites'] as const;
