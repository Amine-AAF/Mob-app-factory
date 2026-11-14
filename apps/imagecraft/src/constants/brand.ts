import type { BrandPalette } from '@factory/design-system';

import manifest from '../../app.manifest.json';

export const brand: BrandPalette = { primary: manifest.brand.primary, accent: manifest.brand.accent };
