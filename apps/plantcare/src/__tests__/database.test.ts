import { createTestDatabase } from '@factory/testing';

import { SPECIES } from '@/content/species';
import { backupUserData, initDatabase, restoreUserData, wipeUserData } from '@/database';
import { SCHEMA_VERSION } from '@/database/migrations';
import type { PlantInput } from '@/database/repositories';
import { seedLibraryIfNeeded } from '@/database/seed';

const NOW = () => new Date('2026-05-10T09:00:00');

const plantInput = (over: Partial<PlantInput> = {}): PlantInput => ({
  nickname: 'Monty',
  commonName: 'Swiss cheese plant',
  scientificName: 'Monstera deliciosa',
  speciesId: 'monstera-deliciosa',
  category: 'tropical',
  photoPath: null,
  acquiredOn: '2026-01-02',
  plantedOn: null,
  locationId: null,
  description: '',
  notes: '',
  favorite: false,
  ...over,
});

async function setup() {
  const db = await createTestDatabase();
  const repos = await initDatabase(db, NOW);
  return { db, repos };
}

describe('SQLite schema & seed', () => {
  it('migrates to the latest version and seeds the whole library', async () => {
    const { db } = await setup();
    const v = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version', []);
    expect(v?.user_version).toBe(SCHEMA_VERSION);
    const n = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM plant_species', []);
    expect(n?.n).toBe(SPECIES.length);
    const c = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM plant_categories', []);
    expect(c?.n).toBe(10);
  });

  it('is idempotent and does not re-seed the same library version', async () => {
    const { db } = await setup();
    await initDatabase(db, NOW);
    expect(await seedLibraryIfNeeded(db)).toBe(false);
    const n = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM plant_species', []);
    expect(n?.n).toBe(SPECIES.length);
  });

  it('re-seeding a new library version keeps user plants linked to their species', async () => {
    const { db, repos } = await setup();
    const p = await repos.plants.create(plantInput());
    expect(await seedLibraryIfNeeded(db, 999)).toBe(true);
    expect((await repos.plants.get(p.id))?.speciesId).toBe('monstera-deliciosa');
  });

  it('enforces foreign keys and check constraints', async () => {
    const { repos } = await setup();
    await expect(repos.tasks.create({ plantId: 'missing', type: 'watering', nextDue: '2026-05-10', intervalDays: 7, priority: 'normal', notes: '', amountMl: null, remindersEnabled: true })).rejects.toThrow();
    const p = await repos.plants.create(plantInput());
    await expect(repos.tasks.create({ plantId: p.id, type: 'watering', nextDue: '2026-05-10', intervalDays: 0, priority: 'normal', notes: '', amountMl: null, remindersEnabled: true })).rejects.toThrow();
  });
});

