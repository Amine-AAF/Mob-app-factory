import { FREE_LIMITS } from '@/constants';
import { usePreferences } from '@/store/preferences';

/**
 * Free vs Premium gating. Pure functions so they are easy to test.
 * Free keeps everything needed to track money (transactions, standard categories,
 * subscriptions, basic stats, full JSON backup); Premium lifts the limits below.
 */
export type GatedFeature = 'accounts' | 'categoryBudgets' | 'customCategories' | 'savingsGoals' | 'yearReports' | 'historyCompare' | 'csvRangeExport';

export function canAdd(feature: keyof typeof FREE_LIMITS, currentCount: number, isPremium: boolean): boolean {
  return isPremium || currentCount < FREE_LIMITS[feature];
}

/** Detailed reports (year view, month-to-month comparisons) for Premium or after a rewarded ad. */
export function detailedReportsUnlocked(isPremium: boolean, now = Date.now()): boolean {
  return isPremium || usePreferences.getState().reportsUnlockedUntil > now;
}

export const REWARD_UNLOCK_MS = 24 * 60 * 60 * 1000;
