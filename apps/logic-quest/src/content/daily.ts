import type { DailyTemplate } from '@/engine';

/**
 * 30 daily-challenge templates. The template rotates with the local day; the
 * actual puzzle is generated from a seed derived from the date, so every day
 * brings a new, validated puzzle that is identical on every device.
 * Order alternates categories and difficulty across the week.
 */
export const DAILY_TEMPLATES: DailyTemplate[] = [
  { id: 'dt-01', difficulty: 'easy', generator: { kind: 'sequence', rules: ['arithmetic', 'geometric', 'stairs'] } },
  { id: 'dt-02', difficulty: 'medium', generator: { kind: 'pattern', board: 'row' } },
  { id: 'dt-03', difficulty: 'medium', generator: { kind: 'ordering' } },
  { id: 'dt-04', difficulty: 'easy', generator: { kind: 'memory', memory: 'sequence' } },
  { id: 'dt-05', difficulty: 'medium', generator: { kind: 'code' } },
  { id: 'dt-06', difficulty: 'medium', generator: { kind: 'sequence', rules: ['fibonacci', 'growingStep', 'triangular'] } },
  { id: 'dt-07', difficulty: 'hard', generator: { kind: 'pattern', board: 'matrix' } },
  { id: 'dt-08', difficulty: 'easy', generator: { kind: 'knights' } },
  { id: 'dt-09', difficulty: 'medium', generator: { kind: 'math' } },
  { id: 'dt-10', difficulty: 'medium', generator: { kind: 'memory', memory: 'pattern' } },
  { id: 'dt-11', difficulty: 'easy', generator: { kind: 'pattern', board: 'symmetry' } },
  { id: 'dt-12', difficulty: 'hard', generator: { kind: 'sequence', rules: ['cycleOps', 'affine', 'zigzag', 'interleave'] } },
  { id: 'dt-13', difficulty: 'easy', generator: { kind: 'logic' } },
  { id: 'dt-14', difficulty: 'medium', generator: { kind: 'grid' } },
  { id: 'dt-15', difficulty: 'easy', generator: { kind: 'pattern', board: 'analogy' } },
  { id: 'dt-16', difficulty: 'medium', generator: { kind: 'memory', memory: 'number' } },
  { id: 'dt-17', difficulty: 'hard', generator: { kind: 'ordering' } },
  { id: 'dt-18', difficulty: 'medium', generator: { kind: 'sequence', rules: ['power', 'pronic', 'primes'] } },
  { id: 'dt-19', difficulty: 'medium', generator: { kind: 'pattern', board: 'symmetry' } },
  { id: 'dt-20', difficulty: 'hard', generator: { kind: 'knights' } },
  { id: 'dt-21', difficulty: 'easy', generator: { kind: 'memory', memory: 'visual' } },
  { id: 'dt-22', difficulty: 'hard', generator: { kind: 'code' } },
  { id: 'dt-23', difficulty: 'easy', generator: { kind: 'sequence', rules: ['division', 'arithmetic', 'interleave'] } },
  { id: 'dt-24', difficulty: 'hard', generator: { kind: 'pattern', board: 'analogy' } },
  { id: 'dt-25', difficulty: 'medium', generator: { kind: 'logic' } },
  { id: 'dt-26', difficulty: 'hard', generator: { kind: 'memory', memory: 'sequence' } },
  { id: 'dt-27', difficulty: 'easy', generator: { kind: 'grid' } },
  { id: 'dt-28', difficulty: 'hard', generator: { kind: 'sequence', rules: ['primeGaps', 'doublingStep', 'factorialStep', 'tribonacci'] } },
  { id: 'dt-29', difficulty: 'easy', generator: { kind: 'pattern', board: 'matrix' } },
  { id: 'dt-30', difficulty: 'hard', generator: { kind: 'math' } },
];
