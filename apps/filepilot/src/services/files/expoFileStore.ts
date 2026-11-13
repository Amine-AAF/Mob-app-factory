import { Directory, File, Paths } from 'expo-file-system';

import { joinUri, type FileStore } from './fileStore';

/**
 * FileStore backed by expo-file-system (SDK 58 object API). Binary data moves as
 * Uint8Array end-to-end: no base64 round trips that would triple memory use.
 */
function entry(uri: string): File | Directory | null {
  const file = new File(uri);
  if (file.exists) return file;
  const dir = new Directory(uri);
  return dir.exists ? dir : null;
}

export function createExpoFileStore(): FileStore {
  return {
    cacheRoot: Paths.cache.uri,
    documentsRoot: Paths.document.uri,
    join: joinUri,
    async readBytes(uri) {
      return new File(uri).bytes();
    },
    async readHead(uri, length) {
      const file = new File(uri);
      const handle = file.open();
      try {
        return await handle.readBytes(Math.min(length, file.size ?? length));
      } finally {
        handle.close();
      }
    },
    async writeBytes(uri, bytes) {
      const file = new File(uri);
      if (!file.exists) file.create({ intermediates: true });
      file.write(bytes);
    },
    async size(uri) {
      const file = new File(uri);
      return file.exists ? (file.size ?? 0) : null;
    },
    async exists(uri) {
      return entry(uri) !== null;
    },
    async delete(uri) {
      const e = entry(uri);
      if (e) e.delete();
    },
    async move(from, to) {
      const target = new File(to);
      if (target.exists) throw new Error(`EEXIST: ${to}`);
      target.parentDirectory.create({ intermediates: true, idempotent: true });
      new File(from).move(target);
    },
    async ensureDir(uri) {
      new Directory(uri).create({ intermediates: true, idempotent: true });
    },
    async list(dirUri) {
      const dir = new Directory(dirUri);
      if (!dir.exists) return [];
      return dir.list().map((e) => e.name);
    },
  };
}
