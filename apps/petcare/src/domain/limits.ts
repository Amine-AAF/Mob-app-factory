import { addDays } from './dates';
import type { DayKey } from './types';

/**
 * Free vs Premium. Limits hide or block *new* actions; they never delete data.
 * Exporting a backup and deleting all data stay free (privacy rights).
 */
export const FREE_LIMITS = {
  pets: 2,
  /** Health, weight, activity, feeding and expense history visible in the free version. */
  historyDays: 180,
  documentsPerPet: 5,
  /** Number of built-in templates available for free (the first N in catalogue order). */
  freeTemplates: 12,
  customChecklists: 3,
} as const;

export type PremiumFeature =
  | 'unlimited_pets'
  | 'full_history'
  | 'advanced_documents'
  | 'advanced_stats'
  | 'export_pdf_csv'
  | 'advanced_expenses'
  | 'premium_templates'
  | 'no_ads';

export function canAddPet(activePetCount: number, isPremium: boolean): boolean {
  return isPremium || activePetCount < FREE_LIMITS.pets;
}

export function canAddDocument(petDocumentCount: number, isPremium: boolean): boolean {
  return isPremium || petDocumentCount < FREE_LIMITS.documentsPerPet;
}

export function canAddChecklist(count: number, isPremium: boolean): boolean {
  return isPremium || count < FREE_LIMITS.customChecklists;
}

/** Oldest day visible in history lists; null = everything. */
export function historyCutoff(isPremium: boolean, today: DayKey): DayKey | null {
  return isPremium ? null : addDays(today, -FREE_LIMITS.historyDays);
}

/** Splits a day-sorted list into visible and hidden (older than the free window) entries. */
export function applyHistoryLimit<T>(items: readonly T[], dayOf: (item: T) => DayKey, isPremium: boolean, today: DayKey): { visible: T[]; hiddenCount: number } {
  const cutoff = historyCutoff(isPremium, today);
  if (!cutoff) return { visible: [...items], hiddenCount: 0 };
  const visible = items.filter((i) => dayOf(i) >= cutoff);
  return { visible, hiddenCount: items.length - visible.length };
}

export function isTemplateLocked(index: number, isPremium: boolean): boolean {
  return !isPremium && index >= FREE_LIMITS.freeTemplates;
}
