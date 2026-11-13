import { currencyDecimals, isCurrencyCode } from '@/constants/currencies';
import { bucketTrips, countActiveTrips, effectiveStatus, preparationProgress, tripTiming } from '@/features/trips/status';
import { isManagedUri } from '@/utils/paths';
import type { Trip } from '@/types/models';
import {
  compareTimeline,
  dateRange,
  dayNumber,
  daysUntil,
  durationBetween,
  isValidDate,
  isValidTime,
  isValidTimeZone,
  normalizeTime,
  tripDayCount,
  tripNights,
} from '@/utils/dates';
import { createId } from '@/utils/ids';
import { budgetRatio, convertMinor, formatMoney, invertRate, parseAmount, parseRate, toMinor } from '@/utils/money';

const trip = (patch: Partial<Trip>): Trip => ({
  id: createId(),
  name: 'T',
  primaryDestination: '',
  countryCode: null,
  city: null,
  startDate: null,
  endDate: null,
  timeZone: null,
  description: '',
  coverUri: null,
  tripType: 'solo',
  budgetMinor: null,
  currency: 'EUR',
  status: 'planning',
  isDemo: false,
  archivedAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...patch,
});

describe('calendar dates', () => {
  it('validates dates strictly', () => {
    expect(isValidDate('2028-02-29')).toBe(true);
    expect(isValidDate('2027-02-29')).toBe(false);
    expect(isValidDate('2026-13-01')).toBe(false);
    expect(isValidDate('30/07/2026')).toBe(false);
    expect(isValidDate(null)).toBe(false);
  });

  it('counts days and nights across months and years', () => {
    expect(tripDayCount('2026-07-30', '2026-08-06')).toBe(8);
    expect(tripNights('2026-07-30', '2026-08-06')).toBe(7);
    expect(tripDayCount('2026-12-29', '2027-01-03')).toBe(6);
    expect(tripNights('2026-05-01', '2026-05-01')).toBe(0);
    expect(tripDayCount('2026-08-06', '2026-07-30')).toBeNull();
    expect(dateRange('2026-12-30', '2027-01-02')).toEqual(['2026-12-30', '2026-12-31', '2027-01-01', '2027-01-02']);
    expect(dateRange('2026-01-02', '2026-01-01')).toEqual([]);
  });

  it('is independent of daylight-saving changes', () => {
    // Europe switches to summer time on 2026-03-29.
    expect(tripDayCount('2026-03-28', '2026-03-30')).toBe(3);
    expect(dateRange('2026-10-24', '2026-10-26')).toHaveLength(3);
  });

  it('computes countdown and day numbers', () => {
    expect(daysUntil('2026-07-20', '2026-07-30')).toBe(10);
    expect(daysUntil('2026-07-30', '2026-07-30')).toBe(0);
    expect(daysUntil('2026-07-30', null)).toBeNull();
    expect(dayNumber('2026-07-30', '2026-08-06', '2026-08-01')).toBe(3);
    expect(dayNumber('2026-07-30', '2026-08-06', '2026-08-07')).toBeNull();
  });
});

describe('wall-clock times', () => {
  it('normalises typed times', () => {
    expect(normalizeTime('9:05')).toBe('09:05');
    expect(normalizeTime('9h30')).toBe('09:30');
    expect(normalizeTime('1745')).toBe('17:45');
    expect(normalizeTime('20')).toBe('20:00');
    expect(normalizeTime('24:00')).toBeNull();
    expect(normalizeTime('12:60')).toBeNull();
    expect(isValidTime('07:00')).toBe(true);
    expect(isValidTime('7:00')).toBe(false);
  });

  it('computes durations, including past midnight', () => {
    expect(durationBetween('09:00', '11:30')).toBe(150);
    expect(durationBetween('22:00', '01:00')).toBe(180);
  });

  it('orders a day timeline: timed items by time, untimed last, then manual position', () => {
    const items = [
      { id: 'dinner', date: '2026-07-30', startTime: '20:00', position: 0 },
      { id: 'free', date: '2026-07-30', startTime: null, position: 1 },
      { id: 'airport', date: '2026-07-30', startTime: '09:00', position: 5 },
      { id: 'next-day', date: '2026-07-31', startTime: '08:00', position: 0 },
      { id: 'free2', date: '2026-07-30', startTime: null, position: 0 },
    ];
    expect([...items].sort(compareTimeline).map((i) => i.id)).toEqual(['airport', 'dinner', 'free2', 'free', 'next-day']);
  });

  it('validates IANA time zones', () => {
    expect(isValidTimeZone('Europe/Lisbon')).toBe(true);
    expect(isValidTimeZone('Asia/Tokyo')).toBe(true);
    expect(isValidTimeZone('Mars/Olympus')).toBe(false);
  });
});

