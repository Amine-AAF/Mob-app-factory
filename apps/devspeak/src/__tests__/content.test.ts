import { dailyChallenges, interviewPaths, lessons, vocabulary } from '@/content';
import { dailyChallengeSchema, lessonSchema, vocabularySchema } from '@/content/schema';

/** Content completeness gate: CI fails if bundled content is incomplete or inconsistent. */
describe('educational content', () => {
  const byModule = (m: string) => lessons.filter((l) => l.moduleId === m);

  it('meets the minimum library size', () => {
    expect(byModule('workplace').length).toBeGreaterThanOrEqual(20);
    expect(byModule('technical').length).toBeGreaterThanOrEqual(25);
    expect(byModule('interview').length).toBeGreaterThanOrEqual(20);
    expect(vocabulary.length).toBeGreaterThanOrEqual(100);
    expect(dailyChallenges.length).toBeGreaterThanOrEqual(14);
    const quizzes = lessons.filter((l) => l.quiz.length > 0).length + dailyChallenges.length;
    expect(quizzes).toBeGreaterThanOrEqual(30);
    expect(lessons.filter((l) => l.dialogue.lines.length >= 6).length).toBeGreaterThanOrEqual(20);
  });

  it.each(lessons.map((l) => [l.id, l] as const))('lesson %s is complete and valid', (_id, lesson) => {
    const r = lessonSchema.safeParse(lesson);
    if (!r.success) throw new Error(r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n'));
    if (lesson.moduleId === 'interview') expect(lesson.interview).toBeDefined();
    else expect(lesson.interview).toBeUndefined();
    lesson.quiz.forEach((q, i) => expect(q.id).toBe(`${lesson.id}-q${i + 1}`));
  });

  it('every vocabulary entry is valid', () => {
    for (const v of vocabulary) {
      const r = vocabularySchema.safeParse(v);
      if (!r.success) throw new Error(`${v.id}: ${r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')}`);
    }
  });

  it('every daily challenge is valid and references an existing word', () => {
    const ids = new Set(vocabulary.map((v) => v.id));
    for (const c of dailyChallenges) {
      const r = dailyChallengeSchema.safeParse(c);
      if (!r.success) throw new Error(`${c.id}: ${r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')}`);
      expect(ids.has(c.techWordId)).toBe(true);
    }
  });

  it('ids and terms are unique', () => {
    const unique = <T,>(xs: T[]) => new Set(xs).size === xs.length;
    expect(unique(lessons.map((l) => l.id))).toBe(true);
    expect(unique(lessons.flatMap((l) => l.quiz.map((q) => q.id)))).toBe(true);
    expect(unique(vocabulary.map((v) => v.id))).toBe(true);
    expect(unique(vocabulary.map((v) => v.term.toLowerCase()))).toBe(true);
    expect(unique(dailyChallenges.map((c) => c.id))).toBe(true);
  });

  it('every interview path has at least two lessons', () => {
    for (const p of interviewPaths) expect(lessons.filter((l) => l.interview?.path === p).length).toBeGreaterThanOrEqual(2);
  });

  it('each module offers free lessons at every level a beginner needs', () => {
    for (const m of ['workplace', 'technical', 'interview']) {
      const free = byModule(m).filter((l) => !l.premium);
      expect(free.length).toBeGreaterThanOrEqual(4);
      expect(free.some((l) => l.level === 'beginner' || m === 'technical' || m === 'interview')).toBe(true);
    }
    expect(vocabulary.filter((v) => !v.premium).length).toBeGreaterThanOrEqual(30);
  });

  it('quiz answers are not always in the same position', () => {
    const positions = new Set(lessons.flatMap((l) => l.quiz.map((q) => q.correctIndex)));
    expect(positions.size).toBeGreaterThanOrEqual(3);
  });

  it('contains no placeholder text', () => {
    const text = JSON.stringify({ lessons, vocabulary, dailyChallenges });
    expect(text).not.toMatch(/lorem ipsum|\[placeholder\]/i);
    // Case-sensitive: Spanish "todo" (everything) is legitimate content.
    expect(text).not.toMatch(/\b(TODO|TBD|FIXME)\b/);
  });
});
