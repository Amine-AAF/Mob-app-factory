import { compareBudget, costFromPrice, estimateRecipeCost, monthlyHistory, parseAmount, weekSpent, type Expense, type PriceEntry } from '@/domain/budget';
import { estimateRecipeNutrition, gramsOf, macroSplit, MIN_COVERAGE, sumNutrition } from '@/domain/nutrition';
import { alertDay, availability, cookableRecipes, expiringItems, expiryStatus, matchRecipe, sortByExpiry } from '@/domain/pantry';
import {
  applyTemplate,
  canPlanDay,
  copyWeek,
  duplicateDay,
  groupBySlot,
  nextMeal,
  summarizeWeek,
  weekDays,
  weekStart,
  weekToTemplateEntries,
} from '@/domain/planner';
import { parseIngredientLine, parseRecipeText, stepTimer } from '@/domain/recipeImport';
import { canCreateRecipe, canOpenRecipe, defaultSlotFor, filterRecipes, FREE_USER_RECIPE_LIMIT, localizeRecipe, validateUserRecipe } from '@/domain/recipes';
import { formatClock, splitMinutes } from '@/domain/time';
import type { PantryItem, PlanEntry, Recipe } from '@/domain/types';
import { BUILTIN_RECIPES } from '@/content/recipes';

const recipe = (over: Partial<Recipe> = {}): Recipe => ({
  id: 'r1',
  source: 'user',
  title: 'Test',
  description: '',
  emoji: '🍲',
  color: 'tomato',
  prepMinutes: 10,
  cookMinutes: 10,
  servings: 2,
  difficulty: 'easy',
  categories: ['dinner'],
  tags: [],
  ingredients: [],
  steps: [{ text: 'Cook' }],
  nutrition: null,
  premium: false,
  ...over,
});

const entry = (over: Partial<PlanEntry>): PlanEntry => ({ id: 1, day: '2026-11-16', slot: 'dinner', recipeId: 'r1', customTitle: null, servings: 2, note: null, position: 0, cookedAt: null, ...over });
const stock = (over: Partial<PantryItem>): PantryItem => ({ id: 1, key: 'egg', name: 'Eggs', category: 'dairy_eggs', quantity: null, unit: 'pc', location: 'fridge', expiresOn: null, createdAt: '', consumedAt: null, ...over });

describe('planner', () => {
  it('computes Monday- and Sunday-based weeks', () => {
    expect(weekStart('2026-11-13', 'monday')).toBe('2026-11-09'); // Friday -> Monday
    expect(weekStart('2026-11-13', 'sunday')).toBe('2026-11-08');
    expect(weekStart('2026-11-15', 'sunday')).toBe('2026-11-15'); // Sunday itself
    expect(weekStart('2026-11-15', 'monday')).toBe('2026-11-09');
    expect(weekDays('2026-11-09')).toHaveLength(7);
  });

  it('applies a template to a week with default servings', () => {
    const drafts = applyTemplate({ entries: [{ dayOffset: 0, slot: 'dinner', recipeId: 'a' }, { dayOffset: 6, slot: 'lunch', recipeId: 'b', servings: 5 }, { dayOffset: 9, slot: 'lunch', recipeId: 'x' }] }, '2026-11-09', 3);
    expect(drafts).toEqual([expect.objectContaining({ day: '2026-11-09', servings: 3 }), expect.objectContaining({ day: '2026-11-15', servings: 5 })]);
  });

  it('copies a week and a day, and round-trips a week through a template', () => {
    const entries = [entry({ id: 1, day: '2026-11-10', slot: 'lunch' }), entry({ id: 2, day: '2026-11-12' }), entry({ id: 3, day: '2026-11-20' })];
    expect(copyWeek(entries, '2026-11-09', '2026-11-16').map((d) => d.day)).toEqual(['2026-11-17', '2026-11-19']);
    expect(duplicateDay(entries, '2026-11-10', '2026-11-11')).toEqual([expect.objectContaining({ day: '2026-11-11', slot: 'lunch' })]);
    const tpl = weekToTemplateEntries(entries, '2026-11-09');
    expect(applyTemplate({ entries: tpl }, '2026-11-23', 2).map((d) => d.day)).toEqual(['2026-11-24', '2026-11-26']);
  });

  it('groups by slot and summarizes the week', () => {
    const entries = [entry({ id: 1, slot: 'dinner', position: 1 }), entry({ id: 2, slot: 'dinner', position: 0 }), entry({ id: 3, slot: 'snack', cookedAt: 'x' })];
    expect(groupBySlot(entries).dinner.map((e) => e.id)).toEqual([2, 1]);
    const s = summarizeWeek(entries, '2026-11-16');
    expect(s).toMatchObject({ planned: 3, cooked: 1, filledMainSlots: 1, daysWithMeals: 1 });
  });

  it('finds the next meal and ignores cooked ones', () => {
    const entries = [entry({ id: 1, day: '2026-11-16', slot: 'breakfast' }), entry({ id: 2, day: '2026-11-16', slot: 'lunch', cookedAt: 'x' }), entry({ id: 3, day: '2026-11-16', slot: 'dinner' })];
    expect(nextMeal(entries, new Date(2026, 10, 16, 7, 0))?.id).toBe(1);
    expect(nextMeal(entries, new Date(2026, 10, 16, 11, 0))?.id).toBe(3);
    expect(nextMeal(entries, new Date(2026, 10, 16, 23, 30))).toBeNull();
  });

  it('limits free users to this week and next week', () => {
    expect(canPlanDay('2026-11-22', '2026-11-13', 'monday', false)).toBe(true); // next week
    expect(canPlanDay('2026-11-23', '2026-11-13', 'monday', false)).toBe(false); // in two weeks
    expect(canPlanDay('2026-10-01', '2026-11-13', 'monday', false)).toBe(true); // past stays editable
    expect(canPlanDay('2027-06-01', '2026-11-13', 'monday', true)).toBe(true);
  });
});

