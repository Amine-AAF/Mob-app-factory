import { basePluralKey, flattenKeys } from '@factory/localization';
import fs from 'fs';
import path from 'path';

import { PREMIUM_FEATURES } from '@/config/limits';
import { CHALLENGES, COLLECTION_PRESETS, GENRE_SUGGESTIONS } from '@/config/presets';
import { PALETTES } from '@/config/brand';
import { planNotifications } from '@/features/reminders/plan';
import { fmt, initI18n, resources } from '@/i18n';
import { BOOK_FORMATS, GOAL_TYPES, NOTE_KINDS, NOTIFICATION_KINDS, READING_STATUSES, WISHLIST_STATUSES } from '@/types';

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
    expect(identical.length / en.length).toBeLessThan(0.1);
  });
});

describe('keys used in code', () => {
  const NAMESPACES = Object.keys(resources.en).join('|');

  it('every static key referenced in app code exists in English', () => {
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
    const re = new RegExp(`['"]((?:${NAMESPACES})\\.[a-zA-Z0-9_.]+)['"]`, 'g');
    for (const f of files) {
      const src = fs.readFileSync(f, 'utf8');
      for (const m of src.matchAll(re)) if (!known.has(m[1]!)) missing.push(`${path.basename(f)}: ${m[1]}`);
    }
    expect(missing).toEqual([]);
  });

  it('dynamic keys resolve for every enum value', () => {
    const dynamic = [
      ...READING_STATUSES.map((s) => `status.${s}`),
      ...BOOK_FORMATS.map((f) => `formats.${f}`),
      ...GENRE_SUGGESTIONS.map((g) => `genres.${g}`),
      ...GOAL_TYPES.flatMap((g) => [`goals.types.${g}`, `goals.typeNames.${g}`, `goals.typeHints.${g}`, `goals.targetHints.${g}`]),
      ...CHALLENGES.flatMap((c) => [`challenges.${c.id}.title`, `challenges.${c.id}.body`]),
      ...COLLECTION_PRESETS.map((p) => `collections.presets.${p.key}`),
      ...NOTE_KINDS.map((k) => `journal.kinds.${k}`),
      ...WISHLIST_STATUSES.map((s) => `wishlist.statuses.${s}`),
      ...NOTIFICATION_KINDS.flatMap((k) => [`notifications.kinds.${k}.title`, `notifications.kinds.${k}.hint`]),
      ...PREMIUM_FEATURES.map((f) => `premium.features.${f}`),
      ...Object.keys(PALETTES).map((p) => `settings.palettes.${p}`),
      ...['ahead', 'on_track', 'behind'].map((p) => `goals.pace.${p}`),
      ...['favorite_genre', 'favorite_author', 'similar_genre', 'similar_author', 'forgotten', 'unfinished', 'random', 'on_hold'].map((r) => `discover.reasons.${r}`),
      ...['books', 'customCollections', 'quotes', 'journalEntries', 'activeGoals'].map((k) => `limits.${k}`),
      ...['monthly', 'annual', 'lifetime', 'unknown'].map((p) => `premium.plans.${p}`),
    ];
    // Every notification the planner can produce must have its texts.
    const all = NOTIFICATION_KINDS.map((kind) => ({ kind, enabled: true, hour: 9, minute: 0, weekday: 1 }));
    const plan = planNotifications(all, {
      now: new Date('2026-01-10T08:00:00'),
      today: '2026-01-10',
      goals: ['books_per_year', 'pages_per_month', 'days_per_week'].map((type) => ({ type, reached: false, challengeId: 'weekend' })),
      resumeCandidate: { bookId: 'b', title: 'T', lastActivityDay: '2026-01-09' },
    });
    expect(plan.length).toBe(6);
    dynamic.push(...plan.flatMap((p) => [p.titleKey, p.bodyKey]), 'notifications.challenge.body');
    for (const lng of ['en', 'fr', 'es'] as const) {
      const keys = new Set(keysOf(resources[lng]).map(basePluralKey));
      expect(dynamic.filter((k) => !keys.has(k))).toEqual([]);
    }
  });
});

describe('locale formatting', () => {
  it('formats dates, numbers, money and durations per interface language', async () => {
    await initI18n('fr', []);
    expect(fmt.day('2026-11-13')).toMatch(/13 nov/);
    expect(fmt.money(1250, 'EUR')).toMatch(/12,50\s?€/);
    expect(fmt.duration(3900)).toMatch(/1\s?h.*5\s?min/);
    await initI18n('es', []);
    expect(fmt.longDay('2026-11-13')).toMatch(/viernes/);
    const i18n = await initI18n('en', []);
    expect(fmt.duration(2700)).toBe('45 min');
    expect(i18n.t('library.count', { count: 1 })).toBe('1 book');
    expect(i18n.t('library.count', { count: 3 })).toBe('3 books');
  });

  it('follows the device language and falls back to English', async () => {
    expect((await initI18n(null, ['es-MX'])).language).toBe('es');
    expect((await initI18n(null, ['de-DE'])).language).toBe('en');
  });
});
