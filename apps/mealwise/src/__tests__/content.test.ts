import { INGREDIENTS } from '@/content/ingredients';
import { BUILTIN_RECIPES, RECIPE_SOURCES } from '@/content/recipes';
import { validateRecipes } from '@/content/schema';
import { RECIPE_CATEGORIES } from '@/domain/types';

describe('ingredient catalog', () => {
  it('has unique keys and names in every language', () => {
    const keys = INGREDIENTS.map((i) => i.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const i of INGREDIENTS) {
      expect(i.key).toMatch(/^[a-z][a-z0-9_]*$/);
      expect(i.name.en && i.name.fr && i.name.es).toBeTruthy();
    }
  });

  it('nutrition reference values are plausible (per 100 g)', () => {
    for (const i of INGREDIENTS) {
      if (!i.per100g) continue;
      const { kcal, protein, carbs, fat } = i.per100g;
      expect(kcal).toBeGreaterThanOrEqual(0);
      expect(kcal).toBeLessThanOrEqual(900);
      expect(protein + carbs + fat).toBeLessThanOrEqual(101);
      // Energy from macros (4/4/9 kcal per g) should roughly match the stated kcal.
      expect(Math.abs(protein * 4 + carbs * 4 + fat * 9 - kcal)).toBeLessThan(Math.max(40, kcal * 0.25));
    }
  });
});

describe.each(Object.entries(RECIPE_SOURCES))('recipes file %s', (_name, recipes) => {
  it('is valid against the recipe schema', () => {
    expect(validateRecipes(recipes)).toEqual([]);
  });
});

describe('bundled recipe library', () => {
  it('contains at least 100 recipes with unique ids', () => {
    expect(BUILTIN_RECIPES.length).toBeGreaterThanOrEqual(100);
    const ids = BUILTIN_RECIPES.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('covers every category with several recipes', () => {
    for (const c of RECIPE_CATEGORIES) {
      expect(BUILTIN_RECIPES.filter((r) => r.categories.includes(c)).length).toBeGreaterThanOrEqual(5);
    }
  });

  it('keeps a generous free library (premium is a minority)', () => {
    const premium = BUILTIN_RECIPES.filter((r) => r.premium).length;
    expect(premium / BUILTIN_RECIPES.length).toBeGreaterThan(0.2);
    expect(premium / BUILTIN_RECIPES.length).toBeLessThan(0.45);
  });

  it('has no untranslated text (fr/es differ from en for titles)', () => {
    const same = BUILTIN_RECIPES.filter((r) => r.title.fr === r.title.en && r.title.es === r.title.en);
    expect(same.map((r) => r.id)).toEqual([]);
  });
});
