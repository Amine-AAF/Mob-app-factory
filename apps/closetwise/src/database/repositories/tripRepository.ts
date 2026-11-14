import type { SqlDatabase } from '@factory/storage';

import { defaultSlotFor, type PackingSection, type TripTemplate } from '@/domain/catalog';
import { newId } from '@/domain/ids';
import { isValidTripDates, TEMPLATE_ENTRIES } from '@/domain/packing';
import type { DayKey, PackingEntry, Trip } from '@/domain/types';

import { bool, clean, nowIso, type Row } from './helpers';

const toTrip = (r: Row): Trip => ({
  id: String(r.id),
  destination: String(r.destination),
  departureDate: String(r.departure_date),
  returnDate: String(r.return_date),
  template: (r.template as TripTemplate | null) ?? null,
  notes: (r.notes as string | null) ?? null,
  reminderDays: r.reminder_days == null ? null : Number(r.reminder_days),
  createdAt: String(r.created_at),
});

const toEntry = (r: Row): PackingEntry => ({
  id: String(r.id),
  tripId: String(r.trip_id),
  kind: String(r.kind) as PackingEntry['kind'],
  itemId: (r.item_id as string | null) ?? null,
  outfitId: (r.outfit_id as string | null) ?? null,
  label: (r.label as string | null) ?? null,
  section: String(r.section) as PackingSection,
  packed: bool(r.packed),
  position: Number(r.position),
});

export type TripInput = Omit<Trip, 'id' | 'createdAt'>;

/** Packing section for a wardrobe item, from its category key. */
export function sectionForCategory(categoryKey: string): PackingSection {
  const slot = defaultSlotFor(categoryKey);
  if (slot === 'shoes') return 'shoes';
  if (slot === 'bag' || slot === 'accessory') return 'accessories';
  return 'clothes';
}

export function createTripRepository(db: SqlDatabase) {
  async function nextPosition(tripId: string): Promise<number> {
    const r = await db.getFirstAsync<{ p: number | null }>('SELECT MAX(position) AS p FROM packing_lists WHERE trip_id = ?', [tripId]);
    return (r?.p ?? -1) + 1;
  }

  async function addEntry(tripId: string, e: Omit<PackingEntry, 'id' | 'tripId' | 'position' | 'packed'>): Promise<boolean> {
    const r = await db.runAsync(
      'INSERT OR IGNORE INTO packing_lists (id, trip_id, kind, item_id, outfit_id, label, section, packed, position, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)',
      [newId('pck'), tripId, e.kind, e.itemId, e.outfitId, clean(e.label), e.section, await nextPosition(tripId), nowIso()],
    );
    return r.changes > 0;
  }

  const repo = {
    async list(): Promise<Trip[]> {
      return (await db.getAllAsync<Row>('SELECT * FROM trips ORDER BY departure_date DESC', [])).map(toTrip);
    },
    async get(id: string): Promise<Trip | null> {
      const r = await db.getFirstAsync<Row>('SELECT * FROM trips WHERE id = ?', [id]);
      return r ? toTrip(r) : null;
    },
    async activeCount(today: DayKey): Promise<number> {
      return (await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM trips WHERE return_date >= ?', [today]))?.n ?? 0;
    },
    async save(input: TripInput, id?: string): Promise<string> {
      const destination = clean(input.destination);
      if (!destination) throw new Error('destination_required');
      if (!isValidTripDates(input.departureDate, input.returnDate)) throw new Error('invalid_dates');
      const now = nowIso();
      const v = [destination, input.departureDate, input.returnDate, input.template, clean(input.notes), input.reminderDays];
      if (id) {
        await db.runAsync('UPDATE trips SET destination = ?, departure_date = ?, return_date = ?, template = ?, notes = ?, reminder_days = ?, updated_at = ? WHERE id = ?', [...v, now, id]);
        return id;
      }
      const nid = newId('trp');
      await db.runAsync('INSERT INTO trips (destination, departure_date, return_date, template, notes, reminder_days, id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [
        ...v,
        nid,
        now,
        now,
      ]);
      return nid;
    },
    async remove(id: string): Promise<void> {
      await db.runAsync('DELETE FROM trips WHERE id = ?', [id]);
    },

    async entries(tripId: string): Promise<PackingEntry[]> {
      return (await db.getAllAsync<Row>('SELECT * FROM packing_lists WHERE trip_id = ? ORDER BY position', [tripId])).map(toEntry);
    },

    /** Adds the template's generic entries (labels are i18n keys, prefixed "tpl:"). Skips ones already there. */
    async applyTemplate(tripId: string, template: TripTemplate): Promise<number> {
      const existing = new Set((await repo.entries(tripId)).map((e) => e.label));
      let added = 0;
      await db.withTransactionAsync(async () => {
        for (const e of TEMPLATE_ENTRIES[template]) {
          const label = `tpl:${e.key}`;
          if (existing.has(label)) continue;
          if (await addEntry(tripId, { kind: 'custom', itemId: null, outfitId: null, label, section: e.section })) added++;
        }
      });
      return added;
    },

    async addCustom(tripId: string, label: string, section: PackingSection): Promise<void> {
      if (!clean(label)) throw new Error('label_required');
      await addEntry(tripId, { kind: 'custom', itemId: null, outfitId: null, label, section });
    },

    /** Adds wardrobe items (deduplicated by the unique index). */
    async addItems(tripId: string, items: readonly { id: string; categoryKey: string }[]): Promise<number> {
      let added = 0;
      await db.withTransactionAsync(async () => {
        for (const it of items) {
          if (await addEntry(tripId, { kind: 'item', itemId: it.id, outfitId: null, label: null, section: sectionForCategory(it.categoryKey) })) added++;
        }
      });
      return added;
    },

    /** Adds an outfit line plus each of its items so none is forgotten. */
    async addOutfit(tripId: string, outfitId: string, items: readonly { id: string; categoryKey: string }[]): Promise<number> {
      let added = 0;
      await db.withTransactionAsync(async () => {
        await addEntry(tripId, { kind: 'outfit', itemId: null, outfitId, label: null, section: 'other' });
        added = await repo.addItems(tripId, items);
      });
      return added;
    },

    async setPacked(entryId: string, packed: boolean): Promise<void> {
      await db.runAsync('UPDATE packing_lists SET packed = ? WHERE id = ?', [packed ? 1 : 0, entryId]);
    },

    async setAllPacked(tripId: string, packed: boolean): Promise<void> {
      await db.runAsync('UPDATE packing_lists SET packed = ? WHERE trip_id = ?', [packed ? 1 : 0, tripId]);
    },

    async removeEntry(entryId: string): Promise<void> {
      await db.runAsync('DELETE FROM packing_lists WHERE id = ?', [entryId]);
    },
  };
  return repo;
}
