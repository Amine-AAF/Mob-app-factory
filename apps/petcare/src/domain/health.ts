import { addDays, diffDays } from './dates';
import type { Appointment, DayKey, Treatment, TreatmentStatus, Vaccination, VaccinationStatus } from './types';

/**
 * Status rules. They only organise dates the user entered: PetCare never decides
 * that a pet needs a vaccine or a treatment.
 */

/**
 * - `overdue`: a next due date exists and is before today.
 * - `upcoming`: a next due date exists and is today or later (or the vaccine was entered without
 *   an administration date yet, i.e. planned).
 * - `done`: administered and no further due date was set.
 */
export function vaccinationStatus(v: Pick<Vaccination, 'administeredDate' | 'nextDueDate'>, today: DayKey): VaccinationStatus {
  if (v.nextDueDate) return diffDays(today, v.nextDueDate) < 0 ? 'overdue' : 'upcoming';
  return v.administeredDate ? 'done' : 'upcoming';
}

/** Days until the next due date (negative when overdue), or null. */
export function daysUntilDue(v: Pick<Vaccination, 'nextDueDate'>, today: DayKey): number | null {
  return v.nextDueDate ? diffDays(today, v.nextDueDate) : null;
}

export const ENDING_SOON_DAYS = 3;

export function treatmentStatus(t: Pick<Treatment, 'startDate' | 'endDate' | 'stoppedAt'>, today: DayKey): TreatmentStatus {
  if (t.stoppedAt) return 'stopped';
  if (diffDays(today, t.startDate) > 0) return 'scheduled';
  if (t.endDate) {
    const left = diffDays(today, t.endDate);
    if (left < 0) return 'completed';
    if (left <= ENDING_SOON_DAYS) return 'ending_soon';
  }
  return 'active';
}

export function isTreatmentOngoing(status: TreatmentStatus): boolean {
  return status === 'active' || status === 'ending_soon';
}

/** Reminder times implied by a frequency; the user can always edit them. */
export function defaultReminderTimes(frequency: Treatment['frequency']): string[] {
  switch (frequency) {
    case 'twice_daily':
      return ['08:00', '20:00'];
    case 'three_times_daily':
      return ['08:00', '14:00', '20:00'];
    case 'as_needed':
      return [];
    default:
      return ['09:00'];
  }
}

/**
 * Days (inclusive range [from, to]) on which a treatment reminder is due, following
 * the prescribed frequency. Purely calendar based.
 */
export function treatmentDays(t: Pick<Treatment, 'startDate' | 'endDate' | 'frequency' | 'stoppedAt'>, from: DayKey, to: DayKey): DayKey[] {
  if (t.frequency === 'as_needed' || t.stoppedAt) return [];
  const days: DayKey[] = [];
  const last = t.endDate && diffDays(t.endDate, to) > 0 ? t.endDate : to;
  let day = diffDays(from, t.startDate) > 0 ? t.startDate : from;
  for (; diffDays(day, last) >= 0; day = addDays(day, 1)) {
    const offset = diffDays(t.startDate, day);
    if (offset < 0) continue;
    const due =
      t.frequency === 'every_other_day'
        ? offset % 2 === 0
        : t.frequency === 'weekly'
          ? offset % 7 === 0
          : t.frequency === 'monthly'
            ? day.slice(8) === t.startDate.slice(8)
            : t.frequency === 'once'
              ? offset === 0
              : true;
    if (due) days.push(day);
  }
  return days;
}

export function isUpcomingAppointment(a: Pick<Appointment, 'status' | 'startsAt'>, now: Date): boolean {
  return a.status === 'scheduled' && new Date(a.startsAt).getTime() >= now.getTime();
}

/** A scheduled appointment whose time has passed and that the user has not closed. */
export function isPastDueAppointment(a: Pick<Appointment, 'status' | 'startsAt'>, now: Date): boolean {
  return a.status === 'scheduled' && new Date(a.startsAt).getTime() < now.getTime();
}
