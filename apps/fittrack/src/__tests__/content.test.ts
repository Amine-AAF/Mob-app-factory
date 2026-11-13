import fs from 'fs';
import path from 'path';

import { LIBRARY } from '@/content/exercises';
import { TEMPLATES } from '@/content/templates';
import { EQUIPMENT, EXERCISE_CATEGORIES, LEVELS, MUSCLE_GROUPS, PROGRAM_GOALS, PROGRAM_TYPES, TRACKING_TYPES } from '@/content/types';

const LANGS = ['en', 'fr', 'es'] as const;
const byId = new Map(LIBRARY.map((e) => [e.id, e]));

/** Rows of docs/exercise-catalog.md: | id | name | equipment | tracking | */
const catalog = fs
  .readFileSync(path.join(__dirname, '..', '..', 'docs', 'exercise-catalog.md'), 'utf8')
  .split('\n')
  .filter((l) => /^\| [a-z0-9]+(-[a-z0-9]+)* \|/.test(l) && !l.startsWith('| id |'))
  .map((l) => l.split('|').map((c) => c.trim()))
  .map(([, id, name, equipment, tracking]) => ({ id: id!, name: name!, equipment: equipment!.split(',').map((s) => s.trim()), tracking: tracking! }));
const TRACK: Record<string, string> = { W: 'weight_reps', R: 'reps', T: 'time', D: 'distance_time' };

describe('exercise library', () => {
  it('has at least 200 exercises with unique, stable ids', () => {
    expect(LIBRARY.length).toBeGreaterThanOrEqual(200);
    expect(new Set(LIBRARY.map((e) => e.id)).size).toBe(LIBRARY.length);
    expect(LIBRARY.every((e) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(e.id))).toBe(true);
  });

  it('matches the documented catalog (ids, English names, equipment, tracking)', () => {
    expect(catalog.length).toBe(LIBRARY.length);
    const problems = catalog.filter((c) => {
      const e = byId.get(c.id);
      return !e || e.i18n.en.name !== c.name || e.equipment.join(',') !== c.equipment.join(',') || e.tracking !== TRACK[c.tracking];
    });
    expect(problems.map((p) => p.id)).toEqual([]);
  });

  it('covers every category and every equipment type', () => {
    for (const c of EXERCISE_CATEGORIES) expect(LIBRARY.filter((e) => e.category === c).length).toBeGreaterThanOrEqual(10);
    for (const q of EQUIPMENT) expect(LIBRARY.some((e) => e.equipment.includes(q))).toBe(true);
  });

  it('uses only known enum values and coherent muscles', () => {
    const bad = LIBRARY.filter(
      (e) =>
        !EXERCISE_CATEGORIES.includes(e.category) ||
        !MUSCLE_GROUPS.includes(e.primary) ||
        e.secondary.some((m) => !MUSCLE_GROUPS.includes(m) || m === e.primary) ||
        e.equipment.some((q) => !EQUIPMENT.includes(q)) ||
        !LEVELS.includes(e.level) ||
        !TRACKING_TYPES.includes(e.tracking),
    );
    expect(bad.map((e) => e.id)).toEqual([]);
  });

  it('easier / harder links point to existing, different exercises', () => {
    const bad = LIBRARY.filter((e) => (e.easierId && (!byId.has(e.easierId) || e.easierId === e.id)) || (e.harderId && (!byId.has(e.harderId) || e.harderId === e.id)));
    expect(bad.map((e) => e.id)).toEqual([]);
  });

  it.each(LANGS)('every exercise is fully written in %s', (lng) => {
    const bad = LIBRARY.filter((e) => {
      const x = e.i18n[lng];
      return (
        !x?.name?.trim() || !x.description?.trim() || x.steps.length < 3 || x.steps.length > 6 || x.tips.length < 2 || x.mistakes.length < 2 ||
        !x.easier?.trim() || !x.harder?.trim() || [...x.steps, ...x.tips, ...x.mistakes].some((s) => !s.trim())
      );
    });
    expect(bad.map((e) => e.id)).toEqual([]);
  });

  it('fr / es are translated (names differ from English for most exercises)', () => {
    for (const lng of ['fr', 'es'] as const) {
      const same = LIBRARY.filter((e) => e.i18n[lng].description === e.i18n.en.description);
      expect(same).toEqual([]);
    }
  });

  it('never claims videos, sensors or medical outcomes', () => {
    const text = JSON.stringify(LIBRARY).toLowerCase();
    for (const w of [/\bvideos?\b/, /vidéo/, /burns? fat/, /\bcures?\b/, /\bguaranteed\b/, /\bgaranti(e|s)?\b/]) expect(text).not.toMatch(w);
  });
});

describe('workout templates', () => {
  it('ships at least 30 templates with unique ids and valid metadata', () => {
    expect(TEMPLATES.length).toBeGreaterThanOrEqual(30);
    expect(new Set(TEMPLATES.map((t) => t.id)).size).toBe(TEMPLATES.length);
    for (const t of TEMPLATES) {
      expect(PROGRAM_TYPES).toContain(t.type);
      expect(PROGRAM_GOALS).toContain(t.goal);
      expect(LEVELS).toContain(t.level);
      expect(t.estMinutes).toBeGreaterThan(5);
      expect(t.days.length).toBeGreaterThan(0);
      for (const l of LANGS) {
        expect(t.i18n[l].name.trim()).not.toBe('');
        expect(t.i18n[l].description.trim()).not.toBe('');
        for (const d of t.days) expect(d.name[l].trim()).not.toBe('');
      }
    }
  });

  it('has a free path for beginners and premium content', () => {
    expect(TEMPLATES.filter((t) => !t.premium && t.level === 'beginner').length).toBeGreaterThanOrEqual(5);
    expect(TEMPLATES.some((t) => t.premium)).toBe(true);
  });

  it('references existing exercises with targets matching their tracking type', () => {
    const problems: string[] = [];
    for (const t of TEMPLATES)
      for (const d of t.days)
        for (const x of d.exercises) {
          const e = byId.get(x.exerciseId);
          if (!e) {
            problems.push(`${t.id}: unknown ${x.exerciseId}`);
            continue;
          }
          if (x.sets < 1 || x.restSec < 0) problems.push(`${t.id}/${x.exerciseId}: sets/rest`);
          const reps = x.repsMin !== undefined && x.repsMax !== undefined && x.repsMin <= x.repsMax && x.repsMin > 0;
          if ((e.tracking === 'weight_reps' || e.tracking === 'reps') && !reps) problems.push(`${t.id}/${x.exerciseId}: reps`);
          if ((e.tracking === 'time' || e.tracking === 'distance_time') && !(x.durationSec && x.durationSec > 0)) problems.push(`${t.id}/${x.exerciseId}: duration`);
        }
    expect(problems).toEqual([]);
  });
});
