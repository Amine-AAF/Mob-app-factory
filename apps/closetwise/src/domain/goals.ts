import { addDays, diffDays } from '@factory/app-core';

import type { DayKey, GoalKind, Outfit, ShoppingRecord, UsageEntry, WardrobeGoal, WardrobeItem } from './types';

/**
 * Goal & challenge progress, computed from the user's own data. Wording in the UI stays
 * encouraging: progress is shown as what was achieved, never as a failure count.
 */
export interface GoalTemplate {
  kind: GoalKind;
  defaultTarget: number;
  /** Fixed duration in days (challenges), null = open-ended. */
  durationDays: number | null;
  challenge: boolean;
}

export const GOAL_TEMPLATES: GoalTemplate[] = [
  { kind: 'wear_forgotten', defaultTarget: 5, durationDays: 30, challenge: false },
  { kind: 'reduce_impulse', defaultTarget: 2, durationDays: 30, challenge: false },
  { kind: 'create_outfits', defaultTarget: 10, durationDays: 30, challenge: false },
  { kind: 'monthly_budget', defaultTarget: 100, durationDays: null, challenge: false },
  { kind: 'organize', defaultTarget: 100, durationDays: null, challenge: false },
  { kind: 'capsule', defaultTarget: 30, durationDays: null, challenge: false },
  { kind: 'challenge_7x7', defaultTarget: 7, durationDays: 7, challenge: true },
  { kind: 'challenge_no_shopping', defaultTarget: 30, durationDays: 30, challenge: true },
  { kind: 'challenge_30_looks', defaultTarget: 30, durationDays: 30, challenge: true },
  { kind: 'challenge_capsule', defaultTarget: 33, durationDays: 90, challenge: true },
];

export const templateFor = (kind: GoalKind) => GOAL_TEMPLATES.find((t) => t.kind === kind)!;

export function defaultEndDate(kind: GoalKind, start: DayKey): DayKey | null {
  const d = templateFor(kind).durationDays;
  return d == null ? null : addDays(start, d - 1);
}

export interface GoalData {
  items: readonly WardrobeItem[];
  outfits: readonly Outfit[];
  usage: readonly UsageEntry[];
  shopping: readonly ShoppingRecord[];
  budgetCurrency: string;
  today: DayKey;
}

export interface GoalProgress {
  value: number;
  target: number;
  ratio: number;
  /** For "stay under" goals (impulse buys, budget, no shopping): still within the limit. */
  withinLimit?: boolean;
  daysLeft: number | null;
  done: boolean;
}

const inPeriod = (day: DayKey, goal: WardrobeGoal, today: DayKey) => day >= goal.startDate && day <= (goal.endDate ?? today) && day <= today;

/**
 * Days with a *new* look: a day counts when an outfit not already worn earlier in the
 * challenge was logged that day ("7 days, 7 outfits", "30 days of different looks").
 */
export function newLookDays(usage: readonly UsageEntry[], goal: WardrobeGoal, today: DayKey): number {
  const seen = new Set<string>();
  const days = new Set<DayKey>();
  const relevant = usage.filter((u) => u.outfitId && inPeriod(u.wornOn, goal, today)).sort((a, b) => a.wornOn.localeCompare(b.wornOn));
  for (const u of relevant) {
    if (seen.has(u.outfitId!)) continue;
    seen.add(u.outfitId!);
    days.add(u.wornOn);
  }
  return days.size;
}

export function goalProgress(goal: WardrobeGoal, data: GoalData): GoalProgress {
  const { today } = data;
  const end = goal.endDate;
  const daysLeft = end ? Math.max(0, diffDays(today, end)) : null;
  const ended = end != null && diffDays(end, today) > 0;
  const target = Math.max(1, goal.target);
  let value = 0;
  let withinLimit: boolean | undefined;

  switch (goal.kind) {
    case 'wear_forgotten': {
      // Items not worn in the 60 days before the goal started, then worn during it.
      const before = addDays(goal.startDate, -60);
      const wornBefore = new Set(data.usage.filter((u) => u.wornOn >= before && u.wornOn < goal.startDate).map((u) => u.itemId));
      const wornDuring = new Set(data.usage.filter((u) => inPeriod(u.wornOn, goal, today)).map((u) => u.itemId));
      const eligible = new Set(data.items.filter((i) => i.createdAt.slice(0, 10) < goal.startDate).map((i) => i.id));
      value = [...wornDuring].filter((id) => eligible.has(id) && !wornBefore.has(id)).length;
      break;
    }
    case 'reduce_impulse': {
      value = data.shopping.filter((r) => inPeriod(r.purchasedOn, goal, today)).length;
      withinLimit = value <= goal.target;
      break;
    }
    case 'create_outfits':
      value = data.outfits.filter((o) => inPeriod(o.createdAt.slice(0, 10), goal, today)).length;
      break;
    case 'monthly_budget': {
      const month = today.slice(0, 7);
      value = Math.round(data.shopping.filter((r) => r.currency === data.budgetCurrency && r.purchasedOn.startsWith(month)).reduce((s, r) => s + r.price, 0) * 100) / 100;
      withinLimit = value <= goal.target;
      break;
    }
    case 'organize': {
      const active = data.items.filter((i) => !i.archived);
      const complete = active.filter((i) => i.photoPath && i.primaryColor && i.seasons !== 0 && (i.styleId || i.occasionIds.length > 0)).length;
      value = active.length === 0 ? 0 : Math.round((complete / active.length) * 100);
      break;
    }
    case 'capsule':
    case 'challenge_capsule':
      value = (goal.payload.itemIds ?? []).filter((id) => data.items.some((i) => i.id === id && !i.archived)).length;
      break;
    case 'challenge_7x7':
    case 'challenge_30_looks':
      value = newLookDays(data.usage, goal, today);
      break;
    case 'challenge_no_shopping': {
      // Days completed since the start, counting from the last purchase if any.
      const purchases = data.shopping.filter((r) => inPeriod(r.purchasedOn, goal, today)).map((r) => r.purchasedOn).sort();
      const from = purchases.length ? addDays(purchases[purchases.length - 1]!, 1) : goal.startDate;
      const last = end && end < today ? end : today;
      value = Math.max(0, diffDays(from, last) + 1);
      withinLimit = purchases.length === 0;
      break;
    }
  }

  // "Stay under" goals are achieved when the period ends within the limit.
  const limitGoal = goal.kind === 'reduce_impulse' || goal.kind === 'monthly_budget';
  const ratio = Math.min(1, value / target);
  const done = limitGoal ? ended && withinLimit === true : value >= target;
  return { value, target, ratio, withinLimit, daysLeft, done };
}
