# Data Safety declaration — checklist (SpendWise 1.0)

Answers reflect the code in this repository **with AdMob and RevenueCat enabled and NO analytics SDK
shipped** (the analytics facade only has a dev console provider). If Firebase is added later, update the
"Analytics" and "Crash logs" rows. Confirm SDK behaviour against each vendor's current Data Safety
guidance (Google Mobile Ads SDK, RevenueCat) before submitting.

## Overview questions

| Question | Answer |
| --- | --- |
| Does your app collect or share any of the required user data types? | **Yes** (only via the AdMob and RevenueCat SDKs) |
| Is all user data encrypted in transit? | **Yes** (SDK traffic is HTTPS). Financial data is never transmitted. |
| Do you provide a way for users to request deletion? | **Yes** — in-app "Delete all my data" (all local data). No server-side account exists. |

## Data types

| Data type | Collected | Shared | Purpose | Notes |
| --- | --- | --- | --- | --- |
| Device or other IDs (advertising ID) | Yes | Yes (ad network) | Advertising; Fraud prevention | Google Mobile Ads SDK, free tier only, subject to UMP consent |
| App interactions / diagnostics | Yes | Yes | Advertising (delivery & measurement) | Google Mobile Ads SDK |
| Purchase history | Yes | No | App functionality (entitlement) | RevenueCat, only when the user buys Premium |
| **Financial info** (purchase history of the user's own spending, balances, account names, transactions) | **No** | No | — | Stored only in the local SQLite database; never transmitted to any server, ad network or analytics |
| Personal info, location, contacts, messages, photos, audio, calendar | **No** | No | — | Not accessed |

Reviewer notes:
- Ad requests carry no keywords, content URL or custom targeting: nothing about the user's finances reaches AdMob.
- Banners appear only on Settings and the Calculators hub (no personal amounts on those screens).
- Exports/backups are created locally and handed to the Android share sheet; the user picks the destination.
- `allowBackup=false`: Android auto-backup does not copy the database to Google Drive.
- No encryption beyond Android's app sandbox is claimed (see privacy policy).

## Permissions to justify

| Permission | Why |
| --- | --- |
| `POST_NOTIFICATIONS` | Optional budget alerts and subscription reminders (Android 13+). Requested only when enabling them. |
| `INTERNET`, `ACCESS_NETWORK_STATE` | Ads and Google Play purchases only. |
| `com.google.android.gms.permission.AD_ID` | Added by the Google Mobile Ads SDK. Declare "Yes" in the Advertising ID form. |
| `com.android.vending.BILLING` | Google Play Billing (via RevenueCat). |
| `SCHEDULE_EXACT_ALARM` / `RECEIVE_BOOT_COMPLETED` (if merged by expo-notifications) | Re-schedule reminders after reboot. Verify the merged manifest after `expo prebuild`. |

Blocked in `app.config.ts`: storage, overlay, microphone, camera and location permissions.

## Financial features declaration (Play Console)

Select: personal finance / budgeting app **without** financial transactions, loans, crypto, trading or banking.
