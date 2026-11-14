# Data Safety declaration — checklist (PlantCare 1.0)

Answers reflect the code in this repository **with AdMob and RevenueCat enabled and no analytics
SDK shipped**. Confirm against each vendor's current Data Safety guidance (Google Mobile Ads SDK,
RevenueCat) before submitting.

## Overview

| Question | Answer |
| --- | --- |
| Does your app collect or share any of the required user data types? | **Yes** (via the AdMob and RevenueCat SDKs only) |
| Is all user data encrypted in transit? | **Yes** (SDK traffic is HTTPS) |
| Do you provide a way for users to request deletion? | **Yes** — in-app "Delete all my data" (all data is local; no account exists) |

## Data types

| Data type | Collected | Shared | Purpose | Source |
| --- | --- | --- | --- | --- |
| Device or other IDs (advertising ID) | Yes | Yes (ad network) | Advertising; fraud prevention | Google Mobile Ads SDK, subject to UMP consent |
| App interactions / diagnostics | Yes | Yes | Ad delivery & measurement | Google Mobile Ads SDK |
| Purchase history | Yes | No | App functionality (entitlement) | RevenueCat, only when the user buys Premium |
| Photos | **No** | No | — | Plant photos are copied into private app storage and never transmitted |
| Personal info, location, contacts, messages, audio, health, files | **No** | No | — | Plant names, notes, journal and care history stay on the device |

Notes for reviewers:
- No account, no backend. Backups are JSON files the user shares explicitly via the system share sheet.
- The "anonymous usage statistics" toggle is off by default and no analytics provider is shipped in 1.0.
- Android auto-backup is disabled (`allowBackup: false`) so plant photos are not uploaded to Google Drive.

## Permissions

| Permission | Why |
| --- | --- |
| `POST_NOTIFICATIONS` | Optional care reminders (Android 13+), requested during onboarding only if the user enables reminders. |
| `CAMERA` | Optional: requested only when the user taps "Take photo". Gallery photos use the system Photo Picker (no storage permission). |
| `INTERNET`, `ACCESS_NETWORK_STATE` | Ads and subscriptions only. |
| `com.google.android.gms.permission.AD_ID` | Added by the Google Mobile Ads SDK. |
| `com.android.vending.BILLING` | Google Play Billing (via RevenueCat). |
| `RECEIVE_BOOT_COMPLETED` (if merged by expo-notifications) | Keep scheduled reminders after a reboot. Verify the merged manifest. |
