import { advanceSchedule, computeDue, filterRecords, scheduleErrors, sortByUrgency } from '@/features/maintenance/schedule';
import { checkReading, distanceBetween, estimateDailyRate, estimateDayForOdometer, estimateOdometer, latestOdometer } from '@/features/odometer/mileage';
import type { MaintenanceRecord } from '@/types';
import { addMonths } from '@/utils/dates';

import { schedule } from './fixtures';

const readings = [
  { day: '2026-01-01', odometerKm: 10000 },
  { day: '2026-03-02', odometerKm: 13000 }, // 3000 km in 60 days → 50 km/day
];

describe('odometer history', () => {
  it('keeps the highest reading as current', () => {
    expect(latestOdometer([...readings, { day: '2026-03-10', odometerKm: 12000 }])?.odometerKm).toBe(13000);
  });

  it('estimates the daily rate only with enough spread', () => {
    expect(estimateDailyRate(readings, '2026-03-02')?.kmPerDay).toBeCloseTo(50, 6);
    expect(estimateDailyRate([{ day: '2026-03-01', odometerKm: 1 }, { day: '2026-03-05', odometerKm: 100 }], '2026-03-05')).toBeNull();
    expect(estimateDailyRate([readings[0]!], '2026-03-02')).toBeNull();
  });

  it('projects odometer and dates — clearly an estimate', () => {
    const rate = estimateDailyRate(readings, '2026-03-02');
    const latest = latestOdometer(readings);
    expect(estimateOdometer(latest, rate, '2026-03-12')).toBeCloseTo(13500, 6);
    expect(estimateOdometer(latest, null, '2026-03-12')).toBe(13000);
    expect(estimateDayForOdometer(15000, latest, rate)).toBe('2026-04-11');
    expect(estimateDayForOdometer(15000, latest, null)).toBeNull();
  });

  it('flags inconsistent readings', () => {
    expect(checkReading({ day: '2026-04-01', odometerKm: 12000 }, readings)).toBe('lower_than_earlier');
    expect(checkReading({ day: '2026-02-01', odometerKm: 14000 }, readings)).toBe('higher_than_later');
    expect(checkReading({ day: '2026-04-01', odometerKm: 14000 }, readings)).toBeNull();
    expect(checkReading({ day: '2026-04-01', odometerKm: -1 }, readings)).toBe('negative');
  });

  it('distance between days needs two readings', () => {
    expect(distanceBetween(readings, '2026-01-01', '2026-12-31')).toBe(3000);
    expect(distanceBetween(readings, '2026-03-01', '2026-12-31')).toBeNull();
  });
});

describe('maintenance due dates', () => {
  const ctx = { today: '2026-03-02', odometerKm: 13000, latest: latestOdometer(readings), rate: estimateDailyRate(readings, '2026-03-02') };

  it('due by time only', () => {
    const due = computeDue(schedule({ intervalMonths: 12, lastDay: '2025-06-01' }), ctx);
    expect(due.dueDayByTime).toBe('2026-06-01');
    expect(due.status).toBe('ok');
    expect(due.estimated).toBe(false);
  });

  it('due by distance: projection is flagged as estimated', () => {
    const due = computeDue(schedule({ intervalKm: 5000, lastOdometerKm: 10000 }), ctx);
    expect(due.dueKm).toBe(15000);
    expect(due.kmRemaining).toBe(2000);
    expect(due.estimatedDayByKm).toBe('2026-04-11');
    expect(due.estimated).toBe(true);
    expect(due.status).toBe('ok');
  });

  it('whichever comes first wins', () => {
    const due = computeDue(schedule({ intervalKm: 5000, lastOdometerKm: 10000, intervalMonths: 12, lastDay: '2026-01-01' }), ctx);
    expect(due.nextDay).toBe('2026-04-11');
    expect(due.estimated).toBe(true);
  });

  it('overdue by distance even if the date is far', () => {
    const due = computeDue(schedule({ intervalKm: 2000, lastOdometerKm: 10000, intervalMonths: 24, lastDay: '2026-01-01' }), ctx);
    expect(due.status).toBe('overdue');
    expect(due.kmRemaining).toBe(-1000);
  });

  it('due soon within the reminder window (days or km)', () => {
    expect(computeDue(schedule({ intervalMonths: 3, lastDay: '2025-12-10', remindDaysBefore: 14 }), ctx).status).toBe('due_soon');
    expect(computeDue(schedule({ intervalKm: 3300, lastOdometerKm: 10000, remindKmBefore: 500 }), ctx).status).toBe('due_soon');
  });

  it('never imposes an interval: without one, status is unknown', () => {
    const due = computeDue(schedule({}), ctx);
    expect(due.status).toBe('unknown');
    expect(due.neverDone).toBe(true);
    expect(due.nextDay).toBeNull();
  });

  it('month intervals clamp to month end', () => {
    expect(addMonths('2026-01-31', 1)).toBe('2026-02-28');
    expect(addMonths('2028-01-31', 1)).toBe('2028-02-29');
    expect(computeDue(schedule({ intervalMonths: 1, lastDay: '2026-01-31' }), ctx).dueDayByTime).toBe('2026-02-28');
  });

  it('sorts by urgency', () => {
    const items = [
      { id: 'ok', due: computeDue(schedule({ id: 'ok', intervalMonths: 12, lastDay: '2026-01-01' }), ctx) },
      { id: 'over', due: computeDue(schedule({ id: 'over', intervalKm: 1000, lastOdometerKm: 10000 }), ctx) },
      { id: 'unknown', due: computeDue(schedule({ id: 'unknown' }), ctx) },
    ];
    expect(sortByUrgency(items).map((i) => i.id)).toEqual(['over', 'ok', 'unknown']);
  });
});

