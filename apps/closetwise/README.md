# ClosetWise — Wardrobe & Outfit Planner

Factory app #17. A private, offline digital wardrobe: catalogue clothes with photos, compose outfits,
get local outfit ideas, plan looks on a calendar, track purchases, budget and wishlist, see wardrobe
insights (cost per wear), prepare packing lists, manage laundry & care, and follow gentle wardrobe goals.

- Android first · Expo SDK 58 · Expo Router · Zustand · expo-sqlite · i18next (EN default, FR, ES)
- Offline-first, no account, no backend, no paid API. Photos never leave the device unless the user exports.
- Hybrid monetization: free tier with non-intrusive AdMob banners, Premium (RevenueCat) monthly/annual/lifetime.

Architecture, data model and photo strategy: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
Store listing & release: [store/](store/).

## Install & run

From the repository root (`pnpm` 10, Node ≥ 20.19):

```bash
pnpm install
```

```bash
pnpm --filter closetwise typecheck
```

```bash
pnpm --filter closetwise test
```

Run on a device or emulator (development build — native modules such as SQLite, camera, AdMob and
RevenueCat are not available in Expo Go):

```bash
cd apps/closetwise && npx expo run:android
```

Then `pnpm --filter closetwise start` for the Metro dev server.

## Configuration

Copy `.env.example` to `.env` (git-ignored). All values are optional in development:

| Variable | Use |
| --- | --- |
| `APP_VARIANT` | `development` (default, `.development` package suffix, test ad IDs) · `preview` · `production` |
| `EAS_PROJECT_ID` | from `eas init` |
| `ADMOB_ANDROID_APP_ID`, `EXPO_PUBLIC_ADMOB_BANNER_ID` | production only (protected CI variables) |
| `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` | public RevenueCat SDK key; without it the app runs free and the paywall says purchases are unavailable |
| `EXPO_PUBLIC_PRIVACY_URL`, `EXPO_PUBLIC_TERMS_URL` | public legal pages shown in Settings and the paywall |

Development and preview builds always use Google's sample AdMob IDs; a production build fails if
`ADMOB_ANDROID_APP_ID` is missing.

## EAS Build

`eas.json` defines `development` (dev client APK), `preview` (internal APK) and `production` (AAB).

```bash
cd apps/closetwise && eas init
```

```bash
cd apps/closetwise && eas build --platform android --profile preview
```

Nothing is ever submitted automatically: `submit` targets the internal track as a draft, and the factory CI
keeps Play submission behind a manual approval. See `store/PLAY_CHECKLIST.md`.

## Brand assets

`brand/mark.mjs` holds the hanger mark and the feature graphic. Regenerate icons (needs `sharp`, see the
factory script header):

```bash
pnpm brand-assets apps/closetwise
```

The committed PNGs are placeholders copied from the factory reference until this is run.

## Translations

One JSON file per namespace in `src/i18n/locales/{en,fr,es}/` (edit these). The generator merges them into
`src/i18n/locales/{en,fr,es}.json` (factory convention, checked by `pnpm registry:check`) and `resources.ts`.
After editing or adding a namespace file:

```bash
node apps/closetwise/src/i18n/generate-resources.mjs
```
