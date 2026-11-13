import { deadlineStatus, documentExpiryStatus, policyStatus } from '@/features/deadlines/deadlines';
import { computeDue, type DueInfo } from '@/features/maintenance/schedule';
import { estimateDailyRate, estimateDayForOdometer, estimateOdometer, latestOdometer, type DailyRate, type Reading } from '@/features/odometer/mileage';
import type { AdminDeadline, DayKey, InsurancePolicy, MaintenanceSchedule, NotificationCategory, NotificationSetting, TireRecord, Vehicle, VehicleDocument } from '@/types';
import { addDays, diffDays } from '@/utils/dates';

/**
 * Pure planning of dashboard alerts and local notifications. The notification
 * service (services/reminders.ts) only turns this plan into expo-notifications
 * triggers, so everything that matters is unit-tested here.
 */
export interface VehicleContext {
  vehicle: Vehicle;
  readings: Reading[];
  schedules: MaintenanceSchedule[];
  deadlines: AdminDeadline[];
  policies: InsurancePolicy[];
  documents: VehicleDocument[];
  tires: TireRecord[];
}

export interface DerivedOdometer {
  latest: Reading | null;
  rate: DailyRate | null;
  /** Known (entered) odometer. */
  knownKm: number | null;
  /** Projection for today; equals knownKm without a usable rate. */
  estimatedKm: number | null;
}

export function deriveOdometer(ctx: Pick<VehicleContext, 'vehicle' | 'readings'>, today: DayKey): DerivedOdometer {
  const readings = ctx.readings.length ? ctx.readings : [{ day: ctx.vehicle.createdAt.slice(0, 10), odometerKm: ctx.vehicle.odometerKm }];
  const latest = latestOdometer(readings);
  const rate = estimateDailyRate(readings, today);
  return { latest, rate, knownKm: latest?.odometerKm ?? null, estimatedKm: estimateOdometer(latest, rate, today) };
}

export type AlertKind = 'maintenance' | 'deadline' | 'insurance' | 'document' | 'tire' | 'odometer';
export interface Alert {
  kind: AlertKind;
  vehicleId: string;
  refId: string;
  severity: 'overdue' | 'due_soon';
  day: DayKey | null;
  /** The day is a projection from mileage (never a certainty). */
  estimated: boolean;
  kmRemaining: number | null;
  /** Type key for the label (maintenance type, deadline type, document category…). */
  subtype: string;
  title: string | null;
}

/** Days without an odometer update after which the dashboard asks for one. */
export const ODOMETER_STALE_DAYS = 45;

export function scheduleDues(ctx: VehicleContext, today: DayKey, odo: DerivedOdometer = deriveOdometer(ctx, today)): { schedule: MaintenanceSchedule; due: DueInfo }[] {
  return ctx.schedules.filter((s) => s.enabled).map((schedule) => ({ schedule, due: computeDue(schedule, { today, odometerKm: odo.knownKm, latest: odo.latest, rate: odo.rate }) }));
}

