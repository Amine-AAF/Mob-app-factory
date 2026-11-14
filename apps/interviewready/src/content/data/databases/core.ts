import type { JobRoleId, QuestionCore } from '@/types/content';

const DEV: JobRoleId[] = ['software-developer', 'backend-developer', 'fullstack-developer'];
const DATA: JobRoleId[] = ['data-engineer', 'data-scientist'];
const SQL_ALL: JobRoleId[] = [...DEV, ...DATA, 'devops-engineer', 'business-analyst'];
const ENGINEERS: JobRoleId[] = [...DEV, 'data-engineer', 'devops-engineer'];

const q = (
  id: string,
  topic: QuestionCore['topic'],
  difficulty: QuestionCore['difficulty'],
  jobRoles: JobRoleId[],
  skills: QuestionCore['skills'],
  premium = false,
): QuestionCore => ({ id, category: 'databases', topic, kind: 'technical', difficulty, jobRoles, skills, structure: 'technical', premium });

/** PostgreSQL 15+, MongoDB 6+, standard SQL. */
export const core: QuestionCore[] = [
  // SQL
  q('db-001', 'sql', 'beginner', SQL_ALL, ['technical-knowledge']),
  q('db-002', 'sql', 'beginner', SQL_ALL, ['technical-knowledge']),
  q('db-003', 'sql', 'beginner', SQL_ALL, ['technical-knowledge', 'analytical-thinking']),
  q('db-004', 'sql', 'intermediate', SQL_ALL, ['technical-knowledge']),
  q('db-005', 'sql', 'intermediate', SQL_ALL, ['technical-knowledge', 'analytical-thinking']),
  q('db-006', 'sql', 'intermediate', SQL_ALL, ['technical-knowledge', 'analytical-thinking']),
  q('db-007', 'sql', 'intermediate', SQL_ALL, ['technical-knowledge', 'problem-solving'], true),
  q('db-008', 'sql', 'advanced', [...DEV, ...DATA, 'business-analyst'], ['analytical-thinking', 'problem-solving'], true),
  // PostgreSQL
  q('db-009', 'postgresql', 'beginner', ENGINEERS, ['technical-knowledge']),
  q('db-010', 'postgresql', 'intermediate', ENGINEERS, ['technical-knowledge']),
  q('db-011', 'postgresql', 'intermediate', ENGINEERS, ['technical-knowledge', 'system-design']),
  q('db-012', 'postgresql', 'advanced', ENGINEERS, ['technical-knowledge', 'problem-solving'], true),
  q('db-013', 'postgresql', 'advanced', ENGINEERS, ['system-design', 'technical-knowledge'], true),
  // MongoDB
  q('db-014', 'mongodb', 'beginner', [...DEV, 'data-engineer'], ['technical-knowledge']),
  q('db-015', 'mongodb', 'intermediate', [...DEV, 'data-engineer'], ['system-design', 'technical-knowledge']),
  q('db-016', 'mongodb', 'intermediate', [...DEV, 'data-engineer'], ['technical-knowledge']),
  q('db-017', 'mongodb', 'advanced', [...DEV, 'data-engineer'], ['system-design', 'technical-knowledge'], true),
  q('db-018', 'mongodb', 'advanced', [...DEV, 'data-engineer', 'devops-engineer'], ['system-design', 'decision-making'], true),
  // Indexes
  q('db-019', 'indexes', 'beginner', SQL_ALL, ['technical-knowledge']),
  q('db-020', 'indexes', 'intermediate', ENGINEERS, ['technical-knowledge']),
  q('db-021', 'indexes', 'intermediate', ENGINEERS, ['technical-knowledge', 'analytical-thinking']),
  q('db-022', 'indexes', 'intermediate', ENGINEERS, ['technical-knowledge', 'decision-making']),
  q('db-023', 'indexes', 'advanced', ENGINEERS, ['technical-knowledge', 'problem-solving'], true),
  q('db-024', 'indexes', 'advanced', ENGINEERS, ['technical-knowledge', 'system-design'], true),
  // Transactions
  q('db-025', 'transactions', 'beginner', ENGINEERS, ['technical-knowledge']),
  q('db-026', 'transactions', 'intermediate', ENGINEERS, ['technical-knowledge']),
  q('db-027', 'transactions', 'intermediate', ENGINEERS, ['technical-knowledge', 'problem-solving']),
  q('db-028', 'transactions', 'intermediate', ENGINEERS, ['technical-knowledge', 'problem-solving']),
  q('db-029', 'transactions', 'advanced', ENGINEERS, ['technical-knowledge', 'problem-solving'], true),
  q('db-030', 'transactions', 'advanced', ENGINEERS, ['system-design', 'decision-making'], true),
  // Query optimization
  q('db-031', 'query-optimization', 'intermediate', SQL_ALL, ['analytical-thinking', 'problem-solving']),
  q('db-032', 'query-optimization', 'intermediate', ENGINEERS, ['technical-knowledge', 'problem-solving']),
  q('db-033', 'query-optimization', 'intermediate', [...ENGINEERS, 'data-scientist'], ['technical-knowledge', 'analytical-thinking']),
  q('db-034', 'query-optimization', 'advanced', ENGINEERS, ['problem-solving', 'analytical-thinking'], true),
  q('db-035', 'query-optimization', 'advanced', ENGINEERS, ['system-design', 'problem-solving'], true),
  // Database design
  q('db-036', 'database-design', 'beginner', SQL_ALL, ['system-design']),
  q('db-037', 'database-design', 'intermediate', SQL_ALL, ['system-design', 'technical-knowledge']),
  q('db-038', 'database-design', 'intermediate', [...DEV, 'data-engineer'], ['system-design', 'decision-making']),
  q('db-039', 'database-design', 'advanced', [...DEV, 'data-engineer', 'devops-engineer'], ['system-design', 'problem-solving'], true),
  q('db-040', 'database-design', 'advanced', [...DEV, 'data-engineer', 'devops-engineer'], ['system-design', 'decision-making'], true),
];
