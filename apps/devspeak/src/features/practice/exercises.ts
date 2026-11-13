import { seededShuffle } from '@factory/app-core';

import type { Lesson, QuizQuestion } from '@/content/types';

export type PracticeMode = 'listening' | 'readAloud' | 'completion' | 'dialogue' | 'interview' | 'explain';

export const PRACTICE_MODES: PracticeMode[] = ['listening', 'readAloud', 'completion', 'dialogue', 'interview', 'explain'];

export interface ListeningExercise {
  mode: 'listening';
  id: string;
  audio: string;
  options: string[];
  correctIndex: number;
}
export interface ReadAloudExercise {
  mode: 'readAloud';
  id: string;
  text: string;
  source: string;
}
export interface CompletionExercise {
  mode: 'completion';
  id: string;
  question: QuizQuestion;
}
export interface DialogueExercise {
  mode: 'dialogue';
  id: string;
  lesson: Pick<Lesson, 'id' | 'title' | 'dialogue'>;
}
export interface InterviewExercise {
  mode: 'interview';
  id: string;
  lessonId: string;
  question: string;
  exampleAnswer: string;
  selfAssessment: string[];
}
export interface ExplainExercise {
  mode: 'explain';
  id: string;
  lessonId: string;
  prompt: string;
  keywords: string[];
}

export type Exercise = ListeningExercise | ReadAloudExercise | CompletionExercise | DialogueExercise | InterviewExercise | ExplainExercise;

/** Sentences suitable for listening/reading: 4–22 words. */
function sentences(lessons: Lesson[]): { text: string; lessonId: string }[] {
  const out: { text: string; lessonId: string }[] = [];
  for (const l of lessons) {
    for (const e of l.expressions) out.push({ text: e.phrase, lessonId: l.id });
    for (const line of l.dialogue.lines) out.push({ text: line.text, lessonId: l.id });
  }
  return out.filter((s) => {
    const n = s.text.split(/\s+/).length;
    return n >= 4 && n <= 22;
  });
}

/**
 * Builds one exercise of the given mode from accessible content.
 * Deterministic for a given seed (tests + no repeated item on re-render).
 */
export function buildExercise(mode: PracticeMode, lessons: Lesson[], fillQuestions: QuizQuestion[], seed: number, preferredLessonId?: string): Exercise | null {
  const pick = <T,>(items: T[]): T | undefined => seededShuffle(items, seed)[0];
  switch (mode) {
    case 'listening': {
      const pool = sentences(lessons);
      const [target, ...rest] = seededShuffle(pool, seed);
      if (!target) return null;
      const distractors = rest.filter((s) => s.text !== target.text).slice(0, 2).map((s) => s.text);
      if (distractors.length < 2) return null;
      const options = seededShuffle([target.text, ...distractors], seed + 7);
      return { mode, id: `listening:${target.lessonId}:${seed}`, audio: target.text, options, correctIndex: options.indexOf(target.text) };
    }
    case 'readAloud': {
      const s = pick(sentences(lessons));
      return s ? { mode, id: `read:${s.lessonId}:${seed}`, text: s.text, source: s.lessonId } : null;
    }
    case 'completion': {
      const q = pick(fillQuestions);
      return q ? { mode, id: `fill:${q.id}`, question: q } : null;
    }
    case 'dialogue': {
      const l = pick(lessons.filter((x) => x.dialogue.lines.length >= 4));
      return l ? { mode, id: `dialogue:${l.id}`, lesson: { id: l.id, title: l.title, dialogue: l.dialogue } } : null;
    }
    case 'interview': {
      const pool = lessons.filter((x) => x.interview);
      const l = pool.find((x) => x.id === preferredLessonId) ?? pick(pool);
      if (!l?.interview) return null;
      return { mode, id: `interview:${l.id}`, lessonId: l.id, question: l.interview.question, exampleAnswer: l.interview.exampleAnswer, selfAssessment: l.interview.selfAssessment };
    }
    case 'explain': {
      const l = pick(lessons.filter((x) => x.moduleId === 'technical'));
      return l ? { mode, id: `explain:${l.id}`, lessonId: l.id, prompt: l.objective, keywords: l.vocabulary.map((v) => v.term).slice(0, 5) } : null;
    }
  }
}
