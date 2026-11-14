import type { BrandPalette } from '@factory/design-system';

import manifest from '../../app.manifest.json';

/**
 * FitTrack identity: an energetic ember red-orange with an electric cyan accent,
 * high contrast in both themes (checked in tests against WCAG AA).
 */
export const appManifest = manifest;

export const BRAND: BrandPalette = { primary: manifest.brand.primary, accent: manifest.brand.accent };

/** Public URLs are injected at build time (no invented domains in code). */
export const links = {
  privacyPolicy: process.env.EXPO_PUBLIC_PRIVACY_URL || null,
  terms: process.env.EXPO_PUBLIC_TERMS_URL || null,
  manageSubscriptions: 'https://play.google.com/store/account/subscriptions',
};
