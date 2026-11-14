import { createTestDatabase } from '@factory/testing';
import * as Notifications from 'expo-notifications';

import { DEPARTURE_TASKS } from '@/content/departureTasks';
import { initDatabase, setRepositories, type Repositories } from '@/database';
import { sortTasks, taskProgress } from '@/database/repositories/checklists';
import { MAX_DOCUMENT_BYTES, checkFile, expiryStatus } from '@/database/repositories/documents';
import { MAX_PHOTOS_PER_ENTRY } from '@/database/repositories/journal';
import { mapLinks, parseCoordinates } from '@/database/repositories/places';
import { weatherPackingSuggestions } from '@/database/repositories/weather';
import { isUnlockValid, lockAvailability, UNLOCK_DURATION_MS } from '@/services/documentLock';
import { isFutureInstant, reminderInstant, scheduleTaskReminder } from '@/services/reminders';
import { clock } from '@/utils/clock';
import { extensionFor } from '@/utils/paths';

let tick = 0;
beforeEach(() => {
  tick = 0;
  clock.set(() => new Date(Date.UTC(2026, 5, 1, 10, 0, tick++)));
});
afterEach(() => clock.set(null));

async function setup(): Promise<{ r: Repositories; tripId: string; destinations: string[] }> {
  const r = await initDatabase(await createTestDatabase());
  setRepositories(r);
  const trip = await r.trips.create({
    name: 'Japan',
    startDate: '2026-07-30',
    endDate: '2026-08-05',
    currency: 'JPY',
    destinations: [
      { city: 'Tokyo', countryCode: 'JP', startDate: '2026-07-30', endDate: '2026-08-02' },
      { city: 'Kyoto', countryCode: 'JP', startDate: '2026-08-02', endDate: '2026-08-05' },
    ],
  });
  return { r, tripId: trip.id, destinations: trip.destinations.map((d) => d.id) };
}

const pdf = (n = 1) => ({ uri: `file:///data/app/files/travelwise/documents/doc${n}.pdf`, mimeType: 'application/pdf', sizeBytes: 120_000 });

describe('travel documents', () => {
  it('accepts only PDFs and images within the size limit', () => {
    expect(checkFile('application/pdf', 1000)).toBeNull();
    expect(checkFile('IMAGE/JPEG', 1000)).toBeNull();
    expect(checkFile('image/heic', 1000)).toBeNull();
    expect(checkFile('application/zip', 1000)).toBe('unsupported_file');
    expect(checkFile(null, 1000)).toBe('unsupported_file');
    expect(checkFile('application/pdf', MAX_DOCUMENT_BYTES + 1)).toBe('file_too_large');
    expect(checkFile('application/pdf', null)).toBe('file_too_large');
  });

  it('stores metadata and a private file reference, never the file content', async () => {
    const { r, tripId } = await setup();
    const doc = await r.documents.create({ title: ' Flight to Tokyo ', type: 'flight_ticket', tripId, expiresOn: '2026-07-30' }, pdf());
    expect(doc).toMatchObject({ title: 'Flight to Tokyo', type: 'flight_ticket', tripId, fileUri: pdf().uri, mimeType: 'application/pdf', sizeBytes: 120_000 });
    const cols = await r.db.getAllAsync<{ name: string }>('PRAGMA table_info(travel_documents)', []);
    expect(cols.map((c) => c.name)).not.toContain('content');
    await expect(r.documents.create({ title: ' ', type: 'visa' }, pdf())).rejects.toMatchObject({ code: 'title_required' });
    await expect(r.documents.create({ title: 'x', type: 'visa' }, { ...pdf(), mimeType: 'text/html' })).rejects.toMatchObject({ code: 'unsupported_file' });
    await expect(r.documents.create({ title: 'x', type: 'visa', expiresOn: '2026-13-01' }, pdf())).rejects.toMatchObject({ code: 'invalid_date' });
  });

  it('lists by trip / unassigned / all, updates and deletes (detaching bookings)', async () => {
    const { r, tripId } = await setup();
    const a = await r.documents.create({ title: 'Ticket', type: 'flight_ticket', tripId }, pdf(1));
    await r.documents.create({ title: 'Insurance', type: 'insurance' }, pdf(2));
    expect((await r.documents.list(tripId)).map((d) => d.title)).toEqual(['Ticket']);
    expect((await r.documents.list(null)).map((d) => d.title)).toEqual(['Insurance']);
    expect(await r.documents.list()).toHaveLength(2);
    const b = await r.bookings.create(tripId, { type: 'flight', provider: 'Air', attachmentDocumentId: a.id });
    const updated = await r.documents.update(a.id, { title: 'Ticket JL', type: 'flight_ticket', tripId: null, notes: 'Seat 12A' });
    expect(updated).toMatchObject({ title: 'Ticket JL', tripId: null, notes: 'Seat 12A' });
    expect(await r.documents.remove(a.id)).toBe(pdf(1).uri);
    expect((await r.bookings.get(b.id))!.attachmentDocumentId).toBeNull();
    expect(await r.documents.remove('missing')).toBeNull();
    await expect(r.documents.update('missing', { title: 'x', type: 'other' })).rejects.toMatchObject({ code: 'not_found' });
  });

  it('flags expiry from the user-entered date only', () => {
    expect(expiryStatus(null, '2026-06-01')).toBeNull();
    expect(expiryStatus('2026-05-31', '2026-06-01')).toBe('expired');
    expect(expiryStatus('2026-06-20', '2026-06-01')).toBe('soon');
    expect(expiryStatus('2027-01-01', '2026-06-01')).toBeNull();
  });

  it('returns the files of documents, places and journal photos when a trip is deleted', async () => {
    const { r, tripId } = await setup();
    await r.documents.create({ title: 'Ticket', type: 'flight_ticket', tripId }, pdf(1));
    await r.places.create({ name: 'Shrine', tripId, photoUri: 'file:///data/app/files/travelwise/photos/p.jpg' });
    await r.journal.create(tripId, { date: '2026-07-30', body: 'Arrived', photoUris: ['file:///data/app/files/travelwise/photos/j.jpg'] });
    const { fileUris } = await r.trips.remove(tripId);
    expect(fileUris.sort()).toEqual([pdf(1).uri, 'file:///data/app/files/travelwise/photos/j.jpg', 'file:///data/app/files/travelwise/photos/p.jpg'].sort());
    expect(await r.documents.list()).toEqual([]);
  });

  it('names stored copies by type, not by the original (possibly personal) file name', () => {
    expect(extensionFor('application/pdf', 'Passport John Smith.pdf')).toBe('pdf');
    expect(extensionFor('image/jpeg')).toBe('jpg');
    expect(extensionFor('application/octet-stream', 'scan.PNG')).toBe('png');
    expect(extensionFor('application/octet-stream')).toBe('bin');
  });
});

