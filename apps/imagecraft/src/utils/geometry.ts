import type { Geometry, NormRect, PixelRect, QuarterTurns, Size } from '@/types/image';

/**
 * Pure geometry used by crop, rotate, resize and social presets. Everything here is
 * unit-tested: the native renderer only executes what these functions computed.
 */

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export function rotatedSize(size: Size, rotation: QuarterTurns): Size {
  return rotation % 2 === 1 ? { width: size.height, height: size.width } : { ...size };
}

export function normalizeTurns(n: number): QuarterTurns {
  return (((Math.round(n) % 4) + 4) % 4) as QuarterTurns;
}

/** Pixel size of the picture once rotation, flips and crop are applied. */
export function geometrySize(source: Size, geometry: Geometry): Size {
  const r = rotatedSize(source, geometry.rotation);
  const c = geometry.crop ?? FULL_RECT;
  return { width: Math.max(1, Math.round(r.width * c.width)), height: Math.max(1, Math.round(r.height * c.height)) };
}

export const FULL_RECT: NormRect = { x: 0, y: 0, width: 1, height: 1 };

export function isFullRect(r: NormRect | null): boolean {
  if (!r) return true;
  const e = 1e-4;
  return Math.abs(r.x) < e && Math.abs(r.y) < e && Math.abs(r.width - 1) < e && Math.abs(r.height - 1) < e;
}

/** Keeps a normalised rect inside [0,1] with a minimum size. */
export function clampRect(r: NormRect, min = 0.05): NormRect {
  const width = clamp(r.width, min, 1);
  const height = clamp(r.height, min, 1);
  return { x: clamp(r.x, 0, 1 - width), y: clamp(r.y, 0, 1 - height), width, height };
}

/**
 * Largest centred crop of the given pixel aspect ratio (width / height) inside an image.
 * Returns a normalised rect.
 */
export function centeredCropForAspect(image: Size, aspect: number): NormRect {
  const imageAspect = image.width / image.height;
  if (Math.abs(imageAspect - aspect) < 1e-6) return { ...FULL_RECT };
  if (imageAspect > aspect) {
    const width = aspect / imageAspect;
    return { x: (1 - width) / 2, y: 0, width, height: 1 };
  }
  const height = imageAspect / aspect;
  return { x: 0, y: (1 - height) / 2, width: 1, height };
}

export type CropHandle = 'move' | 'tl' | 'tr' | 'bl' | 'br';

/**
 * Applies a drag (normalised deltas) on a crop handle. With an aspect ratio (pixel ratio
 * width/height of the crop), corners keep it; `imageAspect` converts it to normalised units.
 */
export function dragCrop(rect: NormRect, handle: CropHandle, dx: number, dy: number, aspect: number | null, imageAspect: number, min = 0.08): NormRect {
  if (handle === 'move') {
    return { ...rect, x: clamp(rect.x + dx, 0, 1 - rect.width), y: clamp(rect.y + dy, 0, 1 - rect.height) };
  }
  const left = handle === 'tl' || handle === 'bl';
  const top = handle === 'tl' || handle === 'tr';
  // Fixed corner (opposite to the dragged one).
  const fx = left ? rect.x + rect.width : rect.x;
  const fy = top ? rect.y + rect.height : rect.y;
  let width = clamp(left ? rect.width - dx : rect.width + dx, min, left ? fx : 1 - fx);
  let height = clamp(top ? rect.height - dy : rect.height + dy, min, top ? fy : 1 - fy);
  if (aspect) {
    // Normalised aspect: (w * imgW) / (h * imgH) = aspect  =>  w / h = aspect / imageAspect
    const k = aspect / imageAspect;
    const maxW = left ? fx : 1 - fx;
    const maxH = top ? fy : 1 - fy;
    // Follow the dominant axis of the drag, then fit inside the available space.
    if (Math.abs(dx) >= Math.abs(dy)) height = width / k;
    else width = height * k;
    const scale = Math.min(1, maxW / width, maxH / height);
    width *= scale;
    height *= scale;
    if (width < min || height < min) return rect;
  }
  return { x: left ? fx - width : fx, y: top ? fy - height : fy, width, height };
}

