# HomeCare — Google Play checklist

Nothing is published automatically. Tick each item before the first internal-testing upload.

## Identity & build
- [ ] Replace placeholder package id `com.homecare.app` in `app.manifest.json` (permanent after upload)
- [ ] `eas init` → `EAS_PROJECT_ID`; Play App Signing enabled
- [ ] `versionCode` incremented for every upload; `version` follows semver
- [ ] Protected CI/EAS variables: `ADMOB_ANDROID_APP_ID`, `EXPO_PUBLIC_ADMOB_BANNER_ID`, `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`, `EXPO_PUBLIC_PRIVACY_URL`, `EXPO_PUBLIC_TERMS_URL`
- [ ] `eas build -p android --profile production` produces an AAB; target SDK 36
- [ ] GitLab CI jobs + tag rule `homecare-vX.Y.Z` added (shared `.gitlab-ci.yml`, needs coordination)

## Store listing (en-US, fr-FR, es-ES) — see `listing.md`
- [ ] Title (≤ 30), short (≤ 80) and full description (≤ 4000)
- [ ] 512×512 icon and 1024×500 feature graphic (`store/graphics/`)
- [ ] 4–8 phone screenshots per language (dashboard, equipment, maintenance calendar, documents, expenses, paywall excluded from first two)
- [ ] Category: House & Home; contact e-mail; privacy policy URL

## Policy
- [ ] Data safety form filled as in `data-safety.md`
- [ ] Privacy policy published (local storage, no upload, AdMob, RevenueCat, optional analytics, deletion)
- [ ] Ads declaration: **contains ads** (banner, non-personalised where no consent)
- [ ] AdMob account, app and banner unit created; UMP consent message (GDPR + US states) published in AdMob
- [ ] Content rating questionnaire (expected: Everyone)
- [ ] Target audience: 18+ (not designed for children)
- [ ] Permissions: POST_NOTIFICATIONS, CAMERA (user-initiated photo) — no storage, no location, no exact alarms
- [ ] Financial features declaration: not a financial app (expense tracking only, no transactions)

## Billing
- [ ] Play Console products: `homecare_premium_monthly`, `homecare_premium_annual` (subscriptions, base plans), `homecare_premium_lifetime` (one-time)
- [ ] RevenueCat project, entitlement `premium`, offering `default` with the three packages
- [ ] License testers added; test purchase, cancel, restore, pending payment, grace period
- [ ] Paywall shows store prices only; auto-renew terms visible; restore button works

## Device testing (internal track)
- [ ] Fresh install → onboarding → first home; deny then allow notifications (Android 13+)
- [ ] Import PDF/JPEG from Downloads and Drive; open & share; delete; storage cleared → "file missing"
- [ ] Camera permission denied → gallery still works
- [ ] Reminders fire at the chosen time; change time zone → re-plan on next open; battery saver
- [ ] Backup → reinstall → restore; restore a foreign file is refused
- [ ] Dark mode, font scale 200 %, TalkBack on main flows
- [ ] Offline (airplane mode) everything except purchases works
- [ ] Banner never appears on document viewer / forms / mark-as-done; hidden for Premium
