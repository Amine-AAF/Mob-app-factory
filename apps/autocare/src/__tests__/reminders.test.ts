import { alertsFor, MAX_SCHEDULED, NOTIFICATION_PREFIX, ODOMETER_STALE_DAYS, planNotifications, type VehicleContext } from '@/features/reminders/plan';
import type { AdminDeadline, InsurancePolicy, NotificationSetting } from '@/types';
import { addDays } from '@/utils/dates';

import { schedule, vehicle } from './fixtures';

const deadline = (p: Partial<AdminDeadline>): AdminDeadline => ({ id: 'd1', vehicleId: 'v1', type: 'inspection', title: null, dueDay: '2026-04-01', amountMinor: null, currency: 'EUR', remindDaysBefore: [30, 7], repeatMonths: null, completedAt: null, notes: null, createdAt: '', updatedAt: '', ...p });
const policy = (p: Partial<InsurancePolicy>): InsurancePolicy => ({ id: 'i1', vehicleId: 'v1', insurer: 'AXA', policyNumber: null, startDay: '2025-04-01', endDay: '2026-03-31', premiumMinor: 50000, currency: 'EUR', paymentFrequency: 'annual', coverage: null, contactName: null, contactPhone: null, contactEmail: null, remindDaysBefore: 30, renewedFromId: null, notes: null, createdAt: '', updatedAt: '', ...p });

const TODAY = '2026-03-02';
const ctx = (p: Partial<VehicleContext> = {}): VehicleContext => ({
  vehicle: vehicle(),
  readings: [
    { day: '2026-01-01', odometerKm: 10000 },
    { day: '2026-03-01', odometerKm: 13000 },
  ],
  schedules: [],
  deadlines: [],
  policies: [],
  documents: [],
  tires: [],
  ...p,
});

describe('dashboard alerts', () => {
  it('collects overdue and due-soon items across modules, overdue first', () => {
    const alerts = alertsFor(
      ctx({
        schedules: [schedule({ intervalKm: 2000, lastOdometerKm: 10000 })],
        deadlines: [deadline({ dueDay: '2026-03-20' })],
        policies: [policy({})],
      }),
      TODAY,
    );
    expect(alerts.map((a) => a.kind)).toEqual(['maintenance', 'deadline', 'insurance']);
    expect(alerts[0]!.severity).toBe('overdue');
  });

  it('only the latest insurance policy can alert', () => {
    const alerts = alertsFor(ctx({ policies: [policy({ id: 'old', endDay: '2025-03-31', startDay: '2024-04-01' }), policy({ id: 'new', startDay: '2026-04-01', endDay: '2027-03-31' })] }), TODAY);
    expect(alerts.filter((a) => a.kind === 'insurance')).toHaveLength(0);
  });

  it('asks for a mileage update when readings are stale', () => {
    const stale = alertsFor(ctx({ readings: [{ day: addDays(TODAY, -ODOMETER_STALE_DAYS), odometerKm: 1000 }] }), TODAY);
    expect(stale.some((a) => a.kind === 'odometer')).toBe(true);
    expect(alertsFor(ctx(), TODAY).some((a) => a.kind === 'odometer')).toBe(false);
  });

  it('marks mileage-based alerts as estimated', () => {
    const [a] = alertsFor(ctx({ schedules: [schedule({ intervalKm: 3300, lastOdometerKm: 10000, remindKmBefore: 500 })] }), TODAY);
    expect(a!.estimated).toBe(true);
    expect(a!.kmRemaining).toBe(300);
  });
});

describe('notification planning', () => {
  const settings: NotificationSetting[] = [];

  it('plans date-based reminders with the configured lead days', () => {
    const plan = planNotifications([ctx({ deadlines: [deadline({})] })], settings, TODAY, { advanced: true });
    const d = plan.filter((p) => p.category === 'deadlines');
    expect(d.map((p) => p.day)).toEqual(['2026-03-02', '2026-03-25']);
    expect(d.every((p) => p.identifier.startsWith(NOTIFICATION_PREFIX))).toBe(true);
  });

  it('free plan: one reminder per item', () => {
    const plan = planNotifications([ctx({ deadlines: [deadline({})] })], settings, TODAY, { advanced: false });
    expect(plan.filter((p) => p.category === 'deadlines')).toHaveLength(1);
  });

  it('mileage-based maintenance reminders are flagged as estimated', () => {
    const plan = planNotifications([ctx({ schedules: [schedule({ intervalKm: 5000, lastOdometerKm: 10000, remindDaysBefore: 7 })] })], settings, TODAY, { advanced: false });
    const m = plan.find((p) => p.category === 'maintenance');
    expect(m?.message).toBe('maintenance_estimated');
    expect(m?.estimated).toBe(true);
  });

  it('respects disabled categories and custom time', () => {
    const plan = planNotifications(
      [ctx({ deadlines: [deadline({})], policies: [policy({ endDay: '2026-12-31' })] })],
      [
        { category: 'deadlines', enabled: false, hour: 9, minute: 0 },
        { category: 'insurance', enabled: true, hour: 18, minute: 30 },
      ],
      TODAY,
      { advanced: false },
    );
    expect(plan.some((p) => p.category === 'deadlines')).toBe(false);
    const ins = plan.find((p) => p.category === 'insurance');
    expect(ins).toMatchObject({ hour: 18, minute: 30, day: '2026-12-01' });
  });

  it('never plans in the past, skips completed deadlines and archived vehicles', () => {
    const plan = planNotifications(
      [ctx({ deadlines: [deadline({ id: 'past', dueDay: '2026-02-01' }), deadline({ id: 'done', completedAt: 'x' })] }), ctx({ vehicle: vehicle({ id: 'v2', archived: true }), deadlines: [deadline({ id: 'arch', vehicleId: 'v2' })] })],
      settings,
      TODAY,
      { advanced: true },
    );
    expect(plan.filter((p) => p.category === 'deadlines')).toHaveLength(0);
  });

  it('caps the number of scheduled notifications, keeping the nearest', () => {
    const many = Array.from({ length: 100 }, (_, i) => deadline({ id: `d${i}`, dueDay: addDays(TODAY, 40 + i), remindDaysBefore: [0] }));
    const plan = planNotifications([ctx({ deadlines: many })], [{ category: 'odometer', enabled: false, hour: 9, minute: 0 }], TODAY, { advanced: false });
    expect(plan).toHaveLength(MAX_SCHEDULED);
    expect(plan[0]!.day <= plan[plan.length - 1]!.day).toBe(true);
  });

  it('includes a monthly mileage-update nudge', () => {
    const plan = planNotifications([ctx()], settings, TODAY, { advanced: false });
    expect(plan.find((p) => p.category === 'odometer')?.day).toBe('2026-03-31');
  });
});
