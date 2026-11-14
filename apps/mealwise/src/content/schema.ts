import { z } from 'zod';

import { ART_COLORS, DIFFICULTIES, RECIPE_CATEGORIES, RECIPE_TAGS, UNIT_IDS, type BuiltinRecipe } from '@/domain/types';

import { INGREDIENT_BY_KEY } from './ingredients';

const text = z.string().trim().min(1);
const localized = z.object({ en: text, fr: text, es: text });

/** Animal products that make a recipe non-vegetarian. */
export const MEAT_FISH_KEYS = new Set([
  'chicken_breast', 'chicken_thigh', 'whole_chicken', 'ground_beef', 'beef_stew', 'beef_steak', 'ground_turkey', 'pork_chop',
  'pork_tenderloin', 'bacon', 'ham', 'chorizo', 'sausage', 'lamb_mince', 'salmon_fillet', 'white_fish', 'shrimp', 'tuna_canned',
  'chicken_broth',
]);
/** Additional animal products that make a recipe non-vegan. */
export const ANIMAL_PRODUCT_KEYS = new Set([
  ...MEAT_FISH_KEYS,
  'egg', 'milk', 'butter', 'heavy_cream', 'sour_cream', 'greek_yogurt', 'plain_yogurt', 'cheddar', 'parmesan', 'mozzarella', 'feta',
  'cream_cheese', 'ricotta', 'goat_cheese', 'honey', 'egg_noodles', 'puff_pastry',
]);

export const builtinRecipeSchema = z
  .object({
    id: z.string().regex(/^[a-z]{2}-[a-z0-9-]+$/, 'id must look like "di-lemon-chicken"'),
    title: localized,
    description: localized,
    emoji: z.string().min(1).max(8),
    color: z.enum(ART_COLORS),
    prepMinutes: z.number().int().min(0).max(240),
    cookMinutes: z.number().int().min(0).max(480),
    servings: z.number().int().min(1).max(12),
    difficulty: z.enum(DIFFICULTIES),
    categories: z.array(z.enum(RECIPE_CATEGORIES)).min(1),
    tags: z.array(z.enum(RECIPE_TAGS)),
    ingredients: z
      .array(
        z.object({
          key: z.string().refine((k) => INGREDIENT_BY_KEY.has(k), { message: 'unknown ingredient key' }),
          quantity: z.number().positive().max(10000).nullable(),
          unit: z.enum(UNIT_IDS),
          note: localized.optional(),
          optional: z.boolean().optional(),
        }),
      )
      .min(2),
    steps: z.array(z.object({ text: localized, timerMinutes: z.number().int().positive().max(480).optional() })).min(2),
    premium: z.boolean().optional(),
  })
  .superRefine((r, ctx) => {
    const keys = r.ingredients.map((x) => x.key);
    if (new Set(keys).size !== keys.length) ctx.addIssue({ code: 'custom', message: 'duplicate ingredient key' });
    for (const ing of r.ingredients) {
      if (ing.unit === 'to_taste' && ing.quantity !== null) ctx.addIssue({ code: 'custom', message: `${ing.key}: "to_taste" must have quantity null` });
      if (ing.unit !== 'to_taste' && ing.quantity === null) ctx.addIssue({ code: 'custom', message: `${ing.key}: quantity null requires unit "to_taste"` });
    }
    if (r.categories.includes('vegetarian') || r.categories.includes('vegan')) {
      const meat = keys.filter((k) => MEAT_FISH_KEYS.has(k));
      if (meat.length) ctx.addIssue({ code: 'custom', message: `vegetarian/vegan recipe contains ${meat.join(', ')}` });
    }
    if (r.categories.includes('vegan')) {
      const animal = keys.filter((k) => ANIMAL_PRODUCT_KEYS.has(k));
      if (animal.length) ctx.addIssue({ code: 'custom', message: `vegan recipe contains ${animal.join(', ')}` });
      if (!r.categories.includes('vegetarian')) ctx.addIssue({ code: 'custom', message: 'vegan recipes must also be in "vegetarian"' });
    }
    if (r.categories.includes('quick') && r.prepMinutes + r.cookMinutes > 30) {
      ctx.addIssue({ code: 'custom', message: '"quick" requires prep + cook <= 30 minutes' });
    }
  });

export function validateRecipes(recipes: readonly BuiltinRecipe[]): string[] {
  const errors: string[] = [];
  for (const r of recipes) {
    const res = builtinRecipeSchema.safeParse(r);
    if (!res.success) errors.push(...res.error.issues.map((i) => `${r.id}: ${i.path.join('.')} ${i.message}`));
  }
  return errors;
}
