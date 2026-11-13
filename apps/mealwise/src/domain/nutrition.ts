import { catalogIngredient } from '@/content/ingredients';

import type { Nutrition, Recipe, RecipeIngredient } from './types';
import { UNITS } from './units';

/**
 * Nutrition ESTIMATES.
 *
 * - If the user documented per-serving values on their recipe, those are used
 *   and flagged `documented`.
 * - Otherwise values are estimated from generic per-100 g reference averages of
 *   the ingredient catalog. An ingredient contributes only when its weight can
 *   be derived (mass unit, volume × density, or pieces × typical piece weight).
 * - `coverage` = share of relevant ingredients that could be estimated. The UI
 *   shows "partial" below 100 % and hides figures below MIN_COVERAGE.
 *
 * Nothing here is medical or dietary advice.
 */
export type NutritionSource = 'documented' | 'estimated' | 'unavailable';

export interface NutritionResult {
  perServing: Nutrition;
  source: NutritionSource;
  /** 0..1 — share of relevant ingredients included in the estimate. */
  coverage: number;
  /** Ingredient keys that could not be estimated. */
  missing: string[];
}

export const MIN_COVERAGE = 0.6;

const EMPTY: Nutrition = { kcal: null, protein: null, carbs: null, fat: null };

/** Estimated grams for an ingredient line, or null when not derivable. */
export function gramsOf(ing: Pick<RecipeIngredient, 'key' | 'quantity' | 'unit'>): number | null {
  if (ing.quantity === null || ing.unit === 'to_taste') return null;
  const c = catalogIngredient(ing.key);
  const def = UNITS[ing.unit];
  if (def.dimension === 'mass') return ing.quantity * def.toBase;
  if (def.dimension === 'volume') return c?.density ? ing.quantity * def.toBase * c.density : null;
  if (def.dimension === 'count') {
    if (ing.unit === 'pinch') return 0.3 * ing.quantity;
    return c?.pieceGrams ? ing.quantity * c.pieceGrams : null;
  }
  return null;
}

function round(n: number): number {
  return Math.round(n);
}

export function estimateRecipeNutrition(recipe: Pick<Recipe, 'ingredients' | 'servings' | 'nutrition'>): NutritionResult {
  if (recipe.nutrition && recipe.nutrition.kcal !== null) {
    return { perServing: recipe.nutrition, source: 'documented', coverage: 1, missing: [] };
  }
  let kcal = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;
  let relevant = 0;
  let covered = 0;
  const missing: string[] = [];
  for (const ing of recipe.ingredients) {
    const c = catalogIngredient(ing.key);
    if (c?.negligible) continue;
    if (ing.unit === 'to_taste' || ing.quantity === null) continue; // seasoning amounts
    relevant++;
    const grams = gramsOf(ing);
    if (!c?.per100g || grams === null) {
      missing.push(ing.key);
      continue;
    }
    covered++;
    const f = grams / 100;
    kcal += c.per100g.kcal * f;
    protein += c.per100g.protein * f;
    carbs += c.per100g.carbs * f;
    fat += c.per100g.fat * f;
  }
  const coverage = relevant ? covered / relevant : 0;
  if (covered === 0 || coverage < MIN_COVERAGE) return { perServing: EMPTY, source: 'unavailable', coverage, missing };
  const s = Math.max(1, recipe.servings);
  return {
    perServing: { kcal: round(kcal / s), protein: round(protein / s), carbs: round(carbs / s), fat: round(fat / s) },
    source: 'estimated',
    coverage,
    missing,
  };
}

export interface MealNutrition {
  servingsEaten: number;
  result: NutritionResult;
}

export interface NutritionTotal {
  total: Nutrition;
  /** Meals included in the total. */
  counted: number;
  /** Meals without usable data (custom meals or low coverage). */
  uncounted: number;
  /** True when any included value is an estimate. */
  estimated: boolean;
}

/** Sums meals of a day or week. `servingsEaten` is usually 1 (one person's portion). */
export function sumNutrition(meals: readonly MealNutrition[]): NutritionTotal {
  const total = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
  let counted = 0;
  let estimated = false;
  for (const m of meals) {
    const n = m.result.perServing;
    if (m.result.source === 'unavailable' || n.kcal === null) continue;
    counted++;
    if (m.result.source === 'estimated' || m.result.coverage < 1) estimated = true;
    total.kcal += (n.kcal ?? 0) * m.servingsEaten;
    total.protein += (n.protein ?? 0) * m.servingsEaten;
    total.carbs += (n.carbs ?? 0) * m.servingsEaten;
    total.fat += (n.fat ?? 0) * m.servingsEaten;
  }
  return {
    total: counted ? { kcal: round(total.kcal), protein: round(total.protein), carbs: round(total.carbs), fat: round(total.fat) } : EMPTY,
    counted,
    uncounted: meals.length - counted,
    estimated,
  };
}

/** Share of energy from each macro (4/4/9 kcal per gram). Null when unknown. */
export function macroSplit(n: Nutrition): { protein: number; carbs: number; fat: number } | null {
  if (n.protein === null || n.carbs === null || n.fat === null) return null;
  const p = n.protein * 4;
  const c = n.carbs * 4;
  const f = n.fat * 9;
  const sum = p + c + f;
  if (sum <= 0) return null;
  return { protein: p / sum, carbs: c / sum, fat: f / sum };
}
