# Data Safety declaration — checklist (Logic Quest 1.0)

Answers reflect the code in this repository **with AdMob and RevenueCat enabled and no analytics SDK
shipped** (the in-app "anonymous usage statistics" toggle exists, but no provider is registered in 1.0 —
see `src/services/analytics.ts`). If Firebase is added, update the "App activity" and "Crash logs" rows.
Confirm against each vendor's current Data Safety guidance (Google Mobile Ads SDK, RevenueCat) before submitting.

## Overview questions

| Question | Answer |
| --- | --- |
| Does your app collect or share any of the required user data types? | **Yes** (via the AdMob and RevenueCat SDKs) |
| Is all user data encrypted in transit? | **Yes** (SDK traffic is HTTPS) |
| Do you provide a way for users to request deletion? | **Yes** — in-app "Delete all my data" (all data is local). No account or server exists. |

## Data types

| Data type | Collected | Shared | Purpose | Optional? | Source |
| --- | --- | --- | --- | --- | --- |
| Device or other IDs (advertising ID) | Yes | Yes (ad network) | Advertising or marketing; Analytics; Fraud prevention | Required for the ad-supported free tier, subject to UMP consent | Google Mobile Ads SDK |
| App interactions / diagnostics | Yes | Yes | Advertising (ad delivery & measurement) | — | Google Mobile Ads SDK |
| Purchase history | Yes | No | App functionality (entitlement verification) | Only when the user buys | RevenueCat |
| Personal info, location, contacts, messages, photos, audio, files, health, financial info | **No** | No | — | — | Game progress, statistics and settings stay on the device |

Notes for reviewers:
- No account, no name, no email. Game history lives only in the on-device SQLite database.
- Backups are created only when the user taps "Export" and are shared through the Android share sheet by the user.
- Premium users and buyers of "Remove ads" never receive ad requests.

## Permissions to justify

| Permission | Why |
| --- | --- |
| `INTERNET`, `ACCESS_NETWORK_STATE` | Google Play Billing (via RevenueCat) and ads. Gameplay itself works offline. |
| `POST_NOTIFICATIONS` (Android 13+) | Optional daily reminder, requested only when the player enables it. |
| `SCHEDULE_EXACT_ALARM` / `RECEIVE_BOOT_COMPLETED` (if added by expo-notifications) | Keep the local daily reminder after a reboot. Verify the merged manifest after `expo prebuild`. |
| `com.google.android.gms.permission.AD_ID` | Added by the Google Mobile Ads SDK. Declare advertising ID use in Play Console. |

Blocked in `app.config.ts`: storage, microphone and system-alert-window permissions.

## Ads & families policy

- The app is **not** directed at children (target audience 18+, see content-rating.md). Do not opt into the Families program.
- Ads are never shown during a puzzle or before an answer is validated: banners on browse screens only; interstitials only when leaving a results screen, at most one per 3 games and 4 minutes, after 2 grace sessions; rewarded ads only when the player chooses to watch one for a hint (`@factory/monetization` `shouldShowInterstitial`, tested).
