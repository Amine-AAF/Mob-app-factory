import { createTestDatabase } from '@factory/testing';

import { initDatabase, type Repositories } from '@/database';
import { SCHEMA_VERSION, USER_TABLES } from '@/database/migrations';
import { nextChoreDue } from '@/database/repositories/household';
import { deleteAllUserData, exportUserData, importUserData } from '@/services/backup';

const NOW = new Date('2026-11-13T10:00:00');
const now = () => NOW;

async function setup(): Promise<Repositories> {
  return initDatabase(await createTestDatabase(), now);
}

async function homeWithRooms(r: Repositories) {
  return r.homes.create({ name: '  Main flat ', type: 'apartment', currency: 'EUR', areaM2: 72 }, [
    { name: 'Kitchen', kind: 'kitchen' },
    { name: 'Living room', kind: 'living' },
  ]);
}

const assetInput = {
  roomId: null,
  name: 'Fridge',
  category: 'refrigerator' as const,
  brand: 'Coldy',
  model: 'X1',
  serialNumber: 'SN-123',
  purchaseDate: '2025-01-10',
  purchasePriceMinor: 49900,
  currency: 'EUR',
  vendor: 'Shop',
  warrantyEnd: '2026-12-01',
  status: 'active' as const,
  notes: null,
};

describe('schema', () => {
  it('migrates to the latest version and is idempotent', async () => {
    const db = await createTestDatabase();
    await initDatabase(db, now);
    await initDatabase(db, now);
    const v = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version', []);
    expect(v?.user_version).toBe(SCHEMA_VERSION);
    for (const t of USER_TABLES) {
      expect(await db.getFirstAsync(`SELECT COUNT(*) AS n FROM ${t}`, [])).toEqual({ n: 0 });
    }
  });
});

describe('homes and rooms', () => {
  it('creates a home with spaces atomically, trimmed', async () => {
    const r = await setup();
    const home = await homeWithRooms(r);
    expect(home.name).toBe('Main flat');
    expect(home.currency).toBe('EUR');
    const rooms = await r.homes.listRooms(home.id);
    expect(rooms.map((x) => [x.name, x.position])).toEqual([
      ['Kitchen', 0],
      ['Living room', 1],
    ]);
    const office = await r.homes.createRoom(home.id, { name: 'Office', kind: 'office' });
    expect(office.position).toBe(2);
  });

  it('deleting a room keeps its items (room becomes empty)', async () => {
    const r = await setup();
    const home = await homeWithRooms(r);
    const [kitchen] = await r.homes.listRooms(home.id);
    const asset = await r.assets.create(home.id, { ...assetInput, roomId: kitchen!.id });
    expect((await r.homes.roomCounts(home.id))[kitchen!.id]?.assets).toBe(1);
    await r.homes.removeRoom(kitchen!.id);
    expect((await r.assets.get(asset.id))?.roomId).toBeNull();
  });

  it('deleting a home cascades to all its data', async () => {
    const r = await setup();
    const home = await homeWithRooms(r);
    const asset = await r.assets.create(home.id, assetInput);
    await r.maintenance.create(home.id, maintenanceInput(asset.id));
    await r.expenses.create(home.id, expenseInput());
    await r.homes.remove(home.id);
    expect(await r.assets.count(home.id)).toBe(0);
    expect(await r.maintenance.list(home.id)).toEqual([]);
    expect(await r.expenses.list(home.id)).toEqual([]);
  });
});

