# SpendWise — Personal Finance & Budget Planner

*Understand Your Money. Take Control.* App #8 of the Mobile Apps Factory.

Offline-first expense tracker and budget planner: no account, no bank connection, no backend. All
financial data lives in a local SQLite database on the device.

## Run

```bash
pnpm install                      # from the repo root
cd apps/spendwise
pnpm typecheck && pnpm test
npx expo run:android              # development build (native modules: SQLite, AdMob, RevenueCat)
```

Builds (EAS, see `eas.json`):

```bash
eas build -p android --profile preview      # internal test APK (Google test ads)
eas build -p android --profile production   # AAB for Google Play (needs production env vars)
```

Local APK without EAS: `npx expo prebuild -p android --clean && cd android && ./gradlew assembleRelease`.

## Structure

```
app/                         Expo Router screens
  (tabs)/                    Home · Transactions · Budgets · Reports · Settings
  transaction.tsx            add / edit / duplicate / delete a transaction (modal)
  accounts/ categories/ budgets/ recurring/ subscriptions/ goals/ calculators/
  onboarding.tsx data.tsx currency.tsx paywall.tsx privacy.tsx
src/
  utils/money.ts dates.ts    integer minor units, ISO 4217, exact parsing/formatting, BigInt rationals
  features/                  pure domain logic (balances, budgets, recurring schedule, subscriptions,
                             savings goals, reports & insights, calculators, CSV & backup, dashboard loader)
  database/                  migrations + repositories (expo-sqlite / sql.js in tests)
  services/                  boot, ads (AdMob + UMP), monetization (RevenueCat), analytics, notifications, files
  components/ hooks/ store/ i18n/ constants/ types/
docs/                        financial-calculations.md · csv-format.md
store/                       Google Play listing, Data Safety, privacy policy, graphics
brand/mark.mjs               original logo (used by `pnpm brand-assets apps/spendwise`)
```

Key rules (details in [docs/financial-calculations.md](docs/financial-calculations.md)):
transfers are one row and never counted as income/spending · balances are recomputed from initial
balance + transactions · currencies are never mixed without a manual rate · recurring generation is
idempotent through the `recurring_occurrences` ledger and never records future dates · old budgets are
never deleted when a month changes.

## Configuration

Copy `.env.example` to `.env`. Development and preview builds always use Google's **test** ad units.
Production needs `ADMOB_ANDROID_APP_ID`, `EXPO_PUBLIC_ADMOB_*`, `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`,
`EXPO_PUBLIC_PRIVACY_URL`, `EAS_PROJECT_ID`. Products: `spendwise_premium_monthly`,
`spendwise_premium_annual`, `spendwise_premium_lifetime` (prices set in Play Console, shown localized).
