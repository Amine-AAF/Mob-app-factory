import { parseBackup } from '@factory/storage';

import manifest from '../../app.manifest.json';
import { displayPath, findOrphans, fitWithin, isSafeRelativePath, PHOTO_MAX, PhotoError, processAndStore, removeOrphans, THUMB_MAX, type ImageProcessor, type PhotoStore } from '@/services/photos/pipeline';
import { buildBackup, itemsToCsv, referencedPaths, restoreFromText, wipeAllData, type PhotoIO } from '@/services/backupCore';
import { clock } from '@/services/clock';

import { freshRepos, itemInput } from './helpers';

function memoryStore(): PhotoStore & { files: Map<string, string>; discarded: string[] } {
  const files = new Map<string, string>();
  const discarded: string[] = [];
  return {
    files,
    discarded,
    async put(temp, rel) {
      files.set(rel, temp);
    },
    exists: (rel) => files.has(rel),
    remove: (rel) => void files.delete(rel),
    list: (area) => [...files.keys()].filter((k) => k.startsWith(`${area}/`)),
    discard: (uri) => void discarded.push(uri),
  };
}

function fakeProcessor(): ImageProcessor & { calls: { uri: string; size: { width: number; height: number } | null; quality: number }[] } {
  const calls: { uri: string; size: { width: number; height: number } | null; quality: number }[] = [];
  let n = 0;
  return {
    calls,
    async toJpeg(uri, size, quality) {
      calls.push({ uri, size, quality });
      return { uri: `tmp://${++n}.jpg`, width: size?.width ?? 1200, height: size?.height ?? 1600 };
    },
  };
}

describe('photo pipeline', () => {
  it('computes downscaled sizes, keeping aspect ratio and small images untouched', () => {
    expect(fitWithin(4000, 3000, PHOTO_MAX)).toEqual({ width: 1600, height: 1200 });
    expect(fitWithin(3000, 4000, THUMB_MAX)).toEqual({ width: 270, height: 360 });
    expect(fitWithin(800, 600, PHOTO_MAX)).toBeNull();
    expect(fitWithin(0, 0, PHOTO_MAX)).toBeNull();
  });

  it('compresses a large photo, generates a thumbnail and stores both with relative paths', async () => {
    const store = memoryStore();
    const proc = fakeProcessor();
    const res = await processAndStore({ uri: 'content://picker/1', width: 4032, height: 3024 }, 'itm_abc', { processor: proc, store });
    expect(res).toEqual({ photoPath: 'photos/itm_abc.jpg', thumbPath: 'thumbs/itm_abc.jpg' });
    expect(proc.calls[0]).toMatchObject({ size: { width: 1600, height: 1200 }, quality: 0.8 });
    expect(proc.calls[proc.calls.length - 1]?.quality).toBe(0.7);
    expect([...store.files.keys()].sort()).toEqual(['photos/itm_abc.jpg', 'thumbs/itm_abc.jpg']);
    expect(store.discarded.length).toBeGreaterThanOrEqual(2); // temporary files cleaned
  });

  it('resizes again when the picker did not report dimensions', async () => {
    const store = memoryStore();
    const proc: ImageProcessor = { toJpeg: async (_u, size) => ({ uri: 'tmp', width: size?.width ?? 6000, height: size?.height ?? 4000 }) };
    const spy = jest.spyOn(proc, 'toJpeg');
    await processAndStore({ uri: 'file:///x.jpg' }, 'p1', { processor: proc, store });
    expect(spy.mock.calls[1]?.[1]).toEqual({ width: 1600, height: 1067 });
  });

  it('cleans up and reports a clear error when processing or storage fails', async () => {
    const store = memoryStore();
    await expect(processAndStore({ uri: 'x' }, 'p', { processor: { toJpeg: async () => Promise.reject(new Error('decode')) }, store })).rejects.toEqual(new PhotoError('processing_failed'));
    const failing = { ...memoryStore(), put: async () => Promise.reject(new Error('disk full')) };
    await expect(processAndStore({ uri: 'x' }, 'p', { processor: fakeProcessor(), store: failing })).rejects.toEqual(new PhotoError('storage_failed'));
    expect(failing.files.size).toBe(0);
    await expect(processAndStore({ uri: '' }, 'p', { processor: fakeProcessor(), store })).rejects.toEqual(new PhotoError('invalid_source'));
    await expect(processAndStore({ uri: 'x' }, '../evil', { processor: fakeProcessor(), store })).rejects.toEqual(new PhotoError('invalid_source'));
  });

  it('only accepts its own relative paths (no traversal, no absolute URIs)', () => {
    expect(isSafeRelativePath('photos/itm_1.jpg')).toBe(true);
    expect(isSafeRelativePath('thumbs/a-b_c.jpg')).toBe(true);
    for (const bad of ['../photos/a.jpg', 'photos/../../x.jpg', 'file:///data/a.jpg', 'content://media/1', 'other/a.jpg', '', null]) expect(isSafeRelativePath(bad as string)).toBe(false);
  });

  it('falls back between thumbnail and photo, and to a placeholder when files were deleted', () => {
    const paths = { photoPath: 'photos/a.jpg', thumbPath: 'thumbs/a.jpg' };
    expect(displayPath(paths, 'thumb', () => true)).toBe('thumbs/a.jpg');
    expect(displayPath(paths, 'thumb', (p) => p.startsWith('photos'))).toBe('photos/a.jpg');
    expect(displayPath(paths, 'full', () => false)).toBeNull();
  });

  it('removes orphan files no row references', () => {
    const store = memoryStore();
    ['photos/a.jpg', 'thumbs/a.jpg', 'photos/old.jpg', 'thumbs/old.jpg'].forEach((p) => store.files.set(p, 'x'));
    expect(findOrphans(store, ['photos/a.jpg', 'thumbs/a.jpg', null]).sort()).toEqual(['photos/old.jpg', 'thumbs/old.jpg']);
    expect(removeOrphans(store, ['photos/a.jpg', 'thumbs/a.jpg'])).toBe(2);
    expect([...store.files.keys()].sort()).toEqual(['photos/a.jpg', 'thumbs/a.jpg']);
  });
});

