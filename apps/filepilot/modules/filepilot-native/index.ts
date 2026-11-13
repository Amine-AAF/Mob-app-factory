import { requireOptionalNativeModule } from 'expo';

/**
 * JS binding of FilePilot's local native module (android/…/FilePilotNativeModule.kt).
 * `null` when the native code is not part of the binary (Jest, Expo Go, web):
 * callers must degrade gracefully and say the feature is unavailable.
 */
export interface RenderPageOptions {
  inputUri: string;
  pageIndex: number;
  outputUri: string;
  format: 'jpeg' | 'png' | 'webp';
  /** 1..100 */
  quality: number;
  dpi: number;
  maxEdge: number;
  maxPixels: number;
}

export interface FlattenOptions {
  inputUri: string;
  outputUri: string;
  /** 0..1 */
  quality: number;
  background: string;
  maxPixels: number;
}

export interface FilePilotNativeModule {
  getPdfPageCount(uri: string): Promise<number>;
  /** Page size in PDF points. */
  getPdfPageSize(uri: string, pageIndex: number): Promise<{ width: number; height: number }>;
  renderPdfPage(options: RenderPageOptions): Promise<{ width: number; height: number }>;
  flattenImage(options: FlattenOptions): Promise<{ width: number; height: number }>;
}

export const FilePilotNative: FilePilotNativeModule | null = requireOptionalNativeModule<FilePilotNativeModule>('FilePilotNative');

/** Native error codes thrown by the module. */
export const NATIVE_ERRORS = {
  password: 'ERR_PDF_PASSWORD',
  open: 'ERR_PDF_OPEN',
  missing: 'ERR_FILE_MISSING',
  memory: 'ERR_OUT_OF_MEMORY',
  encode: 'ERR_ENCODE',
  decode: 'ERR_DECODE',
  exists: 'ERR_OUTPUT_EXISTS',
  range: 'ERR_PAGE_RANGE',
} as const;
