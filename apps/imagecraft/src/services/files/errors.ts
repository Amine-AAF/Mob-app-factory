/**
 * Typed processing errors. `code` maps to a localized message (errors.<code>);
 * messages never contain file names, paths or image content.
 */
export const ERROR_CODES = [
  'cancelled',
  'unsupported_format',
  'corrupted_file',
  'file_too_large',
  'image_too_large',
  'file_missing',
  'storage_full',
  'write_failed',
  'out_of_memory',
  'native_unavailable',
  'premium_required',
  'gallery_unsupported',
  'gallery_failed',
  'permission_denied',
  'export_failed',
  'source_expired',
  'unknown',
] as const;
export type ProcessingErrorCode = (typeof ERROR_CODES)[number];

export class ProcessingError extends Error {
  readonly code: ProcessingErrorCode;
  constructor(code: ProcessingErrorCode, detail?: string) {
    super(detail ? `${code}: ${detail}` : code);
    this.name = 'ProcessingError';
    this.code = code;
  }
}

export function isProcessingError(e: unknown): e is ProcessingError {
  return e instanceof ProcessingError;
}

const NATIVE_CODE_MAP: Record<string, ProcessingErrorCode> = {
  ERR_CANCELLED: 'cancelled',
  ERR_OUT_OF_MEMORY: 'out_of_memory',
  ERR_STORAGE_FULL: 'storage_full',
  ERR_DECODE: 'corrupted_file',
  ERR_ENCODE: 'write_failed',
  ERR_FILE_MISSING: 'source_expired',
  ERR_OUTPUT_EXISTS: 'write_failed',
  ERR_INVALID_URI: 'file_missing',
  ERR_GALLERY_UNSUPPORTED: 'gallery_unsupported',
  ERR_GALLERY_WRITE: 'gallery_failed',
};

/** Normalises any thrown value (native coded errors included) into a ProcessingErrorCode. */
export function toErrorCode(e: unknown): ProcessingErrorCode {
  if (isProcessingError(e)) return e.code;
  const code = (e as { code?: unknown } | null)?.code;
  if (typeof code === 'string' && NATIVE_CODE_MAP[code]) return NATIVE_CODE_MAP[code] as ProcessingErrorCode;
  const message = e instanceof Error ? e.message : String(e);
  if (/ENOSPC|no space|disk full|not enough space/i.test(message)) return 'storage_full';
  if (/out of memory|OutOfMemory|allocation failed/i.test(message)) return 'out_of_memory';
  if (/permission|denied|SecurityException/i.test(message)) return 'permission_denied';
  if (/ENOENT|does not exist|not found/i.test(message)) return 'source_expired';
  return 'unknown';
}