describe('optional documents lock', () => {
  it('keeps an unlock only for a few minutes', () => {
    expect(isUnlockValid(null, 1000)).toBe(false);
    expect(isUnlockValid(1000, 1000 + UNLOCK_DURATION_MS - 1)).toBe(true);
    expect(isUnlockValid(1000, 1000 + UNLOCK_DURATION_MS)).toBe(false);
    expect(isUnlockValid(5000, 1000)).toBe(false);
  });

  it('is only offered when the phone has a screen lock or biometrics', async () => {
    const auth = jest.requireMock('expo-local-authentication') as { getEnrolledLevelAsync: jest.Mock };
    auth.getEnrolledLevelAsync.mockResolvedValueOnce(0);
    expect(await lockAvailability()).toBe('no_device_security');
    auth.getEnrolledLevelAsync.mockResolvedValueOnce(3);
    expect(await lockAvailability()).toBe('available');
    auth.getEnrolledLevelAsync.mockRejectedValueOnce(new Error('no hardware'));
    expect(await lockAvailability()).toBe('no_device_security');
  });
});

describe('departure checklist', () => {
  it('creates one checklist per trip and validates tasks', async () => {
    const { r, tripId } = await setup();
    const a = await r.checklists.ensureChecklist(tripId, 'Before departure');
    const b = await r.checklists.ensureChecklist(tripId, 'Other name');
    expect(b.id).toBe(a.id);
    await expect(r.checklists.add(a.id, { title: '' })).rejects.toMatchObject({ code: 'title_required' });
    await expect(r.checklists.add(a.id, { title: 'x', dueDate: '2026-02-30' })).rejects.toMatchObject({ code: 'invalid_date' });
    await expect(r.checklists.add(a.id, { title: 'x', reminderAt: 'tomorrow' })).rejects.toMatchObject({ code: 'invalid_reminder' });
    const item = await r.checklists.add(a.id, { title: 'Book accommodation', priority: 'high', dueDate: '2026-07-01' });
    const u = await r.checklists.update(item.id, { title: 'Book the Kyoto ryokan', priority: 'high', status: 'in_progress', reminderAt: '2026-06-20T07:00:00.000Z' });
    expect(u).toMatchObject({ title: 'Book the Kyoto ryokan', status: 'in_progress', reminderAt: '2026-06-20T07:00:00.000Z', dueDate: null });
  });

  it('sorts open tasks by due date and priority, done last, and computes progress', () => {
    const base = { checklistId: 'c', notes: '', reminderAt: null, notificationId: null };
    const items = [
      { ...base, id: 'done', title: 'd', dueDate: '2026-06-01', priority: 'high' as const, status: 'done' as const, position: 0 },
      { ...base, id: 'late', title: 'l', dueDate: '2026-07-10', priority: 'low' as const, status: 'todo' as const, position: 1 },
      { ...base, id: 'soon', title: 's', dueDate: '2026-06-10', priority: 'low' as const, status: 'todo' as const, position: 2 },
      { ...base, id: 'urgent', title: 'u', dueDate: '2026-06-10', priority: 'high' as const, status: 'todo' as const, position: 3 },
      { ...base, id: 'nodate', title: 'n', dueDate: null, priority: 'high' as const, status: 'todo' as const, position: 4 },
    ];
    expect(sortTasks(items).map((i) => i.id)).toEqual(['urgent', 'soon', 'late', 'nodate', 'done']);
    expect(taskProgress(items)).toBe(0.2);
    expect(taskProgress([])).toBeNull();
  });

  it('adds suggested tasks once, in the user language, with due dates relative to departure (never in the past)', async () => {
    const { r, tripId } = await setup();
    const n = await r.checklists.addSuggested(tripId, 'Avant le départ', 'fr', { international: false, startDate: '2026-07-30', today: '2026-07-10' });
    expect(n).toBe(DEPARTURE_TASKS.filter((t) => !t.international).length);
    const items = await r.checklists.items(tripId);
    expect(items.map((i) => i.title)).toContain("Réserver l'hébergement");
    expect(items.some((i) => i.title.includes('visa'))).toBe(false);
    // 30 days before 30 July is in the past (30 June < 10 July): clamped to today.
    expect(items.find((i) => i.title === "Réserver l'hébergement")!.dueDate).toBe('2026-07-10');
    expect(items.find((i) => i.title === 'Faire l’enregistrement en ligne si possible' || i.title === "Faire l'enregistrement en ligne si possible")!.dueDate).toBe('2026-07-29');
    // Second call: only the international tasks are new.
    const more = await r.checklists.addSuggested(tripId, 'Avant le départ', 'fr', { international: true, startDate: '2026-07-30', today: '2026-07-10' });
    expect(more).toBe(DEPARTURE_TASKS.filter((t) => t.international).length);
    expect(await r.checklists.addSuggested(tripId, 'Avant le départ', 'fr', { international: true, startDate: '2026-07-30', today: '2026-07-10' })).toBe(0);
  });

  it('tracks reminders and their notification ids', async () => {
    const { r, tripId } = await setup();
    const list = await r.checklists.ensureChecklist(tripId, 'Before');
    const t1 = await r.checklists.add(list.id, { title: 'Check-in', reminderAt: '2026-07-29T08:00:00.000Z' });
    await r.checklists.add(list.id, { title: 'Past', reminderAt: '2026-05-01T08:00:00.000Z' });
    await r.checklists.setNotificationId(t1.id, 'task-x');
    expect((await r.checklists.pendingReminders('2026-06-01T10:00:00.000Z')).map((i) => i.title)).toEqual(['Check-in']);
    expect(await r.checklists.notificationIds(tripId)).toEqual(['task-x']);
    expect(await r.checklists.remove(t1.id)).toBe('task-x');
  });
});