describe('money', () => {
  it('knows the minor units of each supported currency', () => {
    expect(currencyDecimals('EUR')).toBe(2);
    expect(currencyDecimals('JPY')).toBe(0);
    expect(isCurrencyCode('MAD')).toBe(true);
    expect(isCurrencyCode('XYZ')).toBe(false);
  });

  it('parses amounts typed in various locales', () => {
    expect(parseAmount('12.5', 'EUR')).toBe(1250);
    expect(parseAmount('12,5', 'EUR')).toBe(1250);
    expect(parseAmount('1 234,56', 'EUR')).toBe(123456);
    expect(parseAmount('1,234.56', 'USD')).toBe(123456);
    expect(parseAmount('1.234,56', 'EUR')).toBe(123456);
    expect(parseAmount('1,234', 'USD')).toBe(123400);
    expect(parseAmount('1.000.000', 'JPY')).toBe(1000000);
    expect(parseAmount('1500', 'JPY')).toBe(1500);
    expect(parseAmount('0.005', 'EUR')).toBe(1);
    expect(parseAmount('-3', 'EUR')).toBeNull();
    expect(parseAmount('abc', 'EUR')).toBeNull();
    expect(parseAmount('', 'EUR')).toBeNull();
    expect(parseAmount('12.', 'EUR')).toBeNull();
  });

  it('rounds half away from zero at the boundary only', () => {
    expect(toMinor(1.005, 'EUR')).toBe(101);
    expect(toMinor(2.675, 'USD')).toBe(268);
    expect(toMinor(0.5, 'JPY')).toBe(1);
  });

  it('converts with a user-provided rate', () => {
    expect(convertMinor(10000, 'EUR', 'USD', 1.0845)).toBe(10845);
    expect(convertMinor(10000, 'EUR', 'JPY', 162.37)).toBe(16237);
    expect(convertMinor(1500, 'JPY', 'EUR', 0.00616)).toBe(924);
    expect(convertMinor(999, 'MAD', 'MAD', 3)).toBe(999);
    expect(() => convertMinor(100, 'EUR', 'USD', 0)).toThrow(RangeError);
    expect(invertRate(4)).toBe(0.25);
    expect(parseRate('1,0845')).toBe(1.0845);
    expect(parseRate('0')).toBeNull();
    expect(parseRate('-1')).toBeNull();
  });

  it('formats money with Intl and computes budget ratios', () => {
    expect(formatMoney(123456, 'EUR', 'en')).toContain('1,234.56');
    expect(formatMoney(1500, 'JPY', 'en')).toContain('1,500');
    expect(budgetRatio(5000, 10000)).toBe(0.5);
    expect(budgetRatio(12000, 10000)).toBe(1.2);
    expect(budgetRatio(100, null)).toBeNull();
    expect(budgetRatio(100, 0)).toBeNull();
  });
});

