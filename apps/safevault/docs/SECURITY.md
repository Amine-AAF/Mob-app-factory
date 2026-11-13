# SafeVault — Security model

Status: **pre-release, not independently audited.** Nothing in this document is a claim that SafeVault
is "secure"; it describes what was designed, what is tested, and what is known not to be covered.
An independent security audit is required before any strong security claim in marketing (store listing
included — see `store/listing-*.md`, which deliberately avoids such claims).

## 1. Assets and goals

| Asset | Where it lives |
| --- | --- |
| Master password | Only in the user's head. Never stored, never logged, never sent. |
| Vault key (VK, 256-bit random) | SQLite only *wrapped* (encrypted). In memory while unlocked. Optional Keystore-protected copy for biometrics. |
| Item contents (passwords, notes, card numbers, identity data, titles, usernames, URLs, tags, category names) | SQLite, encrypted per item. |
| Backup files | Wherever the user puts them, encrypted under a backup password. |

Goals: confidentiality and integrity of the vault at rest and in backups; no data leaves the device
unless the user exports it; the app must fail closed (refuse) rather than degrade silently.

## 2. Threat model

### In scope (designed against)

| Threat | Mitigation |
| --- | --- |
| **Stolen/lost phone, locked vault** | All content encrypted; VK wrapped by an Argon2id-derived key. Attacker must brute-force the master password offline at Argon2id cost (64 MiB, 3 passes by default). |
| **Copy of the database file** (forensics, backup extraction, malicious app with root) | Same as above. `allowBackup=false` prevents Android Auto Backup / `adb backup` from copying the DB or SecureStore. `PRAGMA secure_delete=ON` overwrites deleted rows. |
| **Tampering with the database** (swap ciphertexts between rows, change type/key version, downgrade KDF params) | Every ciphertext is AEAD-authenticated with AAD = vault id + row id + type + field + key version + envelope version. KDF parameters have a floor and ceiling. Tampered rows are isolated and reported, never silently accepted. |
| **Guessing on the device UI** | Persistent exponential back-off after 5 failures (30 s → 15 min cap). Counter survives restarts. |
| **Shoulder surfing / screenshots / recent-apps thumbnail** | Secrets masked by default; reveal auto-hides after 30 s; `FLAG_SECURE` (screenshots, screen recording, recents thumbnail) on by default. |
| **Clipboard leakage** | Copies flagged `EXTRA_IS_SENSITIVE` (Android 13+); auto-clear after a configurable delay, on lock and on resume; only *our* clip is cleared (label check). |
| **Leaving the phone unlocked** | Auto-lock after inactivity or time in background (default 60 s, configurable 0–30 min). Manual lock. |
| **Malicious / corrupted / truncated backup file** | Strict structural validation before any password is asked; KDF bounds (no downgrade, no memory exhaustion); header bound to payload via AAD (SHA-256 of canonical header); item counts checked; import is a single transaction (all or nothing); replacing a vault needs explicit confirmation. |
| **Secrets in logs / crash reports / analytics** | No analytics, ads or crash-reporting SDK in the binary (enforced by `security.test.ts`). A single logger (`services/log.ts`) logs event codes only, silent in production. Native code never logs. |
| **Opening dangerous URLs from an item** | Only `http(s)` URLs can be opened (`safeOpenableUrl`). |

### Out of scope (known, documented limits)

- **Compromised device while unlocked** (root, malware with accessibility service, keylogger, screen
  reader abuse): such malware can read what is displayed or typed. No app-level mitigation is complete.
- **Forgotten master password**: no recovery by design (no server, no escrow). Users are warned before
  creating the vault and must acknowledge it.
- **Weak master password chosen by the user**: we enforce ≥ 10 characters and a "fair" strength score,
  but a determined offline attacker with a GPU farm can still break a guessable password.
- **Memory forensics**: JavaScript strings are immutable and garbage-collected; we wipe the byte arrays
  we own (keys, password bytes) and drop decrypted objects on lock, but copies may survive in the JS heap
  until collected. Secrets are decrypted per item on demand (summaries hold no secret) to minimise this.
