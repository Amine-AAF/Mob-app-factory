import { SAFETY_LIMITS } from '@/config/limits';

import { ProcessingError } from '../files/errors';
import type { FileStore } from '../files/fileStore';
import { detectFormat, extensionOf, isImageFormat, type ImageFormat } from '../files/formats';
import { HEADER_BYTES, readImageHeader, type ImageHeaderInfo } from '../files/imageHeader';
import { fitPixelBudget, type Size } from './resizeMath';

/**
 * Image processing orchestration. Decoding/encoding is delegated to an ImageCodec:
 * - in the app: expo-image-manipulator (Android Bitmap encoders, Glide decoding with
 *   EXIF orientation applied and bounded downsampling), see expoImageCodec.ts;
 * - in tests: a pure-JS JPEG/PNG codec, so outputs are really encoded and decoded.
 *
 * Only one decoded copy of an image exists at a time: each attempt decodes, encodes,
 * writes to disk and releases the bitmap before the next one.
 */
export interface TranscodeOptions {
  format: ImageFormat;
  /** 0..1. Ignored by PNG (lossless). */
  quality: number;
  /** Exact output size. Omit to keep the decoded size. */
  resize?: Size;
  /** Bound applied while decoding (memory protection for very large photos). */
  maxDecode?: Size;
  /** Background composited under transparent pixels (required for JPEG output of images with alpha). */
  flattenBackground?: string;
}

export interface ImageCodec {
  readonly name: string;
  readonly supportsFlatten: boolean;
  /** Decodes `inputUri`, applies options, encodes and writes `destUri`. Returns the output pixel size. */
  transcode(inputUri: string, options: TranscodeOptions, destUri: string): Promise<Size>;
}

export interface ImageSource {
  uri: string;
  name: string;
  size: number;
  header: ImageHeaderInfo;
}

export interface ImageOutput {
  uri: string;
  size: number;
  width: number;
  height: number;
  format: ImageFormat;
  quality: number;
}

export interface ImageJobContext {
  fs: FileStore;
  codec: ImageCodec;
  /** Private temp folder of the running job. */
  workDir: string;
  isCancelled: () => boolean;
  onProgress?: (done: number, total: number) => void;
}

/** Validates a picked image from its real content (not its name) and reads its header. */
export async function inspectImage(fs: FileStore, uri: string, name: string): Promise<ImageSource> {
  const size = await fs.size(uri);
  if (size === null) throw new ProcessingError('file_missing');
  if (size === 0) throw new ProcessingError('corrupted_file');
  if (size > SAFETY_LIMITS.maxImageBytes) throw new ProcessingError('file_too_large');
  const head = await fs.readHead(uri, HEADER_BYTES);
  const format = detectFormat(head);
  if (!isImageFormat(format)) throw new ProcessingError('unsupported_format', format);
  const header = readImageHeader(head);
  if (!header) throw new ProcessingError('corrupted_file');
  if (header.width * header.height > SAFETY_LIMITS.maxImagePixels) throw new ProcessingError('image_too_large');
  return { uri, name, size, header };
}

/** Decode bound for a source: full size unless it exceeds the decode pixel budget. */
export function decodeBound(source: ImageSource): Size | undefined {
  const display = { width: source.header.displayWidth, height: source.header.displayHeight };
  return display.width * display.height > SAFETY_LIMITS.maxDecodePixels ? fitPixelBudget(display, SAFETY_LIMITS.maxDecodePixels) : undefined;
}

export function needsFlatten(source: ImageSource, format: ImageFormat): boolean {
  return format === 'jpeg' && source.header.hasAlpha;
}

let attemptCounter = 0;
function tempUri(ctx: ImageJobContext, format: ImageFormat): string {
  attemptCounter = (attemptCounter + 1) % 1_000_000;
  return ctx.fs.join(ctx.workDir, `img-${Date.now()}-${attemptCounter}.${extensionOf(format)}`);
}

function checkCancelled(ctx: ImageJobContext) {
  if (ctx.isCancelled()) throw new ProcessingError('cancelled');
}

/** One decode -> encode pass, written to a fresh temp file. */
export async function encodeImage(ctx: ImageJobContext, source: ImageSource, options: Omit<TranscodeOptions, 'maxDecode' | 'flattenBackground'>): Promise<ImageOutput> {
  checkCancelled(ctx);
  const flatten = needsFlatten(source, options.format);
  if (flatten && !ctx.codec.supportsFlatten) throw new ProcessingError('transparency_unsupported');
  const dest = tempUri(ctx, options.format);
  const quality = Math.min(1, Math.max(0.01, options.quality));
  const maxDecode = decodeBound(source);
  const out = await ctx.codec.transcode(
    source.uri,
    { ...options, quality, ...(maxDecode ? { maxDecode } : {}), ...(flatten ? { flattenBackground: '#FFFFFF' } : {}) },
    dest,
  );
  const size = await ctx.fs.size(dest);
  if (size === null || size === 0) throw new ProcessingError('write_failed');
  // Verify the encoder produced the requested container (never a renamed file).
  const written = detectFormat(await ctx.fs.readHead(dest, 64));
  if (written !== options.format) {
    await ctx.fs.delete(dest);
    throw new ProcessingError('write_failed', `expected ${options.format}, got ${written}`);
  }
  return { uri: dest, size, width: out.width, height: out.height, format: options.format, quality };
}

