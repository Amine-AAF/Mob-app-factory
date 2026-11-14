# Mobile Apps Factory

A pnpm monorepo for building and operating a portfolio of offline-first Android apps
(Expo + React Native + TypeScript strict) on shared, reusable foundations.

**Second app: [Logic Quest](apps/logic-quest)** — *Train Your Brain. Challenge Your Logic.* An original puzzle game:
number sequences, visual patterns, logical deduction and memory, a date-seeded daily challenge and timed modes,
with every answer computed by the engine or proven unique by a solver. Offline, EN/FR/ES, no account.

**First app: [DevSpeak](apps/devspeak)** — *Learn English. Speak Tech. Grow Your Career.*
An English-learning app for software developers: workplace English, technical English,
IT interview preparation, a tech dictionary with spaced-repetition flashcards, speaking
practice, daily challenges and gamified progress. Works fully offline, no account.

**App #3: [FilePilot](apps/filepilot)** — *All Your File Tools. One Simple App.* Privacy-first image
compression/resizing/conversion and PDF merge/split/extract, image↔PDF, processed entirely on the device.
Status: [apps/filepilot/docs/status.md](apps/filepilot/docs/status.md).

## Repository layout

```
apps/
  logic-quest/              Second product: puzzle game (src/engine = pure game engine)
  devspeak/                 First product (Expo SDK 58, Expo Router)
    app/                    Screens (file-based routing)
    src/content/            Original learning content (typed data + zod validation)
    src/database/           SQLite schema, migrations, seeding, repositories
    src/features/           Pure feature logic (recommendations, practice, progress…)
    src/services/           Boot, monetization, ads, analytics, reminders, backup, TTS
    src/i18n/               UI strings (en / fr / es)
    store/                  Play Store listing, ASO, Data Safety, policy, graphics
packages/                   Reusable across all apps (source-only TS packages)
  app-config/               Typed app manifest schema (identity, locales, monetization…)
  app-core/                 Dates/streaks, XP & levels, spaced repetition, utils
  design-system/            Theme tokens (light/dark, WCAG-checked) + accessible components
  localization/             i18next bootstrap, language resolution, Intl formatters
  storage/                  SQL abstraction, migrations, backup/restore, key-value store
  analytics/                Consent-aware analytics facade (console / Firebase adapters)
  monetization/             Entitlement logic, RevenueCat adapter, AdMob config policy
  notifications/            Local daily reminders (expo-notifications)
  testing/                  In-memory SQLite (sql.js) + shared Jest config
factory/
  app-registry/             Central registry of apps → each app's manifest
  templates/expo-app/       Minimal starter used by `pnpm new-app`
  scripts/                  check-registry, new-app, generate-brand-assets
  documentation/            Architecture, how-tos, release & compliance guides
```

## Quick start

Requirements: Node ≥ 20.19 (CI uses 24.12), pnpm 10, JDK 17+ and the Android SDK for local native builds.

```bash
pnpm install
pnpm validate            # typecheck + lint + all tests
pnpm registry:check      # validate every app manifest
cd apps/devspeak
npx expo run:android     # dev build on a device/emulator (needs Android SDK)
```

DevSpeak uses native modules (SQLite, AdMob, RevenueCat, audio), so it runs in a
**development build**, not in Expo Go.

## Commands

| Command | What it does |
| --- | --- |
| `pnpm typecheck` | `tsc --noEmit` in every workspace |
| `pnpm lint` | ESLint (flat config, React Compiler rules) |
| `pnpm test` | Jest in every workspace |
| `pnpm registry:check` | Validates all manifests in `factory/app-registry` |
| `pnpm new-app <id> "<Name>" <package.id>` | Scaffolds and registers a new app |
| `pnpm brand-assets apps/<id>` | Renders icons, splash, feature graphic from brand colors |

## Status

See [factory/documentation/status.md](factory/documentation/status.md) for exactly what is implemented,
what is tested, and what still needs external accounts (Play Console, AdMob, RevenueCat, Firebase, EAS).

## Documentation

- [Portfolio: inventory, status, packages, integration points](factory/documentation/portfolio.md)
- [Parallel development rules (multiple sessions)](factory/documentation/parallel-development.md)
- [Per-app tracking files](factory/tracking/README.md)
- [Architecture](factory/documentation/architecture.md)
- [Adding a new app](factory/documentation/adding-a-new-app.md)
- [Monetization setup (RevenueCat + AdMob)](factory/documentation/monetization.md)
- [Analytics & Firebase](factory/documentation/analytics.md)
- [CI/CD & builds](factory/documentation/ci-cd.md)
- [Release checklist (Google Play)](factory/documentation/release-checklist.md)
- [DevSpeak store package](apps/devspeak/store/README.md)
- [Logic Quest overview & status](apps/logic-quest/README.md) · [store package](apps/logic-quest/store/README.md)
