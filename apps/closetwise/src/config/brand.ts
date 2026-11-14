import manifest from '../../app.manifest.json';

export const brand = { primary: manifest.brand.primary, accent: manifest.brand.accent, splash: manifest.brand.splashBackground } as const;
