# PetCare — suivi

Dossier : `apps/petcare` · Branche : `feat/petcare` (worktree `C:\Projets\maf-petcare`) · Package id : `com.mobileappsfactory.petcare` · Statut manifest : `development` · Dernière mise à jour : 2026-11-13

## Fonctionnalités terminées
- Profils multi-animaux (photo via sélecteur système, espèce, race, sexe, date de naissance ou âge estimé, poids, couleur, identification, adoption, notes, objectif de promenade), archivage, suppression en cascade
- Dashboard : animaux, à faire aujourd’hui (prises, repas, vaccins, RDV), vaccins à venir/en retard, RDV, traitements en cours, réapprovisionnement, dépenses du mois, activité récente
- Santé : visites (motif, vétérinaire, clinique, diagnostic saisi, examens, résultats, frais, documents liés), chronologie
- Vaccinations (statut effectué / à venir / en retard, rappel configurable, document lié) — aucun calendrier imposé
- Traitements (instructions saisies, fréquence prescrite, heures de rappel, journal des prises, arrêt/reprise, alerte de fin) — aucune posologie proposée
- Poids/croissance (graphique, comparaison, kg/lb), alimentation (programmes, rappels, journal), stock (seuils, jours restants, achats → dépense en transaction)
- Rendez-vous (vétérinaire, toilettage, éducation, pension, autre ; statut ; rappel ; dépense à la clôture)
- Documents & passeport (import SAF/photo, catégories, recherche, liaison visite/vaccin, ouverture, partage, fichier manquant géré)
- Activités (promenades, durée, distance saisie, objectifs), dépenses (catégories, devises non converties, stats mensuelles/annuelles, budget)
- 34 checklists EN/FR/ES personnalisables + modèles personnels
- Notifications locales (8 catégories configurables, planification réconciliée, permission Android 13+, 2 canaux)
- Monétisation : RevenueCat (mensuel/annuel/à vie), AdMob bannière (IDs test hors prod, UMP), limites gratuites
- Sauvegarde/restauration JSON (avec fichiers optionnels), exports PDF/CSV (Premium), suppression totale
- i18n EN (défaut) / FR / ES, formats régionaux ; thème clair/sombre ; identité visuelle (cœur + patte), icônes et visuels Play générés

## Fonctionnalités en cours
- —

## Fonctionnalités restantes
- Captures d’écran Play (build preview) et pages légales publiées (`EXPO_PUBLIC_PRIVACY_URL`)
- Tests sur appareil (voir `apps/petcare/docs/GOOGLE_PLAY_CHECKLIST.md`)
- Intégration CI (fichier partagé, **non modifié**) : ajouter PetCare à la matrice `.gitlab-ci.yml` + règle de tag `^petcare-v\d+\.\d+\.\d+$` — à faire via le protocole §3 après validation
- Ligne d’inventaire dans `factory/documentation/portfolio.md` (doc partagée, non modifiée par cette session)

## Bugs connus
- Aucun connu. Non vérifiés sans appareil : rendu PDF (expo-print), aperçu de documents (`File.preview`), livraison réelle des notifications, achats.

## Dépendances spécifiques
- Natives (via le SDK 58) : expo-sqlite, expo-notifications, expo-file-system, expo-sharing, expo-document-picker, expo-image-picker, expo-print, expo-localization, @react-native-async-storage/async-storage, react-native-google-mobile-ads, react-native-purchases
- JS : i18next, react-i18next, zustand, zod
- Packages factory (non modifiés) : app-config, app-core, design-system, localization, storage, notifications, monetization, analytics, testing

## Tests réalisés
- 2026-11-13 — `tsc --noEmit` : ✅ 0 erreur · `eslint apps/petcare` : ✅ 0 problème
- 2026-11-13 — `jest` : ✅ 118/118 (7 suites : domain, notifications, database, features, i18n, privacy, ui), TZ Europe/Paris
- 2026-11-13 — `pnpm test:tz` : ✅ 48/48 × 4 fuseaux (Kiritimati, Los Angeles, Casablanca, Tokyo)
- `pnpm registry:check` : PetCare valide (les 5 erreurs restantes concernent les fichiers de langue non commités de FilePilot/CalcWise)

## Préparation à la publication
- [x] Manifest (hybrid, 3 locales, features), `app.config.ts` (variants, permissions bloquées, `allowBackup: false`), `eas.json`, `.env.example`
- [x] Assets (icon, adaptive, monochrome, splash, notification, icône 512, feature graphic)
- [x] `store/` : fiches EN/FR/ES, réponses Data safety
- [ ] Package id définitif confirmé, IDs prod AdMob/RevenueCat, produits Play, EAS project id
- [ ] CI, tests appareil, captures

## Candidats à la mutualisation
- 3ᵉ copie de `services/clock.ts`, `services/monetization.ts`, `services/ads.ts`, schéma `boot.ts` (après DevSpeak et Logic Quest) → seuil de remontée atteint, à proposer via le protocole §3
- Nouveaux génériques : `database/table.ts` (mapper typé), `components/fields.tsx` (calendrier/heure sans dépendance native), `components/charts.tsx`, motif « plan + réconciliation » des notifications locales
