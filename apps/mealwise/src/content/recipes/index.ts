import type { BuiltinRecipe } from '@/domain/types';

import { breakfastSnacksRecipes } from './breakfast-snacks';
import { dinnerRecipes } from './dinner';
import { lunchRecipes } from './lunch';
import { veggieDessertsRecipes } from './veggie-desserts';

/** Source files, exposed separately so content validation reports per file. */
export const RECIPE_SOURCES: Record<string, BuiltinRecipe[]> = {
  'breakfast-snacks': breakfastSnacksRecipes,
  lunch: lunchRecipes,
  dinner: dinnerRecipes,
  'veggie-desserts': veggieDessertsRecipes,
};

/** All bundled recipes (original content written for MealWise). */
export const BUILTIN_RECIPES: BuiltinRecipe[] = Object.values(RECIPE_SOURCES).flat();
