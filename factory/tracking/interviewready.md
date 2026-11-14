# InterviewReady — suivi

Dossier : `apps/interviewready` · Package id : `com.mobileappsfactory.interviewready` · Statut manifest : `development` ·
Branche : `feat/interviewready` (worktree `../maf-interviewready`) · Dernière mise à jour : 2026-11-14

## Fonctionnalités terminées

- **Phase 1 — Audit** du monorepo (conventions DevSpeak/Logic Quest, packages partagés, risques de conflit).
- **Phase 2 — Fondation**
  - Scaffolding via `pnpm new-app`, manifest (hybrid : abonnement mensuel/annuel/à vie + bannière/rewarded/interstitiel),
    `app.config.ts` (variants dev/preview/prod, IDs AdMob de test hors prod, `allowBackup: false`), `eas.json`, `.env.example`.
  - Identité : marque originale (mallette + coche, `brand/mark.mjs`), icônes, splash, feature graphic générés.
  - Navigation Expo Router : 5 onglets (Home, Explore, Practice, Progress, Settings) ; écrans Settings fonctionnel
    (langue, thème, consentement analytics), autres onglets en attente de la phase 3.
  - i18n : interface EN/FR/ES (taxonomie complète : catégories, sujets, métiers, compétences, niveaux, objectifs).
  - SQLite schéma v1 (données utilisateur uniquement ; le contenu est embarqué et typé) : profil, favoris, notes,
    historique, question du jour, réponses/brouillons, simulations, quiz, cartes SRS, parcours, activité, cache d'abonnement.
    Repositories : profil, bibliothèque (favoris/notes/historique/question du jour), activité.
  - Modèle de contenu (`src/types/content.ts`) : couche neutre (`core`) + texte par langue, et suite de validation
    (`src/content/validation.ts`) : ids uniques et préfixés, champs non vides, cohérence catégorie/sujet/métier/type/structure,
    longueur de réponse minimale par niveau, parité des traductions, absence de texte provisoire, quiz (options, index, lien).
  - Services : boot offline-first, analytics typée (catalogue d'événements du brief, aucune saisie utilisateur), monetization
    (RevenueCat paresseux, jamais de faux achat).
- **Phase 3 — Contenu** : 500 questions et 160 quiz en EN/FR/ES (voir le décompte ci-dessous).
- **Phase 3 — MVP (écrans)**
  - Onboarding (présentation, métier, niveau, objectif, durée, plan recommandé ; étapes métier et durée facultatives),
    profil enregistré, relancé si les données sont effacées.
  - Accueil : question du jour (déterministe selon la date locale et le métier, gratuite, journalisée), reprise,
    progression, parcours suggéré, quiz rapide, activité récente.
  - Explorer : recherche, favoris, 10 catégories, 17 métiers. Liste de questions virtualisée avec recherche
    (insensible aux accents), filtres niveau / sujet / favoris.
  - Fiche question : intention, réponse modèle (avec avertissement « à adapter ») ou réponse attendue, explication,
    exemple, conseils, erreurs, relances ; favori (limite gratuite 25), « étudiée », notes privées ; réponse Premium
    verrouillée avec accès au paywall.
  - Pratique : quiz (10 questions, filtre par catégorie, explication et lien vers la question), révision des questions
    difficiles (file SM-2). Simulation, Answer Builder et flashcards affichés « bientôt disponibles » (phase 4).
  - Progrès : série de jours, questions étudiées, taux de réussite aux quiz, favoris, progression par catégorie,
    révisions dues, historique des questions du jour.
  - Paywall : prix uniquement depuis Google Play (RevenueCat), achat, restauration, gestion de l'abonnement ; sans
    store configuré, message explicite et aucun achat simulé.
  - Composants : QuestionCard, DifficultyBadge, PremiumBadge, CategoryCard, JobCategoryCard, ProgressCard, AnswerCard,
    BulletList, SearchField ; services `library.ts` (favoris, études, notes, fin de quiz, analytics anonymes).

- **Phase 4 — Préparation**
  - Simulation d'entretien : choix du métier, du niveau et de la durée (5/10/20 min → 3/5/8 questions), sélection
    réaliste (ouverture par une présentation, alternance soft skills / questions métier, clôture motivation ou RH),
    chronomètre facultatif qui n'interrompt jamais, réponses écrites et notes, auto-évaluation transparente sur
    5 critères (1 à 5), bilan avec axe de progrès, historique. Gratuit : 1 simulation par jour (+ bonus récompensés
    prévus en phase 6). Aucune publicité pendant la simulation, aucune évaluation automatique annoncée.
  - Answer Builder : 5 structures (STAR, motivation, présent-passé-futur, technique, négociation) avec sections
    guidées, métier/niveau/compétence, aperçu, nombre de mots et temps de parole, vérifications simples de rédaction,
    comparaison avec la réponse modèle, brouillon/finale, copie, suppression ; accès depuis chaque question.
  - Flashcards : paquets de 15 cartes issues de la bibliothèque (à revoir d'abord, puis nouvelles), auto-notation
    (à revoir / difficile / bien / facile) reliée à la révision espacée SM-2.
  - Parcours de préparation : plan généré localement et figé (7, 14, 30, 60 jours ; 30 et 60 jours Premium) :
    questions du jour ordonnées par priorité métier et niveau, quiz quotidien, révision tous les 4 jours, simulation
    hebdomadaire ; suivi des tâches et progression, accès depuis l'accueil et l'onglet Pratique.

- **Phase 5 — Progression et données**
  - Statistiques avancées (Premium) : activité sur 14 jours, réussite aux quiz par catégorie (les plus faibles en
    premier, avec raccourci d'entraînement), évolution de l'auto-évaluation des simulations ; aperçu honnête sans
    fausses données pour l'offre gratuite.
  - Vos données : sauvegarde JSON versionnée de toutes les tables utilisateur (`@factory/storage`), restauration
    atomique avec contrôle de l'application et du schéma, export lisible (Markdown) des réponses de l'assistant et des
    simulations, suppression complète avec retour à l'onboarding. Les fichiers passent par la feuille de partage
    Android : l'application n'envoie rien elle-même.
  - Réglages : modification du profil (onboarding pré-rempli), accès Premium, accès aux données.

- **Phase 6 — Publicité et limites Premium**
  - Politique de placement pure et testée (`src/features/ads/policy.ts`) : bannières uniquement sur Accueil,
    Explorer, liste des questions et Progression ; aucune publicité pendant une simulation, la rédaction d'une
    réponse, un quiz en cours, une session de flashcards, l'onboarding ou le paywall (test de scan des sources).
  - Service AdMob (`src/services/ads.ts`) : consentement UMP recueilli après l'onboarding, SDK initialisé
    seulement si `canRequestAds`, identifiants de test Google hors production, aucun repli sur un identifiant de
    test en production ; « Choix de confidentialité publicitaire » dans les Réglages quand UMP l'exige.
  - Interstitiel uniquement en quittant les résultats d'un quiz (« Terminé »), plafonné par la règle partagée
    `shouldShowInterstitial` (3 activités et 4 minutes minimum, 2 sessions de grâce, jamais pour Premium).
  - Publicité récompensée choisie par l'utilisateur sur l'écran de préparation d'une simulation : une simulation
    gratuite de plus, accordée seulement sur l'événement EARNED_REWARD, 2 au maximum par jour.
  - Limites Premium côté service : un parcours de 30 ou 60 jours sans Premium lève `PremiumRequiredError`.

## Fonctionnalités en cours

- Aucune (prochaine étape : phase 7).

## Bibliothèque de questions : terminée (500/500)

Méthode : rédaction EN + core, traduction FR/ES par sous-agents selon `src/content/CONTENT_BRIEF.md`,
relecture des points signalés par les traducteurs, puis validation automatique (`src/__tests__/content.test.ts`) :
objectif de 500 questions, au moins deux questions par sujet, au moins 150 questions (dont 7 spécifiques et
gratuites) par métier, au moins la moitié de la bibliothèque gratuite.

## Fonctionnalités restantes

- Contenu : passe d'harmonisation terminologique FR/ES.
- Publicité : vérifier l'affichage réel des annonces et du formulaire UMP sur un appareil Android (non testable
  ici, aucun SDK Android sur la machine) ; renseigner les identifiants AdMob de production en variables CI.
- Phase 7 : tests complets, export Android, dossier `store/`, politique de confidentialité.

## Décompte du contenu

| Catégorie | Questions | Quiz |
| --- | --- | --- |
| General (`gen`) | 40 (28 gratuites, 12 Premium) | 0 |
| Behavioral (`beh`, STAR, 8 par compétence) | 80 (57 / 23) | 0 |
| Software Development (`sw`) | 50 (33 / 17) | 0 |
| Java & Spring Boot (`java`, Java 17/21, Spring Boot 3) | 50 (33 / 17) | 0 |
| Frontend (`fe`, JS/TS/React/React Native/CSS/perf) | 50 (35 / 15) | 0 |
| Databases (`db`, SQL/PostgreSQL/MongoDB) | 40 (26 / 14) | 0 |
| Cloud & DevOps (`ops`) | 45 (30 / 15) | 0 |
| AI & Data (`ai`, ML, LLM, RAG, vecteurs, data engineering) | 45 (30 / 15) | 0 |
| Job-specific (`job`, projet, produit, BA, support, cyber, finance, marketing, RH) | 60 (41 / 19) | 0 |
| HR & Salary (`hr`) | 40 (28 / 12) | 0 |
| **Total** | **500 (341 / 159)**, chacune en EN/FR/ES | **160 (123 / 37)** |

Quiz (160, dont 47 vrai/faux, EN/FR/ES, chacun lié à une question de la bibliothèque) : Software 25, Java 25,
Frontend 25, Databases 20, DevOps 20, AI & Data 20, HR & Salary 15, General 5, Behavioral 5.
Moteur : `src/features/quizzes/engine.ts` (sélection, mélange déterministe des options, notation, file de révision
espacée SM-2) ; persistance : `src/database/repositories/reviewRepository.ts`.

## Bugs connus

- Aucun bug fonctionnel.
- Limite de contenu : dans certaines réponses modèles FR/ES à la première personne, le genre grammatical est au
  masculin faute de tournure neutre naturelle (voir CONTENT_BRIEF.md). Une variante inclusive reste à prévoir.

## Dépendances spécifiques

Natives/JS au-delà du socle : `expo-sqlite`, `expo-localization`, `expo-clipboard`, `expo-haptics`, `expo-file-system`,
`expo-sharing`, `@react-native-async-storage/async-storage`, `i18next`, `react-i18next`, `zustand`, `zod`,
`react-native-google-mobile-ads`, `react-native-purchases` (versions alignées sur DevSpeak / SDK 58).
Packages `@factory/*` : app-config, app-core, design-system, localization, storage, analytics, monetization ; testing (dev).

## Tests réalisés

| Date | Commande | Résultat |
| --- | --- | --- |
| 2026-11-13 | `npx tsc --noEmit` (apps/interviewready) | ✅ 0 erreur |
| 2026-11-13 | `npx eslint apps/interviewready` | ✅ 0 problème |
| 2026-11-13 | `npx jest` (apps/interviewready) | ✅ 34/34 (i18n, base de données, règles de validation du contenu, taxonomie, offline) |
| 2026-11-13 | Lot contenu 1 : `tsc`, `eslint`, `jest` | ✅ 0 erreur · 0 problème · 35/35 (170 questions × 3 langues validées) |
| 2026-11-13 | Lot contenu 2 (Java, Frontend) : `tsc`, `eslint`, `jest` | ✅ 0 erreur · 0 problème · 35/35 (270 questions × 3 langues validées) |
| 2026-11-14 | Lot contenu 3 (Databases, DevOps) : `tsc`, `eslint`, `jest` | ✅ 0 erreur · 0 problème · 35/35 (355 questions × 3 langues validées) |
| 2026-11-14 | Lot contenu 4 (AI & Data, HR & Salary) : `tsc`, `eslint`, `jest` | ✅ 0 erreur · 0 problème · 35/35 (440 questions × 3 langues validées) |
| 2026-11-14 | Lot contenu 5 (Job-specific, bibliothèque complète) : `tsc`, `eslint`, `jest` | ✅ 0 erreur · 0 problème · 39/39 (500 questions × 3 langues, couverture par sujet et par métier) |
| 2026-11-14 | Quiz (160 items, moteur, persistance) : `tsc`, `eslint`, `jest` | ✅ 0 erreur · 0 problème · 52/52 |
| 2026-11-14 | Écrans MVP : `tsc`, `eslint`, `jest` | ✅ 0 erreur · 0 problème · 73/73 (logique de recherche, question du jour, progression, actions, routage, composant) |
| 2026-11-14 | `npx expo export --platform android` | ✅ bundle Hermes de 7,6 Mo généré (aucun test sur appareil réel à ce stade) |
| 2026-11-14 | Phase 4 : `tsc`, `eslint`, `jest`, export Android | ✅ 0 erreur · 0 problème · 91/91 · bundle Hermes 7,8 Mo |
| 2026-11-14 | Phase 5 : `tsc`, `eslint`, `jest`, export Android | ✅ 0 erreur · 0 problème · 99/99 (dont aller-retour sauvegarde/restauration de toutes les tables) · bundle 7,9 Mo |
| 2026-11-14 | Phase 6 : `tsc`, `eslint`, `jest`, export Android | ✅ 0 erreur · 0 problème · 109/109 (politique de placement, consentement, plafonds, limites Premium) · export OK |
| 2026-11-13 | `pnpm registry:check` | ✅ entrée interviewready valide (échecs préexistants de filepilot/calcwise sur `main`, hors périmètre) |

## Préparation à la publication

- [x] Package id définitif `com.mobileappsfactory.interviewready`
- [x] Manifest validé
- [x] Assets générés (à remplacer par un design final si souhaité)
- [ ] `store/` (fiches EN/FR/ES, ASO, Data Safety, politique de confidentialité)
- [ ] IDs AdMob / RevenueCat de production (variables CI `production/interviewready`)
- [ ] `eas init` (EAS project id)
- [ ] CI : ajouter `interviewready` aux matrices `.gitlab-ci.yml` + règle de tag `^interviewready-v\d+\.\d+\.\d+$` (changement partagé, §3)
- [ ] Tests sur appareil Android

## Candidats à la mutualisation

- `src/services/clock.ts` (identique à DevSpeak/Logic Quest) → `@factory/app-core`.
- `src/services/monetization.ts` (copie de DevSpeak, événement renommé) → `@factory/monetization`.
- `src/services/boot.ts` (même séquence) → `@factory/app-core`.
- `src/services/analytics.ts` (même façade, catalogue propre) → `@factory/analytics`.
