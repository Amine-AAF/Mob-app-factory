# CalcWise — suivi

Dossier : `apps/calcwise` · Branche : `feat/calcwise` (worktree `../maf-calcwise`) · Package id :
`com.mobileappsfactory.calcwise` · Statut manifest : `development` · Dernière mise à jour : 2026-11-13

## Fonctionnalités terminées

- Moteur mathématique sécurisé (tokenizer + parseur récursif + décimales 50 chiffres, sans `eval`) :
  priorités, parenthèses auto-fermées, % « calculatrice », multiplication implicite, trigonométrie deg/rad,
  inverses, log/ln, puissances/racines, factorielle, π/e, notation scientifique, erreurs typées, `ans` exact.
- Calculatrice standard + scientifique (clavier, aperçu en direct, ±, ⌫/appui long, copie, historique).
- Pourcentages (7 modes), Remises & achats (remises successives, TVA HT/TTC, meilleur prix au kg/L/pièce),
  Pourboire & partage (exact au centime ou arrondi), Convertisseur (9 catégories, définitions exactes),
  Crédit (mensualité, totaux, tableau annuel ; Premium : tableau mensuel, comparaison, remboursement anticipé),
  Épargne (intérêts composés, capitalisation, timing, graphique ; Premium : tableau annuel).
- Historique SQLite (recherche, suppression unitaire/globale avec confirmation, réutilisation, limite 50 en
  gratuit), favoris (3 en gratuit), réglages (thème, palettes Premium, langue, format numérique, devise,
  angle, vibrations, TVA/pourboire par défaut, statistiques opt-in, confidentialité, suppression des données).
- Onboarding 3 écrans (passable), écran Premium (mensuel/annuel/à vie, prix du store, restauration).
- AdMob : bannière uniquement Accueil/Outils/Historique, interstitiel plafonné en quittant un outil,
  récompensée = déblocage 1 h des outils avancés, consentement UMP, IDs de test hors production.
- i18n en/fr/es complète (clés identiques, placeholders, pluriels testés), formats localisés.
- Identité : logo original (`brand/mark.mjs`), icône, icône adaptative + monochrome, splash, feature graphic.
- `store/` : fiches en/fr/es, Data Safety, politique de confidentialité, classification, captures, release.
- `docs/FORMULAS.md` : toutes les formules et conventions d'arrondi. Jobs CI `calcwise-*`.

## Fonctionnalités en cours

- Aucune.

## Fonctionnalités restantes (configuration externe / appareil)

- Comptes et IDs : Play Console (3 produits), RevenueCat (entitlement `premium`), AdMob (3 unités + messages
  de consentement), `eas init` (EAS_PROJECT_ID), politique de confidentialité hébergée.
- Tests sur appareil Android : build preview, achats avec testeurs de licence, pubs de test, mode sombre,
  lecteur d'écran (TalkBack), petits écrans (mode scientifique).
- Captures d'écran réelles (voir `store/screenshots.md`).

## Bugs connus

- Aucun connu. Non vérifié sur appareil (pas de SDK Android sur ce poste).

## Dépendances spécifiques

- `decimal.js` 10.6.0 (déjà dans le lockfile, version inchangée), `expo-clipboard` ~58.0.4 (nouveau),
  `expo-haptics`, `expo-sqlite`, `expo-localization`, `@react-native-async-storage/async-storage`,
  `react-native-google-mobile-ads`, `react-native-purchases`, `zustand`, `i18next`/`react-i18next`
  (mêmes versions que DevSpeak/Logic Quest). Pas de `expo-notifications` (aucune notification).

## Tests réalisés

- 151 tests Jest (8 suites) : moteur (≈ 60 cas dont pièges flottants, domaines, extrêmes), calculateurs
  (références bancaires, Σ capital = P, forme fermée épargne, aller-retour de toutes les unités), clavier,
  formats/parsing localisés, i18n, SQLite (sql.js), Premium (fournisseur factice, cache 7 j), règles pubs,
  absence de réseau/`eval`, événements analytics autorisés, contrastes WCAG des 5 palettes, écrans (RNTL).
- `tsc --noEmit` ✅ · ESLint 0 problème ✅ · `expo-doctor` 20/20 ✅ · `expo export --platform android` ✅ (3,8 Mo).

## Préparation à la publication

- [x] Application ID, nom, icône, splash, versionCode, `eas.json` (APK preview, AAB production)
- [x] Fiches, Data Safety, politique de confidentialité (modèle), classification
- [ ] Comptes/IDs externes, signature (EAS credentials), captures réelles, tests appareil, revue juridique

## Candidats à la mutualisation

- `src/utils/decimal.ts` + `src/utils/numberFormat.ts` (formatage/parsing localisé de décimales) → futur
  `@factory/localization` ou package `@factory/math` si une autre app en a besoin.
- `services/ads.ts`, `services/monetization.ts`, `services/clock.ts`, `hooks/useRewardedAd.ts`,
  `hooks/useAsync.ts` : 3ᵉ copie (DevSpeak ↔ Logic Quest ↔ CalcWise) → **seuil de remontée atteint**
  (parallel-development.md §4), à faire via `chore/shared-*`.
- Interstitiel singleton préchargé (`hooks/useToolSession.ts`).
