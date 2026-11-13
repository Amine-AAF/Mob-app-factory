import fs from 'node:fs';
import path from 'node:path';

import { basePluralKey, flattenKeys } from '@factory/localization';

import { TOOL_IDS } from '@/constants/tools';
import { resources } from '@/i18n';
import { UNITS, UNIT_CATEGORIES } from '@/services/calculators/UnitConverter';

const keySets = Object.fromEntries(Object.entries(resources).map(([lng, res]) => [lng, new Set(flattenKeys(res))])) as Record<string, Set<string>>;
const en = keySets.en as Set<string>;
const has = (key: string) => en.has(key) || en.has(`${key}_one`) || en.has(`${key}_other`);

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === '__tests__' ? [] : walk(p);
    return /\.(ts|tsx)$/.test(e.name) ? [p] : [];
  });
}
const root = path.resolve(__dirname, '..', '..');
const sources = [...walk(path.join(root, 'app')), ...walk(path.join(root, 'src'))].map((f) => fs.readFileSync(f, 'utf8'));

const placeholders = (s: string) => [...s.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]).sort();
const valueOf = (res: unknown, key: string): string => key.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], res) as string;

describe('translations', () => {
  it('fr and es have exactly the same keys as en', () => {
    for (const lng of ['fr', 'es']) {
      const keys = keySets[lng] as Set<string>;
      expect([...en].filter((k) => !keys.has(k))).toEqual([]);
      expect([...keys].filter((k) => !en.has(k))).toEqual([]);
    }
  });

  it('placeholders match across languages', () => {
    for (const key of en) {
      const ref = placeholders(valueOf(resources.en, key));
      for (const lng of ['fr', 'es'] as const) expect({ key, p: placeholders(valueOf(resources[lng], key)) }).toEqual({ key, p: ref });
    }
  });

  it('no empty strings', () => {
    for (const lng of Object.keys(resources) as (keyof typeof resources)[]) {
      for (const key of keySets[lng] as Set<string>) expect({ lng, key, empty: valueOf(resources[lng], key).trim() === '' }).toEqual({ lng, key, empty: false });
    }
  });

  it("every static t('…') key used in code exists", () => {
    const used = new Set(sources.flatMap((s) => [...s.matchAll(/\bt\('([a-zA-Z0-9_.]+)'/g)].map((m) => m[1] as string)));
    expect([...used].filter((k) => !has(k))).toEqual([]);
  });

  it('every i18n label key stored in history payloads exists', () => {
    const stored = new Set(sources.flatMap((s) => [...s.matchAll(/(?:label|mode): '([a-z]+\.[a-zA-Z0-9_.]+)'/g)].map((m) => m[1] as string)));
    expect(stored.size).toBeGreaterThan(20);
    expect([...stored].filter((k) => !has(k))).toEqual([]);
  });

  it('dynamic keys exist for every tool, unit, error and key', () => {
    for (const id of TOOL_IDS) for (const f of ['name', 'short', 'tagline', 'description']) expect(has(`tools.${id}.${f}`)).toBe(true);
    for (const c of UNIT_CATEGORIES) {
      expect(has(`units.categories.${c}`)).toBe(true);
      for (const u of UNITS[c]) expect({ k: `units.names.${c}.${u.id}`, ok: has(`units.names.${c}.${u.id}`) }).toEqual({ k: `units.names.${c}.${u.id}`, ok: true });
    }
    for (const code of ['syntax', 'division_by_zero', 'domain', 'overflow', 'empty', 'too_long']) expect(has(`calc.errors.${code}`)).toBe(true);
    for (const issue of ['required', 'not_positive', 'negative', 'zero_division', 'percent_range', 'too_large', 'not_integer', 'incompatible_units']) expect(has(`errors.${issue}`)).toBe(true);
    const a11y = new Set(sources.flatMap((s) => [...s.matchAll(/a11y: '([a-zA-Z0-9]+)'/g)].map((m) => m[1] as string)));
    for (const k of a11y) expect({ k, ok: has(`keys.${k}`) }).toEqual({ k, ok: true });
    for (let d = 0; d <= 9; d++) expect(has(`keys.digit${d}`)).toBe(true);
  });

  it('plural keys always come in _one/_other pairs', () => {
    const plurals = [...en].filter((k) => /_(one|other)$/.test(k)).map(basePluralKey);
    for (const base of new Set(plurals)) {
      expect(en.has(`${base}_one`) && en.has(`${base}_other`)).toBe(true);
    }
  });

  it('no user-facing English text hard-coded in screens', () => {
    // Text children that contain letters, outside {…} expressions, are forbidden in app/ (except the brand name).
    const screens = walk(path.join(root, 'app')).map((f) => [f, fs.readFileSync(f, 'utf8')] as const);
    for (const [file, src] of screens) {
      if (file.endsWith('_layout.tsx')) continue; // boot-error fallback is intentionally English (i18n not loaded)
      const literals = [...src.matchAll(/>\s*([A-Za-z][A-Za-z ,.'!?]{2,})\s*</g)].map((m) => m[1]?.trim()).filter((s) => s && s !== 'CalcWise');
      expect({ file: path.basename(file), literals }).toEqual({ file: path.basename(file), literals: [] });
    }
  });
});
