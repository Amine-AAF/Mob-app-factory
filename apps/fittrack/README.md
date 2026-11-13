# FitTrack — Workout & Fitness Planner

Android-first, offline-first workout planner and tracker of the Mobile Apps Factory monorepo.
No backend, no account, no paid API: every piece of user data lives in SQLite on the device.

| | |
| --- | --- |
| Folder / id | `apps/fittrack` · `fittrack` |
| Package id | `com.mobileappsfactory.fittrack` (placeholder domain — permanent after first publication) |
| Stack | Expo SDK 58, React Native 0.88, React 19.3, TypeScript strict, Expo Router, Zustand, expo-sqlite, i18next |
| Locales | English (default), French, Spanish — units are a separate choice (kg/lb, km/mi, cm/in) |
| Monetization | Hybrid: RevenueCat subscriptions (monthly / annual / lifetime) + AdMob banner & one capped interstitial |
| Status | `development` — see [factory/tracking/fittrack.md](../../factory/tracking/fittrack.md) |

## Installation

```bash
# from the repository root (or the app's worktree root)
pnpm install
cd apps/fittrack
pnpm typecheck
pnpm test
npx expo export --platform android      # bundle check (no device needed)
npx expo run:android                    # dev build on a device / emulator (native modules: SQLite, AdMob, RevenueCat…)
```

Expo Go is **not** supported (native modules). Use a development build (`eas build --profile development`).
Copy `.env.example` to `.env` only for local production-like builds; never commit real values.

## Features

| Area | Where | Notes |
| --- | --- | --- |
| Dashboard | `app/(tabs)/index.tsx` | Next session, resume banner, week ring, time, streaks (weekly streak is the main metric: rest days never break it), goals, recent workouts, favorites, shortcuts |
| Exercise library | `src/content/exercises/*`, `app/(tabs)/workouts.tsx`, `app/exercise/*` | **219** original exercises × 3 languages (steps, tips, mistakes, easier/harder variations), search (accent-insensitive, matches English names too), filters by muscle group / "equipment I have" / level, favorites, recent, custom exercises |
| Workout Builder | `app/program/*` | Multi-day programs, add / reorder (arrows) / remove exercises, sets, rep range, load, duration, distance, rest, notes, duplicate, archive |
| Templates | `src/content/templates/index.ts` | **32** templates (12 beginner / 13 intermediate / 7 advanced, 10 Premium), all editable copies |
| Planner | `app/(tabs)/planner.tsx`, `app/schedule.tsx`, `app/routine.tsx` | Day / week / month views, weekly routine, plan / move / postpone / skip / restore, rest days, frequency target, history markers |
| Active workout | `app/workout/active.tsx` | Big controls (≥ 56 dp), pre-filled from last time, rest timer ±15 s, pause/resume, skip, add exercise, edit/delete sets, PR toast, keep-awake, sound/vibration cues, background rest notification. **No ads.** |
| Performance tracker | `app/exercise/[id].tsx`, `app/records.tsx` | Per-exercise history, records (heaviest, reps, volume, duration, distance, pace) and **estimated** 1RM (Epley, 1–10 reps, dashed & labelled) |
| Body progress | `app/body/*` | Optional measurements (metric storage), charts, date comparison, private photos (files, not in SQLite). No interpretation / diagnosis |
| Cardio | `app/cardio/*` | 8 activity types, duration / distance, computed speed & pace, optional calories (manual or labelled MET estimate), records, weekly chart |
| Timers | `app/tools/*` | Rest, stopwatch, countdown (free), interval, Tabata, EMOM (Premium); persisted & timestamp-based |
| Goals & challenges | `app/goals.tsx` | 7 goal kinds, 5 challenges (rest days always allowed), 12 badges |
| Statistics | `app/stats.tsx` | Counts, time, weekly frequency, top exercises (free) + muscle-group distribution, monthly & yearly (Premium) |
| Notifications | `app/settings/notifications.tsx` | 5 opt-in kinds, generic texts (no body data), resynced from the DB |
| Data | `app/settings/data.tsx` | JSON backup/restore (free, atomic), CSV export (Premium), delete everything |

## Architecture

