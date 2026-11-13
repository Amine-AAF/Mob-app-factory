# DevSpeak 1.0 — implementation status

Last updated: 2026-11-13. Legend: ✅ implemented and automatically tested · 🟡 implemented, needs
on-device verification · 🔑 implemented, needs external account/configuration · ⬜ not done.

## Verified in this environment

- `pnpm validate`: TypeScript strict (all 10 workspaces), ESLint (0 problems), **183 tests passing**
  (57 package tests, 126 app tests).
- `expo-doctor`: 20/20 checks passed.
- `expo export --platform android`: Hermes bundle builds (5.7 MB).
- `pnpm registry:check`: manifest valid.
- **Not run here:** no Android SDK/emulator is installed on this machine, so no native build or
  on-device run has been performed yet. Items marked 🟡 depend on that.

## Acceptance criteria

| # | Criterion | Status | Evidence / what remains |
| --- | --- | --- | --- |
| 1 | Project installs | ✅ | `pnpm install --frozen-lockfile` |
| 2 | Launches on Android | 🟡 | Bundle + config validated; run `npx expo run:android` or an EAS dev build |
| 3 | Onboarding works | ✅🟡 | Routing tests; 3-slide intro + 5-step RHF/zod profile form |
| 4 | Learning profile selection | ✅ | Profile repository + schema tests; editable in Settings |
| 5 | Learning modules operational | ✅🟡 | Workplace (20), Technical (26), Interview (20, 8 paths) |
| 6 | Real educational content | ✅ | Content tests: schema, completeness, uniqueness, no placeholders; FR/ES helper translations |
| 7 | Quizzes work | ✅ | QuizRunner component tests, grading, 212 questions |
| 8 | Vocabulary search | ✅ | SQL search on term/definition/translation, injection-safe (tested) |
| 9 | Flashcards | ✅🟡 | SM-2 SRS (tested), due-first queue (tested), flip UI |
| 10 | Audio pronunciation | 🟡 | expo-speech (device TTS, en-US); shows guidance if no English voice |
| 11 | Progress persists after restart | ✅🟡 | All progress in SQLite; backup/restore round-trip tested |
| 12 | Offline mode | ✅🟡 | No `fetch` in app code (tested); DB boot with network disabled (tested) |
| 13 | EN / FR / ES interfaces | ✅ | 413 keys, identical key sets & placeholders (tested), language switch persisted |
| 14 | Dark & light modes | ✅🟡 | System/light/dark; WCAG contrast tested for both themes |
| 15 | Notifications on a real device | 🟡 | Local daily reminder + test button; Android 13+ permission flow |
| 16 | AdMob testable | 🟡🔑 | Test IDs in dev/preview (tested); UMP consent; production IDs via CI variables |
| 17 | Premium testable | 🔑 | RevenueCat adapter + entitlement logic tested with a fake provider; needs Play products + RevenueCat key |
| 18 | Tests pass | ✅ | 183/183 |
| 19 | Android AAB can be generated | 🔑 | `eas.json` production profile + CI job; needs `EXPO_TOKEN`/EAS project or local Android SDK |
| 20 | Publication documentation | ✅ | `apps/devspeak/store/*`, release checklist, Data Safety, rating, privacy template |

## Requires external configuration (cannot be done from the repository)

| Item | Owner action |
| --- | --- |
| Final package id | Replace placeholder `com.devspeak.app` with one under a domain you own **before first upload** |
| Play Console app, subscriptions, testers | See monetization.md / release-checklist.md |
| RevenueCat project + key | `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` |
| AdMob app, units, consent message, app-ads.txt | `ADMOB_ANDROID_APP_ID`, `EXPO_PUBLIC_ADMOB_*` |
| Firebase (optional) | `google-services.json`, see analytics.md — not installed in 1.0 |
| EAS project & token | `EAS_PROJECT_ID`, `EXPO_TOKEN` |
| Hosted privacy policy / terms | `EXPO_PUBLIC_PRIVACY_URL`, `EXPO_PUBLIC_TERMS_URL` |
| Screenshots | Capture from a preview build (screenshots.md) |
| Legal review | Privacy policy template, subscription terms |

## Known limitations / next iterations

- Pronunciation is never scored automatically (by design, stated in the UI); speech recognition is a future option.
- The content has been machine-validated for structure, but should get a **human editorial review**
  by a native English speaker and native FR/ES reviewers before launch.
- Brand mark is generated programmatically; consider a designer pass.
- Future locales (de, pt, ar): add JSON files + content translations; RTL helper is ready in `@factory/localization`,
  but layouts haven't been RTL-audited.
