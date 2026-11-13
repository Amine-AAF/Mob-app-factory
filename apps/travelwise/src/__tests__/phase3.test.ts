import { createTestDatabase } from '@factory/testing';

import { PACKING_CATEGORIES } from '@/constants/domain';
import { ITINERARY_TEMPLATES, TEMPLATES, planTemplateDays } from '@/content/itineraryTemplates';
import { PACKING_CATALOG, PACKING_TEMPLATES, catalogName, templateItems } from '@/content/packingCatalog';
import { nextActivities } from '@/features/itinerary/selectors';
import { initDatabase, type Repositories } from '@/database';
import { missingBookingFields, sortBookings } from '@/database/repositories/bookings';
import { destinationForDate, normalizeUrl } from '@/database/repositories/itinerary';
import { packingProgress } from '@/database/repositories/packing';
import { clock } from '@/utils/clock';

beforeEach(() => clock.set(() => new Date('2026-06-01T10:00:00.000Z')));
afterEach(() => clock.set(null));

async function setup() {
  const r = await initDatabase(await createTestDatabase());
  const trip = await r.trips.create({
    name: 'Portugal',
    startDate: '2026-07-30',
    endDate: '2026-08-05',
    currency: 'EUR',
    destinations: [
      { city: 'Porto', timeZone: 'Europe/Lisbon', startDate: '2026-07-30', endDate: '2026-08-02' },
      { city: 'Lisbon', timeZone: 'Europe/Lisbon', startDate: '2026-08-02', endDate: '2026-08-05' },
    ],
  });
  return { r, trip };
}

const names = async (r: Repositories, tripId: string, date: string) => (await r.itinerary.listDays(tripId)).find((d) => d.date === date)!.activities.map((a) => a.name);

describe('itinerary days', () => {
  it('creates one day per trip date linked to the right city (arrival day belongs to the new city)', async () => {
    const { r, trip } = await setup();
    expect(await r.itinerary.syncDaysWithTrip(trip.id)).toBe(7);
    const days = await r.itinerary.listDays(trip.id);
    expect(days.map((d) => d.date)).toEqual(['2026-07-30', '2026-07-31', '2026-08-01', '2026-08-02', '2026-08-03', '2026-08-04', '2026-08-05']);
    const [porto, lisbon] = trip.destinations;
    expect(days.map((d) => d.destinationId)).toEqual([porto!.id, porto!.id, porto!.id, lisbon!.id, lisbon!.id, lisbon!.id, lisbon!.id]);
    // Idempotent
    expect(await r.itinerary.syncDaysWithTrip(trip.id)).toBe(0);
  });

  it('keeps days that fall outside new trip dates and flags them instead of deleting', async () => {
    const { r, trip } = await setup();
    await r.itinerary.syncDaysWithTrip(trip.id);
    const firstDay = (await r.itinerary.listDays(trip.id))[0]!;
    await r.itinerary.addActivity(firstDay.id, { name: 'Airport arrival', startTime: '09:00' });
    await r.trips.update(trip.id, { name: 'Portugal', startDate: '2026-07-31', endDate: '2026-08-05', currency: 'EUR' });
    const days = await r.itinerary.listDays(trip.id);
    expect(days[0]!.outsideTrip).toBe(true);
    expect(days[0]!.activities).toHaveLength(1);
  });

  it('handles a trip across two years and refuses a trip without dates', async () => {
    const { r } = await setup();
    const nye = await r.trips.create({ name: 'NYE', startDate: '2026-12-30', endDate: '2027-01-02', currency: 'JPY' });
    expect(await r.itinerary.syncDaysWithTrip(nye.id)).toBe(4);
    const idea = await r.trips.create({ name: 'Idea', currency: 'USD' });
    await expect(r.itinerary.syncDaysWithTrip(idea.id)).rejects.toMatchObject({ code: 'trip_has_no_dates' });
  });

  it('adds an extra day once per date and updates day details', async () => {
    const { r, trip } = await setup();
    const day = await r.itinerary.addDay(trip.id, '2026-08-06', { title: 'Extra day' });
    await expect(r.itinerary.addDay(trip.id, '2026-08-06')).rejects.toMatchObject({ code: 'date_taken' });
    await expect(r.itinerary.addDay(trip.id, '2026-02-30')).rejects.toMatchObject({ code: 'invalid_date' });
    const updated = await r.itinerary.updateDay(day.id, { title: 'Day trip', budgetMinor: 5000, destinationId: trip.destinations[1]!.id });
    expect(updated).toMatchObject({ title: 'Day trip', budgetMinor: 5000, destinationId: trip.destinations[1]!.id });
  });

  it('deleting a day deletes its activities', async () => {
    const { r, trip } = await setup();
    const day = await r.itinerary.addDay(trip.id, '2026-07-30');
    await r.itinerary.addActivity(day.id, { name: 'A' });
    await r.itinerary.deleteDay(day.id);
    expect((await r.itinerary.counts(trip.id)).activities).toBe(0);
  });

  it('assigns destinations by date ranges', () => {
    const dests = [
      { id: 'a', startDate: '2026-07-30', endDate: '2026-08-02', position: 0 },
      { id: 'b', startDate: '2026-08-02', endDate: '2026-08-05', position: 1 },
    ];
    expect(destinationForDate(dests, '2026-07-31')).toBe('a');
    expect(destinationForDate(dests, '2026-08-02')).toBe('b');
    expect(destinationForDate(dests, '2026-09-01')).toBeNull();
    expect(destinationForDate([{ id: 'only', startDate: null, endDate: null, position: 0 }], '2026-09-01')).toBe('only');
  });
});

