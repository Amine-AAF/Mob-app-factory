# LearnSphere — suivi

Dossier : `apps/learnsphere` · Package id : `com.mobileappsfactory.learnsphere` (placeholder) · Statut manifest : `development`
· Dernière mise à jour : 2026-11-13

## Fonctionnalités terminées (code)

- Dashboard personnalisable (cartes masquables/réordonnables) : anneau du jour, série, sessions du jour,
  suggestions locales, objectifs, révisions dues, examens à venir, semaine, cours en cours, matières
- Matières → cours → chapitres/modules → leçons ; ressources (liens, import PDF) ; recherche, filtres,
  favoris, archivage, réorganisation des chapitres, progression
- Planificateur jour/semaine/mois, sessions ponctuelles et récurrentes (série matérialisée), terminer /
  reporter / passer, chevauchements, créneau libre, historique, suggestions à base de règles (pas d'IA)
- Notes (Markdown léger, barre d'outils, autosauvegarde, tags, favoris, recherche, historique 20 versions,
  export Markdown Premium)
- Flashcards + répétition espacée SM-2 simplifiée (documentée et testée), sélection par historique,
  limites journalières, mode entraînement libre (Premium)
- Moteur de quiz : 5 types, modes entraînement/examen, chrono par timestamps, correction + explications,
  historique, statistiques ; 400 questions intégrées (4 banques × 100) + banques par matière
- Examens & échéances : compte à rebours, priorité, notes, checklist, rappels
- Mode concentration Pomodoro 25/5, 50/10, personnalisé ; calcul par timestamps, persistance, alertes de
  phase, enregistrement au démarrage d'un cycle terminé app fermée
- Statistiques (7 j gratuit, 30 j + comparaisons Premium), objectifs quotidiens/hebdo/mensuels, défis, 20 badges
- 24 modèles personnalisables (8 catégories), application transactionnelle
- Notifications locales (6 types, toutes désactivées par défaut, configurables)
- Monétisation : RevenueCat (mensuel/annuel/lifetime), AdMob bannière (IDs de test en dev, jamais pendant
  focus/quiz/révision), limites gratuites testées
- i18n en/fr/es (892 clés), formats régionaux Intl
- Sauvegarde/restauration JSON, suppression totale, confidentialité
- Assets de marque (`brand/mark.mjs`), dossier `store/` complet, `eas.json`

## Fonctionnalités restantes / à vérifier sur appareil 🟡

- Build Android réel (EAS dev/preview) : notifications, AdMob + UMP, facturation, document picker, partage
- Captures d'écran Play Store
- Jobs CI LearnSphere + règle de tag `^learnsphere-v\d+\.\d+\.\d+$` dans `.gitlab-ci.yml` (fichier partagé,
  non modifié par cette session — à faire via le protocole §3)
- Package id définitif, `eas init`, IDs de production

## Bugs connus

- Aucun connu. Les banques de questions intégrées sont en anglais (contenu pédagogique non traduit, par choix).

## Dépendances spécifiques

- Natives : expo-sqlite, expo-notifications, expo-document-picker, expo-file-system, expo-sharing,
  expo-keep-awake, expo-haptics, react-native-google-mobile-ads, react-native-purchases
- Packages @factory : app-config, app-core, design-system, localization, storage, monetization,
  notifications, analytics, testing (aucun package partagé modifié)

## Tests réalisés (2026-11-13)

- `pnpm --filter learnsphere typecheck` : 0 erreur
- `npx eslint apps/learnsphere` : 0 problème
- `pnpm --filter learnsphere test` : 11 suites, **117 tests verts** (SRS, quiz, planification/récurrence/
  suggestions, Pomodoro + arrière-plan, stats/objectifs/échéances, plan de notifications, notes, SQLite
  sql.js : migrations, seed, tous les repositories, cascades, template avec rollback, backup/restore/suppression,
  offline ; contenu : 400 questions validées zod ; i18n en/fr/es ; composants ; services)
- `npx expo export --platform android` : bundle Hermes OK (5,1 Mo)
- `pnpm registry:check` : 7 apps valides
- Non testé : comportement sur appareil réel (aucun build EAS lancé)

## Préparation à la publication

Voir `apps/learnsphere/store/README.md`.

## Candidats à la mutualisation

- `services/clock.ts`, `services/ads.ts`, `services/monetization.ts`, `hooks/useAsync.ts` (copiés de DevSpeak)
- `withNestedTransactions` (`src/database/index.ts`) : utile à toute app qui compose des repositories → `@factory/storage`
- Planification multi-notifications (`features/notifications/plan.ts`) → `@factory/notifications`
- Composants `BarChart`, `ProgressRing`, `Segmented`, `Stepper`, `DayField` → `@factory/design-system`
