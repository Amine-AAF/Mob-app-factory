import { fromJson, toJson, type SqlDatabase } from '@factory/storage';

import type { CareLogKind, DryingMethod, IroningLevel, WashMethod } from '@/domain/catalog';
import { newId } from '@/domain/ids';
import { DEFAULT_NOTIFICATION_SETTINGS } from '@/domain/notificationPlan';
import type { CareInstructions, CareLogEntry, DayKey, GoalKind, NotificationKind, NotificationSetting, WardrobeGoal } from '@/domain/types';

import { bool, clean, int, nowIso, type Row } from './helpers';

export type CareInstructionsInput = Omit<CareInstructions, 'itemId' | 'updatedAt'>;

export function isValidWashTemperature(t: number | null): boolean {
  return t == null || (Number.isInteger(t) && t >= 0 && t <= 95);
}

/**
 * Care instructions are entered by the user (usually copied from the garment's label).
 * ClosetWise never invents or infers them.
 */
export function createCareRepository(db: SqlDatabase) {
  return {
    async instructions(itemId: string): Promise<CareInstructions | null> {
      const r = await db.getFirstAsync<Row>("SELECT * FROM clothing_care_records WHERE item_id = ? AND kind = 'instructions'", [itemId]);
      if (!r) return null;
      return {
        itemId,
        washMethod: (r.wash_method as WashMethod | null) ?? null,
        washTemperature: r.wash_temperature == null ? null : Number(r.wash_temperature),
        drying: (r.drying as DryingMethod | null) ?? null,
        ironing: (r.ironing as IroningLevel | null) ?? null,
        bleach: r.bleach == null ? null : bool(r.bleach),
        notes: (r.notes as string | null) ?? null,
        updatedAt: String(r.updated_at),
      };
    },

    async saveInstructions(itemId: string, input: CareInstructionsInput, today: DayKey): Promise<void> {
      if (!isValidWashTemperature(input.washTemperature)) throw new Error('invalid_temperature');
      const now = nowIso();
      const empty = !input.washMethod && input.washTemperature == null && !input.drying && !input.ironing && input.bleach == null && !clean(input.notes);
      if (empty) {
        await db.runAsync("DELETE FROM clothing_care_records WHERE item_id = ? AND kind = 'instructions'", [itemId]);
        return;
      }
      await db.runAsync(
        `INSERT INTO clothing_care_records (id, item_id, kind, wash_method, wash_temperature, drying, ironing, bleach, notes, recorded_on, created_at, updated_at)
         VALUES (?, ?, 'instructions', ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(item_id) WHERE kind = 'instructions' DO UPDATE SET wash_method = excluded.wash_method, wash_temperature = excluded.wash_temperature,
           drying = excluded.drying, ironing = excluded.ironing, bleach = excluded.bleach, notes = excluded.notes, updated_at = excluded.updated_at`,
        [newId('care'), itemId, input.washMethod, input.washTemperature, input.drying, input.ironing, int(input.bleach), clean(input.notes), today, now, now],
      );
    },

    async log(itemId: string, kind: CareLogKind, day: DayKey, notes: string | null = null): Promise<void> {
      const now = nowIso();
      await db.runAsync('INSERT INTO clothing_care_records (id, item_id, kind, notes, recorded_on, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)', [
        newId('care'),
        itemId,
        kind,
        clean(notes),
        day,
        now,
        now,
      ]);
    },

    async history(itemId: string): Promise<CareLogEntry[]> {
      const rows = await db.getAllAsync<Row>("SELECT * FROM clothing_care_records WHERE item_id = ? AND kind <> 'instructions' ORDER BY recorded_on DESC, created_at DESC", [itemId]);
      return rows.map((r) => ({ id: String(r.id), itemId, kind: String(r.kind) as CareLogKind, recordedOn: String(r.recorded_on), notes: (r.notes as string | null) ?? null }));
    },

    async removeLog(id: string): Promise<void> {
      await db.runAsync("DELETE FROM clothing_care_records WHERE id = ? AND kind <> 'instructions'", [id]);
    },
  };
}

const toGoal = (r: Row): WardrobeGoal => ({
  id: String(r.id),
  kind: String(r.kind) as GoalKind,
  title: (r.title as string | null) ?? null,
  target: Number(r.target),
  startDate: String(r.start_date),
  endDate: (r.end_date as string | null) ?? null,
  status: String(r.status) as WardrobeGoal['status'],
  payload: fromJson<WardrobeGoal['payload']>(r.payload as string, {}),
  createdAt: String(r.created_at),
});

export type GoalInput = Omit<WardrobeGoal, 'id' | 'createdAt'>;

