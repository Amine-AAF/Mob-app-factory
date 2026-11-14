import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

import { repos } from '@/database';
import { DocumentValidationError, checkFile, type DocumentMetaInput } from '@/database/repositories/documents';
import { MAX_PHOTOS_PER_ENTRY } from '@/database/repositories/journal';
import { assertCanAddDocument } from '@/features/premium/guard';
import { notifyDataChanged } from '@/store/session';
import type { TravelDocument } from '@/types/models';
import { createId } from '@/utils/ids';

import { deleteLocalFiles, importIntoPrivateStorage } from './files';

/**
 * Document & photo import. Files never leave the device: they are picked with the system
 * pickers (Storage Access Framework / Android Photo Picker, no storage permission), copied
 * into the app's private folder, and only their reference is stored in SQLite.
 */
export interface PickedFile {
  uri: string;
  mimeType: string;
  sizeBytes: number;
  name: string;
}

/** Opens the Android document picker for a PDF or an image. Null when cancelled. */
export async function pickDocumentFile(): Promise<PickedFile | null> {
  const res = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/*'], copyToCacheDirectory: true, multiple: false });
  if (res.canceled || !res.assets?.[0]) return null;
  const a = res.assets[0];
  return { uri: a.uri, mimeType: a.mimeType ?? '', sizeBytes: a.size ?? -1, name: a.name };
}

/** Validates, copies and registers a document. On any failure nothing is left behind. */
export async function importDocument(picked: PickedFile, meta: DocumentMetaInput): Promise<TravelDocument> {
  const fileError = checkFile(picked.mimeType, picked.sizeBytes < 0 ? null : picked.sizeBytes);
  if (fileError) throw new DocumentValidationError(fileError, 'file');
  await assertCanAddDocument();
  const stored = await importIntoPrivateStorage(picked.uri, 'documents', picked.mimeType, picked.sizeBytes, createId(), picked.name);
  try {
    const doc = await repos().documents.create(meta, { uri: stored.uri, mimeType: picked.mimeType, sizeBytes: stored.sizeBytes });
    notifyDataChanged();
    return doc;
  } catch (e) {
    deleteLocalFiles([stored.uri]);
    throw e;
  }
}

/** Permanently deletes a document: the row, then the file in the private folder. */
export async function deleteDocument(id: string): Promise<void> {
  const uri = await repos().documents.remove(id);
  if (uri) deleteLocalFiles([uri]);
  notifyDataChanged();
}

export type PhotoPickResult = { status: 'ok'; uris: string[] } | { status: 'cancelled' } | { status: 'denied' };

/**
 * Picks photos with the Android Photo Picker (no media permission on Android 13+) and
 * copies them into the private folder. Returns the private URIs.
 */
export async function pickPhotos(limit: number = MAX_PHOTOS_PER_ENTRY): Promise<PhotoPickResult> {
  if (limit <= 0) return { status: 'cancelled' };
  let res: ImagePicker.ImagePickerResult;
  try {
    res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: limit > 1, selectionLimit: limit, quality: 0.8, exif: false });
  } catch {
    // Older Android versions may require the media permission and the user refused it.
    return { status: 'denied' };
  }
  if (res.canceled || !res.assets.length) return { status: 'cancelled' };
  const uris: string[] = [];
  try {
    for (const a of res.assets.slice(0, limit)) {
      const mime = a.mimeType ?? 'image/jpeg';
      const stored = await importIntoPrivateStorage(a.uri, 'photos', mime, a.fileSize ?? 0, createId(), a.fileName ?? undefined);
      uris.push(stored.uri);
    }
  } catch (e) {
    deleteLocalFiles(uris);
    throw e;
  }
  return { status: 'ok', uris };
}
