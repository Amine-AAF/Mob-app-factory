import { NEUTRAL_ADJUSTMENTS, type Adjustments } from '@/types/image';

import { clamp } from './geometry';

/**
 * Colour adjustments as a single 4x5 colour matrix (Android ColorMatrix convention:
 * rows R,G,B,A; columns r,g,b,a,offset; channel values and offsets in 0..255).
 *
 * The matrix is computed here (pure, tested) and applied by the native renderer with
 * ColorMatrixColorFilter, for the preview AND the export: both use the exact same numbers.
 */
export type ColorMatrix = number[];

export const IDENTITY: ColorMatrix = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0];

/** Rec. 709 luma weights. */
const LR = 0.2126;
const LG = 0.7152;
const LB = 0.0722;

/** result = a ∘ b (apply b first, then a). Both are 4x5 affine matrices. */
export function compose(a: ColorMatrix, b: ColorMatrix): ColorMatrix {
  const out = new Array<number>(20).fill(0);
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 5; col++) {
      let v = 0;
      for (let k = 0; k < 4; k++) v += (a[row * 5 + k] ?? 0) * (b[k * 5 + col] ?? 0);
      if (col === 4) v += a[row * 5 + 4] ?? 0;
      out[row * 5 + col] = v;
    }
  }
  return out;
}

const scale = (r: number, g: number, b: number, offset = 0): ColorMatrix => [r, 0, 0, 0, offset, 0, g, 0, 0, offset, 0, 0, b, 0, offset, 0, 0, 0, 1, 0];

export function saturationMatrix(s: number): ColorMatrix {
  const i = 1 - s;
  return [
    LR * i + s, LG * i, LB * i, 0, 0,
    LR * i, LG * i + s, LB * i, 0, 0,
    LR * i, LG * i, LB * i + s, 0, 0,
    0, 0, 0, 1, 0,
  ];
}

const SEPIA: ColorMatrix = [0.393, 0.769, 0.189, 0, 0, 0.349, 0.686, 0.168, 0, 0, 0.272, 0.534, 0.131, 0, 0, 0, 0, 0, 1, 0];

function lerp(a: ColorMatrix, b: ColorMatrix, t: number): ColorMatrix {
  return a.map((v, i) => v + ((b[i] ?? 0) - v) * t);
}

/** Merges filter preset values with the user's sliders (sum, clamped to each slider's range). */
export function combineAdjustments(preset: Partial<Adjustments>, user: Adjustments): Adjustments {
  const out = { ...NEUTRAL_ADJUSTMENTS };
  for (const key of Object.keys(out) as (keyof Adjustments)[]) {
    const [min, max] = ADJUSTMENT_RANGES[key];
    out[key] = clamp((preset[key] ?? 0) + user[key], min, max);
  }
  return out;
}

export const ADJUSTMENT_RANGES: Record<keyof Adjustments, [number, number]> = {
  brightness: [-100, 100],
  contrast: [-100, 100],
  saturation: [-100, 100],
  exposure: [-100, 100],
  warmth: [-100, 100],
  sharpness: [0, 100],
  blur: [0, 100],
  vignette: [0, 100],
  grayscale: [0, 100],
  sepia: [0, 100],
};

/** Builds the colour matrix of the tonal adjustments, or null if they are all neutral. */
export function buildColorMatrix(a: Adjustments): ColorMatrix | null {
  const steps: ColorMatrix[] = [];
  if (a.exposure) {
    const f = 2 ** (a.exposure / 100);
    steps.push(scale(f, f, f));
  }
  if (a.brightness) steps.push(scale(1, 1, 1, a.brightness * 0.6));
  if (a.contrast) {
    const k = a.contrast >= 0 ? 1 + a.contrast / 100 : 1 + a.contrast / 125;
    steps.push(scale(k, k, k, 128 * (1 - k)));
  }
  if (a.saturation) steps.push(saturationMatrix(1 + a.saturation / 100));
  if (a.warmth) {
    const w = a.warmth / 100;
    steps.push(scale(1 + 0.12 * w, 1 + 0.03 * w, 1 - 0.12 * w));
  }
  if (a.grayscale) steps.push(lerp(IDENTITY, saturationMatrix(0), a.grayscale / 100));
  if (a.sepia) steps.push(lerp(IDENTITY, SEPIA, a.sepia / 100));
  if (steps.length === 0) return null;
  return steps.reduce((acc, m) => compose(m, acc), IDENTITY).map((v) => Math.round(v * 1e5) / 1e5);
}

/** Applies a matrix to one RGBA pixel (0..255), like Android does. Used by tests and estimations. */
export function applyMatrix(m: ColorMatrix, [r, g, b, a]: [number, number, number, number]): [number, number, number, number] {
  const ch = (row: number) => clamp(Math.round((m[row * 5] ?? 0) * r + (m[row * 5 + 1] ?? 0) * g + (m[row * 5 + 2] ?? 0) * b + (m[row * 5 + 3] ?? 0) * a + (m[row * 5 + 4] ?? 0)), 0, 255);
  return [ch(0), ch(1), ch(2), ch(3)];
}

export function isNeutral(a: Adjustments): boolean {
  return (Object.keys(a) as (keyof Adjustments)[]).every((k) => a[k] === 0);
}
