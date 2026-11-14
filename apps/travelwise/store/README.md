# TravelWise — Google Play publication package

| File | Content |
| --- | --- |
| [listing-en.md](listing-en.md), [listing-fr.md](listing-fr.md), [listing-es.md](listing-es.md) | Title, short & full descriptions (checked against Play limits) |
| [keywords.md](keywords.md) | Search intents and ASO rules |
| [data-safety.md](data-safety.md) | Data Safety answers and permission justifications |
| [content-rating.md](content-rating.md) | IARC questionnaire preparation |
| [privacy-policy.md](privacy-policy.md) | Privacy policy to host publicly (EXPO_PUBLIC_PRIVACY_URL) |
| [screenshots.md](screenshots.md) | Screenshot plan (genuine captures only) |
| `graphics/play-icon-512.png` | Store icon 512×512 (generated from `brand/mark.mjs`) |
| `graphics/feature-graphic-1024x500.png` | Feature graphic |

Rules:
- TravelWise is an **organiser, not a travel agency**: no listing text may suggest that it sells
  tickets, books hotels, checks availability or verifies bookings or entry requirements.
- No claim of encryption for documents (see `../docs/security.md`).
- No fake reviews, awards, ratings or user counts.
- Check the current Google Play policies (target API level, Data Safety, ads and families
  policies) at release time. Nothing is published automatically: `submit-play-internal`
  requires a manual approval in CI.

General process: [factory/documentation/release-checklist.md](../../../factory/documentation/release-checklist.md).
