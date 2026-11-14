import { basePluralKey, flattenKeys } from '@factory/localization';
import fs from 'fs';
import path from 'path';

import { BADGES } from '@/features/gamification/rewards';
import { TEMPLATES, TEMPLATE_GROUPS } from '@/features/templates/data';
import { initI18n, INTERFACE_LANGUAGES, resources } from '@/i18n';
import { CATEGORIES } from '@/types';

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
    // Units, numbers and a few loanwords may legitimately be identical.
    expect(identical.length / en.length).toBeLessThan(0.1);
  });

  it('has a name and description for every template, badge, category and group', () => {
    const missing = [
      ...TEMPLATES.flatMap((t) => [`templates.items.${t.id}.name`, `templates.items.${t.id}.desc`]),
      ...BADGES.flatMap((b) => [`badges.items.${b.id}.name`, `badges.items.${b.id}.desc`]),
      ...CATEGORIES.map((c) => `categories.${c}`),
      ...TEMPLATE_GROUPS.map((g) => `templates.groups.${g}`),
    ].filter((k) => !known.has(k));
    expect(missing).toEqual([]);
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
    const missing: string[] = [];
    for (const f of files) {
      const src = fs.readFileSync(f, 'utf8');
      for (const m of src.matchAll(/['`]((?:common|tabs|ads|units|streak|categories|frequency|tracking|errors|today|habit|habits|editor|calendar|day|planner|insights|templates|badges|reminders|notifications|onboarding|paywall|settings|data|privacy)\.[a-zA-Z0-9_.]+)['`]/g)) {
        if (!known.has(m[1]!)) missing.push(`${path.basename(f)}: ${m[1]}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('dynamic keys resolve in every language', async () => {
    for (const lng of INTERFACE_LANGUAGES) {
      const i18n = await initI18n(lng, []);
      const t = i18n.t.bind(i18n);
      for (const key of ['streak.day', 'streak.week', 'frequency.summary.timesPerWeek', 'today.remaining', 'insights.rules.streak_week']) {
        for (const count of [1, 3]) {
          const out = String(t(key, { count, name: 'X' }));
          expect(out).not.toBe(key);
          expect(out).not.toMatch(/{{|}}/);
          expect(out).toContain(String(count));
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
