import * as DocumentPicker from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { recordError } from './analytics';

/**
 * File handling with the system picker (no storage permission needed).
 * PDFs are copied into the app's private documents folder and opened with the viewer app the
 * learner already has (via the share sheet). LearnSphere does not extract text from PDFs.
 */
export const MAX_PDF_BYTES = 50 * 1024 * 1024;

function resourcesDir(): Directory {
  const dir = new Directory(Paths.document, 'resources');
  if (!dir.exists) dir.create({ intermediates: true });
  return dir;
}

export type PickResult = { status: 'ok'; uri: string; name: string; size: number | null } | { status: 'cancelled' } | { status: 'too_large' } | { status: 'error' };

export async function importPdf(): Promise<PickResult> {
  try {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true, multiple: false });
    if (result.canceled || !result.assets?.[0]) return { status: 'cancelled' };
    const asset = result.assets[0];
    if (asset.size && asset.size > MAX_PDF_BYTES) return { status: 'too_large' };
    const safeName = asset.name.replace(/[^\w.\- ]+/g, '_').slice(0, 80) || 'document.pdf';
    const target = new File(resourcesDir(), `${Date.now()}-${safeName}`);
    new File(asset.uri).copy(target);
    return { status: 'ok', uri: target.uri, name: asset.name.replace(/\.pdf$/i, ''), size: asset.size ?? null };
  } catch (e) {
    recordError(e, 'pdf_import');
    return { status: 'error' };
  }
}

export async function openFile(uri: string, mimeType = 'application/pdf'): Promise<boolean> {
  try {
    if (!(await Sharing.isAvailableAsync())) return false;
    await Sharing.shareAsync(uri, { mimeType, UTI: 'com.adobe.pdf' });
    return true;
  } catch (e) {
    recordError(e, 'open_file');
    return false;
  }
}

export function deleteLocalFile(uri: string): void {
  try {
    const f = new File(uri);
    if (f.exists) f.delete();
  } catch (e) {
    recordError(e, 'delete_file');
  }
}

/** Writes text to a cache file and opens the share sheet (exports: backup, notes). */
export async function shareText(fileName: string, content: string, mimeType: string): Promise<boolean> {
  try {
    const file = new File(Paths.cache, fileName);
    if (file.exists) file.delete();
    file.create();
    file.write(content);
    if (!(await Sharing.isAvailableAsync())) return false;
    await Sharing.shareAsync(file.uri, { mimeType });
    return true;
  } catch (e) {
    recordError(e, 'share_text');
    return false;
  }
}

/** Lets the learner pick a backup JSON file and returns its text. */
export async function pickJsonText(): Promise<string | null> {
  const result = await DocumentPicker.getDocumentAsync({ type: ['application/json', 'text/plain', '*/*'], copyToCacheDirectory: true });
  if (result.canceled || !result.assets?.[0]) return null;
  return new File(result.assets[0].uri).text();
}
