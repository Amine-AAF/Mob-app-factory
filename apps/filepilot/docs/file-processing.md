# FilePilot — file processing engine

All processing logic lives in `src/services/` (never in components). Screens build a `RunSpec`
with `src/services/operations/tools.ts` and run it through `runOperation` (`runner.ts`).

```
picker.ts (SAF, temp copy) ─► inspect/validate (formats.ts, imageHeader.ts, pdfEngine.inspectPdf)
        ─► runner.ts: history row "running" ─► job temp dir ─► imageEngine / pdfEngine / pdfRenderer
        ─► commitOutput (unique name in <documents>/outputs) ─► history "completed" ─► finally: delete job dir
```

## File lifecycle

| Stage | Location | Removed when |
| --- | --- | --- |
| User original | Wherever the user keeps it | Never touched (read-only via the picker's copy) |
| Picker copy | `<cache>/DocumentPicker/…` | Tool screen unmounts / file removed from selection / every start-up |
| Encoder scratch | `<cache>/ImageManipulator/…` | Moved into the job dir immediately; swept at start-up |
| Job temp files | `<cache>/filepilot-work/<jobId>/` | End of the job (`finally`), and at start-up for interrupted jobs |
| Results | `<documents>/outputs/` (app-private) | User deletes result / clears history with files / "Delete all my data" / uninstall |
| History | SQLite `filepilot.db` (metadata only, no BLOBs — tested) | Clear history / delete all data |

What we can claim: temp files are deleted through the filesystem API and the deletion is verified by tests
against the in-memory store. We do **not** claim secure erasure of flash storage (no overwrite guarantees on
Android's FTL) — the privacy screen says "deleted", not "wiped".

## Guarantees (all covered by `src/__tests__/operations.test.ts`)
- Originals are never written. Outputs never overwrite anything (`name (2).jpg`).
- All-or-nothing: a failure while committing several outputs removes the ones already moved.
- `ENOSPC` → `storage_full`; deleted input → `file_missing`; cancellation → `cancelled`; no partial output.
- App killed mid-job → next start marks the row `interrupted` and sweeps temp files.
- Only successful operations consume the free quota.
- Progress is real: completed steps/files/pages. The processing view shows a counter only when `total > 1`.

## Memory protection (`src/config/limits.ts`)
| Limit | Value | Enforced in |
| --- | --- | --- |
| Image file size | 60 MB | `inspectImage` |
| Image pixels (header-checked, before decoding) | 120 MP | `inspectImage` |
| Decode bound | 40 MP (downsampled *while decoding* by Glide) | `decodeBound` → manipulator `maxWidth/maxHeight` |
| PDF file / merge total | 80 MB / 150 MB | `usePdfSelection`, `readPdf`, `mergeSpec` |
| Image embedded in PDF | 2000 px (standard) / 3508 px (high) long edge | `imageToPdfSpec` |
| Rendered PDF page | 4096 px edge, 16 MP | native `renderPdfPage` |
Plus `android:largeHeap` (`plugins/withLargeHeap.js`). One decoded bitmap exists at a time; merge/split read
one input at a time and stream split parts to disk.

## Dependencies evaluated

| Dependency | Use | Android / Expo SDK 58 | License | Maintenance | Verified output | Limitations |
| --- | --- | --- | --- | --- | --- | --- |
| `expo-image-manipulator` 58.0.16 | Decode (Glide), resize, encode JPEG/PNG/WebP | First-party Expo, `npx expo install` | MIT | Expo SDK release train | On device (🟡); engine logic tested with a real JS codec | No EXIF copied (privacy plus); PNG quality ignored (lossless); `extent` not implemented on Android → we flatten alpha natively; WebP lossless only at quality 100 |
| `pdf-lib` 1.17.1 | Merge, split, extract, image→PDF, page count/size | Pure JS, runs on Hermes | MIT | Stable but unmaintained since 2021; maintained fork `@cantoo/pdf-lib` is a drop-in if needed | ✅ outputs re-parsed + structurally checked in tests (300-page doc included) | Refuses encrypted PDFs (we show `pdf_encrypted`); whole document in memory (bounded by limits); no rendering, no compression |
| Android `PdfRenderer` (via local module `modules/filepilot-native`) | PDF → images, page count | Platform API 21+, Expo Modules API (Kotlin), autolinked from `modules/` | Platform | Platform | 🟡 needs device build (no Android SDK in this environment) | Password-protected PDFs throw → `pdf_encrypted`; rendering fidelity is Android's (forms/annotations rendered for display) |
| `expo-document-picker` 58.0.5 | SAF picker with cache copy | First-party | MIT | Expo | 🟡 device | Copies the file (needs free space ≈ file size) |
| `expo-sharing` 58.0.23 | Share sheet via FileProvider content URI | First-party | MIT | Expo | 🟡 device | One file per share; multi-output results use "Save all to folder" |
| `expo-file-system` 58 (object API) | Bytes I/O, SAF folder export | First-party | MIT | Expo | 🟡 device | — |
| `@react-native-community/slider` 5.2.1 | Quality slider | Expo-recommended version | MIT | Active | 🟡 device | — |

Not shipped on purpose: **PDF compression** (no reliable on-device method with verifiable output),
**HEIC/GIF/BMP/TIFF** input (not verified end to end), password-protected PDFs.

## Formats
Detection is by content (`detectFormat`), never by extension: a PNG renamed `.jpg` is treated as PNG.
Every encoded output is re-checked: the written container must match the requested format.
Transparent image → JPEG: flattened onto white by the native module (Android's JPEG encoder would make it
black). If the native module is missing the conversion is refused (`transparency_unsupported`).
