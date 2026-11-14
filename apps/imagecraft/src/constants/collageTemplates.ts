import type { NormRect, PixelRect, Size } from '@/types/image';

/**
 * Original collage layouts. Cells are normalised rectangles on the unit square; spacing
 * and canvas size are applied at render time (collageCells), so one template works for
 * every output size and gap setting.
 */
export interface CollageTemplate {
  /** Also the i18n key suffix: collage.templates.<id> */
  id: string;
  /** Canvas aspect ratio (width / height). */
  aspect: number;
  cells: NormRect[];
  premium: boolean;
}

const r = (x: number, y: number, width: number, height: number): NormRect => ({ x, y, width, height });

/** Uniform grid helper. */
function grid(cols: number, rows: number): NormRect[] {
  const out: NormRect[] = [];
  for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) out.push(r(col / cols, row / rows, 1 / cols, 1 / rows));
  return out;
}

const T = 1 / 3;

export const COLLAGE_TEMPLATES: readonly CollageTemplate[] = [
  { id: 'duo_columns', aspect: 1, premium: false, cells: grid(2, 1) },
  { id: 'duo_rows', aspect: 1, premium: false, cells: grid(1, 2) },
  { id: 'trio_columns', aspect: 1, premium: false, cells: grid(3, 1) },
  { id: 'trio_rows', aspect: 4 / 5, premium: false, cells: grid(1, 3) },
  { id: 'trio_feature_left', aspect: 1, premium: false, cells: [r(0, 0, 0.5, 1), r(0.5, 0, 0.5, 0.5), r(0.5, 0.5, 0.5, 0.5)] },
  { id: 'quad_grid', aspect: 1, premium: false, cells: grid(2, 2) },
  { id: 'trio_feature_top', aspect: 4 / 5, premium: true, cells: [r(0, 0, 1, 0.6), r(0, 0.6, 0.5, 0.4), r(0.5, 0.6, 0.5, 0.4)] },
  { id: 'quad_feature_left', aspect: 1, premium: true, cells: [r(0, 0, 2 * T, 1), r(2 * T, 0, T, T), r(2 * T, T, T, T), r(2 * T, 2 * T, T, T)] },
  { id: 'quad_feature_top', aspect: 4 / 5, premium: true, cells: [r(0, 0, 1, 0.6), r(0, 0.6, T, 0.4), r(T, 0.6, T, 0.4), r(2 * T, 0.6, T, 0.4)] },
  { id: 'quad_strip', aspect: 9 / 16, premium: true, cells: grid(1, 4) },
  { id: 'quad_portrait', aspect: 4 / 5, premium: true, cells: grid(2, 2) },
  { id: 'penta_split', aspect: 1, premium: true, cells: [r(0, 0, 0.5, 0.5), r(0.5, 0, 0.5, 0.5), r(0, 0.5, T, 0.5), r(T, 0.5, T, 0.5), r(2 * T, 0.5, T, 0.5)] },
  { id: 'penta_feature', aspect: 1, premium: true, cells: [r(0, 0, 0.6, 1), r(0.6, 0, 0.2, 0.5), r(0.8, 0, 0.2, 0.5), r(0.6, 0.5, 0.2, 0.5), r(0.8, 0.5, 0.2, 0.5)] },
  { id: 'penta_mosaic', aspect: 4 / 5, premium: true, cells: [r(0, 0, T, 0.45), r(T, 0, T, 0.45), r(2 * T, 0, T, 0.45), r(0, 0.45, 0.5, 0.55), r(0.5, 0.45, 0.5, 0.55)] },
  { id: 'hexa_grid', aspect: 3 / 2, premium: true, cells: grid(3, 2) },
  { id: 'hexa_tall', aspect: 2 / 3, premium: true, cells: grid(2, 3) },
  { id: 'story_trio', aspect: 9 / 16, premium: true, cells: [r(0, 0, 1, 0.4), r(0, 0.4, 1, 0.3), r(0, 0.7, 1, 0.3)] },
  { id: 'nine_grid', aspect: 1, premium: true, cells: grid(3, 3) },
];

export function findTemplate(id: string): CollageTemplate {
  return COLLAGE_TEMPLATES.find((t) => t.id === id) ?? (COLLAGE_TEMPLATES[0] as CollageTemplate);
}

/** Canvas size for a template given the output's long edge. */
export function collageCanvas(template: CollageTemplate, longEdge: number): Size {
  return template.aspect >= 1
    ? { width: Math.round(longEdge), height: Math.round(longEdge / template.aspect) }
    : { width: Math.round(longEdge * template.aspect), height: Math.round(longEdge) };
}

/**
 * Pixel rectangles of the cells: an outer margin and inner gaps of `spacing` pixels.
 * Inner edges are shared, so every gap is exactly `spacing` wide.
 */
export function collageCells(template: CollageTemplate, canvas: Size, spacing: number): PixelRect[] {
  const s = Math.max(0, spacing);
  const innerW = canvas.width - s;
  const innerH = canvas.height - s;
  return template.cells.map((c) => ({
    x: s / 2 + c.x * innerW + s / 2,
    y: s / 2 + c.y * innerH + s / 2,
    width: Math.max(1, c.width * innerW - s),
    height: Math.max(1, c.height * innerH - s),
  }));
}
