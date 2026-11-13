import { basePluralKey, flattenKeys } from '@factory/localization';
import fs from 'node:fs';
import path from 'node:path';

import { DEFAULT_CATEGORIES } from '@/constants';
import { resources } from '@/i18n';
import { ACCOUNT_TYPES, FREQUENCIES, PAYMENT_METHODS, SUBSCRIPTION_KINDS, TRANSACTION_TYPES } from '@/types';

const ROOT = path.resolve(__dirname, '../..');

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === '__tests__' || e.name === 'node_modules' ? [] : sourceFiles(p);
    return /\.tsx?$/.test(e.name) ? [p] : [];
  });
}

const keySet = (lng: keyof typeof resources) => new Set(flattenKeys(resources[lng]).map(basePluralKey));
const has = (keys: Set<string>, k: string) => keys.has(k) || keys.has(basePluralKey(k));

/** Literal keys used as t('a.b') / t("a.b") in app/ and src/. Dynamic keys are checked below. */
function staticKeys(): string[] {
  const out = new Set<string>();
  for (const file of [...sourceFiles(path.join(ROOT, 'app')), ...sourceFiles(path.join(ROOT, 'src'))]) {
    const src = fs.readFileSync(file, 'utf8');
    for (const m of src.matchAll(/\bt\(\s*['"]([a-zA-Z][\w.]*)['"]/g)) out.add(m[1]!);
  }
  return [...out];
}

describe('translations', () => {
  const en = keySet('en');

  it('every literal key used in the code exists in English', () => {
    const missing = staticKeys().filter((k) => !has(en, k));
    expect(missing).toEqual([]);
  });

  it('every dynamic key family exists in English', () => {
    const dynamic = [
      ...TRANSACTION_TYPES.map((k) => `tx.types.${k}`),
      ...PAYMENT_METHODS.map((k) => `tx.payment.${k}`),
      ...ACCOUNT_TYPES.map((k) => `accounts.types.${k}`),
      ...DEFAULT_CATEGORIES.map((c) => `categories.${c.key}`),
      ...FREQUENCIES.map((k) => `freq.options.${k}`),
      ...FREQUENCIES.map((k) => `freq.${k}`),
      ...['week', 'month', 'year'].map((k) => `period.${k}`),
      ...['amount', 'empty', 'invalid', 'too_many_decimals', 'too_large', 'negative', 'account', 'to_account', 'same_account', 'to_amount', 'category', 'date', 'time', 'name', 'currency', 'currency_locked', 'currency_mismatch', 'schedule', 'rate', 'withdraw_too_much', 'not_found'].map((k) => `errors.${k}`),
      ...['invalid_json', 'invalid_format', 'wrong_app', 'newer_schema'].map((k) => `data.backupErrors.${k}`),
      ...['empty', 'missing_columns', 'unterminated_quote', 'too_many_rows'].map((k) => `data.csvErrors.${k}`),
      ...['system', 'light', 'dark'].map((k) => `settings.themes.${k}`),
      ...['monthly', 'annual', 'lifetime', 'unknown'].map((k) => `paywall.plans.${k}`),
    ];
    if ('subs' in resources.en && SUBSCRIPTION_KINDS.length) dynamic.push(...SUBSCRIPTION_KINDS.map((k) => `subs.kinds.${k}`));
    expect(dynamic.filter((k) => !has(en, k))).toEqual([]);
  });

  it.each(['fr', 'es'] as const)('%s has exactly the same keys as English', (lng) => {
    const other = keySet(lng);
    expect([...en].filter((k) => !other.has(k))).toEqual([]);
    expect([...other].filter((k) => !en.has(k))).toEqual([]);
  });

  it.each(['fr', 'es'] as const)('%s keeps every interpolation variable', (lng) => {
    const flat = (obj: unknown, prefix = ''): [string, string][] =>
      obj && typeof obj === 'object' ? Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) => flat(v, prefix ? `${prefix}.${k}` : k)) : [[prefix, String(obj)]];
    const enMap = new Map(flat(resources.en));
    const vars = (s: string) => [...s.matchAll(/{{\s*(\w+)\s*}}/g)].map((m) => m[1]).sort();
    const problems = flat(resources[lng]).filter(([k, v]) => enMap.has(k) && JSON.stringify(vars(v).filter((x) => x !== 'count')) !== JSON.stringify(vars(enMap.get(k)!).filter((x) => x !== 'count')));
    expect(problems.map(([k]) => k)).toEqual([]);
  });
});
