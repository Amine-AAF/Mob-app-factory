import { fromJson, toJson, type SqlDatabase } from '@factory/storage';

/**
 * Durable user settings stored in SQLite (`user_settings`), included in local backups.
 * Boot-critical UI preferences (language, theme, onboarding flag, default currency)
 * live in the AsyncStorage-backed preferences store, readable before the database opens.
 */
export interface UserSettings {
  /** Saved custom packing templates count, etc. are derived; this holds simple flags. */
  lastBackupAt: string | null;
}

const DEFAULTS: UserSettings = { lastBackupAt: null };

export function createSettingsRepository(db: SqlDatabase) {
  return {
    async get(): Promise<UserSettings> {
      const rows = await db.getAllAsync<{ key: string; value: string }>('SELECT key, value FROM user_settings', []);
      const out: Record<string, unknown> = { ...DEFAULTS };
      for (const r of rows) if (r.key in DEFAULTS) out[r.key] = fromJson(r.value, out[r.key]);
      return out as unknown as UserSettings;
    },
    async set(patch: Partial<UserSettings>): Promise<void> {
      await db.withTransactionAsync(async () => {
        for (const [key, value] of Object.entries(patch)) {
          if (value === undefined) continue;
          await db.runAsync('INSERT INTO user_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', [key, toJson(value)]);
        }
      });
    },
  };
}
