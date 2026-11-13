# FilePilot 1.0 — implementation status

Last updated: 2026-11-13. Legend: ✅ implemented and automatically tested · 🟡 implemented, needs on-device
verification · 🔑 needs an external account/configuration · ⬜ not done.

## Verified in this environment
- `tsc --noEmit` (strict): 0 errors. ESLint on `apps/filepilot`: 0 problems.
- Jest: **117 tests, 7 suites, all passing** (engine with real JPEG/PNG encoders and pdf-lib, runner + SQLite via sql.js, i18n, monetization, rendered screens).
- `expo-doctor`: 20/20. `expo export --platform android`: Hermes bundle builds (5.5 MB).
- `expo prebuild`: local module `filepilot-native` autolinked; `largeHeap` set; storage/media/camera/mic permissions removed.
- `pnpm registry:check`: FilePilot valid (app #3 in `factory/app-registry/registry.json`).
- **Not run here:** no Android SDK/emulator on this machine → no Gradle build, no Kotlin compilation, no on-device run.

## Acceptance criteria

| # | Criterion | Status | Evidence / remaining |
| --- | --- | --- | --- |
| 1 | Launches on Android | 🟡 | Bundle + prebuild OK; run `npx expo run:android` or EAS dev build |
| 2 | File selection | 🟡✅ | SAF picker (device); validation/limits tested |
| 3 | Image compression | ✅🟡 | Quality, target size (binary search + downscale), batch, no-gain detection tested with a real encoder; Android encoder on device |
| 4 | Image resizing | ✅🟡 | Planning (presets, %, custom, lock, no-upscale, warnings) tested; exact-size output tested |
| 5 | Image conversion | ✅🟡 | JPEG↔PNG real re-encode + alpha flattening tested; WebP encode only on device |
| 6 | PDF merge | ✅ | Valid output re-parsed, order, metadata not copied |
| 7 | PDF split / extraction | ✅ | Ranges, every page, chunks, extraction order, 300-page doc |
| 8 | Image → PDF | ✅🟡 | A4/Letter/fit, orientation, margins, JPEG + PNG(alpha) embedding tested |
| 9 | PDF → image | 🟡 | Orchestration tested with a fake renderer; native PdfRenderer code needs a device build |
| 10 | Output files valid | ✅🟡 | Re-decoded / re-parsed in tests; container check after every encode |
| 11 | Sharing | 🟡 | expo-sharing content URI (device) |
| 12 | History persists | ✅ | Re-open test, prune, clear, interrupted recovery |
| 13 | Temp files cleaned | ✅ | Job dir, picker copies, scratch sweep tested |
| 14 | Offline | ✅🟡 | No network in processing code; store/ads optional |
| 15 | EN / FR / ES | ✅ | Key/placeholder/plural parity, all code keys exist, runtime plural tests |
| 16 | Light / dark | ✅🟡 | WCAG contrast tested for both; system/light/dark setting |
| 17 | Monetization testable | ✅🔑 | Quota, gating, cached entitlement, purchase/restore with fake provider; test ad IDs in dev; needs RevenueCat key + Play products |
| 18 | No critical data-loss defects | ✅ | Originals read-only, no overwrite, all-or-nothing commit (tests) — confirm on device |
| 19 | Tests pass | ✅ | 117/117 |
| 20 | AAB can be generated | 🔑 | `eas.json` production profile + CI `android-production-aab` (tag `filepilot-vX.Y.Z`); needs `EXPO_TOKEN`/EAS project or local Android SDK |

## On-device QA checklist (do before closed testing)
1. Compress a 12 MP+ EXIF-rotated portrait photo → output upright, smaller, opens in Gallery.
2. 48 MP+ photo → no crash (decode bound), result dimensions ≤ 40 MP.
3. Transparent PNG → JPEG → white background (native flatten). PNG → WebP keeps alpha.
4. WebP output at 80 and 100 opens in Chrome/Photos.
5. PDF → images: 100-page PDF at 300 dpi, cancel at page 10 → no output kept, history "cancelled".
6. Password-protected PDF in merge, split and PDF → images → clear "password-protected" message.
7. Kill the app during a merge → relaunch → history shows "interrupted", `cache/filepilot-work` empty.
8. Share to Gmail, WhatsApp, Drive; "Save all" to a Downloads subfolder.
9. Airplane mode: every tool works; paywall says store unavailable.
10. Fill storage to < 50 MB → operation fails with "not enough storage", nothing partial.
11. TalkBack pass on dashboard, compressor, result; font scale 200 %.

## Requires external configuration
| Item | Action |
| --- | --- |
| Package id | Replace placeholder `com.filepilot.app` with one under your domain **before first upload** |
| EAS project | `eas init` in `apps/filepilot`, set `EAS_PROJECT_ID` |
| AdMob app + units + UMP message | CI vars scoped `production/filepilot` |
| Play products + RevenueCat | `filepilot_premium_monthly/annual` (subs), `filepilot_premium_lifetime` (one-time) → entitlement `premium` |
| Privacy policy / terms hosting | `EXPO_PUBLIC_PRIVACY_URL`, `EXPO_PUBLIC_TERMS_URL`; legal review of `store/privacy-policy.md` |
| Screenshots | From a preview build (`store/screenshots.md`) |
| Analytics provider | None registered in 1.0 (no data leaves the device even with consent) |

## Known limitations
- PDF compression not offered (by design). HEIC/GIF/BMP/TIFF input and encrypted PDFs not supported.
- `pdf-lib` is unmaintained upstream; `@cantoo/pdf-lib` is the migration path if a bug appears.
- Batches share one result screen; multi-output share is per file (expo-sharing is single-file).
- RTL layouts (Arabic) not audited yet; pt/de/ar locales planned.
