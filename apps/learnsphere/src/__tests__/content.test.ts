import { ACHIEVEMENTS } from '@/content/achievements';
import { QUIZ_BANKS } from '@/content';
import { questionSchema } from '@/content/schema';
import { templateLabelKeys, TEMPLATES } from '@/content/templates';
import { resources } from '@/i18n';

const get = (obj: unknown, key: string): unknown => key.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], obj);

describe('bundled quiz banks', () => {
  it('ships at least 100 questions in each of the four demo banks', () => {
    expect(QUIZ_BANKS.map((b) => b.id)).toEqual(['general', 'logic', 'math', 'science']);
    for (const bank of QUIZ_BANKS) expect(bank.questions.length).toBeGreaterThanOrEqual(100);
  });

  it('every question is valid, explained and has a unique id', () => {
    const ids = new Set<string>();
    for (const bank of QUIZ_BANKS) {
      for (const q of bank.questions) {
        const result = questionSchema.safeParse(q);
        if (!result.success) throw new Error(`${q.id}: ${result.error.issues.map((i) => i.message).join(', ')}`);
        expect(ids.has(q.id)).toBe(false);
        ids.add(q.id);
        expect(q.explanation.length).toBeGreaterThan(10);
      }
    }
  });

  it('covers every question type and difficulty in each bank', () => {
    for (const bank of QUIZ_BANKS) {
      expect(new Set(bank.questions.map((q) => q.type))).toEqual(new Set(['single', 'multiple', 'true_false', 'short_answer', 'matching']));
      expect(new Set(bank.questions.map((q) => q.difficulty))).toEqual(new Set([1, 2, 3]));
    }
  });

  it('spreads the correct option position so guessing a position does not work', () => {
    for (const bank of QUIZ_BANKS) {
      const positions = bank.questions.filter((q) => q.type === 'single').map((q) => (q as { correct: number }).correct);
      for (let p = 0; p < 4; p++) expect(positions.filter((x) => x === p).length / positions.length).toBeLessThan(0.4);
    }
  });

  it('has no duplicate prompts within a bank', () => {
    for (const bank of QUIZ_BANKS) {
      const prompts = bank.questions.map((q) => q.prompt.trim().toLowerCase());
      expect(new Set(prompts).size).toBe(prompts.length);
    }
  });

  it('every bank has a translated title', () => {
    for (const bank of QUIZ_BANKS) for (const lng of ['en', 'fr', 'es'] as const) expect(get(resources[lng], `quiz.banks.${bank.id}`)).toEqual(expect.any(String));
  });
});

describe('learning templates', () => {
  it('provides at least 20 templates with unique ids, free and premium', () => {
    expect(TEMPLATES.length).toBeGreaterThanOrEqual(20);
    expect(new Set(TEMPLATES.map((t) => t.id)).size).toBe(TEMPLATES.length);
    expect(TEMPLATES.filter((t) => !t.premium).length).toBeGreaterThanOrEqual(10);
    expect(TEMPLATES.some((t) => t.premium)).toBe(true);
  });

  it('covers every required kind of plan', () => {
    for (const c of ['university', 'exam', 'language', 'certification', 'routine', 'weekly', 'roadmap', 'reading']) expect(TEMPLATES.some((t) => t.category === c)).toBe(true);
  });

  it('has a valid rhythm, goals and structure', () => {
    for (const t of TEMPLATES) {
      expect(t.weeks).toBeGreaterThan(0);
      expect(t.sessions.days.length).toBeGreaterThan(0);
      expect(t.sessions.days.every((d) => d >= 1 && d <= 7)).toBe(true);
      expect(t.sessions.startMinute + t.sessions.minutes).toBeLessThanOrEqual(24 * 60);
      expect(t.courses.length).toBeGreaterThan(0);
      expect(t.goals.length).toBeGreaterThan(0);
    }
  });

  it('every template name, description and structure label is translated', () => {
    for (const lng of ['en', 'fr', 'es'] as const) {
      for (const t of TEMPLATES) {
        expect(get(resources[lng], `templates.items.${t.id}.name`)).toEqual(expect.any(String));
        expect(get(resources[lng], `templates.items.${t.id}.desc`)).toEqual(expect.any(String));
      }
      for (const key of templateLabelKeys()) expect(get(resources[lng], `templateLabels.${key}`)).toEqual(expect.any(String));
    }
  });
});

describe('achievements', () => {
  it('have unique ids, positive thresholds and translations', () => {
    expect(new Set(ACHIEVEMENTS.map((a) => a.id)).size).toBe(ACHIEVEMENTS.length);
    for (const a of ACHIEVEMENTS) {
      expect(a.threshold).toBeGreaterThan(0);
      for (const lng of ['en', 'fr', 'es'] as const) {
        expect(get(resources[lng], `achievements.items.${a.id}.title`)).toEqual(expect.any(String));
        expect(get(resources[lng], `achievements.items.${a.id}.desc`)).toEqual(expect.any(String));
      }
    }
  });
});
