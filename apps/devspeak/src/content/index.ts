import { dailyChallenges } from './data/daily-challenges';
import { interviewA } from './data/interview-a';
import { interviewB } from './data/interview-b';
import { technicalA } from './data/technical-a';
import { technicalB } from './data/technical-b';
import { vocabulary } from './data/vocabulary';
import { workplaceA } from './data/workplace-a';
import { workplaceB } from './data/workplace-b';
import type { InterviewPath, Lesson, ModuleId } from './types';

export * from './types';

/**
 * Bump whenever bundled content changes so the database is re-seeded.
 * User progress references stable ids and is never touched by a re-seed.
 */
export const CONTENT_VERSION = 1;

export const lessons: Lesson[] = [...workplaceA, ...workplaceB, ...technicalA, ...technicalB, ...interviewA, ...interviewB];
export { vocabulary, dailyChallenges };

export interface ModuleDefinition {
  id: ModuleId;
  icon: 'briefcase-outline' | 'code-slash-outline' | 'mic-outline';
  position: number;
}

export const modules: ModuleDefinition[] = [
  { id: 'workplace', icon: 'briefcase-outline', position: 1 },
  { id: 'technical', icon: 'code-slash-outline', position: 2 },
  { id: 'interview', icon: 'mic-outline', position: 3 },
];

export const interviewPaths: InterviewPath[] = ['junior', 'java', 'spring', 'react', 'fullstack', 'devops', 'qa', 'architect'];