export interface CompressOptions {
  format: ImageFormat;
  quality: number;
  /** Optional target size in bytes (JPEG / WebP only). */
  targetBytes?: number;
}

export interface CompressResult extends ImageOutput {
  attempts: number;
  /** Only meaningful with targetBytes. */
  reachedTarget: boolean | null;
  /** Output is not smaller than the original. */
  noGain: boolean;
  /** Dimensions were reduced to reach the target size. */
  downscaled: boolean;
}

const MIN_QUALITY = 0.05;
const MAX_QUALITY = 0.95;
const SEARCH_STEPS = 7;
const DOWNSCALE_STEPS = 4;
export const MAX_COMPRESS_ATTEMPTS = SEARCH_STEPS + 1 + DOWNSCALE_STEPS;

export async function compressImage(ctx: ImageJobContext, source: ImageSource, options: CompressOptions): Promise<CompressResult> {
  const finish = (out: ImageOutput, attempts: number, reachedTarget: boolean | null, downscaled: boolean): CompressResult => ({
    ...out,
    attempts,
    reachedTarget,
    noGain: out.size >= source.size,
    downscaled,
  });

  const lossy = options.format !== 'png';
  if (!options.targetBytes || !lossy) {
    ctx.onProgress?.(0, 1);
    const out = await encodeImage(ctx, source, { format: options.format, quality: options.quality });
    ctx.onProgress?.(1, 1);
    return finish(out, 1, null, false);
  }

  const target = options.targetBytes;
  /**
   * Candidates kept on disk: the best output that fits (highest quality, then largest
   * dimensions) and the smallest output overall (fallback). Everything else is deleted
   * as soon as it is superseded, so temp usage stays at ~2 images.
   */
  const state: { fit: ImageOutput | null; smallest: ImageOutput | null; attempts: number } = { fit: null, smallest: null, attempts: 0 };
  const retain = async (out: ImageOutput) => {
    const previous = [state.fit, state.smallest];
    if (out.size <= target && (!state.fit || out.width * out.height > state.fit.width * state.fit.height || out.quality > state.fit.quality)) state.fit = out;
    if (!state.smallest || out.size < state.smallest.size) state.smallest = out;
    for (const p of [...previous, out]) {
      if (p && p !== state.fit && p !== state.smallest) await ctx.fs.delete(p.uri);
    }
  };
  const attempt = async (quality: number, resize?: Size) => {
    state.attempts++;
    const out = await encodeImage(ctx, source, { format: options.format, quality, ...(resize ? { resize } : {}) });
    ctx.onProgress?.(state.attempts, MAX_COMPRESS_ATTEMPTS);
    await retain(out);
    return out;
  };
  const done = async (chosen: ImageOutput, reached: boolean, downscaled: boolean) => {
    for (const p of [state.fit, state.smallest]) if (p && p !== chosen) await ctx.fs.delete(p.uri);
    return finish(chosen, state.attempts, reached, downscaled);
  };

  // 1. Binary search for the highest quality whose output fits the target.
  let lo = MIN_QUALITY;
  let hi = Math.min(MAX_QUALITY, Math.max(MIN_QUALITY, options.quality));
  const first = await attempt(hi);
  if (first.size <= target) return done(first, true, false);
  for (let i = 1; i < SEARCH_STEPS && hi - lo > 0.01; i++) {
    const q = (lo + hi) / 2;
    const out = await attempt(q);
    if (out.size <= target) lo = q;
    else hi = q;
  }
  if (state.fit) return done(state.fit, true, false);

  // 2. Not reachable by quality alone: minimum quality, then smaller dimensions.
  const atMin = await attempt(MIN_QUALITY);
  if (atMin.size <= target) return done(atMin, true, false);
  let dims = { width: atMin.width, height: atMin.height };
  for (let i = 0; i < DOWNSCALE_STEPS; i++) {
    // Encoded size scales roughly with pixel count: aim for the target, at least -20% per step.
    const ratio = Math.min(0.8, Math.sqrt(target / Math.max(1, state.smallest?.size ?? atMin.size)) * 0.95);
    dims = { width: Math.max(16, Math.round(dims.width * ratio)), height: Math.max(16, Math.round(dims.height * ratio)) };
    const out = await attempt(0.6, dims);
    if (out.size <= target) return done(out, true, true);
  }
  const fallback = state.smallest;
  if (!fallback) throw new ProcessingError('target_unreachable');
  return done(fallback, false, fallback.width < atMin.width);
}

export async function resizeImage(ctx: ImageJobContext, source: ImageSource, options: { size: Size; format: ImageFormat; quality: number }): Promise<ImageOutput> {
  ctx.onProgress?.(0, 1);
  const out = await encodeImage(ctx, source, { format: options.format, quality: options.quality, resize: options.size });
  ctx.onProgress?.(1, 1);
  return out;
}

export async function convertImage(ctx: ImageJobContext, source: ImageSource, options: { format: ImageFormat; quality: number }): Promise<ImageOutput> {
  ctx.onProgress?.(0, 1);
  const out = await encodeImage(ctx, source, { format: options.format, quality: options.quality });
  ctx.onProgress?.(1, 1);
  return out;
}
