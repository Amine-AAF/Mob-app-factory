# AutoCare — architecture

## Layers

```
UI (app/, src/screens, src/components)          React Native + Expo Router, @factory/design-system
   │  useAsync(loader) ── reload on session.dataVersion
   ▼
services/  boot · dashboard · reminders · fileStore · backupService · ads · monetization · analytics
   │
   ├── database/  repositories (transactions, odometer sync, schedule advance, recurrences)
   │       └── table.ts (typed camel↔snake mapper) · specs.ts · migrations.ts (user_version)
   └── features/  PURE logic (no React, no SDK) — 100% unit-tested
           units · money · format · fuel/consumption · odometer/mileage · maintenance/schedule
           expenses/aggregate · deadlines · reminders/plan · comparison · reports (csv, pdf, build)
           templates · premium/limits
```

- **Offline-first**: boot opens SQLite, migrates, generates due recurring expenses, renders.
  No screen waits for the network. RevenueCat and AdMob initialise in the background and can fail
  silently. App code contains no `fetch` (tested).
- **Writes** go through repositories, then `afterWrite()` bumps `dataVersion` (screens reload) and
  rebuilds the notification set (debounced 800 ms).
- **Shared packages used**: app-config (manifest), app-core (dates), design-system, localization,
  storage (migrate/backup/KV), monetization (entitlement + ad policy), notifications (permission,
  channel), analytics (consent + PII filter), testing (sql.js). No shared package was modified.

## Navigation

`app/index.tsx` → onboarding or tabs. Tabs: **Home, Vehicles, Maintenance, Expenses, Settings**.
Each vehicle has a dedicated space `vehicle/[id]` with tiles to every module. Entry forms are stack
screens reachable in one tap from Home's quick actions (fill-up, expense, service, mileage).

## Notifications

`features/reminders/plan.ts` builds the full list of future notifications from the data
(maintenance schedules by date and/or estimated mileage, deadlines with their lead days,
latest insurance policy, document expiries, tire reminders, a monthly "update your mileage"
nudge). `services/reminders.ts` cancels AutoCare's own notifications and schedules the plan with
`DATE` triggers (nearest 60). Each category can be disabled and its hour chosen; a global switch
turns everything off. Premium unlocks multiple lead times per item.

## Monetization

- Free: 1 vehicle, basic history (charts limited to 6 months), fuel unlimited, 40 manual
  expenses/month, 10 documents, 5 schedules, one reminder per item, banner ads on overview screens.
- Premium (RevenueCat entitlement `premium`; products `autocare_premium_monthly|annual|lifetime`,
  indicative 2.99 / 17.99 / 29.99 USD — the UI always shows the store's localized price):
  unlimited vehicles, full history & statistics (24 months), PDF/CSV reports, unlimited documents,
  comparison, advanced reminders, checklist customisation, no ads.
- Ads: AdMob banner only, Google test IDs in development/preview, UMP consent, never on forms,
  paywall, settings or documents; no keywords/targeting (tested).

## Privacy & files

- `allowBackup=false`; storage/camera/location/microphone permissions blocked in `app.config.ts`.
- Files are picked with the system picker (SAF) and **copied** into `Documents/autocare-files`.
  Exports are written to `cache/exports`, shared, then deleted (and the folder is cleared at boot).
- Logs: `recordError(error, context)` only; never `console.log` of user data (tested).

## Candidates for mutualisation (not done — shared packages untouched)

- `services/reminders.ts` date-based planning → `@factory/notifications` (HabitFlow has a similar need).
- `features/reports/pdf.ts` (dependency-free PDF) and `csv.ts` → a future `@factory/export`.
- `database/table.ts` typed mapper → `@factory/storage`.
- `services/clock.ts`, `services/boot.ts`, `services/ads.ts`, `services/monetization.ts` — same
  pattern as DevSpeak/HabitFlow (already listed in portfolio.md).