export function createGoalRepository(db: SqlDatabase) {
  return {
    async list(): Promise<WardrobeGoal[]> {
      return (await db.getAllAsync<Row>("SELECT * FROM wardrobe_goals ORDER BY CASE status WHEN 'active' THEN 0 ELSE 1 END, created_at DESC", [])).map(toGoal);
    },
    async get(id: string): Promise<WardrobeGoal | null> {
      const r = await db.getFirstAsync<Row>('SELECT * FROM wardrobe_goals WHERE id = ?', [id]);
      return r ? toGoal(r) : null;
    },
    async save(input: GoalInput, id?: string): Promise<string> {
      if (!(input.target > 0)) throw new Error('invalid_target');
      const now = nowIso();
      const v = [input.kind, clean(input.title), input.target, input.startDate, input.endDate, input.status, toJson(input.payload ?? {})];
      if (id) {
        await db.runAsync('UPDATE wardrobe_goals SET kind = ?, title = ?, target = ?, start_date = ?, end_date = ?, status = ?, payload = ?, updated_at = ? WHERE id = ?', [...v, now, id]);
        return id;
      }
      const nid = newId('gol');
      await db.runAsync('INSERT INTO wardrobe_goals (kind, title, target, start_date, end_date, status, payload, id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [...v, nid, now, now]);
      return nid;
    },
    async setStatus(id: string, status: WardrobeGoal['status']): Promise<void> {
      await db.runAsync('UPDATE wardrobe_goals SET status = ?, updated_at = ? WHERE id = ?', [status, nowIso(), id]);
    },
    async remove(id: string): Promise<void> {
      await db.runAsync('DELETE FROM wardrobe_goals WHERE id = ?', [id]);
    },
  };
}

/** Typed app settings stored in SQLite (backed up with the rest of the data). */
export interface AppSettings {
  currency: string;
  monthlyBudget: number | null;
  hemisphere: 'north' | 'south';
  /** Month key of the last budget alert sent, to alert once per threshold per month. */
  lastBudgetAlert: string | null;
}

export const DEFAULT_APP_SETTINGS: AppSettings = { currency: 'USD', monthlyBudget: null, hemisphere: 'north', lastBudgetAlert: null };

export function createSettingsRepository(db: SqlDatabase) {
  const repo = {
    async get(): Promise<AppSettings> {
      const rows = await db.getAllAsync<{ key: string; value: string }>('SELECT key, value FROM app_settings', []);
      const out: AppSettings = { ...DEFAULT_APP_SETTINGS };
      for (const r of rows) {
        if (r.key in out) (out as unknown as Record<string, unknown>)[r.key] = fromJson(r.value, (DEFAULT_APP_SETTINGS as unknown as Record<string, unknown>)[r.key]);
      }
      return out;
    },
    async set(patch: Partial<AppSettings>): Promise<void> {
      await db.withTransactionAsync(async () => {
        for (const [key, value] of Object.entries(patch)) {
          await db.runAsync('INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', [key, toJson(value)]);
        }
      });
    },

    async notifications(): Promise<NotificationSetting[]> {
      const rows = await db.getAllAsync<Row>('SELECT * FROM notification_settings', []);
      const byKind = new Map(rows.map((r) => [String(r.kind), r]));
      return DEFAULT_NOTIFICATION_SETTINGS.map((d) => {
        const r = byKind.get(d.kind);
        return r ? { kind: d.kind, enabled: bool(r.enabled), hour: Number(r.hour), minute: Number(r.minute), param: Number(r.param) } : d;
      });
    },
    async setNotification(kind: NotificationKind, patch: Partial<Omit<NotificationSetting, 'kind'>>): Promise<void> {
      const current = (await repo.notifications()).find((n) => n.kind === kind)!;
      const next = { ...current, ...patch };
      await db.runAsync(
        'INSERT INTO notification_settings (kind, enabled, hour, minute, param) VALUES (?, ?, ?, ?, ?) ON CONFLICT(kind) DO UPDATE SET enabled = excluded.enabled, hour = excluded.hour, minute = excluded.minute, param = excluded.param',
        [kind, next.enabled ? 1 : 0, next.hour, next.minute, next.param],
      );
    },
    async disableAllNotifications(): Promise<void> {
      await db.runAsync('UPDATE notification_settings SET enabled = 0', []);
    },

    async feedback(): Promise<Map<string, number>> {
      const rows = await db.getAllAsync<{ signature: string; rating: number }>('SELECT signature, rating FROM suggestion_feedback', []);
      return new Map(rows.map((r) => [r.signature, r.rating]));
    },
    async rate(signature: string, rating: -1 | 1 | 0, preset: string | null): Promise<void> {
      if (rating === 0) {
        await db.runAsync('DELETE FROM suggestion_feedback WHERE signature = ?', [signature]);
        return;
      }
      await db.runAsync(
        'INSERT INTO suggestion_feedback (signature, rating, preset, created_at) VALUES (?, ?, ?, ?) ON CONFLICT(signature) DO UPDATE SET rating = excluded.rating',
        [signature, rating, preset, nowIso()],
      );
    },
  };
  return repo;
}
