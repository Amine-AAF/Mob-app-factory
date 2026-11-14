import { findFilter, PREMIUM_ADJUSTMENTS } from '@/constants/filterPresets';
import { FREE_LIMITS, PREMIUM_LIMITS } from '@/constants/limits';
import type { DailyUsage } from '@/database/repositories/settingsRepositories';
import type { AdjustmentKey, EditState } from '@/types/image';

/**
 * Free vs Premium rules (pure, tested). Premium is never simulated: `isPremium` comes only
 * from the store entitlement (RevenueCat) or its offline cache.
 *
 * Free users can always PREVIEW Premium items; exporting them requires Premium or one
 * optional rewarded unlock (a few per day).
 */
export type PremiumReason = 'filter' | 'advanced_adjustment' | 'watermark' | 'high_quality' | 'social_preset' | 'collage_template' | 'batch_size' | 'target_size' | 'advanced_quality';

export function editPremiumReasons(edit: EditState): PremiumReason[] {
  const reasons: PremiumReason[] = [];
  if (findFilter(edit.filterId).premium) reasons.push('filter');
  if ((Object.keys(edit.adjustments) as AdjustmentKey[]).some((k) => PREMIUM_ADJUSTMENTS.has(k) && edit.adjustments[k] !== 0)) reasons.push('advanced_adjustment');
  if (edit.watermark) reasons.push('watermark');
  return reasons;
}

export function exportPixelCap(isPremium: boolean): number {
  return isPremium ? PREMIUM_LIMITS.maxExportPixels : FREE_LIMITS.maxExportPixels;
}

export function batchCap(isPremium: boolean): number {
  return isPremium ? PREMIUM_LIMITS.batchImages : FREE_LIMITS.batchImages;
}

export function qualityRange(isPremium: boolean): [number, number] {
  return isPremium ? [PREMIUM_LIMITS.minQuality, PREMIUM_LIMITS.maxQuality] : [FREE_LIMITS.minQuality, FREE_LIMITS.maxQuality];
}

export function collageMaxEdge(isPremium: boolean): number {
  return isPremium ? PREMIUM_LIMITS.collageMaxEdge : FREE_LIMITS.collageMaxEdge;
}

export interface UnlockStatus {
  /** Unused rewarded unlocks available right now. */
  available: number;
  /** Whether watching another optional rewarded ad is allowed today. */
  canEarn: boolean;
}

export function unlockStatus(usage: DailyUsage): UnlockStatus {
  return { available: Math.max(0, usage.rewardedUnlocks - usage.unlocksUsed), canEarn: usage.rewardedUnlocks < FREE_LIMITS.rewardedUnlocksPerDay };
}

export type ExportDecision = 'allowed' | 'use_unlock' | 'premium_required';

export function exportDecision(isPremium: boolean, reasons: PremiumReason[], usage: DailyUsage): ExportDecision {
  if (isPremium || reasons.length === 0) return 'allowed';
  return unlockStatus(usage).available > 0 ? 'use_unlock' : 'premium_required';
}
