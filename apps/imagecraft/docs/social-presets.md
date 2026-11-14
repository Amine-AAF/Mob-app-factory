# Social media presets — sources

Values live in `src/constants/socialPresets.ts` (data only). Reviewed on **2026-11-13**; platforms change
their recommendations, so re-check each line against the official help pages before every release.

| Preset | Size (px) | Ratio | Official reference to check |
| --- | --- | --- | --- |
| Instagram post | 1080 × 1080 | 1:1 | Instagram Help Center — "image resolution" |
| Instagram portrait | 1080 × 1350 | 4:5 | Instagram Help Center |
| Instagram story | 1080 × 1920 | 9:16 | Instagram Help Center — Stories |
| Instagram Reel cover | 1080 × 1920 | 9:16 | Instagram Help Center — Reels |
| TikTok | 1080 × 1920 | 9:16 | TikTok Creator / Ads specs |
| YouTube thumbnail | 1280 × 720 | 16:9 | YouTube Help — "Add video thumbnails" |
| YouTube Shorts cover | 1080 × 1920 | 9:16 | YouTube Help — Shorts |
| Facebook post (landscape/link) | 1200 × 630 | 1.91:1 | Meta Business Help — image specs |
| Facebook cover | 1640 × 624 | ≈2.63:1 | Meta Help — cover photo (displayed 820 × 312 on desktop; 2× for sharpness) |
| LinkedIn post | 1200 × 627 | 1.91:1 | LinkedIn Help — image specs |
| LinkedIn banner | 1584 × 396 | 4:1 | LinkedIn Help — background photo |
| Pinterest pin | 1000 × 1500 | 2:3 | Pinterest Business — pin specs |
| WhatsApp status | 1080 × 1920 | 9:16 | Vertical full-screen (WhatsApp has no official spec; 9:16 is the device format) |

Rendering rules (tested in `geometry.test.ts`): uniform scale only (never stretched); *Fill* crops the
overflow (the user drags to choose), *Fit* letterboxes on a chosen colour. Custom canvas: 64–4096 px.
