/**
 * Free vs Premium. The free version is genuinely useful; Premium removes limits and
 * unlocks advanced tools. Limits are checked in one place (`canAdd`) and enforced by the UI
 * before navigation to an editor, never by deleting or hiding existing user data.
 */
export const FREE_LIMITS = {
  items: 50,
  outfits: 20,
  activeTrips: 1,
  suggestionResults: 3,
  wishlist: Number.POSITIVE_INFINITY,
} as const;

export const PREMIUM_SUGGESTION_RESULTS = 8;

export type PremiumFeature =
  | 'unlimited_items'
  | 'unlimited_outfits'
  | 'advanced_suggestions'
  | 'full_insights'
  | 'advanced_calendar'
  | 'full_packing'
  | 'detailed_history'
  | 'advanced_shopping'
  | 'export'
  | 'premium_themes'
  | 'no_ads';

export type LimitedResource = 'items' | 'outfits' | 'activeTrips';

export function canAdd(resource: LimitedResource, currentCount: number, isPremium: boolean): boolean {
  return isPremium || currentCount < FREE_LIMITS[resource];
}

export function remaining(resource: LimitedResource, currentCount: number, isPremium: boolean): number | null {
  return isPremium ? null : Math.max(0, FREE_LIMITS[resource] - currentCount);
}
