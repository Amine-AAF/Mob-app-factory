/**
 * Free vs Premium. Limits are checked in one place (`canCreate`) so screens and
 * tests agree. Existing data is never deleted or hidden when a subscription ends:
 * over-limit users can still view, edit, complete and delete; they just can't add more.
 */
export const FREE_LIMITS = {
  homes: 1,
  assets: 15,
  documents: 25,
  inventoryItems: 30,
  householdMembers: 2,
  /** History screens show this many days unless Premium. */
  historyDays: 90,
} as const;

export type LimitedResource = 'homes' | 'assets' | 'documents' | 'inventoryItems' | 'householdMembers';

export function canCreate(resource: LimitedResource, currentCount: number, isPremium: boolean): boolean {
  return isPremium || currentCount < FREE_LIMITS[resource];
}

/** Premium-only capabilities (shown with a lock and routed to the paywall). */
export const PREMIUM_FEATURES = [
  'multipleHomes',
  'unlimitedAssets',
  'fullHistory',
  'advancedDocuments',
  'exportPdfCsv',
  'advancedStats',
  'allTemplates',
  'advancedReminders',
  'noAds',
] as const;
export type PremiumFeature = (typeof PREMIUM_FEATURES)[number];
