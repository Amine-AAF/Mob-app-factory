import { createTestDatabase } from '@factory/testing';
import * as Notifications from 'expo-notifications';
import { File, Paths } from 'expo-file-system';
import type { TFunction } from 'i18next';

import { canCreate, FREE_LIMITS } from '@/config/limits';
import { initDatabase, type Repositories } from '@/database';
import { DEFAULT_NOTIFICATION_SETTINGS, fireDate, MAX_SCHEDULED, planReminders, type ReminderSources } from '@/domain/reminderPlan';
import { loadDashboard } from '@/features/dashboard';
import { buildReportHtml, escapeHtml } from '@/services/exports';
import { clock } from '@/services/clock';
import { deleteStoredFile, extensionFor, fileExists, fileFor, isSafeRelativePath, removeUnreferencedFiles, sanitizeFileName } from '@/services/files';
import { buildPlan, ID_PREFIX, routeFromNotification, setMasterEnabled, syncReminders } from '@/services/reminders';

const t = ((key: string) => key) as unknown as TFunction;
const scheduled = () => (globalThis as unknown as { __notifications: { identifier: string; trigger: { date: Date } }[] }).__notifications;
const NOW = new Date('2026-11-13T10:00:00');

const emptySources = (): ReminderSources => ({ maintenance: [], warranties: [], documents: [], recurringExpenses: [], repairs: [], household: [] });

describe('reminder planning', () => {
  it('fires N days before at the configured local time', () => {
    expect(fireDate('2026-11-20', 2, 9, 0, NOW)).toEqual(new Date('2026-11-18T09:00:00'));
  });

  it('falls back to the next slot when the ideal moment passed, and drops past events', () => {
    // Due in 2 days but 7 days notice requested → today 18:00 (still ahead).
    expect(fireDate('2026-11-15', 7, 18, 0, NOW)).toEqual(new Date('2026-11-13T18:00:00'));
    // Today 9:00 already passed → tomorrow 9:00 (still before the event).
    expect(fireDate('2026-11-15', 7, 9, 0, NOW)).toEqual(new Date('2026-11-14T09:00:00'));
    // Event today, slot passed, tomorrow is after the event → nothing.
    expect(fireDate('2026-11-13', 0, 9, 0, NOW)).toBeNull();
    // Past event → nothing.
    expect(fireDate('2026-11-01', 0, 9, 0, NOW)).toBeNull();
  });

  it('uses local wall-clock time, whatever the time zone', () => {
    const d = fireDate('2026-12-01', 0, 9, 30, NOW) as Date;
    expect([d.getHours(), d.getMinutes(), d.getDate()]).toEqual([9, 30, 1]);
  });

  it('respects the master switch, category switches and per-item switches', () => {
    const sources = emptySources();
    sources.maintenance.push({ id: 'm1', title: 'Filter', nextDue: '2026-11-20', reminderEnabled: true, reminderDaysBefore: null });
    sources.maintenance.push({ id: 'm2', title: 'Off', nextDue: '2026-11-20', reminderEnabled: false, reminderDaysBefore: null });
    sources.warranties.push({ id: 'a1', name: 'Fridge', warrantyEnd: '2026-12-31' });
    const settings = { ...DEFAULT_NOTIFICATION_SETTINGS };
    expect(planReminders({ sources, settings, masterEnabled: false, now: NOW })).toEqual([]);
    const all = planReminders({ sources, settings, masterEnabled: true, now: NOW });
    expect(all.map((r) => r.id)).toEqual(['maintenance:m1', 'warranty:a1']);
    const noWarranty = planReminders({ sources, settings: { ...settings, warranty: { ...settings.warranty, enabled: false } }, masterEnabled: true, now: NOW });
    expect(noWarranty.map((r) => r.id)).toEqual(['maintenance:m1']);
  });

  it('distinguishes contracts from other documents and nudges late chores once', () => {
    const sources = emptySources();
    sources.documents.push({ id: 'd1', title: 'Insurance', type: 'insurance', expiryDate: '2026-12-31', reminderDaysBefore: null });
    sources.documents.push({ id: 'd2', title: 'Passport scan', type: 'other', expiryDate: '2026-12-31', reminderDaysBefore: 5 });
    sources.household.push({ id: 'h1', title: 'Trash', dueDate: '2026-11-10', completed: false, reminderEnabled: true });
    sources.household.push({ id: 'h2', title: 'Done', dueDate: '2026-11-20', completed: true, reminderEnabled: true });
    const plan = planReminders({ sources, settings: DEFAULT_NOTIFICATION_SETTINGS, masterEnabled: true, now: NOW });
    expect(plan.find((p) => p.id === 'document:d1')?.kind).toBe('contract_renewal');
    expect(plan.find((p) => p.id === 'document:d2')?.fireAt).toEqual(new Date('2026-12-26T10:00:00'));
    expect(plan.filter((p) => p.id.startsWith('household')).map((p) => p.id)).toEqual(['household-late:h1']);
  });

  it('caps the number of scheduled notifications, soonest first', () => {
    const sources = emptySources();
    for (let i = 0; i < 100; i++) sources.maintenance.push({ id: `m${i}`, title: 'T', nextDue: `2027-01-${String((i % 28) + 1).padStart(2, '0')}`, reminderEnabled: true, reminderDaysBefore: 0 });
    const plan = planReminders({ sources, settings: DEFAULT_NOTIFICATION_SETTINGS, masterEnabled: true, now: NOW });
    expect(plan).toHaveLength(MAX_SCHEDULED);
    expect(plan[0]!.fireAt.getTime()).toBeLessThanOrEqual(plan[plan.length - 1]!.fireAt.getTime());
  });

  it('only routes notifications to internal paths', () => {
    expect(routeFromNotification({ route: '/maintenance/m_1' })).toBe('/maintenance/m_1');
    expect(routeFromNotification({ route: 'https://evil.example' })).toBeNull();
    expect(routeFromNotification(null)).toBeNull();
  });
});