- **Keyboard learning**: secret inputs use `secureTextEntry` / `visible-password`, autofill disabled,
  no autocorrect. Note bodies are free text: a third-party keyboard may learn words typed in them.
- **Camera filming the screen**, cold-boot / hardware attacks, OS vulnerabilities.
- **Breach detection**: not performed (would require an external service).
- **Settings integrity**: non-secret settings (theme, timers) are stored in clear in SQLite; an attacker
  able to write the DB could change the auto-lock delay — but could not read the vault.

## 3. Cryptographic architecture

```
master password ──UTF-8──► Argon2id(salt[16], m, t, p) ──► KEK (32 B, never stored)
                                                             │ XChaCha20-Poly1305, AAD "wrap|password|vaultId|k<ver>"
CSPRNG ─────────────────────────────────────────────────────► VK (32 B) — stored only as wrapped_key
                                                             │ HKDF-SHA256(salt = "safevault/vault/<vaultId>", info = purpose)
                                ┌────────────────┬───────────┴──────────┐
                           entries key     categories key        audit key (HMAC-SHA256, memory only)
```

| Primitive | Choice | Implementation |
| --- | --- | --- |
| KDF | **Argon2id** v1.3, default 64 MiB / t = 3 / p = 1, 16-byte random salt per vault and per backup | Native BouncyCastle 1.80 (`modules/safevault-native`), validated at every start-up by a known-answer test against `@noble/hashes` 2.4.0; JS fallback = `@noble/hashes` (same output). |
| AEAD | **XChaCha20-Poly1305** (256-bit key, 192-bit random nonce, 128-bit tag) | `@noble/ciphers` 2.4.0 (audited, constant-time ARX). |
| Subkeys | HKDF-SHA256 | `@noble/hashes`. |
| Randomness | `expo-crypto.getRandomBytes` → `java.security.SecureRandom` | Rejection sampling for uniform integers. Fails closed if unavailable. |
| Biometric key storage | `expo-secure-store` with `requireAuthentication` → Android Keystore AES key requiring BiometricPrompt (class 3); invalidated by the OS on biometric re-enrolment | Offered only with strong biometrics and a secure lock screen. |

