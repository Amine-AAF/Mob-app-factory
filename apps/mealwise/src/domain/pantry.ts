import { addDays, diffDays } from '@factory/app-core';

import { isNoShopping, isStaple } from './ingredients';
import type { DayKey, PantryItem, Recipe, RecipeIngredient } from './types';
import { areCompatible, toBase } from './units';

export type ExpiryStatus = 'expired' | 'today' | 'soon' | 'ok' | 'none';

export const DEFAULT_EXPIRY_ALERT_DAYS = 2;

export function expiryStatus(expiresOn: DayKey | null, today: DayKey, soonDays = DEFAULT_EXPIRY_ALERT_DAYS): ExpiryStatus {
  if (!expiresOn) return 'none';
  const left = diffDays(today, expiresOn);
  if (left < 0) return 'expired';
  if (left === 0) return 'today';
  if (left <= soonDays) return 'soon';
  return 'ok';
}

export function daysLeft(expiresOn: DayKey, today: DayKey): number {
  return diffDays(today, expiresOn);
}

/** Active (not consumed) items sorted by urgency: expired, then soonest expiry, then no date. */
export function sortByExpiry<T extends Pick<PantryItem, 'expiresOn' | 'name' | 'consumedAt'>>(items: readonly T[]): T[] {
  return items
    .filter((i) => !i.consumedAt)
    .sort((a, b) => {
      if (a.expiresOn && b.expiresOn) return a.expiresOn.localeCompare(b.expiresOn) || a.name.localeCompare(b.name);
      if (a.expiresOn) return -1;
      if (b.expiresOn) return 1;
      return a.name.localeCompare(b.name);
    });
}

export function expiringItems<T extends Pick<PantryItem, 'expiresOn' | 'consumedAt'>>(items: readonly T[], today: DayKey, soonDays = DEFAULT_EXPIRY_ALERT_DAYS): T[] {
  return items.filter((i) => {
    if (i.consumedAt) return false;
    const s = expiryStatus(i.expiresOn, today, soonDays);
    return s === 'expired' || s === 'today' || s === 'soon';
  });
}

/** Day on which to warn about an item (the alert is never scheduled in the past). */
export function alertDay(expiresOn: DayKey, today: DayKey, alertDays = DEFAULT_EXPIRY_ALERT_DAYS): DayKey | null {
  const target = addDays(expiresOn, -Math.max(0, alertDays));
  if (diffDays(today, expiresOn) < 0) return null; // already expired
  return diffDays(today, target) < 0 ? today : target;
}

type Stock = Pick<PantryItem, 'key' | 'quantity' | 'unit' | 'consumedAt'>;

export type IngredientAvailability = 'have' | 'not_enough' | 'missing' | 'staple';

/**
 * Whether an ingredient is available. Quantities are compared only for
 * compatible units; if the pantry has the ingredient in another unit (or
 * without quantity) we trust the user and count it as available.
 */
export function availability(ing: RecipeIngredient, stock: readonly Stock[], factor = 1): IngredientAvailability {
  const items = stock.filter((s) => !s.consumedAt && s.key === ing.key);
  if (items.length === 0) return isStaple(ing.key) || isNoShopping(ing.key) ? 'staple' : 'missing';
  if (ing.quantity === null || ing.unit === 'to_taste') return 'have';
  const comparable = items.filter((s) => s.quantity !== null && s.unit !== 'to_taste' && areCompatible(s.unit, ing.unit));
  if (comparable.length < items.length) return 'have';
  const have = comparable.reduce((sum, s) => sum + toBase(s.quantity as number, s.unit), 0);
  return have + 1e-9 >= toBase(ing.quantity * factor, ing.unit) ? 'have' : 'not_enough';
}

export interface RecipeMatch {
  recipe: Recipe;
  required: number;
  available: number;
  missing: RecipeIngredient[];
  ratio: number;
}

export function matchRecipe(recipe: Recipe, stock: readonly Stock[]): RecipeMatch {
  const required = recipe.ingredients.filter((i) => !i.optional && !isStaple(i.key) && !isNoShopping(i.key));
  const missing = required.filter((i) => {
    const a = availability(i, stock);
    return a === 'missing' || a === 'not_enough';
  });
  const available = required.length - missing.length;
  return { recipe, required: required.length, available, missing, ratio: required.length ? available / required.length : 0 };
}

/**
 * Recipes ranked by what can be cooked with the pantry.
 * `maxMissing` keeps recipes that need only a few extra items ("almost there").
 */
export function cookableRecipes(recipes: readonly Recipe[], stock: readonly Stock[], maxMissing = 2): RecipeMatch[] {
  if (stock.filter((s) => !s.consumedAt).length === 0) return [];
  return recipes
    .map((r) => matchRecipe(r, stock))
    .filter((m) => m.required > 0 && m.available > 0 && m.missing.length <= maxMissing)
    .sort((a, b) => a.missing.length - b.missing.length || b.ratio - a.ratio || b.available - a.available || a.recipe.title.localeCompare(b.recipe.title));
}

/** Free pantry limit (premium: unlimited). */
export const FREE_PANTRY_LIMIT = 40;
