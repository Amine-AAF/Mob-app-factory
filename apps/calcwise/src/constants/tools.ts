import type { IconName } from '@factory/design-system';

/**
 * Catalogue of CalcWise calculators. Each tool has its own screen; `route` is the
 * Expo Router path. `premium` marks tools whose ADVANCED parts need Premium
 * (the basic calculation always stays free).
 */
export type ToolId = 'standard' | 'scientific' | 'percentage' | 'discount' | 'tip' | 'units' | 'loan' | 'savings';

export interface ToolDef {
  id: ToolId;
  icon: IconName;
  route: '/(tabs)/calculator' | '/tools/percentage' | '/tools/discount' | '/tools/tip' | '/tools/units' | '/tools/loan' | '/tools/savings';
  category: 'everyday' | 'money' | 'convert';
  /** Has advanced features reserved for Premium (amortization detail, comparisons…). */
  advanced: boolean;
}

export const TOOLS: ToolDef[] = [
  { id: 'standard', icon: 'calculator-outline', route: '/(tabs)/calculator', category: 'everyday', advanced: false },
  { id: 'scientific', icon: 'flask-outline', route: '/(tabs)/calculator', category: 'everyday', advanced: false },
  { id: 'percentage', icon: 'pie-chart-outline', route: '/tools/percentage', category: 'everyday', advanced: false },
  { id: 'discount', icon: 'pricetag-outline', route: '/tools/discount', category: 'money', advanced: false },
  { id: 'tip', icon: 'people-outline', route: '/tools/tip', category: 'money', advanced: false },
  { id: 'units', icon: 'swap-horizontal-outline', route: '/tools/units', category: 'convert', advanced: false },
  { id: 'loan', icon: 'business-outline', route: '/tools/loan', category: 'money', advanced: true },
  { id: 'savings', icon: 'trending-up-outline', route: '/tools/savings', category: 'money', advanced: true },
];

export const TOOL_IDS = TOOLS.map((t) => t.id);

export function getTool(id: string): ToolDef | undefined {
  return TOOLS.find((t) => t.id === id);
}

/** Free-tier limits. Premium removes them. */
export const LIMITS = {
  freeHistory: 50,
  freeFavorites: 3,
  /** A rewarded ad unlocks Premium tools for this long. */
  rewardedUnlockMs: 60 * 60 * 1000,
} as const;

export const DEFAULT_FAVORITES: ToolId[] = ['percentage', 'discount', 'tip'];
