# LearnSphere — Google Play checklist

Nothing here is automated: no session submits, tags or publishes (see factory/documentation/parallel-development.md §7).
General factory checklist: [factory/documentation/release-checklist.md](../../../factory/documentation/release-checklist.md).

## Before the first upload (external)

- [ ] Final package id (replace the placeholder `com.mobileappsfactory.learnsphere` in `app.manifest.json`; permanent after upload)
- [ ] `eas init` in `apps/learnsphere` → `EAS_PROJECT_ID` (protected CI variable)
- [ ] Play Console app created; Play App Signing enrolled
- [ ] RevenueCat project, Play products `learnsphere_premium_monthly`, `learnsphere_premium_annual` (subscriptions)
      and `learnsphere_premium_lifetime` (one-time), entitlement `premium`, offering `default`
      → `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`
- [ ] AdMob app + one banner unit, UMP (GDPR) message configured, `app-ads.txt` on the developer website
      → `ADMOB_ANDROID_APP_ID`, `EXPO_PUBLIC_ADMOB_BANNER_ID`
- [ ] Privacy policy ([privacy-policy.md](privacy-policy.md)) and terms hosted over HTTPS
      → `EXPO_PUBLIC_PRIVACY_URL`, `EXPO_PUBLIC_TERMS_URL`
- [ ] Support email
- [ ] CI: add LearnSphere jobs and the tag rule `^learnsphere-v\d+\.\d+\.\d+$` to `.gitlab-ci.yml`
      (shared file — to be done through the shared-change protocol, not done by this session)

## Store listing

- [ ] Title / short / full description: [listing-en.md](listing-en.md), [listing-fr.md](listing-fr.md), [listing-es.md](listing-es.md)
- [ ] Icon 512 → `graphics/play-icon-512.png`; feature graphic → `graphics/feature-graphic-1024x500.png`
- [ ] 4–8 real phone screenshots: Home, Course detail, Planner week, Flashcard review, Quiz correction, Focus, Progress
- [ ] Category: Education. Tags: Education, Productivity

## App content declarations

- [ ] Ads: **Yes** (banner, free plan only)
- [ ] App access: everything available without login
- [ ] Content rating: [content-rating.md](content-rating.md)
- [ ] Target audience: 13+ is possible but triggers Families policy requirements with ads; **16+/18+ recommended**
      for the first release (adults, university students, certification candidates). Review before choosing 13–15.
- [ ] Data safety: [data-safety.md](data-safety.md)
- [ ] Advertising ID: Yes (Google Mobile Ads SDK)

## Device QA (dev or preview build)

- [ ] Airplane mode from first launch: onboarding, template, subjects, notes, cards, quiz, planner all work
- [ ] Apply a template → subject, chapters, recurring sessions, goals and exam created; planner shows sessions
- [ ] Notes: formatting toolbar, autosave, kill app mid-edit → content kept; version history & restore
- [ ] Import a PDF (system picker, no permission prompt), open it, delete resource
- [ ] Flashcards: review 10 cards, kill app, reopen → schedule persisted; due count correct the next day
- [ ] Quiz exam mode with a 1-minute timer: background the app 2 minutes → quiz ends with score on return
- [ ] Focus 25/5: start, lock the phone, phase notification arrives on time; kill the app during focus,
      reopen → timer still correct; let it finish while closed → session recorded at next launch
- [ ] Notifications: each kind enabled individually; Android 13+ prompt; denial explained; change language → reminders in new language
- [ ] Exam/deadline reminders fire at the chosen hour
- [ ] Dark mode, font scale 1.3+, TalkBack labels on main screens
- [ ] Free limits (3 subjects, 300 cards, 50 questions) show the explanation before the paywall
- [ ] Ads: test banner only on Home / Courses / Profile, never in focus, quiz or review; consent form in EEA
- [ ] Billing (license tester): monthly, annual, lifetime purchase; restore; offline premium honoured ≤ 7 days
- [ ] Backup export → delete all data → restore → everything back
- [ ] `npx expo export --platform android` bundle builds; merged manifest has no storage/location/camera/mic permission
