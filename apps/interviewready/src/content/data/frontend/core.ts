import type { JobRoleId, QuestionCore } from '@/types/content';

const WEB: JobRoleId[] = ['frontend-developer', 'fullstack-developer'];
const ALL: JobRoleId[] = [...WEB, 'mobile-developer'];
const MOBILE: JobRoleId[] = ['mobile-developer', 'frontend-developer', 'fullstack-developer'];

const q = (
  id: string,
  topic: QuestionCore['topic'],
  difficulty: QuestionCore['difficulty'],
  jobRoles: JobRoleId[],
  skills: QuestionCore['skills'],
  premium = false,
): QuestionCore => ({ id, category: 'frontend', topic, kind: 'technical', difficulty, jobRoles, skills, structure: 'technical', premium });

/** ES2022+, TypeScript 5, React 18/19, React Native (new architecture). */
export const core: QuestionCore[] = [
  // JavaScript
  q('fe-001', 'javascript', 'beginner', ALL, ['technical-knowledge']),
  q('fe-002', 'javascript', 'beginner', ALL, ['technical-knowledge']),
  q('fe-003', 'javascript', 'beginner', ALL, ['technical-knowledge']),
  q('fe-004', 'javascript', 'intermediate', ALL, ['technical-knowledge']),
  q('fe-005', 'javascript', 'intermediate', ALL, ['technical-knowledge']),
  q('fe-006', 'javascript', 'intermediate', ALL, ['technical-knowledge', 'problem-solving']),
  q('fe-007', 'javascript', 'intermediate', ALL, ['technical-knowledge']),
  q('fe-008', 'javascript', 'advanced', ALL, ['technical-knowledge', 'problem-solving'], true),
  q('fe-009', 'javascript', 'advanced', ALL, ['technical-knowledge'], true),
  // TypeScript
  q('fe-010', 'typescript', 'beginner', ALL, ['technical-knowledge', 'code-quality']),
  q('fe-011', 'typescript', 'beginner', ALL, ['technical-knowledge']),
  q('fe-012', 'typescript', 'intermediate', ALL, ['technical-knowledge', 'code-quality']),
  q('fe-013', 'typescript', 'intermediate', ALL, ['technical-knowledge']),
  q('fe-014', 'typescript', 'intermediate', ALL, ['technical-knowledge', 'code-quality']),
  q('fe-015', 'typescript', 'advanced', ALL, ['technical-knowledge', 'code-quality'], true),
  q('fe-016', 'typescript', 'advanced', ALL, ['code-quality', 'system-design'], true),
  // React
  q('fe-017', 'react', 'beginner', ALL, ['technical-knowledge']),
  q('fe-018', 'react', 'beginner', ALL, ['technical-knowledge']),
  q('fe-019', 'react', 'intermediate', ALL, ['technical-knowledge']),
  q('fe-020', 'react', 'intermediate', ALL, ['technical-knowledge', 'problem-solving']),
  q('fe-021', 'react', 'intermediate', ALL, ['technical-knowledge']),
  q('fe-022', 'react', 'intermediate', ALL, ['technical-knowledge', 'code-quality']),
  q('fe-023', 'react', 'advanced', ALL, ['technical-knowledge'], true),
  q('fe-024', 'react', 'advanced', WEB, ['technical-knowledge', 'system-design'], true),
  q('fe-025', 'react', 'advanced', ALL, ['code-quality', 'system-design'], true),
  // React Native
  q('fe-026', 'react-native', 'beginner', MOBILE, ['technical-knowledge']),
  q('fe-027', 'react-native', 'intermediate', MOBILE, ['technical-knowledge']),
  q('fe-028', 'react-native', 'intermediate', MOBILE, ['technical-knowledge', 'problem-solving']),
  q('fe-029', 'react-native', 'intermediate', MOBILE, ['technical-knowledge']),
  q('fe-030', 'react-native', 'intermediate', MOBILE, ['technical-knowledge', 'system-design'], true),
  q('fe-031', 'react-native', 'advanced', MOBILE, ['technical-knowledge', 'problem-solving'], true),
  q('fe-032', 'react-native', 'advanced', MOBILE, ['system-design', 'decision-making'], true),
  // HTML & CSS
  q('fe-033', 'html-css', 'beginner', WEB, ['technical-knowledge']),
  q('fe-034', 'html-css', 'beginner', WEB, ['technical-knowledge', 'customer-focus']),
  q('fe-035', 'html-css', 'beginner', WEB, ['technical-knowledge']),
  q('fe-036', 'html-css', 'intermediate', WEB, ['technical-knowledge']),
  q('fe-037', 'html-css', 'intermediate', WEB, ['technical-knowledge', 'customer-focus']),
  q('fe-038', 'html-css', 'advanced', WEB, ['technical-knowledge', 'system-design'], true),
  // State management
  q('fe-039', 'state-management', 'beginner', ALL, ['technical-knowledge']),
  q('fe-040', 'state-management', 'intermediate', ALL, ['technical-knowledge', 'system-design']),
  q('fe-041', 'state-management', 'intermediate', ALL, ['technical-knowledge', 'decision-making']),
  q('fe-042', 'state-management', 'intermediate', ALL, ['technical-knowledge', 'problem-solving']),
  q('fe-043', 'state-management', 'advanced', ALL, ['system-design', 'problem-solving'], true),
  q('fe-044', 'state-management', 'advanced', ALL, ['system-design', 'decision-making'], true),
  // Performance
  q('fe-045', 'web-performance', 'beginner', ALL, ['technical-knowledge']),
  q('fe-046', 'web-performance', 'intermediate', WEB, ['technical-knowledge', 'analytical-thinking']),
  q('fe-047', 'web-performance', 'intermediate', ALL, ['technical-knowledge', 'problem-solving']),
  q('fe-048', 'web-performance', 'intermediate', WEB, ['technical-knowledge']),
  q('fe-049', 'web-performance', 'advanced', ALL, ['problem-solving', 'analytical-thinking'], true),
  q('fe-050', 'web-performance', 'advanced', WEB, ['system-design', 'technical-knowledge'], true),
];