describe('assets', () => {
  it('searches (escaping wildcards), filters and logs status changes', async () => {
    const r = await setup();
    const home = await homeWithRooms(r);
    const fridge = await r.assets.create(home.id, assetInput);
    await r.assets.create(home.id, { ...assetInput, name: 'Washer 100%', category: 'washer', serialNumber: null });
    expect((await r.assets.list(home.id, { search: 'coldy' })).map((a) => a.name)).toEqual(['Fridge', 'Washer 100%']);
    expect((await r.assets.list(home.id, { search: '100%' })).map((a) => a.name)).toEqual(['Washer 100%']);
    expect((await r.assets.list(home.id, { search: 'sn-123' })).map((a) => a.name)).toEqual(['Fridge']);
    expect((await r.assets.list(home.id, { category: 'washer' })).length).toBe(1);

    await r.assets.update(fridge.id, { status: 'in_repair' });
    const events = await r.assets.events(fridge.id);
    expect(events.map((e) => e.kind).sort()).toEqual(['created', 'status']);
    expect(events.find((e) => e.kind === 'status')?.detail).toBe('active>in_repair');
    expect((await r.assets.list(home.id, { status: 'in_repair' })).length).toBe(1);
  });

  it('lists warranties expiring in a window', async () => {
    const r = await setup();
    const home = await homeWithRooms(r);
    await r.assets.create(home.id, assetInput); // 2026-12-01
    await r.assets.create(home.id, { ...assetInput, name: 'TV', warrantyEnd: '2028-01-01' });
    await r.assets.create(home.id, { ...assetInput, name: 'Old', warrantyEnd: '2026-10-01' });
    expect((await r.assets.warrantiesEnding(home.id, '2026-11-13', 60)).map((a) => a.name)).toEqual(['Fridge']);
    expect((await r.assets.warrantiesEnding(home.id, '2026-11-13', 60, 60)).map((a) => a.name)).toEqual(['Old', 'Fridge']);
  });
});

function maintenanceInput(assetId: string | null = null) {
  return {
    assetId,
    roomId: null,
    templateId: 'fridge_clean',
    title: 'Clean fridge',
    description: null,
    category: 'appliances' as const,
    frequency: 'quarterly' as const,
    intervalValue: null,
    intervalUnit: null,
    lastDone: null,
    nextDue: '2026-11-01',
    estimatedMinutes: 30,
    priority: 'medium' as const,
    estimatedCostMinor: null,
    currency: null,
    notes: null,
    reminderEnabled: true,
    reminderDaysBefore: null,
  };
}

describe('maintenance planner', () => {
  it('completes an overdue recurring task from the completion day and records history', async () => {
    const r = await setup();
    const home = await homeWithRooms(r);
    const task = await r.maintenance.create(home.id, maintenanceInput());
    const done = await r.maintenance.complete(task.id, { doneOn: '2026-11-13', costMinor: 1200, currency: 'EUR', notes: ' ok ' });
    expect(done?.lastDone).toBe('2026-11-13');
    expect(done?.nextDue).toBe('2027-02-13');
    const history = await r.maintenance.history(home.id, { taskId: task.id });
    expect(history).toHaveLength(1);
    expect(history[0]).toMatchObject({ action: 'completed', previousDue: '2026-11-01', newDue: '2027-02-13', costMinor: 1200, notes: 'ok', taskTitle: 'Clean fridge' });
  });

  it('one-off tasks have no next due date once completed', async () => {
    const r = await setup();
    const home = await homeWithRooms(r);
    const task = await r.maintenance.create(home.id, { ...maintenanceInput(), frequency: 'once' });
    const done = await r.maintenance.complete(task.id, { doneOn: '2026-11-13' });
    expect(done?.nextDue).toBeNull();
    expect(await r.maintenance.dueUntil(home.id, '2030-01-01')).toEqual([]);
  });

  it('postpones and logs it', async () => {
    const r = await setup();
    const home = await homeWithRooms(r);
    const task = await r.maintenance.create(home.id, maintenanceInput());
    const moved = await r.maintenance.postpone(task.id, 7, '2026-11-13');
    expect(moved?.nextDue).toBe('2026-11-20');
    expect((await r.maintenance.history(home.id))[0]?.action).toBe('postponed');
  });

  it('limits history to a period (free plan)', async () => {
    const r = await setup();
    const home = await homeWithRooms(r);
    const task = await r.maintenance.create(home.id, maintenanceInput());
    await r.maintenance.complete(task.id, { doneOn: '2025-01-01' });
    await r.maintenance.complete(task.id, { doneOn: '2026-11-10' });
    expect(await r.maintenance.history(home.id, { since: '2026-08-15' })).toHaveLength(1);
    expect(await r.maintenance.history(home.id)).toHaveLength(2);
  });

  it('deleting an asset keeps its tasks and history', async () => {
    const r = await setup();
    const home = await homeWithRooms(r);
    const asset = await r.assets.create(home.id, assetInput);
    const task = await r.maintenance.create(home.id, maintenanceInput(asset.id));
    await r.maintenance.complete(task.id, { doneOn: '2026-11-13' });
    await r.assets.remove(asset.id);
    expect((await r.maintenance.get(task.id))?.assetId).toBeNull();
    expect(await r.maintenance.history(home.id)).toHaveLength(1);
  });
});

