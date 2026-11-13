import type { QuestionCore } from '@/types/content';

const q = (
  id: string,
  topic: QuestionCore['topic'],
  difficulty: QuestionCore['difficulty'],
  structure: QuestionCore['structure'],
  skills: QuestionCore['skills'],
  premium = false,
): QuestionCore => ({ id, category: 'general', topic, kind: 'general', difficulty, jobRoles: [], skills, structure, premium });

/** General interview questions: relevant for every role. */
export const core: QuestionCore[] = [
  // Introducing yourself
  q('gen-001', 'introduction', 'beginner', 'present-past-future', ['self-presentation', 'communication']),
  q('gen-002', 'introduction', 'beginner', 'present-past-future', ['self-presentation']),
  q('gen-003', 'introduction', 'intermediate', 'present-past-future', ['self-presentation', 'self-awareness']),
  q('gen-004', 'introduction', 'intermediate', 'star', ['self-presentation', 'accountability']),
  q('gen-005', 'introduction', 'beginner', 'present-past-future', ['self-awareness', 'communication']),
  q('gen-006', 'introduction', 'advanced', 'present-past-future', ['self-presentation', 'business-acumen'], true),
  // Strengths & weaknesses
  q('gen-007', 'strengths-weaknesses', 'beginner', 'star', ['self-awareness']),
  q('gen-008', 'strengths-weaknesses', 'intermediate', 'star', ['self-awareness', 'accountability']),
  q('gen-009', 'strengths-weaknesses', 'beginner', 'star', ['self-awareness', 'teamwork']),
  q('gen-010', 'strengths-weaknesses', 'intermediate', 'motivation', ['self-awareness', 'motivation']),
  q('gen-011', 'strengths-weaknesses', 'intermediate', 'star', ['self-awareness', 'adaptability']),
  q('gen-012', 'strengths-weaknesses', 'advanced', 'star', ['self-awareness', 'accountability'], true),
  q('gen-013', 'strengths-weaknesses', 'intermediate', 'star', ['self-awareness', 'critical-thinking'], true),
  // Motivation
  q('gen-014', 'motivation', 'beginner', 'motivation', ['motivation', 'culture-fit']),
  q('gen-015', 'motivation', 'beginner', 'motivation', ['motivation']),
  q('gen-016', 'motivation', 'intermediate', 'motivation', ['motivation', 'professionalism']),
  q('gen-017', 'motivation', 'intermediate', 'motivation', ['motivation', 'self-awareness']),
  q('gen-018', 'motivation', 'beginner', 'motivation', ['motivation', 'self-presentation']),
  q('gen-019', 'motivation', 'advanced', 'motivation', ['motivation', 'business-acumen'], true),
  q('gen-020', 'motivation', 'intermediate', 'star', ['motivation', 'adaptability'], true),
  // Career goals
  q('gen-021', 'career-goals', 'beginner', 'motivation', ['career-planning']),
  q('gen-022', 'career-goals', 'intermediate', 'motivation', ['career-planning', 'self-awareness']),
  q('gen-023', 'career-goals', 'intermediate', 'motivation', ['career-planning', 'leadership']),
  q('gen-024', 'career-goals', 'beginner', 'star', ['career-planning', 'adaptability']),
  q('gen-025', 'career-goals', 'advanced', 'motivation', ['career-planning', 'business-acumen'], true),
  q('gen-026', 'career-goals', 'intermediate', 'star', ['career-planning', 'motivation'], true),
  // Company fit
  q('gen-027', 'company-fit', 'beginner', 'motivation', ['culture-fit', 'motivation']),
  q('gen-028', 'company-fit', 'intermediate', 'motivation', ['culture-fit', 'business-acumen']),
  q('gen-029', 'company-fit', 'beginner', 'motivation', ['culture-fit', 'self-presentation']),
  q('gen-030', 'company-fit', 'intermediate', 'star', ['culture-fit', 'teamwork']),
  q('gen-031', 'company-fit', 'advanced', 'motivation', ['culture-fit', 'critical-thinking'], true),
  q('gen-032', 'company-fit', 'intermediate', 'motivation', ['culture-fit', 'professionalism'], true),
  q('gen-033', 'company-fit', 'advanced', 'motivation', ['business-acumen', 'critical-thinking'], true),
  // Work style
  q('gen-034', 'work-style', 'beginner', 'star', ['time-management', 'teamwork']),
  q('gen-035', 'work-style', 'beginner', 'star', ['adaptability', 'time-management']),
  q('gen-036', 'work-style', 'intermediate', 'star', ['communication', 'teamwork']),
  q('gen-037', 'work-style', 'intermediate', 'star', ['self-awareness', 'professionalism']),
  q('gen-038', 'work-style', 'intermediate', 'star', ['adaptability', 'problem-solving'], true),
  q('gen-039', 'work-style', 'advanced', 'star', ['leadership', 'communication'], true),
  q('gen-040', 'work-style', 'beginner', 'motivation', ['motivation', 'self-presentation']),
];