```
app/                 Expo Router screens (5 tabs + stacks/modals)
src/
  content/           bundled, localized content (exercises, templates) + content types
  database/          migrations (versioned), repositories (one per aggregate), initDatabase
  features/          PURE domain logic, fully unit-tested:
    workout/engine     active-workout maths from timestamps (elapsed, rest, pause, progress)
    timers/engine      interval / Tabata / EMOM / countdown phases from timestamps
    planner/plan       routine + explicit entries resolution, grids, next session
    performance/       1RM estimate, records detection, progression series
    stats/ goals/ body/ cardio/ units/ library/ reminders/
  services/          side effects: workout, planner, progress (badges/goals), backup, reminders,
                     rest alerts, photos, files, ads, monetization, analytics, boot
  store/             zustand: preferences (AsyncStorage, boot-critical) + in-memory session
  components/ hooks/ i18n/ config/
```

Principles:

- **Timestamps, not tickers.** Sessions store `started_at`, `paused_at`, `paused_total_ms`, `rest_ends_at`;
  timers store their run. Every displayed time is recomputed from "now", so backgrounding, screen lock,
  Android killing the process or a call never lose or drift time. A local notification (generic text)
  alerts at the end of a rest in the background.
- **Crash-safe sessions.** Each set is written to SQLite when validated. At boot an `active`/`paused`
  session is restored and offered on Home ("Resume / Discard").
- **Metric storage, display conversion.** Changing units never rewrites history.
- **Honest numbers.** Estimates (1RM, MET calories) are always labelled; statistics never fill gaps.

## Data model (SQLite, migration v1)

Reference: `muscle_groups`, `equipment` · Library: `exercises` (+ `exercise_muscles`, `exercise_equipment`,
`exercise_favorites`) · Programs: `workout_programs` → `program_days` → `program_exercises` ·
Planning: `routine_slots`, `workout_schedules` · Training: `workout_sessions` → `session_exercises` →
`exercise_sets`, `performance_records` · Body: `body_measurements`, `progress_photos` (file name only) ·
`cardio_activities` · `fitness_goals`, `challenges`, `achievements` · `notification_settings`,
`user_settings`, `subscription_cache`.

Foreign keys are enforced (`PRAGMA foreign_keys = ON`), with indexes on every lookup path. Migrations run
through `@factory/storage` `migrate()` (`user_version`, one transaction each). **Never edit a shipped
migration** — add a new version. Library exercises are upserted from the bundle when `LIBRARY_VERSION`
changes; never rename an exercise id (history references it).

Backup format: [docs/backup-format.md](docs/backup-format.md).

## Free vs Premium

Single source of truth: [`src/config/limits.ts`](src/config/limits.ts).

| Free | Premium (`fittrack_premium_monthly` 3.99 · `_annual` 19.99 · `_lifetime` 34.99 USD, indicative) |
| --- | --- |
| Full library except advanced-level instructions, 5 custom exercises | Advanced library, unlimited custom exercises |
| 3 own programs (template copies unlimited), 22 free templates | Unlimited programs, 10 premium templates |
| Workout tracking, rest timer, stopwatch, countdown | Interval, Tabata, EMOM |
| Basic statistics, last 90 days of history (older data kept) | Detailed statistics, full history |
| Body weight & waist | All measurements, custom ones, comparison, progress photos |
| JSON backup / restore, delete all data | CSV export |
| Non-personalized banner ads on browse screens only | No ads |

Ads are **never** shown during a workout, a timer or a form; see `src/services/ads.ts`. Development and
preview builds always use Google's test ad unit IDs.

## Tests

`pnpm test` — 5 suites: `domain` (engines, units, 1RM, records, planner incl. DST week, stats, goals,
cardio, notifications), `database` (sql.js in-memory: migrations, builder, active workout incl. simulated
crash & resume, planner actions, backup round-trip / corrupt / foreign files, CSV), `content` (catalog ↔
code consistency, 200+ exercises, 30+ templates, translations of content), `i18n` (key parity, placeholders,
dynamic keys, plurals), `ui` (components, WCAG contrast of the brand).

## Documentation

- [docs/exercise-catalog.md](docs/exercise-catalog.md) — exercise ids (stable), names, equipment, tracking
- [docs/backup-format.md](docs/backup-format.md) — backup JSON format
- [docs/product-principles.md](docs/product-principles.md) — health, honesty & motivation rules
- [store/](store/) — Play listing (EN/FR/ES), Data safety, privacy policy, content rating, monetization setup, **Play checklist**
