# Logic Quest — monetization setup (Play Console, RevenueCat, AdMob)

Prices in `app.manifest.json` are **indicative only**; the app always displays the localized
`priceString` returned by Google Play. Nothing is simulated: without a RevenueCat key the paywall
says purchases are unavailable.

## 1. Google Play products

| Product id | Type | Indicative price | Grants |
| --- | --- | --- | --- |
| `logicquest_premium_monthly` | Subscription, base plan monthly | US$2.99 | entitlement `premium` |
| `logicquest_premium_annual` | Subscription, base plan yearly (optional free trial offer) | US$14.99 | entitlement `premium` |
| `logicquest_remove_ads` | One-time product (non-consumable) | US$3.99 (suggestion) | entitlement `no_ads` |

Use Play Console pricing templates for local prices. Test with license testers on the internal track.

## 2. RevenueCat (one project per factory app)

- Entitlements: `premium` (both subscriptions), `no_ads` (`logicquest_remove_ads`).
- Offering `default` with packages: `$rc_monthly`, `$rc_annual`, `$rc_lifetime` (→ remove ads).
- Public Android SDK key → `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` (GitLab, environment scope `production/logic-quest`).
- Offline behaviour (tested): Premium cached up to 7 days and never past its expiry; `no_ads` (lifetime) trusted from cache.

## 3. AdMob (Logic Quest's own app in AdMob)

| Placement | Variable | Policy (enforced in code) |
| --- | --- | --- |
| App id | `ADMOB_ANDROID_APP_ID` | required for production builds (build fails otherwise) |
| Banner | `EXPO_PUBLIC_ADMOB_BANNER_ID` | Home, Play, Stats only; never on a puzzle screen |
| Rewarded | `EXPO_PUBLIC_ADMOB_REWARDED_ID` | only when the player taps "Watch a short ad for a hint"; reward granted on `EARNED_REWARD` only; max 5/day |
| Interstitial | `EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID` | only when leaving a results screen; ≥ 3 games and ≥ 4 min apart; not during the first 2 app sessions |

Development and preview builds always use Google's public test IDs (`resolveAdUnits`,
`resolveInterstitialUnit` in `@factory/monetization`). Configure the UMP consent message (GDPR) in
AdMob › Privacy & messaging, and publish `app-ads.txt` on the developer website.

## 4. What is free vs Premium (single source: `src/engine/progression.ts` `PREMIUM`)

| Free | Premium |
| --- | --- |
| All 4 categories, easy + medium (≈ 220 puzzles) | + 99 hard puzzles |
| Daily challenge, timed 30 s / 60 s | + Mixed Gauntlet, 3-minute timed games |
| 3 hints per day (+ up to 5 via rewarded ads) | Unlimited hints |
| Basic statistics | Advanced statistics |
| Ads | No ads |
