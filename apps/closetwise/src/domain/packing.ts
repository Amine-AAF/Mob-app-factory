import { diffDays } from '@factory/app-core';

import type { PackingSection, TripTemplate } from './catalog';
import type { DayKey, PackingEntry, Trip } from './types';

/**
 * Trip templates: generic checklist entries (labels are i18n keys under `packing.template.*`).
 * They are suggestions the user edits; ClosetWise focuses on clothes, not on travel booking.
 */
export const TEMPLATE_ENTRIES: Record<TripTemplate, { key: string; section: PackingSection }[]> = {
  weekend: [
    { key: 'sleepwear', section: 'clothes' },
    { key: 'underwear', section: 'clothes' },
    { key: 'socks', section: 'clothes' },
    { key: 'comfortable_shoes', section: 'shoes' },
    { key: 'light_jacket', section: 'clothes' },
  ],
  business: [
    { key: 'suit_or_blazer', section: 'clothes' },
    { key: 'dress_shoes', section: 'shoes' },
    { key: 'belt', section: 'accessories' },
    { key: 'underwear', section: 'clothes' },
    { key: 'socks', section: 'clothes' },
    { key: 'garment_bag', section: 'care' },
    { key: 'lint_roller', section: 'care' },
  ],
  summer: [
    { key: 'swimwear', section: 'clothes' },
    { key: 'sandals', section: 'shoes' },
    { key: 'sun_hat', section: 'accessories' },
    { key: 'sunglasses', section: 'accessories' },
    { key: 'light_layers', section: 'clothes' },
    { key: 'underwear', section: 'clothes' },
  ],
  winter: [
    { key: 'thermal_layers', section: 'clothes' },
    { key: 'warm_coat', section: 'clothes' },
    { key: 'gloves', section: 'accessories' },
    { key: 'scarf', section: 'accessories' },
    { key: 'beanie', section: 'accessories' },
    { key: 'boots', section: 'shoes' },
    { key: 'warm_socks', section: 'clothes' },
  ],
  beach: [
    { key: 'swimwear', section: 'clothes' },
    { key: 'cover_up', section: 'clothes' },
    { key: 'flip_flops', section: 'shoes' },
    { key: 'beach_bag', section: 'accessories' },
    { key: 'sunglasses', section: 'accessories' },
    { key: 'sun_hat', section: 'accessories' },
  ],
  city: [
    { key: 'walking_shoes', section: 'shoes' },
    { key: 'day_bag', section: 'accessories' },
    { key: 'evening_outfit', section: 'clothes' },
    { key: 'light_jacket', section: 'clothes' },
    { key: 'underwear', section: 'clothes' },
  ],
};

export function tripNights(trip: Pick<Trip, 'departureDate' | 'returnDate'>): number {
  return Math.max(0, diffDays(trip.departureDate, trip.returnDate));
}

export function isValidTripDates(departure: DayKey, ret: DayKey): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(departure) && /^\d{4}-\d{2}-\d{2}$/.test(ret) && diffDays(departure, ret) >= 0;
}

export type TripPhase = 'upcoming' | 'ongoing' | 'past';

export function tripPhase(trip: Pick<Trip, 'departureDate' | 'returnDate'>, today: DayKey): TripPhase {
  if (diffDays(today, trip.departureDate) > 0) return 'upcoming';
  if (diffDays(today, trip.returnDate) >= 0) return 'ongoing';
  return 'past';
}

export function packingProgress(entries: readonly Pick<PackingEntry, 'packed'>[]): { packed: number; total: number; ratio: number } {
  const total = entries.length;
  const packed = entries.filter((e) => e.packed).length;
  return { packed, total, ratio: total === 0 ? 0 : packed / total };
}

/** Expands planned outfits into their items so nothing is forgotten, without duplicates. */
export function itemsToPack(outfits: readonly { items: { itemId: string }[] }[], extraItemIds: readonly string[]): string[] {
  const set = new Set<string>(extraItemIds);
  for (const o of outfits) for (const i of o.items) set.add(i.itemId);
  return [...set];
}

/** Items selected for the trip that are not on the checklist yet ("did you forget…?"). */
export function missingFromChecklist(entries: readonly PackingEntry[], neededItemIds: readonly string[]): string[] {
  const listed = new Set(entries.filter((e) => e.kind === 'item' && e.itemId).map((e) => e.itemId!));
  return neededItemIds.filter((id) => !listed.has(id));
}
