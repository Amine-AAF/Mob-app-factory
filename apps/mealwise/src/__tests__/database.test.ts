import { createTestDatabase } from '@factory/testing';

import { initDatabase, setRepositories, type Repositories } from '@/database';
import { SCHEMA_VERSION, USER_TABLES } from '@/database/migrations';
import type { RecipeInput } from '@/database/repositories/recipeRepository';
import { deleteAllUserData, exportUserData, importUserData } from '@/services/backupService';
import { draftsForRange, generateGroceryList } from '@/services/planning';
import { getRecipe } from '@/services/recipeCatalog';

async function setup(): Promise<Repositories> {
  const repos = await initDatabase(await createTestDatabase());
  setRepositories(repos);
  return repos;
}

const input = (over: Partial<RecipeInput> = {}): RecipeInput => ({
  title: 'Family lasagna',
  description: 'Sunday classic',
  emoji: '🍝',
  color: 'tomato',
  prepMinutes: 20,
  cookMinutes: 45,
  servings: 4,
  difficulty: 'medium',
  categories: ['dinner'],
  tags: ['family'],
  ingredients: [
    { key: 'ground_beef', quantity: 500, unit: 'g' },
    { key: 'custom:secret sauce', name: 'Secret sauce', quantity: 2, unit: 'tbsp' },
  ],
  steps: [{ text: 'Brown the beef.' }, { text: 'Bake.', timerMinutes: 45 }],
  nutrition: null,
  ...over,
});

describe('schema & migrations', () => {
  it('migrates to the latest version and is idempotent', async () => {
    const db = await createTestDatabase();
    await initDatabase(db);
    await initDatabase(db);
    const v = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version', []);
    expect(v?.user_version).toBe(SCHEMA_VERSION);
    for (const table of USER_TABLES) {
      expect(await db.getFirstAsync(`SELECT COUNT(*) AS n FROM ${table}`, [])).toEqual({ n: 0 });
    }
  });

  it('rejects invalid plan rows at the database level', async () => {
    const r = await setup();
    await expect(r.db.runAsync("INSERT INTO plan_entries (day, slot, recipe_id, custom_title, servings, position, created_at, updated_at) VALUES ('2026-11-16', 'brunch', 'x', NULL, 2, 0, '', '')", [])).rejects.toThrow();
    await expect(r.plan.add({ day: '2026-11-16', slot: 'dinner', recipeId: null, customTitle: '  ', servings: 2, note: null })).rejects.toThrow();
  });
});

describe('recipes repository', () => {
  it('creates, reads, updates and deletes personal recipes', async () => {
    const r = await setup();
    const id = await r.recipes.create(input(), new Date('2026-11-13T10:00:00Z'));
    expect(id).toMatch(/^u-/);
    const saved = await r.recipes.get(id);
    expect(saved).toMatchObject({ source: 'user', title: 'Family lasagna', servings: 4, ingredients: input().ingredients, steps: input().steps });
    await r.recipes.update(id, input({ title: 'Lasagna v2', servings: 6, nutrition: { kcal: 610, protein: 35, carbs: 50, fat: 28 } }));
    expect(await r.recipes.get(id)).toMatchObject({ title: 'Lasagna v2', servings: 6, nutrition: { kcal: 610 } });
    expect(await r.recipes.count()).toBe(1);

    // A planned meal keeps its name when the recipe is deleted.
    const entryId = await r.plan.add({ day: '2026-11-16', slot: 'dinner', recipeId: id, customTitle: null, servings: 4, note: null });
    await r.recipes.setFavorite(id, true);
    await r.recipes.remove(id);
    expect(await r.recipes.get(id)).toBeNull();
    expect(await r.recipes.favorites()).toEqual(new Set());
    expect(await r.plan.get(entryId)).toMatchObject({ recipeId: null, customTitle: 'Lasagna v2' });
  });

  it('stores favorites and a bounded history', async () => {
    const r = await setup();
    await r.recipes.setFavorite('di-beef-tacos', true);
    await r.recipes.setFavorite('di-beef-tacos', true);
    await r.recipes.setFavorite('bf-overnight-oats', true);
    await r.recipes.setFavorite('bf-overnight-oats', false);
    expect([...(await r.recipes.favorites())]).toEqual(['di-beef-tacos']);
    await r.recipes.logHistory('di-beef-tacos', 'viewed', new Date('2026-11-10T10:00:00Z'));
    await r.recipes.logHistory('di-beef-tacos', 'cooked', new Date('2026-11-11T10:00:00Z'));
    await r.recipes.logHistory('lu-minestrone', 'viewed', new Date('2026-11-12T10:00:00Z'));
    const recent = await r.recipes.recent();
    expect(recent.map((x) => x.recipeId)).toEqual(['lu-minestrone', 'di-beef-tacos']);
    expect(recent[1]?.cooked).toBe(1);
    expect((await r.recipes.cookedCounts()).get('di-beef-tacos')).toBe(1);
  });

  it('resolves bundled and personal recipes through the catalog', async () => {
    const r = await setup();
    const id = await r.recipes.create(input());
    expect((await getRecipe(id, 'en'))?.title).toBe('Family lasagna');
    expect((await getRecipe('lu-minestrone', 'fr'))?.source).toBe('builtin');
    expect(await getRecipe('nope', 'en')).toBeNull();
  });
});

