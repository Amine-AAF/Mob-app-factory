# Data Safety declaration — checklist (HabitFlow 1.0)

Answers reflect this repository **with AdMob and RevenueCat enabled and no analytics provider shipped**
(the in-app "anonymous usage statistics" toggle exists, but no provider is registered in 1.0 — see
`src/services/analytics.ts`). If Firebase is added, update "App activity" and "Crash logs".
Check each vendor's current Data Safety guidance (Google Mobile Ads SDK, RevenueCat) before submitting.

## Overview

| Question | Answer |
| --- | --- |
| Does the app collect or share required user data types? | **Yes** (through the AdMob and RevenueCat SDKs only) |
| Is all user data encrypted in transit? | **Yes** (SDK traffic is HTTPS) |
| Can users request deletion? | **Yes** — in-app "Delete all my data" (all data is local). No account or server exists. |

## Data types

| Data type | Collected | Shared | Purpose | Optional? | Source |
| --- | --- | --- | --- | --- | --- |
| Device or other IDs (advertising ID) | Yes | Yes (ad network) | Advertising; analytics; fraud prevention | Free tier only, subject to UMP consent | Google Mobile Ads SDK |
| App interactions / diagnostics | Yes | Yes | Ad delivery & measurement | — | Google Mobile Ads SDK |
| Purchase history | Yes | No | App functionality (entitlement) | Only when buying | RevenueCat |
| Habits, notes, check-ins, tasks, reminders | **No** (device only) | No | — | — | On-device SQLite |
| Personal info, location, contacts, health, financial info, files, photos, audio | **No** | No | — | — | — |

Notes for reviewers: HabitFlow is not a health app and makes no health claims. Habit names and notes never leave
the device. Backups are created only when the user taps Export and are shared by the user through the Android
share sheet. Premium users never receive ad requests.

## Analytics event catalogue (only if a provider is enabled **and** the user opts in)

`onboarding_completed`, `habit_created`, `habit_completed`, `habit_archived`, `planner_task_created`,
`calendar_opened`, `achievement_unlocked`, `premium_viewed`, `purchase_started`, `purchase_completed`.
Parameters are enums and counters only (category, frequency type, tracking mode, plan id…) — never names,
notes, dates or free text. `@factory/analytics` also drops PII-looking parameters.

## Permissions

| Permission | Why |
| --- | --- |
| `INTERNET`, `ACCESS_NETWORK_STATE` | Google Play Billing (RevenueCat) and ads. Every feature works offline. |
| `POST_NOTIFICATIONS` (Android 13+) | Optional local reminders, requested only when the user enables one. |
| `RECEIVE_BOOT_COMPLETED` / `SCHEDULE_EXACT_ALARM` (if merged by expo-notifications) | Keep local reminders after a reboot. Verify the merged manifest after `expo prebuild`; HabitFlow only uses daily/weekly calendar triggers. |
| `com.google.android.gms.permission.AD_ID` | Added by the Google Mobile Ads SDK; declare advertising ID use. |

Blocked in `app.config.ts`: external storage, microphone, system alert window.
