# TravelWise — suivi

Dossier : `apps/travelwise` · Branche / worktree : `feat/travelwise` → `C:\Projets\maf-travelwise`
· Package id : `com.mobileappsfactory.travelwise` · Statut manifest : `development` · Dernière mise à jour : 2026-11-14

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

Phase 4 — Gestion financière :
- Budget planning : budget total + 6 catégories (transport, hébergement, repas, activités, shopping, divers),
  prévu / dépensé / restant / % consommé, par catégorie et au total ; budget estimé par jour de l'itinéraire.
- Expense tracking : montant, devise, catégorie, date, description, ville, moyen de paiement (libellé seulement,
  numéros de carte refusés), notes ; modification, suppression, historique, filtre par catégorie/payeur/période,
  recherche, tri (date, montant). Montant converti dans la devise du voyage avec le taux saisi (taux mémorisable).
  La devise d'un voyage est verrouillée dès qu'il a des dépenses.
- Shared expenses : payeur, participants, répartition égale (reste au centime près sur les premiers) ou personnalisée
  (somme exacte exigée), soldes théoriques en devise du voyage (allocation au plus fort reste : jamais de centime
  perdu), remboursements suggérés (≤ n-1 virements), mention « aucun paiement réel ».
- Budget insights (données réelles uniquement) : plus gros poste, dépense moyenne par jour, budget restant, montant
  par jour restant pour tenir le budget, dépenses par jour vs budget du jour.
- Currency converter : 11 devises, mode manuel/offline (taux saisi, daté, source « saisi par vous », par voyage ou
  global), taux inverse utilisé si besoin (signalé), historique des 50 dernières conversions, avertissement
  « le taux bancaire peut différer » ; interface `RateProvider` prête pour une API future (`features/currency/rates.ts`).

Phase 5 — Organisation avancée :
- Travel Documents : import PDF/images (sélecteur Android / Photo Picker, sans permission de stockage), contrôle
  type + taille (25 Mo) avant copie, copie privée sous nom aléatoire, refus si stockage < 50 Mo restants,
  métadonnées seules en SQLite (titre, type, voyage, expiration, notes), consultation hors ligne (image dans l'app,
  PDF via une visionneuse du téléphone), badge expiré/bientôt, suppression définitive (ligne + fichier),
  fichier manquant signalé. Verrou facultatif biométrie / code du téléphone (BiometricPrompt), 5 min, reverrouillé
  en arrière-plan ; présenté comme masquage, pas comme chiffrement.
- Travel Checklist : checklist « Avant le départ » par voyage, tâches perso (échéance, priorité, statut, notes),
  14 tâches suggérées en/fr/es (5 internationales, ajoutables une seule fois, échéance relative au départ jamais
  dans le passé), progression, rappels locaux (notification datée, permission demandée seulement à ce moment),
  annulation à la suppression de la tâche/du voyage/des données ; avertissement visa/passeport « vérifiez auprès
  des autorités officielles ».
- Places : CRUD, catégories, favoris, recherche, filtre, coordonnées saisies uniquement (validées), photo
  facultative, association voyage/jour, ouverture dans une app de cartes (`geo:` puis Google Maps web) ;
  aucune carte intégrée ni itinéraire GPS.
- Travel Journal : entrées datées par voyage, titre, ville, texte, notes, jusqu'à 12 photos locales, timeline
  chronologique groupée par jour ; photos retirées / non enregistrées supprimées.
- Weather Planner : notes météo manuelles par voyage ou destination (conditions, min/max °C, notes), aucune
  prévision affichée, suggestions de bagages selon les conditions/températures saisies, ajout à une liste.

Phase 6 — Monétisation :
- Premium via `@factory/monetization` (RevenueCat sur Google Play Billing) : 3 offres du manifest
  (`travelwise_premium_monthly`, `_annual`, `_lifetime`), prix affichés = prix localisés du store, aucun achat simulé
  (sans clé RevenueCat : « achats indisponibles »), cache d'entitlement en SQLite (migration v2) honoré hors ligne
  7 jours max, restauration, gestion des abonnements, mentions légales.
