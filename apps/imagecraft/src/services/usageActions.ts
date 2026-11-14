import { repos } from '@/database';
import { useSession } from '@/store/session';

import { clock } from './clock';

/** Rewarded unlocks (optional ads → one Premium export each, capped per day). */
export async function refreshUsage(): Promise<void> {
  useSession.getState().set({ usage: await repos().usage.get(clock.today()) });
}

/** Called ONLY from the rewarded ad's EARNED_REWARD callback. */
export async function grantRewardedUnlock(): Promise<void> {
  await repos().usage.addUnlock(clock.today());
  await refreshUsage();
}

/** Consumes one unlock at export time. Returns false if none is left. */
export async function consumeUnlock(): Promise<boolean> {
  const ok = await repos().usage.consumeUnlock(clock.today());
  await refreshUsage();
  return ok;
}
