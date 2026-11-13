/**
 * Core MealWise domain types. Pure TypeScript: no React, no SQLite.
 */

export const APP_LANGUAGES = ['en', 'fr', 'es'] as const;
export type AppLanguage = (typeof APP_LANGUAGES)[number];

/** Text available in every interface language (bundled content only). */
export type LocalizedText = Record<AppLanguage, string>;

export const UNIT_IDS = ['g', 'kg', 'oz', 'lb', 'ml', 'l', 'tsp', 'tbsp', 'cup', 'fl_oz', 'pc', 'clove', 'slice', 'can', 'bunch', 'pinch', 'pack', 'to_taste'] as const;
export type UnitId = (typeof UNIT_IDS)[number];

export type UnitSystem = 'metric' | 'imperial';

export const MEAL_SLOTS = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
export type MealSlot = (typeof MEAL_SLOTS)[number];

export const RECIPE_CATEGORIES = ['breakfast', 'lunch', 'dinner', 'snacks', 'desserts', 'vegetarian', 'vegan', 'quick', 'healthy'] as const;
export type RecipeCategory = (typeof RECIPE_CATEGORIES)[number];

export const RECIPE_TAGS = [
  'one-pot',
  'kid-friendly',
  'high-protein',
  'budget',
  'meal-prep',
  'spicy',
  'no-cook',
  'mediterranean',
  'comfort',
  'family',
  'student',
  'freezer-friendly',
  'light',
] as const;
export type RecipeTag = (typeof RECIPE_TAGS)[number];

export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const ART_COLORS = ['tomato', 'herb', 'saffron', 'berry', 'ocean', 'cocoa', 'olive', 'peach'] as const;
export type ArtColor = (typeof ART_COLORS)[number];

export const GROCERY_CATEGORIES = [
  'vegetables',
  'fruits',
  'meat_fish',
  'dairy_eggs',
  'bakery',
  'pantry',
  'spices_condiments',
  'frozen',
  'beverages',
  'household',
  'other',
] as const;
export type GroceryCategory = (typeof GROCERY_CATEGORIES)[number];

export const PANTRY_LOCATIONS = ['fridge', 'freezer', 'cupboard'] as const;
export type PantryLocation = (typeof PANTRY_LOCATIONS)[number];

/** Macro values. Any field may be unknown. */
export interface Nutrition {
  kcal: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
}

/**
 * One ingredient line of a recipe.
 * `key` is either a catalog id ("onion") or "custom:<normalized name>" for free text.
 * `quantity` is null for "to taste" / unspecified amounts.
 */
export interface RecipeIngredient {
  key: string;
  /** Display name for custom ingredients (catalog ingredients are named by the catalog). */
  name?: string;
  quantity: number | null;
  unit: UnitId;
  note?: string;
  optional?: boolean;
}

export interface RecipeStep {
  text: string;
  /** Suggested timer for this step, in minutes. */
  timerMinutes?: number;
}

export type RecipeSource = 'builtin' | 'user';

/** A recipe resolved for one language (what screens and logic consume). */
export interface Recipe {
  id: string;
  source: RecipeSource;
  title: string;
  description: string;
  emoji: string;
  color: ArtColor;
  prepMinutes: number;
  cookMinutes: number;
  servings: number;
  difficulty: Difficulty;
  categories: RecipeCategory[];
  tags: string[];
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  /** Per-serving values documented by the user (e.g. from packaging). Never invented. */
  nutrition: Nutrition | null;
  premium: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** Bundled recipe as authored (all languages). */
export interface BuiltinRecipe {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  emoji: string;
  color: ArtColor;
  prepMinutes: number;
  cookMinutes: number;
  servings: number;
  difficulty: Difficulty;
  categories: RecipeCategory[];
  tags: RecipeTag[];
  ingredients: { key: string; quantity: number | null; unit: UnitId; note?: LocalizedText; optional?: boolean }[];
  steps: { text: LocalizedText; timerMinutes?: number }[];
  premium?: boolean;
}

/** A day key is a local calendar date "YYYY-MM-DD". */
export type DayKey = string;

export interface PlanEntry {
  id: number;
  day: DayKey;
  slot: MealSlot;
  /** Null for a custom meal ("Leftovers", "Dinner out"). */
  recipeId: string | null;
  customTitle: string | null;
  servings: number;
  note: string | null;
  position: number;
  cookedAt: string | null;
}

export interface TemplateEntry {
  /** 0 = first day of the week the template is applied to. */
  dayOffset: number;
  slot: MealSlot;
  recipeId: string | null;
  customTitle?: string | null;
  servings?: number;
}

export interface MealTemplate {
  id: string;
  builtin: boolean;
  premium: boolean;
  name: string;
  description: string;
  icon: string;
  entries: TemplateEntry[];
}

export interface PantryItem {
  id: number;
  key: string;
  name: string;
  category: GroceryCategory;
  quantity: number | null;
  unit: UnitId;
  location: PantryLocation;
  expiresOn: DayKey | null;
  createdAt: string;
  consumedAt: string | null;
}

export interface GroceryItem {
  id: number;
  listId: number;
  key: string;
  name: string;
  category: GroceryCategory;
  quantity: number | null;
  unit: UnitId;
  checked: boolean;
  /** Estimated price entered by the user, in the user's currency. */
  price: number | null;
  manual: boolean;
  note: string | null;
  position: number;
}

export interface GroceryList {
  id: number;
  name: string;
  createdAt: string;
  startDay: DayKey | null;
  endDay: DayKey | null;
  completedAt: string | null;
  /** Actual amount paid, entered by the user. */
  spent: number | null;
}
