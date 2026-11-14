import { basePluralKey, flattenKeys } from '@factory/localization';
import fs from 'fs';
import path from 'path';

import { EQUIPMENT, EXERCISE_CATEGORIES, LEVELS, MUSCLE_GROUPS, PROGRAM_GOALS, PROGRAM_TYPES, TRACKING_TYPES } from '@/content/types';
import { BADGES, CHALLENGES } from '@/features/goals/goals';
import { NOTIFICATION_PREFIX } from '@/features/reminders/plan';
import { TIMER_PRESETS } from '@/features/timers/engine';
import { initI18n, INTERFACE_LANGUAGES, resources } from '@/i18n';
import { CARDIO_TYPES, GOAL_KINDS, MEASUREMENT_KINDS, NOTIFICATION_KINDS } from '@/types';

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

  it('every enum value used for dynamic keys has a label', () => {
    const missing = [
      ...EXERCISE_CATEGORIES.map((c) => `categories.${c}`),
      ...MUSCLE_GROUPS.map((m) => `muscles.${m}`),
      ...EQUIPMENT.map((e) => `equipment.${e}`),
      ...LEVELS.map((l) => `levels.${l}`),
      ...TRACKING_TYPES.map((x) => `tracking.${x}`),
      ...TRACKING_TYPES.map((x) => `workout.invalidSet.${x}`),
      ...PROGRAM_TYPES.map((x) => `programTypes.${x}`),
      ...PROGRAM_GOALS.map((x) => `goals.${x}`),
      ...GOAL_KINDS.flatMap((x) => [`goalKinds.${x}`, `goalKinds.short.${x}`]),
      ...CARDIO_TYPES.map((x) => `cardio.types.${x}`),
      ...MEASUREMENT_KINDS.map((x) => `body.kinds.${x}`),
      ...NOTIFICATION_KINDS.flatMap((x) => [`notifications.kinds.${x}.title`, `notifications.kinds.${x}.desc`]),
      ...BADGES.flatMap((b) => [`badges.${b.id}.name`, `badges.${b.id}.desc`]),
      ...CHALLENGES.flatMap((c) => [`challenges.items.${c.id}.name`, `challenges.items.${c.id}.desc`]),
      ...Object.keys(TIMER_PRESETS).flatMap((k) => [`tools.${k}.name`, `tools.${k}.desc`]),
      ...['prep', 'work', 'rest', 'done', 'running'].map((p) => `tools.phase.${p}`),
      ...['planned', 'done', 'skipped', 'moved'].map((s) => `planner.status.${s}`),
      ...['pending', 'done', 'skipped'].map((s) => `workout.status.${s}`),
      ...['max_weight', 'max_reps', 'max_volume', 'est_1rm', 'max_duration', 'max_distance', 'best_pace'].map((k) => `records.kinds.${k}`),
      ...['weight', 'reps', 'est1rm', 'volume', 'duration', 'distance'].map((k) => `exercise.metric.${k}`),
      ...['duration', 'distance', 'calories', 'speed'].map((k) => `cardio.errors.${k}`),
      ...['front', 'side', 'back', 'other'].map((k) => `photos.poses.${k}`),
      ...['monthly', 'annual', 'lifetime', 'unknown'].map((k) => `paywall.plan.${k}`),
      ...['all', 'favorites', 'recent', 'custom'].map((k) => `library.scope.${k}`),
      ...['kg', 'lb', 'km', 'mi', 'cm', 'in'].map((u) => `units.${u}`),
      ...['home', 'workouts', 'planner', 'progress', 'profile'].map((k) => `tabs.${k}`),
    ].filter((k) => !known.has(k));
    expect(missing).toEqual([]);
  });

  it('notification texts never interpolate personal data', () => {
    for (const lng of INTERFACE_LANGUAGES) {
      const n = (resources[lng] as { notifications: Record<string, { title?: string; body?: string }> }).notifications;
      for (const k of ['workout', 'routine', 'weeklyGoal', 'challenge', 'summary']) {
        expect(n[k]?.title).not.toMatch(/{{/);
        expect(n[k]?.body).not.toMatch(/{{/);
      }
    }
    expect(NOTIFICATION_PREFIX).toBe('fittrack-');
  });
});

describe('interface strings used in code', () => {
  it('every static t() key used in app code exists in English', () => {
    const roots = [path.join(__dirname, '..', '..', 'app'), path.join(__dirname, '..')];
    const files: string[] = [];
    const walk = (dir: string) =>
      fs.readdirSync(dir, { withFileTypes: true }).forEach((e) => {
        const p = path.join(dir, e.name);
        if (e.isDirectory() && !['__tests__', 'i18n', 'content'].includes(e.name)) walk(p);
        else if (/\.(tsx?)$/.test(e.name)) files.push(p);
      });
    roots.forEach(walk);
    const missing: string[] = [];
    for (const f of files) {
      const src = fs.readFileSync(f, 'utf8');
      for (const m of src.matchAll(/\bt\(\s*'([a-zA-Z0-9_.]+)'/g)) if (!known.has(m[1]!)) missing.push(`${path.basename(f)}: ${m[1]}`);
      for (const m of src.matchAll(/(?:titleKey|bodyKey): '([a-zA-Z0-9_.]+)'/g)) if (!known.has(m[1]!)) missing.push(`${path.basename(f)}: ${m[1]}`);
    }
    expect(missing).toEqual([]);
  });

  it('plural keys resolve with counts in every language', async () => {
    for (const lng of INTERFACE_LANGUAGES) {
      const i18n = await initI18n(lng, []);
      const t = i18n.t.bind(i18n);
      for (const key of ['home.days', 'home.weeks', 'home.setCount', 'units.reps', 'units.minutesShort', 'picker.add', 'summary.records', 'challenges.daysLeft', 'workouts.dayCount', 'library.resultCount']) {
        for (const count of [1, 3]) {
          const out = String(t(key, { count }));
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
