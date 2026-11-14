# Portefeuille d'applications — documentation centrale

Point d'entrée unique pour l'état du portefeuille (objectif : 50+ apps Android).
Règles de coexistence des sessions : [parallel-development.md](parallel-development.md).
Suivi détaillé par app : [`factory/tracking/`](../tracking/README.md).

Dernière mise à jour : 2026-11-14.

## Inventaire

| App | Dossier | Package id | Catégorie | Monétisation | Locales | Statut manifest | Avancement | Registre | Suivi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DevSpeak | `apps/devspeak` | `com.devspeak.app` ⚠ placeholder | education | hybrid (sub monthly/annual + pub banner/rewarded) | en, fr, es | development | ✅ Terminée (code) — reste config externe + tests sur appareil | ✅ | [devspeak.md](../tracking/devspeak.md) |
| Logic Quest | `apps/logic-quest` | `com.logicquest.app` ⚠ placeholder | games-puzzle | hybrid (sub monthly/annual/lifetime + pub banner/rewarded/interstitial) | en, fr, es | development | 🟡 Fonctionnelle — 320 défis + quotidien, écrans, monétisation, store/ ; reste : tests appareil, comptes externes | ✅ | [logic-quest.md](../tracking/logic-quest.md) |
| FilePilot | `apps/filepilot` | `com.filepilot.app` ⚠ placeholder | tools | hybrid (sub monthly/annual/lifetime + pub banner/rewarded/interstitial) | en, fr, es | development | 🟡 Code et tests en place — reste config externe + tests sur appareil | ✅ | [filepilot.md](../tracking/filepilot.md) |
| CalcWise | `apps/calcwise` | `com.mobileappsfactory.calcwise` | tools | hybrid (sub monthly/annual/lifetime + pub banner/interstitial/rewarded) | en, fr, es | development | 🟡 Code terminé sur `feat/calcwise` — reste config externe + tests sur appareil | ✅ | [calcwise.md](../tracking/calcwise.md) |
| HabitFlow | `apps/habitflow` | `com.mobileappsfactory.habitflow` | productivity | hybrid (sub monthly/annual/lifetime + pub banner/rewarded/interstitial) | en, fr, es | development | 🟡 Code et tests en place — reste config externe + tests sur appareil | ✅ | [habitflow.md](../tracking/habitflow.md) |
| AutoCare | `apps/autocare` | `com.mobileappsfactory.autocare` | auto-vehicles | hybrid (sub monthly/annual/lifetime + pub banner) | en, fr, es | development | 🟡 MVP complet codé et testé — reste pnpm install/lockfile, assets, CI, config externe, tests appareil | ✅ | [autocare.md](../tracking/autocare.md) |
| LearnSphere | `apps/learnsphere` | `com.mobileappsfactory.learnsphere` | education | hybrid (sub monthly/annual/lifetime + pub banner) | en, fr, es | development | 🟡 Code et tests en place — reste config externe + tests sur appareil | ✅ | [learnsphere.md](../tracking/learnsphere.md) |
| BookNest | `apps/booknest` | `com.mobileappsfactory.booknest` | books | hybrid (sub monthly/annual/lifetime + pub banner) | en, fr, es | development | 🟡 Code terminé — reste tests appareil + config externe | ✅ | [booknest.md](../tracking/booknest.md) |
| ClosetWise | `apps/closetwise` | `com.closetwise.app` ⚠ placeholder | lifestyle | hybrid (sub monthly/annual/lifetime + pub banner) | en, fr, es | development | 🟡 Code et tests en place — reste config externe + tests sur appareil | ✅ | [closetwise.md](../tracking/closetwise.md) |
| FitTrack | `apps/fittrack` | `com.mobileappsfactory.fittrack` | health-fitness | hybrid (sub monthly/annual/lifetime + pub banner/interstitial) | en, fr, es | development | 🟡 Code et tests en place — reste config externe + tests sur appareil | ✅ | [fittrack.md](../tracking/fittrack.md) |
| ImageCraft | `apps/imagecraft` | `com.mobileappsfactory.imagecraft` | photography | hybrid (sub monthly/annual/lifetime + pub banner/rewarded/interstitial) | en, fr, es | development | 🟡 Code terminé + tests unitaires ; module Kotlin à valider sur appareil | ✅ | [imagecraft.md](../tracking/imagecraft.md) |
| MealWise | `apps/mealwise` | `com.mealwise.app` ⚠ placeholder | food-drink | hybrid (sub monthly/annual/lifetime + pub banner) | en, fr, es | development | ✅ Terminée (code) — reste config externe, CI matrice + tests sur appareil | ✅ | [mealwise.md](../tracking/mealwise.md) |
| PetCare | `apps/petcare` | `com.mobileappsfactory.petcare` | lifestyle | hybrid (sub monthly/annual/lifetime + pub banner) | en, fr, es | development | 🟡 Code et tests en place — reste config externe + tests sur appareil | ✅ | [petcare.md](../tracking/petcare.md) |
| PlantCare | `apps/plantcare` | `com.mobileappsfactory.plantcare` | lifestyle | hybrid (sub monthly/annual/lifetime + pub banner) | en, fr, es | development | 🟡 Code complet — reste revue botanique, tests appareil, config stores | ✅ | [plantcare.md](../tracking/plantcare.md) |
| SafeVault | `apps/safevault` | `com.safevault.app` ⚠ placeholder | tools | subscription (sub monthly/annual/lifetime) | en, fr, es | development | 🟡 Code complet + tests verts — module natif à valider sur appareil, audit indépendant requis | ✅ | [safevault.md](../tracking/safevault.md) |
| SpendWise | `apps/spendwise` | `com.mobileappsfactory.spendwise` | finance | hybrid (sub monthly/annual/lifetime + pub banner/rewarded/interstitial) | en, fr, es | development | 🟡 Code complet + tests — reste config externe, tests appareil, builds | ✅ | [spendwise.md](../tracking/spendwise.md) |
| Eventora | `apps/eventora` | `com.mobileappsfactory.eventora` | productivity | hybrid (sub monthly/annual/lifetime + pub banner) | en, fr, es | development | 🟡 Code complet (v1) — reste config externe, jobs CI, tests sur appareil | ✅ | [eventora.md](../tracking/eventora.md) |
| HomeCare | `apps/homecare` | `com.homecare.app` ⚠ placeholder | house-and-home | hybrid (sub monthly/annual/lifetime + pub banner) | en, fr, es | development | 🟡 Code et tests en place — reste config externe + tests sur appareil | ✅ | [homecare.md](../tracking/homecare.md) |

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

