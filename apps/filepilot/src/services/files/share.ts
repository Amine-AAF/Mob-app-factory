import { Directory, File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

/**
 * Sharing and exporting results.
 * - Share: Android share sheet via expo-sharing, which exposes the file through its
 *   FileProvider as a content:// URI with a temporary read-only grant. Internal paths
 *   are never handed to other apps.
 * - Save to device: the user picks a folder (Storage Access Framework); FilePilot writes
 *   copies there. The private copy stays in FilePilot until the user deletes it.
 */
export async function shareFile(uri: string, mimeType: string, dialogTitle: string): Promise<'shared' | 'unavailable'> {
  if (!(await Sharing.isAvailableAsync())) return 'unavailable';
  await Sharing.shareAsync(uri, { mimeType, dialogTitle });
  return 'shared';
}

export interface SaveResult {
  saved: number;
  failed: number;
}

export async function saveToDevice(files: { uri: string; fileName: string; mimeType: string }[]): Promise<SaveResult | null> {
  let target: Directory;
  try {
    target = await Directory.pickDirectoryAsync();
  } catch {
    return null; // the user closed the folder picker
  }
  let saved = 0;
  let failed = 0;
  for (const f of files) {
    try {
      const source = new File(f.uri);
      // The provider picks a non-conflicting name ("name (1).jpg") if one already exists.
      const dest = target.createFile(f.fileName, f.mimeType);
      dest.write(await source.bytes());
      saved++;
    } catch {
      failed++;
    }
  }
  return { saved, failed };
}

export function outputExists(uri: string): boolean {
  try {
    return new File(uri).exists;
  } catch {
    return false;
  }
}
