import type { AdminDeadline, DayKey, InsurancePolicy, TireRecord, VehicleDocument } from '@/types';
import { addDays, addMonths, diffDays } from '@/utils/dates';

/**
 * Administrative deadlines, insurance terms, document expiries.
 * Rules differ by country (inspection every 1, 2 or 4 years, annual tax or not…),
 * so AutoCare stores only what the user enters: no built-in legal intervals.
 */
export type DeadlineStatus = 'overdue' | 'due_soon' | 'ok' | 'done';

export function deadlineStatus(d: Pick<AdminDeadline, 'dueDay' | 'completedAt' | 'remindDaysBefore'>, today: DayKey): DeadlineStatus {
  if (d.completedAt) return 'done';
  const days = diffDays(today, d.dueDay);
  if (days < 0) return 'overdue';
  const lead = Math.max(0, ...d.remindDaysBefore, 0);
  return days <= Math.max(lead, 7) ? 'due_soon' : 'ok';
}

/** Completing a repeating deadline creates the next one N months after the due date. */
export function nextDeadlineDay(d: Pick<AdminDeadline, 'dueDay' | 'repeatMonths'>): DayKey | null {
  return d.repeatMonths ? addMonths(d.dueDay, d.repeatMonths) : null;
}

export function normalizeLeadDays(values: readonly number[]): number[] {
  return [...new Set(values.filter((v) => Number.isInteger(v) && v >= 0 && v <= 365))].sort((a, b) => b - a);
}

/* ------------------------------------------------------------- insurance */

export type PolicyStatus = 'active' | 'expiring' | 'expired' | 'upcoming';

export function policyStatus(p: Pick<InsurancePolicy, 'startDay' | 'endDay' | 'remindDaysBefore'>, today: DayKey): PolicyStatus {
  if (today < p.startDay) return 'upcoming';
  if (today > p.endDay) return 'expired';
  return diffDays(today, p.endDay) <= p.remindDaysBefore ? 'expiring' : 'active';
}

/** The policy that covers `today` (or the latest one when none does). */
export function currentPolicy<T extends Pick<InsurancePolicy, 'startDay' | 'endDay'>>(policies: readonly T[], today: DayKey): T | null {
  const active = policies.filter((p) => p.startDay <= today && p.endDay >= today).sort((a, b) => (a.endDay < b.endDay ? 1 : -1));
  if (active[0]) return active[0];
  return [...policies].sort((a, b) => (a.endDay < b.endDay ? 1 : -1))[0] ?? null;
}

/** Proposed dates for a renewal: starts the day after the end, same term length. */
export function renewalTerm(p: Pick<InsurancePolicy, 'startDay' | 'endDay'>): { startDay: DayKey; endDay: DayKey } {
  const startDay = addDays(p.endDay, 1);
  const months = Math.max(1, Math.round(diffDays(p.startDay, p.endDay) / 30.44));
  return { startDay, endDay: addDays(addMonths(startDay, months), -1) };
}

/** Number of premium payments per year for a frequency. */
export function paymentsPerYear(f: InsurancePolicy['paymentFrequency']): number {
  return { monthly: 12, quarterly: 4, semiannual: 2, annual: 1, single: 1 }[f];
}

/** Payment days expected in the term (first on the start day). */
export function expectedPaymentDays(p: Pick<InsurancePolicy, 'startDay' | 'endDay' | 'paymentFrequency'>): DayKey[] {
  if (p.paymentFrequency === 'single' || p.paymentFrequency === 'annual') return [p.startDay];
  const step = 12 / paymentsPerYear(p.paymentFrequency);
  const out: DayKey[] = [];
  for (let i = 0; i < 60; i++) {
    const d = addMonths(p.startDay, i * step);
    if (d > p.endDay) break;
    out.push(d);
  }
  return out;
}

/* ------------------------------------------------------------- documents & tires */

export function documentExpiryStatus(d: Pick<VehicleDocument, 'expiryDay'>, today: DayKey, leadDays = 30): 'none' | 'expired' | 'expiring' | 'valid' {
  if (!d.expiryDay) return 'none';
  const days = diffDays(today, d.expiryDay);
  return days < 0 ? 'expired' : days <= leadDays ? 'expiring' : 'valid';
}

/** Tire wear is NOT measured: these are only the user's own reminders and the distance driven. */
export function tireDistanceKm(t: Pick<TireRecord, 'installedOdometerKm' | 'removedOdometerKm' | 'status'>, currentOdometerKm: number | null): number | null {
  if (t.installedOdometerKm === null) return null;
  const end = t.removedOdometerKm ?? (t.status === 'mounted' ? currentOdometerKm : null);
  if (end === null || end < t.installedOdometerKm) return null;
  return end - t.installedOdometerKm;
}
