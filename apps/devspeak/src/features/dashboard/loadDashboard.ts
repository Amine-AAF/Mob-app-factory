import { dayIndex, lastNDays, levelFromXp, toDayKey } from '@factory/app-core';

import type { Repositories } from '@/database';
import { dailyXpGoal, type UserProfile } from '@/database/repositories/profileRepository';
import { continueLesson, recommendLessons } from '@/features/learning/recommendations';

export async function loadDashboard(r: Repositories, profile: UserProfile | null, isPremium: boolean, now: Date) {
  const today = toDayKey(now);
  const [stats, lessons, statuses, challengeDone, week, challenge] = await Promise.all([
    r.progress.getStats(now),
    r.content.listLessons(),
    r.progress.lessonStatuses(),
    r.progress.isDailyChallengeDone(now),
    r.progress.activity(lastNDays(today, 7)),
    r.content.getDailyChallenge(dayIndex(today)),
  ]);
  const completed = new Set([...statuses].filter(([, s]) => s.status === 'completed').map(([id]) => id));
  const goal = dailyXpGoal(profile?.dailyMinutes ?? 10);
  return {
    stats,
    level: levelFromXp(stats.totalXp),
    goal,
    goalProgress: Math.min(1, stats.todayXp / goal),
    totalLessons: lessons.length,
    resume: continueLesson(lessons, statuses),
    recommended: recommendLessons(lessons, profile, completed, isPremium, 3),
    statuses,
    challenge,
    challengeDone,
    week,
    today,
  };
}

export type DashboardData = Awaited<ReturnType<typeof loadDashboard>>;
