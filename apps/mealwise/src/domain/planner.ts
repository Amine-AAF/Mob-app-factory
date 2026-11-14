import { addDays, diffDays, fromDayKey, startOfWeek, toDayKey } from '@factory/app-core';

import { MEAL_SLOTS, type DayKey, type MealSlot, type MealTemplate, type PlanEntry } from './types';

export type FirstDayOfWeek = 'monday' | 'sunday';

export function weekStart(day: DayKey, first: FirstDayOfWeek): DayKey {
  const monday = startOfWeek(day);
  if (first === 'monday') return monday;
  // Sunday-based week: the Sunday on or before `day`.
  return fromDayKey(day).getDay() === 0 ? day : addDays(monday, -1);
}

export function weekDays(start: DayKey): DayKey[] {
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function isInWeek(day: DayKey, start: DayKey): boolean {
  const d = diffDays(start, day);
  return d >= 0 && d < 7;
}

/** A plan entry as it will be inserted (no id yet). */
export type PlanDraft = Omit<PlanEntry, 'id' | 'cookedAt'>;

export function applyTemplate(template: Pick<MealTemplate, 'entries'>, start: DayKey, defaultServings: number): PlanDraft[] {
  return template.entries
    .filter((e) => e.dayOffset >= 0 && e.dayOffset < 7)
    .map((e, index) => ({
      day: addDays(start, e.dayOffset),
      slot: e.slot,
      recipeId: e.recipeId,
      customTitle: e.customTitle ?? null,
      servings: e.servings ?? defaultServings,
      note: null,
      position: index,
    }));
}

/** Copies entries to another week, keeping weekday and slot. */
export function copyWeek(entries: readonly PlanEntry[], fromStart: DayKey, toStart: DayKey): PlanDraft[] {
  const shift = diffDays(fromStart, toStart);
  return entries
    .filter((e) => isInWeek(e.day, fromStart))
    .map((e) => ({ day: addDays(e.day, shift), slot: e.slot, recipeId: e.recipeId, customTitle: e.customTitle, servings: e.servings, note: e.note, position: e.position }));
}

/** Copies one day's meals onto another day. */
export function duplicateDay(entries: readonly PlanEntry[], from: DayKey, to: DayKey): PlanDraft[] {
  return entries
    .filter((e) => e.day === from)
    .map((e) => ({ day: to, slot: e.slot, recipeId: e.recipeId, customTitle: e.customTitle, servings: e.servings, note: e.note, position: e.position }));
}

/** Turns a week into reusable template entries (for "Save as my menu"). */
export function weekToTemplateEntries(entries: readonly PlanEntry[], start: DayKey): MealTemplate['entries'] {
  return entries
    .filter((e) => isInWeek(e.day, start))
    .sort((a, b) => a.day.localeCompare(b.day) || MEAL_SLOTS.indexOf(a.slot) - MEAL_SLOTS.indexOf(b.slot) || a.position - b.position)
    .map((e) => ({ dayOffset: diffDays(start, e.day), slot: e.slot, recipeId: e.recipeId, customTitle: e.customTitle, servings: e.servings }));
}

export function sortEntries<T extends Pick<PlanEntry, 'day' | 'slot' | 'position'>>(entries: readonly T[]): T[] {
  return [...entries].sort((a, b) => a.day.localeCompare(b.day) || MEAL_SLOTS.indexOf(a.slot) - MEAL_SLOTS.indexOf(b.slot) || a.position - b.position);
}

export function groupBySlot<T extends Pick<PlanEntry, 'slot' | 'position'>>(entries: readonly T[]): Record<MealSlot, T[]> {
  const out = { breakfast: [], lunch: [], dinner: [], snack: [] } as Record<MealSlot, T[]>;
  for (const e of entries) out[e.slot].push(e);
  for (const slot of MEAL_SLOTS) out[slot].sort((a, b) => a.position - b.position);
  return out;
}

/** Default times used for "next meal" and preparation reminders (minutes after midnight). */
export const DEFAULT_SLOT_TIMES: Record<MealSlot, number> = { breakfast: 8 * 60, lunch: 12 * 60 + 30, snack: 16 * 60, dinner: 19 * 60 + 30 };

export function slotDate(day: DayKey, slot: MealSlot, times: Record<MealSlot, number> = DEFAULT_SLOT_TIMES): Date {
  const d = fromDayKey(day);
  const minutes = times[slot];
  d.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return d;
}

/** The next not-yet-cooked meal at or after `now` (a meal stays "next" until 90 min after its slot time). */
export function nextMeal<T extends PlanEntry>(entries: readonly T[], now: Date, times: Record<MealSlot, number> = DEFAULT_SLOT_TIMES): T | null {
  const graceMs = 90 * 60_000;
  const upcoming = sortEntries(entries)
    .filter((e) => !e.cookedAt)
    .map((e) => ({ e, at: slotDate(e.day, e.slot, times).getTime() }))
    .filter((x) => x.at + graceMs >= now.getTime())
    .sort((a, b) => a.at - b.at);
  return upcoming[0]?.e ?? null;
}

export interface WeekSummary {
  planned: number;
  cooked: number;
  /** Main slots (breakfast, lunch, dinner) of the 7 days that have at least one meal. */
  filledMainSlots: number;
  mainSlots: number;
  daysWithMeals: number;
  perDay: Record<DayKey, number>;
}

export function summarizeWeek(entries: readonly PlanEntry[], start: DayKey): WeekSummary {
  const days = weekDays(start);
  const inWeek = entries.filter((e) => isInWeek(e.day, start));
  const perDay = Object.fromEntries(days.map((d) => [d, inWeek.filter((e) => e.day === d).length])) as Record<DayKey, number>;
  const filled = new Set(inWeek.filter((e) => e.slot !== 'snack').map((e) => `${e.day}|${e.slot}`));
  return {
    planned: inWeek.length,
    cooked: inWeek.filter((e) => e.cookedAt).length,
    filledMainSlots: filled.size,
    mainSlots: 21,
    daysWithMeals: days.filter((d) => (perDay[d] ?? 0) > 0).length,
    perDay,
  };
}

/**
 * Free plan: the current week and the next one. Premium: unlimited.
 * Past days of the visible range stay editable (to log what was eaten).
 */
export const FREE_WEEKS_AHEAD = 1;

export function canPlanDay(day: DayKey, today: DayKey, first: FirstDayOfWeek, isPremium: boolean): boolean {
  if (isPremium) return true;
  const current = weekStart(today, first);
  const target = weekStart(day, first);
  return diffDays(current, target) <= FREE_WEEKS_AHEAD * 7;
}

export function todayKey(now: Date): DayKey {
  return toDayKey(now);
}
