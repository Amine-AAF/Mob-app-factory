import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

import { newId } from '@/utils';

import { recordError } from './analytics';

/**
 * Progress photos are private files in the app's own document directory (not visible
 * to other apps, never uploaded, excluded from Android auto-backup by allowBackup=false).
 * SQLite stores only the relative file name. The library picker is the Android Photo
 * Picker (no storage permission); the camera permission is asked only when used.
 */
const ROOT = 'progress-photos';

function dir(): Directory {
  const d = new Directory(Paths.document, ROOT);
  if (!d.exists) d.create({ intermediates: true, idempotent: true });
  return d;
}

const SAFE = /^[A-Za-z0-9_-]+\.jpg$/;

export function photoUri(name: string): string | null {
  if (!SAFE.test(name)) return null;
  try {
    const f = new File(dir(), name);
    return f.exists ? f.uri : null;
  } catch {
    return null;
  }
}

export type PickResult = { status: 'ok'; name: string } | { status: 'cancelled' } | { status: 'denied' } | { status: 'error' };

export async function pickProgressPhoto(source: 'camera' | 'library'): Promise<PickResult> {
  try {
    if (source === 'camera') {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) return { status: 'denied' };
    }
    const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.8, allowsEditing: false, exif: false };
    const res = source === 'camera' ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
    if (res.canceled || !res.assets?.[0]) return { status: 'cancelled' };
    const name = `${newId('ph_')}.jpg`;
    const tmp = new File(res.assets[0].uri);
    tmp.copy(new File(dir(), name));
    if (source === 'camera') {
      try {
        tmp.delete();
      } catch {
        // temporary camera file
      }
    }
    return { status: 'ok', name };
  } catch (e) {
    if (/permission/i.test(e instanceof Error ? e.message : String(e))) return { status: 'denied' };
    recordError(e, 'photo_pick');
    return { status: 'error' };
  }
}

export function deletePhotoFile(name: string): void {
  if (!SAFE.test(name)) return;
  try {
    const f = new File(dir(), name);
    if (f.exists) f.delete();
  } catch (e) {
    recordError(e, 'photo_delete');
  }
}

export function deleteAllPhotoFiles(): void {
  try {
    const d = new Directory(Paths.document, ROOT);
    if (d.exists) d.delete();
  } catch (e) {
    recordError(e, 'photo_delete_all');
  }
}
