# FilePilot — Play Console Data Safety checklist

Answers reflect the code in this repository (v1.0.0). Re-check after adding any SDK.

## Overview

| Question | Answer | Why |
| --- | --- | --- |
| Does the app collect or share user data? | **Yes** | Only through the AdMob SDK (free tier) and, if the user opts in, anonymous analytics. Files are never collected. |
| Is all collected data encrypted in transit? | Yes | Google SDKs use TLS. |
| Can users request deletion? | Yes | In-app "Delete all my data"; analytics opt-out; uninstall removes everything. |
| Independent security review | No | |

## Data types

| Data type | Collected | Shared | Purpose | Optional | Source |
| --- | --- | --- | --- | --- | --- |
| Files and docs (photos, PDFs) | **No** | **No** | — | — | Processed on-device only; never transmitted. |
| Photos and videos | **No** | **No** | — | — | Same as above. |
| Device or other IDs (advertising ID) | Yes | Yes (Google) | Advertising, fraud prevention | No (free tier); none for Premium | AdMob SDK (`AD_ID` permission merged by the SDK). |
| App interactions (anonymous events) | Yes, only if user opts in | No | Analytics | Yes | `src/services/analytics.ts` – no provider is registered in 1.0, so nothing is sent until one is added. |
| Crash logs / diagnostics | Only if user opts in and a provider is added | No | App functionality | Yes | Error class + context only, never file names. |
| Purchase history | Yes | No (processed by Google Play / RevenueCat as processor) | App functionality | Yes | RevenueCat SDK (entitlement status). |
| Location, contacts, messages, audio, health, financial info | No | No | | | |

## Permissions in the merged manifest

`INTERNET`, `ACCESS_NETWORK_STATE` (SDKs), `com.google.android.gms.permission.AD_ID` (AdMob), `com.android.vending.BILLING` (purchases), `VIBRATE`.
Explicitly **removed**: all storage/media permissions, `MANAGE_EXTERNAL_STORAGE`, `ACCESS_MEDIA_LOCATION`, `CAMERA`, `RECORD_AUDIO`, `SYSTEM_ALERT_WINDOW` (`app.config.ts`).
Files are accessed only via the Storage Access Framework picker (per-file grant), so no "All files access" declaration is needed.

## Other declarations

- **Ads:** Yes (contains ads).
- **Target audience:** 18+ / general audience (not designed for children; avoids Families policy obligations for ads).
- **Account deletion:** not applicable (no accounts).
- **`allowBackup=false`:** user documents are excluded from Android cloud backup.
