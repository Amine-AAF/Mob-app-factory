import { createTestDatabase } from '@factory/testing';

import { initDatabase, type Repositories } from '@/database';
import { clock } from '@/services/clock';
import { syncNotifications } from '@/services/reminders';

const scheduled: { identifier: string; trigger: Record<string, unknown> }[] = [];

jest.mock('expo-notifications', () => ({
  SchedulableTriggerInputTypes: { DAILY: 'daily', WEEKLY: 'weekly', TIME_INTERVAL: 'timeInterval' },
  AndroidImportance: { DEFAULT: 3 },
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(async () => undefined),
  getPermissionsAsync: jest.fn(async () => ({ status: 'granted', canAskAgain: true })),
  requestPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  getAllScheduledNotificationsAsync: jest.fn(async () => [...scheduled, { identifier: 'daily-reminder-8-0', trigger: {} }]),
  cancelScheduledNotificationAsync: jest.fn(async (id: string) => {
    const i = scheduled.findIndex((s) => s.identifier === id);
    if (i >= 0) scheduled.splice(i, 1);
  }),
  scheduleNotificationAsync: jest.fn(async (req: { identifier: string; trigger: Record<string, unknown> }) => {
    scheduled.push(req);
    return req.identifier;
  }),
}));

const t = ((k: string) => k) as never;
let r: Repositories;

beforeEach(async () => {
  scheduled.length = 0;
  r = await initDatabase(await createTestDatabase());
  clock.set(() => new Date('2026-11-02T09:00:00'));
});
afterEach(() => clock.set(null));

describe('local notifications', () => {
  it('schedules weekly triggers only on scheduled weekdays and rebuilds idempotently', async () => {
    const id = await r.habits.create(
      { name: 'Gym', description: null, icon: 'barbell', color: '#D6455D', category: 'fitness', startDate: '2026-11-02', durationMin: null, notes: null, templateId: null, frequency: { type: 'weekdays', days: [1, 3, 5] }, tracking: { mode: 'check', target: 1, unit: null } },
      clock.now(),
    );
    await r.reminders.save({ habitId: id, hour: 18, minute: 30, days: [], enabled: true }, clock.now());
    await r.reminders.save({ habitId: null, hour: 20, minute: 0, days: [], enabled: true }, clock.now());

    expect(await syncNotifications(r, t)).toBe(4);
    expect(await syncNotifications(r, t)).toBe(4); // re-sync replaces, never duplicates
    expect(scheduled).toHaveLength(4);
    const weekly = scheduled.filter((s) => s.trigger.type === 'weekly').map((s) => s.trigger.weekday);
    expect(weekly.sort()).toEqual([2, 4, 6]); // Mon/Wed/Fri in expo numbering (1 = Sunday)
    expect(scheduled.filter((s) => s.trigger.type === 'daily')).toHaveLength(1);
  });

  it('disabling a reminder removes its notifications', async () => {
    const rid = await r.reminders.save({ habitId: null, hour: 8, minute: 0, days: [], enabled: true }, clock.now());
    await syncNotifications(r, t);
    expect(scheduled).toHaveLength(1);
    await r.reminders.save({ id: rid, habitId: null, hour: 8, minute: 0, days: [], enabled: false }, clock.now());
    await syncNotifications(r, t);
    expect(scheduled).toHaveLength(0);
  });
});
