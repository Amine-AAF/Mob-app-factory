import type { ActivityStatus } from '@/constants/domain';
import type { ItineraryTemplateKey } from '@/content/itineraryTemplates';
import { repos } from '@/database';
import type { ActivityInput, DayInput } from '@/database/repositories/itinerary';
import { track } from '@/services/analytics';
import { notifyDataChanged } from '@/store/session';
import type { Id, LocalDate } from '@/types/models';

/** UI-facing itinerary operations: persist, refresh, anonymous events (category/count only). */
async function withRefresh<T>(fn: () => Promise<T>): Promise<T> {
  const result = await fn();
  notifyDataChanged();
  return result;
}

export async function createDaysFromTripDates(tripId: Id) {
  const before = (await repos().itinerary.counts(tripId)).days;
  const created = await withRefresh(() => repos().itinerary.syncDaysWithTrip(tripId));
  if (before === 0 && created > 0) track('itinerary_created', { days: created });
  return created;
}

export async function applyItineraryTemplate(tripId: Id, key: ItineraryTemplateKey, lang: string) {
  const before = (await repos().itinerary.counts(tripId)).days;
  const added = await withRefresh(() => repos().itinerary.applyTemplate(tripId, key, lang));
  const after = (await repos().itinerary.counts(tripId)).days;
  if (before === 0 && after > 0) track('itinerary_created', { days: after });
  return added;
}

export const addDay = (tripId: Id, date: LocalDate, input?: DayInput) => withRefresh(() => repos().itinerary.addDay(tripId, date, input));
export const updateDay = (dayId: Id, input: DayInput) => withRefresh(() => repos().itinerary.updateDay(dayId, input));
export const deleteDay = (dayId: Id) => withRefresh(() => repos().itinerary.deleteDay(dayId));

export async function addActivity(dayId: Id, input: ActivityInput) {
  const activity = await withRefresh(() => repos().itinerary.addActivity(dayId, input));
  track('activity_added', { category: activity.category });
  return activity;
}

export const updateActivity = (id: Id, input: ActivityInput) => withRefresh(() => repos().itinerary.updateActivity(id, input));
export const setActivityStatus = (id: Id, status: ActivityStatus) => withRefresh(() => repos().itinerary.setActivityStatus(id, status));
export const deleteActivity = (id: Id) => withRefresh(() => repos().itinerary.deleteActivity(id));
export const duplicateActivity = (id: Id) => withRefresh(() => repos().itinerary.duplicateActivity(id));
export const shiftActivity = (id: Id, direction: -1 | 1) => withRefresh(() => repos().itinerary.shiftActivity(id, direction));
export const moveActivity = (id: Id, toDayId: Id) => withRefresh(() => repos().itinerary.moveActivity(id, toDayId));
