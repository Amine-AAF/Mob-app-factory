# BookNest — Google Play Data safety answers

BookNest has no backend and no account. All reading data (books, covers, sessions, goals, quotes, journal,
reviews, wishlist) is stored only on the device and is never transmitted by the app.

| Question | Answer |
| --- | --- |
| Does the app collect or share user data? | **Yes**, only through third-party SDKs: AdMob (free version) and, if the user opts in, anonymous analytics. RevenueCat/Google Play Billing for purchases. |
| Is data encrypted in transit? | Yes (SDKs use HTTPS). |
| Can users request deletion? | Yes — Profile › Backup › Delete all my data erases everything locally. No server-side data is held by BookNest. |

## Data types

| Data type | Collected | Shared | Purpose | Optional |
| --- | --- | --- | --- | --- |
| Device or other IDs (advertising ID) | Yes (AdMob) | Yes (AdMob) | Advertising, fraud prevention | Ads only in the free version; consent via UMP where required |
| App interactions (anonymous events) | Only with opt-in | No | Analytics | Yes — off by default (Settings › Privacy) |
| Crash logs / diagnostics | Only with opt-in | No | App stability | Yes |
| Purchase history | Yes (Google Play / RevenueCat) | No | App functionality (Premium) | Required to buy Premium |
| Personal info, messages, photos, files, location, contacts | **No** | No | — | — |

Notes:
- Cover photos are picked with the Android photo picker and copied into the app's private storage; they are not uploaded.
- Quotes, notes, reviews and book titles are never sent to ads, analytics or notifications (enforced by typed analytics events and tests).
- Analytics event catalogue (when enabled): `onboarding_completed`, `book_added`, `book_completed`, `session_logged`, `goal_created`, `goal_reached`, `quote_added`, `journal_entry_added`, `import_completed`, `export_completed`, `premium_viewed`, `purchase_started`, `purchase_completed` — parameters are enums/counters only (format, source, bucketed minutes…).
