# Data Safety declaration — checklist (Eventora 1.0)

Answers reflect this code **with AdMob and RevenueCat enabled, no analytics SDK shipped**. Re-check
each SDK's current Data Safety guidance (Google Mobile Ads SDK, RevenueCat) before submitting.

## Overview

| Question | Answer |
| --- | --- |
| Does the app collect or share required user data types? | **Yes** (only via the AdMob and RevenueCat SDKs) |
| Encrypted in transit? | **Yes** (SDK traffic over HTTPS) |
| Deletion request mechanism? | **Yes** — in-app "Delete all my data" (all data is local; no server account) |

## Data types

| Data type | Collected | Shared | Purpose | Source |
| --- | --- | --- | --- | --- |
| Device or other IDs (advertising ID) | Yes | Yes (ad network) | Advertising; fraud prevention | Google Mobile Ads SDK, subject to UMP consent; free tier only |
| App interactions / diagnostics (ad SDK) | Yes | Yes | Advertising | Google Mobile Ads SDK |
| Purchase history | Yes | No | App functionality (entitlement) | RevenueCat, only when subscribing |
| Personal info, contacts, messages, photos, files, calendar, location | **No** | No | — | Guest lists, photos, receipts and contracts are stored on device only and never transmitted by the app |

Reviewer notes:
- Guest names, phone numbers, e-mails and dietary preferences are entered by the user about third parties and are **stored locally only**. They leave the device only if the user explicitly shares an export via the Android share sheet (user-initiated transfer).
- The app does not request `READ_CONTACTS`. Images come from the system Photo Picker.
- Notifications are local; no push token.

## Permissions

| Permission | Why |
| --- | --- |
| `POST_NOTIFICATIONS` | Optional reminders (tasks, payments, RSVP follow-up, event, vendor appointments). Requested from onboarding or settings. |
| `INTERNET`, `ACCESS_NETWORK_STATE` | Ads and subscriptions only. |
| `com.google.android.gms.permission.AD_ID` | Google Mobile Ads SDK. Declare "Yes" in the Advertising ID form. |
| `com.android.vending.BILLING` | Google Play Billing (RevenueCat). |
| `RECEIVE_BOOT_COMPLETED` / `SCHEDULE_EXACT_ALARM` (if merged by expo-notifications) | Keep scheduled reminders after reboot. Verify the merged manifest. |

Blocked in `app.config.ts`: storage, media, camera, microphone, contacts, overlay.
