# Développement parallèle — règles de coexistence des sessions

Ce document définit comment plusieurs sessions (Claude Code ou humaines) développent des
applications en même temps dans ce monorepo sans se gêner. Il complète
[portfolio.md](portfolio.md) (inventaire et état) et [architecture.md](architecture.md).

## 1. Propriété des fichiers

| Zone | Propriétaire | Qui peut modifier |
| --- | --- | --- |
| `apps/<id>/**` | La session de l'app `<id>` | Uniquement cette session |
| `factory/tracking/<id>.md` | La session de l'app `<id>` | Uniquement cette session |
| `packages/**` | « factory-core » (partagé) | Une seule session à la fois, via le protocole §3 |
| `factory/app-registry/registry.json` | Partagé | Ajout de **sa propre** entrée uniquement, jamais modifier celle d'une autre app |
| `pnpm-lock.yaml` | Partagé (généré) | Régénéré par `pnpm install`, jamais édité à la main |
| `.gitlab-ci.yml`, `eslint.config.js`, `tsconfig.base.json`, `package.json` racine, `.npmrc` | Partagé | Protocole §3 |
| `factory/documentation/**`, `README.md` | Partagé | Modifications ciblées (ajouter une ligne, pas réécrire) |

Une session ne lit le code d'une autre app que **comme référence** (copier un modèle), jamais pour le modifier.

## 2. Isolation : une branche (ou un worktree) par app

Dépôt : `https://github.com/Amine-AAF/Mob-app-factory` (commit initial `f7a0ebd` du 2026-11-13, snapshot
de toutes les apps telles qu'elles étaient à ce moment).

| Branche | Rôle |
| --- | --- |
| `main` | Intégration. On n'y développe pas directement ; DevSpeak y vit (stable). |
| `feat/logic-quest`, `feat/filepilot`, `feat/calcwise` | Une branche par app (créées et poussées) |
| `feat/<id>` | Toute nouvelle app |
| `chore/shared-<sujet>` | Toute modification d'un package/fichier partagé (§3) |

### Passer une session sur sa branche (une seule fois)

Chaque session travaille dans **son propre worktree**, jamais dans le dossier principal :

```bash
# depuis C:\Projets\Mob-app-Factory
git worktree add ../maf-logic-quest feat/logic-quest
# recopier le travail non commité de l'app depuis le dossier principal, puis :
cd ../maf-logic-quest && pnpm install
git add apps/logic-quest factory/tracking/logic-quest.md
git commit -m "feat(logic-quest): …" && git push
```

Une fois l'app recopiée et commitée dans son worktree, le dossier principal remet ces fichiers à l'état de
`main` (`git checkout -- apps/logic-quest && git clean -fd apps/logic-quest`) — **uniquement après avoir
vérifié que le worktree contient bien tout**.

### Fusion

Pull request par app vers `main`, après `pnpm validate` vert. Avant d'ouvrir la PR : `git merge origin/main`
dans la branche de l'app. Conflits attendus : `registry.json` (garder les deux lignes) et `pnpm-lock.yaml`
(prendre celui de `main` puis `pnpm install`, voir §5).

Accès réseau sur ce poste : le `~/.gitconfig` pointe `http.sslCAInfo` vers un fichier inexistant
(`C:/path/to/cdgcapital-ca.crt`). En attendant de le corriger, utiliser
`git -c http.sslBackend=schannel -c http.sslcainfo= push|pull|fetch …`.

## 3. Protocole de modification d'un package partagé

Règle : **pas de modification simultanée d'un même package**.

1. Avant de toucher `packages/<pkg>`, vérifier dans [portfolio.md § Verrous](portfolio.md#verrous-sur-les-zones-partagées)
   qu'aucun verrou n'est posé, puis ajouter le sien (app, sujet, date).
2. Changement **additif et rétrocompatible** uniquement (nouvelle fonction, nouvelle option avec valeur
   par défaut). Ne jamais changer une signature utilisée par DevSpeak sans migrer DevSpeak dans le même changement.
3. Ajouter/mettre à jour les tests du package (`packages/<pkg>/src/__tests__`).
4. Valider **tout le monorepo** : `pnpm validate` — les tests DevSpeak doivent rester verts.
5. Documenter dans le [journal des changements partagés](portfolio.md#journal-des-changements-partagés)
   et dans `architecture.md` si l'API publique change.
6. Retirer le verrou.

Si une app a besoin d'une fonctionnalité qui pourrait être commune mais que le package est verrouillé,
elle l'implémente **localement** dans `apps/<id>/src/` et la note dans son fichier de suivi comme
« candidat à la mutualisation ». La remontée dans le package se fait plus tard, en une seule fois.

## 4. Ne pas dupliquer, ne pas mutualiser trop tôt

- Avant d'écrire un utilitaire générique, chercher dans `packages/` (voir le tableau des packages dans portfolio.md).
- Une logique copiée dans **deux** apps est notée comme dette ; à **trois** apps, elle est remontée dans un
  package (via §3). Exemples actuels : `services/clock.ts`, `services/reminders.ts`, `services/boot.ts`,
  `services/ads.ts`, `services/monetization.ts` (DevSpeak ↔ Logic Quest).

## 5. Dépendances

- Natives Expo : `npx expo install <module>` **depuis `apps/<id>`** (versions alignées sur le SDK 58).
- Ne jamais ajouter une dépendance au `package.json` racine ou d'un package pour les besoins d'une seule app.
- `pnpm-lock.yaml` : en cas de conflit de fusion, ne pas résoudre à la main — prendre la version de `main`
  puis relancer `pnpm install`.
- Ne pas monter de version d'Expo/React Native dans une seule app : une montée de SDK est un changement
  partagé (§3) qui touche toutes les apps.

## 6. Identifiants et configuration propres à chaque app

Chaque app possède : `app.manifest.json` (id, packageId, scheme, brand, monétisation), `app.config.ts`,
`eas.json`, `.env.example`, `assets/`, `store/`, ses propres IDs de produits (`<app>_premium_monthly`…),
son entrée dans le registre et sa règle de tag CI `^<id>-v\d+\.\d+\.\d+$`.
`pnpm registry:check` refuse les ids et packageIds dupliqués.

## 7. Publication

Aucune session ne publie. Pas de `eas submit`, pas de tag de release, pas de push sur une branche protégée
sans demande explicite. La CI impose déjà une approbation manuelle pour `submit-play-internal`.

## 8. Checklist de fin de session

- [ ] `pnpm --filter <id> typecheck` et `pnpm --filter <id> test` verts
- [ ] `pnpm registry:check` vert
- [ ] Si un package partagé a changé : `pnpm validate` complet vert, journal mis à jour, verrou retiré
- [ ] `factory/tracking/<id>.md` mis à jour (fait / en cours / restant / bugs / tests)
- [ ] Ligne de l'app mise à jour dans [portfolio.md](portfolio.md#inventaire)