describe('pantry', () => {
  it('classifies expiry dates', () => {
    expect(expiryStatus(null, '2026-11-13')).toBe('none');
    expect(expiryStatus('2026-11-12', '2026-11-13')).toBe('expired');
    expect(expiryStatus('2026-11-13', '2026-11-13')).toBe('today');
    expect(expiryStatus('2026-11-15', '2026-11-13')).toBe('soon');
    expect(expiryStatus('2026-11-20', '2026-11-13')).toBe('ok');
  });

  it('schedules alerts on the right day, never in the past', () => {
    expect(alertDay('2026-11-20', '2026-11-13', 2)).toBe('2026-11-18');
    expect(alertDay('2026-11-14', '2026-11-13', 2)).toBe('2026-11-13');
    expect(alertDay('2026-11-10', '2026-11-13', 2)).toBeNull();
  });

  it('lists expiring items and sorts by urgency', () => {
    const items = [stock({ id: 1, name: 'B', expiresOn: '2026-11-30' }), stock({ id: 2, name: 'A', expiresOn: null }), stock({ id: 3, name: 'C', expiresOn: '2026-11-14' }), stock({ id: 4, name: 'D', expiresOn: '2026-11-14', consumedAt: 'x' })];
    expect(expiringItems(items, '2026-11-13').map((i) => i.id)).toEqual([3]);
    expect(sortByExpiry(items).map((i) => i.id)).toEqual([3, 1, 2]);
  });

  it('checks availability with compatible quantities only', () => {
    const s = [stock({ key: 'milk', quantity: 500, unit: 'ml' }), stock({ key: 'flour', quantity: 1, unit: 'cup' })];
    expect(availability({ key: 'milk', quantity: 250, unit: 'ml' }, s)).toBe('have');
    expect(availability({ key: 'milk', quantity: 1, unit: 'l' }, s)).toBe('not_enough');
    expect(availability({ key: 'milk', quantity: 300, unit: 'ml' }, s, 2)).toBe('not_enough');
    expect(availability({ key: 'flour', quantity: 200, unit: 'g' }, s)).toBe('have'); // other dimension: trust the user
    expect(availability({ key: 'rice', quantity: 200, unit: 'g' }, s)).toBe('missing');
    expect(availability({ key: 'salt', quantity: null, unit: 'to_taste' }, s)).toBe('staple');
  });

  it('suggests recipes doable with the pantry', () => {
    const omelette = recipe({ id: 'om', title: 'Omelette', ingredients: [{ key: 'egg', quantity: 3, unit: 'pc' }, { key: 'salt', quantity: null, unit: 'to_taste' }] });
    const pasta = recipe({ id: 'pa', title: 'Pasta', ingredients: [{ key: 'pasta', quantity: 200, unit: 'g' }, { key: 'egg', quantity: 1, unit: 'pc' }, { key: 'parmesan', quantity: 50, unit: 'g' }] });
    const curry = recipe({ id: 'cu', title: 'Curry', ingredients: [{ key: 'tofu', quantity: 1, unit: 'pc' }, { key: 'coconut_milk', quantity: 400, unit: 'ml' }, { key: 'rice', quantity: 1, unit: 'cup' }, { key: 'curry_paste', quantity: 2, unit: 'tbsp' }] });
    const s = [stock({ key: 'egg', quantity: 6, unit: 'pc' })];
    expect(matchRecipe(omelette, s)).toMatchObject({ required: 1, available: 1, missing: [] });
    const out = cookableRecipes([curry, pasta, omelette], s);
    expect(out.map((m) => m.recipe.id)).toEqual(['om', 'pa']);
    expect(cookableRecipes([omelette], [])).toEqual([]);
  });
});

