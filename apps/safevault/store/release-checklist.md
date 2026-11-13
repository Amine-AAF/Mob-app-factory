# SafeVault — Google Play release checklist

Nothing here is automated: **no session publishes the app**. A human performs each step.

## Before the first upload
- [ ] Replace the placeholder package id `com.safevault.app` with one on a domain you control (permanent after publication) — `app.manifest.json`.
- [ ] `eas init` → set `EAS_PROJECT_ID`; Play App Signing enabled, upload key managed by EAS.
- [ ] Brand assets generated (`pnpm brand-assets apps/safevault`) and reviewed (icon 512, feature graphic 1024×500).
- [ ] Privacy policy (`store/privacy-policy.md`) published at a public URL; `EXPO_PUBLIC_PRIVACY_URL` set.
- [ ] Support e-mail defined (privacy policy + Play Console).

## Play Console
- [ ] Category: Tools. Contains ads: **No**.
- [ ] Data safety form filled from `store/data-safety.md`.
- [ ] Content rating questionnaire: no user-generated public content, no interaction between users → Everyone / PEGI 3.
- [ ] Target audience: 13+ (not designed for children).
- [ ] Financial features declaration: the app provides **no** payments, banking or wallet; card storage is for personal reference only.
- [ ] Listings `listing-en.md`, `listing-fr.md`, `listing-es.md`; screenshots taken with **fake data only** (temporarily allow screenshots in Settings › Security, then turn blocking back on).
- [ ] In-app products: `safevault_premium_monthly`, `safevault_premium_annual` (subscriptions), `safevault_premium_lifetime` (one-time). Linked in RevenueCat to entitlement `premium`, offering `default`.
- [ ] License testers added; test purchase, cancel, pending payment and restore verified.

## Build & verification
- [ ] `pnpm --filter safevault typecheck && pnpm --filter safevault test` green; `pnpm registry:check` green.
- [ ] `cd apps/safevault && npx expo export --platform android` succeeds.
- [ ] `eas build --profile preview` installed on 2+ devices; **`docs/SECURITY-CHECKLIST.md` fully passed**.
- [ ] `eas build --profile production` (AAB) uploaded manually to the **internal testing** track.
- [ ] Closed testing period (as required by the developer account) before production.

## Messaging rules
- [ ] No absolute security claims ("unhackable", "100 % secure", "military-grade") in listing, screenshots or ads.
- [ ] "Not independently audited" stays in the listing until an audit is completed.
