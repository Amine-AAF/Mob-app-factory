/**
 * Photo pipeline, independent of Expo so it can be unit-tested.
 *
 * Strategy (see docs/ARCHITECTURE.md § Photos):
 * - The picker/camera result is a temporary copy. It is re-encoded as JPEG, downscaled to
 *   at most PHOTO_MAX px on its longest side (large camera photos are 12+ MP), and a small
 *   THUMB_MAX px thumbnail is generated for grids. Grids only ever load thumbnails, which
 *   keeps memory low with several hundred items.
 * - Both files go to the app's private directory: `photos/<id>.jpg` and `thumbs/<id>.jpg`.
 *   SQLite stores only these relative paths, never image bytes, and never absolute URIs
 *   (Android content:// URIs from the picker expire; app paths can move after a restore).
 * - EXIF (location, device) is not requested from the picker and is dropped by re-encoding.
 */
export const PHOTO_MAX = 1600;
export const THUMB_MAX = 360;
export const PHOTO_QUALITY = 0.8;
export const THUMB_QUALITY = 0.7;

export type PhotoArea = 'photos' | 'thumbs';
export const PHOTO_AREAS: readonly PhotoArea[] = ['photos', 'thumbs'];

const SAFE_RELATIVE = /^(photos|thumbs)\/[A-Za-z0-9_-]+\.(jpg|jpeg|png|webp)$/;

/** Rejects anything that is not one of our own generated relative paths (no "..", no URIs). */
export function isSafeRelativePath(path: string | null | undefined): path is string {
  return typeof path === 'string' && SAFE_RELATIVE.test(path);
}

/** Target size to fit within `max` px (longest side), or null when no resize is needed. */
export function fitWithin(width: number, height: number, max: number): { width: number; height: number } | null {
  if (!(width > 0) || !(height > 0)) return null;
  const longest = Math.max(width, height);
  if (longest <= max) return null;
  const scale = max / longest;
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

export interface ProcessedImage {
  uri: string;
  width: number;
  height: number;
}

export interface ImageProcessor {
  /** Re-encodes as JPEG, resizing to `size` when given. Returns a temporary file. */
  toJpeg(uri: string, size: { width: number; height: number } | null, quality: number): Promise<ProcessedImage>;
}

export interface PhotoStore {
  /** Moves/copies a temporary file into the private area under `relativePath`. */
  put(tempUri: string, relativePath: string): Promise<void>;
  exists(relativePath: string): boolean;
  remove(relativePath: string): void;
  list(area: PhotoArea): string[];
  /** Deletes a temporary file (best effort). */
  discard(uri: string): void;
}

export interface StoredPhoto {
  photoPath: string;
  thumbPath: string;
}

export class PhotoError extends Error {
  constructor(public readonly code: 'processing_failed' | 'storage_failed' | 'invalid_source') {
    super(`Photo error: ${code}`);
    this.name = 'PhotoError';
  }
}

export async function processAndStore(
  source: { uri: string; width?: number | null; height?: number | null },
  id: string,
  deps: { processor: ImageProcessor; store: PhotoStore },
): Promise<StoredPhoto> {
  if (!source.uri) throw new PhotoError('invalid_source');
  if (!/^[A-Za-z0-9_-]+$/.test(id)) throw new PhotoError('invalid_source');
  const photoPath = `photos/${id}.jpg`;
  const thumbPath = `thumbs/${id}.jpg`;
  const temps: string[] = [];

  let main: ProcessedImage;
  let thumb: ProcessedImage;
  try {
    main = await deps.processor.toJpeg(source.uri, fitWithin(source.width ?? 0, source.height ?? 0, PHOTO_MAX), PHOTO_QUALITY);
    temps.push(main.uri);
    // Some pickers don't report dimensions: resize again from the processed size if needed.
    const again = fitWithin(main.width, main.height, PHOTO_MAX);
    if (again) {
      main = await deps.processor.toJpeg(main.uri, again, PHOTO_QUALITY);
      temps.push(main.uri);
    }
    thumb = await deps.processor.toJpeg(main.uri, fitWithin(main.width, main.height, THUMB_MAX), THUMB_QUALITY);
    temps.push(thumb.uri);
  } catch {
    temps.forEach((u) => deps.store.discard(u));
    throw new PhotoError('processing_failed');
  }

  try {
    await deps.store.put(main.uri, photoPath);
    await deps.store.put(thumb.uri, thumbPath);
  } catch {
    deps.store.remove(photoPath);
    deps.store.remove(thumbPath);
    throw new PhotoError('storage_failed');
  } finally {
    temps.forEach((u) => deps.store.discard(u));
  }
  return { photoPath, thumbPath };
}

/** Stored files that no database row references anymore. */
export function findOrphans(store: PhotoStore, referenced: Iterable<string | null | undefined>): string[] {
  const keep = new Set<string>();
  for (const r of referenced) if (r) keep.add(r);
  return PHOTO_AREAS.flatMap((area) => store.list(area).filter((p) => !keep.has(p)));
}

export function removeOrphans(store: PhotoStore, referenced: Iterable<string | null | undefined>): number {
  const orphans = findOrphans(store, referenced);
  orphans.forEach((p) => store.remove(p));
  return orphans.length;
}

/** Display source: thumbnail for grids, full photo for detail screens; null if the file is gone. */
export function displayPath(paths: { photoPath: string | null; thumbPath: string | null }, size: 'thumb' | 'full', exists: (p: string) => boolean): string | null {
  const order = size === 'thumb' ? [paths.thumbPath, paths.photoPath] : [paths.photoPath, paths.thumbPath];
  for (const p of order) if (isSafeRelativePath(p) && exists(p)) return p;
  return null;
}
