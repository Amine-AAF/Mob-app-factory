import { Directory, File, Paths } from 'expo-file-system';

/**
 * Private on-device file storage for pet photos and documents.
 *
 * - Files live in the app's private document directory (not readable by other apps,
 *   excluded from Android auto-backup by `allowBackup: false`).
 * - SQLite keeps only metadata and the bare file name; this module resolves names to URIs,
 *   so moving the storage root never invalidates the database.
 * - Nothing here touches the network.
 */
export type FileKind = 'documents' | 'photos';

const SAFE_NAME = /^[A-Za-z0-9._-]+$/;

function root(): Directory {
  return new Directory(Paths.document, 'petcare');
}

function dir(kind: FileKind): Directory {
  const d = new Directory(root(), kind);
  if (!d.exists) d.create({ intermediates: true, idempotent: true });
  return d;
}

/** Scratch directory for exports; emptied at start-up and after sharing. */
export function exportDir(): Directory {
  const d = new Directory(Paths.cache, 'petcare-export');
  if (!d.exists) d.create({ intermediates: true, idempotent: true });
  return d;
}

function assertName(name: string): void {
  if (!SAFE_NAME.test(name) || name.includes('..')) throw new Error('unsafe_file_name');
}

export function extensionFor(mimeType: string | null | undefined, fallbackName?: string | null): string {
  const fromName = fallbackName?.match(/\.([A-Za-z0-9]{1,5})$/)?.[1]?.toLowerCase();
  if (fromName) return fromName;
  if (!mimeType) return 'bin';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType === 'image/png') return 'png';
  if (mimeType === 'image/webp') return 'webp';
  if (mimeType.startsWith('image/')) return 'jpg';
  return 'bin';
}

export function fileFor(kind: FileKind, name: string): File {
  assertName(name);
  return new File(dir(kind), name);
}

export function fileUri(kind: FileKind, name: string): string {
  return fileFor(kind, name).uri;
}

export function fileExists(kind: FileKind, name: string | null | undefined): boolean {
  if (!name) return false;
  try {
    return fileFor(kind, name).exists;
  } catch {
    return false;
  }
}

/**
 * Copies a picked file (content:// or cache URI) into private storage.
 * The picker's cache copy is deleted afterwards so no temporary copy lingers.
 */
export async function importFile(kind: FileKind, sourceUri: string, baseName: string, ext: string): Promise<{ fileName: string; sizeBytes: number | null }> {
  const fileName = `${baseName}.${ext.replace(/[^a-z0-9]/gi, '').slice(0, 5) || 'bin'}`;
  const target = fileFor(kind, fileName);
  const source = new File(sourceUri);
  await source.copy(target);
  if (sourceUri.startsWith(Paths.cache.uri)) {
    try {
      source.delete();
    } catch {
      // Best effort: the OS clears the cache directory eventually.
    }
  }
  let sizeBytes: number | null = null;
  try {
    sizeBytes = target.size ?? null;
  } catch {
    sizeBytes = null;
  }
  return { fileName, sizeBytes };
}

export function deleteFile(kind: FileKind, name: string | null | undefined): void {
  if (!name) return;
  try {
    const f = fileFor(kind, name);
    if (f.exists) f.delete();
  } catch {
    // Missing files are not an error: the metadata row is what matters.
  }
}

export function listFiles(kind: FileKind): string[] {
  return dir(kind)
    .list()
    .filter((e): e is File => e instanceof File)
    .map((f) => f.name);
}

export async function readBase64(kind: FileKind, name: string): Promise<string> {
  return fileFor(kind, name).base64();
}

export function writeBase64(kind: FileKind, name: string, data: string): void {
  const f = fileFor(kind, name);
  if (f.exists) f.delete();
  f.create();
  // Synchronous on purpose: restore must finish writing before the UI reports success.
  f.writeSync(base64ToBytes(data));
}

/** Removes every PetCare file (used by "Delete all my data"). */
export function wipeAllFiles(): void {
  const r = root();
  if (r.exists) r.delete();
  clearExports();
}

/** Deletes leftover export files (temporary-file protection). */
export function clearExports(): void {
  try {
    const d = new Directory(Paths.cache, 'petcare-export');
    if (d.exists) d.delete();
  } catch {
    // ignore
  }
}

/** Writes a temporary export file and returns it (caller shares then deletes it). */
export function writeExport(name: string, content: string): File {
  assertName(name);
  const f = new File(exportDir(), name);
  if (f.exists) f.delete();
  f.create();
  // Synchronous: the file must be complete before it is handed to the share sheet.
  f.writeSync(content);
  return f;
}

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export function base64ToBytes(data: string): Uint8Array {
  const clean = data.replace(/[^A-Za-z0-9+/]/g, '');
  const bytes = new Uint8Array(Math.floor((clean.length * 3) / 4));
  let p = 0;
  for (let i = 0; i < clean.length; i += 4) {
    const [a, b, c, d] = [0, 1, 2, 3].map((k) => B64.indexOf(clean[i + k] ?? 'A')) as [number, number, number, number];
    const n = (a << 18) | (b << 12) | (c << 6) | d;
    if (p < bytes.length) bytes[p++] = (n >> 16) & 255;
    if (p < bytes.length && i + 2 < clean.length) bytes[p++] = (n >> 8) & 255;
    if (p < bytes.length && i + 3 < clean.length) bytes[p++] = n & 255;
  }
  return bytes.subarray(0, p);
}
