import { toDayKey } from '@/domain/dates';
import type { Home } from '@/domain/types';
import { usePreferences } from '@/store/preferences';
import { useSession } from '@/store/session';
import { clock } from '@/services/clock';

/** The home currently selected (null only before onboarding or after deleting the last one). */
export function useActiveHome(): Home | null {
  const homes = useSession((s) => s.homes);
  const activeId = usePreferences((s) => s.activeHomeId);
  return homes.find((h) => h.id === activeId) ?? homes[0] ?? null;
}

/** Today's local day key (re-evaluated on each render; screens reload on focus). */
export function useToday(): string {
  return toDayKey(clock.now());
}
