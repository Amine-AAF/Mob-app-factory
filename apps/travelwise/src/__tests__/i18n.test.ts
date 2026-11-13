import { basePluralKey, flattenKeys } from '@factory/localization';
import fs from 'fs';
import path from 'path';

import { ACTIVITY_CATEGORIES, BOOKING_TYPES, BUDGET_CATEGORIES, DOCUMENT_TYPES, PACKING_CATEGORIES, PLACE_CATEGORIES, TRIP_STATUSES, TRIP_TYPES, WEATHER_CONDITIONS } from '@/constants/domain';
import { fmt, initI18n, resources } from '@/i18n';

const get = (obj: unknown, key: string): unknown => key.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], obj);
const placeholders = (s: string) => (s.match(/{{\s*\w+\s*}}/g) ?? []).sort();
/** Plural forms differ by language (fr/es also have "_many"); compare base keys. */
const baseKeys = (obj: unknown) => [...new Set(flattenKeys(obj).map(basePluralKey))].sort();
const en = flattenKeys(resources.en);

describe('localization resources', () => {
  it.each(['fr', 'es'] as const)('%s has the same keys as English', (lng) => {
    expect(baseKeys(resources[lng])).toEqual(baseKeys(resources.en));
  });

  it.each(['fr', 'es'] as const)('%s has every plural form CLDR needs (one, many, other)', (lng) => {
    const plurals = en.filter((k) => k.endsWith('_other')).map((k) => k.slice(0, -'_other'.length));
    for (const base of plurals) for (const form of ['one', 'many', 'other']) expect([base, typeof get(resources[lng], `${base}_${form}`)]).toEqual([base, 'string']);
  });

  it.each(['fr', 'es'] as const)('%s keeps every placeholder and has no empty value', (lng) => {
    for (const key of en) {
      const target = (get(resources[lng], key) ?? get(resources[lng], key.replace(/_one$|_other$/, '_other'))) as string;
      expect(typeof target).toBe('string');
      expect(target.trim().length).toBeGreaterThan(0);
      expect(placeholders(target)).toEqual(placeholders(get(resources.en, key) as string));
    }
  });

  it.each(['fr', 'es'] as const)('%s is actually translated (not an English copy)', (lng) => {
    const identical = en.filter((k) => get(resources.en, k) === get(resources[lng], k));
    expect(identical.length / en.length).toBeLessThan(0.12);
  });

  it('has a label for every stored enum value', () => {
    const groups: [string, readonly string[]][] = [
      ['tripType', TRIP_TYPES],
      ['tripStatus', TRIP_STATUSES],
      ['activityCategory', ACTIVITY_CATEGORIES],
      ['bookingType', BOOKING_TYPES],
      ['documentType', DOCUMENT_TYPES],
      ['budgetCategory', BUDGET_CATEGORIES],
      ['packingCategory', PACKING_CATEGORIES],
      ['placeCategory', PLACE_CATEGORIES],
      ['weather', WEATHER_CONDITIONS],
    ];
    for (const lng of ['en', 'fr', 'es'] as const) {
      for (const [group, values] of groups) for (const v of values) expect([lng, group, v, typeof get(resources[lng], `enums.${group}.${v}`)]).toEqual([lng, group, v, 'string']);
    }
  });

  it('every literal translation key used in the code exists in English', () => {
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
      for (const m of src.matchAll(/\bt\(\s*'([a-zA-Z]+\.[a-zA-Z0-9_.]+)'/g)) if (!known.has(m[1]!)) missing.push(`${path.basename(f)}: ${m[1]}`);
    }
    expect(missing).toEqual([]);
  });
});

describe('runtime i18n', () => {
  it('formats plurals in every language', async () => {
    const i18n = await initI18n('fr', []);
    expect(i18n.t('common.nights', { count: 1 })).toBe('1 nuit');
    expect(i18n.t('common.nights', { count: 7 })).toBe('7 nuits');
    expect(i18n.t('common.nights', { count: 1000000 })).toContain('nuits');
    await i18n.changeLanguage('es');
    expect(i18n.t('tripCard.daysToGo', { count: 1 })).toBe('Falta 1 día');
    await i18n.changeLanguage('en');
    expect(i18n.t('tripCard.daysToGo', { count: 3 })).toBe('3 days to go');
  });

  it('falls back to the device language, then English', async () => {
    expect((await initI18n(null, ['es-ES'])).language).toBe('es');
    expect((await initI18n(null, ['de-DE'])).language).toBe('en');
    expect((await initI18n('fr', ['es'])).language).toBe('fr');
  });

  it('formats calendar dates the same day whatever the time zone, per language', async () => {
    await initI18n('en', []);
    expect(fmt.date('2026-07-30')).toBe('Jul 30, 2026');
    await initI18n('fr', []);
    expect(fmt.date('2026-07-30')).toMatch(/30 juil\.? 2026/);
    await initI18n('es', []);
    expect(fmt.date('2026-12-31')).toMatch(/31 dic\.? 2026/);
    expect(fmt.date('not-a-date')).toBe('not-a-date');
  });
});
