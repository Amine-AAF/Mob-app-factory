# BookNest — Reading Tracker & Book Library

App #18 of the Mobile Apps Factory. A personal book library and reading companion for Android:
catalogue books, track progress and timed sessions, set goals, keep quotes, a reading journal and
private reviews, and see honest statistics. **Offline-first, no account, no backend.**

| | |
| --- | --- |
| Package id | `com.mobileappsfactory.booknest` (placeholder — replace with a domain you own before first publish) |
| Stack | Expo SDK 58 · React Native 0.88 · Expo Router · Zustand · expo-sqlite · i18next · TypeScript strict |
| Locales | English (default), French, Spanish |
| Monetization | Free (100 books, banner ads on browsing screens) + Premium via RevenueCat/Google Play |
| Status | 🟡 Development — code complete, needs device testing and store configuration (see [store/play-checklist.md](store/play-checklist.md)) |

## Install & run

```bash
# from the repository root (or the BookNest worktree)
pnpm install
cd apps/booknest
npx expo run:android          # dev build on a device/emulator (dev client)
pnpm --filter booknest typecheck
pnpm --filter booknest test
```

Expo Go is not supported (native modules: SQLite, AdMob, RevenueCat). Use a development build.

Environment variables: copy `.env.example` to `.env`. Without a RevenueCat key the app runs free and
the paywall says the store is unavailable; development/preview builds always use Google's test AdMob IDs.

## EAS Build

`eas.json` defines `development` (dev client APK), `preview` (internal APK) and `production` (AAB) profiles.
`APP_VARIANT` selects the package suffix and ad IDs (see `app.config.ts`).

```bash
cd apps/booknest
eas init                                   # once, sets EAS_PROJECT_ID
eas build --platform android --profile preview
```

Nothing is published automatically: `eas submit` is never run by the factory sessions.

## Features

| Area | Where | Notes |
| --- | --- | --- |
| Library | `app/(tabs)/library.tsx`, `app/book/*` | Grid/list, search (accent-insensitive, title/author/ISBN), filters, 7 sorts, favorites, archive, duplicate detection (ISBN-10/13 + title/author), virtualized for thousands of books |
| Covers | `src/services/covers.ts` | Android photo picker (no permission), resized to 800 px + 240 px thumbnail JPEG files, never blobs in SQLite; generated cloth covers when absent |
| Reading tracker | `app/book/[id].tsx`, `src/services/readingService.ts` | 5 statuses, page updates with validation, dates, re-reads with history |
| Sessions | `app/session/*`, `src/features/sessions/timer.ts` | Timer from timestamps only (survives background/kill), pause/resume, forgotten-timer correction, manual sessions |
| Audiobooks | book page | Position/total/speed, progress, remaining time, history |
| Goals & challenges | `app/(tabs)/goals.tsx`, `src/features/goals` | Books/year, pages/month, minutes/day, days/week, custom (Premium); period comparison; 5 challenges; celebrations |
| Quotes | `app/quotes/*` | Tags, favorites, search, filter by book, copy, Android share sheet |
| Journal | `app/journal/*` | Timeline, 7 entry types, tags, favorites, search, Markdown export (Premium) |
| Reviews | `app/book/review.tsx`, `app/ranking.tsx` | Private 1–5 stars, pros/cons, recommendation, personal ranking |
| Collections & wishlist | `app/collections/*`, `app/wishlist/*` | 10 suggested collections, multi-membership; wishlist statuses, priority, budget, move to library |
| Discover | `app/(tabs)/discover.tsx`, `src/features/discover` | Transparent local rules (no AI); `CatalogProvider` extension point for optional external catalogues |
| Statistics & calendar | `app/stats.tsx`, `app/calendar.tsx` | Missing data shown as “—”, never as 0; monthly/yearly, best periods, records (Premium) |
| Notifications | `src/features/reminders/plan.ts` | 6 local reminder kinds, all off by default, guilt-free wording |
| Import/export | `app/settings/*`, `src/services/transferService.ts` | CSV import with preview/validation/duplicates, CSV & PDF export, versioned JSON backup (merge or replace) |

## Documentation

- [docs/architecture.md](docs/architecture.md) — structure, data model, design decisions
- [docs/backup-format.md](docs/backup-format.md) — backup & CSV formats
- [store/play-checklist.md](store/play-checklist.md) — Google Play release checklist
- [store/data-safety.md](store/data-safety.md) — Data safety form answers
- [store/listing.md](store/listing.md) — store listing texts (EN/FR/ES)
- Factory tracking: [`factory/tracking/booknest.md`](../../factory/tracking/booknest.md)
