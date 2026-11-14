import { ADJUSTMENTS, FILTER_PRESETS, findFilter } from '@/constants/filterPresets';
import { buildRecipe, previewEncode, scaleRecipe } from '@/services/image/recipe';
import { initialEditState, NEUTRAL_ADJUSTMENTS, type SourceImage } from '@/types/image';
import { ADJUSTMENT_RANGES, applyMatrix, buildColorMatrix, combineAdjustments, compose, IDENTITY, isNeutral } from '@/utils/colorMatrix';

const px = (r: number, g: number, b: number): [number, number, number, number] => [r, g, b, 255];

describe('colour matrix', () => {
  it('is null when every slider is neutral (no useless work)', () => {
    expect(buildColorMatrix(NEUTRAL_ADJUSTMENTS)).toBeNull();
    expect(isNeutral(NEUTRAL_ADJUSTMENTS)).toBe(true);
  });

  it('brightness and exposure lighten, negative values darken', () => {
    const lighter = buildColorMatrix({ ...NEUTRAL_ADJUSTMENTS, brightness: 50 }) as number[];
    expect(applyMatrix(lighter, px(100, 100, 100))[0]).toBeGreaterThan(100);
    const darker = buildColorMatrix({ ...NEUTRAL_ADJUSTMENTS, exposure: -100 }) as number[];
    expect(applyMatrix(darker, px(200, 200, 200))[0]).toBe(100);
  });

  it('contrast pivots around mid-grey', () => {
    const m = buildColorMatrix({ ...NEUTRAL_ADJUSTMENTS, contrast: 60 }) as number[];
    expect(applyMatrix(m, px(128, 128, 128))[0]).toBe(128);
    expect(applyMatrix(m, px(200, 200, 200))[0]).toBeGreaterThan(200);
    expect(applyMatrix(m, px(50, 50, 50))[0]).toBeLessThan(50);
  });

  it('grayscale produces neutral greys, sepia warm tones, warmth shifts red/blue', () => {
    const g = buildColorMatrix({ ...NEUTRAL_ADJUSTMENTS, grayscale: 100 }) as number[];
    const [r, gg, b] = applyMatrix(g, px(200, 40, 90));
    expect(Math.abs(r - gg)).toBeLessThanOrEqual(1);
    expect(Math.abs(gg - b)).toBeLessThanOrEqual(1);
    const s = buildColorMatrix({ ...NEUTRAL_ADJUSTMENTS, sepia: 100 }) as number[];
    const [sr, , sb] = applyMatrix(s, px(120, 120, 120));
    expect(sr).toBeGreaterThan(sb);
    const w = buildColorMatrix({ ...NEUTRAL_ADJUSTMENTS, warmth: 100 }) as number[];
    const [wr, , wb] = applyMatrix(w, px(128, 128, 128));
    expect(wr).toBeGreaterThan(128);
    expect(wb).toBeLessThan(128);
  });

  it('never touches alpha and stays finite for every extreme combination', () => {
    const extreme = Object.fromEntries(Object.entries(ADJUSTMENT_RANGES).map(([k, [, max]]) => [k, max])) as unknown as typeof NEUTRAL_ADJUSTMENTS;
    const m = buildColorMatrix(extreme) as number[];
    expect(m).toHaveLength(20);
    expect(m.every(Number.isFinite)).toBe(true);
    expect(applyMatrix(m, [10, 20, 30, 77])[3]).toBe(77);
  });

  it('composes affine matrices like sequential application', () => {
    const a = buildColorMatrix({ ...NEUTRAL_ADJUSTMENTS, brightness: 20 }) as number[];
    const b = buildColorMatrix({ ...NEUTRAL_ADJUSTMENTS, contrast: 30 }) as number[];
    const p = px(90, 140, 210);
    const seq = applyMatrix(a, applyMatrix(b, p));
    const once = applyMatrix(compose(a, b), p);
    once.forEach((v, i) => expect(Math.abs(v - (seq[i] ?? 0))).toBeLessThanOrEqual(1));
    expect(compose(IDENTITY, a)).toEqual(a);
  });

  it('adds preset values to user sliders, clamped to each range', () => {
    const c = combineAdjustments({ saturation: 80, vignette: 90 }, { ...NEUTRAL_ADJUSTMENTS, saturation: 50, vignette: 50 });
    expect(c.saturation).toBe(100);
    expect(c.vignette).toBe(100);
  });
});

describe('filter catalogue', () => {
  it('has unique ids, an Original look and free + Premium looks', () => {
    const ids = FILTER_PRESETS.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(findFilter('does-not-exist').id).toBe('original');
    expect(FILTER_PRESETS.filter((f) => !f.premium).length).toBeGreaterThanOrEqual(4);
    expect(FILTER_PRESETS.some((f) => f.premium)).toBe(true);
  });

  it('keeps every preset value inside the slider ranges', () => {
    for (const f of FILTER_PRESETS) {
      for (const [k, v] of Object.entries(f.values)) {
        const [min, max] = ADJUSTMENT_RANGES[k as keyof typeof ADJUSTMENT_RANGES];
        expect(v).toBeGreaterThanOrEqual(min);
        expect(v).toBeLessThanOrEqual(max);
      }
    }
    expect(ADJUSTMENTS.map((a) => a.key).sort()).toEqual(Object.keys(NEUTRAL_ADJUSTMENTS).sort());
  });
});

