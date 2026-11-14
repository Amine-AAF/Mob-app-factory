import { DEFAULT_NOTIFICATION_SETTINGS } from '@/database/repositories';
import { nextOccurrence, planNotifications, PREFIX, type PlanInput } from '@/domain/notificationPlan';
import type { Appointment, FeedingSchedule, FoodItem, NotificationSetting, Pet, Treatment, Vaccination } from '@/domain/types';

const allOn: NotificationSetting[] = Object.values(DEFAULT_NOTIFICATION_SETTINGS).map((s) => ({ ...s, enabled: true }));
// Default fixture: everything on except the repeating routine reminders, which have their own tests.
const routineOff = allOn.map((s) => (['walks', 'grooming', 'weighIn'].includes(s.category) ? { ...s, enabled: false } : s));
const now = new Date(2026, 10, 13, 12, 0); // 13 Nov 2026, 12:00 local

const pet = (id: string, over: Partial<Pet> = {}): Pet => ({
  id,
  name: id.toUpperCase(),
  species: 'dog',
  breed: null,
  sex: null,
  birthDate: null,
  birthEstimated: false,
  weightKg: null,
  color: null,
  identification: null,
  adoptionDate: null,
  notes: null,
  photo: null,
  walkGoalMinutes: null,
  archived: false,
  createdAt: '',
  updatedAt: '',
  ...over,
});
const vacc = (over: Partial<Vaccination>): Vaccination => ({ id: 'v1', petId: 'rex', name: 'Rabies', administeredDate: '2025-11-20', nextDueDate: '2026-11-20', vetName: null, notes: null, reminderDaysBefore: 3, createdAt: '', updatedAt: '', ...over });
const treat = (over: Partial<Treatment>): Treatment => ({
  id: 't1',
  petId: 'rex',
  name: 'Ear drops',
  instructions: 'As prescribed',
  startDate: '2026-11-10',
  endDate: '2026-11-16',
  frequency: 'twice_daily',
  reminderTimes: ['08:00', '20:00'],
  remindersEnabled: true,
  prescriber: null,
  notes: null,
  stoppedAt: null,
  createdAt: '',
  updatedAt: '',
  ...over,
});

const input = (over: Partial<PlanInput>): PlanInput => ({ now, pets: [pet('rex')], vaccinations: [], treatments: [], appointments: [], feeding: [], food: [], settings: routineOff, ...over });

