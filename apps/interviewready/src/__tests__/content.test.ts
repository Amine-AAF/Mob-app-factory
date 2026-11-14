import fs from 'fs';
import path from 'path';

import { allQuestionCores, contentStats, questionIds, questionPacks, quizPacks } from '@/content';
import { CATEGORY_META, JOB_ROLE_META, TOPIC_CATEGORY } from '@/content/taxonomy';
import { formatIssues, validateQuestionPacks, validateQuizPacks } from '@/content/validation';
import { CATEGORIES, JOB_ROLES, type QuestionPack, type QuestionText, type QuizPack } from '@/types/content';

/** A well-formed fixture, mutated by each negative test. */
function fixtureText(lang: string): QuestionText {
  return {
    question: `Tell me about yourself (${lang}).`,
    intent: `The interviewer wants a short, relevant overview of your profile (${lang}).`,
    expectedAnswer: `I am a backend developer with four years of experience building payment APIs. I started in a small agency, then joined a fintech where I led the migration of our billing service. I am now looking for a larger product team (${lang}).`,
    explanation: `A present-past-future structure keeps the answer short and points it toward the role you are applying for (${lang}).`,
    tips: [`Keep it under two minutes (${lang}).`, `End with why this role (${lang}).`],
    commonMistakes: [`Reciting your whole CV (${lang}).`],
    followUpQuestions: [`Why are you leaving your current job? (${lang})`],
  };
}

function fixture(): QuestionPack {
  return {
    core: [
      {
        id: 'gen-001',
        category: 'general',
        topic: 'introduction',
        kind: 'general',
        difficulty: 'beginner',
        jobRoles: [],
        skills: ['self-presentation'],
        structure: 'present-past-future',
        premium: false,
      },
    ],
    text: { en: { 'gen-001': fixtureText('en') }, fr: { 'gen-001': fixtureText('fr') }, es: { 'gen-001': fixtureText('es') } },
  };
}

describe('content validation rules', () => {
  it('accepts a well-formed pack', () => {
    expect(validateQuestionPacks([fixture()])).toEqual([]);
  });

  it('rejects duplicate ids across packs', () => {
    const issues = validateQuestionPacks([fixture(), fixture()]);
    expect(issues.some((i) => i.message === 'duplicate id')).toBe(true);
  });

  it('rejects empty answers and missing translations', () => {
    const p = fixture();
    p.text.fr['gen-001']!.expectedAnswer = '  ';
    delete p.text.es['gen-001'];
    const messages = validateQuestionPacks([p]).map((i) => `${i.locale}:${i.message}`);
    expect(messages).toContain('fr:expectedAnswer is empty');
    expect(messages).toContain('es:missing translation');
  });

  it('rejects a topic outside its category and an incoherent role', () => {
    const p = fixture();
    p.core[0]!.topic = 'docker';
    p.core[0]!.jobRoles = ['nope' as never];
    const messages = validateQuestionPacks([p]).map((i) => i.message);
    expect(messages).toContain('topic "docker" does not belong to category "general"');
    expect(messages).toContain('unknown job role "nope"');
  });

  it('rejects a role that does not study the category', () => {
    const p = fixture();
    p.core[0] = { ...p.core[0]!, id: 'java-001', category: 'java', topic: 'jvm', kind: 'technical', structure: 'technical', jobRoles: ['hr-specialist'] };
    for (const l of ['en', 'fr', 'es'] as const) p.text[l] = { 'java-001': fixtureText(l) };
    expect(validateQuestionPacks([p]).map((i) => i.message)).toContain('role "hr-specialist" does not study category "java"');
  });

  it('rejects an advanced question with a too-short answer (level/answer coherence)', () => {
    const p = fixture();
    p.core[0]!.difficulty = 'advanced';
    expect(validateQuestionPacks([p]).some((i) => i.message.startsWith('expectedAnswer too short for advanced'))).toBe(true);
  });

  it('rejects translation drift and untranslated questions', () => {
    const p = fixture();
    p.text.fr['gen-001']!.tips = [p.text.fr['gen-001']!.tips[0]!];
    p.text.es['gen-001']!.question = p.text.en['gen-001']!.question;
    const messages = validateQuestionPacks([p]).map((i) => `${i.locale}:${i.message}`);
    expect(messages).toContain('fr:tips: expected at least 2 item(s)');
    expect(messages).toContain('es:question is not translated');
  });

  it('rejects placeholder text and wrong id prefixes', () => {
    const p = fixture();
    p.core[0]!.id = 'beh-001';
    for (const l of ['en', 'fr', 'es'] as const) p.text[l] = { 'beh-001': { ...fixtureText(l), explanation: 'TODO write a real explanation for this question later on, with enough detail.' } };
    const messages = validateQuestionPacks([p]).map((i) => i.message);
    expect(messages).toContain('id must match "gen-NNN"');
    expect(messages).toContain('explanation contains placeholder text');
  });

  it('does not flag ordinary words such as Spanish "todo" as placeholders', () => {
    const p = fixture();
    p.text.es['gen-001']!.explanation = 'Una estructura clara ayuda a resumir todo tu recorrido en menos de dos minutos y enlazarlo con el puesto.';
    expect(validateQuestionPacks([p])).toEqual([]);
  });

  it('validates quizzes: options, answer index, related question', () => {
    const quiz: QuizPack = {
      core: [{ id: 'q-gen-001', type: 'mcq', category: 'general', topic: 'introduction', difficulty: 'beginner', correctIndex: 5, relatedQuestionId: 'gen-404', premium: false }],
      text: {
        en: { 'q-gen-001': { prompt: 'Which structure suits "Tell me about yourself"?', options: ['A', 'A'], explanation: 'Present, past, future keeps the answer short and relevant.' } },
        fr: {},
        es: {},
      },
    };
    const messages = validateQuizPacks([quiz], new Set(['gen-001'])).map((i) => i.message);
    expect(messages).toEqual(expect.arrayContaining(['MCQ needs 3 or 4 options', 'correctIndex out of range', 'duplicate options', 'relatedQuestionId "gen-404" does not exist', 'missing translation']));
  });
});

