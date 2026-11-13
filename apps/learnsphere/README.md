# LearnSphere — Personal Learning & Study Planner

App #13 of the Mobile Apps Factory. An offline-first Android study companion: organise subjects and
courses, plan study time, take notes, memorise with spaced-repetition flashcards, practise with quizzes,
track exams and deadlines, focus with a Pomodoro timer and follow your progress.

No account, no backend, no paid API. Everything is stored on the device (SQLite). English by default,
French and Spanish included.

| | |
| --- | --- |
| Folder | `apps/learnsphere` |
| Package id | `com.mobileappsfactory.learnsphere` (placeholder: permanent after the first Play upload) |
| Stack | Expo SDK 58 · React Native 0.88 · Expo Router · Zustand · expo-sqlite · i18next · TypeScript strict |
| Monetization | hybrid: RevenueCat subscriptions (monthly / annual / lifetime) + AdMob banner |
| Locales | en (default), fr, es |

## Install and run

```bash
# from the monorepo root
pnpm install
cd apps/learnsphere
pnpm typecheck
pnpm test
npx expo run:android          # dev build on a device/emulator (Expo Go can't load AdMob/RevenueCat)
```

Environment variables: copy `.env.example` to `.env`. Development and preview builds always use
Google's **test** AdMob IDs; production IDs come only from protected CI/EAS variables.

### EAS builds

```bash
cd apps/learnsphere
eas init                                   # once: writes the EAS project id (set EAS_PROJECT_ID)
eas build -p android --profile development # dev client APK
eas build -p android --profile preview     # internal testing APK
eas build -p android --profile production  # AAB for Play (needs ADMOB_ANDROID_APP_ID etc.)
```

Nothing is ever submitted automatically. See [store/README.md](store/README.md) for the Google Play checklist.

## Features

| Area | What it does | Code |
| --- | --- | --- |
| Home — My Learning | Today ring (minutes vs daily target), streak, planned sessions, suggestions, goals, reviews due, upcoming exams, week chart, courses in progress, quick access to subjects. Cards can be shown/hidden/reordered. | `app/(tabs)/index.tsx`, `src/features/dashboard.ts` |
| Subjects & courses | Subject → course → chapter/module → lesson, resources (links, imported PDFs). Search, filters, favorites, archive, chapter reordering, progress. | `app/(tabs)/courses.tsx`, `app/subject/*`, `app/course/[id].tsx` |
| Planner | Day / week / month views, one-off or weekly recurring sessions, done / skip / reschedule, overlap warning, free-slot proposal, history, local rule-based suggestions. | `app/(tabs)/planner.tsx`, `app/planner/*`, `src/features/planner/planner.ts` |
| Notes | Lightweight Markdown (headings, lists, highlight, bold, key idea), tags, favorites, full-text search, version history (20 versions), PDF import, Markdown export (Premium). | `app/notes/*`, `src/features/notes/format.ts` |
| Flashcards | Manual cards, flip review, Forgot/Hard/Medium/Easy grades, history, favorites, maturity, free-practice mode (Premium). | `app/(tabs)/flashcards.tsx`, `app/flashcards/*`, `src/features/flashcards/scheduler.ts` |
| Quizzes | Single / multiple choice, true/false, short answer, matching. Practice (instant correction) and exam (optional timer) modes, correction with explanations, history, stats. 400 bundled questions + per-subject question banks. | `app/quiz/*`, `src/features/quiz/engine.ts`, `src/content/quiz/*` |
| Exams & deadlines | Exams, tests, certifications, assignments, projects; countdown, priority, notes, preparation checklist, reminders. | `app/agenda/*`, `src/features/agenda/agenda.ts` |
| Focus | 25/5, 50/10 or custom Pomodoro, cycles, pause/skip, phase notifications, stats per subject. Timestamp-based (see below). | `app/focus.tsx`, `src/features/focus/pomodoro.ts` |
| Progress | Study time per day/subject, streaks, session completion, goals reached, flashcard retention & maturity, quiz accuracy; week/month comparisons (Premium). | `app/stats.tsx`, `src/features/stats/stats.ts` |
| Templates | 24 customisable plans (8 categories, 13 free). Applying one creates subject + structure + recurring sessions + goals (+ exam and checklist) in one transaction. | `app/templates/*`, `src/content/templates.ts`, `src/features/courses/applyTemplate.ts` |
| Goals & badges | Daily / weekly / monthly goals and personal challenges on 5 metrics; 20 badges; never punitive. | `app/goals/*`, `src/features/goals/*` |
| Notifications | Session, weekly review, exam, deadline, daily goal, flashcards — all off by default, individually configurable. | `src/features/notifications/plan.ts`, `src/services/notifications.ts` |

## Architecture

```
app/                 Expo Router screens (tabs: Home, My Courses, Planner, Flashcards, Profile)
src/
  config/            brand (from app.manifest.json), free/premium limits
  content/           bundled content: quiz banks (4 × 100), templates (24), achievements (20), zod schema
  database/          migrations (user_version), seed (CONTENT_VERSION), repositories per domain
  features/          pure, tested domain logic (SRS, quiz engine, planner, focus, stats, goals, notes, notifications plan)
  services/          side effects: boot, notifications, ads, monetization, backup, files, analytics, clock
  store/             Zustand: preferences (AsyncStorage), focus run (persisted), session (in memory)
  components/        UI kit on top of @factory/design-system (charts, pickers, question view, note view)
  i18n/              i18next setup + en/fr/es
```

