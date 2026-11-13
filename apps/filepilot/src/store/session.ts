import type { ThemePreference } from '@factory/design-system';
import { FREE_STATE, type EntitlementState, type PlanOption } from '@factory/monetization';
import { create } from 'zustand';

import type { DailyUsage, UserPreferences } from '@/database/repositories/settingsRepositories';
import { DEFAULT_PREFERENCES } from '@/database/repositories/settingsRepositories';

/**
 * In-memory app state. SQLite stays the source of truth; this store mirrors what
 * screens need synchronously (theme, plan, quota) and is hydrated at boot.
 */
interface SessionState {
  ready: boolean;
  preferences: UserPreferences;
  onboardingCompleted: boolean;
  analyticsConsent: boolean;
  sessionCount: number;
  entitlement: EntitlementState;
  plans: PlanOption[];
  storeAvailable: boolean;
  usage: DailyUsage;
  /** Bumped after any write that screens display (history, usage). */
  dataVersion: number;
  set: (patch: Partial<Omit<SessionState, 'set' | 'bump'>>) => void;
  bump: () => void;
}

export const useSession = create<SessionState>()((set) => ({
  ready: false,
  preferences: DEFAULT_PREFERENCES,
  onboardingCompleted: false,
  analyticsConsent: false,
  sessionCount: 0,
  entitlement: FREE_STATE,
  plans: [],
  storeAvailable: false,
  usage: { day: '', operations: 0, bonus: 0, rewardedCount: 0 },
  dataVersion: 0,
  set: (patch) => set(patch),
  bump: () => set((s) => ({ dataVersion: s.dataVersion + 1 })),
}));

export const useIsPremium = () => useSession((s) => s.entitlement.isPremium);
export const useThemePreference = (): ThemePreference => useSession((s) => s.preferences.theme);
