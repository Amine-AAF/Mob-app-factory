import { SAFETY_LIMITS } from '@/constants/limits';
import { collageCanvas, collageCells, type CollageTemplate } from '@/constants/collageTemplates';
import type { CollageRenderInput } from '@/services/image/renderer';
import type { OutputFormat, SourceImage } from '@/types/image';
import { placeOnCanvas } from '@/utils/geometry';

export interface CollageCell {
  image: SourceImage | null;
  zoom: number;
  offset: { x: number; y: number };
}

export interface CollageSettings {
  template: CollageTemplate;
  cells: CollageCell[];
  longEdge: number;
  /** Gap in pixels for a 1000 px long edge (scaled with the output). */
  spacing: number;
  /** Corner radius in pixels for a 1000 px long edge. */
  radius: number;
  background: string;
  format: OutputFormat;
  quality: number;
}

export function emptyCells(template: CollageTemplate, previous: CollageCell[] = []): CollageCell[] {
  return template.cells.map((_, i) => previous[i] ?? { image: null, zoom: 1, offset: { x: 0, y: 0 } });
}

/**
 * Builds the native collage spec with the SAME math as the on-screen CollageGrid:
 * cells via collageCells, each picture placed with a uniform "cover" scale (never stretched).
 */
export function buildCollageInput(s: CollageSettings, outputUri: string): CollageRenderInput {
  const canvas = collageCanvas(s.template, s.longEdge);
  const k = Math.max(canvas.width, canvas.height) / 1000;
  const rects = collageCells(s.template, canvas, s.spacing * k);
  return {
    outputUri,
    size: canvas,
    background: s.background,
    placeholder: '#D9D9E3',
    radius: s.radius * k,
    format: s.format,
    quality: s.quality,
    maxDecodePixels: SAFETY_LIMITS.collageCellDecodePixels,
    cells: rects.map((rect, i) => {
      const cell = s.cells[i];
      const img = cell?.image ?? null;
      if (!img || !cell) return { rect, uri: null, image: rect };
      const p = placeOnCanvas({ width: img.width, height: img.height }, { width: rect.width, height: rect.height }, 'cover', cell.zoom, cell.offset);
      return { rect, uri: img.uri, image: { x: rect.x + p.x, y: rect.y + p.y, width: p.width, height: p.height } };
    }),
  };
}

export function filledCount(cells: CollageCell[]): number {
  return cells.filter((c) => c.image).length;
}
