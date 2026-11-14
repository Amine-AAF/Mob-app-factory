import * as DocumentPicker from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import type { Repositories } from '@/database';

import { recordError } from './analytics';
import { buildBackup, restoreFromText, type PhotoIO, type RestoreResult } from './backupCore';
import { clock } from './clock';
import { cleanupOrphanPhotos, readAllPhotos, writePhotos } from './photos';

export const photoIO: PhotoIO = {
  read: (paths) => readAllPhotos(paths),
  write: (photos) => writePhotos(photos),
  cleanup: (referenced) => cleanupOrphanPhotos(referenced),
};

function exportsDir(): Directory {
  const dir = new Directory(Paths.cache, 'exports');
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return dir;
}

export type ShareResult = 'shared' | 'unavailable' | 'error';

/** Writes a text export to the purged cache folder and opens the Android share sheet. */
export async function shareText(fileName: string, content: string, mimeType: string, dialogTitle: string): Promise<ShareResult> {
  try {
    if (!(await Sharing.isAvailableAsync())) return 'unavailable';
    const file = new File(exportsDir(), fileName.replace(/[^A-Za-z0-9._-]/g, '_'));
    if (file.exists) file.delete();
    file.create();
    await file.write(content);
    await Sharing.shareAsync(file.uri, { mimeType, dialogTitle });
    return 'shared';
  } catch (e) {
    recordError(e, 'export_share');
    return 'error';
  }
}

export async function exportBackup(r: Repositories, includePhotos: boolean, dialogTitle: string): Promise<ShareResult> {
  try {
    const backup = await buildBackup(r, { includePhotos, photos: photoIO });
    const name = `closetwise-backup-${clock.today()}${includePhotos ? '-photos' : ''}.json`;
    return shareText(name, JSON.stringify(backup), 'application/json', dialogTitle);
  } catch (e) {
    recordError(e, 'backup_export');
    return 'error';
  }
}

export async function pickAndRestore(r: Repositories): Promise<RestoreResult | { ok: false; error: 'cancelled' | 'read_failed' }> {
  try {
    const res = await DocumentPicker.getDocumentAsync({ type: ['application/json', 'text/plain', '*/*'], copyToCacheDirectory: true, multiple: false });
    if (res.canceled || !res.assets?.[0]) return { ok: false, error: 'cancelled' };
    const file = new File(res.assets[0].uri);
    const text = await file.text();
    try {
      file.delete();
    } catch {
      // purged at start-up anyway
    }
    return restoreFromText(r, text, photoIO);
  } catch (e) {
    recordError(e, 'backup_restore');
    return { ok: false, error: 'read_failed' };
  }
}
