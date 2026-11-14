# BookNest — Google Play release checklist

Nothing here is automated: no session publishes the app. Complete each item manually.

## Identity & configuration
- [ ] Replace the placeholder package id `com.mobileappsfactory.booknest` (app.manifest.json) with one on a domain you own — **permanent after first upload**.
- [ ] `eas init` in `apps/booknest`, set `EAS_PROJECT_ID`.
- [ ] Protected CI/EAS variables (production): `ADMOB_ANDROID_APP_ID`, `EXPO_PUBLIC_ADMOB_BANNER_ID`, `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`, `EXPO_PUBLIC_PRIVACY_URL`, `EXPO_PUBLIC_TERMS_URL`.
- [ ] Add BookNest jobs/tag rule `^booknest-v\d+\.\d+\.\d+$` to `.gitlab-ci.yml` (shared file — coordinate, see factory/documentation/parallel-development.md §3).
- [ ] Bump `version` / `versionCode` in `app.manifest.json` for each upload.

## Monetization
- [ ] Play Console products: `booknest_premium_monthly` (≈2.99 USD), `booknest_premium_annual` (≈17.99 USD), `booknest_premium_lifetime` (≈29.99 USD, in-app product).
- [ ] RevenueCat: entitlement `premium` attached to the 3 products, offering `default`.
- [ ] Test purchases with license testers (purchase, cancel, pending, restore, lapsed subscription → free with data intact).
- [ ] AdMob: app + one banner unit; UMP consent message configured (EEA/UK); verify consent form and "Ad privacy choices" in Settings › Privacy.
- [ ] Verify no ad appears on book, timer, session, quote, journal, review, goal, onboarding or paywall screens.

## Store listing
- [ ] Texts from `store/listing.md` (EN default, FR, ES).
- [ ] Graphics: `store/graphics/play-icon-512.png`, `feature-graphic-1024x500.png`; phone screenshots (Home, Library grid, Book page, Timer, Goals, Statistics, Quotes) in light and dark.
- [ ] Category: Books & Reference. Contact email and privacy policy URL.

## Policy forms
- [ ] Data safety: answers in `store/data-safety.md`.
- [ ] Ads declaration: **Yes** (free version).
- [ ] Content rating questionnaire (no user-generated content shared with others, no violence) → expected Everyone.
- [ ] Target audience: 13+ (ads SDK; not designed for children).
- [ ] Permissions: only `POST_NOTIFICATIONS` (+ `AD_ID` from the ads SDK, `INTERNET` for ads/billing); camera, storage and media permissions are blocked in `app.config.ts`. Verify the merged manifest after `expo prebuild`.

## Device QA (development/preview build)
- [ ] First launch offline (airplane mode): onboarding, add book, timer, goals, stats all work.
- [ ] Cover from photo picker; covers survive restart; deleting a book removes its cover files.
- [ ] Timer: start, lock the phone 10 min, background, kill the app, reopen → elapsed time correct; pause excluded.
- [ ] Notifications on Android 13+: permission prompt only when enabling a reminder; each kind fires; tapping opens the right screen; disabling removes them.
- [ ] CSV import of a Goodreads-style export (with duplicates and broken rows); CSV/PDF export opens in other apps.
- [ ] Backup → delete all data → restore (replace), and restore (merge) into a non-empty library.
- [ ] Library with 2,000+ books (import) scrolls smoothly in grid and list; search is instant.
- [ ] FR/ES interface, dates, numbers and currencies; large font scale; TalkBack labels on main screens.
- [ ] Dark mode on every screen; all five palettes (Premium).
- [ ] Upgrade test: install previous build with data, install the new one → data intact (migrations).

## Release
- [ ] `pnpm --filter booknest typecheck`, `pnpm --filter booknest test`, `pnpm registry:check` green.
- [ ] `eas build --platform android --profile production` → upload the AAB to the **internal** track first.
- [ ] Set `releaseStatus` in `app.manifest.json` (`internal` → `closed-testing` → `production`).
