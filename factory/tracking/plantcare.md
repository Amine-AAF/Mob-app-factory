# PlantCare — suivi

Dossier : `apps/plantcare` · Package id : `com.mobileappsfactory.plantcare` · Statut manifest : `development`
· Branche / worktree : `feat/plantcare` / `C:\Projets\maf-plantcare` · Dernière mise à jour : 2026-11-13

## Fonctionnalités terminées (code)

- Collection : création / édition / suppression (cascade + photos), duplication, favoris, recherche,
  filtres (catégorie, emplacement, favoris), tri nom / date / prochain soin ; limite gratuite 10 plantes.
- Bibliothèque : ≥150 fiches structurées (lumière, eau, sol, température, humidité, floraison, difficulté,
  toxicité ASPCA, origine, famille), recherche EN/FR/ES/latin + synonymes, 10 filtres, fiches « core » gratuites.
- Arrosage : fréquence personnalisée (suggestions éditables), confirmation de chaque arrosage, report, saut,
  arrosage non planifié, quantité indicative (ml / fl oz), historique et intervalle moyen.
- Planificateur : 9 types de tâches, récurrence « N jours après réalisation », priorité, notes ;
  vues Aujourd’hui / en retard / semaine / mois / terminées.
- Croissance (mesures saisies, graphique, galerie, comparaison photo Premium), journal (timeline),
  santé (catégories, actions, statut, photos, guide des causes possibles + avertissement), engrais & substrat
  (jamais de dosage), organisation par espaces (tâches par zone), wishlist (statuts), checklists saisonnières
  par profil climatique (nord / sud / tropical / sans saisons), statistiques.
- Notifications locales : 1 notification max / jour groupée, retard rappelé une seule fois, horizon 14 j,
  replanification après chaque écriture, réglages global / type / plante / tâche, permission refusée gérée.
- i18n EN (défaut) / FR / ES, dates régionales, unités métriques / impériales, °C / °F.
- Monétisation : paywall RevenueCat (mensuel / annuel / à vie), bannière AdMob (IDs de test hors prod,
  consentement UMP, jamais sur les écrans de saisie), règles gratuit / Premium centralisées (`domain/limits.ts`).
- Confidentialité : stockage local, photos en fichiers privés (chemins relatifs en base), allowBackup=false,
  sauvegarde / restauration JSON, suppression totale, export PDF (Premium).
- SQLite : 18 tables, clés étrangères, index, migration v1 versionnée, transactions.
- Assets de marque générés (`brand/mark.mjs`), dossier `store/` (fiches EN/FR/ES, Data Safety, IARC,
  politique de confidentialité, checklist Play, plan de captures).

## Fonctionnalités restantes

- ⚠ **Revue botanique humaine** des fiches et re-vérification ASPCA (voir `src/content/CONTENT_SOURCES.md` §4).
- Tests sur appareil Android réel (photos caméra/galerie, notifications, fuseaux horaires, pubs, achats).
- `eas init` (EAS_PROJECT_ID), produits Play / RevenueCat / AdMob, URL de politique de confidentialité.
- Relecture FR/ES par des natifs ; captures d’écran store.
- CI : ajouter les jobs PlantCare et la règle de tag `^plantcare-v\d+\.\d+\.\d+$` dans `.gitlab-ci.yml`
  (fichier partagé → protocole §3 de parallel-development.md, **non modifié** par cette session).

## Bugs connus / limites

- Les photos ne sont pas incluses dans la sauvegarde JSON (références seulement) : après restauration sur un
  nouveau téléphone, les photos manquantes s’affichent avec un visuel de remplacement (comportement documenté).
- Graphiques dessinés en View (pas de dépendance SVG) : volontairement simples.

## Dépendances spécifiques

expo-sqlite, expo-notifications, expo-image-picker, expo-file-system, expo-document-picker, expo-sharing,
expo-print, react-native-google-mobile-ads, react-native-purchases, zustand, AsyncStorage
(versions alignées sur PetCare / SDK 58, installées hors ligne depuis le store pnpm).
Packages : app-config, app-core, design-system, localization, storage, analytics, monetization, notifications, testing
(**aucun package partagé modifié**).

## Candidats à la mutualisation

`src/database/table.ts` (copie PetCare), `services/clock.ts`, `services/ads.ts`, `services/monetization.ts`,
`components/AdBanner.tsx` (copies DevSpeak). Planification multi-tâches des notifications
(`domain/notificationPlan.ts`) : candidat pour `@factory/notifications` (le package ne gère qu’un rappel quotidien).

## Tests réalisés

Jest (jest-expo + sql.js) : 11 suites, 75 tests verts au 2026-11-13 (`domain`, `database`, `library`,
`i18n`, `services`, `ui*`), `tsc --noEmit` et `eslint apps/plantcare` propres.

Particularités de l’environnement de test (RN 0.88 + jest-expo 58), contournées :
- `TextInput` réel ne se monte pas sous Jest → mocké dans `jest.setup.ts` ;
- dans un même fichier, seul le premier écran contenant un `TextInput` se monte → un test d’écran par fichier
  (`src/__tests__/ui-*.test.tsx`, setup partagé dans `src/test-utils/ui.tsx`) ;
- un `press` après `fireEvent.changeText`, et l’ouverture du paywall depuis une fiche verrouillée de la
  bibliothèque, ne sont pas délivrés par le renderer de test → **à vérifier sur appareil** (règles couvertes
  par les tests unitaires `matchesFilter` / `canOpenSpecies`).
