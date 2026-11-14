import { SOCIAL_PRESETS } from '@/constants/socialPresets';
import { INITIAL_GEOMETRY } from '@/types/image';
import {
  aspectLabel,
  centeredCropForAspect,
  clampRect,
  dragCrop,
  fitWithin,
  geometrySize,
  isFullRect,
  normalizeTurns,
  panToOffset,
  placeOnCanvas,
  resolveResize,
  rotatedSize,
} from '@/utils/geometry';
import { canRedo, canUndo, createHistory, push, redo, undo } from '@/utils/history';

describe('rotation & crop geometry', () => {
  it('swaps axes on quarter turns only', () => {
    expect(rotatedSize({ width: 4000, height: 3000 }, 1)).toEqual({ width: 3000, height: 4000 });
    expect(rotatedSize({ width: 4000, height: 3000 }, 2)).toEqual({ width: 4000, height: 3000 });
    expect(normalizeTurns(-1)).toBe(3);
    expect(normalizeTurns(5)).toBe(1);
  });

  it('computes the output size after rotation and crop', () => {
    const g = { ...INITIAL_GEOMETRY, rotation: 1 as const, crop: { x: 0, y: 0, width: 0.5, height: 0.25 } };
    expect(geometrySize({ width: 4000, height: 3000 }, g)).toEqual({ width: 1500, height: 1000 });
  });

  it('centres the largest crop of a given ratio', () => {
    const r = centeredCropForAspect({ width: 4000, height: 3000 }, 1);
    expect(r.width * 4000).toBeCloseTo(r.height * 3000, 5);
    expect(r.x).toBeCloseTo((1 - r.width) / 2, 6);
    expect(isFullRect(centeredCropForAspect({ width: 1600, height: 900 }, 16 / 9))).toBe(true);
  });

  it('keeps a dragged crop inside the image, above a minimum size', () => {
    const r = dragCrop({ x: 0.1, y: 0.1, width: 0.5, height: 0.5 }, 'br', 2, 2, null, 1);
    expect(r.x + r.width).toBeLessThanOrEqual(1 + 1e-9);
    expect(r.y + r.height).toBeLessThanOrEqual(1 + 1e-9);
    const tiny = dragCrop({ x: 0.1, y: 0.1, width: 0.5, height: 0.5 }, 'br', -2, -2, null, 1);
    expect(tiny.width).toBeGreaterThanOrEqual(0.08);
    const moved = dragCrop({ x: 0.1, y: 0.1, width: 0.5, height: 0.5 }, 'move', 5, 5, null, 1);
    expect(moved).toEqual({ x: 0.5, y: 0.5, width: 0.5, height: 0.5 });
  });

  it('keeps the requested pixel ratio when resizing a corner', () => {
    const imageAspect = 4 / 3;
    const r = dragCrop({ x: 0.1, y: 0.1, width: 0.3, height: 0.4 }, 'br', 0.2, 0.05, 1, imageAspect);
    expect((r.width * 4) / (r.height * 3)).toBeCloseTo(1, 5);
    const tl = dragCrop({ x: 0.4, y: 0.4, width: 0.3, height: 0.4 }, 'tl', -0.1, -0.1, 1, imageAspect);
    expect((tl.width * 4) / (tl.height * 3)).toBeCloseTo(1, 5);
    expect(tl.x + tl.width).toBeCloseTo(0.7, 6); // opposite corner fixed
  });

  it('clamps rectangles into the unit square', () => {
    expect(clampRect({ x: 0.9, y: -1, width: 0.5, height: 2 })).toEqual({ x: 0.5, y: 0, width: 0.5, height: 1 });
  });
});

