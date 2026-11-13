/**
 * Typed processing errors. `code` maps to a localized message (errors.<code>);
 * messages never contain file names or document content.
 */
export type ProcessingErrorCode =
  | 'cancelled'
  | 'unsupported_format'
  | 'corrupted_file'
  | 'file_too_large'
  | 'image_too_large'
  | 'too_many_files'
  | 'file_missing'
  | 'storage_full'
  | 'write_failed'
  | 'read_failed'
  | 'pdf_encrypted'
  | 'pdf_invalid'
  | 'invalid_page_range'
  | 'native_unavailable'
  | 'quota_exceeded'
  | 'premium_required'
  | 'target_unreachable'
  | 'transparency_unsupported'
  | 'unknown';

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

/** Normalises any thrown value into a ProcessingError code (for UI + anonymous analytics). */
export function toErrorCode(e: unknown): ProcessingErrorCode {
  if (isProcessingError(e)) return e.code;
  const message = e instanceof Error ? e.message : String(e);
  if (/ENOSPC|no space|disk full|not enough space/i.test(message)) return 'storage_full';
  if (/encrypt/i.test(message)) return 'pdf_encrypted';
  if (/out of memory|OutOfMemory|allocation failed/i.test(message)) return 'image_too_large';
  return 'unknown';
}
