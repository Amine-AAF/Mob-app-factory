import type { BrandPalette } from '@factory/design-system';

import manifest from '../../app.manifest.json';

export const brand: BrandPalette = { primary: manifest.brand.primary, accent: manifest.brand.accent };
export const appManifest = manifest;

/**
 * Public URLs are injected at build time (no invented domains in the code).
 * Required for production: see factory/documentation/release-checklist.md.
 */
export const links = {
  privacyPolicy: process.env.EXPO_PUBLIC_PRIVACY_URL || null,
  terms: process.env.EXPO_PUBLIC_TERMS_URL || null,
  manageSubscriptions: 'https://play.google.com/store/account/subscriptions',
};
