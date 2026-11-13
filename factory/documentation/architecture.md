# Architecture

## Principles

1. **Shared foundations, independent products.** Packages hold infrastructure and generic UI;
   each app owns its brand, content, screens, business model and store listing.
2. **Offline-first.** Content ships in the bundle and is seeded into SQLite. No screen waits on
   the network. The only network users are the store SDKs (RevenueCat, AdMob) and they are optional.
3. **No backend** until a product genuinely needs one. User tables carry `updated_at` so a sync
   engine can be added later without a schema rewrite.
4. **SDKs behind interfaces.** Monetization, analytics and storage are abstractions; pure logic
   (entitlement resolution, ad policy, streaks, SRS) is SDK-free and unit-tested.
5. **One Expo SDK across the monorepo.** `pnpm new-app` pins the versions validated by DevSpeak.

## Packages

| Package | Depends on | Notes |
| --- | --- | --- |
| `app-config` | zod | `appManifestSchema`, `defineApp`. Every app has `app.manifest.json`. |
| `app-core` | — | Local-day dates, streaks, XP curve, SM-2 spaced repetition. Pure. |
| `design-system` | RN, vector-icons, safe-area | `createTheme(brand, scheme)`, `ThemeProvider`, accessible primitives. Contrast is tested. |
| `localization` | i18next | `createI18n`, `resolveLanguage` (persisted → device → default), Intl formatters, RTL helper. |
| `storage` | — | `SqlDatabase` interface (subset of expo-sqlite), `migrate` via `user_version`, JSON backup/restore, namespaced KV. |
| `analytics` | — | Consent gate, PII filter, event-name validation, provider injection. |
| `monetization` | (peer) RevenueCat | `resolveEntitlement` (store vs offline cache, 7-day grace), `resolveAdUnits` (test IDs in dev, never in prod), `shouldShowBanner`. RevenueCat adapter in `src/revenuecat.ts`. |
| `notifications` | (peer) expo-notifications | Local daily reminder, Android 13+ permission, channel. |
| `testing` | sql.js | In-memory SQLite with the same async API as expo-sqlite; shared Jest preset. |

Packages are **source-only** (`main: src/index.ts`): Metro, Jest and TypeScript consume them
directly. No build step, no publishing.

## Logic Quest (app #2)

Reuses `app-core` (dates, streaks, XP curve), `storage` (migrations, backup), `localization` (two
namespaces: `translation` UI + `content` puzzle templates), `analytics`, `monetization`, `notifications`,
`design-system` and `testing`. Its own code: a pure game engine (`apps/logic-quest/src/engine`), content
specs whose answers are computed/solved by the engine, and an `xp_ledger` table whose primary key makes
duplicate rewards impossible. See [apps/logic-quest/README.md](../../apps/logic-quest/README.md).

Shared changes made for it (backward compatible, DevSpeak untouched): `@factory/monetization` gained
`resolveInterstitialUnit`, `shouldShowInterstitial` (frequency-capped, natural breaks only) and an optional
`activeEntitlements` field (secondary products such as a one-time ad removal); the brand-asset script
accepts a per-app `brand/mark.mjs`; CI runs app jobs as a matrix and selects the app from release tags.

## DevSpeak data flow

```
bundle (src/content/*.ts) ──seed (versioned)──► SQLite content tables
                                                   │
UI screens ──useAsync──► repositories ◄────────────┤
     │                     │                       │
     └─ writes ──► progressRepository ──► user tables (progress, activity, SRS, favorites…)
                           │
                           └─ session.bump() → screens reload
```

- **Boot** (`src/services/boot.ts`): hydrate prefs (AsyncStorage) → i18n → open SQLite → migrate →
  seed if `CONTENT_VERSION` changed → load profile → render. Ads consent, reminders and store
  refresh run in the background and can't block or crash start-up.
- **Content versioning:** bump `CONTENT_VERSION` after editing content; re-seed replaces content
  tables in one transaction and never touches user tables (tested).
- **No duplicate progress:** `learning_progress` has a `(item_type, item_id)` primary key; lesson
  XP is granted on first completion only; daily challenges are keyed by local day (tested).
- **Streaks** use local calendar days and survive DST (tested).

## Navigation

Expo Router: `app/index.tsx` redirects to onboarding or tabs. Tabs: Home, Learn, Practice,
Words, Progress. Stack screens: lesson, quiz, module, word, flashcards, speaking, challenge,
settings/*, and a modal paywall.

## Testing strategy

| Layer | Tool | Examples |
| --- | --- | --- |
| Pure logic | Jest | streaks, SRS, XP, entitlement, ad policy, recommendations |
| SQLite | Jest + sql.js | migrations, seeding, repositories, backup/restore/delete |
| Content | Jest + zod | completeness, schema, unique ids, quiz integrity |
| i18n | Jest | identical key sets, placeholders, every `t('…')` key exists |
| Components | Testing Library | Button, OptionCard, QuizRunner |
| Navigation | expo-router/testing-library | entry redirects |
| Offline | Jest | no `fetch` in app code, DB init with network disabled |
| Device | manual / EAS dev build | see release checklist (TTS, mic, notifications, ads, billing) |