Shared packages used without modification: `@factory/app-core` (dates, streaks, SM-2 core),
`@factory/storage` (SQL interface, migrations, backup), `@factory/design-system`, `@factory/localization`,
`@factory/monetization`, `@factory/notifications`, `@factory/analytics`, `@factory/testing`.

### Data model (SQLite, schema v1)

`subjects` → `courses` → `chapters` (chapter|module) → `lessons`; `resources`; `notes` + `note_revisions`;
`flashcards` (+ SRS state) + `flashcard_reviews`; `quiz_questions` (bundle|user) + `quiz_attempts`;
`session_series` + `study_sessions`; `study_log` (every studied minute: focus, sessions, manual);
`focus_sessions`; `study_goals`; `exams`; `deadlines`; `checklist_items`; `templates` (bundle|user);
`achievements`; `notification_settings`; `kv_settings`; `subscription_cache`; `app_meta`.

- Foreign keys on, cascades where the child has no meaning alone; notes and cards survive subject deletion (SET NULL).
- Indexes on every hot path (due cards, sessions by day, study log by day, notes by subject…).
- All multi-row writes are transactions. `withNestedTransactions` lets repositories compose
  (expo-sqlite cannot nest `withTransactionAsync`).
- `study_log` has a unique `(source, ref_id)` index so completing a session twice never double counts time.
- Calendar days are local `YYYY-MM-DD` keys (DST-safe), instants are ISO strings.
- Bundled rows (`source = 'bundle'`) are re-seeded when `CONTENT_VERSION` changes; user rows are never touched.
- Migrations: append a new entry in `src/database/migrations.ts`, never edit a shipped one.

### Spaced repetition

A simplified SM-2, built on the shared tested `reviewCard` of `@factory/app-core`:

| Grade | SM-2 quality | Effect |
| --- | --- | --- |
| Forgot | 2 | lapse: repetitions reset, due tomorrow, lapse counted, ease −0.32 |
| Hard | 3 | interval × ease × 0.8, ease −0.14 |
| Medium | 4 | interval × ease |
| Easy | 5 | interval × ease × 1.3, ease +0.1 |

First intervals 1 day (3 if Easy), then 6 days (8 if Easy). Ease ≥ 1.3, max interval 365 days.
Selection (`selectDueCards`): due reviews first — most overdue, then most lapses, then lowest ease —
then new cards, with daily limits (20 new / 200 reviews; Premium can tune them and an interval modifier).
A forgotten card comes back once at the end of the same session.

### Focus timer and backgrounding

No JavaScript interval measures time. The running state (start, total paused time, skipped time) is
persisted in AsyncStorage; `computeFocus(run, now)` derives the phase and remaining time from
timestamps. Leaving the app, locking the screen or the app being killed loses nothing; phase-end
alerts are scheduled as local notifications, and a run that finished while closed is recorded at the
next start-up (`services/focusSettle.ts`). The quiz exam timer works the same way.

### Suggestions (not AI)

`buildSuggestions` ranks simple, explainable rules — exam within 21 days, deadline within 10 days,
missed sessions, weekly goal behind, cards due, subject untouched for 5+ days — and fits them in the
learner's remaining daily time. The UI states the basis of the suggestions.

## Monetization

| Free | Premium (monthly 3.99 / annual 19.99 / lifetime 34.99 USD indicative) |
| --- | --- |
| 3 active subjects, 5 courses per subject | Unlimited subjects and courses |
| 300 flashcards, standard SRS | Unlimited cards, free practice mode, tunable SRS |
| 50 custom quiz questions | Unlimited custom questions |
| 7-day statistics | 30-day charts, week/month comparisons, results per bank |
| Notes, quizzes, focus, planner, 13 templates | Markdown note export, all 24 templates, accent color |
| Non-intrusive banner (after 3 sessions, with UMP consent) | No ads |

Ads are never shown in focus, quiz or flashcard-review screens (banners only on Home, My Courses and
Profile). Prices on the paywall always come from the store; without a RevenueCat key the paywall
says purchases are unavailable — it never fakes a purchase.

## Privacy

Local storage only, no automatic upload, no account; analytics off by default and limited to anonymous
events (never note, card or quiz content); minimal permissions (notifications, optional); storage
permissions blocked; Android auto-backup disabled; in-app export, restore and full deletion.

## Tests

`pnpm test` — pure logic (SRS, quiz grading, recurrence, suggestions, Pomodoro with backgrounding,
stats, goals, countdowns, notification plan, note formatting), SQLite integration with sql.js
(migrations, seeding, every repository, cascades, templates with rollback, backup/restore/delete,
offline), content integrity (400 questions validated with zod), i18n parity and formats, and
component tests. Device-only checks are listed in [store/README.md](store/README.md).

## Known limitations

- Bundled quiz questions are in English (pedagogical content is not machine-translated).
- No text extraction or OCR for PDFs: they are stored and opened in the learner's PDF viewer.
- Native behaviours (notifications delivery, AdMob, billing, document picker) need an Android build to verify.
