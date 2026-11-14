# Eventora — Google Play release checklist

Follows the factory process ([release-checklist.md](../../../factory/documentation/release-checklist.md)).
**Nothing is published automatically**: every step below is done by a human.

## 1. Identity (one-time, irreversible)

- [ ] Confirm the package id `com.mobileappsfactory.eventora` (permanent after the first upload; use a domain you control).
- [ ] `storeName` "Eventora: Event Planner" (≤ 30 chars) — check trademark availability in target markets.
- [ ] `pnpm registry:check` green.

## 2. Accounts & keys (external)

- [ ] `eas init` in `apps/eventora` → set `EAS_PROJECT_ID` (CI variable).
- [ ] Play App Signing enrolled; upload key managed by EAS.
- [ ] RevenueCat project + Play products: `eventora_premium_monthly` (≈ 3.99 USD), `eventora_premium_annual`
      (≈ 19.99 USD), `eventora_premium_lifetime` (≈ 34.99 USD, one-time). Entitlement `premium`, offering `default`.
      → `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`.
- [ ] AdMob app + **banner** unit, GDPR/UMP message published, `app-ads.txt` on the developer website.
      → `ADMOB_ANDROID_APP_ID`, `EXPO_PUBLIC_ADMOB_BANNER_ID` (protected CI variables). Dev/preview builds keep test IDs.
- [ ] Host `store/privacy-policy.md` (adapted) and terms at public HTTPS URLs → `EXPO_PUBLIC_PRIVACY_URL`, `EXPO_PUBLIC_TERMS_URL`.
- [ ] Support e-mail.

## 3. Build

- [ ] `pnpm --filter eventora typecheck` and `pnpm --filter eventora test` green.
- [ ] `eas build -p android --profile preview` → install on 2+ physical devices (Android 10 and Android 14+).
- [ ] After `expo prebuild`, inspect the merged `AndroidManifest.xml`: only `INTERNET`, `ACCESS_NETWORK_STATE`,
      `POST_NOTIFICATIONS`, `AD_ID`, `BILLING`, `VIBRATE`, `RECEIVE_BOOT_COMPLETED`/`SCHEDULE_EXACT_ALARM` (if added by
      expo-notifications) are expected. No storage, camera, microphone or contacts permission (blocked in `app.config.ts`).
- [ ] `eas build -p android --profile production` (AAB, versionCode from manifest).

## 4. Device test plan (cannot be automated here)

- [ ] Onboarding → create event from "Wedding planning" → tasks, programme, envelopes created.
- [ ] Cover image & invitation background via Photo Picker (no permission prompt on Android 13+).
- [ ] Guest add/edit, companions/children, groups, duplicate merge, CSV import (comma + semicolon, UTF-8 with accents).
- [ ] RSVP quick buttons, history, "mark invited".
- [ ] Invitation PDF share to WhatsApp and Gmail; text share; copy.
- [ ] Budget: expense in another currency without/with rate; receipt photo + PDF attach and open.
- [ ] Programme with an activity after midnight; overlap warning; shift; PDF.
- [ ] Seating: round/rect tables, overloaded warning, auto-place, PDF/CSV.
- [ ] Vendors: call/e-mail/website actions, meeting reminder, contract attach.
- [ ] Notifications: permission prompt (Android 13+), test notification, reminder fires, nothing personal on lock screen.
- [ ] Change phone time zone: event times unchanged, "today" logic correct.
- [ ] Airplane mode: every feature works; paywall shows "store unavailable".
- [ ] Backup → delete all data → restore.
- [ ] Dark mode, font scale 1.6×, TalkBack on main flows.
- [ ] Free limits: 3rd active event, 151st guest, 7th table, 4th vendor, PDF export → paywall.
- [ ] Ads: banner only on Home / My Events / Settings / Templates, labelled, never on guests/invitations/seating.
- [ ] Purchase (license tester), restore, cancel; entitlement survives 7 days offline.

## 5. Store listing (Play Console)

- [ ] Listings en-US / fr-FR / es-ES from `store/listing-*.md`.
- [ ] Icon `store/graphics/play-icon-512.png`, feature graphic `store/graphics/feature-graphic-1024x500.png`.
- [ ] 4–8 phone screenshots per language (see `store/screenshots.md`).
- [ ] Category: **Events** (alternative: Productivity). Tags: Event planning, Wedding planning, Organizer.

## 6. App content declarations

- [ ] Privacy policy URL.
- [ ] Ads: **Yes**.
- [ ] App access: no login required.
- [ ] Content rating: `store/content-rating.md`.
- [ ] Target audience: 18+ (avoids Families policy obligations with AdMob).
- [ ] Data safety: `store/data-safety.md`.
- [ ] Advertising ID: **Yes** (AdMob).
- [ ] Financial features: **No** (contributions are records only; no payments).

## 7. Release

- [ ] Personal developer accounts: closed test with ≥ 12 testers for 14 days before production.
- [ ] Internal track first (`eas submit` with manual approval in CI), then closed → production.
- [ ] Update `releaseStatus` in `app.manifest.json`, `factory/tracking/eventora.md` and the portfolio row.
- [ ] Tag `eventora-v1.0.0` only when the release is approved.
