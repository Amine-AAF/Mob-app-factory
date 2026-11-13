import { z } from 'zod';

/** Runtime validation of bundled and user-authored quiz questions. */
const base = {
  id: z.string().regex(/^[a-z0-9-]+$/),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  prompt: z.string().trim().min(3).max(400),
  explanation: z.string().trim().min(3).max(600),
  tags: z.array(z.string().min(1)).optional(),
};

const option = z.string().trim().min(1).max(200);

export const questionSchema = z.discriminatedUnion('type', [
  z
    .object({ ...base, type: z.literal('single'), options: z.array(option).min(2).max(6), correct: z.number().int().min(0) })
    .refine((q) => q.correct < q.options.length, 'correct out of range')
    .refine((q) => new Set(q.options).size === q.options.length, 'duplicate options'),
  z
    .object({ ...base, type: z.literal('multiple'), options: z.array(option).min(3).max(6), correct: z.array(z.number().int().min(0)).min(2) })
    .refine((q) => q.correct.every((c) => c < q.options.length), 'correct out of range')
    .refine((q) => new Set(q.correct).size === q.correct.length, 'duplicate correct index')
    .refine((q) => q.correct.length < q.options.length, 'at least one wrong option'),
  z.object({ ...base, type: z.literal('true_false'), correct: z.boolean() }),
  z.object({ ...base, type: z.literal('short_answer'), accepted: z.array(z.string().trim().min(1).max(80)).min(1).max(6) }),
  z
    .object({ ...base, type: z.literal('matching'), pairs: z.array(z.object({ left: option, right: option })).min(2).max(6) })
    .refine((q) => new Set(q.pairs.map((p) => p.right)).size === q.pairs.length, 'duplicate right values')
    .refine((q) => new Set(q.pairs.map((p) => p.left)).size === q.pairs.length, 'duplicate left values'),
]);
