# CI/CD & builds

## Pipeline (`.gitlab-ci.yml`)

| Stage | Jobs | Runs on |
| --- | --- | --- |
| install | `pnpm install --frozen-lockfile` (cached store) | MRs, default branch, tags |
| verify | `typecheck`, `lint`, `registry` | all |
| test | `unit-tests` (packages), `integration-tests` (app: SQLite, content, i18n, navigation, components) | all |
| build | `bundle-validation` (`expo export` Android bundle) | all |
| build | `android-development` (EAS dev client APK) | default branch, **manual** |
| build | `android-production-aab` (EAS, `app-bundle`) | tags `devspeak-vX.Y.Z` only |
| release | `submit-play-internal` (EAS Submit → internal track, draft) | tags, **manual approval** in protected environment |

EAS jobs are skipped automatically when `EXPO_TOKEN` is not defined.

## Required GitLab variables (Settings → CI/CD → Variables)

Mark all as **Masked**; mark production ones as **Protected** (available only on protected branches/tags).

| Variable | Scope | Purpose |
| --- | --- | --- |
| `EXPO_TOKEN` | protected | EAS robot token |
| `EAS_PROJECT_ID` | protected | from `eas init` |
| `ADMOB_ANDROID_APP_ID` | protected | production AdMob app id |
| `EXPO_PUBLIC_ADMOB_BANNER_ID` / `EXPO_PUBLIC_ADMOB_REWARDED_ID` | protected | production ad units |
| `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` | protected | RevenueCat public SDK key |
| `EXPO_PUBLIC_PRIVACY_URL` / `EXPO_PUBLIC_TERMS_URL` | protected | public legal pages |

> `EXPO_PUBLIC_*` values are embedded in the app bundle by design (they are public keys/IDs, not secrets).

Also protect the tag pattern `devspeak-v*` and set the `play-store/internal` environment to
**require approval** (Settings → CI/CD → Protected environments). The Play service-account JSON
is stored in EAS (`eas credentials`), not in GitLab.

## Local builds

```bash
cd apps/devspeak
npx expo run:android                       # debug dev build (Android SDK + JDK 17)
APP_VARIANT=production npx expo prebuild --platform android --clean
cd android && ./gradlew bundleRelease      # local AAB (needs an upload keystore configured)
```

or with EAS: `eas build -p android --profile production`. Let EAS manage the upload keystore and
enrol the app in **Play App Signing**.

## Versioning

`app.manifest.json` → `version` (semver, user-visible) and `versionCode` (integer, +1 on every
Play upload). `eas.json` uses `appVersionSource: local`, so the manifest is the source of truth.
