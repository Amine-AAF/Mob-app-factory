import { z } from 'zod';

/** Runtime validation of bundled content (used by tests and by `pnpm validate:content`). */

const nonEmpty = z.string().trim().min(2);
const translated = z.object({ fr: nonEmpty, es: nonEmpty });
const level = z.enum(['beginner', 'intermediate', 'advanced']);

export const quizQuestionSchema = z
  .object({
    id: z.string().min(1),
    type: z.enum(['choice', 'fill']),
    prompt: nonEmpty,
    options: z.array(nonEmpty).min(2).max(5),
    correctIndex: z.number().int().min(0),
    explanation: nonEmpty,
  })
  .superRefine((q, ctx) => {
    if (q.correctIndex >= q.options.length) ctx.addIssue({ code: 'custom', message: `${q.id}: correctIndex out of range` });
    if (new Set(q.options.map((o) => o.toLowerCase())).size !== q.options.length) ctx.addIssue({ code: 'custom', message: `${q.id}: duplicate options` });
    if (q.type === 'fill' && q.prompt.split('___').length !== 2) ctx.addIssue({ code: 'custom', message: `${q.id}: fill prompt needs exactly one ___` });
  });

const expression = z.object({ phrase: nonEmpty, usage: nonEmpty, translation: translated });
const dialogue = z.object({
  context: nonEmpty,
  lines: z.array(z.object({ speaker: nonEmpty, text: nonEmpty, translation: translated })).min(3),
});

export const lessonSchema = z.object({
  id: z.string().regex(/^(wp|te|iv)-\d{2}$/),
  moduleId: z.enum(['workplace', 'technical', 'interview']),
  topic: nonEmpty,
  title: nonEmpty,
  titleTranslation: translated,
  level,
  premium: z.boolean(),
  estimatedMinutes: z.number().int().min(3).max(20),
  roles: z.array(z.enum(['any', 'java', 'react', 'fullstack', 'devops', 'qa', 'architect', 'student'])).min(1),
  objective: nonEmpty,
  objectiveTranslation: translated,
  situation: nonEmpty,
  situationTranslation: translated,
  vocabulary: z.array(z.object({ term: nonEmpty, definition: nonEmpty, translation: translated })).min(4),
  expressions: z.array(expression).min(4),
  dialogue: dialogue.extend({ lines: dialogue.shape.lines.min(6) }),
  quiz: z.array(quizQuestionSchema).min(3),
  interview: z
    .object({
      path: z.enum(['junior', 'java', 'spring', 'react', 'fullstack', 'devops', 'qa', 'architect']),
      question: nonEmpty,
      questionTranslation: translated,
      explanation: nonEmpty,
      explanationTranslation: translated,
      exampleAnswer: z.string().min(200),
      exampleAnswerTranslation: translated,
      alternatives: z.array(nonEmpty).min(2),
      practice: nonEmpty,
      selfAssessment: z.array(nonEmpty).min(3),
    })
    .optional(),
});

export const vocabularySchema = z.object({
  id: z.string().regex(/^v-\d{3}$/),
  term: nonEmpty,
  definition: nonEmpty,
  translation: translated,
  example: nonEmpty,
  category: z.enum(['programming', 'web', 'architecture', 'data', 'devops', 'cloud', 'testing', 'security', 'agile', 'collaboration']),
  difficulty: level,
  pronounceable: z.boolean(),
  premium: z.boolean(),
});

export const dailyChallengeSchema = z.object({
  id: z.string().regex(/^dc-\d{2}$/),
  objective: nonEmpty,
  objectiveTranslation: translated,
  expression,
  techWordId: z.string().regex(/^v-\d{3}$/),
  dialogue,
  quiz: quizQuestionSchema,
});
