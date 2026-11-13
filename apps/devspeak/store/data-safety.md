# Data Safety declaration — checklist (DevSpeak 1.0)

Answers reflect the code in this repository **with AdMob and RevenueCat enabled and Firebase NOT
enabled**. If Firebase Analytics/Crashlytics is added, update the "Analytics" and "Crash logs" rows.
SDK behaviour: confirm against each vendor's current Data Safety guidance
(Google Mobile Ads SDK, RevenueCat) before submitting.

## Overview questions

| Question | Answer |
| --- | --- |
| Does your app collect or share any of the required user data types? | **Yes** (via the AdMob and RevenueCat SDKs) |
| Is all user data encrypted in transit? | **Yes** (SDK traffic is HTTPS) |
| Do you provide a way for users to request deletion? | **Yes** — in-app "Delete all my data" (local data). No server-side account exists. |

## Data types

| Data type | Collected | Shared | Purpose | Optional? | Source |
| --- | --- | --- | --- | --- | --- |
| Device or other IDs (advertising ID) | Yes | Yes (ad network) | Advertising or marketing; Analytics; Fraud prevention | Required for ad-supported free tier, subject to UMP consent | Google Mobile Ads SDK |
| App interactions / diagnostics | Yes | Yes | Advertising (ad delivery & measurement) | — | Google Mobile Ads SDK |
| Purchase history | Yes | No | App functionality (entitlement verification) | Only when the user subscribes | RevenueCat |
| App activity, personal info, location, contacts, messages, photos, audio files | **No** | No | — | — | Learning progress and voice recordings stay on device and are never transmitted |

Notes for reviewers:
- Microphone recordings are stored in the app cache only and never uploaded.
- The optional first name is stored locally only.
- "Anonymous usage statistics" toggle exists but no analytics SDK is shipped in 1.0.

## Permissions to justify

| Permission | Why |
| --- | --- |
| `RECORD_AUDIO` | Speaking practice: record and replay yourself. Requested on first tap of "Record". |
| `POST_NOTIFICATIONS` | Optional daily learning reminder (Android 13+). Requested when enabling reminders. |
| `INTERNET`, `ACCESS_NETWORK_STATE` | Ads and subscriptions. |
| `com.google.android.gms.permission.AD_ID` | Added by the Google Mobile Ads SDK. Declare "Yes" in the Advertising ID form. |
| `com.android.vending.BILLING` | Google Play Billing (via RevenueCat). |
| `SCHEDULE_EXACT_ALARM` / `RECEIVE_BOOT_COMPLETED` (if added by expo-notifications) | Re-schedule the daily reminder after reboot. Verify the merged manifest after `expo prebuild`. |

Storage permissions are explicitly blocked in `app.config.ts`. Backup uses the system share sheet
and file picker (no broad storage access).
