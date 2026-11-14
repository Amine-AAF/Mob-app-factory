import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

/**
 * Local file helpers. Exports are written to the app cache and handed to the Android share
 * sheet: the user decides where the file goes. Nothing is uploaded by SpendWise.
 */
export async function shareTextFile(fileName: string, content: string, mimeType: string, dialogTitle: string): Promise<void> {
  const file = new File(Paths.cache, fileName);
  if (file.exists) file.delete();
  file.create();
  file.write(content);
  if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(file.uri, { mimeType, dialogTitle });
}

/** Opens the system file picker and returns the text content, or null if cancelled. */
export async function pickTextFile(mimeTypes: string[]): Promise<string | null> {
  const picked = await File.pickFileAsync({ mimeTypes });
  if (picked.canceled || !picked.result) return null;
  return picked.result.text();
}
