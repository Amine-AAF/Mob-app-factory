import { Directory, File, Paths } from 'expo-file-system';

import { extensionFor, isManagedUri } from '@/utils/paths';

/**
 * Local file storage for documents and photos. Files are copied into the app's private
 * document directory (not accessible to other apps, excluded from Android cloud backup
 * by `allowBackup: false`). They are NOT encrypted at rest beyond Android's own
 * file-based encryption of the device — see docs/security.md.
 */
export const FILES_ROOT_NAME = 'travelwise';

export function filesRoot(): Directory {
  return new Directory(Paths.document, FILES_ROOT_NAME);
}

export type ImportFolder = 'documents' | 'photos';

export class FileImportError extends Error {
  constructor(public readonly code: 'insufficient_storage' | 'copy_failed' | 'source_missing') {
    super(`File import failed: ${code}`);
    this.name = 'FileImportError';
  }
}

/** Keep a safety margin so the phone is never filled up by an import. */
const STORAGE_MARGIN_BYTES = 50 * 1024 * 1024;

/**
 * Copies a picked file (usually a cache copy made by the picker) into the app's private
 * folder under a random name (the original file name is not kept: it can contain personal
 * data). The temporary source copy is deleted afterwards when it lives in the cache.
 */
export async function importIntoPrivateStorage(sourceUri: string, folder: ImportFolder, mimeType: string, sizeBytes: number, name: string, originalName?: string): Promise<{ uri: string; sizeBytes: number }> {
  const source = new File(sourceUri);
  if (!source.exists) throw new FileImportError('source_missing');
  if (Paths.availableDiskSpace - sizeBytes < STORAGE_MARGIN_BYTES) throw new FileImportError('insufficient_storage');
  const dir = new Directory(filesRoot(), folder);
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  const target = new File(dir, `${name}.${extensionFor(mimeType, originalName)}`);
  try {
    await source.copy(target);
  } catch {
    if (target.exists) target.delete();
    throw new FileImportError('copy_failed');
  } finally {
    // The picker's cache copy is no longer needed.
    if (sourceUri.startsWith(Paths.cache.uri)) {
      try {
        source.delete();
      } catch {
        // cleaned at next start-up
      }
    }
  }
  return { uri: target.uri, sizeBytes: target.size ?? sizeBytes };
}

/** Opens a stored file with the phone's viewer (Android ACTION_VIEW via a content URI). Works offline. */
export async function openWithSystemViewer(uri: string): Promise<boolean> {
  const file = new File(uri);
  if (!file.exists) return false;
  if (!(await file.canPreview())) return false;
  await file.preview();
  return true;
}

export function fileExists(uri: string): boolean {
  try {
    return new File(uri).exists;
  } catch {
    return false;
  }
}

/** Deletes files permanently. Never throws: returns how many could not be deleted. */
export function deleteLocalFiles(uris: string[]): { failed: number } {
  let failed = 0;
  const root = filesRoot().uri;
  for (const uri of uris) {
    // Only files under our private root may be deleted (defence against bad URIs).
    if (!isManagedUri(uri, root)) continue;
    try {
      const file = new File(uri);
      if (file.exists) file.delete();
    } catch {
      failed++;
    }
  }
  return { failed };
}

/** Removes every stored document/photo and the app's temporary files. */
export function wipeAllFiles(): void {
  try {
    const root = filesRoot();
    if (root.exists) root.delete();
  } catch {
    // ignore: nothing to delete or already gone
  }
  cleanTemporaryFiles();
}

/** Clears picker copies and export leftovers from the cache directory. */
export function cleanTemporaryFiles(): void {
  try {
    for (const entry of Paths.cache.list()) {
      // Picker copies live in cache sub-folders (DocumentPicker / ImagePicker / Print).
      if (/^(DocumentPicker|ImagePicker|ImageManipulator|Print|travelwise-tmp)/.test(entry.name)) entry.delete();
    }
  } catch {
    // Best effort only.
  }
}
