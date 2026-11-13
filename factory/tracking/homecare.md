# HomeCare — suivi

Dossier : `apps/homecare` · Package id : `com.homecare.app` ⚠ placeholder · Statut manifest : `development` · Branche : `feat/homecare` (worktree `C:\Projets\maf-homecare`) · Dernière mise à jour : 2026-11-13

## Fonctionnalités terminées
Dashboard, logements & espaces, équipements (statuts, historique, photos), planificateur d'entretien (liste + calendrier, fréquences dont personnalisée, terminer/reporter, historique, 62 modèles), documents & garanties (import SAF, copie privée, ouverture/partage, expirations), dépenses (devises séparées, budget, graphiques, comparaison mois/année, récurrentes idempotentes), réparations, tâches ménagères (checklist, membres locaux), inventaire (+ export CSV/PDF), notifications locales par catégorie, i18n en/fr/es, monétisation (limites, paywall RevenueCat, bannière AdMob + UMP), sauvegarde/restauration JSON, suppression des données, assets de marque, docs, checklist Play.

## Fonctionnalités en cours
—

## Fonctionnalités restantes
- Sauvegarde incluant les fichiers (ZIP) — aujourd'hui JSON des données uniquement.
- Conversion de devise explicite dans l'UI (la fonction `convert` existe, pas d'écran).
- Captures d'écran Play, politique de confidentialité publiée, produits Play/RevenueCat.

## Bugs connus
- Non vérifié sur appareil : ouverture des documents (`File.preview`), impression PDF, bannière, achats.

## Dépendances spécifiques
expo-document-picker, expo-image-picker, expo-print, expo-sharing, expo-file-system, expo-notifications, expo-sqlite, expo-localization, react-native-google-mobile-ads, react-native-purchases, AsyncStorage, zustand, i18next. `expo-intent-launcher` est installé mais inutilisé (à retirer au prochain `pnpm install` coordonné).
Packages @factory : storage, design-system, localization, monetization, notifications (permission/handler), analytics, app-core, app-config, testing. Aucun package partagé modifié.

## Tests réalisés
`pnpm --filter homecare test` et `typecheck` — voir le compte rendu de session du 2026-11-13.

## Préparation à la publication
Voir `apps/homecare/store/play-checklist.md`. Restent : package id définitif, `eas init`, IDs prod (AdMob, RevenueCat), entrée CI (`.gitlab-ci.yml`, fichier partagé), tests appareil.

## Candidats à la mutualisation
- `src/services/reminders.ts` + `src/domain/reminderPlan.ts` (rappels datés multi-canaux) → `@factory/notifications`.
- `src/domain/money.ts` (minor units, parsing localisé, totaux par devise) → `@factory/app-core`.
- `src/components/forms.tsx` (DateField sans dépendance native, PickerSheet, AmountField) → `@factory/design-system`.
- `src/services/files.ts` (stockage privé, chemins sûrs, purge temporaires) — proche de FilePilot.
