import type { ConfigContext, ExpoConfig } from 'expo/config';

import manifest from './app.manifest.json';

/**
 * Build variants:
 *   APP_VARIANT=development  -> dev client, ".development" package suffix
 *   APP_VARIANT=preview      -> internal testing build, ".preview" suffix
 *   APP_VARIANT=production   -> store build
 *
 * SafeVault ships with NO ads SDK, NO analytics SDK and NO crash reporter: nothing in
 * the binary can exfiltrate vault content. The only network use is Google Play Billing
 * through RevenueCat (purchase receipts only) when EXPO_PUBLIC_REVENUECAT_ANDROID_KEY is set.
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
    // Android Auto Backup / adb backup must never copy the vault database or SecureStore
    // entries off the device: the only supported backup is the user's encrypted export.
    allowBackup: false,
    blockedPermissions: [
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.READ_MEDIA_IMAGES',
      'android.permission.READ_MEDIA_VIDEO',
      'android.permission.READ_MEDIA_AUDIO',
      'android.permission.SYSTEM_ALERT_WINDOW',
      'android.permission.CAMERA',
      'android.permission.RECORD_AUDIO',
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.POST_NOTIFICATIONS',
      'com.google.android.gms.permission.AD_ID',
    ],
  },
  plugins: [
    'expo-router',
    'expo-sqlite',
    'expo-localization',
    // Biometric unlock: USE_BIOMETRIC only. The vault key is stored in Android Keystore-backed
    // SecureStore with user authentication required (see docs/SECURITY.md §4).
    ['expo-local-authentication', { faceIDPermission: false }],
    ['expo-secure-store', { configureAndroidBackup: true, faceIDPermission: false }],
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 160,
        backgroundColor: '#F5F7FB',
        dark: { image: './assets/images/splash-icon.png', backgroundColor: manifest.brand.splashBackground },
      },
    ],
    [
      'expo-build-properties',
      {
        android: {
          minSdkVersion: manifest.build.minSdkVersion,
          targetSdkVersion: manifest.build.targetSdkVersion,
          compileSdkVersion: manifest.build.targetSdkVersion,
          enableProguardInReleaseBuilds: true,
          enableShrinkResourcesInReleaseBuilds: true,
        },
      },
    ],
  ],
  experiments: { typedRoutes: true },
  extra: {
    variant,
    manifestId: manifest.id,
    eas: process.env.EAS_PROJECT_ID ? { projectId: process.env.EAS_PROJECT_ID } : undefined,
  },
});
