# MealWise — suivi

Dossier : `apps/mealwise` · Branche : `feat/mealwise` (worktree `C:\Projets\maf-mealwise`) · Package id : `com.mealwise.app` ⚠ placeholder · Statut manifest : `development` · Dernière mise à jour : 2026-11-13

## Fonctionnalités terminées
- Dashboard : prochain repas, repas du jour par créneau, résumé de la semaine, liste de courses, produits à consommer, favoris, idées rapides, raccourcis.
- Planificateur : semaine en liste ou calendrier 7×4, ajout recette / repas personnalisé, déplacer, dupliquer un repas, copier une journée, copier la semaine suivante, vider la semaine, enregistrer comme menu, ingrédients de la semaine.
- Recettes : 108 recettes originales EN/FR/ES (validées par schéma zod), 9 catégories, tags, recherche titre + ingrédient, filtres, favoris, historique, recettes perso (CRUD, duplication d'une recette fournie), import manuel par texte collé.
- Mode cuisine : une étape à la fois, ingrédients à cocher, portions, minuteurs (notification locale écran éteint), écran maintenu allumé.
- Liste de courses : génération 1/3/7/14 jours, fusion uniquement si unités compatibles, déduction des stocks, rayons, ajout manuel (fusion compatible), édition, prix estimés (mémorisés), historique, réutilisation, partage texte, export CSV (Premium), clôture avec montant dépensé → dépense.
- Garde-manger : quantité, emplacement, date limite, alertes, « consommé », ingrédients manquants sur la recette, « que puis-je cuisiner ? » (Premium).
- Nutrition : estimations par portion / jour / semaine depuis valeurs de référence génériques, couverture affichée, jamais inventées, avertissement non médical.
- Modèles : 8 modèles intégrés (3 Premium) + menus utilisateur.
- Budget : budget hebdo, dépenses, comparaison, historique mensuel et coût des recettes (Premium).
- Réglages : langue, métrique/impérial, unités d'origine, devise, début de semaine, 12/24 h, foyer, régime, thème, notifications (4 types), sauvegarde/restauration JSON, export du planning, suppression des données, confidentialité + consentement pub.
- Monétisation : RevenueCat (mensuel / annuel / à vie), cache hors-ligne 7 j, bannière AdMob uniquement sur écrans de navigation, IDs de test en dev, UMP.
- Assets de marque (`brand/mark.mjs`), dossier `store/` (fiches EN/FR/ES, Data safety, politique de confidentialité, classification, checklist).

## Fonctionnalités en cours
- Aucune.

## Fonctionnalités restantes
- Configuration externe : package id définitif, EAS project id, produits Play + RevenueCat, unités AdMob, URLs légales.
- Captures d'écran Play Store (nécessite un build sur appareil).
- Tests sur appareil (notifications Android 13+, minuteurs écran éteint, sélecteur de fichiers, partage).
- CI : MealWise n'est pas encore dans les matrices `.gitlab-ci.yml` (fichier partagé, non modifié). À ajouter via le protocole §3 :
  `APP: [..., mealwise]` dans `integration-tests`, `bundle-validation`, `android-development`, et la règle de tag `^mealwise-v\d+\.\d+\.\d+$` → `APP: mealwise`.
- Contenu des recettes : photos réelles (actuellement illustrations emoji + couleurs).

## Bugs connus
- Aucun bug connu. Limite assumée : la conversion masse ↔ volume n'est jamais faite (lignes séparées dans la liste), par choix de sécurité.

## Dépendances spécifiques
Natives/JS au-delà du socle : `expo-sqlite`, `expo-notifications`, `expo-keep-awake`, `expo-clipboard`, `expo-document-picker`, `expo-file-system`, `expo-sharing`, `expo-haptics`, `expo-localization`, `@react-native-async-storage/async-storage`, `react-native-google-mobile-ads`, `react-native-purchases`, `i18next`, `react-i18next`, `zustand`, `zod` (toutes déjà présentes dans le store pnpm, versions SDK 58).
Packages @factory : design-system, storage, localization, monetization, analytics, app-core, app-config, notifications (dépendance déclarée), testing (dev). **Aucun package partagé modifié.**

## Tests réalisés
- 2026-11-13 · `pnpm --filter mealwise test` → 8 suites, **161/161** ✅
- 2026-11-13 · `tsc --noEmit` (mealwise) ✅ · `eslint apps/mealwise` ✅ (0 erreur, 0 avertissement)
- 2026-11-13 · `npx expo export --platform android` ✅ (bundle Hermes 4,6 Mo)
- 2026-11-13 · `pnpm registry:check` : mealwise valide (les erreurs restantes concernent filepilot/calcwise dont les locales ne sont pas sur cette branche)

## Préparation à la publication
- [ ] Package id définitif · [x] manifest · [x] assets (icône, adaptive, monochrome, splash, notification, feature graphic) · [x] `store/` · [ ] IDs prod (AdMob, RevenueCat) · [ ] EAS init · [ ] CI matrice · [ ] tests appareil · [ ] captures

## Candidats à la mutualisation
- `src/services/notifications.ts` : planification multi-rappels (DATE / WEEKLY / TIME_INTERVAL) avec préfixe et plafonds → extension possible de `@factory/notifications`.
- `src/services/clock.ts`, `monetization.ts`, `ads.ts`, `backupService.ts`, `hooks/useAsync.ts` : copiés de DevSpeak (déjà listés comme dette dans portfolio.md).
- `src/domain/units.ts` + `quantity.ts` (unités, fractions, arrondis) : génériques, utiles à toute app culinaire/achats.
- `components/ui.tsx` : `Field`, `Stepper`, `Segmented`, `CheckRow` absents de `@factory/design-system`.
- Le thème partagé a des neutres froids ; MealWise ajoute une palette chaude pour les illustrations. Une option `overrides` (rétrocompatible) dans `ThemeProvider` permettrait des fonds chauds.
