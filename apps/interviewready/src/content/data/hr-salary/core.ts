import type { QuestionCore } from '@/types/content';

const q = (
  id: string,
  topic: QuestionCore['topic'],
  difficulty: QuestionCore['difficulty'],
  structure: 'negotiation' | 'motivation',
  skills: QuestionCore['skills'],
  premium = false,
): QuestionCore => ({ id, category: 'hr-salary', topic, kind: 'hr', difficulty, jobRoles: [], skills, structure, premium });

/** HR, salary and practical questions: relevant for every role. */
export const core: QuestionCore[] = [
  // Salary expectations
  q('hr-001', 'salary-expectations', 'beginner', 'negotiation', ['negotiation', 'professionalism']),
  q('hr-002', 'salary-expectations', 'beginner', 'negotiation', ['negotiation', 'professionalism']),
  q('hr-003', 'salary-expectations', 'beginner', 'negotiation', ['negotiation']),
  q('hr-004', 'salary-expectations', 'intermediate', 'negotiation', ['negotiation', 'analytical-thinking']),
  q('hr-005', 'salary-expectations', 'intermediate', 'negotiation', ['negotiation', 'communication']),
  q('hr-006', 'salary-expectations', 'advanced', 'negotiation', ['negotiation', 'business-acumen'], true),
  q('hr-007', 'salary-expectations', 'advanced', 'negotiation', ['negotiation', 'business-acumen'], true),
  // Negotiating compensation
  q('hr-008', 'negotiation', 'beginner', 'negotiation', ['negotiation', 'professionalism']),
  q('hr-009', 'negotiation', 'intermediate', 'negotiation', ['negotiation', 'communication']),
  q('hr-010', 'negotiation', 'intermediate', 'negotiation', ['negotiation', 'decision-making']),
  q('hr-011', 'negotiation', 'intermediate', 'negotiation', ['negotiation', 'professionalism'], true),
  q('hr-012', 'negotiation', 'intermediate', 'negotiation', ['negotiation', 'decision-making']),
  q('hr-013', 'negotiation', 'advanced', 'negotiation', ['negotiation', 'communication'], true),
  q('hr-014', 'negotiation', 'beginner', 'negotiation', ['professionalism', 'communication']),
  // Notice period & availability
  q('hr-015', 'notice-availability', 'beginner', 'negotiation', ['professionalism']),
  q('hr-016', 'notice-availability', 'beginner', 'negotiation', ['professionalism', 'communication']),
  q('hr-017', 'notice-availability', 'intermediate', 'negotiation', ['professionalism', 'negotiation']),
  q('hr-018', 'notice-availability', 'intermediate', 'negotiation', ['decision-making', 'professionalism'], true),
  q('hr-019', 'notice-availability', 'intermediate', 'motivation', ['professionalism', 'communication']),
  // Career change
  q('hr-020', 'career-change', 'beginner', 'motivation', ['motivation', 'career-planning']),
  q('hr-021', 'career-change', 'intermediate', 'motivation', ['self-presentation', 'adaptability']),
  q('hr-022', 'career-change', 'intermediate', 'motivation', ['self-presentation', 'motivation']),
  q('hr-023', 'career-change', 'advanced', 'negotiation', ['negotiation', 'career-planning'], true),
  q('hr-024', 'career-change', 'intermediate', 'motivation', ['career-planning', 'self-awareness'], true),
  q('hr-025', 'career-change', 'beginner', 'motivation', ['motivation', 'adaptability']),
  // Employment gaps
  q('hr-026', 'employment-gaps', 'beginner', 'motivation', ['self-presentation', 'professionalism']),
  q('hr-027', 'employment-gaps', 'intermediate', 'motivation', ['self-presentation', 'accountability']),
  q('hr-028', 'employment-gaps', 'intermediate', 'motivation', ['professionalism', 'self-presentation']),
  q('hr-029', 'employment-gaps', 'intermediate', 'motivation', ['motivation', 'adaptability'], true),
  q('hr-030', 'employment-gaps', 'advanced', 'motivation', ['self-awareness', 'career-planning'], true),
  // Remote work
  q('hr-031', 'remote-work', 'beginner', 'motivation', ['culture-fit', 'self-awareness']),
  q('hr-032', 'remote-work', 'beginner', 'motivation', ['time-management', 'accountability']),
  q('hr-033', 'remote-work', 'intermediate', 'motivation', ['communication', 'teamwork']),
  q('hr-034', 'remote-work', 'intermediate', 'negotiation', ['negotiation', 'communication'], true),
  q('hr-035', 'remote-work', 'advanced', 'negotiation', ['negotiation', 'professionalism'], true),
  // Questions to ask the recruiter
  q('hr-036', 'questions-for-recruiter', 'beginner', 'motivation', ['motivation', 'communication']),
  q('hr-037', 'questions-for-recruiter', 'beginner', 'motivation', ['motivation', 'critical-thinking']),
  q('hr-038', 'questions-for-recruiter', 'intermediate', 'motivation', ['critical-thinking', 'culture-fit']),
  q('hr-039', 'questions-for-recruiter', 'intermediate', 'motivation', ['business-acumen', 'communication'], true),
  q('hr-040', 'questions-for-recruiter', 'beginner', 'motivation', ['professionalism', 'communication']),
];
