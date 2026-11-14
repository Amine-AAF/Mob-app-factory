import type { EntitlementState, PlanOption } from '@factory/monetization';
import { FREE_STATE } from '@factory/monetization';
import { create } from 'zustand';

import { DEFAULT_APP_SETTINGS, type AppSettings } from '@/database/repositories/careGoalsSettingsRepository';
import type { Category, Tag } from '@/domain/types';

export interface Taxonomy {
  categories: Category[];
  /** Including archived ones, so labels of older items still resolve. */
  styles: Tag[];
  occasions: Tag[];
}

/** In-memory session state. The source of truth for persisted data stays in SQLite. */
interface SessionState {
  dbReady: boolean;
  entitlement: EntitlementState;
  plans: PlanOption[];
  storeAvailable: boolean;
  settings: AppSettings;
  taxonomy: Taxonomy;
  /** Bumped after any write so screens reload their data. */
  dataVersion: number;
  setEntitlement: (e: EntitlementState) => void;
  setPlans: (plans: PlanOption[], storeAvailable: boolean) => void;
  setSettings: (s: AppSettings) => void;
  setTaxonomy: (t: Taxonomy) => void;
  markDbReady: () => void;
  bump: () => void;
}

export const useSession = create<SessionState>()((set) => ({
  dbReady: false,
  entitlement: FREE_STATE,
  plans: [],
  storeAvailable: false,
  settings: DEFAULT_APP_SETTINGS,
  taxonomy: { categories: [], styles: [], occasions: [] },
  dataVersion: 0,
  setEntitlement: (entitlement) => set({ entitlement }),
  setPlans: (plans, storeAvailable) => set({ plans, storeAvailable }),
  setSettings: (settings) => set({ settings }),
  setTaxonomy: (taxonomy) => set({ taxonomy }),
  markDbReady: () => set({ dbReady: true }),
  bump: () => set((s) => ({ dataVersion: s.dataVersion + 1 })),
}));

export const useIsPremium = () => useSession((s) => s.entitlement.isPremium);
export const useSettings = () => useSession((s) => s.settings);
export const useTaxonomy = () => useSession((s) => s.taxonomy);
