# ImageCraft — monetization & ads rules

## Free vs Premium (`src/features/premium/gating.ts`, tested)

| Area | Free | Premium |
| --- | --- | --- |
| Editor: crop, rotate, flip, undo/redo | ✅ | ✅ |
| Adjustments | brightness, contrast, saturation, exposure, warmth, B&W, sepia | + sharpness, blur, vignette |
| Filters | Original, Vivid, Mono, Warm, Cool | + 8 looks |
| Text layers | ✅ (5 layers) | ✅ |
| Custom watermark (text / logo / tiled) | preview only | ✅ |
| Social presets | 6 classic formats | all 13 + custom size |
| Collage | 6 layouts, 2048 px | 18 layouts, 4096 px |
| Compression | quality 30–95 % | 1–100 % + target size |
| Batch | 3 photos | 100 photos + text watermark |
| Export resolution | ≤ 12 MP | ≤ 24 MP |
| Ads | discreet | none |

Free users can **preview** every Premium item. Exporting it needs Premium or one **rewarded unlock**
(optional ad, max 3 per day, one export each). Premium is never simulated: it comes only from the
store entitlement (RevenueCat) or its 7-day offline cache (`@factory/monetization`).

Products: `imagecraft_premium_monthly` (2.99 $ indicative), `imagecraft_premium_annual` (14.99 $),
`imagecraft_premium_lifetime` (24.99 $). Prices shown in the app always come from Google Play (localized).

## Ads (`src/services/ads.ts`)

- Banner: only at the bottom of **Home, Tools, Projects** (enforced by a test). Never on the editor,
  a tool, a preview, the export sheet, or while anything processes (`session.processing`).
- Interstitial: only from `services/finish.ts → onResultDone()` (user taps *Done* on a finished
  result), frequency-capped (≥ 3 exports and ≥ 4 min apart, after the first session). Never mid-task.
- Rewarded: only when the user taps *Watch an ad to unlock one export*; reward granted on
  `EARNED_REWARD` only.
- Consent: Google UMP (`AdsConsent.gatherConsent`) after the onboarding; privacy options in Settings.
- Development & preview builds always use Google test IDs; production IDs only from env vars.
