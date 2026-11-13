import type { JobRoleId, QuestionCore } from '@/types/content';

/** Roles whose interviews cover Java & Spring Boot. */
const JAVA: JobRoleId[] = ['backend-developer', 'fullstack-developer'];

const q = (
  id: string,
  topic: QuestionCore['topic'],
  difficulty: QuestionCore['difficulty'],
  skills: QuestionCore['skills'],
  premium = false,
): QuestionCore => ({ id, category: 'java', topic, kind: 'technical', difficulty, jobRoles: JAVA, skills, structure: 'technical', premium });

/** Java 17/21 LTS and Spring Boot 3. */
export const core: QuestionCore[] = [
  // Java fundamentals
  q('java-001', 'java-fundamentals', 'beginner', ['technical-knowledge']),
  q('java-002', 'java-fundamentals', 'beginner', ['technical-knowledge', 'code-quality']),
  q('java-003', 'java-fundamentals', 'beginner', ['technical-knowledge']),
  q('java-004', 'java-fundamentals', 'intermediate', ['technical-knowledge', 'code-quality']),
  q('java-005', 'java-fundamentals', 'intermediate', ['technical-knowledge']),
  q('java-006', 'java-fundamentals', 'intermediate', ['technical-knowledge', 'code-quality'], true),
  q('java-007', 'java-fundamentals', 'advanced', ['technical-knowledge', 'code-quality'], true),
  // Collections
  q('java-008', 'java-collections', 'beginner', ['technical-knowledge']),
  q('java-009', 'java-collections', 'intermediate', ['technical-knowledge']),
  q('java-010', 'java-collections', 'intermediate', ['technical-knowledge', 'code-quality']),
  q('java-011', 'java-collections', 'intermediate', ['technical-knowledge']),
  q('java-012', 'java-collections', 'advanced', ['technical-knowledge', 'problem-solving'], true),
  q('java-013', 'java-collections', 'advanced', ['technical-knowledge', 'system-design'], true),
  // Streams
  q('java-014', 'java-streams', 'beginner', ['technical-knowledge']),
  q('java-015', 'java-streams', 'intermediate', ['technical-knowledge']),
  q('java-016', 'java-streams', 'intermediate', ['technical-knowledge', 'code-quality']),
  q('java-017', 'java-streams', 'intermediate', ['technical-knowledge']),
  q('java-018', 'java-streams', 'advanced', ['technical-knowledge', 'problem-solving'], true),
  q('java-019', 'java-streams', 'advanced', ['technical-knowledge', 'code-quality'], true),
  // Concurrency
  q('java-020', 'java-concurrency', 'beginner', ['technical-knowledge']),
  q('java-021', 'java-concurrency', 'intermediate', ['technical-knowledge']),
  q('java-022', 'java-concurrency', 'intermediate', ['technical-knowledge', 'problem-solving']),
  q('java-023', 'java-concurrency', 'intermediate', ['technical-knowledge']),
  q('java-024', 'java-concurrency', 'advanced', ['technical-knowledge', 'system-design'], true),
  q('java-025', 'java-concurrency', 'advanced', ['technical-knowledge', 'problem-solving'], true),
  q('java-026', 'java-concurrency', 'advanced', ['technical-knowledge', 'system-design'], true),
  // JVM
  q('java-027', 'jvm', 'beginner', ['technical-knowledge']),
  q('java-028', 'jvm', 'intermediate', ['technical-knowledge']),
  q('java-029', 'jvm', 'intermediate', ['technical-knowledge', 'problem-solving']),
  q('java-030', 'jvm', 'advanced', ['technical-knowledge', 'problem-solving'], true),
  q('java-031', 'jvm', 'advanced', ['technical-knowledge', 'system-design'], true),
  // Spring Boot
  q('java-032', 'spring-boot', 'beginner', ['technical-knowledge']),
  q('java-033', 'spring-boot', 'intermediate', ['technical-knowledge']),
  q('java-034', 'spring-boot', 'intermediate', ['technical-knowledge', 'code-quality']),
  q('java-035', 'spring-boot', 'intermediate', ['technical-knowledge', 'problem-solving']),
  q('java-036', 'spring-boot', 'advanced', ['technical-knowledge', 'problem-solving'], true),
  q('java-037', 'spring-boot', 'advanced', ['technical-knowledge', 'system-design'], true),
  // REST APIs
  q('java-038', 'rest-apis', 'beginner', ['technical-knowledge']),
  q('java-039', 'rest-apis', 'beginner', ['technical-knowledge', 'system-design']),
  q('java-040', 'rest-apis', 'intermediate', ['technical-knowledge', 'system-design']),
  q('java-041', 'rest-apis', 'intermediate', ['system-design', 'code-quality']),
  q('java-042', 'rest-apis', 'advanced', ['system-design', 'technical-knowledge'], true),
  // Dependency injection
  q('java-043', 'dependency-injection', 'beginner', ['technical-knowledge', 'code-quality']),
  q('java-044', 'dependency-injection', 'intermediate', ['technical-knowledge']),
  q('java-045', 'dependency-injection', 'intermediate', ['technical-knowledge', 'problem-solving']),
  q('java-046', 'dependency-injection', 'advanced', ['technical-knowledge', 'code-quality'], true),
  // Microservices
  q('java-047', 'microservices', 'intermediate', ['system-design']),
  q('java-048', 'microservices', 'intermediate', ['system-design', 'technical-knowledge']),
  q('java-049', 'microservices', 'advanced', ['system-design', 'problem-solving'], true),
  q('java-050', 'microservices', 'advanced', ['system-design', 'decision-making'], true),
];
