import { SAFETY_LIMITS } from '@/config/limits';

import { ProcessingError } from '../files/errors';
import type { FileStore } from '../files/fileStore';
import { extensionOf, mimeTypeOf, type ImageFormat } from '../files/formats';
import { outputFileName, pageLabel } from '../files/naming';
import { compressImage, convertImage, encodeImage, resizeImage, type CompressResult, type ImageCodec, type ImageJobContext, type ImageSource } from '../image/imageEngine';
import { fitWithin, type Size } from '../image/resizeMath';
import type { PageMargin, PageOrientation, PageSize } from '../pdf/pageLayout';
import type { PdfPageRenderer } from '../pdf/pdfRenderer';
import { extractPages, imagesToPdf, mergePdfs, splitPdf } from '../pdf/pdfEngine';
import type { JobHandle, ProducedFile, RunSpec } from './runner';

/**
 * One builder per tool. Each returns a RunSpec executed by the runner, so every tool
 * gets the same guarantees (temp isolation, cleanup, no overwrite, history status).
 */
export interface ToolEnv {
  fs: FileStore;
  codec: ImageCodec;
  renderer: PdfPageRenderer;
}

export interface PdfSource {
  uri: string;
  name: string;
  size: number;
  pageCount: number;
}

type Spec = Omit<RunSpec, 'onProgress'>;

const imageCtx = (env: ToolEnv, job: JobHandle, onProgress?: (d: number, t: number) => void): ImageJobContext => ({
  fs: env.fs,
  codec: env.codec,
  workDir: job.workDir,
  isCancelled: job.isCancelled,
  ...(onProgress ? { onProgress } : {}),
});

const produced = (uri: string, originalName: string, suffix: string, format: ImageFormat, size?: Size): ProducedFile => ({
  tempUri: uri,
  desiredName: outputFileName(originalName, suffix, extensionOf(format)),
  mimeType: mimeTypeOf(format),
  ...(size ? { width: size.width, height: size.height } : {}),
});

/* ------------------------------------------------------------------ images */

export function compressSpec(env: ToolEnv, sources: ImageSource[], options: { format: ImageFormat; quality: number; targetBytes?: number }): Spec {
  return {
    type: 'image_compress',
    inputs: sources.map((s) => ({ name: s.name, size: s.size })),
    async execute(job) {
      const files: ProducedFile[] = [];
      const results: Pick<CompressResult, 'reachedTarget' | 'noGain' | 'downscaled' | 'quality'>[] = [];
      for (const [i, source] of sources.entries()) {
        // Batch progress = finished images + fraction of the current one.
        const out = await compressImage(imageCtx(env, job, (d, t) => job.progress(i + d / t, sources.length)), source, options);
        files.push(produced(out.uri, source.name, 'compressed', out.format, out));
        results.push({ reachedTarget: out.reachedTarget, noGain: out.noGain, downscaled: out.downscaled, quality: out.quality });
        job.progress(i + 1, sources.length);
      }
      return { files, details: { results } };
    },
  };
}

export function resizeSpec(env: ToolEnv, source: ImageSource, options: { size: Size; format: ImageFormat; quality: number }): Spec {
  return {
    type: 'image_resize',
    inputs: [{ name: source.name, size: source.size }],
    async execute(job) {
      const out = await resizeImage(imageCtx(env, job, job.progress), source, options);
      return { files: [produced(out.uri, source.name, `${out.width}x${out.height}`, out.format, out)] };
    },
  };
}

export function convertSpec(env: ToolEnv, source: ImageSource, options: { format: ImageFormat; quality: number }): Spec {
  return {
    type: 'image_convert',
    inputs: [{ name: source.name, size: source.size }],
    async execute(job) {
      const out = await convertImage(imageCtx(env, job, job.progress), source, options);
      return { files: [produced(out.uri, source.name, '', out.format, out)] };
    },
  };
}

/* ------------------------------------------------------------------ PDF */

async function readPdf(fs: FileStore, source: PdfSource): Promise<Uint8Array> {
  const size = await fs.size(source.uri);
  if (size === null) throw new ProcessingError('file_missing');
  if (size > SAFETY_LIMITS.maxPdfBytes) throw new ProcessingError('file_too_large');
  return fs.readBytes(source.uri);
}

export function mergeSpec(env: ToolEnv, sources: PdfSource[]): Spec {
  return {
    type: 'pdf_merge',
    inputs: sources.map((s) => ({ name: s.name, size: s.size })),
    async execute(job) {
      if (sources.reduce((n, s) => n + s.size, 0) > SAFETY_LIMITS.maxMergeBytes) throw new ProcessingError('file_too_large');
      const { bytes, pageCount } = await mergePdfs(sources.length, (i) => readPdf(env.fs, sources[i] as PdfSource), job.progress, job.isCancelled);
      const uri = env.fs.join(job.workDir, 'merged.pdf');
      await env.fs.writeBytes(uri, bytes);
      return { files: [{ tempUri: uri, desiredName: outputFileName(sources[0]?.name ?? 'document', 'merged', 'pdf'), mimeType: 'application/pdf' }], details: { pageCount } };
    },
  };
}

