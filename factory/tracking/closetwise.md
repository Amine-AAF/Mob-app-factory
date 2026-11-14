# ClosetWise — suivi

Dossier : `apps/closetwise` · Branche : `feat/closetwise` (worktree `C:/Projets/maf-closetwise`)
· Package id : `com.closetwise.app` ⚠ placeholder · Statut manifest : `development`
· Dernière mise à jour : 2026-11-13

## Fonctionnalités terminées (code)

- Dressing numérique : ajout rapide (photo + catégorie), fiche complète, recherche, filtres, tri, grille/liste,
  favoris, archives, détection de doublons, coût par port.
- Photos : Photo Picker (sans permission de stockage), caméra à la demande, compression JPEG ≤ 1600 px,
  miniatures 360 px, stockage privé (chemins relatifs en base), nettoyage des orphelins et fichiers temporaires.
- Outfit Builder (slots), duplication, favoris ; suggestions locales à base de règles (pas d'IA), notation,
  exclusions, mode découverte.
- Planificateur : vues jour/semaine/mois, plusieurs plans par jour, duplication de semaine, « porté »,
  historique d'utilisation, rappels locaux.
- Statistiques (CPW, fréquence d'usage, valeur par devise), achats & budget mensuel multi-devises,
  liste d'envies, assistant valise (modèles, tenues → articles, « n'oubliez pas »), entretien & lessive,
  objectifs & défis.
- Notifications locales configurables (5 types, désactivées par défaut, textes génériques).
- Monétisation préparée : limites gratuites, paywall RevenueCat (mensuel/annuel/à vie), bannières AdMob
  limitées aux écrans de consultation, IDs de test en dev.
- Sauvegarde/restauration JSON (photos en option), export CSV, suppression totale.
- i18n EN/FR/ES, thème clair/sombre + 4 palettes premium, docs, EAS, checklist Play.

## Fonctionnalités restantes

- Générer les assets de marque (`pnpm brand-assets apps/closetwise`, nécessite sharp) — PNG actuels = placeholders.
- Configuration externe : EAS project id, produits Play, RevenueCat, AdMob, URLs légales (voir `store/PLAY_CHECKLIST.md`).
- Jobs CI ClosetWise : modification partagée de `.gitlab-ci.yml` à faire via factory-core (proposition dans `docs/CI.md`).
- Tests sur appareil (caméra, Photo Picker, notifications, publicité, facturation) : 🟡 non vérifiables sans build Android.

## Bugs connus

- —

## Dépendances spécifiques

expo-sqlite, expo-file-system, expo-image-picker, expo-image-manipulator, expo-document-picker, expo-sharing,
expo-notifications, expo-localization, react-native-google-mobile-ads, react-native-purchases, zustand,
i18next/react-i18next, AsyncStorage. Versions alignées SDK 58 (copiées des apps sœurs).

## Candidats à la mutualisation

- `src/ui/theme.ts` : thème local car `createTheme` (@factory/design-system) impose des neutres froids ;
  proposer une option additive `neutrals` au package.
- `services/ads.ts`, `services/monetization.ts`, `services/clock.ts` : copiés de DevSpeak (dette déjà listée).
- `services/photos/pipeline.ts` : pipeline compression/miniature/orphelins testé, réutilisable (HomeCare, PetCare…).

## Tests réalisés

2026-11-13 : `tsc --noEmit` ✅ · Jest ✅ 130/130 (9 suites : database, domain, photos-backup, theme, i18n,
wardrobe-, outfits-, money-goals-, trips-settings-features) · `pnpm registry:check` ✅ pour closetwise
(les erreurs restantes concernent filepilot/calcwise, préexistantes).
Non vérifié : appareil/émulateur (caméra, Photo Picker, notifications, AdMob, facturation) — voir `store/PLAY_CHECKLIST.md § 5`.
Détail des suites : `docs/ARCHITECTURE.md § Testing`.
