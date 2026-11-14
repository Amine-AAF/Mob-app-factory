import { categorize, ingredientName, isCustomKey, isNoShopping } from './ingredients';
import { roundForShopping } from './quantity';
import { GROCERY_CATEGORIES, type AppLanguage, type GroceryCategory, type GroceryItem, type RecipeIngredient, type UnitId, type UnitSystem } from './types';
import { areCompatible, baseUnitFor, bestUnit, mergeKey, toBase, UNITS } from './units';

/**
 * Grocery list generation.
 *
 * Pipeline: planned meals → scaled ingredient lines → aggregation by
 * (ingredient key, unit dimension) → optional pantry subtraction → shopping
 * quantities in the user's unit system.
 *
 * Safety rules (tested):
 * - Different ingredients are never merged (key equality only).
 * - Incompatible units are never merged: "200 g flour" and "1 cup flour"
 *   stay two lines; "2 cloves garlic" and "1 pc garlic" stay two lines.
 * - "To taste" lines carry no quantity and are kept once per ingredient.
 */
export interface MealForGrocery {
  recipeId: string;
  baseServings: number;
  servings: number;
  ingredients: RecipeIngredient[];
}

export interface NeededLine {
  /** `${key}|${mergeKey}` — stable identity of an aggregated line. */
  id: string;
  key: string;
  /** Free-text name for custom ingredients. */
  customName: string | null;
  category: GroceryCategory;
  /** Base unit of the dimension (g, ml) or the count unit itself; "to_taste" for no quantity. */
  unit: UnitId;
  /** Amount in `unit`, null for "to taste". */
  quantity: number | null;
  recipeIds: string[];
  pantry: 'none' | 'covered' | 'partial' | 'unknown';
}

export function lineId(key: string, unit: UnitId): string {
  return `${key}|${mergeKey(unit)}`;
}

export function aggregateIngredients(meals: readonly MealForGrocery[], opts: { includeOptional?: boolean } = {}): NeededLine[] {
  const lines = new Map<string, NeededLine>();
  for (const meal of meals) {
    const factor = meal.baseServings > 0 && meal.servings > 0 ? meal.servings / meal.baseServings : 1;
    for (const ing of meal.ingredients) {
      if (isNoShopping(ing.key)) continue;
      if (ing.optional && !opts.includeOptional) continue;
      const hasQty = ing.quantity !== null && ing.unit !== 'to_taste' && ing.quantity > 0;
      const unit: UnitId = hasQty ? baseUnitFor(ing.unit) : 'to_taste';
      const id = hasQty ? lineId(ing.key, ing.unit) : `${ing.key}|none`;
      const amount = hasQty ? toBase((ing.quantity as number) * factor, ing.unit) : null;
      const existing = lines.get(id);
      if (existing) {
        if (amount !== null && existing.quantity !== null) existing.quantity += amount;
        if (!existing.recipeIds.includes(meal.recipeId)) existing.recipeIds.push(meal.recipeId);
      } else {
        lines.set(id, {
          id,
          key: ing.key,
          customName: isCustomKey(ing.key) ? (ing.name ?? null) : null,
          category: categorize(ing.key, ing.name),
          unit,
          quantity: amount,
          recipeIds: [meal.recipeId],
          pantry: 'none',
        });
      }
    }
  }
  // A "to taste" line is redundant when the same ingredient is already bought by quantity.
  const quantified = new Set([...lines.values()].filter((l) => l.quantity !== null).map((l) => l.key));
  return [...lines.values()].filter((l) => l.quantity !== null || !quantified.has(l.key));
}

export interface PantryStock {
  key: string;
  quantity: number | null;
  unit: UnitId;
}

/**
 * Subtracts what is already at home. Only same-key, compatible-unit stock is
 * subtracted; stock without a quantity or in another dimension marks the line
 * "unknown" (the user should check) but never removes it.
 */
export function subtractPantry(lines: readonly NeededLine[], stock: readonly PantryStock[]): NeededLine[] {
  return lines.map((line) => {
    const items = stock.filter((s) => s.key === line.key);
    if (items.length === 0) return { ...line };
    if (line.quantity === null) return { ...line, pantry: 'covered' as const };
    let have = 0;
    let unknown = false;
    for (const s of items) {
      if (s.quantity !== null && s.quantity > 0 && s.unit !== 'to_taste' && areCompatible(s.unit, line.unit)) have += toBase(s.quantity, s.unit);
      else unknown = true;
    }
    if (have <= 0) return { ...line, pantry: 'unknown' as const };
    const remaining = line.quantity - have;
    if (remaining <= 1e-9) return { ...line, quantity: 0, pantry: 'covered' as const };
    return { ...line, quantity: remaining, pantry: unknown ? ('unknown' as const) : ('partial' as const) };
  });
}

