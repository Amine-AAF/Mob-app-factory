# FitTrack backup format

Produced by `exportUserData` (`src/services/backupService.ts`) on top of `@factory/storage` `createBackup`.

```json
{
  "format": "factory-backup",
  "formatVersion": 1,
  "appId": "fittrack",
  "schemaVersion": 1,
  "createdAt": "2026-11-13T18:00:00.000Z",
  "tables": {
    "exercises": [ { "id": "barbell-bench-press", "source": "library", "...": "..." } ],
    "workout_sessions": [ ],
    "...": [ ]
  }
}
```

- `tables` contains every table of `USER_TABLES` (`src/database/migrations.ts`), rows as stored
  (snake_case columns, metric units, epoch-ms instants, `YYYY-MM-DD` local days).
- Not included: `subscription_cache` (purchases are restored from Google Play), and the **photo files**
  themselves (`progress_photos` rows are kept; missing files are simply hidden).
- Restore (`importUserData`) is atomic: one transaction, foreign keys deferred to commit, tables emptied
  children-first and refilled parents-first. Any error rolls everything back.
- Rejected files: invalid JSON, other `appId`, `schemaVersion` newer than the app (`BackupError`).
- Older backups restore into newer schemas (unknown columns are ignored; missing ones get defaults).
- After a restore the bundled library is re-synced, so library rows always match the installed version.