**Why XChaCha20-Poly1305 rather than AES-256-GCM**: equivalent security level; 192-bit nonces make
random nonces safe at any realistic volume (GCM's 96-bit nonces are not misuse-resistant), and ChaCha is
constant-time in pure JavaScript (table-based AES in JS is not). No hand-written cryptography: only the
envelope layout and key hierarchy are ours.

**Argon2id parameters** — profiles (`src/crypto/kdf.ts`):

| Profile | Memory | Passes | Lanes | Use |
| --- | --- | --- | --- | --- |
| compatible | 32 MiB | 4 | 1 | slow / low-RAM devices |
| standard (default) | 64 MiB | 3 | 1 | most devices |
| high | 128 MiB | 3 | 1 | fast devices |

Chosen at creation by a quick benchmark (16 MiB, 1 pass, extrapolated). Accepted bounds when reading
a vault or backup: 19–256 MiB, 2–10 passes, 1–4 lanes (OWASP floor 19 MiB / t = 2). Parameters are
upgraded to `standard` when the master password is changed. A simple SHA-256 of the password is never used.

### Envelope format v1 (`src/crypto/aead.ts`)

`[0x01 version][0x01 alg = XChaCha20-Poly1305][24-byte nonce][ciphertext ‖ 16-byte tag]`, stored base64.
Unknown version/algorithm → `unsupported_version`, never a best-effort decode.

### Associated data (AAD)

- Entry: `safevault|entry|<vaultId>|<rowId>|<type>|meta|secret|k<keyVersion>|c<cryptoVersion>`
- Category: `safevault|category|<vaultId>|<id>|k<keyVersion>`
- Key check: `safevault|keycheck|<vaultId>|k<keyVersion>`
- Backup payload: `safevault|backup|<backupId>|v<version>|<sha256(canonical header)>`

## 4. Vault lifecycle

- **Create**: refuse if a vault exists (never overwritten). Password ≥ 10 chars + strength ≥ "fair" (UI).
  User must acknowledge "no recovery". VK random; built-in categories seeded in one transaction.
- **Unlock**: check persisted lockout → Argon2id → unwrap VK (authentication failure = wrong password;
  failure counter incremented) → derive subkeys → verify key-check → decrypt *meta* of each row.
  A row failing authentication is isolated (`corruptedIds`) and can be purged after confirmation.
- **Lock** (manual, auto-lock, background): subkeys and VK zeroed, summaries dropped, clipboard cleared,
  every protected screen unmounted (`router.dismissAll()` + replace).
- **Biometric unlock**: VK read from Keystore-backed SecureStore after BiometricPrompt, then verified with
  the key-check ciphertext. Invalidated key → biometrics disabled, master password required.
- **Change master password**: verify current → new salt (and upgraded parameters) → re-wrap VK.
- **Key rotation**: new VK, every row decrypted first then re-encrypted in one transaction,
  `key_version + 1`, biometric copy removed.
- **Delete everything**: requires the master password and a confirmation; erases all tables and the
  SecureStore copy.

## 5. What is stored in clear

`vault_meta`: vault id, format version, KDF parameters + salt, wrapped VK, key-check ciphertext,
key version, timestamps (created / password changed / key rotated), failed-attempt counter, lockout
deadline, biometric flag. `entries`: id (random 128-bit), type, key/crypto versions, created/updated
timestamps. `categories`: id, built-in key (e.g. `work`), sort order. `settings`: theme, language,
timers, generator options. `backup_log`: dates and counts. `subscription_cache`: store entitlement.

This reveals *how many* items of each type exist and when they changed — not what they are.

## 6. Backups

See `src/features/backup/format.ts`. Key properties: fresh salt and random backup key per export;
password = master password (verified, so no typo) or, with Premium, a separate password; payload contains
no clear-text field; any change to header or payload is detected; decryption happens fully before
the single import transaction; "Replace" needs an explicit confirmation dialog; "Merge" keeps the most
recently updated copy. Files are written only where the user chooses (SAF folder picker or share sheet);
temporary cache copies are deleted immediately.

## 7. Monetization and network

The only network-capable SDK is RevenueCat (Google Play Billing), active only if an API key is
configured. It receives purchase/receipt data and an anonymous app user id — never vault content.
No ads anywhere; no analytics anywhere; no notifications (the app requests no notification permission).

## 8. Password strength and audit methods

`src/features/generator/strength.ts`: alphabet size from character classes; characters belonging to
repeats, sequences, keyboard rows, years (1900–2099) and dictionary words weigh 25 %; common-password
list caps at ~10 bits; score buckets <28 / <36 / <60 / <80 bits. Informative only.

`src/features/audit/audit.ts`: weak (score ≤ 1), reused (HMAC fingerprints with the audit subkey, in
memory only), incomplete (no password, or neither username nor email), old (> 365 days). Runs locally.

## 9. Tests

`pnpm --filter safevault test` — see `src/__tests__/`:
`crypto.test.ts` (encodings, RNG failure, AEAD tamper/AAD/nonces/versions, RFC 9106 vector, KAT,
engine selection, KDF bounds), `vault.test.ts` (lifecycle, lockout persistence, no plaintext in SQLite,
history, AAD row binding, type tampering, categories, password change, key rotation, biometric path,
key wiping), `backup.test.ts` (round-trip to fresh install, wrong password, header/payload tampering,
corrupted/foreign/future files, KDF DoS/downgrade, atomic import, merge), `services.test.ts` (clipboard
clearing, biometric storage options), `security.test.ts` (static: no console, no tracking SDK, no
network calls, no Math.random, Android config), `features.test.ts`, `i18n.test.ts`, `ui.test.tsx`.

Functional tests are **not** proof of security. See `SECURITY-CHECKLIST.md` for the manual verification
to perform on real devices before each release.
