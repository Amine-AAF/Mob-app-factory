# ImageCraft — audit technique et choix d'architecture

Date : 2026-11-13 · Branche : `feat/imagecraft` · Worktree : `C:/Projets/maf-imagecraft`

## 1. Monorepo (phase 1)

| Élément | Constat | Décision |
| --- | --- | --- |
| Stack | Expo SDK 58, RN 0.88, React 19.3, TS strict, Expo Router, pnpm hoisted | Versions identiques à DevSpeak/FilePilot (aucune montée de SDK) |
| Packages partagés | `app-config`, `app-core`, `design-system`, `localization`, `storage`, `analytics`, `monetization`, `testing` | Tous réutilisés **sans modification** |
| Développement parallèle | Le dossier principal contient du travail non commité d'autres sessions (CalcWise, FilePilot, HabitFlow, registre) | Travail isolé dans un worktree dédié, conformément à `factory/documentation/parallel-development.md` |
| Référence | FilePilot (outils fichiers/PDF) a déjà workspace temporaire, module Kotlin local, AdMob, RevenueCat | Modèles **copiés** localement (fileStore, imageHeader, naming, ads, monetization) — candidats à la mutualisation |

## 2. Moteur d'image : options évaluées

| Option | Couverture | Expo / EAS | Taille APK | Licence | Verdict |
| --- | --- | --- | --- | --- | --- |
| `expo-image-manipulator` seul | rotation, miroir, recadrage, redimensionnement, JPEG/PNG/WebP | Expo Go ✅ | déjà inclus | MIT | **Insuffisant** : aucun filtre, texte, filigrane, collage, fond |
| `@shopify/react-native-skia` | tout (shaders, texte, export) | dev build, config native | +6 à 8 Mo par ABI | MIT | Puissant mais lourd ; hors du socle validé du monorepo |
| **Module Kotlin local (`android.graphics`)** | tout le besoin : ColorMatrix, convolution, dégradés, Canvas, Typeface, BitmapFactory (inSampleSize), MediaStore | dev build (comme toutes les apps de la factory) | ~quelques Ko | code maison | **Retenu** |

Le module `modules/imagecraft-native` (Expo Modules API, Kotlin) exécute une **recette** sérialisée calculée et testée en TypeScript (`src/services/image/recipe.ts`). La même recette produit l'aperçu (petit budget de pixels) et l'export (pleine résolution) : **l'export correspond à l'aperçu par construction**.

Repli : si le module natif est absent (Expo Go, Jest), `expo-image-manipulator` assure rotation/miroir/recadrage/redimensionnement/compression/conversion ; les fonctions qui exigent le natif (filtres, texte, filigrane, fond social, collage, galerie) sont **désactivées avec un message**, jamais ignorées silencieusement.

## 3. Dépendances ajoutées

| Dépendance | Version | Licence | Pourquoi | Contrainte |
| --- | --- | --- | --- | --- |
| `expo-image-picker` | ~58.0.10 | MIT | Sélecteur de photos Android (Photo Picker) : aucune permission, accès aux seules photos choisies | Plugin configuré avec `photosPermission/cameraPermission/microphonePermission: false` |
| `expo-image-manipulator` | ~58.0.16 | MIT | Renderer de repli | déjà validé par FilePilot |
| `@react-native-community/slider` | 5.2.1 | MIT | Curseurs | déjà validé par FilePilot |
| `expo-file-system`, `expo-sharing`, `expo-sqlite`, `expo-localization`, `react-native-google-mobile-ads`, `react-native-purchases`, `zustand`, `zod`, `i18next` | versions du socle | MIT / Apache-2.0 | socle factory | — |

Aucune dépendance ajoutée au `package.json` racine ni à un package partagé. `pnpm-lock.yaml` régénéré par `pnpm install` (jamais édité à la main).

## 4. Contraintes Expo / Android

- **Development build obligatoire** (`npx expo run:android` ou EAS `development`) : module natif local + AdMob + RevenueCat. Expo Go = mode dégradé documenté ci-dessus.
- **Mémoire** : décodage `inSampleSize` borné par un budget (24 MP), toute la géométrie (EXIF + rotation + miroir + recadrage + échelle) appliquée en **un seul** `drawBitmap(matrix)` (pas de copie intermédiaire pleine taille), recyclage immédiat, `largeHeap` (plugin), `OutOfMemoryError` → code `ERR_OUT_OF_MEMORY` (message utilisateur). Une seule image décodée à la fois (lots séquentiels, collage cellule par cellule avec un budget par cellule).
- **URI Android** : le Photo Picker renvoie une copie `file://` dans le cache ; elle est **déplacée** dans `documents/sources` (copie privée). Une URI non issue du cache est **copiée**, jamais référencée. Le natif refuse tout schéma autre que `file://` (`ERR_INVALID_URI`).
- **Galerie** : `MediaStore` + `RELATIVE_PATH=Pictures/ImageCraft` + `IS_PENDING` (Android 10+, aucune permission). Android 7–9 : message « utiliser Exporter dans un dossier » (SAF).
- **WebP** : `WEBP_LOSSY` / `WEBP_LOSSLESS` sur Android 11+ ; ancien encodeur `WEBP` (sans perte à 100 uniquement à partir d'Android 10). Le natif renvoie `lossless` réel → l'UI n'affiche jamais « sans perte » à tort.
- **JPEG + transparence** : aplatissement sur une couleur de fond choisie (le JPEG n'a pas d'alpha).
- **HEIC** : non pris en charge en v1 (détecté et refusé avec un message clair).
- **Annulation** : drapeau par job vérifié entre les étapes natives (décodage, effets, rendu, encodage) et entre les fichiers d'un lot.
- **Arrière-plan / fermeture** : un job en cours continue tant que le processus vit ; si l'app est tuée, les fichiers temporaires sont supprimés au démarrage suivant (`sweepTemporaryFiles`).
- **Le module Kotlin n'a pas pu être compilé sur ce poste** (pas d'Android SDK). À valider par `npx expo run:android` ou un build EAS `development` (voir tracking).

## 5. Fichiers et confidentialité

```
<cache>/imagecraft-work/<jobId>/   rendus temporaires d'un job (supprimés à la fin)
<cache>/imagecraft-preview/<scope>/ aperçus (supprimés à la fermeture de l'écran)
<cache>/ImagePicker/               copies du sélecteur (balayées au démarrage)
<documents>/sources/               copie privée des photos importées (projets ré-ouvrables)
<documents>/outputs/               résultats (jusqu'à suppression par l'utilisateur)
```

SQLite ne contient que des métadonnées (aucune colonne BLOB, testé). Les sources non référencées par un projet sont purgées au démarrage.
