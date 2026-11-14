import * as DocumentPicker from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';

import { newId } from '@/domain/ids';

import { recordError } from './analytics';

/**
 * Private, on-device file storage.
 *
 * - Imported documents and photos are COPIED into the app's private document directory
 *   (`<documents>/homecare/{documents,photos}`), which other apps cannot read and Android
 *   auto-backup does not upload (allowBackup=false). The database only stores the path
 *   relative to that root, so the absolute location can change without breaking links.
 * - Picker copies in the cache are deleted right after import (no lingering temp files),
 *   and exports are written to `<cache>/exports`, which is purged on every start-up.
 * - Files are shared to other apps only through the system share sheet / viewer, using
 *   content:// URIs granted per action (FileProvider): no broad storage permission.
 * - Nothing here ever uploads a file.
 */
const ROOT = 'homecare';
export type FileArea = 'documents' | 'photos';

export interface StoredFile {
  /** Path relative to the private root, e.g. "documents/d_abc.pdf". */
  path: string;
  fileName: string;
  mimeType: string | null;
  sizeBytes: number | null;
}

const SAFE_RELATIVE = /^(documents|photos)\/[A-Za-z0-9_-]+(\.[A-Za-z0-9]{1,8})?$/;

function rootDir(): Directory {
  const dir = new Directory(Paths.document, ROOT);
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return dir;
}

function areaDir(area: FileArea): Directory {
  const dir = new Directory(rootDir(), area);
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return dir;
}

function exportsDir(): Directory {
  const dir = new Directory(Paths.cache, 'exports');
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return dir;
}

/** Rejects anything that is not one of our own generated relative paths (no "..", no absolute URIs). */
export function isSafeRelativePath(path: string | null | undefined): path is string {
  return typeof path === 'string' && SAFE_RELATIVE.test(path);
}

export function extensionFor(fileName: string | null | undefined, mimeType: string | null | undefined): string {
  const fromName = fileName?.match(/\.([A-Za-z0-9]{1,8})$/)?.[1]?.toLowerCase();
  if (fromName) return fromName;
  const map: Record<string, string> = {
    'application/pdf': 'pdf',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/heic': 'heic',
    'text/plain': 'txt',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  };
  return (mimeType && map[mimeType]) || 'bin';
}

export function fileFor(path: string): File | null {
  if (!isSafeRelativePath(path)) return null;
  const [area, name] = path.split('/') as [FileArea, string];
  return new File(areaDir(area), name);
}

export function fileUri(path: string | null | undefined): string | null {
  return path ? (fileFor(path)?.uri ?? null) : null;
}

/** False when the file was removed (storage cleared, restore on a new phone, manual deletion). */
export function fileExists(path: string | null | undefined): boolean {
  if (!path) return false;
  try {
    return fileFor(path)?.exists ?? false;
  } catch {
    return false;
  }
}

export function deleteStoredFile(path: string | null | undefined): void {
  if (!path) return;
  try {
    const f = fileFor(path);
    if (f?.exists) f.delete();
  } catch (e) {
    recordError(e, 'file_delete');
  }
}

function safeDeleteUri(uri: string | null | undefined): void {
  if (!uri) return;
  try {
    const f = new File(uri);
    if (f.exists) f.delete();
  } catch {
    // Best effort: temp files are also purged at start-up.
  }
}

async function copyIntoArea(sourceUri: string, area: FileArea, ext: string, removeSource: boolean): Promise<string> {
  const name = `${newId(area === 'documents' ? 'd' : 'p')}.${ext}`;
  const target = new File(areaDir(area), name);
  await new File(sourceUri).copy(target);
  if (removeSource) safeDeleteUri(sourceUri);
  return `${area}/${name}`;
}

export type PickResult<T> = { status: 'ok'; value: T } | { status: 'cancelled' } | { status: 'denied' } | { status: 'error' };

/** Opens the system document picker (Storage Access Framework) and stores a private copy. */
export async function importDocument(): Promise<PickResult<StoredFile>> {
  try {
    const res = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true, multiple: false });
    if (res.canceled || !res.assets?.[0]) return { status: 'cancelled' };
    const a = res.assets[0];
    const path = await copyIntoArea(a.uri, 'documents', extensionFor(a.name, a.mimeType), true);
    return { status: 'ok', value: { path, fileName: a.name, mimeType: a.mimeType ?? null, sizeBytes: a.size ?? null } };
  } catch (e) {
    recordError(e, 'document_import');
    return { status: 'error' };
  }
}

/** Takes or picks a photo (Android Photo Picker needs no storage permission). */
export async function pickPhoto(source: 'camera' | 'library'): Promise<PickResult<StoredFile>> {
  try {
    if (source === 'camera') {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) return { status: 'denied' };
    }
    const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.7, allowsEditing: false, exif: false };
    const res = source === 'camera' ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
    if (res.canceled || !res.assets?.[0]) return { status: 'cancelled' };
    const a = res.assets[0];
    const path = await copyIntoArea(a.uri, 'photos', extensionFor(a.fileName, a.mimeType ?? 'image/jpeg'), source === 'camera');
    return { status: 'ok', value: { path, fileName: a.fileName ?? 'photo.jpg', mimeType: a.mimeType ?? 'image/jpeg', sizeBytes: a.fileSize ?? null } };
  } catch (e) {
    recordError(e, 'photo_pick');
    return { status: 'error' };
  }
}

