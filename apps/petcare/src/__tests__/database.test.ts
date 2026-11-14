import { BackupError } from '@factory/storage';
import { createTestDatabase } from '@factory/testing';

import { initDatabase, type Repositories } from '@/database';
import { SCHEMA_VERSION, USER_TABLES } from '@/database/migrations';
import { deleteAllUserData, exportUserData, importUserData, type FileAccess } from '@/services/backup';

const PET = { breed: null, sex: null, birthDate: null, birthEstimated: false, weightKg: null, color: null, identification: null, adoptionDate: null, notes: null, photo: null, walkGoalMinutes: null, archived: false } as const;

async function setup(): Promise<Repositories> {
  return initDatabase(await createTestDatabase());
}

function memoryFiles(): FileAccess & { store: Record<string, string> } {
  const store: Record<string, string> = {};
  return {
    store,
    list: (kind) => Object.keys(store).filter((k) => k.startsWith(`${kind}/`)).map((k) => k.slice(kind.length + 1)),
    read: async (kind, name) => store[`${kind}/${name}`]!,
    write: (kind, name, data) => void (store[`${kind}/${name}`] = data),
  };
}

describe('schema & migrations', () => {
  it('migrates to the current version and is idempotent', async () => {
    const db = await createTestDatabase();
    await initDatabase(db);
    await initDatabase(db);
    const v = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version', []);
    expect(v?.user_version).toBe(SCHEMA_VERSION);
  });

  it('creates every entity table with indexes', async () => {
    const db = await createTestDatabase();
    await initDatabase(db);
    const tables = (await db.getAllAsync<{ name: string }>("SELECT name FROM sqlite_master WHERE type = 'table'", [])).map((t) => t.name);
    for (const t of USER_TABLES) expect(tables).toContain(t);
    const indexes = await db.getAllAsync<{ name: string }>("SELECT name FROM sqlite_master WHERE type = 'index' AND name LIKE 'idx_%'", []);
    expect(indexes.length).toBeGreaterThanOrEqual(15);
  });

  it('stores only file references, never file contents', async () => {
    const db = await createTestDatabase();
    await initDatabase(db);
    const cols = await db.getAllAsync<{ name: string; type: string }>('PRAGMA table_info(documents)', []);
    expect(cols.some((c) => c.type.toUpperCase() === 'BLOB')).toBe(false);
    expect(cols.map((c) => c.name)).toContain('file_name');
  });
});

