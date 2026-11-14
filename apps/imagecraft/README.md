# ImageCraft — Photo & Image Editor

*Edit. Resize. Create. Share.* — App #7 of the Mobile Apps Factory. Offline-first, no account,
no backend: every picture is processed on the device.

## Run

```bash
pnpm install                      # from the repository root
cd apps/imagecraft
npx expo run:android              # development build on a device/emulator (Android SDK + JDK 17)
pnpm test                         # Jest
pnpm typecheck
```

ImageCraft needs a **development build**: it ships a local native module (`modules/imagecraft-native`,
Kotlin, `android.graphics`) plus AdMob and RevenueCat. In Expo Go, only rotate/flip/crop/resize/
compress/convert work (through `expo-image-manipulator`); the rest is disabled with a clear message.

## Builds (EAS)

```bash
eas build -p android --profile development   # dev client APK
eas build -p android --profile preview       # test APK (internal)
eas build -p android --profile production    # AAB for Google Play (needs production env vars)
```

Never published automatically (`submit` is a manual, draft, internal-track step).

## Architecture

```
app/                       Expo Router: (tabs) Home · Edit · Tools · Projects · Settings, tools/*, paywall, onboarding, privacy
modules/imagecraft-native  Kotlin renderer: decode (sampled, EXIF) → geometry → colour matrix → blur/sharpen/vignette
                           → text → watermark → encode; collage; MediaStore gallery save; cancellation
src/types/image.ts         RenderRecipe / EditState model (one recipe = preview AND export)
src/services/image/        recipe builder (pure), engine (temp files, verification, preview, estimate, import), renderers
src/services/files/        format sniffing, header parsing, workspace (temp/outputs/sources), naming, errors
src/features/              editor, crop, resize, compression, conversion, filters, watermark, social-presets,
                           collage, batch-processing, projects, premium, home, settings, onboarding
src/components/            ImagePreview, EditorToolbar, CropControls, AdjustmentSlider, FormatSelector,
                           CompressionPanel, SocialPresetCard, CollageGrid, ExportDialog, ProcessingProgress, EmptyState…
src/database/              SQLite (metadata only): projects, tool usage, preferences, entitlement cache, rewarded unlocks
src/i18n/locales/          en (default), fr, es
store/                     listings, privacy policy, Data Safety, ASO, graphics
docs/                      technical audit, social preset sources, monetization & ads rules
```

Shared packages used: `@factory/design-system`, `app-config`, `app-core`, `localization`, `storage`,
`analytics`, `monetization`, `testing` (none modified).

See `docs/technical-audit.md` for dependency choices and Expo/Android constraints, and
`factory/tracking/imagecraft.md` for status.
