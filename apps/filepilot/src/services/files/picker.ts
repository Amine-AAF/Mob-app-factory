import * as DocumentPicker from 'expo-document-picker';

/**
 * File selection through Android's system picker (Storage Access Framework).
 * - No storage permission is needed: the user grants access to the chosen files only.
 * - `copyToCacheDirectory` gives FilePilot a private temporary copy; the original
 *   document is never opened for writing.
 * - Copies are deleted when the tool screen closes and swept at every start-up.
 */
export type PickKind = 'image' | 'pdf';

export const PICK_MIME_TYPES: Record<PickKind, string[]> = {
  image: ['image/jpeg', 'image/png', 'image/webp'],
  pdf: ['application/pdf'],
};

export interface PickedFile {
  uri: string;
  name: string;
  size: number;
  mimeType: string | null;
}

export async function pickFiles(kind: PickKind, multiple: boolean): Promise<PickedFile[]> {
  const result = await DocumentPicker.getDocumentAsync({ type: PICK_MIME_TYPES[kind], multiple, copyToCacheDirectory: true });
  if (result.canceled) return [];
  return result.assets.map((a) => ({ uri: a.uri, name: a.name || 'file', size: a.size ?? 0, mimeType: a.mimeType ?? null }));
}
