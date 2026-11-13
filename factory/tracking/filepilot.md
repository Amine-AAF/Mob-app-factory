# FilePilot — suivi

Dossier : `apps/filepilot` · Package id : `com.filepilot.app` (provisoire) · Statut manifest : `development` · Dernière mise à jour : 2026-11-13
Détail complet : [apps/filepilot/docs/status.md](../../apps/filepilot/docs/status.md).

## Fonctionnalités terminées

- Tableau de bord (recherche d'outils, quota, opérations récentes, entrée Premium), onboarding, réglages, confidentialité
- Images : compression (qualité, taille cible Premium, lot Premium), redimensionnement (préréglages, %, personnalisé, ratio), conversion JPEG/PNG/WebP réelle
- PDF : fusion (réordonnancement), division (plages, chaque page, toutes les N pages), extraction de pages, image → PDF, PDF → images (module natif `PdfRenderer`)
- Moteur de traitement (`src/services/`) : détection par contenu, en-têtes image (dimensions, alpha, EXIF), limites mémoire, dossiers temporaires par tâche, nettoyage, pas d'écrasement, reprise après interruption
- Historique SQLite (métadonnées seulement), partage (FileProvider), « Enregistrer sur l'appareil » (SAF)
- i18n en/fr/es, thèmes clair/sombre, AdMob (UMP, IDs de test en dev), RevenueCat, analytics anonymes opt-in
- Paquet Play (`store/` : fiches en/fr/es, Data Safety, classification, politique de confidentialité, icône, bannière)

## Fonctionnalités en cours

- Aucune (en attente de vérification sur appareil)

## Fonctionnalités restantes

- Compression PDF : volontairement non proposée (pas de méthode locale vérifiable)
- HEIC/GIF/BMP/TIFF et PDF protégés par mot de passe : non pris en charge
- Ajout de `filepilot` aux matrices `.gitlab-ci.yml` + règle de tag `filepilot-vX.Y.Z` : à faire via `chore/shared-*` (protocole §3)

## Bugs connus

- Aucun connu. Code natif Kotlin (`modules/filepilot-native`) non compilé ici (pas de SDK Android).

## Dépendances spécifiques

expo-document-picker, expo-image-manipulator, @react-native-community/slider, pdf-lib 1.17.1 (MIT, non maintenu — repli : `@cantoo/pdf-lib`),
react-hook-form + @hookform/resolvers ; tests : jpeg-js, pngjs. Évaluation : `apps/filepilot/docs/file-processing.md`.
Aucun package partagé modifié.

## Tests réalisés

| Date | Commande | Résultat |
| --- | --- | --- |
| 2026-11-13 | `tsc --noEmit` | ✅ |
| 2026-11-13 | `eslint apps/filepilot` | ✅ 0 problème |
| 2026-11-13 | `jest` | ✅ 117/117 (7 suites) |
| 2026-11-13 | `expo-doctor` | ✅ 20/20 |
| 2026-11-13 | `expo export --platform android` | ✅ bundle Hermes 5,5 Mo |
| 2026-11-13 | `expo prebuild` | ✅ module local autolinké, permissions stockage/média retirées |

## Préparation à la publication

- [x] Manifest, entrée registre, assets, fiches store, Data Safety, classification, politique (modèle)
- [x] targetSdk 36 (exigence Play depuis le 31/08/2026)
- [ ] Package id définitif, projet EAS, AdMob, produits Play + RevenueCat, URLs légales
- [ ] Build sur appareil + checklist QA (`docs/status.md`), captures d'écran réelles

## Candidats à la mutualisation

- `services/ads.ts` (bannière + récompensée + interstitiel), `hooks/useRewardedAd.ts`, `services/monetization.ts` : 3ᵉ copie du même schéma → remonter dans `@factory/monetization` via le protocole partagé.
- `FileStore`/`Workspace` et `ProcessingView` si une autre app manipule des fichiers (ex. imagecraft).