- Limites free appliquées dans les actions (pas seulement l'UI) : 3 voyages actifs (terminés/archivés exclus,
  +2 max via rewarded), 10 documents ; Premium : budget détaillé (catégories, par jour, montant quotidien),
  répartition personnalisée, export PDF itinéraire, export CSV dépenses, tous les modèles, sans pub.
- AdMob (UMP, IDs de test en dev/preview, IDs prod via variables protégées) : bannières seulement Home / Trips /
  Places / Budget ; interstitiel au retour sur la liste/accueil, plafonné (3 voyages consultés, 4 min) ; rewarded
  uniquement sur demande (créneau de voyage) ; jamais sur documents, édition d'itinéraire, saisie de dépense,
  export, formulaires, paywall, onboarding ; démarrage après l'onboarding ; options de confidentialité dans Settings.
- Exports Premium : PDF (expo-print, HTML échappé) et CSV (BOM, anti-injection de formules) partagés via la feuille
  Android puis supprimés du cache.

Phase 7 — Préparation release (partielle, sans appareil) :
- Assets générés depuis `brand/mark.mjs` (épingle + avion en papier, original) : icon 1024, adaptive + monochrome,
  splash, icône de notification, `store/graphics` (icône Play 512, feature graphic 1024×500).
- `store/` : fiches en/fr/es (longueurs vérifiées), ASO, Data Safety (AdMob + RevenueCat, aucun contenu de
  voyage transmis), questionnaire IARC, politique de confidentialité à héberger, plan de captures (vraies captures).
- Bundle Android JS validé (`expo export --platform android`, Hermes 4,4 Mo) et config Expo résolue (9 plugins).
- Audit : aucun appel réseau dans le code (fetch/XHR/WebSocket/upload absents), 3 URL externes ouvertes dans
  d'autres apps, aucun provider analytics en production, logs uniquement en dev, SQL paramétré.

## Fonctionnalités en cours

- —

## Fonctionnalités restantes

