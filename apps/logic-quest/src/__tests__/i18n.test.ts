import { addDays } from '@factory/app-core';
import { basePluralKey, flattenKeys } from '@factory/localization';
import fs from 'fs';
import path from 'path';

import { CHALLENGES, DAILY_TEMPLATES } from '@/content';
import { dailyChallengeFor, describeChallenge } from '@/engine';
import { contentResources, contentTranslator, fixFrench, initI18n, INTERFACE_LANGUAGES, resources } from '@/i18n';

const keysOf = (obj: unknown) => flattenKeys(obj).sort();
const get = (obj: unknown, key: string): unknown => key.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], obj);
const placeholders = (s: string) => (s.match(/{{\s*\w+\s*}}/g) ?? []).sort();

describe.each([
  ['interface', resources],
  ['content', contentResources],
] as const)('%s translations', (_name, bundle) => {
  const en = keysOf(bundle.en);

  it.each(['fr', 'es'] as const)('%s has exactly the same keys as English', (lng) => {
    expect(keysOf(bundle[lng])).toEqual(en);
  });

  it.each(['fr', 'es'] as const)('%s keeps every placeholder and has no empty value', (lng) => {
    const problems: string[] = [];
    for (const key of en) {
      const source = get(bundle.en, key) as string;
      const target = get(bundle[lng], key) as string;
      if (typeof target !== 'string' || target.trim().length === 0) problems.push(`${key}: empty`);
      else if (JSON.stringify(placeholders(target)) !== JSON.stringify(placeholders(source))) problems.push(`${key}: placeholders differ`);
    }
    expect(problems).toEqual([]);
  });

  it.each(['fr', 'es'] as const)('%s is actually translated (not an English copy)', (lng) => {
    const identical = en.filter((k) => get(bundle.en, k) === get(bundle[lng], k));
    // Names, numbers, symbols and a few loanwords may legitimately be identical.
    expect(identical.length / en.length).toBeLessThan(0.15);
  });
});

describe('challenge content rendering', () => {
  const dailies = Array.from({ length: 60 }, (_, i) => dailyChallengeFor(addDays('2026-11-01', i), DAILY_TEMPLATES, CHALLENGES).challenge);

  it.each(INTERFACE_LANGUAGES)('renders every challenge in %s without missing keys or placeholders', async (lng) => {
    const i18n = await initI18n(lng, []);
    const t = contentTranslator(i18n, lng);
    const problems: string[] = [];
    for (const c of [...CHALLENGES, ...dailies]) {
      const text = describeChallenge(c, t);
      const all = [text.title, text.instructions, text.hint, text.answerLabel, ...text.prompt, ...text.optionLabels, ...text.explanation];
      for (const s of all) {
        if (/{{|}}/.test(s)) problems.push(`${c.id}: unresolved placeholder in "${s}"`);
        if (/\b(seq|pat|ded|ord|grid|logic|atom|kn|code|math|mem)\.[a-zA-Z]/.test(s)) problems.push(`${c.id}: missing key "${s}"`);
      }
      if (!text.title || !text.instructions || !text.hint || text.explanation.length === 0 || !text.answerLabel) problems.push(`${c.id}: incomplete text`);
    }
    expect(problems.slice(0, 20)).toEqual([]);
  });

  it('applies French elision in composed sentences', () => {
    expect(fixFrench('Si il pleut, alors le match est annulé.')).toBe('S’il pleut, alors le match est annulé.');
    expect(fixFrench('si ils viennent')).toBe('s’ils viennent');
    expect(fixFrench('Si elle vient')).toBe('Si elle vient');
  });

  it('localizes explanations in each language', async () => {
    const i18n = await initI18n('en', []);
    const seq = CHALLENGES.find((c) => c.id === 'seq-e-001');
    expect(seq).toBeDefined();
    const texts = INTERFACE_LANGUAGES.map((lng) => describeChallenge(seq!, contentTranslator(i18n, lng)).explanation[0]);
    expect(new Set(texts).size).toBe(3);
  });
});

describe('interface strings used in code', () => {
  it('every t() key used in app code exists in English', () => {
    const roots = [path.join(__dirname, '..', '..', 'app'), path.join(__dirname, '..')];
    const files: string[] = [];
    const walk = (dir: string) =>
      fs.readdirSync(dir, { withFileTypes: true }).forEach((e) => {
        const p = path.join(dir, e.name);
        if (e.isDirectory() && !['__tests__', 'engine', 'content', 'i18n'].includes(e.name)) walk(p);
        else if (/\.(tsx?)$/.test(e.name)) files.push(p);
      });
    roots.forEach(walk);
    const known = new Set(keysOf(resources.en).map(basePluralKey));
    const missing: string[] = [];
    for (const f of files) {
      const src = fs.readFileSync(f, 'utf8');
      for (const m of src.matchAll(/\bt\(\s*'([a-zA-Z]+\.[a-zA-Z0-9_.]+)'/g)) if (!known.has(m[1]!)) missing.push(`${path.basename(f)}: ${m[1]}`);
    }
    expect(missing).toEqual([]);
  });

  it('falls back to the device language, then English', async () => {
    expect((await initI18n(null, ['es-MX'])).language).toBe('es');
    expect((await initI18n(null, ['de-DE'])).language).toBe('en');
    expect((await initI18n('fr', ['es-ES'])).language).toBe('fr');
  });
});
