# TravelWise — Trip Planner & Travel Organizer

*Plan Your Trip. Enjoy Every Moment.*

App #9 of the Mobile Apps Factory. It is an offline-first organiser for trips: itinerary,
bookings, budget, packing, documents and journal. It is **not a travel agency**: no tickets,
no reservations, no availability checks. Everything is entered by the user and stored on the
device.

- Package id: `com.mobileappsfactory.travelwise` (dev/preview builds add `.development` / `.preview`)
- Locales: en (default), fr, es
- Stack: Expo SDK 58, Expo Router, TypeScript strict, expo-sqlite, i18next, Zustand, `@factory/*`

## Layout

```
app/                    Expo Router screens
  (tabs)/               Home · Trips · Places · Budget · Settings
  onboarding/           welcome + language → currency → optional first trip
  trip/new.tsx          create a trip (modal)
  trip/[id]/            per-trip sections: overview, itinerary, bookings, budget, checklist, journal, edit
src/
  components/           TripCard, TripProgress, TripForm, TripScaffold, TripTabBar, TextField, ChoiceChips
  config/               brand, links, free-tier limits
  constants/            domain vocabularies, currencies
  database/             migrations (schema), row mappers, repositories
  features/trips/       status/timing logic, UI actions, data hooks
  hooks/ services/ store/ types/ utils/ i18n/
  __tests__/            database (sql.js), domain, i18n, UI
docs/                   data-model.md, security.md
```

## Commands

From the repository root, in this worktree (`C:\Projets\maf-travelwise`):

```bash
pnpm install
pnpm --filter travelwise typecheck
pnpm --filter travelwise test
pnpm registry:check
cd apps/travelwise && npx expo run:android          # dev build on a device/emulator
cd apps/travelwise && npx eas-cli build -p android --profile preview      # test APK
cd apps/travelwise && npx eas-cli build -p android --profile production   # AAB (store)
```

The app uses native modules (SQLite), so it runs in a development build, not in Expo Go.

Progress, remaining work and known issues: [`factory/tracking/travelwise.md`](../../factory/tracking/travelwise.md).
