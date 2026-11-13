# Google Play checklist — AutoCare

Nothing here is automated: **no session publishes the app** (no `eas submit`, no release tag
without explicit approval). Target API 36 / min 24 are set in `app.manifest.json`.

## One-time setup (external)
- [ ] Confirm the permanent package id `com.mobileappsfactory.autocare` (domain you control).
- [ ] `pnpm install` at the monorepo root on the AutoCare branch (registers the app, updates the lockfile).
- [ ] `eas init` in `apps/autocare` → set `EAS_PROJECT_ID`.
- [ ] Generate brand assets: `pnpm brand-assets apps/autocare` (needs `sharp`, see README) → `assets/images/*`, `store/graphics/*`.
- [ ] Play Console app, Play App Signing (upload key managed by EAS).
- [ ] RevenueCat project: Android app, entitlement `premium`, offering `default` with
      `autocare_premium_monthly` (P1M), `autocare_premium_annual` (P1Y), `autocare_premium_lifetime` (non-consumable).
      Indicative prices 2.99 / 17.99 / 29.99 USD, localised by Play → `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`.
- [ ] AdMob app + one banner unit, UMP (GDPR) message, `app-ads.txt` → `ADMOB_ANDROID_APP_ID`, `EXPO_PUBLIC_ADMOB_BANNER_ID` (protected CI variables, production only).
- [ ] Host `store/privacy-policy.md` (fill publisher/contact) → `EXPO_PUBLIC_PRIVACY_URL` (+ terms → `EXPO_PUBLIC_TERMS_URL`).
- [ ] CI: add AutoCare jobs and tag rule `^autocare-v\d+\.\d+\.\d+$` to `.gitlab-ci.yml` (shared file — coordinate, see factory/tracking/autocare.md).

## Store listing
- [ ] Title / short / full descriptions EN, FR, ES → `store/listing-*.md`
- [ ] Icon 512, feature graphic 1024×500 → `store/graphics/`
- [ ] Screenshots (real captures): Home dashboard, vehicle space, fuel stats, maintenance schedules, expenses breakdown, documents, reports
- [ ] Category: **Auto & Vehicles**. Contact email. Privacy policy URL.

## App content
- [ ] Ads: **Yes**. Advertising ID: **Yes** (AdMob).
- [ ] App access: no login required.
- [ ] Content rating → `store/content-rating.md`. Target audience **18+**.
- [ ] Data safety → `store/data-safety.md`.
- [ ] Financial features: No (expense tracking only, no payments/loans). Health: No. Government: No.
- [ ] Subscriptions: cancellation & management link (Settings → Premium → Manage subscription).

## Device QA (development/preview build, airplane mode for offline checks)
- [ ] Fresh install → onboarding (units by region, currency, notification permission) → first vehicle.
- [ ] Add a vehicle with photo (system picker), edit, archive, restore, delete (files removed).
- [ ] Fill-ups: full, partial, missed fill, no odometer, EV kWh, PHEV both → consumption figures and warnings.
- [ ] Maintenance: record with invoice PDF, schedule by km + months, status changes, "Log as done".
- [ ] Expenses: recurring monthly (occurrences appear after date change), budget, multi-currency totals listed separately.
- [ ] Insurance: policy, payment, renewal; expiry alert on Home.
- [ ] Deadlines: inspection with 24-month repeat → mark done → next created.
- [ ] Documents: PDF + image import, preview, share, expiry, search; >25 MB rejected.
- [ ] Tires: summer/winter swap, reminder date.
- [ ] Notifications: test notification; reminder fires at the chosen hour; disable a category; reboot keeps reminders.
- [ ] Units: switch km↔mi, L↔gal, mpg; values convert, stored data unchanged.
- [ ] EN / FR / ES; light / dark / system; large font (Display size).
- [ ] Ads (preview): UMP form in EEA (debug geography), test banner on Home/Vehicles/Maintenance/Expenses only, **none on forms**.
- [ ] Premium (license tester): purchase, restore after reinstall, expiry downgrade, offline launch keeps Premium (7-day grace).
- [ ] Reports: each PDF opens in a viewer; CSV opens in a spreadsheet with accents.
- [ ] Backup → Delete all data → Restore.

## Release
1. Bump `version` / `versionCode` in `app.manifest.json`.
2. Tag `autocare-vX.Y.Z` (only when approved) → CI production AAB → manual `submit-play-internal`.
