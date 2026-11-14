import { findFilter } from '@/constants/filterPresets';
import { SAFETY_LIMITS } from '@/constants/limits';
import type { EditState, EncodeOptions, PixelRect, RenderRecipe, Size, SourceImage, TextLayer, Watermark } from '@/types/image';
import { buildColorMatrix, combineAdjustments } from '@/utils/colorMatrix';
import { fitWithin, geometrySize, isFullRect, placeOnCanvas, type FitMode } from '@/utils/geometry';

/**
 * Builds render recipes (pure). The preview recipe is the export recipe scaled down:
 * same geometry, same colour matrix, same relative text/watermark sizes — so what the
 * user sees is what they export.
 */
export interface CanvasRequest {
  size: Size;
  background: string;
  fit: FitMode;
  zoom: number;
  offset: { x: number; y: number };
}

export interface RecipeOptions {
  outputUri: string;
  encode: EncodeOptions;
  /** Picture size after geometry. Defaults to the full-resolution geometry size. */
  size?: Size;
  canvas?: CanvasRequest | null;
  /** Export pixel cap (plan dependent). */
  maxOutputPixels: number;
  maxDecodePixels?: number;
  /** Overrides the edit state's overlays (tools that don't use the editor). */
  texts?: TextLayer[];
  watermark?: Watermark | null;
}

export interface BuiltRecipe {
  recipe: RenderRecipe;
  /** Final output pixel size (canvas or picture). */
  output: Size;
  /** True when the requested size exceeded the plan's cap and was reduced. */
  capped: boolean;
}

export function buildRecipe(source: SourceImage, edit: EditState, opts: RecipeOptions): BuiltRecipe {
  const picture = geometrySize({ width: source.width, height: source.height }, edit.geometry);
  let size = opts.size ?? picture;
  let capped = false;
  let canvas: RenderRecipe['canvas'] = null;
  let output: Size;

  if (opts.canvas) {
    let canvasSize = opts.canvas.size;
    if (canvasSize.width * canvasSize.height > opts.maxOutputPixels) {
      canvasSize = fitWithin(canvasSize, Number.MAX_SAFE_INTEGER, opts.maxOutputPixels);
      capped = true;
    }
    const image = placeOnCanvas(picture, canvasSize, opts.canvas.fit, opts.canvas.zoom, opts.canvas.offset);
    canvas = { width: canvasSize.width, height: canvasSize.height, background: opts.canvas.background, image };
    size = { width: Math.max(1, Math.round(image.width)), height: Math.max(1, Math.round(image.height)) };
    output = canvasSize;
  } else {
    if (size.width * size.height > opts.maxOutputPixels) {
      size = fitWithin(size, Number.MAX_SAFE_INTEGER, opts.maxOutputPixels);
      capped = true;
    }
    output = size;
  }

  const adjustments = combineAdjustments(findFilter(edit.filterId).values, edit.adjustments);
  const recipe: RenderRecipe = {
    inputUri: source.uri,
    outputUri: opts.outputUri,
    geometry: { ...edit.geometry, crop: isFullRect(edit.geometry.crop) ? null : edit.geometry.crop },
    size,
    colorMatrix: buildColorMatrix(adjustments),
    sharpness: adjustments.sharpness,
    blur: adjustments.blur,
    vignette: adjustments.vignette,
    canvas,
    texts: (opts.texts ?? edit.texts).filter((t) => t.text.trim().length > 0),
    watermark: opts.watermark !== undefined ? opts.watermark : edit.watermark,
    encode: { ...opts.encode, quality: Math.round(Math.min(100, Math.max(1, opts.encode.quality))) },
    maxDecodePixels: opts.maxDecodePixels ?? SAFETY_LIMITS.maxDecodePixels,
  };
  return { recipe, output, capped };
}

const scaleRect = (r: PixelRect, k: number): PixelRect => ({ x: r.x * k, y: r.y * k, width: r.width * k, height: r.height * k });

/**
 * Same recipe at a smaller pixel budget (preview / size-estimation proxy).
 * Everything that is relative (crop, text, watermark, blur) is unchanged.
 */
export function scaleRecipe(recipe: RenderRecipe, maxEdge: number, maxPixels: number, outputUri: string, encode?: EncodeOptions): RenderRecipe {
  const out = recipe.canvas ? { width: recipe.canvas.width, height: recipe.canvas.height } : recipe.size;
  const fitted = fitWithin(out, maxEdge, maxPixels);
  const k = fitted.width / out.width;
  const decode = Math.min(recipe.maxDecodePixels, Math.max(maxPixels * 4, 4_000_000));
  if (recipe.canvas) {
    return {
      ...recipe,
      outputUri,
      size: { width: Math.max(1, Math.round(recipe.size.width * k)), height: Math.max(1, Math.round(recipe.size.height * k)) },
      canvas: { ...recipe.canvas, width: fitted.width, height: fitted.height, image: scaleRect(recipe.canvas.image, k) },
      encode: encode ?? recipe.encode,
      maxDecodePixels: decode,
    };
  }
  return { ...recipe, outputUri, size: fitted, encode: encode ?? recipe.encode, maxDecodePixels: decode };
}

/** Preview encoding: fast, and keeps transparency visible when the export keeps it. */
export function previewEncode(recipe: RenderRecipe, sourceHasAlpha: boolean): EncodeOptions {
  const transparent = sourceHasAlpha && !recipe.canvas && recipe.encode.format !== 'jpeg';
  return { format: transparent ? 'png' : 'jpeg', quality: 85, flattenBackground: recipe.encode.flattenBackground };
}
