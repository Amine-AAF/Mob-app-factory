# TravelWise — privacy & security notes

TravelWise may hold travel plans, addresses, booking references, identity-document scans,
tickets and personal photos. This document states what is protected and **what is not**, so
the store listing, privacy policy and UI never over-promise.

## What the app does

- **Local only.** No account, no backend, no cloud sync. The database and files live in the
  app's private storage (`Paths.document/travelwise/`), which other apps cannot read.
- **No cloud backup of app data.** `android.allowBackup = false`, so Google's automatic
  backup does not copy trips or documents.
- **Minimal permissions.** Storage, media, location, microphone and overlay permissions are
  blocked in `app.config.ts`. Files and photos will be picked with the system document picker
  and Android Photo Picker, which need no storage permission.
- **Analytics.** Off by default and opt-in. The typed event catalogue (`services/analytics.ts`)
  only carries coarse enums and counts. It never carries names, destinations, booking
  references, addresses, amounts, documents or photos. `@factory/analytics` also strips
  PII-looking keys. Error reports carry the error type only, never the message. No analytics
  provider is registered in production builds yet.
- **Deletion.** Deleting a trip removes its rows and its files. "Delete all my data" wipes
  every table, the private file folder and temporary picker/export copies in the cache.
- **Temporary files** in the cache directory are cleaned at start-up.

## Limits (be explicit with users)

- **Files are not encrypted by TravelWise.** They rely on Android's device encryption
  (file-based encryption, active on Android 10+ devices with a lock screen). TravelWise must
  never describe documents as "encrypted" unless app-level encryption is added. That would
  need a vetted native crypto module, which is out of scope for the MVP.
- An optional biometric/PIN lock for the Documents section is planned with
  `expo-local-authentication` (Phase 5). It is an **access gate** in the UI, not encryption: a
  rooted device or a forensic copy of the app's storage could still read the files.
- The SQLite database is not encrypted (no SQLCipher in the MVP).
- Anyone who can unlock the phone and open the app can see the trips.
- Exports (PDF/CSV, Phase 6) leave the app's sandbox once shared. The UI must say so.

## Rules for future phases

- Never send document content, photos or journal text to any server or SDK.
- Never generate, "verify" or look up booking references, flight times or visa rules.
  Everything is labelled as entered by the user.
- Never store payment card data. Expense "payment method" is a free label (e.g. "Card"),
  never a number.
- Keep ads away from documents, itinerary editing, expense entry and exports.
