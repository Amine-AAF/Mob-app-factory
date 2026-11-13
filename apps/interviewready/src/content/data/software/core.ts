import type { JobRoleId, QuestionCore } from '@/types/content';

/** Roles whose interviews include general software engineering questions. */
const DEV: JobRoleId[] = ['software-developer', 'backend-developer', 'frontend-developer', 'fullstack-developer', 'mobile-developer'];
const DEV_DATA: JobRoleId[] = [...DEV, 'data-engineer', 'ai-engineer'];
const ALL_TECH: JobRoleId[] = [...DEV_DATA, 'devops-engineer', 'data-scientist'];

const q = (
  id: string,
  topic: QuestionCore['topic'],
  difficulty: QuestionCore['difficulty'],
  jobRoles: JobRoleId[],
  skills: QuestionCore['skills'],
  premium = false,
): QuestionCore => ({ id, category: 'software', topic, kind: 'technical', difficulty, jobRoles, skills, structure: 'technical', premium });

export const core: QuestionCore[] = [
  // Programming fundamentals
  q('sw-001', 'programming-fundamentals', 'beginner', ALL_TECH, ['technical-knowledge']),
  q('sw-002', 'programming-fundamentals', 'beginner', ALL_TECH, ['technical-knowledge']),
  q('sw-003', 'programming-fundamentals', 'beginner', DEV_DATA, ['technical-knowledge']),
  q('sw-004', 'programming-fundamentals', 'intermediate', DEV_DATA, ['technical-knowledge']),
  q('sw-005', 'programming-fundamentals', 'intermediate', DEV, ['technical-knowledge', 'system-design']),
  q('sw-006', 'programming-fundamentals', 'intermediate', DEV_DATA, ['technical-knowledge'], true),
  q('sw-007', 'programming-fundamentals', 'advanced', DEV, ['technical-knowledge', 'system-design'], true),
  // OOP
  q('sw-008', 'oop', 'beginner', DEV, ['technical-knowledge']),
  q('sw-009', 'oop', 'beginner', DEV, ['technical-knowledge']),
  q('sw-010', 'oop', 'intermediate', DEV, ['technical-knowledge', 'code-quality']),
  q('sw-011', 'oop', 'intermediate', DEV, ['technical-knowledge', 'code-quality']),
  q('sw-012', 'oop', 'intermediate', DEV, ['code-quality', 'system-design']),
  q('sw-013', 'oop', 'advanced', DEV, ['code-quality', 'system-design'], true),
  q('sw-014', 'oop', 'advanced', DEV, ['code-quality', 'system-design'], true),
  // Data structures
  q('sw-015', 'data-structures', 'beginner', ALL_TECH, ['technical-knowledge']),
  q('sw-016', 'data-structures', 'beginner', ALL_TECH, ['technical-knowledge']),
  q('sw-017', 'data-structures', 'intermediate', DEV_DATA, ['technical-knowledge', 'analytical-thinking']),
  q('sw-018', 'data-structures', 'intermediate', DEV_DATA, ['technical-knowledge']),
  q('sw-019', 'data-structures', 'intermediate', DEV_DATA, ['technical-knowledge', 'analytical-thinking']),
  q('sw-020', 'data-structures', 'advanced', DEV_DATA, ['technical-knowledge', 'system-design'], true),
  q('sw-021', 'data-structures', 'advanced', DEV_DATA, ['technical-knowledge', 'analytical-thinking'], true),
  // Algorithms
  q('sw-022', 'algorithms', 'beginner', ALL_TECH, ['analytical-thinking']),
  q('sw-023', 'algorithms', 'beginner', ALL_TECH, ['analytical-thinking', 'technical-knowledge']),
  q('sw-024', 'algorithms', 'intermediate', ALL_TECH, ['analytical-thinking', 'problem-solving']),
  q('sw-025', 'algorithms', 'intermediate', DEV_DATA, ['analytical-thinking', 'problem-solving']),
  q('sw-026', 'algorithms', 'intermediate', DEV_DATA, ['analytical-thinking', 'problem-solving'], true),
  q('sw-027', 'algorithms', 'advanced', DEV_DATA, ['analytical-thinking', 'problem-solving'], true),
  q('sw-028', 'algorithms', 'advanced', DEV_DATA, ['analytical-thinking', 'system-design'], true),
  // Design patterns
  q('sw-029', 'design-patterns', 'beginner', DEV, ['code-quality', 'technical-knowledge']),
  q('sw-030', 'design-patterns', 'intermediate', DEV, ['code-quality', 'system-design']),
  q('sw-031', 'design-patterns', 'intermediate', DEV, ['code-quality', 'system-design']),
  q('sw-032', 'design-patterns', 'intermediate', DEV, ['code-quality', 'system-design'], true),
  q('sw-033', 'design-patterns', 'advanced', DEV, ['system-design', 'critical-thinking'], true),
  q('sw-034', 'design-patterns', 'advanced', DEV, ['system-design', 'code-quality'], true),
  // Clean code
  q('sw-035', 'clean-code', 'beginner', ALL_TECH, ['code-quality']),
  q('sw-036', 'clean-code', 'intermediate', DEV_DATA, ['code-quality', 'communication']),
  q('sw-037', 'clean-code', 'intermediate', DEV_DATA, ['code-quality']),
  q('sw-038', 'clean-code', 'advanced', DEV, ['code-quality', 'decision-making'], true),
  q('sw-039', 'clean-code', 'intermediate', ALL_TECH, ['code-quality', 'teamwork']),
  // Testing
  q('sw-040', 'testing', 'beginner', ALL_TECH, ['code-quality', 'technical-knowledge']),
  q('sw-041', 'testing', 'beginner', DEV, ['code-quality', 'technical-knowledge']),
  q('sw-042', 'testing', 'intermediate', DEV, ['code-quality', 'technical-knowledge']),
  q('sw-043', 'testing', 'intermediate', DEV, ['code-quality', 'technical-knowledge']),
  q('sw-044', 'testing', 'advanced', DEV, ['code-quality', 'system-design'], true),
  q('sw-045', 'testing', 'advanced', DEV, ['code-quality', 'decision-making'], true),
  // Debugging
  q('sw-046', 'debugging', 'beginner', ALL_TECH, ['problem-solving', 'technical-knowledge']),
  q('sw-047', 'debugging', 'intermediate', ALL_TECH, ['problem-solving', 'analytical-thinking']),
  q('sw-048', 'debugging', 'intermediate', DEV_DATA, ['problem-solving', 'technical-knowledge']),
  q('sw-049', 'debugging', 'advanced', DEV_DATA, ['problem-solving', 'analytical-thinking'], true),
  q('sw-050', 'debugging', 'advanced', [...DEV_DATA, 'devops-engineer'], ['problem-solving', 'communication'], true),
];
