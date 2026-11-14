import * as DocumentPicker from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { recordError } from './analytics';

/** Exports are written to the cache (purged by Android) and handed to the share sheet. */
function exportsDir(): Directory {
  const dir = new Directory(Paths.cache, 'exports');
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return dir;
}

export type ShareResult = 'shared' | 'unavailable' | 'error';

export async function shareText(fileName: string, content: string, mimeType: string, dialogTitle: string): Promise<ShareResult> {
  try {
    if (!(await Sharing.isAvailableAsync())) return 'unavailable';
    const file = new File(exportsDir(), fileName.replace(/[^A-Za-z0-9._-]/g, '_'));
    if (file.exists) file.delete();
    file.create();
    file.write(content);
    await Sharing.shareAsync(file.uri, { mimeType, dialogTitle });
    return 'shared';
  } catch (e) {
    recordError(e, 'export_share');
    return 'error';
  }
}

/** Lets the user pick a backup file (system picker: no storage permission). */
export async function pickTextFile(): Promise<{ status: 'ok'; text: string } | { status: 'cancelled' } | { status: 'error' }> {
  try {
    const res = await DocumentPicker.getDocumentAsync({ type: ['application/json', 'text/plain', '*/*'], copyToCacheDirectory: true, multiple: false });
    if (res.canceled || !res.assets?.[0]) return { status: 'cancelled' };
    const file = new File(res.assets[0].uri);
    const text = await file.text();
    try {
      file.delete();
    } catch {
      // cache, purged anyway
    }
    return { status: 'ok', text };
  } catch (e) {
    recordError(e, 'file_pick');
    return { status: 'error' };
  }
}