describe('schedule updates from records', () => {
  it('moves forward with a newer record', () => {
    expect(advanceSchedule(schedule({ lastDay: '2025-01-01', lastOdometerKm: 5000 }), { day: '2026-01-01', odometerKm: 15000 })).toEqual({ lastDay: '2026-01-01', lastOdometerKm: 15000 });
  });

  it('a backfilled old invoice never resets the schedule', () => {
    expect(advanceSchedule(schedule({ lastDay: '2026-01-01', lastOdometerKm: 15000 }), { day: '2025-01-01', odometerKm: 5000 })).toBeNull();
  });

  it('keeps the known odometer when the record has none', () => {
    expect(advanceSchedule(schedule({ lastDay: '2025-01-01', lastOdometerKm: 5000 }), { day: '2026-01-01', odometerKm: null })).toEqual({ lastDay: '2026-01-01', lastOdometerKm: 5000 });
  });

  it('validates intervals', () => {
    expect(scheduleErrors({ intervalKm: null, intervalMonths: null })).toEqual(['interval_required']);
    expect(scheduleErrors({ intervalKm: 0, intervalMonths: null })).toEqual(['interval_km_invalid']);
    expect(scheduleErrors({ intervalKm: null, intervalMonths: 1.5 })).toEqual(['interval_months_invalid']);
    expect(scheduleErrors({ intervalKm: 10000, intervalMonths: 12 })).toEqual([]);
  });
});

describe('history search & filters', () => {
  const rec = (p: Partial<MaintenanceRecord>): MaintenanceRecord => ({
    id: Math.random().toString(),
    vehicleId: 'v1',
    type: 'oil_change',
    title: null,
    day: '2026-01-01',
    odometerKm: null,
    description: null,
    provider: null,
    costMinor: null,
    currency: 'EUR',
    parts: null,
    notes: null,
    scheduleId: null,
    createdAt: '',
    updatedAt: '',
    ...p,
  });
  const records = [rec({ type: 'oil_change', provider: 'Garage Martin' }), rec({ type: 'brake_pads', parts: 'Bosch BP123', day: '2026-02-01' }), rec({ type: 'repair', title: 'Wiper motor', day: '2025-05-01' })];

  it('searches text fields and the translated type label', () => {
    expect(filterRecords(records, { query: 'martin' })).toHaveLength(1);
    expect(filterRecords(records, { query: 'bosch' })).toHaveLength(1);
    expect(filterRecords(records, { query: 'vidange', typeLabel: (t) => (t === 'oil_change' ? 'Vidange' : t) })).toHaveLength(1);
  });

  it('filters by type and date range', () => {
    expect(filterRecords(records, { types: ['repair'] })).toHaveLength(1);
    expect(filterRecords(records, { fromDay: '2026-01-01' })).toHaveLength(2);
  });
});
