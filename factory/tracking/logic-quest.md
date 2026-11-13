# Logic Quest — suivi

Dossier : `apps/logic-quest` · Package id : `com.logicquest.app` (placeholder) · Statut manifest : `development`
· Dernière mise à jour : 2026-11-13 (session Logic Quest). Détail et critères d'acceptation : [apps/logic-quest/README.md](../../apps/logic-quest/README.md).

## Fonctionnalités terminées

- Manifest, `app.config.ts` (variantes dev/preview/prod), `eas.json`, `.env.example`, entrée au registre
- Moteur pur TS (`src/engine`) : suites (21 familles), motifs (lignes, matrices 3×3, analogies, symétries),
  déduction (classements, grilles, logique propositionnelle, menteurs/sincères, cadenas, problèmes) avec
  solveurs, mémoire (4 mécaniques), XP/niveaux/rangs, sessions (chrono en pause pendant les explications),
  progression et accès Premium, succès, défi quotidien généré (30 modèles × graine de la date)
- Contenu : 320 défis (100/80/80/60) + 30 modèles quotidiens — réponses calculées ou prouvées uniques,
  aucun doublon, contrôle d'ambiguïté ; textes EN/FR/ES générés depuis des modèles
- SQLite : migrations, seed versionné, `xp_ledger` (clé primaire = pas de double récompense), stats,
  quotidien, portefeuille d'indices, export/import/suppression
- Écrans : onboarding, Accueil, Jouer, Stats (avancées = Premium), Succès, réglage de mode, jeu + résultats,
  quotidien, paywall, réglages (langue, thème, accessibilité, rappel, confidentialité, données)
- Monétisation : abonnements + « retirer les pubs » (entitlement `no_ads`), bannière, rewarded (indices),
  interstitiel plafonné aux pauses naturelles, consentement UMP
- Assets de marque (`brand/mark.mjs`), dossier `store/` complet, CI matricielle + tag `logic-quest-vX.Y.Z`

## Fonctionnalités en cours

- Aucune.

## Fonctionnalités restantes

- Test sur appareil (pas de SDK Android sur ce poste) : lancement, haptique, UMP, pubs, Play Billing,
  notifications, TalkBack, longueur des libellés FR/ES sur petits écrans
- Captures d'écran (plan dans `store/screenshots.md`)
- Relecture éditoriale FR/ES par des locuteurs natifs

## Bugs connus

- Aucun connu. Les erreurs ESLint et i18n relevées plus tôt dans la journée sont corrigées.

## Dépendances spécifiques

Mêmes versions que DevSpeak (SDK 58). Aucune dépendance native nouvelle (pas de `react-native-svg` :
les formes sont dessinées avec Ionicons + Views). Packages : app-config, app-core, design-system,
localization, storage, analytics, monetization (dont `src/revenuecat`), notifications, testing.

## Tests réalisés

| Date | Commande | Résultat |
| --- | --- | --- |
| 2026-11-13 | `pnpm --filter logic-quest test` | ✅ 98/98 (moteur, contenu, SQLite, i18n, UI, monétisation, hors ligne) |
| 2026-11-13 | `tsc --noEmit` | ✅ |
| 2026-11-13 | ESLint (devspeak, logic-quest, packages, factory) | ✅ 0 problème |
| 2026-11-13 | `pnpm --filter devspeak test` (non-régression) | ✅ 126/126 |
| 2026-11-13 | `pnpm -r --filter "./packages/**" test` | ✅ 59/59 (monetization 12) |
| 2026-11-13 | `pnpm registry:check` | ✅ devspeak + logic-quest (problèmes restants : filepilot, calcwise) |
| 2026-11-13 | `npx expo export --platform android` | ✅ bundle Hermes 4,2 Mo |
| 2026-11-13 | `npx expo-doctor` | ✅ 20/20 |
| 2026-11-13 | Défi quotidien sur 365 jours | ✅ tous valides, aucun repli |

## Préparation à la publication

- [ ] Package id définitif (domaine possédé)
- [x] Assets, `store/` (fiches EN/FR/ES, Data Safety, classification, politique, plan de captures)
- [ ] Captures depuis un build preview
- [ ] Produits Play : `logicquest_premium_monthly`, `logicquest_premium_annual`, `logicquest_remove_ads`
- [ ] AdMob (bannière, rewarded, interstitiel), RevenueCat (`premium`, `no_ads`), EAS — variables CI scope `production/logic-quest`
- [x] Job CI + règle de tag `^logic-quest-v\d+\.\d+\.\d+$`
- [ ] Tests appareil
- ⚠ Titre suggéré « Logic Quest - Brain & Logic Games » = 33 caractères (> 30) : « Logic Quest - Brain & Logic » retenu

## Candidats à la mutualisation

`services/clock.ts` (identique à DevSpeak), `services/reminders.ts`, `services/boot.ts` (quasi identiques),
`services/ads.ts`, `services/monetization.ts`, hooks `useRewardedAd`/`useAsync`, composant `AdBanner`.
`engine/rng.ts` et les solveurs de `engine/deduction` pourraient servir à d'autres jeux.
