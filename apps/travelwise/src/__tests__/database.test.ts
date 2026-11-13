import { createTestDatabase } from '@factory/testing';

import { initDatabase, wipeAllData, type Repositories } from '@/database';
import { SCHEMA_VERSION, USER_TABLES } from '@/database/migrations';
import { TripValidationError, type TripInput } from '@/database/repositories/trips';
import { clock } from '@/utils/clock';

const portugal: TripInput = {
  name: 'My Portugal Trip',
  startDate: '2026-07-30',
  endDate: '2026-08-06',
  currency: 'EUR',
  tripType: 'couple',
  budgetMinor: 250000,
  destinations: [
    { city: 'Porto', countryCode: 'pt', timeZone: 'Europe/Lisbon', startDate: '2026-07-30', endDate: '2026-08-02' },
    { city: 'Lisbon', countryCode: 'PT', timeZone: 'Europe/Lisbon', startDate: '2026-08-02', endDate: '2026-08-06' },
  ],
  participants: [{ name: 'Me', isSelf: true }, { name: 'Sam' }],
};

async function setup(): Promise<Repositories> {
  return initDatabase(await createTestDatabase());
}

/** Inserts one row in every child table of a trip, through raw SQL (later phases add repositories). */
async function seedChildren(r: Repositories, tripId: string) {
  const db = r.db;
  const trip = (await r.trips.get(tripId))!;
  const dest = trip.destinations[0]!.id;
  const person = trip.participants[0]!.id;
  const now = '2026-06-01T10:00:00.000Z';
  await db.runAsync(`INSERT INTO itinerary_days (id, trip_id, date, destination_id, title, position) VALUES ('day1', ?, '2026-07-30', ?, 'Arrival in Porto', 0)`, [tripId, dest]);
  await db.runAsync(`INSERT INTO places (id, trip_id, day_id, name, photo_uri, created_at) VALUES ('place1', ?, 'day1', 'Riverside', 'file:///data/travelwise/p1.jpg', ?)`, [tripId, now]);
  await db.runAsync(
    `INSERT INTO activities (id, trip_id, day_id, place_id, name, category, start_time, status, position, created_at, updated_at)
     VALUES ('act1', ?, 'day1', 'place1', 'Riverside walk', 'sightseeing', '17:00', 'completed', 0, ?, ?)`,
    [tripId, now, now],
  );
  await db.runAsync(`INSERT INTO travel_documents (id, trip_id, title, file_uri, mime_type, size_bytes, created_at) VALUES ('doc1', ?, 'Ticket', 'file:///data/travelwise/doc1.pdf', 'application/pdf', 1200, ?)`, [tripId, now]);
  await db.runAsync(`INSERT INTO bookings (id, trip_id, type, reference, date, attachment_document_id, created_at, updated_at) VALUES ('b1', ?, 'flight', 'USER-REF', '2026-07-30', 'doc1', ?, ?)`, [tripId, now, now]);
  await db.runAsync(`INSERT INTO budgets (trip_id, category, planned_minor) VALUES (?, 'food', 50000)`, [tripId]);
  await db.runAsync(`INSERT INTO expenses (id, trip_id, amount_minor, currency, trip_amount_minor, date, paid_by_participant_id, split_mode, created_at, updated_at) VALUES ('e1', ?, 4200, 'EUR', 4200, '2026-07-30', ?, 'equal', ?, ?)`, [tripId, person, now, now]);
  await db.runAsync(`INSERT INTO expense_participants (expense_id, participant_id, share_minor) VALUES ('e1', ?, 4200)`, [person]);
  await db.runAsync(`INSERT INTO packing_lists (id, trip_id, name, created_at) VALUES ('pl1', ?, 'Bag', ?)`, [tripId, now]);
  await db.runAsync(`INSERT INTO packing_items (id, list_id, name, packed, position) VALUES ('pi1', 'pl1', 'Charger', 1, 0), ('pi2', 'pl1', 'Hat', 0, 1)`, []);
  await db.runAsync(`INSERT INTO checklists (id, trip_id, name, created_at) VALUES ('cl1', ?, 'Before leaving', ?)`, [tripId, now]);
  await db.runAsync(`INSERT INTO checklist_items (id, checklist_id, title, due_date, status, reminder_at, position) VALUES ('ci1', 'cl1', 'Check passport validity', '2026-07-01', 'done', '2026-06-30T08:00:00.000Z', 0)`, []);
  await db.runAsync(`INSERT INTO journal_entries (id, trip_id, date, body, photo_uris, created_at, updated_at) VALUES ('j1', ?, '2026-07-30', 'Hello', '["file:///data/travelwise/j1.jpg"]', ?, ?)`, [tripId, now, now]);
  await db.runAsync(`INSERT INTO currency_rates (id, trip_id, base, quote, rate, rate_date, captured_at) VALUES ('r1', ?, 'EUR', 'USD', 1.08, '2026-06-01', ?)`, [tripId, now]);
  await db.runAsync(`INSERT INTO weather_notes (id, trip_id, destination_id, conditions, updated_at) VALUES ('w1', ?, ?, '["sunny"]', ?)`, [tripId, dest, now]);
}