### État de référence mesuré le 2026-11-14

Mesure prise sur la branche d'intégration `chore/integrate-apps` (18 apps fusionnées, lockfile régénéré),
app par app : `tsc --noEmit`, `eslint apps/<id>`, `jest --ci`, puis `npx expo export --platform android`.

| Zone | Typecheck | Lint | Tests | Bundle Android |
| --- | --- | --- | --- | --- |
| 7 packages testés | ✅ | ✅ | ✅ 59/59 ¹ (`notifications` et `testing` sans tests) | — |
| devspeak | ✅ | ✅ | ✅ 126/126 ¹ | ✅ |
| logic-quest | ✅ | ✅ | ✅ 98/98 | ✅ |
| filepilot | ✅ | ✅ | ✅ 117/117 ¹ | ✅ |
| calcwise | ✅ | ✅ | ✅ 151/151 | ✅ |
| habitflow | ✅ | ✅ | ✅ 69/69 | ✅ |
| autocare | ✅ | ✅ | ✅ 155/155 | ✅ |
| learnsphere | ✅ | ✅ | ✅ 117/117 | ✅ |
| booknest | ✅ | ✅ | ✅ 73/73 | ✅ |
| closetwise | ✅ | ✅ | ✅ 130/130 | ✅ |
| fittrack | ✅ | ✅ | ✅ 93/93 | ✅ |
| imagecraft | ✅ | 🟡 3 avertissements | ✅ 122/122 | ✅ |
| mealwise | ✅ | ✅ | ✅ 161/161 | ✅ |
| petcare | ✅ | ✅ | ✅ 118/118 ¹ | ✅ |
| plantcare | ✅ | ✅ | ✅ 75/75 | ✅ |
| safevault | ✅ | ✅ | ✅ 112/112 ¹ | ✅ |
| spendwise | ✅ | ✅ | ✅ 96/96 | ✅ |
| eventora | ✅ | ✅ | ✅ 89/89 | ✅ |
| homecare | ✅ | ✅ | ✅ 86/86 | ✅ |
| registre | — | — | ✅ 18 apps valides | — |

