import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { newId } from '@/utils';

import { recordError } from './analytics';

/**
 * Private file storage for documents and vehicle photos.
 *
 * - Files are COPIED into the app's private documents directory (not readable by
 *   other apps, excluded from Android auto-backup by allowBackup=false). SQLite
 *   only keeps the file name; nothing is ever uploaded.
 * - Picking goes through the system picker (Storage Access Framework), so the app
 *   needs no storage or camera permission.
 * - Temporary export files live in the cache "exports" folder and are deleted
 *   after sharing and again at each start-up.
 */
export const MAX_FILE_BYTES = 25 * 1024 * 1024;
export const DOCUMENT_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic'];

const root = () => new Directory(Paths.document, 'autocare-files');
const exportsDir = () => new Directory(Paths.cache, 'exports');

function ensure(dir: Directory): Directory {
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return dir;
}

export function fileUri(fileName: string): string {
  return new File(root(), fileName).uri;
}

export function fileExists(fileName: string): boolean {
  try {
    return new File(root(), fileName).exists;
  } catch {
    return false;
  }
}

export type PickedFile = { fileName: string; mimeType: string; sizeBytes: number; originalName: string };
export class FileTooLargeError extends Error {
  constructor() {
    super('file_too_large');
  }
}

function extensionFor(mime: string, original: string): string {
  const fromName = original.includes('.') ? original.split('.').pop()!.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
  if (fromName && fromName.length <= 5) return fromName;
  return { 'application/pdf': 'pdf', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/heic': 'heic' }[mime] ?? 'bin';
}

/** Opens the system picker and copies the chosen file into private storage. */
export async function pickAndStore(kind: 'document' | 'photo'): Promise<PickedFile | null> {
  const picked = await File.pickFileAsync({ mimeTypes: kind === 'photo' ? ['image/*'] : DOCUMENT_MIME_TYPES });
  if (picked.canceled || !picked.result) return null;
  const source = picked.result;
  if (source.size > MAX_FILE_BYTES) throw new FileTooLargeError();
  const mimeType = source.type || (kind === 'photo' ? 'image/jpeg' : 'application/octet-stream');
  const fileName = `${kind === 'photo' ? 'photo' : 'doc'}_${newId()}.${extensionFor(mimeType, source.name)}`;
  const target = new File(ensure(root()), fileName);
  await source.copy(target);
  return { fileName, mimeType, sizeBytes: source.size, originalName: source.name };
}

export function deleteStoredFile(fileName: string | null | undefined): void {
  if (!fileName) return;
  try {
    const f = new File(root(), fileName);
    if (f.exists) f.delete();
  } catch (e) {
    recordError(e, 'file_delete');
  }
}

/** Deletes every stored file (used by "Delete all my data"). */
export function deleteAllStoredFiles(): void {
  try {
    const dir = root();
    if (dir.exists) dir.delete();
  } catch (e) {
    recordError(e, 'files_delete_all');
  }
}

/** Opens the system viewer (PDF, image) when possible, else the share sheet. */
export async function openStoredFile(fileName: string, mimeType: string, title: string): Promise<void> {
  const file = new File(root(), fileName);
  try {
    if (await File.canPreview(file)) {
      await File.preview(file);
      return;
    }
  } catch {
    // fall back to sharing
  }
  if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(file.uri, { mimeType, dialogTitle: title });
}

export async function shareStoredFile(fileName: string, mimeType: string, title: string): Promise<void> {
  const file = new File(root(), fileName);
  if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(file.uri, { mimeType, dialogTitle: title });
}

/** Writes a temporary export file, opens the share sheet, then removes the file. */
export async function shareTemporary(name: string, content: string, mimeType: string, title: string): Promise<void> {
  const safe = name.replace(/[^A-Za-z0-9._-]/g, '_');
  const file = new File(ensure(exportsDir()), safe);
  if (file.exists) file.delete();
  file.create();
  await file.write(content);
  try {
    if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(file.uri, { mimeType, dialogTitle: title });
  } finally {
    try {
      if (file.exists) file.delete();
    } catch {
      // cleaned at next start-up
    }
  }
}

/** Removes leftover temporary exports (e.g. if the app was killed while sharing). */
export function cleanTemporaryFiles(): void {
  try {
    const dir = exportsDir();
    if (dir.exists) dir.delete();
  } catch (e) {
    recordError(e, 'tmp_cleanup');
  }
}

/** Reads a user-picked backup file (JSON) without keeping a copy. */
export async function pickTextFile(): Promise<string | null> {
  const picked = await File.pickFileAsync({ mimeTypes: ['application/json', 'text/plain', '*/*'] });
  if (picked.canceled || !picked.result) return null;
  if (picked.result.size > MAX_FILE_BYTES) throw new FileTooLargeError();
  return picked.result.text();
}
