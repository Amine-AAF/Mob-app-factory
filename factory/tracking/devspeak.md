# DevSpeak — suivi

Dossier : `apps/devspeak` · Package id : `com.devspeak.app` (placeholder) · Statut manifest : `development`
· Dernière mise à jour : 2026-11-13

Statut détaillé critère par critère : [factory/documentation/status.md](../documentation/status.md).
DevSpeak est l'**app de référence** : ses versions de dépendances servent de base à `pnpm new-app`.
Toute modification d'un package partagé doit garder ses tests verts.

## Fonctionnalités terminées

- Onboarding (3 écrans + profil 5 étapes RHF/zod), profil éditable
- Modules Workplace (20), Technical (26), Interview (20, 8 parcours) ; 212 questions de quiz
- Dictionnaire tech + recherche SQL, flashcards SRS SM-2, défis quotidiens
- Pratique orale (TTS appareil, enregistrement micro), progression, succès, calendrier, streaks
- Interface EN/FR/ES (413 clés), thèmes clair/sombre, rappels locaux, backup/restore
- Monétisation : paywall RevenueCat, bannière + rewarded AdMob (IDs de test hors prod), consentement UMP
- Dossier `store/` : fiches EN/FR/ES, ASO, Data Safety, classification, politique de confidentialité, visuels

## Fonctionnalités en cours

- Aucune (code terminé).

## Fonctionnalités restantes

- Vérification sur appareil Android réel (lancement, TTS, micro, notifications, pubs, achats)
- Relecture éditoriale humaine du contenu (EN natif + FR/ES)
- Captures d'écran store depuis un build preview

## Bugs connus

- Aucun connu. Limitations : prononciation non notée automatiquement (assumé), layouts non audités RTL.

## Dépendances spécifiques

expo-sqlite, expo-speech, expo-audio (enregistrement), expo-notifications, react-native-google-mobile-ads,
react-native-purchases, react-hook-form + zod, zustand, AsyncStorage.
Packages : app-config, app-core, design-system, localization, storage, analytics, monetization, notifications, testing.

## Tests réalisés

| Date | Commande | Résultat |
| --- | --- | --- |
| 2026-11-13 | `jest --ci` (apps/devspeak) | ✅ 7 suites, 126/126 |
| 2026-11-13 | `tsc --noEmit` | ✅ |
| 2026-11-13 | ESLint (fichiers DevSpeak) | ✅ 0 problème |
| 2026-11-13 | `pnpm registry:check` | ✅ |
| antérieur | `expo-doctor` 20/20, `expo export --platform android` (bundle Hermes 5,7 Mo) | ✅ (voir status.md) |
| — | Build natif / appareil | ⬜ pas de SDK Android sur la machine |

## Préparation à la publication

- [ ] Package id définitif (domaine possédé) — **bloquant avant 1ʳᵉ mise en ligne**
- [ ] Projet EAS + `EXPO_TOKEN`, `EAS_PROJECT_ID`
- [ ] App Play Console, abonnements, testeurs
- [ ] RevenueCat (clé), AdMob (app, unités, message de consentement, app-ads.txt)
- [ ] Politique de confidentialité / CGU hébergées
- [ ] Captures d'écran, relecture juridique
- [x] Fiches store, Data Safety, classification, visuels
- [x] CI : tests, export Android, build AAB (job prêt), soumission manuelle

## Candidats à la mutualisation

`services/clock.ts`, `services/reminders.ts`, `services/boot.ts`, `services/ads.ts`, `services/monetization.ts`
(dupliqués dans Logic Quest — voir portfolio.md).
