import type { FileStore } from './fileStore';
import { uniqueFileName } from './naming';

/**
 * Where ImageCraft keeps files (all inside the app sandbox, never shared with other apps
 * except through an explicit Share / Save / Export action):
 *
 *   <cache>/imagecraft-work/<jobId>/   temporary renders of one running job (deleted when it ends)
 *   <cache>/imagecraft-preview/        editor previews (deleted when the editor closes, swept at start-up)
 *   <cache>/ImagePicker/ ...           copies made by the system photo picker (swept at start-up)
 *   <documents>/sources/               private copy of each imported picture (needed to re-open a project)
 *   <documents>/outputs/               results the user created (kept until the user deletes them)
 *
 * The user's original photo is NEVER opened for writing: the picker hands us a copy, and
 * every result is a new file with a new, non-conflicting name.
 */
export const WORK_DIR = 'imagecraft-work';
export const PREVIEW_DIR = 'imagecraft-preview';
export const SOURCES_DIR = 'sources';
export const OUTPUT_DIR = 'outputs';
/** Scratch folders created by third-party modules inside our cache. */
export const LIBRARY_SCRATCH_DIRS = ['ImagePicker', 'ImageManipulator', 'DocumentPicker'] as const;

const ID_PATTERN = /^[A-Za-z0-9_-]+$/;

export interface Workspace {
  readonly fs: FileStore;
  outputsDir(): string;
  sourcesDir(): string;
  previewDir(): string;
  createJobDir(jobId: string): Promise<string>;
  deleteJobDir(jobId: string): Promise<void>;
  /** Moves a finished temp file into the outputs folder under a unique, non-overwriting name. */
  commitOutput(tempUri: string, desiredName: string): Promise<{ uri: string; name: string }>;
  /** Moves an imported temp copy into the private sources folder. */
  adoptSource(tempUri: string, id: string, extension: string): Promise<string>;
  /** Deletes a temporary copy. Refuses anything outside the app cache. */
  discardTemporary(uri: string): Promise<void>;
  clearPreviews(): Promise<void>;
  /** Start-up sweep of leftovers from interrupted jobs. Returns the number of entries removed. */
  sweepTemporaryFiles(): Promise<number>;
  /** Deletes private sources that no project references any more. */
  pruneSources(referenced: Set<string>): Promise<number>;
  deleteOwned(uri: string): Promise<void>;
  deleteAllUserFiles(): Promise<void>;
  isInside(uri: string, dir: string): boolean;
  isOwned(uri: string): boolean;
}

export function createWorkspace(fs: FileStore): Workspace {
  const workRoot = fs.join(fs.cacheRoot, WORK_DIR);
  const previewRoot = fs.join(fs.cacheRoot, PREVIEW_DIR);
  const sourcesRoot = fs.join(fs.documentsRoot, SOURCES_DIR);
  const outputsRoot = fs.join(fs.documentsRoot, OUTPUT_DIR);
  const normalise = (u: string) => {
    let s = u;
    try {
      s = decodeURI(u);
    } catch {
      // keep the raw value
    }
    return s.replace(/\/+$/, '');
  };
  const isInside = (uri: string, dir: string) => {
    const n = normalise(uri);
    // Reject traversal attempts such as ".../outputs/../../secret".
    if (/(^|\/)\.\.(\/|$)/.test(n)) return false;
    return n.startsWith(`${normalise(dir)}/`);
  };
  const isOwned = (uri: string) => isInside(uri, fs.cacheRoot) || isInside(uri, sourcesRoot) || isInside(uri, outputsRoot);

  return {
    fs,
    isInside,
    isOwned,
    outputsDir: () => outputsRoot,
    sourcesDir: () => sourcesRoot,
    previewDir: () => previewRoot,
    async createJobDir(jobId) {
      if (!ID_PATTERN.test(jobId)) throw new Error('invalid job id');
      const dir = fs.join(workRoot, jobId);
      await fs.ensureDir(dir);
      return dir;
    },
    async deleteJobDir(jobId) {
      if (!ID_PATTERN.test(jobId)) return;
      await fs.delete(fs.join(workRoot, jobId));
    },
    async commitOutput(tempUri, desiredName) {
      await fs.ensureDir(outputsRoot);
      for (let attempt = 0; attempt < 5; attempt++) {
        const name = uniqueFileName(desiredName, await fs.list(outputsRoot));
        const uri = fs.join(outputsRoot, name);
        try {
          await fs.move(tempUri, uri);
          return { uri, name };
        } catch (e) {
          if (!/EEXIST|exists/i.test(String(e))) throw e;
        }
      }
      throw new Error('could not allocate an output name');
    },
    async adoptSource(tempUri, id, extension) {
      if (!ID_PATTERN.test(id)) throw new Error('invalid source id');
      await fs.ensureDir(sourcesRoot);
      const uri = fs.join(sourcesRoot, `${id}.${extension.replace(/^\./, '')}`);
      await fs.move(tempUri, uri);
      return uri;
    },
    async discardTemporary(uri) {
      if (!isInside(uri, fs.cacheRoot)) return;
      await fs.delete(uri);
    },
    async clearPreviews() {
      await fs.delete(previewRoot);
    },
    async sweepTemporaryFiles() {
      let removed = 0;
      for (const dir of [WORK_DIR, PREVIEW_DIR, ...LIBRARY_SCRATCH_DIRS]) {
        const uri = fs.join(fs.cacheRoot, dir);
        removed += (await fs.list(uri)).length;
        await fs.delete(uri);
      }
      return removed;
    },
    async pruneSources(referenced) {
      let removed = 0;
      for (const name of await fs.list(sourcesRoot)) {
        const uri = fs.join(sourcesRoot, name);
        if (!referenced.has(uri)) {
          await fs.delete(uri);
          removed++;
        }
      }
      return removed;
    },
    async deleteOwned(uri) {
      if (!isOwned(uri)) return; // never touch files outside our own folders
      await fs.delete(uri);
    },
    async deleteAllUserFiles() {
      await fs.delete(outputsRoot);
      await fs.delete(sourcesRoot);
      await fs.delete(workRoot);
      await fs.delete(previewRoot);
    },
  };
}
