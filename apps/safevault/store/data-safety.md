# Google Play — Data safety form (SafeVault)

Answers reflect the code as of v0.1.0. Re-check before each submission (`docs/SECURITY-CHECKLIST.md`).

| Question | Answer | Justification |
| --- | --- | --- |
| Does your app collect or share any of the required user data types? | **Yes — Purchase history only** (when subscriptions are configured) | RevenueCat / Google Play Billing process purchase receipts. Vault content is never collected. |
| Passwords, notes, card numbers, identity data | **Not collected** | Stored encrypted on the device only; never transmitted ("collected" in Play terms means sent off the device). |
| Personal info, location, contacts, photos, files, app activity, device IDs | Not collected | No such SDK; `AD_ID` permission blocked. |
| Is all user data encrypted in transit? | Yes | Billing traffic uses HTTPS (Google Play / RevenueCat). |
| Can users request that data be deleted? | Yes | Settings › Security › Delete the vault erases everything on the device. Purchase records: via Google Play / RevenueCat. |
| Data shared with third parties | Purchase history with RevenueCat (service provider) | Needed to validate subscriptions. |
| Ads | **No ads** | No ad SDK in the binary. |
| Independent security review | **No** (not yet) | Do not claim the "independent security review" badge until an audit (e.g. MASA) is completed. |

Permissions requested: `INTERNET`, `ACCESS_NETWORK_STATE`, `com.android.vending.BILLING`,
`USE_BIOMETRIC` / `USE_FINGERPRINT`. Blocked: storage, media, camera, microphone, location,
notifications, overlay, `AD_ID`.
