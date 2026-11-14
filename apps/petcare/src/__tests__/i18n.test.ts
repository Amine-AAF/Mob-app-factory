import { basePluralKey, flattenKeys } from '@factory/localization';
import fs from 'fs';
import path from 'path';

import { fmt, initI18n, resources } from '@/i18n';

const keysOf = (obj: unknown) => flattenKeys(obj).sort();
const get = (obj: unknown, key: string): unknown => key.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], obj);
const placeholders = (s: string) => (s.match(/{{\s*\w+\s*}}/g) ?? []).sort();

function sourceFiles(): string[] {
  const roots = [path.join(__dirname, '..', '..', 'app'), path.join(__dirname, '..')];
  const files: string[] = [];
  const walk = (dir: string) =>
    fs.readdirSync(dir, { withFileTypes: true }).forEach((e) => {
      const p = path.join(dir, e.name);
      if (e.isDirectory() && e.name !== '__tests__') walk(p);
      else if (/\.tsx?$/.test(e.name)) files.push(p);
    });
  roots.forEach(walk);
  return files;
}

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
      expect(placeholders(target)).toEqual(placeholders(source));
    }
  });

  it.each(['fr', 'es'] as const)('%s is actually translated (not an English copy)', (lng) => {
    const identical = en.filter((k) => get(resources.en, k) === get(resources[lng], k));
    expect(identical.length / en.length).toBeLessThan(0.15);
  });

  it('every literal translation key used in the code exists', () => {
    const known = new Set(en.map(basePluralKey));
    const missing: string[] = [];
    const pattern = /(?:\bt\(\s*|(?:label|title|newTitle|help|placeholder|titleKey|bodyKey): )'([a-zA-Z]+\.[a-zA-Z0-9_.]+)'/g;
    for (const f of sourceFiles()) {
      for (const m of fs.readFileSync(f, 'utf8').matchAll(pattern)) if (!known.has(m[1]!)) missing.push(`${path.basename(f)}: ${m[1]}`);
    }
    expect(missing).toEqual([]);
  });

  it('formats plurals and interpolation in every language', async () => {
    const i18n = await initI18n('fr', []);
    expect(i18n.t('home.dueIn', { count: 1 })).toBe('Dans 1 jour');
    expect(i18n.t('home.dueIn', { count: 3 })).toBe('Dans 3 jours');
    await i18n.changeLanguage('es');
    expect(i18n.t('home.dueIn', { count: 3 })).toBe('En 3 días');
    expect(i18n.t('does.not.exist')).toBe('does.not.exist');
  });

  it('uses English by default and falls back to the device language', async () => {
    expect((await initI18n(null, [])).language).toBe('en');
    expect((await initI18n(null, ['es-MX'])).language).toBe('es');
    expect((await initI18n(null, ['de-DE'])).language).toBe('en');
    expect((await initI18n('fr', ['es-ES'])).language).toBe('fr');
  });

  it('formats dates, currencies and weights per locale without shifting days', async () => {
    await initI18n('fr', [], 'fr-FR');
    expect(fmt.day('2026-01-01', { dateStyle: 'long' })).toBe('1 janvier 2026');
    expect(fmt.money(12.5, 'EUR').replace(/\s/g, ' ')).toBe('12,50 €');
    expect(fmt.weight(10, 'lb')).toBe('22,05 lb');
    await initI18n('en', [], 'en-US');
    expect(fmt.day('2026-01-01', { dateStyle: 'long' })).toBe('January 1, 2026');
    expect(fmt.money(12.5, 'USD')).toBe('$12.50');
    // An unknown currency code never crashes the UI.
    expect(fmt.money(3, 'XYZ1')).toContain('3');
  });
});
