import type { Repositories } from '@/database';
import { computeFocus, msToMinutes } from '@/features/focus/pomodoro';
import { useFocus } from '@/store/focus';

/**
 * Records a focus run that finished while the app was closed (called at start-up).
 * A run that is still in progress is left untouched: the focus screen resumes it.
 */
export async function settleFinishedFocus(repos: Repositories, now = Date.now()): Promise<boolean> {
  if (!useFocus.persist.hasHydrated()) await new Promise<void>((resolve) => useFocus.persist.onFinishHydration(() => resolve()));
  const { run, linkedSessionId, clear } = useFocus.getState();
  if (!run) return false;
  const snap = computeFocus(run, now);
  if (snap.phase !== 'finished') return false;
  const minutes = msToMinutes(snap.focusedMs);
  if (minutes > 0) {
    await repos.planner.saveFocus({
      subjectId: run.subjectId,
      preset: run.config.preset,
      startedAt: new Date(run.startedAt).toISOString(),
      endedAt: new Date(now).toISOString(),
      focusMinutes: minutes,
      cycles: snap.completedCycles,
      completed: true,
    });
    if (linkedSessionId) await repos.planner.completeSession(linkedSessionId, minutes);
  }
  clear();
  return true;
}
