# Data Safety declaration — checklist (CalcWise 1.0)

Answers reflect the code in this repository **with AdMob and RevenueCat enabled and no analytics
provider registered** (`src/services/analytics.ts` ships with no remote provider). If a provider is
added later, update the "App activity" row. Confirm SDK behaviour against each vendor's current
Data Safety guidance (Google Mobile Ads SDK, RevenueCat) before submitting.

## Overview questions

| Question | Answer |
| --- | --- |
| Does your app collect or share any of the required user data types? | **Yes** (via the AdMob and RevenueCat SDKs only) |
| Is all user data encrypted in transit? | **Yes** (SDK traffic is HTTPS) |
| Do you provide a way for users to request deletion? | **Yes** — in-app "Delete all my data" (all data is local). No server-side account exists. |

## Data types

| Data type | Collected | Shared | Purpose | Optional? | Source |
| --- | --- | --- | --- | --- | --- |
| Device or other IDs (advertising ID) | Yes | Yes (ad network) | Advertising or marketing; Analytics; Fraud prevention | Free tier, subject to UMP consent | Google Mobile Ads SDK |
| App interactions / diagnostics | Yes | Yes | Advertising (ad delivery & measurement) | — | Google Mobile Ads SDK |
| Purchase history | Yes | No | App functionality (entitlement verification) | Only when the user buys Premium | RevenueCat / Google Play Billing |
| Financial info, personal info, location, contacts, messages, photos, files, app activity | **No** | No | — | — | Expressions, amounts, simulations and history are stored on the device only and never transmitted |

Notes for reviewers:
- CalcWise has no backend. History, shortcuts and preferences are in local SQLite / AsyncStorage.
- Loan and savings figures entered by users are **not** "financial information" collected by the app:
  they never leave the device (`src/__tests__/services.test.ts` checks there is no network call in app code).
- The "anonymous usage statistics" switch is off by default; no analytics SDK is shipped in 1.0, so
  nothing is sent even when it is on. Allowed event parameters are restricted to tool ids, modes,
  sources and plan periods (tested).
- `allowBackup: false`: Android auto-backup is disabled, so local data is not copied to Google Drive.

## Permissions to justify

| Permission | Why |
| --- | --- |
| `INTERNET`, `ACCESS_NETWORK_STATE` | Ads and Premium purchases only. All calculations work offline. |
| `com.google.android.gms.permission.AD_ID` | Added by the Google Mobile Ads SDK. Declare "Yes" in the Advertising ID form. |
| `com.android.vending.BILLING` | Google Play Billing (via RevenueCat). |
| `VIBRATE` (if merged by expo-haptics) | Optional key-press haptics (can be turned off in Settings). |

Blocked in `app.config.ts`: storage, camera, microphone and overlay permissions. Verify the merged
manifest after `expo prebuild` (`android/app/src/main/AndroidManifest.xml`) before each release.

## Financial features declaration

Play Console → App content → **Financial features**: CalcWise provides *calculators* (loan and savings
estimates) but **does not** offer loans, credit, banking, investment or payment services. Answer
"My app doesn't provide any financial features" unless Play's current form lists "calculators" as a
separate category; the in-app disclaimer states results are estimates, not a credit offer or advice.
Re-check the form wording at submission time.
