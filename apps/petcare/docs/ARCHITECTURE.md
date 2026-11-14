# PetCare — technical architecture

## Principles

1. **Offline-first, no backend.** Everything is local: SQLite for data, the app's private folder for
   files. The only network users are the optional store SDKs (RevenueCat via Google Play, AdMob).
2. **Not a medical tool.** The app stores and reminds; it never infers. Statuses are computed from
   dates the user typed. Medical fields (diagnosis, instructions, results) are free text, never pre-filled.
3. **Pure domain, thin services.** `src/domain/*` has no SDK import and is fully unit-tested.
   Services adapt Expo modules; screens compose both.
4. **Reuse the factory.** Shared packages are consumed unmodified (see "Shared code" below).

## Data model (SQLite, schema v1)

All ids are local text ids. Every user table carries `created_at` (and `updated_at` when editable).

| Table | Key columns | Relations | Indexes |
| --- | --- | --- | --- |
| `pets` | name, species, birth_date, birth_estimated, weight_kg, photo (file name), archived | — | `(archived, name)` |
| `health_records` | date, reason, vet_name, clinic, diagnosis, exams, results, cost, currency | pet → CASCADE | `(pet_id, date DESC)` |
| `vaccinations` | name, administered_date, next_due_date, reminder_days_before | pet → CASCADE | `(pet_id, …)`, `(next_due_date)` |
| `treatments` | instructions, start/end_date, frequency, reminder_times JSON, reminders_enabled, stopped_at | pet → CASCADE | `(pet_id, start_date)`, `(end_date)` |
| `treatment_logs` | given_at | treatment → CASCADE | `(treatment_id, given_at)` |
| `weight_records` | date, weight_kg CHECK > 0, height_cm | pet → CASCADE | `(pet_id, date)` |
| `feeding_schedules` | food_type, brand, product, quantity (free text), meal_times JSON | pet → CASCADE | `(pet_id, active)` |
| `feeding_logs` | fed_at | pet → CASCADE, schedule → SET NULL | `(pet_id, fed_at)` |
| `food_inventory` | quantity CHECK ≥ 0, unit, low_threshold, daily_usage, restock_alert | pet → SET NULL | — |
| `food_purchases` | date, quantity, cost | food → CASCADE, expense → SET NULL | `(food_id, date)` |
| `appointments` | type, starts_at (UTC instant), status, remind_minutes_before | pet → CASCADE | `(status, starts_at)`, `(pet_id, starts_at)` |
| `documents` | category, title, **file_name**, mime_type, size_bytes | pet → CASCADE, health/vaccination → SET NULL | `(pet_id, category)`, `(health_record_id)` |
| `activities` | type, date (instant), duration_minutes, distance_km (typed) | pet → CASCADE | `(pet_id, date)` |
| `expenses` | date, amount CHECK ≥ 0, currency, category | pet → SET NULL, receipt doc → SET NULL | `(date)`, `(pet_id, date)` |
| `care_templates` | user templates (built-ins live in the bundle) | — | — |
| `checklists`, `checklist_items` | checklist instances | pet → CASCADE, checklist → CASCADE | `(checklist_id, position)` |
| `notification_settings` | category PK, enabled, hour, minute, weekday | — | — |
| `app_settings`, `subscription_cache` | KV and entitlement cache | — | — |

- **Migrations**: `@factory/storage` `migrate()` with `PRAGMA user_version`; each migration runs in a
  transaction. Never edit a shipped migration — append one and bump `SCHEMA_VERSION` automatically.
- **Transactions**: multi-row writes (`recordPurchase`, checklist creation, restore, wipe) use
  `withTransactionAsync`; a failure rolls back everything (tested).
- **Mapper**: `database/table.ts` maps camelCase ↔ snake_case with typed columns (`bool`, `json`, `real`…).
  Identifiers come from code and are checked; values are always bound parameters. `LIKE` searches escape `%`/`_`.
- Deleting a pet cascades its history but keeps expenses (unlinked) so budgets stay correct.

## Files (photos & documents)

`services/files.ts`: files are copied into `Paths.document/petcare/{photos,documents}/` with a generated,
validated name (`[A-Za-z0-9._-]`). SQLite stores the **bare file name** only, so the storage root can move.
- Import uses the system pickers (SAF / Android photo picker) → **no storage permission**; the picker's cache
  copy is deleted right after the copy.
