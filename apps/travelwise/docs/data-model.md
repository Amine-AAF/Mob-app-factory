# TravelWise — data model

Local SQLite database `travelwise.db` (expo-sqlite), schema in
[`src/database/migrations.ts`](../src/database/migrations.ts), migrated through `@factory/storage`'s
`migrate()` (`PRAGMA user_version`). Foreign keys are enabled on every connection.

## Conventions

| Kind | Storage | Example | Rule |
| --- | --- | --- | --- |
| Id | `TEXT` UUID v4 | `3f2a…` | generated on the device |
| Calendar date | `TEXT` `YYYY-MM-DD` | `2026-07-30` | a day **at the destination**, no time zone |
| Wall-clock time | `TEXT` `HH:mm` | `17:00` | local time **at the destination**, never converted |
| Instant | `TEXT` ISO-8601 UTC | `2026-06-01T10:00:00.000Z` | creation/update time, reminders, rate capture |
| Time zone | `TEXT` IANA, optional | `Europe/Lisbon` | informative; validated with `Intl` |
| Money | `INTEGER` minor units + `TEXT` ISO 4217 | `4200` + `EUR` = 42.00 € | JPY has 0 decimals |
| Boolean | `INTEGER` 0/1 | | |
| File | `TEXT` app-private URI + metadata | | the bytes are **never** stored in SQLite |

### Date and time-zone strategy

- A trip's dates and an activity's time are what the traveller reads on their ticket or
  planning ("09:00 in Lisbon"). They are stored as plain local strings and are **never
  shifted** when the phone changes time zone, so nothing silently moves to 10:00 after landing.
- Durations, day counts and countdowns use calendar arithmetic on those strings, so they are
  independent of the device time zone and of daylight-saving changes
  (see `src/utils/dates.ts`, tested on DST weekends and year boundaries).
- Calendar dates are displayed by formatting a noon-UTC `Date` with `timeZone: 'UTC'`:
  "2026-07-30" shows as 30 July on every phone.
- Moments in time (when a row was created, when a reminder must fire) are UTC instants.
- Each destination may carry an IANA time zone. It is shown to the user and will be used to
  compute reminder instants in Phase 5. It never rewrites stored times.
- Multi-time-zone trips: each day links to a destination (`itinerary_days.destination_id`),
  so a day's times are read in that destination's zone.

## Tables

| Table | Belongs to | Purpose / notable columns |
| --- | --- | --- |
| `trips` | — | name, primary destination, country (ISO alpha-2), dates, optional zone, type, status, budget, currency, `is_demo`, `archived_at` |
| `trip_destinations` | trip (cascade) | ordered stops: city, country, zone, dates |
| `participants` | trip (cascade) | travellers used for shared expenses (`is_self`) |
| `itinerary_days` | trip (cascade) | date, destination (set null), title, notes, estimated budget, position |
| `activities` | trip + day (cascade) | category, start/end time (nullable), duration, price, status, position, place (set null) |
| `bookings` | trip (cascade) | user-entered booking: type, provider, **user-typed** reference, departure/arrival info, status, attachment (set null) |
| `places` | trip (cascade) or none | name, address, category, optional user-typed coordinates (range-checked), favourite, day (set null) |
| `travel_documents` | trip (cascade) or none | title, type, private file URI, MIME type, size, optional expiry |
| `budgets` | trip (cascade) | planned amount per category, PK (trip, category) |
| `expenses` | trip (cascade) | amount + currency, amount converted to the trip currency with the user's rate, category, date, payer (set null), split mode |
| `expense_participants` | expense + participant (cascade) | share of each participant in minor units |
| `packing_lists` / `packing_items` | trip (cascade) / list (cascade) | lists, user templates (`is_template`, no trip), items with quantity, priority, packed |
| `checklists` / `checklist_items` | trip / checklist (cascade) | tasks with due date, priority, status, reminder instant + notification id |
| `journal_entries` | trip (cascade) | date, city, text, JSON array of private photo URIs |
| `currency_rates` | trip (cascade) or none | **user-entered** rate, its date and source (`manual`), `base <> quote`, `rate > 0` |
| `currency_conversions` | — | converter history (amount, result, rate, rate date, source) |
| `weather_notes` | trip / destination (cascade) | conditions typed by the user, min/max °C, notes |
| `user_settings` | — | key/value JSON |

`USER_TABLES` lists every table children-first; it drives "Delete all my data".

## Deletion

- Deleting a trip removes every row that belongs to it through `ON DELETE CASCADE`, in one
  transaction (`trips.remove`). Before deleting, the repository collects the trip's file URIs
  (cover, documents, place photos, journal photos), and the caller deletes the files
  (`features/trips/actions.ts → services/files.ts`). Only files inside the app's private
  `travelwise/` folder can be deleted (`utils/paths.ts`).
- Deleting a destination detaches its days (`SET NULL`). It does not delete them.
- Duplicating a trip copies the plan (destinations, travellers, days, activities, places
  without photos, budget, packing lists, checklists, weather notes) with progress reset and
  optional date shifting. Bookings, expenses, journal, documents and files are never copied.

## Repositories

- `trips`: create / update / get / list / routes / count / archive / unarchive / remove /
  fileUris / duplicate / summaries, with typed validation errors (`TripValidationError.code`).
- `settings`: key/value settings.
- `itinerary` (Phase 3): listDays (activities sorted by local time, untimed last), syncDaysWithTrip (one day per date,
  destination chosen by date range), addDay / updateDay / deleteDay, activity CRUD, duplicate, status, reorder / shift,
  moveActivity (keeps the local time), applyTemplate (content/itineraryTemplates.ts).
- `bookings` (Phase 3): CRUD with typed validation, chronological list (undated last), upcoming (non-cancelled).
- `packing` (Phase 3): trip lists, built-in templates (content/packingCatalog.ts, names copied in the user language),
  personal templates (`is_template = 1`, no trip, survive trip deletion), items CRUD, packed toggle, reset.

Later phases add one repository per feature (itinerary, bookings, expenses…) on the same schema.
