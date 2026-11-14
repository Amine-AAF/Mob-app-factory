import { createTestDatabase } from '@factory/testing';

import { initDatabase, type Repositories } from '@/database';
import { SCHEMA_VERSION, USER_TABLES } from '@/database/migrations';
import { importGuestsCsv } from '@/domain/csv';
import type { EventInput, GuestInput } from '@/domain/types';
import { buildCsv } from '@/reports/csv';
import { buildReportHtml, invitationHtml, invitationText, type ReportContext } from '@/reports/html';
import { deleteAllUserData, exportUserData, importUserData } from '@/services/backupService';

const NOW = new Date('2027-03-01T10:00:00.000Z');
const clock = { now: () => NOW };

async function setup(): Promise<{ r: Repositories; close: () => void }> {
  const db = await createTestDatabase();
  const r = await initDatabase(db, clock);
  return { r, close: () => db.close() };
}

const baseEvent = (over: Partial<EventInput> = {}): EventInput => ({
  name: 'Léa & Sam',
  typeId: 'wedding',
  coverUri: null,
  description: '',
  startDate: '2027-09-18',
  startTime: '15:00',
  endDate: null,
  endTime: '02:00',
  timezone: 'Europe/Lisbon',
  venue: 'Quinta',
  address: 'Sintra',
  expectedGuests: 100,
  budgetMinor: 2_000_000,
  currency: 'EUR',
  notes: '',
  status: 'planning',
  theme: 'wedding',
  templateId: null,
  ...over,
});

const baseGuest = (eventId: string, over: Partial<GuestInput> = {}): GuestInput => ({
  eventId,
  groupId: null,
  firstName: 'Ana',
  lastName: 'Silva',
  phone: '',
  email: '',
  category: 'family',
  plusOnes: 0,
  children: 0,
  isChild: false,
  dietary: '',
  notes: '',
  rsvpStatus: 'invited',
  rsvpRespondedAt: null,
  rsvpNote: '',
  ...over,
});

const ctx: ReportContext = {
  t: (k, o) => (o ? `${k}${JSON.stringify(o)}` : k),
  money: (m, c) => `${(m / 100).toFixed(2)} ${c}`,
  day: (d) => d,
  time: (m) => `${Math.floor(m / 60) % 24}:${String(m % 60).padStart(2, '0')}`,
  eventStart: (e) => `${e.startDate} ${e.startTime ?? ''}`,
  percent: (r) => `${Math.round(r * 100)}%`,
  generatedOn: '2027-03-01',
};

