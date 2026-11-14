import type { CategoryId, Difficulty, QuizCore, QuizText, TopicId } from '@/types/content';

/**
 * Authoring helpers for quiz items. English items are written with their answer key
 * next to their options (fewer alignment mistakes); the pack index splits them into
 * a language-neutral core and an English text table.
 *
 * Translators keep options in the SAME ORDER, since correctIndex lives in the core.
 */
export type QuizItemSource = QuizCore & QuizText;

interface Common {
  category: CategoryId;
  topic: TopicId;
  difficulty: Difficulty;
  related?: string;
  premium?: boolean;
}

export function mcq(id: string, c: Common, prompt: string, options: string[], correctIndex: number, explanation: string): QuizItemSource {
  return {
    id,
    type: 'mcq',
    category: c.category,
    topic: c.topic,
    difficulty: c.difficulty,
    correctIndex,
    ...(c.related ? { relatedQuestionId: c.related } : {}),
    premium: c.premium ?? false,
    prompt,
    options,
    explanation,
  };
}

/** True/false item: correctIndex 0 = true, 1 = false. */
export function tf(id: string, c: Common, statement: string, isTrue: boolean, explanation: string): QuizItemSource {
  return {
    id,
    type: 'true-false',
    category: c.category,
    topic: c.topic,
    difficulty: c.difficulty,
    correctIndex: isTrue ? 0 : 1,
    ...(c.related ? { relatedQuestionId: c.related } : {}),
    premium: c.premium ?? false,
    prompt: statement,
    explanation,
  };
}

export function splitItems(items: readonly QuizItemSource[]): { core: QuizCore[]; text: Record<string, QuizText> } {
  const core: QuizCore[] = [];
  const text: Record<string, QuizText> = {};
  for (const { prompt, options, explanation, ...c } of items) {
    core.push(c);
    text[c.id] = options ? { prompt, options, explanation } : { prompt, explanation };
  }
  return { core, text };
}
