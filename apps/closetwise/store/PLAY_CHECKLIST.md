# ClosetWise — Google Play release checklist

Nothing in this repository publishes the app. Every step below is manual and requires an explicit decision.
Factory-wide steps: `factory/documentation/release-checklist.md`.

## 1. Identity & configuration
- [ ] Replace the placeholder package id `com.closetwise.app` in `app.manifest.json` with one on a domain you
      control (**permanent once published**).
- [ ] `eas init` → set `EAS_PROJECT_ID` (CI variable).
- [ ] Generate brand assets: `pnpm brand-assets apps/closetwise` (icon, adaptive icon, monochrome, splash,
      notification icon, feature graphic in `store/graphics/`).
- [ ] Bump `version` / `versionCode` in `app.manifest.json` for every upload.
- [ ] `pnpm registry:check` green.

## 2. Monetization
- [ ] Play Console: create subscriptions `closetwise_premium_monthly` (≈ 2.99 USD) and
      `closetwise_premium_annual` (≈ 17.99 USD), and the in-app product `closetwise_premium_lifetime`
      (≈ 29.99 USD). Prices are indicative; the app only displays store-localised prices.
- [ ] RevenueCat: project, Android app, entitlement `premium`, offering `default` with the three packages;
      set `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` (protected CI variable).
- [ ] AdMob: Android app + one banner unit; set `ADMOB_ANDROID_APP_ID` and `EXPO_PUBLIC_ADMOB_BANNER_ID`
      (production only — dev/preview builds always use Google test IDs).
- [ ] AdMob → Privacy & messaging: publish a GDPR (UMP) consent message (and US state regulations message).
- [ ] `app-ads.txt` on the developer website.
- [ ] Test purchases with license testers: monthly, annual, lifetime, restore, cancellation, grace period,
      offline launch with an active subscription (7-day cached entitlement).

## 3. Policy & Data safety
- [ ] Privacy policy URL (public page) → `EXPO_PUBLIC_PRIVACY_URL`; terms → `EXPO_PUBLIC_TERMS_URL`.
- [ ] Data safety form (suggested answers, verify against the final build):
  - Data collected by the developer: none (no account, no backend). Wardrobe data and photos stay on device.
  - Third-party SDKs: AdMob (device/advertising ID, diagnostics — ads, with consent), RevenueCat / Google Play
    Billing (purchase history — app functionality). Analytics: disabled unless the user opts in; anonymous.
  - Data encrypted in transit: yes (SDKs). Users can request deletion: in-app "Delete all my data".
- [ ] Permissions declaration: CAMERA (taking item photos, requested on demand), POST_NOTIFICATIONS (optional
      reminders). No storage/media permission (Android Photo Picker). Check the merged manifest
      (`npx expo prebuild` → `android/app/src/main/AndroidManifest.xml`) has no READ_MEDIA_* / storage permission.
- [ ] Ads declaration: "Contains ads" = yes. Families policy: not targeted at children (target audience 18+ or 16+).
- [ ] Content rating questionnaire (lifestyle utility, no user-generated public content).
- [ ] Subscription disclosure on the paywall (auto-renewal, cancel in Play Store) — implemented, verify texts.

## 4. Store listing (en-US, fr-FR, es-ES) — see `store/listing.md`
- [ ] Title (≤ 30), short description (≤ 80), full description (≤ 4000) in the three languages.
- [ ] Screenshots (phone, 1080×1920 or higher): Wardrobe grid, item detail with cost per wear, outfit builder,
      suggestions, calendar month view, packing list, insights, dark mode. Use demo data, no real brands' logos.
- [ ] Feature graphic 1024×500 (`store/graphics/feature-graphic.png`).
- [ ] Category: Lifestyle. Tags: wardrobe, outfit planner, closet organizer.
- [ ] Do not claim AI: the suggestion engine is local and rule-based.

## 5. Device QA (dev/preview build on a real Android 13+ device and an Android 8/9 device)
- [ ] Add 60+ items with photos (camera and gallery), check grid scrolling, memory and thumbnails.
- [ ] Very large photos (12–50 MP, panoramas, HEIC) import, are compressed, and look right (orientation).
- [ ] Camera permission: deny → explanation shown, gallery still works; "don't ask again" → settings hint.
- [ ] Delete an item → its photo files are removed; app restart → orphan cleanup leaves referenced files only.
- [ ] Outfit builder, suggestions (every preset, exclusions, 👍/👎), duplicate outfit, plan on calendar,
      duplicate week, mark as worn → wear counts & cost per wear update.
- [ ] Shopping in two currencies → totals never mixed; budget warning & over alerts (once per month/level).
- [ ] Wishlist → mark purchased → purchase prefilled.
- [ ] Trip with template, add outfits → items added; "don't forget" card; checklist progress.
- [ ] Laundry board bulk moves; items in laundry are skipped by suggestions.
- [ ] Notifications: each kind on/off, time changes, nothing scheduled when all off; lock-screen text generic.
- [ ] Backup with photos → delete all data → restore → everything back; restore without photos → placeholders.
- [ ] Airplane mode: every feature works (only store/ads degrade gracefully).
- [ ] FR / ES / EN switch, large font scale (200 %), dark mode, TalkBack labels on main flows.
- [ ] No ad while building an outfit, on suggestions, calendar, day planner, trips, editors, paywall.
- [ ] Free limits (50 items / 20 outfits / 1 trip) block adding only; existing data stays visible.

## 6. Build & upload (manual)
- [ ] `eas build --platform android --profile production` (AAB) from a tag `closetwise-vX.Y.Z` (needs the CI
      job described in `docs/CI.md`).
- [ ] Upload to the **internal testing** track first; promote manually after QA.
