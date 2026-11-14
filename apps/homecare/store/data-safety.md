# HomeCare — Play Data safety answers (draft, verify against final SDK versions)

| Question | Answer |
| --- | --- |
| Does the app collect or share user data? | Yes — only through third-party SDKs below. App content itself (homes, documents, photos, expenses) is stored on the device and never sent to us or to third parties. |
| Is data encrypted in transit? | Yes (SDK traffic uses HTTPS). |
| Can users request deletion? | Yes — Settings > Backup & data > Delete all my data (on-device). No server account exists. |

| Data type | Collected by | Purpose | Optional |
| --- | --- | --- | --- |
| Device or other IDs (advertising ID) | Google AdMob (free version) | Advertising, fraud prevention | Ads can be personalised only with consent (UMP); Premium removes ads |
| App interactions, diagnostics | AdMob SDK | Advertising, analytics of ad delivery | — |
| Purchase history | RevenueCat / Google Play Billing | Manage subscriptions | Only when purchasing |
| App interactions (anonymous events) | HomeCare analytics facade | Analytics | Opt-in, off by default; no provider wired in v1.0 (nothing sent) |

Not collected: name, e-mail, address, location, contacts, photos/files content, financial info,
messages, health. Files, photos and the address field never leave the device unless the user
shares or exports them through the Android share sheet.
