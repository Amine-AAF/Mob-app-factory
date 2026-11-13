import { basePluralKey, flattenKeys } from '@factory/localization';
import fs from 'fs';
import path from 'path';

import { CATEGORY_META } from '@/content/taxonomy';
import { initI18n, resources } from '@/i18n';
import { CATEGORIES, JOB_ROLES, SKILLS } from '@/types/content';

const keysOf = (obj: unknown) => flattenKeys(obj).sort();
const get = (obj: unknown, key: string): unknown => key.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], obj);
const placeholders = (s: string) => (s.match(/{{\s*\w+\s*}}/g) ?? []).sort();

describe('UI localization', () => {
  const en = keysOf(resources.en);

  it.each(['fr', 'es'] as const)('%s has exactly the same keys as English', (lng) => {
    expect(keysOf(resources[lng])).toEqual(en);
  });

  it.each(['fr', 'es'] as const)('%s keeps every placeholder and has no empty value', (lng) => {
    for (const key of en) {
      const target = get(resources[lng], key);
      expect(typeof target).toBe('string');
      expect((target as string).trim().length).toBeGreaterThan(0);
      expect(placeholders(target as string)).toEqual(placeholders(get(resources.en, key) as string));
    }
  });

  it.each(['fr', 'es'] as const)('%s is actually translated (not an English copy)', (lng) => {
    const identical = en.filter((k) => get(resources.en, k) === get(resources[lng], k));
    // Brand names, tech terms (React, SQL, Docker…) and units are legitimately identical.
    expect(identical.length / en.length).toBeLessThan(0.3);
  });

  it('labels every category, topic, role and skill', () => {
    for (const c of CATEGORIES) {
      expect(get(resources.en, `categories.${c}`)).toBeDefined();
      expect(get(resources.en, `categoryDesc.${c}`)).toBeDefined();
      for (const topic of CATEGORY_META[c].topics) expect(get(resources.en, `topics.${topic}`)).toBeDefined();
    }
    for (const r of JOB_ROLES) expect(get(resources.en, `roles.${r}`)).toBeDefined();
    for (const s of SKILLS) expect(get(resources.en, `skills.${s}`)).toBeDefined();
  });

  it('every static translation key used in the code exists', () => {
    const roots = [path.join(__dirname, '..', '..', 'app'), path.join(__dirname, '..')];
    const files: string[] = [];
    const walk = (dir: string) =>
      fs.readdirSync(dir, { withFileTypes: true }).forEach((e) => {
        const p = path.join(dir, e.name);
        if (e.isDirectory() && e.name !== '__tests__' && e.name !== 'data') walk(p);
        else if (/\.tsx?$/.test(e.name)) files.push(p);
      });
    roots.forEach(walk);
    const known = new Set(en.map(basePluralKey));
    const missing: string[] = [];
    for (const f of files) {
      const src = fs.readFileSync(f, 'utf8');
      for (const m of src.matchAll(/\bt\(\s*'([a-zA-Z]+\.[a-zA-Z0-9_.-]+)'/g)) {
        if (!known.has(m[1]!)) missing.push(`${path.basename(f)}: ${m[1]}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('resolves the device language and formats plurals', async () => {
    const i18n = await initI18n(null, ['es', 'en']);
    expect(i18n.language).toBe('es');
    expect(i18n.t('common.days', { count: 3 })).toBe('3 días');
    await i18n.changeLanguage('fr');
    expect(i18n.t('common.questions', { count: 1 })).toBe('1 question');
    const fallback = await initI18n(null, ['de']);
    expect(fallback.language).toBe('en');
  });
});
