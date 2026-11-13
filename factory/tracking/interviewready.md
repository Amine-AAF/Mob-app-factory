# InterviewReady — suivi

Dossier : `apps/interviewready` · Package id : `com.mobileappsfactory.interviewready` · Statut manifest : `development` ·
Branche : `feat/interviewready` (worktree `../maf-interviewready`) · Dernière mise à jour : 2026-11-13

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

## Fonctionnalités en cours

- Bibliothèque de questions (lots par catégorie, EN/FR/ES complets) : 270/500 questions validées.
  Méthode : rédaction EN + core, traduction FR/ES par sous-agents selon `src/content/CONTENT_BRIEF.md`,
  puis validation automatique (`src/__tests__/content.test.ts`).

## Fonctionnalités restantes

- Phase 3 contenu : Databases (40), DevOps (45), AI & Data (45), Job-specific (60),
  HR & Salary (40) ; 150+ quiz ; parcours métiers.
- Phase 3 MVP : onboarding, dashboard, question du jour, exploration, recherche/filtres, favoris, notes.
- Phase 4 : Mock Interview, Answer Builder, flashcards, quiz, learning paths.
- Phase 5 : statistiques, historique, révision espacée.
- Phase 6 : paywall, AdMob (UMP, garde-fous : pas de pub en simulation/rédaction/exercice), achats intégrés.
- Phase 7 : tests complets, export Android, dossier `store/`, politique de confidentialité.

## Décompte du contenu

| Catégorie | Questions | Quiz |
| --- | --- | --- |
| General (`gen`) | 40 (28 gratuites, 12 Premium) | 0 |
| Behavioral (`beh`, STAR, 8 par compétence) | 80 (57 / 23) | 0 |
| Software Development (`sw`) | 50 (33 / 17) | 0 |
| Java & Spring Boot (`java`, Java 17/21, Spring Boot 3) | 50 (33 / 17) | 0 |
| Frontend (`fe`, JS/TS/React/React Native/CSS/perf) | 50 (35 / 15) | 0 |
| **Total** | **270 (186 / 84)**, chacune en EN/FR/ES | **0** |

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
