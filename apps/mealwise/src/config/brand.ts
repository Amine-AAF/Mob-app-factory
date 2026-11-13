import type { BrandPalette } from '@factory/design-system';

import manifest from '../../app.manifest.json';

import type { ArtColor } from '@/domain/types';

export const brand: BrandPalette = { primary: manifest.brand.primary, accent: manifest.brand.accent };

export const links = {
  privacy: process.env.EXPO_PUBLIC_PRIVACY_URL ?? '',
  terms: process.env.EXPO_PUBLIC_TERMS_URL ?? '',
};

/** Food-inspired illustration palette for recipe cards: background per theme. */
export const ART_PALETTE: Record<ArtColor, { light: string; dark: string }> = {
  tomato: { light: '#FDE1D6', dark: '#4A2018' },
  herb: { light: '#DDF1DA', dark: '#1E3A22' },
  saffron: { light: '#FCEFC7', dark: '#463613' },
  berry: { light: '#F6DCEB', dark: '#43203A' },
  ocean: { light: '#D9ECF6', dark: '#16334A' },
  cocoa: { light: '#EEDFD3', dark: '#3C2A20' },
  olive: { light: '#E9EBCF', dark: '#33361A' },
  peach: { light: '#FEE6CF', dark: '#4A2E16' },
};
