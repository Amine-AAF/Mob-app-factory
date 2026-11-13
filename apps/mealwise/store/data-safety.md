# Data safety — answers for Play Console

Re-check before every release that integrates a new SDK.

## Does the app collect or share user data?

**Yes**, only through third-party SDKs used in the free version (Google Mobile Ads / UMP) and, if
enabled by the user, anonymous analytics. MealWise itself sends nothing to any server.

| Data type | Collected | Shared | Purpose | Optional | Source |
| --- | --- | --- | --- | --- | --- |
| Device or other IDs (advertising ID) | Yes | Yes (Google) | Advertising, fraud prevention | Yes — Premium has no ads; consent via UMP where required | Google Mobile Ads SDK |
| App interactions (ad impressions/clicks) | Yes | Yes (Google) | Advertising, analytics of ads | Yes | Google Mobile Ads SDK |
| Diagnostics (crash logs) | Yes | No | Ad SDK stability | Yes | Google Mobile Ads SDK |
| Purchase history | Yes | No | Restoring Premium | Required for purchases | Google Play Billing via RevenueCat (anonymous app user id) |
| App interactions (anonymous product events) | Only if the user enables it (off by default) | No | Analytics | Yes | `@factory/analytics` (no provider configured in v1.0) |

**Not collected:** name, email, account, location, contacts, photos, files, health data, recipe texts,
meal plans, grocery lists, pantry items, prices or budget. These stay in the on-device SQLite database.

## Security practices
- Data in transit is encrypted (HTTPS) for the SDKs above.
- Users can request deletion: Settings › Your data › Delete all my data (on-device, immediate).
  Purchase records are managed by Google Play.
- Not a Families-program app.

## Permissions
- `POST_NOTIFICATIONS` (Android 13+), asked only when the user turns a reminder on.
- `INTERNET` / `ACCESS_NETWORK_STATE` (ads and billing only).
- Blocked in `app.config.ts`: storage, camera, microphone, location, overlay, exact alarms.