describe('planner repository', () => {
  it('adds, moves, duplicates and marks meals cooked', async () => {
    const r = await setup();
    const a = await r.plan.add({ day: '2026-11-16', slot: 'dinner', recipeId: 'di-beef-tacos', customTitle: null, servings: 3, note: null });
    const b = await r.plan.add({ day: '2026-11-16', slot: 'dinner', recipeId: null, customTitle: 'Leftovers', servings: 1, note: null });
    expect((await r.plan.get(b))?.position).toBe(1);
    await r.plan.move(a, '2026-11-18', 'lunch');
    expect(await r.plan.get(a)).toMatchObject({ day: '2026-11-18', slot: 'lunch', position: 0 });
    const c = await r.plan.duplicate(a, '2026-11-19', 'dinner');
    expect(await r.plan.get(c!)).toMatchObject({ recipeId: 'di-beef-tacos', servings: 3 });
    await r.plan.setCooked(a, true, new Date('2026-11-18T12:00:00Z'));
    expect((await r.plan.cookedHistory()).map((e) => e.id)).toEqual([a]);
    await r.plan.update(a, { servings: 0, note: 'extra cheese' });
    expect(await r.plan.get(a)).toMatchObject({ servings: 1, note: 'extra cheese' });
    expect((await r.plan.week('2026-11-16')).length).toBe(3);
    expect(await r.plan.clearRange('2026-11-16', '2026-11-22')).toBe(3);
  });

  it('saves user templates', async () => {
    const r = await setup();
    const id = await r.templates.save({ name: 'My week', entries: [{ dayOffset: 0, slot: 'dinner', recipeId: 'di-beef-tacos' }] });
    expect(await r.templates.list()).toEqual([expect.objectContaining({ id, builtin: false, name: 'My week', entries: [expect.objectContaining({ recipeId: 'di-beef-tacos' })] })]);
    await r.templates.remove(id);
    expect(await r.templates.count()).toBe(0);
  });
});