export function alertsFor(ctx: VehicleContext, today: DayKey): Alert[] {
  const odo = deriveOdometer(ctx, today);
  const v = ctx.vehicle.id;
  const out: Alert[] = [];

  for (const { schedule, due } of scheduleDues(ctx, today, odo)) {
    if (due.status !== 'overdue' && due.status !== 'due_soon') continue;
    out.push({ kind: 'maintenance', vehicleId: v, refId: schedule.id, severity: due.status, day: due.nextDay, estimated: due.estimated, kmRemaining: due.kmRemaining, subtype: schedule.type, title: schedule.title });
  }
  for (const d of ctx.deadlines) {
    const s = deadlineStatus(d, today);
    if (s === 'overdue' || s === 'due_soon') out.push({ kind: 'deadline', vehicleId: v, refId: d.id, severity: s, day: d.dueDay, estimated: false, kmRemaining: null, subtype: d.type, title: d.title });
  }
  // Only the latest policy per vehicle can be "expiring" (older ones were renewed).
  const latestPolicy = [...ctx.policies].sort((a, b) => (a.endDay < b.endDay ? 1 : -1))[0];
  if (latestPolicy) {
    const s = policyStatus(latestPolicy, today);
    if (s === 'expiring' || s === 'expired')
      out.push({ kind: 'insurance', vehicleId: v, refId: latestPolicy.id, severity: s === 'expired' ? 'overdue' : 'due_soon', day: latestPolicy.endDay, estimated: false, kmRemaining: null, subtype: 'insurance', title: latestPolicy.insurer });
  }
  for (const doc of ctx.documents) {
    const s = documentExpiryStatus(doc, today);
    if (s === 'expired' || s === 'expiring') out.push({ kind: 'document', vehicleId: v, refId: doc.id, severity: s === 'expired' ? 'overdue' : 'due_soon', day: doc.expiryDay, estimated: false, kmRemaining: null, subtype: doc.category, title: doc.title });
  }
  for (const t of ctx.tires) {
    if (t.status !== 'mounted') continue;
    if (t.reminderDay) {
      const days = diffDays(today, t.reminderDay);
      if (days <= 14) out.push({ kind: 'tire', vehicleId: v, refId: t.id, severity: days < 0 ? 'overdue' : 'due_soon', day: t.reminderDay, estimated: false, kmRemaining: null, subtype: t.season, title: t.brand });
    }
    if (t.reminderKm && t.installedOdometerKm !== null && odo.knownKm !== null) {
      const remaining = t.installedOdometerKm + t.reminderKm - odo.knownKm;
      if (remaining <= 500)
        out.push({ kind: 'tire', vehicleId: v, refId: `${t.id}:km`, severity: remaining <= 0 ? 'overdue' : 'due_soon', day: estimateDayForOdometer(t.installedOdometerKm + t.reminderKm, odo.latest, odo.rate), estimated: true, kmRemaining: remaining, subtype: t.season, title: t.brand });
    }
  }
  if (odo.latest && diffDays(odo.latest.day, today) >= ODOMETER_STALE_DAYS) {
    out.push({ kind: 'odometer', vehicleId: v, refId: v, severity: 'due_soon', day: odo.latest.day, estimated: false, kmRemaining: null, subtype: 'odometer', title: null });
  }

  return out.sort((a, b) => (a.severity !== b.severity ? (a.severity === 'overdue' ? -1 : 1) : (a.day ?? '9999') < (b.day ?? '9999') ? -1 : 1));
}

/* ------------------------------------------------------------- notifications */

export const NOTIFICATION_PREFIX = 'autocare-';
/** Android keeps a limited number of alarms per app: schedule only the nearest ones. */
export const MAX_SCHEDULED = 60;

export interface PlannedNotification {
  identifier: string;
  category: NotificationCategory;
  vehicleId: string;
  day: DayKey;
  hour: number;
  minute: number;
  /** Which message to show. */
  message: 'maintenance_due' | 'maintenance_estimated' | 'deadline' | 'insurance' | 'document' | 'tire' | 'odometer';
  subtype: string;
  title: string | null;
  /** Days left on the notification day (0 = due that day). */
  daysLeft: number;
  estimated: boolean;
  url: string;
}

function settingFor(settings: readonly NotificationSetting[], category: NotificationCategory): NotificationSetting | null {
  const s = settings.find((x) => x.category === category);
  if (!s) return { category, enabled: true, hour: 9, minute: 0 };
  return s.enabled ? s : null;
}

/**
 * Builds the complete set of future notifications from the data. Notifications are
 * only planned for days strictly after `today` (or today if the hour hasn't passed is
 * not knowable here — the service drops anything in the past).
 */
