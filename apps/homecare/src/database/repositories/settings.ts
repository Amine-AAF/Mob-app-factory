import { fromJson, toJson, type SqlDatabase } from '@factory/storage';

import { newId } from '@/domain/ids';
import { DEFAULT_NOTIFICATION_SETTINGS } from '@/domain/reminderPlan';
import { NOTIFICATION_CATEGORIES, type NotificationCategory, type NotificationSetting, type Photo, type PhotoOwner } from '@/domain/types';

import { createTable } from '../table';

export type NotificationSettingsMap = Record<NotificationCategory, Omit<NotificationSetting, 'category'>>;

export function createSettingsRepository(db: SqlDatabase, now: () => Date) {
  const stamp = () => now().toISOString();

  return {
    async get<T>(key: string, fallback: T): Promise<T> {
      const r = await db.getFirstAsync<{ value: string }>('SELECT value FROM app_settings WHERE key = ?', [key]);
      return r ? fromJson<T>(r.value, fallback) : fallback;
    },

    async set<T>(key: string, value: T): Promise<void> {
      await db.runAsync('INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at', [key, toJson(value), stamp()]);
    },

    /** Saved settings merged over defaults (new categories get their default). */
    async notificationSettings(): Promise<NotificationSettingsMap> {
      const rows = await db.getAllAsync<{ category: NotificationCategory; enabled: number; days_before: number; hour: number; minute: number }>('SELECT * FROM notification_settings', []);
      const out = { ...DEFAULT_NOTIFICATION_SETTINGS } as NotificationSettingsMap;
      for (const r of rows) {
        if ((NOTIFICATION_CATEGORIES as readonly string[]).includes(r.category)) {
          out[r.category] = { enabled: r.enabled === 1, daysBefore: r.days_before, hour: r.hour, minute: r.minute };
        }
      }
      return out;
    },

    async setNotificationSetting(category: NotificationCategory, s: Omit<NotificationSetting, 'category'>): Promise<void> {
      await db.runAsync(
        `INSERT INTO notification_settings (category, enabled, days_before, hour, minute, updated_at) VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(category) DO UPDATE SET enabled = excluded.enabled, days_before = excluded.days_before, hour = excluded.hour, minute = excluded.minute, updated_at = excluded.updated_at`,
        [category, s.enabled ? 1 : 0, Math.max(0, Math.min(365, Math.floor(s.daysBefore))), s.hour, s.minute, stamp()],
      );
    },
  };
}

export function createPhotosRepository(db: SqlDatabase, now: () => Date) {
  const photos = createTable<Photo>(db, 'photos');
  return {
    list: (ownerType: PhotoOwner, ownerId: string) => photos.select('owner_type = ? AND owner_id = ?', [ownerType, ownerId], 'created_at ASC'),
    async add(ownerType: PhotoOwner, ownerId: string, filePath: string, kind: Photo['kind'] = 'photo'): Promise<Photo> {
      const id = newId('p_');
      await photos.insert({ id, ownerType, ownerId, kind, filePath, createdAt: now().toISOString() });
      return (await photos.get(id)) as Photo;
    },
    get: (id: string) => photos.get(id),
    remove: (id: string) => photos.delete(id),
    /** Deletes photo rows of an owner and returns their file paths so files can be removed. */
    async removeForOwner(ownerType: PhotoOwner, ownerId: string): Promise<string[]> {
      const list = await photos.select('owner_type = ? AND owner_id = ?', [ownerType, ownerId]);
      await db.runAsync('DELETE FROM photos WHERE owner_type = ? AND owner_id = ?', [ownerType, ownerId]);
      return list.map((p) => p.filePath);
    },
    /** First photo per owner, for list thumbnails. */
    async covers(ownerType: PhotoOwner, ownerIds: string[]): Promise<Record<string, string>> {
      if (ownerIds.length === 0) return {};
      const rows = await db.getAllAsync<{ owner_id: string; file_path: string }>(
        `SELECT owner_id, file_path FROM photos WHERE owner_type = ? AND owner_id IN (${ownerIds.map(() => '?').join(',')}) ORDER BY created_at ASC`,
        [ownerType, ...ownerIds],
      );
      const out: Record<string, string> = {};
      for (const r of rows) out[r.owner_id] ??= r.file_path;
      return out;
    },
    /** Photos whose owner row no longer exists (e.g. owner deleted through a home cascade). */
    async orphans(): Promise<{ id: string; filePath: string }[]> {
      const rows = await db.getAllAsync<{ id: string; file_path: string }>(
        `SELECT p.id, p.file_path FROM photos p WHERE
           (p.owner_type = 'home' AND NOT EXISTS (SELECT 1 FROM homes x WHERE x.id = p.owner_id)) OR
           (p.owner_type = 'room' AND NOT EXISTS (SELECT 1 FROM rooms x WHERE x.id = p.owner_id)) OR
           (p.owner_type = 'asset' AND NOT EXISTS (SELECT 1 FROM assets x WHERE x.id = p.owner_id)) OR
           (p.owner_type = 'repair' AND NOT EXISTS (SELECT 1 FROM repairs x WHERE x.id = p.owner_id)) OR
           (p.owner_type = 'inventory' AND NOT EXISTS (SELECT 1 FROM inventory_items x WHERE x.id = p.owner_id))`,
        [],
      );
      return rows.map((r) => ({ id: r.id, filePath: r.file_path }));
    },
    allPaths: async () => (await db.getAllAsync<{ file_path: string }>('SELECT file_path FROM photos', [])).map((r) => r.file_path),
  };
}

export type SettingsRepository = ReturnType<typeof createSettingsRepository>;
export type PhotosRepository = ReturnType<typeof createPhotosRepository>;
