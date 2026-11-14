import type { JobRoleId, QuestionCore } from '@/types/content';

type Kind = 'general' | 'behavioral' | 'technical';
const STRUCTURE = { general: 'motivation', behavioral: 'star', technical: 'technical' } as const;

const q = (
  id: string,
  topic: QuestionCore['topic'],
  kind: Kind,
  difficulty: QuestionCore['difficulty'],
  jobRoles: JobRoleId[],
  skills: QuestionCore['skills'],
  premium = false,
): QuestionCore => ({ id, category: 'job-specific', topic, kind, difficulty, jobRoles, skills, structure: STRUCTURE[kind], premium });

const PM: JobRoleId[] = ['project-manager'];
const PO: JobRoleId[] = ['product-manager'];
const BA: JobRoleId[] = ['business-analyst'];
const IT: JobRoleId[] = ['it-support'];
const SEC: JobRoleId[] = ['cybersecurity-analyst'];
const FIN: JobRoleId[] = ['finance-analyst'];
const MKT: JobRoleId[] = ['marketing-specialist'];
const HR: JobRoleId[] = ['hr-specialist'];

/** Role-specific questions for non-developer roles and cybersecurity. */
export const core: QuestionCore[] = [
  // Project management
  q('job-001', 'project-management', 'technical', 'beginner', [...PM, ...PO], ['technical-knowledge', 'decision-making']),
  q('job-002', 'project-management', 'technical', 'beginner', PM, ['stakeholder-management', 'technical-knowledge']),
  q('job-003', 'project-management', 'technical', 'intermediate', PM, ['time-management', 'analytical-thinking']),
  q('job-004', 'project-management', 'technical', 'intermediate', PM, ['critical-thinking', 'technical-knowledge']),
  q('job-005', 'project-management', 'behavioral', 'intermediate', PM, ['time-management', 'leadership']),
  q('job-006', 'project-management', 'behavioral', 'intermediate', PM, ['stakeholder-management', 'communication']),
  q('job-007', 'project-management', 'behavioral', 'advanced', PM, ['accountability', 'decision-making'], true),
  q('job-008', 'project-management', 'technical', 'advanced', PM, ['analytical-thinking', 'communication'], true),
  // Product management
  q('job-009', 'product-management', 'general', 'beginner', PO, ['motivation', 'business-acumen']),
  q('job-010', 'product-management', 'technical', 'intermediate', PO, ['decision-making', 'business-acumen']),
  q('job-011', 'product-management', 'technical', 'intermediate', PO, ['analytical-thinking', 'business-acumen']),
  q('job-012', 'product-management', 'behavioral', 'intermediate', PO, ['customer-focus', 'decision-making']),
  q('job-013', 'product-management', 'technical', 'intermediate', PO, ['problem-solving', 'customer-focus']),
  q('job-014', 'product-management', 'behavioral', 'advanced', PO, ['accountability', 'critical-thinking'], true),
  q('job-015', 'product-management', 'technical', 'advanced', PO, ['analytical-thinking', 'critical-thinking'], true),
  q('job-016', 'product-management', 'technical', 'advanced', PO, ['business-acumen', 'stakeholder-management'], true),
  // Business analysis
  q('job-017', 'business-analysis', 'technical', 'beginner', BA, ['technical-knowledge', 'communication']),
  q('job-018', 'business-analysis', 'technical', 'beginner', BA, ['communication', 'stakeholder-management']),
  q('job-019', 'business-analysis', 'technical', 'intermediate', [...BA, ...PO], ['communication', 'technical-knowledge']),
  q('job-020', 'business-analysis', 'technical', 'intermediate', BA, ['analytical-thinking', 'technical-knowledge']),
  q('job-021', 'business-analysis', 'behavioral', 'intermediate', BA, ['stakeholder-management', 'conflict-management']),
  q('job-022', 'business-analysis', 'technical', 'intermediate', BA, ['analytical-thinking', 'business-acumen'], true),
  q('job-023', 'business-analysis', 'behavioral', 'advanced', BA, ['accountability', 'problem-solving'], true),
  // IT support
  q('job-024', 'it-support', 'technical', 'beginner', IT, ['problem-solving', 'technical-knowledge']),
  q('job-025', 'it-support', 'technical', 'beginner', IT, ['technical-knowledge']),
  q('job-026', 'it-support', 'behavioral', 'beginner', IT, ['customer-focus', 'communication']),
  q('job-027', 'it-support', 'technical', 'intermediate', IT, ['time-management', 'technical-knowledge']),
  q('job-028', 'it-support', 'technical', 'intermediate', [...IT, ...SEC], ['technical-knowledge', 'professionalism']),
  q('job-029', 'it-support', 'technical', 'intermediate', IT, ['technical-knowledge', 'professionalism'], true),
  q('job-030', 'it-support', 'technical', 'advanced', IT, ['problem-solving', 'communication'], true),
  // Cybersecurity
  q('job-031', 'cybersecurity', 'technical', 'beginner', SEC, ['technical-knowledge']),
  q('job-032', 'cybersecurity', 'technical', 'beginner', [...SEC, ...IT], ['technical-knowledge']),
  q('job-033', 'cybersecurity', 'technical', 'intermediate', SEC, ['analytical-thinking', 'technical-knowledge']),
  q('job-034', 'cybersecurity', 'technical', 'intermediate', SEC, ['decision-making', 'technical-knowledge']),
  q('job-035', 'cybersecurity', 'technical', 'intermediate', [...SEC, ...IT], ['technical-knowledge']),
  q('job-036', 'cybersecurity', 'technical', 'advanced', SEC, ['problem-solving', 'communication'], true),
  q('job-037', 'cybersecurity', 'technical', 'advanced', SEC, ['system-design', 'critical-thinking'], true),
  q('job-038', 'cybersecurity', 'behavioral', 'intermediate', SEC, ['communication', 'stakeholder-management'], true),
  // Finance
  q('job-039', 'finance', 'technical', 'beginner', FIN, ['technical-knowledge', 'business-acumen']),
  q('job-040', 'finance', 'technical', 'intermediate', FIN, ['analytical-thinking', 'business-acumen']),
  q('job-041', 'finance', 'technical', 'intermediate', FIN, ['analytical-thinking', 'communication']),
  q('job-042', 'finance', 'technical', 'intermediate', FIN, ['analytical-thinking', 'business-acumen']),
  q('job-043', 'finance', 'behavioral', 'intermediate', FIN, ['accountability', 'communication']),
  q('job-044', 'finance', 'technical', 'advanced', FIN, ['analytical-thinking', 'decision-making'], true),
  q('job-045', 'finance', 'technical', 'advanced', FIN, ['communication', 'business-acumen'], true),
  // Marketing
  q('job-046', 'marketing', 'general', 'beginner', MKT, ['motivation', 'self-presentation']),
  q('job-047', 'marketing', 'technical', 'beginner', MKT, ['technical-knowledge', 'customer-focus']),
  q('job-048', 'marketing', 'technical', 'intermediate', MKT, ['analytical-thinking', 'business-acumen']),
  q('job-049', 'marketing', 'technical', 'intermediate', MKT, ['time-management', 'customer-focus']),
  q('job-050', 'marketing', 'behavioral', 'intermediate', MKT, ['accountability', 'adaptability']),
  q('job-051', 'marketing', 'technical', 'intermediate', MKT, ['technical-knowledge', 'decision-making'], true),
  q('job-052', 'marketing', 'technical', 'advanced', MKT, ['analytical-thinking', 'critical-thinking'], true),
  q('job-053', 'marketing', 'technical', 'advanced', MKT, ['business-acumen', 'customer-focus'], true),
  // Human resources
  q('job-054', 'human-resources', 'general', 'beginner', HR, ['motivation', 'self-presentation']),
  q('job-055', 'human-resources', 'technical', 'beginner', HR, ['technical-knowledge', 'professionalism']),
  q('job-056', 'human-resources', 'behavioral', 'intermediate', HR, ['conflict-management', 'professionalism']),
  q('job-057', 'human-resources', 'technical', 'intermediate', HR, ['problem-solving', 'analytical-thinking']),
  q('job-058', 'human-resources', 'technical', 'intermediate', HR, ['professionalism', 'technical-knowledge']),
  q('job-059', 'human-resources', 'behavioral', 'advanced', HR, ['communication', 'stakeholder-management'], true),
  q('job-060', 'human-resources', 'technical', 'advanced', HR, ['critical-thinking', 'decision-making'], true),
];
