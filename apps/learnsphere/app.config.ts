import type { ConfigContext, ExpoConfig } from 'expo/config';

import manifest from './app.manifest.json';

/**
 * Build variants:
 *   APP_VARIANT=development  -> dev client, ".development" package suffix, Google test ad IDs
 *   APP_VARIANT=preview      -> internal testing build, ".preview" suffix, test ad IDs
 *   APP_VARIANT=production   -> store build, production IDs from protected CI variables
 *
 * Secrets are never committed: they come from environment variables (EAS / GitLab CI).
 */
const variant = (process.env.APP_VARIANT ?? 'development') as 'development' | 'preview' | 'production';
const isProd = variant === 'production';

// Google's public sample AdMob App ID (safe for development; never used in production).
const ADMOB_TEST_APP_ID = 'ca-app-pub-3940256099942544~3347511713';
const admobAppId = isProd ? process.env.ADMOB_ANDROID_APP_ID : ADMOB_TEST_APP_ID;
if (isProd && !admobAppId) {
  throw new Error('ADMOB_ANDROID_APP_ID must be set for production builds.');
}

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
    // Minimal permissions: files are picked through the system picker (no storage permission),
    // reminders are local notifications. No location, contacts, camera or microphone.
    blockedPermissions: [
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.READ_MEDIA_IMAGES',
      'android.permission.READ_MEDIA_VIDEO',
      'android.permission.READ_MEDIA_AUDIO',
      'android.permission.RECORD_AUDIO',
      'android.permission.SYSTEM_ALERT_WINDOW',
    ],
    // Notes stay on the device: no automatic cloud backup of the database.
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
        backgroundColor: '#F5F8FA',
        dark: { image: './assets/images/splash-icon.png', backgroundColor: manifest.brand.splashBackground },
      },
    ],
    ['expo-notifications', { icon: './assets/images/notification-icon.png', color: manifest.brand.primary }],
    [
      'expo-build-properties',
      { android: { minSdkVersion: manifest.build.minSdkVersion, targetSdkVersion: manifest.build.targetSdkVersion, compileSdkVersion: manifest.build.targetSdkVersion } },
    ],
    ['react-native-google-mobile-ads', { androidAppId: admobAppId, delayAppMeasurementInit: true, userTrackingUsageDescription: undefined }],
  ],
  experiments: { typedRoutes: false },
  extra: {
    variant,
    manifestId: manifest.id,
    eas: process.env.EAS_PROJECT_ID ? { projectId: process.env.EAS_PROJECT_ID } : undefined,
  },
});
