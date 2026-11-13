import type { SqlDatabase } from '@factory/storage';
import { z } from 'zod';

export const OPERATION_TYPES = [
  'image_compress',
  'image_resize',
  'image_convert',
  'pdf_merge',
  'pdf_split',
  'pdf_extract',
  'image_to_pdf',
  'pdf_to_images',
] as const;
export type OperationType = (typeof OPERATION_TYPES)[number];

export const OPERATION_STATUSES = ['running', 'completed', 'failed', 'cancelled', 'interrupted'] as const;
export type OperationStatus = (typeof OPERATION_STATUSES)[number];

export interface OperationOutput {
  position: number;
  fileName: string;
  uri: string;
  size: number;
  mimeType: string;
}

export interface FileOperation {
  id: string;
  operationType: OperationType;
  originalFileName: string;
  outputFileName: string | null;
  originalSize: number;
  outputSize: number | null;
  inputCount: number;
  outputCount: number;
  createdAt: string;
  completedAt: string | null;
  status: OperationStatus;
  errorCode: string | null;
}

/** Validation at the repository boundary: bad data never reaches SQLite. */
export const newOperationSchema = z.object({
  id: z.string().regex(/^[A-Za-z0-9_-]{6,64}$/),
  operationType: z.enum(OPERATION_TYPES),
  originalFileName: z.string().min(1).max(255),
  originalSize: z.number().int().min(0),
  inputCount: z.number().int().min(1),
  createdAt: z.string().datetime(),
});
export type NewOperation = z.infer<typeof newOperationSchema>;

const outputSchema = z.object({
  fileName: z.string().min(1).max(255),
  uri: z.string().min(1),
  size: z.number().int().min(0),
  mimeType: z.string().min(3),
});

interface Row {
  id: string;
  operation_type: string;
  original_file_name: string;
  output_file_name: string | null;
  original_size: number;
  output_size: number | null;
  input_count: number;
  output_count: number;
  created_at: string;
  completed_at: string | null;
  status: string;
  error_code: string | null;
}

const toOperation = (r: Row): FileOperation => ({
  id: r.id,
  operationType: r.operation_type as OperationType,
  originalFileName: r.original_file_name,
  outputFileName: r.output_file_name,
  originalSize: r.original_size,
  outputSize: r.output_size,
  inputCount: r.input_count,
  outputCount: r.output_count,
  createdAt: r.created_at,
  completedAt: r.completed_at,
  status: r.status as OperationStatus,
  errorCode: r.error_code,
});

export function createOperationsRepository(db: SqlDatabase) {
  return {
    async start(input: NewOperation): Promise<void> {
      const op = newOperationSchema.parse(input);
      await db.runAsync(
        `INSERT INTO file_operations (id, operation_type, original_file_name, original_size, input_count, created_at, status)
         VALUES (?, ?, ?, ?, ?, ?, 'running')`,
        [op.id, op.operationType, op.originalFileName, op.originalSize, op.inputCount, op.createdAt],
      );
    },

    async complete(id: string, outputs: Omit<OperationOutput, 'position'>[], completedAt: string): Promise<void> {
      const valid = outputs.map((o) => outputSchema.parse(o));
      const total = valid.reduce((n, o) => n + o.size, 0);
      await db.withTransactionAsync(async () => {
        for (const [position, o] of valid.entries()) {
          await db.runAsync('INSERT INTO operation_outputs (operation_id, position, file_name, uri, size, mime_type) VALUES (?, ?, ?, ?, ?, ?)', [
            id,
            position,
            o.fileName,
            o.uri,
            o.size,
            o.mimeType,
          ]);
        }
        await db.runAsync(
          `UPDATE file_operations SET status = 'completed', output_file_name = ?, output_size = ?, output_count = ?, completed_at = ?, error_code = NULL WHERE id = ?`,
          [valid[0]?.fileName ?? null, total, valid.length, completedAt, id],
        );
      });
    },

    async finish(id: string, status: Exclude<OperationStatus, 'running' | 'completed'>, errorCode: string | null, completedAt: string): Promise<void> {
      await db.runAsync('UPDATE file_operations SET status = ?, error_code = ?, completed_at = ? WHERE id = ?', [status, errorCode, completedAt, id]);
    },

    /** Start-up recovery: operations still "running" were interrupted (app killed, crash, reboot). */
    async markInterrupted(completedAt: string): Promise<number> {
      const r = await db.runAsync(`UPDATE file_operations SET status = 'interrupted', completed_at = ? WHERE status = 'running'`, [completedAt]);
      return r.changes;
    },

    async get(id: string): Promise<(FileOperation & { outputs: OperationOutput[] }) | null> {
      const row = await db.getFirstAsync<Row>('SELECT * FROM file_operations WHERE id = ?', [id]);
      if (!row) return null;
      const outputs = await db.getAllAsync<{ position: number; file_name: string; uri: string; size: number; mime_type: string }>(
        'SELECT position, file_name, uri, size, mime_type FROM operation_outputs WHERE operation_id = ? ORDER BY position',
        [id],
      );
      return { ...toOperation(row), outputs: outputs.map((o) => ({ position: o.position, fileName: o.file_name, uri: o.uri, size: o.size, mimeType: o.mime_type })) };
    },

    async list(options: { limit: number; offset?: number; status?: OperationStatus }): Promise<FileOperation[]> {
      const rows = options.status
        ? await db.getAllAsync<Row>('SELECT * FROM file_operations WHERE status = ? ORDER BY created_at DESC, rowid DESC LIMIT ? OFFSET ?', [options.status, options.limit, options.offset ?? 0])
        : await db.getAllAsync<Row>('SELECT * FROM file_operations ORDER BY created_at DESC, rowid DESC LIMIT ? OFFSET ?', [options.limit, options.offset ?? 0]);
      return rows.map(toOperation);
    },

    async count(): Promise<number> {
      return (await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM file_operations', []))?.n ?? 0;
    },

    /** Bytes saved by completed compressions (shown on the dashboard). */
    async bytesSaved(): Promise<number> {
      const r = await db.getFirstAsync<{ saved: number | null }>(
        `SELECT SUM(MAX(original_size - output_size, 0)) AS saved FROM file_operations WHERE status = 'completed' AND operation_type IN ('image_compress', 'image_resize')`,
        [],
      );
      return r?.saved ?? 0;
    },

    async allOutputUris(): Promise<string[]> {
      return (await db.getAllAsync<{ uri: string }>('SELECT uri FROM operation_outputs', [])).map((r) => r.uri);
    },

    async delete(id: string): Promise<void> {
      await db.runAsync('DELETE FROM file_operations WHERE id = ?', [id]);
    },

    async clear(): Promise<void> {
      await db.execAsync('DELETE FROM operation_outputs; DELETE FROM file_operations;');
    },

    /** Keeps the most recent `keep` operations (history cleanup). */
    async prune(keep: number): Promise<number> {
      const r = await db.runAsync('DELETE FROM file_operations WHERE id NOT IN (SELECT id FROM file_operations ORDER BY created_at DESC, rowid DESC LIMIT ?)', [keep]);
      return r.changes;
    },
  };
}

export type OperationsRepository = ReturnType<typeof createOperationsRepository>;
