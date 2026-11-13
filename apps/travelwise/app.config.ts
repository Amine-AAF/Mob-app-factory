import type { ConfigContext, ExpoConfig } from 'expo/config';

import manifest from './app.manifest.json';

/**
 * Build variants:
 *   APP_VARIANT=development  -> dev client, ".development" package suffix
 *   APP_VARIANT=preview      -> internal testing APK, ".preview" suffix
 *   APP_VARIANT=production   -> store build (AAB), production IDs from protected CI variables
 *
 * Secrets are never committed: they come from environment variables (EAS / GitLab CI).
 * Ads and subscriptions are added in Phase 6 (see factory/tracking/travelwise.md).
 */
const variant = (process.env.APP_VARIANT ?? 'development') as 'development' | 'preview' | 'production';
const isProd = variant === 'production';
const suffix = isProd ? '' : `.${variant}`;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: isProd ? manifest.name : `${manifest.name} (${variant === 'development' ? 'Dev' : 'Preview'})`,
  slug: manifest.slug,
  scheme: manifest.scheme,
  version: manifest.version,
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  userInterfaceStyle: 'automatic',
  backgroundColor: manifest.brand.splashBackground,
  android: {
    package: `${manifest.packageId}${suffix}`,
    versionCode: manifest.versionCode,
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      monochromeImage: './assets/images/adaptive-icon-monochrome.png',
      backgroundColor: manifest.brand.splashBackground,
    },
    // Minimal permissions: documents and photos are picked through the system pickers
    // (Storage Access Framework / Photo Picker), which need no storage permission.
    blockedPermissions: [
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.READ_MEDIA_IMAGES',
      'android.permission.READ_MEDIA_VIDEO',
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.SYSTEM_ALERT_WINDOW',
      'android.permission.RECORD_AUDIO',
    ],
    // Travel documents are sensitive: never include app data in Google cloud backups.
    allowBackup: false,
  },
  plugins: [
    'expo-router',
    'expo-sqlite',
    'expo-localization',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 180,
        backgroundColor: '#F4F8F7',
        dark: { image: './assets/images/splash-icon.png', backgroundColor: manifest.brand.splashBackground },
      },
    ],
    [
      'expo-build-properties',
      { android: { minSdkVersion: manifest.build.minSdkVersion, targetSdkVersion: manifest.build.targetSdkVersion, compileSdkVersion: manifest.build.targetSdkVersion } },
    ],
  ],
  experiments: { typedRoutes: true },
  extra: {
    variant,
    manifestId: manifest.id,
    eas: process.env.EAS_PROJECT_ID ? { projectId: process.env.EAS_PROJECT_ID } : undefined,
  },
});
