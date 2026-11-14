# Eventora — Event Planner & Organizer

Application #19 of the Mobile Apps Factory. Plan and run any event — wedding, birthday, conference,
family dinner — from one place: guests and families, RSVPs, invitations, budget, tasks, programme,
seating plan, vendors, gifts and reports. **Offline-first, no account, no backend**: everything lives
in SQLite and private files on the phone.

| | |
| --- | --- |
| Package id | `com.mobileappsfactory.eventora` (`.development` / `.preview` suffixes for non-store builds) |
| Stack | Expo SDK 58 · React Native 0.88 · Expo Router · Zustand · expo-sqlite · i18next (EN default, FR, ES) |
| Monetization | Hybrid: RevenueCat subscriptions (monthly / annual / lifetime) + AdMob banner on browse screens only |
| Branch / worktree | `feat/eventora` in `../maf-eventora` (see `factory/documentation/parallel-development.md`) |
| Status tracking | [`factory/tracking/eventora.md`](../../factory/tracking/eventora.md) |

## Getting started

```bash
# from the worktree root (C:\Projets\maf-eventora)
pnpm install
cd apps/eventora
cp .env.example .env            # optional: keys stay empty in development
pnpm typecheck
pnpm test
npx expo run:android            # dev client on a device/emulator (needs Android SDK)
```

Development and preview builds always use Google's **test AdMob IDs**. Without
`EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` the app runs as a free app and the paywall says purchases are
unavailable (no fake purchases).

### EAS builds (never published automatically)

```bash
cd apps/eventora
eas init                                         # once → EAS_PROJECT_ID
eas build -p android --profile development       # dev client (APK)
eas build -p android --profile preview           # internal testing (APK, test ads)
eas build -p android --profile production        # AAB, requires production env vars
```

Production builds fail fast if `ADMOB_ANDROID_APP_ID` is missing. Submission (`eas submit`) is a manual,
human step — see [docs/play-checklist.md](docs/play-checklist.md).

## Project layout

```
app/                      Expo Router screens
  (tabs)/                 Home · My Events · Guests · Tasks · Settings
  event/new.tsx           create / edit event (from scratch, bundled or custom template)
  event/[id]/             event space: dashboard, guests, guest, groups, import, rsvp, invitation,
                          budget, expense, tasks, task, timeline, activity, seating, vendors, vendor,
                          gifts, gift, reports
  templates.tsx, paywall.tsx, onboarding.tsx, settings/{notifications,data,privacy}.tsx
src/
  domain/                 pure, tested business logic (time zones, money, guests, CSV, budget,
                          tasks, timeline, seating, vendors/gifts, reminders, templates)
  content/                bundled event types, 20 planning templates, 24 invitation designs
  database/               migrations, typed table mapper, repositories (transactions)
  services/               boot, notifications, files, sharing (PDF/CSV/JSON/text), backup, ads, monetization
  reports/                HTML (→ PDF) and CSV builders, privacy-aware
  features/               shared feature UIs (GuestManager, TaskBoard, exporter)
  components/             form controls, calendar, invitation card, cards, charts
  i18n/                   i18next bootstrap + en/fr/es
  __tests__/              domain, database, i18n, services/UI tests
brand/mark.mjs            app mark for `pnpm brand-assets`
store/                    Play listing (en/fr/es), data safety, content rating, privacy policy
docs/                     technical documentation
```

## Documentation

- [docs/architecture.md](docs/architecture.md) — architecture, data model, time zones, money, privacy
- [docs/features.md](docs/features.md) — functional scope, free vs Premium, known limits
- [docs/play-checklist.md](docs/play-checklist.md) — Google Play release checklist
- [store/README.md](store/README.md) — store listing package

## Shared code

Uses `@factory/app-config`, `app-core`, `design-system`, `localization`, `monetization`,
`notifications`, `storage`, `testing` unchanged. No shared package was modified. Generic code written
locally that could be shared later is listed in the tracking file ("Candidats à la mutualisation").
