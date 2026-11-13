import { basePluralKey, flattenKeys } from '@factory/localization';
import fs from 'fs';
import path from 'path';

import { initI18n, resources } from '@/i18n';

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
      expect({ key, p: placeholders(target) }).toEqual({ key, p: placeholders(source) });
    }
  });

  it.each(['fr', 'es'] as const)('%s is actually translated', (lng) => {
    const identical = en.filter((k) => get(resources.en, k) === get(resources[lng], k));
    expect(identical.length / en.length).toBeLessThan(0.1);
  });

  it('every static translation key used in the code exists', () => {
    const roots = [path.join(__dirname, '..', '..', 'app'), path.join(__dirname, '..')];
    const files: string[] = [];
    const walk = (dir: string) =>
      fs.readdirSync(dir, { withFileTypes: true }).forEach((e) => {
        const p = path.join(dir, e.name);
        if (e.isDirectory() && e.name !== '__tests__') walk(p);
        else if (/\.tsx?$/.test(e.name)) files.push(p);
      });
    roots.forEach(walk);
    const known = new Set(en.map(basePluralKey).map((k) => k.replace(/\.\d+$/, '')));
    const missing: string[] = [];
    for (const f of files) {
      for (const m of fs.readFileSync(f, 'utf8').matchAll(/\bt(?:r)?\(\s*'([a-zA-Z]+\.[a-zA-Z0-9_.]+)'/g)) {
        if (!known.has(m[1]!)) missing.push(`${path.basename(f)}: ${m[1]}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('dynamic key families are complete', () => {
    const must = [
      ...['not_a_backup', 'corrupted', 'unsupported_version', 'wrong_password', 'tampered', 'too_large', 'import_failed'].map((c) => `backup.errors.${c}`),
      ...['available', 'no_hardware', 'not_enrolled', 'weak_only', 'insecure_device', 'unsupported'].map((c) => `settings.security.biometricUnavailable.${c}`),
      ...['0', '1', '2', '3', '4'].map((c) => `strength.score.${c}`),
      ...['too_short', 'add_length', 'add_variety', 'avoid_common', 'avoid_patterns', 'avoid_words', 'avoid_years'].map((c) => `strength.hints.${c}`),
      ...['personal', 'passport', 'driving_license', 'address', 'professional'].map((c) => `identity.templates.${c}`),
      ...['personal', 'work', 'finance', 'social', 'shopping', 'email', 'development', 'servers', 'wifi', 'other'].map((c) => `categories.builtin.${c}`),
    ];
    for (const lng of ['en', 'fr', 'es'] as const) for (const k of must) expect({ lng, k, v: typeof get(resources[lng], k) }).toEqual({ lng, k, v: 'string' });
  });

  it('pluralises and formats in every language', async () => {
    const i18n = await initI18n('fr', []);
    expect(i18n.t('vault.results', { count: 1 })).toContain('1');
    expect(i18n.t('vault.results', { count: 3 })).toContain('3');
    await i18n.changeLanguage('es');
    expect(i18n.t('time.minutes', { count: 5 })).toContain('5');
    await i18n.changeLanguage('en');
    expect(i18n.t('time.minutes', { count: 1 })).toBe('1 minute');
    expect(i18n.t('time.minutes', { count: 2 })).toBe('2 minutes');
  });

  it('falls back to English for unsupported device languages', async () => {
    const i18n = await initI18n(null, ['de-DE']);
    expect(i18n.language).toBe('en');
  });
});