describe('activities', () => {
  it('adds activities, sorts timed ones by time and keeps untimed ones last', async () => {
    const { r, trip } = await setup();
    const day = await r.itinerary.addDay(trip.id, '2026-07-30', { title: 'Arrival in Porto' });
    for (const [name, startTime] of [['Dinner', '20:00'], ['Free time', null], ['Airport arrival', '09:00'], ['Hotel check-in', '11:00'], ['Riverside walk', '17:00'], ['City exploration', '14:00']] as const) {
      await r.itinerary.addActivity(day.id, { name, startTime, category: 'sightseeing' });
    }
    expect(await names(r, trip.id, '2026-07-30')).toEqual(['Airport arrival', 'Hotel check-in', 'City exploration', 'Riverside walk', 'Dinner', 'Free time']);
  });

  it('validates input and computes durations (also past midnight)', async () => {
    const { r, trip } = await setup();
    const day = await r.itinerary.addDay(trip.id, '2026-07-30');
    await expect(r.itinerary.addActivity(day.id, { name: ' ' })).rejects.toMatchObject({ code: 'name_required' });
    await expect(r.itinerary.addActivity(day.id, { name: 'x', startTime: '25:00' })).rejects.toMatchObject({ code: 'invalid_time' });
    await expect(r.itinerary.addActivity(day.id, { name: 'x', priceMinor: -5 })).rejects.toMatchObject({ code: 'invalid_price' });
    await expect(r.itinerary.addActivity(day.id, { name: 'x', currency: 'XYZ' })).rejects.toMatchObject({ code: 'invalid_currency' });
    await expect(r.itinerary.addActivity(day.id, { name: 'x', url: 'not a link' })).rejects.toMatchObject({ code: 'invalid_url' });
    await expect(r.itinerary.addActivity('nope', { name: 'x' })).rejects.toMatchObject({ code: 'day_not_found' });
    const show = await r.itinerary.addActivity(day.id, { name: 'Late show', startTime: '22:30', endTime: '01:00', priceMinor: 3500, currency: 'EUR', url: 'example.org/show' });
    expect(show).toMatchObject({ durationMinutes: 150, priceMinor: 3500, currency: 'EUR', url: 'https://example.org/show', status: 'planned', category: 'other' });
  });

  it('edits times without any time-zone conversion', async () => {
    const { r, trip } = await setup();
    const day = await r.itinerary.addDay(trip.id, '2026-07-30');
    const a = await r.itinerary.addActivity(day.id, { name: 'Tour', startTime: '10:00' });
    const updated = await r.itinerary.updateActivity(a.id, { name: 'Tour', startTime: '10:30', endTime: '12:00' });
    expect([updated.startTime, updated.endTime, updated.durationMinutes]).toEqual(['10:30', '12:00', 90]);
  });

  it('reorders, shifts, duplicates, completes and deletes activities', async () => {
    const { r, trip } = await setup();
    const day = await r.itinerary.addDay(trip.id, '2026-07-30');
    const a = await r.itinerary.addActivity(day.id, { name: 'A' });
    const b = await r.itinerary.addActivity(day.id, { name: 'B' });
    const c = await r.itinerary.addActivity(day.id, { name: 'C' });
    await r.itinerary.reorderActivities(day.id, [c.id, a.id, b.id]);
    expect(await names(r, trip.id, '2026-07-30')).toEqual(['C', 'A', 'B']);
    await r.itinerary.shiftActivity(b.id, -1);
    expect(await names(r, trip.id, '2026-07-30')).toEqual(['C', 'B', 'A']);
    await r.itinerary.shiftActivity(c.id, -1); // already first: no-op
    expect(await names(r, trip.id, '2026-07-30')).toEqual(['C', 'B', 'A']);
    await r.itinerary.setActivityStatus(b.id, 'completed');
    const copy = await r.itinerary.duplicateActivity(b.id);
    expect(copy.status).toBe('planned');
    expect(await names(r, trip.id, '2026-07-30')).toEqual(['C', 'B', 'B', 'A']);
    await r.itinerary.deleteActivity(copy.id);
    expect(await names(r, trip.id, '2026-07-30')).toEqual(['C', 'B', 'A']);
    await expect(r.itinerary.setActivityStatus(a.id, 'nope' as never)).rejects.toMatchObject({ code: 'invalid_status' });
  });

  it('moves an activity to another day in another city, keeping its local time', async () => {
    const { r, trip } = await setup();
    await r.itinerary.syncDaysWithTrip(trip.id);
    const days = await r.itinerary.listDays(trip.id);
    const portoDay = days[0]!;
    const lisbonDay = days[4]!;
    await r.itinerary.addActivity(lisbonDay.id, { name: 'Already there' });
    const a = await r.itinerary.addActivity(portoDay.id, { name: 'Fado show', startTime: '21:00' });
    const moved = await r.itinerary.moveActivity(a.id, lisbonDay.id);
    expect(moved.dayId).toBe(lisbonDay.id);
    expect(moved.startTime).toBe('21:00');
    expect(moved.position).toBe(1);
    const other = await r.trips.create({ name: 'Other', startDate: '2026-09-01', endDate: '2026-09-02', currency: 'EUR' });
    const otherDay = await r.itinerary.addDay(other.id, '2026-09-01');
    await expect(r.itinerary.moveActivity(a.id, otherDay.id)).rejects.toMatchObject({ code: 'day_not_found' });
  });
});

