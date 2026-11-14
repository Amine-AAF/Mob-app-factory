import { TEMPLATE_ENTRIES } from '@/domain/packing';
import type { PackingEntry, Trip, WardrobeItem } from '@/domain/types';
import { greetingPeriod, monthStart, nextTrip, rediscoverItems, waitingForCare, wornThisMonth } from '@/features/home/logic';
import { NOTIFICATION_ORDER, NOTIFICATION_PARAM_OPTIONS, shiftTime } from '@/features/settings/logic';
import { premiumPlanKind } from '@/features/settings/premium';
import { ALL_TEMPLATE_KEYS, entriesBySection, groupTrips, templateKeyOf } from '@/features/trips/logic';
import enTrips from '@/i18n/locales/en/trips.json';
import esTrips from '@/i18n/locales/es/trips.json';
import frTrips from '@/i18n/locales/fr/trips.json';
import { NOTIFICATION_KINDS } from '@/domain/types';

const trip = (id: string, departureDate: string, returnDate: string): Trip => ({ id, destination: id, departureDate, returnDate, template: null, notes: null, reminderDays: null, createdAt: '2026-01-01T00:00:00Z' });

const item = (patch: Partial<WardrobeItem>): Pick<WardrobeItem, 'lastWornOn' | 'createdAt' | 'archived' | 'careStatus'> & { id: string } => ({
  id: 'i',
  lastWornOn: null,
  createdAt: '2026-01-01T10:00:00Z',
  archived: false,
  careStatus: 'clean',
  ...patch,
});

describe('trip helpers', () => {
  it('groups trips by phase with a useful order', () => {
    const g = groupTrips([trip('past1', '2026-01-01', '2026-01-03'), trip('soon', '2026-11-20', '2026-11-22'), trip('later', '2026-12-20', '2026-12-24'), trip('now', '2026-11-10', '2026-11-15'), trip('past2', '2026-06-01', '2026-06-02')], '2026-11-13');
    expect(g.ongoing.map((x) => x.id)).toEqual(['now']);
    expect(g.upcoming.map((x) => x.id)).toEqual(['soon', 'later']);
    expect(g.past.map((x) => x.id)).toEqual(['past2', 'past1']);
  });

  it('recognises template labels', () => {
    expect(templateKeyOf('tpl:socks')).toBe('socks');
    expect(templateKeyOf('My charger')).toBeNull();
    expect(templateKeyOf(null)).toBeNull();
  });

  it('groups checklist entries by section in position order', () => {
    const e = (id: string, section: PackingEntry['section'], position: number) => ({ id, section, position });
    const out = entriesBySection([e('a', 'shoes', 2), e('b', 'clothes', 3), e('c', 'clothes', 1)]);
    expect(out.map((s) => s.section)).toEqual(['clothes', 'shoes']);
    expect(out[0]!.data.map((x) => x.id)).toEqual(['c', 'b']);
  });

  it('has a translation for every template entry in every language', () => {
    const keys = new Set(Object.values(TEMPLATE_ENTRIES).flatMap((l) => l.map((x) => x.key)));
    expect(ALL_TEMPLATE_KEYS.length).toBe(keys.size);
    for (const res of [enTrips, frTrips, esTrips]) {
      for (const k of keys) expect((res.template as Record<string, string>)[k]).toBeTruthy();
    }
  });
});

describe('home helpers', () => {
  it('picks a greeting from the hour', () => {
    expect(greetingPeriod(7)).toBe('morning');
    expect(greetingPeriod(14)).toBe('afternoon');
    expect(greetingPeriod(21)).toBe('evening');
    expect(greetingPeriod(2)).toBe('evening');
  });

  it('counts distinct items worn this month', () => {
    expect(monthStart('2026-11-13')).toBe('2026-11-01');
    const usage = [
      { itemId: 'a', wornOn: '2026-11-02' },
      { itemId: 'a', wornOn: '2026-11-05' },
      { itemId: 'b', wornOn: '2026-11-13' },
      { itemId: 'c', wornOn: '2026-10-31' },
    ];
    expect(wornThisMonth(usage, '2026-11-13')).toBe(2);
  });

  it('counts active items waiting for care', () => {
    expect(waitingForCare([item({ careStatus: 'to_wash' }), item({ careStatus: 'to_iron' }), item({ careStatus: 'ready' }), item({ careStatus: 'in_laundry', archived: true })])).toBe(2);
  });

  it('suggests the longest-forgotten pieces first', () => {
    const list = [item({ id: 'recent', lastWornOn: '2026-11-01' }), item({ id: 'old', lastWornOn: '2026-03-01' }), item({ id: 'never', lastWornOn: null, createdAt: '2026-01-05T00:00:00Z' }), item({ id: 'arch', lastWornOn: '2025-01-01', archived: true })];
    expect(rediscoverItems(list, '2026-11-13').map((x) => x.id)).toEqual(['never', 'old']);
  });

  it('prefers an ongoing trip, then the next upcoming one', () => {
    expect(nextTrip([trip('later', '2026-12-01', '2026-12-03'), trip('past', '2026-01-01', '2026-01-02')], '2026-11-13')?.id).toBe('later');
    expect(nextTrip([trip('later', '2026-12-01', '2026-12-03'), trip('now', '2026-11-12', '2026-11-14')], '2026-11-13')?.id).toBe('now');
    expect(nextTrip([], '2026-11-13')).toBeNull();
  });
});

describe('settings helpers', () => {
  it('wraps notification times around midnight', () => {
    expect(shiftTime(7, 30, 15)).toEqual({ hour: 7, minute: 45 });
    expect(shiftTime(23, 45, 15)).toEqual({ hour: 0, minute: 0 });
    expect(shiftTime(0, 0, -15)).toEqual({ hour: 23, minute: 45 });
  });

  it('lists every notification kind once', () => {
    expect([...NOTIFICATION_ORDER].sort()).toEqual([...NOTIFICATION_KINDS].sort());
    expect(NOTIFICATION_PARAM_OPTIONS.budget?.values).toContain(80);
  });

  it('derives the plan kind from the product id', () => {
    expect(premiumPlanKind('closetwise_premium_annual')).toBe('annual');
    expect(premiumPlanKind('closetwise_premium_monthly')).toBe('monthly');
    expect(premiumPlanKind('closetwise_premium_lifetime')).toBe('lifetime');
    expect(premiumPlanKind(null)).toBeNull();
  });
});
