import type { BrandPalette } from '@factory/design-system';

import manifest from '../../app.manifest.json';

export const brand: BrandPalette = { primary: manifest.brand.primary, accent: manifest.brand.accent };
export const appManifest = manifest;

/**
 * PlantCare-specific visual tokens layered on top of the shared theme:
 * leaf greens for categories/charts and soft "card" tints. Colours are chosen to keep
 * text contrast ≥ 4.5:1 on their soft backgrounds in both schemes.
 */
export const leaf = {
  light: { deep: '#1F5C3A', moss: '#5B8C51', sage: '#DDEBDD', mint: '#EAF4EC', sand: '#F6EFE4', water: '#2B6CB0', waterSoft: '#E3EEF9' },
  dark: { deep: '#9AD3A8', moss: '#8FBF84', sage: '#1D3326', mint: '#16271D', sand: '#2A241B', water: '#8EC0F2', waterSoft: '#14263A' },
};

/** Public URLs are injected at build time (no invented domains in the code). */
export const links = {
  privacyPolicy: process.env.EXPO_PUBLIC_PRIVACY_URL || null,
  terms: process.env.EXPO_PUBLIC_TERMS_URL || null,
  manageSubscriptions: 'https://play.google.com/store/account/subscriptions',
};
