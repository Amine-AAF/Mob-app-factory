import { Directory, File, Paths } from 'expo-file-system';

import { newId } from '@/utils';

import { recordError } from './analytics';

/**
 * Cover images are files in <documents>/covers (never blobs in SQLite):
 * - `<id>.jpg`   ~800 px wide, shown on the book page;
 * - `<id>_t.jpg` ~240 px wide thumbnail, used by grids and lists (fast for thousands of books).
 * Picking uses the Android photo picker, which needs no storage permission.
 */
export const COVER_DIR = 'covers';
const COVER_WIDTH = 800;
const THUMB_WIDTH = 240;

export interface SavedCover {
  coverUri: string;
  thumbUri: string;
}

function coverDir(): Directory {
  const dir = new Directory(Paths.document, COVER_DIR);
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return dir;
}

/** Opens the system photo picker; returns null if the user cancels. */
export async function pickCoverImage(): Promise<string | null> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ImagePicker = require('expo-image-picker') as typeof import('expo-image-picker');
  const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [2, 3], quality: 1, exif: false });
  if (res.canceled || !res.assets?.[0]) return null;
  return res.assets[0].uri;
}

/** Resizes + compresses the picked image into a cover and a thumbnail stored by the app. */
export async function saveCover(sourceUri: string): Promise<SavedCover> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ImageManipulator, SaveFormat } = require('expo-image-manipulator') as typeof import('expo-image-manipulator');
  const dir = coverDir();
  const id = newId();
  const render = async (width: number, compress: number) => {
    const ctx = ImageManipulator.manipulate(sourceUri);
    ctx.resize({ width });
    const image = await ctx.renderAsync();
    return image.saveAsync({ format: SaveFormat.JPEG, compress });
  };
  const [big, small] = await Promise.all([render(COVER_WIDTH, 0.8), render(THUMB_WIDTH, 0.7)]);
  const coverFile = new File(dir, `${id}.jpg`);
  const thumbFile = new File(dir, `${id}_t.jpg`);
  new File(big.uri).move(coverFile);
  new File(small.uri).move(thumbFile);
  return { coverUri: coverFile.uri, thumbUri: thumbFile.uri };
}

export function deleteCoverFiles(uris: string[]): void {
  for (const uri of uris) {
    try {
      const f = new File(uri);
      if (f.exists && f.uri.includes(`/${COVER_DIR}/`)) f.delete();
    } catch (e) {
      recordError(e, 'cover_delete');
    }
  }
}

/** Removes cover files no row references anymore (after deletes, restores or crashes mid-save). */
export function cleanOrphanCovers(referenced: string[]): number {
  try {
    const keep = new Set(referenced.map((u) => u.split('/').pop()));
    let removed = 0;
    for (const entry of coverDir().list()) {
      if (entry instanceof File && !keep.has(entry.name)) {
        entry.delete();
        removed++;
      }
    }
    return removed;
  } catch (e) {
    recordError(e, 'cover_cleanup');
    return 0;
  }
}

/** Base64 of the cover files, for the advanced (Premium) backup that includes covers. */
export async function readCoversBase64(uris: string[]): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  for (const uri of uris) {
    try {
      const f = new File(uri);
      if (f.exists) out[f.name] = await f.base64();
    } catch (e) {
      recordError(e, 'cover_backup');
    }
  }
  return out;
}

/** Writes covers from a backup; returns the map old file name → new local URI. */
export function writeCoversBase64(files: Record<string, string>): Map<string, string> {
  const dir = coverDir();
  const out = new Map<string, string>();
  for (const [name, data] of Object.entries(files)) {
    if (!/^[A-Za-z0-9_-]+\.jpg$/.test(name)) continue; // never trust paths from a file
    try {
      const f = new File(dir, name);
      if (!f.exists) f.create();
      f.write(data, { encoding: 'base64' });
      out.set(name, f.uri);
    } catch (e) {
      recordError(e, 'cover_restore');
    }
  }
  return out;
}

export function coverFileName(uri: string | null): string | null {
  return uri ? (uri.split('/').pop() ?? null) : null;
}
