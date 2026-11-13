# HomeCare — Home Maintenance & Organizer

App #11 of Mobile Apps Factory. One calm place to run a home: maintenance planner, equipment,
warranties, documents, expenses, repairs, chores and inventory. **Offline-first, no account, no
backend, data stays on the device.** Android first. English (default), French, Spanish.

Package id: `com.homecare.app` (placeholder — replace with a domain you own **before the first
upload**; it is permanent afterwards). Branch: `feat/homecare` (worktree `C:\Projets\maf-homecare`).

## Install & run

Requirements: Node ≥ 20.19, pnpm 10, JDK 17, Android SDK (for local native builds).

```bash
pnpm install                          # from the repo root
pnpm --filter homecare typecheck
pnpm --filter homecare test
cd apps/homecare
npx expo run:android                  # dev build on a device/emulator
```

HomeCare uses native modules (SQLite, notifications, AdMob, RevenueCat, pickers, print) so it
runs in a **development build**, not Expo Go. Copy `.env.example` to `.env` for local builds;
in CI the values come from protected variables.

### EAS Build

`eas.json` defines `development` (dev client APK), `preview` (internal APK) and `production`
(AAB) profiles. Once: `eas init` (sets `EAS_PROJECT_ID`). Then:

```bash
eas build -p android --profile preview
eas build -p android --profile production   # needs ADMOB_ANDROID_APP_ID, EXPO_PUBLIC_ADMOB_BANNER_ID, EXPO_PUBLIC_REVENUECAT_ANDROID_KEY
```

Nothing is submitted automatically (`eas submit` is manual and targets the internal track as draft).

## Features (MVP)

| Area | What's in it |
| --- | --- |
| Dashboard | Alerts (overdue, warranties, documents, budget, out-of-service), 14-day agenda split urgent / today / next, month spend per currency + budget, quick actions, counts |
| My Home | Several homes (Premium), type, area (m²/ft²), rooms count, address, move-in date, description, photos; spaces (living, kitchen…) with their equipment, tasks, documents, inventory |
| Equipment | Name, category, brand, model, serial, purchase date/price/store, warranty end, room, status (active / in repair / replaced / out of service), photos, notes, linked documents; search, filters (category, room, status, warranty), full timeline |
| Maintenance | Tasks with frequency (one-off, daily, weekly, monthly, quarterly, 6-monthly, yearly, custom N days/weeks/months/years), last done, next due, time, priority, cost, notes; list + calendar, mark done (date, cost → optional expense, notes), postpone, history, **62 editable templates** with a non-recommendation disclaimer |
| Documents | Import any file via the system picker (private copy), 9 types, link to equipment/room, issue/expiry dates, notes, search/filters, open in the user's viewer, share via Android sheet, expiry reminders, missing-file handling |
| Expenses | 11 categories, currency per expense, payment method, equipment/room/receipt links, monthly budget, month/year views with comparison, 6-month (12 Premium) chart, category split; recurring bills with idempotent auto-recording |
| Repairs | Equipment, problem, reported/scheduled/completed dates, provider + contact, cost, warranty flag (suggested from the warranty end), outcome, invoice link, before/after photos, 5 statuses, keeps equipment status in step |
| Chores | Due date, priority, repeat, category, room, checklist, optional local household members, quick "done", history |
| Inventory | Category, quantity, unit value, purchase date, room, document, photos; summary (items, pieces, value per currency), CSV/PDF export |
| Reminders | Local notifications per category with Android channels, master switch, per-item switch, test notification, permission handling |
| Data | JSON backup/restore, CSV/PDF exports (Premium), delete everything |

## Architecture

```
app/                     Expo Router screens
  (tabs)/                Home · My Home · Maintenance · Documents · Settings
  assets/ maintenance/ documents/ expenses/ repairs/ household/ inventory/ homes/ rooms/ settings/
src/
  domain/                Pure logic: dates, recurrence, money, units, warranty, recurring bills, reminder plan, CSV
  database/              Schema & migrations, table helper, repositories (one per area)
  features/dashboard.ts  Dashboard aggregation
  services/              boot, files, reminders, exports, backup, ads, monetization, analytics, mutations
  components/            Form fields (date, amount, chips, picker sheet…), calendar, charts, photos, ad banner
  content/               Maintenance templates (texts in locales)
  config/                Free/Premium limits, brand, icon mapping
  i18n/                  i18next bootstrap + regional formatters, en/fr/es
  store/                 zustand: preferences (AsyncStorage) and session (in memory)
```

Shared packages used: `@factory/storage` (migrations, backup), `@factory/design-system`,
`@factory/localization`, `@factory/monetization`, `@factory/notifications` (permission +
foreground handling), `@factory/analytics`, `@factory/app-core` (day keys), `@factory/testing`.
No shared package was modified. See [docs/technical.md](docs/technical.md) for the data model,
notification, file and backup strategies.

## Monetization

| | Free | Premium (`homecare_premium_monthly` 2.99 USD · `_annual` 17.99 · `_lifetime` 29.99, indicative) |
| --- | --- | --- |
| Homes | 1 | unlimited |
| Equipment / documents / inventory | 15 / 25 / 30 | unlimited |
| History | 90 days | complete |
| Templates | 21 core | all 62 |
| Reminders | on/off per category, default timing | days before + time, per item |
| Exports | JSON backup | + PDF & CSV |
| Statistics | 6 months | 12 months + yearly comparison |
| Ads | small banner on list screens after 2 sessions | none |

Limits only block **creation**; nothing is hidden or deleted when Premium ends. Ads are never
shown on the document viewer, forms, or while completing a task. Development/preview builds
always use Google's test ad IDs. Prices shown in-app always come from Google Play.

## Tests

`pnpm --filter homecare test` — domain (recurrence, month-end clamping, leap years, money parsing
& currency isolation, units, warranty, CSV injection), database (homes/rooms, cascades, assets,
maintenance completion/postpone/history limits, expenses, recurring catch-up idempotence,
repairs, documents, chores, inventory, settings, backup round-trip and refusal), services
(reminder planning: past dates, time zones, disabled categories, denied permission, caps;
notification sync with mocked expo-notifications; private file paths, deleted files, orphan
cleanup; HTML escaping; limits; dashboard), i18n (key parity, placeholders, every literal key
in the code, every enum value and template).

## Status

See [factory/tracking/homecare.md](../../factory/tracking/homecare.md) and
[store/play-checklist.md](store/play-checklist.md).
