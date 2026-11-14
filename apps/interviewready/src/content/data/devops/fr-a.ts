import type { QuestionText, TextTable } from '@/types/content';

/** Questions DevOps 001-022 : Docker, Kubernetes, CI/CD, Git (partie). */
export const frA: TextTable<QuestionText> = {
  "ops-001": {
    question: "Quelle est la différence entre un conteneur et une machine virtuelle ?",
    intent: "Le recruteur vérifie que vous maîtrisez un concept fondamental du déploiement moderne.",
    expectedAnswer:
      "Une machine virtuelle émule un ordinateur complet : elle exécute son propre noyau de système d'exploitation au-dessus d'un hyperviseur. Elle est donc fortement isolée mais lourde, occupe plusieurs gigaoctets et met souvent plusieurs minutes à démarrer. Un conteneur embarque une application avec ses dépendances mais partage le noyau de l'hôte ; l'isolation repose sur des fonctionnalités du noyau comme les namespaces, qui séparent les processus, les réseaux et les systèmes de fichiers, et les cgroups, qui limitent le CPU et la mémoire. Les conteneurs sont donc beaucoup plus légers, démarrent en quelques secondes et peuvent être nombreux sur une même machine. La contrepartie est une isolation plus faible que celle d'une VM, ce qui explique que certaines plateformes exécutent les conteneurs dans des VM légères pour les charges de travail non fiables.",
    explanation:
      "Le partage du noyau est ce qui rend les conteneurs légers et rapides, et c'est aussi ce qui rend leur isolation plus faible que celle des VM.",
    tips: ["Mentionnez le noyau partagé, les namespaces et les cgroups.", "Comparez le temps de démarrage et la consommation de ressources."],
    commonMistakes: ["Dire que les conteneurs sont de petites machines virtuelles.", "Affirmer que les conteneurs sont aussi isolés que des VM."],
    followUpQuestions: ["Peut-on exécuter un conteneur Windows sur un hôte Linux ?", "À quoi servent les cgroups ?"],
  },
  "ops-002": {
    question: "Quelle est la différence entre une image Docker et un conteneur, et qu'est-ce qu'un Dockerfile ?",
    intent: "Le recruteur vérifie que vous connaissez le vocabulaire et le flux de travail de base de Docker.",
    expectedAnswer:
      "Une image Docker est un modèle en lecture seule composé de couches : un système d'exploitation de base, le runtime, les dépendances et l'application. Un conteneur est une instance en cours d'exécution d'une image, avec sa propre couche inscriptible, son processus et son réseau ; on peut lancer de nombreux conteneurs à partir de la même image. Un Dockerfile est la recette qui permet de construire une image : des instructions comme FROM pour choisir l'image de base, COPY pour ajouter des fichiers, RUN pour exécuter des commandes au moment du build, EXPOSE pour documenter les ports, et CMD ou ENTRYPOINT pour définir la commande exécutée au démarrage du conteneur. On construit avec docker build, on exécute avec docker run, et on pousse l'image vers un registre pour que d'autres environnements puissent l'utiliser.",
    explanation:
      "Les images sont construites une fois et s'exécutent partout ; les conteneurs sont des instances jetables. Cette séparation rend les déploiements reproductibles.",
    example: "FROM eclipse-temurin:21-jre\nCOPY target/app.jar /app/app.jar\nCMD [\"java\", \"-jar\", \"/app/app.jar\"]",
    tips: ["Utilisez l'analogie entre classe et instance.", "Citez les principales instructions d'un Dockerfile."],
    commonMistakes: ["Stocker des données importantes dans la couche inscriptible du conteneur.", "Confondre RUN et CMD."],
    followUpQuestions: ["Qu'est-ce qu'un registre de conteneurs ?", "Pourquoi les images sont-elles construites en couches ?"],
  },
  "ops-003": {
    question: "Quelles sont les bonnes pratiques pour écrire un Dockerfile ?",
    intent: "Le recruteur vérifie que vous construisez des images légères, rapides à construire et sécurisées.",
    expectedAnswer:
      "J'ordonne les instructions pour tirer parti du cache des couches : je copie les fichiers de dépendances, comme package.json ou pom.xml, et j'installe les dépendances avant de copier le code source, afin qu'une modification du code ne réinstalle pas tout. J'utilise une image de base officielle et légère avec un tag de version fixe, par exemple une image slim ou distroless, plutôt que latest. Un fichier .dockerignore exclut du contexte de build les fichiers inutiles comme .git, node_modules ou les secrets locaux. Je regroupe les commandes RUN liées et je nettoie les caches du gestionnaire de paquets dans la même couche. Le processus s'exécute avec un utilisateur non root. Les secrets ne sont jamais copiés dans l'image ni passés en arguments de build qui resteraient dans l'historique ; si nécessaire, les secrets de build sont montés avec BuildKit. J'utilise des builds multi-stage pour que les outils de compilation ne figurent pas dans l'image finale, et j'ajoute un HEALTHCHECK ou je m'appuie sur les sondes (probes) de l'orchestrateur.",
    explanation:
      "De bons Dockerfiles produisent des images légères, reproductibles et sécurisées, qui se reconstruisent rapidement grâce au cache.",
    tips: ["Expliquez l'ordre des instructions favorable au cache.", "Mentionnez les versions figées, l'utilisateur non root et .dockerignore."],
    commonMistakes: ["Utiliser le tag latest en production.", "Copier tout le dépôt avant d'installer les dépendances.", "Intégrer des secrets dans les images."],
    followUpQuestions: ["Comment analyseriez-vous une image pour y détecter des vulnérabilités ?", "Qu'est-ce qu'une image distroless ?"],
  },
  "ops-004": {
    question: "Qu'est-ce qu'un build Docker multi-stage, et pourquoi l'utiliser ?",
    intent: "Le recruteur vérifie que vous connaissez une technique clé pour produire des images de production légères.",
    expectedAnswer:
      "Un build multi-stage utilise plusieurs instructions FROM dans un même Dockerfile. Une première étape contient tout ce qui est nécessaire pour construire l'application, comme un JDK, Maven ou Node avec les dépendances de développement, et produit des artefacts tels qu'un jar ou des assets compilés. L'étape finale part d'une image runtime minimale et ne copie que ces artefacts avec COPY --from=build. Le résultat est une image beaucoup plus petite, avec moins de paquets, ce qui signifie des pulls plus rapides, une surface d'attaque réduite et moins de vulnérabilités signalées par les scanners. Cela garde aussi le build reproductible à l'intérieur de Docker, sans exiger d'outils sur la machine de CI.",
    explanation:
      "Séparer les dépendances de build et d'exécution est la principale raison pour laquelle une image peut passer de plusieurs gigaoctets à quelques dizaines de mégaoctets.",
    example: "FROM node:22 AS build\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\nFROM nginx:1.27-alpine\nCOPY --from=build /app/dist /usr/share/nginx/html",
    tips: ["Expliquez ce que contient chaque étape.", "Mentionnez les gains en taille et en sécurité."],
    commonMistakes: ["Livrer les compilateurs et les dépendances de test dans l'image de production."],
    followUpQuestions: ["Comment mettez-vous en cache les dépendances entre les builds en CI ?", "Peut-on cibler une étape précise lors du build ?"],
  },
  "ops-005": {
    question: "Comment les conteneurs communiquent-ils entre eux et persistent-ils leurs données ? À quoi sert Docker Compose ?",
    intent: "Le recruteur vérifie vos connaissances pratiques pour exécuter localement des applications multi-conteneurs.",
    expectedAnswer:
      "Les conteneurs connectés au même réseau Docker défini par l'utilisateur peuvent se joindre par le nom du conteneur ou du service, grâce au DNS interne de Docker : un conteneur d'API se connecte ainsi à une base de données via db:5432 plutôt que par une adresse IP. Les ports ne sont publiés sur l'hôte qu'en cas de besoin, avec -p 8080:80. Les conteneurs sont éphémères ; les données qui doivent survivre aux redémarrages vont donc dans des volumes, gérés par Docker, ou dans des bind mounts, qui associent un répertoire de l'hôte et sont pratiques en développement. Docker Compose décrit une application multi-conteneurs dans un fichier YAML : services, images ou builds, variables d'environnement, réseaux, volumes, dépendances et health checks. docker compose up démarre toute la stack, ce qui rend le développement local et les tests d'intégration reproductibles. depends_on avec une condition de santé permet d'attendre que la base de données soit prête.",
    explanation:
      "Les réseaux assurent la découverte de services, les volumes la persistance, et Compose relie le tout pour les environnements locaux.",
    tips: ["Mentionnez la résolution DNS par nom de service.", "Distinguez volumes et bind mounts.", "Expliquez la disponibilité avec les health checks."],
    commonMistakes: ["Stocker les données d'une base sans volume.", "Coder en dur les adresses IP des conteneurs."],
    followUpQuestions: ["Pourquoi depends_on seul ne suffit-il pas pour attendre une base de données ?", "Utiliseriez-vous Compose en production ?"],
  },
  "ops-006": {
    question: "Comment sécurisez-vous les conteneurs et les images de conteneurs ?",
    intent: "Le recruteur évalue vos pratiques de sécurité avancées sur l'ensemble du cycle de vie des conteneurs.",
    expectedAnswer:
      "Je raisonne sur la sécurité au moment du build, de la distribution et de l'exécution. Au build : des images de base minimales comme distroless ou basées sur Alpine, des versions ou des digests figés, des builds multi-stage, aucun secret dans les couches, et une analyse automatique des vulnérabilités en CI avec des outils comme Trivy ou Grype, qui fait échouer le build sur les problèmes critiques, avec un processus de mise à jour régulière des images de base. Pour la distribution : un registre privé avec contrôle d'accès, la signature des images avec Sigstore cosign et leur vérification au déploiement, ainsi qu'un SBOM (software bill of materials) pour savoir ce que contient chaque image. À l'exécution : un utilisateur non root, un système de fichiers racine en lecture seule, la suppression des capabilities Linux, jamais de mode privileged, des profils seccomp ou AppArmor, des limites de ressources pour éviter les dénis de service, et des network policies pour restreindre le trafic entre charges de travail. Dans Kubernetes, les Pod Security Standards et des admission controllers comme Kyverno ou OPA Gatekeeper appliquent ces règles automatiquement. Enfin, une surveillance à l'exécution, par exemple avec Falco, détecte les comportements suspects, comme un shell lancé dans un conteneur.",
    explanation:
      "La sécurité des conteneurs se construit en couches : réduire le contenu de l'image, contrôler sa provenance et restreindre ce qu'elle peut faire à l'exécution. Les profils avancés citent des mécanismes d'application, pas seulement de bonnes intentions.",
    tips: ["Structurez la réponse en build, distribution et exécution.", "Mentionnez l'analyse, la signature et les SBOM.", "Citez des outils d'application des règles pour Kubernetes."],
    commonMistakes: ["Exécuter des conteneurs en root avec le mode privileged.", "Analyser les images une seule fois sans jamais mettre à jour les images de base."],
    followUpQuestions: ["Qu'est-ce qu'un SBOM ?", "Comment géreriez-vous une vulnérabilité critique dans une image de base utilisée par 50 services ?"],
  },
  "ops-007": {
    question: "Un conteneur fonctionne sur votre machine mais plante sans cesse en production. Comment enquêtez-vous ?",
    intent: "Le recruteur évalue votre capacité avancée à diagnostiquer les différences d'environnement dans les applications conteneurisées.",
    expectedAnswer:
      "Je commencerais par réunir des éléments : les logs du conteneur, son code de sortie et les événements de l'orchestrateur, par exemple avec kubectl describe pod et kubectl logs --previous. Le code de sortie est un indice fort : 137 signifie généralement que le processus a été tué, souvent OOMKilled parce qu'il a dépassé sa limite mémoire, tandis que 1 indique en général une erreur applicative. Les causes fréquentes de différences sont : une configuration ou des secrets absents ou différents en production ; des limites mémoire plus basses que sur un portable, surtout pour la JVM ou Node si les réglages du heap ne tiennent pas compte du conteneur ; une architecture CPU différente, comme une image construite pour ARM sur un portable et exécutée sur des serveurs x86 ; des règles réseau qui empêchent l'accès à une base de données ou à une API externe ; des différences de système de fichiers, comme une racine en lecture seule ou l'absence de droits d'écriture pour un utilisateur non root ; et des problèmes de timing, comme une sonde de liveness qui tue une application lente à démarrer. La gestion des signaux compte aussi : si l'application tourne comme processus enfant d'un shell, elle peut ne pas recevoir SIGTERM et être tuée brutalement. Pour reproduire, j'exécuterais l'image de production exacte avec les mêmes variables d'environnement, limites et utilisateur, en local ou dans un environnement de staging. Je corrigerais ensuite la cause racine et ajouterais la vérification manquante au pipeline ou à la configuration de déploiement.",
    explanation:
      "Les codes de sortie, les événements et les différences d'environnement guident le diagnostic. Les réponses avancées couvrent les limites mémoire, l'architecture, les permissions, les sondes et les signaux.",
    tips: ["Commencez par les logs, le code de sortie et les événements.", "Listez les différences d'environnement classiques.", "Reproduisez avec l'image et les réglages exacts de production."],
    commonMistakes: ["Reconstruire l'image en local au lieu de tester l'image exacte de production.", "Augmenter les limites à l'aveugle sans comprendre la cause."],
    followUpQuestions: ["Que signifie le code de sortie 137 ?", "Comment vous assurez-vous qu'une application s'arrête proprement dans un conteneur ?"],
  },
  "ops-008": {
    question: "Qu'est-ce que Kubernetes, et que sont les Pods, les Deployments et les Services ?",
    intent: "Le recruteur vérifie que vous connaissez le vocabulaire Kubernetes de base nécessaire pour travailler avec des clusters.",
    expectedAnswer:
      "Kubernetes est une plateforme d'orchestration de conteneurs : vous décrivez l'état souhaité de votre application en YAML, et des contrôleurs travaillent en continu pour que le cluster y corresponde, en redémarrant les conteneurs défaillants, en plaçant les charges de travail sur les nœuds et en ajustant le nombre d'instances. Un Pod est la plus petite unité déployable : un ou plusieurs conteneurs qui partagent une adresse réseau et du stockage et sont planifiés ensemble. Les Pods sont éphémères et reçoivent une nouvelle adresse IP lorsqu'ils sont recréés. Un Deployment gère un ensemble de Pods identiques via un ReplicaSet, maintient le nombre demandé en fonctionnement et gère les rolling updates et les rollbacks. Un Service fournit un nom et une adresse IP stables devant un ensemble changeant de Pods sélectionnés par labels, et répartit le trafic entre eux.",
    explanation:
      "Le modèle déclaratif d'état souhaité et la séparation entre Pods, Deployments et Services sont les fondements de Kubernetes.",
    tips: ["Expliquez le modèle d'état souhaité.", "Dites pourquoi les Services sont nécessaires alors que les Pods changent."],
    commonMistakes: ["Créer des Pods isolés plutôt que des Deployments pour les applications.", "Penser qu'un Pod contient toujours exactement un conteneur."],
    followUpQuestions: ["Qu'est-ce qu'un namespace ?", "Quand utiliseriez-vous un StatefulSet ?"],
  },
  "ops-009": {
    question: "Comment fonctionne un rolling update dans Kubernetes, et comment revenir en arrière ?",
    intent: "Le recruteur vérifie vos connaissances en matière de déploiement sûr sur Kubernetes.",
    expectedAnswer:
      "Lorsque vous modifiez le template de Pod d'un Deployment, par exemple avec un nouveau tag d'image, Kubernetes crée un nouveau ReplicaSet et remplace progressivement les anciens Pods par les nouveaux. maxSurge contrôle combien de Pods supplémentaires peuvent être créés au-delà du nombre souhaité, et maxUnavailable combien peuvent être indisponibles pendant la mise à jour. Les nouveaux Pods ne reçoivent du trafic qu'une fois leur sonde de readiness validée : une version défectueuse bloque donc le déploiement au lieu de tout remplacer. Vous pouvez suivre la progression avec kubectl rollout status et revenir en arrière avec kubectl rollout undo, qui rétablit le ReplicaSet précédent. Pour une mise à jour sans accroc, l'application doit gérer un arrêt propre sur SIGTERM, l'ancienne et la nouvelle version doivent être compatibles avec le même schéma de base de données, et les sondes de readiness doivent être pertinentes.",
    explanation:
      "Les rolling updates ne sont sûrs qu'avec de bonnes sondes de readiness, un arrêt propre et des changements rétrocompatibles.",
    tips: ["Expliquez maxSurge et maxUnavailable.", "Insistez sur le rôle des sondes de readiness.", "Mentionnez les commandes de rollback."],
    commonMistakes: ["Utiliser le même tag d'image pour des versions différentes, si bien que Kubernetes ne détecte aucun changement.", "Déployer une modification de schéma incompatible avec l'ancienne version."],
    followUpQuestions: ["Comment mettriez-vous en place un canary release sur Kubernetes ?", "Que deviennent les requêtes en cours pendant une mise à jour ?"],
  },
  "ops-010": {
    question: "Quels sont les types de Services Kubernetes, et qu'est-ce qu'un Ingress ?",
    intent: "Le recruteur vérifie que vous savez comment le trafic atteint les applications, à l'intérieur comme à l'extérieur du cluster.",
    expectedAnswer:
      "Un Service ClusterIP, le type par défaut, expose les Pods sur une IP interne accessible uniquement depuis le cluster ; il sert à la communication entre services. Un Service NodePort ouvre un port sur chaque nœud, surtout utile pour les tests. Un Service LoadBalancer demande au fournisseur cloud de créer un load balancer externe pointant vers le Service. Un Service ExternalName associe un nom à un nom DNS externe. Un Ingress est un ensemble de règles de routage HTTP, par exemple router api.example.com/orders vers le service orders, pris en charge par un ingress controller comme NGINX ou un load balancer cloud ; il termine aussi le TLS, si bien qu'un seul point d'entrée externe peut servir de nombreux services. La Gateway API, plus récente, est un successeur plus expressif d'Ingress, avec des rôles plus clairs pour les équipes plateforme et applicatives.",
    explanation:
      "Les Services offrent un accès stable aux Pods ; Ingress ou la Gateway API assurent le routage HTTP et le TLS depuis l'extérieur du cluster.",
    tips: ["Décrivez chaque type de Service avec un cas d'usage.", "Expliquez le rôle de l'ingress controller."],
    commonMistakes: ["Créer un Service LoadBalancer pour chaque application, ce qui multiplie les coûts cloud."],
    followUpQuestions: ["Comment géreriez-vous automatiquement les certificats TLS ?", "Qu'est-ce que la Gateway API ?"],
  },
  "ops-011": {
    question: "Quelle est la différence entre les sondes (probes) de liveness, de readiness et de startup ?",
    intent: "Le recruteur vérifie que vous savez configurer correctement les health checks, une cause fréquente de pannes.",
    expectedAnswer:
      "Une sonde de readiness indique à Kubernetes si un Pod peut recevoir du trafic ; en cas d'échec, le Pod est retiré des endpoints du Service mais n'est pas redémarré, ce qui est utile pendant le démarrage ou lorsqu'une dépendance est temporairement indisponible. Une sonde de liveness indique si le conteneur est en bonne santé ; si elle échoue de manière répétée, le conteneur est redémarré, ce qui permet de sortir d'un deadlock. Une sonde de startup protège les applications lentes à démarrer : les vérifications de liveness et de readiness sont désactivées tant qu'elle n'a pas réussi, pour que l'application ne soit pas tuée pendant son démarrage. Une erreur courante consiste à faire dépendre la sonde de liveness de systèmes externes comme la base de données : si la base tombe, tous les Pods redémarrent en boucle et la panne s'aggrave. La liveness ne doit vérifier que le processus lui-même, tandis que la readiness peut refléter la capacité de l'instance à servir.",
    explanation:
      "Les sondes ont des conséquences différentes : retrait du trafic ou redémarrage. Une sonde de liveness mal configurée peut transformer un petit incident en panne en cascade.",
    tips: ["Indiquez ce qui se passe lorsque chaque sonde échoue.", "Mettez en garde contre les sondes de liveness qui dépendent de systèmes externes."],
    commonMistakes: ["Utiliser le même endpoint et les mêmes réglages pour la liveness et la readiness.", "Définir des délais de liveness plus courts que le temps de démarrage de l'application."],
    followUpQuestions: ["Que devrait vérifier un bon endpoint de readiness ?", "Comment les sondes interagissent-elles avec les rolling updates ?"],
  },
  "ops-012": {
    question: "Un Pod est en CrashLoopBackOff. Comment le diagnostiquez-vous ?",
    intent: "Le recruteur évalue votre capacité avancée et concrète à dépanner Kubernetes.",
    expectedAnswer:
      "CrashLoopBackOff signifie que le conteneur démarre, s'arrête et est redémarré avec des délais croissants. Je lancerais kubectl describe pod pour voir les événements, le dernier état, le code de sortie et la raison, comme OOMKilled ou Error, puis kubectl logs --previous pour lire la sortie du conteneur qui a planté, car le conteneur actuel n'a peut-être encore aucun log. Causes typiques : l'application échoue au démarrage à cause d'une configuration manquante, d'une clé de Secret ou de ConfigMap absente, ou d'une dépendance injoignable, comme le nom d'hôte d'une base de données ; la limite mémoire est trop basse ; la commande ou l'entrypoint est incorrect ; les permissions de fichiers échouent pour un utilisateur non root ; ou une sonde de liveness tue le conteneur avant la fin de son démarrage. Si l'image s'arrête trop vite pour être inspectée, je peux temporairement remplacer la commande pour la maintenir en vie, ou utiliser kubectl debug avec un conteneur éphémère pour examiner l'environnement, le réseau et les fichiers montés. Je vérifierais aussi si le problème a commencé avec un nouveau déploiement, et je ferais un rollback si des utilisateurs sont touchés, avant de corriger la cause racine et d'ajouter une validation, par exemple en vérifiant la configuration requise au démarrage avec un message d'erreur clair.",
    explanation:
      "La méthode est la suivante : événements et code de sortie, logs précédents, puis vérification de l'environnement avec les outils de débogage. Si des utilisateurs sont touchés, l'atténuation par rollback passe avant l'investigation approfondie.",
    tips: ["Mentionnez describe, logs --previous et les codes de sortie.", "Listez les causes de démarrage les plus courantes.", "Utilisez kubectl debug ou un remplacement de commande pour inspecter."],
    commonMistakes: ["Ne lire que les logs actuels, qui sont vides.", "Supprimer le Pod à répétition en espérant que cela fonctionne."],
    followUpQuestions: ["Qu'est-ce qu'un conteneur éphémère ?", "Comment validez-vous la configuration avant le déploiement ?"],
  },
  "ops-013": {
    question: "Comment fonctionnent les requests, les limits et l'autoscaling des ressources dans Kubernetes ?",
    intent: "Le recruteur vérifie votre maîtrise avancée de la gestion de capacité et de son effet sur la stabilité et les coûts.",
    expectedAnswer:
      "Une request est la quantité de CPU et de mémoire garantie à un conteneur ; le scheduler s'appuie sur les requests pour décider sur quel nœud placer un Pod. Une limit est le maximum que le conteneur peut utiliser. Dépasser la limite CPU provoque du throttling, qui ralentit l'application ; dépasser la limite mémoire entraîne l'arrêt du conteneur avec OOMKilled. Les Pods dont les requests sont égales aux limits obtiennent la classe de qualité de service Guaranteed et sont évincés en dernier en cas de pression sur le nœud. Beaucoup d'équipes fixent les requests mémoire égales aux limits pour plus de prévisibilité et restent prudentes avec les limits CPU, car le throttling peut dégrader la latence. Le Horizontal Pod Autoscaler ajoute ou retire des réplicas de Pods en fonction de métriques comme l'utilisation CPU rapportée aux requests, ou de métriques personnalisées comme la longueur d'une file ou le nombre de requêtes par seconde ; KEDA étend ce principe aux sources d'événements et au scaling à zéro. Le Vertical Pod Autoscaler recommande ou ajuste les requests. Le Cluster Autoscaler ou Karpenter ajoute des nœuds lorsque des Pods ne peuvent pas être planifiés. Les requests doivent reposer sur la consommation observée : trop basses, elles surchargent les nœuds et créent de l'instabilité ; trop hautes, elles gaspillent de l'argent.",
    explanation:
      "Les requests pilotent la planification, les limits l'application des contraintes, et les autoscalers ajustent réplicas et nœuds. Les profils avancés comprennent le throttling, la QoS et le dimensionnement fondé sur les données.",
    tips: ["Distinguez clairement requests et limits.", "Expliquez le throttling CPU par opposition à l'OOM mémoire.", "Citez les différents autoscalers et leur rôle."],
    commonMistakes: ["Ne définir aucune request, si bien que le scheduler surcharge les nœuds.", "Faire de l'autoscaling sur le CPU pour un service limité par les I/O."],
    followUpQuestions: ["Pourquoi les limits CPU peuvent-elles augmenter la latence ?", "Sur quelle métrique feriez-vous scaler un consommateur de file ?"],
  },
  "ops-014": {
    question: "Comment géreriez-vous la configuration, les secrets et les déploiements sur plusieurs environnements Kubernetes ?",
    intent: "Le recruteur évalue votre conception avancée de plateforme : GitOps, gestion des secrets et cohérence entre environnements.",
    expectedAnswer:
      "Je conserverais tous les manifestes dans Git comme source unique de vérité et utiliserais un outil GitOps comme Argo CD ou Flux pour les appliquer : le cluster converge en continu vers le contenu du dépôt, chaque changement est relu et traçable, et un rollback se résume à un git revert. Pour éviter de dupliquer le YAML, j'utiliserais des charts Helm ou des overlays Kustomize : une base commune avec des différences réduites et explicites par environnement, comme le nombre de réplicas, la taille des ressources et les endpoints. La configuration non sensible va dans des ConfigMaps. Les secrets ne doivent pas être stockés en clair dans Git ; par défaut, les Secrets Kubernetes sont seulement encodés en base64. J'utiliserais donc un coffre externe, comme le gestionnaire de secrets d'un fournisseur cloud ou Vault, synchronisé avec l'External Secrets Operator, ou je chiffrerais les secrets dans Git avec Sealed Secrets ou SOPS. J'activerais aussi le chiffrement au repos des Secrets dans le cluster et restreindrais l'accès avec RBAC. La promotion entre environnements se ferait en mettant à jour les tags d'image via des pull requests, idéalement automatisées depuis la CI, avec des contrôles de politiques et, pour la production, des étapes d'approbation. Les environnements deviennent ainsi reproductibles et la dérive est visible.",
    explanation:
      "GitOps apporte traçabilité et rollback, le templating garde les environnements cohérents, et la gestion externe des secrets évite les fuites d'identifiants. Ce sont des pratiques centrales des plateformes matures.",
    tips: ["Expliquez GitOps et ses avantages.", "Dites pourquoi des Secrets en base64 ne sont pas du chiffrement.", "Décrivez la promotion entre environnements."],
    commonMistakes: ["Appliquer les manifestes manuellement avec kubectl en production.", "Committer des secrets dans le dépôt."],
    followUpQuestions: ["Comment détectez-vous une dérive entre Git et le cluster ?", "Helm ou Kustomize : comment choisiriez-vous ?"],
  },
  "ops-015": {
    question: "Quelle est la différence entre intégration continue, livraison continue et déploiement continu ?",
    intent: "Le recruteur vérifie que vous maîtrisez un concept DevOps de base et son vocabulaire précis.",
    expectedAnswer:
      "L'intégration continue signifie que les développeurs fusionnent fréquemment de petits changements dans la branche principale, et que chaque changement est automatiquement construit et testé, afin de détecter rapidement les problèmes d'intégration. La livraison continue va plus loin : chaque changement qui passe le pipeline produit un artefact prêt à être livré, qui peut être déployé en production à tout moment, généralement après une approbation manuelle. Le déploiement continu va encore plus loin : chaque changement qui passe tous les contrôles est mis en production automatiquement, sans approbation manuelle. L'objectif des trois est d'avoir des changements petits, fréquents et peu risqués, ainsi qu'un retour rapide.",
    explanation:
      "La différence entre livraison continue et déploiement continu tient à l'approbation manuelle avant la production.",
    tips: ["Expliquez clairement la différence entre livraison et déploiement.", "Mentionnez les changements petits et fréquents."],
    commonMistakes: ["Employer livraison continue et déploiement continu comme des synonymes."],
    followUpQuestions: ["Quels prérequis faut-il pour le déploiement continu ?", "En quoi les feature flags sont-ils utiles ?"],
  },
  "ops-016": {
    question: "Quelles étapes incluriez-vous dans un bon pipeline CI/CD ?",
    intent: "Le recruteur vérifie votre capacité pratique à concevoir un pipeline et ses quality gates.",
    expectedAnswer:
      "Un pipeline typique commence par des contrôles rapides pour que les développeurs aient un retour immédiat : installation avec des dépendances en cache, lint, formatage et vérification des types, puis tests unitaires. Viennent ensuite le build de l'artefact ou de l'image de conteneur, les tests d'intégration, par exemple avec une vraie base de données dans un conteneur, et les contrôles de sécurité comme l'analyse des vulnérabilités des dépendances et des images et la détection de secrets. L'artefact est construit une seule fois, versionné et stocké dans un registre, puis promu d'un environnement à l'autre au lieu d'être reconstruit pour chacun. Le déploiement en environnement de test ou de staging est suivi de smoke tests ou de tests end-to-end sur les parcours critiques. La mise en production utilise une stratégie sûre, comme le rolling ou le canary, avec un rollback automatique si les health checks échouent. Dans tous les cas, le pipeline doit être défini en tant que code, rapide, fiable et fournir des messages d'échec clairs.",
    explanation:
      "Ordonner les contrôles du plus rapide au plus lent, construire une seule fois et promouvoir le même artefact sont les principes de conception clés.",
    tips: ["Ordonnez les étapes de la plus rapide à la plus lente.", "Mentionnez le principe « construire une fois, puis promouvoir ».", "Incluez des contrôles de sécurité."],
    commonMistakes: ["Reconstruire l'artefact séparément pour chaque environnement.", "Placer les tests end-to-end lents en premier."],
    followUpQuestions: ["Comment garderiez-vous un pipeline sous les dix minutes ?", "Où exécuteriez-vous les migrations de base de données ?"],
  },
  "ops-017": {
    question: "Comparez les déploiements rolling, blue-green et canary.",
    intent: "Le recruteur vérifie votre connaissance des stratégies de mise en production et de leurs profils de risque.",
    expectedAnswer:
      "Un déploiement rolling remplace progressivement les instances de l'ancienne version par la nouvelle ; il ne demande pas d'infrastructure supplémentaire, mais les deux versions tournent en même temps et un rollback implique un nouveau déploiement progressif. Le déploiement blue-green fait tourner deux environnements complets : la nouvelle version est déployée sur l'environnement inactif, testée, puis le trafic est basculé d'un coup, généralement au niveau du load balancer ; le rollback est instantané en rebasculant, mais l'infrastructure est doublée pendant la mise en production et les changements de base de données doivent être compatibles avec les deux versions. Un déploiement canary envoie une petite part du trafic, par exemple 5 %, vers la nouvelle version, surveille le taux d'erreurs et la latence, puis augmente progressivement ; il limite l'impact des bugs à quelques utilisateurs et fournit un vrai retour de production, mais il nécessite une bonne supervision et des outils de répartition du trafic comme un service mesh ou Argo Rollouts. Les feature flags complètent les trois stratégies en séparant le déploiement de la mise à disposition des fonctionnalités.",
    explanation:
      "Chaque stratégie arbitre entre coût, rapidité du rollback et exposition au risque. Les canary releases n'ont d'intérêt qu'avec une solide observabilité.",
    tips: ["Donnez un avantage et un coût pour chacune.", "Mentionnez la compatibilité de la base de données.", "Mentionnez les feature flags."],
    commonMistakes: ["Faire un canary release sans surveiller spécifiquement le canary.", "Oublier que les deux versions partagent la même base de données."],
    followUpQuestions: ["Comment automatiseriez-vous l'analyse d'un canary ?", "En quoi les feature flags diffèrent-ils des canary releases ?"],
  },
  "ops-018": {
    question: "Expliquez les principaux concepts de GitLab CI/CD.",
    intent: "Le recruteur vérifie votre connaissance pratique d'une plateforme de CI largement utilisée.",
    expectedAnswer:
      "Un pipeline GitLab est défini dans un fichier .gitlab-ci.yml à la racine du dépôt. Il se compose de jobs regroupés en stages ; les jobs d'un même stage s'exécutent en parallèle et les stages s'enchaînent dans l'ordre, mais needs permet à un job de démarrer dès que ses dépendances sont terminées, ce qui crée un graphe orienté plus rapide. Chaque job s'exécute sur un runner, qui peut être partagé, rattaché à un groupe ou auto-hébergé, souvent dans une image Docker définie par image. Les artifacts transmettent aux jobs suivants les fichiers produits par un job, comme une sortie de build ou un rapport de tests, et peuvent être téléchargés, tandis que le cache accélère les tâches répétées entre pipelines, comme le téléchargement des dépendances. Les rules déterminent quand un job s'exécute, par exemple uniquement sur les merge requests, sur la branche par défaut ou sur les tags. Les variables, y compris les variables CI/CD protégées et masquées pour les secrets, configurent les jobs. Les environments suivent les déploiements, et les jobs manuels associés à des environnements protégés fournissent des étapes d'approbation. Les templates et include permettent aux équipes de réutiliser les définitions de pipeline.",
    explanation:
      "Connaître les stages, les jobs, les runners, la différence entre artifacts et cache, ainsi que les rules, suffit pour lire et améliorer la plupart des pipelines GitLab.",
    example: "test:\n  stage: test\n  image: node:22\n  cache: { key: { files: [pnpm-lock.yaml] }, paths: [.pnpm-store] }\n  script: [pnpm install --frozen-lockfile, pnpm test]\n  rules:\n    - if: $CI_PIPELINE_SOURCE == \"merge_request_event\"",
    tips: ["Distinguez artifacts et cache.", "Mentionnez rules et needs.", "Expliquez comment les secrets sont stockés."],
    commonMistakes: ["Utiliser le cache pour transmettre des sorties de build entre jobs.", "Stocker des secrets directement dans .gitlab-ci.yml."],
    followUpQuestions: ["Comment fonctionnent les variables protégées ?", "Comment partageriez-vous un template de pipeline entre projets ?"],
  },
  "ops-019": {
    question: "Votre pipeline de CI dure 40 minutes. Comment l'accéléreriez-vous ?",
    intent: "Le recruteur vérifie votre capacité pratique à résoudre des problèmes de productivité des développeurs.",
    expectedAnswer:
      "Je commencerais par mesurer où passe le temps, en examinant la durée des jobs sur les pipelines récents, car quelques jobs dominent généralement. J'appliquerais ensuite les correctifs pertinents. Mettre en cache les dépendances en fonction du lockfile pour ne pas les télécharger à chaque fois. Utiliser le cache des couches Docker ou un cache de build distant. Exécuter les jobs indépendants en parallèle et utiliser des graphes de dépendances, comme needs dans GitLab, plutôt que des stages stricts. Découper les longues suites de tests en shards parallèles. N'exécuter que ce qui est affecté par un changement, ce que permettent des outils comme Nx, Turborepo ou Bazel dans les monorepos, tout en conservant une exécution complète sur la branche principale. Déplacer les tests end-to-end lents vers une étape ultérieure ou une exécution planifiée, et garder une petite suite de smoke tests sur chaque merge request. Utiliser des runners plus rapides ou à autoscaling si les machines sont le goulot d'étranglement. Supprimer les tests instables qui provoquent des relances. Après chaque changement, je suivrais la durée médiane et la durée maximale du pipeline pour confirmer l'amélioration.",
    explanation:
      "Mesurer d'abord, puis mettre en cache, paralléliser et n'exécuter que le travail affecté sont les principaux leviers. Des pipelines rapides améliorent directement la productivité de l'équipe.",
    tips: ["Commencez par la mesure.", "Mentionnez le cache, le parallélisme et l'exécution limitée aux projets affectés.", "Suivez l'amélioration dans le temps."],
    commonMistakes: ["Supprimer des tests pour accélérer le pipeline.", "Optimiser un job qui n'est pas sur le chemin critique."],
    followUpQuestions: ["Comment découpez-vous une suite de tests en shards ?", "Quel est le risque de n'exécuter que les tests affectés ?"],
  },
  "ops-020": {
    question: "Comment concevriez-vous la CI/CD d'un monorepo contenant de nombreux services ?",
    intent: "Le recruteur évalue votre architecture de pipeline avancée, à grande échelle et respectueuse de l'autonomie des équipes.",
    expectedAnswer:
      "Les objectifs principaux sont la rapidité, l'isolation entre équipes et la sécurité. Je détecterais les projets affectés par un changement à partir du graphe de dépendances du monorepo, avec des outils comme Nx, Turborepo, Bazel ou des règles basées sur les chemins : un changement sur un service ne construit et ne teste que ce service et les projets qui en dépendent, tandis qu'une modification d'une bibliothèque partagée déclenche ses dépendants. Une validation complète continuerait de tourner sur la branche principale ou de façon planifiée. Les étapes communes, comme le lint, les tests et le build des images, proviendraient de templates de pipeline partagés et versionnés, et chaque service conserverait sa propre configuration de déploiement, ses responsables et ses règles d'approbation, par exemple via CODEOWNERS. Chaque service serait versionné et déployé indépendamment, avec des tags de release qui identifient le service, comme orders-v1.4.0. Le cache distant des résultats de build et de tests accélère le travail des développeurs et de la CI. Je veillerais aussi à ce que les fichiers racine partagés, comme les lockfiles et la configuration de CI, aient un responsable clair et un processus de modification, car ils concernent toutes les équipes. L'observabilité de la durée et du taux d'échec des pipelines par projet aide à détecter les problèmes.",
    explanation:
      "La CI d'un monorepo fonctionne lorsqu'elle ne construit que ce qui a changé, partage des templates et garde des déploiements indépendants. Les réponses avancées traitent aussi la responsabilité des fichiers partagés.",
    tips: ["Expliquez la détection des projets affectés.", "Mentionnez les templates partagés et les déploiements indépendants.", "Abordez la responsabilité de la configuration partagée."],
    commonMistakes: ["Exécuter tous les tests de tous les projets à chaque commit.", "Déployer tous les services ensemble à chaque merge."],
    followUpQuestions: ["Comment gérez-vous un breaking change dans une bibliothèque partagée ?", "Qu'est-ce que le cache distant ?"],
  },
  "ops-021": {
    question: "Comment sécurisez-vous un pipeline CI/CD et la chaîne d'approvisionnement logicielle ?",
    intent: "Le recruteur évalue votre sensibilité avancée à la sécurité : les pipelines sont une cible de grande valeur pour les attaquants.",
    expectedAnswer:
      "Un pipeline compromis peut pousser du code malveillant en production ; je le traiterais donc comme une infrastructure critique. Les secrets doivent être stockés dans les variables protégées et masquées de la plateforme de CI ou dans un coffre externe, limités aux jobs et aux branches qui en ont besoin, et idéalement remplacés par des identifiants de courte durée via une fédération OIDC avec le fournisseur cloud plutôt que par des clés de longue durée. Les branches et tags protégés, les revues obligatoires et des droits restreints pour modifier les définitions de pipeline empêchent les changements non autorisés. Les merge requests provenant de forks ne doivent pas avoir accès aux secrets. Les runners de déploiement en production doivent être isolés et éphémères. Pour les dépendances, je figerais les versions avec des lockfiles, utiliserais des registres de confiance ou un proxy, et rechercherais les vulnérabilités connues et les paquets malveillants. Les builds doivent produire un SBOM, les artefacts et les images doivent être signés, par exemple avec cosign, avec des attestations de provenance suivant les recommandations SLSA, et les déploiements doivent vérifier les signatures. Les actions ou templates de CI tiers doivent être figés sur une version ou un commit précis. Enfin, des journaux d'audit et des alertes sur les activités inhabituelles des pipelines aident à détecter une compromission.",
    explanation:
      "La sécurité de la chaîne d'approvisionnement couvre les secrets, l'intégrité du code, les dépendances et la provenance des artefacts. Les profils avancés mentionnent les identifiants de courte durée, la signature et SLSA.",
    tips: ["Couvrez les secrets, les permissions, les dépendances et les artefacts.", "Mentionnez OIDC plutôt que des clés de longue durée.", "Expliquez la signature et la provenance."],
    commonMistakes: ["Donner à chaque job l'accès aux secrets de production.", "Utiliser des composants de CI tiers sans figer leur version."],
    followUpQuestions: ["Qu'est-ce que SLSA ?", "Comment la fédération OIDC supprime-t-elle le besoin de stocker des clés cloud ?"],
  },
  "ops-022": {
    question: "Quelle est la différence entre git merge et git rebase ?",
    intent: "Le recruteur vérifie une compétence Git essentielle et votre connaissance des conventions d'équipe.",
    expectedAnswer:
      "Les deux intègrent les changements d'une branche dans une autre. git merge crée un commit de merge qui réunit les deux historiques en conservant chaque commit exactement tel qu'il était ; l'historique montre quand les branches ont été combinées, mais il peut devenir encombré. git rebase déplace les commits de votre branche au-dessus de la branche cible en les réécrivant sous forme de nouveaux commits, ce qui produit un historique linéaire plus facile à lire. Comme le rebase réécrit l'historique, il ne faut pas rebaser des commits sur lesquels d'autres personnes ont déjà basé leur travail, comme une branche partagée, sauf accord de l'équipe. Une pratique courante consiste à rebaser votre propre branche de fonctionnalité sur main pour rester à jour, puis à la fusionner, parfois avec un squash merge pour conserver un seul commit propre par changement.",
    explanation:
      "Le merge préserve l'historique ; le rebase le réécrit pour le rendre linéaire. La règle d'or est de ne pas réécrire un historique partagé.",
    tips: ["Expliquez la règle d'or du rebase.", "Mentionnez le squash merge comme option d'équipe."],
    commonMistakes: ["Faire un force-push d'une branche partagée rebasée sans prévenir ses collègues."],
    followUpQuestions: ["Que permet de faire un rebase interactif ?", "Qu'est-ce qu'un merge fast-forward ?"],
  },
};