export function planNotifications(contexts: readonly VehicleContext[], settings: readonly NotificationSetting[], today: DayKey, opts: { advanced: boolean }): PlannedNotification[] {
  const out: PlannedNotification[] = [];
  const push = (n: Omit<PlannedNotification, 'hour' | 'minute' | 'identifier'> & { key: string }) => {
    const s = settingFor(settings, n.category);
    if (!s || n.day < today) return;
    const { key, ...rest } = n;
    out.push({ ...rest, identifier: `${NOTIFICATION_PREFIX}${key}-${n.day}`, hour: s.hour, minute: s.minute });
  };

  for (const ctx of contexts) {
    if (ctx.vehicle.archived) continue;
    const vId = ctx.vehicle.id;
    const odo = deriveOdometer(ctx, today);

    for (const { schedule, due } of scheduleDues(ctx, today, odo)) {
      if (!due.nextDay) continue;
      const leads = opts.advanced ? [schedule.remindDaysBefore, 0] : [schedule.remindDaysBefore];
      for (const lead of new Set(leads)) {
        push({ key: `m-${schedule.id}-${lead}`, category: 'maintenance', vehicleId: vId, day: addDays(due.nextDay, -lead), message: due.estimated ? 'maintenance_estimated' : 'maintenance_due', subtype: schedule.type, title: schedule.title, daysLeft: lead, estimated: due.estimated, url: `/vehicle/${vId}/maintenance` });
      }
    }
    for (const d of ctx.deadlines) {
      if (d.completedAt) continue;
      const leads = opts.advanced ? d.remindDaysBefore : d.remindDaysBefore.slice(0, 1);
      for (const lead of leads) push({ key: `d-${d.id}-${lead}`, category: 'deadlines', vehicleId: vId, day: addDays(d.dueDay, -lead), message: 'deadline', subtype: d.type, title: d.title, daysLeft: lead, estimated: false, url: `/vehicle/${vId}/deadlines` });
    }
    const latestPolicy = [...ctx.policies].sort((a, b) => (a.endDay < b.endDay ? 1 : -1))[0];
    if (latestPolicy) {
      const leads = opts.advanced ? [latestPolicy.remindDaysBefore, 7, 1] : [latestPolicy.remindDaysBefore];
      for (const lead of new Set(leads)) push({ key: `i-${latestPolicy.id}-${lead}`, category: 'insurance', vehicleId: vId, day: addDays(latestPolicy.endDay, -lead), message: 'insurance', subtype: 'insurance', title: latestPolicy.insurer, daysLeft: lead, estimated: false, url: `/vehicle/${vId}/insurance` });
    }
    for (const doc of ctx.documents) {
      if (!doc.expiryDay) continue;
      push({ key: `doc-${doc.id}`, category: 'documents', vehicleId: vId, day: addDays(doc.expiryDay, -30), message: 'document', subtype: doc.category, title: doc.title, daysLeft: 30, estimated: false, url: `/vehicle/${vId}/documents` });
    }
    for (const t of ctx.tires) {
      if (t.status === 'retired') continue;
      if (t.reminderDay) push({ key: `t-${t.id}`, category: 'tires', vehicleId: vId, day: t.reminderDay, message: 'tire', subtype: t.season, title: t.brand, daysLeft: 0, estimated: false, url: `/vehicle/${vId}/tires` });
      if (t.status === 'mounted' && t.reminderKm && t.installedOdometerKm !== null) {
        const day = estimateDayForOdometer(t.installedOdometerKm + t.reminderKm, odo.latest, odo.rate);
        if (day) push({ key: `tk-${t.id}`, category: 'tires', vehicleId: vId, day, message: 'tire', subtype: t.season, title: t.brand, daysLeft: 0, estimated: true, url: `/vehicle/${vId}/tires` });
      }
    }
    // Monthly nudge to update the odometer, which keeps mileage-based estimates honest.
    if (odo.latest) {
      const day = addDays(odo.latest.day, 30) > today ? addDays(odo.latest.day, 30) : addDays(today, 1);
      push({ key: `o-${vId}`, category: 'odometer', vehicleId: vId, day, message: 'odometer', subtype: 'odometer', title: null, daysLeft: 0, estimated: false, url: `/odometer?vehicleId=${vId}` });
    }
  }

  // De-duplicate identifiers (same lead days) and keep the nearest ones.
  const unique = new Map(out.map((n) => [n.identifier, n]));
  return [...unique.values()].sort((a, b) => (a.day < b.day ? -1 : a.day > b.day ? 1 : 0)).slice(0, MAX_SCHEDULED);
}
