import { diffDays } from '@factory/app-core';

import { maskToSeasons, type Season } from './catalog';
import type { DayKey, WardrobeItem } from './types';

/**
 * Cost per wear = purchase price / number of recorded wears.
 * Returns null (shown as "not available") when the price is unknown or nothing was
 * recorded yet, instead of a misleading "full price" or "infinite" value.
 */
export function costPerWear(price: number | null | undefined, wears: number): number | null {
  if (price == null || !Number.isFinite(price) || price < 0) return null;
  if (!Number.isFinite(wears) || wears <= 0) return null;
  return Math.round((price / wears) * 100) / 100;
}

export type UsageLevel = 'never' | 'rare' | 'occasional' | 'frequent';

/**
 * Usage frequency indicator, based on wears per 30 days since the item was added
 * (minimum window of 30 days so a new item is not judged too early).
 */
export function usageLevel(item: Pick<WardrobeItem, 'wearCount' | 'createdAt'>, today: DayKey): UsageLevel {
  if (item.wearCount <= 0) return 'never';
  const days = Math.max(30, diffDays(item.createdAt.slice(0, 10), today));
  const perMonth = (item.wearCount * 30) / days;
  if (perMonth >= 4) return 'frequent';
  if (perMonth >= 1) return 'occasional';
  return 'rare';
}

/** Not worn for `days` days (or never worn and added more than `days` ago). */
export function isRarelyUsed(item: Pick<WardrobeItem, 'lastWornOn' | 'createdAt'>, today: DayKey, days = 90): boolean {
  const ref = item.lastWornOn ?? item.createdAt.slice(0, 10);
  return diffDays(ref, today) >= days;
}

export interface CountEntry {
  key: string;
  count: number;
}

function countBy<T>(list: readonly T[], keyOf: (t: T) => string | readonly string[] | null): CountEntry[] {
  const map = new Map<string, number>();
  for (const t of list) {
    const k = keyOf(t);
    const keys = k == null ? [] : typeof k === 'string' ? [k] : k;
    for (const key of keys) map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

/** Sums prices per currency: amounts in different currencies are never added together. */
export function valueByCurrency(items: readonly Pick<WardrobeItem, 'purchasePrice' | 'currency'>[], fallbackCurrency: string): { currency: string; total: number; count: number }[] {
  const map = new Map<string, { total: number; count: number }>();
  for (const it of items) {
    if (it.purchasePrice == null || it.purchasePrice < 0) continue;
    const c = it.currency ?? fallbackCurrency;
    const cur = map.get(c) ?? { total: 0, count: 0 };
    cur.total += it.purchasePrice;
    cur.count++;
    map.set(c, cur);
  }
  return [...map.entries()]
    .map(([currency, v]) => ({ currency, total: Math.round(v.total * 100) / 100, count: v.count }))
    .sort((a, b) => b.count - a.count);
}

export interface WardrobeInsights {
  total: number;
  byCategory: CountEntry[];
  byColor: CountEntry[];
  bySeason: CountEntry[];
  byBrand: CountEntry[];
  mostWorn: WardrobeItem[];
  rarelyWorn: WardrobeItem[];
  recentlyAdded: WardrobeItem[];
  value: { currency: string; total: number; count: number }[];
  usage: Record<UsageLevel, number>;
  /** Items with a known cost per wear, cheapest first. */
  bestCostPerWear: { item: WardrobeItem; cpw: number }[];
}

export function computeInsights(
  items: readonly WardrobeItem[],
  opts: { today: DayKey; categoryKeyOf: (id: string) => string; fallbackCurrency: string; limit?: number },
): WardrobeInsights {
  const active = items.filter((i) => !i.archived);
  const limit = opts.limit ?? 5;
  const usage: Record<UsageLevel, number> = { never: 0, rare: 0, occasional: 0, frequent: 0 };
  for (const it of active) usage[usageLevel(it, opts.today)]++;
  const withCpw = active
    .map((item) => ({ item, cpw: costPerWear(item.purchasePrice, item.wearCount) }))
    .filter((x): x is { item: WardrobeItem; cpw: number } => x.cpw != null)
    .sort((a, b) => a.cpw - b.cpw);
  return {
    total: active.length,
    byCategory: countBy(active, (i) => opts.categoryKeyOf(i.categoryId)),
    byColor: countBy(active, (i) => i.primaryColor),
    bySeason: countBy(active, (i) => (i.seasons === 0 ? (['spring', 'summer', 'autumn', 'winter'] as Season[]) : maskToSeasons(i.seasons))),
    byBrand: countBy(active, (i) => i.brandName),
    mostWorn: [...active].filter((i) => i.wearCount > 0).sort((a, b) => b.wearCount - a.wearCount).slice(0, limit),
    rarelyWorn: active
      .filter((i) => isRarelyUsed(i, opts.today))
      .sort((a, b) => a.wearCount - b.wearCount || (a.lastWornOn ?? a.createdAt).localeCompare(b.lastWornOn ?? b.createdAt))
      .slice(0, limit),
    recentlyAdded: [...active].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit),
    value: valueByCurrency(active, opts.fallbackCurrency),
    usage,
    bestCostPerWear: withCpw.slice(0, limit),
  };
}
