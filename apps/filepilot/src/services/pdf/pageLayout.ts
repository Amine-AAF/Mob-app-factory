/**
 * Page geometry for Image -> PDF. Units are PDF points (1/72 inch).
 */
export type PageSize = 'a4' | 'letter' | 'fit';
export type PageOrientation = 'auto' | 'portrait' | 'landscape';
export type PageMargin = 'none' | 'small' | 'medium' | 'large';

export const PAGE_SIZES_PT = {
  a4: { width: 595.28, height: 841.89 },
  letter: { width: 612, height: 792 },
} as const;

export const MARGINS_PT: Record<PageMargin, number> = { none: 0, small: 18, medium: 36, large: 72 };

/** "Fit to image" pages assume 96 px per inch. */
const PX_TO_PT = 72 / 96;
/** PDF implementation limit: 14,400 pt (200 in) per side. */
export const MAX_PAGE_PT = 14_400;

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PageLayout {
  page: { width: number; height: number };
  image: Rect;
}

export function layoutImagePage(
  image: { width: number; height: number },
  options: { size: PageSize; orientation: PageOrientation; margin: PageMargin },
): PageLayout {
  const margin = MARGINS_PT[options.margin];
  if (options.size === 'fit') {
    let w = image.width * PX_TO_PT;
    let h = image.height * PX_TO_PT;
    const scale = Math.min(1, (MAX_PAGE_PT - 2 * margin) / w, (MAX_PAGE_PT - 2 * margin) / h);
    w *= scale;
    h *= scale;
    return { page: { width: w + 2 * margin, height: h + 2 * margin }, image: { x: margin, y: margin, width: w, height: h } };
  }

  const base = PAGE_SIZES_PT[options.size];
  const landscape = options.orientation === 'landscape' || (options.orientation === 'auto' && image.width > image.height);
  const page = landscape ? { width: base.height, height: base.width } : { width: base.width, height: base.height };
  const boxW = Math.max(1, page.width - 2 * margin);
  const boxH = Math.max(1, page.height - 2 * margin);
  // "Contain": the whole image is visible, centred, aspect ratio preserved.
  const scale = Math.min(boxW / image.width, boxH / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  return { page, image: { x: (page.width - width) / 2, y: (page.height - height) / 2, width, height } };
}
