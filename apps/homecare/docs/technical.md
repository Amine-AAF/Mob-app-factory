# HomeCare — technical documentation

## Data model (SQLite, `homecare.db`, migrations in `src/database/migrations.ts`)

```
homes 1─* rooms
homes 1─* assets ─* asset_events
homes 1─* maintenance_tasks 1─* maintenance_history
homes 1─* documents
homes 1─* recurring_expenses 1─* expenses (recurring_id, occurrence_date)
homes 1─* repairs
homes 1─* household_members
homes 1─* household_tasks 1─* household_checklist_items
                         1─* household_task_history
homes 1─* inventory_items
photos (owner_type, owner_id)   notification_settings   app_settings   subscription_cache
```

- `ON DELETE CASCADE` from `homes` to everything it owns; `ON DELETE SET NULL` for optional
  links (room, equipment, document, assignee, recurring schedule) so deleting a room or a
  piece of equipment never deletes tasks, history or expenses.
- `photos` is polymorphic (no FK): orphan rows/files are cleaned at start-up and after deletions
  (`cleanOrphanFiles`).
- Indexes on every list query: due dates, warranty/expiry dates, `(home_id, spent_on)`, room/asset links.
- Unique partial index `expenses(recurring_id, occurrence_date)` makes recurring catch-up idempotent.
- Ids are random TEXT (`newId`), calendar dates are local day keys `YYYY-MM-DD`, timestamps ISO UTC,
  money is integer minor units + ISO 4217 currency.
- Migrations: `user_version` pragma via `@factory/storage.migrate`; each migration runs in a
  transaction. Never edit a shipped migration — add version N+1.
- Transactions: home creation with rooms, asset create/update (+event), maintenance completion
  (history + task), postpone, chore completion (history + next date + checklist reset), checklist
  sync, recurring catch-up, restore, wipe.

## Recurrence rules (`src/domain/recurrence.ts`)

- Maintenance: next due = completion day + interval (late work moves the next date too).
- Chores: next due = due date + interval, skipping occurrences already in the past (stays on the same weekday).
- Recurring bills: anchored on the start date (`start + k·interval`) so month ends don't drift
  (Jan 31 → Feb 28 → Mar 31). Catch-up is bounded to 36 occurrences.
- Month arithmetic clamps to the last day of the month; leap years handled.
- Proposed frequencies are presets, never presented as technical recommendations (disclaimer on
  templates, task forms and detail screens).

## Money

`parseAmount` accepts `1 234,56`, `1,234.56`, `1.234,56`, `12.5` and the currency's decimals
(JPY 0, TND 3). `sumByCurrency` groups totals; `addMoney` throws on mixed currencies; the only
way to combine currencies is `convert` with an explicit, user-provided rate (no exchange API).
Budgets compare the home currency only; other currencies are listed separately.

## Notifications (`src/domain/reminderPlan.ts`, `src/services/reminders.ts`)

- Pure planner builds the list of reminders from data + settings; the service cancels every
  notification whose id starts with `homecare:` and schedules the plan (DATE triggers).
- Re-planned at start-up, when the app returns to the foreground, after every write (`mutate`),
  after settings or language changes. This is what makes reminders follow **time-zone changes**
  (fire times are computed in the device's current zone).
- Past moments: if the ideal reminder time already passed but the event is still ahead, the
  reminder moves to the next slot; past events are dropped; late chores get one "still to do" nudge.
- Cap of 48 soonest reminders (Android alarm limits); re-planning keeps the window rolling.
- Android 13+: channels created before the POST_NOTIFICATIONS prompt; denied permission ⇒ nothing
  scheduled and Settings explains how to re-enable; master and per-category switches.
- One Android channel per category (maintenance, warranty, document, recurring bill, repair, chore).

## Files (`src/services/files.ts`)

- Import with the system document picker (SAF) / Android photo picker: no storage permission.
- A private copy goes to `<documentDirectory>/homecare/{documents,photos}/<id>.<ext>`; the picker's
  cache copy is deleted immediately. The DB stores only the relative path and metadata.
- Paths are validated (`documents/<id>.<ext>` pattern) before any file operation (no traversal,
  no arbitrary URIs).
- Opening uses `File.preview` (content:// grant to the user's viewer); sharing copies to
  `<cache>/exports` under the original name and opens the share sheet. `<cache>/exports` and
  picker caches are purged at every start-up.
- Missing files (cleared storage, restore on another phone) are detected and shown as
  "File not found — attach again".
- `allowBackup=false`: Android auto-backup never uploads documents.

## Backup & restore (`src/services/backup.ts`)

JSON file (`factory-backup` format v1) with every user table, shared via the share sheet; restore
replaces all user data in one transaction and refuses invalid files, other apps' backups and
newer schemas without touching current data. Files are not embedded (size); records keep their
paths and show the missing-file state until re-attached. Candidate improvement: optional ZIP
including files.

## Privacy & logging

No personal data in analytics (opt-in, events carry only enum values) or logs
(`recordError` logs the message, not the payload). AdMob receives no document data; UMP consent
is gathered before any ad request.

## Shared-package needs (documented, not done)

- `@factory/notifications` only schedules one daily reminder; HomeCare implements date-based,
  multi-channel scheduling locally (`services/reminders.ts`) — candidate for mutualisation.
- `.gitlab-ci.yml` hard-codes `APP: devspeak`; HomeCare needs its jobs/matrix entry and a tag
  rule `^homecare-v\d+\.\d+\.\d+$` (shared file: requires coordination/validation).
