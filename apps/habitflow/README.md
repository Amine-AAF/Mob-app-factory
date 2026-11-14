# HabitFlow — Habit Tracker & Daily Planner

*Build Better Habits. One Day at a Time.* — app #5 of Mobile Apps Factory.

Offline-first Android app (Expo SDK 58, React Native 0.88, TypeScript strict, Expo Router, SQLite, Zustand, i18next).
No account, no backend. English (default), French, Spanish. Light & dark.

## Features

| Area | What it does | Code |
| --- | --- | --- |
| Today | Greeting, date, progress dial + animated bar, done/left counts, week strip, quick check-in, weekly goal, planner preview, one rule-based observation, FAB (habit / template / task), positive toast | `app/(tabs)/index.tsx` |
| Habits | Create / edit / archive / restore / delete; name, description, icon, color, category, start date, frequency, tracking, target, duration, notes; per-habit reminders | `app/habit/*`, `components/HabitEditor.tsx` |
| Frequencies | Daily, chosen weekdays, X per week, X per month, every N days | `features/habits/schedule.ts` |
| Tracking | Done/not done, quantity, duration (target-based); undo; skip; notes; past-day correction (explicit only) | `features/tracking/progress.ts`, `services/habitService.ts` |
| Streaks | Current / best streak (days, or weeks/months for flexible habits), completion rate, 7- and 30-day consistency | `features/statistics/streaks.ts` |
| Calendar | Month & week views, complete / partial / missed colors, day detail | `app/(tabs)/calendar.tsx`, `app/day/[day].tsx` |
| Planner | Day tasks with priority, optional time, due date, done, manual order, optional habit link, overdue on today | `app/planner.tsx`, `app/task/edit.tsx` |
| Reminders | Local notifications per habit or general, chosen weekdays, several per habit, individually toggled, capped at 48 | `features/reminders/plan.ts`, `services/reminders.ts` |
| Insights | Daily / weekly / monthly rates, 7-day and 8-week charts, week comparison, ranking, rule-based observations | `features/statistics/*`, `app/(tabs)/insights.tsx` |
| Templates | 44 original templates in 10 groups, customizable before adding | `features/templates/data.ts` |
| Gamification | XP ledger (once per habit/day, no XP for back-fills older than 1 day), levels, 10 badges, weekly goal | `features/gamification/rewards.ts` |
| Backup | JSON export/import with confirmation, full deletion | `services/backupService.ts`, [docs/backup-format.md](docs/backup-format.md) |
| Monetization | Premium via RevenueCat (monthly / annual / lifetime), AdMob banner / interstitial / rewarded with strict placement rules | [store/monetization-setup.md](store/monetization-setup.md) |

## Data model (SQLite, `src/database/migrations.ts`)

`habits`, `habit_schedules` (versioned rules: PK `habit_id, effective_from`), `habit_logs` (PK `habit_id, day` — one
entry per habit and local day), `xp_ledger` (PK `habit_id, day`), `tasks`, `reminders`, `achievements`,
`user_settings`, `subscription_cache`. Migrations via `@factory/storage` (`user_version`).

Date rules: every day is a local `YYYY-MM-DD` key captured when the user acts. A time-zone or DST change never moves
an existing entry; "today" rolls over at midnight and when the app returns to the foreground. Nothing ever writes a
past day automatically.

## Shared packages used

`@factory/app-config`, `app-core` (day keys, levels), `design-system`, `localization`, `storage` (migrations, backup,
KV), `analytics`, `monetization` (entitlements, ad policy, RevenueCat), `notifications` (permission, channel),
`testing` (sql.js). No shared package was modified.

## Commands

```bash
pnpm --filter habitflow typecheck
pnpm --filter habitflow test
cd apps/habitflow && npx expo start --dev-client      # after a dev build is installed
cd apps/habitflow && npx expo run:android             # local dev build (Android SDK + JDK 17)
cd apps/habitflow && eas build -p android --profile preview      # test APK
cd apps/habitflow && eas build -p android --profile production   # AAB (store)
```

The app needs a **development build** (native modules: SQLite, notifications, AdMob, RevenueCat), not Expo Go.
Status, known issues and what is left: [factory/tracking/habitflow.md](../../factory/tracking/habitflow.md).
