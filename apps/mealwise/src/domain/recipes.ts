import { ingredientName, normalizeName } from './ingredients';
import type { AppLanguage, BuiltinRecipe, Difficulty, Recipe, RecipeCategory } from './types';

/** Resolves a bundled recipe for one language. */
export function localizeRecipe(r: BuiltinRecipe, lng: AppLanguage): Recipe {
  return {
    id: r.id,
    source: 'builtin',
    title: r.title[lng],
    description: r.description[lng],
    emoji: r.emoji,
    color: r.color,
    prepMinutes: r.prepMinutes,
    cookMinutes: r.cookMinutes,
    servings: r.servings,
    difficulty: r.difficulty,
    categories: [...r.categories],
    tags: [...r.tags],
    ingredients: r.ingredients.map((i) => ({
      key: i.key,
      quantity: i.quantity,
      unit: i.unit,
      ...(i.note ? { note: i.note[lng] } : {}),
      ...(i.optional ? { optional: true } : {}),
    })),
    steps: r.steps.map((s) => ({ text: s.text[lng], ...(s.timerMinutes ? { timerMinutes: s.timerMinutes } : {}) })),
    nutrition: null,
    premium: r.premium === true,
  };
}

export function totalMinutes(r: Pick<Recipe, 'prepMinutes' | 'cookMinutes'>): number {
  return r.prepMinutes + r.cookMinutes;
}

export type RecipeSort = 'relevance' | 'quickest' | 'az' | 'newest';

export interface RecipeFilter {
  query?: string;
  categories?: RecipeCategory[];
  maxMinutes?: number | null;
  difficulty?: Difficulty | null;
  favoritesOnly?: boolean;
  source?: 'all' | 'builtin' | 'user';
  /** Only recipes whose ingredients include all of these keys. */
  withIngredients?: string[];
  sort?: RecipeSort;
}

function haystack(r: Recipe, lng: AppLanguage): string {
  return normalizeName([r.title, r.description, ...r.tags, ...r.ingredients.map((i) => ingredientName(i.key, lng, i.name))].join(' '));
}

/** Searches by words in title, description, tags and ingredient names (accent/plural tolerant). */
export function filterRecipes(recipes: readonly Recipe[], filter: RecipeFilter, ctx: { lng: AppLanguage; favorites?: ReadonlySet<string> }): Recipe[] {
  const words = normalizeName(filter.query ?? '').split(' ').filter(Boolean);
  const scored = recipes
    .filter((r) => {
      if (filter.source && filter.source !== 'all' && r.source !== filter.source) return false;
      if (filter.favoritesOnly && !ctx.favorites?.has(r.id)) return false;
      if (filter.categories?.length && !filter.categories.every((c) => r.categories.includes(c))) return false;
      if (filter.maxMinutes && totalMinutes(r) > filter.maxMinutes) return false;
      if (filter.difficulty && r.difficulty !== filter.difficulty) return false;
      if (filter.withIngredients?.length && !filter.withIngredients.every((k) => r.ingredients.some((i) => i.key === k))) return false;
      return true;
    })
    .map((r) => {
      if (!words.length) return { r, score: 0 };
      const title = normalizeName(r.title);
      const hay = haystack(r, ctx.lng);
      if (!words.every((w) => hay.includes(w))) return null;
      const score = words.reduce((s, w) => s + (title.includes(w) ? 3 : 1) + (title.startsWith(w) ? 2 : 0), 0);
      return { r, score };
    })
    .filter((x): x is { r: Recipe; score: number } => x !== null);

  const sort = filter.sort ?? 'relevance';
  scored.sort((a, b) => {
    if (sort === 'quickest') return totalMinutes(a.r) - totalMinutes(b.r) || a.r.title.localeCompare(b.r.title);
    if (sort === 'az') return a.r.title.localeCompare(b.r.title);
    if (sort === 'newest') return (b.r.createdAt ?? '').localeCompare(a.r.createdAt ?? '') || a.r.title.localeCompare(b.r.title);
    return b.score - a.score || Number(a.r.premium) - Number(b.r.premium) || a.r.title.localeCompare(b.r.title);
  });
  return scored.map((x) => x.r);
}

/** Free users can create up to this many personal recipes. */
export const FREE_USER_RECIPE_LIMIT = 15;

export function canCreateRecipe(userRecipeCount: number, isPremium: boolean): boolean {
  return isPremium || userRecipeCount < FREE_USER_RECIPE_LIMIT;
}

export function canOpenRecipe(r: Pick<Recipe, 'premium'>, isPremium: boolean): boolean {
  return isPremium || !r.premium;
}

/** Suggests the slot a recipe fits best when added from the recipe screen. */
export function defaultSlotFor(r: Pick<Recipe, 'categories'>): 'breakfast' | 'lunch' | 'dinner' | 'snack' {
  if (r.categories.includes('breakfast')) return 'breakfast';
  if (r.categories.includes('snacks') || r.categories.includes('desserts')) return 'snack';
  if (r.categories.includes('lunch') && !r.categories.includes('dinner')) return 'lunch';
  return 'dinner';
}

/** Validates a user recipe before saving; returns i18n error keys. */
export function validateUserRecipe(r: Pick<Recipe, 'title' | 'servings' | 'ingredients' | 'steps' | 'prepMinutes' | 'cookMinutes'>): string[] {
  const errors: string[] = [];
  if (!r.title.trim()) errors.push('editor.errors.title');
  if (!(r.servings >= 1 && r.servings <= 50)) errors.push('editor.errors.servings');
  if (r.ingredients.length === 0) errors.push('editor.errors.ingredients');
  if (r.ingredients.some((i) => !(i.name ?? i.key).trim())) errors.push('editor.errors.ingredientName');
  if (r.ingredients.some((i) => i.unit !== 'to_taste' && (i.quantity === null || !(i.quantity > 0)))) errors.push('editor.errors.quantity');
  if (r.steps.filter((s) => s.text.trim()).length === 0) errors.push('editor.errors.steps');
  if (r.prepMinutes < 0 || r.cookMinutes < 0 || r.prepMinutes > 1440 || r.cookMinutes > 1440) errors.push('editor.errors.time');
  return errors;
}
