import type { OutputFormat, Size } from '@/types/image';

/**
 * Output size ESTIMATION. The real size depends on image content, so the UI always labels
 * these numbers as estimates (a range), and shows the exact size only after processing.
 */
export interface SizeEstimate {
  bytes: number;
  low: number;
  high: number;
  /** 'heuristic' (bits-per-pixel model) or 'sampled' (extrapolated from a real proxy encode). */
  method: 'heuristic' | 'sampled';
}

/** Typical bits per pixel of photographic content, by format and quality (1..100). */
export function bitsPerPixel(format: OutputFormat, quality: number, hasAlpha = false): number {
  const q = Math.min(100, Math.max(1, quality)) / 100;
  if (format === 'png') return hasAlpha ? 14 : 11;
  const jpeg = 0.25 + 3.0 * q ** 2.5;
  if (format === 'webp') return quality >= 100 ? 9 : jpeg * 0.72;
  return jpeg;
}

const HEADER_BYTES = 600;

export function estimateHeuristic(size: Size, format: OutputFormat, quality: number, hasAlpha = false): SizeEstimate {
  const bytes = Math.round((size.width * size.height * bitsPerPixel(format, quality, hasAlpha)) / 8 + HEADER_BYTES);
  return { bytes, low: Math.round(bytes * 0.6), high: Math.round(bytes * 1.5), method: 'heuristic' };
}

/**
 * Extrapolates from a proxy encode of the same picture at a smaller size. Larger images
 * compress slightly better per pixel, hence the 0.92 exponent.
 */
export function estimateFromSample(target: Size, sample: Size, sampleBytes: number): SizeEstimate {
  const ratio = (target.width * target.height) / Math.max(1, sample.width * sample.height);
  const bytes = Math.round(Math.max(0, sampleBytes - HEADER_BYTES) * ratio ** 0.92 + HEADER_BYTES);
  return { bytes, low: Math.round(bytes * 0.8), high: Math.round(bytes * 1.25), method: 'sampled' };
}

/** Saved fraction (0..1). Negative when the result is larger than the original. */
export function savedRatio(original: number, result: number): number {
  if (original <= 0) return 0;
  return (original - result) / original;
}