/** Bounds a size by its longest edge and total pixel count, keeping the aspect ratio. */
export function fitWithin(size: Size, maxEdge: number, maxPixels: number): Size {
  let scale = Math.min(1, maxEdge / Math.max(size.width, size.height));
  const pixels = size.width * scale * size.height * scale;
  if (pixels > maxPixels) scale *= Math.sqrt(maxPixels / pixels);
  return { width: Math.max(1, Math.floor(size.width * scale)), height: Math.max(1, Math.floor(size.height * scale)) };
}

export type ResizeRequest =
  | { mode: 'pixels'; width: number | null; height: number | null; keepAspect: boolean }
  | { mode: 'percent'; percent: number }
  | { mode: 'preset'; longEdge: number };

export const MAX_OUTPUT_EDGE = 16384;

/** Output size for a resize request. Never distorts unless the user unlocked the ratio. */
export function resolveResize(base: Size, req: ResizeRequest): Size | null {
  const round = (n: number) => Math.max(1, Math.round(n));
  const aspect = base.width / base.height;
  let out: Size | null = null;
  if (req.mode === 'percent') {
    if (!(req.percent > 0)) return null;
    out = { width: round((base.width * req.percent) / 100), height: round((base.height * req.percent) / 100) };
  } else if (req.mode === 'preset') {
    if (!(req.longEdge > 0)) return null;
    out = aspect >= 1 ? { width: round(req.longEdge), height: round(req.longEdge / aspect) } : { width: round(req.longEdge * aspect), height: round(req.longEdge) };
  } else {
    const w = req.width && req.width > 0 ? req.width : null;
    const h = req.height && req.height > 0 ? req.height : null;
    if (!w && !h) return null;
    if (req.keepAspect || !w || !h) {
      out = w ? { width: round(w), height: round(w / aspect) } : { width: round((h as number) * aspect), height: round(h as number) };
    } else out = { width: round(w), height: round(h) };
  }
  if (out.width > MAX_OUTPUT_EDGE || out.height > MAX_OUTPUT_EDGE) return null;
  return out;
}

export type FitMode = 'cover' | 'contain';

/**
 * Places a picture on a fixed canvas with a UNIFORM scale (never distorted).
 * - cover: fills the canvas (overflow is cropped), contain: fits inside (bars use the background colour).
 * - zoom >= 1 multiplies the base scale; offset (-1..1 per axis) pans within the allowed range.
 */
export function placeOnCanvas(image: Size, canvas: Size, mode: FitMode, zoom = 1, offset = { x: 0, y: 0 }): PixelRect {
  const base = mode === 'cover' ? Math.max(canvas.width / image.width, canvas.height / image.height) : Math.min(canvas.width / image.width, canvas.height / image.height);
  const scale = base * Math.max(1, zoom);
  const width = image.width * scale;
  const height = image.height * scale;
  const slackX = (width - canvas.width) / 2;
  const slackY = (height - canvas.height) / 2;
  // When the picture is bigger than the canvas on an axis, offset pans inside the overflow;
  // when smaller (contain), it moves the picture inside the free space.
  const ox = clamp(offset.x, -1, 1) * Math.abs(slackX);
  const oy = clamp(offset.y, -1, 1) * Math.abs(slackY);
  return { x: -slackX + ox, y: -slackY + oy, width, height };
}

/** Converts a pan gesture (pixels on screen) into an offset delta for placeOnCanvas. */
export function panToOffset(dxScreen: number, dyScreen: number, placement: PixelRect, canvas: Size, screenScale: number): { x: number; y: number } {
  const slackX = Math.abs((placement.width - canvas.width) / 2);
  const slackY = Math.abs((placement.height - canvas.height) / 2);
  return { x: slackX > 0.5 ? dxScreen / screenScale / slackX : 0, y: slackY > 0.5 ? dyScreen / screenScale / slackY : 0 };
}

export function aspectLabel(size: Size): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const g = gcd(Math.round(size.width), Math.round(size.height)) || 1;
  const w = Math.round(size.width) / g;
  const h = Math.round(size.height) / g;
  return w <= 50 && h <= 50 ? `${w}:${h}` : (size.width / size.height).toFixed(2);
}
