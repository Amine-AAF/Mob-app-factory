import { basePluralKey, flattenKeys } from '@factory/localization';
import fs from 'node:fs';
import path from 'node:path';

import { ADJUSTMENTS, FILTER_PRESETS } from '@/constants/filterPresets';
import { COLLAGE_TEMPLATES } from '@/constants/collageTemplates';
import { SOCIAL_PRESETS } from '@/constants/socialPresets';
import { CROP_RATIOS, RESIZE_PRESETS, TOOLS } from '@/constants/tools';
import { OPERATION_IDS, PROJECT_KINDS } from '@/database/repositories/projectsRepository';
import { fmt, initI18n, resources } from '@/i18n';
import { ERROR_CODES } from '@/services/files/errors';
import { FONT_FAMILIES, OUTPUT_FORMATS } from '@/types/image';

const LANGS = ['en', 'fr', 'es'] as const;

const get = (obj: unknown, key: string): unknown => key.split('.').reduce<unknown>((o, k) => (o && typeof o === 'object' ? (o as Record<string, unknown>)[k] : undefined), obj);
const placeholders = (s: string) => [...s.matchAll(/{{\s*(\w+)\s*}}/g)].map((m) => m[1]).sort();

describe('localization completeness', () => {
  const keys = Object.fromEntries(LANGS.map((l) => [l, flattenKeys(resources[l]).sort()]));

  it.each(['fr', 'es'] as const)('%s has exactly the same keys as English', (lng) => {
    expect(keys[lng]).toEqual(keys.en);
  });

  it.each(['fr', 'es'] as const)('%s uses the same placeholders as English', (lng) => {
    for (const key of keys.en ?? []) {
      expect({ key, p: placeholders(String(get(resources[lng], key))) }).toEqual({ key, p: placeholders(String(get(resources.en, key))) });
    }
  });

  it('has no empty or copy-pasted strings', () => {
    for (const lng of LANGS) for (const key of keys[lng] ?? []) expect(String(get(resources[lng], key)).trim()).not.toBe('');
    for (const lng of ['fr', 'es'] as const) {
      // Strings made only of placeholders and punctuation are legitimately identical.
      const words = (s: string) => s.replace(/{{\s*\w+\s*}}/g, '').replace(/[^\p{L}]/gu, '');
      const same = (keys.en ?? []).filter((k) => words(String(get(resources.en, k))).length > 20 && get(resources.en, k) === get(resources[lng], k));
      expect(same).toEqual([]);
    }
  });

  it('defines both plural forms', () => {
    for (const lng of LANGS) {
      const bases = new Set((keys[lng] ?? []).filter((k) => /_(one|other)$/.test(k)).map(basePluralKey));
      for (const base of bases) {
        expect(keys[lng]).toContain(`${base}_one`);
        expect(keys[lng]).toContain(`${base}_other`);
      }
    }
  });

  it('every literal key used in the code exists', () => {
    const roots = ['app', 'src'].map((d) => path.join(__dirname, '..', '..', d));
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) {
          if (e.name !== '__tests__') walk(p);
        } else if (/\.tsx?$/.test(e.name)) files.push(p);
      }
    };
    roots.forEach(walk);
    const known = new Set((keys.en ?? []).map(basePluralKey));
    const missing: string[] = [];
    for (const f of files) {
      for (const m of fs.readFileSync(f, 'utf8').matchAll(/\btr?\(\s*'([a-zA-Z0-9_.]+)'/g)) {
        if (!known.has(m[1] as string)) missing.push(`${path.basename(f)}: ${m[1]}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('covers every dynamic key family (catalogues, errors, operations…)', () => {
    const known = new Set((keys.en ?? []).map(basePluralKey));
    const expected = [
      ...TOOLS.flatMap((t) => [`tools.${t.id}.title`, `tools.${t.id}.short`]),
      ...['resize', 'compress', 'convert', 'social'].flatMap((t) => [`tools.${t}.description`, `tools.${t}.emptyTitle`]),
      ...FILTER_PRESETS.map((f) => `filters.presets.${f.id}`),
      ...ADJUSTMENTS.map((a) => `adjust.${a.key}`),
      ...SOCIAL_PRESETS.map((p) => `social.presets.${p.id}`),
      ...COLLAGE_TEMPLATES.map((t) => `collage.templates.${t.id}`),
      ...ERROR_CODES.flatMap((c) => [`errors.${c}`, `errorsShort.${c}`]),
      ...OPERATION_IDS.map((o) => `operations.${o}`),
      ...PROJECT_KINDS.map((k) => `projects.kinds.${k}`),
      ...OUTPUT_FORMATS.flatMap((f) => [`format.names.${f}`, `format.hints.${f}`]),
      ...FONT_FAMILIES.map((f) => `text.fonts.${f.replace(/-/g, '_')}`),
      ...RESIZE_PRESETS.map((p) => `resize.presets.${p.id}`),
      ...CROP_RATIOS.filter((r) => r.id === 'free' || r.id === 'original').map((r) => `crop.ratios.${r.id}`),
      ...['crop', 'adjust', 'filters', 'text', 'watermark'].map((p) => `editor.panels.${p}`),
      ...['top_left', 'top', 'top_right', 'left', 'center', 'right', 'bottom_left', 'bottom', 'bottom_right'].map((a) => `watermark.anchors.${a}`),
      ...['welcome', 'tools', 'privacy'].flatMap((s) => [`onboarding.${s}.title`, `onboarding.${s}.body`]),
      ...['local', 'noAccount', 'permissions', 'storage', 'ads', 'analytics', 'purchases', 'deletion'].flatMap((s) => [`privacy.sections.${s}.title`, `privacy.sections.${s}.body`]),
      ...['home', 'edit', 'tools', 'projects', 'settings'].map((s) => `tabs.${s}`),
    ];
    expect(expected.filter((k) => !known.has(k))).toEqual([]);
  });
});

describe('formatting', () => {
  it('formats sizes, numbers and dates per language', async () => {
    await initI18n('fr', []);
    expect(fmt.size(1_250_000)).toBe('1,3 MB');
    expect(fmt.dims(4000, 3000)).toMatch(/4\s000 × 3\s000/);
    await initI18n('en', []);
    expect(fmt.size(1_250_000)).toBe('1.3 MB');
    expect(fmt.size(850)).toBe('850 B');
    expect(fmt.percent(0.42)).toBe('42%');
  });
});
