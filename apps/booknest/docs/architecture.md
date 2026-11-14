# BookNest — technical architecture

## Layout

```
apps/booknest/
  app.manifest.json     identity, brand, monetization, locales (single source of truth)
  app.config.ts         Expo config derived from the manifest + APP_VARIANT
  app/                  screens (Expo Router)
    (tabs)/             Home · Library · Discover · Goals · Profile
    book/ session/ quotes/ journal/ collections/ wishlist/ goals/ settings/
    stats.tsx calendar.tsx ranking.tsx sessions.tsx paywall.tsx onboarding.tsx
  src/
    config/             brand palettes, free/premium limits, presets (collections, challenges)
    database/           migrations + repositories (books, reading, content, organize)
    features/           pure domain logic, no React/Expo imports (fully unit-tested)
      library/ tracking/ sessions/ goals/ statistics/ discover/ reminders/ transfer/ quotes/
    services/           orchestration: validation + limits + repositories + side effects
    store/              zustand: preferences (AsyncStorage) and in-memory session state
    components/         app design layer (paper theme, covers, charts, forms)
    hooks/              useData (reload on write), useAction (friendly errors), premium gate
    i18n/               i18next setup, Intl formatters, en/fr/es
    __tests__/          Jest (sql.js in-memory SQLite)
  brand/mark.mjs        app mark used by `pnpm brand-assets apps/booknest`
  store/                Play listing, data safety, checklist, graphics
```

Rule of thumb: **features/** decides, **services/** applies, **database/** stores, **app/** displays.

## Shared packages used

`@factory/storage` (migrations, backup envelope, KV), `@factory/testing` (sql.js), `@factory/localization`,
`@factory/design-system`, `@factory/monetization` (entitlement cache + grace, ad policy, RevenueCat adapter),
`@factory/notifications` (channel, permission), `@factory/analytics` (consent + PII filter), `@factory/app-core` (dates, streaks).
No shared package was modified.

**Candidates for mutualisation** (implemented locally, see the tracking file):
- Surface color overrides in `ThemeProvider` (BookNest's warm "paper" surfaces live in `src/components/theme.ts`).
- Multi-kind local notification planner (`src/features/reminders/plan.ts`) — HabitFlow has a similar one.
- CSV parser/writer with formula-injection protection (`src/features/transfer/csv.ts`).
- Backup *merge* mode (`mergeBackup` in `src/services/transferService.ts`) — `@factory/storage` only has replace.

## Data model (SQLite, `src/database/migrations.ts`)

| Table | Purpose |
| --- | --- |
| `authors`, `genres` | Deduplicated by a normalized `name_key` (case/accent/punctuation-insensitive); orphans pruned |
| `books` | Catalogue entry; `title_key` and `search_text` are normalized for search and duplicates; covers are **file URIs** |
| `reading_records` | One row per reading attempt (re-reads); the `is_current` row holds the status (unique partial index) |
| `reading_sessions` | Timed or manual sessions (start/end instants, local `day`, pages or audio positions) |
| `session_timer` | Single-row running timer (`started_at`, `paused_at`, `paused_ms`) — survives process death |
| `progress_updates` | Every page/audio-position change; source of "pages read" and "listened" stats |
| `reading_goals` | Goal definitions; progress is computed, except `custom` (manual) |
| `quotes`, `reading_notes`, `reviews` | Private user content (tags as JSON arrays) |
| `collections`, `collection_books` | Many-to-many |
| `wishlist_items` | Wishlist with status, priority, price in cents, optional link to the created book |
| `audiobook_progress` | Total/position/speed per audiobook |
| `notification_settings` | One row per reminder kind (all disabled by default) |
| `reading_calendar` (VIEW) | Per-day seconds, pages, sessions, finished books — derived, never stored twice |
| `subscription_cache` | Device state for the 7-day offline entitlement grace (never exported) |

Foreign keys are enforced (`PRAGMA foreign_keys = ON`); deleting a book cascades to its records, sessions,
quotes, review, collection links and audio data, while journal entries are kept (book set to NULL).
Indexes cover search keys, status, days and foreign keys. Every multi-statement write runs in a transaction.
Migrations use `PRAGMA user_version`: never edit a shipped migration, append a new one.

## Key decisions

- **Timer from timestamps.** Nothing ticks in the background; elapsed = (pausedAt ?? now) − startedAt − pausedMs,
  clamped at 0 if the clock moves backwards. Implausible durations (>8 h) prompt a correction.
- **Honest statistics.** Every metric returns `null` without data (UI shows “—”), and coverage is reported
  (e.g. finished books without page count are excluded from pages). Completing a never-started book does not
  invent a start date, so no fake "read in 1 day" record.
- **Progress validation.** Pages can't be negative or beyond the page count; the page count can't be reduced
  below the current page; manual sessions can't end before they start, run >24 h or be in the future.
- **Large libraries.** One indexed query returns lightweight list rows; FlatList virtualization with
  `getItemLayout` (list) and thumbnails (grid). Tested with 3,000 books.
- **Discover is not AI.** Affinity scores from finished books, ratings, favorites and abandoned books; each
  suggestion carries its reason. `CatalogProvider` allows an opt-in external catalogue later; only
  `localCatalog` exists and no network call is made (a test forbids `fetch`).
- **Privacy.** Analytics events are typed and contain no free text; nothing before consent. Notes and quotes are
  never sent to ads, analytics or notifications. Covers stay in the app's private storage; `allowBackup=false`.
- **Ads.** Banners only on Library, Discover, Wishlist and Statistics (enforced by a test that scans reading/writing
  screens). UMP consent first; test IDs outside production.

## Free vs Premium (`src/config/limits.ts`)

Free: 100 books, 3 custom collections (suggested ones unlimited), 100 quotes, 50 journal entries, 3 active goals,
90 days of visible session history, basic statistics, JSON backup/restore, CSV import, banner ads.
Premium: unlimited everything, custom goals, advanced statistics, full history and yearly calendar, journal filters
and Markdown export, CSV/PDF export, colour palettes, backups with covers, no ads.
Limits only block *adding*; existing data always stays readable and editable after a subscription lapses.

## Tests

`pnpm --filter booknest test` — suites: `domain` (pure rules), `database` (schema, library, tracker, sessions,
calendar), `services` (goals, quotes, journal, collections, wishlist, stats, discover, notifications, CSV, backup),
`i18n` (key parity, placeholders, every key used in code, formatting), `ui` (components, accessibility, contrast,
offline/no-ads/no-logging policies).
