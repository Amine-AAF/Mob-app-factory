# Data Safety declaration — LearnSphere 1.0

Answers reflect this repository **with AdMob and RevenueCat enabled and no analytics provider shipped**.
Confirm each SDK's current Data Safety guidance (Google Mobile Ads SDK, RevenueCat) before submitting.

| Question | Answer |
| --- | --- |
| Does the app collect or share user data? | **Yes**, only through the AdMob and RevenueCat SDKs |
| Encrypted in transit? | **Yes** (SDK traffic over HTTPS) |
| Can users request deletion? | **Yes** — Settings › Backup & data › Delete all my data (local). No server account exists. |

| Data type | Collected | Shared | Purpose | Source |
| --- | --- | --- | --- | --- |
| Device or other IDs (advertising ID) | Yes | Yes | Advertising, fraud prevention (free plan, after UMP consent) | Google Mobile Ads SDK |
| App interactions / diagnostics | Yes | Yes | Ad delivery and measurement | Google Mobile Ads SDK |
| Purchase history | Yes | No | Verify Premium entitlement | RevenueCat |
| Notes, flashcards, quiz answers, study plans, files, name | **No** | **No** | Stored on device only, never transmitted, never given to ad networks | — |

## Permissions

| Permission | Why |
| --- | --- |
| `POST_NOTIFICATIONS` | Optional reminders and focus phase alerts (asked only when enabled) |
| `INTERNET`, `ACCESS_NETWORK_STATE` | Ads and purchases only |
| `com.google.android.gms.permission.AD_ID` | Added by Google Mobile Ads SDK |
| `com.android.vending.BILLING` | Google Play Billing via RevenueCat |
| `RECEIVE_BOOT_COMPLETED` / exact alarm (if merged by expo-notifications) | Keep scheduled reminders after reboot — verify the merged manifest |

Blocked in `app.config.ts`: external storage, media, microphone, overlay. PDFs and backups use the
system document picker and share sheet. Android auto-backup is disabled (`allowBackup: false`).
