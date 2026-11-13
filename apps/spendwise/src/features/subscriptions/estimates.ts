import type { Subscription } from '@/types';
import { addDays, type DayKey } from '@/utils/dates';
import { roundDiv } from '@/utils/money';

import { nextOccurrence, periodsPerYear } from '../recurring/schedule';

/**
 * Subscription estimates. A tracked subscription is NOT a confirmed payment: these
 * figures are projections; a real payment only exists once the user records it as a transaction.
 *
 * Normalisation (exact, rounded once per currency):
 *   yearly cost  = price × periodsPerYear
 *   monthly cost = yearly cost / 12
 */
type Sub = Pick<Subscription, 'price' | 'currency' | 'frequency' | 'interval' | 'active' | 'startDate' | 'endDate'>;

function gcd(a: bigint, b: bigint): bigint {
  while (b) [a, b] = [b, a % b];
  return a < 0n ? -a : a;
}

/** Sum of price × periodsPerYear / divisor per currency, as exact rationals, rounded once. */
function normalized(subs: readonly Sub[], divisor: bigint): Record<string, number> {
  const acc = new Map<string, { num: bigint; den: bigint }>();
  for (const s of subs) {
    if (!s.active) continue;
    const p = periodsPerYear(s);
    const num = BigInt(s.price) * p.num;
    const den = p.den * divisor;
    const cur = acc.get(s.currency) ?? { num: 0n, den: 1n };
    let n = cur.num * den + num * cur.den;
    let d = cur.den * den;
    const g = gcd(n, d) || 1n;
    n /= g;
    d /= g;
    acc.set(s.currency, { num: n, den: d });
  }
  return Object.fromEntries([...acc.entries()].map(([c, f]) => [c, Number(roundDiv(f.num, f.den))]));
}

export function monthlyEstimate(subs: readonly Sub[]): Record<string, number> {
  return normalized(subs, 12n);
}

export function yearlyEstimate(subs: readonly Sub[]): Record<string, number> {
  return normalized(subs, 1n);
}

export function monthlyCostOf(sub: Sub): number {
  return monthlyEstimate([{ ...sub, active: true }])[sub.currency] ?? 0;
}

export function nextBillingDate(sub: Sub, today: DayKey): DayKey | null {
  if (!sub.active) return null;
  return nextOccurrence({ ...sub }, today);
}

/** Active subscriptions billed within `days` days, soonest first. */
export function upcomingBillings<T extends Sub & { id: string }>(subs: readonly T[], today: DayKey, days: number): { sub: T; date: DayKey }[] {
  const limit = addDays(today, days);
  return subs
    .map((sub) => ({ sub, date: nextBillingDate(sub, today) }))
    .filter((x): x is { sub: T; date: DayKey } => x.date !== null && x.date <= limit)
    .sort((a, b) => a.date.localeCompare(b.date));
}
