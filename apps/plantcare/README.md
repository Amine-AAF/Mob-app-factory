# PlantCare — Plant Care & Garden Companion

Offline-first Android app (Expo / React Native) to manage houseplants, balcony and garden
plants: collection with photos, plant library (150+ sheets), watering tracker, care
scheduler, growth tracker, journal, health follow-up, fertilizer & soil, garden spaces,
wishlist, seasonal checklists and statistics. No account, no backend, data stays on device.

Part of the **Mobile Apps Factory** monorepo — see `factory/documentation/` for shared rules.

## Quick start

```bash
# from the monorepo root (worktree C:\Projets\maf-plantcare on branch feat/plantcare)
pnpm install
cd apps/plantcare
pnpm typecheck
pnpm test
npx expo run:android        # dev client on a device/emulator (needs Android SDK)
```

Environment variables: copy `.env.example` to `.env` (git-ignored). Development and preview
builds always use **Google's AdMob test IDs**; without `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`
the paywall explains that purchases are unavailable (no fake purchases).

## Architecture

```
app/                       Expo Router screens
  (tabs)/                  Home · My Plants · Calendar · Library · Profile
  plant/edit, plant/[id]/  plant form, detail, watering/growth/journal/health/soil
  record/*                 data-entry forms (no ads on these screens)
  task/edit                care task form (watering, fertilizing, pruning, …)
  garden/*, wishlist/*     garden organizer, wishlist
  seasonal, stats, health-guide, paywall, onboarding, settings/*
src/
  domain/                  pure logic: types, schedule (recurrence), notification plan,
                           seasons by climate, units, stats, free/premium limits
  content/                 plant library (species/*.ts) + health guide + CONTENT_SOURCES.md
  database/                migrations (user_version), typed tables, repositories, seed
  services/                boot, reminders, photos, data export/PDF, ads, monetization, analytics
  store/                   zustand: preferences (AsyncStorage) and session
  components/              PlantCare UI kit on top of @factory/design-system
  i18n/                    en (default), fr, es
```

Shared packages used: `@factory/storage` (migrations, backup/restore), `@factory/design-system`,
`@factory/localization`, `@factory/notifications`, `@factory/monetization`,
`@factory/analytics`, `@factory/app-core`, `@factory/testing` (sql.js). No shared package was
modified. `src/database/table.ts`, `services/clock.ts`, `services/ads.ts`,
`services/monetization.ts`, `components/AdBanner.tsx` are copies of DevSpeak/PetCare code →
listed as mutualisation candidates in `factory/tracking/plantcare.md`.

### Data model (SQLite, `plantcare.db`)

`plant_categories`, `plant_species` (bundled, re-seeded by `LIBRARY_VERSION`),
`garden_locations`, `plants`, `care_tasks`, `care_history`, `watering_records`,
`growth_records`, `plant_journal_entries`, `plant_health_records`, `fertilizer_records`,
`soil_records`, `plant_wishlist`, `seasonal_tasks`, `seasonal_completions`,
`notification_settings`, `app_meta`, `subscription_cache`.

- Foreign keys ON; deleting a plant cascades to its records; deleting a space keeps its plants.
- Indexes on every `plant_id + date` pair and on `care_tasks(active, next_due)`.
- Calendar days are local day keys `YYYY-MM-DD` (time-zone safe); timestamps are ISO.
- Photos are files in `<documents>/plantcare/photos/`; tables store only `photos/<id>.jpg`.
- Writes that touch several tables (complete a task, duplicate a plant, restore) run in a transaction.
- Backup = JSON of user tables (`@factory/storage` format, app id `plantcare`); restore
  rejects other apps' files and newer schemas.

### Key product rules

- **No universal frequency**: the user chooses each interval; suggestions are editable chips.
  Recurrence is "N days after the actual completion"; every completion is confirmed by the user.
- **Notifications**: at most one per day (grouped), overdue reminded once, 14-day horizon,
  re-planned after every change; switchable globally, per task type, per plant, per task.
  Refused permission → the app works without reminders.
- **Seasons** depend on the climate profile (north / south / tropical / none).
- **Health**: knowledge base of possible causes, explicit "not a diagnosis" disclaimer; photos never analysed.
- **Fertilizer**: never a dose; always "follow the manufacturer's label".
- **Free**: 10 plants, basic library (`core` sheets), 90-day history view, 5 growth records/plant,
  3 spaces, text journal, banner ads after 2 grace sessions. **Premium**: everything unlimited,
  full library, photo journal & comparison, advanced stats, custom seasonal templates, PDF, no ads.
  Lapsing never deletes or hides data that already exists beyond the free view.
- **Ads**: anchored banner on browse screens only (Home, My Plants, Library, Garden, Wishlist);
  never on forms or task completion; UMP consent before any request.

## Tests

`pnpm test` — Jest (jest-expo) with in-memory SQLite (sql.js):
`domain.test.ts` (recurrence, past dates, agenda, grids, units, seasons, limits, notification
anti-spam, insights), `database.test.ts` (migrations, constraints, cascades, plants/tasks/
watering/growth/health/soil/wishlist/seasonal, backup/restore/wipe), `library.test.ts`
(≥150 sheets, consistency, pet-safe filter, multilingual search), `i18n.test.ts` (key parity,
placeholders, dynamic enum keys, plurals, regional dates), `services.test.ts` (notification
scheduling, disabled/refused permission, time-zone day keys, photo path safety, PDF escaping),
`ui*.test.tsx` (routing, dashboard, task completion, free limit → paywall, plant creation from
the library, validation, pet-safe filter, French UI). Screen tests that render a `TextInput` are one
per file because of a jest-expo/RN 0.88 quirk — see `src/test-utils/ui.tsx`.

## Build & release

- `eas.json`: `development` (dev client APK), `preview` (internal APK), `production` (AAB).
- Production requires protected variables: `ADMOB_ANDROID_APP_ID`, `EXPO_PUBLIC_ADMOB_BANNER_ID`,
  `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`, `EXPO_PUBLIC_PRIVACY_URL`, `EAS_PROJECT_ID`.
- Play Store material and checklist: [`store/`](store/README.md). **Nothing is published automatically.**
