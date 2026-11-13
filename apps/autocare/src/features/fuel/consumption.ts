import { sumByCurrency, type CurrencyTotals } from '@/features/money/money';
import type { DayKey, FuelRecord, QuantityUnit } from '@/types';

/**
 * Fuel / energy consumption with the "full-to-full" method.
 *
 * A consumption figure is only produced between two FULL fills whose odometer
 * readings are known: distance = odo(B) − odo(A), fuel = every quantity added
 * after A up to and including B (partial top-ups in between count).
 *
 * A segment is NOT computed (reported as unreliable, never guessed) when:
 * - there is no earlier full fill (the starting level is unknown);
 * - one of the two full fills has no odometer reading;
 * - a fill in the segment is flagged "missed previous fill" (fuel went in unrecorded);
 * - the odometer goes backwards or does not move;
 * - quantities mix units (litres and kWh are separate chains: plug-in hybrids get two).
 *
 * Averages are distance-weighted (Σ fuel / Σ distance), not a mean of segment figures.
 */
export interface ConsumptionSegment {
  fromId: string;
  toId: string;
  startDay: DayKey;
  endDay: DayKey;
  distanceKm: number;
  quantity: number;
  unit: QuantityUnit;
  /** Litres or kWh per 100 km. */
  per100km: number;
  /** Spend of the fills in the segment, per currency. */
  cost: CurrencyTotals;
  /** Outside a plausible range: probably a typo, excluded from averages. */
  suspicious: boolean;
}

export type BrokenReason = 'missing_odometer' | 'missed_fill' | 'odometer_backwards' | 'no_distance';

export interface ConsumptionResult {
  unit: QuantityUnit;
  segments: ConsumptionSegment[];
  /** Distance-weighted average of the non-suspicious segments; null without any reliable segment. */
  averagePer100km: number | null;
  distanceKm: number;
  quantity: number;
  /** Reasons that prevented some segments from being computed (for a clear UI message). */
  broken: BrokenReason[];
  /** Fills that cannot be used yet (e.g. a partial fill not followed by a full one). */
  pendingFills: number;
}

/** Plausible ranges per 100 km. Anything outside is flagged, never silently "fixed". */
const PLAUSIBLE: Record<QuantityUnit, [number, number]> = { L: [1, 50], kWh: [5, 80] };

/** Chronological order: day, then odometer (unknown last within a day), then creation. */
export function sortFills(fills: readonly FuelRecord[]): FuelRecord[] {
  return [...fills].sort((a, b) => {
    if (a.day !== b.day) return a.day < b.day ? -1 : 1;
    if (a.odometerKm !== null && b.odometerKm !== null && a.odometerKm !== b.odometerKm) return a.odometerKm - b.odometerKm;
    if (a.odometerKm === null && b.odometerKm !== null) return 1;
    if (b.odometerKm === null && a.odometerKm !== null) return -1;
    return a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0;
  });
}

export function computeConsumption(fills: readonly FuelRecord[], unit: QuantityUnit): ConsumptionResult {
  const chain = sortFills(fills.filter((f) => f.quantityUnit === unit));
  const segments: ConsumptionSegment[] = [];
  const broken = new Set<BrokenReason>();

  // `as` keeps TS from narrowing to `null` (it can't see the assignment inside `reset`).
  let anchor = null as FuelRecord | null; // last full fill with a known odometer
  let pending: FuelRecord[] = []; // fills after the anchor
  let chainBroken = false;

  const reset = (to: FuelRecord | null) => {
    anchor = to && to.isFull && to.odometerKm !== null ? to : null;
    pending = [];
    chainBroken = false;
  };

  for (const fill of chain) {
    if (fill.missedPrevious && anchor) {
      broken.add('missed_fill');
      chainBroken = true;
    }
    pending.push(fill);
    // A full fill without an odometer reading cannot close a segment, but it does not
    // break the chain either: its fuel simply counts towards the next full fill that has one.
    if (!fill.isFull || fill.odometerKm === null) continue;

    // A full fill closes the current segment (if any) and becomes the next anchor.
    const start = anchor;
    if (start && !chainBroken) {
      {
        const distanceKm = fill.odometerKm - (start.odometerKm as number);
        if (distanceKm < 0) broken.add('odometer_backwards');
        else if (distanceKm === 0) broken.add('no_distance');
        else {
          const quantity = pending.reduce((s, f) => s + f.quantity, 0);
          const per100km = (quantity / distanceKm) * 100;
          const [lo, hi] = PLAUSIBLE[unit];
          segments.push({
            fromId: start.id,
            toId: fill.id,
            startDay: start.day,
            endDay: fill.day,
            distanceKm,
            quantity,
            unit,
            per100km,
            cost: sumByCurrency(pending.map((f) => ({ minor: f.totalMinor, currency: f.currency }))),
            suspicious: per100km < lo || per100km > hi,
          });
        }
      }
    }
    reset(fill);
  }
  if (chain.some((f) => f.isFull && f.odometerKm === null)) broken.add('missing_odometer');

  const reliable = segments.filter((s) => !s.suspicious);
  const distanceKm = reliable.reduce((s, x) => s + x.distanceKm, 0);
  const quantity = reliable.reduce((s, x) => s + x.quantity, 0);
  return {
    unit,
    segments,
    averagePer100km: distanceKm > 0 ? (quantity / distanceKm) * 100 : null,
    distanceKm,
    quantity,
    broken: [...broken],
    pendingFills: pending.length,
  };
}