export type OpenResult = 'opened' | 'missing' | 'no_app' | 'error';

/** Opens a stored document in the user's viewer app (read-only content:// grant). */
export async function openStoredFile(path: string, mimeType: string | null): Promise<OpenResult> {
  const f = fileFor(path);
  if (!f?.exists) return 'missing';
  try {
    const options = mimeType ? { mimeType } : undefined;
    if (await f.canPreview(options)) {
      await f.preview(options);
      return 'opened';
    }
    return 'no_app';
  } catch (e) {
    recordError(e, 'file_open');
    return 'error';
  }
}

/**
 * Shares a stored file through the Android share sheet. The file is copied to the cache
 * under its original name (so the recipient sees "invoice.pdf", not an internal id).
 */
export async function shareStoredFile(path: string, mimeType: string | null, fileName: string | null, dialogTitle: string): Promise<OpenResult> {
  const f = fileFor(path);
  if (!f?.exists) return 'missing';
  try {
    if (!(await Sharing.isAvailableAsync())) return 'no_app';
    const safeName = sanitizeFileName(fileName) || f.name;
    const temp = new File(exportsDir(), safeName);
    if (temp.exists) temp.delete();
    await f.copy(temp);
    await Sharing.shareAsync(temp.uri, { mimeType: mimeType ?? undefined, dialogTitle });
    return 'opened';
  } catch (e) {
    recordError(e, 'file_share');
    return 'error';
  }
}

export function sanitizeFileName(name: string | null | undefined): string {
  return (name ?? '').replace(/[\\/:*?"<>|\u0000-\u001F]/g, '_').replace(/^\.+/, '').slice(0, 120);
}

/** Writes an export (CSV, JSON backup) to the purged exports folder and opens the share sheet. */
export async function shareTextExport(fileName: string, content: string, mimeType: string, dialogTitle: string): Promise<OpenResult> {
  try {
    if (!(await Sharing.isAvailableAsync())) return 'no_app';
    const file = new File(exportsDir(), sanitizeFileName(fileName));
    if (file.exists) file.delete();
    file.create();
    file.write(content);
    await Sharing.shareAsync(file.uri, { mimeType, dialogTitle, UTI: mimeType === 'application/json' ? 'public.json' : undefined });
    return 'opened';
  } catch (e) {
    recordError(e, 'export_share');
    return 'error';
  }
}

/** Moves a generated file (e.g. a PDF from expo-print) into the exports folder and shares it. */
export async function shareGeneratedFile(uri: string, fileName: string, mimeType: string, dialogTitle: string): Promise<OpenResult> {
  try {
    if (!(await Sharing.isAvailableAsync())) return 'no_app';
    const target = new File(exportsDir(), sanitizeFileName(fileName));
    if (target.exists) target.delete();
    await new File(uri).move(target);
    await Sharing.shareAsync(target.uri, { mimeType, dialogTitle });
    return 'opened';
  } catch (e) {
    recordError(e, 'export_share');
    return 'error';
  }
}

/** Lets the user pick a backup file and returns its text (the picker copy is deleted). */
export async function pickTextFile(): Promise<PickResult<string>> {
  try {
    const res = await DocumentPicker.getDocumentAsync({ type: ['application/json', 'text/plain', '*/*'], copyToCacheDirectory: true, multiple: false });
    if (res.canceled || !res.assets?.[0]) return { status: 'cancelled' };
    const uri = res.assets[0].uri;
    const text = await new File(uri).text();
    safeDeleteUri(uri);
    return { status: 'ok', value: text };
  } catch (e) {
    recordError(e, 'backup_pick');
    return { status: 'error' };
  }
}

/** Start-up hygiene: remove exports and picker copies left by a previous session. */
export function purgeTemporaryFiles(): void {
  for (const name of ['exports', 'DocumentPicker', 'ImagePicker']) {
    try {
      const dir = new Directory(Paths.cache, name);
      if (dir.exists) dir.delete();
    } catch {
      // ignore
    }
  }
}

/** Deletes every stored file not referenced anymore (after deletions, restores, cascades). */
export function removeUnreferencedFiles(referenced: Iterable<string>): number {
  const keep = new Set(referenced);
  let removed = 0;
  for (const area of ['documents', 'photos'] as const) {
    try {
      for (const entry of areaDir(area).list()) {
        if (entry instanceof File && !keep.has(`${area}/${entry.name}`)) {
          entry.delete();
          removed++;
        }
      }
    } catch (e) {
      recordError(e, 'file_cleanup');
    }
  }
  return removed;
}

/** Deletes all stored files (used by "Delete all my data"). */
export function deleteAllFiles(): void {
  try {
    const dir = new Directory(Paths.document, ROOT);
    if (dir.exists) dir.delete();
  } catch (e) {
    recordError(e, 'file_wipe');
  }
  purgeTemporaryFiles();
}
