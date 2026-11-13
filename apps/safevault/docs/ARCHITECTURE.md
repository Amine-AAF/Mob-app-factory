# SafeVault — Technical architecture

## Layers

```
Screens (app/)  ──►  stores (src/store) ──►  vault service (src/vault/vaultService.ts) ──► SQLite
     │                    │                         │
     │                    └─ summaries only          └─ crypto (src/crypto) ──► noble / native module
     └─ components (src/components): masked values, secure copy, strength meter
```

- **vaultService** is the only module that ever holds keys (closure variables, never in React or zustand
  state). It exposes summaries (`items()`), on-demand secrets (`getSecret(id)`), and atomic operations
  (create, unlock, lock, save, patchMeta, delete, categories, changeMasterPassword, rotateVaultKey,
  audit, snapshot, importSnapshot, destroy). It is pure TypeScript over the `SqlDatabase` interface of
  `@factory/storage`, so it runs identically on expo-sqlite and on sql.js in tests.
- **store/vault.ts** mirrors summaries for React and adds plan limits, biometrics and clipboard clearing.
- **Screens** decrypt a secret only while they are mounted and drop it on unmount; the root `LockGuard`
  dismisses every protected screen when the vault locks.

## Data model (SQLite, migration 1)

| Table | Clear columns | Encrypted column(s) |
| --- | --- | --- |
| `vault_meta` (1 row) | vault_id, format_version, kdf (params + salt), key_version, timestamps, failed_attempts, lockout_until, biometric_enabled | wrapped_key, key_check |
| `entries` | id, type, key_version, crypto_version, created_at, updated_at | meta_ct, secret_ct |
| `categories` | id, builtin, key_version, sort_order | data_ct (name/color/icon, null for untouched built-ins) |
| `settings` | key, value (non-secret JSON) | — |
| `backup_log` | kind, created_at, item_count, format_version | — |
| `subscription_cache` | state (entitlement) | — |

Versioning: `PRAGMA user_version` (schema), `vault_meta.format_version` (vault format),
`entries.crypto_version` (envelope), `key_version` (key rotation), backup `version`. Readers refuse
newer versions instead of guessing.

## Item payloads

`meta` (decrypted at unlock): title, categoryId, favorite, tags, lastViewedAt + type-specific
(login: url/username/email; note: format; card: cardholder/brand/last4/expiry; identity: template).

`secret` (on demand): login password/description/notes/passwordUpdatedAt/history; note body;
card number/notes; identity fields. All payloads pass through `normalizeMeta/normalizeSecret`
(type checks + length bounds) whether they come from the database, the UI or a backup.

## Native module

`modules/safevault-native` (autolinked local Expo module, Android only):
`argon2id`, `copySensitive`, `clearClipboardIfLabel`, `isDeviceSecure`. Loaded with
`requireOptionalNativeModule`: `null` in Jest / Expo Go. The Argon2 engine is trusted only after the
start-up KAT (`selectEngine`). Native code cannot be compiled in this repository's CI without the
Android toolchain: verify on a dev build (see tracking file).

## Shared packages used

`@factory/design-system` (theme, components), `@factory/localization` (i18next bootstrap),
`@factory/storage` (SQL interface, migrations), `@factory/monetization` (entitlements, RevenueCat
adapter), `@factory/app-config` (manifest schema), `@factory/testing` (sql.js). No shared package was
modified. `@factory/analytics` is intentionally **not** used.

Candidates for later mutualisation (not done, to avoid touching shared code in parallel):
`src/crypto/*` (generic AEAD/KDF helpers), `services/clipboard.ts`, `services/screenSecurity.ts`.
