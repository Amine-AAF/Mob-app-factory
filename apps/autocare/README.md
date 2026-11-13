# AutoCare — Car Maintenance & Expense Tracker

Application #14 of the Mobile Apps Factory. A private, offline-first digital logbook for
private drivers: vehicles, maintenance, mileage, fuel & charging, expenses, insurance,
inspections and administrative deadlines, documents, tires, checklists, comparison and reports.

- **Stack**: Expo SDK 58 · React Native 0.88 · TypeScript (strict) · Expo Router · Zustand ·
  expo-sqlite · i18next (EN default, FR, ES) · AdMob (banner) · RevenueCat (Premium).
- **No backend, no account, no paid API.** All data stays on the device (SQLite + private files).
- Package id: `com.mobileappsfactory.autocare` (permanent after the first Play upload — confirm before release).

## Getting started

```bash
# from the monorepo root (C:\Projets\Mob-app-Factory)
pnpm install                      # registers the app in the workspace and the lockfile
cd apps/autocare
pnpm typecheck
pnpm test
pnpm android                      # expo run:android (dev client, needs Android SDK)
```

> The first `pnpm install` after adding AutoCare updates `pnpm-lock.yaml` (shared file): run it
> on the AutoCare branch, not concurrently with another session — see
> [parallel-development.md](../../factory/documentation/parallel-development.md).

Brand assets (icon, adaptive icon, splash, notification icon, Play graphics) are generated from
`brand/mark.mjs` and the manifest colors:

```bash
npm i --prefix %TEMP%\sharp sharp && set SHARP_DIR=%TEMP%\sharp\node_modules
pnpm brand-assets apps/autocare
```

## Build variants (EAS)

| Profile | `APP_VARIANT` | Package | Ads | Output |
| --- | --- | --- | --- | --- |
| development | development | `…autocare.development` | Google **test** IDs | APK + dev client |
| preview | preview | `…autocare.preview` | Google **test** IDs | APK (internal testing) |
| production | production | `com.mobileappsfactory.autocare` | IDs from protected CI vars | AAB |

```bash
eas build -p android --profile preview
```

Environment variables: see [.env.example](.env.example). Without `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`
the app runs on the free plan and the paywall states that the store is unavailable (no fake purchase).
**Nothing is published automatically** (`eas submit` is manual and requires approval).

## Structure

```
app/                     Expo Router screens
  (tabs)/                Home · Vehicles · Maintenance · Expenses · Settings
  vehicle/[id]/          per-vehicle space: overview, maintenance, schedules, fuel, expenses,
                         insurance, deadlines, documents, tires, odometer, inspections, notes
  */edit.tsx             entry forms (fuel, expense, maintenance, schedule, insurance, document,
                         deadline, tire, note, vehicle) — never show ads
  templates/, inspection/, compare, reports, budget, paywall, onboarding, settings/*
src/
  types/                 domain model (metric storage, integer money + currency)
  database/              migrations (versioned), typed table mapper, repositories (transactions)
  features/              pure, unit-tested logic: units, money, fuel consumption, mileage,
                         maintenance due, expenses/TCO, deadlines/insurance, reminders plan,
                         comparison, reports (CSV + PDF writer), templates, premium limits, format
  services/              boot, file store, backup, notifications, ads, monetization, analytics
  components/, screens/  UI kit (on @factory/design-system), charts, shared list views
  i18n/locales/          en.json · fr.json · es.json (identical key sets, tested)
docs/                    architecture, data model, backup format, calculations
store/                   Play listing (EN/FR/ES), data safety, content rating, privacy policy, checklist
```

## Key product rules (enforced in code and tests)

- **Consumption is never guessed**: full-to-full method; partial fills accumulate; a missed fill,
  a missing or backwards odometer breaks the segment; implausible segments are flagged and excluded.
- **No universal intervals**: maintenance schedules and administrative deadlines only use the
  intervals the user enters (they depend on the vehicle and the country).
- **Mileage-based reminders are estimates** from the user's readings, and say so.
- **Currencies are never summed** without an explicit conversion; totals are listed per currency.
- **Units are independent from the language** (km/mi, L/US gal/UK gal, kWh, consumption formats).
- **Documents stay local**: copied into private storage; SQLite keeps only metadata + file name.
- **No ads on entry screens**; no vehicle data in ad requests or analytics.
- **Free plan never locks data**: existing records stay visible, editable and exportable (JSON backup is free).

More: [docs/architecture.md](docs/architecture.md) · [docs/data-model.md](docs/data-model.md) ·
[docs/calculations.md](docs/calculations.md) · [docs/backup-format.md](docs/backup-format.md) ·
[store/play-checklist.md](store/play-checklist.md).
