import { FREE_LIMITS, PREMIUM_LIMITS } from '@/config/limits';
import type { DailyUsage } from '@/database/repositories/settingsRepositories';

/**
 * Free-tier rules (pure). Only SUCCESSFUL operations count against the daily quota:
 * a failed, cancelled or interrupted operation never costs the user anything.
 */
export interface QuotaStatus {
  unlimited: boolean;
  limit: number;
  used: number;
  remaining: number;
  /** Whether an optional rewarded ad may still grant bonus operations today. */
  canEarnBonus: boolean;
}

export function quotaStatus(isPremium: boolean, usage: DailyUsage): QuotaStatus {
  if (isPremium) return { unlimited: true, limit: Infinity, used: usage.operations, remaining: Infinity, canEarnBonus: false };
  const limit = FREE_LIMITS.dailyOperations + usage.bonus;
  const remaining = Math.max(0, limit - usage.operations);
  return { unlimited: false, limit, used: usage.operations, remaining, canEarnBonus: usage.rewardedCount < FREE_LIMITS.maxRewardedPerDay };
}

export type GatedFeature = 'batch' | 'targetSize' | 'mergeFiles' | 'imagesPerPdf' | 'pdfToImagesPages' | 'fullHistory';

/** Numeric caps per plan (Infinity = no cap). */
export function featureCap(isPremium: boolean, feature: 'mergeFiles' | 'imagesPerPdf' | 'pdfToImagesPages' | 'batchImages' | 'historyEntries'): number {
  if (isPremium) {
    if (feature === 'historyEntries') return Infinity;
    return PREMIUM_LIMITS[feature];
  }
  if (feature === 'batchImages') return 1;
  return FREE_LIMITS[feature];
}

export function canUse(isPremium: boolean, feature: 'batch' | 'targetSize'): boolean {
  return isPremium || (feature !== 'batch' && feature !== 'targetSize');
}