describe('plants', () => {
  it('creates, searches (accent/case-insensitive LIKE), filters, sorts and favourites', async () => {
    const { repos } = await setup();
    const a = await repos.plants.create(plantInput({ nickname: 'Zelda', category: 'tropical' }));
    await repos.plants.create(plantInput({ nickname: 'basil', commonName: 'Basil', scientificName: 'Ocimum basilicum', speciesId: 'ocimum-basilicum', category: 'herb' }));
    expect((await repos.plants.list({ search: 'ocimum' })).map((p) => p.nickname)).toEqual(['basil']);
    expect((await repos.plants.list({ category: 'tropical' })).map((p) => p.nickname)).toEqual(['Zelda']);
    expect((await repos.plants.list({}, 'name')).map((p) => p.nickname)).toEqual(['basil', 'Zelda']);
    await repos.plants.setFavorite(a.id, true);
    expect((await repos.plants.list({ favoritesOnly: true })).map((p) => p.id)).toEqual([a.id]);
  });

  it('escapes LIKE wildcards in search', async () => {
    const { repos } = await setup();
    await repos.plants.create(plantInput({ nickname: '100% green' }));
    await repos.plants.create(plantInput({ nickname: 'other' }));
    expect((await repos.plants.list({ search: '%' })).map((p) => p.nickname)).toEqual(['100% green']);
  });

  it('sorts by next care date', async () => {
    const { repos } = await setup();
    const late = await repos.plants.create(plantInput({ nickname: 'A late' }));
    const soon = await repos.plants.create(plantInput({ nickname: 'B soon' }));
    await repos.plants.create(plantInput({ nickname: 'C none' }));
    await repos.tasks.create({ plantId: late.id, type: 'watering', nextDue: '2026-06-01', intervalDays: 7, priority: 'normal', notes: '', amountMl: null, remindersEnabled: true });
    await repos.tasks.create({ plantId: soon.id, type: 'fertilizing', nextDue: '2026-05-11', intervalDays: 30, priority: 'normal', notes: '', amountMl: null, remindersEnabled: true });
    expect((await repos.plants.list({}, 'next_care')).map((p) => p.nickname)).toEqual(['B soon', 'A late', 'C none']);
  });

  it('duplicates the sheet and active schedule, but not history or photos', async () => {
    const { repos } = await setup();
    const p = await repos.plants.create(plantInput({ photoPath: 'photos/p1.jpg' }));
    const task = await repos.tasks.create({ plantId: p.id, type: 'watering', nextDue: '2026-05-10', intervalDays: 7, priority: 'normal', notes: '', amountMl: 250, remindersEnabled: true });
    await repos.tasks.complete(task.id, '2026-05-10');
    const copy = await repos.plants.duplicate(p.id, '(copy)');
    expect(copy?.nickname).toBe('Monty (copy)');
    expect(copy?.photoPath).toBeNull();
    expect(await repos.tasks.listForPlant(copy!.id)).toHaveLength(1);
    expect(await repos.watering.forPlant(copy!.id)).toHaveLength(0);
  });

  it('deleting a plant cascades to its records and returns every photo path', async () => {
    const { db, repos } = await setup();
    const p = await repos.plants.create(plantInput({ photoPath: 'photos/main.jpg' }));
    await repos.growth.create({ plantId: p.id, date: '2026-05-01', heightCm: 30, leafCount: 5, condition: 'good', photoPath: 'photos/g.jpg', notes: '' });
    await repos.journal.create({ plantId: p.id, date: '2026-05-02', kind: 'new_leaf', title: 'Leaf', body: '', photoPath: 'photos/j.jpg' });
    await repos.health.create({ plantId: p.id, category: 'pests', description: 'Mites', observedOn: '2026-05-03', status: 'open', actions: [], photoPaths: ['photos/h1.jpg'], notes: '', resolvedOn: null });
    await repos.watering.log(p.id, '2026-05-04', 200);
    const photos = await repos.plants.remove(p.id);
    expect(photos.sort()).toEqual(['photos/g.jpg', 'photos/h1.jpg', 'photos/j.jpg', 'photos/main.jpg']);
    for (const table of ['growth_records', 'plant_journal_entries', 'plant_health_records', 'watering_records', 'care_tasks']) {
      const r = await db.getFirstAsync<{ n: number }>(`SELECT COUNT(*) AS n FROM ${table}`, []);
      expect(r?.n).toBe(0);
    }
  });
});

describe('garden locations', () => {
  it('groups plants and keeps them when the location is deleted', async () => {
    const { repos } = await setup();
    const loc = await repos.locations.create({ name: 'Balcony', type: 'balcony', description: '', photoPath: null });
    const p = await repos.plants.create(plantInput({ locationId: loc.id }));
    await repos.tasks.create({ plantId: p.id, type: 'watering', nextDue: '2026-05-10', intervalDays: 3, priority: 'normal', notes: '', amountMl: null, remindersEnabled: true });
    expect(await repos.locations.plantCounts()).toEqual({ [loc.id]: 1 });
    expect(await repos.tasks.listForLocation(loc.id)).toHaveLength(1);
    await repos.locations.remove(loc.id);
    expect((await repos.plants.get(p.id))?.locationId).toBeNull();
  });
});

