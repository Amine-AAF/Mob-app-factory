# PetCare — Google Play checklist

Nothing here is automated: no session publishes. Tick each item manually before an internal-track upload.

## Identity & build
- [ ] Confirm the definitive package id `com.mobileappsfactory.petcare` (permanent after first upload)
- [ ] `eas init` → set `EAS_PROJECT_ID`; Play App Signing enabled
- [ ] `versionCode` / `version` bumped in `app.manifest.json`
- [ ] `pnpm --filter petcare typecheck` and `pnpm --filter petcare test` green; `pnpm registry:check` green
- [ ] `npx expo export --platform android` succeeds; production AAB built with `eas build -p android --profile production`
- [ ] `targetSdkVersion` 36 meets the current Play requirement

## Production configuration (protected CI/EAS variables)
- [ ] `ADMOB_ANDROID_APP_ID`, `EXPO_PUBLIC_ADMOB_BANNER_ID` (real IDs only in production)
- [ ] `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`; RevenueCat entitlement `premium`, offering `default`
- [ ] Play products: `petcare_premium_monthly` (2.99 USD), `petcare_premium_annual` (17.99 USD), `petcare_premium_lifetime` (29.99 USD, in-app product) — localized prices set in Play
- [ ] `EXPO_PUBLIC_PRIVACY_URL` (+ `EXPO_PUBLIC_TERMS_URL`) published pages
- [ ] GitLab CI: add PetCare jobs / matrix entry and tag rule `^petcare-v\d+\.\d+\.\d+$` (shared file — needs validation, see factory/tracking/petcare.md)

## Store listing (`store/`)
- [ ] Title, short and full descriptions EN/FR/ES (`store/listing.*.md`) — no medical claims
- [ ] Icon 512 (`store/graphics/play-icon-512.png`), feature graphic 1024×500
- [ ] Phone screenshots (≥ 4) from a preview build: Home, Pet profile, Vaccinations, Documents, Expenses — use fictional pets
- [ ] Category: *Lifestyle* (or *Health & Fitness* is **not** recommended: the app is not a medical tool)
- [ ] Contact e-mail and website

## Policy & compliance
- [ ] Data safety form filled from `store/data-safety.md` (no data collected/shared by PetCare itself; AdMob SDK disclosures)
- [ ] Ads declaration: "Contains ads" = yes (free version)
- [ ] Content rating questionnaire (expected: Everyone)
- [ ] Target audience: adults (18+), not designed for children → no Families policy constraints
- [ ] Health disclaimer present in listing, onboarding (acceptance required), health screens, settings and PDF exports
- [ ] No claims of diagnosis, prescription, dosage or vaccination schedules in listing or screenshots
- [ ] UMP consent form configured in AdMob (EEA/UK) and "Ad privacy choices" entry verified in Settings
- [ ] Subscription terms visible on the paywall (auto-renewal, cancellation from Play) — done in app
- [ ] Permissions review: only `POST_NOTIFICATIONS` (+ SDK defaults: INTERNET, ACCESS_NETWORK_STATE, AD_ID). Camera, media, storage, location blocked
- [ ] `AD_ID` permission declared in Play Console (required by AdMob)

## Device tests (preview build, Android 8, 13 and 15)
- [ ] First launch offline: onboarding, create 2 pets, 3rd pet → paywall
- [ ] Photo from gallery (system picker, no permission prompt); document import (PDF + image), open, share, delete
- [ ] Notifications: deny → explanation + settings link; allow → test reminder; vaccination/treatment/appointment reminders fire at the right local time; change time zone → re-planned on reopen
- [ ] Treatment: log dose, stop/resume, end-of-treatment alert
- [ ] Food purchase creates an expense; low stock alert
- [ ] PDF health summary renders and shares (Premium); CSV opens in a spreadsheet with accents
- [ ] Backup with files → uninstall → reinstall → restore; restore metadata-only backup → "File missing" handled
- [ ] Delete all data → back to onboarding, files removed
- [ ] FR and ES: no truncated labels at large font scale (1.6×); dark mode
- [ ] Billing: test purchase, restore, cancellation, lifetime; offline with premium cache
- [ ] Ads: test banner only on Home/My Pets/Care; never on document viewer or forms; none for Premium

## Release
- [ ] Upload to **internal** track as draft (CI `submit-play-internal` requires manual approval)
- [ ] Update `factory/tracking/petcare.md` and the portfolio inventory line