describe('database', () => {
  it('migrates to the latest schema and seeds event types', async () => {
    const { r, close } = await setup();
    const v = await r.db.getFirstAsync<{ user_version: number }>('PRAGMA user_version', []);
    expect(v?.user_version).toBe(SCHEMA_VERSION);
    const types = await r.db.getAllAsync<{ id: string }>('SELECT id FROM event_types', []);
    expect(types).toHaveLength(14);
    close();
  });

  it('creates an event from a template in one transaction, in the event zone', async () => {
    const { r, close } = await setup();
    const e = await r.events.create(baseEvent(), { templateId: 'wedding_planning', t: (k) => `tr:${k}`, today: '2027-03-01' });
    expect(e.startUtc).toBe('2027-09-18T14:00:00.000Z'); // Lisbon = UTC+1 in summer
    expect(e.templateId).toBe('wedding_planning');
    const tasks = await r.tasks.list(e.id);
    expect(tasks.length).toBeGreaterThan(20);
    expect(tasks[0]?.title).toBe('tr:taskLibrary.setBudget');
    const envelopes = await r.budget.envelopes(e.id);
    expect(envelopes.reduce((n, x) => n + x.plannedMinor, 0)).toBe(2_000_000);
    expect((await r.timeline.list(e.id)).length).toBe(10);
    close();
  });

  it('records RSVP history and response dates', async () => {
    const { r, close } = await setup();
    const e = await r.events.create(baseEvent());
    const g = await r.guests.add(baseGuest(e.id));
    await r.guests.setRsvp(g.id, 'confirmed', { note: 'by phone', source: 'phone' });
    const updated = await r.guests.get(g.id);
    expect(updated).toMatchObject({ rsvpStatus: 'confirmed', rsvpRespondedAt: '2027-03-01', rsvpNote: 'by phone' });
    const history = await r.guests.history(g.id);
    expect(history.map((h) => [h.status, h.source])).toEqual(expect.arrayContaining([['confirmed', 'phone'], ['invited', 'manual']]));
    await r.guests.setRsvp(g.id, 'invited');
    expect((await r.guests.get(g.id))?.rsvpRespondedAt).toBeNull();
    close();
  });

  it('imports CSV guests atomically with groups', async () => {
    const { r, close } = await setup();
    const e = await r.events.create(baseEvent());
    const parsed = importGuestsCsv('first name,last name,group,children\nLéa,Martin,Martin family,2\nTom,Martin,martin family,0\nZoé,Roux,,1');
    expect(await r.guests.importMany(e.id, parsed.guests)).toBe(3);
    const groups = await r.groups.list(e.id);
    expect(groups.map((g) => g.name)).toEqual(['Martin family']);
    const guests = await r.guests.list(e.id);
    expect(guests.filter((g) => g.groupId === groups[0]?.id)).toHaveLength(2);
    close();
  });

  it('merges duplicate guests and moves their gifts', async () => {
    const { r, close } = await setup();
    const e = await r.events.create(baseEvent());
    const a = await r.guests.add(baseGuest(e.id, { email: 'ana@ex.com' }));
    const b = await r.guests.add(baseGuest(e.id, { phone: '0600000000', plusOnes: 1 }));
    await r.gifts.add({ eventId: e.id, guestId: b.id, kind: 'gift', contributor: '', description: 'Vase', amountMinor: 0, currency: 'EUR', receivedDate: null, thanked: false, thankedAt: null, notes: '' });
    await r.guests.merge(a.id, b.id);
    expect(await r.guests.count(e.id)).toBe(1);
    expect(await r.guests.get(a.id)).toMatchObject({ email: 'ana@ex.com', phone: '0600000000', plusOnes: 1 });
    expect((await r.gifts.list(e.id))[0]?.guestId).toBe(a.id);
    close();
  });

  it('keeps one seat per guest and cascades deletions', async () => {
    const { r, close } = await setup();
    const e = await r.events.create(baseEvent());
    const g = await r.guests.add(baseGuest(e.id));
    const t1 = await r.seating.addTable({ eventId: e.id, name: 'T1', shape: 'round', seats: 8, notes: '' });
    const t2 = await r.seating.addTable({ eventId: e.id, name: 'T2', shape: 'rect', seats: 6, notes: '' });
    await r.seating.assign(g.id, t1.id);
    await r.seating.assign(g.id, t2.id);
    const assignments = await r.seating.assignments(e.id);
    expect(assignments).toEqual([expect.objectContaining({ guestId: g.id, tableId: t2.id })]);
    await r.seating.removeTable(t2.id);
    expect(await r.seating.assignments(e.id)).toEqual([]);
    await r.events.remove(e.id);
    for (const table of ['guests', 'tasks', 'event_budgets', 'seating_tables', 'rsvp_records']) {
      const n = await r.db.getFirstAsync<{ n: number }>(`SELECT COUNT(*) AS n FROM ${table}`, []);
      expect(n?.n).toBe(0);
    }
    close();
  });

  it('keeps expenses when their vendor is deleted', async () => {
    const { r, close } = await setup();
    const e = await r.events.create(baseEvent());
    const v = await r.vendors.add({ eventId: e.id, name: 'DJ', category: 'dj', contactName: '', phone: '', email: '', address: '', website: '', quote: '', amountMinor: 80000, currency: 'EUR', status: 'quoted', meetingAt: null, notes: '' });
    const x = await r.budget.addExpense({ eventId: e.id, category: 'music', title: 'DJ', vendorId: v.id, estimatedMinor: 80000, actualMinor: 0, currency: 'EUR', fxRate: null, dueDate: null, paymentDate: null, paymentStatus: 'unpaid', receiptUri: null, notes: '' });
    expect(await r.vendors.linkedExpenses(v.id)).toHaveLength(1);
    await r.vendors.remove(v.id);
    expect((await r.budget.getExpense(x.id))?.vendorId).toBeNull();
    close();
  });

  it('duplicates an event configuration without personal data', async () => {
    const { r, close } = await setup();
    const e = await r.events.create(baseEvent(), { templateId: 'birthday_party', t: (k) => k, today: '2027-03-01' });
    await r.guests.add(baseGuest(e.id, { rsvpStatus: 'confirmed' }));
    const tasks = await r.tasks.list(e.id);
    await r.tasks.update(tasks[0]!.id, { status: 'completed' });
    const copy = await r.events.duplicate(e.id, { name: 'Copy', startDate: '2028-09-18' });
    expect(copy).toMatchObject({ name: 'Copy', status: 'planning', startDate: '2028-09-18' });
    const copiedTasks = await r.tasks.list(copy!.id);
    expect(copiedTasks).toHaveLength(tasks.length);
    expect(copiedTasks.every((t) => t.status === 'todo')).toBe(true);
    expect(copiedTasks[0]?.dueDate?.startsWith('2028')).toBe(true);
    expect(await r.guests.count(copy!.id)).toBe(0);
    const withGuests = await r.events.duplicate(e.id, { name: 'Copy 2', startDate: '2028-01-01', withGuests: true });
    expect((await r.guests.list(withGuests!.id))[0]?.rsvpStatus).toBe('not_invited');
    close();
  });

  it('saves an event as a custom template and reuses it', async () => {
    const { r, close } = await setup();
    const e = await r.events.create(baseEvent(), { templateId: 'family_dinner', t: (k) => k, today: '2027-03-01' });
    const id = await r.templates.saveFromEvent(e.id, 'Our dinner');
    expect((await r.templates.list()).map((x) => x.name)).toEqual(['Our dinner']);
    const e2 = await r.events.create(baseEvent({ startDate: '2027-12-24' }), { customTemplateId: id, today: '2027-03-01' });
    expect((await r.tasks.list(e2.id)).length).toBe((await r.tasks.list(e.id)).length);
    expect(e2.templateId).toBe(id);
    close();
  });

  it('stores notification settings with clamping', async () => {
    const { r, close } = await setup();
    await r.settings.setNotification({ kind: 'task_due', enabled: false, leadDays: 999, hour: 30 });
    const s = await r.settings.notifications();
    expect(s.task_due).toEqual({ kind: 'task_due', enabled: false, leadDays: 365, hour: 23 });
    expect(s.event_upcoming.enabled).toBe(true);
    close();
  });

  it('rejects invalid rows at the database level', async () => {
    const { r, close } = await setup();
    const e = await r.events.create(baseEvent());
    await expect(r.db.runAsync('INSERT INTO timeline_items (id, event_id, title, start_min, end_min) VALUES (?, ?, ?, ?, ?)', ['x', e.id, 'bad', 100, 50])).rejects.toThrow();
    await expect(r.db.runAsync("INSERT INTO guests (id, event_id, plus_ones, created_at, updated_at) VALUES ('g', ?, -1, '', '')", [e.id])).rejects.toThrow();
    await expect(r.db.runAsync("INSERT INTO guests (id, event_id, created_at, updated_at) VALUES ('g2', 'missing', '', '')", [])).rejects.toThrow();
    close();
  });

  it('backs up, wipes and restores every user table', async () => {
    const { r, close } = await setup();
    const e = await r.events.create(baseEvent(), { templateId: 'wedding_planning', t: (k) => k, today: '2027-03-01' });
    const group = await r.groups.add({ eventId: e.id, name: 'Silva', kind: 'family', notes: '' });
    const g = await r.guests.add(baseGuest(e.id, { groupId: group.id, rsvpStatus: 'confirmed' }));
    const tb = await r.seating.addTable({ eventId: e.id, name: 'T1', shape: 'round', seats: 8, notes: '' });
    await r.seating.assign(g.id, tb.id);
    const { json, fileName } = await exportUserData(r.db, NOW);
    expect(fileName).toBe('eventora-backup-2027-03-01');
    const parsed = JSON.parse(json) as { tables: Record<string, unknown[]> };
    expect(Object.keys(parsed.tables)).toEqual([...USER_TABLES]);

    await deleteAllUserData(r.db);
    expect(await r.events.list()).toEqual([]);

    const res = await importUserData(r.db, json);
    expect(res.restoredRows).toBeGreaterThan(30);
    expect((await r.events.list()).map((x) => x.id)).toEqual([e.id]);
    expect(await r.seating.assignments(e.id)).toHaveLength(1);
    expect((await r.guests.get(g.id))?.groupId).toBe(group.id);
    await expect(importUserData(r.db, '{"format":"factory-backup","formatVersion":1,"appId":"devspeak","tables":{}}')).rejects.toThrow();
    await expect(importUserData(r.db, 'not json')).rejects.toThrow();
    close();
  });

  it('builds escaped, privacy-aware reports and exports', async () => {
    const { r, close } = await setup();
    const e = await r.events.create(baseEvent({ name: '<script>x</script>' }), { templateId: 'wedding_planning', t: (k) => k, today: '2027-03-01' });
    await r.guests.add(baseGuest(e.id, { firstName: 'Bob', phone: '0612345678', dietary: 'vegan', rsvpStatus: 'confirmed', plusOnes: 1 }));
    const snap = (await r.snapshot(e.id))!;
    const html = buildReportHtml('guests', snap, ctx);
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>x');
    expect(html).not.toContain('0612345678');
    expect(html).not.toContain('vegan');
    expect(buildReportHtml('guests', snap, ctx, { includeContacts: true })).toContain('0612345678');
    for (const kind of ['rsvp', 'budget', 'expenses', 'timeline', 'vendors', 'seating', 'gifts', 'tasks', 'final'] as const) {
      expect(buildReportHtml(kind, snap, ctx)).toContain('<!doctype html>');
    }
    const csv = buildCsv('guests', snap, ctx);
    expect(csv.split('\r\n')[1]).toContain('Bob');
    expect(csv).not.toContain('vegan');
    expect(buildCsv('guests', snap, ctx, { includeContacts: true })).toContain('vegan');
    expect(buildCsv('timeline', snap, ctx)).toContain('(+1)'); // closing after midnight
    close();
  });
});

describe('invitation rendering', () => {
  const view = { title: 'Léa & Sam', hosts: 'With joy', message: 'Join us', dateLine: 'Sat 18 Sep', timeLine: '15:00', venueLine: 'Quinta', rsvpLine: 'Reply by Aug 1' };
  it('renders an escaped printable card', () => {
    const html = invitationHtml({ design: { templateId: 'ivory_classic', background: '#FFFFFF', foreground: '#000000', accent: '#B8925A', font: 'serif', layout: 'framed', backgroundUri: null } }, { ...view, message: '<b>hi</b>' });
    expect(html).toContain('&lt;b&gt;hi&lt;/b&gt;');
    expect(html).toContain('Georgia');
  });
  it('renders shareable text without empty runs', () => {
    expect(invitationText({ ...view, timeLine: '', venueLine: '' })).toBe('With joy\nLÉA & SAM\n\nJoin us\n\nSat 18 Sep\n\nReply by Aug 1');
  });
});
