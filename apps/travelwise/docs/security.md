# TravelWise — privacy & security notes

TravelWise may hold travel plans, addresses, booking references, identity-document scans,
tickets and personal photos. This document states what is protected and **what is not**, so
the store listing, privacy policy and UI never over-promise.

## What the app does

- **Local only.** No account, no backend, no cloud sync. The database and files live in the
  app's private storage (`Paths.document/travelwise/{documents,photos}`), which other apps cannot read.
- **No cloud backup of app data.** `android.allowBackup = false`, so Google's automatic
  backup does not copy trips or documents.
- **Document & photo import (Phase 5).**
  - PDFs and images are picked with the system document picker (Storage Access Framework).
    Photos come from the Android Photo Picker. Neither needs a storage or media permission.
  - Only PDF/JPEG/PNG/WebP/HEIC files up to 25 MB are accepted. The type and size are checked
    before anything is copied.
  - The file is copied into the private folder under a **random name**: the original file
    name, which may contain a person's name, is not kept. The picker's cache copy is deleted
    right after the copy.
  - If the copy or the database write fails, the partial copy is deleted. If free space would
    drop below 50 MB, the import is refused.
  - SQLite stores only metadata and the private file URI, never the file content.
- **Offline viewing.** Images are shown in the app. PDFs are opened with a viewer installed on
  the phone (Android `ACTION_VIEW` with a temporary read grant on a content URI). No network
  is involved.
- **Optional Documents lock.**
  - Off by default. It uses Android BiometricPrompt via `expo-local-authentication`:
    fingerprint, face, or the phone's own PIN/pattern/password as fallback. TravelWise never
    stores a PIN.
  - It can only be turned on if the phone has a screen lock, and turning it off also requires
    the owner to unlock.
  - An unlock lasts 5 minutes and is dropped as soon as the app leaves the foreground.
- **Minimal permissions.**
  - Blocked in `app.config.ts`: storage, media, camera, location, microphone and overlay.
  - Added by plugins: `USE_BIOMETRIC` (optional lock) and `POST_NOTIFICATIONS` (task
    reminders). The notification permission is asked only when the user sets a reminder.
- **Reminders** are local notifications scheduled on the phone. Their text is the task title
  typed by the user. There is no push server and no token.
- **Analytics.**
  - Off by default and opt-in. The typed event catalogue (`services/analytics.ts`) only
    carries coarse enums and counts. It never carries names, destinations, booking references,
    addresses, amounts, documents or photos. `@factory/analytics` also strips PII-looking keys.
  - Error reports carry the error type only, never the message.
  - No analytics provider is registered in production builds yet.
- **Deletion.**
  - Deleting a document, place photo, journal entry or trip removes its rows and its files
    permanently, and cancels the trip's reminders.
  - "Delete all my data" wipes every table, the private file folder, scheduled reminders and
    temporary picker/export copies in the cache.
- **Temporary files** in the cache directory are cleaned at start-up. Journal photos picked
  but not saved are deleted when the editor closes.
- **Payment data.** Expense notes and payment methods that look like a card number are
  rejected.

## Limits (be explicit with users)

- **Files are not encrypted by TravelWise.** They rely on Android's device encryption
  (file-based encryption, active on Android 10+ devices with a lock screen). TravelWise must
  never describe documents as "encrypted" unless app-level encryption is added. That would
  need a vetted native crypto module and is out of scope for the MVP.
- The Documents lock is an **access gate** in the UI, not encryption: a rooted device or a
  forensic copy of the app's storage could still read the files. The UI says so.
- The SQLite database is not encrypted (no SQLCipher in the MVP).
- Anyone who can unlock the phone and open the app can see trips, places and the journal.
  Only Documents can be locked.
- A PDF opened in an external viewer is handled by that app while open. Some viewers may keep
  a recent-files entry.
- Exports (PDF/CSV, Phase 6) leave the app's sandbox once shared. The UI must say so.

## Rules for future phases

- Never send document content, photos or journal text to any server or SDK.
- Never generate, "verify" or look up booking references, flight times or visa rules.
  Everything is labelled as entered by the user.
- Never store payment card data. Expense "payment method" is a free label (e.g. "Card"),
  never a number.
- Keep ads away from documents, itinerary editing, expense entry and exports.
