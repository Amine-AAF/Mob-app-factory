import type { AnswerStructure } from '@/types/content';

/**
 * Answer Builder templates. Each structure is a list of sections; labels and hints
 * are UI strings (builder.section.<key>.label / .hint). The user writes each part,
 * and the parts are joined into one answer they can copy, edit and compare.
 */
export const STRUCTURE_SECTIONS: Record<AnswerStructure, readonly string[]> = {
  star: ['situation', 'task', 'action', 'result'],
  motivation: ['motivation', 'experience', 'skills', 'contribution'],
  'present-past-future': ['present', 'past', 'future'],
  technical: ['definition', 'how', 'example', 'tradeoffs'],
  negotiation: ['range', 'justification', 'flexibility', 'close'],
};

export const BUILDER_STRUCTURES: readonly AnswerStructure[] = ['star', 'motivation', 'present-past-future', 'technical', 'negotiation'];

/** Maximum length of one section, to keep answers speakable and storage bounded. */
export const SECTION_MAX_LENGTH = 1200;

export type AnswerFields = Record<string, string>;

/** Joins non-empty sections into a single answer, in template order. */
export function composeAnswer(structure: AnswerStructure, fields: AnswerFields): string {
  return STRUCTURE_SECTIONS[structure]
    .map((key) => (fields[key] ?? '').trim())
    .filter((text) => text.length > 0)
    .join('\n\n');
}

export function wordCount(text: string): number {
  const words = text.trim().split(/\s+/u).filter(Boolean);
  return words.length;
}

/** Estimated speaking time in seconds at a calm interview pace (~130 words per minute). */
export function speakingSeconds(text: string): number {
  return Math.round((wordCount(text) / 130) * 60);
}

/** Sections the user has not filled yet. */
export function missingSections(structure: AnswerStructure, fields: AnswerFields): string[] {
  return STRUCTURE_SECTIONS[structure].filter((k) => (fields[k] ?? '').trim().length === 0);
}

/** Simple, transparent checks: no hidden scoring and no claim of AI evaluation. */
export interface AnswerCheck {
  key: 'complete' | 'length' | 'result-measurable' | 'first-person';
  ok: boolean;
}

export function checkAnswer(structure: AnswerStructure, fields: AnswerFields): AnswerCheck[] {
  const text = composeAnswer(structure, fields);
  const seconds = speakingSeconds(text);
  const checks: AnswerCheck[] = [
    { key: 'complete', ok: missingSections(structure, fields).length === 0 },
    { key: 'length', ok: seconds >= 30 && seconds <= 150 },
  ];
  if (structure === 'star') {
    checks.push({ key: 'result-measurable', ok: /\d/.test(fields.result ?? '') });
    // Encourages "I did" over "we did": counts English, French and Spanish first-person markers.
    checks.push({ key: 'first-person', ok: /\b(I|I'm|I've|je|j'|yo|me)\b/iu.test(fields.action ?? '') });
  }
  return checks;
}
