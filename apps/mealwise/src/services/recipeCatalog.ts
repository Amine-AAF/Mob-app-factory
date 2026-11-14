import { BUILTIN_RECIPES } from '@/content/recipes';
import { repos } from '@/database';
import { localizeRecipe } from '@/domain/recipes';
import type { AppLanguage, Recipe } from '@/domain/types';

/**
 * Single access point for recipes: bundled ones (translated, immutable) and
 * the user's own (SQLite). Bundled recipes are localized once per language.
 */
let cache: { lng: AppLanguage; list: Recipe[]; byId: Map<string, Recipe> } | null = null;

export function builtinRecipes(lng: AppLanguage): Recipe[] {
  if (!cache || cache.lng !== lng) {
    const list = BUILTIN_RECIPES.map((r) => localizeRecipe(r, lng));
    cache = { lng, list, byId: new Map(list.map((r) => [r.id, r])) };
  }
  return cache.list;
}

export function builtinRecipe(id: string, lng: AppLanguage): Recipe | null {
  builtinRecipes(lng);
  return cache?.byId.get(id) ?? null;
}

export async function allRecipes(lng: AppLanguage): Promise<Recipe[]> {
  const user = await repos().recipes.list();
  return [...user, ...builtinRecipes(lng)];
}

export async function getRecipe(id: string, lng: AppLanguage): Promise<Recipe | null> {
  if (id.startsWith('u-')) return repos().recipes.get(id);
  return builtinRecipe(id, lng);
}

/** Resolves many ids at once (planner, grocery generation). Missing ids are skipped. */
export async function recipesById(ids: readonly string[], lng: AppLanguage): Promise<Map<string, Recipe>> {
  const out = new Map<string, Recipe>();
  const unique = [...new Set(ids)];
  for (const id of unique) {
    const r = await getRecipe(id, lng);
    if (r) out.set(id, r);
  }
  return out;
}
