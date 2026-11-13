import {
  CATEGORIES,
  CONTENT_LOCALES,
  DIFFICULTIES,
  JOB_ROLES,
  SKILLS,
  type AnswerStructure,
  type CategoryId,
  type ContentLocale,
  type Difficulty,
  type QuestionCore,
  type QuestionKind,
  type QuestionPack,
  type QuestionText,
  type QuizCore,
  type QuizPack,
  type QuizText,
} from '@/types/content';

import { CATEGORY_META, JOB_ROLE_META, TOPIC_CATEGORY } from './taxonomy';

/**
 * Content validation. Pure functions returning human-readable issues so the
 * test suite (and `pnpm --filter interviewready validate:content`) can report
 * every problem at once instead of failing on the first one.
 */

export interface ContentIssue {
  id: string;
  locale?: ContentLocale;
  message: string;
}

const PLACEHOLDER = /\b(todo|tbd|lorem|ipsum|xxx|fixme|placeholder)\b|\[\s*(insert|à compléter|completar)/i;

/** Allowed question kinds per category. */
const KINDS_BY_CATEGORY: Record<CategoryId, QuestionKind[]> = {
  general: ['general'],
  behavioral: ['behavioral'],
  software: ['technical'],
  java: ['technical'],
  frontend: ['technical'],
  databases: ['technical'],
  devops: ['technical'],
  'ai-data': ['technical'],
  'job-specific': ['general', 'behavioral', 'technical'],
  'hr-salary': ['hr'],
};

/** Answer structures that make sense for each kind of question. */
const STRUCTURES_BY_KIND: Record<QuestionKind, AnswerStructure[]> = {
  general: ['present-past-future', 'motivation', 'star'],
  behavioral: ['star'],
  technical: ['technical'],
  hr: ['negotiation', 'motivation'],
};

/**
 * Minimum length of the expected answer per difficulty: an "advanced" question
 * answered in one line is a level/answer inconsistency.
 */
export const MIN_ANSWER_LENGTH: Record<Difficulty, number> = { beginner: 120, intermediate: 180, advanced: 260 };

const MIN_TEXT = { question: 12, intent: 40, explanation: 60 } as const;

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function checkStrings(issues: ContentIssue[], id: string, locale: ContentLocale, field: string, values: unknown, min: number): void {
  if (!Array.isArray(values) || values.length < min) {
    issues.push({ id, locale, message: `${field}: expected at least ${min} item(s)` });
    return;
  }
  values.forEach((v, i) => {
    if (typeof v !== 'string' || v.trim().length < 8) issues.push({ id, locale, message: `${field}[${i}] is empty or too short` });
    else if (PLACEHOLDER.test(v)) issues.push({ id, locale, message: `${field}[${i}] contains placeholder text` });
  });
}

export function validateQuestionCore(core: QuestionCore): ContentIssue[] {
  const issues: ContentIssue[] = [];
  const add = (message: string) => issues.push({ id: core.id, message });
  if (!CATEGORIES.includes(core.category)) {
    add(`unknown category "${core.category}"`);
    return issues;
  }
  const meta = CATEGORY_META[core.category];
  if (!new RegExp(`^${meta.idPrefix}-\\d{3}$`).test(core.id)) add(`id must match "${meta.idPrefix}-NNN"`);
  if (TOPIC_CATEGORY[core.topic] !== core.category) add(`topic "${core.topic}" does not belong to category "${core.category}"`);
  if (!KINDS_BY_CATEGORY[core.category].includes(core.kind)) add(`kind "${core.kind}" not allowed in category "${core.category}"`);
  if (!STRUCTURES_BY_KIND[core.kind]?.includes(core.structure)) add(`structure "${core.structure}" inconsistent with kind "${core.kind}"`);
  if (!DIFFICULTIES.includes(core.difficulty)) add(`unknown difficulty "${core.difficulty}"`);
  if (core.skills.length === 0) add('skills must not be empty');
  for (const s of core.skills) if (!SKILLS.includes(s)) add(`unknown skill "${s}"`);
  if (new Set(core.jobRoles).size !== core.jobRoles.length) add('duplicate job roles');
  for (const r of core.jobRoles) {
    if (!JOB_ROLES.includes(r)) {
      add(`unknown job role "${r}"`);
      continue;
    }
    // Category/role coherence: a role-tagged question must belong to a category in that role's interview.
    if (!JOB_ROLE_META[r].focus.includes(core.category)) add(`role "${r}" does not study category "${core.category}"`);
  }
  if (core.category === 'job-specific' && core.jobRoles.length === 0) add('job-specific questions must name at least one role');
  return issues;
}

export function validateQuestionText(core: QuestionCore, text: QuestionText | undefined, locale: ContentLocale): ContentIssue[] {
  const issues: ContentIssue[] = [];
  if (!text) return [{ id: core.id, locale, message: 'missing translation' }];
  const add = (message: string) => issues.push({ id: core.id, locale, message });
  const fields: [keyof typeof MIN_TEXT | 'expectedAnswer', number][] = [
    ['question', MIN_TEXT.question],
    ['intent', MIN_TEXT.intent],
    ['explanation', MIN_TEXT.explanation],
    ['expectedAnswer', MIN_ANSWER_LENGTH[core.difficulty]],
  ];
  for (const [field, min] of fields) {
    const v = text[field];
    if (typeof v !== 'string' || v.trim().length === 0) add(`${field} is empty`);
    else if (v.trim().length < min) add(`${field} too short for ${core.difficulty} (${v.trim().length} < ${min})`);
    else if (PLACEHOLDER.test(v)) add(`${field} contains placeholder text`);
  }
  if (text.example !== undefined && text.example.trim().length < 20) add('example is too short (omit it instead)');
  checkStrings(issues, core.id, locale, 'tips', text.tips, 2);
  checkStrings(issues, core.id, locale, 'commonMistakes', text.commonMistakes, 1);
  checkStrings(issues, core.id, locale, 'followUpQuestions', text.followUpQuestions, 1);
  return issues;
}

/** Validates packs together (uniqueness is global). */
export function validateQuestionPacks(packs: readonly QuestionPack[]): ContentIssue[] {
  const issues: ContentIssue[] = [];
  const seen = new Set<string>();
  const questionTexts: Record<ContentLocale, Map<string, string>> = { en: new Map(), fr: new Map(), es: new Map() };

  for (const pack of packs) {
    const ids = new Set(pack.core.map((c) => c.id));
    for (const core of pack.core) {
      if (seen.has(core.id)) issues.push({ id: core.id, message: 'duplicate id' });
      seen.add(core.id);
      issues.push(...validateQuestionCore(core));

      const en = pack.text.en[core.id];
      for (const locale of CONTENT_LOCALES) {
        const text = pack.text[locale]?.[core.id];
        issues.push(...validateQuestionText(core, text, locale));
        if (!text) continue;
        // Translation parity: same structure in every language.
        if (en && locale !== 'en') {
          for (const f of ['tips', 'commonMistakes', 'followUpQuestions'] as const) {
            if (text[f]?.length !== en[f]?.length) issues.push({ id: core.id, locale, message: `${f} count differs from English` });
          }
          if ((text.example === undefined) !== (en.example === undefined)) issues.push({ id: core.id, locale, message: 'example present in one language only' });
          if (text.question.trim() === en.question.trim()) issues.push({ id: core.id, locale, message: 'question is not translated' });
        }
        const key = normalize(text.question);
        const other = questionTexts[locale].get(key);
        if (other) issues.push({ id: core.id, locale, message: `same question text as ${other}` });
        else questionTexts[locale].set(key, core.id);
      }
    }
    for (const locale of CONTENT_LOCALES) {
      for (const id of Object.keys(pack.text[locale] ?? {})) {
        if (!ids.has(id)) issues.push({ id, locale, message: 'translation without core record' });
      }
    }
  }
  return issues;
}

export function validateQuizCore(core: QuizCore, questionIds: ReadonlySet<string>): ContentIssue[] {
  const issues: ContentIssue[] = [];
  const add = (message: string) => issues.push({ id: core.id, message });
  const meta = CATEGORY_META[core.category];
  if (!meta) return [{ id: core.id, message: `unknown category "${core.category}"` }];
  if (!new RegExp(`^q-${meta.idPrefix}-\\d{3}$`).test(core.id)) add(`id must match "q-${meta.idPrefix}-NNN"`);
  if (TOPIC_CATEGORY[core.topic] !== core.category) add(`topic "${core.topic}" does not belong to category "${core.category}"`);
  if (!DIFFICULTIES.includes(core.difficulty)) add(`unknown difficulty "${core.difficulty}"`);
  if (core.type === 'true-false' && core.correctIndex !== 0 && core.correctIndex !== 1) add('true/false correctIndex must be 0 or 1');
  if (core.relatedQuestionId && !questionIds.has(core.relatedQuestionId)) add(`relatedQuestionId "${core.relatedQuestionId}" does not exist`);
  return issues;
}

export function validateQuizText(core: QuizCore, text: QuizText | undefined, locale: ContentLocale): ContentIssue[] {
  if (!text) return [{ id: core.id, locale, message: 'missing translation' }];
  const issues: ContentIssue[] = [];
  const add = (message: string) => issues.push({ id: core.id, locale, message });
  if (!text.prompt || text.prompt.trim().length < 12) add('prompt is empty or too short');
  if (!text.explanation || text.explanation.trim().length < 40) add('explanation is empty or too short');
  if (PLACEHOLDER.test(text.prompt) || PLACEHOLDER.test(text.explanation)) add('placeholder text');
  if (core.type === 'mcq') {
    const opts = text.options ?? [];
    if (opts.length < 3 || opts.length > 4) add('MCQ needs 3 or 4 options');
    if (core.correctIndex < 0 || core.correctIndex >= opts.length) add('correctIndex out of range');
    if (new Set(opts.map(normalize)).size !== opts.length) add('duplicate options');
    if (opts.some((o) => o.trim().length === 0)) add('empty option');
  } else if (text.options !== undefined) add('true/false items must not define options');
  return issues;
}

export function validateQuizPacks(packs: readonly QuizPack[], questionIds: ReadonlySet<string>): ContentIssue[] {
  const issues: ContentIssue[] = [];
  const seen = new Set<string>();
  for (const pack of packs) {
    const ids = new Set(pack.core.map((c) => c.id));
    for (const core of pack.core) {
      if (seen.has(core.id)) issues.push({ id: core.id, message: 'duplicate id' });
      seen.add(core.id);
      issues.push(...validateQuizCore(core, questionIds));
      const en = pack.text.en[core.id];
      for (const locale of CONTENT_LOCALES) {
        const text = pack.text[locale]?.[core.id];
        issues.push(...validateQuizText(core, text, locale));
        if (text && en && locale !== 'en' && (text.options?.length ?? 0) !== (en.options?.length ?? 0)) {
          issues.push({ id: core.id, locale, message: 'option count differs from English' });
        }
      }
    }
    for (const locale of CONTENT_LOCALES) {
      for (const id of Object.keys(pack.text[locale] ?? {})) {
        if (!ids.has(id)) issues.push({ id, locale, message: 'translation without core record' });
      }
    }
  }
  return issues;
}

export function formatIssues(issues: readonly ContentIssue[]): string {
  return issues.map((i) => `${i.id}${i.locale ? ` [${i.locale}]` : ''}: ${i.message}`).join('\n');
}
