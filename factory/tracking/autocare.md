# AutoCare — suivi

Dossier : `apps/autocare` · Package id : `com.mobileappsfactory.autocare` (à confirmer avant 1ᵉʳ upload) ·
Statut manifest : `development` · Dernière mise à jour : 2026-11-13

## Fonctionnalités terminées (code)
- Profils véhicules (multi-véhicules, photo via sélecteur système, archivage, suppression en cascade), espace dédié par véhicule.
- Dashboard : alertes (entretien date/km estimé, échéances, assurance, documents, pneus, relevé km ancien), kilométrage + estimation, prochain entretien/vidange, assurance, contrôle technique, dépenses du mois, budget, derniers pleins, saisie rapide.
- Entretien : 18 types, historique, recherche/filtres, coût total, pièces, garage, pièces jointes (factures/photos), plans récurrents définis par l'utilisateur (km et/ou mois), avancement automatique du plan, protection des saisies rétroactives.
- Carburant/recharge : méthode plein-à-plein, pleins partiels, oubli de plein, kilométrage manquant/régressif, valeurs aberrantes exclues, L et kWh séparés (PHEV), coût/km, prix moyen, dépenses mensuelles/annuelles, évolution.
- Dépenses : 14 catégories, récurrentes (occurrences idempotentes), budget mensuel, répartition, TCO, coût/km, jamais d'addition multi-devises.
- Assurance (contrats, paiements, renouvellement, historique, alertes), échéances administratives (rappels configurables, répétition définie par l'utilisateur, aucune règle pays imposée), documents (PDF/images, catégories, expiration, recherche, aperçu, partage, stockage privé), pneus (saisons, positions, historique, coûts, rappels, aucune mesure d'usure), notes, historique kilométrique.
- 33 modèles de check-lists (7 groupes), personnalisation (Premium), exécution et historique.
- Comparaison de véhicules (Premium), rapports PDF (writer maison sans dépendance) et CSV (anti-injection), partage Android, sauvegarde/restauration JSON, suppression totale.
- Notifications locales planifiées (6 catégories désactivables + heure), rappels km marqués « estimés », nudge mensuel de relevé km.
- i18n EN/FR/ES complète, unités indépendantes de la langue (km/mi, L/gal US/UK, 4 formats conso + 4 formats électriques), formats régionaux Intl.
- Monétisation : RevenueCat (premium mensuel/annuel/lifetime), AdMob bannière (IDs de test hors prod, UMP), jamais sur les formulaires.
- Docs : README, docs/architecture, data-model, calculations, backup-format ; store/ (listings EN/FR/ES, data safety, privacy policy, content rating, play-checklist) ; brand/mark.mjs ; eas.json ; .env.example.

## Fonctionnalités en cours
- Aucune.

## Fonctionnalités restantes / à faire hors code
- `pnpm install` à la racine (enregistre l'app dans le lockfile ; **non lancé** pour ne pas modifier `pnpm-lock.yaml` pendant que d'autres sessions travaillent). En attendant, `apps/autocare/node_modules/@factory/*` sont des jonctions vers `packages/*` (non versionnées).
- Assets : icône, adaptive (+ monochrome), splash, notification et `store/graphics/play-icon-512.png` générés par un rasteriseur Node sans dépendance (`sharp` non installable sur ce poste). Relancer `pnpm brand-assets apps/autocare` quand `sharp` est disponible pour obtenir aussi la **feature graphic 1024×500** (manquante).
- `.gitlab-ci.yml` (fichier partagé, protocole §3) : ajouter les jobs AutoCare et la règle de tag `^autocare-v\d+\.\d+\.\d+$` — **à valider avant modification**.
- `eas init` (EAS_PROJECT_ID), RevenueCat, AdMob, URL de politique de confidentialité, captures d'écran.
- Tests sur appareil (voir `apps/autocare/store/play-checklist.md`).

## Bugs connus
- Non vérifié sur appareil : sélecteur de fichiers (expo-file-system `File.pickFileAsync`), aperçu (`File.preview`), notifications DATE, AdMob/RevenueCat.
- Saisie des dates en texte AAAA-MM-JJ avec raccourcis (aucun date picker natif dans le socle SDK).

## Dépendances spécifiques
Mêmes versions que HabitFlow (SDK 58) : expo-sqlite, expo-file-system, expo-sharing, expo-notifications, expo-localization, expo-haptics, react-native-google-mobile-ads, react-native-purchases, zustand, i18next, zod, AsyncStorage.
Packages @factory : app-config, app-core, design-system, localization, storage, monetization, notifications, analytics, testing. **Aucun package partagé modifié.**

## Tests réalisés
- 2026-11-13 · `jest --ci` : **9 suites, 155 tests, 155 OK** (units, fuel, maintenance, costs, reminders, database, reports, i18n, ui).
- 2026-11-13 · `tsc --noEmit` : 0 erreur · `eslint apps/autocare` : 0 erreur, 0 avertissement.
- `pnpm registry:check` : ✓ 6 apps valides (2026-11-13).

## Préparation à la publication
- [ ] Package id définitif · [x] manifest · [ ] assets · [x] store/ (textes) · [ ] IDs prod · [ ] EAS init · [ ] CI · [ ] tests appareil

## Candidats à la mutualisation
- Planification de notifications par date (`services/reminders.ts` + `features/reminders/plan.ts`) → `@factory/notifications`.
- Writer PDF + CSV (`features/reports/pdf.ts`, `csv.ts`) → futur `@factory/export`.
- Mapper typé de tables (`database/table.ts`) → `@factory/storage`.
- `services/{clock,boot,ads,monetization,analytics}.ts` (même modèle que DevSpeak/HabitFlow).