/** Which consumption chains apply to a vehicle's fills (both for plug-in hybrids). */
export function unitsInUse(fills: readonly FuelRecord[]): QuantityUnit[] {
  const set = new Set(fills.map((f) => f.quantityUnit));
  return (['L', 'kWh'] as const).filter((u) => set.has(u));
}

/** Average price actually paid per litre / kWh, per currency (Σ total / Σ quantity). */
export function averageUnitPrice(fills: readonly FuelRecord[], unit: QuantityUnit): Record<string, number> {
  const acc: Record<string, { minor: number; qty: number }> = {};
  for (const f of fills) {
    if (f.quantityUnit !== unit || f.quantity <= 0) continue;
    const a = (acc[f.currency] ??= { minor: 0, qty: 0 });
    a.minor += f.totalMinor;
    a.qty += f.quantity;
  }
  return Object.fromEntries(Object.entries(acc).map(([c, a]) => [c, a.minor / 100 / a.qty]));
}

/**
 * Fuel cost per km over reliable segments, per currency (minor units per km).
 * Only segments whose fills are all in one currency are used.
 */
export function fuelCostPerKm(result: ConsumptionResult): Record<string, number> {
  const acc: Record<string, { minor: number; km: number }> = {};
  for (const s of result.segments) {
    if (s.suspicious) continue;
    const currencies = Object.keys(s.cost);
    if (currencies.length !== 1) continue;
    const c = currencies[0]!;
    const a = (acc[c] ??= { minor: 0, km: 0 });
    a.minor += s.cost[c]!;
    a.km += s.distanceKm;
  }
  return Object.fromEntries(Object.entries(acc).filter(([, a]) => a.km > 0).map(([c, a]) => [c, a.minor / a.km]));
}

/** Monthly evolution: distance-weighted average per month of the segment end. */
export function consumptionByMonth(result: ConsumptionResult): { month: string; per100km: number }[] {
  const acc = new Map<string, { q: number; d: number }>();
  for (const s of result.segments) {
    if (s.suspicious) continue;
    const m = s.endDay.slice(0, 7);
    const a = acc.get(m) ?? { q: 0, d: 0 };
    a.q += s.quantity;
    a.d += s.distanceKm;
    acc.set(m, a);
  }
  return [...acc.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).map(([month, a]) => ({ month, per100km: (a.q / a.d) * 100 }));
}

/** Validates a new fill against the existing ones before saving. */
export type FillIssue = 'odometer_lower_than_previous' | 'odometer_higher_than_next' | 'quantity_invalid' | 'total_invalid';

export function validateFill(fill: Pick<FuelRecord, 'id' | 'day' | 'odometerKm' | 'quantity' | 'totalMinor'>, others: readonly FuelRecord[]): FillIssue[] {
  const issues: FillIssue[] = [];
  if (!(fill.quantity > 0)) issues.push('quantity_invalid');
  if (!(fill.totalMinor >= 0)) issues.push('total_invalid');
  if (fill.odometerKm !== null) {
    const rest = others.filter((o) => o.id !== fill.id && o.odometerKm !== null);
    const before = rest.filter((o) => o.day < fill.day);
    const after = rest.filter((o) => o.day > fill.day);
    if (before.some((o) => (o.odometerKm as number) > (fill.odometerKm as number))) issues.push('odometer_lower_than_previous');
    if (after.some((o) => (o.odometerKm as number) < (fill.odometerKm as number))) issues.push('odometer_higher_than_next');
  }
  return issues;
}
