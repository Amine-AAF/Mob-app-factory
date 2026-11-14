import { aggregateIngredients, combineQuantities, estimateTotal, groupByCategory, listProgress, planRegeneration, subtractPantry, toGroceryDrafts, type MealForGrocery } from '@/domain/grocery';
import { categorize, customKey, keyForName, matchCatalogKey, normalizeName } from '@/domain/ingredients';

const meal = (recipeId: string, ingredients: MealForGrocery['ingredients'], baseServings = 2, servings = 2): MealForGrocery => ({ recipeId, baseServings, servings, ingredients });

describe('ingredient identity', () => {
  it('normalizes accents, case and simple plurals', () => {
    expect(normalizeName('Tomatoes')).toBe('tomato');
    expect(normalizeName('  Pâtes ')).toBe('pate');
    expect(normalizeName('Oignons (rouges)')).toBe('oignon');
    expect(normalizeName('Berries')).toBe('berry');
  });

  it('matches catalog names in every language', () => {
    expect(matchCatalogKey('onion')).toBe('onion');
    expect(matchCatalogKey('Oignons')).toBe('onion');
    expect(matchCatalogKey('cebollas')).toBe('onion');
    expect(matchCatalogKey('chickpeas')).toBe('chickpeas_canned');
    expect(matchCatalogKey('dragon fruit')).toBeNull();
  });

  it('keeps different ingredients apart (red onion is not onion)', () => {
    expect(keyForName('Red onion')).toBe('red_onion');
    expect(keyForName('Onion')).toBe('onion');
    expect(keyForName('Smoked tofu')).toBe(customKey('Smoked tofu'));
    expect(customKey('Smoked Tofu')).toBe(customKey('smoked tofu'));
  });

  it('categorizes free-text items by keywords without false positives', () => {
    expect(categorize('custom:x', 'Salmon steaks')).toBe('meat_fish');
    expect(categorize('custom:x', 'Oat milk')).toBe('dairy_eggs');
    expect(categorize('custom:x', 'Dish soap')).toBe('household');
    expect(categorize('custom:x', 'Thyme honey')).not.toBe('beverages'); // "the" (tea) must not match "thyme"
    expect(categorize('custom:x', 'Mystery item')).toBe('other');
    expect(categorize('onion')).toBe('vegetables');
  });
});

