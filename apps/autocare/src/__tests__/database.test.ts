import { BackupError } from '@factory/storage';
import { createTestDatabase } from '@factory/testing';
import fs from 'fs';
import path from 'path';

import { initDatabase, loadVehicleBundle, type Repositories } from '@/database';
import { migrations, SCHEMA_VERSION, USER_TABLES } from '@/database/migrations';
import { computeConsumption } from '@/features/fuel/consumption';
import { deleteAllUserData, describeBackup, exportUserData, importUserData } from '@/services/backupService';

import { vehicleInput } from './fixtures';

const NOW = new Date('2026-03-02T10:00:00');
let db: Awaited<ReturnType<typeof createTestDatabase>>;
let r: Repositories;

beforeEach(async () => {
  db = await createTestDatabase();
  r = await initDatabase(db);
});
afterEach(() => db.close());

const fuelInput = (vehicleId: string, p: Partial<Parameters<Repositories['fuel']['save']>[0]> = {}) => ({
  vehicleId,
  day: '2026-03-01',
  odometerKm: 30500 as number | null,
  quantity: 40,
  quantityUnit: 'L' as const,
  unitPrice: 1.8,
  totalMinor: 7200,
  currency: 'EUR',
  fuelType: 'gasoline' as const,
  station: null,
  isFull: true,
  missedPrevious: false,
  notes: null,
  ...p,
});

describe('schema & migrations', () => {
  it('migrates to the latest version and creates every user table', async () => {
    const v = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version', []);
    expect(v?.user_version).toBe(SCHEMA_VERSION);
    expect(SCHEMA_VERSION).toBe(migrations.length);
    const tables = (await db.getAllAsync<{ name: string }>("SELECT name FROM sqlite_master WHERE type = 'table'", [])).map((x) => x.name);
    for (const tbl of [...USER_TABLES, 'subscription_cache']) expect(tables).toContain(tbl);
  });

  it('is idempotent (re-running migrations keeps data)', async () => {
    const id = await r.vehicles.save(vehicleInput(), NOW);
    await initDatabase(db);
    expect(await r.vehicles.get(id)).not.toBeNull();
  });

  it('enforces foreign keys and checks', async () => {
    await expect(db.runAsync("INSERT INTO fuel_records (id, vehicle_id, day, quantity, quantity_unit, total_minor, currency, fuel_type, created_at, updated_at) VALUES ('x', 'nope', '2026-01-01', 10, 'L', 0, 'EUR', 'gasoline', '', '')", [])).rejects.toThrow();
    const id = await r.vehicles.save(vehicleInput(), NOW);
    await expect(r.fuel.save(fuelInput(id, { quantity: 0 }), NOW)).rejects.toThrow();
  });

  it('has indexes on the hot paths', async () => {
    const idx = (await db.getAllAsync<{ name: string }>("SELECT name FROM sqlite_master WHERE type = 'index'", [])).map((x) => x.name);
    expect(idx).toEqual(expect.arrayContaining(['idx_fuel_vehicle_day', 'idx_expenses_vehicle_day', 'idx_maintenance_vehicle_day', 'idx_odometer_vehicle_day', 'idx_deadlines_due']));
  });
});