describe('notification planner', () => {
  it('plans a pre-reminder and a due-day reminder for vaccinations', () => {
    const plan = planNotifications(input({ vaccinations: [vacc({})] }));
    const ids = plan.map((n) => n.id);
    expect(ids).toEqual(expect.arrayContaining([`${PREFIX}vac-v1-pre`, `${PREFIX}vac-v1-due`]));
    const due = plan.find((n) => n.id.endsWith('due'))!;
    expect(due.trigger).toEqual({ type: 'date', date: new Date(2026, 10, 20, 9, 0) });
    expect(due.params).toEqual({ pet: 'REX', name: 'Rabies' });
  });

  it('skips past dates (no reminder in the past) and overdue vaccines', () => {
    const plan = planNotifications(input({ vaccinations: [vacc({ nextDueDate: '2026-11-01' }), vacc({ id: 'v2', nextDueDate: '2026-11-14', reminderDaysBefore: 7 })] }));
    expect(plan.map((n) => n.id)).toEqual([`${PREFIX}vac-v2-due`]);
    for (const n of plan) if (n.trigger.type === 'date') expect(n.trigger.date.getTime()).toBeGreaterThan(now.getTime());
  });

  it('respects disabled categories', () => {
    const settings = routineOff.map((s) => (s.category === 'vaccinations' ? { ...s, enabled: false } : s));
    expect(planNotifications(input({ settings, vaccinations: [vacc({})] }))).toHaveLength(0);
  });

  it('ignores archived pets', () => {
    expect(planNotifications(input({ pets: [pet('rex', { archived: true })], vaccinations: [vacc({})] }))).toHaveLength(0);
  });

  it('plans treatment doses inside a rolling window and an end-of-treatment alert', () => {
    const plan = planNotifications(input({ treatments: [treat({})] }));
    const doses = plan.filter((n) => n.titleKey === 'notif.treatmentTitle');
    // 13th: only 20:00 is still ahead; 14th–16th: 2 per day.
    expect(doses).toHaveLength(1 + 3 * 2);
    expect(plan.some((n) => n.id === `${PREFIX}trt-t1-end`)).toBe(true);
  });

  it('does not plan doses for stopped, finished or as-needed treatments', () => {
    expect(planNotifications(input({ treatments: [treat({ stoppedAt: '2026-11-12' })] }))).toHaveLength(0);
    expect(planNotifications(input({ treatments: [treat({ endDate: '2026-11-12' })] }))).toHaveLength(0);
    const asNeeded = planNotifications(input({ treatments: [treat({ frequency: 'as_needed', endDate: null })] }));
    expect(asNeeded.filter((n) => n.titleKey === 'notif.treatmentTitle')).toHaveLength(0);
  });

  it('honours per-treatment reminder switch while keeping the end alert', () => {
    const plan = planNotifications(input({ treatments: [treat({ remindersEnabled: false })] }));
    expect(plan.map((n) => n.id)).toEqual([`${PREFIX}trt-t1-end`]);
  });

  it('plans appointment reminders with the chosen lead time', () => {
    const appt: Appointment = { id: 'a1', petId: 'rex', type: 'grooming', startsAt: new Date(2026, 10, 15, 10, 30).toISOString(), title: null, address: null, provider: 'Happy Paws', phone: null, notes: null, estimatedCost: null, currency: null, status: 'scheduled', remindMinutesBefore: 120, createdAt: '', updatedAt: '' };
    const [n] = planNotifications(input({ appointments: [appt, { ...appt, id: 'a2', status: 'cancelled' }] }));
    expect(n?.trigger).toEqual({ type: 'date', date: new Date(2026, 10, 15, 8, 30) });
    expect(n?.titleKey).toBe('notif.appointmentTitle_grooming');
    expect(n?.params.place).toBe('Happy Paws');
  });

  it('plans daily meal reminders only for active schedules with reminders on', () => {
    const f: FeedingSchedule = { id: 'f1', petId: 'rex', foodType: 'dry', brand: null, product: null, quantity: '80 g', mealTimes: ['07:30', '19:00'], remindersEnabled: true, active: true, notes: null, createdAt: '', updatedAt: '' };
    const plan = planNotifications(input({ feeding: [f, { ...f, id: 'f2', active: false }, { ...f, id: 'f3', remindersEnabled: false }] }));
    expect(plan.filter((n) => n.category === 'meals').map((n) => n.trigger)).toEqual([
      { type: 'daily', hour: 7, minute: 30 },
      { type: 'daily', hour: 19, minute: 0 },
    ]);
  });

  it('plans walk reminders only when there is a dog', () => {
    expect(planNotifications(input({ settings: allOn })).some((n) => n.category === 'walks')).toBe(true);
    expect(planNotifications(input({ settings: allOn, pets: [pet('tom', { species: 'cat' })] })).some((n) => n.category === 'walks')).toBe(false);
  });

  it('plans weekly grooming on the chosen weekday', () => {
    const settings = allOn.map((s) => (s.category === 'grooming' ? { ...s, weekday: 2, hour: 18, minute: 15 } : s));
    expect(planNotifications(input({ settings })).find((n) => n.category === 'grooming')?.trigger).toEqual({ type: 'weekly', weekday: 2, hour: 18, minute: 15 });
  });

  it('plans restock alerts for low products only', () => {
    const food = (id: string, quantity: number): FoodItem => ({ id, petId: null, name: id, brand: null, quantity, unit: 'kg', lowThreshold: 1, dailyUsage: null, restockAlert: true, notes: null, createdAt: '', updatedAt: '' });
    const plan = planNotifications(input({ food: [food('low', 0.5), food('ok', 5)] }));
    expect(plan.filter((n) => n.category === 'restock').map((n) => n.params.name)).toEqual(['low']);
  });

  it('caps the number of scheduled notifications and keeps the soonest', () => {
    const many = Array.from({ length: 100 }, (_, i) => vacc({ id: `v${i}`, nextDueDate: `2027-${String((i % 12) + 1).padStart(2, '0')}-10`, reminderDaysBefore: 0 }));
    const plan = planNotifications(input({ vaccinations: many, maxNotifications: 20 }));
    expect(plan).toHaveLength(20);
    const dates = plan.filter((n) => n.trigger.type === 'date').map((n) => (n.trigger as { date: Date }).date.getTime());
    expect([...dates].sort((a, b) => a - b)).toEqual(dates);
  });

  it('is empty when every category is disabled', () => {
    const settings = allOn.map((s) => ({ ...s, enabled: false }));
    expect(planNotifications(input({ settings, vaccinations: [vacc({})], treatments: [treat({})] }))).toEqual([]);
  });

  it('computes the next occurrence of a time', () => {
    expect(nextOccurrence(now, '13:00')).toEqual(new Date(2026, 10, 13, 13, 0));
    expect(nextOccurrence(now, '09:00')).toEqual(new Date(2026, 10, 14, 9, 0));
  });

  it('plans at local wall-clock time in the current time zone (run in several zones by test:tz)', () => {
    const plan = planNotifications(input({ vaccinations: [vacc({ reminderDaysBefore: 0 })] }));
    const at = (plan[0]!.trigger as { date: Date }).date;
    expect([at.getHours(), at.getMinutes(), at.getDate()]).toEqual([9, 0, 20]);
  });
});