- If the metadata insert fails, the copied file is deleted (no orphan).
- A missing file (e.g. restored metadata-only backup) is shown as "File missing" — never a crash.
- Exports (PDF/CSV/backup) are written to `Paths.cache/petcare-export/`, shared through the Android share
  sheet, then deleted; the folder is also emptied at each start-up (temporary-file protection).
- Android auto-backup is disabled (`allowBackup: false`) so health files never leave the device silently.

## Dates & time zones

- **Day keys** (`YYYY-MM-DD`, local calendar) for birthdays, vaccinations, treatments, weights, expenses.
  They are compared as days, never parsed as UTC, so a time-zone change never shifts them (tested in 5 zones).
- **Instants** (UTC ISO) for appointments and activities; displayed in the device zone.
- Reminder times are wall-clock (`HH:MM`); DST is handled by building dates from local components (tested
  on the Paris spring-forward day).

## Notifications (local only)

`domain/notificationPlan.ts` computes the full desired set from data + `notification_settings`:
vaccinations (N days before + due day), treatment doses (rolling 7-day window per prescribed frequency,
plus end-of-treatment alert), appointments (per-appointment lead), meals (daily), walks (daily, dogs only),
grooming (weekly), restock (next occurrence), monthly weigh-in. Archived pets, past dates, stopped or
finished treatments and disabled categories produce nothing. The plan is capped (60) keeping the soonest.

`services/notifications.ts` **reconciles**: cancel every `pc-*` notification, then schedule the plan. It runs
after every write (`services/mutations.ts`), at boot, when the app returns to the foreground (new day,
time-zone change) and when the language changes (texts are re-translated). Identifiers not starting with
`pc-` are never touched. Permission (`POST_NOTIFICATIONS`) is requested only when the user enables a
reminder; denial is explained with a link to Android settings and the app keeps working. Two channels:
`petcare-health` (high) and `petcare-care` (default).

## Free vs Premium (`domain/limits.ts`)

| | Free | Premium |
| --- | --- | --- |
| Pets | 2 active (archived pets don't count) | unlimited |
| History lists | last 180 days visible — older entries are **hidden, never deleted** | full |
| Documents | 5 per pet | unlimited |
| Statistics | month & year totals | yearly chart, categories, budget |
| Exports | JSON backup (always free) | + PDF health summary, CSV expenses/health |
| Templates | first 12 + 3 personal checklists | all 34 + unlimited |
| Ads | banner on Home / My Pets / Care only | none |

Entitlements: `@factory/monetization` `resolveEntitlement` (store answer wins; offline cache honoured ≤ 7 days).
Without `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` the app is simply free — no fake purchase.

## Ads & privacy

- Google test IDs in development/preview (`app.config.ts`, `resolveAdUnits`); production IDs only from CI secrets.
- UMP consent before any request; requests are non-personalised and carry no keywords/content URL.
- Banners are never rendered on documents, health, treatment or any form screen — enforced by `privacy.test.ts`.
- Analytics: consent off by default, no provider registered, parameters limited to enums (tested).
  `recordError` keeps only the error type and a code-defined context. No `console.log` in app code (tested).
- No network API in app code (tested). Blocked permissions: camera, microphone, media/storage, location, overlay.

## Internationalisation

`src/i18n/locales/{en,fr,es}.json` (identical key sets, placeholders checked). Built-in templates carry
their three translations in `content/templates.ts`. Regional formats use `Intl` with the device locale
when it matches the UI language (`fr-CA`, `es-MX`…): dates, times, currencies (never converted) and weights
(stored in kg, displayed in kg or lb; default lb only for US/LR/MM).

## Shared code

Consumed unmodified: `app-config` (manifest), `app-core` (day keys), `design-system` (theme, components),
`localization`, `storage` (migrate, backup), `notifications` (permission, foreground handler),
`monetization`, `analytics`, `testing`.

Candidates for mutualisation (3rd copy after DevSpeak and Logic Quest — to raise via the shared-package
protocol, not done here): `services/clock.ts`, `services/monetization.ts`, `services/ads.ts`, `services/boot.ts`
pattern. New generic pieces that other apps could use: `database/table.ts` (typed mapper),
`components/fields.tsx` (dependency-free calendar/time pickers), `components/charts.tsx`,
the plan/reconcile notification pattern.