describe('grocery lists', () => {
  it('generates a list from the plan, merging compatible ingredients and subtracting the pantry', async () => {
    const r = await setup();
    await r.plan.add({ day: '2026-11-16', slot: 'dinner', recipeId: 'di-beef-tacos', customTitle: null, servings: 4, note: null });
    await r.plan.add({ day: '2026-11-17', slot: 'dinner', recipeId: 'di-beef-bean-chili', customTitle: null, servings: 4, note: null });
    await r.plan.add({ day: '2026-11-18', slot: 'dinner', recipeId: null, customTitle: 'Dinner out', servings: 2, note: null });
    const { drafts, meals } = await draftsForRange('2026-11-16', '2026-11-22', { lng: 'en', system: 'metric', usePantry: false });
    expect(meals).toBe(2);
    // Both recipes use ground beef in grams: one merged line.
    expect(drafts.filter((d) => d.key === 'ground_beef')).toHaveLength(1);
    const keys = drafts.map((d) => `${d.key}|${d.unit}`);
    expect(new Set(keys).size).toBe(keys.length);

    await r.pantry.add({ key: 'onion', name: 'Onions', category: 'vegetables', quantity: 20, unit: 'pc', location: 'cupboard', expiresOn: null });
    const res = await generateGroceryList('2026-11-16', '2026-11-22', { lng: 'en', system: 'metric', usePantry: true, name: 'Week 47', refreshActive: false });
    const items = await r.grocery.items(res.listId);
    expect(items.find((i) => i.key === 'onion')).toBeUndefined();
    expect(items.length).toBe(res.items);
    expect((await r.grocery.active())?.name).toBe('Week 47');
  });

  it('adds manual items, merging only compatible units, and keeps edits on regeneration', async () => {
    const r = await setup();
    const listId = await r.grocery.createList('Test', { start: null, end: null }, [{ key: 'milk', name: 'Milk', category: 'dairy_eggs', quantity: 500, unit: 'ml', pantry: 'none' }]);
    expect(await r.grocery.addManual(listId, { key: 'milk', name: 'Milk', category: 'dairy_eggs', quantity: 1, unit: 'l' }, 'metric')).toMatchObject({ merged: true });
    expect(await r.grocery.addManual(listId, { key: 'milk', name: 'Milk', category: 'dairy_eggs', quantity: 2, unit: 'pc' }, 'metric')).toMatchObject({ merged: false });
    const soap = await r.grocery.addManual(listId, { key: 'custom:dish soap', name: 'Dish soap', category: 'household', quantity: 1, unit: 'pc' }, 'metric');
    let items = await r.grocery.items(listId);
    expect(items.find((i) => i.key === 'milk' && i.unit === 'l')?.quantity).toBe(1.5);
    expect(items.filter((i) => i.key === 'milk')).toHaveLength(2);

    const milk = items.find((i) => i.key === 'milk' && i.unit === 'l')!;
    await r.grocery.toggle(milk.id);
    await r.grocery.updateItem(milk.id, { price: 2.4 });
    await r.grocery.regenerate(listId, [{ key: 'milk', name: 'Milk', category: 'dairy_eggs', quantity: 750, unit: 'ml', pantry: 'none' }, { key: 'egg', name: 'Eggs', category: 'dairy_eggs', quantity: 6, unit: 'pc', pantry: 'none' }], { start: '2026-11-16', end: '2026-11-22' });
    items = await r.grocery.items(listId);
    expect(items.find((i) => i.id === soap.id)).toBeDefined(); // manual kept
    expect(items.find((i) => i.key === 'egg')).toBeDefined();
    expect(await r.grocery.item(soap.id)).toMatchObject({ manual: true, name: 'Dish soap' });
  });

  it('completes a list into an expense and can reuse it', async () => {
    const r = await setup();
    const listId = await r.grocery.createList('Saturday', { start: null, end: null }, [{ key: 'egg', name: 'Eggs', category: 'dairy_eggs', quantity: 12, unit: 'pc', pantry: 'none' }]);
    const [egg] = await r.grocery.items(listId);
    await r.grocery.toggle(egg!.id);
    expect(await r.grocery.removeChecked(listId)).toBe(1);
    await r.grocery.addManual(listId, { key: 'rice', name: 'Rice', category: 'pantry', quantity: 1, unit: 'kg', price: 2 }, 'metric');
    await r.grocery.complete(listId, 32.5, '2026-11-14');
    expect(await r.grocery.active()).toBeNull();
    expect(await r.budget.expenses('2026-11-01', '2026-11-30')).toEqual([expect.objectContaining({ amount: 32.5, listId })]);
    const again = await r.grocery.reuse(listId, 'Saturday (again)');
    expect((await r.grocery.items(again)).map((i) => [i.key, i.checked, i.price])).toEqual([['rice', false, 2]]);
    const summaries = await r.grocery.summaries();
    expect(summaries.map((s) => s.name)).toEqual(['Saturday (again)', 'Saturday']);
    await r.grocery.removeList(listId);
    expect(await r.grocery.items(listId)).toEqual([]); // cascade
  });
});

