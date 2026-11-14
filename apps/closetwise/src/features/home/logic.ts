import { diffDays } from '@factory/app-core';

import type { CareStatus } from '@/domain/catalog';
import { isRarelyUsed } from '@/domain/insights';
import { tripPhase } from '@/domain/packing';
import type { DayKey, Trip, UsageEntry, WardrobeItem } from '@/domain/types';

/** Care states that mean "waiting for care" on the Home screen. */
export const WAITING_CARE_STATUSES: readonly CareStatus[] = ['to_wash', 'in_laundry', 'to_iron'];

export type GreetingPeriod = 'morning' | 'afternoon' | 'evening';

export function greetingPeriod(hour: number): GreetingPeriod {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  return 'evening';
}

export function monthStart(today: DayKey): DayKey {
  return `${today.slice(0, 7)}-01`;
}

/** Distinct items worn since the first day of the current month. */
export function wornThisMonth(usage: readonly Pick<UsageEntry, 'itemId' | 'wornOn'>[], today: DayKey): number {
  const from = monthStart(today);
  return new Set(usage.filter((u) => u.wornOn >= from && u.wornOn <= today).map((u) => u.itemId)).size;
}

export function waitingForCare(items: readonly Pick<WardrobeItem, 'careStatus' | 'archived'>[]): number {
  return items.filter((i) => !i.archived && WAITING_CARE_STATUSES.includes(i.careStatus)).length;
}

/** Rarely worn active items, the longest-forgotten first. */
export function rediscoverItems<T extends Pick<WardrobeItem, 'lastWornOn' | 'createdAt' | 'archived'>>(items: readonly T[], today: DayKey, limit = 6): T[] {
  const ref = (i: T) => i.lastWornOn ?? i.createdAt.slice(0, 10);
  return items
    .filter((i) => !i.archived && isRarelyUsed(i, today))
    .sort((a, b) => ref(a).localeCompare(ref(b)))
    .slice(0, limit);
}

/** The ongoing trip, otherwise the closest upcoming one. */
export function nextTrip<T extends Pick<Trip, 'departureDate' | 'returnDate'>>(trips: readonly T[], today: DayKey): T | null {
  const active = trips.filter((t) => tripPhase(t, today) !== 'past').sort((a, b) => a.departureDate.localeCompare(b.departureDate));
  return active[0] ?? null;
}

/** Days until departure (0 = today or already travelling). */
export function daysUntil(day: DayKey, today: DayKey): number {
  return Math.max(0, diffDays(today, day));
}
