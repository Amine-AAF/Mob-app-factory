import { Directory, File, Paths } from 'expo-file-system';

import { isManagedUri } from '@/utils/paths';

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