describe('trip status', () => {
  const today = '2026-08-01';
  it('derives the displayed status from dates', () => {
    expect(effectiveStatus(trip({ startDate: '2026-07-30', endDate: '2026-08-06' }), today)).toBe('ongoing');
    expect(effectiveStatus(trip({ startDate: '2026-07-01', endDate: '2026-07-05' }), today)).toBe('completed');
    expect(effectiveStatus(trip({ startDate: '2026-09-01', endDate: '2026-09-05', status: 'upcoming' }), today)).toBe('upcoming');
    expect(effectiveStatus(trip({ startDate: '2026-09-01', endDate: '2026-09-05', status: 'completed' }), today)).toBe('upcoming');
    expect(effectiveStatus(trip({ startDate: '2026-07-01', endDate: '2026-07-05', archivedAt: '2026-07-10T00:00:00Z', status: 'archived' }), today)).toBe('archived');
    expect(effectiveStatus(trip({ status: 'completed' }), today)).toBe('completed');
    expect(effectiveStatus(trip({}), today)).toBe('planning');
  });

  it('buckets trips for the dashboard and counts active trips', () => {
    const list = [
      trip({ id: 'later', startDate: '2026-12-01', endDate: '2026-12-05' }),
      trip({ id: 'now', startDate: '2026-07-30', endDate: '2026-08-06' }),
      trip({ id: 'soon', startDate: '2026-08-10', endDate: '2026-08-12' }),
      trip({ id: 'idea' }),
      trip({ id: 'past', startDate: '2026-05-01', endDate: '2026-05-04' }),
      trip({ id: 'older', startDate: '2026-01-01', endDate: '2026-01-04' }),
      trip({ id: 'gone', status: 'archived', archivedAt: '2026-02-01T00:00:00Z' }),
      trip({ id: 'demo', isDemo: true, startDate: '2026-08-20', endDate: '2026-08-22' }),
    ];
    const b = bucketTrips(list, today);
    expect(b.ongoing.map((t) => t.id)).toEqual(['now']);
    expect(b.upcoming.map((t) => t.id)).toEqual(['soon', 'demo', 'later', 'idea']);
    expect(b.completed.map((t) => t.id)).toEqual(['past', 'older']);
    expect(b.archived.map((t) => t.id)).toEqual(['gone']);
    expect(countActiveTrips(list, today)).toBe(4);
  });

  it('computes countdown and current day', () => {
    const t = trip({ startDate: '2026-07-30', endDate: '2026-08-06' });
    expect(tripTiming(t, '2026-07-20')).toEqual({ days: 8, nights: 7, daysToGo: 10, currentDay: null });
    expect(tripTiming(t, '2026-07-30')).toMatchObject({ daysToGo: 0, currentDay: 1 });
    expect(tripTiming(t, '2026-08-01')).toMatchObject({ daysToGo: null, currentDay: 3 });
    expect(tripTiming(t, '2026-08-10')).toMatchObject({ daysToGo: null, currentDay: null });
    expect(tripTiming(trip({}), '2026-08-10')).toEqual({ days: null, nights: null, daysToGo: null, currentDay: null });
  });

  it('reports preparation from real data only', () => {
    expect(preparationProgress({ packed: 0, packingTotal: 0, tasksDone: 0, tasksTotal: 0 })).toBeNull();
    expect(preparationProgress({ packed: 6, packingTotal: 8, tasksDone: 2, tasksTotal: 2 })).toBe(0.8);
  });
});

describe('ids and file safety', () => {
  it('generates unique UUID v4 ids', () => {
    const ids = new Set(Array.from({ length: 500 }, createId));
    expect(ids.size).toBe(500);
    expect([...ids][0]).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it('only manages files inside the private root', () => {
    const root = 'file:///data/user/0/app/files/travelwise';
    expect(isManagedUri(`${root}/docs/a.pdf`, root)).toBe(true);
    expect(isManagedUri(`${root}/../databases/travelwise.db`, root)).toBe(false);
    expect(isManagedUri('file:///sdcard/Download/a.pdf', root)).toBe(false);
    expect(isManagedUri(`${root}x/a.pdf`, root)).toBe(false);
  });
});