describe('notification sync (expo-notifications mocked)', () => {
  let r: Repositories;
  beforeEach(async () => {
    clock.set(() => NOW);
    scheduled().length = 0;
    r = await initDatabase(await createTestDatabase(), () => NOW);
    const home = await r.homes.create({ name: 'Flat', type: 'apartment', currency: 'EUR' });
    await r.maintenance.create(home.id, {
      assetId: null, roomId: null, templateId: null, title: 'Boiler', description: null, category: 'hvac', frequency: 'annual', intervalValue: null, intervalUnit: null,
      lastDone: null, nextDue: '2026-11-20', estimatedMinutes: null, priority: 'high', estimatedCostMinor: null, currency: null, notes: null, reminderEnabled: true, reminderDaysBefore: null,
    });
  });
  afterEach(() => clock.set(null));

  it('schedules from data and replaces (not duplicates) on re-sync', async () => {
    expect((await syncReminders(r, t)).scheduled).toBe(1);
    await syncReminders(r, t);
    const plan = await buildPlan(r, NOW);
    expect(scheduled().map((n) => n.identifier)).toEqual([`${ID_PREFIX}${plan[0]?.id}`]);
    expect(scheduled()[0]!.trigger.date).toEqual(new Date('2026-11-19T09:00:00'));
  });

  it('leaves other apps/notifications alone and clears ours when disabled', async () => {
    scheduled().push({ identifier: 'other-app-reminder', trigger: { date: NOW } });
    await syncReminders(r, t);
    await setMasterEnabled(r, false);
    expect((await syncReminders(r, t)).scheduled).toBe(0);
    expect(scheduled().map((n) => n.identifier)).toEqual(['other-app-reminder']);
  });

  it('schedules nothing when permission is denied', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'denied', canAskAgain: false });
    const res = await syncReminders(r, t);
    expect(res).toEqual({ scheduled: 0, permission: 'denied' });
    expect(scheduled()).toEqual([]);
  });
});