describe('grocery aggregation', () => {
  it('merges the same ingredient across recipes when units are compatible', () => {
    const lines = aggregateIngredients([
      meal('a', [{ key: 'flour', quantity: 200, unit: 'g' }]),
      meal('b', [{ key: 'flour', quantity: 0.5, unit: 'kg' }]),
    ]);
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({ key: 'flour', unit: 'g', quantity: 700, recipeIds: ['a', 'b'] });
  });

  it('never merges mass with volume', () => {
    const lines = aggregateIngredients([meal('a', [{ key: 'flour', quantity: 200, unit: 'g' }]), meal('b', [{ key: 'flour', quantity: 1, unit: 'cup' }])]);
    expect(lines).toHaveLength(2);
    expect(lines.map((l) => l.unit).sort()).toEqual(['g', 'ml']);
  });

  it('never merges different count units (cloves vs heads)', () => {
    const lines = aggregateIngredients([meal('a', [{ key: 'garlic', quantity: 2, unit: 'clove' }]), meal('b', [{ key: 'garlic', quantity: 1, unit: 'pc' }])]);
    expect(lines).toHaveLength(2);
  });

  it('never merges different ingredients', () => {
    const lines = aggregateIngredients([meal('a', [{ key: 'onion', quantity: 1, unit: 'pc' }]), meal('b', [{ key: 'red_onion', quantity: 1, unit: 'pc' }])]);
    expect(lines).toHaveLength(2);
  });

  it('scales by planned servings', () => {
    const lines = aggregateIngredients([meal('a', [{ key: 'rice', quantity: 150, unit: 'g' }], 2, 6)]);
    expect(lines[0]?.quantity).toBe(450);
  });

  it('keeps "to taste" once and drops it when the same ingredient is bought by quantity', () => {
    const lines = aggregateIngredients([
      meal('a', [{ key: 'parsley', quantity: null, unit: 'to_taste' }]),
      meal('b', [{ key: 'parsley', quantity: null, unit: 'to_taste' }]),
      meal('c', [
        { key: 'basil', quantity: null, unit: 'to_taste' },
        { key: 'cilantro', quantity: null, unit: 'to_taste' },
      ]),
      meal('d', [{ key: 'basil', quantity: 1, unit: 'bunch' }]),
    ]);
    expect(lines.filter((l) => l.key === 'parsley')).toHaveLength(1);
    expect(lines.filter((l) => l.key === 'basil')).toEqual([expect.objectContaining({ unit: 'bunch', quantity: 1 })]);
  });

  it('skips tap water and optional ingredients by default', () => {
    const lines = aggregateIngredients([meal('a', [{ key: 'water', quantity: 500, unit: 'ml' }, { key: 'chili_flakes', quantity: 1, unit: 'pinch', optional: true }, { key: 'egg', quantity: 2, unit: 'pc' }])]);
    expect(lines.map((l) => l.key)).toEqual(['egg']);
    expect(aggregateIngredients([meal('a', [{ key: 'chili_flakes', quantity: 1, unit: 'pinch', optional: true }])], { includeOptional: true })).toHaveLength(1);
  });

  it('keeps custom ingredients with their typed name', () => {
    const lines = aggregateIngredients([meal('a', [{ key: customKey('Gochujang'), name: 'Gochujang', quantity: 2, unit: 'tbsp' }])]);
    const drafts = toGroceryDrafts(lines, 'metric', 'en');
    // Spoons mean nothing in a shop: volumes are listed in ml (rounded up).
    expect(drafts[0]).toMatchObject({ name: 'Gochujang', unit: 'ml', quantity: 30 });
  });
});

describe('pantry subtraction', () => {
  const lines = () => aggregateIngredients([meal('a', [{ key: 'milk', quantity: 500, unit: 'ml' }, { key: 'egg', quantity: 4, unit: 'pc' }, { key: 'flour', quantity: 300, unit: 'g' }, { key: 'salt', quantity: null, unit: 'to_taste' }])]);

  it('subtracts compatible stock and marks covered lines', () => {
    const out = subtractPantry(lines(), [
      { key: 'milk', quantity: 1, unit: 'l' },
      { key: 'egg', quantity: 1, unit: 'pc' },
      { key: 'salt', quantity: null, unit: 'to_taste' },
    ]);
    expect(out.find((l) => l.key === 'milk')).toMatchObject({ pantry: 'covered', quantity: 0 });
    expect(out.find((l) => l.key === 'egg')).toMatchObject({ pantry: 'partial', quantity: 3 });
    expect(out.find((l) => l.key === 'salt')?.pantry).toBe('covered');
    expect(out.find((l) => l.key === 'flour')?.pantry).toBe('none');
  });

  it('does not subtract incompatible units, only flags them', () => {
    const out = subtractPantry(lines(), [{ key: 'flour', quantity: 2, unit: 'cup' }]);
    expect(out.find((l) => l.key === 'flour')).toMatchObject({ pantry: 'unknown', quantity: 300 });
  });

  it('drops covered lines from shopping drafts and rounds up the rest', () => {
    const drafts = toGroceryDrafts(subtractPantry(lines(), [{ key: 'milk', quantity: 600, unit: 'ml' }]), 'metric', 'en');
    expect(drafts.find((d) => d.key === 'milk')).toBeUndefined();
    expect(drafts.find((d) => d.key === 'flour')).toMatchObject({ quantity: 300, unit: 'g' });
  });
});

