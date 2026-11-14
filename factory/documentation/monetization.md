# Monetization setup (DevSpeak)

DevSpeak uses a hybrid model: **free with ads** + **Premium subscription** (no ads, all content).
Without external configuration the app runs as a free app: the paywall states that subscriptions are
unavailable in this build. **Purchases are never simulated.**

## Free vs Premium (as implemented)

| Feature | Free | Premium |
| --- | --- | --- |
| Lessons | 21 free lessons (7 workplace, 8 technical, 6 interview; `premium: false` in content) | All 66 |
| Interview paths | Free lessons in junior, java, react, devops, qa paths | All 8 paths |
| Vocabulary | 40 free words (definitions locked for others) | 100 words |
| Flashcards (SRS) | Free words, "All words" deck | All words + saved-words deck |
| Speaking practice | 5 exercises/day (+5 via an opt-in rewarded ad) | Unlimited |
| Daily challenge, quizzes, streaks, XP, calendar, achievements | ✓ | ✓ |
| Detailed stats per module, quiz accuracy | — | ✓ |
| Ads | Banner on Learn/Module/Words lists after 2 sessions | None |

Ads never appear inside lessons, quizzes, flashcards or speaking exercises, and are visually
separated and labelled ("Advertisement").

## RevenueCat (subscriptions)

`react-native-purchases` works in Expo **development/production builds** (not Expo Go).

1. Play Console → create the app (`com.devspeak.app`) → Monetize → Subscriptions:
   - `devspeak_premium_monthly` (base plan monthly, ~USD 3.99)
   - `devspeak_premium_annual` (base plan yearly, ~USD 19.99)
   Prices are set per country in Play Console; the app only displays `priceString` from the store.
2. Upload a first AAB to the internal track (required before products can be fetched).
3. RevenueCat → new project → Android app → service-account credentials (Play Developer API).
4. Entitlement `premium`; attach both products. Offering `default` with `$rc_monthly` and `$rc_annual` packages.
5. Copy the **public Android SDK key** → GitLab protected variable `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`
   (and an EAS environment variable for local EAS builds).
6. Add license testers in Play Console; test purchase, cancel, restore and expiry on a real device.

Implementation: `packages/monetization/src/revenuecat.ts` (adapter), `apps/devspeak/src/services/monetization.ts`
(orchestration, SQLite `subscription_cache`). Offline: a verified premium state is honoured until its
expiry and for at most 7 days without re-verification.

## Interstitials and secondary products (added for Logic Quest)

- `resolveInterstitialUnit({ isDev, production })`: test unit in development/preview, never a test unit
  (and no fallback) in production.
- `shouldShowInterstitial(...)`: only at a natural break, for free users with consent, after the grace
  sessions, at most one per `minActivitiesBetween` (3) activities and `minIntervalMs` (4 min).
- `EntitlementState.activeEntitlements` (filled by the RevenueCat adapter) lets an app sell a one-time
  product with its own entitlement (Logic Quest: `no_ads`). See `apps/logic-quest/store/monetization-setup.md`.

All additions are optional: apps that don't use them (DevSpeak) are unaffected.

## AdMob (ads)

1. AdMob → add Android app → create **Banner (adaptive)** and **Rewarded** units.
2. Production IDs → protected CI variables:
   `ADMOB_ANDROID_APP_ID`, `EXPO_PUBLIC_ADMOB_BANNER_ID`, `EXPO_PUBLIC_ADMOB_REWARDED_ID`.
   Production builds fail fast if `ADMOB_ANDROID_APP_ID` is missing.
3. AdMob → Privacy & messaging → create a **GDPR consent message** (and US state message if relevant).
   The app calls `AdsConsent.gatherConsent()` and only requests ads when `canRequestAds` is true;
   Settings shows "Ad privacy choices" when the form is required.
4. Add `app-ads.txt` on the developer website listed in Play Console.

Development and preview builds **always** use Google's public test IDs (`resolveAdUnits`), even if
production IDs are present. Production never falls back to test IDs (tested).
