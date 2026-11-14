import { repos } from '@/database';
import type { TripInput } from '@/database/repositories/trips';
import { track } from '@/services/analytics';
import { deleteLocalFiles } from '@/services/files';
import { cancelReminders } from '@/services/reminders';
import { notifyDataChanged } from '@/store/session';
import type { Id } from '@/types/models';

/**
 * UI-facing trip operations: persist, refresh screens, emit anonymous events and
 * clean up files. Screens call these instead of repositories directly.
 */
export async function createTrip(input: TripInput, from: 'onboarding' | 'app' = 'app') {
  const trip = await repos().trips.create(input);
  notifyDataChanged();
  track('trip_created', { trip_type: trip.tripType, destinations: trip.destinations.length, from });
  return trip;
}

export async function updateTrip(id: Id, input: TripInput) {
  const trip = await repos().trips.update(id, input);
  notifyDataChanged();
  return trip;
}

export async function duplicateTrip(id: Id, name: string) {
  const trip = await repos().trips.duplicate(id, { name });
  notifyDataChanged();
  track('trip_created', { trip_type: trip.tripType, destinations: trip.destinations.length, from: 'duplicate' });
  return trip;
}

export async function archiveTrip(id: Id) {
  await repos().trips.archive(id);
  notifyDataChanged();
}

export async function unarchiveTrip(id: Id) {
  await repos().trips.unarchive(id);
  notifyDataChanged();
}

/** Permanently deletes a trip, its linked rows (cascade) and its local files. */
export async function deleteTrip(id: Id) {
  const notificationIds = await repos().checklists.notificationIds(id);
  const { deleted, fileUris } = await repos().trips.remove(id);
  if (deleted) await cancelReminders(notificationIds);
  const { failed } = deleteLocalFiles(fileUris);
  notifyDataChanged();
  return { deleted, filesFailed: failed };
}