const count = async (r: Repositories, table: string) => (await r.db.getFirstAsync<{ n: number }>(`SELECT COUNT(*) AS n FROM ${table}`, []))!.n;

beforeEach(() => clock.set(() => new Date('2026-06-01T10:00:00.000Z')));
afterEach(() => clock.set(null));

describe('schema & migrations', () => {
  it('migrates to the latest version and is idempotent', async () => {
    const db = await createTestDatabase();
    await initDatabase(db);
    await initDatabase(db);
    const v = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version', []);
    expect(v?.user_version).toBe(SCHEMA_VERSION);
  });

  it('creates every table listed for wipes, with foreign keys enabled', async () => {
    const r = await setup();
    for (const table of USER_TABLES) expect(await count(r, table)).toBe(0);
    const fk = await r.db.getFirstAsync<{ foreign_keys: number }>('PRAGMA foreign_keys', []);
    expect(fk?.foreign_keys).toBe(1);
  });

  it('rejects invalid rows at the database level', async () => {
    const r = await setup();
    const trip = await r.trips.create({ name: 'T', currency: 'EUR' });
    await expect(r.db.runAsync(`INSERT INTO currency_rates (id, base, quote, rate, rate_date, captured_at) VALUES ('x', 'EUR', 'EUR', 1, '2026-01-01', 'now')`, [])).rejects.toThrow();
    await expect(r.db.runAsync(`INSERT INTO currency_rates (id, base, quote, rate, rate_date, captured_at) VALUES ('y', 'EUR', 'USD', 0, '2026-01-01', 'now')`, [])).rejects.toThrow();
    await expect(r.db.runAsync(`INSERT INTO places (id, trip_id, name, latitude, longitude, created_at) VALUES ('p', ?, 'x', 120, 0, 'now')`, [trip.id])).rejects.toThrow();
    await expect(r.db.runAsync(`INSERT INTO itinerary_days (id, trip_id, date, position) VALUES ('d', 'missing-trip', '2026-01-01', 0)`, [])).rejects.toThrow();
  });
});

