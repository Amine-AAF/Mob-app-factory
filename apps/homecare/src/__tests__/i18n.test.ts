import { basePluralKey, flattenKeys } from '@factory/localization';
import fs from 'node:fs';
import path from 'node:path';

import { MAINTENANCE_TEMPLATES } from '@/content/maintenanceTemplates';
import { MAINTENANCE_FREQUENCIES, INTERVAL_UNITS } from '@/domain/recurrence';
import {
  ASSET_CATEGORIES,
  ASSET_STATUSES,
  DOCUMENT_TYPES,
  EXPENSE_CATEGORIES,
  EXPENSE_FREQUENCIES,
  HOME_TYPES,
  HOUSEHOLD_CATEGORIES,
  HOUSEHOLD_RECURRENCES,
  INVENTORY_CATEGORIES,
  MAINTENANCE_CATEGORIES,
  NOTIFICATION_CATEGORIES,
  PAYMENT_METHODS,
  PRIORITIES,
  REPAIR_STATUSES,
  ROOM_KINDS,
} from '@/domain/types';
import { resources } from '@/i18n';

const LANGS = ['en', 'fr', 'es'] as const;
const keySet = (obj: unknown) => new Set(flattenKeys(obj).map(basePluralKey));
const PLACEHOLDER = /\{\{\s*(\w+)\s*\}\}/g;
const leaf = (obj: unknown, key: string): unknown => key.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], obj);

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === '__tests__' ? [] : sourceFiles(p);
    return /\.(ts|tsx)$/.test(e.name) ? [p] : [];
  });
}

describe('translations', () => {
  const en = keySet(resources.en);

  it.each(LANGS)('%s has exactly the same keys as English', (lng) => {
    const keys = flattenKeys(resources[lng]);
    const enKeys = flattenKeys(resources.en);
    expect(keys.filter((k) => !enKeys.includes(k))).toEqual([]);
    expect(enKeys.filter((k) => !keys.includes(k))).toEqual([]);
  });

  it.each(LANGS)('%s keeps every interpolation placeholder', (lng) => {
    const problems: string[] = [];
    for (const key of flattenKeys(resources.en)) {
      const want = [...String(leaf(resources.en, key)).matchAll(PLACEHOLDER)].map((m) => m[1]).sort();
      const got = [...String(leaf(resources[lng], key)).matchAll(PLACEHOLDER)].map((m) => m[1]).sort();
      // A singular form may omit {{count}} ("Tomorrow"), nothing else may differ.
      const norm = (l: (string | undefined)[]) => l.filter((p) => !(key.endsWith('_one') && p === 'count'));
      if (norm(want).join() !== norm(got).join()) problems.push(`${key}: ${want} vs ${got}`);
    }
    expect(problems).toEqual([]);
  });

  it('defines every literal key used in the source code', () => {
    const root = path.resolve(__dirname, '..', '..');
    const files = [...sourceFiles(path.join(root, 'app')), ...sourceFiles(path.join(root, 'src'))];
    const missing = new Set<string>();
    for (const f of files) {
      const text = fs.readFileSync(f, 'utf8');
      for (const m of text.matchAll(/\bt\(\s*'([a-zA-Z0-9_]+\.[a-zA-Z0-9_.]+)'/g)) {
        if (!en.has(m[1] as string)) missing.add(`${m[1]} (${path.basename(f)})`);
      }
    }
    expect([...missing]).toEqual([]);
  });

  it('covers every enumeration value and template', () => {
    const groups: [string, readonly string[]][] = [
      ['homeTypes', HOME_TYPES],
      ['roomKinds', ROOM_KINDS],
      ['assetCategories', ASSET_CATEGORIES],
      ['assetStatus', ASSET_STATUSES],
      ['priorities', PRIORITIES],
      ['maintenanceCategories', MAINTENANCE_CATEGORIES],
      ['frequencies', [...MAINTENANCE_FREQUENCIES, ...EXPENSE_FREQUENCIES]],
      ['intervalUnits', INTERVAL_UNITS],
      ['recurrences', HOUSEHOLD_RECURRENCES],
      ['documentTypes', DOCUMENT_TYPES],
      ['expenseCategories', EXPENSE_CATEGORIES],
      ['paymentMethods', PAYMENT_METHODS],
      ['repairStatus', REPAIR_STATUSES],
      ['householdCategories', HOUSEHOLD_CATEGORIES],
      ['inventoryCategories', INVENTORY_CATEGORIES],
      ['notifications.channels', NOTIFICATION_CATEGORIES],
      ['notifications.hints', NOTIFICATION_CATEGORIES],
    ];
    const missing = groups.flatMap(([prefix, values]) => values.map((v) => `${prefix}.${v}`)).filter((k) => !en.has(k));
    const tpl = MAINTENANCE_TEMPLATES.flatMap((t) => [`templates.${t.id}.title`, `templates.${t.id}.desc`]).filter((k) => !en.has(k));
    expect([...missing, ...tpl]).toEqual([]);
  });

  it('every reminder kind has a title and body', () => {
    const kinds = ['maintenance_due', 'warranty_expiring', 'document_expiring', 'contract_renewal', 'bill_due', 'repair_scheduled', 'household_due', 'household_overdue'];
    for (const lng of LANGS) {
      for (const k of kinds) {
        expect(leaf(resources[lng], `notifications.kinds.${k}.title`)).toEqual(expect.stringContaining('{{name}}'));
        expect(leaf(resources[lng], `notifications.kinds.${k}.body`)).toEqual(expect.any(String));
      }
    }
  });
});
