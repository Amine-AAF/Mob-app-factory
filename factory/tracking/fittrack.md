# FitTrack — suivi

Dossier : `apps/fittrack` · Branche / worktree : `feat/fittrack` (`C:\Projets\maf-fittrack`) · Package id :
`com.mobileappsfactory.fittrack` (placeholder) · Statut manifest : `development` · Dernière mise à jour : 2026-11-13

## Fonctionnalités terminées (code + tests)

- Fondation : manifest, `app.config.ts` (variantes, IDs AdMob de test hors prod, permissions bloquées), `eas.json`,
  `.env.example`, icônes/splash/feature graphic (`brand/mark.mjs`), entrée de registre.
- SQLite migration v1 : 22 tables (référentiels muscles/équipements, exercices + relations, programmes/jours/exercices,
  routine, planning, séances/exercices/séries, records, mensurations, photos (fichiers), cardio, objectifs, défis,
  badges, notifications, réglages, cache abonnement), FK, index, transactions.
- Bibliothèque : 219 exercices originaux EN/FR/ES (`docs/exercise-catalog.md` = source des ids), recherche, filtres,
  favoris, récents, exercices personnalisés.
- Workout Builder, 32 modèles (10 Premium), duplication, archivage.
- Planner jour/semaine/mois, routine hebdomadaire, déplacer/reporter/passer/restaurer, objectif de fréquence.
- Active Workout basé sur timestamps, reprise après fermeture, minuteur de repos + notification en arrière-plan,
  sons/vibrations optionnels, keep-awake.
- Performance Tracker (records mesurés + 1RM estimé Epley), Body Progress (+ photos privées), Cardio,
  Timers (repos, chrono, compte à rebours, intervalles, Tabata, EMOM), Goals/Challenges/Badges, Statistiques.
- Notifications locales (5 types, opt-in), backup JSON atomique, export CSV (Premium), suppression totale.
- Monétisation : RevenueCat (3 produits), AdMob bannière + 1 interstitiel plafonné (jamais en séance).
- i18n EN/FR/ES (840 clés), unités indépendantes de la langue.
- Package Play : fiches EN/FR/ES, Data safety, politique de confidentialité, IARC, monétisation, captures, checklist.

## Validation (2026-11-13)

- `pnpm --filter fittrack typecheck` ✅ · `eslint apps/fittrack` ✅ 0 problème · `pnpm --filter fittrack test` ✅ 93 tests / 5 suites
- `npx expo export --platform android` ✅ (bundle Hermes 5,4 Mo)
- `pnpm registry:check` : FitTrack ✅ (les erreurs restantes concernent filepilot/calcwise, dont les locales ne sont pas commitées sur `main`)

## Restant

- Tests sur appareil Android réel (voir `apps/fittrack/store/play-checklist.md` §2) — 🟡 notamment notifications,
  consentement UMP, achats de test, caméra, verrouillage écran / kill pendant une séance.
- `.gitlab-ci.yml` : ajouter `fittrack` aux jobs + règle de tag `fittrack-v*` (fichier partagé, non modifié).
- Captures d'écran Play ; héberger la politique de confidentialité ; remplacer le domaine du package id.
- v2 envisagée : GPS cardio (après validation permissions/compatibilité Expo), Health Connect, réordonnancement
  par glisser-déposer (flèches aujourd'hui), widgets.

## Candidats à la mutualisation

- `src/services/backupService.ts` `importUserData` : restauration avec `PRAGMA defer_foreign_keys` et vidage enfants →
  parents. Le `restoreBackup` partagé supprime les parents d'abord, ce qui échoue dès qu'il y a des FK sans cascade.
  Candidat à remonter dans `@factory/storage` (protocole §3).
- `services/clock.ts`, `feedback.ts`, `analytics.ts`, `monetization.ts`, `ads.ts`, `reminders.ts` : copiés/adaptés de HabitFlow.
- `features/timers/engine.ts` (minuteurs par timestamps) et `components/charts.tsx` : génériques.

## Dépendances spécifiques

expo-audio, expo-image-picker, expo-keep-awake, expo-document-picker, expo-file-system, expo-sharing
(versions alignées SDK 58, déjà utilisées par d'autres apps de la factory).
