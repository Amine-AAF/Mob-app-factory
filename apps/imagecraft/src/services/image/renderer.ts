import { ImageCraftNative } from 'imagecraft-native';

import type { OutputFormat, PixelRect, RenderRecipe, RenderResult, Size } from '@/types/image';

import { ProcessingError } from '../files/errors';
import type { FileStore } from '../files/fileStore';
import { detectFormat } from '../files/formats';

/**
 * Rendering back-ends.
 * - native: ImageCraft's Kotlin module (full feature set) — development/production builds.
 * - fallback: expo-image-manipulator (rotate, flip, crop, resize, JPEG/PNG/WebP encode).
 *   Used when the native module is absent (Expo Go). Features that need the native
 *   renderer are disabled in the UI and refused here, never silently skipped.
 */
export interface RendererCapabilities {
  adjustments: boolean;
  overlays: boolean;
  canvas: boolean;
  collage: boolean;
  gallery: boolean;
}

export interface CollageCellInput {
  rect: PixelRect;
  uri: string | null;
  image: PixelRect;
}

export interface CollageRenderInput {
  outputUri: string;
  size: Size;
  background: string;
  placeholder: string;
  radius: number;
  cells: CollageCellInput[];
  format: OutputFormat;
  quality: number;
  maxDecodePixels: number;
}

export interface ImageRenderer {
  readonly name: 'native' | 'fallback';
  readonly capabilities: RendererCapabilities;
  render(recipe: RenderRecipe, ctx: { jobId: string; sourceSize: Size }): Promise<RenderResult>;
  renderCollage(input: CollageRenderInput, jobId: string): Promise<RenderResult>;
  saveToGallery(uri: string, displayName: string, mimeType: string): Promise<string>;
  cancel(jobId: string): void;
}

/** Throws when a recipe needs features this renderer does not have. */
export function assertSupported(recipe: RenderRecipe, caps: RendererCapabilities): void {
  const needsAdjust = recipe.colorMatrix !== null || recipe.blur > 0 || recipe.sharpness > 0 || recipe.vignette > 0;
  const needsOverlay = recipe.texts.length > 0 || recipe.watermark !== null;
  if ((needsAdjust && !caps.adjustments) || (needsOverlay && !caps.overlays) || (recipe.canvas && !caps.canvas)) {
    throw new ProcessingError('native_unavailable');
  }
}

export function createNativeRenderer(): ImageRenderer | null {
  const native = ImageCraftNative;
  if (!native) return null;
  return {
    name: 'native',
    capabilities: { adjustments: true, overlays: true, canvas: true, collage: true, gallery: true },
    async render(recipe, ctx) {
      const result = await native.render({ ...recipe, jobId: ctx.jobId });
      return { ...result };
    },
    async renderCollage(input, jobId) {
      return native.renderCollage({
        jobId,
        outputUri: input.outputUri,
        width: input.size.width,
        height: input.size.height,
        background: input.background,
        placeholder: input.placeholder,
        radius: input.radius,
        cells: input.cells.map((c) => ({ ...c.rect, uri: c.uri, image: c.image })),
        encode: { format: input.format, quality: input.quality, flattenBackground: input.background },
        maxDecodePixels: input.maxDecodePixels,
      });
    },
    saveToGallery: (uri, name, mime) => native.saveToGallery(uri, name, mime),
    cancel: (jobId) => native.cancel(jobId),
  };
}

/** Pixel crop rectangle in the rotated space of a source of `sourceSize` (EXIF applied). */
export function cropPixels(sourceSize: Size, recipe: RenderRecipe): PixelRect | null {
  const crop = recipe.geometry.crop;
  if (!crop) return null;
  const turned = recipe.geometry.rotation % 2 === 1 ? { width: sourceSize.height, height: sourceSize.width } : sourceSize;
  const x = Math.round(crop.x * turned.width);
  const y = Math.round(crop.y * turned.height);
  return {
    x,
    y,
    width: Math.max(1, Math.min(turned.width - x, Math.round(crop.width * turned.width))),
    height: Math.max(1, Math.min(turned.height - y, Math.round(crop.height * turned.height))),
  };
}

export function createFallbackRenderer(fs: FileStore): ImageRenderer {
  const caps: RendererCapabilities = { adjustments: false, overlays: false, canvas: false, collage: false, gallery: false };
  return {
    name: 'fallback',
    capabilities: caps,
    async render(recipe, ctx) {
      assertSupported(recipe, caps);
      // Lazy require keeps the module out of unit tests that inject fake renderers.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { ImageManipulator, SaveFormat, FlipType } = require('expo-image-manipulator') as typeof import('expo-image-manipulator');
      const context = ImageManipulator.manipulate(recipe.inputUri);
      if (recipe.geometry.rotation) context.rotate(90 * recipe.geometry.rotation);
      if (recipe.geometry.flipH) context.flip(FlipType.Horizontal);
      if (recipe.geometry.flipV) context.flip(FlipType.Vertical);
      const crop = cropPixels(ctx.sourceSize, recipe);
      if (crop) context.crop({ originX: crop.x, originY: crop.y, width: crop.width, height: crop.height });
      context.resize({ width: recipe.size.width, height: recipe.size.height });
      const image = await context.renderAsync();
      try {
        const format = recipe.encode.format;
        const saved = await image.saveAsync({ format: format === 'png' ? SaveFormat.PNG : format === 'webp' ? SaveFormat.WEBP : SaveFormat.JPEG, compress: recipe.encode.quality / 100 });
        await fs.move(saved.uri, recipe.outputUri);
        const bytes = (await fs.size(recipe.outputUri)) ?? 0;
        if (bytes === 0 || detectFormat(await fs.readHead(recipe.outputUri, 32)) !== format) {
          await fs.delete(recipe.outputUri);
          throw new ProcessingError('write_failed');
        }
        return { uri: recipe.outputUri, width: saved.width, height: saved.height, bytes, format, lossless: format === 'png' };
      } finally {
        image.release();
        context.release();
      }
    },
    async renderCollage() {
      throw new ProcessingError('native_unavailable');
    },
    async saveToGallery() {
      throw new ProcessingError('gallery_unsupported');
    },
    cancel() {
      // The manipulator cannot be interrupted; jobs check their cancel flag between files.
    },
  };
}
