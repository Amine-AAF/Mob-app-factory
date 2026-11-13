# TravelWise — suivi

Dossier : `apps/travelwise` · Branche / worktree : `feat/travelwise` → `C:\Projets\maf-travelwise`
· Package id : `com.mobileappsfactory.travelwise` · Statut manifest : `development` · Dernière mise à jour : 2026-11-13

## Fonctionnalités terminées

Phase 1 — Audit : monorepo, packages partagés, conventions, risques (voir le rapport de session).

Phase 2 — Fondation :
- App Expo Router : boot (préférences → i18n → SQLite), écran d'erreur de démarrage, redirection onboarding.
- Navigation : 5 onglets (Home, Trips, Places, Budget, Settings) ; sections par voyage
  (Overview, Itinerary, Bookings, Budget, Checklist, Journal) via `TripTabBar` ; création en modal, édition.
- Thème clair/sombre via `@factory/design-system` (couleurs de marque du manifest), préférence système/clair/sombre.
- i18n en/fr/es complète (pluriels CLDR one/many/other en fr/es), formats de date/monnaie `Intl`, libellés a11y.
- SQLite : schéma v1 de 20 tables (17 demandées + `currency_conversions`, `weather_notes`, `user_settings`),
  index, clés étrangères `ON DELETE CASCADE / SET NULL`, contraintes CHECK, transactions.
- Modèles TypeScript de toutes les entités ; stratégie dates/fuseaux documentée (`apps/travelwise/docs/data-model.md`).
- Gestion des voyages (début de Phase 3) : créer, modifier, dupliquer (plan copié, progression remise à zéro,
  décalage de dates), archiver/restaurer, supprimer avec confirmation (cascade + suppression des fichiers),
  multi-destinations, voyageurs, statut dérivé des dates, historique (filtres Actifs/Passés/Archivés).
- Home dashboard : empty state « Start planning your next adventure. », voyages en cours / à venir / terminés,
  actions rapides ; TripCard (compte à rebours, jour X sur Y, préparation réelle uniquement).
