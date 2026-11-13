import type { SqlDatabase } from '@factory/storage';

import { clock } from '@/services/clock';
import type { Difficulty, JobRoleId } from '@/types/content';

export type PreparationGoal = 'first-job' | 'new-job' | 'career-change' | 'promotion' | 'practice';

export const PREPARATION_GOALS: readonly PreparationGoal[] = ['first-job', 'new-job', 'career-change', 'promotion', 'practice'];

export interface UserProfile {
  /** Null when the user skipped the role step: recommendations then use general questions. */
  jobRole: JobRoleId | null;
  level: Difficulty;
  goal: PreparationGoal;
  /** Days available before the interview; null = no deadline. */
  daysAvailable: number | null;
}

interface Row {
  job_role: string | null;
  level: string;
  goal: string;
  days_available: number | null;
}

export function createProfileRepository(db: SqlDatabase) {
  return {
    async get(): Promise<UserProfile | null> {
      const r = await db.getFirstAsync<Row>('SELECT job_role, level, goal, days_available FROM user_profile WHERE id = 1', []);
      if (!r) return null;
      return {
        jobRole: (r.job_role as JobRoleId | null) ?? null,
        level: r.level as Difficulty,
        goal: r.goal as PreparationGoal,
        daysAvailable: r.days_available ?? null,
      };
    },

    async save(p: UserProfile): Promise<void> {
      const now = clock.now().toISOString();
      await db.runAsync(
        `INSERT INTO user_profile (id, job_role, level, goal, days_available, created_at, updated_at)
         VALUES (1, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET job_role = excluded.job_role, level = excluded.level, goal = excluded.goal,
           days_available = excluded.days_available, updated_at = excluded.updated_at`,
        [p.jobRole, p.level, p.goal, p.daysAvailable, now, now],
      );
    },
  };
}