describe('local reminders', () => {
  const notif = Notifications as unknown as { scheduleNotificationAsync: jest.Mock; cancelScheduledNotificationAsync: jest.Mock; getPermissionsAsync: jest.Mock };
  beforeEach(() => jest.clearAllMocks());

  it('builds reminder instants from the local date and time of the phone', () => {
    const iso = reminderInstant('2026-07-29', '08:30');
    const d = new Date(iso);
    expect([d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes()]).toEqual([2026, 7, 29, 8, 30]);
    expect(isFutureInstant('2026-06-01T09:00:00.000Z', new Date('2026-06-01T10:00:00.000Z'))).toBe(false);
    expect(isFutureInstant(null)).toBe(false);
  });

  it('schedules a one-shot local notification and stores its id', async () => {
    const { r, tripId } = await setup();
    const list = await r.checklists.ensureChecklist(tripId, 'Before');
    const item = await r.checklists.add(list.id, { title: 'Online check-in', reminderAt: '2026-07-29T06:00:00.000Z' });
    const id = await scheduleTaskReminder(item, 'TravelWise · Japan');
    expect(id).toBe(`task-${item.id}`);
    const req = notif.scheduleNotificationAsync.mock.calls[0]![0];
    expect(req.content).toEqual({ title: 'TravelWise · Japan', body: 'Online check-in' });
    expect(req.trigger).toMatchObject({ type: 'date', date: new Date('2026-07-29T06:00:00.000Z') });
    expect((await r.checklists.get(item.id))!.notificationId).toBe(id);
  });

  it('does not schedule for done tasks, past times or without permission, and cancels the old one', async () => {
    const { r, tripId } = await setup();
    const list = await r.checklists.ensureChecklist(tripId, 'Before');
    const item = await r.checklists.add(list.id, { title: 'x', reminderAt: '2026-07-29T06:00:00.000Z' });
    expect(await scheduleTaskReminder({ ...item, status: 'done', notificationId: 'old' }, 'h')).toBeNull();
    expect(notif.cancelScheduledNotificationAsync).toHaveBeenCalledWith('old');
    expect(await scheduleTaskReminder({ ...item, reminderAt: '2026-05-01T00:00:00.000Z' }, 'h')).toBeNull();
    notif.getPermissionsAsync.mockResolvedValueOnce({ status: 'denied', canAskAgain: false });
    expect(await scheduleTaskReminder(item, 'h')).toBeNull();
    expect(notif.scheduleNotificationAsync).not.toHaveBeenCalled();
  });
});

