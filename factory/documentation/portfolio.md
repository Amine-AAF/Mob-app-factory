# Portefeuille d'applications — documentation centrale

Point d'entrée unique pour l'état du portefeuille (objectif : 50+ apps Android).
Règles de coexistence des sessions : [parallel-development.md](parallel-development.md).
Suivi détaillé par app : [`factory/tracking/`](../tracking/README.md).

Dernière mise à jour : 2026-11-13.

## Inventaire

| App | Dossier | Package id | Catégorie | Monétisation | Locales | Statut manifest | Avancement | Registre | Suivi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DevSpeak | `apps/devspeak` | `com.devspeak.app` ⚠ placeholder | education | hybrid (sub + banner/rewarded) | en, fr, es | development | ✅ Terminée (code) — reste config externe + tests sur appareil | ✅ | [devspeak.md](../tracking/devspeak.md) |
| Logic Quest | `apps/logic-quest` | `com.logicquest.app` ⚠ placeholder | games-puzzle | hybrid (sub + remove-ads + banner/rewarded/interstitial) | en, fr, es | development | 🟡 En cours — moteur, contenu, DB, services faits ; écrans en cours | ✅ | [logic-quest.md](../tracking/logic-quest.md) |
| FilePilot | `apps/filepilot` | non défini | — | prévue hybrid (RevenueCat + AdMob dans les deps) | — | — | 🟡 Démarrage — seul `package.json` existe | ❌ | [filepilot.md](../tracking/filepilot.md) |
| CalcWise | `apps/calcwise` | voir manifest | — | — | — | — | 🟡 Démarrage — scaffolding en cours | à vérifier | [calcwise.md](../tracking/calcwise.md) |
| TravelWise | `apps/travelwise` | `com.mobileappsfactory.travelwise` | travel-local | hybrid (sub ×3 + banner/interstitial/rewarded) — Phase 6 | en, fr, es | development | 🟡 Code terminé (phases 1–7) — reste : comptes externes, tests appareil, CI matrice — branche `feat/travelwise` | ✅ | [travelwise.md](../tracking/travelwise.md) |

Légende avancement : ✅ terminé · 🟡 en cours · ⬜ non démarré. « Statut manifest » = champ
`releaseStatus` (`idea` → `development` → `internal` → `closed-testing` → `production` → `retired`).

## Architecture (résumé)

pnpm monorepo, Expo SDK 58, React Native 0.88, React 19.3, TypeScript strict, Expo Router,
SQLite local (offline-first), pas de backend. Détails : [architecture.md](architecture.md).

```
apps/<id>/            une app = un produit indépendant (identité, contenu, écrans, store/)
  app.manifest.json   source de vérité (id, packageId, brand, monétisation, locales, releaseStatus)
  app.config.ts       config Expo dérivée du manifest + variables d'env
  app/                écrans (Expo Router)
  src/                logique métier, DB, services, i18n, tests
packages/*            fondations partagées, source-only (pas de build, pas de publication)
factory/
  app-registry/       index des apps → manifest de chaque app
  templates/expo-app/ gabarit de `pnpm new-app`
  scripts/            new-app, check-registry, generate-brand-assets
  documentation/      docs centrales
  tracking/           un fichier de suivi par app
```

Structure interne recommandée d'une app (celle de DevSpeak, reprise par Logic Quest) :
`src/{config,content,database,features|engine,services,store,hooks,components,i18n,__tests__}`.

## Packages partagés

| Package | Rôle | Utilisé par |
| --- | --- | --- |
| `@factory/app-config` | Schéma zod du manifest, `defineApp`, `readEnv` | devspeak, logic-quest, filepilot (deps) |
| `@factory/app-core` | Dates locales, streaks, XP/niveaux, SRS SM-2 | devspeak, logic-quest |
| `@factory/design-system` | Thème clair/sombre (contraste WCAG testé), composants accessibles | devspeak, logic-quest |
| `@factory/localization` | i18next, résolution de langue, formatters Intl, RTL | devspeak, logic-quest |
| `@factory/storage` | Interface SQL, migrations `user_version`, backup/restore JSON, KV | devspeak, logic-quest |
| `@factory/analytics` | Façade analytics avec consentement et filtre PII | devspeak, logic-quest |
| `@factory/monetization` | Entitlements (cache + grâce 7 j), politique AdMob, adaptateur RevenueCat | devspeak, logic-quest |
| `@factory/notifications` | Rappel quotidien local, permission Android 13+ | devspeak, logic-quest |
| `@factory/testing` | SQLite en mémoire (sql.js), preset Jest | devspeak, logic-quest (dev) |

Tous en `0.1.0`, consommés en `workspace:*`.

### Candidats à la mutualisation (dette connue, ne pas traiter en parallèle)

