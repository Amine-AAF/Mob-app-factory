import { diffDays, type DayKey } from './dates';

export type ExpiryStatus = 'none' | 'valid' | 'expiring' | 'expired';

/** Default look-ahead window for "expiring soon" on the dashboard. */
export const EXPIRING_WINDOW_DAYS = 60;

export function expiryStatus(expiry: DayKey | null | undefined, today: DayKey, windowDays = EXPIRING_WINDOW_DAYS): ExpiryStatus {
  if (!expiry) return 'none';
  const left = diffDays(today, expiry);
  if (left < 0) return 'expired';
  if (left <= windowDays) return 'expiring';
  return 'valid';
}

/** Days remaining (negative when expired), or null without a date. */
export function daysLeft(expiry: DayKey | null | undefined, today: DayKey): number | null {
  return expiry ? diffDays(today, expiry) : null;
}

/** Whether a repair reported on `reportedOn` is covered by a warranty ending `warrantyEnd`. */
export function coveredByWarranty(warrantyEnd: DayKey | null | undefined, reportedOn: DayKey): boolean {
  return !!warrantyEnd && reportedOn <= warrantyEnd;
}
