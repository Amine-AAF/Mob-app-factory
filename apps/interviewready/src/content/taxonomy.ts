import type { IconName } from '@factory/design-system';

import type { CategoryId, JobRoleId, QuestionKind, TopicId } from '@/types/content';

/**
 * Library taxonomy. Labels are UI strings (src/i18n/locales/*.json → categories.*, topics.*, roles.*);
 * this file only holds structure, so it never needs translating.
 */

export interface CategoryMeta {
  id: CategoryId;
  icon: IconName;
  /** Default question kind for the category (used by the Answer Builder). */
  kind: QuestionKind;
  /** Prefix of question ids in this category (validation enforces it). */
  idPrefix: string;
  topics: TopicId[];
  /** Free users can browse free questions of every category; this flags fully premium sections. */
  premiumOnly: boolean;
}

export const CATEGORY_META: Record<CategoryId, CategoryMeta> = {
  general: {
    id: 'general',
    icon: 'chatbubbles-outline',
    kind: 'general',
    idPrefix: 'gen',
    topics: ['introduction', 'strengths-weaknesses', 'motivation', 'career-goals', 'company-fit', 'work-style'],
    premiumOnly: false,
  },
  behavioral: {
    id: 'behavioral',
    icon: 'people-outline',
    kind: 'behavioral',
    idPrefix: 'beh',
    topics: [
      'leadership',
      'teamwork',
      'communication',
      'problem-solving',
      'conflict',
      'adaptability',
      'time-management',
      'decision-making',
      'accountability',
      'critical-thinking',
    ],
    premiumOnly: false,
  },
  software: {
    id: 'software',
    icon: 'code-slash-outline',
    kind: 'technical',
    idPrefix: 'sw',
    topics: ['programming-fundamentals', 'oop', 'data-structures', 'algorithms', 'design-patterns', 'clean-code', 'testing', 'debugging'],
    premiumOnly: false,
  },
  java: {
    id: 'java',
    icon: 'cafe-outline',
    kind: 'technical',
    idPrefix: 'java',
    topics: ['java-fundamentals', 'java-collections', 'java-streams', 'java-concurrency', 'jvm', 'spring-boot', 'rest-apis', 'dependency-injection', 'microservices'],
    premiumOnly: false,
  },
  frontend: {
    id: 'frontend',
    icon: 'browsers-outline',
    kind: 'technical',
    idPrefix: 'fe',
    topics: ['javascript', 'typescript', 'react', 'react-native', 'html-css', 'state-management', 'web-performance'],
    premiumOnly: false,
  },
  databases: {
    id: 'databases',
    icon: 'server-outline',
    kind: 'technical',
    idPrefix: 'db',
    topics: ['sql', 'postgresql', 'mongodb', 'indexes', 'transactions', 'query-optimization', 'database-design'],
    premiumOnly: false,
  },
  devops: {
    id: 'devops',
    icon: 'cloud-outline',
    kind: 'technical',
    idPrefix: 'ops',
    topics: ['docker', 'kubernetes', 'ci-cd', 'git', 'cloud', 'monitoring', 'security'],
    premiumOnly: false,
  },
  'ai-data': {
    id: 'ai-data',
    icon: 'sparkles-outline',
    kind: 'technical',
    idPrefix: 'ai',
    topics: ['machine-learning', 'deep-learning', 'llm', 'rag', 'embeddings', 'vector-databases', 'prompt-engineering', 'ai-architecture', 'data-engineering'],
    premiumOnly: false,
  },
  'job-specific': {
    id: 'job-specific',
    icon: 'briefcase-outline',
    kind: 'general',
    idPrefix: 'job',
    topics: ['project-management', 'product-management', 'business-analysis', 'it-support', 'cybersecurity', 'finance', 'marketing', 'human-resources'],
    premiumOnly: false,
  },
  'hr-salary': {
    id: 'hr-salary',
    icon: 'cash-outline',
    kind: 'hr',
    idPrefix: 'hr',
    topics: ['salary-expectations', 'negotiation', 'notice-availability', 'career-change', 'employment-gaps', 'remote-work', 'questions-for-recruiter'],
    premiumOnly: false,
  },
};

/** Reverse index topic → category, built once. */
export const TOPIC_CATEGORY: Record<TopicId, CategoryId> = Object.values(CATEGORY_META).reduce(
  (acc, meta) => {
    for (const topic of meta.topics) acc[topic] = meta.id;
    return acc;
  },
  {} as Record<TopicId, CategoryId>,
);

export interface JobRoleMeta {
  id: JobRoleId;
  icon: IconName;
  /** Categories that make up this role's interview, in study order. */
  focus: CategoryId[];
  /** Technical topics prioritised for this role (others in focus categories are secondary). */
  coreTopics: TopicId[];
  /** Whether the role path is free; premium roles are browsable but their path needs Premium. */
  free: boolean;
}

const SOFT: CategoryId[] = ['general', 'behavioral', 'hr-salary'];

