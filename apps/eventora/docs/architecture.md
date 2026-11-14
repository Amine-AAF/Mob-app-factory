# Eventora — technical architecture

## Principles

1. **Offline-first, no backend.** All data is in SQLite (`eventora.db`) and in the app's private
   document directory. No network call is needed for any feature; ads and subscriptions are optional.
2. **Pure domain layer.** Everything that can be wrong (time zones, money, headcounts, overlaps,
   seating, CSV, reminders) lives in `src/domain/*` as pure functions with unit tests. Screens only
   compose them.
3. **Privacy by design.** Guest contacts and dietary data never leave the device unless the user shares
   an export, which is opt-in per export and preceded by a warning. Notifications never contain
   personal data. Analytics params never contain names, contacts, amounts or free text.
4. **Factory conventions.** Same boot sequence, stores, ads/monetization services and config files as
   DevSpeak; shared packages are consumed, never modified.

## Layers

```
Screens (app/)  →  features/ & components/  →  hooks/useData (mutate, useSnapshot)
                                              →  database/repositories  →  SQLite
                                              →  domain/* (pure)
services/: boot · notifications · files · sharing · backupService · ads · monetization · analytics
```

- `useSnapshot(eventId)` loads everything about an event in one call (`repositories.snapshot`).
- `mutate(fn)` runs a write, bumps `dataVersion` (every mounted screen reloads) and debounces a
  re-planning of local notifications.

## Data model (SQLite, migration v1)

| Table (spec entity) | Notes |
| --- | --- |
| `event_types` (EventTypes) | Seeded from `content/eventTypes.ts` (14 types), idempotent upsert at boot |
| `events` (Events) | wall-clock `start_date`/`start_time`/`end_date`/`end_time` + IANA `timezone`; derived `start_utc` for sorting; `budget_minor` + `currency`; `status`, `theme`, `template_id` |
| `guest_groups` (GuestGroups) | families / households; `ON DELETE SET NULL` from guests |
| `guests` (Guests) | names, private contacts, `plus_ones`, `children`, `is_child`, dietary, `rsvp_status`, `rsvp_responded_at` |
| `rsvp_records` (RSVPRecords) | append-only history with `source` (`manual`, `phone`, `message`, `in_person`, `import`, **`online`** reserved for a future opt-in web RSVP) |
| `invitations` (Invitations) | design JSON (template, colours, font, layout, background file URI) + texts |
| `event_budgets` (EventBudgets) | planned amount per category, `UNIQUE(event_id, category)` |
| `expenses` (Expenses) | estimated/actual minor units, currency, optional explicit `fx_rate`, due/paid dates, status, receipt URI, `vendor_id ON DELETE SET NULL` |
| `tasks` (Tasks) | due date, priority, category, status, assignee, optional vendor link |
| `timeline_items` (TimelineItems) | `start_min`/`end_min` = minutes from 00:00 of the event start date (≥ 1440 → after midnight), `CHECK(end ≥ start)` |
| `seating_tables` / `seating_assignments` (SeatingTables / SeatingAssignments) | shape, seats; `guest_id UNIQUE` → one seat per guest |
| `vendors` / `vendor_contracts` (Vendors / VendorContracts) | pipeline status, amount, next meeting instant; contract file URIs |
| `gifts` (Gifts) | gift or financial contribution, thank-you tracking (records only, no payments) |
| `event_templates` (EventTemplates) | user-saved templates (JSON payload); bundled templates live in code |
| `notification_settings` (NotificationSettings) | per kind: enabled, lead days, hour |
| `app_settings`, `subscription_cache` | misc settings, cached entitlement (offline grace) |

All event-owned tables cascade on event deletion. Indexes cover `event_id` + status/due date lookups.
Migrations use `@factory/storage.migrate` (`PRAGMA user_version`, one transaction per migration). Never
edit migration 1: append migration 2+.

Multi-row operations run in a transaction: create from template, duplicate, CSV import, RSVP change +
history, guest merge, seating auto-place, programme reorder/shift, backup restore.

`src/database/table.ts` is a small typed mapper (camelCase ↔ snake_case, booleans, JSON, nullable)
so repositories stay short; identifiers come only from declarations, values are always bound.

## Time zones (`domain/time.ts`)

- An event's date/time are stored **as the organiser typed them, in the event's zone**. "18:00 in
  Lisbon" remains 18:00 if the phone moves to Paris. `fmt.eventStart` formats with `timeZone`.
- `zonedToUtc` handles DST gaps (non-existent local time → just after the gap) and ambiguity
  (fall-back → first occurrence). Tested for Paris, New York, Tokyo, Los Angeles.
- Parties ending after midnight: `endTime ≤ startTime` on the same date means the next day
  (`eventEndUtc`, `crossesMidnight`). Programme items use minutes ≥ 1440.
- Tasks and reminders follow the **organiser's local day** (device zone).
- Vendor meetings are entered in the event's zone and stored as UTC instants.

## Money (`domain/money.ts`)

Integer minor units + ISO currency (`currencyDigits` from Intl: EUR 2, JPY 0). Totals are computed
**per currency**; an expense in another currency is added to the event totals **only** if the user
entered an explicit exchange rate on it, otherwise it appears in an "other currencies" notice.
`parseAmount` accepts "1 234,56", "1,234.56", "12,5", "€ 99".

## Guests, RSVP and seating

- Party size = guest + adult companions + children; `isChild` guests count as children.
- Duplicate detection: same normalised name, e-mail, or last 9 phone digits; union-find clusters;
  merge moves gifts and RSVP history.
- Seating counts party sizes; overloaded tables are flagged (placing anyway is allowed after a
  warning); auto-place keeps groups together (best fit). Declined guests are not seated.

## Notifications (`domain/reminders.ts` + `services/notifications.ts`)

The planner computes the full list of reminders (task due, high-priority deadline, event upcoming,
RSVP follow-up, payment due, vendor meeting) from settings and data; the service cancels Eventora's
scheduled notifications and schedules the plan (cap 60). Ids are prefixed `eventora-`. Texts are
generic i18n strings; the event name is included only if the user enabled it.

## Sharing & exports

- Invitations: native preview (`InvitationCard`) mirrored by `invitationHtml` → PDF (expo-print) →
  Android share sheet; plain text via `Share`; copy to clipboard. Image export is not available yet
  (would need `react-native-view-shot`, not in the factory's dependency set) — manifest feature flag
  `invitationImageExport: false`.
- Reports: `reports/html.ts` (10 report kinds, escaped, professional print CSS) and `reports/csv.ts`
  (UTF-8 BOM, formula-injection guard). Contacts excluded unless "Include contact details" is on.
- Backup: `@factory/storage` JSON backup of `USER_TABLES` (parent-first order for restore).
- Files (covers, invitation backgrounds, receipts, contracts) are copied into
  `Documents/eventora/<bucket>/` with random names; only URIs are stored. `allowBackup` is false.

## Monetization

`config/limits.ts` is the single policy: free = 2 active events, 150 guests/event, 6 round/rect tables,
3 vendors/event, basic invitation designs and templates; PDF/CSV exports, advanced budget charts,
custom templates and premium designs need Premium. JSON backup, data deletion and text invitations
are always free. Banners (`AdBanner`) are rendered only on Home, My Events, Settings and Templates —
never on guest, invitation or seating screens. UMP consent is gathered before ads are requested.

## Future online RSVP (not in MVP)

`rsvp_records.source = 'online'` and `guests.setRsvp(id, status, { source })` are the integration
points. A future opt-in module would publish a per-event link, fetch answers and record them with
`source: 'online'`; nothing in the MVP depends on it.
