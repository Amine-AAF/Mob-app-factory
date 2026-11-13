# Logic Quest — Google Play publication package

| File | Content |
| --- | --- |
| [listing-en.md](listing-en.md), [listing-fr.md](listing-fr.md), [listing-es.md](listing-es.md) | Title, short & full descriptions |
| [keywords.md](keywords.md) | Search intents and ASO rules |
| [data-safety.md](data-safety.md) | Data Safety form answers + permission justifications |
| [content-rating.md](content-rating.md) | IARC questionnaire preparation |
| [privacy-policy.md](privacy-policy.md) | Privacy policy template to host publicly |
| [screenshots.md](screenshots.md) | Screenshot plan and capture procedure |
| [monetization-setup.md](monetization-setup.md) | Play products, RevenueCat entitlements, AdMob units for this app |
| `graphics/play-icon-512.png` | Store icon 512×512 (generated from `brand/mark.mjs`) |
| `graphics/feature-graphic-1024x500.png` | Feature graphic 1024×500 |

Regenerate graphics: `pnpm brand-assets apps/logic-quest` (see the script header for `sharp`).
The overall process is in [factory/documentation/release-checklist.md](../../../factory/documentation/release-checklist.md).

**Before the first upload:** replace the placeholder package id `com.logicquest.app` with one under a
domain you control — it is permanent once published. No ratings, reviews or testimonials are used anywhere.
