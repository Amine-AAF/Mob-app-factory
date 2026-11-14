/**
 * Core image model shared by the editor, the tools, the batch runner and the native renderer.
 *
 * One idea drives the whole app: every visual operation is described by a serialisable
 * RenderRecipe. The SAME recipe renders the on-screen preview (at a small pixel budget) and
 * the exported file (at full budget), so the export always matches what the user saw.
 */

/** Formats ImageCraft can both decode and encode on Android (verified pipeline). */
export const OUTPUT_FORMATS = ['jpeg', 'png', 'webp'] as const;
export type OutputFormat = (typeof OUTPUT_FORMATS)[number];

export interface Size {
  width: number;
  height: number;
}

/** Normalised rectangle (0..1) relative to the image it applies to. */
export interface NormRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Pixel rectangle. */
export interface PixelRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type QuarterTurns = 0 | 1 | 2 | 3;

/** Geometry edits, applied in this order: quarter-turn rotation (clockwise) -> flips -> crop. */
export interface Geometry {
  rotation: QuarterTurns;
  flipH: boolean;
  flipV: boolean;
  /** Crop in the rotated/flipped image space. null = full image. */
  crop: NormRect | null;
}

/** Tone & colour adjustments. 0 = neutral for every slider. */
export interface Adjustments {
  /** -100..100 */
  brightness: number;
  /** -100..100 */
  contrast: number;
  /** -100..100 */
  saturation: number;
  /** -100..100 (stops scaled: 100 = +1 EV) */
  exposure: number;
  /** -100..100 (negative = cooler, positive = warmer) */
  warmth: number;
  /** 0..100 */
  sharpness: number;
  /** 0..100 */
  blur: number;
  /** 0..100 */
  vignette: number;
  /** 0..100 */
  grayscale: number;
  /** 0..100 */
  sepia: number;
}

export type AdjustmentKey = keyof Adjustments;

export const NEUTRAL_ADJUSTMENTS: Adjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  exposure: 0,
  warmth: 0,
  sharpness: 0,
  blur: 0,
  vignette: 0,
  grayscale: 0,
  sepia: 0,
};

export type TextAlign = 'left' | 'center' | 'right';

/** Built-in Android font families (no font files shipped, no licence to manage). */
export const FONT_FAMILIES = ['sans-serif', 'serif', 'monospace', 'sans-serif-condensed', 'sans-serif-medium', 'casual', 'cursive'] as const;
export type FontFamily = (typeof FONT_FAMILIES)[number];

export interface TextLayer {
  id: string;
  text: string;
  /** Centre of the text block, normalised to the output image. */
  x: number;
  y: number;
  /** Font size as a fraction of the output image width (resolution independent). */
  size: number;
  color: string;
  font: FontFamily;
  bold: boolean;
  align: TextAlign;
  /** Degrees, clockwise. */
  rotation: number;
  /** 0..1 */
  opacity: number;
  shadow: boolean;
}

export type Anchor = 'top-left' | 'top' | 'top-right' | 'left' | 'center' | 'right' | 'bottom-left' | 'bottom' | 'bottom-right';

export interface Watermark {
  kind: 'text' | 'logo';
  text: string;
  /** Private copy of the imported logo (file://, inside the app sandbox). */
  logoUri: string | null;
  anchor: Anchor;
  /** Fraction of the output image width (logo width, or text size). */
  size: number;
  /** 0..1 */
  opacity: number;
  color: string;
  /** Repeat the mark diagonally across the image. */
  tiled: boolean;
}

/** Placement of the picture on a fixed-size canvas (social presets). Uniform scale only. */
export interface CanvasPlacement {
  width: number;
  height: number;
  background: string;
  /** Destination rectangle of the (cropped) picture in canvas pixels. May exceed the canvas (cover). */
  image: PixelRect;
}

export interface EncodeOptions {
  format: OutputFormat;
  /** 1..100. PNG ignores it (always lossless). */
  quality: number;
  /** Background composited under transparent pixels when the format has no alpha (JPEG). */
  flattenBackground: string;
}

/** Complete, serialisable description of one render. */
export interface RenderRecipe {
  inputUri: string;
  outputUri: string;
  geometry: Geometry;
  /** Size of the picture after geometry and before canvas placement. */
  size: Size;
  /** 4x5 row-major colour matrix (20 numbers) or null when neutral. */
  colorMatrix: number[] | null;
  sharpness: number;
  blur: number;
  vignette: number;
  canvas: CanvasPlacement | null;
  texts: TextLayer[];
  watermark: Watermark | null;
  encode: EncodeOptions;
  /** Decode budget protecting memory on very large photos. */
  maxDecodePixels: number;
}

export interface RenderResult {
  uri: string;
  width: number;
  height: number;
  bytes: number;
  format: OutputFormat;
  /** True only when the encoder really produced a lossless file. */
  lossless: boolean;
}

/** Full editable state of a picture in the editor (persisted with projects). */
export interface EditState {
  geometry: Geometry;
  adjustments: Adjustments;
  filterId: string;
  texts: TextLayer[];
  watermark: Watermark | null;
}

export const INITIAL_GEOMETRY: Geometry = { rotation: 0, flipH: false, flipV: false, crop: null };

export function initialEditState(): EditState {
  return { geometry: { ...INITIAL_GEOMETRY }, adjustments: { ...NEUTRAL_ADJUSTMENTS }, filterId: 'original', texts: [], watermark: null };
}

/** A picture imported into ImageCraft: always a private copy inside the app sandbox. */
export interface SourceImage {
  uri: string;
  name: string;
  bytes: number;
  format: OutputFormat;
  /** Display size (EXIF orientation applied). */
  width: number;
  height: number;
  hasAlpha: boolean;
}
