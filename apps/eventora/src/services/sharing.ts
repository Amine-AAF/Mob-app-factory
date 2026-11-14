import * as Clipboard from 'expo-clipboard';
import * as DocumentPicker from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Share } from 'react-native';

import { recordError } from './analytics';
import { importFile, writeExport, type FileBucket } from './files';

/**
 * Everything that leaves the app goes through here, and only on an explicit
 * user action: the Android share sheet (WhatsApp, e-mail, Drive…), the
 * clipboard, or a PDF/CSV/JSON file. Nothing is sent automatically.
 */

export type ShareOutcome = 'shared' | 'unavailable' | 'failed';

export async function shareFile(uri: string, mimeType: string, dialogTitle?: string): Promise<ShareOutcome> {
  try {
    if (!(await Sharing.isAvailableAsync())) return 'unavailable';
    await Sharing.shareAsync(uri, { mimeType, dialogTitle });
    return 'shared';
  } catch (e) {
    recordError(e, 'share_file');
    return 'failed';
  }
}

/** Plain-text share (invitation text to WhatsApp, SMS, e-mail…). */
export async function shareText(message: string, title?: string): Promise<ShareOutcome> {
  try {
    await Share.share({ message, title });
    return 'shared';
  } catch (e) {
    recordError(e, 'share_text');
    return 'failed';
  }
}

export async function copyText(text: string): Promise<void> {
  await Clipboard.setStringAsync(text);
}

/** Renders HTML to a PDF named `fileName` in the cache and returns its URI. */
export async function htmlToPdf(html: string, fileName: string, size: { width: number; height: number } = { width: 595, height: 842 }): Promise<string> {
  const { uri } = await Print.printToFileAsync({ html, base64: false, width: size.width, height: size.height });
  try {
    const dir = new Directory(Paths.cache, 'eventora-exports');
    if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
    const target = new File(dir, `${fileName.replace(/[^\w.-]+/g, '_').slice(0, 80)}.pdf`);
    if (target.exists) target.delete();
    await new File(uri).move(target);
    return target.uri;
  } catch {
    return uri; // keep the generated name if renaming fails
  }
}

export async function sharePdf(html: string, fileName: string, dialogTitle?: string, size?: { width: number; height: number }): Promise<ShareOutcome> {
  try {
    const uri = await htmlToPdf(html, fileName, size);
    return shareFile(uri, 'application/pdf', dialogTitle);
  } catch (e) {
    recordError(e, 'share_pdf');
    return 'failed';
  }
}

export async function shareCsv(csv: string, fileName: string, dialogTitle?: string): Promise<ShareOutcome> {
  try {
    return shareFile(writeExport(`${fileName}.csv`, csv), 'text/csv', dialogTitle);
  } catch (e) {
    recordError(e, 'share_csv');
    return 'failed';
  }
}

export async function shareJson(json: string, fileName: string, dialogTitle?: string): Promise<ShareOutcome> {
  try {
    return shareFile(writeExport(`${fileName}.json`, json), 'application/json', dialogTitle);
  } catch (e) {
    recordError(e, 'share_json');
    return 'failed';
  }
}

/** System photo picker (no storage permission on Android 13+). Copies the image privately. */
export async function pickImage(into: FileBucket, aspect?: [number, number]): Promise<string | null> {
  try {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: !!aspect, aspect, quality: 0.8, exif: false });
    if (res.canceled || !res.assets[0]) return null;
    return await importFile(res.assets[0].uri, into);
  } catch (e) {
    recordError(e, 'pick_image');
    return null;
  }
}

/** Receipt or contract: image or PDF chosen with the system document picker. */
export async function pickDocument(into: FileBucket): Promise<string | null> {
  try {
    const res = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/*'], copyToCacheDirectory: true, multiple: false });
    if (res.canceled || !res.assets[0]) return null;
    const asset = res.assets[0];
    return await importFile(asset.uri, into, asset.mimeType === 'application/pdf' ? 'pdf' : 'jpg');
  } catch (e) {
    recordError(e, 'pick_document');
    return null;
  }
}

/** Picks a text file (CSV or JSON backup) and returns its content. */
export async function pickTextFile(kind: 'csv' | 'json'): Promise<{ name: string; text: string } | null> {
  const type = kind === 'csv' ? ['text/csv', 'text/comma-separated-values', 'text/plain', 'application/vnd.ms-excel', '*/*'] : ['application/json', '*/*'];
  const res = await DocumentPicker.getDocumentAsync({ type, copyToCacheDirectory: true, multiple: false });
  if (res.canceled || !res.assets[0]) return null;
  const asset = res.assets[0];
  if ((asset.size ?? 0) > 5_000_000) throw new Error('file_too_large');
  return { name: asset.name, text: await new File(asset.uri).text() };
}
