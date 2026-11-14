/**
 * Number of questions to study per day to cover `total` questions in the time available.
 * Bounded so the daily load stays realistic (3 to 15); defaults to 5 without a deadline.
 */
export function dailyTarget(total: number, days: number | null): number {
  if (!days || days <= 0) return 5;
  return Math.min(15, Math.max(3, Math.ceil(total / days)));
}
