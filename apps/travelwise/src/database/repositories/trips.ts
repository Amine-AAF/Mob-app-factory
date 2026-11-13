import { fromJson, placeholders, type SqlDatabase } from '@factory/storage';

import { isCurrencyCode } from '@/constants/currencies';
import { TRIP_STATUSES, TRIP_TYPES, type TripStatus, type TripType } from '@/constants/domain';
import type { Id, LocalDate, Participant, Trip, TripDestination } from '@/types/models';
import { clock } from '@/utils/clock';
import { addDays, diffDays, isValidDate, isValidTimeZone } from '@/utils/dates';
import { createId } from '@/utils/ids';

import { bool, toDestination, toParticipant, toTrip, type DestinationRow, type ParticipantRow, type TripRow } from '../rows';

export type TripValidationCode =
  | 'name_required'
  | 'name_too_long'
  | 'invalid_date'
  | 'end_before_start'
  | 'invalid_currency'
  | 'invalid_country'
  | 'invalid_time_zone'
  | 'invalid_budget'
  | 'invalid_type'
  | 'invalid_status'
  | 'destination_city_required'
  | 'not_found';

export class TripValidationError extends Error {
  constructor(
    public readonly code: TripValidationCode,
    public readonly field?: string,
  ) {
    super(`Invalid trip: ${code}${field ? ` (${field})` : ''}`);
    this.name = 'TripValidationError';
  }
}

export interface DestinationInput {
  id?: Id;
  city: string;
  countryCode?: string | null;
  timeZone?: string | null;
  startDate?: LocalDate | null;
  endDate?: LocalDate | null;
  notes?: string;
}

export interface TripInput {
  name: string;
  primaryDestination?: string;
  countryCode?: string | null;
  city?: string | null;
  startDate?: LocalDate | null;
  endDate?: LocalDate | null;
  timeZone?: string | null;
  description?: string;
  coverUri?: string | null;
  tripType?: TripType;
  budgetMinor?: number | null;
  currency: string;
  status?: TripStatus;
  isDemo?: boolean;
  destinations?: DestinationInput[];
  participants?: { id?: Id; name: string; isSelf?: boolean }[];
}

export interface TripDetails extends Trip {
  destinations: TripDestination[];
  participants: Participant[];
}

export interface TripSummary {
  tripId: Id;
  destinations: number;
  days: number;
  activities: number;
  activitiesDone: number;
  bookings: number;
  documents: number;
  packed: number;
  packingTotal: number;
  tasksDone: number;
  tasksTotal: number;
  /** Sum of expenses converted to the trip currency (minor units). */
  spentMinor: number;
}

const COUNTRY_RE = /^[A-Z]{2}$/;
const MAX_NAME = 80;

const clean = (v: string | null | undefined): string | null => {
  const s = v?.trim();
  return s ? s : null;
};

function validateDates(start: LocalDate | null, end: LocalDate | null, field: string) {
  if (start !== null && !isValidDate(start)) throw new TripValidationError('invalid_date', `${field}.start`);
  if (end !== null && !isValidDate(end)) throw new TripValidationError('invalid_date', `${field}.end`);
  if (start && end && end < start) throw new TripValidationError('end_before_start', field);
}

function normalizeCountry(code: string | null | undefined, field: string): string | null {
  const c = clean(code)?.toUpperCase() ?? null;
  if (c && !COUNTRY_RE.test(c)) throw new TripValidationError('invalid_country', field);
  return c;
}

function normalizeTimeZone(tz: string | null | undefined, field: string): string | null {
  const z = clean(tz);
  if (z && !isValidTimeZone(z)) throw new TripValidationError('invalid_time_zone', field);
  return z;
}