describe('vehicles & mileage history', () => {
  it('creates a vehicle with an initial odometer reading', async () => {
    const id = await r.vehicles.save(vehicleInput({ purchaseDate: '2024-06-01', purchaseOdometerKm: 12000 }), NOW);
    const v = await r.vehicles.get(id);
    expect(v).toMatchObject({ make: 'Renault', odometerKm: 30000, archived: false, currency: 'EUR' });
    const readings = await r.odometer.list(id);
    expect(readings.map((x) => [x.day, x.odometerKm, x.source])).toEqual([
      ['2024-06-01', 12000, 'purchase'],
      ['2026-03-02', 30000, 'manual'],
    ]);
  });

  it('updates a profile; a higher odometer adds a reading, a lower one is ignored', async () => {
    const id = await r.vehicles.save(vehicleInput(), NOW);
    await r.vehicles.save({ ...vehicleInput({ name: 'Clio V', odometerKm: 31000 }), id }, new Date('2026-03-10T10:00:00'));
    expect((await r.vehicles.get(id))?.odometerKm).toBe(31000);
    await r.vehicles.save({ ...vehicleInput({ odometerKm: 100 }), id }, NOW);
    expect((await r.vehicles.get(id))?.odometerKm).toBe(31000);
    expect((await r.vehicles.get(id))?.name).toBe('Clio');
  });

  it('fill-ups keep the odometer in sync, including edits and deletions', async () => {
    const id = await r.vehicles.save(vehicleInput(), NOW);
    const f = await r.fuel.save(fuelInput(id, { odometerKm: 30500 }), NOW);
    expect((await r.vehicles.get(id))?.odometerKm).toBe(30500);
    await r.fuel.save({ ...fuelInput(id, { odometerKm: 30800 }), id: f }, NOW);
    expect((await r.odometer.list(id)).filter((x) => x.source === 'fuel')).toHaveLength(1);
    expect((await r.vehicles.get(id))?.odometerKm).toBe(30800);
    await r.fuel.remove(f, NOW);
    expect((await r.odometer.list(id)).some((x) => x.source === 'fuel')).toBe(false);
    expect((await r.vehicles.get(id))?.odometerKm).toBe(30000);
  });

  it('archives and deletes a vehicle with its whole history (cascade)', async () => {
    const id = await r.vehicles.save(vehicleInput(), NOW);
    await r.fuel.save(fuelInput(id), NOW);
    await r.documents.save({ vehicleId: id, category: 'registration', title: 'Card', fileName: 'doc_a.pdf', mimeType: 'application/pdf', sizeBytes: 10, expiryDay: null, notes: null, maintenanceId: null, expenseId: null, insuranceId: null, deadlineId: null }, NOW);
    await r.budgets.set({ vehicleId: id, monthlyMinor: 1000, currency: 'EUR' }, id, NOW);
    await r.vehicles.setArchived(id, true, NOW);
    expect(await r.vehicles.list()).toHaveLength(0);
    expect(await r.vehicles.list({ includeArchived: true })).toHaveLength(1);
    const files = await r.vehicles.remove(id);
    expect(files).toEqual(['doc_a.pdf']);
    for (const table of ['fuel_records', 'odometer_readings', 'documents', 'budgets']) {
      expect((await db.getFirstAsync<{ n: number }>(`SELECT COUNT(*) AS n FROM ${table}`, []))?.n).toBe(0);
    }
  });
});

describe('maintenance', () => {
  it('a record moves its schedule forward (matched by type) and logs the odometer', async () => {
    const id = await r.vehicles.save(vehicleInput(), NOW);
    const sId = await r.schedules.save({ vehicleId: id, type: 'oil_change', title: null, intervalKm: 15000, intervalMonths: 12, lastDay: '2025-03-01', lastOdometerKm: 18000, remindDaysBefore: 14, remindKmBefore: 500, enabled: true, notes: null }, NOW);
    const mId = await r.maintenance.save({ vehicleId: id, type: 'oil_change', title: null, day: '2026-03-01', odometerKm: 30200, description: null, provider: 'Garage', costMinor: 12000, currency: 'EUR', parts: null, notes: null, scheduleId: null }, NOW);
    expect(await r.schedules.get(sId)).toMatchObject({ lastDay: '2026-03-01', lastOdometerKm: 30200 });
    expect((await r.maintenance.get(mId))?.scheduleId).toBe(sId);
    expect((await r.vehicles.get(id))?.odometerKm).toBe(30200);
  });

  it('an old invoice entered later does not reset the schedule', async () => {
    const id = await r.vehicles.save(vehicleInput(), NOW);
    const sId = await r.schedules.save({ vehicleId: id, type: 'brake_pads', title: null, intervalKm: 40000, intervalMonths: null, lastDay: '2026-01-01', lastOdometerKm: 29000, remindDaysBefore: 14, remindKmBefore: 500, enabled: true, notes: null }, NOW);
    await r.maintenance.save({ vehicleId: id, type: 'brake_pads', title: null, day: '2023-01-01', odometerKm: 5000, description: null, provider: null, costMinor: null, currency: 'EUR', parts: null, notes: null, scheduleId: null }, NOW);
    expect(await r.schedules.get(sId)).toMatchObject({ lastDay: '2026-01-01', lastOdometerKm: 29000 });
  });

  it('deleting a schedule keeps its history records', async () => {
    const id = await r.vehicles.save(vehicleInput(), NOW);
    const sId = await r.schedules.save({ vehicleId: id, type: 'oil_change', title: null, intervalKm: 10000, intervalMonths: null, lastDay: null, lastOdometerKm: null, remindDaysBefore: 14, remindKmBefore: 500, enabled: true, notes: null }, NOW);
    const mId = await r.maintenance.save({ vehicleId: id, type: 'oil_change', title: null, day: '2026-03-01', odometerKm: null, description: null, provider: null, costMinor: null, currency: 'EUR', parts: null, notes: null, scheduleId: sId }, NOW);
    await r.schedules.remove(sId);
    expect((await r.maintenance.get(mId))?.scheduleId).toBeNull();
  });
});