describe('nutrition estimates', () => {
  it('derives grams from mass, volume (density) and pieces only', () => {
    expect(gramsOf({ key: 'rice', quantity: 0.5, unit: 'kg' })).toBe(500);
    expect(gramsOf({ key: 'milk', quantity: 100, unit: 'ml' })).toBeCloseTo(103, 5);
    expect(gramsOf({ key: 'egg', quantity: 2, unit: 'pc' })).toBe(100);
    expect(gramsOf({ key: 'kale', quantity: 1, unit: 'cup' })).toBeNull(); // no density known
    expect(gramsOf({ key: 'salt', quantity: null, unit: 'to_taste' })).toBeNull();
  });

  it('estimates per serving and ignores negligible seasonings', () => {
    const r = recipe({ servings: 2, ingredients: [{ key: 'egg', quantity: 4, unit: 'pc' }, { key: 'salt', quantity: 1, unit: 'pinch' }] });
    const n = estimateRecipeNutrition(r);
    expect(n.source).toBe('estimated');
    expect(n.coverage).toBe(1);
    expect(n.perServing.kcal).toBe(143); // 4 × 50 g × 143 kcal / 100 g / 2
  });

  it('refuses to estimate when too much data is missing', () => {
    const r = recipe({ ingredients: [{ key: 'custom:mystery', name: 'Mystery', quantity: 1, unit: 'pc' }, { key: 'kale', quantity: 2, unit: 'cup' }, { key: 'egg', quantity: 1, unit: 'pc' }] });
    const n = estimateRecipeNutrition(r);
    expect(n.coverage).toBeLessThan(MIN_COVERAGE);
    expect(n.source).toBe('unavailable');
    expect(n.perServing.kcal).toBeNull();
    expect(n.missing).toEqual(['custom:mystery', 'kale']);
  });

  it('prefers documented values', () => {
    const n = estimateRecipeNutrition(recipe({ nutrition: { kcal: 420, protein: 30, carbs: 40, fat: 12 } }));
    expect(n).toMatchObject({ source: 'documented', perServing: { kcal: 420 } });
  });

  it('sums meals and reports uncounted ones', () => {
    const ok = { servingsEaten: 1, result: { perServing: { kcal: 500, protein: 20, carbs: 60, fat: 15 }, source: 'estimated' as const, coverage: 0.8, missing: [] } };
    const none = { servingsEaten: 1, result: { perServing: { kcal: null, protein: null, carbs: null, fat: null }, source: 'unavailable' as const, coverage: 0, missing: [] } };
    expect(sumNutrition([ok, ok, none])).toEqual({ total: { kcal: 1000, protein: 40, carbs: 120, fat: 30 }, counted: 2, uncounted: 1, estimated: true });
    expect(sumNutrition([]).total.kcal).toBeNull();
    const split = macroSplit({ kcal: 0, protein: 25, carbs: 50, fat: 0 });
    expect(split?.carbs).toBeCloseTo(2 / 3, 5);
    expect(macroSplit({ kcal: null, protein: null, carbs: 1, fat: 1 })).toBeNull();
  });

  it('can estimate most bundled recipes (catalog coverage)', () => {
    const estimated = BUILTIN_RECIPES.map((r) => estimateRecipeNutrition(localizeRecipe(r, 'en'))).filter((n) => n.source === 'estimated');
    expect(estimated.length / BUILTIN_RECIPES.length).toBeGreaterThan(0.8);
  });
});

