# ImageCraft — suivi

Dossier : `apps/imagecraft` · Package id : `com.mobileappsfactory.imagecraft` · Statut manifest : `development` · Branche : `feat/imagecraft` (worktree `C:/Projets/maf-imagecraft`) · Dernière mise à jour : 2026-11-13

## Fonctionnalités terminées (code + tests unitaires)

- **Éditeur** : import (Photo Picker, sans permission), aperçu grand format rendu par le pipeline d'export, zoom (double-tap) + déplacement, comparaison avant/après (appui long), rotation 90°, miroir H/V, recadrage libre et 9 ratios avec poignées, annuler/rétablir (40 niveaux, glissements fusionnés), réinitialisation globale et par réglage, export, partage.
- **Redimensionnement** : pixels (verrou de proportions), pourcentage, préréglages ; estimation de taille ; refus des tailles excessives ; avertissement d'agrandissement.
- **Compression** : JPEG/WebP, qualité réglable, taille d'origine / estimation (fourchette, échantillon réel) / résultat exact / % gagné ; PNG présenté comme sans perte ; mode taille cible (Premium, recherche dichotomique ≤ 7 essais) ; avant/après.
- **Conversion** : JPEG/PNG/WebP réellement encodés et vérifiés (magic bytes) ; transparence conservée en PNG/WebP, aplatie sur une couleur choisie en JPEG (avertissement) ; « sans perte » affiché uniquement si l'encodeur l'est vraiment.
- **Filtres & réglages** : 10 curseurs (luminosité, contraste, saturation, exposition, chaleur, netteté, flou, vignette, N&B, sépia), 13 looks ; matrice couleur calculée en TS et appliquée telle quelle par le natif (aperçu = export).
- **Texte** : 5 calques, taille relative, couleur, 7 polices système, gras, alignement, position (glisser + curseurs), rotation, opacité, ombre.
- **Filigrane** (Premium) : texte ou logo importé, 9 positions, taille, opacité, répétition diagonale.
- **Réseaux sociaux** : 13 préréglages documentés (`docs/social-presets.md`) + taille personnalisée ; remplir/ajuster, zoom, déplacement, couleur de fond ; jamais de déformation (testé sur tous les presets).
- **Collage** : 18 modèles originaux (2 à 9 photos), espacement, coins arrondis, fond, cadrage par photo (zoom/déplacement), remplacement.
- **Lots** : compression/redimensionnement/conversion (+ filigrane texte Premium), séquentiel (1 image en mémoire), progression, annulation, erreurs par fichier, résumé, export groupé.
- **Projets** : historique local (métadonnées SQLite seulement), opérations, format, taille, dimensions ; ré-ouverture dans l'éditeur (si copie privée conservée), partage, suppression unitaire/globale ; purge des sources orphelines au démarrage.
- **Partage/export** : feuille de partage Android (FileProvider), galerie MediaStore `Pictures/ImageCraft` (Android 10+, sans permission), export dans un dossier (SAF, nom non conflictuel).
- **UX** : 5 onglets (Accueil, Éditer, Outils, Projets, Réglages), import en un geste, outils rapides, outils les plus utilisés, projets récents, onboarding 3 écrans sans permission, clair/sombre, en/fr/es complets, libellés d'accessibilité.
- **Monétisation** : gating Free/Premium (`docs/ads-policy.md`), paywall à prix magasin uniquement, restauration, RevenueCat si clé fournie (sinon « achats indisponibles », jamais simulé), déblocage par pub récompensée (3/jour), bannières uniquement Accueil/Outils/Projets, interstitiel seulement après « Terminé », jamais pendant un traitement/export (testé).
- **Confidentialité** : aucun réseau dans le code app (testé), analytics opt-in typés sans URI/nom de fichier (filtre testé), `allowBackup=false`, permissions médias/stockage/caméra bloquées.
- **Store** : icône/splash/feature graphic originaux générés (`brand/mark.mjs`), fiches en/fr/es, ASO, politique de confidentialité, Data Safety.

