import type { OperationsRepository, OperationType } from '@/database/repositories/operationsRepository';

import { ProcessingError, toErrorCode, type ProcessingErrorCode } from '../files/errors';
import type { Workspace } from '../files/workspace';

/**
 * Runs one file operation with uniform guarantees:
 *
 * 1. A history row is written as "running" BEFORE work starts, so an operation killed
 *    mid-way (crash, OS kill, reboot) is detected at the next start-up ("interrupted").
 * 2. All intermediate files go to a private per-job temp folder, deleted in `finally`
 *    whatever happens (success, error, cancellation).
 * 3. Outputs are moved into the outputs folder only after the whole job succeeded, under
 *    unique names: nothing is overwritten, and a failed job leaves no partial output.
 * 4. Input files are only read. Originals selected by the user are never modified.
 * 5. Progress is real (steps actually completed), never simulated.
 */
export interface ProducedFile {
  /** Temp file inside the job folder. */
  tempUri: string;
  desiredName: string;
  mimeType: string;
  /** Optional extra info for the result screen. */
  width?: number;
  height?: number;
}

export interface JobHandle {
  id: string;
  workDir: string;
  isCancelled: () => boolean;
  progress: (done: number, total: number) => void;
}

export interface CommittedOutput {
  uri: string;
  fileName: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
}

export type OperationOutcome =
  | { status: 'completed'; id: string; type: OperationType; outputs: CommittedOutput[]; originalSize: number; outputSize: number; inputCount: number; details?: Record<string, unknown> }
  | { status: 'cancelled'; id: string; type: OperationType }
  | { status: 'failed'; id: string; type: OperationType; code: ProcessingErrorCode };

export interface RunnerDeps {
  workspace: Workspace;
  operations: OperationsRepository;
  now: () => Date;
  newId: () => string;
}

export interface RunSpec {
  type: OperationType;
  inputs: { name: string; size: number }[];
  execute: (job: JobHandle) => Promise<{ files: ProducedFile[]; details?: Record<string, unknown> }>;
  onProgress?: (done: number, total: number) => void;
}

export interface CancelToken {
  readonly cancelled: boolean;
  cancel(): void;
}

export function createCancelToken(): CancelToken {
  let cancelled = false;
  return {
    get cancelled() {
      return cancelled;
    },
    cancel() {
      cancelled = true;
    },
  };
}

export function inputLabel(inputs: { name: string }[]): string {
  const first = inputs[0]?.name ?? 'file';
  return first.slice(0, 255);
}

export async function runOperation(deps: RunnerDeps, spec: RunSpec, token: CancelToken = createCancelToken()): Promise<OperationOutcome> {
  const { workspace, operations } = deps;
  const id = deps.newId();
  const originalSize = spec.inputs.reduce((n, f) => n + Math.max(0, f.size), 0);
  await operations.start({
    id,
    operationType: spec.type,
    originalFileName: inputLabel(spec.inputs),
    originalSize,
    inputCount: Math.max(1, spec.inputs.length),
    createdAt: deps.now().toISOString(),
  });

  const committed: CommittedOutput[] = [];
  let workDir: string | null = null;
  try {
    workDir = await workspace.createJobDir(id);
    const job: JobHandle = { id, workDir, isCancelled: () => token.cancelled, progress: (d, t) => spec.onProgress?.(d, t) };
    const { files, details } = await spec.execute(job);
    if (token.cancelled) throw new ProcessingError('cancelled');
    if (!files.length) throw new ProcessingError('write_failed', 'no output');

    for (const f of files) {
      const size = await workspace.fs.size(f.tempUri);
      if (size === null) throw new ProcessingError('write_failed');
      const { uri, name } = await workspace.commitOutput(f.tempUri, f.desiredName);
      committed.push({ uri, fileName: name, size, mimeType: f.mimeType, ...(f.width ? { width: f.width } : {}), ...(f.height ? { height: f.height } : {}) });
    }
    await operations.complete(
      id,
      committed.map((c) => ({ fileName: c.fileName, uri: c.uri, size: c.size, mimeType: c.mimeType })),
      deps.now().toISOString(),
    );
    const outputSize = committed.reduce((n, c) => n + c.size, 0);
    return { status: 'completed', id, type: spec.type, outputs: committed, originalSize, outputSize, inputCount: spec.inputs.length, ...(details ? { details } : {}) };
  } catch (e) {
    // All-or-nothing: remove outputs already moved if a later step failed.
    for (const c of committed) await workspace.deleteOutput(c.uri).catch(() => undefined);
    const code = token.cancelled ? 'cancelled' : toErrorCode(e);
    await operations.finish(id, code === 'cancelled' ? 'cancelled' : 'failed', code === 'cancelled' ? null : code, deps.now().toISOString()).catch(() => undefined);
    return code === 'cancelled' ? { status: 'cancelled', id, type: spec.type } : { status: 'failed', id, type: spec.type, code };
  } finally {
    if (workDir) await workspace.deleteJobDir(id).catch(() => undefined);
  }
}

/** Start-up recovery: flags interrupted operations and removes their temporary files. */
export async function recoverInterruptedOperations(deps: Pick<RunnerDeps, 'workspace' | 'operations' | 'now'>): Promise<{ interrupted: number; tempEntriesRemoved: number }> {
  const interrupted = await deps.operations.markInterrupted(deps.now().toISOString());
  const tempEntriesRemoved = await deps.workspace.sweepTemporaryFiles();
  return { interrupted, tempEntriesRemoved };
}

/** Random, URL-safe operation id (no personal data). */
export function createOperationId(random: () => number = Math.random): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let s = Date.now().toString(36);
  for (let i = 0; i < 10; i++) s += alphabet[Math.floor(random() * alphabet.length)];
  return s;
}
