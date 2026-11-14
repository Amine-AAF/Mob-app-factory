# Data Safety declaration — checklist (AutoCare 1.0)

Answers reflect the code in this repository **with AdMob and RevenueCat enabled and no analytics
provider registered** (`services/analytics.ts` ships no provider in production). Re-check each
vendor's current Data Safety guidance (Google Mobile Ads SDK, RevenueCat) before submitting.

## Overview

| Question | Answer |
| --- | --- |
| Does the app collect or share required user data types? | **Yes** — only through the AdMob and RevenueCat SDKs |
| Encrypted in transit? | **Yes** (SDK traffic is HTTPS) |
| Way to request deletion? | **Yes** — in-app "Delete all my data" (all data is local; no account) |

## Data types

| Data type | Collected | Shared | Purpose | Source |
| --- | --- | --- | --- | --- |
| Device or other IDs (advertising ID) | Yes | Yes | Advertising, analytics, fraud prevention (subject to UMP consent) | Google Mobile Ads SDK (free tier) |
| App interactions / diagnostics | Yes | Yes | Ad delivery & measurement | Google Mobile Ads SDK |
| Purchase history | Yes | No | App functionality (entitlement) | RevenueCat (only when subscribing) |
| Vehicle data, plate, VIN, mileage, locations of stations/garages, amounts, documents, photos, notes | **No** | No | Stored on the device only, never transmitted | — |
| Location, contacts, messages, audio, calendar, health, financial info | **No** | No | — | — |

Ad requests contain **no vehicle data**: no keywords, no content URL, no custom targeting (tested
in `src/__tests__/database.test.ts`). Banners appear only on overview screens, never on entry forms.

## Product analytics (optional, off by default)

The "Share anonymous usage statistics" switch gates events such as `vehicle_added {fuel_type,count}`,
`fuel_added {full}`, `expense_added {category}`, `maintenance_added {type}`, `report_exported {format}`,
`premium_viewed {source}`, `purchase_*{plan}`. **No provider is registered in 1.0**, so nothing
leaves the device. If Firebase is added later, update this file and the Play form.

## Permissions to justify

| Permission | Why |
| --- | --- |
| `POST_NOTIFICATIONS` | Local reminders (maintenance, insurance, deadlines, tires, documents) |
| `SCHEDULE_EXACT_ALARM` / `RECEIVE_BOOT_COMPLETED` (via expo-notifications, if merged) | Keep scheduled local reminders after reboot |
| `INTERNET`, `ACCESS_NETWORK_STATE` | AdMob and Google Play Billing (RevenueCat) only |
| `com.google.android.gms.permission.AD_ID` | AdMob (declare "uses advertising ID": Yes) |
| `BILLING` | In-app subscriptions |

Blocked in `app.config.ts`: storage (read/write/media), camera, microphone, fine/coarse location,
system alert window. Files are chosen with the system picker (no storage permission).