## Fonctionnalités restantes / à valider

- **Compilation et test du module Kotlin sur appareil** : non compilé ici (pas d'Android SDK sur le poste). Première étape : `npx expo run:android` puis checklist ci-dessous.
- Captures d'écran Play Store (nécessitent un build de dev en marche).
- HEIC non pris en charge (refus clair). Candidat v1.1 : décodage natif `ImageDecoder` (Android 9+) + parsing d'en-tête HEIF.
- Rotation fine (redressement ±45°) non implémentée (rotations 90° seulement).
- Pincer-zoomer à deux doigts : remplacé par double-tap + glisser (pas de dépendance gesture-handler ajoutée).
- Annulation à l'intérieur d'une étape native longue : vérifiée entre étapes (décodage, effets, overlays, encodage), pas pendant `Bitmap.compress`.

## Bugs connus

- Aucun bug connu dans le code testé. Risque principal : écarts de rendu natif non vérifiés sur appareil (ombres de texte, flou, police `cursive` selon constructeur).

## Dépendances spécifiques

- Ajoutée : `expo-image-picker ~58.0.10` (MIT). Réutilisées du socle : `expo-image-manipulator`, `@react-native-community/slider` 5.2.1, `expo-file-system`, `expo-sharing`, `expo-sqlite`, `react-native-google-mobile-ads`, `react-native-purchases`.
- Module natif local : `modules/imagecraft-native` (Kotlin, `android.graphics`, aucune lib tierce).
- Packages `@factory/*` utilisés (non modifiés) : app-config, app-core, design-system, localization, storage, analytics, monetization, testing.

## Tests réalisés

Voir le rapport de session (résultats chiffrés de `pnpm --filter imagecraft test` / `typecheck` / lint).

Checklist appareil (à faire) : import (JPEG/PNG/WebP, photo 48 MP, fichier sans extension, HEIC refusé), recadrage/rotation/miroir exportés = aperçu, filtres visibles dans le fichier exporté, texte/filigrane/logo, presets sociaux, collage, lot de 20 photos + annulation, stockage plein, permission refusée (fermer le sélecteur), mise en arrière-plan pendant un export, app tuée pendant un traitement (fichiers temporaires nettoyés au redémarrage), galerie Android 10+ et repli Android 9, partage, mode sombre, 3 langues, petits écrans (360 dp) et tablettes.

## Préparation à la publication

- [x] Package id `com.mobileappsfactory.imagecraft` (définitif après première publication)
- [x] Manifest, registre, `eas.json` (dev/preview APK, production AAB), `.env.example`
- [x] Icône, splash, feature graphic, fiches en/fr/es, politique, Data Safety (brouillons à relire)
- [ ] Produits Play Console + RevenueCat (`imagecraft_premium_monthly|annual|lifetime`, entitlement `premium`)
- [ ] IDs AdMob de production (`ADMOB_ANDROID_APP_ID`, `EXPO_PUBLIC_ADMOB_*`) dans les variables protégées
- [ ] `EAS_PROJECT_ID`, keystore EAS, URL publique de la politique de confidentialité, adresse de contact
- [ ] CI : `.gitlab-ci.yml` ne couvre que DevSpeak (`APP: devspeak`) — matrice à créer (changement partagé, protocole §3)
- [ ] Tests appareil (checklist ci-dessus), vérification des exigences Google Play en vigueur

## Candidats à la mutualisation

Copiés de FilePilot (3ᵉ app concernée pour certains → remontée possible via le protocole §3) :
`services/files/fileStore.ts`, `expoFileStore.ts`, `imageHeader.ts`, `naming.ts`, `services/ads.ts`,
`services/monetization.ts`, `hooks/useRewardedAd.ts`, `services/clock.ts`. Cible : `@factory/storage`
(fichiers), `@factory/monetization` (ads/monetization), `@factory/app-core` (clock).
Nouveaux génériques : `utils/history.ts` (undo/redo), `utils/colorMatrix.ts`, `utils/geometry.ts`.