function expenseInput(over: Partial<Parameters<Repositories['expenses']['create']>[1]> = {}) {
  return {
    category: 'electricity' as const,
    title: 'Power bill',
    amountMinor: 8000,
    currency: 'EUR',
    spentOn: '2026-11-05',
    paymentMethod: null,
    assetId: null,
    roomId: null,
    documentId: null,
    notes: null,
    ...over,
  };
}

describe('expenses', () => {
  it('totals per currency and per month, never mixing currencies', async () => {
    const r = await setup();
    const home = await homeWithRooms(r);
    await r.expenses.create(home.id, expenseInput());
    await r.expenses.create(home.id, expenseInput({ amountMinor: 2000, spentOn: '2026-11-07' }));
    await r.expenses.create(home.id, expenseInput({ amountMinor: 3000, currency: 'USD', category: 'internet' }));
    await r.expenses.create(home.id, expenseInput({ amountMinor: 1000, spentOn: '2026-10-07' }));
    expect(await r.expenses.totals(home.id, { from: '2026-11-01', to: '2026-11-30' })).toEqual([
      { currency: 'EUR', amountMinor: 10000 },
      { currency: 'USD', amountMinor: 3000 },
    ]);
    const months = await r.expenses.monthlyTotals(home.id, '2026-10-01', '2026-11-30');
    expect(months).toEqual([
      { month: '2026-10', currency: 'EUR', amountMinor: 1000 },
      { month: '2026-11', currency: 'EUR', amountMinor: 10000 },
      { month: '2026-11', currency: 'USD', amountMinor: 3000 },
    ]);
    const cats = await r.expenses.byCategory(home.id, '2026-11-01', '2026-11-30');
    expect(cats.find((c) => c.category === 'internet')).toEqual({ category: 'internet', currency: 'USD', amountMinor: 3000 });
  });

  it('records recurring expenses idempotently and keeps them when the schedule is deleted', async () => {
    const r = await setup();
    const home = await homeWithRooms(r);
    const rec = await r.expenses.createRecurring(home.id, {
      title: 'Internet',
      category: 'internet',
      amountMinor: 2999,
      currency: 'EUR',
      frequency: 'monthly',
      startDate: '2026-09-15',
      endDate: null,
      paymentMethod: 'direct_debit',
      autoRecord: true,
      reminderEnabled: true,
      active: true,
      notes: null,
    });
    expect(await r.expenses.catchUp(home.id, '2026-11-13')).toBe(2);
    expect(await r.expenses.catchUp(home.id, '2026-11-13')).toBe(0);
    expect((await r.expenses.getRecurring(rec.id))?.nextDate).toBe('2026-11-15');
    expect(await r.expenses.catchUp(home.id, '2026-11-15')).toBe(1);
    const list = await r.expenses.list(home.id);
    expect(list.map((e) => e.spentOn)).toEqual(['2026-11-15', '2026-10-15', '2026-09-15']);
    await r.expenses.removeRecurring(rec.id);
    const after = await r.expenses.list(home.id);
    expect(after).toHaveLength(3);
    expect(after.every((e) => e.recurringId === null)).toBe(true);
  });

  it('a manual-only recurring schedule advances without recording', async () => {
    const r = await setup();
    const home = await homeWithRooms(r);
    const rec = await r.expenses.createRecurring(home.id, {
      title: 'Water',
      category: 'water',
      amountMinor: 4000,
      currency: 'EUR',
      frequency: 'quarterly',
      startDate: '2026-10-01',
      endDate: null,
      paymentMethod: null,
      autoRecord: false,
      reminderEnabled: true,
      active: true,
      notes: null,
    });
    expect(await r.expenses.catchUp(home.id, '2026-11-13')).toBe(0);
    expect((await r.expenses.getRecurring(rec.id))?.nextDate).toBe('2027-01-01');
  });
});

