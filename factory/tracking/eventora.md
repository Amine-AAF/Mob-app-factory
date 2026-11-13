# Eventora — suivi

Dossier : `apps/eventora` · Branche/worktree : `feat/eventora` (`C:\Projets\maf-eventora`) · Package id : `com.mobileappsfactory.eventora`
· Statut manifest : `development` · Dernière mise à jour : 2026-11-13

## Fonctionnalités terminées

- Socle : manifest, `app.config.ts` (variantes dev/preview/prod, permissions bloquées), `eas.json`, `.env.example`, Jest, assets de marque (`brand/mark.mjs`).
- SQLite v1 (17 tables du cahier des charges + `app_settings`, `subscription_cache`), clés étrangères, index, contraintes CHECK, transactions, sauvegarde/restauration JSON.
- Domaine pur testé : fuseaux horaires (DST, après minuit), argent (unités mineures, jamais d'addition multi-devises sans taux explicite), invités (accompagnants, enfants, doublons, recherche), CSV (import EN/FR/ES, export sûr), budget, tâches, programme (chevauchements, réorganisation), plan de table (capacité, auto-placement par famille), prestataires, cadeaux, rappels, modèles.
- Contenu : 14 types d'événements, 20 modèles d'organisation (6 gratuits), 24 modèles d'invitation (8 gratuits), 49 tâches types, 28 activités types.
- Écrans (Expo Router) : onboarding, 5 onglets (Accueil, Mes événements, Invités, Tâches, Réglages), création/édition/duplication d'événement, espace événement (dashboard + 10 modules), invités/groupes/import CSV, suivi RSVP, éditeur d'invitations, budget/dépenses, tâches (liste + calendrier), programme, plan de table, prestataires (contrats, liens dépenses/tâches), cadeaux, rapports, modèles, paywall, réglages notifications/données/confidentialité.
- Notifications locales configurables (6 types), sans données personnelles.
- Monétisation préparée (limites gratuites, RevenueCat, bannière AdMob uniquement sur écrans de navigation, UMP).
- i18n EN (défaut) / FR / ES complets.
- Documentation : `apps/eventora/README.md`, `docs/architecture.md`, `docs/features.md`, `docs/play-checklist.md`, `store/`.

## Fonctionnalités en cours

- Aucune.

## Fonctionnalités restantes

- Jobs CI : `.gitlab-ci.yml` est partagé (protocole §3) → **besoin documenté, non modifié** : ajouter `eventora` aux matrices `APP: [...]` (typecheck/test/build) et la règle de tag `^eventora-v\d+\.\d+\.\d+$`.
- Export image (PNG) des invitations / plan de table : nécessite `react-native-view-shot` (dépendance à valider). Le PDF couvre impression et partage.
- Configuration externe : EAS project id, produits Play + RevenueCat, AdMob (bannière), URL de politique de confidentialité.
- Vérification sur appareil (voir `apps/eventora/docs/play-checklist.md` §4).

## Bugs connus

- Aucun bug connu. Non vérifié sur appareil : rendu PDF (expo-print), sélecteurs de fichiers/photos, notifications réelles, bannière AdMob.

## Dépendances spécifiques

- Natives Expo (versions SDK 58 déjà présentes dans les autres apps) : expo-sqlite, expo-notifications, expo-print, expo-sharing, expo-file-system, expo-image-picker, expo-document-picker, expo-clipboard, expo-haptics, expo-localization, react-native-google-mobile-ads, react-native-purchases, @react-native-async-storage/async-storage.
- Packages @factory : app-config, app-core, design-system, localization, monetization, notifications, storage, testing (aucun modifié).

## Tests réalisés

- 2026-11-13 — `npx tsc --noEmit` (apps/eventora) : 0 erreur.
- 2026-11-13 — `npx jest` (apps/eventora) : 4 suites, 71 tests, tous verts (domaine 47, base de données + rapports 15, i18n 6, services/UI 3).
- 2026-11-13 — `npx eslint apps/eventora` : 0 erreur, 0 avertissement. `pnpm registry:check` : Eventora OK (les 5 problèmes signalés concernent FilePilot/CalcWise sur `main`).

## Préparation à la publication

- [x] Package id défini, manifest, registre (`pnpm registry:check`)
- [x] Icônes, splash, icône de notification, feature graphic
- [x] Fiches store EN/FR/ES, data safety, classification, politique de confidentialité (modèle)
- [ ] EAS project id, IDs de production (AdMob, RevenueCat), URLs légales
- [ ] Jobs CI (fichier partagé)
- [ ] Tests sur appareil + captures d'écran
- [ ] Test fermé (12 testeurs / 14 jours si compte personnel)

## Candidats à la mutualisation

- `src/database/table.ts` : mappeur typé camelCase ↔ snake_case (candidat `@factory/storage`).
- `src/domain/time.ts` : conversion fuseau horaire ↔ UTC robuste au DST (candidat `@factory/app-core`).
- `src/domain/money.ts` : montants en unités mineures, parsing localisé, totaux par devise (candidat `@factory/app-core`).
- `src/domain/csv.ts` (parse/export RFC 4180 + protection formules) et `src/services/sharing.ts` (PDF/CSV/JSON via share sheet).
- `src/components/forms.tsx` : DateField / TimeField / MonthCalendar sans dépendance native (candidat `@factory/design-system`).
- `src/services/notifications.ts` : planification de rappels datés (le package actuel ne gère que le rappel quotidien) → `@factory/notifications`.
- Déjà connus (copiés de DevSpeak) : `services/clock.ts`, `services/ads.ts`, `services/monetization.ts`, `services/boot.ts`, `hooks/useAsync.ts`.
