/**
 * Minimal filesystem contract used by the processing engine. The app uses the
 * expo-file-system implementation (expoFileStore.ts); tests use the in-memory one,
 * so every file-handling rule (cleanup, no overwrite, originals untouched) is testable.
 *
 * All URIs point inside the app sandbox (file://...). User files enter the sandbox
 * only as temporary copies made by the system picker.
 */
export interface FileStore {
  readonly cacheRoot: string;
  readonly documentsRoot: string;
  join(dir: string, name: string): string;
  readBytes(uri: string): Promise<Uint8Array>;
  /** Reads at most `length` leading bytes. */
  readHead(uri: string, length: number): Promise<Uint8Array>;
  writeBytes(uri: string, bytes: Uint8Array): Promise<void>;
  /** Size in bytes, or null if the file doesn't exist. */
  size(uri: string): Promise<number | null>;
  exists(uri: string): Promise<boolean>;
  /** Idempotent; deletes directories recursively. */
  delete(uri: string): Promise<void>;
  move(from: string, to: string): Promise<void>;
  ensureDir(uri: string): Promise<void>;
  /** Names of the direct children of a directory ([] if missing). */
  list(dirUri: string): Promise<string[]>;
}

const trimSlash = (s: string) => s.replace(/\/+$/, '');

export function joinUri(dir: string, name: string): string {
  return `${trimSlash(dir)}/${name.replace(/^\/+/, '')}`;
}

/** In-memory FileStore for tests (and a safety net when the native FS is unavailable). */
export function createMemoryFileStore(options: { quotaBytes?: number } = {}): FileStore & {
  files: Map<string, Uint8Array>;
  dirs: Set<string>;
} {
  const files = new Map<string, Uint8Array>();
  const dirs = new Set<string>(['mem://cache', 'mem://documents']);
  const used = () => [...files.values()].reduce((n, b) => n + b.length, 0);
  const isUnder = (uri: string, dir: string) => uri.startsWith(`${trimSlash(dir)}/`);

  return {
    files,
    dirs,
    cacheRoot: 'mem://cache',
    documentsRoot: 'mem://documents',
    join: joinUri,
    async readBytes(uri) {
      const b = files.get(uri);
      if (!b) throw new Error(`ENOENT: ${uri}`);
      return b.slice();
    },
    async readHead(uri, length) {
      const b = files.get(uri);
      if (!b) throw new Error(`ENOENT: ${uri}`);
      return b.slice(0, length);
    },
    async writeBytes(uri, bytes) {
      if (options.quotaBytes !== undefined && used() - (files.get(uri)?.length ?? 0) + bytes.length > options.quotaBytes) {
        throw new Error('ENOSPC: no space left on device');
      }
      files.set(uri, bytes.slice());
    },
    async size(uri) {
      return files.get(uri)?.length ?? null;
    },
    async exists(uri) {
      return files.has(uri) || dirs.has(trimSlash(uri));
    },
    async delete(uri) {
      files.delete(uri);
      const dir = trimSlash(uri);
      dirs.delete(dir);
      for (const k of [...files.keys()]) if (isUnder(k, dir)) files.delete(k);
      for (const d of [...dirs]) if (isUnder(d, dir)) dirs.delete(d);
    },
    async move(from, to) {
      const b = files.get(from);
      if (!b) throw new Error(`ENOENT: ${from}`);
      if (files.has(to)) throw new Error(`EEXIST: ${to}`);
      files.set(to, b);
      files.delete(from);
    },
    async ensureDir(uri) {
      dirs.add(trimSlash(uri));
    },
    async list(dirUri) {
      const dir = trimSlash(dirUri);
      const names = new Set<string>();
      for (const k of [...files.keys(), ...dirs]) {
        if (isUnder(k, dir)) names.add(k.slice(dir.length + 1).split('/')[0] as string);
      }
      return [...names];
    },
  };
}
