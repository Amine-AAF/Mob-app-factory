import type { Repositories } from '@/database';
import { newlyUnlocked } from '@/features/goals/achievements';
import { useSession } from '@/store/session';

import { recordError } from './analytics';

/**
 * Call after any learning write: refreshes screens and unlocks newly earned badges.
 * Never throws (badges must not break a review or a quiz).
 */
export async function afterLearningWrite(repos: Repositories): Promise<string[]> {
  useSession.getState().bump();
  try {
    const [stats, unlocked] = await Promise.all([repos.goals.achievementStats(), repos.goals.unlockedAchievements()]);
    const fresh = newlyUnlocked(stats, new Set(unlocked.map((u) => u.id))).map((a) => a.id);
    if (fresh.length) {
      await repos.goals.unlock(fresh);
      useSession.getState().pushCelebration(fresh);
    }
    return fresh;
  } catch (e) {
    recordError(e, 'achievements');
    return [];
  }
}