- Phase 3 (reste) : réorganisation par glisser-déposer (aujourd'hui : boutons monter/descendre), lier une activité à un lieu
  (Phase 5, table `places`), pièce jointe de réservation (Phase 5, documents).
- Phase 4 (reste) : export CSV des dépenses (Phase 6, Premium), gating Premium « budget détaillé / shared avancées »
  (Phase 6), provider de taux externe (non intégré volontairement : pas d'API payante par défaut).
- Phase 5 (reste) : choisir un lieu enregistré depuis le formulaire d'activité, joindre un document à une
  réservation depuis l'écran réservation (le schéma et le repository le gèrent déjà), replanifier les rappels
  après restauration de sauvegarde (`pendingReminders` prêt), provider météo externe (non intégré).
- Phase 6 (reste / à configurer) : clé RevenueCat, produits Play Console + entitlement "premium" + offering "default",
  IDs AdMob de production (app, bannière, interstitiel, rewarded), tests d'achat sur piste interne. Non
  implémentés (donc non vendus sur le paywall) : personnalisation, sauvegardes locales avancées.
- Phase 7 (reste, nécessite comptes/appareil) : `eas init` (EAS_PROJECT_ID), build preview APK + tests sur
  appareil (pickers, visionneuse PDF, biométrie, notifications, pubs de test, achats en piste interne, mode avion),
  captures d'écran, hébergement de la politique, build production AAB, fiche Play Console.
- CI (fichier partagé, protocole §3 de parallel-development.md — non modifié) : ajouter `travelwise` aux matrices
  `integration-tests`, `bundle-validation`, `android-development` et la règle de tag `^travelwise-vd+.d+.d+# TravelWise — suivi

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

Phase 4 — Gestion financière :
- Budget planning : budget total + 6 catégories (transport, hébergement, repas, activités, shopping, divers),
  prévu / dépensé / restant / % consommé, par catégorie et au total ; budget estimé par jour de l'itinéraire.
- Expense tracking : montant, devise, catégorie, date, description, ville, moyen de paiement (libellé seulement,
  numéros de carte refusés), notes ; modification, suppression, historique, filtre par catégorie/payeur/période,
  recherche, tri (date, montant). Montant converti dans la devise du voyage avec le taux saisi (taux mémorisable).
  La devise d'un voyage est verrouillée dès qu'il a des dépenses.
- Shared expenses : payeur, participants, répartition égale (reste au centime près sur les premiers) ou personnalisée
  (somme exacte exigée), soldes théoriques en devise du voyage (allocation au plus fort reste : jamais de centime
  perdu), remboursements suggérés (≤ n-1 virements), mention « aucun paiement réel ».
- Budget insights (données réelles uniquement) : plus gros poste, dépense moyenne par jour, budget restant, montant
  par jour restant pour tenir le budget, dépenses par jour vs budget du jour.
- Currency converter : 11 devises, mode manuel/offline (taux saisi, daté, source « saisi par vous », par voyage ou
  global), taux inverse utilisé si besoin (signalé), historique des 50 dernières conversions, avertissement
  « le taux bancaire peut différer » ; interface `RateProvider` prête pour une API future (`features/currency/rates.ts`).

Phase 5 — Organisation avancée :
- Travel Documents : import PDF/images (sélecteur Android / Photo Picker, sans permission de stockage), contrôle
  type + taille (25 Mo) avant copie, copie privée sous nom aléatoire, refus si stockage < 50 Mo restants,
  métadonnées seules en SQLite (titre, type, voyage, expiration, notes), consultation hors ligne (image dans l'app,
  PDF via une visionneuse du téléphone), badge expiré/bientôt, suppression définitive (ligne + fichier),
  fichier manquant signalé. Verrou facultatif biométrie / code du téléphone (BiometricPrompt), 5 min, reverrouillé
  en arrière-plan ; présenté comme masquage, pas comme chiffrement.
- Travel Checklist : checklist « Avant le départ » par voyage, tâches perso (échéance, priorité, statut, notes),
  14 tâches suggérées en/fr/es (5 internationales, ajoutables une seule fois, échéance relative au départ jamais
  dans le passé), progression, rappels locaux (notification datée, permission demandée seulement à ce moment),
  annulation à la suppression de la tâche/du voyage/des données ; avertissement visa/passeport « vérifiez auprès
  des autorités officielles ».
- Places : CRUD, catégories, favoris, recherche, filtre, coordonnées saisies uniquement (validées), photo
  facultative, association voyage/jour, ouverture dans une app de cartes (`geo:` puis Google Maps web) ;
  aucune carte intégrée ni itinéraire GPS.
- Travel Journal : entrées datées par voyage, titre, ville, texte, notes, jusqu'à 12 photos locales, timeline
  chronologique groupée par jour ; photos retirées / non enregistrées supprimées.
- Weather Planner : notes météo manuelles par voyage ou destination (conditions, min/max °C, notes), aucune
  prévision affichée, suggestions de bagages selon les conditions/températures saisies, ajout à une liste.

Phase 6 — Monétisation :
- Premium via `@factory/monetization` (RevenueCat sur Google Play Billing) : 3 offres du manifest
  (`travelwise_premium_monthly`, `_annual`, `_lifetime`), prix affichés = prix localisés du store, aucun achat simulé
  (sans clé RevenueCat : « achats indisponibles »), cache d'entitlement en SQLite (migration v2) honoré hors ligne
  7 jours max, restauration, gestion des abonnements, mentions légales.
- Limites free appliquées dans les actions (pas seulement l'UI) : 3 voyages actifs (terminés/archivés exclus,
  +2 max via rewarded), 10 documents ; Premium : budget détaillé (catégories, par jour, montant quotidien),
  répartition personnalisée, export PDF itinéraire, export CSV dépenses, tous les modèles, sans pub.
- AdMob (UMP, IDs de test en dev/preview, IDs prod via variables protégées) : bannières seulement Home / Trips /
  Places / Budget ; interstitiel au retour sur la liste/accueil, plafonné (3 voyages consultés, 4 min) ; rewarded
  uniquement sur demande (créneau de voyage) ; jamais sur documents, édition d'itinéraire, saisie de dépense,
  export, formulaires, paywall, onboarding ; démarrage après l'onboarding ; options de confidentialité dans Settings.
- Exports Premium : PDF (expo-print, HTML échappé) et CSV (BOM, anti-injection de formules) partagés via la feuille
  Android puis supprimés du cache.

Phase 7 — Préparation release (partielle, sans appareil) :
- Assets générés depuis `brand/mark.mjs` (épingle + avion en papier, original) : icon 1024, adaptive + monochrome,
  splash, icône de notification, `store/graphics` (icône Play 512, feature graphic 1024×500).
- `store/` : fiches en/fr/es (longueurs vérifiées), ASO, Data Safety (AdMob + RevenueCat, aucun contenu de
  voyage transmis), questionnaire IARC, politique de confidentialité à héberger, plan de captures (vraies captures).
- Bundle Android JS validé (`expo export --platform android`, Hermes 4,4 Mo) et config Expo résolue (9 plugins).
- Audit : aucun appel réseau dans le code (fetch/XHR/WebSocket/upload absents), 3 URL externes ouvertes dans
  d'autres apps, aucun provider analytics en production, logs uniquement en dev, SQL paramétré.

## Fonctionnalités en cours

- —

## Fonctionnalités restantes

- Phase 3 (reste) : réorganisation par glisser-déposer (aujourd'hui : boutons monter/descendre), lier une activité à un lieu
  (Phase 5, table `places`), pièce jointe de réservation (Phase 5, documents).
- Phase 4 (reste) : export CSV des dépenses (Phase 6, Premium), gating Premium « budget détaillé / shared avancées »
  (Phase 6), provider de taux externe (non intégré volontairement : pas d'API payante par défaut).
- Phase 5 (reste) : choisir un lieu enregistré depuis le formulaire d'activité, joindre un document à une
  réservation depuis l'écran réservation (le schéma et le repository le gèrent déjà), replanifier les rappels
  après restauration de sauvegarde (`pendingReminders` prêt), provider météo externe (non intégré).
- Phase 6 (reste / à configurer) : clé RevenueCat, produits Play Console + entitlement "premium" + offering "default",
  IDs AdMob de production (app, bannière, interstitiel, rewarded), tests d'achat sur piste interne. Non
  implémentés (donc non vendus sur le paywall) : personnalisation, sauvegardes locales avancées.
.

## Bugs connus

- Les rappels utilisent l'heure locale du téléphone au moment de la saisie : si le téléphone change de fuseau
  avant le rappel, la notification se déclenche au même instant absolu (pas à la même heure locale).
- Le sélecteur de date ouvre le mois courant ou la date minimale : pas de saisie clavier directe d'une date lointaine
  (navigation mois par mois).

## Dépendances spécifiques

- Natives/JS (toutes déjà présentes dans le lockfile via DevSpeak) : expo-sqlite, expo-file-system,
  expo-localization, @react-native-async-storage/async-storage, i18next, react-i18next, zustand.
- Packages : `@factory/app-config`, `app-core` (dates), `design-system`, `localization`, `storage` (migrate, KV, wipe),
  `analytics` ; dev : `@factory/testing` (sql.js).
- Phase 5 (versions alignées SDK 58, déjà utilisées par d'autres apps) : expo-document-picker ~58.0.5,
  expo-image-picker ~58.0.10, expo-local-authentication ~58.0.3, expo-notifications ~58.1.9, expo-sharing ~58.0.23,
  `@factory/notifications` (permission, canal, gestion premier plan).
- Phase 6 : `@factory/monetization`, react-native-purchases ^11.0.2, react-native-google-mobile-ads ^17.4.0
  (mêmes versions que DevSpeak), expo-print ~58.0.9.

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
2026-11-14 (Phase 4) :
- `tsc --noEmit` ✅ · ESLint `apps/travelwise` ✅ 0 problème · `jest --ci` ✅ 8 suites, 136/136 tests.
  - `phase4.test.ts` : partage égal/proportionnel sans perte, parts personnalisées, soldes à somme nulle, remboursements
    (≤ n-1, tout soldé), budget prévu vs réel, insights (moyenne, reste par jour, après voyage, sans dépense, sans dates),
    dépenses (devise du voyage, conversion MAD/JPY, taux requis, 9 rejets dont numéro de carte), partage égal/perso,
    soldes multi-devises, filtres/recherche (caractères % échappés)/tri, mise à jour, voyageur retiré, budget par
    catégorie/jour, devise verrouillée, taux manuels (validation, priorité voyage > récent > inverse), conversion
    arrondie, historique borné à 50.
  - `phase4.ui.test.tsx` : ExpenseCard (devise étrangère + équivalent, clair/sombre), BudgetOverview (reste, dépassement, sans budget).
2026-11-14 (Phase 5) :
- `tsc --noEmit` ✅ · ESLint `apps/travelwise` ✅ 0 problème · `jest --ci` ✅ 10 suites, 165/165 tests.
  - `phase5.test.ts` : contrôle des fichiers (type/taille), métadonnées sans contenu, listes par voyage, réservation
    détachée à la suppression, expiration, fichiers rendus à la suppression du voyage, nommage sans nom d'origine,
    verrou (durée, disponibilité), checklist (unique, validations, tri, progression, suggestions fr sans doublon,
    échéances bornées), rappels (instant local, planification, pas de rappel si fait/passé/refusé, annulation),
    lieux (coordonnées, filtres, photo remplacée, activité conservée), liens cartes, journal (timeline, photos
    dédoublonnées/limite, photos retirées), météo (une note par destination, validations, suggestions).
  - `phase5.ui.test.tsx` : TravelDocumentCard (clair/sombre, expiré), PlaceCard, DocumentsGate (ouvert / verrouillé → déverrouillé).
2026-11-14 (Phase 6) :
- `tsc --noEmit` ✅ · ESLint ✅ 0 problème · `jest --ci` ✅ 11 suites, 178/178 tests · `expo config` ✅ (9 plugins).
  - `phase6.test.ts` : règles free/premium, limite de voyages appliquée dans createTrip/duplicate/unarchive (terminés
    exclus, rewarded, Premium), limite documents, migration v2, store non configuré = jamais Premium, cache hors ligne
    (3 j oui / 10 j non), achat + reset, bannières/interstitiels refusés sans consentement ou en Premium, export HTML
    échappé (XSS), CSV (formules neutralisées, BOM, décimales JPY, parts), noms de fichiers sûrs.
- Note : machine très chargée (plusieurs sessions) → `testTimeout: 30000` et un rendu de préchauffage dans `ui.test.tsx`.

## Préparation à la publication

- [x] Package id définitif `com.mobileappsfactory.travelwise`
- [x] Manifest (hybrid, 3 plans `travelwise_premium_{monthly,annual,lifetime}`, ads banner/interstitial/rewarded)
- [x] `eas.json` (development/preview APK, production AAB), `.env.example`
- [x] Assets PNG, `store/` (fiches, Data Safety, IARC, politique, plan de captures)
- [x] Bundle Android JS (`expo export`)
- [ ] IDs prod AdMob / clé RevenueCat / produits Play, projet EAS, URL de politique, jobs CI (matrice), tests appareil, captures

## Candidats à la mutualisation

- `src/services/monetization.ts`, `src/services/ads.ts` (bannière + interstitiel + UMP), `src/hooks/useRewardedAd.ts`,
  `src/components/AdBanner.tsx` : 3ᵉ copie après DevSpeak / Logic Quest → à remonter dans `@factory/monetization`.

- `src/hooks/useAsync.ts`, `src/utils/clock.ts` : copies de DevSpeak (3ᵉ copie → à remonter dans `@factory/app-core`).
- `src/utils/money.ts` (montants en unités mineures, parsing multi-locale) : utile à SpendWise/CalcWise.
- `src/components/TextField.tsx` : champ de saisie thémé absent du design-system.
- `src/utils/ids.ts` (UUID v4 sans dépendance native).
