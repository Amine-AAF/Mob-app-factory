/**
 * Pure dimension calculations for the resizer (fully unit-tested).
 */
export interface Size {
  width: number;
  height: number;
}

export type ResizePreset = 'small' | 'medium' | 'large';

/** Long-edge targets for presets. */
export const PRESET_LONG_EDGE: Record<ResizePreset, number> = { small: 640, medium: 1280, large: 1920 };

export const MAX_OUTPUT_EDGE = 12_000;

export type ResizeRequest =
  | { mode: 'preset'; preset: ResizePreset }
  | { mode: 'percent'; percent: number }
  | { mode: 'custom'; width: number | null; height: number | null; lockAspect: boolean };

export interface ResizePlan extends Size {
  /** True when the requested size was larger than the source and was capped (no upscaling). */
  limitedToOriginal: boolean;
  upscaled: boolean;
  /** Aspect ratio changes by more than 1%. */
  distorted: boolean;
  /** Output keeps less than a quarter of the source pixels. */
  largeReduction: boolean;
  unchanged: boolean;
}

const round = (n: number) => Math.max(1, Math.round(n));

/** Height for a given width keeping the aspect ratio (and vice versa). */
export function heightForWidth(source: Size, width: number): number {
  return round((width * source.height) / source.width);
}

export function widthForHeight(source: Size, height: number): number {
  return round((height * source.width) / source.height);
}

/** Scales `source` so that it fits inside `box` (never enlarges unless allowUpscale). */
export function fitWithin(source: Size, box: Partial<Size>, allowUpscale = false): Size {
  const scales = [box.width ? box.width / source.width : Infinity, box.height ? box.height / source.height : Infinity];
  let scale = Math.min(...scales);
  if (!Number.isFinite(scale)) scale = 1;
  if (!allowUpscale) scale = Math.min(1, scale);
  return { width: round(source.width * scale), height: round(source.height * scale) };
}

/** Bounds a size to a pixel budget, keeping aspect ratio. */
export function fitPixelBudget(source: Size, maxPixels: number): Size {
  const pixels = source.width * source.height;
  if (pixels <= maxPixels) return { ...source };
  const scale = Math.sqrt(maxPixels / pixels);
  return { width: Math.max(1, Math.floor(source.width * scale)), height: Math.max(1, Math.floor(source.height * scale)) };
}

function requestedSize(source: Size, request: ResizeRequest, allowUpscale: boolean): Size {
  if (request.mode === 'preset') {
    const edge = PRESET_LONG_EDGE[request.preset];
    return source.width >= source.height ? { width: edge, height: heightForWidth(source, edge) } : { width: widthForHeight(source, edge), height: edge };
  }
  if (request.mode === 'percent') {
    const p = Math.max(1, Math.min(allowUpscale ? 400 : 100, request.percent)) / 100;
    return { width: round(source.width * p), height: round(source.height * p) };
  }
  const { width, height, lockAspect } = request;
  if (width && height && !lockAspect) return { width: round(width), height: round(height) };
  if (width) return { width: round(width), height: heightForWidth(source, width) };
  if (height) return { width: widthForHeight(source, height), height: round(height) };
  return { ...source };
}

export function planResize(source: Size, request: ResizeRequest, allowUpscale = false): ResizePlan {
  let target = requestedSize(source, request, allowUpscale);

  let limitedToOriginal = false;
  if (!allowUpscale && (target.width > source.width || target.height > source.height)) {
    // Keep the requested shape, scaled down until it fits inside the original.
    const scale = Math.min(source.width / target.width, source.height / target.height);
    target = { width: Math.min(source.width, round(target.width * scale)), height: Math.min(source.height, round(target.height * scale)) };
    limitedToOriginal = true;
  }
  target = { width: Math.min(target.width, MAX_OUTPUT_EDGE), height: Math.min(target.height, MAX_OUTPUT_EDGE) };

  const srcRatio = source.width / source.height;
  const outRatio = target.width / target.height;
  return {
    ...target,
    limitedToOriginal,
    upscaled: target.width > source.width || target.height > source.height,
    distorted: Math.abs(outRatio - srcRatio) / srcRatio > 0.01,
    largeReduction: (target.width * target.height) / (source.width * source.height) < 0.25,
    unchanged: target.width === source.width && target.height === source.height,
  };
}
