import type { BrandPalette } from '@factory/design-system';

import manifest from '../../app.manifest.json';

/** HomeCare palette: calm teal (care, trust) + warm amber (home, warmth). */
export const brand: BrandPalette = { primary: manifest.brand.primary, accent: manifest.brand.accent };

/** Category tints used for icons and chart bars (readable on light and dark surfaces). */
export const CATEGORY_TINTS = ['#0F766E', '#B45309', '#2563EB', '#7C3AED', '#BE185D', '#15803D', '#C2410C', '#0369A1', '#6D28D9', '#4D7C0F', '#64748B'] as const;