describe('itinerary templates', () => {
  it('adapts to any trip length', () => {
    for (const key of ITINERARY_TEMPLATES) {
      const tpl = TEMPLATES[key];
      expect(planTemplateDays(tpl, 0)).toHaveLength(0);
      expect(planTemplateDays(tpl, 1)).toHaveLength(1);
      const five = planTemplateDays(tpl, 5);
      expect(five).toHaveLength(5);
      expect(five[0]).toBe(tpl.first);
      expect(five[4]).toBe(tpl.last);
      for (const day of [tpl.first, ...tpl.middle, tpl.last]) {
        for (const lang of ['en', 'fr', 'es'] as const) expect(day.title[lang].length).toBeGreaterThan(0);
        for (const act of day.activities) expect(act.startTime === null || /^\d{2}:\d{2}$/.test(act.startTime)).toBe(true);
      }
    }
  });

  it('applies a template in the user language and never overwrites a day title', async () => {
    const { r, trip } = await setup();
    await r.itinerary.syncDaysWithTrip(trip.id);
    const days = await r.itinerary.listDays(trip.id);
    await r.itinerary.updateDay(days[1]!.id, { title: 'My own title' });
    const added = await r.itinerary.applyTemplate(trip.id, 'vacation7', 'fr');
    expect(added).toBeGreaterThan(10);
    const after = await r.itinerary.listDays(trip.id);
    expect(after[0]!.title).toBe('Arrivée et installation');
    expect(after[1]!.title).toBe('My own title');
    expect(after[6]!.title).toBe('Retour');
    expect(after[0]!.activities.map((a) => a.name)).toContain('Arrivée');
  });
});

