import { Linking } from 'react-native';

import { repos } from '@/database';
import { mapLinks, type PlaceInput } from '@/database/repositories/places';
import { deleteLocalFiles } from '@/services/files';
import { notifyDataChanged } from '@/store/session';
import type { Id, Place } from '@/types/models';

export async function createPlace(input: PlaceInput) {
  const p = await repos().places.create(input);
  notifyDataChanged();
  return p;
}

export async function updatePlace(id: Id, input: PlaceInput) {
  const { place, replacedPhoto } = await repos().places.update(id, input);
  if (replacedPhoto) deleteLocalFiles([replacedPhoto]);
  notifyDataChanged();
  return place;
}

export async function toggleFavorite(id: Id, favorite: boolean) {
  await repos().places.setFavorite(id, favorite);
  notifyDataChanged();
}

export async function deletePlace(id: Id) {
  const photo = await repos().places.remove(id);
  if (photo) deleteLocalFiles([photo]);
  notifyDataChanged();
}

/**
 * Hands the place to a map app installed on the phone (default app via `geo:`, then
 * Google Maps / the browser). Returns false when nothing can open it.
 */
export async function openInMaps(place: Place): Promise<boolean> {
  const links = mapLinks(place);
  if (!links) return false;
  try {
    if (await Linking.canOpenURL(links.geo)) {
      await Linking.openURL(links.geo);
      return true;
    }
  } catch {
    // fall through to the web link
  }
  try {
    await Linking.openURL(links.web);
    return true;
  } catch {
    return false;
  }
}
