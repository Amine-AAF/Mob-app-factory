# CalcWise – Smart Calculator

*A smarter calculator for everyday life.* App #4 of Mobile Apps Factory — Expo SDK 58, Expo Router,
TypeScript strict, offline-first, no account, no backend.

## Features

| Tool | Free | Premium |
| --- | --- | --- |
| Standard & scientific calculator (safe decimal engine, history) | ✓ | ✓ |
| Percentages (7 modes), discounts, VAT, best deal per kg/L | ✓ | ✓ |
| Tip & bill split (exact or rounded shares) | ✓ | ✓ |
| Unit converter (9 categories, exact definitions) | ✓ | ✓ |
| Loan: payment, totals, yearly table | ✓ | ✓ |
| Loan: monthly amortization table, comparison, early repayment | 1 h via rewarded ad | ✓ |
| Savings: result + growth chart | ✓ | ✓ |
| Savings: yearly table | 1 h via rewarded ad | ✓ |
| History | latest 50 | unlimited |
| Home shortcuts (favorites) | 3 | unlimited |
| Color palettes | 1 | 5 |
| Ads | banner on Home/Tools/History, capped interstitial when leaving a tool | none |

Ads never appear on the keypad, a tool form or a result. See `src/services/ads.ts` for the rules.

## Structure

```
app/                     Expo Router screens: (tabs)/{index,calculator,tools,history,settings},
                         tools/{percentage,discount,tip,units,loan,savings}, onboarding, paywall, privacy
src/services/            MathematicalEngine, calculators/* (Percentage, Discount, Tip, Loan, Savings,
                         UnitConverter), CalculationHistory, monetization, ads, analytics, boot
src/features/            calculator keypad state machine + layouts, history formatting, navigation
src/components/          Keypad, fields (NumberField, ResultCard…), ToolScreen, PremiumGate, charts, tables
src/hooks/ store/ utils/ constants/ types/ database/ i18n/locales/{en,fr,es}.json
src/__tests__/           engine, calculators, keypad, formats, i18n, SQLite, services, UI
brand/mark.mjs           Original logo (input of `pnpm brand-assets apps/calcwise`)
store/                   Play listing (en/fr/es), Data Safety, privacy policy, rating, screenshots, release
docs/FORMULAS.md         Every formula and rounding convention
```

Calculations are pure TypeScript services independent of the UI and tested on their own.
Factory packages used: `app-config`, `design-system`, `localization`, `storage`, `analytics`,
`monetization`, `testing` (and `app-core` as a declared dependency). `notifications` is not used: CalcWise
sends no notifications.

## Commands

```bash
pnpm install                                   # at the repo root
pnpm --filter calcwise typecheck
pnpm --filter calcwise test                    # 150+ tests
cd apps/calcwise && npx expo start --dev-client   # needs a development build (native modules)
npx expo run:android                           # local dev build (Android SDK required)
eas build -p android --profile preview         # test APK (internal distribution)
eas build -p android --profile production      # release AAB (not submitted)
```

Configuration: copy `.env.example` to `.env`. Without RevenueCat/AdMob variables the app runs as a free
app with Google test ads and a Premium screen that says purchases are unavailable — nothing is faked.
Release steps: [store/release.md](store/release.md).
