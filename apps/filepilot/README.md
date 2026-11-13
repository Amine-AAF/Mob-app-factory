# FilePilot — All Your File Tools. One Simple App.

Factory app #3. Privacy-first Android toolbox: image compression, resizing and conversion (JPEG/PNG/WebP),
PDF merge/split/extract, image → PDF and PDF → images. Everything runs on the device; no account, no upload.

- Package: `com.filepilot.app` (placeholder) · Expo SDK 58 · Expo Router · TypeScript strict
- Status and acceptance matrix: [docs/status.md](docs/status.md)
- Engine, file lifecycle, limits, dependency evaluation: [docs/file-processing.md](docs/file-processing.md)
- Store package: [store/README.md](store/README.md)

## Run

```bash
pnpm install
pnpm --filter filepilot test
cd apps/filepilot && npx expo run:android   # dev build (needs Android SDK); not Expo Go: native modules
```

## Layout

```
app/                         routes (thin re-exports into src/features)
modules/filepilot-native/    local Expo module (Kotlin): PdfRenderer page rendering, alpha flattening
plugins/withLargeHeap.js     config plugin
brand/mark.mjs               brand mark for `pnpm brand-assets apps/filepilot`
src/
  features/<tool>/           screens: dashboard, image-compressor, image-resizer, image-converter,
                             pdf-tools, image-to-pdf, pdf-to-images, file-history, file-sharing, settings, premium
  services/files/            formats (magic bytes), image headers (dims/alpha/EXIF), naming, FileStore, workspace, picker, share
  services/image/            imageEngine (codec-agnostic), expoImageCodec, resizeMath
  services/pdf/              pdfEngine (pdf-lib), pageRanges, pageLayout, pdfRenderer (native)
  services/operations/       runner (guarantees), tools (one RunSpec per tool), perform (quota + analytics)
  database/                  migrations + repositories (FileOperation, UserPreferences, SubscriptionCache, AppSettings, daily usage)
  components/ hooks/ store/ i18n/ config/ utils/
store/                       Play listing (en/fr/es), Data Safety, rating, privacy policy, graphics
```

## Factory packages reused
`@factory/design-system` (theme, components), `@factory/localization`, `@factory/storage` (SQL interface,
migrations), `@factory/monetization` (entitlements, RevenueCat adapter, AdMob policy), `@factory/analytics`,
`@factory/app-core` (dates), `@factory/app-config` (manifest), `@factory/testing` (sql.js).

## Monetization
Free: 10 successful operations/day (+3 per optional rewarded ad, max 2/day), single-image tools,
merge ≤ 3 PDFs, image→PDF ≤ 5 images, PDF→images ≤ 5 pages, split ≤ 5 parts, last 20 history entries, ads.
Premium (monthly / annual / lifetime, store-localized prices): unlimited, batch compression, target size,
larger PDF jobs, full history, no ads. Limits: `src/config/limits.ts`.
Ads: banners on dashboard/history only; interstitial only when leaving a result with "Done", frequency-capped;
never during selection, processing or saving.

## Release
Tag `filepilot-vX.Y.Z` → CI builds the production AAB; Play submission is a manual, approved job.
Production variables are scoped to GitLab environment `production/filepilot`.
