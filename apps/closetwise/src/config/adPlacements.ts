/**
 * Where a banner may appear. Ads are only shown on browse screens, anchored at the bottom and
 * labelled. They are NEVER shown while the user is creating an outfit or planning
 * (outfit builder, suggestions, calendar, day planner, trip/packing editors, paywall, forms).
 */
export const AD_SCREENS = ['home', 'wardrobe', 'outfits', 'wishlist', 'shopping', 'insights'] as const;
export type AdScreen = (typeof AD_SCREENS)[number];

export const AD_FREE_SCREENS = ['outfit_builder', 'suggestions', 'calendar', 'day_plan', 'trip', 'item_editor', 'paywall', 'onboarding'] as const;

export function screenAllowsAds(screen: string): boolean {
  return (AD_SCREENS as readonly string[]).includes(screen) && !(AD_FREE_SCREENS as readonly string[]).includes(screen);
}
