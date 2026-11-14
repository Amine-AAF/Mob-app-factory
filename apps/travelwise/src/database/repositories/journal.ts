import { fromJson, toJson, type SqlDatabase } from '@factory/storage';

import type { Id, JournalEntry, LocalDate } from '@/types/models';
import { clock } from '@/utils/clock';
import { isValidDate } from '@/utils/dates';
import { createId } from '@/utils/ids';

export type JournalValidationCode = 'empty_entry' | 'invalid_date' | 'too_many_photos' | 'not_found';

export class JournalValidationError extends Error {
  constructor(public readonly code: JournalValidationCode) {
    super(`Invalid journal entry: ${code}`);
    this.name = 'JournalValidationError';
  }
}

export const MAX_PHOTOS_PER_ENTRY = 12;

interface EntryRow {
  id: string;
  trip_id: string;
  date: string;
  city: string;
  title: string;
  body: string;
  notes: string;
  photo_uris: string;
  created_at: string;
  updated_at: string;
}

const toEntry = (r: EntryRow): JournalEntry => ({
  id: r.id,
  tripId: r.trip_id,
  date: r.date,
  city: r.city,
  title: r.title,
  body: r.body,
  notes: r.notes,
  photoUris: fromJson<string[]>(r.photo_uris, []),
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export interface JournalInput {
  date: LocalDate;
  city?: string;
  title?: string;
  body?: string;
  notes?: string;
  photoUris?: string[];
}

function normalize(input: JournalInput) {
  if (!isValidDate(input.date)) throw new JournalValidationError('invalid_date');
  const photos = [...new Set(input.photoUris ?? [])];
  if (photos.length > MAX_PHOTOS_PER_ENTRY) throw new JournalValidationError('too_many_photos');
  const e = { date: input.date, city: input.city?.trim() ?? '', title: input.title?.trim() ?? '', body: input.body?.trim() ?? '', notes: input.notes?.trim() ?? '', photos };
  if (!e.title && !e.body && !e.notes && !photos.length) throw new JournalValidationError('empty_entry');
  return e;
}

export function createJournalRepository(db: SqlDatabase) {
  const repo = {
    /** Chronological timeline of a trip's memories (oldest first, then creation order). */
    async list(tripId: Id): Promise<JournalEntry[]> {
      const rows = await db.getAllAsync<EntryRow>('SELECT * FROM journal_entries WHERE trip_id = ? ORDER BY date, created_at', [tripId]);
      return rows.map(toEntry);
    },

    async get(id: Id): Promise<JournalEntry | null> {
      const r = await db.getFirstAsync<EntryRow>('SELECT * FROM journal_entries WHERE id = ?', [id]);
      return r ? toEntry(r) : null;
    },

    async create(tripId: Id, input: JournalInput): Promise<JournalEntry> {
      const e = normalize(input);
      const id = createId();
      const now = clock.instant();
      await db.runAsync('INSERT INTO journal_entries (id, trip_id, date, city, title, body, notes, photo_uris, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
        id,
        tripId,
        e.date,
        e.city,
        e.title,
        e.body,
        e.notes,
        toJson(e.photos),
        now,
        now,
      ]);
      return (await repo.get(id))!;
    },

    /** Updates an entry; returns the photos that were removed so their files can be deleted. */
    async update(id: Id, input: JournalInput): Promise<{ entry: JournalEntry; removedPhotos: string[] }> {
      const before = await repo.get(id);
      if (!before) throw new JournalValidationError('not_found');
      const e = normalize(input);
      await db.runAsync('UPDATE journal_entries SET date = ?, city = ?, title = ?, body = ?, notes = ?, photo_uris = ?, updated_at = ? WHERE id = ?', [
        e.date,
        e.city,
        e.title,
        e.body,
        e.notes,
        toJson(e.photos),
        clock.instant(),
        id,
      ]);
      return { entry: (await repo.get(id))!, removedPhotos: before.photoUris.filter((u) => !e.photos.includes(u)) };
    },

    /** Deletes an entry and returns its photos for file clean-up. */
    async remove(id: Id): Promise<string[]> {
      const e = await repo.get(id);
      if (!e) return [];
      await db.runAsync('DELETE FROM journal_entries WHERE id = ?', [id]);
      return e.photoUris;
    },
  };
  return repo;
}

export type JournalRepository = ReturnType<typeof createJournalRepository>;
