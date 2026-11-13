import { addDays } from '@factory/app-core';

import { repos } from '@/database';
import { aggregateIngredients, subtractPantry, toGroceryDrafts, type GroceryDraft, type MealForGrocery } from '@/domain/grocery';
import type { AppLanguage, DayKey, PlanEntry, UnitSystem } from '@/domain/types';
import { usePreferences } from '@/store/preferences';
import { dataChanged } from '@/store/session';

import { recordError, track } from './analytics';
import { clock } from './clock';
import { buildSchedule, applySchedule, DEFAULT_NOTIFICATION_SETTINGS, type NotificationSettings, type Translate } from './notifications';
import { recipesById } from './recipeCatalog';

/**
 * Orchestration between the planner, recipes, pantry and grocery lists.
 * Keeps screens thin: they call these functions, then the session bump reloads data.
 */
export async function draftsForRange(from: DayKey, toInclusive: DayKey, opts: { lng: AppLanguage; system: UnitSystem; usePantry: boolean }): Promise<{ drafts: GroceryDraft[]; meals: number; covered: number }> {
  const entries = (await repos().plan.range(from, toInclusive)).filter((e) => e.recipeId);
  const recipes = await recipesById(entries.map((e) => e.recipeId as string), opts.lng);
  const meals: MealForGrocery[] = entries
    .map((e) => {
      const r = recipes.get(e.recipeId as string);
      return r ? { recipeId: r.id, baseServings: r.servings, servings: e.servings, ingredients: r.ingredients } : null;
    })
    .filter((m): m is MealForGrocery => m !== null);
  let lines = aggregateIngredients(meals);
  if (opts.usePantry) lines = subtractPantry(lines, await repos().pantry.active());
  const covered = lines.filter((l) => l.pantry === 'covered').length;
  return { drafts: toGroceryDrafts(lines, opts.system, opts.lng), meals: meals.length, covered };
}

/** Creates a new grocery list from the planned meals of a range (or refreshes the active one). */
export async function generateGroceryList(
  from: DayKey,
  toInclusive: DayKey,
  opts: { lng: AppLanguage; system: UnitSystem; usePantry: boolean; name: string; refreshActive: boolean },
): Promise<{ listId: number; items: number; meals: number; covered: number }> {
  const { drafts, meals, covered } = await draftsForRange(from, toInclusive, opts);
  const active = opts.refreshActive ? await repos().grocery.active() : null;
  let listId: number;
  if (active) {
    await repos().grocery.regenerate(active.id, drafts, { start: from, end: toInclusive });
    listId = active.id;
  } else {
    listId = await repos().grocery.createList(opts.name, { start: from, end: toInclusive }, drafts);
  }
  track('grocery_generated', { items: drafts.length, days: Math.max(1, Math.round((new Date(toInclusive).getTime() - new Date(from).getTime()) / 86_400_000) + 1) });
  dataChanged();
  return { listId, items: drafts.length, meals, covered };
}

/** Resolves display titles of plan entries (recipe title or custom title). */
export async function entryTitles(entries: readonly PlanEntry[], lng: AppLanguage): Promise<Map<number, string>> {
  const recipes = await recipesById(entries.filter((e) => e.recipeId).map((e) => e.recipeId as string), lng);
  return new Map(entries.map((e) => [e.id, (e.recipeId ? recipes.get(e.recipeId)?.title : null) ?? e.customTitle ?? '']));
}

export async function loadNotificationSettings(): Promise<NotificationSettings> {
  const stored = await repos().preferences.get<Partial<NotificationSettings>>('notifications', {});
  return { ...DEFAULT_NOTIFICATION_SETTINGS, ...stored };
}

/** Recomputes and applies all reminders. Safe to call often; never throws. */
export async function syncNotifications(t: Translate, lng: AppLanguage): Promise<number> {
  try {
    const settings = await loadNotificationSettings();
    const today = clock.today();
    const entries = await repos().plan.range(today, addDays(today, 7));
    const titles = await entryTitles(entries, lng);
    const planned = buildSchedule({
      settings,
      now: clock.now(),
      today,
      meals: entries.map((e) => ({ id: e.id, day: e.day, slot: e.slot, cookedAt: e.cookedAt, title: titles.get(e.id) ?? '' })),
      pantry: await repos().pantry.active(),
      t,
    });
    return await applySchedule(planned);
  } catch (e) {
    recordError(e, 'notifications_sync');
    return 0;
  }
}

let pending: ReturnType<typeof setTimeout> | null = null;

/** Debounced sync after plan / pantry edits. */
export function scheduleSync(t: Translate, lng: AppLanguage): void {
  if (pending) clearTimeout(pending);
  pending = setTimeout(() => {
    pending = null;
    void syncNotifications(t, lng);
  }, 1500);
}

export function defaultServings(): number {
  return Math.max(1, usePreferences.getState().householdSize);
}
