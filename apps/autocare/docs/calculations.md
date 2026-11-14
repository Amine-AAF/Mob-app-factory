# AutoCare — calculations and their limits

All in `src/features/`, pure and unit-tested (`src/__tests__`).

## Fuel / energy consumption (`fuel/consumption.ts`)

**Full-to-full**: a figure exists only between two **full** fills with known odometer readings.
Fuel of the segment = every quantity added after the first full fill up to and including the
second (partial top-ups count). Average = Σ fuel / Σ distance (distance-weighted).

| Situation | Behaviour |
| --- | --- |
| Only one full fill, or fills before the first full one | no figure (starting level unknown) |
| Partial fill | added to the next full fill's segment |
| "I missed a previous fill-up" | the segment is skipped (reason shown), chain resumes at next full |
| Full fill without odometer | doesn't close a segment; its fuel joins the next one |
| Odometer goes backwards / doesn't move | segment skipped, reason shown |
| Result outside 1–50 L/100 km or 5–80 kWh/100 km | flagged "unusual", excluded from average |
| Plug-in hybrid | litres and kWh are two independent chains |

Also: average price paid (Σ total / Σ quantity per currency), fuel cost per km (reliable
single-currency segments), monthly trend, validation of a new fill against history.

## Mileage (`odometer/mileage.ts`)

The app never knows the real mileage. Current odometer = highest reading. Daily rate = distance
between the first and last readings of the last 180 days (fallback: all history), requires ≥ 2
readings ≥ 14 days apart. Projections ("≈ … today", "estimated due date") are labelled estimates.

## Maintenance due (`maintenance/schedule.ts`)

User-defined `intervalKm` and/or `intervalMonths` from the last time done; whichever comes first.
Status: overdue (date passed or km ≤ 0), due soon (within remind days/km or estimated date within
remind days), ok, unknown (no reference/interval). Month arithmetic clamps to month end.
Saving a record advances the matching schedule only if the record is newer (backfills are safe).

## Costs (`expenses/aggregate.ts`, `money/money.ts`)

Cost entries = expenses + fuel + maintenance costs + tire purchases (each stored once).
Totals are **per currency**; conversion only with explicit rates (`convertTotals`, reports missing).
Cost per km = total / distance driven in the period (from readings; null if unknown).
TCO = purchase price + all running costs (resale value not included).
Budget compares spending **in the budget currency**; other currencies are reported apart.
Recurring expenses: occurrences generated on their dates (monthly/quarterly/6-monthly/yearly),
idempotent (unique index), capped at 120.

## Units (`units/units.ts`, `format/format.ts`)

km ↔ mi (1.609344), L ↔ US gal (3.785411784) ↔ UK gal (4.54609); consumption as L/100 km, km/L,
mpg (US), mpg (UK); electric as kWh/100 km, kWh/100 mi, km/kWh, mi/kWh. Storage is metric, so a
unit change never rewrites data. Units are chosen independently from the language.
