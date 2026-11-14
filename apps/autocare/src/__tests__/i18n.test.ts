import { basePluralKey, flattenKeys } from '@factory/localization';
import fs from 'fs';
import path from 'path';

import { CHECK_ITEMS, TEMPLATE_GROUPS, TEMPLATES } from '@/features/templates/data';
import { initI18n, INTERFACE_LANGUAGES, resources } from '@/i18n';
import {
  DEADLINE_TYPES,
  DOCUMENT_CATEGORIES,
  EXPENSE_CATEGORIES,
  FUEL_TYPES,
  MAINTENANCE_TYPES,
  NOTIFICATION_CATEGORIES,
  PAYMENT_FREQUENCIES,
  RECURRENCES,
  TIRE_POSITIONS,
  TIRE_SEASONS,
  TIRE_STATUSES,
  TRANSMISSIONS,
  VEHICLE_TYPES,
} from '@/types';

const keysOf = (obj: unknown) => flattenKeys(obj).sort();
const get = (obj: unknown, key: string): unknown => key.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], obj);
const placeholders = (s: string) => (s.match(/{{\s*\w+\s*}}/g) ?? []).sort();
const en = keysOf(resources.en);
const known = new Set(en.map(basePluralKey));

describe('translations', () => {
  it.each(['fr', 'es'] as const)('%s has exactly the same keys as English', (lng) => {
    expect(keysOf(resources[lng])).toEqual(en);
  });

  it.each(['fr', 'es'] as const)('%s keeps every placeholder and has no empty value', (lng) => {
    const problems: string[] = [];
    for (const key of en) {
      const source = get(resources.en, key) as string;
      const target = get(resources[lng], key) as string;
      if (typeof target !== 'string' || target.trim().length === 0) problems.push(`${key}: empty`);
      else if (JSON.stringify(placeholders(target)) !== JSON.stringify(placeholders(source))) problems.push(`${key}: placeholders differ`);
    }
    expect(problems).toEqual([]);
  });

  it.each(['fr', 'es'] as const)('%s is actually translated (not an English copy)', (lng) => {
    const identical = en.filter((k) => get(resources.en, k) === get(resources[lng], k));
    // Units, brand names and a few loanwords ("Premium", "OK", "SUV") may legitimately be identical.
    expect(identical.length / en.length).toBeLessThan(0.08);
  });

  it('has a label for every enum value, template, group and checklist item', () => {
    const required = [
      ...VEHICLE_TYPES.map((x) => `vehicleTypes.${x}`),
      ...FUEL_TYPES.map((x) => `fuelTypes.${x}`),
      ...TRANSMISSIONS.map((x) => `transmissions.${x}`),
      ...MAINTENANCE_TYPES.map((x) => `maintenanceTypes.${x}`),
      ...EXPENSE_CATEGORIES.map((x) => `expenseCategories.${x}`),
      ...RECURRENCES.map((x) => `recurrences.${x}`),
      ...PAYMENT_FREQUENCIES.map((x) => `paymentFrequencies.${x}`),
      ...DOCUMENT_CATEGORIES.map((x) => `documentCategories.${x}`),
      ...DEADLINE_TYPES.map((x) => `deadlineTypes.${x}`),
      ...TIRE_SEASONS.map((x) => `tireSeasons.${x}`),
      ...TIRE_POSITIONS.map((x) => `tirePositions.${x}`),
      ...TIRE_STATUSES.map((x) => `tireStatuses.${x}`),
      ...NOTIFICATION_CATEGORIES.map((x) => `notificationCategories.${x}`),
      ...TEMPLATE_GROUPS.map((g) => `templates.groups.${g}`),
      ...TEMPLATES.flatMap((tpl) => [`templates.items.${tpl.id}.name`, `templates.items.${tpl.id}.desc`]),
      ...CHECK_ITEMS.map((c) => `templates.checks.${c}`),
    ];
    expect(required.filter((k) => !known.has(k))).toEqual([]);
  });
});

describe('templates', () => {
  it('ships at least 30 templates covering every group, with valid unique items', () => {
    expect(TEMPLATES.length).toBeGreaterThanOrEqual(30);
    expect(new Set(TEMPLATES.map((t) => t.id)).size).toBe(TEMPLATES.length);
    for (const g of TEMPLATE_GROUPS) expect(TEMPLATES.some((t) => t.group === g)).toBe(true);
    for (const t of TEMPLATES) {
      expect(t.items.length).toBeGreaterThanOrEqual(3);
      expect(new Set(t.items).size).toBe(t.items.length);
      for (const item of t.items) expect(CHECK_ITEMS).toContain(item);
    }
  });

  it('checklist texts never state universal intervals (they depend on the vehicle)', () => {
    for (const lng of INTERFACE_LANGUAGES) {
      const checks = Object.values((resources[lng] as { templates: { checks: Record<string, string> } }).templates.checks);
      for (const text of checks) expect(text).not.toMatch(/\d+\s?(km|mi|miles|months|mois|meses|000)/i);
    }
  });
});

describe('interface strings used in code', () => {
  it('every static t() key used in app code exists in English', () => {
    const roots = [path.join(__dirname, '..', '..', 'app'), path.join(__dirname, '..')];
    const files: string[] = [];
    const walk = (dir: string) =>
      fs.readdirSync(dir, { withFileTypes: true }).forEach((e) => {
        const p = path.join(dir, e.name);
        if (e.isDirectory() && !['__tests__', 'i18n'].includes(e.name)) walk(p);
        else if (/\.(tsx?)$/.test(e.name)) files.push(p);
      });
    roots.forEach(walk);
    const namespaces = Object.keys(resources.en).join('|');
    const re = new RegExp(`['\`]((?:${namespaces})\\.[a-zA-Z0-9_.]+)['\`]`, 'g');
    const missing: string[] = [];
    for (const f of files) {
      const src = fs.readFileSync(f, 'utf8');
      for (const m of src.matchAll(re)) {
        const key = m[1]!.replace(/\.$/, '');
        if (!known.has(key) && !en.some((k) => k.startsWith(`${key}.`))) missing.push(`${path.basename(f)}: ${key}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('plural and placeholder keys resolve in every language', async () => {
    for (const lng of INTERFACE_LANGUAGES) {
      const i18n = await initI18n(lng, []);
      const t = i18n.t.bind(i18n);
      for (const key of ['common.daysLeft', 'common.overdueBy', 'common.months', 'fuel.pending', 'templates.count', 'insurance.expectedPayments', 'notifications.body.deadline', 'notifications.body.maintenance_estimated']) {
        for (const count of [1, 3]) {
          const out = String(t(key, { count, label: 'X', vehicle: 'V' }));
          expect(out).not.toBe(key);
          expect(out).not.toMatch(/{{|}}/);
        }
      }
    }
  });

  it('falls back to the device language, then English', async () => {
    expect((await initI18n(null, ['es-MX'])).language).toBe('es');
    expect((await initI18n(null, ['de-DE'])).language).toBe('en');
    expect((await initI18n('fr', ['es-ES'])).language).toBe('fr');
  });
});
