# AutoCare backup format

Produced by Settings → Backup & data → Export (`services/backupService.ts`), using the factory
format of `@factory/storage`:

```json
{
  "format": "factory-backup",
  "formatVersion": 1,
  "appId": "autocare",
  "schemaVersion": 1,
  "createdAt": "2026-11-13T10:00:00.000Z",
  "tables": {
    "vehicles": [{ "id": "v_…", "make": "Renault", "odometer_km": 30000, "currency": "EUR", "…": "…" }],
    "odometer_readings": [],
    "maintenance_schedules": [],
    "maintenance_records": [],
    "fuel_records": [],
    "insurance_policies": [],
    "expenses": [],
    "administrative_reminders": [],
    "documents": [],
    "tire_records": [],
    "vehicle_notes": [],
    "inspections": [],
    "budgets": [],
    "notification_settings": [],
    "user_settings": []
  }
}
```

- Rows are the raw SQLite rows (snake_case, metric units, integer minor money units).
- `subscription_cache` is never exported (Premium is restored from Google Play).
- **Attached files (PDF, images) are not embedded**: they can be large and stay in the app's
  private storage. After restoring on another device, their metadata is kept and the UI shows
  "file not on this device". Share important documents individually if needed.
- Restore is atomic (single transaction), rejects files from another app (`wrong_app`), invalid
  JSON/format and backups from a newer schema (`newer_schema`). Unknown columns are ignored, so an
  older backup restores into a newer schema.
- The file is written to a temporary cache folder, handed to the Android share sheet, then deleted.