describe('bookings', () => {
  it('stores user-entered bookings as typed, including incomplete ones', async () => {
    const { r, trip } = await setup();
    const flight = await r.bookings.create(trip.id, { type: 'flight', provider: 'My airline', reference: '  ab12cd ', date: '2026-07-30', time: '07:15', endDate: '2026-07-30', endTime: '08:05', departureInfo: 'Home airport', arrivalInfo: 'Porto airport', priceMinor: 12999, currency: 'EUR' });
    expect(flight).toMatchObject({ reference: 'ab12cd', status: 'confirmed', time: '07:15', priceMinor: 12999 });
    const partial = await r.bookings.create(trip.id, { type: 'hotel', provider: 'Riverside guesthouse' });
    expect(missingBookingFields(partial)).toEqual(['reference', 'date', 'time']);
  });

  it.each([
    [{ type: 'flight' }, 'provider_or_reference_required'],
    [{ type: 'rocket', provider: 'x' }, 'invalid_type'],
    [{ type: 'hotel', provider: 'x', date: '2026-13-01' }, 'invalid_date'],
    [{ type: 'hotel', provider: 'x', time: '7h' }, 'invalid_time'],
    [{ type: 'hotel', provider: 'x', date: '2026-08-05', endDate: '2026-08-01' }, 'end_before_start'],
    [{ type: 'hotel', provider: 'x', priceMinor: -1 }, 'invalid_price'],
    [{ type: 'hotel', provider: 'x', currency: 'ABC' }, 'invalid_currency'],
    [{ type: 'hotel', provider: 'x', timeZone: 'Nowhere/City' }, 'invalid_time_zone'],
    [{ type: 'hotel', provider: 'x', url: 'ftp://files' }, 'invalid_url'],
  ])('rejects %o with %s', async (input, code) => {
    const { r, trip } = await setup();
    await expect(r.bookings.create(trip.id, input as never)).rejects.toMatchObject({ code });
  });

  it('accepts an arrival time earlier than departure on the same date (time zones)', async () => {
    const { r, trip } = await setup();
    const b = await r.bookings.create(trip.id, { type: 'flight', provider: 'x', date: '2026-07-30', time: '10:00', endDate: '2026-07-30', endTime: '09:30' });
    expect(b.endTime).toBe('09:30');
  });

  it('lists bookings chronologically, undated last, and filters upcoming ones', async () => {
    const { r, trip } = await setup();
    await r.bookings.create(trip.id, { type: 'other', provider: 'undated' });
    await r.bookings.create(trip.id, { type: 'train', provider: 'train', date: '2026-08-02', time: '09:00' });
    await r.bookings.create(trip.id, { type: 'restaurant', provider: 'dinner', date: '2026-07-30', time: '20:00' });
    await r.bookings.create(trip.id, { type: 'flight', provider: 'flight', date: '2026-07-30', time: '07:15' });
    await r.bookings.create(trip.id, { type: 'activity', provider: 'cancelled', date: '2026-08-01', status: 'cancelled' });
    await r.bookings.create(trip.id, { type: 'hotel', provider: 'hotel', date: '2026-07-30' });
    expect((await r.bookings.list(trip.id)).map((b) => b.provider)).toEqual(['flight', 'dinner', 'hotel', 'cancelled', 'train', 'undated']);
    expect((await r.bookings.upcoming(trip.id, '2026-07-31')).map((b) => b.provider)).toEqual(['train']);
  });

  it('updates and deletes a booking', async () => {
    const { r, trip } = await setup();
    const b = await r.bookings.create(trip.id, { type: 'hotel', provider: 'Hotel' });
    clock.set(() => new Date('2026-06-02T10:00:00.000Z'));
    const u = await r.bookings.update(b.id, { type: 'hotel', provider: 'Hotel', reference: 'XYZ', status: 'pending' });
    expect(u).toMatchObject({ reference: 'XYZ', status: 'pending', updatedAt: '2026-06-02T10:00:00.000Z' });
    await r.bookings.remove(b.id);
    expect(await r.bookings.list(trip.id)).toEqual([]);
    await expect(r.bookings.update(b.id, { type: 'hotel', provider: 'x' })).rejects.toMatchObject({ code: 'not_found' });
  });

  it('sorts by creation when date and time are equal', () => {
    const list = [
      { date: null, time: null, createdAt: '2' },
      { date: null, time: null, createdAt: '1' },
    ];
    expect(sortBookings(list).map((b) => b.createdAt)).toEqual(['1', '2']);
  });
});

describe('packing catalogue', () => {
  it('has at least 80 unique, translated items covering every category', () => {
    expect(PACKING_CATALOG.length).toBeGreaterThanOrEqual(80);
    expect(new Set(PACKING_CATALOG.map((i) => i.id)).size).toBe(PACKING_CATALOG.length);
    for (const lang of ['en', 'fr', 'es'] as const) {
      expect(new Set(PACKING_CATALOG.map((i) => i.name[lang])).size).toBe(PACKING_CATALOG.length);
      for (const i of PACKING_CATALOG) expect(i.name[lang].trim().length).toBeGreaterThan(2);
    }
    for (const c of PACKING_CATEGORIES.filter((x) => x !== 'custom')) expect(PACKING_CATALOG.some((i) => i.category === c)).toBe(true);
    for (const key of PACKING_TEMPLATES) expect(templateItems(key).length).toBeGreaterThanOrEqual(15);
    expect(catalogName(PACKING_CATALOG[0]!, 'de')).toBe(PACKING_CATALOG[0]!.name.en);
  });
});

