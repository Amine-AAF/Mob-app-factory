# ClosetWise — technical architecture

ClosetWise is an offline-first Android app (Expo SDK 58, React Native 0.88, TypeScript strict) in the
Mobile Apps Factory monorepo. No account, no backend, no paid API. Everything lives on the device.

## Layers

```
app/                      Expo Router screens (UI only, no SQL)
  (tabs)/                 Home · Wardrobe · Outfits · Calendar · Profile
  item/ outfit/ plan/ suggestions.tsx care.tsx archived.tsx history.tsx
  shopping/ wishlist/ insights.tsx goals/ trips/ settings/ onboarding.tsx paywall.tsx
src/
  domain/                 Pure, framework-free logic (100 % unit-tested)
    catalog.ts            taxonomy keys, seasons bitmask, colors, slots, currencies, size systems
    wardrobeQuery.ts      search (accent-insensitive), filters, sorting, duplicate detection
    suggestions.ts        local rule-based outfit engine (seeded, deterministic)
    insights.ts           cost per wear, usage level, statistics
    planner.ts budget.ts packing.ts goals.ts notificationPlan.ts
  database/               SQLite schema, versioned migrations, repositories (SqlDatabase interface)
  services/               Expo/SDK adapters: photos, backup, notifications, ads, monetization, boot
  store/                  Zustand: preferences (AsyncStorage) + session (in-memory)
  ui/                     App design system (theme, light/dark, premium palettes, components)
  components/             Shared app components (ItemPhoto, OutfitCollage, ItemPickerSheet, forms, AdBanner)
  features/<area>/        Screen-specific components and helpers
  i18n/                   i18next; one JSON per namespace per language (en/fr/es)
```

Rules: screens call repositories through `repos()`, then `afterWrite()` (bumps `dataVersion` so
`useAsync` loaders refresh; optionally re-plans notifications / reloads taxonomy). Domain modules never
import React Native or Expo.

## Data model (SQLite, `closetwise.db`)

| Table | Purpose | Notes |
| --- | --- | --- |
| `categories` | 17 built-in categories | reference, re-seeded |
| `colors` | 26 built-in colors (hex, neutral flag) | reference |
| `brands` | normalised brands (`UNIQUE COLLATE NOCASE`) | pruned when unused |
| `styles`, `occasions` | built-in (key) + user-created (name), archivable | custom tags round-trip in backups |
| `wardrobe_items` | the wardrobe | `seasons` bitmask, `care_status`, `photo_path`/`thumb_path` (relative paths only) |
| `item_occasions` | item ↔ occasion (N–N) | FK cascade |
| `outfits`, `outfit_items` | outfits and their items per slot | `PRIMARY KEY (outfit_id, item_id)` prevents duplicates |
| `outfit_schedules` | calendar plans (several per day allowed) | index on `date`; `worn_logged` |
| `outfit_usage_history` | one row per item worn per day | `UNIQUE (item_id, worn_on)` → wear counts & cost per wear |
| `shopping_records` | purchases (price ≥ 0, currency per record) | receipts as relative photo path |
| `wishlist_items` | wishlist with status & priority | URLs sanitised to http(s) |
| `trips`, `packing_lists` | Packing Assistant | partial unique indexes: an item/outfit appears once per trip |
| `clothing_care_records` | care instructions (one per item, partial unique index) + care history | user-entered only |
| `wardrobe_goals` | goals & challenges | JSON payload (capsule item ids) |
| `notification_settings` | per-kind opt-in, time, parameter | all disabled by default |
| `suggestion_feedback` | 👍/👎 per suggestion signature | 👎 is never proposed again |
| `app_settings` | currency, monthly budget, hemisphere | key/JSON value |
| `subscription_cache` | last known entitlement (offline grace) | |

- Migrations: `src/database/migrations.ts`, `PRAGMA user_version`, one transaction per migration.
  Never edit a shipped migration; add `version: 2`… and a test.
- `PRAGMA foreign_keys = ON`; deleting an item cascades to outfit links, usage, packing entries and care
  records; `outfits.removeEmpty()` removes outfits left without items.
- `reentrantTransactions()` lets repositories compose (nested `withTransactionAsync` joins the outer one,
  since expo-sqlite cannot nest transactions).
- Indexes on every list/filter path (category+archived, created_at, care status, schedule date, usage day,
  shopping date, wishlist status, trip departure).
- Wear counts are derived (sub-queries on `outfit_usage_history`), never denormalised, so they can't drift.

## Photos (never in SQLite)

`src/services/photos/pipeline.ts` (pure, tested) + `index.ts` (Expo adapters).

1. Library: Android Photo Picker via expo-image-picker — no storage/media permission (READ_MEDIA_* blocked
   in `app.config.ts`). Camera: CAMERA runtime permission requested only when the user taps "Take a photo";
   a refusal shows an explanation and the gallery stays available.
