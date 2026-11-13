# FilePilot — screenshot plan

Use **real captures from a preview build** (`eas build -p android --profile preview`) on a 1080×2400 device,
English first, then FR/ES. No mock-ups, no fake numbers: run each operation for real and capture its result.

| # | Screen | Setup | Caption (en) |
| --- | --- | --- | --- |
| 1 | Dashboard | Light theme, a few history entries | All your file tools. One simple app. |
| 2 | Compression result (before/after) | Compress a ~4 MB photo at quality 70 | See exactly how much you save |
| 3 | Image Resizer | Preset "Medium", plan card visible | Resize to any size, ratio locked |
| 4 | Converter | PNG with transparency → WebP | Real JPEG, PNG and WebP conversion |
| 5 | Merge PDFs | 3 PDFs, reordered | Merge PDFs in your order |
| 6 | Split / extract | Ranges "1-3, 5" with live validation | Split and extract pages |
| 7 | Image to PDF | 4 scans, A4, margins | Turn photos into a PDF |
| 8 | Privacy screen | Dark theme | Processed on your device. Never uploaded. |

Disable test ads before capturing (Premium test account or `APP_VARIANT=preview` with no ad consent) so no ad placeholder appears.
