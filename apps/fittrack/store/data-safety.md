# Google Play — Data safety (FitTrack 1.0)

Answers for the Play Console form. Keep in sync with `src/services/analytics.ts`, `src/services/ads.ts`.

## Summary
- **Data collected by the developer: none by default.** All workouts, measurements, photos and settings are
  stored only on the device (SQLite + private files). No account, no server.
- **Encryption in transit:** yes (any SDK traffic uses HTTPS).
- **Deletion:** users can delete all data in the app (Profile › Data & backup › Delete everything);
  uninstalling also removes it. Users can export their data (JSON, free).

## Third-party SDKs (data shared/collected by SDKs)
| SDK | When | Data types (Play categories) | Purpose |
| --- | --- | --- | --- |
| Google Mobile Ads (AdMob) + UMP | Free version, after consent | Device or other IDs (advertising ID), App interactions, Diagnostics, approximate location derived from IP by Google | Advertising (non-personalized requests), fraud prevention |
| RevenueCat / Google Play Billing | When the user opens the paywall / buys | Purchase history, App user ID (anonymous RevenueCat ID) | App functionality (entitlements) |
| Analytics provider (none configured in 1.0) | Only if the user opts in | App interactions (anonymous event names) | Analytics |

## Never collected or shared
Health and fitness data (workouts, loads, reps, body measurements, cardio, photos), personal info (name,
email), contacts, location (no GPS), files, messages, microphone. These stay on the device.

## Form answers
- Does your app collect or share any of the required user data types? **Yes** (because of the AdMob and RevenueCat SDKs, listed above).
- Is all of the user data collected by your app encrypted in transit? **Yes**.
- Do you provide a way for users to request that their data is deleted? **Yes** (in-app deletion; ad ID can be reset in Android settings).
- Health & fitness category: **Not collected** (stored on device only, never transmitted).
