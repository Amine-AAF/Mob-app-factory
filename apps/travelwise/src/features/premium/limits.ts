import type { ItineraryTemplateKey } from '@/content/itineraryTemplates';
import type { PackingTemplateKey } from '@/content/packingCatalog';

/**
 * Free vs Premium. Everything essential works for free (trips, itinerary, bookings,
 * packing, budget, documents, journal, offline converter). Premium removes limits,
 * adds the detailed/advanced tools and exports, and removes ads.
 *
 * Only features that actually exist are listed on the paywall (PREMIUM_BENEFITS).
 */
export const FREE_LIMITS = {
  /** Trips that are planning / upcoming / ongoing (completed and archived trips never count). */
  activeTrips: 3,
  /** Rewarded ads can add a few extra active-trip slots, permanently. */
  maxBonusTripSlots: 2,
  documents: 10,
} as const;

export const FREE_ITINERARY_TEMPLATES: readonly ItineraryTemplateKey[] = ['weekend', 'city3', 'business'];
export const FREE_PACKING_TEMPLATES: readonly PackingTemplateKey[] = ['weekend', 'business', 'beach'];

export type PremiumFeature =
  | 'unlimited_trips'
  | 'unlimited_documents'
  | 'all_templates'
  | 'custom_split'
  | 'detailed_budget'
  | 'pdf_export'
  | 'csv_export'
  | 'no_ads';

export const PREMIUM_BENEFITS: PremiumFeature[] = ['unlimited_trips', 'detailed_budget', 'custom_split', 'pdf_export', 'csv_export', 'all_templates', 'unlimited_documents', 'no_ads'];

export function canCreateActiveTrip(isPremium: boolean, activeTrips: number, bonusSlots: number): boolean {
  if (isPremium) return true;
  return activeTrips < FREE_LIMITS.activeTrips + Math.min(bonusSlots, FREE_LIMITS.maxBonusTripSlots);
}

export function canAddDocument(isPremium: boolean, documents: number): boolean {
  return isPremium || documents < FREE_LIMITS.documents;
}

export function isItineraryTemplateFree(key: ItineraryTemplateKey): boolean {
  return FREE_ITINERARY_TEMPLATES.includes(key);
}

export function isPackingTemplateFree(key: PackingTemplateKey): boolean {
  return FREE_PACKING_TEMPLATES.includes(key);
}

/** Whether a rewarded ad can still grant an extra trip slot. */
export function canEarnBonusSlot(isPremium: boolean, bonusSlots: number): boolean {
  return !isPremium && bonusSlots < FREE_LIMITS.maxBonusTripSlots;
}

/**
 * Screens where ads are forbidden (product rule): documents, itinerary editing,
 * expense entry, exports, paywall, onboarding, forms. Banners are only allowed on
 * these browse screens.
 */
export const BANNER_SCREENS = ['home', 'trips', 'places', 'budget-tab'] as const;
export type BannerScreen = (typeof BANNER_SCREENS)[number];
