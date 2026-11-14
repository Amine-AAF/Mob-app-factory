# AutoCare — data model (SQLite, schema v1)

Conventions: ids are local text ids; dates are local days `YYYY-MM-DD`; timestamps ISO; distances
in **km**, liquids in **litres**, energy in **kWh**; money in **integer minor units** + ISO 4217
currency. Every user table has `created_at` / `updated_at`. `PRAGMA foreign_keys = ON`.

| Table (spec entity) | Key columns | Relations | Indexes |
| --- | --- | --- | --- |
| `vehicles` (Vehicles) | make, model, trim, year, vehicle_type, engine, fuel_type, transmission, power_hp, plate, vin, purchase_*, odometer_km (= highest reading), currency, photo_file, color, archived | parent of everything | — |
| `odometer_readings` (mileage history) | day, odometer_km, source, ref_id | → vehicles CASCADE; `ref_id` = source row (fuel/maintenance/expense/inspection) | (vehicle_id, day), UNIQUE ref_id |
| `maintenance_schedules` (MaintenanceSchedules) | type, interval_km, interval_months (user-defined), last_day, last_odometer_km, remind_days_before, remind_km_before, enabled | → vehicles CASCADE | vehicle_id |
| `maintenance_records` (MaintenanceRecords) | type, title, day, odometer_km, description, provider, cost_minor, parts | → vehicles CASCADE; → schedules SET NULL | (vehicle_id, day), type |
| `fuel_records` (FuelRecords) | day, odometer_km (nullable), quantity, quantity_unit L/kWh, unit_price (per L or kWh), total_minor, fuel_type, station, is_full, missed_previous | → vehicles CASCADE | (vehicle_id, day) |
| `insurance_policies` (InsurancePolicies) | insurer, policy_number, start_day, end_day (CHECK ≥ start), premium_minor, payment_frequency, coverage, contact_*, remind_days_before | → vehicles CASCADE; renewed_from_id → self SET NULL | (vehicle_id, end_day) |
| `expenses` (Expenses) | category, day, amount_minor, vendor, odometer_km, recurrence, recurring_parent_id | → vehicles CASCADE; → self SET NULL; insurance_id → policies SET NULL | (vehicle_id, day), category, UNIQUE (recurring_parent_id, day) |
| `administrative_reminders` (AdministrativeReminders) | type, title, due_day, amount_minor, remind_days_before (JSON), repeat_months (user-defined), completed_at | → vehicles CASCADE | due_day |
| `documents` (Documents) | category, title, **file_name** (private file, UNIQUE), mime_type, size_bytes, expiry_day | → vehicles CASCADE (nullable = general); maintenance/expense/insurance/deadline SET NULL | vehicle_id, expiry_day |
| `tire_records` (TireRecords) | brand, model, size, season, position, installed_*/removed_* (day + km), price_minor, status, reminder_day, reminder_km | → vehicles CASCADE | (vehicle_id, installed_day) |
| `vehicle_notes` (VehicleNotes) | title, body, pinned | → vehicles CASCADE | vehicle_id |
| `inspections` (checklist runs) | template_id, day, odometer_km, results (JSON) | → vehicles CASCADE | (vehicle_id, day) |
| `budgets` | scope ('all' or vehicle id), monthly_minor, currency | deleted with the vehicle | PK scope |
| `notification_settings` (NotificationSettings) | category, enabled, hour, minute | — | PK category |
| `user_settings` | key/value JSON (checklist customisations) | — | PK key |
| `subscription_cache` | entitlement cache (7-day offline grace) — never exported | — | PK key |

## Transactions

Repository writes that touch several rows run in `withTransactionAsync`: vehicle creation
(+ initial readings), fuel/maintenance/expense save & delete (+ odometer reading sync + vehicle
odometer refresh), maintenance save (+ schedule advance), deadline completion (+ next occurrence),
recurring expense generation, vehicle deletion (+ budget), restore and wipe.

## Migrations

`src/database/migrations.ts` — append-only list applied by `@factory/storage.migrate` through
`PRAGMA user_version`, each migration in its own transaction. Never edit a shipped migration.

## Files

Documents and photos are stored **outside** SQLite in the app's private documents directory
(`autocare-files/`). Deleting a document, a vehicle or all data deletes the files too.