- Trip overview : statut, nuits, destinations, activités, réservations, préparation, budget consommé, actions.
- Onboarding : présentation + langue → devise → premier voyage facultatif → dashboard.
- Settings : langue, thème, devise par défaut, consentement analytics (opt-in), suppression totale des données.
- Analytics : catalogue typé d'événements anonymes, aucun provider en production.
- Docs : `docs/data-model.md`, `docs/security.md` (limites explicites : fichiers non chiffrés par l'app).

Phase 3 — MVP (itinéraire, réservations, bagages) :
- Itinerary Builder : un jour par date du voyage (création depuis les dates, idempotente), jour rattaché à la ville
  qui couvre la date (jour d'arrivée = nouvelle ville), jours hors dates conservés et signalés, jour supplémentaire,
  édition du jour (titre, ville, description, notes, budget estimé), suppression (activités en cascade).
- Timeline visuelle par jour (`DayTimeline` + `ActivityCard`) : tri par heure locale, activités sans horaire en fin,
  marquer fait/prévu, monter/descendre, mention « heures locales » par destination.
- Activités : création, modification, duplication, suppression, statut planned/completed/skipped, catégories, durée
  calculée (y compris après minuit), prix + devise, adresse, lien http(s) validé, déplacement vers un autre jour/une
  autre ville sans modifier l'heure locale.
- 7 modèles d'itinéraire (weekend, 3 jours, 7 jours, road trip 10 jours, famille, business, plage) : trames neutres
  sans lieux ni horaires réels, adaptées à toute durée (premier jour / jours du milieu en cycle / dernier jour),
  appliquées dans la langue de l'utilisateur, ne remplacent jamais un titre existant.
- Reservations Organizer : 9 types, saisie manuelle uniquement (avertissement « non vérifié »), réservations
  incomplètes acceptées et signalées, référence stockée telle que saisie, affichage chronologique groupé par date,
  heure d'arrivée « plus tôt » acceptée (fuseaux), rappel de ne jamais saisir de données bancaires.
- Packing Lists : catalogue original de 101 éléments en/fr/es dans 7 catégories, 6 modèles (weekend, business,
  plage, hiver, famille, international ; 15+ éléments chacun), listes vides, quantité/priorité/notes, cocher/décocher,
  progression « Packing progress: 75% », tout décocher, renommer, supprimer, modèles personnels réutilisables.
- Overview du voyage : programme du jour, prochaines activités, réservations à venir (données réelles uniquement).
- Sélecteur de date calendrier en JS pur (`DateField`, sans dépendance native), champ d'heure normalisé (`TimeField`).

## Fonctionnalités en cours

- —

## Fonctionnalités restantes

- Phase 3 (reste) : réorganisation par glisser-déposer (aujourd'hui : boutons monter/descendre), lier une activité à un lieu
  (Phase 5, table `places`), pièce jointe de réservation (Phase 5, documents).
- Phase 4 : budget par catégorie, dépenses (filtre/tri/répartition), dépenses partagées + remboursements suggérés,
  convertisseur manuel (taux saisi, daté, source) + interface `RateProvider` future.
- Phase 5 : documents (expo-document-picker + Photo Picker, copie privée, verrou biométrique facultatif),
  checklist de départ + rappels locaux, lieux (liens geo:/Google Maps), carnet de voyage, notes météo manuelles.
- Phase 6 : RevenueCat (3 plans), AdMob (bannières/interstitiels/rewarded avec règles d'exclusion), limite free
  `FREE_ACTIVE_TRIPS = 3` à appliquer, exports PDF/CSV.
- Phase 7 : tests appareil Android, offline, APK preview, AAB, `store/` (fiche, ASO, Data Safety, politique).
- Assets de marque : `brand/mark.mjs` écrit ; PNG à générer (`pnpm brand-assets apps/travelwise`, nécessite sharp).
  `app.config.ts` référence `assets/images/*.png` : **un prebuild échoue tant qu'ils ne sont pas générés**.

## Bugs connus

- Sections Budget et Journal du voyage, onglet Places et tâches avant départ : écrans « bientôt disponible ».
- Le sélecteur de date ouvre le mois courant ou la date minimale : pas de saisie clavier directe d'une date lointaine
  (navigation mois par mois).

## Dépendances spécifiques

- Natives/JS (toutes déjà présentes dans le lockfile via DevSpeak) : expo-sqlite, expo-file-system,
  expo-localization, @react-native-async-storage/async-storage, i18next, react-i18next, zustand.
- Packages : `@factory/app-config`, `app-core` (dates), `design-system`, `localization`, `storage` (migrate, KV, wipe),
  `analytics` ; dev : `@factory/testing` (sql.js).
- À venir (Phase 5/6) : expo-document-picker (déjà dans le lockfile via FilePilot), expo-image-picker,
  expo-local-authentication, expo-print, expo-sharing, expo-notifications, react-native-purchases,
  react-native-google-mobile-ads, `@factory/monetization`, `@factory/notifications`.

## Tests réalisés

2026-11-13 (Phase 2), dans le worktree `feat/travelwise` :
- `npx tsc --noEmit` (apps/travelwise) : ✅ 0 erreur.
- `npx jest --ci` : ✅ 4 suites, 63/63 tests.
  - `database.test.ts` : migrations idempotentes, contraintes SQL, création multi-destinations, 9 cas de validation,
    voyage à cheval sur deux années, mise à jour (ids conservés), destination supprimée → jours détachés,
    archivage, duplication (dates décalées, progression remise à zéro, pas de réservations/dépenses/journal/documents/fichiers),
    suppression en cascade de toutes les tables + liste des fichiers à effacer, résumés du dashboard, suppression totale.
  - `domain.test.ts` : dates (années bissextiles, changement d'année, heure d'été), heures (normalisation, minuit),
    tri de timeline (activités sans horaire), montants multi-locales, arrondis, conversion JPY/EUR, statut dérivé,
    regroupement dashboard, compte à rebours, progression réelle, UUID, chemins de fichiers sûrs.
  - `i18n.test.ts` : parité des clés en/fr/es, formes plurielles CLDR, placeholders, traduction effective,
    libellé pour chaque valeur d'enum, clés utilisées dans le code, formats de date localisés.
  - `ui.test.tsx` : TripCard (clair/sombre, compte à rebours, jour X/Y, démo, pas de faux pourcentage), TripForm (saisie, erreurs).
- `pnpm registry:check` : ✅ travelwise valide (les 5 erreurs restantes concernent filepilot/calcwise, dont les fichiers de
  langue ne sont pas encore commités sur `main` ; hors périmètre).
- Non fait : bundle Android (`expo export`), build EAS, test sur appareil.
2026-11-13 (Phase 3) :
- `tsc --noEmit` ✅ · ESLint `apps/travelwise` ✅ 0 problème · `jest --ci` ✅ 6 suites, 104/104 tests.
  - `phase3.test.ts` : jours multi-villes, jours hors dates conservés, voyage sur deux années, jour en double refusé,
    suppression de jour en cascade, tri timeline avec activités sans horaire, validations, durée après minuit, horaires
    modifiés sans conversion, réordonner/monter/dupliquer/statut/supprimer, déplacement vers une autre ville en gardant
    l'heure, modèles (toutes durées, langue, titre existant conservé), réservations (incomplètes, 9 validations, ordre
    chronologique, à venir sans annulées, mise à jour/suppression), catalogue ≥ 80 éléments uniques traduits,
    listes depuis modèle, progression, modèles personnels, résumé de préparation.
  - `phase3.ui.test.tsx` : ActivityCard (clair/sombre, sans horaire), BookingCard (référence, incomplète), PackingItems,
    grille calendrier (semaine dimanche/lundi, février bissextile) ; `ui.test.tsx` : TripForm via le calendrier.
- Note : machine très chargée (plusieurs sessions) → `testTimeout: 30000` et un rendu de préchauffage dans `ui.test.tsx`.

## Préparation à la publication

- [x] Package id définitif `com.mobileappsfactory.travelwise`
- [x] Manifest (hybrid, 3 plans `travelwise_premium_{monthly,annual,lifetime}`, ads banner/interstitial/rewarded)
- [x] `eas.json` (development/preview APK, production AAB), `.env.example`
- [ ] Assets PNG, `store/`, IDs prod (AdMob, RevenueCat), projet EAS, jobs CI (matrice), tests appareil

## Candidats à la mutualisation

- `src/hooks/useAsync.ts`, `src/utils/clock.ts` : copies de DevSpeak (3ᵉ copie → à remonter dans `@factory/app-core`).
- `src/utils/money.ts` (montants en unités mineures, parsing multi-locale) : utile à SpendWise/CalcWise.
- `src/components/TextField.tsx` : champ de saisie thémé absent du design-system.
- `src/utils/ids.ts` (UUID v4 sans dépendance native).
