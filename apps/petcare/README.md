# PetCare — Pet Health & Care Tracker

Factory app #12. An offline-first Android app for pet owners: profiles, vet visits, vaccinations,
treatments, weight, feeding & food stock, appointments, documents (pet passport), daily care,
expenses, 34 care checklists and local reminders. No account, no backend, everything stays on the phone.

> PetCare organises information entered by the owner. It never diagnoses, never proposes a dosage
> and never imposes a vaccination schedule. The disclaimer is shown at onboarding (must be accepted),
> on every health screen, in settings and in every PDF export.

| | |
| --- | --- |
| Package id | `com.mobileappsfactory.petcare` (`.development` / `.preview` suffixes for non-store builds) |
| Stack | Expo SDK 58 · RN 0.88 · React 19.3 · Expo Router · Zustand · expo-sqlite · i18next |
| Locales | `en` (default), `fr`, `es` |
| Monetization | hybrid — RevenueCat (`premium`: monthly 2.99, annual 17.99, lifetime 29.99 USD indicative) + AdMob banner |
| Shared packages | `@factory/app-config`, `app-core`, `design-system`, `localization`, `storage`, `notifications`, `monetization`, `analytics`, `testing` (none modified) |

## Getting started

```bash
# from the repository root (or the maf-petcare worktree)
pnpm install
cd apps/petcare
pnpm typecheck
pnpm test
npx expo run:android          # dev client on a device/emulator (APP_VARIANT=development)
```

Environment variables: copy `.env.example` to `.env`. Without any key the app runs as the free
version with Google **test** ad units; the paywall explains that the store is unavailable.

## Builds (EAS)

```bash
eas init                                   # once, then set EAS_PROJECT_ID
eas build -p android --profile development # dev client APK
eas build -p android --profile preview     # internal test APK (test ads)
eas build -p android --profile production  # AAB for Play (needs production secrets)
```

Production requires `ADMOB_ANDROID_APP_ID`, `EXPO_PUBLIC_ADMOB_BANNER_ID`, `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`
and `EXPO_PUBLIC_PRIVACY_URL` as protected EAS/GitLab variables. **Nothing is ever published automatically**
(`eas submit` is manual and targets the internal track as a draft).

## Structure

```
app/                       Expo Router screens
  (tabs)/                  Home · My Pets · Care · Health · Settings
  pet/[id] · pet/edit      Pet profile (tabs: health, care, documents, expenses) and editor
  record/[kind]            Generic create/edit form for 9 record kinds (spec-driven)
  list/[kind]              Generic history list (pet filter, free history window, weight chart)
  document/new · [id]      Import (system pickers) and viewer — no ads
  documents · expenses · templates · checklist/[id] · settings/* · paywall · privacy · onboarding
src/
  domain/                  Pure, SDK-free rules (dates, statuses, stock, stats, limits, notification plan, exports)
  database/                Migrations, typed table mapper, repositories
  features/                records (form specs + renderer), dashboard loader
  services/                boot, files, backup, exports, notifications, monetization, ads, analytics
  content/templates.ts     34 built-in checklists (EN/FR/ES)
  components/ i18n/ store/ hooks/
docs/                      ARCHITECTURE.md · GOOGLE_PLAY_CHECKLIST.md
store/                     Play listing texts (EN/FR/ES), data-safety answers, graphics
brand/mark.mjs             Heart + paw mark → `pnpm brand-assets apps/petcare`
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the data model, date/time-zone rules,
notification reconciliation, file storage and the free/premium matrix, and
[docs/GOOGLE_PLAY_CHECKLIST.md](docs/GOOGLE_PLAY_CHECKLIST.md) before any release.

## Tests

`pnpm test` runs Jest (jest-expo + sql.js in-memory SQLite):

| Suite | Covers |
| --- | --- |
| `domain.test.ts` | dates, age, time zones & DST, vaccination/treatment status, frequencies, stock, weights, activities, expenses, units, free limits, CSV/HTML escaping |
| `notifications.test.ts` | planner per category, past dates, disabled categories, archived pets, caps, TZ change; sync service with permission granted/denied |
| `database.test.ts` | migrations, indexes, FK cascades, multi-pet isolation, transactions, document search, checklists, backup/restore (with/without files, crafted/newer/foreign files), delete-all |
| `features.test.ts` | every record form spec, validation, kg/lb, money/currency, templates (≥30, 3 languages, no dosage), dashboard, offline entitlement cache |
| `i18n.test.ts` | identical keys EN/FR/ES, placeholders, real translations, every code key exists, plurals, regional formats |
| `privacy.test.ts` | no network code, no `console.log`, ads only on browse screens, anonymous analytics params, blocked permissions, test ad IDs |
| `ui.test.tsx` | disclaimer, statuses, accessible charts, form behaviour, entry routing |

Jest runs in `Europe/Paris` (pinned in `jest.config.js`, has DST). `pnpm test:tz` re-runs the date and
notification suites under `Pacific/Kiritimati`, `America/Los_Angeles`, `Africa/Casablanca` and `Asia/Tokyo`.

Device-only checks (notifications delivery, pickers, PDF printing, billing, ads consent) are listed in
the Play checklist.