describe('packing lists', () => {
  it('creates a list from a template in the user language and tracks progress', async () => {
    const { r, trip } = await setup();
    const list = await r.packing.createFromBuiltIn(trip.id, 'beach', 'Beach bag', 'es');
    expect(list.templateKey).toBe('beach');
    expect(list.total).toBe(templateItems('beach').length);
    expect(list.items.map((i) => i.name)).toContain('Protector solar');
    expect(packingProgress(list.items)).toBe(0);
    for (const item of list.items.slice(0, 3)) await r.packing.setPacked(item.id, true);
    const after = (await r.packing.getList(list.id))!;
    expect(after.packed).toBe(3);
    await r.packing.resetList(list.id);
    expect((await r.packing.getList(list.id))!.packed).toBe(0);
    expect(packingProgress([])).toBeNull();
  });

  it('adds, edits, validates and deletes items', async () => {
    const { r, trip } = await setup();
    const list = await r.packing.createList(trip.id, 'Mine');
    const item = await r.packing.addItem(list.id, { name: 'Camera', category: 'electronics', quantity: 1 });
    await r.packing.updateItem(item.id, { name: 'Camera + spare battery', category: 'electronics', quantity: 2, priority: 'high', notes: 'charged', packed: true });
    const stored = (await r.packing.getList(list.id))!.items[0]!;
    expect(stored).toMatchObject({ name: 'Camera + spare battery', quantity: 2, priority: 'high', notes: 'charged', packed: true });
    await expect(r.packing.addItem(list.id, { name: 'x', quantity: 0 })).rejects.toMatchObject({ code: 'invalid_quantity' });
    await expect(r.packing.addItem(list.id, { name: '' })).rejects.toMatchObject({ code: 'name_required' });
    await expect(r.packing.addItem('missing', { name: 'x' })).rejects.toMatchObject({ code: 'not_found' });
    await r.packing.deleteItem(item.id);
    expect((await r.packing.getList(list.id))!.total).toBe(0);
  });

  it('saves a list as a personal template and reuses it unpacked on another trip', async () => {
    const { r, trip } = await setup();
    const list = await r.packing.createList(trip.id, 'Hiking kit', [{ name: 'Boots', category: 'clothing', packed: true }, { name: 'Map', category: 'essentials' }]);
    const tpl = await r.packing.saveAsTemplate(list.id, 'Hiking');
    expect(tpl).toMatchObject({ isTemplate: true, tripId: null, total: 2, packed: 0 });
    expect((await r.packing.userTemplates()).map((t) => t.name)).toEqual(['Hiking']);
    const other = await r.trips.create({ name: 'Alps', currency: 'CHF' });
    const reused = await r.packing.createFromUserTemplate(other.id, tpl.id);
    expect(reused).toMatchObject({ name: 'Hiking', total: 2, packed: 0, isTemplate: false });
    // Trip lists never include templates.
    expect((await r.packing.listsForTrip(trip.id)).map((l) => l.name)).toEqual(['Hiking kit']);
    // Deleting the trip keeps the personal template.
    await r.trips.remove(trip.id);
    expect(await r.packing.userTemplates()).toHaveLength(1);
  });

  it('feeds the trip preparation summary', async () => {
    const { r, trip } = await setup();
    const list = await r.packing.createList(trip.id, 'Bag', [{ name: 'A' }, { name: 'B' }, { name: 'C' }, { name: 'D' }]);
    await r.packing.setPacked(list.items[0]!.id, true);
    await r.packing.setPacked(list.items[1]!.id, true);
    await r.packing.setPacked(list.items[2]!.id, true);
    expect((await r.trips.summaries([trip.id])).get(trip.id)).toMatchObject({ packed: 3, packingTotal: 4 });
  });
});

describe('overview helpers', () => {
  it('selects the next planned activities from today', async () => {
    const { r, trip } = await setup();
    await r.itinerary.syncDaysWithTrip(trip.id);
    const days = await r.itinerary.listDays(trip.id);
    await r.itinerary.addActivity(days[0]!.id, { name: 'Past' });
    const done = await r.itinerary.addActivity(days[2]!.id, { name: 'Done' });
    await r.itinerary.setActivityStatus(done.id, 'completed');
    await r.itinerary.addActivity(days[2]!.id, { name: 'Next 1', startTime: '10:00' });
    await r.itinerary.addActivity(days[3]!.id, { name: 'Next 2' });
    expect(nextActivities(await r.itinerary.listDays(trip.id), '2026-08-01').map((a) => a.name)).toEqual(['Next 1', 'Next 2']);
  });

  it('normalises links safely', () => {
    expect(normalizeUrl('example.com')).toBe('https://example.com');
    expect(normalizeUrl('  ')).toBeNull();
    expect(() => normalizeUrl('javascript:alert(1)')).toThrow();
  });
});