describe('preview matches export', () => {
  const source: SourceImage = { uri: 'file:///src.jpg', name: 'a.jpg', bytes: 3_000_000, format: 'jpeg', width: 6000, height: 4000, hasAlpha: false };
  const edit = {
    ...initialEditState(),
    filterId: 'vintage',
    adjustments: { ...NEUTRAL_ADJUSTMENTS, brightness: 15, blur: 10 },
    geometry: { rotation: 1 as const, flipH: true, flipV: false, crop: { x: 0.1, y: 0.2, width: 0.5, height: 0.5 } },
    texts: [{ id: 't', text: 'Hello', x: 0.5, y: 0.8, size: 0.08, color: '#FFFFFF', font: 'serif' as const, bold: true, align: 'center' as const, rotation: 10, opacity: 0.9, shadow: true }],
  };

  it('the export recipe really contains the filter, overlays and geometry', () => {
    const { recipe } = buildRecipe(source, edit, { outputUri: 'file:///out.jpg', encode: { format: 'jpeg', quality: 90, flattenBackground: '#FFFFFF' }, maxOutputPixels: 24e6 });
    expect(recipe.colorMatrix).not.toBeNull();
    expect(recipe.vignette).toBeGreaterThan(0); // from the Vintage preset
    expect(recipe.blur).toBe(10);
    expect(recipe.texts).toHaveLength(1);
    expect(recipe.geometry.rotation).toBe(1);
    expect(recipe.size).toEqual({ width: 2000, height: 3000 });
  });

  it('the preview is the same recipe at a smaller size: identical colours, geometry and relative overlays', () => {
    const { recipe } = buildRecipe(source, edit, { outputUri: 'file:///out.jpg', encode: { format: 'jpeg', quality: 90, flattenBackground: '#FFFFFF' }, maxOutputPixels: 24e6 });
    const preview = scaleRecipe(recipe, 1440, 2_100_000, 'file:///p.jpg', previewEncode(recipe, false));
    expect(preview.colorMatrix).toEqual(recipe.colorMatrix);
    expect(preview.geometry).toEqual(recipe.geometry);
    expect(preview.texts).toEqual(recipe.texts);
    expect(preview.blur).toBe(recipe.blur);
    expect(preview.size.width * preview.size.height).toBeLessThanOrEqual(2_100_000);
    expect(preview.size.width / preview.size.height).toBeCloseTo(recipe.size.width / recipe.size.height, 2);
  });

  it('scales a social canvas placement proportionally', () => {
    const { recipe } = buildRecipe(source, initialEditState(), {
      outputUri: '',
      encode: { format: 'jpeg', quality: 90, flattenBackground: '#FFFFFF' },
      canvas: { size: { width: 1080, height: 1920 }, background: '#000000', fit: 'cover', zoom: 1.2, offset: { x: 0.5, y: 0 } },
      maxOutputPixels: 24e6,
    });
    const p = scaleRecipe(recipe, 480, 1e9, '');
    const k = (p.canvas?.width ?? 0) / 1080;
    expect(p.canvas?.image.x).toBeCloseTo((recipe.canvas?.image.x ?? 0) * k, 6);
    expect(p.canvas?.image.width).toBeCloseTo((recipe.canvas?.image.width ?? 0) * k, 6);
  });

  it('caps the export size by plan and reports it', () => {
    const r = buildRecipe(source, initialEditState(), { outputUri: '', encode: { format: 'jpeg', quality: 90, flattenBackground: '#FFFFFF' }, maxOutputPixels: 12e6 });
    expect(r.capped).toBe(true);
    expect(r.output.width * r.output.height).toBeLessThanOrEqual(12e6);
    const free = buildRecipe(source, initialEditState(), { outputUri: '', encode: { format: 'jpeg', quality: 90, flattenBackground: '#FFFFFF' }, maxOutputPixels: 24e6 });
    expect(free.capped).toBe(false);
    expect(free.recipe.geometry.crop).toBeNull();
  });

  it('drops empty text layers and keeps transparency in PNG previews', () => {
    const { recipe } = buildRecipe({ ...source, hasAlpha: true }, { ...edit, texts: [{ ...edit.texts[0]!, text: '   ' }] }, { outputUri: '', encode: { format: 'png', quality: 100, flattenBackground: '#FFFFFF' }, maxOutputPixels: 24e6 });
    expect(recipe.texts).toEqual([]);
    expect(previewEncode(recipe, true).format).toBe('png');
    expect(previewEncode({ ...recipe, encode: { ...recipe.encode, format: 'jpeg' } }, true).format).toBe('jpeg');
  });
});