describe('places', () => {
  it('parses only real coordinate pairs typed by the user', () => {
    expect(parseCoordinates('38.7223, -9.1393')).toEqual({ latitude: 38.7223, longitude: -9.1393 });
    expect(parseCoordinates('35,0116; 135,7681')).toEqual({ latitude: 35.0116, longitude: 135.7681 });
    expect(parseCoordinates('95, 10')).toBeNull();
    expect(parseCoordinates('10, 200')).toBeNull();
    expect(parseCoordinates('Lisbon')).toBeNull();
  });

  it('validates, filters, favourites and returns replaced photos', async () => {
    const { r, tripId } = await setup();
    await expect(r.places.create({ name: 'x', latitude: 10 })).rejects.toMatchObject({ code: 'invalid_coordinates' });
    await expect(r.places.create({ name: '' })).rejects.toMatchObject({ code: 'name_required' });
    await expect(r.places.create({ name: 'x', countryCode: 'JPN' })).rejects.toMatchObject({ code: 'invalid_country' });
    const shrine = await r.places.create({ name: 'Fushimi shrine', city: 'Kyoto', category: 'attraction', tripId, photoUri: 'file:///p1.jpg' });
    await r.places.create({ name: 'Ramen bar', city: 'Tokyo', category: 'restaurant', isFavorite: true });
    await r.places.create({ name: 'Home', category: 'personal', address: '1 Home Street' });
    expect((await r.places.list()).map((p) => p.name)).toEqual(['Ramen bar', 'Fushimi shrine', 'Home']);
    expect((await r.places.list({ favorites: true })).map((p) => p.name)).toEqual(['Ramen bar']);
    expect((await r.places.list({ category: 'attraction' })).map((p) => p.name)).toEqual(['Fushimi shrine']);
    expect((await r.places.list({ search: 'kyoto' })).map((p) => p.name)).toEqual(['Fushimi shrine']);
    expect((await r.places.list({ tripId })).map((p) => p.name)).toEqual(['Fushimi shrine']);
    const { replacedPhoto } = await r.places.update(shrine.id, { name: 'Fushimi Inari', tripId, photoUri: 'file:///p2.jpg' });
    expect(replacedPhoto).toBe('file:///p1.jpg');
    await r.places.setFavorite(shrine.id, true);
    expect((await r.places.get(shrine.id))!.isFavorite).toBe(true);
    expect(await r.places.remove(shrine.id)).toBe('file:///p2.jpg');
  });

  it('links a place to a day and an activity; deleting it keeps the activity', async () => {
    const { r, tripId } = await setup();
    const day = await r.itinerary.addDay(tripId, '2026-08-03');
    const place = await r.places.create({ name: 'Temple', tripId });
    await r.places.assignDay(place.id, day.id);
    expect((await r.places.get(place.id))!.dayId).toBe(day.id);
    const act = await r.itinerary.addActivity(day.id, { name: 'Temple visit', placeId: place.id });
    await r.places.remove(place.id);
    expect((await r.itinerary.getActivity(act.id))!.placeId).toBeNull();
  });

  it('builds map links without inventing coordinates', () => {
    expect(mapLinks({ name: 'Temple', address: '', city: 'Kyoto', latitude: null, longitude: null })).toEqual({
      geo: 'geo:0,0?q=Temple%2C%20Kyoto',
      web: 'https://www.google.com/maps/search/?api=1&query=Temple%2C%20Kyoto',
    });
    expect(mapLinks({ name: 'Spot', address: '', city: '', latitude: 35.01, longitude: 135.76 })!.geo).toBe('geo:35.01,135.76?q=35.01,135.76(Spot)');
    expect(mapLinks({ name: '', address: '', city: '', latitude: null, longitude: null })).toBeNull();
  });
});

