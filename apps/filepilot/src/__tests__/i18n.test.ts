import { basePluralKey, flattenKeys } from '@factory/localization';
import fs from 'node:fs';
import path from 'node:path';

import { OPERATION_STATUSES, OPERATION_TYPES } from '@/database/repositories/operationsRepository';
import { fmt, initI18n, resources } from '@/i18n';
import type { ProcessingErrorCode } from '@/services/files/errors';

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

  it('has no empty or untranslated-looking strings', () => {
    for (const lng of LANGS) for (const key of keys[lng] ?? []) expect(String(get(resources[lng], key)).trim()).not.toBe('');
    // Most long strings must differ from English in fr/es (catches copy-paste).
    const same = (keys.en ?? []).filter((k) => String(get(resources.en, k)).length > 25 && get(resources.en, k) === get(resources.fr, k));
    expect(same).toEqual([]);
  });

  it('defines every plural form used by each language', () => {
    for (const lng of LANGS) {
      const plural = (keys[lng] ?? []).filter((k) => /_(one|other)$/.test(k));
      const bases = new Set(plural.map(basePluralKey));
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
      for (const m of fs.readFileSync(f, 'utf8').matchAll(/\bt\(\s*'([a-zA-Z0-9_.]+)'/g)) {
        const key = m[1] as string;
        if (!known.has(key) && !(keys.en ?? []).some((k) => k.startsWith(`${key}.`))) missing.push(`${path.basename(f)}: ${key}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('has a message for every error code, operation type and status', () => {
    const codes: ProcessingErrorCode[] = [
      'cancelled', 'unsupported_format', 'corrupted_file', 'file_too_large', 'image_too_large', 'too_many_files', 'file_missing', 'storage_full', 'write_failed',
      'read_failed', 'pdf_encrypted', 'pdf_invalid', 'invalid_page_range', 'native_unavailable', 'quota_exceeded', 'premium_required', 'target_unreachable',
      'transparency_unsupported', 'unknown',
    ];
    for (const lng of LANGS) {
      for (const c of codes) expect(get(resources[lng], `errors.${c}`)).toEqual(expect.any(String));
      for (const op of OPERATION_TYPES) {
        expect(get(resources[lng], `operations.${op}`)).toEqual(expect.any(String));
        expect(get(resources[lng], `result.headline.${op}`)).toEqual(expect.any(String));
      }
      for (const s of OPERATION_STATUSES) expect(get(resources[lng], `status.${s}`)).toEqual(expect.any(String));
    }
  });
});

describe('runtime localization', () => {
  it('resolves the device language and pluralises', async () => {
    const i18n = await initI18n(null, ['fr-FR']);
    expect(i18n.language).toBe('fr');
    expect(i18n.t('common.pages', { count: 1 })).toBe('1 page');
    expect(i18n.t('common.pages', { count: 3 })).toBe('3 pages');
    await i18n.changeLanguage('es');
    expect(i18n.t('pdf.split.willCreate', { count: 1 })).toBe('Se creará 1 PDF.');
    expect(i18n.t('pdf.split.willCreate', { count: 4 })).toBe('Se crearán 4 PDF.');
  });

  it('falls back to English for unsupported device languages and honours a saved choice', async () => {
    expect((await initI18n(null, ['ja-JP'])).language).toBe('en');
    expect((await initI18n('es', ['fr-FR'])).language).toBe('es');
  });

  it('formats sizes, percentages and dates in the current language', async () => {
    await initI18n('fr', []);
    expect(fmt.size(1_234_567)).toMatch(/^1,23\s?Mo$/);
    expect(fmt.percent(0.42)).toMatch(/^42\s?%$/);
    expect(fmt.day(new Date(2026, 10, 13))).toMatch(/13 nov/);
    await initI18n('en', []);
    expect(fmt.size(1_234_567)).toBe('1.23 MB');
  });
});
