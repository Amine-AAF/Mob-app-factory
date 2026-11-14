/**
 * Free vs Premium. Kept in one place so the paywall copy, the UI gates and the tests agree.
 * Rules never delete or hide existing user data: when premium lapses, everything already
 * recorded stays readable; only *adding* beyond the free limits is gated.
 */
export const FREE_PLANT_LIMIT = 10;
/** The free "basic library" is the set of sheets flagged `core: true` in the content. */
/** Free journal = text entries; photos in the journal are part of Premium's photo journal. */
export const FREE_JOURNAL_PHOTO = false;
/** Free history depth (days) shown in charts and history lists; older records stay stored. */
export const FREE_HISTORY_DAYS = 90;
export const FREE_GROWTH_RECORDS_PER_PLANT = 5;
export const FREE_LOCATION_LIMIT = 3;

export type PremiumFeature =
  | 'unlimited_plants'
  | 'full_library'
  | 'advanced_history'
  | 'detailed_growth'
  | 'photo_journal'
  | 'advanced_stats'
  | 'full_garden'
  | 'seasonal_templates'
  | 'pdf_export'
  | 'no_ads';

export function canAddPlant(isPremium: boolean, currentCount: number): boolean {
  return isPremium || currentCount < FREE_PLANT_LIMIT;
}

export function canAddLocation(isPremium: boolean, currentCount: number): boolean {
  return isPremium || currentCount < FREE_LOCATION_LIMIT;
}

export function canAddGrowthRecord(isPremium: boolean, recordsForPlant: number): boolean {
  return isPremium || recordsForPlant < FREE_GROWTH_RECORDS_PER_PLANT;
}

/** Journal photos are a premium feature; text entries are always free. */
export function canAttachJournalPhoto(isPremium: boolean): boolean {
  return isPremium || FREE_JOURNAL_PHOTO;
}

export function canOpenSpecies(isPremium: boolean, species: { core: boolean }): boolean {
  return isPremium || species.core;
}

/** Oldest day shown in history lists for the current plan (null = no limit). */
export function historyCutoff(isPremium: boolean, today: string, addDays: (k: string, n: number) => string): string | null {
  return isPremium ? null : addDays(today, -FREE_HISTORY_DAYS);
}
