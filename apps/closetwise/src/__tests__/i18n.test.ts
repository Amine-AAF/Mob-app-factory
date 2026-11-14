import { basePluralKey, flattenKeys } from '@factory/localization';
import fs from 'fs';
import path from 'path';

import { CATEGORY_KEYS, COLOR_KEYS, OCCASION_KEYS, STYLE_KEYS, TRIP_TEMPLATES } from '@/domain/catalog';
import { GOAL_KINDS } from '@/domain/types';
import { SUGGESTION_PRESETS } from '@/domain/suggestions';
import { fmt, initI18n, resources } from '@/i18n';

const keysOf = (obj: unknown) => flattenKeys(obj).sort();
const get = (obj: unknown, key: string): unknown => key.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], obj);
const placeholders = (s: string) => (s.match(/{{\s*\w+\s*}}/g) ?? []).sort();
const appRoot = path.join(__dirname, '..', '..');

function sourceFiles(): string[] {
  const files: string[] = [];
  const walk = (dir: string) =>
    fs.readdirSync(dir, { withFileTypes: true }).forEach((e) => {
      const p = path.join(dir, e.name);
      if (e.isDirectory() && e.name !== '__tests__' && e.name !== 'locales') walk(p);
      else if (/\.tsx?$/.test(e.name)) files.push(p);
    });
  walk(path.join(appRoot, 'app'));
  walk(path.join(appRoot, 'src'));
  return files;
}

describe('localization resources', () => {
  const en = keysOf(resources.en);

  it.each(['fr', 'es'] as const)('%s has exactly the same keys as English', (lng) => {
    expect(keysOf(resources[lng])).toEqual(en);
  });

  it.each(['fr', 'es'] as const)('%s keeps every placeholder and has no empty value', (lng) => {
    const problems: string[] = [];
    for (const key of en) {
      const source = get(resources.en, key) as string;
      const target = get(resources[lng], key);
      if (typeof target !== 'string' || target.trim().length === 0) problems.push(`${key}: empty`);
      else if (JSON.stringify(placeholders(target)) !== JSON.stringify(placeholders(source))) problems.push(`${key}: placeholders`);
    }
    expect(problems).toEqual([]);
  });

  it.each(['fr', 'es'] as const)('%s is actually translated (not an English copy)', (lng) => {
    const identical = en.filter((k) => get(resources.en, k) === get(resources[lng], k));
    // Brand names, numbers and loanwords (Premium, Sport, Vintage, T-shirts…) may legitimately be identical.
    expect(identical.length / en.length).toBeLessThan(0.12);
  });

  it('labels every catalog entry', () => {
    const need = [
      ...CATEGORY_KEYS.map((k) => `catalog.category.${k}`),
      ...STYLE_KEYS.map((k) => `catalog.style.${k}`),
      ...OCCASION_KEYS.map((k) => `catalog.occasion.${k}`),
      ...COLOR_KEYS.map((k) => `catalog.color.${k}`),
      ...TRIP_TEMPLATES.map((k) => `catalog.tripTemplate.${k}`),
      ...SUGGESTION_PRESETS.map((k) => `catalog.preset.${k}`),
      ...GOAL_KINDS.map((k) => `catalog.goal.${k}`),
    ];
    expect(need.filter((k) => typeof get(resources.en, k) !== 'string')).toEqual([]);
  });

  it('every translation key used in the code exists in English', () => {
    const known = new Set(en.map(basePluralKey));
    const missing: string[] = [];
    for (const f of sourceFiles()) {
      const src = fs.readFileSync(f, 'utf8');
      for (const m of src.matchAll(/\bt\(\s*'([a-zA-Z]+\.[a-zA-Z0-9_.]+)'/g)) {
        if (!known.has(m[1]!)) missing.push(`${path.relative(appRoot, f)}: ${m[1]}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('formats plurals and falls back to device language then English', async () => {
    const i18n = await initI18n('fr', []);
    expect(i18n.t('common.items', { count: 1 })).toBe('1 article');
    expect(i18n.t('common.items', { count: 3 })).toBe('3 articles');
    await i18n.changeLanguage('es');
    expect(i18n.t('common.outfits', { count: 2 })).toBe('2 conjuntos');
    expect((await initI18n(null, ['es-MX'])).language).toBe('es');
    expect((await initI18n(null, ['de-DE'])).language).toBe('en');
  });

  it('formats money in its own currency and dates in the UI language', async () => {
    await initI18n('fr', []);
    expect(fmt.money(12.5, 'EUR').replace(/\s/g, ' ')).toMatch(/12,50 €/);
    expect(fmt.monthYear('2026-11')).toMatch(/novembre 2026/);
    await initI18n('en', []);
    expect(fmt.money(1299, 'USD')).toBe('$1,299');
    expect(fmt.money(10, 'XXX_INVALID')).toContain('XXX_INVALID');
  });
});

describe('offline-first', () => {
  it('app code never calls the network directly', () => {
    const offenders = sourceFiles().filter((f) => /\bfetch\(|XMLHttpRequest|axios/.test(fs.readFileSync(f, 'utf8')));
    expect(offenders.map((f) => path.relative(appRoot, f))).toEqual([]);
  });

  it('never presents the suggestion engine as AI', () => {
    const texts = JSON.stringify(resources);
    expect(texts).not.toMatch(/\bAI\b|\bIA\b|artificial intelligence|intelligence artificielle|inteligencia artificial/i);
  });
});