describe('taxonomy', () => {
  it('maps every topic to exactly one category', () => {
    const all = CATEGORIES.flatMap((c) => CATEGORY_META[c].topics);
    expect(new Set(all).size).toBe(all.length);
    for (const t of all) expect(CATEGORIES).toContain(TOPIC_CATEGORY[t]);
  });

  it('gives every job role a coherent focus', () => {
    for (const r of JOB_ROLES) {
      const meta = JOB_ROLE_META[r];
      expect(meta.focus.length).toBeGreaterThan(0);
      for (const topic of meta.coreTopics) expect(meta.focus).toContain(TOPIC_CATEGORY[topic]);
    }
  });
});

describe('bundled library', () => {
  it('passes every validation rule', () => {
    const issues = [...validateQuestionPacks(questionPacks), ...validateQuizPacks(quizPacks, questionIds())];
    if (issues.length) throw new Error(`${issues.length} content issue(s):\n${formatIssues(issues)}`);
  });

  it('reports consistent statistics', () => {
    const stats = contentStats();
    expect(Object.values(stats.byCategory).reduce((a, b) => a + b, 0)).toBe(stats.questions);
  });

  it('reaches the v1 target of 500 questions in every category', () => {
    const stats = contentStats();
    expect(stats.questions).toBeGreaterThanOrEqual(500);
    for (const c of CATEGORIES) expect(stats.byCategory[c] ?? 0).toBeGreaterThan(0);
  });

  it('covers every topic with at least two questions', () => {
    const cores = allQuestionCores();
    const thin = CATEGORIES.flatMap((c) => CATEGORY_META[c].topics).filter((topic) => cores.filter((q) => q.topic === topic).length < 2);
    expect(thin).toEqual([]);
  });

  it('gives every job role a substantial, role-specific question set', () => {
    const cores = allQuestionCores();
    for (const role of JOB_ROLES) {
      const forRole = cores.filter((q) => q.jobRoles.length === 0 || q.jobRoles.includes(role));
      const specific = cores.filter((q) => q.jobRoles.includes(role));
      // Every role gets the shared general/behavioral/HR questions plus its own.
      expect(forRole.length).toBeGreaterThanOrEqual(150);
      expect(specific.length).toBeGreaterThanOrEqual(7);
      // Each role must have free questions so the free tier is usable.
      expect(specific.some((q) => !q.premium)).toBe(true);
    }
  });

  it('keeps a usable free tier (at least half of the library is free)', () => {
    const stats = contentStats();
    expect(stats.premium / stats.questions).toBeLessThanOrEqual(0.5);
  });

  it('keeps question text out of UI components', () => {
    const appDir = path.join(__dirname, '..', '..', 'app');
    const files: string[] = [];
    const walk = (dir: string) =>
      fs.readdirSync(dir, { withFileTypes: true }).forEach((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : files.push(path.join(dir, e.name))));
    walk(appDir);
    for (const f of files) expect(fs.readFileSync(f, 'utf8')).not.toMatch(/expectedAnswer:\s*['"`]/);
  });
});

describe('offline-first', () => {
  it('app code performs no network calls', () => {
    const roots = [path.join(__dirname, '..', '..', 'app'), path.join(__dirname, '..')];
    const offenders: string[] = [];
    const walk = (dir: string) =>
      fs.readdirSync(dir, { withFileTypes: true }).forEach((e) => {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) {
          // Content data is text shown to users (it may contain code samples such as fetch(url)).
          if (e.name !== '__tests__' && e.name !== 'data') walk(p);
        } else if (/\.tsx?$/.test(e.name) && /\b(fetch|XMLHttpRequest|axios)\s*\(/.test(fs.readFileSync(p, 'utf8'))) offenders.push(p);
      });
    roots.forEach(walk);
    expect(offenders).toEqual([]);
  });
});