describe('pets & records', () => {
  it('manages several pets independently', async () => {
    const r = await setup();
    const rex = await r.create('pets', { ...PET, name: 'Rex', species: 'dog' });
    const tom = await r.create('pets', { ...PET, name: 'Tom', species: 'cat' });
    await r.create('weights', { petId: rex.id, date: '2026-11-01', weightKg: 12, heightCm: null, notes: null });
    await r.create('weights', { petId: tom.id, date: '2026-11-01', weightKg: 4, heightCm: null, notes: null });
    expect((await r.pets.listActive()).map((p) => p.name)).toEqual(['Rex', 'Tom']);
    expect((await r.weights.forPet(tom.id)).map((w) => w.weightKg)).toEqual([4]);
    expect(await r.pets.countActive()).toBe(2);
    await r.update('pets', tom.id, { archived: true });
    expect(await r.pets.countActive()).toBe(1);
  });

  it('round-trips every field type (bool, json, real, nulls)', async () => {
    const r = await setup();
    const p = await r.create('pets', { ...PET, name: 'Kiwi', species: 'bird', birthEstimated: true, weightKg: 0.085 });
    const t = await r.create('treatments', { petId: p.id, name: 'Drops', instructions: 'As written by the vet', startDate: '2026-11-01', endDate: null, frequency: 'twice_daily', reminderTimes: ['08:00', '20:00'], remindersEnabled: true, prescriber: null, notes: null, stoppedAt: null });
    const got = await r.treatments.get(t.id);
    expect(got).toMatchObject({ reminderTimes: ['08:00', '20:00'], remindersEnabled: true, endDate: null, instructions: 'As written by the vet' });
    expect((await r.pets.get(p.id))?.birthEstimated).toBe(true);
    expect((await r.pets.get(p.id))?.weightKg).toBeCloseTo(0.085);
  });

  it('cascades a pet deletion to its whole history', async () => {
    const r = await setup();
    const p = await r.create('pets', { ...PET, name: 'Rex', species: 'dog' });
    const h = await r.create('health', { petId: p.id, date: '2026-11-01', reason: 'Checkup', vetName: null, clinic: null, diagnosis: null, exams: null, results: null, notes: null, cost: 40, currency: 'EUR' });
    await r.create('documents', { petId: p.id, category: 'invoice', title: 'Invoice', fileName: 'doc1.pdf', mimeType: 'application/pdf', sizeBytes: 100, healthRecordId: h.id, vaccinationId: null, notes: null });
    await r.create('expenses', { petId: p.id, date: '2026-11-01', amount: 40, currency: 'EUR', category: 'vet', notes: null, receiptDocumentId: null });
    await r.remove('pets', p.id);
    expect(await r.health.all()).toHaveLength(0);
    expect(await r.documents.all()).toHaveLength(0);
    // Expenses survive as household expenses (pet unlinked) so budgets stay correct.
    const [expense] = await r.expenses.all();
    expect(expense?.petId).toBeNull();
  });

  it('keeps a document when its health record is deleted (link set to null)', async () => {
    const r = await setup();
    const p = await r.create('pets', { ...PET, name: 'Rex', species: 'dog' });
    const h = await r.create('health', { petId: p.id, date: '2026-11-01', reason: 'X-ray', vetName: null, clinic: null, diagnosis: null, exams: null, results: null, notes: null, cost: null, currency: null });
    const d = await r.create('documents', { petId: p.id, category: 'lab_result', title: 'X-ray', fileName: 'x.jpg', mimeType: 'image/jpeg', sizeBytes: 1, healthRecordId: h.id, vaccinationId: null, notes: null });
    expect(await r.documents.forHealthRecord(h.id)).toHaveLength(1);
    await r.remove('health', h.id);
    expect((await r.documents.get(d.id))?.healthRecordId).toBeNull();
  });

  it('rejects invalid data at the schema level', async () => {
    const r = await setup();
    const p = await r.create('pets', { ...PET, name: 'Rex', species: 'dog' });
    await expect(r.create('weights', { petId: p.id, date: '2026-11-01', weightKg: 0, heightCm: null, notes: null })).rejects.toThrow();
    await expect(r.create('health', { petId: 'missing', date: '2026-11-01', reason: 'x', vetName: null, clinic: null, diagnosis: null, exams: null, results: null, notes: null, cost: null, currency: null })).rejects.toThrow();
  });

  it('searches documents safely (LIKE wildcards are literal)', async () => {
    const r = await setup();
    const p = await r.create('pets', { ...PET, name: 'Rex', species: 'dog' });
    for (const title of ['Vaccination card 2026', 'Invoice 100%', 'Insurance']) {
      await r.create('documents', { petId: p.id, category: 'other', title, fileName: `${title.length}.pdf`, mimeType: null, sizeBytes: null, healthRecordId: null, vaccinationId: null, notes: null });
    }
    expect((await r.documents.search('vacc')).map((d) => d.title)).toEqual(['Vaccination card 2026']);
    expect((await r.documents.search('100%')).map((d) => d.title)).toEqual(['Invoice 100%']);
    expect(await r.documents.search('%')).toHaveLength(1);
    expect(await r.documents.search("'; DROP TABLE documents; --")).toHaveLength(0);
    expect(await r.documents.all()).toHaveLength(3);
  });

  it('lists upcoming appointments in order', async () => {
    const r = await setup();
    const p = await r.create('pets', { ...PET, name: 'Rex', species: 'dog' });
    const base = { petId: p.id, type: 'vet' as const, title: null, address: null, provider: null, phone: null, notes: null, estimatedCost: null, currency: null, remindMinutesBefore: 60 };
    await r.create('appointments', { ...base, startsAt: '2026-12-01T10:00:00.000Z', status: 'scheduled' });
    await r.create('appointments', { ...base, startsAt: '2026-11-20T10:00:00.000Z', status: 'scheduled' });
    await r.create('appointments', { ...base, startsAt: '2026-11-21T10:00:00.000Z', status: 'cancelled' });
    await r.create('appointments', { ...base, startsAt: '2026-10-01T10:00:00.000Z', status: 'scheduled' });
    expect((await r.appointments.upcoming('2026-11-13T00:00:00.000Z')).map((a) => a.startsAt)).toEqual(['2026-11-20T10:00:00.000Z', '2026-12-01T10:00:00.000Z']);
  });
});