describe('resize maths', () => {
  const base = { width: 4000, height: 3000 };
  it('resizes by percentage, pixels (ratio lock) and preset long edge', () => {
    expect(resolveResize(base, { mode: 'percent', percent: 50 })).toEqual({ width: 2000, height: 1500 });
    expect(resolveResize(base, { mode: 'pixels', width: 1000, height: null, keepAspect: true })).toEqual({ width: 1000, height: 750 });
    expect(resolveResize(base, { mode: 'pixels', width: null, height: 600, keepAspect: true })).toEqual({ width: 800, height: 600 });
    expect(resolveResize(base, { mode: 'pixels', width: 500, height: 500, keepAspect: false })).toEqual({ width: 500, height: 500 });
    expect(resolveResize({ width: 3000, height: 4000 }, { mode: 'preset', longEdge: 1920 })).toEqual({ width: 1440, height: 1920 });
  });

  it('rejects empty or absurd requests', () => {
    expect(resolveResize(base, { mode: 'pixels', width: null, height: null, keepAspect: true })).toBeNull();
    expect(resolveResize(base, { mode: 'percent', percent: 0 })).toBeNull();
    expect(resolveResize(base, { mode: 'percent', percent: 1000 })).toBeNull(); // > 16384 px
  });

  it('bounds very large images by edge and pixel budget without distortion', () => {
    const big = { width: 12000, height: 9000 }; // 108 MP
    const f = fitWithin(big, 100_000, 24_000_000);
    expect(f.width * f.height).toBeLessThanOrEqual(24_000_000);
    expect(f.width / f.height).toBeCloseTo(12000 / 9000, 2);
    expect(fitWithin({ width: 100, height: 50 }, 4096, 1e9)).toEqual({ width: 100, height: 50 });
  });
});

describe('canvas placement (social presets)', () => {
  const photo = { width: 4000, height: 3000 };
  it.each(SOCIAL_PRESETS.map((p) => [p.id, p.size] as const))('%s: never distorts the picture', (_id, canvas) => {
    for (const mode of ['cover', 'contain'] as const) {
      const p = placeOnCanvas(photo, canvas, mode, 1.4, { x: 0.3, y: -0.6 });
      expect(p.width / p.height).toBeCloseTo(photo.width / photo.height, 6);
    }
  });

  it('cover fills the canvas, contain fits inside it', () => {
    const canvas = { width: 1080, height: 1920 };
    const cover = placeOnCanvas(photo, canvas, 'cover');
    expect(cover.x).toBeLessThanOrEqual(0);
    expect(cover.x + cover.width).toBeGreaterThanOrEqual(canvas.width - 1e-6);
    expect(cover.height).toBeCloseTo(canvas.height, 6);
    const contain = placeOnCanvas(photo, canvas, 'contain');
    expect(contain.width).toBeCloseTo(canvas.width, 6);
    expect(contain.y).toBeGreaterThan(0);
  });

  it('pans only inside the overflow (no empty band appears in cover mode)', () => {
    const canvas = { width: 1080, height: 1080 };
    for (const x of [-1, -0.5, 0, 0.5, 1, 3]) {
      const p = placeOnCanvas(photo, canvas, 'cover', 1, { x, y: 0 });
      expect(p.x).toBeLessThanOrEqual(1e-6);
      expect(p.x + p.width).toBeGreaterThanOrEqual(canvas.width - 1e-6);
    }
    const p = placeOnCanvas(photo, canvas, 'cover');
    const d = panToOffset(100, 0, p, canvas, 0.5);
    expect(d.x).toBeGreaterThan(0);
    expect(d.y).toBe(0); // no vertical overflow
  });

  it('labels ratios', () => {
    expect(aspectLabel({ width: 1080, height: 1350 })).toBe('4:5');
    expect(aspectLabel({ width: 1280, height: 720 })).toBe('16:9');
  });
});

describe('undo / redo history', () => {
  it('undoes and redoes, and a new edit clears the redo branch', () => {
    let h = createHistory(0);
    h = push(h, 1, 10);
    h = push(h, 2, 10);
    h = undo(h);
    expect(h.present).toBe(1);
    expect(canRedo(h)).toBe(true);
    h = redo(h);
    expect(h.present).toBe(2);
    h = undo(h);
    h = push(h, 5, 10);
    expect(canRedo(h)).toBe(false);
    expect(h.past).toEqual([0, 1]);
  });

  it('coalesces a slider drag into one step and bounds the depth', () => {
    let h = createHistory(0);
    for (let i = 1; i <= 30; i++) h = push(h, i, 10, 'brightness');
    expect(h.past).toEqual([0]);
    expect(h.present).toBe(30);
    for (let i = 0; i < 30; i++) h = push(h, i, 5);
    expect(h.past.length).toBe(5);
    expect(canUndo(createHistory(1))).toBe(false);
  });
});
