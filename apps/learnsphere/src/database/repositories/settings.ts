import { fromJson, toJson, type SqlDatabase } from '@factory/storage';

import { DEFAULT_NOTIFICATION_SETTINGS, NOTIFICATION_KINDS, type NotificationKind, type NotificationSetting, type NotificationSettings } from '@/features/notifications/plan';
import { clock } from '@/services/clock';

/** Small JSON settings stored in SQLite (backed up with the user's data). */
export function createSettingsRepository(db: SqlDatabase) {
  const now = () => clock.now().toISOString();
  return {
    async get<T>(key: string, fallback: T): Promise<T> {
      const r = await db.getFirstAsync<{ value: string }>('SELECT value FROM kv_settings WHERE key = ?', [key]);
      return r ? fromJson<T>(r.value, fallback) : fallback;
    },

    async set<T>(key: string, value: T): Promise<void> {
      await db.runAsync('INSERT INTO kv_settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at', [key, toJson(value), now()]);
    },

    async notificationSettings(): Promise<NotificationSettings> {
      const rows = await db.getAllAsync<{ kind: NotificationKind; enabled: number; hour: number; minute: number; lead_minutes: number }>('SELECT * FROM notification_settings', []);
      const out: NotificationSettings = { ...DEFAULT_NOTIFICATION_SETTINGS };
      for (const r of rows) {
        if ((NOTIFICATION_KINDS as readonly string[]).includes(r.kind)) out[r.kind] = { enabled: r.enabled === 1, hour: r.hour, minute: r.minute, leadMinutes: r.lead_minutes };
      }
      return out;
    },

    async setNotificationSetting(kind: NotificationKind, s: NotificationSetting): Promise<void> {
      await db.runAsync(
        `INSERT INTO notification_settings (kind, enabled, hour, minute, lead_minutes, updated_at) VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(kind) DO UPDATE SET enabled = excluded.enabled, hour = excluded.hour, minute = excluded.minute, lead_minutes = excluded.lead_minutes, updated_at = excluded.updated_at`,
        [kind, s.enabled ? 1 : 0, s.hour, s.minute, s.leadMinutes, now()],
      );
    },
  };
}

export type SettingsRepository = ReturnType<typeof createSettingsRepository>;