/** One output document per group of 0-based pages. */
export function splitSpec(env: ToolEnv, source: PdfSource, groups: number[][]): Spec {
  return {
    type: 'pdf_split',
    inputs: [{ name: source.name, size: source.size }],
    async execute(job) {
      const files: ProducedFile[] = [];
      await splitPdf(
        await readPdf(env.fs, source),
        groups,
        async (part, index, pages) => {
          const uri = env.fs.join(job.workDir, `part-${index}.pdf`);
          await env.fs.writeBytes(uri, part);
          const first = (pages[0] ?? 0) + 1;
          const last = (pages[pages.length - 1] ?? 0) + 1;
          const label = first === last ? `p${pageLabel(first, source.pageCount)}` : `p${pageLabel(first, source.pageCount)}-${pageLabel(last, source.pageCount)}`;
          files.push({ tempUri: uri, desiredName: outputFileName(source.name, label, 'pdf'), mimeType: 'application/pdf' });
        },
        job.progress,
        job.isCancelled,
      );
      return { files, details: { parts: groups.length } };
    },
  };
}

/** A single new document containing the selected pages. */
export function extractSpec(env: ToolEnv, source: PdfSource, pages: number[]): Spec {
  return {
    type: 'pdf_extract',
    inputs: [{ name: source.name, size: source.size }],
    async execute(job) {
      job.progress(0, 1);
      const bytes = await extractPages(await readPdf(env.fs, source), pages);
      const uri = env.fs.join(job.workDir, 'extract.pdf');
      await env.fs.writeBytes(uri, bytes);
      job.progress(1, 1);
      return { files: [{ tempUri: uri, desiredName: outputFileName(source.name, 'pages', 'pdf'), mimeType: 'application/pdf' }], details: { pageCount: pages.length } };
    },
  };
}

export type PdfImageQuality = 'standard' | 'high';

export function imageToPdfSpec(env: ToolEnv, sources: ImageSource[], options: { size: PageSize; orientation: PageOrientation; margin: PageMargin; quality: PdfImageQuality }): Spec {
  const maxEdge = SAFETY_LIMITS.pdfImageMaxEdge[options.quality];
  return {
    type: 'image_to_pdf',
    inputs: sources.map((s) => ({ name: s.name, size: s.size })),
    async execute(job) {
      const ctx = imageCtx(env, job);
      const { bytes, pageCount } = await imagesToPdf(
        sources.length,
        async (i) => {
          const source = sources[i] as ImageSource;
          // Normalise every image (orientation applied, bounded size, JPEG/PNG) before embedding:
          // keeps the PDF small and supports WebP inputs, which PDF can't embed directly.
          const display = { width: source.header.displayWidth, height: source.header.displayHeight };
          const size = fitWithin(display, { width: maxEdge, height: maxEdge });
          const format: ImageFormat = source.header.hasAlpha ? 'png' : 'jpeg';
          const out = await encodeImage(ctx, source, { format, quality: options.quality === 'high' ? 0.92 : 0.85, resize: size });
          const data = await env.fs.readBytes(out.uri);
          await env.fs.delete(out.uri);
          return { bytes: data, width: out.width, height: out.height };
        },
        options,
        job.progress,
        job.isCancelled,
      );
      const uri = env.fs.join(job.workDir, 'images.pdf');
      await env.fs.writeBytes(uri, bytes);
      return { files: [{ tempUri: uri, desiredName: outputFileName(sources[0]?.name ?? 'images', 'pdf', 'pdf'), mimeType: 'application/pdf' }], details: { pageCount } };
    },
  };
}

export const RENDER_DPI = { screen: 96, standard: 150, high: 300 } as const;
export type RenderResolution = keyof typeof RENDER_DPI;

export function pdfToImagesSpec(env: ToolEnv, source: PdfSource, pages: number[], options: { format: ImageFormat; quality: number; resolution: RenderResolution }): Spec {
  return {
    type: 'pdf_to_images',
    inputs: [{ name: source.name, size: source.size }],
    async execute(job) {
      if (!env.renderer.available) throw new ProcessingError('native_unavailable');
      const files: ProducedFile[] = [];
      // Progressive: one page at a time, each written to disk before the next is rendered.
      for (const [i, pageIndex] of pages.entries()) {
        if (job.isCancelled()) throw new ProcessingError('cancelled');
        const uri = env.fs.join(job.workDir, `page-${pageIndex}.${extensionOf(options.format)}`);
        const size = await env.renderer.renderPage({ inputUri: source.uri, pageIndex, outputUri: uri, format: options.format, quality: options.quality, dpi: RENDER_DPI[options.resolution] });
        files.push(produced(uri, source.name, `page-${pageLabel(pageIndex + 1, source.pageCount)}`, options.format, size));
        job.progress(i + 1, pages.length);
      }
      return { files, details: { pageCount: pages.length } };
    },
  };
}
