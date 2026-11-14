# Adding a new app to the factory

Every app is a separate product with its own identity. Reuse infrastructure, not experiences.

## 1. Decide before coding

- A distinct user problem and audience (no clones of another factory app or of a competitor).
- Business model: `free`, `ads`, `subscription`, `hybrid` or `paid`.
- Package id: **permanent once published** (e.g. `com.yourcompany.focustimer`). Use a domain you control.
- Launch locales.

## 2. Scaffold

```bash
pnpm new-app focus-timer "Focus Timer" com.yourcompany.focustimer productivity
pnpm install
```

This creates `apps/focus-timer` from `factory/templates/expo-app`, pins the Expo SDK versions
validated by DevSpeak, and adds an entry to `factory/app-registry/registry.json`.

## 3. Configure the manifest

Edit `apps/focus-timer/app.manifest.json`: brand colors, `storeName` (≤ 30 chars), `features`,
`monetization`, `locales`, `releaseStatus`. Then:

```bash
pnpm registry:check
```

## 4. Add capabilities deliberately

Copy only what the product needs from DevSpeak; each capability maps to a package:

| Need | Add dependency | Reuse |
| --- | --- | --- |
| Local database | `npx expo install expo-sqlite` | `@factory/storage` (`migrate`, backup), `@factory/testing` |
| Translations | `npx expo install expo-localization i18next react-i18next` | `@factory/localization` |
| Subscriptions | `npx expo install react-native-purchases` | `@factory/monetization` (+ `src/revenuecat.ts`), DevSpeak `services/monetization.ts` as a reference |
| Ads | `npx expo install react-native-google-mobile-ads` | `resolveAdUnits`, `shouldShowBanner`, DevSpeak `services/ads.ts` (UMP consent) |
| Reminders | `npx expo install expo-notifications` | `@factory/notifications` |
| Analytics | — | `@factory/analytics` |

Always use `npx expo install` (not `pnpm add`) for native modules so versions match the SDK.

## 5. Brand assets

```bash
npm i --prefix %TEMP%\sharp sharp
set SHARP_DIR=%TEMP%\sharp\node_modules
pnpm brand-assets apps/focus-timer
```

Replace the generated mark with the app's own design when it has one.

Give the app its own mark: create `apps/<id>/brand/mark.mjs` exporting `mark({ bubble, glyph })`
(and optionally `featureGraphic(...)`), as Logic Quest does. Without it the DevSpeak mark is used.
## 5b. App-specific native code (only when necessary)

When no maintained Expo/RN library covers a need, write a **local Expo module** instead of
adding an unvetted dependency. FilePilot is the reference (`apps/filepilot/modules/filepilot-native`):

- `modules/<name>/expo-module.config.json` + `android/build.gradle` + Kotlin `Module` — autolinked
  from the app's `modules/` folder (no package.json needed). Verify with
  `npx expo-modules-autolinking resolve --platform android`.
- `modules/<name>/index.ts` uses `requireOptionalNativeModule`, so Jest/Expo Go get `null` and the app
  must show the feature as unavailable instead of faking it.
- Map it in `tsconfig.json` `paths` and `jest.config.js` `moduleNameMapper`.
- Native code can't be verified without an Android build: mark it 🟡 in the app's status file.

## 6. CI and builds

- Add `apps/focus-timer/eas.json` (copied by the template) and run `eas init` to get an EAS project id.
- In `.gitlab-ci.yml`, add the app id to the `APP` matrices (integration-tests, bundle-validation,
  android-development) and a `.release-rules` entry: `$CI_COMMIT_TAG =~ /^focus-timer-v\d+\.\d+\.\d+$/`
  with `variables: { APP: focus-timer }`.
- Add the app's production IDs as protected CI variables with environment scope `production/focus-timer`.

## 7. Release

Follow [release-checklist.md](release-checklist.md). Create a dedicated `store/` folder like DevSpeak's.
