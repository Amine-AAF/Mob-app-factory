import type { BrandPalette } from '@factory/design-system';

import manifest from '../../app.manifest.json';

/**
 * CalcWise identity: warm ember orange (operators, primary actions) + mint accent
 * (results), on a near-black warm ink in dark mode. Extra palettes are a Premium
 * personalization; the design-system checks contrast for every palette in tests.
 */
export type PaletteId = 'ember' | 'ocean' | 'forest' | 'grape' | 'graphite';

export const PALETTES: Record<PaletteId, BrandPalette & { premium: boolean }> = {
  ember: { primary: manifest.brand.primary, accent: manifest.brand.accent, premium: false },
  ocean: { primary: '#0369A1', accent: '#F59E0B', premium: true },
  forest: { primary: '#15803D', accent: '#A3E635', premium: true },
  grape: { primary: '#7E22CE', accent: '#F472B6', premium: true },
  graphite: { primary: '#334155', accent: '#38BDF8', premium: true },
};

export const PALETTE_IDS = Object.keys(PALETTES) as PaletteId[];

export const brand: BrandPalette = { primary: manifest.brand.primary, accent: manifest.brand.accent };

/** Public URLs are injected at build time (no invented domains in code). */
export const links = {
  privacyPolicy: process.env.EXPO_PUBLIC_PRIVACY_URL || null,
  terms: process.env.EXPO_PUBLIC_TERMS_URL || null,
  manageSubscriptions: 'https://play.google.com/store/account/subscriptions',
};
