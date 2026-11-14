import { basePluralKey, flattenKeys } from '@factory/localization';
import fs from 'fs';
import path from 'path';

import { INGREDIENTS } from '@/content/ingredients';
import { BUILTIN_TEMPLATES } from '@/content/templates';
import { displayQuantity } from '@/domain/quantity';
import { GROCERY_CATEGORIES, MEAL_SLOTS, RECIPE_CATEGORIES, RECIPE_TAGS, UNIT_IDS } from '@/domain/types';
import { initI18n, resources } from '@/i18n';

const keysOf = (obj: unknown) => flattenKeys(obj).sort();
const get = (obj: unknown, key: string): unknown => key.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], obj);
const placeholders = (s: string) => (s.match(/{{\s*\w+\s*}}/g) ?? []).sort();

describe('localization resources', () => {
  const en = keysOf(resources.en);

  it.each(['fr', 'es'] as const)('%s has exactly the same keys as English', (lng) => {
    expect(keysOf(resources[lng])).toEqual(en);
  });

  it.each(['fr', 'es'] as const)('%s keeps every placeholder and has no empty value', (lng) => {
    for (const key of en) {
      const source = get(resources.en, key) as string;
      const target = get(resources[lng], key) as string;
      expect(typeof target).toBe('string');
      expect(target.trim().length).toBeGreaterThan(0);
      expect({ key, p: placeholders(target) }).toEqual({ key, p: placeholders(source) });
    }
  });

  it.each(['fr', 'es'] as const)('%s is actually translated (not an English copy)', (lng) => {
    const identical = en.filter((k) => get(resources.en, k) === get(resources[lng], k));
    expect(identical.length / en.length).toBeLessThan(0.1);
  });

  it('every literal translation key used in the code exists', () => {
    const roots = [path.join(__dirname, '..', '..', 'app'), path.join(__dirname, '..')];
    const files: string[] = [];
    const walk = (dir: string) =>
      fs.readdirSync(dir, { withFileTypes: true }).forEach((e) => {
        const p = path.join(dir, e.name);
        if (e.isDirectory() && e.name !== '__tests__' && e.name !== 'recipes') walk(p);
        else if (/\.(tsx?)$/.test(e.name)) files.push(p);
      });
    roots.forEach(walk);
    const known = new Set(en.map(basePluralKey));
    const missing: string[] = [];
    for (const f of files) {
      const src = fs.readFileSync(f, 'utf8');
      for (const m of src.matchAll(/\bt\(\s*'([a-zA-Z]+\.[a-zA-Z0-9_.]+)'/g)) {
        if (!known.has(m[1]!)) missing.push(`${path.basename(f)}: ${m[1]}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('covers every dynamic key family (slots, categories, tags, units, aisles, templates)', () => {
    const known = new Set(en.map(basePluralKey));
    const expected = [
      ...MEAL_SLOTS.flatMap((s) => [`slots.${s}`, `slotsShort.${s}`]),
      ...RECIPE_CATEGORIES.map((c) => `categories.${c}`),
      ...RECIPE_TAGS.map((t) => `tags.${t}`),
      ...UNIT_IDS.flatMap((u) => [`units.${u}`, `unitsShort.${u}`]),
      ...GROCERY_CATEGORIES.map((c) => `groceryCategories.${c}`),
      ...BUILTIN_TEMPLATES.flatMap((t) => [`templates.builtin.${t.id}.name`, `templates.builtin.${t.id}.description`]),
      ...['move', 'duplicate', 'copyDay'].flatMap((a) => [`planner.${a}Hint`, `planner.${a}Action`]),
      ...['morning', 'afternoon', 'evening'].map((g) => `home.${g}`),
    ];
    expect(expected.filter((k) => !known.has(k))).toEqual([]);
  });

  it('formats unit labels with plurals in every language', async () => {
    const i18n = await initI18n('en', []);
    const label = (q: number, unit: (typeof UNIT_IDS)[number], lng: 'en' | 'fr' | 'es') => {
      const d = displayQuantity(q, unit, { system: 'metric', lng, keepOriginalUnits: true });
      return i18n.t(`units.${d.unit}`, { count: d.value ?? 0, amount: d.amount, lng });
    };
    expect(label(1, 'cup', 'en')).toBe('1 cup');
    expect(label(2, 'cup', 'en')).toBe('2 cups');
    expect(label(1.5, 'cup', 'en')).toBe('1½ cups');
    expect(label(2, 'clove', 'fr')).toMatch(/^2 gousses?/);
    expect(label(2, 'clove', 'es')).toMatch(/^2 dientes?/);
    expect(label(250, 'g', 'fr')).toBe('250 g');
    expect(i18n.t('units.to_taste', { lng: 'es' })).not.toBe('to taste');
  });

  it('ingredient names exist in every language', () => {
    for (const i of INGREDIENTS) for (const l of ['en', 'fr', 'es'] as const) expect(i.name[l].length).toBeGreaterThan(0);
  });

  it('resolves the device language with English as fallback', async () => {
    expect((await initI18n(null, ['fr-CA'])).language).toBe('fr');
    expect((await initI18n(null, ['de-DE'])).language).toBe('en');
    expect((await initI18n('es', ['fr-FR'])).language).toBe('es');
  });
});
