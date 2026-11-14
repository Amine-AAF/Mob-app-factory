import { addDays } from '@factory/app-core';

import { FREE_LIMITS } from '@/config/limits';
import type { Repositories } from '@/database';
import { BADGES, CHALLENGES, challengeProgress, goalProgress, newlyUnlocked, type GoalContext } from '@/features/goals/goals';
import { currentBests } from '@/features/performance/records';
import { activeDays, totals, weekStreak, type CompletedSession } from '@/features/stats/stats';
import { usePreferences } from '@/store/preferences';
import { useSession } from '@/store/session';
import type { CardioActivity, DayKey, PerformanceRecord } from '@/types';

import { track } from './analytics';
import { clock } from './clock';

export interface ProgressData {
  today: DayKey;
  sessions: CompletedSession[];
  cardio: CardioActivity[];
  records: PerformanceRecord[];
  /** False when the free look-back window hid older data. */
  limited: boolean;
}

/** Loads the activity the screens aggregate; free users see the last FREE_LIMITS.historyDays days. */
export async function loadProgress(r: Repositories, opts: { premium: boolean }): Promise<ProgressData> {
  const today = clock.today();
  const since = opts.premium ? undefined : addDays(today, -FREE_LIMITS.historyDays);
  const [sessions, cardio, records] = await Promise.all([r.sessions.completed({ since }), r.cardio.list({ since }), r.records.all()]);
  let limited = false;
  if (!opts.premium) {
    const older = await r.sessions.completed({});
    limited = older.length > sessions.length;
  }
  return { today, sessions, cardio, records: since ? records.filter((x) => x.day >= since) : records, limited };
}

export function goalContext(r: Pick<ProgressData, 'today' | 'sessions' | 'cardio' | 'records'>): GoalContext {
  const byExercise = new Map<string, PerformanceRecord[]>();
  for (const rec of r.records) (byExercise.get(rec.exerciseId) ?? byExercise.set(rec.exerciseId, []).get(rec.exerciseId)!).push(rec);
  const best = (id: string, kind: 'max_reps' | 'max_weight') => currentBests(byExercise.get(id) ?? []).get(kind)?.value ?? null;
  return {
    today: r.today,
    sessions: r.sessions,
    cardio: r.cardio,
    bestReps: (id) => best(id, 'max_reps'),
    bestWeight: (id) => best(id, 'max_weight'),
    weeklyTarget: usePreferences.getState().weeklyTarget,
  };
}

/** Days on which a real (non-baseline) record was set. */
export function recordDays(records: readonly PerformanceRecord[]): DayKey[] {
  // The first record per exercise & kind is a baseline, not an improvement.
  const seen = new Set<string>();
  const out: DayKey[] = [];
  for (const rec of [...records].sort((a, b) => a.achievedAt - b.achievedAt)) {
    const k = `${rec.exerciseId}:${rec.kind}`;
    if (rec.kind === 'est_1rm') continue; // estimates never count as achievements
    if (seen.has(k)) out.push(rec.day);
    else seen.add(k);
  }
  return out;
}

/** Updates achievements, goals and challenges after any activity. Returns newly unlocked badge ids. */
export async function evaluateAchievements(r: Repositories): Promise<string[]> {
  const today = clock.today();
  const [sessions, cardio, records, programs, measurements, already, runs, goals] = await Promise.all([
    r.sessions.completed(),
    r.cardio.list(),
    r.records.all(),
    r.programs.list({ includeArchived: true }),
    r.body.count(),
    r.goals.achievements(),
    r.goals.challenges(),
    r.goals.list(),
  ]);
  const weeklyTarget = usePreferences.getState().weeklyTarget;
  const rDays = recordDays(records);

  // Challenges
  let challengesCompleted = runs.filter((x) => x.status === 'completed').length;
  for (const run of runs.filter((x) => x.status === 'active')) {
    const def = CHALLENGES.find((c) => c.id === run.challengeId);
    if (!def) continue;
    const p = challengeProgress(run, def, { today, sessions, cardio, recordDays: rDays, weeklyTarget });
    if (p.status === 'completed') {
      await r.goals.setChallengeStatus(run.id, 'completed');
      challengesCompleted++;
    }
  }

  // Goals: remember when a goal was first reached (shown as a celebration, never a reset).
  const ctx = goalContext({ today, sessions, cardio, records });
  for (const g of goals.filter((x) => x.active && !x.achievedAt)) {
    if (goalProgress(g, ctx).reached && !g.kind.startsWith('weekly_')) await r.goals.update(g.id, { achievedAt: clock.now().getTime() });
  }

  const t = totals(sessions, cardio);
  const ids = newlyUnlocked(
    {
      sessions: sessions.length,
      cardio: cardio.length,
      records: rDays.length,
      bestWeekStreak: weekStreak(activeDays(sessions, cardio), today, weeklyTarget).best,
      programsCreated: programs.filter((p) => p.origin !== 'template').length,
      measurements,
      totalMinutes: t.minutes,
      challengesCompleted,
    },
    new Set(already.keys()),
  );
  if (ids.length) {
    await r.goals.unlock(ids);
    ids.forEach((id) => track('achievement_unlocked', { achievement_id: id }));
    useSession.getState().pushAchievements(ids);
  }
  return ids;
}

export { BADGES, CHALLENGES };
