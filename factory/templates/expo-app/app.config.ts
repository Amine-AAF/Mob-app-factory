import type { ConfigContext, ExpoConfig } from 'expo/config';

import manifest from './app.manifest.json';

const variant = (process.env.APP_VARIANT ?? 'development') as 'development' | 'preview' | 'production';
const suffix = variant === 'production' ? '' : `.${variant}`;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: manifest.name,
  slug: manifest.slug,
  scheme: manifest.scheme,
  version: manifest.version,
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  userInterfaceStyle: 'automatic',
  android: {
    package: `${manifest.packageId}${suffix}`,
    versionCode: manifest.versionCode,
    adaptiveIcon: { foregroundImage: './assets/images/adaptive-icon.png', backgroundColor: manifest.brand.splashBackground },
  },
  plugins: [
    'expo-router',
    ['expo-splash-screen', { image: './assets/images/splash-icon.png', imageWidth: 180, backgroundColor: manifest.brand.splashBackground }],
    ['expo-build-properties', { android: { minSdkVersion: manifest.build.minSdkVersion, targetSdkVersion: manifest.build.targetSdkVersion, compileSdkVersion: manifest.build.targetSdkVersion } }],
  ],
  extra: { variant, eas: process.env.EAS_PROJECT_ID ? { projectId: process.env.EAS_PROJECT_ID } : undefined },
});