describe('watering & care tasks', () => {
  it('completing a watering logs a record and re-plans from the actual day', async () => {
    const { repos } = await setup();
    const p = await repos.plants.create(plantInput());
    const t = await repos.tasks.create({ plantId: p.id, type: 'watering', nextDue: '2026-05-08', intervalDays: 7, priority: 'normal', notes: '', amountMl: 300, remindersEnabled: true });
    const after = await repos.tasks.complete(t.id, '2026-05-10', { notes: 'dry soil' });
    expect(after?.nextDue).toBe('2026-05-17');
    const rec = await repos.watering.last(p.id);
    expect(rec).toMatchObject({ date: '2026-05-10', amountMl: 300, notes: 'dry soil' });
  });

  it('logging an unplanned watering restarts the schedule', async () => {
    const { repos } = await setup();
    const p = await repos.plants.create(plantInput());
    const t = await repos.tasks.create({ plantId: p.id, type: 'watering', nextDue: '2026-05-20', intervalDays: 10, priority: 'normal', notes: '', amountMl: null, remindersEnabled: true });
    await repos.watering.log(p.id, '2026-05-12', null);
    expect((await repos.tasks.get(t.id))?.nextDue).toBe('2026-05-22');
  });

  it('records other tasks in care history; one-off tasks become inactive', async () => {
    const { repos } = await setup();
    const p = await repos.plants.create(plantInput());
    const t = await repos.tasks.create({ plantId: p.id, type: 'repotting', nextDue: '2026-05-10', intervalDays: null, priority: 'high', notes: '', amountMl: null, remindersEnabled: true });
    await repos.tasks.complete(t.id, '2026-05-10');
    expect((await repos.tasks.get(t.id))?.active).toBe(false);
    expect((await repos.history.forPlant(p.id))[0]).toMatchObject({ type: 'repotting', action: 'done' });
  });

  it('postpone and skip are recorded in history', async () => {
    const { repos } = await setup();
    const p = await repos.plants.create(plantInput());
    const t = await repos.tasks.create({ plantId: p.id, type: 'fertilizing', nextDue: '2026-05-10', intervalDays: 14, priority: 'normal', notes: '', amountMl: null, remindersEnabled: true });
    await repos.tasks.postpone(t.id, 2, '2026-05-10');
    expect((await repos.tasks.get(t.id))?.nextDue).toBe('2026-05-12');
    await repos.tasks.skip(t.id, '2026-05-12');
    expect((await repos.tasks.get(t.id))?.nextDue).toBe('2026-05-26');
    expect((await repos.history.forPlant(p.id)).map((h) => h.action).sort()).toEqual(['postponed', 'skipped']);
  });
});

describe('growth, journal, health, fertilizer, soil, wishlist', () => {
  it('stores growth records chronologically', async () => {
    const { repos } = await setup();
    const p = await repos.plants.create(plantInput());
    await repos.growth.create({ plantId: p.id, date: '2026-05-05', heightCm: 42.5, leafCount: null, condition: 'thriving', photoPath: null, notes: '' });
    await repos.growth.create({ plantId: p.id, date: '2026-04-01', heightCm: 40, leafCount: 7, condition: 'good', photoPath: null, notes: '' });
    expect((await repos.growth.forPlant(p.id)).map((g) => g.heightCm)).toEqual([40, 42.5]);
    expect(await repos.growth.countForPlant(p.id)).toBe(2);
  });

  it('tracks health actions and resolution', async () => {
    const { repos } = await setup();
    const p = await repos.plants.create(plantInput());
    const h = await repos.health.create({ plantId: p.id, category: 'yellow_leaves', description: 'Lower leaves', observedOn: '2026-05-01', status: 'open', actions: [], photoPaths: [], notes: '', resolvedOn: null });
    await repos.health.addAction(h.id, '2026-05-02', 'Let soil dry out');
    await repos.health.update(h.id, { status: 'resolved', resolvedOn: '2026-05-09' });
    const r = await repos.health.get(h.id);
    expect(r?.actions).toEqual([{ date: '2026-05-02', text: 'Let soil dry out' }]);
    expect(await repos.health.open()).toHaveLength(0);
  });

  it('stores fertilizer and soil history without inventing doses', async () => {
    const { repos } = await setup();
    const p = await repos.plants.create(plantInput());
    await repos.fertilizer.create({ plantId: p.id, fertilizerType: 'liquid', brand: 'Brand', composition: 'NPK 3-1-2', appliedOn: '2026-05-01', quantity: 'per label', notes: '' });
    await repos.soil.create({ plantId: p.id, substrate: 'aroid_mix', potSizeCm: 21, repottedOn: '2026-04-01', notes: '' });
    expect((await repos.fertilizer.forPlant(p.id))[0]?.quantity).toBe('per label');
    expect((await repos.soil.forPlant(p.id))[0]?.potSizeCm).toBe(21);
  });

  it('orders the wishlist by status then priority', async () => {
    const { repos } = await setup();
    await repos.wishlist.create({ name: 'Bought', speciesId: null, photoPath: null, description: '', estimatedPrice: 12.5, store: '', priority: 'high', notes: '', status: 'purchased' });
    await repos.wishlist.create({ name: 'Low', speciesId: null, photoPath: null, description: '', estimatedPrice: null, store: '', priority: 'low', notes: '', status: 'wishlist' });
    await repos.wishlist.create({ name: 'High', speciesId: 'ficus-lyrata', photoPath: null, description: '', estimatedPrice: null, store: 'Nursery', priority: 'high', notes: '', status: 'wishlist' });
    expect((await repos.wishlist.list()).map((w) => w.name)).toEqual(['High', 'Low', 'Bought']);
  });
});

