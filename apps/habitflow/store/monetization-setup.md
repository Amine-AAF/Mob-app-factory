# Monetization setup (HabitFlow)

Model **hybrid**: AdMob (free tier) + Premium (RevenueCat over Google Play Billing). The free tier stays complete
for daily use: tracking, streaks, calendar, reminders, planner and backup are never gated.

## Google Play products (Play Console › Monetize)

| Product id | Type | Indicative price to test |
| --- | --- | --- |
| `habitflow_premium_monthly` | Subscription, monthly base plan | $2.99 |
| `habitflow_premium_annual` | Subscription, yearly base plan | $14.99 |
| `habitflow_premium_lifetime` | One-time product (non-consumable) | $24.99 |

Prices are set and localized in Play Console; the app only displays the store `priceString`.

## RevenueCat

- Entitlement **`premium`** attached to the three products; offering **`default`** with packages
  `$rc_monthly`, `$rc_annual`, `$rc_lifetime`.
- Public Android SDK key → `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` (EAS secret / protected CI variable).
- Without the key, the paywall says purchases are unavailable. There is no simulated purchase.
- Offline: the last confirmed state is cached with the factory 7-day grace period (`resolveEntitlement`).

## Premium gates (code)

| Gate | Where |
| --- | --- |
| More than 8 active habits | `FREE_LIMITS.activeHabits` (`src/constants`) — Habits tab and editor |
| 31 of 44 templates (13 free) | `TEMPLATES[].free` (`src/features/templates/data.ts`) |
| Advanced insights (ranking, 8-week view) | Insights tab — also unlockable for 24 h with a rewarded ad |
| Extra color palettes | `PALETTES` (`src/config/brand.ts`) |
| No ads | `useIsPremium()` wherever ads are evaluated |

Not gated, by decision: JSON export/import (data portability). Android widgets are not implemented (see tracking file).

## AdMob

| Placement | Where | Rules |
| --- | --- | --- |
| Banner | Bottom of **Habits** and **Insights** only | Never on Today (check-ins), Calendar, day detail, editor, reminders |
| Interstitial | After saving a **new** habit | `shouldShowInterstitial`: grace of 3 sessions, ≥ 3 creations and ≥ 4 min apart |
| Rewarded | Insights › "Watch an ad to unlock for 24 h" | Explicit tap only; reward granted on `EARNED_REWARD` only |

Development and preview builds always use Google's public test IDs (`@factory/monetization`). Production IDs:
`ADMOB_ANDROID_APP_ID`, `EXPO_PUBLIC_ADMOB_BANNER_ID`, `EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID`,
`EXPO_PUBLIC_ADMOB_REWARDED_ID` (environment scope `production/habitflow`). UMP consent is gathered before any request;
Settings › Privacy explains ads.
