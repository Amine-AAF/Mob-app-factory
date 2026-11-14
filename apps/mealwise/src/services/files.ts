import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Share } from 'react-native';

/**
 * File and share helpers. Uses the Android share sheet and the system document
 * picker (Storage Access Framework): no storage permission is requested.
 */
export async function shareText(message: string, title?: string): Promise<boolean> {
  const res = await Share.share({ message, ...(title ? { title } : {}) });
  return res.action === Share.sharedAction;
}

/** Writes a file in the app cache and opens the share sheet (save to Drive, send by email…). */
export async function shareFile(fileName: string, contents: string, mimeType: string, dialogTitle: string): Promise<void> {
  const file = new File(Paths.cache, fileName);
  if (file.exists) file.delete();
  file.create();
  file.write(contents);
  if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(file.uri, { mimeType, dialogTitle });
}

/** Lets the user pick a JSON/text file and returns its content, or null if cancelled. */
export async function pickTextFile(types: string[] = ['application/json', 'text/plain']): Promise<string | null> {
  const res = await DocumentPicker.getDocumentAsync({ type: types, copyToCacheDirectory: true, multiple: false });
  if (res.canceled || !res.assets?.[0]) return null;
  return new File(res.assets[0].uri).text();
}
