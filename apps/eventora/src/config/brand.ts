import type { BrandPalette } from '@factory/design-system';

import manifest from '../../app.manifest.json';

export const brand: BrandPalette = { primary: manifest.brand.primary, accent: manifest.brand.accent };
export const appManifest = manifest;

/** Accent colours the user can choose in Settings (all pass WCAG AA on light surfaces). */
export const BRAND_CHOICES: readonly { id: string; primary: string; accent: string }[] = [
  { id: 'plum', primary: '#7A3E6B', accent: '#C9A24B' },
  { id: 'rose', primary: '#B23A5B', accent: '#E0A458' },
  { id: 'ocean', primary: '#1F5E8C', accent: '#2BA6A0' },
  { id: 'forest', primary: '#2F6B4A', accent: '#D4A24B' },
  { id: 'indigo', primary: '#4B3FA6', accent: '#E86A92' },
  { id: 'graphite', primary: '#3A3F4B', accent: '#C9A24B' },
];

export function brandFor(id: string | null): BrandPalette {
  const choice = BRAND_CHOICES.find((c) => c.id === id);
  return choice ? { primary: choice.primary, accent: choice.accent } : brand;
}

/**
 * Public URLs are injected at build time (no invented domains in the code).
 * Required for production: see factory/documentation/release-checklist.md.
 */
export const links = {
  privacyPolicy: process.env.EXPO_PUBLIC_PRIVACY_URL || null,
  terms: process.env.EXPO_PUBLIC_TERMS_URL || null,
  manageSubscriptions: 'https://play.google.com/store/account/subscriptions',
};
