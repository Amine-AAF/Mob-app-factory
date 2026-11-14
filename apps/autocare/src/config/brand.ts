import type { BrandPalette } from '@factory/design-system';

import manifest from '../../app.manifest.json';

/**
 * AutoCare identity: a deep "engineering blue" with a warm amber accent
 * (dashboard warning-light amber), on cool neutral surfaces. Sober, automotive,
 * readable in daylight. Contrast is checked in tests for both schemes.
 */
export const appManifest = manifest;
export const BRAND: BrandPalette = { primary: manifest.brand.primary, accent: manifest.brand.accent };

/** Card colors users can pick for each vehicle (contrast-checked against white text). */
export const VEHICLE_COLORS = ['#1E5AA8', '#0F766E', '#B45309', '#7C3AED', '#BE123C', '#334155', '#15803D', '#0E7490'] as const;

/** Public URLs are injected at build time (no invented domains in code). */
export const links = {
  privacyPolicy: process.env.EXPO_PUBLIC_PRIVACY_URL || null,
  terms: process.env.EXPO_PUBLIC_TERMS_URL || null,
  manageSubscriptions: 'https://play.google.com/store/account/subscriptions',
};
