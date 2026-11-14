import { averageUnitPrice, computeConsumption, consumptionByMonth, fuelCostPerKm, sortFills, unitsInUse, validateFill } from '@/features/fuel/consumption';

import { fill } from './fixtures';

describe('full-to-full consumption', () => {
  it('needs two full fills with odometer: one fill gives no figure', () => {
    const r = computeConsumption([fill({ day: '2026-01-01', odometerKm: 10000 })], 'L');
    expect(r.averagePer100km).toBeNull();
    expect(r.segments).toHaveLength(0);
  });

  it('computes litres per 100 km between two full tanks', () => {
    const r = computeConsumption([fill({ day: '2026-01-01', odometerKm: 10000, quantity: 45 }), fill({ day: '2026-01-15', odometerKm: 10800, quantity: 48 })], 'L');
    // Only the fuel added at the second fill counts: 48 L over 800 km.
    expect(r.averagePer100km).toBeCloseTo(6, 6);
    expect(r.distanceKm).toBe(800);
  });

  it('adds partial top-ups to the next full fill', () => {
    const r = computeConsumption(
      [
        fill({ day: '2026-01-01', odometerKm: 10000, isFull: true }),
        fill({ day: '2026-01-05', odometerKm: 10300, quantity: 15, isFull: false }),
        fill({ day: '2026-01-10', odometerKm: 10600, quantity: 21, isFull: true }),
      ],
      'L',
    );
    expect(r.segments).toHaveLength(1);
    expect(r.segments[0]!.quantity).toBe(36);
    expect(r.averagePer100km).toBeCloseTo(6, 6);
  });

  it('ignores fills before the first full tank (unknown starting level)', () => {
    const r = computeConsumption(
      [
        fill({ day: '2026-01-01', odometerKm: 9800, quantity: 10, isFull: false }),
        fill({ day: '2026-01-02', odometerKm: 10000, quantity: 30, isFull: true }),
        fill({ day: '2026-01-10', odometerKm: 10500, quantity: 30, isFull: true }),
      ],
      'L',
    );
    expect(r.averagePer100km).toBeCloseTo(6, 6);
  });

  it('does not produce a figure when a fill was missed, then resumes after the next full tank', () => {
    const r = computeConsumption(
      [
        fill({ day: '2026-01-01', odometerKm: 10000 }),
        fill({ day: '2026-01-20', odometerKm: 11000, quantity: 30, missedPrevious: true }),
        fill({ day: '2026-02-01', odometerKm: 11500, quantity: 30 }),
      ],
      'L',
    );
    expect(r.broken).toContain('missed_fill');
    expect(r.segments).toHaveLength(1);
    expect(r.segments[0]!.fromId).not.toBe(r.segments[0]!.toId);
    expect(r.averagePer100km).toBeCloseTo(6, 6);
  });

  it('a full fill without odometer does not break the chain: its fuel joins the next segment', () => {
    const r = computeConsumption(
      [fill({ day: '2026-01-01', odometerKm: 10000 }), fill({ day: '2026-01-08', odometerKm: null, quantity: 20 }), fill({ day: '2026-01-15', odometerKm: 11000, quantity: 40 })],
      'L',
    );
    expect(r.segments).toHaveLength(1);
    expect(r.segments[0]!.quantity).toBe(60);
    expect(r.averagePer100km).toBeCloseTo(6, 6);
    expect(r.broken).toContain('missing_odometer');
  });

  it('flags an odometer that goes backwards and computes nothing for it', () => {
    const r = computeConsumption([fill({ day: '2026-01-01', odometerKm: 10000 }), fill({ day: '2026-01-15', odometerKm: 9000 })], 'L');
    expect(r.broken).toContain('odometer_backwards');
    expect(r.averagePer100km).toBeNull();
  });

  it('flags zero distance', () => {
    const r = computeConsumption([fill({ day: '2026-01-01', odometerKm: 10000 }), fill({ day: '2026-01-02', odometerKm: 10000 })], 'L');
    expect(r.broken).toContain('no_distance');
    expect(r.averagePer100km).toBeNull();
  });

  it('averages by distance (not by mean of segments)', () => {
    const r = computeConsumption(
      [fill({ day: '2026-01-01', odometerKm: 0 }), fill({ day: '2026-01-10', odometerKm: 100, quantity: 10 }), fill({ day: '2026-01-20', odometerKm: 1100, quantity: 50 })],
      'L',
    );
    // segments: 10 L/100 km over 100 km and 5 L/100 km over 1000 km → 60 L / 1100 km
    expect(r.averagePer100km).toBeCloseTo((60 / 1100) * 100, 6);
  });

  it('excludes implausible segments (typos) from the average but reports them', () => {
    const r = computeConsumption(
      [fill({ day: '2026-01-01', odometerKm: 10000 }), fill({ day: '2026-01-10', odometerKm: 10010, quantity: 40 }), fill({ day: '2026-01-20', odometerKm: 10810, quantity: 48 })],
      'L',
    );
    expect(r.segments).toHaveLength(2);
    expect(r.segments[0]!.suspicious).toBe(true);
    expect(r.averagePer100km).toBeCloseTo(6, 6);
  });

  it('keeps fuel and electricity as separate chains (plug-in hybrid)', () => {
    const fills = [
      fill({ day: '2026-01-01', odometerKm: 1000 }),
      fill({ day: '2026-01-02', odometerKm: 1050, quantity: 10, quantityUnit: 'kWh', fuelType: 'electric' }),
      fill({ day: '2026-01-05', odometerKm: 1150, quantity: 15, quantityUnit: 'kWh', fuelType: 'electric' }),
      fill({ day: '2026-01-10', odometerKm: 1500, quantity: 20 }),
    ];
    expect(unitsInUse(fills)).toEqual(['L', 'kWh']);
    expect(computeConsumption(fills, 'L').averagePer100km).toBeCloseTo(4, 6);
    expect(computeConsumption(fills, 'kWh').averagePer100km).toBeCloseTo(15, 6);
  });

  it('computes kWh/100 km for electric vehicles', () => {
    const r = computeConsumption(
      [fill({ day: '2026-01-01', odometerKm: 0, quantity: 50, quantityUnit: 'kWh' }), fill({ day: '2026-01-07', odometerKm: 300, quantity: 51, quantityUnit: 'kWh' })],
      'kWh',
    );
    expect(r.averagePer100km).toBeCloseTo(17, 6);
  });

  it('counts fills waiting for the next full tank', () => {
    const r = computeConsumption([fill({ day: '2026-01-01', odometerKm: 0 }), fill({ day: '2026-01-02', odometerKm: 500, quantity: 30 }), fill({ day: '2026-01-05', odometerKm: 700, isFull: false })], 'L');
    expect(r.pendingFills).toBe(1);
  });

  it('sorts by day then odometer, unknown odometer last within a day', () => {
    const sorted = sortFills([fill({ id: 'c', day: '2026-01-02', odometerKm: null }), fill({ id: 'b', day: '2026-01-02', odometerKm: 200 }), fill({ id: 'a', day: '2026-01-01', odometerKm: 100 })]);
    expect(sorted.map((f) => f.id)).toEqual(['a', 'b', 'c']);
  });
});

