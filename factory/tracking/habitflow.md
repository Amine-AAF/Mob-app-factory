# HabitFlow — suivi

Dossier : `apps/habitflow` · Package id : `com.mobileappsfactory.habitflow` · Statut manifest : `development`
· Dernière mise à jour : 2026-11-13

## Fonctionnalités terminées

- Fondation : manifest, `app.config.ts` (variantes dev/preview/prod, IDs AdMob de test hors prod), `eas.json`,
  `.env.example`, icône/splash/feature graphic générés (`brand/mark.mjs`), entrée de registre.
- Navigation Expo Router : 5 onglets (Today, Habits, Calendar, Insights, Settings) + écrans habitude, éditeur,
  modèles, jour, planning, tâche, succès, paywall, onboarding, réglages (rappels, données, confidentialité).
- SQLite (migration v1) : habits, habit_schedules (règles versionnées), habit_logs (PK habit+jour),
  xp_ledger, tasks, reminders, achievements, user_settings, subscription_cache.
- Fréquences : quotidienne, jours choisis, X/semaine, X/mois, tous les N jours. Suivi check / quantité / durée.
- Streaks justes (jours non prévus neutres, jours passés « skip », séries en semaines/mois pour X/semaine),
  taux de réussite, régularité 7/30 j ; modification d'habitude non rétroactive (nouvelle version de règles).
- Calendrier mois/semaine, détail du jour, correction explicite des jours passés, notes quotidiennes.
- Planning quotidien (priorité, heure, échéance, ordre manuel, lien habitude, retard affiché aujourd'hui).
- Rappels locaux par habitude ou général, jours choisis, plusieurs par habitude, plafond 48, resynchronisés.
- Statistiques et observations à règles simples, calculées uniquement sur les données locales.
- 44 modèles (10 groupes), personnalisables avant ajout. Gamification : XP (ledger anti-doublon, pas d'XP
  pour les rattrapages > 1 jour), niveaux, 10 badges, objectif hebdomadaire.
- Backup JSON (format documenté `apps/habitflow/docs/backup-format.md`), import avec confirmation, suppression totale.
- Premium (RevenueCat, 3 produits), AdMob bannière/interstitiel/récompensée avec règles de placement.
- i18n complète EN/FR/ES (pluriels, dates/nombres Intl), thèmes clair/sombre + 4 palettes Premium.
- Package Play Store : fiches EN/FR/ES, ASO, Data Safety, politique de confidentialité, IARC, captures, monétisation.

## Fonctionnalités en cours

- —

## Fonctionnalités restantes

- Tests sur appareil Android réel (dev build) : notifications après reboot, consentement UMP, achats en test.
- Widgets Android (Premium) : non implémentés (nécessite un module natif / config plugin).
- « Challenges personnels » au-delà de l'objectif hebdomadaire : non implémentés.
- Export CSV / fonctionnalités d'export avancées Premium : non implémentés (export JSON gratuit, choix assumé).
- Captures d'écran Play Store à produire ; politique de confidentialité à héberger (`EXPO_PUBLIC_PRIVACY_URL`).
- Réordonnancement manuel des habitudes (le modèle `sort_order` existe, pas l'UI).

## Bugs connus / limites

- Changement de fréquence en milieu de semaine entre un mode « jour » et un mode « X/semaine » : la semaine de
  transition est neutre (ni gagnée ni perdue) — choix volontaire pour ne pas falsifier les séries.
- Le sélecteur d'unité affiche l'unité traduite ; si l'utilisateur la modifie, la valeur saisie est stockée telle quelle.
- Pluriels CLDR `many` (fr/es, ≥ 1 000 000) non fournis, comme dans les autres apps.

## Dépendances spécifiques

- Aucune nouvelle dépendance : mêmes versions que Logic Quest (déjà dans `pnpm-lock.yaml`).
  expo-sqlite, expo-notifications, expo-file-system, expo-sharing, expo-haptics, expo-localization,
  react-native-google-mobile-ads, react-native-purchases, zustand, i18next, async-storage.
- Pas de `react-native-svg` : anneau de progression et graphiques en `View` (aucun ajout natif).
- Packages @factory : app-config, app-core, design-system, localization, storage, analytics, monetization,
  notifications, testing.
- **`pnpm install` n'a pas été lancé** (dossier partagé avec d'autres sessions) : liens `node_modules/@factory/*`
  créés localement en jonctions dans `apps/habitflow/node_modules`. À la fusion, `pnpm install` ajoutera
  l'importer `apps/habitflow` au lockfile sans nouvelle version.

## Tests réalisés

- 2026-11-13 · `jest --ci` : **5 suites, 69/69 tests verts** — domain (32), database/services (20), i18n (10),
  ui (5), reminders (2).
- `tsc --noEmit` vert · ESLint (config racine) 0 erreur · `expo export --platform android` OK (bundle 4 MB) · `registry:check` 5 apps valides.

## Préparation à la publication

- [ ] Package id définitif confirmé (`com.mobileappsfactory.habitflow`)
- [x] Manifest, assets, `store/`
- [ ] `eas init` (EAS_PROJECT_ID), secrets RevenueCat / AdMob prod (scope `production/habitflow`)
- [ ] Produits Play + entitlement RevenueCat `premium`
- [x] CI : matrices + règle de tag `habitflow-v*` (2026-11-13, journal portfolio)
- [ ] Build preview APK + tests appareil, puis AAB production

## Candidats à la mutualisation

- `src/services/reminders.ts` + `src/features/reminders/plan.ts` : rappels multiples par entité et par jour de
  semaine (WEEKLY) — **3ᵉ app** à gérer ses rappels hors de `@factory/notifications` → à remonter (protocole §3).
  Attention : `cancelDailyReminder()` du package annule par préfixe `daily-reminder`, HabitFlow utilise `habitflow-`.
- `src/services/clock.ts`, `boot.ts`, `ads.ts`, `monetization.ts`, `analytics.ts` : copies de Logic Quest (3ᵉ copie).
- `src/hooks/index.ts` (`useAsync`, `useRewardedAd`, `useInterstitial`) : copie de Logic Quest.
- `components/ui.tsx` (`Field`, `Segmented`, `Stepper`, `AnimatedBar`) et `ProgressRing` : candidats `@factory/design-system`.
- Schedules versionnés + streaks par occurrence (`features/habits`, `features/statistics/streaks.ts`) :
  généralisation possible de `computeStreak` de `@factory/app-core`.
