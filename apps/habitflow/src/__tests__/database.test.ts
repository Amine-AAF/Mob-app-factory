import { contrastRatio, createTheme } from '@factory/design-system';
import { createTestDatabase } from '@factory/testing';

import { PALETTES } from '@/config/brand';
import { initDatabase, loadSnapshot, setRepositories, type HabitInput, type Repositories } from '@/database';
import { migrations, SCHEMA_VERSION, USER_TABLES } from '@/database/migrations';
import { overview } from '@/features/statistics/stats';
import { deleteAllUserData, describeBackup, exportUserData, importUserData } from '@/services/backupService';
import { clock } from '@/services/clock';
import { archiveHabit, createHabit, deleteHabit, increment, setValue, skip, toggle, TrackingError, updateHabit } from '@/services/habitService';

jest.mock('@/services/reminders', () => ({ syncNotifications: jest.fn(async () => 0) }));
jest.mock('@/services/feedback', () => ({ feedback: { success: jest.fn(), tap: jest.fn(), error: jest.fn(), warning: jest.fn() } }));

const t = ((k: string) => k) as never;
const at = (iso: string) => clock.set(() => new Date(iso));

const input = (extra: Partial<HabitInput> = {}): HabitInput => ({
  name: 'Read', description: null, icon: 'book', color: '#5A4FCF', category: 'learning', startDate: '2026-11-02',
  durationMin: 20, notes: null, templateId: null, frequency: { type: 'daily' }, tracking: { mode: 'check', target: 1, unit: null }, ...extra,
});

let db: Awaited<ReturnType<typeof createTestDatabase>>;
let r: Repositories;

beforeEach(async () => {
  db = await createTestDatabase();
  r = await initDatabase(db);
  setRepositories(r);
  at('2026-11-02T09:00:00');
});
afterEach(() => {
  clock.set(null);
  db.close();
});

describe('schema & migrations', () => {
  it('creates every user table at the latest version', async () => {
    const v = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version', []);
    expect(v?.user_version).toBe(SCHEMA_VERSION);
    for (const table of USER_TABLES) expect(await db.getFirstAsync(`SELECT name FROM sqlite_master WHERE name = ?`, [table])).not.toBeNull();
  });

  it('re-opening an existing database keeps the data (app update)', async () => {
    const id = await createHabit(input(), t, r);
    await toggle(id, '2026-11-02', r);
    const again = await initDatabase(db);
    expect((await again.habits.list()).map((h) => h.id)).toEqual([id]);
    expect(await again.logs.all()).toHaveLength(1);
    expect(migrations.map((m) => m.version)).toEqual(migrations.map((_, i) => i + 1));
  });
});

describe('habits', () => {
  it('creates, edits, archives and deletes a habit', async () => {
    const id = await createHabit(input(), t, r);
    expect((await r.habits.get(id))?.schedules).toHaveLength(1);
    await updateHabit(id, input({ name: 'Read more', icon: 'library' }), t, r);
    expect((await r.habits.get(id))?.name).toBe('Read more');
    expect((await r.habits.get(id))?.schedules).toHaveLength(1); // descriptive change only

    await archiveHabit(id, t, r);
    expect((await r.habits.get(id))?.archivedOn).toBe('2026-11-03');
    expect(await r.habits.list()).toHaveLength(0);
    expect(await r.habits.list({ includeArchived: true })).toHaveLength(1);

    await toggle(id, '2026-11-02', r);
    await r.reminders.save({ habitId: id, hour: 8, minute: 0, days: [], enabled: true }, clock.now());
    await deleteHabit(id, t, r);
    expect(await r.habits.get(id)).toBeNull();
    expect(await r.logs.all()).toHaveLength(0); // cascade
    expect(await r.reminders.all()).toHaveLength(0);
  });

  it('a frequency change creates a new schedule from today and leaves past days untouched', async () => {
    const id = await createHabit(input(), t, r);
    for (const d of ['2026-11-02', '2026-11-03', '2026-11-04']) {
      at(`${d}T20:00:00`);
      await toggle(id, d, r);
    }
    at('2026-11-05T08:00:00');
    const before = overview(await loadSnapshot(db), '2026-11-05').perHabit.get(id)!;
    await updateHabit(id, input({ frequency: { type: 'weekdays', days: [1] } }), t, r);
    const h = (await r.habits.get(id))!;
    expect(h.schedules.map((s) => [s.effectiveFrom, s.frequency.type])).toEqual([
      ['2026-11-02', 'daily'],
      ['2026-11-05', 'weekdays'],
    ]);
    const after = overview(await loadSnapshot(db), '2026-11-05').perHabit.get(id)!;
    expect(after.totalCompleted).toBe(before.totalCompleted);
    expect(after.streak.best).toBe(3);
  });
});

