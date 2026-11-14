# FilePilot — Google Play publication package

| File | Content |
| --- | --- |
| [listing-en.md](listing-en.md), [listing-fr.md](listing-fr.md), [listing-es.md](listing-es.md) | Title, short and full descriptions |
| [keywords.md](keywords.md) | ASO search intents and wording rules |
| [data-safety.md](data-safety.md) | Data Safety form answers + permissions |
| [content-rating.md](content-rating.md) | IARC questionnaire preparation |
| [privacy-policy.md](privacy-policy.md) | Privacy policy template (needs legal review and hosting) |
| [screenshots.md](screenshots.md) | Screenshot plan (capture from a real preview build) |
| `graphics/play-icon-512.png` | Store icon (512×512) |
| `graphics/feature-graphic-1024x500.png` | Feature graphic |

Regenerate graphics: `pnpm brand-assets apps/filepilot` (mark in `apps/filepilot/brand/mark.mjs`).

## Claims policy
Only claim what the app verifiably does. Never write "compress any file", "convert every format",
"PDF compression" or "100% secure". Say "processed on your device" / "never uploaded to our servers".

## Play requirements checked (2026-11-13)
- Target API: new apps and updates must target **API 36** (since 31 Aug 2026). FilePilot targets 36 (`app.manifest.json → build`).
- AAB format, Play App Signing (via EAS credentials).
- Subscriptions: products `filepilot_premium_monthly`, `filepilot_premium_annual` (subscriptions) and `filepilot_premium_lifetime` (one-time product), all mapped to RevenueCat entitlement `premium`, offering `default`.