describe('private file storage', () => {
  it('only accepts our own relative paths', () => {
    expect(isSafeRelativePath('documents/d_abc.pdf')).toBe(true);
    expect(isSafeRelativePath('photos/p1.jpg')).toBe(true);
    expect(isSafeRelativePath('../secret')).toBe(false);
    expect(isSafeRelativePath('documents/../../x.pdf')).toBe(false);
    expect(isSafeRelativePath('file:///etc/passwd')).toBe(false);
    expect(fileFor('content://evil/doc')).toBeNull();
  });

  it('derives extensions and sanitises share names', () => {
    expect(extensionFor('Invoice.PDF', null)).toBe('pdf');
    expect(extensionFor(null, 'image/jpeg')).toBe('jpg');
    expect(extensionFor('noext', 'application/x-unknown')).toBe('bin');
    expect(sanitizeFileName('../a/b:c?.pdf')).toBe('_a_b_c_.pdf');
  });

  it('detects deleted files and removes unreferenced ones', () => {
    const keep = new File(Paths.document, 'homecare', 'documents', 'd_keep.pdf');
    const orphan = new File(Paths.document, 'homecare', 'documents', 'd_orphan.pdf');
    fileFor('documents/d_keep.pdf'); // creates folders
    keep.write('a');
    orphan.write('b');
    expect(fileExists('documents/d_keep.pdf')).toBe(true);
    expect(removeUnreferencedFiles(['documents/d_keep.pdf'])).toBe(1);
    expect(fileExists('documents/d_orphan.pdf')).toBe(false);
    deleteStoredFile('documents/d_keep.pdf');
    expect(fileExists('documents/d_keep.pdf')).toBe(false);
    expect(() => deleteStoredFile('documents/d_keep.pdf')).not.toThrow(); // already gone
  });
});

describe('exports', () => {
  it('escapes HTML in PDF reports', () => {
    expect(escapeHtml('<script>"x"</script>')).toBe('&lt;script&gt;&quot;x&quot;&lt;/script&gt;');
    const html = buildReportHtml('T <b>', 'sub', ['Name'], [['<img src=x onerror=1>']], 'Total', '€1');
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img');
  });
});

describe('limits and dashboard', () => {
  it('enforces free limits only for free users', () => {
    expect(canCreate('homes', 1, false)).toBe(false);
    expect(canCreate('homes', 1, true)).toBe(true);
    expect(canCreate('assets', FREE_LIMITS.assets - 1, false)).toBe(true);
    expect(canCreate('assets', FREE_LIMITS.assets, false)).toBe(false);
  });

  it('builds the dashboard: urgent/upcoming buckets, warranties, month spend per currency, alerts', async () => {
    const r = await initDatabase(await createTestDatabase(), () => NOW);
    const home = await r.homes.create({ name: 'Flat', type: 'apartment', currency: 'EUR', monthlyBudgetMinor: 5000 });
    const base = {
      assetId: null, roomId: null, templateId: null, description: null, category: 'hvac' as const, frequency: 'monthly' as const, intervalValue: null, intervalUnit: null,
      lastDone: null, estimatedMinutes: null, priority: 'medium' as const, estimatedCostMinor: null, currency: null, notes: null, reminderEnabled: true, reminderDaysBefore: null,
    };
    await r.maintenance.create(home.id, { ...base, title: 'Late', nextDue: '2026-11-01' });
    await r.maintenance.create(home.id, { ...base, title: 'Today', nextDue: '2026-11-13' });
    await r.maintenance.create(home.id, { ...base, title: 'Soon', nextDue: '2026-11-18' });
    await r.maintenance.create(home.id, { ...base, title: 'Far', nextDue: '2027-03-01' });
    await r.assets.create(home.id, { roomId: null, name: 'Fridge', category: 'refrigerator', brand: null, model: null, serialNumber: null, purchaseDate: null, purchasePriceMinor: null, currency: null, vendor: null, warrantyEnd: '2026-12-01', status: 'active', notes: null });
    const exp = { category: 'electricity' as const, title: null, spentOn: '2026-11-05', paymentMethod: null, assetId: null, roomId: null, documentId: null, notes: null };
    await r.expenses.create(home.id, { ...exp, amountMinor: 6000, currency: 'EUR' });
    await r.expenses.create(home.id, { ...exp, amountMinor: 1000, currency: 'USD' });

    const d = await loadDashboard(r, home.id, '2026-11-13');
    expect(d.agenda.overdue.map((i) => i.title)).toEqual(['Late']);
    expect(d.agenda.today.map((i) => i.title)).toEqual(['Today']);
    expect(d.agenda.upcoming.map((i) => i.title)).toEqual(['Soon']);
    expect(d.warranties.map((a) => a.name)).toEqual(['Fridge']);
    expect(d.monthSpend).toEqual([
      { currency: 'EUR', amountMinor: 6000 },
      { currency: 'USD', amountMinor: 1000 },
    ]);
    // Budget compares the home currency only (USD is not converted or added).
    expect(d.budget).toEqual({ limitMinor: 5000, spentMinor: 6000, currency: 'EUR' });
    expect(d.alerts.map((a) => a.kind).sort()).toEqual(['budget_exceeded', 'maintenance_overdue', 'warranty_expiring']);
  });
});