/** Validates and normalises user input. Throws TripValidationError with a stable code. */
export function normalizeTripInput(input: TripInput) {
  const name = input.name.trim();
  if (!name) throw new TripValidationError('name_required', 'name');
  if (name.length > MAX_NAME) throw new TripValidationError('name_too_long', 'name');
  const startDate = clean(input.startDate);
  const endDate = clean(input.endDate);
  validateDates(startDate, endDate, 'trip');
  if (!isCurrencyCode(input.currency)) throw new TripValidationError('invalid_currency', 'currency');
  const budget = input.budgetMinor ?? null;
  if (budget !== null && (!Number.isInteger(budget) || budget < 0)) throw new TripValidationError('invalid_budget', 'budget');
  const tripType = input.tripType ?? 'solo';
  if (!TRIP_TYPES.includes(tripType)) throw new TripValidationError('invalid_type', 'tripType');
  const status = input.status ?? 'planning';
  if (!TRIP_STATUSES.includes(status)) throw new TripValidationError('invalid_status', 'status');

  const destinations = (input.destinations ?? []).map((d, i) => {
    const city = d.city.trim();
    if (!city) throw new TripValidationError('destination_city_required', `destinations.${i}`);
    const s = clean(d.startDate);
    const e = clean(d.endDate);
    validateDates(s, e, `destinations.${i}`);
    return {
      id: d.id ?? createId(),
      city,
      countryCode: normalizeCountry(d.countryCode, `destinations.${i}.country`),
      timeZone: normalizeTimeZone(d.timeZone, `destinations.${i}.timeZone`),
      startDate: s,
      endDate: e,
      notes: d.notes?.trim() ?? '',
    };
  });
  const participants = (input.participants ?? [])
    .map((p) => ({ id: p.id ?? createId(), name: p.name.trim(), isSelf: !!p.isSelf }))
    .filter((p) => p.name.length > 0);

  return {
    name,
    primaryDestination: input.primaryDestination?.trim() || destinations[0]?.city || '',
    countryCode: normalizeCountry(input.countryCode ?? destinations[0]?.countryCode, 'country'),
    city: clean(input.city) ?? destinations[0]?.city ?? null,
    startDate,
    endDate,
    timeZone: normalizeTimeZone(input.timeZone ?? destinations[0]?.timeZone, 'timeZone'),
    description: input.description?.trim() ?? '',
    coverUri: clean(input.coverUri),
    tripType,
    budgetMinor: budget,
    currency: input.currency,
    status,
    isDemo: !!input.isDemo,
    destinations,
    participants,
  };
}

/** Columns copied verbatim when duplicating child rows, per table. Dates are shifted separately. */
async function copyRows(db: SqlDatabase, table: string, columns: string[], where: string, params: (string | number | null)[], mutate: (row: Record<string, unknown>) => Record<string, unknown> | null) {
  const rows = await db.getAllAsync<Record<string, unknown>>(`SELECT * FROM ${table} WHERE ${where}`, params);
  for (const row of rows) {
    const next = mutate(row);
    if (!next) continue;
    await db.runAsync(
      `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${placeholders(columns.length)}`,
      columns.map((c) => (next[c] ?? null) as string | number | null),
    );
  }
  return rows;
}

