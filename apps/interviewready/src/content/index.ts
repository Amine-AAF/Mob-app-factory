import type { CategoryId, ContentLocale, Question, QuestionCore, QuestionPack, QuizItem, QuizPack } from '@/types/content';

import { questionPacks, quizPacks } from './data';

/**
 * Read access to the bundled content. Everything is local (offline-first) and
 * resolved once per language, then memoised: ~500 questions fit comfortably in memory.
 */

export const CONTENT_VERSION = 1;

const questionCache = new Map<ContentLocale, Question[]>();
const quizCache = new Map<ContentLocale, QuizItem[]>();
let questionIndex: Map<string, QuestionCore> | null = null;

function resolveQuestions(packs: readonly QuestionPack[], locale: ContentLocale): Question[] {
  const out: Question[] = [];
  for (const pack of packs) {
    for (const core of pack.core) {
      // Validation guarantees every language is present; English is a defensive fallback only.
      const text = pack.text[locale]?.[core.id] ?? pack.text.en[core.id];
      if (text) out.push({ ...core, ...text, language: locale });
    }
  }
  return out;
}

function resolveQuizzes(packs: readonly QuizPack[], locale: ContentLocale): QuizItem[] {
  const out: QuizItem[] = [];
  for (const pack of packs) {
    for (const core of pack.core) {
      const text = pack.text[locale]?.[core.id] ?? pack.text.en[core.id];
      if (text) out.push({ ...core, ...text, language: locale });
    }
  }
  return out;
}

export function allQuestions(locale: ContentLocale): Question[] {
  let list = questionCache.get(locale);
  if (!list) {
    list = resolveQuestions(questionPacks, locale);
    questionCache.set(locale, list);
  }
  return list;
}

export function allQuizzes(locale: ContentLocale): QuizItem[] {
  let list = quizCache.get(locale);
  if (!list) {
    list = resolveQuizzes(quizPacks, locale);
    quizCache.set(locale, list);
  }
  return list;
}

export function getQuestion(id: string, locale: ContentLocale): Question | undefined {
  return allQuestions(locale).find((q) => q.id === id);
}

/** Language-neutral lookup (no text), cheap enough for repositories and planners. */
export function questionCore(id: string): QuestionCore | undefined {
  if (!questionIndex) {
    questionIndex = new Map();
    for (const pack of questionPacks) for (const c of pack.core) questionIndex.set(c.id, c);
  }
  return questionIndex.get(id);
}

export function allQuestionCores(): QuestionCore[] {
  return questionPacks.flatMap((p) => p.core);
}

export function questionIds(): Set<string> {
  return new Set(allQuestionCores().map((c) => c.id));
}

export interface ContentStats {
  questions: number;
  quizzes: number;
  byCategory: Record<CategoryId, number>;
  premium: number;
}

export function contentStats(): ContentStats {
  const cores = allQuestionCores();
  const byCategory = {} as Record<CategoryId, number>;
  for (const c of cores) byCategory[c.category] = (byCategory[c.category] ?? 0) + 1;
  return {
    questions: cores.length,
    quizzes: quizPacks.reduce((n, p) => n + p.core.length, 0),
    byCategory,
    premium: cores.filter((c) => c.premium).length,
  };
}

export { questionPacks, quizPacks };