describe('shopping drafts', () => {
  it('converts to imperial for US users and rounds up counts', () => {
    const lines = aggregateIngredients([meal('a', [{ key: 'chicken_breast', quantity: 600, unit: 'g' }, { key: 'onion', quantity: 1.5, unit: 'pc' }, { key: 'milk', quantity: 300, unit: 'ml' }])]);
    const drafts = toGroceryDrafts(lines, 'imperial', 'en');
    expect(drafts.find((d) => d.key === 'chicken_breast')).toMatchObject({ unit: 'lb', quantity: 1.5 });
    expect(drafts.find((d) => d.key === 'onion')).toMatchObject({ unit: 'pc', quantity: 2 });
    expect(drafts.find((d) => d.key === 'milk')?.unit).toBe('cup');
  });

  it('names catalog items in the user language', () => {
    const lines = aggregateIngredients([meal('a', [{ key: 'egg', quantity: 2, unit: 'pc' }])]);
    expect(toGroceryDrafts(lines, 'metric', 'fr')[0]?.name).toBe('Œufs');
    expect(toGroceryDrafts(lines, 'metric', 'es')[0]?.name).toBe('Huevos');
  });
});

describe('list helpers', () => {
  it('combines manual quantities only when compatible', () => {
    expect(combineQuantities({ quantity: 500, unit: 'ml' }, { quantity: 1, unit: 'l' }, 'metric')).toEqual({ quantity: 1.5, unit: 'l' });
    expect(combineQuantities({ quantity: 2, unit: 'pc' }, { quantity: 3, unit: 'pc' }, 'metric')).toEqual({ quantity: 5, unit: 'pc' });
    expect(combineQuantities({ quantity: 200, unit: 'g' }, { quantity: 1, unit: 'cup' }, 'metric')).toBeNull();
    expect(combineQuantities({ quantity: null, unit: 'to_taste' }, { quantity: 1, unit: 'pc' }, 'metric')).toBeNull();
  });

  it('regeneration keeps manual items and matching generated items', () => {
    const plan = planRegeneration(
      [
        { id: 1, key: 'egg', unit: 'pc', checked: true, price: 3, manual: false, note: null },
        { id: 2, key: 'milk', unit: 'ml', checked: false, price: null, manual: false, note: null },
        { id: 3, key: 'custom:dish soap', unit: 'pc', checked: false, price: null, manual: true, note: null },
      ],
      [
        { key: 'egg', name: 'Eggs', category: 'dairy_eggs', quantity: 6, unit: 'pc', pantry: 'none' },
        { key: 'rice', name: 'Rice', category: 'pantry', quantity: 500, unit: 'g', pantry: 'none' },
      ],
    );
    expect(plan.update).toEqual([{ id: 1, draft: expect.objectContaining({ key: 'egg', quantity: 6 }) }]);
    expect(plan.insert.map((d) => d.key)).toEqual(['rice']);
    expect(plan.remove).toEqual([2]);
  });

  it('groups by aisle with unchecked items first', () => {
    const sections = groupByCategory([
      { category: 'fruits', checked: true, name: 'Apples' },
      { category: 'vegetables', checked: false, name: 'Carrots' },
      { category: 'fruits', checked: false, name: 'Bananas' },
    ]);
    expect(sections.map((s) => s.category)).toEqual(['vegetables', 'fruits']);
    expect(sections[1]?.items.map((i) => i.name)).toEqual(['Bananas', 'Apples']);
  });

  it('computes progress and totals with partial prices', () => {
    expect(listProgress([{ checked: true }, { checked: false }])).toEqual({ done: 1, total: 2, ratio: 0.5 });
    expect(listProgress([])).toEqual({ done: 0, total: 0, ratio: 0 });
    expect(estimateTotal([{ price: 1.1 }, { price: 2.2 }, { price: null }])).toEqual({ total: 3.3, priced: 2, count: 3 });
  });
});