describe('travel journal', () => {
  it('keeps a chronological timeline with local photos', async () => {
    const { r, tripId } = await setup();
    await r.journal.create(tripId, { date: '2026-07-31', title: 'Day 2', body: 'Temples' });
    await r.journal.create(tripId, { date: '2026-07-30', title: 'Arrival', photoUris: ['file:///a.jpg', 'file:///a.jpg', 'file:///b.jpg'] });
    const list = await r.journal.list(tripId);
    expect(list.map((e) => e.title)).toEqual(['Arrival', 'Day 2']);
    expect(list[0]!.photoUris).toEqual(['file:///a.jpg', 'file:///b.jpg']);
    await expect(r.journal.create(tripId, { date: '2026-07-30' })).rejects.toMatchObject({ code: 'empty_entry' });
    await expect(r.journal.create(tripId, { date: 'yesterday', body: 'x' })).rejects.toMatchObject({ code: 'invalid_date' });
    const many = Array.from({ length: MAX_PHOTOS_PER_ENTRY + 1 }, (_, i) => `file:///${i}.jpg`);
    await expect(r.journal.create(tripId, { date: '2026-07-30', photoUris: many })).rejects.toMatchObject({ code: 'too_many_photos' });
  });

  it('reports removed photos on update and all photos on delete', async () => {
    const { r, tripId } = await setup();
    const e = await r.journal.create(tripId, { date: '2026-07-30', body: 'x', photoUris: ['file:///a.jpg', 'file:///b.jpg'] });
    const { removedPhotos, entry } = await r.journal.update(e.id, { date: '2026-07-30', body: 'x', city: 'Tokyo', photoUris: ['file:///b.jpg', 'file:///c.jpg'] });
    expect(removedPhotos).toEqual(['file:///a.jpg']);
    expect(entry.city).toBe('Tokyo');
    expect(await r.journal.remove(e.id)).toEqual(['file:///b.jpg', 'file:///c.jpg']);
    expect(await r.journal.remove(e.id)).toEqual([]);
  });
});

describe('weather notes', () => {
  it('saves one note per trip and per destination, validating temperatures', async () => {
    const { r, tripId, destinations } = await setup();
    await r.weather.save(tripId, null, { conditions: ['hot', 'humid'], minTempC: 24, maxTempC: 34 });
    await r.weather.save(tripId, destinations[1]!, { conditions: ['rain'], notes: 'Rainy season' });
    await r.weather.save(tripId, null, { conditions: ['hot'], minTempC: 25, maxTempC: 33 });
    expect(await r.weather.list(tripId)).toHaveLength(2);
    expect((await r.weather.get(tripId))!.conditions).toEqual(['hot']);
    expect((await r.weather.get(tripId, destinations[1]!))!.notes).toBe('Rainy season');
    await expect(r.weather.save(tripId, null, { conditions: ['tornado' as never] })).rejects.toMatchObject({ code: 'invalid_condition' });
    await expect(r.weather.save(tripId, null, { conditions: [], minTempC: 30, maxTempC: 10 })).rejects.toMatchObject({ code: 'invalid_temperature' });
    await expect(r.weather.save(tripId, null, { conditions: [], maxTempC: 99 })).rejects.toMatchObject({ code: 'invalid_temperature' });
  });

  it('suggests packing items from the conditions and temperatures typed by the user', () => {
    const ids = (n: Parameters<typeof weatherPackingSuggestions>[0]) => weatherPackingSuggestions(n).map((i) => i.id);
    expect(ids(null)).toEqual([]);
    expect(ids({ conditions: ['rain'], minTempC: null, maxTempC: null })).toEqual(expect.arrayContaining(['clo-rain-jacket', 'acc-umbrella']));
    const cold = ids({ conditions: [], minTempC: -2, maxTempC: 4 });
    expect(cold).toEqual(expect.arrayContaining(['clo-winter-coat', 'clo-gloves']));
    expect(ids({ conditions: [], minTempC: 22, maxTempC: 31 })).toEqual(expect.arrayContaining(['toi-sunscreen', 'ess-water-bottle']));
    expect(ids({ conditions: [], minTempC: 15, maxTempC: 22 })).toEqual([]);
  });
});