export function createTripRepository(db: SqlDatabase) {
  async function writeChildren(tripId: Id, data: ReturnType<typeof normalizeTripInput>) {
    const keepDest = data.destinations.map((d) => d.id);
    await db.runAsync(
      `DELETE FROM trip_destinations WHERE trip_id = ?${keepDest.length ? ` AND id NOT IN ${placeholders(keepDest.length)}` : ''}`,
      [tripId, ...keepDest],
    );
    for (const [i, d] of data.destinations.entries()) {
      await db.runAsync(
        `INSERT INTO trip_destinations (id, trip_id, city, country_code, time_zone, start_date, end_date, position, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET city = excluded.city, country_code = excluded.country_code, time_zone = excluded.time_zone,
           start_date = excluded.start_date, end_date = excluded.end_date, position = excluded.position, notes = excluded.notes`,
        [d.id, tripId, d.city, d.countryCode, d.timeZone, d.startDate, d.endDate, i, d.notes],
      );
    }
    const keepPeople = data.participants.map((p) => p.id);
    await db.runAsync(
      `DELETE FROM participants WHERE trip_id = ?${keepPeople.length ? ` AND id NOT IN ${placeholders(keepPeople.length)}` : ''}`,
      [tripId, ...keepPeople],
    );
    for (const [i, p] of data.participants.entries()) {
      await db.runAsync(
        `INSERT INTO participants (id, trip_id, name, is_self, position) VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET name = excluded.name, is_self = excluded.is_self, position = excluded.position`,
        [p.id, tripId, p.name, bool(p.isSelf), i],
      );
    }
  }

  const repo = {
    async create(input: TripInput): Promise<TripDetails> {
      const data = normalizeTripInput(input);
      const id = createId();
      const now = clock.instant();
      await db.withTransactionAsync(async () => {
        await db.runAsync(
          `INSERT INTO trips (id, name, primary_destination, country_code, city, start_date, end_date, time_zone, description, cover_uri,
             trip_type, budget_minor, currency, status, is_demo, archived_at, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)`,
          [id, data.name, data.primaryDestination, data.countryCode, data.city, data.startDate, data.endDate, data.timeZone, data.description,
            data.coverUri, data.tripType, data.budgetMinor, data.currency, data.status, bool(data.isDemo), now, now],
        );
        await writeChildren(id, data);
      });
      return (await repo.get(id))!;
    },

    /** Full replace of editable fields, destinations and participants (ids kept when provided). */
    async update(id: Id, input: TripInput): Promise<TripDetails> {
      const existing = await repo.get(id);
      if (!existing) throw new TripValidationError('not_found');
      const data = normalizeTripInput({ ...input, isDemo: existing.isDemo });
      await db.withTransactionAsync(async () => {
        await db.runAsync(
          `UPDATE trips SET name = ?, primary_destination = ?, country_code = ?, city = ?, start_date = ?, end_date = ?, time_zone = ?,
             description = ?, cover_uri = ?, trip_type = ?, budget_minor = ?, currency = ?, status = ?, updated_at = ? WHERE id = ?`,
          [data.name, data.primaryDestination, data.countryCode, data.city, data.startDate, data.endDate, data.timeZone, data.description,
            data.coverUri, data.tripType, data.budgetMinor, data.currency, data.status, clock.instant(), id],
        );
        await writeChildren(id, data);
      });
      return (await repo.get(id))!;
    },

    async get(id: Id): Promise<TripDetails | null> {
      const row = await db.getFirstAsync<TripRow>('SELECT * FROM trips WHERE id = ?', [id]);
      if (!row) return null;
      const [dest, people] = await Promise.all([
        db.getAllAsync<DestinationRow>('SELECT * FROM trip_destinations WHERE trip_id = ? ORDER BY position', [id]),
        db.getAllAsync<ParticipantRow>('SELECT * FROM participants WHERE trip_id = ? ORDER BY position', [id]),
      ]);
      return { ...toTrip(row), destinations: dest.map(toDestination), participants: people.map(toParticipant) };
    },

    async list(opts: { includeArchived?: boolean } = {}): Promise<Trip[]> {
      const rows = await db.getAllAsync<TripRow>(
        `SELECT * FROM trips ${opts.includeArchived === false ? "WHERE archived_at IS NULL AND status <> 'archived'" : ''}
         ORDER BY COALESCE(start_date, '9999-12-31'), created_at`,
        [],
      );
      return rows.map(toTrip);
    },

    /** Ordered city names per trip, for "Porto → Lisbon" style routes in lists. */
    async routes(): Promise<Map<Id, string[]>> {
      const rows = await db.getAllAsync<{ trip_id: string; city: string }>('SELECT trip_id, city FROM trip_destinations ORDER BY trip_id, position', []);
      const out = new Map<Id, string[]>();
      for (const r of rows) out.set(r.trip_id, [...(out.get(r.trip_id) ?? []), r.city]);
      return out;
    },

    async count(): Promise<number> {
      return (await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM trips WHERE is_demo = 0', []))?.n ?? 0;
    },

    async archive(id: Id): Promise<void> {
      const now = clock.instant();
      await db.runAsync(`UPDATE trips SET archived_at = ?, status = 'archived', updated_at = ? WHERE id = ?`, [now, now, id]);
    },

    /** Restores an archived trip; its displayed status is derived again from its dates. */
    async unarchive(id: Id): Promise<void> {
      await db.runAsync(`UPDATE trips SET archived_at = NULL, status = 'planning', updated_at = ? WHERE id = ?`, [clock.instant(), id]);
    },

    /**
     * Deletes a trip and, by cascade, everything attached to it. Returns the local file
     * URIs that belonged to it so the caller can delete the files themselves.
     */
    async remove(id: Id): Promise<{ deleted: boolean; fileUris: string[] }> {
      let fileUris: string[] = [];
      let deleted = false;
      await db.withTransactionAsync(async () => {
        fileUris = await repo.fileUris(id);
        deleted = (await db.runAsync('DELETE FROM trips WHERE id = ?', [id])).changes > 0;
      });
      return { deleted, fileUris: deleted ? fileUris : [] };
    },

    /** Every local file referenced by a trip (cover, documents, place photos, journal photos). */
    async fileUris(id: Id): Promise<string[]> {
      const trip = await db.getFirstAsync<{ cover_uri: string | null }>('SELECT cover_uri FROM trips WHERE id = ?', [id]);
      const docs = await db.getAllAsync<{ uri: string }>('SELECT file_uri AS uri FROM travel_documents WHERE trip_id = ?', [id]);
      const photos = await db.getAllAsync<{ uri: string }>('SELECT photo_uri AS uri FROM places WHERE trip_id = ? AND photo_uri IS NOT NULL', [id]);
      const journal = await db.getAllAsync<{ photo_uris: string }>('SELECT photo_uris FROM journal_entries WHERE trip_id = ?', [id]);
      const uris = [trip?.cover_uri, ...docs.map((d) => d.uri), ...photos.map((p) => p.uri), ...journal.flatMap((j) => fromJson<string[]>(j.photo_uris, []))];
      return [...new Set(uris.filter((u): u is string => !!u))];
    },

    /**
     * Duplicates a trip's plan: destinations, participants, days, activities, budget,
     * packing lists, checklists, places and weather notes. Progress is reset (nothing packed,
     * tasks to do, activities planned). Not copied: bookings (their references belong to the
     * original trip), expenses, journal entries, documents and any photo/cover file.
     * When `startDate` is given, every date is shifted by the same number of days.
     */
    async duplicate(id: Id, opts: { name: string; startDate?: LocalDate | null }): Promise<TripDetails> {
      const source = await repo.get(id);
      if (!source) throw new TripValidationError('not_found');
      if (opts.startDate && !isValidDate(opts.startDate)) throw new TripValidationError('invalid_date', 'startDate');
      const offset = opts.startDate && source.startDate ? diffDays(source.startDate, opts.startDate) : 0;
      const shift = (d: unknown) => (typeof d === 'string' && isValidDate(d) && offset ? addDays(d, offset) : (d as string | null));
      const newId = createId();
      const now = clock.instant();
      const name = opts.name.trim() || source.name;
      if (name.length > MAX_NAME) throw new TripValidationError('name_too_long', 'name');
      const ids = new Map<string, string>();
      const mapId = (old: unknown) => (typeof old === 'string' ? (ids.get(old) ?? null) : null);
      const fresh = (old: unknown) => {
        const n = createId();
        ids.set(old as string, n);
        return n;
      };

      await db.withTransactionAsync(async () => {
        await db.runAsync(
          `INSERT INTO trips (id, name, primary_destination, country_code, city, start_date, end_date, time_zone, description, cover_uri,
             trip_type, budget_minor, currency, status, is_demo, archived_at, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, 'planning', ?, NULL, ?, ?)`,
          [newId, name, source.primaryDestination, source.countryCode, source.city, shift(source.startDate), shift(source.endDate), source.timeZone,
            source.description, source.tripType, source.budgetMinor, source.currency, bool(source.isDemo), now, now],
        );
        await copyRows(db, 'trip_destinations', ['id', 'trip_id', 'city', 'country_code', 'time_zone', 'start_date', 'end_date', 'position', 'notes'], 'trip_id = ?', [id], (r) => ({
          ...r, id: fresh(r.id), trip_id: newId, start_date: shift(r.start_date), end_date: shift(r.end_date),
        }));
        await copyRows(db, 'participants', ['id', 'trip_id', 'name', 'is_self', 'position'], 'trip_id = ?', [id], (r) => ({ ...r, id: fresh(r.id), trip_id: newId }));
        await copyRows(db, 'itinerary_days', ['id', 'trip_id', 'date', 'destination_id', 'title', 'description', 'notes', 'budget_minor', 'position'], 'trip_id = ?', [id], (r) => ({
          ...r, id: fresh(r.id), trip_id: newId, date: shift(r.date), destination_id: mapId(r.destination_id),
        }));
        await copyRows(db, 'places', ['id', 'trip_id', 'day_id', 'name', 'address', 'city', 'country_code', 'category', 'notes', 'url', 'latitude', 'longitude', 'photo_uri', 'is_favorite', 'created_at'], 'trip_id = ?', [id], (r) => ({
          ...r, id: fresh(r.id), trip_id: newId, day_id: mapId(r.day_id), photo_uri: null, created_at: now,
        }));
        await copyRows(db, 'activities', ['id', 'trip_id', 'day_id', 'place_id', 'name', 'description', 'address', 'category', 'start_time', 'end_time', 'duration_minutes', 'price_minor', 'currency', 'notes', 'url', 'status', 'position', 'created_at', 'updated_at'], 'trip_id = ?', [id], (r) => {
          const day = mapId(r.day_id);
          return day ? { ...r, id: createId(), trip_id: newId, day_id: day, place_id: mapId(r.place_id), status: 'planned', created_at: now, updated_at: now } : null;
        });
        await copyRows(db, 'budgets', ['trip_id', 'category', 'planned_minor'], 'trip_id = ?', [id], (r) => ({ ...r, trip_id: newId }));
        await copyRows(db, 'weather_notes', ['id', 'trip_id', 'destination_id', 'conditions', 'min_temp_c', 'max_temp_c', 'notes', 'updated_at'], 'trip_id = ?', [id], (r) => ({
          ...r, id: createId(), trip_id: newId, destination_id: mapId(r.destination_id), updated_at: now,
        }));
        const lists = await copyRows(db, 'packing_lists', ['id', 'trip_id', 'name', 'is_template', 'template_key', 'created_at'], 'trip_id = ?', [id], (r) => ({
          ...r, id: fresh(r.id), trip_id: newId, created_at: now,
        }));
        if (lists.length) {
          const listIds = lists.map((l) => l.id as string);
          await copyRows(db, 'packing_items', ['id', 'list_id', 'name', 'category', 'quantity', 'notes', 'priority', 'packed', 'position'], `list_id IN ${placeholders(listIds.length)}`, listIds, (r) => ({
            ...r, id: createId(), list_id: mapId(r.list_id), packed: 0,
          }));
        }
        const checklists = await copyRows(db, 'checklists', ['id', 'trip_id', 'name', 'created_at'], 'trip_id = ?', [id], (r) => ({ ...r, id: fresh(r.id), trip_id: newId, created_at: now }));
        if (checklists.length) {
          const clIds = checklists.map((c) => c.id as string);
          await copyRows(db, 'checklist_items', ['id', 'checklist_id', 'title', 'notes', 'due_date', 'priority', 'status', 'reminder_at', 'notification_id', 'position'], `checklist_id IN ${placeholders(clIds.length)}`, clIds, (r) => ({
            ...r, id: createId(), checklist_id: mapId(r.checklist_id), due_date: shift(r.due_date), status: 'todo', reminder_at: null, notification_id: null,
          }));
        }
      });
      return (await repo.get(newId))!;
    },

    /** Aggregated counts for dashboards, computed from stored rows only. */
    async summaries(tripIds?: Id[]): Promise<Map<Id, TripSummary>> {
      const filter = tripIds ? (tripIds.length ? `WHERE t.id IN ${placeholders(tripIds.length)}` : 'WHERE 0') : '';
      const rows = await db.getAllAsync<{
        id: string; destinations: number; days: number; activities: number; activities_done: number; bookings: number; documents: number;
        packed: number; packing_total: number; tasks_done: number; tasks_total: number; spent: number;
      }>(
        `SELECT t.id,
           (SELECT COUNT(*) FROM trip_destinations d WHERE d.trip_id = t.id) AS destinations,
           (SELECT COUNT(*) FROM itinerary_days d WHERE d.trip_id = t.id) AS days,
           (SELECT COUNT(*) FROM activities a WHERE a.trip_id = t.id) AS activities,
           (SELECT COUNT(*) FROM activities a WHERE a.trip_id = t.id AND a.status = 'completed') AS activities_done,
           (SELECT COUNT(*) FROM bookings b WHERE b.trip_id = t.id AND b.status <> 'cancelled') AS bookings,
           (SELECT COUNT(*) FROM travel_documents x WHERE x.trip_id = t.id) AS documents,
           (SELECT COUNT(*) FROM packing_items i JOIN packing_lists l ON l.id = i.list_id WHERE l.trip_id = t.id AND i.packed = 1) AS packed,
           (SELECT COUNT(*) FROM packing_items i JOIN packing_lists l ON l.id = i.list_id WHERE l.trip_id = t.id) AS packing_total,
           (SELECT COUNT(*) FROM checklist_items i JOIN checklists c ON c.id = i.checklist_id WHERE c.trip_id = t.id AND i.status = 'done') AS tasks_done,
           (SELECT COUNT(*) FROM checklist_items i JOIN checklists c ON c.id = i.checklist_id WHERE c.trip_id = t.id) AS tasks_total,
           (SELECT COALESCE(SUM(e.trip_amount_minor), 0) FROM expenses e WHERE e.trip_id = t.id) AS spent
         FROM trips t ${filter}`,
        tripIds ?? [],
      );
      return new Map(
        rows.map((r) => [
          r.id,
          {
            tripId: r.id, destinations: r.destinations, days: r.days, activities: r.activities, activitiesDone: r.activities_done, bookings: r.bookings,
            documents: r.documents, packed: r.packed, packingTotal: r.packing_total, tasksDone: r.tasks_done, tasksTotal: r.tasks_total, spentMinor: r.spent,
          },
        ]),
      );
    },
  };
  return repo;
}

export type TripRepository = ReturnType<typeof createTripRepository>;
