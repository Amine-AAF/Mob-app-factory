import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

import { newId } from '@/domain/ids';

import { recordError } from './analytics';

/**
 * Private, on-device photo storage.
 * - Picked/captured photos are COPIED into `<documents>/plantcare/photos`, private to the app
 *   and excluded from Android auto-backup (allowBackup=false). SQLite stores only the
 *   relative path "photos/<id>.jpg", never an absolute URI.
 * - The photo picker uses the Android system Photo Picker: no storage permission needed.
 * - The camera permission is requested only when the user taps "Take photo"; refusal is
 *   handled by returning { status: 'denied' } so the UI can explain and offer the gallery.
 * - Nothing here uploads or analyses a photo.
 */
const ROOT = 'plantcare';
const SAFE = /^photos\/[A-Za-z0-9_-]+\.(jpg|jpeg|png|webp|heic)$/;

export type PickResult = { status: 'ok'; path: string } | { status: 'cancelled' } | { status: 'denied' } | { status: 'error' };

function photosDir(): Directory {
  const root = new Directory(Paths.document, ROOT);
  if (!root.exists) root.create({ intermediates: true, idempotent: true });
  const dir = new Directory(root, 'photos');
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return dir;
}

export function isSafePhotoPath(path: string | null | undefined): path is string {
  return typeof path === 'string' && SAFE.test(path);
}

/** file:// URI for <Image>, or null for unknown/unsafe paths. */
export function photoUri(path: string | null | undefined): string | null {
  if (!isSafePhotoPath(path)) return null;
  try {
    return new File(photosDir(), path.slice('photos/'.length)).uri;
  } catch {
    return null;
  }
}

function extension(uri: string, mime?: string | null): string {
  const m = uri.match(/\.(jpg|jpeg|png|webp|heic)(\?|$)/i)?.[1]?.toLowerCase();
  if (m) return m === 'jpeg' ? 'jpg' : m;
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  return 'jpg';
}

async function store(asset: ImagePicker.ImagePickerAsset): Promise<PickResult> {
  try {
    const name = `${newId('ph')}.${extension(asset.uri, asset.mimeType)}`;
    const source = new File(asset.uri);
    const target = new File(photosDir(), name);
    source.copy(target);
    // Remove the picker's cache copy so no stray photo is left behind.
    try {
      if (asset.uri.includes('/cache/')) source.delete();
    } catch {
      /* not ours to delete */
    }
    return { status: 'ok', path: `photos/${name}` };
  } catch (e) {
    recordError(e, 'photo_store');
    return { status: 'error' };
  }
}

const OPTIONS: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.7, allowsEditing: true, aspect: [4, 3], exif: false };

export async function pickFromLibrary(): Promise<PickResult> {
  try {
    const r = await ImagePicker.launchImageLibraryAsync(OPTIONS);
    if (r.canceled || !r.assets?.[0]) return { status: 'cancelled' };
    return store(r.assets[0]);
  } catch (e) {
    recordError(e, 'photo_pick');
    return { status: 'error' };
  }
}

export async function takePhoto(): Promise<PickResult> {
  try {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (perm.status !== 'granted') return { status: 'denied' };
    const r = await ImagePicker.launchCameraAsync(OPTIONS);
    if (r.canceled || !r.assets?.[0]) return { status: 'cancelled' };
    return store(r.assets[0]);
  } catch (e) {
    recordError(e, 'photo_camera');
    return { status: 'error' };
  }
}

export function deletePhotos(paths: (string | null | undefined)[]): void {
  for (const p of paths) {
    if (!isSafePhotoPath(p)) continue;
    try {
      const f = new File(photosDir(), p.slice('photos/'.length));
      if (f.exists) f.delete();
    } catch (e) {
      recordError(e, 'photo_delete');
    }
  }
}

/** Removes every stored photo (used by "Delete all my data"). */
export function deleteAllPhotos(): void {
  try {
    const dir = photosDir();
    dir.delete();
  } catch (e) {
    recordError(e, 'photo_delete_all');
  }
}
