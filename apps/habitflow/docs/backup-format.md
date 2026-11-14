# HabitFlow backup format (JSON)

Settings › Backup & data › **Export my data** writes `habitflow-backup-YYYY-MM-DD.json`.
The envelope is the factory-wide format of `@factory/storage` (`createBackup` / `restoreBackup`).

```jsonc
{
  "format": "factory-backup",      // constant
  "formatVersion": 1,              // envelope version
  "appId": "habitflow",            // a backup from another app is rejected
  "schemaVersion": 1,              // SQLite user_version at export time; newer than the app = rejected
  "createdAt": "2026-11-13T18:00:00.000Z",
  "tables": {
    "habits":          [ { "id": "h_…", "name": "Read", "icon": "book", "color": "#7A5C3E", "category": "learning",
                           "start_date": "2026-11-02", "duration_min": 20, "notes": null, "template_id": "read_20",
                           "sort_order": 0, "archived_on": null, "created_at": "…", "updated_at": "…", "description": null } ],
    "habit_schedules": [ { "habit_id": "h_…", "effective_from": "2026-11-02",
                           "frequency": "{\"type\":\"daily\"}",
                           "tracking": "{\"mode\":\"duration\",\"target\":20,\"unit\":\"min\"}", "created_at": "…", "updated_at": "…" } ],
    "habit_logs":      [ { "habit_id": "h_…", "day": "2026-11-02", "value": 20, "target": 20, "status": "done",
                           "note": null, "completed_at": "…", "created_at": "…", "updated_at": "…" } ],
    "xp_ledger":       [ { "habit_id": "h_…", "day": "2026-11-02", "xp": 10, "created_at": "…" } ],
    "tasks":           [ { "id": "t_…", "title": "…", "priority": "medium", "due_day": "2026-11-02", "time": "09:30",
                           "done": 0, "done_at": null, "habit_id": null, "sort_order": 0, "notes": null, "created_at": "…", "updated_at": "…" } ],
    "reminders":       [ { "id": "r_…", "habit_id": null, "hour": 20, "minute": 0, "days": "[]", "enabled": 1, "created_at": "…", "updated_at": "…" } ],
    "achievements":    [ { "id": "first_check", "unlocked_at": "…" } ],
    "user_settings":   [ ]
  }
}
```

## Field reference

| Field | Meaning |
| --- | --- |
| `day`, `start_date`, `effective_from`, `due_day`, `archived_on` | Local calendar day `YYYY-MM-DD` (never UTC). A time-zone change never moves an entry. |
| `frequency` (JSON string) | `{"type":"daily"}`, `{"type":"weekdays","days":[1,3,5]}` (0 = Sunday), `{"type":"timesPerWeek","count":3}`, `{"type":"timesPerMonth","count":8}`, `{"type":"interval","everyDays":2}` |
| `tracking` (JSON string) | `{"mode":"check"|"quantity"|"duration","target":n,"unit":"L"|null}` |
| `habit_schedules` | Rule history: the row with the latest `effective_from` ≤ a day applies to that day. |
| `habit_logs.status` | `done`, `partial` (quantity below target or note only), `skipped` (excused day). Primary key `(habit_id, day)`. |
| `habit_logs.target` | Target in force when the log was written (snapshot). |
| `xp_ledger` | One row per rewarded completion; primary key `(habit_id, day)` makes double rewards impossible. |
| `reminders.days` (JSON string) | Weekdays 0–6; `[]` = every day. |

## Restore rules

- **Destructive**: the app shows a summary (habits / check-ins / tasks / date) and asks for confirmation;
  all user tables are replaced in **one transaction** — on any error nothing changes.
- Columns unknown to the current schema are ignored, so older backups restore into newer versions.
- The subscription cache is never exported; Premium comes back with *Restore purchases*.
- Reminders are re-scheduled from the restored rows right after the import.