describe('food inventory transactions', () => {
  it('records a purchase: stock, history and expense together', async () => {
    const r = await setup();
    const p = await r.create('pets', { ...PET, name: 'Rex', species: 'dog' });
    const food = await r.create('food', { petId: p.id, name: 'Kibble', brand: null, quantity: 1, unit: 'kg', lowThreshold: 2, dailyUsage: 0.3, restockAlert: true, notes: null });
    await r.recordPurchase({ foodId: food.id, date: '2026-11-13', quantity: 10, cost: 39.9, currency: 'EUR', petId: null });
    expect((await r.food.get(food.id))?.quantity).toBe(11);
    const [purchase] = await r.food.purchases(food.id);
    expect(purchase?.expenseId).toBeTruthy();
    const [expense] = await r.expenses.all();
    expect(expense).toMatchObject({ amount: 39.9, category: 'food', petId: p.id, currency: 'EUR' });
  });

  it('rolls back everything when the product does not exist', async () => {
    const r = await setup();
    await expect(r.recordPurchase({ foodId: 'nope', date: '2026-11-13', quantity: 1, cost: 5, currency: 'EUR', petId: null })).rejects.toThrow('food_not_found');
    expect(await r.expenses.all()).toHaveLength(0);
  });

  it('never lets stock go negative', async () => {
    const r = await setup();
    const food = await r.create('food', { petId: null, name: 'Hay', brand: null, quantity: 1, unit: 'bag', lowThreshold: null, dailyUsage: null, restockAlert: true, notes: null });
    await r.consumeFood(food.id, 5);
    expect((await r.food.get(food.id))?.quantity).toBe(0);
  });
});

describe('logs, checklists and settings', () => {
  it('logs treatment doses and meals', async () => {
    const r = await setup();
    const p = await r.create('pets', { ...PET, name: 'Rex', species: 'dog' });
    const t = await r.create('treatments', { petId: p.id, name: 'Drops', instructions: null, startDate: '2026-11-01', endDate: null, frequency: 'once_daily', reminderTimes: [], remindersEnabled: false, prescriber: null, notes: null, stoppedAt: null });
    await r.logTreatmentDose(t.id);
    await r.logTreatmentDose(t.id);
    expect(await r.treatments.logs(t.id)).toHaveLength(2);
    const f = await r.create('feeding', { petId: p.id, foodType: 'dry', brand: null, product: null, quantity: null, mealTimes: [], remindersEnabled: false, active: true, notes: null });
    await r.logMeal(p.id, f.id);
    expect(await r.feeding.logs(p.id)).toHaveLength(1);
  });

  it('creates and edits checklists atomically', async () => {
    const r = await setup();
    const id = await r.checklists.create({ title: 'Travel', petId: null, templateId: 'travel', labels: ['Food', 'Leash'] });
    let list = await r.checklists.get(id);
    expect(list?.items.map((i) => i.label)).toEqual(['Food', 'Leash']);
    await r.checklists.toggle(list!.items[0]!.id, true);
    await r.checklists.addItem(id, 'Water');
    list = await r.checklists.get(id);
    expect(list?.items.map((i) => [i.label, i.done])).toEqual([
      ['Food', true],
      ['Leash', false],
      ['Water', false],
    ]);
    await r.checklists.reset(id);
    expect((await r.checklists.get(id))?.items.every((i) => !i.done)).toBe(true);
    await r.checklists.remove(id);
    expect(await r.checklists.count()).toBe(0);
  });

  it('returns default notification settings until changed', async () => {
    const r = await setup();
    const all = await r.notificationSettings.all();
    expect(all).toHaveLength(8);
    expect(all.find((s) => s.category === 'vaccinations')?.enabled).toBe(true);
    await r.notificationSettings.save({ category: 'meals', enabled: true, hour: 7, minute: 30, weekday: null });
    expect((await r.notificationSettings.all()).find((s) => s.category === 'meals')).toMatchObject({ enabled: true, hour: 7, minute: 30 });
  });
});

