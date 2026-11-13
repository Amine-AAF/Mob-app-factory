# FilePilot — suivi

Dossier : `apps/filepilot` · Package id : non défini · Statut manifest : — · Dernière mise à jour : 2026-11-13
(état initial relevé de l'extérieur — **à compléter par la session FilePilot**)

## Fonctionnalités terminées

- `package.json` (dépendances déclarées) ; scaffolding en cours (`app.config.ts`, manifest, `eas.json`, `src/`)

## Fonctionnalités en cours

- Scaffolding de l'app

## Fonctionnalités restantes

- Définir le produit (périmètre, audience, modèle économique), package id, locales
- Manifest + entrée dans `factory/app-registry/registry.json` (ajouter **uniquement** sa ligne)
- Écrans, logique, i18n, tests, assets, `store/`

## Bugs connus

- Au relevé (2026-11-13), `tsc --noEmit` et `jest` échouaient faute de fichiers source (scaffolding incomplet).

## Dépendances spécifiques

expo-document-picker, expo-file-system, expo-image-manipulator, expo-sharing, expo-sqlite,
@react-native-community/slider, react-native-google-mobile-ads, react-native-purchases, zustand, zod.
Packages prévus : app-config, app-core, design-system, localization, monetization, storage, analytics, testing.

Attention Data Safety : accès aux fichiers utilisateur → déclarer précisément (pas de
`MANAGE_EXTERNAL_STORAGE` sauf justification Play ; préférer le sélecteur de documents / SAF).

## Tests réalisés

| Date | Commande | Résultat |
| --- | --- | --- |
| 2026-11-13 | `tsc --noEmit` | ❌ (pas de sources) |

## Préparation à la publication

- [ ] Tout reste à faire.

## Candidats à la mutualisation

FilePilot sera la 3ᵉ app avec pubs + abonnements : bon moment pour remonter `ads.ts` / `monetization.ts`
dans `@factory/monetization` — **en coordination**, via le protocole partagé, pas en parallèle d'une autre session.
