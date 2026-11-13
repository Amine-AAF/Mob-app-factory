import { basePluralKey, flattenKeys } from '@factory/localization';
import fs from 'fs';
import path from 'path';

import { fmt, initI18n, resources } from '@/i18n';

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
    expect(identical.length / en.length).toBeLessThan(0.15);
  });

  it('every translation key referenced in the code exists (including keys inside ternaries)', () => {
    const roots = Object.keys(resources.en);
    const files: string[] = [];
    const walk = (dir: string) =>
      fs.readdirSync(dir, { withFileTypes: true }).forEach((e) => {
        const p = path.join(dir, e.name);
        if (e.isDirectory() && !['__tests__', 'quiz'].includes(e.name)) walk(p);
        else if (/\.tsx?$/.test(e.name)) files.push(p);
      });
    walk(path.join(__dirname, '..'));
    walk(path.join(__dirname, '..', '..', 'app'));
    const known = new Set(en.map(basePluralKey));
    const pattern = new RegExp(`'((?:${roots.join('|')})\\.[A-Za-z0-9_.]+)'`, 'g');
    const missing: string[] = [];
    for (const f of files) {
      for (const m of fs.readFileSync(f, 'utf8').matchAll(pattern)) {
        if (!known.has(m[1]!) && !known.has(`${m[1]}.title`)) missing.push(`${path.basename(f)}: ${m[1]}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('formats plurals and interpolations in every language', async () => {
    const i18n = await initI18n('fr', []);
    expect(i18n.t('home.streak', { count: 1 })).toContain('1');
    expect(i18n.t('flashcards.reviewedCount', { count: 3 })).toContain('3');
    await i18n.changeLanguage('es');
    expect(i18n.t('templates.weeks', { count: 4 })).toContain('4');
    expect(i18n.t('does.not.exist')).toBe('does.not.exist');
  });

  it('resolves the language: saved choice, then device, then English', async () => {
    expect((await initI18n('es', ['fr-FR'])).language).toBe('es');
    expect((await initI18n(null, ['fr-CA'])).language).toBe('fr');
    expect((await initI18n(null, ['de-DE'])).language).toBe('en');
  });

  it('uses regional formats for dates, times and numbers', async () => {
    await initI18n('fr', []);
    expect(fmt.number(1234.5)).toMatch(/1\s?234,5/);
    expect(fmt.time(14 * 60 + 5)).toMatch(/14:05/);
    await initI18n('en', []);
    expect(fmt.number(1234.5)).toBe('1,234.5');
    expect(fmt.time(14 * 60 + 5)).toMatch(/2:05/);
    expect(fmt.duration(85)).toMatch(/1.*h.*25.*m/);
  });
});
