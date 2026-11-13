# Logic Quest — Train Your Brain. Challenge Your Logic.

Factory app #2 (after [DevSpeak](../devspeak)). An offline-first puzzle / brain-training game for
Android with original, machine-verified content in English, French and Spanish.

| | |
| --- | --- |
| Package id | `com.logicquest.app` (**placeholder — replace before the first upload**, permanent afterwards) |
| Variants | `.development`, `.preview` suffixes; production has none (`app.config.ts`) |
| Stack | Expo SDK 58 · RN 0.88 · Expo Router · Zustand · expo-sqlite · i18next · RevenueCat · AdMob + UMP |
| Monetization | Hybrid — see [store/monetization-setup.md](store/monetization-setup.md) |

## Run

```bash
pnpm install
pnpm --filter logic-quest test          # 98 tests: engine, content, SQLite, i18n, UI, monetization, offline
pnpm --filter logic-quest validate:content
cd apps/logic-quest && npx expo run:android   # development build (native modules: SQLite, AdMob, RevenueCat)
```

## Game

| Mode | What | Count |
| --- | --- | --- |
| Number Sequences | 21 rule families, choice (easy) or keypad input | 100 |
| Pattern Recognition | rows, 3×3 matrices, analogies, mirror & half-turn symmetry | 80 |
| Logical Deduction | ordering, grid deduction, if-then logic, truth-tellers, code locks, word problems | 80 |
| Memory Challenge | light trails, flash grids, number recall (incl. reverse), snapshot | 60 |
| Daily Challenge | 30 templates × date-seeded generator; one puzzle per local day, identical on every device | 30 templates |
| Timed Challenge | untimed / 30 s / 60 s / 3 min (Premium); clock pauses during explanations | — |
| Mixed Gauntlet (Premium) | 8 puzzles round-robin across categories | — |

Difficulty: easy → medium unlocks after 4 solved (or immediately for "I love puzzles" at onboarding);
hard unlocks after 4 medium and is Premium. Each puzzle: one hint (halves XP), up to 2 attempts
(retry halves XP), then the solution with its explanation. XP is granted **once per challenge**
(ledger primary key) and once per daily.

## Code map

```
app/                    Screens (Expo Router): onboarding, (tabs) Home/Play/Stats/Awards, mode/[category],
                        game (all gameplay + results), daily, paywall, settings/*
src/engine/             Pure TypeScript game engine — see src/engine/README.md
src/content/            Content specs (rules only) → compiled + validated challenges
src/i18n/locales/       UI strings en/fr/es          src/i18n/content/  puzzle templates en/fr/es
src/database/           Migrations, seeding, repositories (progress, XP ledger, achievements, daily, hints)
src/services/           boot, game/daily orchestration, monetization, ads, analytics, backup, reminders, haptics
src/components/         Boards, keypad, memory player, feedback, banner, charts
src/theme/game.ts       Color-blind-safe glyph palette, category colors (contrast tested)
brand/mark.mjs          App mark used by `pnpm brand-assets apps/logic-quest`
store/                  Google Play package
```

## Status (2026-11-13)

Legend: ✅ implemented and automatically tested · 🟡 implemented, needs on-device verification · 🔑 needs an external account.

| # | Acceptance criterion | Status | Evidence / remaining |
| --- | --- | --- | --- |
| 1 | Launches on Android | 🟡 | Hermes Android bundle exports (4.2 MB); `expo-doctor` 20/20; no emulator on the build machine |
| 2 | Works offline | ✅🟡 | No network calls in app code (tested); DB boot + daily generation with network disabled (tested) |
| 3 | All game modes functional | ✅🟡 | Engine + component tests for every category, timed and daily sessions |
| 4 | Answers validated correctly | ✅ | `checkAnswer` for every record; every wrong option rejected; malformed input rejected |
| 5 | Explanations available | ✅ | Rendered for all 320 + 60 daily challenges in 3 languages (tested) |
| 6 | Difficulty progression | ✅ | Unlock rules, queue order, increasing-load check per tier (tested) |
| 7 | Daily challenges deterministic | ✅ | Same date → same puzzle; 365 consecutive days valid, no fallback (tested) |
| 8 | XP and achievements | ✅ | Deterministic XP, once-only ledger (incl. concurrent writes), achievements from real stats (tested) |
| 9 | Progress persists | ✅🟡 | SQLite persistence across re-open, backup/restore round-trip, delete-all (tested) |
| 10 | EN / FR / ES | ✅ | Identical key sets & placeholders for UI (≈230 keys) and content templates; every key used exists |
| 11 | Dark & light modes | ✅🟡 | WCAG AA theme + ≥ 3:1 glyph/category colors in both schemes (tested) |
| 12 | Monetization testable | ✅🔑 | Fake-store tests (prices, purchase, ad removal, offline cache, expiry); real Play products + RevenueCat key needed |
| 13 | No critical defects | 🟡 | All automated checks pass; needs a device QA pass (release checklist) |
| 14 | Tests pass | ✅ | 98/98 (app) + 12/12 monetization package |
| 15 | AAB can be generated | 🔑 | `eas.json` production profile + CI tag job `logic-quest-vX.Y.Z`; needs `EXPO_TOKEN` / EAS project or local Android SDK |
| 16 | Publication documentation | ✅ | [store/](store/README.md) |
| 17 | DevSpeak unaffected | ✅ | DevSpeak 126/126 tests, typecheck, lint; its generated brand assets are byte-identical |

### Known limitations / next steps

- Human editorial review of FR/ES puzzle texts by native speakers is recommended (machine-validated for structure and completeness only).
- Puzzle titles are per rule family (e.g. several "Steady Steps" sequences); each puzzle's numbers, position of the gap and difficulty differ, and the library has no duplicate puzzle (signature test).
- 13 arithmetic-family sequences use simple constant steps by design (easy tier warm-ups).
- Not verified on a device: haptics, UMP consent form, ad rendering, Play Billing, notifications, screen-reader pass, long labels on small screens (FR/ES).
- Target API: `targetSdkVersion` 36. Check Google Play's current target-API requirement and policies before each production release.
