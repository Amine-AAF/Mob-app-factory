# Fichiers de suivi par application

Un fichier par app : `factory/tracking/<id>.md`. Il est **la propriété de la session qui développe l'app** :
aucune autre session ne le modifie. Il est centralisé ici (plutôt que dans `apps/<id>/`) pour que l'état
du portefeuille se lise en un seul endroit, sans avoir à ouvrir le dossier d'une app en cours de modification.

Mettre à jour le fichier à chaque fin de session (voir la checklist de
[parallel-development.md](../documentation/parallel-development.md#8-checklist-de-fin-de-session)) et reporter
l'avancement dans l'inventaire de [portfolio.md](../documentation/portfolio.md#inventaire).

## Gabarit

```markdown
# <Nom> — suivi

Dossier : `apps/<id>` · Package id : `…` · Statut manifest : `…` · Dernière mise à jour : AAAA-MM-JJ

## Fonctionnalités terminées
## Fonctionnalités en cours
## Fonctionnalités restantes
## Bugs connus
## Dépendances spécifiques
(natives et JS propres à l'app, au-delà du socle Expo/RN commun, + packages @factory utilisés)
## Tests réalisés
(commande, date, résultat chiffré)
## Préparation à la publication
(checklist : package id définitif, manifest, assets, store/, IDs prod, EAS, CI, tests appareil)
## Candidats à la mutualisation
(code générique écrit localement qui pourrait rejoindre un package)
```
