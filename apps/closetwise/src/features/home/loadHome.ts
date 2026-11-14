import type { Repositories } from '@/database';
import { packingProgress } from '@/domain/packing';
import type { DayKey, Outfit, OutfitSchedule, Trip, WardrobeGoal, WardrobeItem } from '@/domain/types';

import { monthStart, nextTrip, rediscoverItems, waitingForCare, wornThisMonth } from './logic';

export interface HomeData {
  items: WardrobeItem[];
  itemMap: Map<string, WardrobeItem>;
  outfitMap: Map<string, Outfit>;
  itemCount: number;
  outfitCount: number;
  worn: number;
  care: number;
  todayPlans: { schedule: OutfitSchedule; outfit: Outfit | null }[];
  trip: { trip: Trip; progress: ReturnType<typeof packingProgress> } | null;
  activeGoals: WardrobeGoal[];
  rediscover: WardrobeItem[];
}

export async function loadHome(r: Repositories, today: DayKey): Promise<HomeData> {
  const [items, outfits, schedules, usage, trips, goals] = await Promise.all([
    r.wardrobe.list(),
    r.outfits.list(),
    r.schedules.forDate(today),
    r.usage.list({ from: monthStart(today) }),
    r.trips.list(),
    r.goals.list(),
  ]);
  const outfitMap = new Map(outfits.map((o) => [o.id, o]));
  const upcoming = nextTrip(trips, today);
  const entries = upcoming ? await r.trips.entries(upcoming.id) : [];
  return {
    items,
    itemMap: new Map(items.map((i) => [i.id, i])),
    outfitMap,
    itemCount: items.length,
    outfitCount: outfits.length,
    worn: wornThisMonth(usage, today),
    care: waitingForCare(items),
    todayPlans: schedules.map((s) => ({ schedule: s, outfit: s.outfitId ? (outfitMap.get(s.outfitId) ?? null) : null })),
    trip: upcoming ? { trip: upcoming, progress: packingProgress(entries) } : null,
    activeGoals: goals.filter((g) => g.status === 'active'),
    rediscover: rediscoverItems(items, today),
  };
}