Code aujourd'hui copié entre DevSpeak et Logic Quest. À remonter dans un package **quand une 3ᵉ app en a
besoin** (FilePilot ou CalcWise), via le protocole de [parallel-development.md §3](parallel-development.md#3-protocole-de-modification-dun-package-partagé) :

| Fichier app | Écart DevSpeak ↔ Logic Quest | Cible possible |
| --- | --- | --- |
| `src/services/clock.ts` | identique | `@factory/app-core` |
| `src/services/reminders.ts` | quasi identique | `@factory/notifications` |
| `src/services/boot.ts` | quasi identique | `@factory/app-core` (séquence de boot paramétrable) |
| `src/services/ads.ts` (consentement UMP) | ~50 % | `@factory/monetization/admob` |
| `src/services/monetization.ts` | ~40 % | `@factory/monetization` |
| `src/services/backupService.ts`, `analytics.ts` | faible | à évaluer |

## Dépendances

- Versions natives alignées sur DevSpeak (référence SDK) ; `pnpm new-app` les recopie.
- Installation : `npx expo install` dans le dossier de l'app (jamais à la racine).
- `.npmrc` : `node-linker=hoisted` (requis par l'autolinking RN / EAS).
- Dépendances spécifiques par app : voir la section dédiée de chaque fichier de suivi.

## Conventions

- **Id d'app** kebab-case = nom du dossier = `id` du manifest = entrée du registre.
- **Package id** reverse-DNS, définitif après première publication — les valeurs actuelles sont des
  placeholders à remplacer par un domaine possédé.
- **Produits in-app** préfixés par l'app : `<app>_premium_monthly`, `<app>_remove_ads`.
- **Tags de release** `<id>-vX.Y.Z` (seul déclencheur des builds production).
- **i18n** : `src/i18n/locales/<lng>.json` pour chaque locale du manifest (vérifié par `registry:check`).
- **Branches** : `feat/<id>` par app, `chore/shared-<sujet>` pour le partagé ; commits conventionnels
  avec scope = id d'app (`feat(logic-quest): …`) ou package (`fix(storage): …`).
- **Secrets** : uniquement dans les variables CI protégées / EAS ; `.env.example` par app.

## Points d'intégration

| Point | Fichier | Attention en parallèle |
| --- | --- | --- |
| Registre | `factory/app-registry/registry.json` | Chaque app ajoute **sa** ligne ; conflit de fusion trivial |
| Workspace | `pnpm-workspace.yaml` (`apps/*`) | Aucune action : toute app sous `apps/` est incluse |
| Lockfile | `pnpm-lock.yaml` | Régénérer, ne pas résoudre à la main |
| CI | `.gitlab-ci.yml` | `APP: devspeak` codé en dur : les tests d'intégration, l'export Android et les builds EAS **ne couvrent que DevSpeak**. À transformer en matrice `parallel:matrix` (changement partagé) |
| Lint | `eslint.config.js` racine | Commun à toutes les apps |
| TS | `tsconfig.base.json` | Commun ; chaque app a son `tsconfig.json` |
| Gabarit | `factory/templates/expo-app`, `new-app.mjs` | Lit `apps/devspeak/package.json` comme référence de versions |

## Tests de validation

| Niveau | Commande | Quand |
| --- | --- | --- |
| App seule | `pnpm --filter <id> typecheck` · `pnpm --filter <id> test` | En continu pendant le dev de l'app |
| Registre | `pnpm registry:check` | Après toute modif de manifest/registre |
| Monorepo complet | `pnpm validate` (typecheck + lint + tous les tests) | Avant fusion, et obligatoire après tout changement partagé |
| Non-régression DevSpeak | `pnpm --filter devspeak test` | Après tout changement partagé |
| Bundle Android | `cd apps/<id> && npx expo export --platform android` | Avant de déclarer une app « prête » |
| Appareil | build de dev EAS / `expo run:android` | Voir [release-checklist.md](release-checklist.md) |

### État de référence mesuré le 2026-11-13

Mesure prise pendant que d'autres sessions modifiaient Logic Quest et FilePilot : leurs échecs
reflètent un travail en cours, pas une régression.

| Zone | Typecheck | Lint | Tests |
| --- | --- | --- | --- |
| 7 packages testés | ✅ | ✅ | ✅ 59/59 (`notifications` et `testing` sans tests) |
| devspeak | ✅ | ✅ | ✅ 126/126 |
| logic-quest | ✅ | ❌ 4 erreurs, 3 avertissements | 🟡 78–79/82 (i18n) |
| filepilot | ❌ (pas de sources) | — | ❌ (pas de tests) |
| registre | — | — | ✅ 2 apps valides |

## Verrous sur les zones partagées

Une ligne par modification en cours d'un package ou fichier partagé. Supprimer la ligne une fois fusionné.

| Zone | Session / app | Sujet | Depuis |
| --- | --- | --- | --- |
| — | — | — | — |

## Journal des changements partagés

| Date | Zone | Changement | Apps impactées | Validation |
| --- | --- | --- | --- | --- |
| 2026-11-13 | dépôt | Commit initial `f7a0ebd`, push GitHub, branches `feat/logic-quest`, `feat/filepilot`, `feat/calcwise` | toutes | — |
| 2026-11-13 | `factory/documentation`, `factory/tracking` | Ajout portfolio.md, parallel-development.md, fichiers de suivi | aucune (docs) | — |
