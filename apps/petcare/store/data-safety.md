# Play Console — Data safety answers (PetCare)

To be re-checked against the SDK versions actually shipped (AdMob, RevenueCat) before each release.

## PetCare's own code
- Collects or shares user data: **No.** Pet profiles, health records, documents, photos, expenses and
  reminders are stored only on the device (SQLite + private app folder). No backend, no account, no upload.
- Data encrypted in transit: not applicable to PetCare data (never transmitted). Store SDKs use HTTPS.
- Users can request data deletion: **Yes** — in-app *Settings › Backup & data › Delete all my data* erases
  everything immediately; uninstalling also removes all data. Android auto-backup is disabled.
- Analytics: opt-in toggle, off by default; no analytics provider is registered in v1.0 (nothing leaves the device).

## Third-party SDKs (free version)
| SDK | Data types (Play categories) | Purpose | Notes |
| --- | --- | --- | --- |
| Google Mobile Ads (AdMob) + UMP | Device or other IDs (advertising ID), approximate app interactions, diagnostics | Advertising, fraud prevention | Banner only on browse screens; non-personalised requests; consent via UMP in EEA/UK. No pet/health data passed. |
| RevenueCat (via Google Play Billing) | Purchase history, app user ID (anonymous) | App functionality (subscriptions) | Only when a purchase/restore is made. No payment card data reaches the app. |

## Permissions
`POST_NOTIFICATIONS` (asked only when a reminder is enabled), plus SDK defaults `INTERNET`,
`ACCESS_NETWORK_STATE`, `com.google.android.gms.permission.AD_ID`. Camera, microphone, media/storage and
location permissions are explicitly blocked in `app.config.ts`.

## Health-related content
PetCare is not a medical device and makes no diagnosis. Declare it as a *Lifestyle* app. The disclaimer is
present in the listing and in the app.
