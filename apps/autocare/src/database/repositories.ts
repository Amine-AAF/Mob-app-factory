import { fromJson, toJson, type SqlDatabase } from '@factory/storage';

import { dueOccurrences } from '@/features/expenses/aggregate';
import { advanceSchedule } from '@/features/maintenance/schedule';
import { nextDeadlineDay, normalizeLeadDays, renewalTerm } from '@/features/deadlines/deadlines';
import type {
  AdminDeadline,
  Budget,
  DayKey,
  Expense,
  FuelRecord,
  Inspection,
  InsurancePolicy,
  MaintenanceRecord,
  MaintenanceSchedule,
  NotificationCategory,
  NotificationSetting,
  OdometerSource,
  TireRecord,
  Vehicle,
  VehicleDocument,
  VehicleNote,
} from '@/types';
import { NOTIFICATION_CATEGORIES } from '@/types';
import { newId } from '@/utils';
import { toDayKey } from '@/utils/dates';

import {
  deadlineSpec,
  documentSpec,
  expenseSpec,
  fuelSpec,
  inspectionSpec,
  insuranceSpec,
  maintenanceSpec,
  noteSpec,
  odometerSpec,
  scheduleSpec,
  tireSpec,
  vehicleSpec,
} from './specs';
import { createTable } from './table';

/** Fields the caller provides when creating/updating; ids and timestamps are managed here. */
export type Input<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;
type Stamped = { id: string; createdAt: string; updatedAt: string };

function stamp<T>(input: Input<T> & { id?: string }, now: Date, prefix: string, existing?: Stamped | null): T {
  const iso = now.toISOString();
  return { ...input, id: existing?.id ?? input.id ?? newId(prefix), createdAt: existing?.createdAt ?? iso, updatedAt: iso } as T;
}

