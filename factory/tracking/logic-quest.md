# Logic Quest — suivi

Dossier : `apps/logic-quest` · Package id : `com.logicquest.app` (placeholder) · Statut manifest : `development`
· Dernière mise à jour : 2026-11-13 (état initial relevé de l'extérieur — **à compléter par la session Logic Quest**)

## Fonctionnalités terminées

- Manifest, `app.config.ts`, `eas.json`, `.env.example`, entrée au registre
- Moteur : RNG déterministe, générateurs, suites numériques, motifs, déduction (solveurs), mémoire,
  scoring, progression, succès, défi quotidien, sessions
- Contenu : suites, motifs, déduction (dont jeu généré), mémoire, quotidien ; contenu traduit EN/FR/ES
- Base SQLite (migrations, repositories contenu/progression)
- Services : boot, pubs, analytics, monétisation, rappels, backup, feedback, jeu, quotidien

## Fonctionnalités en cours

- Écrans : onglets (accueil, jouer, stats, succès), `game`, `daily`, `mode/`, `paywall`, `settings/`, onboarding
- Composants de jeu (`board`, `ChallengeView`, `MemoryPlay`, `inputs`, `ui`)

## Fonctionnalités restantes

- Assets de marque (`assets/images` vide) → `pnpm brand-assets apps/logic-quest`
- Dossier `store/` (fiches, Data Safety, classification, visuels)
- Tests de composants / navigation (comme DevSpeak)
- Intégration CI (aujourd'hui seule DevSpeak est testée en intégration)

## Bugs connus (relevés le 2026-11-13, travail en cours)

- `src/__tests__/i18n.test.ts` : 3–4 tests en échec — clés utilisées dans `daily.tsx` absentes des locales
  (`daily.failedTitle`, `daily.failedBody`, …)
- ESLint : 4 erreurs / 3 avertissements — `react-hooks/set-state-in-effect` dans `src/hooks/index.ts:64`,
  erreurs dans `app/game.tsx`, `src/components/MemoryPlay.tsx` ; avertissement dans `content/data/deduction-generated.ts`

## Dépendances spécifiques

À compléter par la session. Packages utilisés : app-config, app-core, design-system, localization, storage,
analytics, monetization (dont `src/revenuecat`), notifications, testing.

## Tests réalisés

| Date | Commande | Résultat |
| --- | --- | --- |
| 2026-11-13 | `jest --ci` | 🟡 4 suites (3 ✅, i18n ❌), 78–79/82 |
| 2026-11-13 | `tsc --noEmit` | ✅ |
| 2026-11-13 | ESLint | ❌ 4 erreurs |
| 2026-11-13 | `pnpm registry:check` | ✅ |

## Préparation à la publication

- [ ] Package id définitif
- [ ] Assets, `store/`, captures
- [ ] Produits Play : `logicquest_premium_monthly`, `logicquest_premium_annual`, `logicquest_remove_ads`
- [ ] AdMob (bannière, rewarded, interstitiel), RevenueCat, EAS
- [ ] Job CI + règle de tag `^logic-quest-v\d+\.\d+\.\d+$`
- [ ] Tests appareil

## Candidats à la mutualisation

`services/clock.ts` (identique à DevSpeak), `services/reminders.ts`, `services/boot.ts` (quasi identiques),
`services/ads.ts`, `services/monetization.ts`. `engine/rng.ts` pourrait servir à d'autres jeux.
