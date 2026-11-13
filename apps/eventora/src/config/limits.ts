/**
 * Free vs Premium. Pure policy, so screens and tests share one definition.
 * Free users keep full ownership of their data: JSON backup/restore, data
 * deletion and the plain-text invitation stay free.
 */
export const FREE_LIMITS = {
  activeEvents: 2,
  guestsPerEvent: 150,
  seatingTables: 6,
  vendorsPerEvent: 3,
  customTemplates: 0,
} as const;

export type PremiumFeature =
  | 'unlimitedEvents'
  | 'moreGuests'
  | 'premiumInvitations'
  | 'advancedSeating'
  | 'pdfExport'
  | 'csvExport'
  | 'advancedBudget'
  | 'vendors'
  | 'premiumTemplates'
  | 'customTemplates'
  | 'advancedReports'
  | 'noAds';

export type LimitCheck = { allowed: true } | { allowed: false; feature: PremiumFeature; limit: number };

export function canCreateEvent(isPremium: boolean, activeCount: number): LimitCheck {
  if (isPremium || activeCount < FREE_LIMITS.activeEvents) return { allowed: true };
  return { allowed: false, feature: 'unlimitedEvents', limit: FREE_LIMITS.activeEvents };
}

/** `adding` = how many guests are about to be added (CSV import adds many). */
export function canAddGuests(isPremium: boolean, current: number, adding = 1): LimitCheck {
  if (isPremium || current + adding <= FREE_LIMITS.guestsPerEvent) return { allowed: true };
  return { allowed: false, feature: 'moreGuests', limit: FREE_LIMITS.guestsPerEvent };
}

export function canAddTable(isPremium: boolean, current: number): LimitCheck {
  if (isPremium || current < FREE_LIMITS.seatingTables) return { allowed: true };
  return { allowed: false, feature: 'advancedSeating', limit: FREE_LIMITS.seatingTables };
}

export function canAddVendor(isPremium: boolean, current: number): LimitCheck {
  if (isPremium || current < FREE_LIMITS.vendorsPerEvent) return { allowed: true };
  return { allowed: false, feature: 'vendors', limit: FREE_LIMITS.vendorsPerEvent };
}

/** Free plan: round & rectangle tables. Head table and custom layouts are Premium. */
export function canUseTableShape(isPremium: boolean, shape: string): boolean {
  return isPremium || shape === 'round' || shape === 'rect';
}

export function canExport(isPremium: boolean, format: 'pdf' | 'csv' | 'json' | 'text'): boolean {
  return format === 'json' || format === 'text' || isPremium;
}
