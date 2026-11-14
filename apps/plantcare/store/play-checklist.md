# PlantCare — Google Play checklist

Status legend: ☐ to do · ☑ done in code/repo · ⚠ needs a human / external account.

## 1. Identity & configuration

- ☑ Package id `com.mobileappsfactory.plantcare` (manifest) — ⚠ confirm the domain is controlled before first upload (permanent).
- ☑ `versionCode` / `version` in `app.manifest.json`; bump `versionCode` for every upload.
- ⚠ `eas init` in `apps/plantcare` → set `EAS_PROJECT_ID` (CI variable).
- ⚠ Protected CI variables: `ADMOB_ANDROID_APP_ID`, `EXPO_PUBLIC_ADMOB_BANNER_ID`,
  `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`, `EXPO_PUBLIC_PRIVACY_URL`, `EXPO_PUBLIC_TERMS_URL`.
- ☑ Dev/preview builds force Google AdMob **test** IDs; production refuses to build without a real App ID.
- ⚠ Brand assets: `pnpm brand-assets apps/plantcare` (needs `sharp`, see factory docs) — app icon,
  adaptive icon, splash, notification icon, store icon, feature graphic.

## 2. Monetization

- ⚠ Play Console → Monetize → Subscriptions: `plantcare_premium_monthly` (≈ 2.99 USD),
  `plantcare_premium_annual` (≈ 17.99 USD); in-app product `plantcare_premium_lifetime` (≈ 29.99 USD).
  Indicative prices only — the app always displays the localized store price.
- ⚠ RevenueCat: entitlement `premium`, offering `default` with the three packages; Android public SDK key.
- ⚠ AdMob: app + one banner unit; link to Play listing after publication.
- ⚠ AdMob → Privacy & messaging: publish a GDPR (UMP) message; the app calls `gatherConsent()` before any ad request.
- ☑ No ads on data-entry screens (observations, task completion, forms) and no ads for Premium.
- ☑ Subscription terms shown on the paywall; "Restore purchases" and "Manage subscription" available.

## 3. Policy & privacy

- ⚠ Host `privacy-policy.md` publicly and set `EXPO_PUBLIC_PRIVACY_URL`.
- ☐ Fill the Data Safety form from [data-safety.md](data-safety.md).
- ☐ IARC questionnaire from [content-rating.md](content-rating.md) (expected: Everyone / PEGI 3).
- ☐ Target audience: 13+ (not designed for children; ads present) — not enrolled in Families.
- ☐ Ads declaration: **Yes, contains ads**.
- ☐ Advertising ID declaration: **Yes** (Google Mobile Ads SDK).
- ☑ Permissions minimal: `POST_NOTIFICATIONS` (optional), `CAMERA` (only when taking a photo);
  storage/media/location/microphone permissions blocked in `app.config.ts`. ⚠ Verify the merged
  manifest after `expo prebuild` (no `READ_MEDIA_IMAGES`, no exact-alarm permission unless needed).
- ☑ Account deletion: not applicable (no account); in-app "Delete all my data" provided.

## 4. Content review (blocking)

- ⚠ Botanical sheets reviewed by a horticulture-literate person — see `src/content/CONTENT_SOURCES.md` §4.
- ⚠ Pet-toxicity values re-checked against the live ASPCA list.
- ⚠ FR/ES texts proofread by native speakers.

## 5. Builds & testing

- ☐ `pnpm --filter plantcare typecheck && pnpm --filter plantcare test` green.
- ☐ `eas build -p android --profile preview` → install APK on a real device (Android 10–15):
  - onboarding, add plant with photo (gallery + camera, then deny camera permission),
  - watering schedule, mark done, postpone, skip, calendar views,
  - notifications at the chosen time; disable globally / per type / per plant; deny permission,
  - change time zone and date on the device → tasks stay on the same local day,
  - backup export → delete all data → restore,
  - dark mode, FR/ES, large font size, offline (airplane mode).
- ☐ `eas build -p android --profile production` (AAB) — ⚠ upload to **Internal testing** manually, then closed testing (12+ testers, 14 days for new personal accounts).
- ☐ Screenshots from the preview build ([screenshots.md](screenshots.md)).

## 6. Release

- ☐ `releaseStatus` in the manifest updated (`internal` → `closed-testing` → `production`).
- ☐ Tag `plantcare-vX.Y.Z` created **only on explicit request** (CI rule to add, see tracking file).
