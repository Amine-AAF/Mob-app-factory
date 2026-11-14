import type { QuestionText, TextTable } from '@/types/content';

/** Questions DevOps 023-045 : Git (partie), cloud, supervision, sécurité. */
export const frB: TextTable<QuestionText> = {
  "ops-023": {
    question: "Comparez GitFlow et le trunk-based development.",
    intent: "Le recruteur vérifie votre connaissance des stratégies de branches et de leur impact sur la vitesse de livraison et le travail en équipe.",
    expectedAnswer:
      "GitFlow repose sur des branches de longue durée : main pour le code publié, develop pour l'intégration, ainsi que des branches feature, release et hotfix. Il convient aux produits avec des versions planifiées et plusieurs versions maintenues en parallèle, mais les branches vivent longtemps, les fusions sont plus volumineuses et les problèmes d'intégration apparaissent tardivement. Le trunk-based development conserve une seule branche principale : les développeurs fusionnent de petites modifications au moins une fois par jour, via des branches éphémères et des pull requests ou en commitant directement, et les fonctionnalités inachevées sont masquées derrière des feature flags. Cette approche permet l'intégration et la livraison continues, des revues plus petites et moins de conflits de fusion, mais exige de bons tests automatisés et de la discipline. La plupart des équipes pratiquant la livraison continue préfèrent le trunk-based development, parfois avec des branches de release lorsqu'elles doivent maintenir d'anciennes versions.",
    explanation:
      "La différence essentielle tient à la durée de vie des branches. Des branches éphémères signifient une intégration plus précoce et moins de fusions douloureuses.",
    tips: ["Décrivez les branches de chaque modèle.", "Reliez le trunk-based development aux feature flags et à la CI."],
    commonMistakes: ["Garder des branches de fonctionnalité ouvertes pendant des semaines et appeler cela de l'intégration continue."],
    followUpQuestions: ["Comment les feature flags facilitent-ils le trunk-based development ?", "Dans quels cas GitFlow reste-t-il pertinent ?"],
  },
  "ops-024": {
    question: "Comment gérez-vous les conflits de fusion et comment écrivez-vous de bons commits ?",
    intent: "Le recruteur vérifie vos habitudes de collaboration au quotidien avec Git.",
    expectedAnswer:
      "Pour limiter les conflits, je garde des branches de courte durée, je fais régulièrement un pull ou un rebase depuis main et j'évite les modifications volumineuses sans rapport entre elles, comme un reformatage massif mélangé à des fonctionnalités. Lorsqu'un conflit survient, je lis les deux versions pour comprendre l'intention de chaque modification, plutôt que d'en choisir une au hasard, je le résous, je lance les tests et, si le conflit touche du code que je connais mal, je consulte l'autre auteur. Pour les commits, je fais de petits commits ciblés qui font chacun une seule chose et laissent le build fonctionnel, avec un message clair : un résumé court à l'impératif, par exemple « Fix rounding in invoice totals », et un corps qui explique le pourquoi lorsqu'il n'est pas évident. De nombreuses équipes suivent les Conventional Commits, comme feat: ou fix:, ce qui permet aussi de générer automatiquement les changelogs et les numéros de version.",
    explanation:
      "Un bon historique facilite les revues, le débogage avec git bisect et l'annulation sûre des modifications. Comprendre les deux côtés d'un conflit évite de perdre du travail.",
    tips: ["Expliquez comment vous résolvez les conflits en toute sécurité.", "Donnez un exemple de bon message de commit."],
    commonMistakes: ["Résoudre les conflits en choisissant toujours « ours » sans lire l'autre modification.", "Des messages de commit comme « fix » ou « wip » sur des branches partagées."],
    followUpQuestions: ["Que sont les Conventional Commits ?", "Comment découpez-vous une modification volumineuse en commits faciles à relire ?"],
  },
  "ops-025": {
    question: "Comment annuler des modifications dans Git ? Expliquez revert, reset et reflog.",
    intent: "Le recruteur vérifie votre capacité à récupérer d'une erreur en toute sécurité.",
    expectedAnswer:
      "git revert crée un nouveau commit qui annule les modifications d'un commit précédent ; l'historique est préservé, c'est donc le choix sûr sur des branches partagées comme main. git reset déplace le pointeur de la branche courante vers un autre commit : avec --soft, les modifications annulées restent indexées (staged) ; avec --mixed, l'option par défaut, elles restent dans le répertoire de travail ; et avec --hard, elles sont supprimées. Reset réécrit l'historique et ne doit être utilisé que sur des branches locales ou privées. git restore annule les modifications non commitées dans les fichiers. git reflog enregistre les positions récentes de HEAD et des branches, même après des resets ou des rebases, ce qui permet de retrouver un commit « perdu » et de le récupérer avec git reset ou git branch. Les commits sont rarement perdus définitivement tant que le garbage collector n'a pas supprimé les objets inaccessibles, généralement après plusieurs semaines.",
    explanation:
      "Revert pour l'historique partagé, reset pour l'historique local, reflog pour récupérer. Ces connaissances transforment les erreurs Git en incidents mineurs.",
    tips: ["Opposez revert et reset selon leur effet sur l'historique partagé.", "Mentionnez reflog pour la récupération."],
    commonMistakes: ["Utiliser git reset --hard sur une branche partagée puis faire un force push.", "Penser qu'un commit annulé par reset est perdu à jamais."],
    followUpQuestions: ["Comment annuleriez-vous un commit de fusion ?", "Contre quoi git push --force-with-lease protège-t-il ?"],
  },
  "ops-026": {
    question: "Quels sont les avantages et les inconvénients d'un monorepo par rapport à plusieurs dépôts ?",
    intent: "Le recruteur vérifie votre jugement architectural sur l'organisation du code à l'échelle d'une équipe.",
    expectedAnswer:
      "Un monorepo regroupe de nombreux projets dans un seul dépôt. Avantages : le code et l'outillage partagés sont faciles à réutiliser, une modification touchant plusieurs projets peut être faite de manière atomique dans une seule pull request, les versions des dépendances restent cohérentes et le refactoring au-delà des frontières entre projets est plus simple. Inconvénients : le dépôt peut devenir volumineux et lent sans outils adaptés, la CI doit être assez intelligente pour ne construire que ce qui a changé, le contrôle d'accès est moins fin, et les fichiers partagés comme les lockfiles ou les configurations racines deviennent des points de friction entre équipes. Plusieurs dépôts, ou polyrepo, offrent une forte isolation, des permissions indépendantes et une CI simple par dépôt, mais partager du code nécessite de publier des packages, les modifications coordonnées entre dépôts sont plus difficiles et les versions divergent. Le choix dépend de la taille des équipes, du couplage entre les projets et de l'outillage que l'organisation peut maintenir, comme Nx, Turborepo ou Bazel pour les monorepos.",
    explanation:
      "Aucune approche n'est universellement meilleure : le compromis oppose facilité de coordination et isolation, et dépend fortement de l'outillage.",
    tips: ["Donnez les avantages et les inconvénients des deux approches.", "Mentionnez l'outillage et la responsabilité des fichiers partagés."],
    commonMistakes: ["Choisir un monorepo sans outillage pour ne construire que les projets affectés.", "Éclater du code fortement couplé en de nombreux dépôts."],
    followUpQuestions: ["Comment garder une CI rapide dans un monorepo ?", "Comment gérez-vous la responsabilité du code dans un monorepo ?"],
  },
  "ops-027": {
    question: "Quelqu'un a commité un secret, par exemple une clé d'API, et l'a poussé sur un dépôt partagé. Que faites-vous ?",
    intent: "Le recruteur évalue votre maîtrise avancée de la réponse aux incidents, votre connaissance de l'historique Git et vos priorités en matière de sécurité.",
    expectedAnswer:
      "La première priorité est de considérer le secret comme compromis, car il a pu être copié en quelques minutes par des bots qui scannent les dépôts publics, ou par toute personne ayant accès au dépôt. Je révoquerais ou ferais tourner immédiatement l'identifiant chez le fournisseur et le remplacerais dans les systèmes qui l'utilisent, puis je consulterais les journaux du fournisseur pour détecter tout usage non autorisé pendant la période d'exposition. Supprimer le secret du dernier commit ne suffit pas, puisqu'il reste dans l'historique. Si nécessaire, par exemple pour un dépôt public, je réécrirais l'historique avec git filter-repo ou BFG pour le supprimer, ferais un force push en coordination avec l'équipe, demanderais à chacun de recloner ou de réinitialiser son dépôt local, et demanderais à la plateforme d'hébergement de purger les vues en cache et les références des pull requests. Je documenterais l'incident et son impact. Pour éviter qu'il se reproduise, j'ajouterais une détection de secrets dans des hooks pre-commit et dans la CI, avec par exemple gitleaks ou la push protection de la plateforme, je déplacerais les secrets dans un coffre-fort (vault) ou dans des variables de CI, et j'ajouterais au .gitignore des motifs pour les fichiers de configuration locaux.",
    explanation:
      "La rotation passe en premier ; le nettoyage de l'historique est secondaire. Les candidats avancés savent qu'un commit supprimé ne supprime pas l'exposition et ajoutent des contrôles préventifs.",
    tips: ["Commencez par la révocation et la rotation du secret.", "Expliquez pourquoi supprimer le fichier ne suffit pas.", "Ajoutez des mesures de prévention."],
    commonMistakes: ["Se contenter de supprimer le fichier dans un nouveau commit.", "Réécrire l'historique avant d'avoir fait tourner l'identifiant."],
    followUpQuestions: ["Comment fonctionne la push protection pour les secrets ?", "Comment vérifieriez-vous si la clé a été utilisée par un attaquant ?"],
  },
  "ops-028": {
    question: "Que sont l'IaaS, le PaaS, le SaaS et le serverless ?",
    intent: "Le recruteur vérifie votre connaissance des modèles de services cloud de base et du partage des responsabilités.",
    expectedAnswer:
      "Ces modèles décrivent ce que le fournisseur gère pour vous. Avec l'Infrastructure as a Service, comme les machines virtuelles AWS EC2 ou Azure VMs, le fournisseur gère le matériel et la virtualisation, et vous gérez le système d'exploitation, le runtime et l'application. Avec le Platform as a Service, comme Heroku, Google App Engine ou les bases de données managées, vous déployez du code ou utilisez un service, et le fournisseur gère les serveurs, les correctifs et la montée en charge. Avec le Software as a Service, comme Gmail ou Salesforce, vous utilisez simplement une application finie. Le serverless, comme AWS Lambda ou Cloud Functions, exécute votre code en réponse à des événements, s'adapte automatiquement à la charge, y compris jusqu'à zéro, et facture à l'exécution. Plus le fournisseur en gère, moins vous avez de contrôle, mais moins vous avez de travail d'exploitation. La sécurité suit un modèle de responsabilité partagée.",
    explanation:
      "Chaque modèle déplace les responsabilités entre vous et le fournisseur. Le comprendre aide à choisir les services et à répartir les obligations de sécurité.",
    tips: ["Donnez un exemple par modèle.", "Mentionnez le modèle de responsabilité partagée."],
    commonMistakes: ["Penser que le fournisseur cloud est responsable de toute la sécurité."],
    followUpQuestions: ["Quels sont les inconvénients des fonctions serverless ?", "Qu'est-ce qu'un cold start ?"],
  },
  "ops-029": {
    question: "Que sont les régions et les zones de disponibilité, et comment concevez-vous une architecture hautement disponible ?",
    intent: "Le recruteur vérifie les notions fondamentales de résilience dans le cloud.",
    expectedAnswer:
      "Une région est une zone géographique, comme Francfort ou la Virginie, qui contient plusieurs zones de disponibilité. Une zone de disponibilité est constituée d'un ou plusieurs centres de données disposant d'une alimentation électrique, d'un refroidissement et d'un réseau indépendants, suffisamment proches pour offrir une faible latence entre zones. Pour rendre une application hautement disponible, j'exécuterais plusieurs instances réparties sur au moins deux ou trois zones derrière un load balancer, j'utiliserais des bases de données managées avec un réplica de secours dans une autre zone et une bascule automatique, et je stockerais les fichiers dans des services répliqués entre zones, comme le stockage objet. L'application doit être sans état (stateless), avec les sessions conservées dans un stockage partagé, pour que n'importe quelle instance puisse traiter n'importe quelle requête. Un déploiement multirégion protège contre la panne complète d'une région, mais il est bien plus complexe et coûteux ; on le réserve donc aux systèmes critiques.",
    explanation:
      "Répartir les ressources entre plusieurs zones protège contre les pannes de centre de données pour un coût modéré. Le multirégion est un investissement plus important, justifié par les besoins métier.",
    tips: ["Expliquez la différence entre régions et zones.", "Mentionnez les load balancers, les instances sans état et la bascule de base de données."],
    commonMistakes: ["Exécuter toutes les instances dans une seule zone.", "Conserver les sessions utilisateur dans la mémoire d'un seul serveur."],
    followUpQuestions: ["Quelle est la différence entre haute disponibilité et reprise après sinistre ?", "Comment fonctionne la bascule d'une base de données ?"],
  },
  "ops-030": {
    question: "Comment concevriez-vous une application web scalable sur une plateforme cloud ?",
    intent: "Le recruteur vérifie votre capacité de conception système à partir des briques cloud courantes.",
    expectedAnswer:
      "Je placerais un CDN en frontal pour servir les ressources statiques et mettre le contenu en cache au plus près des utilisateurs, puis un load balancer répartissant le trafic vers des instances applicatives sans état, en conteneurs ou sur une plateforme managée, réparties sur plusieurs zones de disponibilité avec un autoscaling basé sur la charge. Les données résideraient dans une base relationnelle managée avec une instance de secours et des réplicas en lecture, complétée par un cache comme Redis pour les lectures fréquentes et les sessions. Les fichiers iraient dans un stockage objet comme S3. Les traitements lents ou irréguliers, comme l'envoi d'e-mails ou la génération de rapports, seraient exécutés de façon asynchrone via une file de messages et des instances workers. Les secrets proviendraient d'un gestionnaire de secrets, l'infrastructure serait définie en code, et les logs, métriques et traces seraient centralisés avec des alertes. Je commencerais simplement et n'ajouterais des composants comme des files ou des réplicas que lorsque le trafic ou les exigences le justifient, en estimant les coûts dès le départ.",
    explanation:
      "Calcul sans état, services de données managés, cache, files de messages et observabilité sont les briques standard des architectures cloud scalables.",
    tips: ["Décrivez le parcours d'une requête de l'utilisateur jusqu'à la base de données.", "Mentionnez le traitement asynchrone.", "Montrez de la retenue face à la complexité."],
    commonMistakes: ["Concevoir pour une échelle massive dès le premier jour sans besoin réel.", "Conserver de l'état sur les serveurs applicatifs."],
    followUpQuestions: ["Comment géreriez-vous un pic soudain de trafic dix fois supérieur à la normale ?", "Où placeriez-vous la limitation de débit (rate limiting) ?"],
  },
  "ops-031": {
    question: "Qu'est-ce que l'Infrastructure as Code, et comment fonctionne Terraform ?",
    intent: "Le recruteur vérifie votre connaissance des pratiques d'infrastructure modernes et des outils associés.",
    expectedAnswer:
      "L'Infrastructure as Code consiste à définir les serveurs, réseaux, bases de données et permissions dans des fichiers versionnés plutôt que de les créer manuellement dans une console. Les modifications sont relues dans des pull requests, reproductibles d'un environnement à l'autre et documentées par le code lui-même. Terraform est un outil déclaratif : vous décrivez les ressources souhaitées en HCL, terraform plan les compare avec l'état actuel et affiche ce qui sera créé, modifié ou détruit, et terraform apply applique les modifications via les API des providers. Terraform conserve un fichier d'état (state) qui fait correspondre votre configuration aux ressources réelles ; en équipe, il doit être stocké à distance, par exemple dans un bucket S3 ou dans Terraform Cloud, avec un verrouillage pour empêcher les modifications concurrentes, et il peut contenir des valeurs sensibles. Les modules encapsulent de l'infrastructure réutilisable, et un état séparé par environnement limite l'impact des erreurs. OpenTofu est un fork open source qui suit le même modèle.",
    explanation:
      "L'IaC applique les pratiques du développement logiciel à l'infrastructure. Comprendre plan, apply et la gestion de l'état est indispensable pour utiliser Terraform en toute sécurité.",
    tips: ["Expliquez plan et apply.", "Insistez sur l'état distant avec verrouillage.", "Mentionnez les modules et la séparation des environnements."],
    commonMistakes: ["Commiter le fichier d'état dans Git.", "Faire des modifications manuelles dans la console qui divergent du code."],
    followUpQuestions: ["Comment gérez-vous la dérive (drift) entre Terraform et la réalité ?", "Comment importeriez-vous une ressource existante ?"],
  },
  "ops-032": {
    question: "Comment réduiriez-vous les coûts cloud d'un système sans nuire à sa fiabilité ?",
    intent: "Le recruteur évalue votre sensibilité avancée aux coûts, une responsabilité clé dans les environnements cloud.",
    expectedAnswer:
      "Je commencerais par la visibilité : étiqueter (tagger) les ressources par équipe, service et environnement pour pouvoir attribuer les coûts, puis examiner les postes les plus importants, qui représentent généralement l'essentiel de la facture. Leviers d'économie courants : dimensionner correctement les instances et les requests des conteneurs selon l'usage réel ; arrêter ou réduire les environnements hors production en dehors des heures de travail ; supprimer les ressources inutilisées, comme les load balancers inactifs, les disques orphelins, les anciens snapshots et les environnements de test oubliés ; utiliser l'autoscaling pour que la capacité suive la demande ; s'engager sur la consommation de base stable avec des instances réservées ou des savings plans, et utiliser des instances spot ou préemptibles pour les charges tolérantes aux pannes comme les traitements batch ou les runners de CI ; déplacer les données rarement consultées vers des classes de stockage moins chères grâce à des politiques de cycle de vie ; réduire les coûts de transfert de données, souvent négligés, en gardant le trafic au sein d'une zone ou d'une région et en utilisant un CDN ; et revoir la rétention des logs et de la supervision, qui peut coûter étonnamment cher. Je définirais des budgets et des alertes d'anomalie, et ferais du coût une métrique visible par les équipes, selon les pratiques FinOps. Chaque changement doit être vérifié au regard des objectifs de fiabilité : par exemple, je ne supprimerais pas la redondance multizone d'une base de données critique pour faire des économies.",
    explanation:
      "L'optimisation des coûts est continue et pilotée par les données. Les candidats avancés connaissent les postes de coûts moins visibles, comme le transfert de données et l'observabilité, et mettent en balance économies et fiabilité.",
    tips: ["Commencez par le tagging et la visibilité.", "Citez plusieurs leviers concrets.", "Expliquez comment vous préservez la fiabilité."],
    commonMistakes: ["Réduire la redondance de systèmes critiques pour faire des économies.", "Optimiser de petits postes en ignorant les coûts les plus importants."],
    followUpQuestions: ["Qu'est-ce que le FinOps ?", "Dans quels cas les instances spot sont-elles une mauvaise idée ?"],
  },
  "ops-033": {
    question: "Comment concevriez-vous la reprise après sinistre d'une application critique ? Expliquez le RPO et le RTO.",
    intent: "Le recruteur évalue votre maîtrise avancée de la planification de la résilience et de son lien avec les exigences métier.",
    expectedAnswer:
      "Le Recovery Point Objective, ou RPO, est la perte de données maximale acceptable, mesurée en temps, par exemple 5 minutes de transactions. Le Recovery Time Objective, ou RTO, est le délai maximal acceptable pour rétablir le service, par exemple une heure. Les deux sont fixés par le métier, en fonction du coût de l'indisponibilité et de la perte de données, et orientent la conception. Les stratégies vont de la moins chère à la plus coûteuse : la sauvegarde et restauration, avec des sauvegardes régulières copiées dans une autre région, offre un RPO et un RTO de l'ordre de quelques heures ; le pilot light conserve une copie minimale de l'infrastructure et des données répliquées dans une seconde région, prête à monter en charge ; le warm standby fait tourner une copie plus petite mais fonctionnelle ; et l'actif-actif exploite la pleine capacité dans plusieurs régions avec un RPO et un RTO proches de zéro, au prix d'un coût et d'une complexité élevés, notamment pour la cohérence des données. Quelle que soit la stratégie, les sauvegardes doivent être automatisées, chiffrées, stockées séparément et immuables pour résister aux rançongiciels ou aux suppressions accidentelles, et l'infrastructure doit être reproductible grâce à l'Infrastructure as Code. Surtout, le plan doit être testé régulièrement par des tests de restauration et des exercices de bascule, car une sauvegarde non testée n'est pas une sauvegarde. Des runbooks, une autorité de décision claire pour déclarer un sinistre et des procédures de bascule DNS ou du trafic complètent le plan.",
    explanation:
      "Le RPO et le RTO traduisent les besoins métier en choix techniques. Les candidats avancés insistent sur les tests réguliers et les sauvegardes immuables.",
    tips: ["Définissez le RPO et le RTO avec des exemples.", "Comparez les stratégies de reprise selon leur coût.", "Insistez sur les tests de restauration."],
    commonMistakes: ["Disposer de sauvegardes qui n'ont jamais été restaurées lors d'un test.", "Stocker les sauvegardes dans le même compte et la même région que la production."],
    followUpQuestions: ["À quelle fréquence testeriez-vous la bascule ?", "Comment gérez-vous la cohérence des données dans une configuration actif-actif ?"],
  },
  "ops-034": {
    question: "Quelle est la différence entre les logs, les métriques et les traces ?",
    intent: "Le recruteur vérifie les notions de base de l'observabilité.",
    expectedAnswer:
      "Les logs sont des enregistrements horodatés d'événements, comme une erreur avec sa stack trace ou la connexion d'un utilisateur ; ils fournissent un détail riche sur chaque événement. Les métriques sont des mesures numériques agrégées dans le temps, comme le nombre de requêtes par seconde, le taux d'erreur, les percentiles de latence ou l'utilisation mémoire ; elles sont peu coûteuses à stocker et idéales pour les tableaux de bord et les alertes. Les traces suivent une requête unique à travers plusieurs services, en montrant chaque étape, appelée span, et sa durée, ce qui aide à trouver où le temps est passé ou où une erreur a démarré dans un système distribué. Ensemble, ils forment les trois piliers de l'observabilité : les métriques indiquent qu'un problème existe, les traces montrent où il se situe et les logs expliquent pourquoi.",
    explanation:
      "Chaque signal répond à une question différente. Les utiliser ensemble accélère le diagnostic.",
    tips: ["Donnez un exemple de chaque signal.", "Expliquez comment ils se complètent."],
    commonMistakes: ["S'appuyer uniquement sur les logs pour tout.", "Utiliser des moyennes plutôt que des percentiles pour la latence."],
    followUpQuestions: ["Pourquoi utiliser la latence p95 ou p99 plutôt que des moyennes ?", "Qu'est-ce qu'OpenTelemetry ?"],
  },
  "ops-035": {
    question: "Que superviseriez-vous pour un service web ? Expliquez les golden signals.",
    intent: "Le recruteur vérifie votre capacité à choisir des métriques pertinentes plutôt qu'à tout collecter.",
    expectedAnswer:
      "Je commencerais par les quatre golden signals issus des pratiques de Site Reliability Engineering de Google. La latence : la durée des requêtes, mesurée avec des percentiles comme p50, p95 et p99, en distinguant les requêtes réussies et les requêtes en échec. Le trafic : la demande sur le système, par exemple le nombre de requêtes par seconde. Les erreurs : le taux de requêtes en échec, y compris les HTTP 5xx et les réponses techniquement réussies mais incorrectes. La saturation : le niveau de remplissage du système, comme le CPU, la mémoire, les pools de connexions, la longueur des files d'attente ou le disque. La méthode RED, pour rate, errors et duration, applique la même idée à chaque service, et la méthode USE, pour utilisation, saturation et errors, l'applique aux ressources. En complément, je suivrais des métriques métier, comme les commandes par minute ou les inscriptions, qui révèlent souvent des problèmes que les métriques techniques ne voient pas, ainsi que les dépendances, comme la latence de la base de données et des API externes.",
    explanation:
      "Un petit ensemble de métriques centrées sur l'utilisateur détecte la plupart des problèmes. Les métriques métier comblent l'écart entre la santé technique et l'impact réel.",
    tips: ["Citez les quatre golden signals.", "Mentionnez RED et USE.", "Ajoutez des métriques métier."],
    commonMistakes: ["Superviser uniquement le CPU et la mémoire.", "Utiliser la latence moyenne, qui masque les requêtes lentes."],
    followUpQuestions: ["Sur lesquels de ces signaux déclencheriez-vous des alertes ?", "Comment superviseriez-vous un traitement en arrière-plan ?"],
  },
  "ops-036": {
    question: "Que sont la journalisation structurée et les identifiants de corrélation, et pourquoi sont-ils importants ?",
    intent: "Le recruteur vérifie les pratiques qui rendent les logs utiles dans les systèmes distribués.",
    expectedAnswer:
      "La journalisation structurée écrit les logs sous forme de données clé-valeur, généralement en JSON, plutôt qu'en texte libre : par exemple {\"level\":\"error\",\"event\":\"payment_failed\",\"orderId\":\"42\",\"provider\":\"stripe\",\"durationMs\":830}. Les plateformes de logs peuvent alors filtrer, agréger et déclencher des alertes sur les champs de manière fiable. Un identifiant de corrélation, ou trace ID, est un identifiant unique attribué lorsqu'une requête entre dans le système et propagé à chaque service, message et ligne de log qu'elle traverse, généralement via des en-têtes HTTP comme l'en-tête W3C traceparent. Lorsqu'un utilisateur signale un problème, vous pouvez rechercher un seul identifiant et voir tout le parcours à travers les services. OpenTelemetry standardise cette propagation et relie logs, traces et métriques. Les logs doivent utiliser des noms de champs cohérents et des niveaux appropriés, et ne jamais contenir de secrets ni de données personnelles inutiles.",
    explanation:
      "La structure rend les logs interrogeables ; les identifiants de corrélation permettent de les suivre d'un service à l'autre. Les deux sont indispensables dès qu'on dépasse une application unique.",
    example: "logger.info(\"order_created\", { orderId, customerId, totalCents, traceId });",
    tips: ["Montrez un exemple de log structuré.", "Expliquez la propagation de l'identifiant entre les services.", "Mentionnez la protection des données personnelles dans les logs."],
    commonMistakes: ["Journaliser des mots de passe, des tokens ou des numéros de carte complets.", "Construire des messages de log par concaténation de chaînes, impossibles à filtrer."],
    followUpQuestions: ["Comment propagez-vous un trace ID à travers une file de messages ?", "Comment maîtrisez-vous les coûts de journalisation ?"],
  },
  "ops-037": {
    question: "Qu'est-ce qu'une bonne alerte, et comment éviter la fatigue d'alerte ?",
    intent: "Le recruteur vérifie votre maturité opérationnelle et votre considération pour les ingénieurs d'astreinte.",
    expectedAnswer:
      "Une bonne alerte est actionnable : elle signale un impact réel ou imminent sur les utilisateurs et exige que quelqu'un agisse immédiatement. Elle doit porter sur des symptômes, comme un taux d'erreur ou une latence élevés sur un endpoint clé, plutôt que sur chaque cause possible, comme un CPU à 80 %, qui peut être sans conséquence. Chaque alerte doit fournir du contexte : le service concerné, la valeur actuelle et le seuil, un lien vers un tableau de bord et un runbook décrivant les premières actions. Des niveaux de sévérité séparent les pages urgentes, qui réveillent quelqu'un, des tickets qui peuvent attendre les heures ouvrées. Pour éviter la fatigue, je revois régulièrement les alertes, je supprime ou j'ajuste celles qui se déclenchent sans action, je regroupe les alertes liées, j'exige qu'une condition dure quelques minutes avant le déclenchement pour éviter le bruit des pics brefs, et je suis la fréquence de déclenchement de chaque alerte. Après les incidents, je vérifie si les alertes ont détecté le problème suffisamment tôt.",
    explanation:
      "Les alertes se disputent l'attention humaine. Des alertes actionnables, fondées sur les symptômes et accompagnées de runbooks, protègent à la fois la fiabilité et l'équipe d'astreinte.",
    tips: ["Distinguez les symptômes des causes.", "Mentionnez les runbooks et les niveaux de sévérité.", "Expliquez comment vous revoyez les alertes bruyantes."],
    commonMistakes: ["Appeler les gens pour des problèmes non urgents.", "Avoir des alertes sans aucune réponse documentée."],
    followUpQuestions: ["Que mettriez-vous dans un runbook ?", "Comment organiseriez-vous une rotation d'astreinte équitable ?"],
  },
  "ops-038": {
    question: "Expliquez les SLI, les SLO et les budgets d'erreur, et comment ils orientent les décisions.",
    intent: "Le recruteur évalue votre maîtrise avancée de l'ingénierie de la fiabilité et de son lien avec les décisions produit.",
    expectedAnswer:
      "Un Service Level Indicator est une mesure de l'expérience utilisateur, comme le pourcentage de requêtes qui réussissent et répondent en moins de 300 millisecondes. Un Service Level Objective est une cible pour cet indicateur sur une période donnée, par exemple 99,9 % de requêtes satisfaisantes sur 30 jours. Un Service Level Agreement est un engagement contractuel, généralement moins strict que le SLO, assorti de pénalités. Le budget d'erreur correspond à ce que le SLO autorise à échouer : 0,1 % des requêtes, soit environ 43 minutes d'indisponibilité totale sur 30 jours. Ce budget fait de la fiabilité un outil de décision partagé : tant qu'il reste du budget, les équipes peuvent livrer plus vite et prendre des risques ; lorsqu'il est consommé rapidement ou épuisé, la politique convenue consiste à ralentir les mises en production et à prioriser le travail de fiabilité. Les alertes peuvent reposer sur le burn rate, la vitesse de consommation du budget, ce qui détecte rapidement les problèmes graves ainsi que les dégradations lentes dans la durée, avec moins de fausses alertes. Les SLO doivent être choisis avec les responsables produit en fonction des besoins réels des utilisateurs, car 100 % n'est ni atteignable ni rentable.",
    explanation:
      "Les SLO rendent la fiabilité mesurable et négociable. Les budgets d'erreur équilibrent vitesse de livraison et stabilité à partir de données plutôt que d'opinions.",
    tips: ["Donnez des définitions précises avec des chiffres.", "Expliquez la politique de budget d'erreur.", "Mentionnez les alertes fondées sur le burn rate."],
    commonMistakes: ["Fixer 100 % comme objectif.", "Définir les SLO sur des métriques d'infrastructure plutôt que sur l'expérience utilisateur."],
    followUpQuestions: ["Comment choisiriez-vous le bon SLO pour un nouveau service ?", "Que se passe-t-il lorsque le budget d'erreur est épuisé ?"],
  },
  "ops-039": {
    question: "Quels défis apparaissent lorsqu'on exploite l'observabilité à grande échelle, et comment les gérez-vous ?",
    intent: "Le recruteur évalue votre compréhension avancée des coûts et des compromis de l'observabilité.",
    expectedAnswer:
      "Le premier défi est le volume et le coût : les logs, métriques et traces de centaines de services peuvent coûter autant que l'infrastructure elle-même. Je définirais une rétention par type de données, ne conserverais les logs de debug que brièvement, échantillonnerais les traces, par exemple en gardant toutes les erreurs et les requêtes lentes mais un faible pourcentage des requêtes normales grâce au tail-based sampling, et transformerais les logs verbeux en métriques lorsque c'est possible. Le deuxième est la cardinalité des métriques : des labels à nombreuses valeurs uniques, comme des identifiants utilisateur ou des URL complètes, créent des millions de séries temporelles et surchargent des systèmes comme Prometheus ; les labels doivent donc être bornés et revus. Le troisième est la cohérence : des équipes qui nomment les choses différemment rendent la corrélation difficile, je standardiserais donc sur OpenTelemetry avec des conventions sémantiques partagées, des tableaux de bord communs et des métadonnées de responsabilité des services. Le quatrième est le rapport signal sur bruit : trop de tableaux de bord et d'alertes que personne n'utilise, ce que l'on résout avec des alertes fondées sur les SLO et des nettoyages réguliers. Enfin, la confidentialité : les logs et les traces ne doivent contenir ni données personnelles ni secrets, ce qui impose un nettoyage dès la collecte. Une équipe plateforme interne fournit souvent ces standards et ces pipelines, afin que les équipes produit bénéficient d'une bonne observabilité par défaut.",
    explanation:
      "À grande échelle, l'observabilité exige une gouvernance : échantillonnage, maîtrise de la cardinalité, standards et filtrage des données personnelles. Les candidats avancés la traitent comme un produit qui a un coût.",
    tips: ["Abordez le coût et l'échantillonnage.", "Expliquez le problème de cardinalité.", "Mentionnez les standards et la confidentialité."],
    commonMistakes: ["Utiliser des identifiants utilisateur comme labels de métriques.", "Conserver toutes les traces et tous les logs indéfiniment."],
    followUpQuestions: ["Qu'est-ce que le tail-based sampling ?", "Comment identifieriez-vous le service qui génère le plus de coûts de journalisation ?"],
  },
  "ops-040": {
    question: "Qu'est-ce que le principe du moindre privilège, et comment l'appliquez-vous ?",
    intent: "Le recruteur vérifie votre connaissance d'un principe de sécurité fondamental.",
    expectedAnswer:
      "Le principe du moindre privilège signifie que chaque utilisateur, application ou service ne reçoit que les permissions nécessaires à sa tâche, et seulement pour la durée nécessaire. Par exemple, un service qui lit des fichiers dans un bucket de stockage doit avoir un accès en lecture à ce seul bucket, et non des droits d'administrateur sur le compte ; l'utilisateur de base de données d'un outil de reporting doit être en lecture seule. En pratique, j'utilise des rôles plutôt que de partager des comptes personnels, des comptes ou projets séparés pour la production, j'accorde aux administrateurs un accès élevé temporaire lorsque c'est nécessaire, je revois régulièrement les permissions et je retire les accès lorsque des personnes changent de poste ou partent. Cela limite les dégâts si un compte ou un identifiant est compromis.",
    explanation:
      "Le moindre privilège réduit le rayon d'impact des erreurs et des attaques. C'est une attente de base lors des revues de sécurité et des audits.",
    tips: ["Donnez des exemples concrets pour les utilisateurs et les services.", "Mentionnez les revues d'accès régulières."],
    commonMistakes: ["Accorder des droits d'administrateur pour que quelque chose fonctionne rapidement.", "Partager un seul compte entre toute l'équipe."],
    followUpQuestions: ["Qu'est-ce que le contrôle d'accès basé sur les rôles (RBAC) ?", "Comment accorderiez-vous un accès temporaire à la production ?"],
  },
  "ops-041": {
    question: "Comment les applications et les équipes doivent-elles gérer les secrets ?",
    intent: "Le recruteur vérifie votre gestion concrète des identifiants, source fréquente de fuites de données.",
    expectedAnswer:
      "Les secrets comme les mots de passe, les clés d'API et les certificats ne doivent jamais être stockés dans le code source ni commités dans Git, même dans des dépôts privés. Ils doivent résider dans un gestionnaire de secrets dédié, comme HashiCorp Vault, AWS Secrets Manager, Azure Key Vault ou Google Secret Manager, qui les chiffre, contrôle l'accès par service et journalise qui a accédé à quoi. Les applications reçoivent les secrets à l'exécution, via des variables d'environnement injectées par la plateforme, des fichiers montés ou des appels d'API directs, et les pipelines CI/CD utilisent des variables protégées. Lorsque c'est possible, je privilégie des identifiants de courte durée émis automatiquement, comme les workload identities du cloud ou les identifiants de base de données dynamiques, plutôt que des clés de longue durée. Les secrets doivent faire l'objet d'une rotation régulière, et immédiate après toute exposition suspectée, et la détection de secrets dans les dépôts et les pipelines permet de repérer les erreurs tôt.",
    explanation:
      "Un stockage des secrets centralisé et audité, associé à des identifiants de courte durée, réduit à la fois le risque et l'impact des fuites.",
    tips: ["Citez un gestionnaire de secrets.", "Privilégiez les identifiants de courte durée.", "Mentionnez la rotation et la détection de secrets."],
    commonMistakes: ["Coder en dur des secrets dans des fichiers de configuration.", "Afficher des secrets dans les logs ou les messages d'erreur."],
    followUpQuestions: ["Comment faire la rotation d'un mot de passe de base de données sans interruption de service ?", "Qu'est-ce qu'une workload identity ?"],
  },
  "ops-042": {
    question: "Contre quelles vulnérabilités web courantes chaque équipe doit-elle se protéger ?",
    intent: "Le recruteur vérifie votre connaissance de l'OWASP Top 10 et des mesures de protection de base.",
    expectedAnswer:
      "L'OWASP Top 10 recense les risques les plus critiques. Le contrôle d'accès défaillant (broken access control), par exemple un utilisateur qui consulte la commande d'un autre en modifiant un identifiant dans l'URL, se prévient en vérifiant l'autorisation côté serveur pour chaque requête. L'injection, dont l'injection SQL, se prévient avec des requêtes paramétrées et la validation des entrées. Le cross-site scripting se prévient en encodant les sorties, en utilisant des frameworks qui échappent par défaut et une Content Security Policy. Les défaillances cryptographiques s'évitent en utilisant HTTPS partout, un hachage robuste comme bcrypt ou Argon2 pour les mots de passe et le chiffrement des données sensibles au repos. Les erreurs de configuration de sécurité, comme des identifiants par défaut ou des messages d'erreur trop verbeux, s'évitent avec des paramètres par défaut durcis et des revues. Les composants vulnérables et obsolètes se gèrent avec l'analyse des dépendances et des mises à jour régulières. Parmi les autres risques importants figurent les défaillances d'authentification, la falsification de requêtes côté serveur (SSRF) et une journalisation et une supervision insuffisantes. Les tests de sécurité dans la CI et les revues de code aident à détecter ces problèmes tôt.",
    explanation:
      "La plupart des fuites exploitent des faiblesses bien connues. Connaître les principales catégories et leurs protections standard est attendu de tout développeur ou ingénieur DevOps.",
    tips: ["Donnez un exemple concret et une protection pour chaque risque.", "Mentionnez le contrôle d'accès défaillant comme risque principal."],
    commonMistakes: ["Compter sur le masquage des identifiants plutôt que sur la vérification des permissions.", "Construire des requêtes SQL par concaténation de chaînes."],
    followUpQuestions: ["Qu'est-ce que la falsification de requêtes côté serveur (SSRF) ?", "Comment fonctionne une Content Security Policy ?"],
  },
  "ops-043": {
    question: "Comment fonctionne HTTPS, et qu'est-ce que le TLS mutuel ?",
    intent: "Le recruteur vérifie votre compréhension du chiffrement en transit et de la gestion des certificats.",
    expectedAnswer:
      "HTTPS est du HTTP sur TLS. Pendant le handshake TLS, le serveur présente un certificat signé par une autorité de certification de confiance, qui prouve qu'il possède le domaine ; le client vérifie la chaîne de certificats et le nom de domaine. Le client et le serveur conviennent ensuite de clés de session grâce à un échange de clés, de sorte que le trafic est chiffré et protégé contre toute altération. TLS 1.3 est la version actuelle, et les anciennes versions comme TLS 1.0 et 1.1 doivent être désactivées. Les certificats expirent, leur renouvellement doit donc être automatisé, par exemple avec Let's Encrypt et cert-manager dans Kubernetes. Le TLS mutuel ajoute l'authentification du client : le client présente lui aussi un certificat que le serveur vérifie. Il est utilisé pour la communication entre services dans les réseaux zero trust, souvent géré automatiquement par un service mesh comme Istio ou Linkerd, ainsi que pour l'authentification forte de partenaires ou d'appareils.",
    explanation:
      "TLS assure la confidentialité, l'intégrité et l'authentification du serveur ; le mTLS ajoute l'authentification du client. Automatiser le renouvellement des certificats évite une cause fréquente de pannes.",
    tips: ["Décrivez le handshake dans les grandes lignes.", "Mentionnez l'automatisation du renouvellement des certificats.", "Donnez un cas d'usage du mTLS."],
    commonMistakes: ["Désactiver la vérification des certificats côté client pour corriger des erreurs.", "Gérer manuellement le renouvellement des certificats."],
    followUpQuestions: ["Que se passe-t-il lorsqu'un certificat expire en production ?", "Comment un service mesh met-il en œuvre le mTLS ?"],
  },
  "ops-044": {
    question: "Que signifie une approche zero trust pour une infrastructure cloud, et comment la mettriez-vous en œuvre ?",
    intent: "Le recruteur évalue votre maîtrise avancée de l'architecture de sécurité au-delà des défenses périmétriques.",
    expectedAnswer:
      "Le zero trust signifie qu'aucun utilisateur, appareil ou service n'est considéré comme fiable du fait de sa position sur le réseau : chaque requête est authentifiée, autorisée et chiffrée, et l'accès est évalué en continu. Le modèle traditionnel d'un réseau interne de confiance derrière un pare-feu échoue dès qu'un attaquant y pénètre, car il peut alors se déplacer latéralement. Pour le mettre en œuvre, je commencerais par une identité forte : authentification unique (SSO) avec authentification multifacteur pour les personnes, et workload identities, comme les rôles IAM du cloud ou les identités SPIFFE, pour les services au lieu de clés partagées. L'accès est accordé ressource par ressource selon le moindre privilège et, pour les administrateurs, par une élévation juste-à-temps et limitée dans le temps, avec des journaux d'audit. Le trafic entre services utilise le TLS mutuel avec des politiques d'autorisation, souvent via un service mesh, et la segmentation réseau limite les workloads qui peuvent communiquer entre eux, par exemple avec des network policies Kubernetes qui refusent le trafic par défaut. Les applications internes sont exposées via un proxy sensible à l'identité (identity-aware proxy) plutôt que via un VPN qui ouvre un large accès au réseau. L'état de l'appareil peut entrer dans la décision. Tous les accès sont journalisés de façon centralisée et surveillés pour détecter les anomalies. Il s'agit d'une démarche progressive : je commencerais par les systèmes et les identités les plus sensibles.",
    explanation:
      "Le zero trust remplace la position sur le réseau par l'identité et la vérification continue. Les réponses avancées couvrent les personnes, les services, la segmentation réseau et la supervision, et présentent l'adoption comme incrémentale.",
    tips: ["Opposez-le à la sécurité périmétrique.", "Couvrez les identités des personnes et des workloads.", "Mentionnez le mTLS, la segmentation et les proxys sensibles à l'identité."],
    commonMistakes: ["Assimiler le zero trust à l'achat d'un produit unique.", "Conserver des réseaux internes plats où chaque service peut joindre tous les autres."],
    followUpQuestions: ["Comment migreriez-vous d'un VPN vers un identity-aware proxy ?", "Qu'est-ce que SPIFFE ?"],
  },
  "ops-045": {
    question: "Vous découvrez que les identifiants de votre compte cloud de production ont fuité. Décrivez-moi votre réponse.",
    intent: "Le recruteur évalue votre maîtrise avancée de la réponse aux incidents : confinement, investigation, communication et prévention.",
    expectedAnswer:
      "Je traiterais la situation comme un incident de sécurité et suivrais le processus de réponse de l'organisation, en impliquant immédiatement l'équipe sécurité. Le confinement passe en premier : désactiver ou faire tourner les identifiants divulgués, révoquer les sessions actives et les tokens émis avec eux et, en cas de risque d'abus en cours, restreindre davantage les comptes concernés. Je préserverais les preuves plutôt que de supprimer des éléments dans la précipitation : conserver les journaux d'audit, comme CloudTrail ou son équivalent, ainsi que des snapshots des ressources suspectes. J'enquêterais ensuite sur la période d'exposition : ce à quoi les identifiants donnaient accès, les actions effectuées avec eux, comme la création d'utilisateurs ou de clés d'accès, des instances inhabituelles destinées au minage de cryptomonnaie, des modifications de groupes de sécurité ou des téléchargements de données depuis le stockage, et si l'attaquant a mis en place une persistance, comme de nouveaux utilisateurs ou rôles IAM, qu'il faut également supprimer. Selon les constats, je restaurerais les systèmes affectés à partir de sources de confiance. La communication se fait en parallèle : des points réguliers aux parties prenantes et, si des données personnelles ont pu être consultées, les équipes juridique et protection des données doivent évaluer les obligations de notification, qui imposent dans certaines juridictions des délais stricts, comme 72 heures au titre du RGPD (GDPR). Ensuite, une revue post-incident sans recherche de coupable (blameless) débouche sur des mesures préventives : remplacer les clés de longue durée par des identifiants fédérés de courte durée, l'authentification multifacteur, la détection de secrets, des revues de moindre privilège et des alertes sur les activités inhabituelles du compte.",
    explanation:
      "Une bonne réponse suit les étapes confinement, préservation des preuves, investigation, éradication, rétablissement et retour d'expérience, en gardant à l'esprit la communication et les obligations légales.",
    tips: ["Commencez par le confinement et impliquez l'équipe sécurité.", "Expliquez ce que vous recherchez dans les journaux d'audit, y compris la persistance.", "Mentionnez la communication et les obligations légales."],
    commonMistakes: ["Se contenter de faire tourner la clé sans vérifier ce que l'attaquant a fait.", "Supprimer des journaux ou des ressources avant d'enquêter."],
    followUpQuestions: ["Comment détectez-vous la persistance d'un attaquant dans un compte cloud ?", "Qui décide si les clients doivent être notifiés ?"],
  },
};
