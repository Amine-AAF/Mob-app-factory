# Play Console — Data Safety answers (draft)

Basis: the app code in `apps/imagecraft` and the SDKs it bundles (AdMob, RevenueCat). Re-check before each release.

| Question | Answer | Notes |
| --- | --- | --- |
| Does the app collect or share user data? | **Yes** (through third-party SDKs) | The app itself sends nothing; AdMob and RevenueCat do |
| Photos and videos | **Not collected** | Processed on device only, never transmitted |
| Files and docs | Not collected | — |
| Personal info (name, email…) | Not collected | No account |
| Location | Not collected | No location permission; EXIF is not read |
| Device or other IDs | **Collected & shared** — AdMob (advertising ID), RevenueCat (anonymous app user ID) | Purposes: advertising, fraud prevention, account management (purchases) |
| App activity / interactions | **Collected** — AdMob ad interactions | Analytics provider: none configured (opt-in toggle exists, off by default) |
| Purchase history | **Collected** — Google Play / RevenueCat | Purpose: app functionality (Premium) |
| Crash logs / diagnostics | Not collected | No crash SDK configured |
| Is data encrypted in transit? | Yes | SDK traffic over HTTPS |
| Can users request deletion? | Yes | In-app "Delete all my data"; uninstalling removes everything |
| Is collection optional? | Ads data: consent via UMP where required; Premium removes ads | — |

If Firebase Analytics or Crashlytics is ever added, update this file, the privacy policy and `src/services/analytics.ts` first.
