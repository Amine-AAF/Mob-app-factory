# Google Play release checklist (DevSpeak)

Verified on 2026-11-13: new apps and updates must **target Android 16 (API 36)** since 2026-08-31
(phones/tablets). DevSpeak sets `targetSdkVersion`/`compileSdkVersion` 36, `minSdkVersion` 24.
Re-check https://developer.android.com/google/play/requirements/target-sdk before each submission.

## Accounts & one-time setup (external, not automatable)

- [ ] **Package id decision.** `com.devspeak.app` is a placeholder chosen for development. It is
      permanent after the first upload: replace it in `apps/devspeak/app.manifest.json` with an id
      based on a domain you control before uploading.
- [ ] Google Play Console developer account (organisation account recommended; D-U-N-S for orgs).
      New personal accounts must run a **closed test with ≥ 12 testers for 14 days** before production.
- [ ] EAS account + `eas init` in `apps/devspeak` → `EAS_PROJECT_ID`.
- [ ] Play App Signing enrolled; upload key managed by EAS.
- [ ] RevenueCat + Play subscriptions configured ([monetization.md](monetization.md)).
- [ ] AdMob app, units, GDPR/UMP message, `app-ads.txt` ([monetization.md](monetization.md)).
- [ ] Host the privacy policy ([../../apps/devspeak/store/privacy-policy.md](../../apps/devspeak/store/privacy-policy.md))
      and terms at public HTTPS URLs → `EXPO_PUBLIC_PRIVACY_URL`, `EXPO_PUBLIC_TERMS_URL`.
- [ ] Support email address for the store listing.

## Store listing (Play Console → Grow → Store presence)

- [ ] Title, short & full descriptions (en-US, fr-FR, es-ES) from `apps/devspeak/store/listing-*.md`
- [ ] App icon 512×512 → `store/graphics/play-icon-512.png`
- [ ] Feature graphic 1024×500 → `store/graphics/feature-graphic-1024x500.png`
- [ ] Phone screenshots (2–8, real app captures) — see `store/screenshots.md`
- [ ] Category: Education. Tags: Language learning, Education.
- [ ] Contact details, privacy policy URL.

## Policy declarations (Play Console → Policy → App content)

- [ ] Privacy policy URL
- [ ] Ads: **Yes, contains ads**
- [ ] App access: all features available without login (no credentials needed for review)
- [ ] Content rating questionnaire → `store/content-rating.md`
- [ ] Target audience: **18+** recommended (adults/professionals; avoids Families policy obligations with AdMob). If you choose to include 13–17, review Families/ad requirements first.
- [ ] Data safety → `store/data-safety.md`
- [ ] Advertising ID declaration: **Yes** (AdMob uses `AD_ID` permission)
- [ ] Government app: No. Financial features: No. Health: No. News: No.

## Pre-release QA on a real Android device (dev or preview build)

- [ ] Fresh install → onboarding → profile → dashboard (no crash, no network required: test in airplane mode)
- [ ] Complete a lesson + quiz; kill app; reopen → progress, streak and XP persisted
- [ ] Replay the same quiz → no extra XP, best score kept
- [ ] Vocabulary search (term, definition, translation), favorites, flashcards grading
- [ ] TTS pronunciation works (Settings > Text-to-speech has an English voice); message shown if not
- [ ] Recording: permission prompt, record, replay; denial handled
- [ ] Daily reminder: enable (Android 13+ permission prompt), test notification arrives, scheduled reminder fires
- [ ] Interface in EN / FR / ES; translations toggle; dark / light / system theme; large font size (Settings > Display)
- [ ] Ads (preview build): consent form in EEA (use UMP debug geography), test banner on Learn/Words only, rewarded ad grants +5 practice
- [ ] Premium (license tester): purchase monthly & annual, restore on reinstall, cancel → expiry downgrades, offline launch keeps premium
- [ ] Backup export → delete all data → restore backup
- [ ] Android back button / predictive back, edge-to-edge insets, small (5") and large screens

## Build & submit

1. Bump `version` / `versionCode` in `app.manifest.json`.
2. `git tag devspeak-v1.0.0 && git push --tags` → CI builds the production AAB on EAS.
3. Approve the `submit-play-internal` job → internal track (draft).
4. Promote internal → closed testing → production in Play Console after QA.
