# Data Safety declaration — checklist (TravelWise 1.0)

The answers below reflect this repository with **AdMob and RevenueCat enabled and no analytics
provider** (the opt-in analytics toggle exists, but no provider is registered in production).
Before submitting, re-check the merged Android manifest after `expo prebuild`, and each vendor's
current Data Safety guidance (Google Mobile Ads SDK, RevenueCat).

## Overview questions

| Question | Answer |
| --- | --- |
| Does your app collect or share any of the required user data types? | **Yes**, through the AdMob and RevenueCat SDKs only |
| Is all user data encrypted in transit? | **Yes** (SDK traffic uses HTTPS) |
| Do you provide a way for users to request that their data is deleted? | **Yes**: in-app "Delete all my data" (local data). There is no account and no server. |

## Data types

| Data type | Collected | Shared | Purpose | Optional | Source |
| --- | --- | --- | --- | --- | --- |
| Device or other IDs (advertising ID) | Yes | Yes (ad network) | Advertising; fraud prevention | Free tier only, subject to UMP consent | Google Mobile Ads SDK |
| App interactions / diagnostics (ad delivery) | Yes | Yes | Advertising | Free tier only | Google Mobile Ads SDK |
| Purchase history | Yes | No | App functionality (Premium entitlement) | Only when buying Premium | RevenueCat / Google Play Billing |
| Personal info, location, photos, files and docs, calendar, contacts, messages, financial info, app activity | **No** | No | — | — | Trips, bookings, expenses, documents, photos and journal stay on the device and are never transmitted |

Notes for reviewers:
- Travel documents and photos are copied into the app's private storage. They are never uploaded.
  They are not encrypted by the app; we rely on Android's device encryption and say so in the app.
- Coordinates of places are typed by the user. The app has no location permission.
- Booking references and expenses are typed by the user and stay on the device. Card numbers are rejected.

## Permissions to justify

| Permission | Why | When requested |
| --- | --- | --- |
| `POST_NOTIFICATIONS` | Optional local reminders for pre-departure tasks | When the user sets a reminder |
| `USE_BIOMETRIC` | Optional lock of the Documents section (BiometricPrompt, device PIN fallback) | When the user turns the lock on |
| `INTERNET`, `ACCESS_NETWORK_STATE` | Ads (free tier) and purchases only. All features work offline. | — |
| `com.google.android.gms.permission.AD_ID` | Added by the Google Mobile Ads SDK. Answer "Yes" in the Advertising ID form. | — |
| `com.android.vending.BILLING` | Google Play Billing (RevenueCat) | — |
| `RECEIVE_BOOT_COMPLETED` / `SCHEDULE_EXACT_ALARM` (if merged by expo-notifications) | Keep scheduled reminders after a reboot. Verify the merged manifest. | — |

Explicitly **blocked** in `app.config.ts`: storage, media (images/video), camera, location,
microphone, system alert window. Files and photos come from the system pickers.

## Families / target audience

Target audience: **18+** (travel planning, purchases, ads). The app is not designed for children,
so do not opt in to the Designed for Families program.
