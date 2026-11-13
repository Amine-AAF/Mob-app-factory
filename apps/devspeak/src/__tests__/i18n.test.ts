import { basePluralKey, flattenKeys } from '@factory/localization';
import fs from 'fs';
import path from 'path';

import { initI18n, resources } from '@/i18n';
import { resolveTranslationLanguage } from '@/store/preferences';

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
      expect(placeholders(target)).toEqual(placeholders(source));
    }
  });

  it.each(['fr', 'es'] as const)('%s is actually translated (not an English copy)', (lng) => {
    const identical = en.filter((k) => get(resources.en, k) === get(resources[lng], k));
    // Brand names, numbers and a few loanwords may legitimately be identical.
    expect(identical.length / en.length).toBeLessThan(0.15);
  });

  it('every translation key used in the code exists in English', () => {
    const roots = [path.join(__dirname, '..', '..', 'app'), path.join(__dirname, '..')];
    const files: string[] = [];
    const walk = (dir: string) =>
      fs.readdirSync(dir, { withFileTypes: true }).forEach((e) => {
        const p = path.join(dir, e.name);
        if (e.isDirectory() && e.name !== '__tests__' && e.name !== 'data') walk(p);
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

  it('formats plurals in every language', async () => {
    const i18n = await initI18n('fr', []);
    expect(i18n.t('common.minutes', { count: 1 })).toContain('1');
    await i18n.changeLanguage('es');
    expect(i18n.t('home.streak', { count: 3 })).toContain('3');
    expect(i18n.t('does.not.exist')).toBe('does.not.exist');
  });

  it('falls back to device language then English', async () => {
    expect((await initI18n(null, ['es-ES'])).language).toBe('es');
    expect((await initI18n(null, ['de-DE'])).language).toBe('en');
  });
});

describe('interface vs learning language', () => {
  it('shows helper translations independently of the interface language', () => {
    expect(resolveTranslationLanguage('auto', 'fr')).toBe('fr');
    expect(resolveTranslationLanguage('auto', 'en')).toBeNull();
    expect(resolveTranslationLanguage('es', 'en')).toBe('es');
    expect(resolveTranslationLanguage('none', 'fr')).toBeNull();
  });
});