describe('trips repository', () => {
  it('creates a multi-destination trip with travellers', async () => {
    const r = await setup();
    const trip = await r.trips.create(portugal);
    expect(trip.name).toBe('My Portugal Trip');
    expect(trip.primaryDestination).toBe('Porto');
    expect(trip.countryCode).toBe('PT');
    expect(trip.timeZone).toBe('Europe/Lisbon');
    expect(trip.destinations.map((d) => d.city)).toEqual(['Porto', 'Lisbon']);
    expect(trip.destinations[0]!.countryCode).toBe('PT');
    expect(trip.participants.map((p) => [p.name, p.isSelf])).toEqual([['Me', true], ['Sam', false]]);
    expect(trip.status).toBe('planning');
    expect(trip.isDemo).toBe(false);
    expect(trip.createdAt).toBe('2026-06-01T10:00:00.000Z');
  });

  it.each<[Partial<TripInput>, string]>([
    [{ name: '   ' }, 'name_required'],
    [{ name: 'x'.repeat(81) }, 'name_too_long'],
    [{ startDate: '2026-02-30' }, 'invalid_date'],
    [{ startDate: '2026-08-06', endDate: '2026-07-30' }, 'end_before_start'],
    [{ currency: 'XYZ' }, 'invalid_currency'],
    [{ countryCode: 'PRT' }, 'invalid_country'],
    [{ timeZone: 'Mars/Olympus' }, 'invalid_time_zone'],
    [{ budgetMinor: -1 }, 'invalid_budget'],
    [{ destinations: [{ city: ' ' }] }, 'destination_city_required'],
  ])('rejects invalid input %o with %s', async (patch, code) => {
    const r = await setup();
    await expect(r.trips.create({ name: 'Trip', currency: 'EUR', ...patch })).rejects.toMatchObject({ code });
    expect(await r.trips.count()).toBe(0);
  });

  it('accepts a trip crossing two years and a trip without dates', async () => {
    const r = await setup();
    const nye = await r.trips.create({ name: 'New Year in Tokyo', startDate: '2026-12-29', endDate: '2027-01-03', currency: 'JPY' });
    expect(nye.endDate).toBe('2027-01-03');
    const idea = await r.trips.create({ name: 'Someday: Patagonia', currency: 'USD' });
    expect(idea.startDate).toBeNull();
    expect((await r.trips.list()).map((t) => t.name)).toEqual(['New Year in Tokyo', 'Someday: Patagonia']);
  });

  it('updates fields and keeps existing destination ids (linked days stay attached)', async () => {
    const r = await setup();
    const trip = await r.trips.create(portugal);
    await seedChildren(r, trip.id);
    clock.set(() => new Date('2026-06-02T09:00:00.000Z'));
    const [porto, lisbon] = trip.destinations;
    const updated = await r.trips.update(trip.id, {
      ...portugal,
      name: 'Portugal & Spain',
      destinations: [
        { id: porto!.id, city: 'Porto', countryCode: 'PT' },
        { id: lisbon!.id, city: 'Lisboa', countryCode: 'PT' },
        { city: 'Seville', countryCode: 'ES', timeZone: 'Europe/Madrid' },
      ],
    });
    expect(updated.name).toBe('Portugal & Spain');
    expect(updated.destinations.map((d) => d.city)).toEqual(['Porto', 'Lisboa', 'Seville']);
    expect(updated.destinations[0]!.id).toBe(porto!.id);
    expect(updated.updatedAt).toBe('2026-06-02T09:00:00.000Z');
    const day = await r.db.getFirstAsync<{ destination_id: string }>(`SELECT destination_id FROM itinerary_days WHERE id = 'day1'`, []);
    expect(day?.destination_id).toBe(porto!.id);
  });

  it('removing a destination detaches its days instead of deleting them', async () => {
    const r = await setup();
    const trip = await r.trips.create(portugal);
    await seedChildren(r, trip.id);
    await r.trips.update(trip.id, { ...portugal, destinations: [{ id: trip.destinations[1]!.id, city: 'Lisbon' }] });
    const day = await r.db.getFirstAsync<{ destination_id: string | null }>(`SELECT destination_id FROM itinerary_days WHERE id = 'day1'`, []);
    expect(day).not.toBeNull();
    expect(day?.destination_id).toBeNull();
    expect(await count(r, 'activities')).toBe(1);
  });

  it('archives and restores a trip', async () => {
    const r = await setup();
    const trip = await r.trips.create(portugal);
    await r.trips.archive(trip.id);
    let stored = (await r.trips.get(trip.id))!;
    expect(stored.status).toBe('archived');
    expect(stored.archivedAt).toBe('2026-06-01T10:00:00.000Z');
    expect(await r.trips.list({ includeArchived: false })).toHaveLength(0);
    await r.trips.unarchive(trip.id);
    stored = (await r.trips.get(trip.id))!;
    expect(stored.archivedAt).toBeNull();
    expect(await r.trips.list({ includeArchived: false })).toHaveLength(1);
  });

  it('duplicates the plan with reset progress and shifted dates, without bookings, expenses, journal, documents or files', async () => {
    const r = await setup();
    const trip = await r.trips.create(portugal);
    await seedChildren(r, trip.id);
    const copy = await r.trips.duplicate(trip.id, { name: 'Portugal again', startDate: '2027-07-30' });

    expect(copy.id).not.toBe(trip.id);
    expect(copy.name).toBe('Portugal again');
    expect([copy.startDate, copy.endDate]).toEqual(['2027-07-30', '2027-08-06']);
    expect(copy.destinations.map((d) => [d.city, d.startDate])).toEqual([['Porto', '2027-07-30'], ['Lisbon', '2027-08-02']]);
    expect(copy.participants).toHaveLength(2);
    expect(copy.coverUri).toBeNull();

    const one = async <T>(sql: string) => (await r.db.getFirstAsync<T>(sql, [copy.id]))!;
    expect(await one<{ date: string; destination_id: string }>('SELECT date, destination_id FROM itinerary_days WHERE trip_id = ?')).toEqual({
      date: '2027-07-30',
      destination_id: copy.destinations[0]!.id,
    });
    const act = await one<{ status: string; place_id: string; start_time: string }>('SELECT status, place_id, start_time FROM activities WHERE trip_id = ?');
    expect(act.status).toBe('planned');
    expect(act.start_time).toBe('17:00');
    expect(act.place_id).not.toBe('place1');
    expect((await one<{ photo_uri: string | null }>('SELECT photo_uri FROM places WHERE trip_id = ?')).photo_uri).toBeNull();
    expect((await one<{ n: number }>('SELECT COUNT(*) AS n FROM packing_items i JOIN packing_lists l ON l.id = i.list_id WHERE l.trip_id = ? AND i.packed = 1')).n).toBe(0);
    const task = await one<{ status: string; due_date: string; reminder_at: string | null }>(
      'SELECT status, due_date, reminder_at FROM checklist_items i JOIN checklists c ON c.id = i.checklist_id WHERE c.trip_id = ?',
    );
    expect(task).toEqual({ status: 'todo', due_date: '2027-07-01', reminder_at: null });
    expect((await one<{ n: number }>('SELECT COUNT(*) AS n FROM budgets WHERE trip_id = ?')).n).toBe(1);
    for (const table of ['bookings', 'expenses', 'journal_entries', 'travel_documents']) {
      expect((await r.db.getFirstAsync<{ n: number }>(`SELECT COUNT(*) AS n FROM ${table} WHERE trip_id = ?`, [copy.id]))!.n).toBe(0);
    }
    expect(await r.trips.fileUris(copy.id)).toEqual([]);
    // The original is untouched.
    expect((await r.db.getFirstAsync<{ status: string }>(`SELECT status FROM activities WHERE id = 'act1'`, []))!.status).toBe('completed');
  });

  it('duplicates without shifting when no new start date is given', async () => {
    const r = await setup();
    const trip = await r.trips.create(portugal);
    const copy = await r.trips.duplicate(trip.id, { name: '' });
    expect(copy.name).toBe(trip.name);
    expect(copy.startDate).toBe(trip.startDate);
  });

  it('deletes a trip with every linked row and returns its files for clean-up', async () => {
    const r = await setup();
    const keep = await r.trips.create({ name: 'Other trip', currency: 'USD' });
    const trip = await r.trips.create({ ...portugal, coverUri: 'file:///data/travelwise/cover.jpg' });
    await seedChildren(r, trip.id);
    const result = await r.trips.remove(trip.id);
    expect(result.deleted).toBe(true);
    expect(result.fileUris.sort()).toEqual(
      ['file:///data/travelwise/cover.jpg', 'file:///data/travelwise/doc1.pdf', 'file:///data/travelwise/j1.jpg', 'file:///data/travelwise/p1.jpg'].sort(),
    );
    for (const table of USER_TABLES.filter((t) => t !== 'trips' && t !== 'user_settings' && t !== 'currency_conversions')) {
      expect([table, await count(r, table)]).toEqual([table, 0]);
    }
    expect((await r.trips.list()).map((t) => t.id)).toEqual([keep.id]);
    expect(await r.trips.remove('missing')).toEqual({ deleted: false, fileUris: [] });
  });

  it('computes dashboard summaries from stored rows only', async () => {
    const r = await setup();
    const trip = await r.trips.create(portugal);
    const empty = await r.trips.create({ name: 'Empty', currency: 'USD' });
    await seedChildren(r, trip.id);
    const s = await r.trips.summaries();
    expect(s.get(trip.id)).toEqual({
      tripId: trip.id,
      destinations: 2,
      days: 1,
      activities: 1,
      activitiesDone: 1,
      bookings: 1,
      documents: 1,
      packed: 1,
      packingTotal: 2,
      tasksDone: 1,
      tasksTotal: 1,
      spentMinor: 4200,
    });
    expect(s.get(empty.id)?.spentMinor).toBe(0);
    expect((await r.trips.summaries([])).size).toBe(0);
    expect((await r.trips.routes()).get(trip.id)).toEqual(['Porto', 'Lisbon']);
  });

  it('wipes all user data', async () => {
    const r = await setup();
    const trip = await r.trips.create(portugal);
    await seedChildren(r, trip.id);
    await r.settings.set({ lastBackupAt: '2026-06-01T10:00:00.000Z' });
    await wipeAllData(r.db);
    for (const table of USER_TABLES) expect(await count(r, table)).toBe(0);
    expect((await r.settings.get()).lastBackupAt).toBeNull();
  });

  it('throws a typed error when updating or duplicating a missing trip', async () => {
    const r = await setup();
    await expect(r.trips.update('nope', portugal)).rejects.toBeInstanceOf(TripValidationError);
    await expect(r.trips.duplicate('nope', { name: 'x' })).rejects.toMatchObject({ code: 'not_found' });
  });
});

describe('settings repository', () => {
  it('returns defaults and persists values', async () => {
    const r = await setup();
    expect(await r.settings.get()).toEqual({ lastBackupAt: null });
    await r.settings.set({ lastBackupAt: '2026-06-01T10:00:00.000Z' });
    expect(await r.settings.get()).toEqual({ lastBackupAt: '2026-06-01T10:00:00.000Z' });
  });
});
