# BookNest — suivi

Dossier : `apps/booknest` · Branche : `feat/booknest` (worktree `C:\Projets\maf-booknest`) · Package id : `com.mobileappsfactory.booknest` ⚠ placeholder
· Statut manifest : `development` · Dernière mise à jour : 2026-11-13

## Fonctionnalités terminées (code + tests)

- Bibliothèque : CRUD, auteurs/genres dédupliqués, recherche sans accents (titre/auteur/ISBN), filtres, 7 tris, favoris, archives, doublons (ISBN-10/13, titre+auteur), grille/liste virtualisées (testé à 3 000 livres)
- Couvertures : sélecteur photo Android (sans permission), fichiers JPEG 800 px + vignette 240 px, nettoyage des orphelins, couvertures générées
- Suivi de lecture : 5 statuts, pages validées, dates, relectures avec historique, livres audio (position/durée/vitesse)
- Sessions : chrono par horodatage (survit à l'arrière-plan / à la mort du process), pause/reprise, correction d'un chrono oublié, saisie manuelle
- Objectifs : 5 types, comparaison de périodes, 5 défis, célébrations, historique ; ton non culpabilisant
- Citations, journal (7 types, tags, export Markdown), avis privés + classement, collections (10 suggestions), wishlist (budget, passage en bibliothèque)
- Découvrir : règles locales transparentes (pas d'IA), point d'extension `CatalogProvider`
- Statistiques (« — » si données manquantes) et calendrier mensuel/annuel
- Notifications locales : 6 types, désactivées par défaut
- Import CSV (aperçu, erreurs, doublons, quota gratuit), export CSV/PDF, sauvegarde JSON versionnée (fusion ou remplacement), suppression totale
- i18n EN/FR/ES (779 clés), monétisation (limites gratuites, RevenueCat, bannières AdMob sur écrans de navigation uniquement)
- Assets de marque (`brand/mark.mjs`), `store/` (fiche, data safety, checklist Play), docs (`docs/`)

## Fonctionnalités en cours / restantes

- 🟡 Tests sur appareil Android (checklist `apps/booknest/store/play-checklist.md`) — rien n'a été vérifié sur appareil
- Configuration externe : package id définitif, `eas init`, produits Play + RevenueCat, AdMob + UMP, URLs politique/CGU
- CI : ajouter les jobs BookNest et la règle de tag `^booknest-v\d+\.\d+\.\d+$` dans `.gitlab-ci.yml` (fichier partagé — non modifié, à faire via le protocole §3)

## Candidats à la mutualisation

- Surcharges de couleurs de surface dans `ThemeProvider` (`src/components/theme.ts`)
- Planificateur de notifications multi-types (`src/features/reminders/plan.ts`, proche de HabitFlow)
- Parseur/générateur CSV avec protection contre l'injection de formules (`src/features/transfer/csv.ts`)
- Mode *fusion* de sauvegarde (`mergeBackup`, `src/services/transferService.ts`) — `@factory/storage` ne fait que le remplacement
- `services/clock.ts`, `ads.ts`, `monetization.ts`, `analytics.ts` copiés du modèle DevSpeak/HabitFlow

## Bugs connus

- Aucun connu. Non vérifié sur appareil : APIs natives `expo-file-system` (File/Directory), `expo-image-manipulator`, `expo-print`.

## Dépendances spécifiques

`expo-image-picker`, `expo-image-manipulator`, `expo-file-system`, `expo-document-picker`, `expo-sharing`, `expo-print`,
`expo-clipboard` (versions SDK 58 déjà utilisées dans le monorepo). Aucun package partagé modifié.

## Tests réalisés

- `pnpm --filter booknest typecheck` ✅
- `pnpm --filter booknest test` ✅ — 5 suites : domain, database, services, i18n, ui
- `npx expo export --platform android` ✅ (bundle Hermes 4,3 Mo)
- `pnpm registry:check` : BookNest ✅ (les erreurs restantes concernent les fichiers de langue FilePilot/CalcWise absents du snapshot `main`)