describe('expenses, insurance, deadlines, documents, tires', () => {
  it('generates recurring occurrences once (idempotent)', async () => {
    const id = await r.vehicles.save(vehicleInput(), NOW);
    await r.expenses.save({ vehicleId: id, category: 'parking', day: '2025-12-15', amountMinor: 8000, currency: 'EUR', vendor: null, odometerKm: null, notes: null, recurrence: 'monthly', recurringParentId: null, insuranceId: null }, NOW);
    expect(await r.expenses.materializeRecurring('2026-03-02', NOW)).toBe(2);
    expect(await r.expenses.materializeRecurring('2026-03-02', NOW)).toBe(0);
    const all = await r.expenses.list(id);
    expect(all.map((e) => e.day).sort()).toEqual(['2025-12-15', '2026-01-15', '2026-02-15']);
    // Generated ones don't count against the free monthly limit.
    expect(await r.expenses.countInMonth('2026-02')).toBe(0);
  });

  it('insurance renewal draft and payments', async () => {
    const id = await r.vehicles.save(vehicleInput(), NOW);
    const pId = await r.insurance.save({ vehicleId: id, insurer: 'AXA', policyNumber: 'P1', startDay: '2025-04-01', endDay: '2026-03-31', premiumMinor: 60000, currency: 'EUR', paymentFrequency: 'annual', coverage: null, contactName: null, contactPhone: null, contactEmail: null, remindDaysBefore: 30, renewedFromId: null, notes: null }, NOW);
    const draft = await r.insurance.renewalDraft(pId);
    expect(draft).toMatchObject({ insurer: 'AXA', startDay: '2026-04-01', endDay: '2027-03-31', renewedFromId: pId });
    await r.expenses.save({ vehicleId: id, category: 'insurance', day: '2025-04-01', amountMinor: 60000, currency: 'EUR', vendor: 'AXA', odometerKm: null, notes: null, recurrence: 'none', recurringParentId: null, insuranceId: pId }, NOW);
    expect(await r.insurance.payments(pId)).toHaveLength(1);
    await expect(r.insurance.save({ ...draft!, startDay: '2026-04-01', endDay: '2026-01-01' }, NOW)).rejects.toThrow();
  });

  it('completing a repeating deadline creates the next one', async () => {
    const id = await r.vehicles.save(vehicleInput(), NOW);
    const dId = await r.deadlines.save({ vehicleId: id, type: 'inspection', title: null, dueDay: '2026-05-31', amountMinor: null, currency: 'EUR', remindDaysBefore: [7, 30, 7], repeatMonths: 24, completedAt: null, notes: null }, NOW);
    expect((await r.deadlines.get(dId))?.remindDaysBefore).toEqual([30, 7]);
    const next = await r.deadlines.complete(dId, NOW);
    expect(next).not.toBeNull();
    expect((await r.deadlines.get(next!))?.dueDay).toBe('2028-05-31');
    expect(await r.deadlines.complete(dId, NOW)).toBeNull();
  });

  it('documents keep metadata only and unlink when a record is deleted', async () => {
    const id = await r.vehicles.save(vehicleInput(), NOW);
    const eId = await r.expenses.save({ vehicleId: id, category: 'washing', day: '2026-03-01', amountMinor: 1500, currency: 'EUR', vendor: null, odometerKm: null, notes: null, recurrence: 'none', recurringParentId: null, insuranceId: null }, NOW);
    const docId = await r.documents.save({ vehicleId: id, category: 'invoice', title: 'Receipt', fileName: 'doc_1.jpg', mimeType: 'image/jpeg', sizeBytes: 2048, expiryDay: null, notes: null, maintenanceId: null, expenseId: eId, insuranceId: null, deadlineId: null }, NOW);
    expect(await r.documents.linkedTo('expense_id', eId)).toHaveLength(1);
    await r.expenses.remove(eId, NOW);
    expect((await r.documents.get(docId))?.expenseId).toBeNull();
    const cols = (await db.getAllAsync<{ name: string }>('PRAGMA table_info(documents)', [])).map((c) => c.name);
    expect(cols).not.toContain('data');
    expect(cols).toContain('file_name');
  });

  it('tires history', async () => {
    const id = await r.vehicles.save(vehicleInput(), NOW);
    await r.tires.save({ vehicleId: id, brand: 'Michelin', model: 'Alpin 6', size: '195/65 R15', season: 'winter', position: 'all', installedDay: '2025-11-01', installedOdometerKm: 25000, removedDay: '2026-03-30', removedOdometerKm: 30000, priceMinor: 52000, currency: 'EUR', status: 'stored', reminderDay: '2026-10-25', reminderKm: null, notes: null }, NOW);
    await r.tires.save({ vehicleId: id, brand: 'Michelin', model: 'Primacy', size: '195/65 R15', season: 'summer', position: 'all', installedDay: '2026-03-30', installedOdometerKm: 30000, removedDay: null, removedOdometerKm: null, priceMinor: null, currency: 'EUR', status: 'mounted', reminderDay: null, reminderKm: null, notes: null }, NOW);
    const list = await r.tires.list(id);
    expect(list[0]!.status).toBe('mounted');
    expect(list).toHaveLength(2);
  });

  it('loads a complete vehicle bundle for screens and reports', async () => {
    const id = await r.vehicles.save(vehicleInput({ odometerKm: 10000 }), NOW);
    await r.fuel.save(fuelInput(id, { day: '2026-03-02', odometerKm: 10000 }), NOW);
    await r.fuel.save(fuelInput(id, { day: '2026-03-10', odometerKm: 10500, quantity: 30 }), NOW);
    const b = await loadVehicleBundle(r, id);
    expect(b?.fuel).toHaveLength(2);
    expect(computeConsumption(b!.fuel, 'L').averagePer100km).toBeCloseTo(6, 6);
  });

  it('notification settings default to enabled at 9:00 and can be changed', async () => {
    expect((await r.notificationSettings.all()).every((s) => s.enabled && s.hour === 9)).toBe(true);
    await r.notificationSettings.set('tires', { enabled: false }, NOW);
    await r.notificationSettings.set('insurance', { hour: 18, minute: 0 }, NOW);
    const all = await r.notificationSettings.all();
    expect(all.find((s) => s.category === 'tires')?.enabled).toBe(false);
    expect(all.find((s) => s.category === 'insurance')?.hour).toBe(18);
  });
});