describe('backup, restore and deletion', () => {
  async function populated() {
    const r = await setup();
    const p = await r.create('pets', { ...PET, name: 'Rex', species: 'dog', photo: 'photo1.jpg' });
    const h = await r.create('health', { petId: p.id, date: '2026-11-01', reason: 'Checkup', vetName: 'Dr Who', clinic: null, diagnosis: 'Healthy (vet)', exams: null, results: null, notes: null, cost: 45, currency: 'EUR' });
    const d = await r.create('documents', { petId: p.id, category: 'invoice', title: 'Invoice', fileName: 'doc1.pdf', mimeType: 'application/pdf', sizeBytes: 3, healthRecordId: h.id, vaccinationId: null, notes: null });
    await r.create('expenses', { petId: p.id, date: '2026-11-01', amount: 45, currency: 'EUR', category: 'vet', notes: null, receiptDocumentId: d.id });
    const food = await r.create('food', { petId: p.id, name: 'Kibble', brand: null, quantity: 1, unit: 'kg', lowThreshold: null, dailyUsage: null, restockAlert: true, notes: null });
    await r.recordPurchase({ foodId: food.id, date: '2026-11-02', quantity: 2, cost: 10, currency: 'EUR', petId: p.id });
    await r.checklists.create({ title: 'Vet visit', petId: p.id, templateId: 'vet_visit', labels: ['Questions'] });
    await r.notificationSettings.save({ category: 'meals', enabled: true, hour: 7, minute: 0, weekday: null });
    return { r, p };
  }

  it('round-trips all user data into a fresh install, with files', async () => {
    const { r } = await populated();
    const files = memoryFiles();
    files.write('documents', 'doc1.pdf', 'UERG');
    files.write('photos', 'photo1.jpg', 'SlBH');
    const { json, skippedFiles } = await exportUserData(r.db, { now: new Date('2026-11-13T10:00:00Z'), files, referenced: await r.referencedFiles() });
    expect(skippedFiles).toBe(0);

    const fresh = await setup();
    const target = memoryFiles();
    const out = await importUserData(fresh.db, json, target);
    expect(out.restoredFiles).toBe(2);
    expect(target.store['documents/doc1.pdf']).toBe('UERG');
    expect((await fresh.pets.listActive()).map((p) => p.name)).toEqual(['Rex']);
    expect((await fresh.health.all())[0]?.diagnosis).toBe('Healthy (vet)');
    expect(await fresh.expenses.all()).toHaveLength(2);
    expect(await fresh.checklists.count()).toBe(1);
    expect((await fresh.notificationSettings.all()).find((s) => s.category === 'meals')?.enabled).toBe(true);
  });

  it('reports missing files instead of failing, and restores metadata without them', async () => {
    const { r } = await populated();
    const files = memoryFiles(); // no files on disk
    const { json, skippedFiles } = await exportUserData(r.db, { files, referenced: await r.referencedFiles() });
    expect(skippedFiles).toBe(2);
    const fresh = await setup();
    await importUserData(fresh.db, json, memoryFiles());
    expect(await fresh.documents.all()).toHaveLength(1);
  });

  it('rejects foreign, corrupted or newer backups without touching data', async () => {
    const { r } = await populated();
    await expect(importUserData(r.db, 'not json')).rejects.toBeInstanceOf(BackupError);
    await expect(importUserData(r.db, JSON.stringify({ format: 'factory-backup', formatVersion: 1, appId: 'devspeak', schemaVersion: 1, createdAt: '', tables: {} }))).rejects.toMatchObject({ code: 'wrong_app' });
    await expect(importUserData(r.db, JSON.stringify({ format: 'factory-backup', formatVersion: 1, appId: 'petcare', schemaVersion: 99, createdAt: '', tables: {} }))).rejects.toMatchObject({ code: 'newer_schema' });
    expect(await r.pets.countActive()).toBe(1);
  });

  it('ignores unsafe file names in a crafted backup', async () => {
    const r = await setup();
    const { backup } = await exportUserData(r.db);
    const crafted = JSON.stringify({ ...backup, files: { documents: { '../../evil.sh': 'eA==', 'ok.pdf': 'eA==' }, photos: {} } });
    const target = memoryFiles();
    const out = await importUserData(r.db, crafted, target);
    expect(out.restoredFiles).toBe(1);
    expect(Object.keys(target.store)).toEqual(['documents/ok.pdf']);
  });

  it('deletes every user row', async () => {
    const { r } = await populated();
    await deleteAllUserData(r.db);
    for (const t of USER_TABLES) {
      const row = await r.db.getFirstAsync<{ n: number }>(`SELECT COUNT(*) AS n FROM ${t}`, []);
      expect(row?.n).toBe(0);
    }
  });
});