describe('pantry & budget repositories', () => {
  it('stores pantry items and hides consumed ones', async () => {
    const r = await setup();
    const id = await r.pantry.add({ key: 'greek_yogurt', name: 'Greek yogurt', category: 'dairy_eggs', quantity: 500, unit: 'g', location: 'fridge', expiresOn: '2026-11-15' });
    await r.pantry.add({ key: 'rice', name: 'Rice', category: 'pantry', quantity: null, unit: 'to_taste', location: 'cupboard', expiresOn: null });
    expect(await r.pantry.countActive()).toBe(2);
    await r.pantry.update(id, { key: 'greek_yogurt', name: 'Greek yogurt', category: 'dairy_eggs', quantity: 250, unit: 'g', location: 'fridge', expiresOn: '2026-11-16' });
    expect(await r.pantry.get(id)).toMatchObject({ quantity: 250, expiresOn: '2026-11-16' });
    await r.pantry.consume(id);
    expect((await r.pantry.active()).map((p) => p.key)).toEqual(['rice']);
    expect((await r.pantry.recentlyConsumed()).map((p) => p.id)).toEqual([id]);
  });

  it('stores prices, expenses and preferences', async () => {
    const r = await setup();
    await r.budget.setPrice({ key: 'rice', price: 2, quantity: 1, unit: 'kg' });
    await r.budget.setPrice({ key: 'rice', price: 2.5, quantity: 1, unit: 'kg' });
    expect((await r.budget.prices()).get('rice')?.price).toBe(2.5);
    const e = await r.budget.addExpense('2026-11-13', 12.3, '  Market ');
    expect(await r.budget.expenses('2026-11-13', '2026-11-13')).toEqual([{ id: e, day: '2026-11-13', amount: 12.3, note: 'Market', listId: null }]);
    await expect(r.budget.addExpense('2026-11-13', -1, null)).rejects.toThrow();
    await r.preferences.set('weeklyBudget', 120);
    expect(await r.preferences.get('weeklyBudget', null)).toBe(120);
    expect(await r.preferences.get('missing', 'fallback')).toBe('fallback');
  });
});

describe('backup, restore and deletion (offline data ownership)', () => {
  it('round-trips every user table and refuses foreign files', async () => {
    const r = await setup();
    const id = await r.recipes.create(input());
    await r.plan.add({ day: '2026-11-16', slot: 'dinner', recipeId: id, customTitle: null, servings: 4, note: null });
    const listId = await r.grocery.createList('L', { start: null, end: null }, [{ key: 'egg', name: 'Eggs', category: 'dairy_eggs', quantity: 6, unit: 'pc', pantry: 'none' }]);
    await r.pantry.add({ key: 'milk', name: 'Milk', category: 'dairy_eggs', quantity: 1, unit: 'l', location: 'fridge', expiresOn: '2026-11-20' });
    const { json, fileName } = await exportUserData(r.db, new Date('2026-11-13T10:00:00Z'));
    expect(fileName).toBe('mealwise-backup-2026-11-13.json');

    await deleteAllUserData(r.db);
    expect(await r.recipes.count()).toBe(0);
    expect(await r.grocery.items(listId)).toEqual([]);

    const restored = await importUserData(r.db, json);
    expect(restored.restoredRows).toBeGreaterThanOrEqual(5);
    expect((await r.recipes.get(id))?.title).toBe('Family lasagna');
    expect((await r.grocery.items(listId)).map((i) => i.key)).toEqual(['egg']);
    expect((await r.pantry.active())[0]?.expiresOn).toBe('2026-11-20');

    await expect(importUserData(r.db, '{nope')).rejects.toThrow();
    await expect(importUserData(r.db, JSON.stringify({ ...JSON.parse(json), appId: 'devspeak' }))).rejects.toThrow();
  });
});