describe('budget', () => {
  const prices = new Map<string, PriceEntry>([
    ['rice', { key: 'rice', price: 2, quantity: 1, unit: 'kg' }],
    ['egg', { key: 'egg', price: 3, quantity: 12, unit: 'pc' }],
  ]);

  it('computes costs only for comparable units', () => {
    expect(costFromPrice(prices.get('rice')!, 250, 'g')).toBeCloseTo(0.5, 6);
    expect(costFromPrice(prices.get('rice')!, 1, 'cup')).toBeNull();
    expect(costFromPrice({ key: 'x', price: 1, quantity: 0, unit: 'g' }, 1, 'g')).toBeNull();
  });

  it('estimates a recipe cost with coverage', () => {
    const r = recipe({ servings: 2, ingredients: [{ key: 'rice', quantity: 200, unit: 'g' }, { key: 'egg', quantity: 4, unit: 'pc' }, { key: 'onion', quantity: 1, unit: 'pc' }, { key: 'salt', quantity: null, unit: 'to_taste' }] });
    const c = estimateRecipeCost(r, 4, prices);
    expect(c.total).toBeCloseTo(0.8 + 2, 5);
    expect(c.perServing).toBeCloseTo(0.7, 5);
    expect(c.coverage).toBeCloseTo(2 / 3, 5);
    expect(c.missing).toEqual(['onion']);
  });

  it('compares spending to budget and builds monthly history', () => {
    const exp: Expense[] = [
      { id: 1, day: '2026-11-10', amount: 40, note: null, listId: null },
      { id: 2, day: '2026-11-15', amount: 25.5, note: null, listId: null },
      { id: 3, day: '2026-09-02', amount: 10, note: null, listId: null },
    ];
    expect(weekSpent(exp, '2026-11-09')).toBe(65.5);
    expect(compareBudget(80, 65.5).status).toBe('under');
    expect(compareBudget(70, 65.5).status).toBe('near');
    expect(compareBudget(60, 65.5)).toMatchObject({ status: 'over', remaining: -5.5 });
    expect(compareBudget(null, 10).status).toBe('none');
    expect(monthlyHistory(exp, '2026-11-13', 3)).toEqual([
      { month: '2026-09', total: 10 },
      { month: '2026-10', total: 0 },
      { month: '2026-11', total: 65.5 },
    ]);
  });

  it.each([
    ['12.50', 12.5],
    ['12,50', 12.5],
    ['€ 7', 7],
    ['1.234,56', 1234.56],
    ['1,234.56', 1234.56],
    ['', null],
    ['-3', null],
    ['abc', null],
  ])('parses amount %p', (input, expected) => {
    expect(parseAmount(input)).toBe(expected);
  });
});

describe('recipe import', () => {
  it.each([
    ['200 g spaghetti', { key: 'spaghetti', quantity: 200, unit: 'g' }],
    ['200g flour', { key: 'flour', quantity: 200, unit: 'g' }],
    ['1 1/2 cups milk', { key: 'milk', quantity: 1.5, unit: 'cup' }],
    ['2 gousses d’ail', { key: 'garlic', quantity: 2, unit: 'clove' }],
    ['3 cuillères à soupe d’huile d’olive', { key: 'olive_oil', quantity: 3, unit: 'tbsp' }],
    ['1 cda de aceite de oliva', { key: 'olive_oil', quantity: 1, unit: 'tbsp' }],
    ['25 cl de lait', { key: 'milk', quantity: 250, unit: 'ml' }],
    ['3 eggs', { key: 'egg', quantity: 3, unit: 'pc' }],
    ['Salt to taste', { key: 'salt', quantity: null, unit: 'to_taste' }],
    ['Sel au goût', { key: 'salt', quantity: null, unit: 'to_taste' }],
    ['1 onion, finely chopped', { key: 'onion', quantity: 1, unit: 'pc', note: 'finely chopped' }],
  ])('parses "%s"', (line, expected) => {
    expect(parseIngredientLine(line)).toMatchObject(expected);
  });

  it('keeps unknown ingredients as custom with their name, and flags optional ones', () => {
    expect(parseIngredientLine('2 tbsp gochujang (optional)')).toMatchObject({ key: 'custom:gochujang', name: 'Gochujang', quantity: 2, unit: 'tbsp', optional: true });
    expect(parseIngredientLine('   ')).toBeNull();
  });

  it('parses a full recipe text with sections', () => {
    const d = parseRecipeText(`Lemon pasta
A bright weeknight dish.
Serves 2
Prep: 5 min
Cooking: 12 min

Ingredients
- 200 g spaghetti
- 1 lemon
- 2 tbsp olive oil

Steps
1. Cook the pasta for 10 minutes.
2. Toss with lemon and oil.`);
    expect(d).toMatchObject({ title: 'Lemon pasta', description: 'A bright weeknight dish.', servings: 2, prepMinutes: 5, cookMinutes: 12 });
    expect(d.ingredients.map((i) => i.key)).toEqual(['spaghetti', 'lemon', 'olive_oil']);
    expect(d.steps).toEqual([{ text: 'Cook the pasta for 10 minutes.', timerMinutes: 10 }, { text: 'Toss with lemon and oil.' }]);
  });

  it('detects ingredients without headings (French text)', () => {
    const d = parseRecipeText('Soupe express\n2 carottes\n1 oignon\nÉtapes\nFaire revenir 5 à 8 minutes.');
    expect(d.title).toBe('Soupe express');
    expect(d.ingredients.map((i) => i.key)).toEqual(['carrot', 'onion']);
    expect(d.steps[0]?.timerMinutes).toBe(8);
    expect(stepTimer('no timer here')).toBeUndefined();
  });
});