describe('backup, restore and deletion', () => {
  async function seed() {
    const id = await r.vehicles.save(vehicleInput(), NOW);
    await r.fuel.save(fuelInput(id), NOW);
    await r.maintenance.save({ vehicleId: id, type: 'service', title: null, day: '2026-02-01', odometerKm: 30100, description: 'Révision', provider: null, costMinor: 25000, currency: 'EUR', parts: null, notes: 'ñ é ü', scheduleId: null }, NOW);
    await r.expenses.save({ vehicleId: id, category: 'tolls', day: '2026-02-03', amountMinor: 450, currency: 'EUR', vendor: null, odometerKm: null, notes: null, recurrence: 'monthly', recurringParentId: null, insuranceId: null }, NOW);
    await r.expenses.materializeRecurring('2026-03-05', NOW);
    await db.runAsync("INSERT INTO subscription_cache (key, state, updated_at) VALUES ('entitlement', '{}', '')", []);
    return id;
  }

  it('round-trips every user table', async () => {
    const id = await seed();
    const { json, fileName, backup } = await exportUserData(db, NOW);
    expect(fileName).toBe('autocare-backup-2026-03-02.json');
    expect(backup.tables.subscription_cache).toBeUndefined();
    expect(describeBackup(json)).toMatchObject({ vehicles: 1, fuel: 1, maintenance: 1, expenses: 2 });

    await deleteAllUserData(db);
    expect(await r.vehicles.list({ includeArchived: true })).toHaveLength(0);
    expect((await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM subscription_cache', []))?.n).toBe(0);

    const { restoredRows } = await importUserData(db, json);
    expect(restoredRows).toBeGreaterThan(4);
    expect((await r.vehicles.get(id))?.make).toBe('Renault');
    expect((await r.maintenance.list(id))[0]?.notes).toBe('ñ é ü');
    expect(await r.expenses.list(id)).toHaveLength(2);
  });

  it('restore replaces current data atomically', async () => {
    await seed();
    const { json } = await exportUserData(db, NOW);
    await r.vehicles.save(vehicleInput({ make: 'Peugeot' }), NOW);
    await importUserData(db, json);
    expect((await r.vehicles.list()).map((v) => v.make)).toEqual(['Renault']);
  });

  it('rejects invalid, foreign and newer backups without touching data', async () => {
    await seed();
    await expect(importUserData(db, 'not json')).rejects.toBeInstanceOf(BackupError);
    await expect(importUserData(db, JSON.stringify({ format: 'factory-backup', formatVersion: 1, appId: 'habitflow', schemaVersion: 1, createdAt: '', tables: {} }))).rejects.toMatchObject({ code: 'wrong_app' });
    await expect(importUserData(db, JSON.stringify({ format: 'factory-backup', formatVersion: 1, appId: 'autocare', schemaVersion: SCHEMA_VERSION + 1, createdAt: '', tables: {} }))).rejects.toMatchObject({ code: 'newer_schema' });
    expect(await r.vehicles.list()).toHaveLength(1);
  });
});

describe('offline-first & privacy', () => {
  const sources = (dir: string): string[] =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) return e.name === '__tests__' ? [] : sources(p);
      return /\.(tsx?)$/.test(e.name) ? [p] : [];
    });
  const files = [...sources(path.join(__dirname, '..')), ...sources(path.join(__dirname, '..', '..', 'app'))];

  it('app code makes no network calls of its own', () => {
    const offenders = files.filter((f) => /\bfetch\(|XMLHttpRequest|axios|WebSocket\(|downloadFileAsync|uploadAsync/.test(fs.readFileSync(f, 'utf8')));
    expect(offenders).toEqual([]);
  });

  it('never logs user data with console.log', () => {
    const offenders = files.filter((f) => /console\.log\(/.test(fs.readFileSync(f, 'utf8')));
    expect(offenders).toEqual([]);
  });

  it('does not pass vehicle data to the ad SDK (no keywords / targeting)', () => {
    const ads = files.filter((f) => /BannerAd|createForAdRequest/.test(fs.readFileSync(f, 'utf8')));
    for (const f of ads) expect(fs.readFileSync(f, 'utf8')).not.toMatch(/requestOptions|keywords:|contentUrl:|customTargeting/);
  });

  it('forms (entry screens) never render ads', () => {
    const forms = files.filter((f) => /[\\/](edit|run|odometer|onboarding|paywall)\.tsx$/.test(f));
    expect(forms.length).toBeGreaterThan(8);
    for (const f of forms) expect(fs.readFileSync(f, 'utf8')).not.toMatch(/AdBanner/);
  });
});
