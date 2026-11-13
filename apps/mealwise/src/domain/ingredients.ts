import { catalogIngredient, INGREDIENTS } from '@/content/ingredients';

import type { AppLanguage, GroceryCategory } from './types';

/**
 * Ingredient identity: two lines are "the same ingredient" only when they have
 * the same key. Catalog ingredients have stable keys; free-text ingredients get
 * "custom:<normalized name>", so "Red onion" and "Onion" stay different, while
 * "Tomatoes" and "tomato" are the same.
 */
export const CUSTOM_PREFIX = 'custom:';

function stripAccents(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function singular(word: string): string {
  if (word.length <= 3) return word;
  if (word.endsWith('oes') && word.length > 4) return word.slice(0, -2); // tomatoes -> tomato
  if (word.endsWith('ies') && word.length > 4) return `${word.slice(0, -3)}y`; // berries -> berry
  if (word.endsWith('ss')) return word;
  if (word.endsWith('s') || word.endsWith('x')) return word.slice(0, -1); // oignons, choux
  return word;
}

/** Lowercase, accent-free, singular, punctuation-free form used for matching. */
export function normalizeName(name: string): string {
  return stripAccents(name.toLowerCase())
    .replace(/\(.*?\)/g, ' ')
    .replace(/[’']/g, ' ')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map(singular)
    .join(' ');
}

export function customKey(name: string): string {
  return `${CUSTOM_PREFIX}${normalizeName(name)}`;
}

export function isCustomKey(key: string): boolean {
  return key.startsWith(CUSTOM_PREFIX);
}

/** Everyday short names people type, mapped to catalog keys (en / fr / es). */
const ALIASES: Record<string, string> = {
  chickpeas: 'chickpeas_canned', 'pois chiches': 'chickpeas_canned', garbanzos: 'chickpeas_canned',
  'black beans': 'black_beans_canned', 'kidney beans': 'kidney_beans_canned', 'red beans': 'kidney_beans_canned', 'white beans': 'white_beans_canned',
  tuna: 'tuna_canned', thon: 'tuna_canned', atun: 'tuna_canned',
  corn: 'canned_corn', sweetcorn: 'canned_corn', mais: 'canned_corn', maiz: 'canned_corn',
  'garlic clove': 'garlic', "gousse d'ail": 'garlic', 'diente de ajo': 'garlic',
  'all-purpose flour': 'flour', 'plain flour': 'flour', farine: 'flour', harina: 'flour',
  oats: 'rolled_oats', 'flocons d avoine': 'rolled_oats', avena: 'rolled_oats',
  'chopped tomatoes': 'canned_tomatoes', 'tomates concassees': 'canned_tomatoes',
  cream: 'heavy_cream', creme: 'heavy_cream', nata: 'heavy_cream',
  yogurt: 'plain_yogurt', yoghurt: 'plain_yogurt', yaourt: 'plain_yogurt', yogur: 'plain_yogurt',
  pepper: 'black_pepper', poivre: 'black_pepper', pimienta: 'black_pepper',
  oil: 'vegetable_oil', huile: 'vegetable_oil', aceite: 'vegetable_oil',
  stock: 'vegetable_broth', broth: 'vegetable_broth', bouillon: 'vegetable_broth', caldo: 'vegetable_broth',
  noodles: 'egg_noodles', scallion: 'spring_onion', 'green onion': 'spring_onion', coriander: 'cilantro',
  courgette: 'zucchini', aubergine: 'eggplant', capsicum: 'bell_pepper', prawns: 'shrimp', 'minced beef': 'ground_beef',
};

const NAME_INDEX: Map<string, string> = (() => {
  const map = new Map<string, string>();
  for (const ing of INGREDIENTS) {
    for (const name of Object.values(ing.name)) {
      const n = normalizeName(name);
      if (!map.has(n)) map.set(n, ing.key);
    }
    map.set(normalizeName(ing.key.replace(/_/g, ' ')), ing.key);
  }
  for (const [alias, key] of Object.entries(ALIASES)) map.set(normalizeName(alias), key);
  return map;
})();

/** Finds the catalog key for a typed name, in any supported language. */
export function matchCatalogKey(name: string): string | null {
  const n = normalizeName(name);
  if (!n) return null;
  return NAME_INDEX.get(n) ?? null;
}

/** Resolves a free-text name to a key: catalog key when recognised, custom key otherwise. */
export function keyForName(name: string): string {
  return matchCatalogKey(name) ?? customKey(name);
}

/** Display name of an ingredient key in a language (custom keys use the stored name). */
export function ingredientName(key: string, lng: AppLanguage, fallback?: string | null): string {
  const c = catalogIngredient(key);
  if (c) return c.name[lng];
  if (fallback && fallback.trim()) return fallback.trim();
  const raw = isCustomKey(key) ? key.slice(CUSTOM_PREFIX.length) : key;
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

/** Keyword heuristics for free-text items (en / fr / es, accent-free, singular). */
const CATEGORY_KEYWORDS: [GroceryCategory, string[]][] = [
  ['frozen', ['frozen', 'surgele', 'congelado', 'ice cream', 'glace', 'helado']],
  ['beverages', ['juice', 'jus', 'zumo', 'soda', 'water', 'eau', 'agua', 'coffee', 'cafe', 'tea', 'the', 'beer', 'biere', 'cerveza', 'wine', 'vin', 'vino', 'drink', 'boisson', 'bebida']],
  ['household', ['soap', 'savon', 'jabon', 'paper', 'papier', 'papel', 'detergent', 'sponge', 'eponge', 'esponja', 'foil', 'trash bag', 'sac poubelle', 'bolsa de basura', 'tissue', 'mouchoir']],
  ['meat_fish', ['chicken', 'poulet', 'pollo', 'beef', 'boeuf', 'ternera', 'pork', 'porc', 'cerdo', 'lamb', 'agneau', 'cordero', 'turkey', 'dinde', 'pavo', 'fish', 'poisson', 'pescado', 'salmon', 'saumon', 'tuna', 'thon', 'atun', 'shrimp', 'crevette', 'gamba', 'sausage', 'saucisse', 'salchicha', 'ham', 'jambon', 'jamon', 'bacon', 'steak', 'meat', 'viande', 'carne']],
  ['dairy_eggs', ['milk', 'lait', 'leche', 'cheese', 'fromage', 'queso', 'yogurt', 'yaourt', 'yogur', 'butter', 'beurre', 'mantequilla', 'cream', 'creme', 'nata', 'egg', 'oeuf', 'huevo', 'tofu']],
  ['bakery', ['bread', 'pain', 'pan', 'bun', 'baguette', 'tortilla', 'croissant', 'bagel', 'pita', 'brioche']],
  ['fruits', ['apple', 'pomme', 'manzana', 'banana', 'banane', 'platano', 'orange', 'naranja', 'lemon', 'citron', 'limon', 'berry', 'fraise', 'fresa', 'grape', 'raisin', 'uva', 'melon', 'peach', 'peche', 'melocoton', 'pear', 'poire', 'pera', 'mango', 'mangue', 'kiwi', 'cherry', 'cerise', 'cereza', 'fruit', 'fruta']],
  ['vegetables', ['onion', 'oignon', 'cebolla', 'garlic', 'ail', 'ajo', 'tomato', 'tomate', 'potato', 'pomme de terre', 'patata', 'carrot', 'carotte', 'zanahoria', 'lettuce', 'laitue', 'lechuga', 'salad', 'salade', 'ensalada', 'pepper', 'poivron', 'pimiento', 'cucumber', 'concombre', 'pepino', 'spinach', 'epinard', 'espinaca', 'cabbage', 'chou', 'col', 'mushroom', 'champignon', 'champinon', 'zucchini', 'courgette', 'calabacin', 'herb', 'herbe', 'hierba', 'vegetable', 'legume', 'verdura', 'leek', 'poireau', 'puerro']],
  ['spices_condiments', ['salt', 'sel', 'sal', 'spice', 'epice', 'especia', 'sauce', 'salsa', 'mustard', 'moutarde', 'mostaza', 'ketchup', 'mayo', 'vinegar', 'vinaigre', 'vinagre', 'paprika', 'pimenton', 'cumin', 'comino', 'curry', 'cinnamon', 'cannelle', 'canela']],
  ['pantry', ['rice', 'riz', 'arroz', 'pasta', 'pate', 'flour', 'farine', 'harina', 'sugar', 'sucre', 'azucar', 'oil', 'huile', 'aceite', 'bean', 'haricot', 'alubia', 'lentil', 'lentille', 'lenteja', 'can', 'boite', 'lata', 'cereal', 'oat', 'avoine', 'avena', 'nut', 'noix', 'nuez', 'chocolate', 'chocolat', 'honey', 'miel', 'jam', 'confiture', 'mermelada', 'coffee bean', 'stock', 'bouillon', 'caldo', 'noodle', 'nouille', 'fideo']],
];

/** Category for a key: catalog category, else keyword guess, else "other". */
export function categorize(key: string, name?: string | null): GroceryCategory {
  const c = catalogIngredient(key);
  if (c) return c.category;
  const n = ` ${normalizeName(name ?? (isCustomKey(key) ? key.slice(CUSTOM_PREFIX.length) : key))} `;
  for (const [category, words] of CATEGORY_KEYWORDS) {
    // Short words must match a whole word ("sal" must not match "salad"); longer ones may prefix-match.
    if (words.some((w) => n.includes(` ${w} `) || (w.length >= 4 && n.includes(` ${w}`)))) return category;
  }
  return 'other';
}

export function isStaple(key: string): boolean {
  return catalogIngredient(key)?.staple === true;
}

export function isNoShopping(key: string): boolean {
  return catalogIngredient(key)?.noShopping === true;
}