describe('recipes', () => {
  const list = BUILTIN_RECIPES.map((r) => localizeRecipe(r, 'en'));

  it('localizes bundled recipes', () => {
    const r = BUILTIN_RECIPES[0]!;
    expect(localizeRecipe(r, 'fr').title).toBe(r.title.fr);
    expect(localizeRecipe(r, 'es').steps[0]?.text).toBe(r.steps[0]?.text.es);
  });

  it('searches by title and ingredient, tolerant to accents and plurals', () => {
    const byIngredient = filterRecipes(list, { query: 'lentils' }, { lng: 'en' });
    expect(byIngredient.length).toBeGreaterThan(0);
    expect(byIngredient.every((r) => r.ingredients.some((i) => i.key.includes('lentil')) || r.title.toLowerCase().includes('lentil'))).toBe(true);
    const fr = BUILTIN_RECIPES.map((r) => localizeRecipe(r, 'fr'));
    expect(filterRecipes(fr, { query: 'pois chiche' }, { lng: 'fr' }).length).toBeGreaterThan(0);
  });

  it('filters by category, time, favorites and source', () => {
    const vegan = filterRecipes(list, { categories: ['vegan'] }, { lng: 'en' });
    expect(vegan.length).toBeGreaterThan(5);
    expect(vegan.every((r) => r.categories.includes('vegan'))).toBe(true);
    expect(filterRecipes(list, { maxMinutes: 20 }, { lng: 'en' }).every((r) => r.prepMinutes + r.cookMinutes <= 20)).toBe(true);
    expect(filterRecipes(list, { favoritesOnly: true }, { lng: 'en', favorites: new Set([list[3]!.id]) }).map((r) => r.id)).toEqual([list[3]!.id]);
    expect(filterRecipes(list, { source: 'user' }, { lng: 'en' })).toEqual([]);
    const quickest = filterRecipes(list, { sort: 'quickest' }, { lng: 'en' });
    expect(quickest[0]!.prepMinutes + quickest[0]!.cookMinutes).toBeLessThanOrEqual(quickest[quickest.length - 1]!.prepMinutes + quickest[quickest.length - 1]!.cookMinutes);
  });

  it('enforces free limits', () => {
    expect(canCreateRecipe(FREE_USER_RECIPE_LIMIT - 1, false)).toBe(true);
    expect(canCreateRecipe(FREE_USER_RECIPE_LIMIT, false)).toBe(false);
    expect(canCreateRecipe(500, true)).toBe(true);
    expect(canOpenRecipe({ premium: true }, false)).toBe(false);
    expect(canOpenRecipe({ premium: true }, true)).toBe(true);
  });

  it('validates user recipes', () => {
    expect(validateUserRecipe(recipe({ title: ' ', ingredients: [], steps: [] }))).toEqual(['editor.errors.title', 'editor.errors.ingredients', 'editor.errors.steps']);
    expect(validateUserRecipe(recipe({ ingredients: [{ key: 'egg', quantity: null, unit: 'pc' }] }))).toContain('editor.errors.quantity');
    expect(validateUserRecipe(recipe({ ingredients: [{ key: 'salt', quantity: null, unit: 'to_taste' }] }))).toEqual([]);
    expect(validateUserRecipe(recipe({ servings: 0, ingredients: [{ key: 'egg', quantity: 1, unit: 'pc' }] }))).toContain('editor.errors.servings');
  });

  it('suggests a slot from categories', () => {
    expect(defaultSlotFor({ categories: ['breakfast', 'vegetarian'] })).toBe('breakfast');
    expect(defaultSlotFor({ categories: ['desserts'] })).toBe('snack');
    expect(defaultSlotFor({ categories: ['lunch'] })).toBe('lunch');
    expect(defaultSlotFor({ categories: ['lunch', 'dinner'] })).toBe('dinner');
  });
});

describe('time helpers', () => {
  it('formats countdowns', () => {
    expect(formatClock(0)).toBe('00:00');
    expect(formatClock(65)).toBe('01:05');
    expect(formatClock(3725)).toBe('1:02:05');
    expect(formatClock(-3)).toBe('00:00');
    expect(splitMinutes(19 * 60 + 30)).toEqual({ hour: 19, minute: 30 });
    expect(splitMinutes(-30)).toEqual({ hour: 23, minute: 30 });
  });
});
