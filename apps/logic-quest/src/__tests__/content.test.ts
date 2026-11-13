import { CHALLENGES, CONTENT_VERSION, DAILY_TEMPLATES } from '@/content';
import { challengeSignature, checkAnswer, checkChallenge, correctAnswer, CATEGORIES, DIFFICULTIES, type Category, type Challenge, type Difficulty } from '@/engine';

/**
 * Content validation: the library must be large enough, unique, solvable,
 * unambiguous and correctly tagged. Run alone with `pnpm validate:content`.
 */
const of = (cat: Category) => CHALLENGES.filter((c) => c.category === cat);

describe('content library size', () => {
  it('meets the minimum record counts', () => {
    expect(of('sequence').length).toBeGreaterThanOrEqual(100);
    expect(of('pattern').length).toBeGreaterThanOrEqual(80);
    expect(of('deduction').length).toBeGreaterThanOrEqual(80);
    expect(of('memory').length).toBeGreaterThanOrEqual(60);
    expect(DAILY_TEMPLATES.length).toBeGreaterThanOrEqual(30);
    expect(CHALLENGES.length + DAILY_TEMPLATES.length).toBeGreaterThanOrEqual(350);
    expect(CONTENT_VERSION).toBeGreaterThan(0);
  });

  it.each(CATEGORIES)('offers every difficulty in %s', (cat) => {
    for (const d of DIFFICULTIES) expect(of(cat).filter((c) => c.difficulty === d).length).toBeGreaterThanOrEqual(20);
  });
});

describe('content integrity', () => {
  it('has unique ids', () => {
    const ids = [...CHALLENGES.map((c) => c.id), ...DAILY_TEMPLATES.map((t) => t.id)];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has no duplicate puzzles', () => {
    const seen = new Map<string, string>();
    const dupes: string[] = [];
    for (const c of CHALLENGES) {
      const sig = challengeSignature(c);
      if (seen.has(sig)) dupes.push(`${c.id} duplicates ${seen.get(sig)}`);
      seen.set(sig, c.id);
    }
    expect(dupes).toEqual([]);
  });

  it('passes every integrity check (valid answer, unique solution, unambiguous)', () => {
    const problems = CHALLENGES.flatMap((c) => checkChallenge(c).map((p) => `${c.id}: ${p}`));
    expect(problems).toEqual([]);
  });

  it('accepts the correct answer and rejects every wrong option', () => {
    const problems: string[] = [];
    for (const c of CHALLENGES) {
      if (!checkAnswer(c, correctAnswer(c))) problems.push(`${c.id}: correct answer rejected`);
      const optionCount = c.category === 'pattern' ? c.board.options.length : c.category === 'memory' ? (c.spec.kind === 'visual' ? 4 : 0) : c.input === 'choice' ? c.options.length : 0;
      const right = correctAnswer(c);
      for (let i = 0; i < optionCount; i++) {
        if (right.kind === 'option' && i === right.index) continue;
        if (checkAnswer(c, { kind: 'option', index: i })) problems.push(`${c.id}: wrong option ${i} accepted`);
      }
    }
    expect(problems).toEqual([]);
  });

  it('tags every challenge completely', () => {
    for (const c of CHALLENGES) {
      expect(c.id).toMatch(/^(seq|pat|ded|mem)-[emh]-\d{3}$/);
      expect(CATEGORIES).toContain(c.category);
      expect(DIFFICULTIES).toContain(c.difficulty);
      expect(c.skill).toBeTruthy();
      expect(c.estimatedSeconds).toBeGreaterThan(0);
      expect(c.xp).toBeGreaterThan(0);
    }
  });
});

describe('difficulty assignment', () => {
  const XP: Record<Difficulty, number> = { easy: 10, medium: 20, hard: 30 };

  it('ties XP and Premium gating to difficulty', () => {
    for (const c of CHALLENGES) {
      expect(c.xp).toBe(XP[c.difficulty]);
      expect(c.premium).toBe(c.difficulty === 'hard');
      expect(c.id.split('-')[1]).toBe(c.difficulty[0]);
    }
  });

  it('numbers positions contiguously inside each category and difficulty', () => {
    for (const cat of CATEGORIES)
      for (const d of DIFFICULTIES) {
        const positions = CHALLENGES.filter((c) => c.category === cat && c.difficulty === d).map((c) => c.position).sort((a, b) => a - b);
        expect(positions).toEqual(positions.map((_, i) => i));
      }
  });

  /** A rough, independent measure of cognitive load; harder tiers must be heavier on average. */
  function load(c: Challenge): number {
    switch (c.category) {
      case 'sequence': {
        const kindWeight: Record<string, number> = { arithmetic: 1, stairs: 1, geometric: 2, division: 2, fibonacci: 2, triangular: 2, power: 2, pronic: 2, primes: 2, interleave: 2, growingStep: 2 };
        return (kindWeight[c.rule.kind] ?? 3) + (c.input === 'keypad' ? 1 : 0) + (c.missingIndex < c.terms.length - 1 ? 0.5 : 0);
      }
      case 'pattern': {
        const r = c.rule;
        if (r.type === 'row') return Object.values(r.glyph).filter((a) => a && ('step' in a ? a.step !== 0 : a.cycle.length > 1)).length;
        if (r.type === 'matrix') return Object.values(r.glyph).filter((a) => a && a.by !== 'const').length;
        if (r.type === 'analogy') return r.transforms.length;
        return r.half.length * r.half[0]!.length / 8 + (r.axis === 'rotational' ? 1 : 0);
      }
      case 'deduction': {
        const s = c.spec;
        if (s.type === 'ordering') return s.people.length + s.clues.length / 2;
        if (s.type === 'grid') return s.people.length + s.clues.length / 2;
        if (s.type === 'knights') return s.people.length * 2;
        if (s.type === 'code') return s.digits * 2;
        if (s.type === 'logic') return s.premises.length * 2;
        return 3;
      }
      case 'memory': {
        const s = c.spec;
        if (s.kind === 'sequence') return s.length * (s.tiles / 4);
        if (s.kind === 'pattern') return s.lit * (s.rows / 3);
        if (s.kind === 'number') return s.digits * (s.reverse ? 1.6 : 1);
        return s.shown;
      }
    }
  }

  it.each(CATEGORIES)('average load increases from easy to hard in %s', (cat) => {
    const mean = (d: Difficulty) => {
      const list = of(cat).filter((c) => c.difficulty === d);
      return list.reduce((s, c) => s + load(c), 0) / list.length;
    };
    expect(mean('medium')).toBeGreaterThan(mean('easy'));
    expect(mean('hard')).toBeGreaterThan(mean('medium'));
  });
});
