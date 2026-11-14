import { Directory, File, Paths } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

import { newId } from '@/domain/ids';
import { recordError } from '@/services/analytics';

import { displayPath, isSafeRelativePath, PhotoError, processAndStore, removeOrphans, type ImageProcessor, type PhotoArea, type PhotoStore, type StoredPhoto } from './pipeline';

export * from './pipeline';

/** Private, app-only directory (not readable by other apps, excluded from Android auto-backup). */
const ROOT = 'closetwise';

function areaDir(area: PhotoArea): Directory {
  const root = new Directory(Paths.document, ROOT);
  if (!root.exists) root.create({ intermediates: true, idempotent: true });
  const dir = new Directory(root, area);
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return dir;
}

function fileFor(relativePath: string): File | null {
  if (!isSafeRelativePath(relativePath)) return null;
  const [area, name] = relativePath.split('/') as [PhotoArea, string];
  return new File(areaDir(area), name);
}

export const expoPhotoStore: PhotoStore = {
  async put(tempUri, relativePath) {
    const target = fileFor(relativePath);
    if (!target) throw new PhotoError('storage_failed');
    if (target.exists) target.delete();
    await new File(tempUri).copy(target);
  },
  exists(relativePath) {
    try {
      return fileFor(relativePath)?.exists ?? false;
    } catch {
      return false;
    }
  },
  remove(relativePath) {
    try {
      const f = fileFor(relativePath);
      if (f?.exists) f.delete();
    } catch (e) {
      recordError(e, 'photo_delete');
    }
  },
  list(area) {
    try {
      return areaDir(area)
        .list()
        .filter((e): e is File => e instanceof File)
        .map((f) => `${area}/${f.name}`);
    } catch {
      return [];
    }
  },
  discard(uri) {
    try {
      const f = new File(uri);
      if (f.exists) f.delete();
    } catch {
      // Temporary files are also purged at start-up.
    }
  },
};

export const expoImageProcessor: ImageProcessor = {
  async toJpeg(uri, size, quality) {
    const ctx = ImageManipulator.manipulate(uri);
    if (size) ctx.resize(size);
    const ref = await ctx.renderAsync();
    const out = await ref.saveAsync({ compress: quality, format: SaveFormat.JPEG });
    return { uri: out.uri, width: out.width, height: out.height };
  },
};

export function photoUri(relativePath: string | null | undefined): string | null {
  if (!relativePath) return null;
  try {
    return fileFor(relativePath)?.uri ?? null;
  } catch {
    return null;
  }
}

/** URI to display, falling back between thumbnail and full photo; null when files were deleted. */
export function displayUri(paths: { photoPath: string | null; thumbPath: string | null }, size: 'thumb' | 'full'): string | null {
  const p = displayPath(paths, size, (rel) => expoPhotoStore.exists(rel));
  return p ? photoUri(p) : null;
}

export type PickResult = { status: 'ok'; photo: StoredPhoto } | { status: 'cancelled' } | { status: 'denied' } | { status: 'error' };

/**
 * Takes or picks a photo. The library uses the Android Photo Picker (no storage permission);
 * the camera asks for the CAMERA permission only at that moment.
 */
export async function pickPhoto(source: 'camera' | 'library', idPrefix = 'ph'): Promise<PickResult> {
  try {
    if (source === 'camera') {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) return { status: 'denied' };
    }
    const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 1, allowsEditing: false, exif: false };
    const res = source === 'camera' ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
    if (res.canceled || !res.assets?.[0]) return { status: 'cancelled' };
    const asset = res.assets[0];
    const photo = await processAndStore({ uri: asset.uri, width: asset.width, height: asset.height }, newId(idPrefix), { processor: expoImageProcessor, store: expoPhotoStore });
    expoPhotoStore.discard(asset.uri);
    return { status: 'ok', photo };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    if (/permission/i.test(message)) return { status: 'denied' };
    recordError(e, 'photo_pick');
    return { status: 'error' };
  }
}

export function deletePhotoFiles(...paths: (string | null | undefined)[]): void {
  for (const p of paths) if (p) expoPhotoStore.remove(p);
}

export function cleanupOrphanPhotos(referenced: Iterable<string | null | undefined>): number {
  return removeOrphans(expoPhotoStore, referenced);
}

/** Start-up hygiene: remove picker/manipulator copies left in the cache by a previous session. */
export function purgeTemporaryFiles(): void {
  for (const name of ['ImagePicker', 'ImageManipulator', 'DocumentPicker', 'exports']) {
    try {
      const dir = new Directory(Paths.cache, name);
      if (dir.exists) dir.delete();
    } catch {
      // ignore
    }
  }
}

/** Base64 snapshot of every stored photo for a full backup. */
export async function readAllPhotos(referenced: Iterable<string | null | undefined>): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  for (const p of new Set(referenced)) {
    if (!p || !isSafeRelativePath(p)) continue;
    const f = fileFor(p);
    if (f?.exists) out[p] = await f.base64();
  }
  return out;
}

/** Writes photos from a backup. Unsafe paths are ignored. Returns the number written. */
export async function writePhotos(photos: Record<string, unknown>): Promise<number> {
  let written = 0;
  for (const [p, data] of Object.entries(photos)) {
    if (!isSafeRelativePath(p) || typeof data !== 'string') continue;
    const f = fileFor(p);
    if (!f) continue;
    if (f.exists) f.delete();
    f.create();
    await f.write(data, { encoding: 'base64' });
    written++;
  }
  return written;
}

export function deleteAllPhotos(): void {
  try {
    const dir = new Directory(Paths.document, ROOT);
    if (dir.exists) dir.delete();
  } catch (e) {
    recordError(e, 'photo_wipe');
  }
  purgeTemporaryFiles();
}

