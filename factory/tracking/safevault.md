# SafeVault — suivi

App #15 · `apps/safevault` · branche `feat/safevault` (worktree `C:\Projets\maf-safevault`) · package id `com.safevault.app` ⚠ placeholder

Dernière mise à jour : 2026-11-13.

## Fait ✅

- Audit du monorepo : conventions (manifest, template, module natif local façon FilePilot), packages partagés réutilisés **sans modification** (design-system, localization, storage, monetization, app-config, testing).
- Étude de faisabilité crypto + modèle de menace : `apps/safevault/docs/SECURITY.md`.
- Crypto : Argon2id (natif BouncyCastle validé par KAT au démarrage, repli `@noble/hashes`), XChaCha20-Poly1305 (`@noble/ciphers`), HKDF, CSPRNG `expo-crypto`, enveloppe versionnée, AAD par ligne/champ/version de clé.
- Coffre : création (avertissement « pas de récupération » obligatoire), déverrouillage, verrouillage manuel/auto, back-off persistant après échecs, biométrie (Keystore via expo-secure-store), FLAG_SECURE, effacement des clés au verrouillage, changement de mot de passe maître, rotation de clé, suppression totale.
- Identifiants, générateur (mots de passe + phrases de passe, liste de mots originale), notes sécurisées (formatage simple), cartes (sans CVV/PIN, avertissement), identités (5 modèles), catégories (10 intégrées + personnalisées), recherche/filtres/tags/favoris/récents, historique des mots de passe.
- Audit local (faibles, réutilisés, anciens, incomplets) + indicateur de santé.
- Sauvegarde/restauration chiffrées (`.safevault`) : intégrité, versions, mauvais mot de passe, altération, fichiers corrompus/tronqués, import atomique, confirmation avant remplacement, restauration après réinstallation.
- i18n EN (défaut) / FR / ES complètes.
- Monétisation : free (50 identifiants, 10 notes, 2 cartes, 2 identités) / Premium via RevenueCat (Google Play Billing). Aucune pub, aucune analytics.
- Docs : README, `docs/SECURITY.md`, `docs/SECURITY-CHECKLIST.md`, `docs/ARCHITECTURE.md`, `store/*` (fiches EN/FR/ES, data safety, politique de confidentialité, checklist Google Play), assets de marque générés.

## Tests

`pnpm --filter safevault typecheck` ✅ · `pnpm --filter safevault test` ✅ 112/112 (8 suites) · `eslint apps/safevault` ✅ · `npx expo export --platform android` ✅ (bundle Hermes 3,7 Mo) · `registry:check` ✅ pour safevault.
Suites : crypto, vault, backup, services, security (statique), features, i18n, ui.
Note : l'Argon2id réel à coût de production n'est pas exécuté en CI (trop lent sous Jest) — le déterminisme est testé à coût réduit, le câblage des paramètres par moteur espion, la conformité par le vecteur RFC 9106 et le KAT.

## En attente / non vérifié 🟡

- **Module natif Kotlin non compilé** (pas de toolchain Android ici) : `argon2id` (BouncyCastle 1.80), `copySensitive`, `clearClipboardIfLabel`, `isDeviceSecure`. À vérifier sur un dev build : autolinking, KAT « native » affiché dans Réglages › Sécurité & confidentialité, temps de création du coffre.
- Checklist `docs/SECURITY-CHECKLIST.md` à dérouler sur appareils réels.
- Audit de sécurité indépendant : non réalisé (obligatoire avant toute communication forte).
- Package id définitif, `eas init`, produits Play Console / RevenueCat, URL de la politique de confidentialité, e-mail support.

## Besoins partagés (non modifiés — à coordonner, cf. parallel-development.md §3)

- `.gitlab-ci.yml` : `APP: devspeak` codé en dur → SafeVault n'est pas couvert par les jobs d'intégration/EAS. Ajouter SafeVault à la future matrice + règle de tag `^safevault-v\d+\.\d+\.\d+$`. Non modifié ici (fichier partagé, modifié en parallèle par une autre session).
- Candidats à la mutualisation : helpers AEAD/KDF (`src/crypto`), `services/clipboard.ts`, `services/screenSecurity.ts`.

## Dépendances spécifiques

`@noble/hashes` 2.4.0 et `@noble/ciphers` 2.4.0 (épinglées), `expo-crypto`, `expo-secure-store`, `expo-local-authentication`, `expo-screen-capture`, `expo-clipboard`, `expo-document-picker`, `expo-file-system`, `expo-sharing`, `expo-sqlite`, `react-native-purchases` ; natif : `org.bouncycastle:bcprov-jdk18on:1.80`.
