import { repos } from '@/database';
import type { JournalInput } from '@/database/repositories/journal';
import type { WeatherInput } from '@/database/repositories/weather';
import { deleteLocalFiles } from '@/services/files';
import { notifyDataChanged } from '@/store/session';
import type { Id } from '@/types/models';

/** Journal memories stay on the device: photos are private copies, never uploaded. */
export async function createEntry(tripId: Id, input: JournalInput) {
  const e = await repos().journal.create(tripId, input);
  notifyDataChanged();
  return e;
}

export async function updateEntry(id: Id, input: JournalInput) {
  const { entry, removedPhotos } = await repos().journal.update(id, input);
  deleteLocalFiles(removedPhotos);
  notifyDataChanged();
  return entry;
}

export async function deleteEntry(id: Id) {
  deleteLocalFiles(await repos().journal.remove(id));
  notifyDataChanged();
}

/** Photos picked but not saved (entry cancelled) are deleted right away. */
export function discardPhotos(uris: string[]) {
  deleteLocalFiles(uris);
}

export async function saveWeather(tripId: Id, destinationId: Id | null, input: WeatherInput) {
  const n = await repos().weather.save(tripId, destinationId, input);
  notifyDataChanged();
  return n;
}
