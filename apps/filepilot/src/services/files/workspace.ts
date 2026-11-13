import type { FileStore } from './fileStore';
import { uniqueFileName } from './naming';

/**
 * Where files live during and after processing:
 *
 *   <cache>/filepilot-work/<jobId>/   temporary files of one running operation (deleted when it ends)
 *   <cache>/DocumentPicker/...        temporary copies made by the system picker (deleted after use)
 *   <cache>/ImageManipulator/...      encoder scratch files (moved out immediately, swept at start-up)
 *   <documents>/outputs/              results the user created (kept until the user deletes them)
 *
 * Originals chosen by the user are never opened for writing: the picker gives us a copy.
 */
export const WORK_DIR = 'filepilot-work';
export const OUTPUT_DIR = 'outputs';
/** Scratch folders created by third-party modules inside our cache. */
export const LIBRARY_SCRATCH_DIRS = ['DocumentPicker', 'ImageManipulator'] as const;

export interface Workspace {
  readonly fs: FileStore;
  outputsDir(): string;
  /** Creates the private temp folder of a job. */
  createJobDir(jobId: string): Promise<string>;
  deleteJobDir(jobId: string): Promise<void>;
  /** Moves a finished temp file into the outputs folder under a unique, non-overwriting name. */
  commitOutput(tempUri: string, desiredName: string): Promise<{ uri: string; name: string }>;
  /** Deletes a temporary input copy. Refuses anything outside the app cache. */
  discardTemporary(uri: string): Promise<void>;
  /** Start-up sweep: removes every leftover temp file from interrupted operations. */
  sweepTemporaryFiles(): Promise<number>;
  deleteOutput(uri: string): Promise<void>;
  deleteAllOutputs(): Promise<void>;
  isInside(uri: string, dir: string): boolean;
}

export function createWorkspace(fs: FileStore): Workspace {
  const workRoot = fs.join(fs.cacheRoot, WORK_DIR);
  const outputsRoot = fs.join(fs.documentsRoot, OUTPUT_DIR);
  const normalise = (u: string) => decodeURI(u).replace(/\/+$/, '');
  const isInside = (uri: string, dir: string) => normalise(uri).startsWith(`${normalise(dir)}/`);

  return {
    fs,
    isInside,
    outputsDir: () => outputsRoot,
    async createJobDir(jobId) {
      if (!/^[A-Za-z0-9_-]+$/.test(jobId)) throw new Error('invalid job id');
      const dir = fs.join(workRoot, jobId);
      await fs.ensureDir(dir);
      return dir;
    },
    async deleteJobDir(jobId) {
      await fs.delete(fs.join(workRoot, jobId));
    },
    async commitOutput(tempUri, desiredName) {
      await fs.ensureDir(outputsRoot);
      // Retry on a race with another job finishing at the same moment.
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
    async discardTemporary(uri) {
      if (!isInside(uri, fs.cacheRoot)) return; // never touch files outside our cache
      await fs.delete(uri);
    },
    async sweepTemporaryFiles() {
      let removed = 0;
      for (const dir of [WORK_DIR, ...LIBRARY_SCRATCH_DIRS]) {
        const uri = fs.join(fs.cacheRoot, dir);
        const children = await fs.list(uri);
        removed += children.length;
        await fs.delete(uri);
      }
      return removed;
    },
    async deleteOutput(uri) {
      if (!isInside(uri, outputsRoot)) return;
      await fs.delete(uri);
    },
    async deleteAllOutputs() {
      await fs.delete(outputsRoot);
    },
  };
}
