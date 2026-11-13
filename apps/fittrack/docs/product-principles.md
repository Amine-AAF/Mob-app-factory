# FitTrack product principles

Rules every screen, string and feature must respect. They are also checked by tests where possible.

## Health & safety

- FitTrack is a training log and planner, **not** medical advice. Templates are general examples
  (`templates.disclaimer`), never personalized prescriptions.
- Pain, dizziness or injury always win: copy invites users to stop, rest and ask a professional.
- No mechanic pushes training through pain: no daily streak pressure (weekly streaks; rest days never
  break them), challenges always leave rest days (e.g. 4 sessions in 7 days), expired challenges say
  "no worries, start over whenever you like".
- Body measurements are shown as-is: no BMI category, no "healthy range", no diagnosis.

## Honest numbers

- Estimates are labelled everywhere: 1RM (Epley, 1–10 reps only, dashed line), MET calorie estimate
  (needs a body weight the user entered, explained), never presented as measurements.
- No sensor claims: no heart rate, no automatic calories, no GPS (planned for a later version after
  permission and Expo compatibility review).
- Statistics only aggregate logged data; empty periods stay empty.
- The first log of an exercise is a baseline, not a "record" celebration.

## Privacy

- Local-only by default; no account; no automatic transmission of body or performance data.
- Analytics: opt-in, anonymous event names only (`src/services/analytics.ts`), never values.
- Ads: non-personalized requests, no custom targeting, UMP consent first; never during workouts/timers/forms.
- Notifications contain generic texts only (tested).
- Photos: private app storage, never uploaded, excluded from backups and Android auto-backup.
- Minimal permissions: notifications (opt-in) and camera (only when taking a progress photo).

## Ergonomics

- Active workout: targets ≥ 56 dp, one-tap validation, values pre-filled, live regions for timers,
  keep-awake option, Android back minimizes (never loses) the workout.
- Every string is externalized (EN / FR / ES), language and units are independent settings.
