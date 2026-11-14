import { createMemoryFileStore } from '@/services/files/fileStore';
import { createWorkspace } from '@/services/files/workspace';
import type { ProcessingEnv } from '@/services/image/engine';
import type { CollageRenderInput, ImageRenderer } from '@/services/image/renderer';
import type { OutputFormat, RenderRecipe, RenderResult } from '@/types/image';

/* ------------------------------------------------------------ synthetic file headers */

const be32 = (n: number) => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
const le16 = (n: number) => [n & 255, (n >>> 8) & 255];
const le24 = (n: number) => [n & 255, (n >>> 8) & 255, (n >>> 16) & 255];

/** Minimal PNG: signature + IHDR (colour type 6 = RGBA when alpha). */
export function pngHeader(width: number, height: number, alpha = false): Uint8Array {
  return new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, ...be32(13), 0x49, 0x48, 0x44, 0x52, ...be32(width), ...be32(height), 8, alpha ? 6 : 2, 0, 0, 0, 0, 0, 0, 0]);
}

/** Minimal JPEG: SOI, optional APP1/EXIF orientation, SOF0 with dimensions. */
export function jpegHeader(width: number, height: number, orientation = 1): Uint8Array {
  const exif =
    orientation === 1
      ? []
      : [
          0xff, 0xe1, 0x00, 0x22, 0x45, 0x78, 0x69, 0x66, 0x00, 0x00,
          // TIFF header (big endian) + IFD with one entry: tag 0x0112 = orientation
          0x4d, 0x4d, 0x00, 0x2a, 0x00, 0x00, 0x00, 0x08, 0x00, 0x01, 0x01, 0x12, 0x00, 0x03, 0x00, 0x00, 0x00, 0x01, 0x00, orientation, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        ];
  const sof = [0xff, 0xc0, 0x00, 0x11, 0x08, (height >> 8) & 255, height & 255, (width >> 8) & 255, width & 255, 0x03, 1, 0x22, 0, 2, 0x11, 1, 3, 0x11, 1];
  return new Uint8Array([0xff, 0xd8, ...exif, ...sof, 0xff, 0xda, 0, 0]);
}

/** Minimal WebP (VP8X extended header with optional alpha flag). */
export function webpHeader(width: number, height: number, alpha = false): Uint8Array {
  return new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50, 0x56, 0x50, 0x38, 0x58, 10, 0, 0, 0, alpha ? 0x10 : 0, 0, 0, 0, ...le24(width - 1), ...le24(height - 1)]);
}

export function headerFor(format: OutputFormat, width: number, height: number, alpha = false): Uint8Array {
  return format === 'png' ? pngHeader(width, height, alpha) : format === 'webp' ? webpHeader(width, height, alpha) : jpegHeader(width, height);
}

/** Pads a header to `size` bytes (the parsers only read the first bytes). */
export function padded(header: Uint8Array, size: number): Uint8Array {
  const out = new Uint8Array(Math.max(size, header.length));
  out.set(header);
  return out;
}

export { le16 };

/* ------------------------------------------------------------ fake renderer */

export interface FakeRendererOptions {
  /** Bytes produced for a render (default: proportional to pixels and quality). */
  bytesFor?: (recipe: RenderRecipe) => number;
  failOn?: (recipe: RenderRecipe) => Error | null;
  /** Writes a different container than requested (to test verification). */
  wrongFormat?: boolean;
  delayMs?: number;
}

export function createFakeRenderer(fs: ReturnType<typeof createMemoryFileStore>, opts: FakeRendererOptions = {}): ImageRenderer & { calls: RenderRecipe[]; maxConcurrent: number } {
  let running = 0;
  const calls: RenderRecipe[] = [];
  const state = { maxConcurrent: 0 };
  const cancelled = new Set<string>();
  const bytesFor = opts.bytesFor ?? ((r: RenderRecipe) => {
    const out = r.canvas ? r.canvas.width * r.canvas.height : r.size.width * r.size.height;
    return Math.max(200, Math.round(out * (r.encode.format === 'png' ? 1.5 : (r.encode.quality / 100) * 0.4)));
  });
  return {
    name: 'native',
    capabilities: { adjustments: true, overlays: true, canvas: true, collage: true, gallery: true },
    calls,
    get maxConcurrent() {
      return state.maxConcurrent;
    },
    async render(recipe, ctx) {
      running++;
      state.maxConcurrent = Math.max(state.maxConcurrent, running);
      calls.push(recipe);
      try {
        if (opts.delayMs) await new Promise((r) => setTimeout(r, opts.delayMs));
        if (cancelled.has(ctx.jobId)) throw Object.assign(new Error('cancelled'), { code: 'ERR_CANCELLED' });
        const err = opts.failOn?.(recipe);
        if (err) throw err;
        const out = recipe.canvas ? { width: recipe.canvas.width, height: recipe.canvas.height } : recipe.size;
        const format: OutputFormat = opts.wrongFormat ? (recipe.encode.format === 'png' ? 'jpeg' : 'png') : recipe.encode.format;
        const bytes = bytesFor(recipe);
        await fs.writeBytes(recipe.outputUri, padded(headerFor(format, out.width, out.height), bytes));
        return { uri: recipe.outputUri, width: out.width, height: out.height, bytes, format: recipe.encode.format, lossless: recipe.encode.format === 'png' } satisfies RenderResult;
      } finally {
        running--;
      }
    },
    async renderCollage(input: CollageRenderInput) {
      await fs.writeBytes(input.outputUri, padded(headerFor(input.format, input.size.width, input.size.height), 5000));
      return { uri: input.outputUri, width: input.size.width, height: input.size.height, bytes: 5000, format: input.format, lossless: input.format === 'png' };
    },
    async saveToGallery() {
      return 'content://media/external/images/media/1';
    },
    cancel(jobId) {
      cancelled.add(jobId);
    },
  };
}

export function createTestEnv(opts: FakeRendererOptions & { quotaBytes?: number } = {}) {
  const fs = createMemoryFileStore({ quotaBytes: opts.quotaBytes });
  const renderer = createFakeRenderer(fs, opts);
  const env: ProcessingEnv = { fs, workspace: createWorkspace(fs), renderer };
  return { env, fs, renderer };
}

/** Writes a picked-file temp copy into the fake picker cache folder. */
export async function putPicked(fs: ReturnType<typeof createMemoryFileStore>, name: string, bytes: Uint8Array): Promise<string> {
  const uri = fs.join(fs.join(fs.cacheRoot, 'ImagePicker'), name);
  await fs.writeBytes(uri, bytes);
  return uri;
}
