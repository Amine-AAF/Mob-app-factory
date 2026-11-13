# Analytics & Firebase

## Current state

The analytics facade (`@factory/analytics`) and DevSpeak's typed event catalogue are implemented.
**No analytics SDK is installed yet**, so no data leaves the device. In development builds events
are printed to the console. Collection is **off by default** and controlled by the user
(onboarding toggle + Settings > Privacy).

## Event catalogue (DevSpeak)

| Event | Params | Fired when |
| --- | --- | --- |
| `onboarding_completed` | level, role, ui_language | Profile saved at the end of onboarding |
| `lesson_started` | lesson_id, module | Lesson opened (accessible lessons only) |
| `lesson_completed` | lesson_id, module, score, first_time | Lesson quiz finished |
| `quiz_completed` | owner, score | Any lesson quiz finished |
| `vocabulary_saved` | word_id | Word bookmarked |
| `daily_challenge_completed` | challenge_id | First completion of the day |
| `premium_paywall_viewed` | source | Paywall opened |
| `subscription_started` | plan | Successful purchase with active entitlement |

Parameters are filtered against a PII denylist (email, name, phone, ids, location…).

## Enabling Firebase Analytics + Crashlytics

1. Firebase console → add Android app `com.devspeak.app` → download `google-services.json`
   (never commit it; it's git-ignored). Store it as an EAS file secret / GitLab file variable.
2. Install: `npx expo install @react-native-firebase/app @react-native-firebase/analytics @react-native-firebase/crashlytics`
3. `app.config.ts`: add `android.googleServicesFile: process.env.GOOGLE_SERVICES_JSON` and the
   plugins `@react-native-firebase/app`, `@react-native-firebase/crashlytics`.
4. Disable automatic collection until consent (AndroidManifest meta-data via config plugin or
   `firebase.json`: `analytics_auto_collection_enabled: false`, `crashlytics_auto_collection_enabled: false`).
5. Register the provider in `src/services/analytics.ts`:

```ts
import { getAnalytics, logEvent, setAnalyticsCollectionEnabled } from '@react-native-firebase/analytics';
import { getCrashlytics, recordError, setCrashlyticsCollectionEnabled } from '@react-native-firebase/crashlytics';
import { createFirebaseProvider } from '@factory/analytics';

const a = getAnalytics();
const c = getCrashlytics();
registerAnalyticsProvider(createFirebaseProvider({
  logEvent: (n, p) => logEvent(a, n, p),
  setAnalyticsCollectionEnabled: (e) => setAnalyticsCollectionEnabled(a, e),
  recordError: (e) => recordError(c, e),
  setCrashlyticsCollectionEnabled: (e) => setCrashlyticsCollectionEnabled(c, e),
}));
```

6. Update the Data Safety form (analytics + crash logs, optional, not shared) and the privacy policy.
