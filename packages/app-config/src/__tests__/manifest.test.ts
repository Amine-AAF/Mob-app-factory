import { defineApp, isFeatureEnabled, type AppManifestInput } from '../index';

const valid: AppManifestInput = {
  id: 'demo-app',
  name: 'Demo',
  storeName: 'Demo App',
  slug: 'demo-app',
  scheme: 'demoapp',
  packageId: 'com.example.demo',
  version: '1.0.0',
  versionCode: 1,
  category: 'education',
  defaultLocale: 'en',
  locales: ['en', 'fr'],
  brand: { primary: '#112233', accent: '#445566', splashBackground: '#000000' },
  monetization: { model: 'free' },
  features: { a: true, b: false },
  build: { minSdkVersion: 24, targetSdkVersion: 36 },
  releaseStatus: 'development',
};

describe('defineApp', () => {
  it('accepts a valid manifest and applies defaults', () => {
    const m = defineApp(valid);
    expect(m.plannedLocales).toEqual([]);
    expect(isFeatureEnabled(m, 'a')).toBe(true);
    expect(isFeatureEnabled(m, 'b')).toBe(false);
    expect(isFeatureEnabled(m, 'missing')).toBe(false);
  });

  it('rejects an invalid package id', () => {
    expect(() => defineApp({ ...valid, packageId: 'Demo' })).toThrow(/packageId/);
  });

  it('requires the default locale to be shipped', () => {
    expect(() => defineApp({ ...valid, defaultLocale: 'es' })).toThrow(/defaultLocale/);
  });

  it('enforces the Play Store 30-char title limit', () => {
    expect(() => defineApp({ ...valid, storeName: 'x'.repeat(31) })).toThrow(/storeName/);
  });
});