export function createRepositories(db: SqlDatabase) {
  const t = {
    vehicles: createTable(db, 'vehicles', vehicleSpec),
    odometer: createTable(db, 'odometer_readings', odometerSpec),
    schedules: createTable(db, 'maintenance_schedules', scheduleSpec),
    maintenance: createTable(db, 'maintenance_records', maintenanceSpec),
    fuel: createTable(db, 'fuel_records', fuelSpec),
    expenses: createTable(db, 'expenses', expenseSpec),
    insurance: createTable(db, 'insurance_policies', insuranceSpec),
    deadlines: createTable(db, 'administrative_reminders', deadlineSpec, { remindDaysBefore: [30, 7, 1] }),
    documents: createTable(db, 'documents', documentSpec),
    tires: createTable(db, 'tire_records', tireSpec),
    notes: createTable(db, 'vehicle_notes', noteSpec),
    inspections: createTable(db, 'inspections', inspectionSpec, { results: {} }),
  };

  /* ------------------------------------------------------------ odometer */

  /** Vehicle odometer = highest known reading (or the value entered on the profile). */
  async function refreshVehicleOdometer(vehicleId: string, now: Date): Promise<void> {
    const r = await db.getFirstAsync<{ m: number | null }>('SELECT MAX(odometer_km) AS m FROM odometer_readings WHERE vehicle_id = ?', [vehicleId]);
    if (r?.m !== null && r?.m !== undefined) {
      await db.runAsync('UPDATE vehicles SET odometer_km = ?, updated_at = ? WHERE id = ?', [r.m, now.toISOString(), vehicleId]);
    }
  }

  /** Upserts (or removes, when km is null) the reading attached to a source record. */
  async function syncReading(vehicleId: string, refId: string | null, day: DayKey, km: number | null, source: OdometerSource, now: Date): Promise<void> {
    const iso = now.toISOString();
    if (refId) {
      const existing = await db.getFirstAsync<{ id: string }>('SELECT id FROM odometer_readings WHERE ref_id = ?', [refId]);
      if (km === null) {
        if (existing) await db.runAsync('DELETE FROM odometer_readings WHERE id = ?', [existing.id]);
      } else if (existing) {
        await db.runAsync('UPDATE odometer_readings SET day = ?, odometer_km = ?, vehicle_id = ?, updated_at = ? WHERE id = ?', [day, km, vehicleId, iso, existing.id]);
      } else {
        await t.odometer.insert({ id: newId('o_'), vehicleId, day, odometerKm: km, source, refId, createdAt: iso, updatedAt: iso });
      }
    } else if (km !== null) {
      await t.odometer.insert({ id: newId('o_'), vehicleId, day, odometerKm: km, source, refId: null, createdAt: iso, updatedAt: iso });
    }
    await refreshVehicleOdometer(vehicleId, now);
  }

  const odometer = {
    list: (vehicleId: string) => t.odometer.where('vehicle_id = ?', [vehicleId], 'day, odometer_km'),
    all: () => t.odometer.where('1 = 1', [], 'vehicle_id, day, odometer_km'),
    async add(vehicleId: string, day: DayKey, km: number, now: Date): Promise<void> {
      await db.withTransactionAsync(() => syncReading(vehicleId, null, day, km, 'manual', now));
    },
    async remove(id: string, now: Date): Promise<void> {
      const r = await t.odometer.get(id);
      if (!r) return;
      await db.withTransactionAsync(async () => {
        await t.odometer.remove(id);
        await refreshVehicleOdometer(r.vehicleId, now);
      });
    },
  };

  /* ------------------------------------------------------------ vehicles */

  const vehicles = {
    list: (opts: { includeArchived?: boolean } = {}) => t.vehicles.where(opts.includeArchived ? '1 = 1' : 'archived = 0', [], 'sort_order, created_at'),
    get: (id: string) => t.vehicles.get(id),
    countActive: () => t.vehicles.count('archived = 0'),
    async save(input: Input<Vehicle> & { id?: string }, now: Date): Promise<string> {
      const existing = input.id ? await t.vehicles.get(input.id) : null;
      const v = stamp<Vehicle>(input, now, 'v_', existing);
      await db.withTransactionAsync(async () => {
        if (!existing) {
          await t.vehicles.insert(v);
          if (v.purchaseDate && v.purchaseOdometerKm !== null) await syncReading(v.id, null, v.purchaseDate, v.purchaseOdometerKm, 'purchase', now);
          if (v.odometerKm > 0) await syncReading(v.id, null, toDayKey(now), v.odometerKm, 'manual', now);
          return;
        }
        await t.vehicles.update(v.id, v);
        if (v.odometerKm > existing.odometerKm) {
          // A manual increase of the odometer on the profile is recorded as a reading.
          await syncReading(v.id, null, toDayKey(now), v.odometerKm, 'manual', now);
        } else {
          // Lower values can't override the history: the highest reading stays authoritative.
          await refreshVehicleOdometer(v.id, now);
        }
      });
      return v.id;
    },
    setArchived: (id: string, archived: boolean, now: Date) => t.vehicles.update(id, { archived, updatedAt: now.toISOString() }),
    /** Deletes a vehicle and its whole history. Returns the private files to delete from disk. */
    async remove(id: string): Promise<string[]> {
      const files = await db.getAllAsync<{ file_name: string }>('SELECT file_name FROM documents WHERE vehicle_id = ?', [id]);
      const v = await t.vehicles.get(id);
      await db.withTransactionAsync(async () => {
        await db.runAsync('DELETE FROM budgets WHERE scope = ?', [id]);
        await t.vehicles.remove(id);
      });
      return [...files.map((f) => f.file_name), ...(v?.photoFile ? [v.photoFile] : [])];
    },
  };

  /* ------------------------------------------------------------ maintenance */

  const schedules = {
    list: (vehicleId?: string) => (vehicleId ? t.schedules.where('vehicle_id = ?', [vehicleId], 'created_at') : t.schedules.where('1 = 1', [], 'created_at')),
    get: (id: string) => t.schedules.get(id),
    countEnabled: () => t.schedules.count('enabled = 1'),
    async save(input: Input<MaintenanceSchedule> & { id?: string }, now: Date): Promise<string> {
      const existing = input.id ? await t.schedules.get(input.id) : null;
      const s = stamp<MaintenanceSchedule>(input, now, 's_', existing);
      if (existing) await t.schedules.update(s.id, s);
      else await t.schedules.insert(s);
      return s.id;
    },
    remove: (id: string) => t.schedules.remove(id),
  };

  const maintenance = {
    list: (vehicleId?: string) => (vehicleId ? t.maintenance.where('vehicle_id = ?', [vehicleId], 'day DESC, created_at DESC') : t.maintenance.where('1 = 1', [], 'day DESC, created_at DESC')),
    get: (id: string) => t.maintenance.get(id),
    /**
     * Saves a record, its odometer reading and moves the linked schedule forward
     * (explicit `scheduleId`, else the vehicle's schedule of the same type) — in one transaction.
     */
    async save(input: Input<MaintenanceRecord> & { id?: string }, now: Date): Promise<string> {
      const existing = input.id ? await t.maintenance.get(input.id) : null;
      const r = stamp<MaintenanceRecord>(input, now, 'm_', existing);
      await db.withTransactionAsync(async () => {
        let schedule = r.scheduleId ? await t.schedules.get(r.scheduleId) : null;
        if (!schedule && r.type !== 'other' && r.type !== 'repair') {
          schedule = (await t.schedules.where('vehicle_id = ? AND type = ? AND enabled = 1', [r.vehicleId, r.type], 'created_at'))[0] ?? null;
        }
        r.scheduleId = schedule?.id ?? null;
        if (existing) await t.maintenance.update(r.id, r);
        else await t.maintenance.insert(r);
        await syncReading(r.vehicleId, r.id, r.day, r.odometerKm, 'maintenance', now);
        if (schedule) {
          const next = advanceSchedule(schedule, r);
          if (next) await t.schedules.update(schedule.id, { ...next, updatedAt: now.toISOString() });
        }
      });
      return r.id;
    },
    async remove(id: string, now: Date): Promise<void> {
      const r = await t.maintenance.get(id);
      if (!r) return;
      await db.withTransactionAsync(async () => {
        await t.maintenance.remove(id);
        await syncReading(r.vehicleId, id, r.day, null, 'maintenance', now);
      });
    },
  };

  /* ------------------------------------------------------------ fuel */

  const fuel = {
    list: (vehicleId?: string) => (vehicleId ? t.fuel.where('vehicle_id = ?', [vehicleId], 'day DESC, odometer_km DESC') : t.fuel.where('1 = 1', [], 'day DESC')),
    get: (id: string) => t.fuel.get(id),
    async save(input: Input<FuelRecord> & { id?: string }, now: Date): Promise<string> {
      const existing = input.id ? await t.fuel.get(input.id) : null;
      const f = stamp<FuelRecord>(input, now, 'f_', existing);
      await db.withTransactionAsync(async () => {
        if (existing) await t.fuel.update(f.id, f);
        else await t.fuel.insert(f);
        await syncReading(f.vehicleId, f.id, f.day, f.odometerKm, 'fuel', now);
      });
      return f.id;
    },
    async remove(id: string, now: Date): Promise<void> {
      const f = await t.fuel.get(id);
      if (!f) return;
      await db.withTransactionAsync(async () => {
        await t.fuel.remove(id);
        await syncReading(f.vehicleId, id, f.day, null, 'fuel', now);
      });
    },
    async lastFor(vehicleId: string): Promise<FuelRecord | null> {
      return (await t.fuel.where('vehicle_id = ?', [vehicleId], 'day DESC, created_at DESC LIMIT 1'))[0] ?? null;
    },
  };

  /* ------------------------------------------------------------ expenses */

  const expenses = {
    list: (vehicleId?: string) => (vehicleId ? t.expenses.where('vehicle_id = ?', [vehicleId], 'day DESC, created_at DESC') : t.expenses.where('1 = 1', [], 'day DESC, created_at DESC')),
    get: (id: string) => t.expenses.get(id),
    /** Manual expenses entered in a month (generated occurrences don't count against the free limit). */
    countInMonth: (month: string) => t.expenses.count("substr(day, 1, 7) = ? AND recurring_parent_id IS NULL", [month]),
    async save(input: Input<Expense> & { id?: string }, now: Date): Promise<string> {
      const existing = input.id ? await t.expenses.get(input.id) : null;
      const e = stamp<Expense>(input, now, 'e_', existing);
      await db.withTransactionAsync(async () => {
        if (existing) await t.expenses.update(e.id, e);
        else await t.expenses.insert(e);
        await syncReading(e.vehicleId, e.id, e.day, e.odometerKm, 'expense', now);
      });
      return e.id;
    },
    async remove(id: string, now: Date): Promise<void> {
      const e = await t.expenses.get(id);
      if (!e) return;
      await db.withTransactionAsync(async () => {
        await t.expenses.remove(id);
        await syncReading(e.vehicleId, id, e.day, null, 'expense', now);
      });
    },
    /** Creates the missing occurrences of every recurring expense up to today. Idempotent. */
    async materializeRecurring(today: DayKey, now: Date): Promise<number> {
      const parents = await t.expenses.where("recurrence != 'none' AND recurring_parent_id IS NULL", []);
      let created = 0;
      for (const p of parents) {
        const existing = await db.getAllAsync<{ day: string }>('SELECT day FROM expenses WHERE recurring_parent_id = ?', [p.id]);
        const days = dueOccurrences(p, new Set(existing.map((x) => x.day)), today);
        if (!days.length) continue;
        await db.withTransactionAsync(async () => {
          for (const day of days) {
            const iso = now.toISOString();
            await t.expenses.insert({ ...p, id: newId('e_'), day, odometerKm: null, recurrence: 'none', recurringParentId: p.id, createdAt: iso, updatedAt: iso });
            created++;
          }
        });
      }
      return created;
    },
  };

  /* ------------------------------------------------------------ insurance */

  const insurance = {
    list: (vehicleId?: string) => (vehicleId ? t.insurance.where('vehicle_id = ?', [vehicleId], 'end_day DESC') : t.insurance.where('1 = 1', [], 'end_day DESC')),
    get: (id: string) => t.insurance.get(id),
    async save(input: Input<InsurancePolicy> & { id?: string }, now: Date): Promise<string> {
      const existing = input.id ? await t.insurance.get(input.id) : null;
      const p = stamp<InsurancePolicy>(input, now, 'i_', existing);
      if (existing) await t.insurance.update(p.id, p);
      else await t.insurance.insert(p);
      return p.id;
    },
    remove: (id: string) => t.insurance.remove(id),
    /** Draft of a renewal (same insurer & cover, next term). Saved only when the user confirms. */
    async renewalDraft(id: string): Promise<(Input<InsurancePolicy> & { renewedFromId: string }) | null> {
      const p = await t.insurance.get(id);
      if (!p) return null;
      const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = p;
      return { ...rest, ...renewalTerm(p), renewedFromId: p.id };
    },
    payments: (policyId: string) => t.expenses.where('insurance_id = ?', [policyId], 'day DESC'),
  };

  /* ------------------------------------------------------------ deadlines */

  const deadlines = {
    list: (vehicleId?: string) => (vehicleId ? t.deadlines.where('vehicle_id = ?', [vehicleId], 'completed_at IS NOT NULL, due_day') : t.deadlines.where('1 = 1', [], 'completed_at IS NOT NULL, due_day')),
    get: (id: string) => t.deadlines.get(id),
    async save(input: Input<AdminDeadline> & { id?: string }, now: Date): Promise<string> {
      const existing = input.id ? await t.deadlines.get(input.id) : null;
      const d = stamp<AdminDeadline>({ ...input, remindDaysBefore: normalizeLeadDays(input.remindDaysBefore) }, now, 'd_', existing);
      if (existing) await t.deadlines.update(d.id, d);
      else await t.deadlines.insert(d);
      return d.id;
    },
    remove: (id: string) => t.deadlines.remove(id),
    /** Marks a deadline done; a repeating one creates the next occurrence. Returns the new id, if any. */
    async complete(id: string, now: Date): Promise<string | null> {
      const d = await t.deadlines.get(id);
      if (!d || d.completedAt) return null;
      const next = nextDeadlineDay(d);
      let nextId: string | null = null;
      await db.withTransactionAsync(async () => {
        await t.deadlines.update(id, { completedAt: now.toISOString(), updatedAt: now.toISOString() });
        if (next) {
          nextId = newId('d_');
          const iso = now.toISOString();
          await t.deadlines.insert({ ...d, id: nextId, dueDay: next, completedAt: null, createdAt: iso, updatedAt: iso });
        }
      });
      return nextId;
    },
    reopen: (id: string, now: Date) => t.deadlines.update(id, { completedAt: null, updatedAt: now.toISOString() }),
  };

  /* ------------------------------------------------------------ documents */

  const documents = {
    list: (vehicleId?: string | null) =>
      vehicleId === undefined ? t.documents.where('1 = 1', [], 'created_at DESC') : vehicleId === null ? t.documents.where('vehicle_id IS NULL', [], 'created_at DESC') : t.documents.where('vehicle_id = ?', [vehicleId], 'created_at DESC'),
    get: (id: string) => t.documents.get(id),
    count: () => t.documents.count(),
    linkedTo: (field: 'maintenance_id' | 'expense_id' | 'insurance_id' | 'deadline_id', id: string) => t.documents.where(`${field} = ?`, [id], 'created_at'),
    async save(input: Input<VehicleDocument> & { id?: string }, now: Date): Promise<string> {
      const existing = input.id ? await t.documents.get(input.id) : null;
      const d = stamp<VehicleDocument>(input, now, 'doc_', existing);
      if (existing) await t.documents.update(d.id, d);
      else await t.documents.insert(d);
      return d.id;
    },
    /** Removes the metadata row; returns the private file name so the caller deletes the file. */
    async remove(id: string): Promise<string | null> {
      const d = await t.documents.get(id);
      if (!d) return null;
      await t.documents.remove(id);
      return d.fileName;
    },
    allFileNames: async () => (await db.getAllAsync<{ file_name: string }>('SELECT file_name FROM documents', [])).map((r) => r.file_name),
  };

  /* ------------------------------------------------------------ tires, notes, inspections */

  const tires = {
    list: (vehicleId?: string) => (vehicleId ? t.tires.where('vehicle_id = ?', [vehicleId], "status = 'retired', installed_day DESC") : t.tires.where('1 = 1', [], 'installed_day DESC')),
    get: (id: string) => t.tires.get(id),
    async save(input: Input<TireRecord> & { id?: string }, now: Date): Promise<string> {
      const existing = input.id ? await t.tires.get(input.id) : null;
      const r = stamp<TireRecord>(input, now, 't_', existing);
      if (existing) await t.tires.update(r.id, r);
      else await t.tires.insert(r);
      return r.id;
    },
    remove: (id: string) => t.tires.remove(id),
  };

  const notes = {
    list: (vehicleId: string) => t.notes.where('vehicle_id = ?', [vehicleId], 'pinned DESC, updated_at DESC'),
    get: (id: string) => t.notes.get(id),
    async save(input: Input<VehicleNote> & { id?: string }, now: Date): Promise<string> {
      const existing = input.id ? await t.notes.get(input.id) : null;
      const n = stamp<VehicleNote>(input, now, 'n_', existing);
      if (existing) await t.notes.update(n.id, n);
      else await t.notes.insert(n);
      return n.id;
    },
    remove: (id: string) => t.notes.remove(id),
  };

  const inspections = {
    list: (vehicleId?: string) => (vehicleId ? t.inspections.where('vehicle_id = ?', [vehicleId], 'day DESC') : t.inspections.where('1 = 1', [], 'day DESC')),
    get: (id: string) => t.inspections.get(id),
    async save(input: Input<Inspection> & { id?: string }, now: Date): Promise<string> {
      const existing = input.id ? await t.inspections.get(input.id) : null;
      const i = stamp<Inspection>(input, now, 'ins_', existing);
      await db.withTransactionAsync(async () => {
        if (existing) await t.inspections.update(i.id, i);
        else await t.inspections.insert(i);
        await syncReading(i.vehicleId, i.id, i.day, i.odometerKm, 'manual', now);
      });
      return i.id;
    },
    remove: (id: string) => t.inspections.remove(id),
  };

  /* ------------------------------------------------------------ budgets & settings */

  const budgets = {
    async get(vehicleId: string | null): Promise<Budget | null> {
      const r = await db.getFirstAsync<{ scope: string; monthly_minor: number; currency: string }>('SELECT * FROM budgets WHERE scope = ?', [vehicleId ?? 'all']);
      return r ? { vehicleId: r.scope === 'all' ? null : r.scope, monthlyMinor: r.monthly_minor, currency: r.currency } : null;
    },
    async set(b: Budget | null, scope: string | null, now: Date): Promise<void> {
      if (!b) {
        await db.runAsync('DELETE FROM budgets WHERE scope = ?', [scope ?? 'all']);
        return;
      }
      await db.runAsync(
        'INSERT INTO budgets (scope, monthly_minor, currency, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(scope) DO UPDATE SET monthly_minor = excluded.monthly_minor, currency = excluded.currency, updated_at = excluded.updated_at',
        [b.vehicleId ?? 'all', b.monthlyMinor, b.currency, now.toISOString()],
      );
    },
  };

  const notificationSettings = {
    async all(): Promise<NotificationSetting[]> {
      const rows = await db.getAllAsync<{ category: string; enabled: number; hour: number; minute: number }>('SELECT * FROM notification_settings', []);
      const map = new Map(rows.map((r) => [r.category, r]));
      return NOTIFICATION_CATEGORIES.map((category) => {
        const r = map.get(category);
        return { category, enabled: r ? r.enabled === 1 : true, hour: r?.hour ?? 9, minute: r?.minute ?? 0 };
      });
    },
    async set(category: NotificationCategory, patch: Partial<Omit<NotificationSetting, 'category'>>, now: Date): Promise<void> {
      const current = (await notificationSettings.all()).find((s) => s.category === category)!;
      const next = { ...current, ...patch };
      await db.runAsync(
        'INSERT INTO notification_settings (category, enabled, hour, minute, updated_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(category) DO UPDATE SET enabled = excluded.enabled, hour = excluded.hour, minute = excluded.minute, updated_at = excluded.updated_at',
        [category, next.enabled ? 1 : 0, next.hour, next.minute, now.toISOString()],
      );
    },
  };

  const settings = {
    async get<T>(key: string, fallback: T): Promise<T> {
      const r = await db.getFirstAsync<{ value: string }>('SELECT value FROM user_settings WHERE key = ?', [key]);
      return r ? fromJson<T>(r.value, fallback) : fallback;
    },
    async set(key: string, value: unknown, now: Date): Promise<void> {
      await db.runAsync(
        'INSERT INTO user_settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at',
        [key, toJson(value), now.toISOString()],
      );
    },
  };

  return { db, vehicles, odometer, schedules, maintenance, fuel, expenses, insurance, deadlines, documents, tires, notes, inspections, budgets, notificationSettings, settings };
}

export type Repositories = ReturnType<typeof createRepositories>;

/** Everything about one vehicle, for screens, alerts, reports and notifications. */
export async function loadVehicleBundle(r: Repositories, vehicleId: string) {
  const [vehicle, readings, schedules, maintenance, fuel, expenses, policies, deadlines, documents, tires] = await Promise.all([
    r.vehicles.get(vehicleId),
    r.odometer.list(vehicleId),
    r.schedules.list(vehicleId),
    r.maintenance.list(vehicleId),
    r.fuel.list(vehicleId),
    r.expenses.list(vehicleId),
    r.insurance.list(vehicleId),
    r.deadlines.list(vehicleId),
    r.documents.list(vehicleId),
    r.tires.list(vehicleId),
  ]);
  if (!vehicle) return null;
  return { vehicle, readings, schedules, maintenance, fuel, expenses, policies, deadlines, documents, tires };
}
export type VehicleBundle = NonNullable<Awaited<ReturnType<typeof loadVehicleBundle>>>;

