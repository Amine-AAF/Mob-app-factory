import { Directory, File, Paths } from 'expo-file-system';

import { newId } from '@/domain/ids';

import { recordError } from './analytics';

/**
 * Local file storage for covers, invitation backgrounds, receipts and
 * contracts. Files are copied into the app's private document directory (not
 * shared storage, not backed up to the cloud: `allowBackup` is false); SQLite
 * only stores their `file://` URI.
 */
export type FileBucket = 'covers' | 'invitations' | 'receipts' | 'contracts' | 'exports';

const ALLOWED_EXT = /^(jpg|jpeg|png|webp|heic|pdf)$/i;

function bucket(name: FileBucket): Directory {
  const dir = new Directory(Paths.document, 'eventora', name);
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return dir;
}

export function extensionOf(uri: string, fallback = 'jpg'): string {
  const clean = uri.split('?')[0] ?? uri;
  const ext = clean.includes('.') ? (clean.split('.').pop() ?? '') : '';
  return ALLOWED_EXT.test(ext) ? ext.toLowerCase() : fallback;
}

/** Copies a picked file into the private bucket. Returns the new URI. */
export async function importFile(sourceUri: string, into: FileBucket, fallbackExt = 'jpg'): Promise<string> {
  const target = new File(bucket(into), `${newId()}.${extensionOf(sourceUri, fallbackExt)}`);
  await new File(sourceUri).copy(target);
  return target.uri;
}

/** Deletes a file we own (ignores URIs outside our directory). */
export function deleteOwnedFile(uri: string | null | undefined): void {
  if (!uri) return;
  try {
    const root = new Directory(Paths.document, 'eventora').uri;
    if (!uri.startsWith(root)) return;
    const f = new File(uri);
    if (f.exists) f.delete();
  } catch (e) {
    recordError(e, 'file_delete');
  }
}

/** Writes a text export into the cache directory (shared through the Android share sheet, then disposable). */
export function writeExport(fileName: string, contents: string): string {
  const safe = fileName.replace(/[^\w.-]+/g, '_').slice(0, 80);
  const dir = new Directory(Paths.cache, 'eventora-exports');
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  const f = new File(dir, safe);
  if (f.exists) f.delete();
  f.create();
  f.writeSync(contents);
  return f.uri;
}

export function readText(uri: string): Promise<string> {
  return new File(uri).text();
}

/** Data URI of an owned image (embedded in PDF exports). Null if unreadable. */
export async function imageDataUri(uri: string | null | undefined): Promise<string | null> {
  if (!uri) return null;
  try {
    const ext = extensionOf(uri);
    const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
    return `data:${mime};base64,${await new File(uri).base64()}`;
  } catch {
    return null;
  }
}

/** Removes every file the app stored (used by "Delete all my data"). */
export function wipeAllFiles(): void {
  try {
    const root = new Directory(Paths.document, 'eventora');
    if (root.exists) root.delete();
    const exp = new Directory(Paths.cache, 'eventora-exports');
    if (exp.exists) exp.delete();
  } catch (e) {
    recordError(e, 'files_wipe');
  }
}
