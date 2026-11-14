# SafeVault — Password Manager & Secure Notes

Offline-first Android password manager. No account, no server, no ads, no analytics.
Part of the Mobile Apps Factory monorepo (`apps/safevault`).

> ⚠ Pre-release. Not independently audited. Read [docs/SECURITY.md](docs/SECURITY.md) before
> making any security claim.

## Features

| Area | What it does |
| --- | --- |
| Vault | Master password (Argon2id), manual lock, auto-lock (0 s – 30 min), persistent back-off after failed attempts, optional biometric unlock (Keystore-backed), screenshot blocking, keys wiped on lock |
| Logins | Service, URL, username, email, password, description, category, tags, notes, created/modified dates, favorites, copy (auto-cleared clipboard), show/hide, open website (http/https only), password history |
| Generator | Length 8–128, classes, look-alike exclusion, passphrases (own word list), entropy-based strength, copy / regenerate / save into a new login |
| Secure notes | Encrypted body, simple formatting (`#`, `-`, `**bold**`), categories, tags, favorites, search |
| Cards | Holder, card name, number (Luhn hint, brand detection), expiry; **no CVV / PIN**; masked by default; disclaimer |
| Identities | Templates: personal, passport, driving licence, address, professional |
| Categories | 10 built-ins + custom (Premium) with colors and icons; delete moves items to "Other" |
| Security audit | Weak / reused / old / incomplete, computed locally; health score on the dashboard |
| Backup | Encrypted `.safevault` export (folder or share sheet), integrity-checked import (merge / replace with confirmation), restore after reinstall |
| i18n | English (default), French, Spanish |
| Monetization | Free plan with limits, Premium via Google Play Billing (RevenueCat). Never locks users out of existing data |

## Structure

```
app/                     Expo Router screens (tabs: Vault, Categories, Generator, Security, Settings)
modules/safevault-native Local Expo module (Kotlin): Argon2id (BouncyCastle), sensitive clipboard, device-secure check
src/crypto/              bytes, CSPRNG, AEAD envelope, Argon2id KDF (+KAT), key hierarchy
src/vault/               types, payload normalisation, lockout policy, vault service (the only code touching keys)
src/database/            migrations (SQLite), settings repository, backup log
src/features/            generator, strength, audit, cards, identity, categories, search, backup format, plan limits
src/services/            boot, context, clipboard, biometric, auto-lock, screen protection, backup files, monetization, log
src/store/               zustand stores (app settings/entitlement, vault mirror without secrets)
src/__tests__/           unit + integration + static security tests
docs/                    SECURITY.md (threat model), SECURITY-CHECKLIST.md, ARCHITECTURE.md
store/                   Play Store listing, data safety, privacy policy, release checklist
```

Technical details: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Setup

```bash
pnpm install                       # from the repository root
cp apps/safevault/.env.example apps/safevault/.env
pnpm --filter safevault typecheck
pnpm --filter safevault test
```

Run on Android (a development build is required — the native module and SecureStore biometrics
do not run in Expo Go):

```bash
cd apps/safevault
npx expo prebuild --platform android --clean
npx expo run:android
```

Check that the local module is autolinked:

```bash
cd apps/safevault && npx expo-modules-autolinking resolve --platform android
```

## Builds (EAS)

Profiles in `eas.json`: `development` (dev client, APK), `preview` (internal APK), `production` (AAB).

```bash
cd apps/safevault
eas init                                  # once, then set EAS_PROJECT_ID
eas build --profile preview --platform android
```

Secrets / IDs come from EAS or protected GitLab CI variables (`EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`,
`EAS_PROJECT_ID`, `EXPO_PUBLIC_PRIVACY_URL`). Nothing is published automatically: submission to Google
Play is a manual step (see [store/release-checklist.md](store/release-checklist.md)).

## In-app products (Google Play Console + RevenueCat)

| Product id | Type | Indicative price |
| --- | --- | --- |
| `safevault_premium_monthly` | subscription | 2.99 USD |
| `safevault_premium_annual` | subscription | 19.99 USD |
| `safevault_premium_lifetime` | one-time (non-consumable) | 39.99 USD |

Entitlement id: `premium`, offering: `default`. Prices displayed in the app always come from the store.

Free plan: 50 logins, 10 notes, 2 cards, 2 identities, built-in categories, generator, encrypted backups,
1 previous password per login. Premium: unlimited items, custom categories, detailed audit, 10-entry
history, separate backup password, accent colors.
