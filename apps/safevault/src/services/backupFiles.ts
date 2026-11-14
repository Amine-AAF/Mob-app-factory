import * as DocumentPicker from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { BACKUP_MIME, BackupError, MAX_BACKUP_BYTES } from '@/features/backup/format';

/**
 * File I/O for encrypted backups. The content handled here is ALWAYS the encrypted backup
 * text: plaintext never touches the filesystem.
 *  - Save: the user picks a folder (Storage Access Framework); no storage permission needed.
 *  - Share: Android share sheet (e.g. to a cloud drive the user chooses). Never automatic.
 *  - Temporary copies in the app cache are deleted right after use.
 */
export async function saveBackupToFolder(fileName: string, text: string): Promise<'saved' | 'cancelled'> {
  let dir: Directory;
  try {
    dir = await Directory.pickDirectoryAsync();
  } catch {
    return 'cancelled';
  }
  const file = dir.createFile(fileName, BACKUP_MIME);
  file.write(text);
  return 'saved';
}

export async function shareBackup(fileName: string, text: string, dialogTitle: string): Promise<'shared' | 'unavailable'> {
  if (!(await Sharing.isAvailableAsync())) return 'unavailable';
  const tmp = new File(Paths.cache, fileName);
  try {
    if (tmp.exists) tmp.delete();
    tmp.create();
    tmp.write(text);
    await Sharing.shareAsync(tmp.uri, { mimeType: BACKUP_MIME, dialogTitle });
    return 'shared';
  } finally {
    try {
      if (tmp.exists) tmp.delete();
    } catch {
      // best effort
    }
  }
}

export async function pickBackupFile(): Promise<{ name: string; text: string } | null> {
  const r = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true, multiple: false });
  if (r.canceled || !r.assets?.[0]) return null;
  const asset = r.assets[0];
  const file = new File(asset.uri);
  try {
    if ((asset.size ?? file.size ?? 0) > MAX_BACKUP_BYTES) throw new BackupError('too_large');
    return { name: asset.name ?? 'backup', text: await file.text() };
  } finally {
    try {
      if (file.exists) file.delete(); // cache copy
    } catch {
      // best effort
    }
  }
}
