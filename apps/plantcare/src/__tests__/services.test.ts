import { createTestDatabase } from '@factory/testing';
import * as Notifications from 'expo-notifications';
import * as ImagePicker from 'expo-image-picker';

import { initDatabase, type Repositories } from '@/database';
import { initI18n } from '@/i18n';
import { clock } from '@/services/clock';
import { buildCareReportHtml, escapeHtml } from '@/services/dataService';
import { isSafePhotoPath, photoUri, takePhoto } from '@/services/photos';
import { notificationText, refreshReminders } from '@/services/reminders';
import { usePreferences } from '@/store/preferences';

const scheduled = (Notifications as unknown as { __scheduled: { identifier: string; content: { title: string; body: string }; trigger: { date: Date } }[] }).__scheduled;

async function setup(): Promise<Repositories> {
  const repos = await initDatabase(await createTestDatabase(), () => new Date('2026-05-10T08:00:00'));
  return repos;
}

beforeEach(() => {
  scheduled.splice(0, scheduled.length);
  clock.set(() => new Date('2026-05-10T08:00:00'));
  usePreferences.setState({ notificationsEnabled: true, reminderHour: 9, reminderMinute: 0 });
  (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted', canAskAgain: true });
});
afterAll(() => clock.set(null));

describe('reminders service', () => {
  it('schedules one grouped notification per day at the chosen time', async () => {
    const i18n = await initI18n('en', []);
    const r = await setup();
    const a = await r.plants.create({ nickname: 'Monty', commonName: '', scientificName: null, speciesId: null, category: 'tropical', photoPath: null, acquiredOn: null, plantedOn: null, locationId: null, description: '', notes: '', favorite: false });
    const b = await r.plants.create({ nickname: 'Basil', commonName: '', scientificName: null, speciesId: null, category: 'herb', photoPath: null, acquiredOn: null, plantedOn: null, locationId: null, description: '', notes: '', favorite: false });
    await r.tasks.create({ plantId: a.id, type: 'watering', nextDue: '2026-05-10', intervalDays: 7, priority: 'normal', notes: '', amountMl: null, remindersEnabled: true });
    await r.tasks.create({ plantId: b.id, type: 'watering', nextDue: '2026-05-10', intervalDays: 3, priority: 'normal', notes: '', amountMl: null, remindersEnabled: true });
    const n = await refreshReminders(r, i18n.t);
    // Today (2 tasks grouped) + future occurrences within the 14-day horizon: next due only.
    expect(n).toBe(1);
    expect(scheduled).toHaveLength(1);
    expect(scheduled[0]!.content.body).toContain('Monty');
    expect(scheduled[0]!.content.body).toContain('Basil');
    const at = scheduled[0]!.trigger.date;
    expect([at.getHours(), at.getMinutes()]).toEqual([9, 0]);
  });

  it('re-planning replaces old notifications instead of piling them up', async () => {
    const i18n = await initI18n('en', []);
    const r = await setup();
    const p = await r.plants.create({ nickname: 'Monty', commonName: '', scientificName: null, speciesId: null, category: 'tropical', photoPath: null, acquiredOn: null, plantedOn: null, locationId: null, description: '', notes: '', favorite: false });
    const t = await r.tasks.create({ plantId: p.id, type: 'watering', nextDue: '2026-05-10', intervalDays: 7, priority: 'normal', notes: '', amountMl: null, remindersEnabled: true });
    await refreshReminders(r, i18n.t);
    await r.tasks.complete(t.id, '2026-05-10');
    await refreshReminders(r, i18n.t);
    expect(scheduled.map((s) => s.identifier)).toEqual(['care-2026-05-17']);
  });

  it('schedules nothing when notifications are disabled or permission is refused', async () => {
    const i18n = await initI18n('en', []);
    const r = await setup();
    const p = await r.plants.create({ nickname: 'Monty', commonName: '', scientificName: null, speciesId: null, category: 'tropical', photoPath: null, acquiredOn: null, plantedOn: null, locationId: null, description: '', notes: '', favorite: false });
    await r.tasks.create({ plantId: p.id, type: 'watering', nextDue: '2026-05-12', intervalDays: 7, priority: 'normal', notes: '', amountMl: null, remindersEnabled: true });
    usePreferences.setState({ notificationsEnabled: false });
    expect(await refreshReminders(r, i18n.t)).toBe(0);
    usePreferences.setState({ notificationsEnabled: true });
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied', canAskAgain: false });
    expect(await refreshReminders(r, i18n.t)).toBe(0);
    expect(scheduled).toHaveLength(0);
  });

  it('builds localized texts', async () => {
    const i18n = await initI18n('fr', []);
    const one = notificationText({ id: 'x', day: '2026-05-10', hour: 9, minute: 0, overdue: false, items: [{ taskId: 't', plantId: 'p', plantName: 'Monty', type: 'watering' }] }, i18n.t);
    expect(one.body).toContain('Monty');
    const many = notificationText(
      { id: 'x', day: '2026-05-10', hour: 9, minute: 0, overdue: true, items: ['A', 'B', 'C', 'D'].map((n) => ({ taskId: n, plantId: n, plantName: n, type: 'pruning' as const })) },
      i18n.t,
    );
    expect(many.title).toBe('Des plantes vous attendent');
    expect(many.body).toContain('4 soins');
    expect(many.body).toContain('…');
  });

  it('handles time-zone changes: day keys stay on the planned local day', () => {
    // A task planned for 2026-05-10 is due "today" whatever the UTC offset of the device.
    clock.set(() => new Date(2026, 4, 10, 23, 30));
    expect(clock.today()).toBe('2026-05-10');
    clock.set(() => new Date(2026, 4, 11, 0, 15));
    expect(clock.today()).toBe('2026-05-11');
  });
});

describe('photos', () => {
  it('only accepts its own relative paths', () => {
    expect(isSafePhotoPath('photos/ph_abc123.jpg')).toBe(true);
    expect(isSafePhotoPath('../photos/x.jpg')).toBe(false);
    expect(isSafePhotoPath('file:///sdcard/x.jpg')).toBe(false);
    expect(isSafePhotoPath('photos/x.exe')).toBe(false);
    expect(photoUri('https://example.com/x.jpg')).toBeNull();
  });

  it('reports a refused camera permission instead of failing', async () => {
    (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'denied' });
    expect(await takePhoto()).toEqual({ status: 'denied' });
  });
});

describe('PDF care report', () => {
  it('escapes user content and lists plants with their schedule', async () => {
    const i18n = await initI18n('en', []);
    const r = await setup();
    const p = await r.plants.create({ nickname: '<b>Monty</b>', commonName: 'Swiss cheese plant', scientificName: 'Monstera deliciosa', speciesId: 'monstera-deliciosa', category: 'tropical', photoPath: null, acquiredOn: null, plantedOn: null, locationId: null, description: '', notes: 'a & b', favorite: false });
    await r.tasks.create({ plantId: p.id, type: 'watering', nextDue: '2026-05-01', intervalDays: 7, priority: 'normal', notes: '', amountMl: null, remindersEnabled: true });
    const html = await buildCareReportHtml(r, i18n.t, '2026-05-10');
    expect(html).toContain('&lt;b&gt;Monty&lt;/b&gt;');
    expect(html).not.toContain('<b>Monty</b>');
    expect(html).toContain('<i>Monstera deliciosa</i>');
    expect(html).toContain('a &amp; b');
    expect(html).toContain('Every 7 days');
    expect(html).toContain('overdue');
    expect(escapeHtml(`"'`)).toBe('&quot;&#39;');
  });
});
