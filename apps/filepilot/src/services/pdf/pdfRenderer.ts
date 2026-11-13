import { FilePilotNative, NATIVE_ERRORS } from 'filepilot-native';

import { SAFETY_LIMITS } from '@/config/limits';

import { ProcessingError } from '../files/errors';
import type { ImageFormat } from '../files/formats';

/**
 * PDF -> image rendering contract. The app uses Android's PdfRenderer through
 * FilePilot's native module; there is no JavaScript fallback (rendering PDFs in JS
 * on a phone is too slow and memory-hungry to ship), so the feature is reported as
 * unavailable when the native module is missing.
 */
export interface PdfPageRenderer {
  readonly available: boolean;
  pageCount(uri: string): Promise<number>;
  renderPage(options: { inputUri: string; pageIndex: number; outputUri: string; format: ImageFormat; quality: number; dpi: number }): Promise<{ width: number; height: number }>;
}

function mapNativeError(e: unknown): ProcessingError {
  const code = (e as { code?: string } | null)?.code;
  if (code === NATIVE_ERRORS.password) return new ProcessingError('pdf_encrypted');
  if (code === NATIVE_ERRORS.open) return new ProcessingError('pdf_invalid');
  if (code === NATIVE_ERRORS.missing) return new ProcessingError('file_missing');
  if (code === NATIVE_ERRORS.memory) return new ProcessingError('image_too_large');
  if (code === NATIVE_ERRORS.range) return new ProcessingError('invalid_page_range');
  return new ProcessingError('unknown', code);
}

export function createNativePdfRenderer(): PdfPageRenderer {
  const native = FilePilotNative;
  return {
    available: native !== null,
    async pageCount(uri) {
      if (!native) throw new ProcessingError('native_unavailable');
      try {
        return await native.getPdfPageCount(uri);
      } catch (e) {
        throw mapNativeError(e);
      }
    },
    async renderPage(o) {
      if (!native) throw new ProcessingError('native_unavailable');
      try {
        return await native.renderPdfPage({
          inputUri: o.inputUri,
          pageIndex: o.pageIndex,
          outputUri: o.outputUri,
          format: o.format,
          quality: Math.round(Math.min(1, Math.max(0.01, o.quality)) * 100),
          dpi: o.dpi,
          maxEdge: SAFETY_LIMITS.maxRenderEdge,
          maxPixels: SAFETY_LIMITS.maxRenderPixels,
        });
      } catch (e) {
        throw mapNativeError(e);
      }
    },
  };
}
