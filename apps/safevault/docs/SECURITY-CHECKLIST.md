# SafeVault — Release security checklist

Run on a **release build** (`eas build --profile preview`) on at least two physical devices
(one Android 10–12, one Android 14+; ideally one low-RAM device). Record results in
`factory/tracking/safevault.md`. Any ❌ blocks the release.

## Dependencies
- [ ] `pnpm audit --prod` reviewed; no unresolved high/critical in the app's dependency tree.
- [ ] `@noble/hashes`, `@noble/ciphers` pinned exactly; changelog reviewed for any version bump.
- [ ] `org.bouncycastle:bcprov-jdk18on` version reviewed (CVE check) — `modules/safevault-native/android/build.gradle`.
- [ ] No ads / analytics / crash SDK (`security.test.ts` green) and `npx expo-modules-autolinking resolve --platform android` lists nothing unexpected.

## Cryptography on device
- [ ] Settings › Security & privacy shows "Argon2id engine: native" (KAT passed). If it shows "JavaScript", investigate before release.
- [ ] Vault creation time measured (target < 3 s on the slow device); chosen profile noted.
- [ ] Unlock with wrong password ×5 → 30 s wait; kill the app → wait still enforced.

## Logs
- [ ] `adb logcat | grep -iE "safevault|<a test password>|<test card number>"` while creating, viewing, copying, exporting and importing items: no secret, no title.
- [ ] Release bundle: `grep` the exported JS bundle for `console.log` (should be none from app code).

## SQLite storage
- [ ] `adb shell run-as <pkg> cat databases/safevault.db > vault.db` (debuggable preview build) and inspect with `sqlite3`: no title, username, URL, password, note, card number, identity field or category name in clear (`strings vault.db | grep -i <known values>` returns nothing).
- [ ] WAL file (`safevault.db-wal`) inspected the same way.
- [ ] After deleting an item, its old ciphertext is not recoverable from free pages (`secure_delete`).

## Backup files
- [ ] Exported `.safevault` file: `grep` for known titles/passwords returns nothing; only format, version, date, KDF params visible.
- [ ] Modify one character of the file → import refused ("modified"). Truncate it → "damaged". Wrong password → "Wrong backup password".
- [ ] Restore on a fresh install (uninstall → reinstall) works end to end.
- [ ] Import "Replace" asks for confirmation; cancelling leaves the vault untouched.

## Screen & clipboard
- [ ] Screenshot attempt → blocked (black/denied). Screen recording → black. Recent apps → blank thumbnail.
- [ ] Copy a password → Android 13+ clipboard overlay does not show the value; clipboard empty after the configured delay; empty after locking.
- [ ] Copy a password, then copy text in another app → returning to SafeVault does not wipe the other text.

## Background behaviour
- [ ] Auto-lock "Immediately": switching apps locks the vault; returning shows the unlock screen, never a flash of content.
- [ ] Auto-lock 1 min: in background for > 1 min → locked on return (even if the process was frozen).
- [ ] Process killed by the system while unlocked → vault locked at next launch.

## Biometrics
- [ ] Enable biometric unlock → works. Add a new fingerprint in Android settings → biometric unlock disabled with an explanation, master password works.
- [ ] Device without screen lock → option unavailable.

## Android permissions & manifest
- [ ] `aapt dump permissions app.apk`: only INTERNET, ACCESS_NETWORK_STATE (billing), USE_BIOMETRIC / USE_FINGERPRINT, BILLING, and RN defaults. No storage, camera, location, notifications, AD_ID.
- [ ] `android:allowBackup="false"` in the merged manifest.
- [ ] No exported activity other than the launcher; deep link scheme `safevault://` opens nothing sensitive while locked.

## Notifications
- [ ] The app posts no notification at any time.

## Documentation
- [ ] `docs/SECURITY.md` matches the shipped behaviour (parameters, limits).
- [ ] Store listing makes no absolute security claim ("unhackable", "100 % secure", "military grade").
- [ ] Independent audit status stated honestly.