Total apps : 1988 tests. ¹ Au moins un test a dépassé le délai Jest de 5 s pendant l'exécution en parallèle
(machine chargée par d'autres sessions) et n'est passé qu'une fois la suite relancée seule : tests sensibles à la
charge, pas de régression fonctionnelle. Non mesuré : exécution sur appareil ou émulateur, builds EAS.

Hors intégration (sessions en cours le 2026-11-14) : `interviewready` (`feat/interviewready`) et `travelwise`
(`feat/travelwise`) — verts sur leur branche (35 et 165 tests), à fusionner quand leurs sessions ont terminé.

## Verrous sur les zones partagées

Une ligne par modification en cours d'un package ou fichier partagé. Supprimer la ligne une fois fusionné.

| Zone | Session / app | Sujet | Depuis |
| --- | --- | --- | --- |
| `.gitlab-ci.yml` | calcwise (`feat/calcwise`) | Ajout des jobs `calcwise-*` (tests, bundle, APK preview manuel, AAB sur tag `calcwise-v*`) — additif | 2026-11-13 |

## Journal des changements partagés

| Date | Zone | Changement | Apps impactées | Validation |
| --- | --- | --- | --- | --- |
| 2026-11-14 | `.gitlab-ci.yml`, `registry.json`, `pnpm-lock.yaml`, `portfolio.md` | Branche `chore/integrate-apps` : fusion de 18 branches d'app ; matrices CI integration-tests / bundle-validation / android-development et règles de tag `<app>-v*` étendues à toutes les apps (CalcWise garde ses jobs `calcwise-*`) ; lockfile régénéré ; inventaire régénéré depuis les manifests | toutes | Voir « État de référence mesuré le 2026-11-14 » ; `pnpm registry:check` ✅ 18 apps |
| 2026-11-13 | `.gitlab-ci.yml`, `registry.json` | CalcWise : jobs CI `calcwise-*` additifs ; entrée de registre `calcwise` | calcwise uniquement | YAML relu ; jobs DevSpeak inchangés |
| 2026-11-13 | dépôt | Commit initial `f7a0ebd`, push GitHub, branches `feat/logic-quest`, `feat/filepilot`, `feat/calcwise` | toutes | — |
| 2026-11-13 | `factory/documentation`, `factory/tracking` | Ajout portfolio.md, parallel-development.md, fichiers de suivi | aucune (docs) | — |
| 2026-11-13 | `packages/monetization` | Ajouts rétrocompatibles : `ADMOB_TEST_IDS.interstitial`, `resolveInterstitialUnit`, `shouldShowInterstitial` (pauses naturelles, plafonnement), champ optionnel `EntitlementState.activeEntitlements` (rempli par l'adaptateur RevenueCat). Inclus dans `f7a0ebd` | logic-quest (devspeak inchangé) | ✅ 12/12 package, devspeak 126/126 |
| 2026-11-13 | `factory/scripts/generate-brand-assets.mjs` | Charge un `apps/<id>/brand/mark.mjs` optionnel (marque + feature graphic par app) ; sans lui, marque DevSpeak par défaut. Inclus dans `f7a0ebd` | logic-quest | ✅ assets DevSpeak identiques à l'octet près |
| 2026-11-13 | `.gitlab-ci.yml` | Jobs d'intégration/bundle/dev en matrice `APP: [devspeak, logic-quest]` ; tags `<app>-vX.Y.Z` → `rules:variables` + environnement `production/<app>` pour les variables par app. Inclus dans `f7a0ebd` | devspeak, logic-quest | ✅ YAML et regex de tags vérifiés (pas de pipeline exécuté) |
| 2026-11-13 | `README.md`, `factory/documentation/{architecture,monetization,adding-a-new-app,status}.md` | Documentation de Logic Quest et des ajouts partagés ci-dessus (branche `chore/shared-logic-quest-docs`) | aucune (docs) | — |
