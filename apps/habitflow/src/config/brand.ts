import type { BrandPalette } from '@factory/design-system';

import manifest from '../../app.manifest.json';

/** HabitFlow identity: calm indigo with a fresh mint accent. */
export const appManifest = manifest;

/** `flow` is free; the others are a Premium personalization. Contrast is checked in tests. */
export const PALETTES = {
  flow: { primary: manifest.brand.primary, accent: manifest.brand.accent },
  ocean: { primary: '#1F6FB2', accent: '#F2A541' },
  forest: { primary: '#2F7D4F', accent: '#E7B23C' },
  sunset: { primary: '#C2410C', accent: '#5EC2B7' },
  berry: { primary: '#A23B72', accent: '#4CC9F0' },
} as const satisfies Record<string, BrandPalette>;
export type PaletteId = keyof typeof PALETTES;
export const FREE_PALETTE: PaletteId = 'flow';

/** Public URLs are injected at build time (no invented domains in code). */
export const links = {
  privacyPolicy: process.env.EXPO_PUBLIC_PRIVACY_URL || null,
  terms: process.env.EXPO_PUBLIC_TERMS_URL || null,
  manageSubscriptions: 'https://play.google.com/store/account/subscriptions',
};