/* ------------------------------------------------------------------ Service (expo-notifications mocked) */

const mockScheduled: { identifier: string }[] = [];
let mockPermission: 'granted' | 'denied' = 'granted';

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(async () => undefined),
  getPermissionsAsync: jest.fn(async () => ({ status: mockPermission, canAskAgain: mockPermission !== 'denied' })),
  requestPermissionsAsync: jest.fn(async () => ({ status: mockPermission })),
  getAllScheduledNotificationsAsync: jest.fn(async () => [...mockScheduled]),
  cancelScheduledNotificationAsync: jest.fn(async (id: string) => {
    const i = mockScheduled.findIndex((s) => s.identifier === id);
    if (i >= 0) mockScheduled.splice(i, 1);
  }),
  scheduleNotificationAsync: jest.fn(async (req: { identifier: string }) => {
    mockScheduled.push({ identifier: req.identifier });
    return req.identifier;
  }),
  AndroidImportance: { HIGH: 4, DEFAULT: 3 },
  SchedulableTriggerInputTypes: { DATE: 'date', DAILY: 'daily', WEEKLY: 'weekly', TIME_INTERVAL: 'timeInterval' },
}));

describe('notification sync service', () => {
  const { createTestDatabase } = require('@factory/testing') as typeof import('@factory/testing');
  const { initDatabase } = require('@/database') as typeof import('@/database');
  const { syncNotifications } = require('@/services/notifications') as typeof import('@/services/notifications');
  const { clock } = require('@/services/clock') as typeof import('@/services/clock');
  const t = ((key: string, params?: Record<string, unknown>) => `${key}${params ? JSON.stringify(params) : ''}`) as never;

  beforeEach(() => {
    mockScheduled.splice(0, mockScheduled.length);
    mockPermission = 'granted';
    clock.set(() => new Date(2026, 10, 13, 12, 0));
  });
  afterAll(() => clock.set(null));

  async function setup() {
    const r = await initDatabase(await createTestDatabase());
    const p = await r.create('pets', { name: 'Rex', species: 'dog', breed: null, sex: null, birthDate: null, birthEstimated: false, weightKg: null, color: null, identification: null, adoptionDate: null, notes: null, photo: null, walkGoalMinutes: null, archived: false });
    await r.create('vaccinations', { petId: p.id, name: 'Rabies', administeredDate: '2025-11-20', nextDueDate: '2026-11-20', vetName: null, notes: null, reminderDaysBefore: 3 });
    return { r, p };
  }

  it('schedules the plan when permission is granted and replaces stale entries', async () => {
    const { r } = await setup();
    mockScheduled.push({ identifier: `${PREFIX}stale` }, { identifier: 'other-app-reminder' });
    const count = await syncNotifications(r, t);
    expect(count).toBe(2);
    const ids = mockScheduled.map((s) => s.identifier);
    expect(ids).not.toContain(`${PREFIX}stale`);
    expect(ids).toContain('other-app-reminder'); // never touches identifiers it does not own
  });

  it('schedules nothing (and does not crash) when permission is denied', async () => {
    const { r } = await setup();
    mockPermission = 'denied';
    mockScheduled.push({ identifier: `${PREFIX}old` });
    expect(await syncNotifications(r, t)).toBe(0);
    expect(mockScheduled).toHaveLength(0);
  });

  it('removes reminders when the category is turned off', async () => {
    const { r } = await setup();
    await syncNotifications(r, t);
    await r.notificationSettings.save({ ...DEFAULT_NOTIFICATION_SETTINGS.vaccinations, enabled: false });
    expect(await syncNotifications(r, t)).toBe(0);
    expect(mockScheduled.filter((s) => s.identifier.startsWith(PREFIX))).toHaveLength(0);
  });

  it('removes reminders of a deleted pet', async () => {
    const { r, p } = await setup();
    await syncNotifications(r, t);
    await r.remove('pets', p.id);
    expect(await syncNotifications(r, t)).toBe(0);
  });
});
