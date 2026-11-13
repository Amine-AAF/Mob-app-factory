import type { ColorScheme, IconName } from '@factory/design-system';

import type { Category, GlyphColor, Shape } from '@/engine';

/**
 * Logic Quest's own visual layer on top of the factory theme.
 * Glyph colors are derived from the Okabe-Ito color-blind-safe palette and
 * tuned per scheme for ≥ 3:1 contrast against the board surface (tested).
 * Color is never the only cue: every glyph also has a spoken description.
 */
export const GLYPH_COLORS: Record<ColorScheme, Record<GlyphColor, string>> = {
  light: { blue: '#0067A5', orange: '#B35900', green: '#00785A', purple: '#A64D8C', red: '#C2410C' },
  dark: { blue: '#56B4E9', orange: '#E69F00', green: '#2FBF8F', purple: '#E08EC3', red: '#FF8A5C' },
};

export const SHAPE_ICONS: Record<Shape, { solid: IconName; outline: IconName }> = {
  circle: { solid: 'ellipse', outline: 'ellipse-outline' },
  square: { solid: 'square', outline: 'square-outline' },
  triangle: { solid: 'triangle', outline: 'triangle-outline' },
  diamond: { solid: 'diamond', outline: 'diamond-outline' },
  star: { solid: 'star', outline: 'star-outline' },
  heart: { solid: 'heart', outline: 'heart-outline' },
  arrow: { solid: 'arrow-up', outline: 'arrow-up' },
};

export const CATEGORY_META: Record<Category, { icon: IconName; light: string; dark: string }> = {
  sequence: { icon: 'calculator', light: '#0F766E', dark: '#5EEAD4' },
  pattern: { icon: 'shapes', light: '#7C3AED', dark: '#C4B5FD' },
  deduction: { icon: 'git-network', light: '#B45309', dark: '#FCD34D' },
  memory: { icon: 'albums', light: '#1D4ED8', dark: '#93C5FD' },
};

export const categoryColor = (c: Category, scheme: ColorScheme) => CATEGORY_META[c][scheme];

/** Board surface used under glyphs (contrast reference). */
export const BOARD_SURFACE: Record<ColorScheme, string> = { light: '#FFFFFF', dark: '#121726' };
