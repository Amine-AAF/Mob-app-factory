# FitTrack — Google Play checklist

Nothing is published automatically. Each step below is manual and requires the owner's approval.
Legend: ✅ ready in repo · ⬜ to do outside the repo.

## 1. Build & configuration
- ✅ `app.manifest.json` (id, package `com.mobileappsfactory.fittrack`, versionCode 1, brand, monetization)
- ✅ `app.config.ts` variants (development / preview / production), production fails without `ADMOB_ANDROID_APP_ID`
- ✅ `eas.json` profiles (development APK, preview APK, production AAB, submit → internal track as draft)
- ⬜ Replace the placeholder package domain with one you own **before the first upload** (permanent afterwards)
- ⬜ `eas init` → set `EAS_PROJECT_ID`; Play App Signing enabled on first upload
- ⬜ Protected CI / EAS variables: `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`, `ADMOB_ANDROID_APP_ID`, `EXPO_PUBLIC_ADMOB_BANNER_ID`, `EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID`, `EXPO_PUBLIC_PRIVACY_URL`, `EXPO_PUBLIC_TERMS_URL`
- ⬜ `.gitlab-ci.yml`: add `fittrack` to the app jobs/matrix + tag rule `^fittrack-v\d+\.\d+\.\d+$` (shared file — coordinate, see parallel-development.md §3)
- ✅ Target SDK 36, min SDK 24; blocked permissions: storage, media, location, microphone, overlay; `allowBackup=false`

## 2. Device testing (dev / preview build) — ⬜ all
- [ ] Workout: start, lock screen 5 min, unlock → elapsed & rest correct; rest notification fires in background
- [ ] Kill the app mid-workout (swipe away) → relaunch → Resume banner, sets kept, time correct
- [ ] Incoming call / app switch during rest; device reboot (scheduled reminders re-created on next launch)
- [ ] Time-zone change and DST day (planner days, streaks)
- [ ] Notifications permission flow on Android 13+ (granted / denied), each kind on/off, test notification
- [ ] Camera permission (progress photo) granted / denied; Android Photo Picker without storage permission
- [ ] Backup export → share sheet; restore on another device; corrupted file rejected
- [ ] Units kg↔lb, km↔mi, cm↔in; language EN/FR/ES; dark mode; font size 200 %; TalkBack on active workout
- [ ] Ads: UMP consent form (EEA VPN), test banners on library/programs/statistics only; never on workout/timers/forms
- [ ] Purchases with license testers: monthly, annual, lifetime, restore, cancel, grace period, refund

## 3. Play Console
- ⬜ App created; default language en-US; listings en-US / fr-FR / es-ES from `store/listing-*.md`
- ⬜ Graphics: `store/graphics/play-icon-512.png`, `feature-graphic-1024x500.png`; screenshots per `store/screenshots.md`
- ⬜ Category: Health & Fitness; contact email; privacy policy URL (host `store/privacy-policy.md`)
- ⬜ Data safety form per `store/data-safety.md`
- ⬜ Content rating questionnaire per `store/content-rating.md`
- ⬜ Health apps declaration: fitness tracking, not a medical device; no Health Connect access in v1
- ⬜ Ads declaration: "Contains ads" = yes; target audience 18+ (no Families program)
- ⬜ Products: `fittrack_premium_monthly`, `fittrack_premium_annual` (subscriptions, base plans), `fittrack_premium_lifetime` (in-app) — see `store/monetization-setup.md`
- ⬜ RevenueCat: entitlement `premium`, offering `default` with the 3 packages
- ⬜ AdMob: app + banner + interstitial units; link to Play app; app-ads.txt on the developer site
- ⬜ Internal testing track → closed testing (≥ 12 testers × 14 days for new personal accounts) → production

## 4. Before each release
- [ ] `pnpm --filter fittrack typecheck && pnpm --filter fittrack test` green; `npx expo export --platform android` OK
- [ ] versionCode incremented in `app.manifest.json`; release notes EN/FR/ES
- [ ] Tag `fittrack-vX.Y.Z` (triggers production build in CI once configured) — manual approval for submit
