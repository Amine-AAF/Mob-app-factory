import type { JobRoleId, QuestionCore } from '@/types/content';

const ML: JobRoleId[] = ['data-scientist', 'ai-engineer'];
const ALL: JobRoleId[] = ['data-scientist', 'ai-engineer', 'data-engineer'];
const GENAI: JobRoleId[] = ['ai-engineer', 'data-scientist'];
const DE: JobRoleId[] = ['data-engineer', 'data-scientist', 'ai-engineer'];

const q = (
  id: string,
  topic: QuestionCore['topic'],
  difficulty: QuestionCore['difficulty'],
  jobRoles: JobRoleId[],
  skills: QuestionCore['skills'],
  premium = false,
): QuestionCore => ({ id, category: 'ai-data', topic, kind: 'technical', difficulty, jobRoles, skills, structure: 'technical', premium });

export const core: QuestionCore[] = [
  // Machine learning fundamentals
  q('ai-001', 'machine-learning', 'beginner', ALL, ['technical-knowledge']),
  q('ai-002', 'machine-learning', 'beginner', ML, ['technical-knowledge', 'analytical-thinking']),
  q('ai-003', 'machine-learning', 'beginner', ML, ['technical-knowledge']),
  q('ai-004', 'machine-learning', 'intermediate', ML, ['analytical-thinking', 'technical-knowledge']),
  q('ai-005', 'machine-learning', 'intermediate', ML, ['analytical-thinking', 'critical-thinking']),
  q('ai-006', 'machine-learning', 'intermediate', ML, ['analytical-thinking', 'problem-solving'], true),
  q('ai-007', 'machine-learning', 'advanced', ALL, ['system-design', 'problem-solving'], true),
  // Deep learning
  q('ai-008', 'deep-learning', 'beginner', ML, ['technical-knowledge']),
  q('ai-009', 'deep-learning', 'intermediate', ML, ['technical-knowledge']),
  q('ai-010', 'deep-learning', 'intermediate', ML, ['technical-knowledge', 'problem-solving']),
  q('ai-011', 'deep-learning', 'advanced', ML, ['technical-knowledge'], true),
  q('ai-012', 'deep-learning', 'advanced', ML, ['technical-knowledge', 'decision-making'], true),
  // LLMs
  q('ai-013', 'llm', 'beginner', GENAI, ['technical-knowledge']),
  q('ai-014', 'llm', 'beginner', GENAI, ['technical-knowledge', 'critical-thinking']),
  q('ai-015', 'llm', 'intermediate', GENAI, ['technical-knowledge']),
  q('ai-016', 'llm', 'intermediate', GENAI, ['technical-knowledge', 'decision-making']),
  q('ai-017', 'llm', 'advanced', GENAI, ['analytical-thinking', 'system-design'], true),
  q('ai-018', 'llm', 'advanced', GENAI, ['decision-making', 'business-acumen'], true),
  // RAG
  q('ai-019', 'rag', 'beginner', GENAI, ['technical-knowledge', 'system-design']),
  q('ai-020', 'rag', 'intermediate', GENAI, ['system-design', 'technical-knowledge']),
  q('ai-021', 'rag', 'intermediate', GENAI, ['problem-solving', 'analytical-thinking']),
  q('ai-022', 'rag', 'advanced', GENAI, ['system-design', 'problem-solving'], true),
  q('ai-023', 'rag', 'advanced', GENAI, ['analytical-thinking', 'system-design'], true),
  // Embeddings
  q('ai-024', 'embeddings', 'beginner', GENAI, ['technical-knowledge']),
  q('ai-025', 'embeddings', 'intermediate', GENAI, ['technical-knowledge', 'decision-making']),
  q('ai-026', 'embeddings', 'intermediate', GENAI, ['technical-knowledge', 'analytical-thinking']),
  q('ai-027', 'embeddings', 'advanced', GENAI, ['technical-knowledge', 'problem-solving'], true),
  // Vector databases
  q('ai-028', 'vector-databases', 'beginner', ALL, ['technical-knowledge']),
  q('ai-029', 'vector-databases', 'intermediate', ALL, ['technical-knowledge', 'system-design']),
  q('ai-030', 'vector-databases', 'intermediate', ALL, ['decision-making', 'system-design']),
  q('ai-031', 'vector-databases', 'advanced', ALL, ['system-design', 'technical-knowledge'], true),
  // Prompt engineering
  q('ai-032', 'prompt-engineering', 'beginner', GENAI, ['technical-knowledge', 'communication']),
  q('ai-033', 'prompt-engineering', 'intermediate', GENAI, ['technical-knowledge', 'problem-solving']),
  q('ai-034', 'prompt-engineering', 'intermediate', GENAI, ['technical-knowledge', 'code-quality']),
  q('ai-035', 'prompt-engineering', 'advanced', GENAI, ['system-design', 'critical-thinking'], true),
  // AI architecture
  q('ai-036', 'ai-architecture', 'intermediate', GENAI, ['system-design']),
  q('ai-037', 'ai-architecture', 'intermediate', GENAI, ['system-design', 'technical-knowledge']),
  q('ai-038', 'ai-architecture', 'advanced', GENAI, ['system-design', 'business-acumen'], true),
  q('ai-039', 'ai-architecture', 'advanced', GENAI, ['system-design', 'critical-thinking'], true),
  q('ai-040', 'ai-architecture', 'advanced', ALL, ['system-design', 'problem-solving'], true),
  // Data engineering
  q('ai-041', 'data-engineering', 'beginner', DE, ['technical-knowledge']),
  q('ai-042', 'data-engineering', 'intermediate', DE, ['technical-knowledge', 'system-design']),
  q('ai-043', 'data-engineering', 'intermediate', DE, ['technical-knowledge', 'decision-making']),
  q('ai-044', 'data-engineering', 'intermediate', DE, ['problem-solving', 'code-quality']),
  q('ai-045', 'data-engineering', 'advanced', DE, ['system-design', 'decision-making'], true),
];