describe('backup, restore and delete', () => {
  beforeEach(() => clock.set(() => new Date('2026-11-13T10:00:00')));
  afterAll(() => clock.set(null));

  function memoryPhotoIO(initial: Record<string, string>): PhotoIO & { files: Map<string, string> } {
    const files = new Map(Object.entries(initial));
    return {
      files,
      read: async (paths) => Object.fromEntries(paths.filter((p) => files.has(p)).map((p) => [p, files.get(p)!])),
      write: async (photos) => {
        let n = 0;
        for (const [k, v] of Object.entries(photos)) {
          if (isSafeRelativePath(k) && typeof v === 'string') {
            files.set(k, v);
            n++;
          }
        }
        return n;
      },
      cleanup: (referenced) => {
        let n = 0;
        for (const k of [...files.keys()]) {
          if (!referenced.includes(k)) {
            files.delete(k);
            n++;
          }
        }
        return n;
      },
    };
  }

  async function seeded() {
    const r = await freshRepos();
    const style = await r.taxonomy.addTag('styles', 'Boho');
    const top = await r.wardrobe.create(itemInput({ photoPath: 'photos/a.jpg', thumbPath: 'thumbs/a.jpg', styleId: style.id, occasionIds: ['occ_work'], brandName: 'COS', purchasePrice: 80, currency: 'EUR' }));
    const bottom = await r.wardrobe.create(itemInput({ name: 'Jeans', categoryId: 'cat_jeans' }));
    const outfit = await r.outfits.create({ name: 'Look', styleId: null, occasionId: null, seasons: 0, notes: null, favorite: true, source: 'manual', items: [{ itemId: top, slot: 'top', position: 0 }, { itemId: bottom, slot: 'bottom', position: 1 }] });
    await r.schedules.save({ date: '2026-11-14', outfitId: outfit, occasionId: null, notes: null, remind: true });
    await r.usage.logOutfitWear(outfit, '2026-11-12');
    const trip = await r.trips.save({ destination: 'Rome', departureDate: '2026-12-01', returnDate: '2026-12-03', template: 'city', notes: null, reminderDays: 1 });
    await r.trips.addOutfit(trip, outfit, [{ id: top, categoryKey: 'shirts' }, { id: bottom, categoryKey: 'jeans' }]);
    await r.settings.set({ currency: 'EUR', monthlyBudget: 120 });
    return { r, top, outfit };
  }

  it('round-trips every user table and photos through a backup file', async () => {
    const { r, top } = await seeded();
    const io = memoryPhotoIO({ 'photos/a.jpg': 'AAA', 'thumbs/a.jpg': 'BBB', 'photos/orphan.jpg': 'ZZZ' });
    const backup = await buildBackup(r, { includePhotos: true, photos: io });
    expect(backup.photos).toEqual({ 'photos/a.jpg': 'AAA', 'thumbs/a.jpg': 'BBB' });
    const text = JSON.stringify(backup);
    expect(parseBackup(text, manifest.id).appId).toBe('closetwise');

    const target = await freshRepos();
    const targetIO = memoryPhotoIO({ 'photos/stale.jpg': 'old' });
    const res = await restoreFromText(target, text, targetIO);
    expect(res).toMatchObject({ ok: true, photos: 2, missingPhotos: 0 });
    const item = await target.wardrobe.get(top);
    expect(item).toMatchObject({ brandName: 'COS', occasionIds: ['occ_work'], wearCount: 1, photoPath: 'photos/a.jpg' });
    expect(target.taxonomy ? (await target.taxonomy.tags('styles')).some((s) => s.name === 'Boho') : false).toBe(true);
    expect(await target.outfits.count()).toBe(1);
    expect(await target.schedules.range('2026-11-14', '2026-11-14')).toHaveLength(1);
    expect((await target.trips.list())[0]?.destination).toBe('Rome');
    expect(await target.settings.get()).toMatchObject({ currency: 'EUR', monthlyBudget: 120 });
    expect([...targetIO.files.keys()].sort()).toEqual(['photos/a.jpg', 'thumbs/a.jpg']); // stale file removed
  });

  it('restores a backup without photos and reports the missing files', async () => {
    const { r } = await seeded();
    const text = JSON.stringify(await buildBackup(r, { includePhotos: false }));
    const res = await restoreFromText(await freshRepos(), text, memoryPhotoIO({}));
    expect(res).toMatchObject({ ok: true, photos: 0, missingPhotos: 2 });
  });

  it('rejects invalid, foreign and newer-schema backups without touching data', async () => {
    const { r } = await seeded();
    expect(await restoreFromText(r, 'not json')).toEqual({ ok: false, error: 'invalid_json' });
    expect(await restoreFromText(r, JSON.stringify({ format: 'factory-backup', formatVersion: 1, appId: 'devspeak', schemaVersion: 1, tables: {} }))).toEqual({ ok: false, error: 'wrong_app' });
    expect(await restoreFromText(r, JSON.stringify({ format: 'factory-backup', formatVersion: 1, appId: 'closetwise', schemaVersion: 99, createdAt: '', tables: {} }))).toEqual({ ok: false, error: 'newer_schema' });
    expect(await r.wardrobe.count()).toBe(2);
  });

  it('deletes all user data but keeps the built-in taxonomy', async () => {
    const { r } = await seeded();
    await wipeAllData(r);
    expect(await r.wardrobe.count(true)).toBe(0);
    expect(await r.outfits.count()).toBe(0);
    expect(await referencedPaths(r)).toEqual([]);
    expect((await r.taxonomy.tags('styles')).length).toBeGreaterThan(5);
    expect(await r.settings.notifications()).toHaveLength(5);
  });

  it('exports a CSV that neutralises spreadsheet formulas', async () => {
    const { r } = await seeded();
    await r.wardrobe.create(itemInput({ name: '=HYPERLINK("x")', notes: 'a, "quoted" note' }));
    const csv = itemsToCsv(await r.wardrobe.list(), { category: (id) => id, tag: (id) => id ?? '' });
    expect(csv.split('\n')[0]).toContain('name,category');
    expect(csv).toContain(`"'=HYPERLINK(""x"")"`);
    expect(csv).toContain('"a, ""quoted"" note"');
  });
});
