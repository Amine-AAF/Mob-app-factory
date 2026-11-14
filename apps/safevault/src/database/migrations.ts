import type { Migration } from '@factory/storage';

/**
 * SQLite schema. Clear-text columns are limited to what the app needs before the vault is
 * unlocked or to keep rows consistent (ids, types, timestamps, versions, counters).
 * Every user-provided value lives in a `*_ct` column: a base64 XChaCha20-Poly1305 envelope.
 *
 * Never edit a shipped migration: add a new one. `crypto_version` on each row allows
 * re-encrypting old rows lazily if the envelope format ever changes.
 */
export const migrations: Migration[] = [
  {
    version: 1,
    name: 'initial_vault_schema',
    async up(db) {
      await db.execAsync(`
        CREATE TABLE vault_meta (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          vault_id TEXT NOT NULL,
          format_version INTEGER NOT NULL,
          kdf TEXT NOT NULL,
          wrapped_key TEXT NOT NULL,
          key_check TEXT NOT NULL,
          key_version INTEGER NOT NULL,
          created_at INTEGER NOT NULL,
          password_changed_at INTEGER NOT NULL,
          key_rotated_at INTEGER NOT NULL,
          failed_attempts INTEGER NOT NULL DEFAULT 0,
          lockout_until INTEGER NOT NULL DEFAULT 0,
          biometric_enabled INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE entries (
          id TEXT PRIMARY KEY NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('login', 'note', 'card', 'identity')),
          meta_ct TEXT NOT NULL,
          secret_ct TEXT NOT NULL,
          key_version INTEGER NOT NULL,
          crypto_version INTEGER NOT NULL,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        );
        CREATE INDEX entries_type ON entries(type);

        CREATE TABLE categories (
          id TEXT PRIMARY KEY NOT NULL,
          builtin TEXT,
          data_ct TEXT,
          key_version INTEGER NOT NULL,
          sort_order INTEGER NOT NULL,
          created_at INTEGER NOT NULL
        );

        CREATE TABLE settings (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL
        );

        CREATE TABLE backup_log (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          kind TEXT NOT NULL CHECK (kind IN ('export', 'import')),
          created_at INTEGER NOT NULL,
          item_count INTEGER NOT NULL,
          format_version INTEGER NOT NULL
        );

        CREATE TABLE subscription_cache (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          state TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);
    },
  },
];