export interface GroceryDraft {
  key: string;
  name: string;
  category: GroceryCategory;
  quantity: number | null;
  unit: UnitId;
  pantry: NeededLine['pantry'];
}

/** Converts aggregated lines to shopping quantities in the user's system. Covered lines are dropped. */
export function toGroceryDrafts(lines: readonly NeededLine[], system: UnitSystem, lng: AppLanguage): GroceryDraft[] {
  return lines
    .filter((l) => l.pantry !== 'covered')
    .map((l) => {
      const name = ingredientName(l.key, lng, l.customName);
      if (l.quantity === null) return { key: l.key, name, category: l.category, quantity: null, unit: 'to_taste' as UnitId, pantry: l.pantry };
      const unit = bestUnit(l.quantity, l.unit, system);
      const value = UNITS[unit].dimension === 'count' ? l.quantity : l.quantity / UNITS[unit].toBase;
      return { key: l.key, name, category: l.category, quantity: roundForShopping(value, unit), unit, pantry: l.pantry };
    });
}

/** Adds two quantities of the same ingredient when units are compatible; null when they are not. */
export function combineQuantities(
  a: { quantity: number | null; unit: UnitId },
  b: { quantity: number | null; unit: UnitId },
  system: UnitSystem,
): { quantity: number | null; unit: UnitId } | null {
  if (a.unit === 'to_taste' && b.unit === 'to_taste') return { quantity: null, unit: 'to_taste' };
  if (a.quantity === null || b.quantity === null) return null;
  if (!areCompatible(a.unit, b.unit)) return null;
  if (UNITS[a.unit].dimension === 'count') return { quantity: a.quantity + b.quantity, unit: a.unit };
  if (a.unit === b.unit) return { quantity: Math.round((a.quantity + b.quantity) * 1000) / 1000, unit: a.unit };
  const base = toBase(a.quantity, a.unit) + toBase(b.quantity, b.unit);
  const unit = bestUnit(base, a.unit, system);
  return { quantity: roundForShopping(base / UNITS[unit].toBase, unit), unit };
}

type ExistingItem = Pick<GroceryItem, 'id' | 'key' | 'unit' | 'checked' | 'price' | 'manual' | 'note'>;

export interface RegeneratePlan {
  insert: GroceryDraft[];
  update: { id: number; draft: GroceryDraft }[];
  remove: number[];
}

/**
 * Re-generating a list from the planner keeps everything the user did:
 * manual items are never touched, and checked state / price / note of a
 * generated item survive when the same line is still needed.
 */
export function planRegeneration(existing: readonly ExistingItem[], drafts: readonly GroceryDraft[]): RegeneratePlan {
  const generated = existing.filter((e) => !e.manual);
  const used = new Set<number>();
  const plan: RegeneratePlan = { insert: [], update: [], remove: [] };
  for (const d of drafts) {
    const match = generated.find((e) => !used.has(e.id) && e.key === d.key && (e.unit === d.unit || areCompatible(e.unit, d.unit)));
    if (match) {
      used.add(match.id);
      plan.update.push({ id: match.id, draft: d });
    } else plan.insert.push(d);
  }
  plan.remove = generated.filter((e) => !used.has(e.id)).map((e) => e.id);
  return plan;
}

export interface GrocerySection<T> {
  category: GroceryCategory;
  items: T[];
}

/** Groups items by aisle in a fixed shop order; unchecked first, then alphabetical. */
export function groupByCategory<T extends { category: GroceryCategory; checked: boolean; name: string; position?: number }>(items: readonly T[]): GrocerySection<T>[] {
  return GROCERY_CATEGORIES.map((category) => ({
    category,
    items: items
      .filter((i) => i.category === category)
      .sort((a, b) => Number(a.checked) - Number(b.checked) || a.name.localeCompare(b.name)),
  })).filter((s) => s.items.length > 0);
}

export function listProgress(items: readonly { checked: boolean }[]): { done: number; total: number; ratio: number } {
  const total = items.length;
  const done = items.filter((i) => i.checked).length;
  return { done, total, ratio: total ? done / total : 0 };
}

/** Sum of entered prices. `coverage` tells how many items have a price. */
export function estimateTotal(items: readonly { price: number | null }[]): { total: number; priced: number; count: number } {
  const priced = items.filter((i) => i.price !== null && Number.isFinite(i.price) && (i.price as number) >= 0);
  return { total: Math.round(priced.reduce((s, i) => s + (i.price as number), 0) * 100) / 100, priced: priced.length, count: items.length };
}
