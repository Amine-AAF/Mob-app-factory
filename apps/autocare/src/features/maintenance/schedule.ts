import { estimateDayForOdometer, type DailyRate, type Reading } from '@/features/odometer/mileage';
import type { DayKey, MaintenanceRecord, MaintenanceSchedule } from '@/types';
import { addMonths, diffDays } from '@/utils/dates';

/**
 * Next-due computation for user-defined maintenance schedules.
 *
 * AutoCare ships NO universal intervals: each schedule's km and/or month
 * interval comes from the user (owner's manual, mechanic's advice). With both,
 * whichever comes first applies. Mileage-based due dates are projections from
 * the odometer readings and are always flagged `estimated`.
 */
export type DueStatus = 'overdue' | 'due_soon' | 'ok' | 'unknown';

export interface DueInfo {
  scheduleId: string;
  status: DueStatus;
  /** Day due by the time interval. */
  dueDayByTime: DayKey | null;
  /** Odometer due by the distance interval. */
  dueKm: number | null;
  /** Estimated day when `dueKm` will be reached (projection). */
  estimatedDayByKm: DayKey | null;
  /** Earliest of the two, used for sorting and notifications. */
  nextDay: DayKey | null;
  /** True when `nextDay` comes from the mileage projection. */
  estimated: boolean;
  /** Remaining km (negative when overdue); null without a km interval or odometer. */
  kmRemaining: number | null;
  daysRemaining: number | null;
  /** The schedule has never been done: there is no reference point yet. */
  neverDone: boolean;
}

export function computeDue(schedule: MaintenanceSchedule, ctx: { today: DayKey; odometerKm: number | null; latest: Reading | null; rate: DailyRate | null }): DueInfo {
  const neverDone = schedule.lastDay === null && schedule.lastOdometerKm === null;
  const dueDayByTime = schedule.intervalMonths && schedule.lastDay ? addMonths(schedule.lastDay, schedule.intervalMonths) : null;
  const dueKm = schedule.intervalKm && schedule.lastOdometerKm !== null ? schedule.lastOdometerKm + schedule.intervalKm : null;
  const estimatedDayByKm = dueKm !== null ? estimateDayForOdometer(dueKm, ctx.latest, ctx.rate) : null;
  const kmRemaining = dueKm !== null && ctx.odometerKm !== null ? dueKm - ctx.odometerKm : null;
  const daysRemaining = dueDayByTime ? diffDays(ctx.today, dueDayByTime) : null;

  let nextDay: DayKey | null = dueDayByTime;
  let estimated = false;
  if (estimatedDayByKm && (!nextDay || estimatedDayByKm < nextDay)) {
    nextDay = estimatedDayByKm;
    estimated = true;
  }

  let status: DueStatus = 'unknown';
  if (dueDayByTime !== null || kmRemaining !== null) {
    const overdue = (daysRemaining !== null && daysRemaining < 0) || (kmRemaining !== null && kmRemaining <= 0);
    const soon =
      (daysRemaining !== null && daysRemaining <= schedule.remindDaysBefore) ||
      (kmRemaining !== null && kmRemaining <= schedule.remindKmBefore) ||
      (estimated && nextDay !== null && diffDays(ctx.today, nextDay) <= schedule.remindDaysBefore);
    status = overdue ? 'overdue' : soon ? 'due_soon' : 'ok';
  }

  return { scheduleId: schedule.id, status, dueDayByTime, dueKm, estimatedDayByKm, nextDay, estimated, kmRemaining, daysRemaining, neverDone };
}

const STATUS_ORDER: Record<DueStatus, number> = { overdue: 0, due_soon: 1, ok: 2, unknown: 3 };

export function sortByUrgency<T extends { due: DueInfo }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const s = STATUS_ORDER[a.due.status] - STATUS_ORDER[b.due.status];
    if (s !== 0) return s;
    if (a.due.nextDay && b.due.nextDay) return a.due.nextDay < b.due.nextDay ? -1 : a.due.nextDay > b.due.nextDay ? 1 : 0;
    return a.due.nextDay ? -1 : b.due.nextDay ? 1 : 0;
  });
}

/**
 * After a record is saved, the matching schedule's reference point moves forward —
 * but only if the record is newer than what the schedule already knows
 * (so backfilling an old invoice never resets a schedule).
 */
export function advanceSchedule(schedule: MaintenanceSchedule, record: Pick<MaintenanceRecord, 'day' | 'odometerKm'>): Pick<MaintenanceSchedule, 'lastDay' | 'lastOdometerKm'> | null {
  const newerDay = !schedule.lastDay || record.day >= schedule.lastDay;
  const newerKm = record.odometerKm !== null && (schedule.lastOdometerKm === null || record.odometerKm >= schedule.lastOdometerKm);
  if (!newerDay && !newerKm) return null;
  return {
    lastDay: newerDay ? record.day : schedule.lastDay,
    lastOdometerKm: newerKm ? record.odometerKm : schedule.lastOdometerKm,
  };
}

/** Validation of a schedule input: at least one interval is required, both positive. */
export function scheduleErrors(input: Pick<MaintenanceSchedule, 'intervalKm' | 'intervalMonths'>): ('interval_required' | 'interval_km_invalid' | 'interval_months_invalid')[] {
  const errors: ('interval_required' | 'interval_km_invalid' | 'interval_months_invalid')[] = [];
  if (input.intervalKm === null && input.intervalMonths === null) errors.push('interval_required');
  if (input.intervalKm !== null && !(input.intervalKm > 0)) errors.push('interval_km_invalid');
  if (input.intervalMonths !== null && !(Number.isInteger(input.intervalMonths) && input.intervalMonths > 0)) errors.push('interval_months_invalid');
  return errors;
}

/** Searches records by free text (title, description, provider, parts, notes) and filters. */
export function filterRecords(
  records: readonly MaintenanceRecord[],
  opts: { query?: string; types?: readonly string[]; fromDay?: DayKey | null; toDay?: DayKey | null; typeLabel?: (type: string) => string },
): MaintenanceRecord[] {
  const q = opts.query?.trim().toLowerCase() ?? '';
  return records.filter((r) => {
    if (opts.types?.length && !opts.types.includes(r.type)) return false;
    if (opts.fromDay && r.day < opts.fromDay) return false;
    if (opts.toDay && r.day > opts.toDay) return false;
    if (!q) return true;
    const hay = [r.title, r.description, r.provider, r.parts, r.notes, opts.typeLabel?.(r.type)].filter(Boolean).join(' ').toLowerCase();
    return hay.includes(q);
  });
}
