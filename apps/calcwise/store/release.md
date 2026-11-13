# CalcWise — release steps specific to this app

Generic process: [factory/documentation/release-checklist.md](../../../factory/documentation/release-checklist.md)
(target API 36 / Android 16 required for new apps since 2026-08-31 — re-check
https://developer.android.com/google/play/requirements/target-sdk before each submission).

## Identity (permanent after first upload)

- Application ID: `com.mobileappsfactory.calcwise` (dev: `.development`, preview: `.preview` suffixes)
- Name: CalcWise · Store name: "CalcWise – Smart Calculator"
- `minSdkVersion` 24, `targetSdkVersion`/`compileSdkVersion` 36 (from `app.manifest.json` → expo-build-properties)

## Versioning

- `version` (versionName) and `versionCode` live in `app.manifest.json`. Bump `versionCode` for every
  upload (Play rejects duplicates). `eas.json` uses `appVersionSource: local`.
- Release tags: `calcwise-vX.Y.Z` (CI production AAB job runs only on these tags).

## Google Play products (Monetize → Products)

| Product | Type | Id | Indicative price |
| --- | --- | --- | --- |
| Premium monthly | Subscription, base plan monthly, auto-renewing | `calcwise_premium_monthly` | USD 1.99 |
| Premium yearly | Subscription, base plan yearly, auto-renewing | `calcwise_premium_annual` | USD 9.99 |
| Premium lifetime | One-time product (non-consumable) | `calcwise_premium_lifetime` | USD 19.99 |

Prices are set **per country in Play Console** (use local price templates); the app only displays the
localized `priceString` returned by the store.

## RevenueCat

1. New project "CalcWise" → Android app `com.mobileappsfactory.calcwise` + Play service credentials.
2. Entitlement `premium`, attach all three products.
3. Offering `default` with packages `$rc_monthly`, `$rc_annual`, `$rc_lifetime`.
4. Public Android SDK key → protected CI / EAS variable `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`.
5. License testers: test purchase, cancel, restore, expiry and a lifetime purchase on a real device.

## AdMob

1. New AdMob app for CalcWise (separate from the other factory apps).
2. Units: **Banner (adaptive)**, **Interstitial**, **Rewarded**.
3. Protected variables: `ADMOB_ANDROID_APP_ID`, `EXPO_PUBLIC_ADMOB_BANNER_ID`,
   `EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID`, `EXPO_PUBLIC_ADMOB_REWARDED_ID`. Production builds fail fast
   without `ADMOB_ANDROID_APP_ID`; dev/preview builds always use Google test IDs.
4. Privacy & messaging: GDPR (and US states) consent messages. `app-ads.txt` on the developer website.

## Builds (never submitted automatically)

```bash
cd apps/calcwise
eas init                                   # once → EAS_PROJECT_ID
eas build -p android --profile preview     # internal test APK
eas build -p android --profile production  # AAB for Play (needs the production variables)
```

Local alternative with the Android SDK installed: `npx expo prebuild -p android --clean` then
`cd android && ./gradlew assembleRelease` (APK) / `./gradlew bundleRelease` (AAB) with your upload key.
Upload to the **internal testing** track only after explicit approval.
