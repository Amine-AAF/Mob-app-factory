import manifest from '../../app.manifest.json';

export const brand = { primary: manifest.brand.primary, accent: manifest.brand.accent };

export function brandWithAccent(accent: string | null) {
  return accent ? { primary: accent, accent: manifest.brand.accent } : brand;
}

export const APP_VERSION = manifest.version;
