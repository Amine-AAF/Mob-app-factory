import { Directory, File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { ProcessingError, toErrorCode } from './files/errors';
import { processingEnv } from './env';

/**
 * Getting results out of ImageCraft — always explicit user actions, always copies:
 * - Share: Android share sheet (expo-sharing), which exposes the file through a FileProvider
 *   content:// URI with a temporary read-only grant. Internal paths are never handed out.
 * - Save to gallery: a copy in Pictures/ImageCraft through MediaStore (Android 10+, no permission).
 * - Export to folder: the user picks a folder (Storage Access Framework); a copy is written there.
 *   The provider picks a non-conflicting name, so nothing is ever overwritten.
 */
export async function shareImage(uri: string, mimeType: string, dialogTitle: string): Promise<'shared' | 'unavailable'> {
  if (!(await Sharing.isAvailableAsync())) return 'unavailable';
  await Sharing.shareAsync(uri, { mimeType, dialogTitle });
  return 'shared';
}

export async function saveToGallery(uri: string, displayName: string, mimeType: string): Promise<void> {
  const { renderer } = processingEnv();
  if (!renderer.capabilities.gallery) throw new ProcessingError('gallery_unsupported');
  try {
    await renderer.saveToGallery(uri, displayName, mimeType);
  } catch (e) {
    throw new ProcessingError(toErrorCode(e) === 'gallery_unsupported' ? 'gallery_unsupported' : 'gallery_failed');
  }
}

export interface FolderExportResult {
  saved: number;
  failed: number;
}

/** Returns null when the user closes the folder picker. */
export async function exportToFolder(files: { uri: string; fileName: string; mimeType: string }[]): Promise<FolderExportResult | null> {
  let target: Directory;
  try {
    target = await Directory.pickDirectoryAsync();
  } catch {
    return null;
  }
  let saved = 0;
  let failed = 0;
  for (const f of files) {
    try {
      const dest = target.createFile(f.fileName, f.mimeType);
      dest.write(await new File(f.uri).bytes());
      saved++;
    } catch {
      failed++;
    }
  }
  return { saved, failed };
}