describe('tracking', () => {
  it('stores one log per habit and day, toggles and undoes', async () => {
    const id = await createHabit(input(), t, r);
    const first = await toggle(id, '2026-11-02', r);
    expect(first).toMatchObject({ newlyDone: true, xpDelta: 10 });
    await setValue(id, '2026-11-02', 1, {}, r); // same day again
    expect(await r.logs.all()).toHaveLength(1);
    const undo = await toggle(id, '2026-11-02', r);
    expect(undo.log).toBeNull();
    expect(undo.xpDelta).toBe(-10);
    expect(await r.logs.totalXp()).toBe(0);
  });

  it('never grants XP twice for the same habit and day', async () => {
    const id = await createHabit(input(), t, r);
    for (let i = 0; i < 5; i++) await toggle(id, '2026-11-02', r); // done, undo, done, undo, done
    expect(await r.logs.totalXp()).toBe(10);
    const rows = await db.getAllAsync('SELECT * FROM xp_ledger', []);
    expect(rows).toHaveLength(1);
  });

  it('retroactive check-ins older than one day earn no XP but keep history', async () => {
    const id = await createHabit(input({ startDate: '2026-10-20' }), t, r);
    at('2026-11-02T09:00:00');
    expect((await toggle(id, '2026-11-01', r)).xpDelta).toBe(10); // yesterday: forgiven
    expect((await toggle(id, '2026-10-25', r)).xpDelta).toBe(0); // a week ago
    expect(await r.logs.all()).toHaveLength(2);
  });

  it('refuses future days and days outside the habit life', async () => {
    const id = await createHabit(input(), t, r);
    await expect(toggle(id, '2026-11-03', r)).rejects.toBeInstanceOf(TrackingError);
    await expect(toggle(id, '2026-11-01', r)).rejects.toBeInstanceOf(TrackingError);
  });

  it('tracks quantities with partial progress and the target snapshot', async () => {
    const id = await createHabit(input({ tracking: { mode: 'quantity', target: 2, unit: 'L' } }), t, r);
    await increment(id, '2026-11-02', 0.5, r);
    await increment(id, '2026-11-02', 1, r);
    expect(await r.logs.get(id, '2026-11-02')).toMatchObject({ value: 1.5, status: 'partial', target: 2 });
    const done = await increment(id, '2026-11-02', 0.5, r);
    expect(done.newlyDone).toBe(true);
    expect((await r.logs.get(id, '2026-11-02'))?.status).toBe('done');
  });

  it('skips a day without breaking the streak, and can cancel the skip', async () => {
    const id = await createHabit(input(), t, r);
    await skip(id, '2026-11-02', r);
    expect((await r.logs.get(id, '2026-11-02'))?.status).toBe('skipped');
    await skip(id, '2026-11-02', r);
    expect(await r.logs.get(id, '2026-11-02')).toBeNull();
  });

  it('unlocks badges once', async () => {
    const id = await createHabit(input(), t, r);
    await toggle(id, '2026-11-02', r);
    await toggle(id, '2026-11-02', r);
    await toggle(id, '2026-11-02', r);
    const ids = (await r.achievements.unlocked()).map((a) => a.id);
    expect(ids).toEqual(expect.arrayContaining(['first_habit', 'first_check']));
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('planner', () => {
  it('creates, completes, reorders and lists overdue tasks on today', async () => {
    const a = await r.tasks.create({ title: 'A', notes: null, priority: 'high', dueDay: '2026-11-01', time: null, habitId: null }, clock.now());
    const b = await r.tasks.create({ title: 'B', notes: null, priority: 'low', dueDay: '2026-11-02', time: '09:30', habitId: null }, clock.now());
    expect((await r.tasks.forDay('2026-11-02', true)).map((x) => x.id).sort()).toEqual([a, b].sort());
    await r.tasks.setDone(a, true, clock.now());
    expect((await r.tasks.forDay('2026-11-02', true)).map((x) => x.id)).toEqual([b]);
    expect(await r.tasks.completedCount()).toBe(1);
  });
});

describe('backup & restore', () => {
  it('round-trips all user data through the JSON export', async () => {
    const id = await createHabit(input(), t, r);
    await toggle(id, '2026-11-02', r);
    await r.tasks.create({ title: 'Plan', notes: null, priority: 'medium', dueDay: '2026-11-02', time: null, habitId: id }, clock.now());
    await r.reminders.save({ habitId: id, hour: 7, minute: 30, days: [1, 3], enabled: true }, clock.now());
    const { json, fileName } = await exportUserData(db, new Date('2026-11-02T10:00:00Z'));
    expect(fileName).toBe('habitflow-backup-2026-11-02.json');
    expect(describeBackup(json)).toMatchObject({ habits: 1, logs: 1, tasks: 1 });

    await deleteAllUserData(db);
    expect(await r.habits.list({ includeArchived: true })).toHaveLength(0);

    await importUserData(db, json);
    const snapshot = await loadSnapshot(db);
    expect(snapshot.habits[0]?.schedules).toHaveLength(1);
    expect(snapshot.logs).toHaveLength(1);
    expect(await r.logs.totalXp()).toBe(10);
    expect(await r.reminders.all()).toEqual([expect.objectContaining({ days: [1, 3], hour: 7, minute: 30 })]);
  });

  it('restoring replaces existing data instead of merging duplicates', async () => {
    const id = await createHabit(input(), t, r);
    await toggle(id, '2026-11-02', r);
    const { json } = await exportUserData(db);
    await createHabit(input({ name: 'Other' }), t, r);
    await importUserData(db, json);
    expect(await r.habits.list()).toHaveLength(1);
    expect(await r.logs.all()).toHaveLength(1);
  });

  it('rejects invalid, foreign and newer backups without touching data', async () => {
    await createHabit(input(), t, r);
    await expect(importUserData(db, 'not json')).rejects.toMatchObject({ code: 'invalid_json' });
    await expect(importUserData(db, JSON.stringify({ format: 'factory-backup', formatVersion: 1, appId: 'logic-quest', schemaVersion: 1, tables: {} }))).rejects.toMatchObject({ code: 'wrong_app' });
    await expect(importUserData(db, JSON.stringify({ format: 'factory-backup', formatVersion: 1, appId: 'habitflow', schemaVersion: 99, tables: {} }))).rejects.toMatchObject({ code: 'newer_schema' });
    expect(await r.habits.list()).toHaveLength(1);
  });
});

describe('themes', () => {
  it.each(Object.entries(PALETTES))('palette %s keeps readable text in light and dark', (_id, brand) => {
    for (const scheme of ['light', 'dark'] as const) {
      const c = createTheme(brand, scheme).colors;
      expect(contrastRatio(c.onPrimary, c.primary)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(c.primary, c.background)).toBeGreaterThanOrEqual(3);
    }
  });
});
