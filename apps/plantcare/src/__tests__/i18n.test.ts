import { basePluralKey, flattenKeys } from '@factory/localization';
import fs from 'fs';
import path from 'path';

import { SPECIES } from '@/content/species';
import { HEALTH_GUIDE } from '@/content/healthGuide';
import { BUILT_IN_SEASONAL } from '@/domain/seasons';
import { FERTILIZER_TYPES, HEALTH_CATEGORIES, JOURNAL_KINDS, LOCATION_TYPES, PLANT_CATEGORIES, SUBSTRATES, TASK_TYPES } from '@/domain/types';
import { fmt, initI18n, resources } from '@/i18n';

const keysOf = (obj: unknown) => flattenKeys(obj).sort();
const get = (obj: unknown, key: string): unknown => key.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], obj);
const placeholders = (s: string) => (s.match(/{{\s*\w+\s*}}/g) ?? []).sort();
const has = (key: string) => typeof get(resources.en, key) === 'string';

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
      expect([key, placeholders(target)]).toEqual([key, placeholders(source)]);
    }
  });

  it.each(['fr', 'es'] as const)('%s is actually translated (not an English copy)', (lng) => {
    const identical = en.filter((k) => get(resources.en, k) === get(resources[lng], k));
    expect(identical.length / en.length).toBeLessThan(0.12);
  });

  it('every static translation key used in the code exists in English', () => {
    const roots = [path.join(__dirname, '..', '..', 'app'), path.join(__dirname, '..')];
    const files: string[] = [];
    const walk = (dir: string) =>
      fs.readdirSync(dir, { withFileTypes: true }).forEach((e) => {
        const p = path.join(dir, e.name);
        if (e.isDirectory() && e.name !== '__tests__') walk(p);
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

  it('every enum value used through dynamic keys has a translation', () => {
    const missing: string[] = [];
    const need = (k: string) => {
      if (!has(k)) missing.push(k);
    };
    PLANT_CATEGORIES.forEach((c) => need(`categories.${c}`));
    TASK_TYPES.forEach((x) => {
      need(`taskTypes.${x}`);
      need(`notifications.single.${x}`);
    });
    LOCATION_TYPES.forEach((x) => need(`locationTypes.${x}`));
    JOURNAL_KINDS.forEach((x) => need(`journalKinds.${x}`));
    HEALTH_CATEGORIES.forEach((x) => need(`healthCategories.${x}`));
    FERTILIZER_TYPES.forEach((x) => need(`fertilizerTypes.${x}`));
    SUBSTRATES.forEach((x) => need(`substrates.${x}`));
    Object.values(BUILT_IN_SEASONAL)
      .flat()
      .forEach((k) => need(`seasonal.items.${k}`));
    Object.values(HEALTH_GUIDE).forEach((g) => {
      g.causes.forEach((c) => {
        need(`healthGuide.causes.${c}.title`);
        need(`healthGuide.causes.${c}.body`);
      });
      g.checks.forEach((c) => need(`healthGuide.checks.${c}`));
    });
    for (const s of SPECIES) {
      s.light.forEach((l) => need(`light.${l}`));
      s.soil.forEach((x) => need(`soilTypes.${x}`));
      s.origin.forEach((o) => need(`regions.${o}`));
      need(`water.${s.water}`);
      need(`waterHint.${s.water}`);
      need(`humidity.${s.humidity}`);
      need(`difficulty.${s.difficulty}`);
      need(`placement.${s.placement}`);
      need(`pets.${s.pets}`);
      need(`pets.${s.pets}Body`);
    }
    expect([...new Set(missing)]).toEqual([]);
  });

  it('formats plurals and keeps scientific names identical in every language', async () => {
    const i18n = await initI18n('fr', []);
    expect(i18n.t('tasks.everyDays', { count: 3 })).toBe('Tous les 3 jours');
    expect(i18n.t('tasks.everyDays', { count: 1 })).toBe('Tous les jours');
    await i18n.changeLanguage('es');
    expect(i18n.t('calendar.tasksCount', { count: 0 })).toBe('Sin tareas');
    await i18n.changeLanguage('en');
    expect(i18n.t('growth.leaves', { count: 2 })).toBe('2 leaves');
    for (const s of SPECIES) expect(s.scientificName).not.toMatch(/[{}]/);
  });

  it('resolves the language from device locales and falls back to English', async () => {
    expect((await initI18n(null, ['es-MX'])).language).toBe('es');
    expect((await initI18n(null, ['de-DE'])).language).toBe('en');
    expect((await initI18n('fr', ['es-ES'])).language).toBe('fr');
  });

  it('formats dates with the regional order', async () => {
    await initI18n('fr', []);
    expect(fmt.day('2026-05-10', { day: 'numeric', month: 'numeric', year: 'numeric' })).toBe('10/05/2026');
    await initI18n('en', []);
    expect(fmt.day('2026-05-10', { day: 'numeric', month: 'numeric', year: 'numeric' })).toBe('5/10/2026');
  });
});
