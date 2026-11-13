import { addDays, diffDays } from '@factory/app-core';

import { dueStatus } from './schedule';
import type { CareHistoryEntry, CareTask, DayKey, HealthRecord, Plant, PlantCategory, WateringRecord } from './types';

export interface Insights {
  totalPlants: number;
  favorites: number;
  byCategory: { category: PlantCategory; count: number }[];
  wateringsLast30: number;
  tasksDoneLast30: number;
  overdueTasks: number;
  /** Plants with an overdue task or an open health record. */
  needingAttention: string[];
  /** Plants added per month, oldest first (last 6 months). */
  collectionGrowth: { month: string; added: number; total: number }[];
  /** Care actions per month (waterings + completed tasks), last 6 months. */
  monthlyCare: { month: string; waterings: number; tasks: number }[];
  /**
   * Care regularity over the last 30 days: share of planned occurrences that were done on
   * time or at most one day late. null when nothing was planned.
   */
  regularity: number | null;
  /** Consecutive days (ending today or yesterday) with at least one care action. */
  careStreak: number;
}

export const monthKey = (day: DayKey) => day.slice(0, 7);

function lastMonths(today: DayKey, count: number): string[] {
  const [y, m] = today.split('-').map(Number) as [number, number];
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(y, m - 1 - (count - 1 - i), 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
}

export function computeInsights(input: {
  plants: Plant[];
  tasks: CareTask[];
  history: CareHistoryEntry[];
  waterings: WateringRecord[];
  health: HealthRecord[];
  today: DayKey;
}): Insights {
  const { plants, tasks, history, waterings, health, today } = input;
  const since30 = addDays(today, -29);

  const catCounts = new Map<PlantCategory, number>();
  for (const p of plants) catCounts.set(p.category, (catCounts.get(p.category) ?? 0) + 1);

  const overdue = tasks.filter((t) => dueStatus(t, today) === 'overdue');
  const attention = new Set<string>(overdue.map((t) => t.plantId));
  for (const h of health) if (h.status !== 'resolved') attention.add(h.plantId);
  const existing = new Set(plants.map((p) => p.id));

  const done = history.filter((h) => h.action === 'done');
  const months = lastMonths(today, 6);
  const firstMonth = months[0]!;
  let running = plants.filter((p) => monthKey(p.createdAt.slice(0, 10)) < firstMonth).length;
  const collectionGrowth = months.map((month) => {
    const added = plants.filter((p) => monthKey(p.createdAt.slice(0, 10)) === month).length;
    running += added;
    return { month, added, total: running };
  });
  const monthlyCare = months.map((month) => ({
    month,
    waterings: waterings.filter((w) => monthKey(w.date) === month).length,
    tasks: done.filter((h) => monthKey(h.date) === month).length,
  }));

  // Regularity: each skipped/postponed entry counts as a miss; each completion as a hit.
  const recentDone = done.filter((h) => h.date >= since30).length + waterings.filter((w) => w.date >= since30).length;
  const recentMissed = history.filter((h) => h.date >= since30 && (h.action === 'skipped' || h.action === 'postponed')).length + overdue.filter((t) => diffDays(t.nextDue!, today) > 1).length;
  const regularity = recentDone + recentMissed === 0 ? null : recentDone / (recentDone + recentMissed);

  const activeDays = new Set<string>([...done.map((h) => h.date), ...waterings.map((w) => w.date)]);
  let streak = 0;
  let day = activeDays.has(today) ? today : addDays(today, -1);
  while (activeDays.has(day)) {
    streak++;
    day = addDays(day, -1);
  }

  return {
    totalPlants: plants.length,
    favorites: plants.filter((p) => p.favorite).length,
    byCategory: [...catCounts.entries()].map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count),
    wateringsLast30: waterings.filter((w) => w.date >= since30).length,
    tasksDoneLast30: done.filter((h) => h.date >= since30).length,
    overdueTasks: overdue.length,
    needingAttention: [...attention].filter((id) => existing.has(id)),
    collectionGrowth,
    monthlyCare,
    regularity,
    careStreak: streak,
  };
}
