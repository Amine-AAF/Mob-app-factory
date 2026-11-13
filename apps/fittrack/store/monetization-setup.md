# FitTrack — monetization setup

## Products (Google Play Console)
| Product id | Type | Indicative price | Notes |
| --- | --- | --- | --- |
| `fittrack_premium_monthly` | Subscription, base plan monthly, auto-renewing | 3.99 USD | Optional free trial offer (e.g. 7 days) |
| `fittrack_premium_annual` | Subscription, base plan yearly, auto-renewing | 19.99 USD | Shown first on the paywall with "Save x %" computed from store prices |
| `fittrack_premium_lifetime` | In-app product, non-consumable | 34.99 USD | |

Prices displayed in the app always come from Google Play (localized `priceString`); the manifest values are indicative only.

## RevenueCat
- Project → Android app with package `com.mobileappsfactory.fittrack` (+ `.preview` for internal builds if needed)
- Entitlement **`premium`** attached to the 3 products; offering **`default`** with monthly / annual / lifetime packages
- Public SDK key → `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` (EAS / CI secret). Without it the app runs free and the
  paywall says purchases are unavailable (no fake purchases).
- Offline: last entitlement cached in `subscription_cache` with the factory 7-day grace (`@factory/monetization`).

## AdMob
- Units: banner (adaptive) and interstitial. Development / preview builds always use Google test IDs.
- Production IDs → `ADMOB_ANDROID_APP_ID`, `EXPO_PUBLIC_ADMOB_BANNER_ID`, `EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID`.
- Placements (`src/services/ads.ts`): banners on Library, Programs list and Statistics only; one interstitial after
  adopting a template, capped (3 activities and 4 min apart, 3 grace sessions). **Never** during an active workout,
  a timer, or a logging form. Non-personalized requests; UMP consent first; privacy options in Settings.
