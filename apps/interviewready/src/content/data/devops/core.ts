import type { JobRoleId, QuestionCore } from '@/types/content';

const DEV: JobRoleId[] = ['software-developer', 'backend-developer', 'fullstack-developer'];
const OPS: JobRoleId[] = ['devops-engineer'];
const BUILD: JobRoleId[] = [...DEV, ...OPS, 'data-engineer', 'ai-engineer'];
const INFRA: JobRoleId[] = [...OPS, 'backend-developer', 'fullstack-developer', 'data-engineer'];
const SEC: JobRoleId[] = [...OPS, ...DEV, 'cybersecurity-analyst'];
const SUPPORT: JobRoleId[] = [...BUILD, 'it-support', 'cybersecurity-analyst'];

const q = (
  id: string,
  topic: QuestionCore['topic'],
  difficulty: QuestionCore['difficulty'],
  jobRoles: JobRoleId[],
  skills: QuestionCore['skills'],
  premium = false,
): QuestionCore => ({ id, category: 'devops', topic, kind: 'technical', difficulty, jobRoles, skills, structure: 'technical', premium });

export const core: QuestionCore[] = [
  // Docker
  q('ops-001', 'docker', 'beginner', BUILD, ['technical-knowledge']),
  q('ops-002', 'docker', 'beginner', BUILD, ['technical-knowledge']),
  q('ops-003', 'docker', 'intermediate', BUILD, ['technical-knowledge', 'code-quality']),
  q('ops-004', 'docker', 'intermediate', BUILD, ['technical-knowledge']),
  q('ops-005', 'docker', 'intermediate', BUILD, ['technical-knowledge', 'problem-solving']),
  q('ops-006', 'docker', 'advanced', [...BUILD, 'cybersecurity-analyst'], ['technical-knowledge', 'system-design'], true),
  q('ops-007', 'docker', 'advanced', BUILD, ['technical-knowledge', 'problem-solving'], true),
  // Kubernetes
  q('ops-008', 'kubernetes', 'beginner', INFRA, ['technical-knowledge']),
  q('ops-009', 'kubernetes', 'intermediate', INFRA, ['technical-knowledge']),
  q('ops-010', 'kubernetes', 'intermediate', INFRA, ['technical-knowledge', 'system-design']),
  q('ops-011', 'kubernetes', 'intermediate', INFRA, ['technical-knowledge', 'problem-solving']),
  q('ops-012', 'kubernetes', 'advanced', INFRA, ['technical-knowledge', 'problem-solving'], true),
  q('ops-013', 'kubernetes', 'advanced', INFRA, ['system-design', 'technical-knowledge'], true),
  q('ops-014', 'kubernetes', 'advanced', INFRA, ['system-design', 'decision-making'], true),
  // CI/CD
  q('ops-015', 'ci-cd', 'beginner', BUILD, ['technical-knowledge']),
  q('ops-016', 'ci-cd', 'intermediate', BUILD, ['technical-knowledge', 'code-quality']),
  q('ops-017', 'ci-cd', 'intermediate', BUILD, ['technical-knowledge', 'decision-making']),
  q('ops-018', 'ci-cd', 'intermediate', BUILD, ['technical-knowledge']),
  q('ops-019', 'ci-cd', 'intermediate', BUILD, ['technical-knowledge', 'problem-solving'], true),
  q('ops-020', 'ci-cd', 'advanced', BUILD, ['system-design', 'decision-making'], true),
  q('ops-021', 'ci-cd', 'advanced', [...BUILD, 'cybersecurity-analyst'], ['system-design', 'technical-knowledge'], true),
  // Git
  q('ops-022', 'git', 'beginner', SUPPORT, ['technical-knowledge']),
  q('ops-023', 'git', 'beginner', SUPPORT, ['technical-knowledge', 'teamwork']),
  q('ops-024', 'git', 'intermediate', BUILD, ['technical-knowledge', 'teamwork']),
  q('ops-025', 'git', 'intermediate', BUILD, ['technical-knowledge', 'problem-solving']),
  q('ops-026', 'git', 'intermediate', BUILD, ['technical-knowledge', 'decision-making']),
  q('ops-027', 'git', 'advanced', BUILD, ['technical-knowledge', 'problem-solving'], true),
  // Cloud
  q('ops-028', 'cloud', 'beginner', SUPPORT, ['technical-knowledge']),
  q('ops-029', 'cloud', 'beginner', INFRA, ['technical-knowledge', 'system-design']),
  q('ops-030', 'cloud', 'intermediate', INFRA, ['system-design', 'technical-knowledge']),
  q('ops-031', 'cloud', 'intermediate', INFRA, ['technical-knowledge', 'decision-making']),
  q('ops-032', 'cloud', 'advanced', INFRA, ['system-design', 'business-acumen'], true),
  q('ops-033', 'cloud', 'advanced', INFRA, ['system-design', 'problem-solving'], true),
  // Monitoring
  q('ops-034', 'monitoring', 'beginner', SUPPORT, ['technical-knowledge']),
  q('ops-035', 'monitoring', 'intermediate', BUILD, ['technical-knowledge', 'analytical-thinking']),
  q('ops-036', 'monitoring', 'intermediate', BUILD, ['technical-knowledge', 'system-design']),
  q('ops-037', 'monitoring', 'intermediate', [...BUILD, 'it-support'], ['problem-solving', 'communication']),
  q('ops-038', 'monitoring', 'advanced', BUILD, ['system-design', 'business-acumen'], true),
  q('ops-039', 'monitoring', 'advanced', BUILD, ['system-design', 'technical-knowledge'], true),
  // Security
  q('ops-040', 'security', 'beginner', [...SEC, 'it-support'], ['technical-knowledge']),
  q('ops-041', 'security', 'intermediate', SEC, ['technical-knowledge', 'code-quality']),
  q('ops-042', 'security', 'intermediate', SEC, ['technical-knowledge']),
  q('ops-043', 'security', 'intermediate', SEC, ['technical-knowledge', 'system-design']),
  q('ops-044', 'security', 'advanced', SEC, ['system-design', 'technical-knowledge'], true),
  q('ops-045', 'security', 'advanced', SEC, ['problem-solving', 'communication'], true),
];