export const JOB_ROLE_META: Record<JobRoleId, JobRoleMeta> = {
  'software-developer': {
    id: 'software-developer',
    icon: 'laptop-outline',
    focus: ['software', ...SOFT, 'databases', 'devops'],
    coreTopics: ['programming-fundamentals', 'oop', 'data-structures', 'algorithms', 'clean-code', 'testing', 'debugging', 'git', 'sql'],
    free: true,
  },
  'backend-developer': {
    id: 'backend-developer',
    icon: 'git-network-outline',
    focus: ['java', 'databases', 'software', ...SOFT, 'devops'],
    coreTopics: ['rest-apis', 'spring-boot', 'microservices', 'sql', 'transactions', 'indexes', 'java-concurrency', 'design-patterns', 'docker', 'security'],
    free: true,
  },
  'frontend-developer': {
    id: 'frontend-developer',
    icon: 'color-palette-outline',
    focus: ['frontend', 'software', ...SOFT],
    coreTopics: ['javascript', 'typescript', 'react', 'html-css', 'state-management', 'web-performance', 'testing'],
    free: true,
  },
  'fullstack-developer': {
    id: 'fullstack-developer',
    icon: 'layers-outline',
    focus: ['frontend', 'java', 'databases', 'software', ...SOFT, 'devops'],
    coreTopics: ['javascript', 'typescript', 'react', 'rest-apis', 'sql', 'database-design', 'docker', 'ci-cd', 'security'],
    free: false,
  },
  'mobile-developer': {
    id: 'mobile-developer',
    icon: 'phone-portrait-outline',
    focus: ['frontend', 'software', ...SOFT],
    coreTopics: ['react-native', 'react', 'typescript', 'javascript', 'state-management', 'web-performance', 'testing'],
    free: false,
  },
  'devops-engineer': {
    id: 'devops-engineer',
    icon: 'infinite-outline',
    focus: ['devops', 'software', ...SOFT, 'databases'],
    coreTopics: ['docker', 'kubernetes', 'ci-cd', 'git', 'cloud', 'monitoring', 'security'],
    free: false,
  },
  'data-engineer': {
    id: 'data-engineer',
    icon: 'git-merge-outline',
    focus: ['ai-data', 'databases', 'software', ...SOFT, 'devops'],
    coreTopics: ['data-engineering', 'sql', 'query-optimization', 'database-design', 'postgresql', 'mongodb', 'cloud'],
    free: false,
  },
  'data-scientist': {
    id: 'data-scientist',
    icon: 'analytics-outline',
    focus: ['ai-data', 'databases', ...SOFT, 'software'],
    coreTopics: ['machine-learning', 'deep-learning', 'sql', 'data-engineering', 'algorithms'],
    free: false,
  },
  'ai-engineer': {
    id: 'ai-engineer',
    icon: 'sparkles-outline',
    focus: ['ai-data', 'software', ...SOFT, 'devops'],
    coreTopics: ['llm', 'rag', 'embeddings', 'vector-databases', 'prompt-engineering', 'ai-architecture', 'machine-learning', 'deep-learning'],
    free: false,
  },
  'cybersecurity-analyst': {
    id: 'cybersecurity-analyst',
    icon: 'shield-checkmark-outline',
    focus: ['devops', 'job-specific', ...SOFT, 'software'],
    coreTopics: ['cybersecurity', 'security', 'monitoring', 'cloud', 'docker', 'git'],
    free: false,
  },
  'project-manager': {
    id: 'project-manager',
    icon: 'calendar-outline',
    focus: ['job-specific', ...SOFT],
    coreTopics: ['leadership', 'communication', 'time-management', 'conflict', 'decision-making', 'accountability', 'project-management'],
    free: true,
  },
  'product-manager': {
    id: 'product-manager',
    icon: 'rocket-outline',
    focus: ['job-specific', ...SOFT],
    coreTopics: ['decision-making', 'critical-thinking', 'communication', 'leadership', 'problem-solving', 'product-management'],
    free: false,
  },
  'business-analyst': {
    id: 'business-analyst',
    icon: 'bar-chart-outline',
    focus: ['job-specific', ...SOFT, 'databases'],
    coreTopics: ['critical-thinking', 'communication', 'problem-solving', 'sql', 'business-analysis'],
    free: false,
  },
  'it-support': {
    id: 'it-support',
    icon: 'construct-outline',
    focus: ['job-specific', ...SOFT, 'devops', 'software'],
    coreTopics: ['problem-solving', 'communication', 'debugging', 'security', 'it-support'],
    free: true,
  },
  'finance-analyst': {
    id: 'finance-analyst',
    icon: 'trending-up-outline',
    focus: ['job-specific', ...SOFT],
    coreTopics: ['critical-thinking', 'decision-making', 'accountability', 'communication', 'finance'],
    free: false,
  },
  'marketing-specialist': {
    id: 'marketing-specialist',
    icon: 'megaphone-outline',
    focus: ['job-specific', ...SOFT],
    coreTopics: ['communication', 'adaptability', 'problem-solving', 'teamwork', 'marketing'],
    free: false,
  },
  'hr-specialist': {
    id: 'hr-specialist',
    icon: 'id-card-outline',
    focus: ['job-specific', ...SOFT],
    coreTopics: ['communication', 'conflict', 'accountability', 'teamwork', 'human-resources'],
    free: false,
  },
};
