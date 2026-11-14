/**
 * Free vs Premium. Pure rules, unit-tested; the UI asks these functions and
 * routes to the paywall with the matching `reason`.
 *
 * Principle: the user's data is never held hostage. Everything already entered
 * stays visible, editable and exportable (JSON backup is always free). Limits
 * only apply to creating more of something, or to advanced analysis.
 */
export const FREE_LIMITS = {
  vehicles: 1,
  /** Manual expenses per calendar month (fuel fills and maintenance are unlimited). */
  expensesPerMonth: 40,
  documents: 10,
  /** Active maintenance schedules with reminders. */
  schedules: 5,
  /** Months of history shown in charts and statistics. */
  statsMonths: 6,
} as const;

export type PremiumFeature =
  | 'vehicles'
  | 'expenses'
  | 'documents'
  | 'schedules'
  | 'advanced_stats'
  | 'reports'
  | 'comparison'
  | 'advanced_reminders'
  | 'ads'
  | 'template_customization';

export function canAddVehicle(isPremium: boolean, activeVehicles: number): boolean {
  return isPremium || activeVehicles < FREE_LIMITS.vehicles;
}

export function canAddExpense(isPremium: boolean, expensesThisMonth: number): boolean {
  return isPremium || expensesThisMonth < FREE_LIMITS.expensesPerMonth;
}

export function canAddDocument(isPremium: boolean, documents: number): boolean {
  return isPremium || documents < FREE_LIMITS.documents;
}

export function canAddSchedule(isPremium: boolean, schedules: number): boolean {
  return isPremium || schedules < FREE_LIMITS.schedules;
}

/** Number of months shown in charts. */
export function statsMonths(isPremium: boolean): number {
  return isPremium ? 24 : FREE_LIMITS.statsMonths;
}

/** Premium-only areas (no partial access). Listed explicitly so a free feature can't slip in by typo. */
const PREMIUM_ONLY = new Set(['reports', 'comparison', 'advanced_reminders', 'advanced_stats', 'template_customization']);
export function hasFeature(isPremium: boolean, feature: 'reports' | 'comparison' | 'advanced_reminders' | 'advanced_stats' | 'template_customization'): boolean {
  return isPremium || !PREMIUM_ONLY.has(feature);
}
