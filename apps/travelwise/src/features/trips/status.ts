import type { TripStatus } from '@/constants/domain';
import type { LocalDate, Trip } from '@/types/models';
import { daysUntil, isValidDate, tripDayCount, tripNights } from '@/utils/dates';

/**
 * Status shown in the UI. "archived" is always explicit. Otherwise dates win:
 * a trip whose dates contain today is ongoing, a trip that ended is completed.
 * Before departure the user's choice between "planning" and "upcoming" is kept;
 * a trip without dates keeps whatever status the user set.
 */
export function effectiveStatus(trip: Pick<Trip, 'status' | 'archivedAt' | 'startDate' | 'endDate'>, today: LocalDate): TripStatus {
  if (trip.archivedAt || trip.status === 'archived') return 'archived';
  const { startDate, endDate } = trip;
  if (isValidDate(endDate) && endDate < today) return 'completed';
  if (isValidDate(startDate) && startDate <= today && (!isValidDate(endDate) || endDate >= today)) return 'ongoing';
  // A future-dated trip cannot be ongoing/completed yet; without dates the user's choice is kept.
  if ((trip.status === 'completed' || trip.status === 'ongoing') && isValidDate(startDate)) return 'upcoming';
  return trip.status;
}

export interface TripBuckets<T> {
  ongoing: T[];
  upcoming: T[];
  completed: T[];
  archived: T[];
}

/** Groups trips for the dashboards: ongoing, then upcoming/planning (soonest first), then past (latest first). */
export function bucketTrips<T extends Pick<Trip, 'status' | 'archivedAt' | 'startDate' | 'endDate' | 'createdAt'>>(trips: T[], today: LocalDate): TripBuckets<T> {
  const out: TripBuckets<T> = { ongoing: [], upcoming: [], completed: [], archived: [] };
  for (const trip of trips) {
    const s = effectiveStatus(trip, today);
    if (s === 'ongoing') out.ongoing.push(trip);
    else if (s === 'completed') out.completed.push(trip);
    else if (s === 'archived') out.archived.push(trip);
    else out.upcoming.push(trip);
  }
  const startKey = (t: T) => t.startDate ?? '9999-12-31';
  out.upcoming.sort((a, b) => (startKey(a) === startKey(b) ? a.createdAt.localeCompare(b.createdAt) : startKey(a) < startKey(b) ? -1 : 1));
  out.ongoing.sort((a, b) => startKey(a).localeCompare(startKey(b)));
  out.completed.sort((a, b) => (b.endDate ?? '').localeCompare(a.endDate ?? ''));
  out.archived.sort((a, b) => (b.archivedAt ?? '').localeCompare(a.archivedAt ?? ''));
  return out;
}

/** Number of trips that count towards the free "active trips" limit (not completed, not archived). */
export function countActiveTrips(trips: Pick<Trip, 'status' | 'archivedAt' | 'startDate' | 'endDate' | 'isDemo'>[], today: LocalDate): number {
  return trips.filter((t) => !t.isDemo && ['planning', 'upcoming', 'ongoing'].includes(effectiveStatus(t, today))).length;
}

export interface TripTiming {
  days: number | null;
  nights: number | null;
  /** Days until departure (> 0), 0 on departure day, null once started or without dates. */
  daysToGo: number | null;
  /** 1-based current day while ongoing. */
  currentDay: number | null;
}

export function tripTiming(trip: Pick<Trip, 'startDate' | 'endDate'>, today: LocalDate): TripTiming {
  const until = daysUntil(today, trip.startDate);
  const days = tripDayCount(trip.startDate, trip.endDate);
  const started = until !== null && until < 0;
  const currentDay = started && days !== null && -until < days ? -until + 1 : until === 0 ? 1 : null;
  return { days, nights: tripNights(trip.startDate, trip.endDate), daysToGo: until !== null && until >= 0 ? until : null, currentDay };
}

/**
 * Preparation progress, from real data only: share of packed items and done tasks.
 * Returns null when there is nothing to measure (never a made-up percentage).
 */
export function preparationProgress(counts: { packed: number; packingTotal: number; tasksDone: number; tasksTotal: number }): number | null {
  const total = counts.packingTotal + counts.tasksTotal;
  if (total === 0) return null;
  return (counts.packed + counts.tasksDone) / total;
}