describe('fuel costs', () => {
  it('average price paid is Σ total / Σ quantity, per currency', () => {
    const p = averageUnitPrice([fill({ day: '2026-01-01', quantity: 40, totalMinor: 8000 }), fill({ day: '2026-01-02', quantity: 10, totalMinor: 1500 }), fill({ day: '2026-01-03', quantity: 10, totalMinor: 1000, currency: 'MAD' })], 'L');
    expect(p.EUR).toBeCloseTo(1.9, 6);
    expect(p.MAD).toBeCloseTo(1, 6);
  });

  it('fuel cost per km uses reliable single-currency segments only', () => {
    const r = computeConsumption([fill({ day: '2026-01-01', odometerKm: 0 }), fill({ day: '2026-01-10', odometerKm: 500, quantity: 30, totalMinor: 6000 })], 'L');
    expect(fuelCostPerKm(r).EUR).toBeCloseTo(12, 6); // 6000 cents / 500 km
  });

  it('groups the consumption trend by month', () => {
    const r = computeConsumption(
      [fill({ day: '2026-01-01', odometerKm: 0 }), fill({ day: '2026-01-20', odometerKm: 500, quantity: 30 }), fill({ day: '2026-02-10', odometerKm: 1000, quantity: 35 })],
      'L',
    );
    expect(consumptionByMonth(r).map((m) => m.month)).toEqual(['2026-01', '2026-02']);
  });
});

describe('fill validation', () => {
  const history = [fill({ id: 'x', day: '2026-01-10', odometerKm: 10000 }), fill({ id: 'y', day: '2026-01-20', odometerKm: 10500 })];

  it('warns when the odometer is lower than an earlier fill', () => {
    expect(validateFill({ id: 'n', day: '2026-01-25', odometerKm: 10400, quantity: 30, totalMinor: 5000 }, history)).toContain('odometer_lower_than_previous');
  });

  it('warns when the odometer is higher than a later fill (backdated entry)', () => {
    expect(validateFill({ id: 'n', day: '2026-01-15', odometerKm: 10600, quantity: 30, totalMinor: 5000 }, history)).toContain('odometer_higher_than_next');
  });

  it('accepts consistent values and ignores the edited fill itself', () => {
    expect(validateFill({ id: 'y', day: '2026-01-20', odometerKm: 10450, quantity: 30, totalMinor: 5000 }, history)).toEqual([]);
  });

  it('rejects a zero quantity', () => {
    expect(validateFill({ id: 'n', day: '2026-01-25', odometerKm: null, quantity: 0, totalMinor: 0 }, history)).toContain('quantity_invalid');
  });
});