2. The picker's temporary copy is re-encoded to JPEG (q 0.8) and downscaled to ≤ 1600 px (longest side);
   a ≤ 360 px thumbnail (q 0.7) is generated. EXIF is not requested and is dropped by re-encoding.
3. Files go to `<documents>/closetwise/{photos,thumbs}/<id>.jpg` (private app storage, `allowBackup=false`).
   SQLite stores only the relative path (validated by a strict regex — no `..`, no URIs). Android
   `content://` URIs are never persisted (they expire).
4. Grids load thumbnails only (`ItemPhoto`), with FlatList virtualisation → smooth with hundreds of items.
   Missing files (manual deletion, restore without photos) fall back to the other size, then to a placeholder.
5. Hygiene: temp picker/manipulator/export folders are purged at start-up; orphan files (no row references
   them) are deleted at start-up and after a restore. Editors delete the old files only after a successful
   save and delete newly picked files when the edit is cancelled.

## Local suggestions (not AI)

`generateSuggestions()` is a transparent scorer: preset rule (styles, occasions, season, outerwear policy),
season tags (hard filter), care status (laundry items skipped unless opted in), exclusions, a simple color
heuristic (≤ 2 non-neutral colors preferred), rarely-worn bonus ("discover" mode), favourites, and the user's
👍/👎 history. Seeded PRNG → reproducible results; "Shuffle" changes the seed. Saved outfits are skipped so
ideas bring something new. The UI presents results as editable starting points, never as "AI" or as
guaranteed matches.

## Monetization

- Free: 50 items, 20 outfits, 1 upcoming trip, 4 suggestion presets × 3 results, basic insights/calendar,
  wishlist, restore. Banner ads (AdMob) on browse screens only (`src/config/adPlacements.ts`), never in the
  outfit builder, suggestions, calendar, day planner, trips, editors, paywall or onboarding (tested).
- Premium (`premium` entitlement, RevenueCat): monthly / annual / lifetime (`closetwise_premium_*`).
  Prices are always the localized store prices. Without `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` the app runs
  as a free app and the paywall says purchases are unavailable (no fake purchase).
- Limits only block *adding*; existing data is never hidden or deleted when Premium lapses.
- Ads: Google test IDs in development/preview (`resolveAdUnits`), UMP consent before any request,
  `delayAppMeasurementInit`, grace period of 2 sessions.

## Notifications

`planNotifications()` (pure, tested) → `services/reminders.ts` cancels all `closetwise-*` notifications and
re-schedules: planned outfit (morning of the day), trip preparation (N days before), packing checklist,
monthly budget check-in + threshold alert on purchase, weekly goals digest. Every kind is off by default,
configurable and can be disabled at once. Texts are generic i18n strings: no photo, item name, destination,
amount or note ever appears in a notification. At most 48 pending notifications.

## Backup, export, deletion

- JSON backup = `@factory/storage` `factory-backup` format of every user table + optional base64 photos.
  Restore is atomic (wipe children-first → insert parents-first → re-seed taxonomy), rejects foreign or newer
  backups, reports missing photos, and removes orphan files. CSV export neutralises spreadsheet formulas.
- Exports go to the cache `exports/` folder (purged at start-up) and leave the device only through the
  Android share sheet, on user action.
- "Delete all my data" wipes tables, photos, notifications and local preferences.

## Internationalisation

English (default), French, Spanish. `src/i18n/locales/<lng>/<namespace>.json`, merged by
`node src/i18n/generate-resources.mjs`. Tests enforce identical keys, placeholders, real translations and
that every `t('ns.key')` used in code exists. Money uses `Intl` currency formatting in the record's own
currency (never converted); dates use `Intl.DateTimeFormat` in the UI language; sizes are free text with an
optional size-system label (no automatic conversion — brand sizing differs).

## Testing

| Suite | Covers |
| --- | --- |
| `database.test.ts` | migrations, idempotence, no BLOBs, every repository, cascades, week duplication |
| `domain.test.ts` | seasons, CPW, insights, search/filters/sort/duplicates, suggestions, planner, budget, packing, goals, notifications privacy, limits, ad placement |
| `photos-backup.test.ts` | compression/thumbnail pipeline, failure cleanup, path safety, orphans, backup round-trip, restore errors, wipe, CSV |
| `theme.test.ts` | WCAG contrast of every palette in light and dark |
| `i18n.test.ts` | key parity, placeholders, translations, keys used in code, offline (no `fetch`) |
| feature tests | screen-level helpers in `src/features/*` |

Run: `pnpm --filter closetwise typecheck` and `pnpm --filter closetwise test`.
Device-only checks (camera, Photo Picker, notifications, ads, billing) are in `store/PLAY_CHECKLIST.md`.