describe('seasonal checklists', () => {
  it('seeds built-ins once, supports custom items and per-season completion', async () => {
    const { db, repos } = await setup();
    await initDatabase(db, NOW);
    const spring = await repos.seasonal.list('spring');
    expect(spring.length).toBe(6);
    const custom = await repos.seasonal.add('spring', '  Sow tomatoes ');
    expect(custom.title).toBe('Sow tomatoes');
    expect(await repos.seasonal.toggle(custom.id, '2026-spring', '2026-04-01')).toBe(true);
    expect(await repos.seasonal.completions('2026-spring')).toHaveLength(1);
    expect(await repos.seasonal.completions('2027-spring')).toHaveLength(0);
    expect(await repos.seasonal.toggle(custom.id, '2026-spring', '2026-04-02')).toBe(false);
  });
});

describe('notification settings', () => {
  it('upserts global and per-plant settings', async () => {
    const { repos } = await setup();
    const p = await repos.plants.create(plantInput());
    await repos.notifications.set(null, 'pruning', false);
    await repos.notifications.set(p.id, 'watering', false);
    await repos.notifications.set(p.id, 'watering', true);
    const all = await repos.notifications.all();
    expect(all).toHaveLength(2);
    expect(all.find((s) => s.plantId === p.id)?.enabled).toBe(true);
  });
});

describe('backup, restore and wipe', () => {
  it('round-trips every user table and keeps the library', async () => {
    const a = await setup();
    const loc = await a.repos.locations.create({ name: 'Kitchen', type: 'kitchen', description: '', photoPath: null });
    const p = await a.repos.plants.create(plantInput({ locationId: loc.id }));
    const t = await a.repos.tasks.create({ plantId: p.id, type: 'watering', nextDue: '2026-05-10', intervalDays: 7, priority: 'normal', notes: '', amountMl: null, remindersEnabled: true });
    await a.repos.tasks.complete(t.id, '2026-05-10');
    await a.repos.health.create({ plantId: p.id, category: 'pests', description: '', observedOn: '2026-05-01', status: 'open', actions: [{ date: '2026-05-01', text: 'Isolated' }], photoPaths: [], notes: '', resolvedOn: null });
    const backup = JSON.stringify(await backupUserData(a.db, NOW()));

    const b = await setup();
    await b.repos.plants.create(plantInput({ nickname: 'will be replaced' }));
    const { restoredRows } = await restoreUserData(b.db, backup);
    expect(restoredRows).toBeGreaterThan(4);
    const plants = await b.repos.plants.list();
    expect(plants.map((x) => x.nickname)).toEqual(['Monty']);
    expect(plants[0]?.locationId).toBe(loc.id);
    expect(await b.repos.watering.forPlant(p.id)).toHaveLength(1);
    expect((await b.repos.health.forPlant(p.id))[0]?.actions).toHaveLength(1);
  });

  it('rejects backups from another app or a newer schema', async () => {
    const { db } = await setup();
    await expect(restoreUserData(db, '{"format":"factory-backup","formatVersion":1,"appId":"petcare","schemaVersion":1,"tables":{}}')).rejects.toThrow('wrong_app');
    await expect(restoreUserData(db, '{"format":"factory-backup","formatVersion":1,"appId":"plantcare","schemaVersion":99,"tables":{}}')).rejects.toThrow('newer_schema');
    await expect(restoreUserData(db, 'not json')).rejects.toThrow('invalid_json');
  });

  it('wipe removes user data, keeps the library and re-seeds checklists on next init', async () => {
    const { db, repos } = await setup();
    await repos.plants.create(plantInput());
    await wipeUserData(db);
    expect(await repos.plants.count()).toBe(0);
    const n = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM plant_species', []);
    expect(n?.n).toBe(SPECIES.length);
    const again = await initDatabase(db, NOW);
    expect((await again.seasonal.list('winter')).length).toBe(6);
  });
});
