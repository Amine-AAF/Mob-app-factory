import type { BrandPalette } from '@factory/design-system';
import { Platform } from 'react-native';

import manifest from '../../app.manifest.json';

/** BookNest identity: warm library tones — oxblood leather, aged gold, paper. */
export const appManifest = manifest;

/** `library` is free; the others are a Premium personalization. Contrast is checked in tests. */
export const PALETTES = {
  library: { primary: manifest.brand.primary, accent: manifest.brand.accent },
  forest: { primary: '#2E5E4E', accent: '#C9A227' },
  ink: { primary: '#2B4A7A', accent: '#D08C60' },
  plum: { primary: '#6B3A5B', accent: '#D4A373' },
  sepia: { primary: '#7A5230', accent: '#5E8C7A' },
} as const satisfies Record<string, BrandPalette>;
export type PaletteId = keyof typeof PALETTES;
export const FREE_PALETTE: PaletteId = 'library';

/**
 * Editorial typography without bundling fonts: Android ships Noto Serif as "serif".
 * Titles and quotes use it; body text keeps the platform sans-serif for readability.
 */
export const SERIF = Platform.select({ android: 'serif', ios: 'Georgia', default: 'serif' });

/** Warm paper surfaces layered over the shared theme. */
export const paper = {
  light: { background: '#FBF6EE', surface: '#FFFDF9', surfaceAlt: '#F3EADC', border: '#E7DCCB' },
  dark: { background: '#15100D', surface: '#1F1915', surfaceAlt: '#2A221C', border: '#3A2F27' },
} as const;

/** Spine colors for generated covers (books without a cover image). */
export const SPINE_COLORS = ['#8A3B2E', '#2E5E4E', '#2B4A7A', '#6B3A5B', '#7A5230', '#3F5B6B', '#8C6D1F', '#5B4B8A'] as const;

/** Public URLs are injected at build time (no invented domains in code). */
export const links = {
  privacyPolicy: process.env.EXPO_PUBLIC_PRIVACY_URL || null,
  terms: process.env.EXPO_PUBLIC_TERMS_URL || null,
  manageSubscriptions: 'https://play.google.com/store/account/subscriptions',
};