describe('repairs, documents, household, inventory', () => {
  it('tracks repair status and fills dates', async () => {
    const r = await setup();
    const home = await homeWithRooms(r);
    const asset = await r.assets.create(home.id, assetInput);
    const repair = await r.repairs.create(home.id, {
      assetId: asset.id,
      title: 'Not cooling',
      problem: 'Warm inside',
      status: 'reported',
      reportedOn: '2026-11-10',
      scheduledOn: null,
      completedOn: null,
      provider: 'FixIt',
      providerContact: null,
      costMinor: null,
      currency: 'EUR',
      underWarranty: true,
      outcome: null,
      documentId: null,
      notes: null,
    });
    expect(await r.repairs.countOpen(home.id)).toBe(1);
    await r.repairs.setStatus(repair.id, 'completed', '2026-11-13');
    const done = await r.repairs.get(repair.id);
    expect(done).toMatchObject({ status: 'completed', completedOn: '2026-11-13', underWarranty: true });
    expect(await r.repairs.countOpen(home.id)).toBe(0);
    expect((await r.repairs.list(home.id, { assetId: asset.id })).length).toBe(1);
  });

  it('stores document metadata only and filters by type and asset', async () => {
    const r = await setup();
    const home = await homeWithRooms(r);
    const asset = await r.assets.create(home.id, assetInput);
    await r.documents.create(home.id, {
      assetId: asset.id,
      roomId: null,
      title: 'Fridge invoice',
      type: 'invoice',
      filePath: 'documents/d_1.pdf',
      fileName: 'invoice.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1000,
      issueDate: '2025-01-10',
      expiryDate: null,
      reminderDaysBefore: null,
      notes: null,
    });
    await r.documents.create(home.id, {
      assetId: null,
      roomId: null,
      title: 'Home insurance',
      type: 'insurance',
      filePath: null,
      fileName: null,
      mimeType: null,
      sizeBytes: null,
      issueDate: null,
      expiryDate: '2026-12-31',
      reminderDaysBefore: 30,
      notes: 'policy 42',
    });
    expect((await r.documents.list(home.id, { type: 'invoice' })).map((d) => d.title)).toEqual(['Fridge invoice']);
    expect((await r.documents.list(home.id, { assetId: asset.id })).length).toBe(1);
    expect((await r.documents.list(home.id, { search: 'policy' })).map((d) => d.title)).toEqual(['Home insurance']);
    expect((await r.documents.expiringBetween(home.id, '2026-11-13', 60)).map((d) => d.title)).toEqual(['Home insurance']);
    expect(await r.documents.filePaths()).toEqual(['documents/d_1.pdf']);
  });

  it('completes chores: one-off closes, recurring moves forward and resets the checklist', async () => {
    const r = await setup();
    const home = await homeWithRooms(r);
    const member = await r.household.addMember(home.id, 'Sam', '#0F766E');
    const weekly = await r.household.create(
      home.id,
      { roomId: null, assigneeId: member.id, title: 'Trash', description: null, category: 'trash', priority: 'medium', dueDate: '2026-11-10', recurrence: 'weekly', intervalValue: null, intervalUnit: null, reminderEnabled: true },
      ['Kitchen bin', 'Recycling'],
    );
    expect(weekly.checklist?.map((c) => c.label)).toEqual(['Kitchen bin', 'Recycling']);
    await r.household.toggleItem(weekly.checklist![0]!.id, true);
    const after = await r.household.complete(weekly.id, '2026-11-13');
    expect(after?.dueDate).toBe('2026-11-17'); // stays on the same weekday, skips past dates
    expect(after?.checklist?.every((c) => !c.done)).toBe(true);
    expect(after?.completedAt).toBeNull();

    const once = await r.household.create(home.id, { roomId: null, assigneeId: null, title: 'Tidy garage', description: null, category: 'tidying', priority: 'low', dueDate: null, recurrence: 'once', intervalValue: null, intervalUnit: null, reminderEnabled: false });
    await r.household.complete(once.id, '2026-11-13');
    expect((await r.household.list(home.id, { open: true })).map((t) => t.title)).toEqual(['Trash']);
    const history = await r.household.history(home.id);
    expect(history.map((h) => h.member_name)).toContain('Sam');
    expect(nextChoreDue({ recurrence: 'daily', intervalValue: null, intervalUnit: null, dueDate: '2026-11-01' }, '2026-11-13')).toBe('2026-11-14');
  });

  it('summarises inventory value per currency', async () => {
    const r = await setup();
    const home = await homeWithRooms(r);
    const base = { roomId: null, category: 'electronics' as const, purchaseDate: null, documentId: null, notes: null };
    await r.inventory.create(home.id, { ...base, name: 'Laptop', quantity: 1, estimatedValueMinor: 120000, currency: 'EUR' });
    await r.inventory.create(home.id, { ...base, name: 'Chair', category: 'furniture', quantity: 4, estimatedValueMinor: 5000, currency: 'EUR' });
    await r.inventory.create(home.id, { ...base, name: 'Camera', quantity: 1, estimatedValueMinor: 50000, currency: 'USD' });
    await r.inventory.create(home.id, { ...base, name: 'Box', quantity: 0, estimatedValueMinor: null, currency: null });
    const s = await r.inventory.summary(home.id);
    expect(s.items).toBe(4);
    expect(s.quantity).toBe(7); // quantity is at least 1
    expect(s.value).toEqual([
      { currency: 'EUR', amountMinor: 140000 },
      { currency: 'USD', amountMinor: 50000 },
    ]);
  });
});

