import { File, Paths } from 'expo-file-system';

import { recordError } from './analytics';

/**
 * File exchange through the Android share sheet / document picker. BookNest never
 * writes to shared storage itself: the user picks where an export goes.
 */
export async function shareTextFile(fileName: string, content: string, mimeType: string): Promise<boolean> {
  const file = new File(Paths.cache, fileName);
  if (file.exists) file.delete();
  file.create();
  file.write(content);
  return shareUri(file.uri, mimeType);
}

export async function shareUri(uri: string, mimeType: string): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Sharing = require('expo-sharing') as typeof import('expo-sharing');
  if (!(await Sharing.isAvailableAsync())) return false;
  await Sharing.shareAsync(uri, { mimeType, dialogTitle: undefined });
  return true;
}

/** Lets the user pick a file and returns its text (null if cancelled). Large files are refused. */
export async function pickTextFile(types: string[], maxBytes = 25 * 1024 * 1024): Promise<string | null> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const DocumentPicker = require('expo-document-picker') as typeof import('expo-document-picker');
  const res = await DocumentPicker.getDocumentAsync({ type: types, copyToCacheDirectory: true, multiple: false });
  if (res.canceled || !res.assets?.[0]) return null;
  const asset = res.assets[0];
  if (asset.size != null && asset.size > maxBytes) throw new Error('file_too_large');
  try {
    return await new File(asset.uri).text();
  } catch (e) {
    recordError(e, 'file_read');
    throw e;
  }
}

/** Renders HTML to a PDF file and opens the share sheet. */
export async function sharePdf(html: string, fileName: string): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Print = require('expo-print') as typeof import('expo-print');
  const { uri } = await Print.printToFileAsync({ html });
  const target = new File(Paths.cache, fileName);
  if (target.exists) target.delete();
  new File(uri).move(target);
  return shareUri(target.uri, 'application/pdf');
}

export function fileExists(uri: string): boolean {
  try {
    return new File(uri).exists;
  } catch {
    return false;
  }
}

/** Copies text to the clipboard (quotes "Copy" action). */
export async function copyText(text: string): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Clipboard = require('expo-clipboard') as typeof import('expo-clipboard');
  await Clipboard.setStringAsync(text);
}
