# HabitFlow — Google Play publication package

| File | Content |
| --- | --- |
| [listing-en.md](listing-en.md), [listing-fr.md](listing-fr.md), [listing-es.md](listing-es.md) | Title, short & full descriptions |
| [keywords.md](keywords.md) | Search intents and ASO rules |
| [data-safety.md](data-safety.md) | Data Safety form answers + permission justifications |
| [content-rating.md](content-rating.md) | IARC questionnaire preparation (general adult audience, not for children) |
| [privacy-policy.md](privacy-policy.md) | Privacy policy to host publicly |
| [screenshots.md](screenshots.md) | Screenshot plan and capture procedure |
| [monetization-setup.md](monetization-setup.md) | Play products, RevenueCat entitlement, AdMob units |
| `graphics/play-icon-512.png` | Store icon 512×512 (generated from `brand/mark.mjs`) |
| `graphics/feature-graphic-1024x500.png` | Feature graphic 1024×500 |

Regenerate graphics: `pnpm brand-assets apps/habitflow` (see the script header for `sharp`).
Overall process: [factory/documentation/release-checklist.md](../../../factory/documentation/release-checklist.md).

**Before the first upload:** confirm that `com.mobileappsfactory.habitflow` belongs to a namespace you control —
it is permanent once published. No ratings, reviews, testimonials or invented figures are used anywhere.
Nothing is published automatically: uploads, `eas submit` and release tags are manual.
