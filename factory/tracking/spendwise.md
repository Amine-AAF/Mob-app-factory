# SpendWise — suivi

Dossier : `apps/spendwise` · Package id : `com.mobileappsfactory.spendwise` · Statut manifest : `development` · Branche : `feat/spendwise` (worktree `C:/Projets/maf-spendwise`) · Dernière mise à jour : 2026-11-13

## Fonctionnalités terminées (code + tests unitaires/fonctionnels)
- Fondation : Expo Router (5 onglets), thèmes clair/sombre (`@factory/design-system`), i18n en/fr/es, SQLite (migrations v1, index, contraintes CHECK), Zustand.
- Argent : unités mineures entières + ISO 4217 (53 devises), parsing par chaîne, formatage exact, rationnels BigInt, arrondi unique.
- Dashboard : solde par devise (comptes réels), revenus/dépenses du mois, budget restant, alertes, dernières transactions, top catégories, objectifs, éléments planifiés, mode confidentialité, raccourcis.
- Transactions : dépense, revenu, transfert (1 ligne, montant reçu si multi-devise), remboursement, ajustement ; édition, suppression confirmée, duplication, recherche, filtres, tri, pagination, « répéter ».
- Catégories : 20 prédéfinies (traduites), personnalisées (icône, couleur), renommage, archivage, suppression si inutilisée.
- Comptes : 6 types, devise par compte, solde initial, couleur, icône, historique ; archivage obligatoire si historique ; devise verrouillée si historique.
- Budgets : mensuel global + par catégorie, seuils 50/75/90/100 configurables, alertes visuelles, notifications locales (une fois par seuil/mois), copie du mois précédent, historique conservé, budget vs réel.
- Récurrences : daily/weekly/monthly/yearly/custom, fin facultative, auto/confirmation manuelle, registre d'idempotence `recurring_occurrences`, jamais de dates futures enregistrées.
- Abonnements : suivi, estimations mensuelle/annuelle normalisées, échéances, rappels locaux, enregistrement explicite d'un paiement.
- Objectifs d'épargne : contributions/retraits traçables, épargne mensuelle recommandée, archivage.
- Rapports : semaine/mois/année, filtres compte/catégorie, catégories, revenus, tendance, quotidien, budget vs réel, récurrent, taux d'épargne, insights déterministes.
- Calculateurs : budget mensuel, objectif d'épargne, partage, salaire, remboursement de dette (+ mensualité minimale).
- Données : export CSV (période = Premium), import CSV avec aperçu/doublons/erreurs (transaction unique), sauvegarde/restauration JSON (FK différées, rollback), suppression totale.
- Monétisation : RevenueCat (si clé), paywall avec prix Play localisés, limites Free (3 comptes, 5 budgets catégorie, 5 catégories perso, 2 objectifs), AdMob (bannières Paramètres + hub Calculateurs uniquement, interstitiel plafonné en sortie de calculateur, rewarded optionnel pour rapports détaillés 24 h), UMP.
- Onboarding 4 étapes (devise, compte et solde facultatifs, budget facultatif), aucune donnée fictive.
- Store : fiches en/fr/es, Data Safety, politique de confidentialité, IARC, plan de captures, icône/splash/feature graphic (`brand/mark.mjs`).

## Fonctionnalités restantes / non vérifiées
- Tests sur appareil/émulateur Android, build EAS, APK/AAB : non exécutés dans cette session.
- Captures d'écran réelles du store.
- Code PIN / biométrie : non implémenté (non revendiqué). Chiffrement de la base : non implémenté (non revendiqué).
- Taux de change automatiques : volontairement absents (taux manuels uniquement).
- Comparaison « année vs année précédente » dans la vue Année des rapports.

## Bugs connus
- Aucun bug connu bloquant. Charts sans SVG (barres en View) : rendu simple, pas de camembert.

## Dépendances spécifiques
Natives/JS (versions alignées DevSpeak, aucune nouvelle dépendance hors du socle existant) : expo-sqlite, expo-file-system, expo-sharing, expo-notifications, expo-localization, react-native-google-mobile-ads, react-native-purchases, zustand, i18next/react-i18next, async-storage.
Packages : @factory/app-config, app-core, design-system, localization, storage, analytics, monetization, notifications, testing (dev).

## Tests réalisés
- `pnpm --filter spendwise test` — voir rapport de fin de session (suites : money, domain, database, reports, i18n, ui).
- `pnpm --filter spendwise typecheck` — vert.

## Préparation à la publication
- [x] Package id définitif `com.mobileappsfactory.spendwise` (vérifier la propriété du domaine)
- [x] Manifest, assets, `store/`
- [ ] IDs AdMob production, clé RevenueCat, produits Play (`spendwise_premium_monthly|annual|lifetime`)
- [ ] `EAS_PROJECT_ID` (`eas init`), URL publique de la politique de confidentialité
- [ ] Job CI dédié (le `.gitlab-ci.yml` ne couvre que DevSpeak — changement partagé)
- [ ] Tests appareil, déclaration « fonctionnalités financières » Play Console

## Candidats à la mutualisation
- `@factory/storage.restoreBackup` supprime les tables dans l'ordre parent→enfant, ce qui échoue avec des clés étrangères. SpendWise utilise une restauration locale (`src/features/backup/backup.ts` : `PRAGMA defer_foreign_keys`, suppression enfants→parents, `foreign_key_check`). À remonter dans `@factory/storage` (option `deferForeignKeys`) via le protocole §3.
- `src/services/{clock,ads,monetization,analytics}.ts` : copies adaptées de DevSpeak (3ᵉ app → seuil de mutualisation atteint, cf. portfolio.md).
- `src/utils/money.ts` (unités mineures ISO 4217, BigInt) : candidat `@factory/app-core/money` si une autre app manipule de l'argent.
- `src/components/inputs.tsx` (DateField avec calendrier, SelectField, Sheet) : candidats `@factory/design-system`.
