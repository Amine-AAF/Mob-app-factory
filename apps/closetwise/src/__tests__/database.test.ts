import { createTestDatabase } from '@factory/testing';

import { initDatabase } from '@/database';
import { SCHEMA_VERSION } from '@/database/migrations';
import { CATEGORY_KEYS, OCCASION_KEYS, STYLE_KEYS } from '@/domain/catalog';
import { clock } from '@/services/clock';

import { freshRepos, itemInput } from './helpers';

beforeEach(() => clock.set(() => new Date('2026-11-13T10:00:00')));
afterAll(() => clock.set(null));

describe('schema & migrations', () => {
  it('migrates to the latest version and seeds the built-in taxonomy', async () => {
    const db = await createTestDatabase();
    const r = await initDatabase(db);
    expect((await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version', []))?.user_version).toBe(SCHEMA_VERSION);
    expect((await r.taxonomy.categories()).map((c) => c.key)).toEqual([...CATEGORY_KEYS]);
    expect((await r.taxonomy.tags('styles')).map((s) => s.key)).toEqual([...STYLE_KEYS]);
    expect((await r.taxonomy.tags('occasions')).map((s) => s.key)).toEqual([...OCCASION_KEYS]);
    expect(await r.settings.notifications()).toHaveLength(5);
  });

  it('is idempotent', async () => {
    const db = await createTestDatabase();
    await initDatabase(db);
    const r = await initDatabase(db);
    expect(await r.taxonomy.categories()).toHaveLength(CATEGORY_KEYS.length);
  });

  it('never stores image data in SQLite: only relative paths', async () => {
    const db = await createTestDatabase();
    await initDatabase(db);
    const cols = await db.getAllAsync<{ name: string; type: string }>('PRAGMA table_info(wardrobe_items)', []);
    expect(cols.some((c) => c.type.toUpperCase() === 'BLOB')).toBe(false);
    expect(cols.map((c) => c.name)).toEqual(expect.arrayContaining(['photo_path', 'thumb_path']));
  });
});

describe('wardrobe repository', () => {
  it('creates, reads, updates and deletes an item with brand and occasions', async () => {
    const r = await freshRepos();
    const id = await r.wardrobe.create(itemInput({ brandName: ' Uniqlo ', occasionIds: ['occ_work', 'occ_daily'], purchasePrice: 29.9, currency: 'EUR' }));
    let item = await r.wardrobe.get(id);
    expect(item).toMatchObject({ name: 'White shirt', brandName: 'Uniqlo', occasionIds: ['occ_daily', 'occ_work'], purchasePrice: 29.9, currency: 'EUR', wearCount: 0 });

    await r.wardrobe.update(id, itemInput({ name: 'Oxford shirt', brandName: 'uniqlo', occasionIds: ['occ_work'] }));
    item = await r.wardrobe.get(id);
    expect(item).toMatchObject({ name: 'Oxford shirt', brandName: 'Uniqlo', occasionIds: ['occ_work'] });
    expect(await r.taxonomy.brands()).toHaveLength(1); // case-insensitive brand reuse

    await r.wardrobe.remove(id);
    expect(await r.wardrobe.get(id)).toBeNull();
    expect(await r.taxonomy.brands()).toHaveLength(0); // unused brand pruned
  });

  it('requires a name and rejects negative prices', async () => {
    const r = await freshRepos();
    await expect(r.wardrobe.create(itemInput({ name: '  ' }))).rejects.toThrow('name_required');
    await expect(r.wardrobe.create(itemInput({ purchasePrice: -1 }))).rejects.toThrow();
  });

  it('archives without deleting and counts only active items', async () => {
    const r = await freshRepos();
    const a = await r.wardrobe.create(itemInput());
    await r.wardrobe.create(itemInput({ name: 'Jeans', categoryId: 'cat_jeans' }));
    await r.wardrobe.setArchived(a, true);
    expect(await r.wardrobe.count()).toBe(1);
    expect(await r.wardrobe.count(true)).toBe(2);
    expect((await r.wardrobe.list({ archived: true })).map((i) => i.id)).toEqual([a]);
  });

  it('updates care status in bulk', async () => {
    const r = await freshRepos();
    const a = await r.wardrobe.create(itemInput());
    const b = await r.wardrobe.create(itemInput({ name: 'Tee', categoryId: 'cat_tshirts' }));
    await r.wardrobe.setCareStatus([a, b], 'in_laundry');
    expect((await r.wardrobe.list()).every((i) => i.careStatus === 'in_laundry')).toBe(true);
  });
});

describe('outfits, planning and usage', () => {
  async function setup() {
    const r = await freshRepos();
    const top = await r.wardrobe.create(itemInput());
    const bottom = await r.wardrobe.create(itemInput({ name: 'Jeans', categoryId: 'cat_jeans', primaryColor: 'denim' }));
    const outfit = await r.outfits.create({
      name: 'Office',
      styleId: 'sty_smart_casual',
      occasionId: 'occ_work',
      seasons: 0,
      notes: null,
      favorite: false,
      source: 'manual',
      items: [
        { itemId: top, slot: 'top', position: 0 },
        { itemId: bottom, slot: 'bottom', position: 1 },
        { itemId: top, slot: 'top', position: 2 },
      ],
    });
    return { r, top, bottom, outfit };
  }

  it('saves outfits without duplicate items and duplicates them', async () => {
    const { r, outfit } = await setup();
    expect((await r.outfits.get(outfit))?.items).toHaveLength(2);
    const copy = await r.outfits.duplicate(outfit, 'Office (copy)');
    expect((await r.outfits.get(copy!))?.items).toHaveLength(2);
    expect(await r.outfits.count()).toBe(2);
  });

  it('marks a planned outfit as worn once and counts wears per item', async () => {
    const { r, top, outfit } = await setup();
    const sid = await r.schedules.save({ date: '2026-11-13', outfitId: outfit, occasionId: null, notes: 'Client', remind: true });
    expect(await r.schedules.markWorn(sid)).toBe(true);
    expect(await r.schedules.markWorn(sid)).toBe(false);
    expect((await r.wardrobe.get(top))?.wearCount).toBe(1);
    expect((await r.outfits.get(outfit))?.wearCount).toBe(1);
    // Logging the same item on the same day again does not double count.
    await r.usage.logWear([top], '2026-11-13');
    expect((await r.wardrobe.get(top))?.wearCount).toBe(1);
    await r.schedules.unmarkWorn(sid);
    expect((await r.wardrobe.get(top))?.wearCount).toBe(0);
    // Undoing the wear from the outfit itself also clears the plan's "worn" flag.
    await r.schedules.markWorn(sid);
    await r.usage.removeOutfitWear(outfit, '2026-11-13');
    expect((await r.schedules.get(sid))?.wornLogged).toBe(false);
  });

  it('deleting an item cascades to outfit links and usage; empty outfits can be pruned', async () => {
    const { r, top, bottom, outfit } = await setup();
    await r.usage.logWear([top], '2026-11-10');
    await r.wardrobe.remove(top);
    expect((await r.outfits.get(outfit))?.items.map((i) => i.itemId)).toEqual([bottom]);
    expect(await r.usage.list()).toHaveLength(0);
    await r.wardrobe.remove(bottom);
    expect(await r.outfits.removeEmpty()).toBe(1);
  });

  it('duplicates a week of plans without overwriting existing ones', async () => {
    const { r, outfit } = await setup();
    await r.schedules.save({ date: '2026-11-09', outfitId: outfit, occasionId: null, notes: null, remind: false }); // Monday
    await r.schedules.save({ date: '2026-11-11', outfitId: outfit, occasionId: null, notes: null, remind: false });
    await r.schedules.save({ date: '2026-11-18', outfitId: null, occasionId: 'occ_party', notes: 'Keep', remind: false });
    expect(await r.schedules.duplicateWeek('2026-11-12', '2026-11-16')).toBe(1);
    const next = await r.schedules.range('2026-11-16', '2026-11-22');
    expect(next.map((s) => s.date)).toEqual(['2026-11-16', '2026-11-18']);
    expect(next.find((s) => s.date === '2026-11-18')?.notes).toBe('Keep');
  });
});

describe('shopping, wishlist, trips, care, goals, settings', () => {
  it('stores shopping records and wishlist items with safe URLs', async () => {
    const r = await freshRepos();
    await r.shopping.save({ itemName: 'Coat', itemId: null, brand: 'COS', categoryId: 'cat_coats', purchasedOn: '2026-11-02', price: 190, currency: 'EUR', store: null, size: 'M', notes: null, receiptPath: null });
    expect(await r.shopping.list()).toHaveLength(1);
    await expect(r.shopping.save({ itemName: 'X', itemId: null, brand: null, categoryId: null, purchasedOn: '2026-11-02', price: -5, currency: 'EUR', store: null, size: null, notes: null, receiptPath: null })).rejects.toThrow();

    const base = { photoPath: null, thumbPath: null, brand: null, categoryId: null, estimatedPrice: 80, currency: 'USD', store: null, priority: 1 as const, notes: null, status: 'wanted' as const };
    const w1 = await r.wishlist.save({ ...base, name: 'Loafers', url: 'shop.example.com/loafers' });
    const w2 = await r.wishlist.save({ ...base, name: 'Bag', url: 'javascript:alert(1)' });
    expect((await r.wishlist.get(w1))?.url).toBe('https://shop.example.com/loafers');
    expect((await r.wishlist.get(w2))?.url).toBeNull();
    await r.wishlist.setStatus(w1, 'purchased');
    expect((await r.wishlist.list()).map((w) => w.name)).toEqual(['Bag', 'Loafers']);
  });

  it('builds a packing list from a template, items and outfits without duplicates', async () => {
    const r = await freshRepos();
    const shirt = await r.wardrobe.create(itemInput());
    const trip = await r.trips.save({ destination: 'Lisbon', departureDate: '2026-12-01', returnDate: '2026-12-04', template: 'city', notes: null, reminderDays: 2 });
    expect(await r.trips.applyTemplate(trip, 'city')).toBeGreaterThan(0);
    expect(await r.trips.applyTemplate(trip, 'city')).toBe(0);
    expect(await r.trips.addItems(trip, [{ id: shirt, categoryKey: 'shirts' }])).toBe(1);
    expect(await r.trips.addItems(trip, [{ id: shirt, categoryKey: 'shirts' }])).toBe(0);
    const entries = await r.trips.entries(trip);
    await r.trips.setPacked(entries[0]!.id, true);
    expect((await r.trips.entries(trip)).filter((e) => e.packed)).toHaveLength(1);
    await expect(r.trips.save({ destination: 'X', departureDate: '2026-12-05', returnDate: '2026-12-01', template: null, notes: null, reminderDays: null })).rejects.toThrow('invalid_dates');
    await r.trips.remove(trip);
    expect(await r.trips.entries(trip)).toHaveLength(0);
  });

  it('keeps one set of care instructions per item, plus a care history', async () => {
    const r = await freshRepos();
    const id = await r.wardrobe.create(itemInput());
    await r.care.saveInstructions(id, { washMethod: 'machine', washTemperature: 30, drying: 'line_dry', ironing: 'low', bleach: false, notes: null }, '2026-11-13');
    await r.care.saveInstructions(id, { washMethod: 'hand', washTemperature: 30, drying: 'flat_dry', ironing: null, bleach: null, notes: 'Wool' }, '2026-11-13');
    expect(await r.care.instructions(id)).toMatchObject({ washMethod: 'hand', drying: 'flat_dry', notes: 'Wool' });
    await expect(r.care.saveInstructions(id, { washMethod: 'machine', washTemperature: 120, drying: null, ironing: null, bleach: null, notes: null }, '2026-11-13')).rejects.toThrow();
    await r.care.log(id, 'washed', '2026-11-12');
    expect(await r.care.history(id)).toHaveLength(1);
  });

  it('persists goals, settings, notification settings and suggestion feedback', async () => {
    const r = await freshRepos();
    const g = await r.goals.save({ kind: 'challenge_7x7', title: null, target: 7, startDate: '2026-11-10', endDate: '2026-11-16', status: 'active', payload: {} });
    await r.goals.setStatus(g, 'completed');
    expect((await r.goals.get(g))?.status).toBe('completed');
    await r.settings.set({ currency: 'EUR', monthlyBudget: 150 });
    expect(await r.settings.get()).toMatchObject({ currency: 'EUR', monthlyBudget: 150, hemisphere: 'north' });
    await r.settings.setNotification('planned_outfit', { enabled: true, hour: 8 });
    expect((await r.settings.notifications()).find((n) => n.kind === 'planned_outfit')).toMatchObject({ enabled: true, hour: 8, minute: 30 });
    await r.settings.rate('a+b', -1, 'casual');
    expect((await r.settings.feedback()).get('a+b')).toBe(-1);
  });

  it('adds custom styles and occasions without duplicates', async () => {
    const r = await freshRepos();
    const a = await r.taxonomy.addTag('styles', 'Boho');
    const b = await r.taxonomy.addTag('styles', 'boho');
    expect(a.id).toBe(b.id);
    await r.taxonomy.setTagArchived('styles', a.id, true);
    expect((await r.taxonomy.tags('styles')).some((s) => s.id === a.id)).toBe(false);
    expect((await r.taxonomy.tags('styles', true)).some((s) => s.id === a.id)).toBe(true);
  });
});