describe('settings', () => {
  it('merges notification settings over defaults', async () => {
    const r = await setup();
    const defaults = await r.settings.notificationSettings();
    expect(defaults.maintenance.enabled).toBe(true);
    await r.settings.setNotificationSetting('warranty', { enabled: false, daysBefore: 999, hour: 8, minute: 30 });
    const s = await r.settings.notificationSettings();
    expect(s.warranty).toEqual({ enabled: false, daysBefore: 365, hour: 8, minute: 30 });
    await r.settings.set('budget', { a: 1 });
    expect(await r.settings.get('budget', null)).toEqual({ a: 1 });
  });
});

describe('backup and restore', () => {
  it('round-trips all user data and refuses foreign backups', async () => {
    const r = await setup();
    const home = await homeWithRooms(r);
    const asset = await r.assets.create(home.id, assetInput);
    const task = await r.maintenance.create(home.id, maintenanceInput(asset.id));
    await r.maintenance.complete(task.id, { doneOn: '2026-11-13' });
    await r.expenses.create(home.id, expenseInput());
    await r.photos.add('asset', asset.id, 'photos/p_1.jpg');

    const { json, fileName, backup } = await exportUserData(r.db, NOW);
    expect(fileName).toBe('homecare-backup-2026-11-13.json');
    expect(backup.tables.homes).toHaveLength(1);

    const target = await setup();
    const { restoredRows } = await importUserData(target.db, json);
    expect(restoredRows).toBeGreaterThanOrEqual(7);
    expect((await target.homes.list())[0]?.name).toBe('Main flat');
    expect(await target.maintenance.history(home.id)).toHaveLength(1);
    expect((await target.photos.list('asset', asset.id))[0]?.filePath).toBe('photos/p_1.jpg');

    await expect(importUserData(target.db, json.replace('"appId": "homecare"', '"appId": "devspeak"'))).rejects.toThrow(/wrong_app/);
    await expect(importUserData(target.db, '{oops')).rejects.toThrow(/invalid_json/);
    // A failed restore leaves the existing data untouched.
    expect(await target.homes.count()).toBe(1);
  });

  it('deletes all user data', async () => {
    const r = await setup();
    await homeWithRooms(r);
    await deleteAllUserData(r.db);
    expect(await r.homes.count()).toBe(0);
  });
});
