import type { QuestionText, TextTable } from '@/types/content';

/** Questions Java 026-050 : concurrence (partie), JVM, Spring Boot, API REST, injection de dépendances, microservices. */
export const frB: TextTable<QuestionText> = {
  "java-026": {
    question: "Qu'est-ce que le Java Memory Model, et que signifie « happens-before » ?",
    intent: "Le recruteur évalue votre compréhension approfondie des raisons pour lesquelles du code concurrent peut se comporter de façon inattendue sans synchronisation adaptée.",
    expectedAnswer:
      "Le Java Memory Model définit à quel moment une écriture effectuée par un thread est garantie visible pour une lecture effectuée par un autre. Sans règles, les compilateurs et les processeurs peuvent réordonner les instructions et conserver des valeurs dans des caches ou des registres, si bien qu'un thread peut voir des données périmées ou partiellement mises à jour. Le modèle définit des relations happens-before : si une action A happens-before une action B, alors B voit les effets de A. Les règles principales : libérer un verrou happens-before toute acquisition ultérieure de ce même verrou ; une écriture dans une variable volatile happens-before les lectures ultérieures de cette variable ; Thread.start() happens-before les actions du thread démarré ; toutes les actions d'un thread happen-before le retour de join() sur ce thread dans un autre thread ; et les écritures dans des champs final effectuées dans un constructeur sont visibles dès que l'objet est publié de manière sûre. Du code sans une telle relation présente une data race. Une conséquence classique est le pattern de double-checked locking défectueux, qui nécessite un champ volatile pour être correct.",
    explanation:
      "La relation happens-before est le fondement formel des garanties de visibilité. La comprendre explique pourquoi volatile, les verrous et la publication sûre sont nécessaires, et pas seulement de bonnes habitudes.",
    tips: ["Expliquez que le réordonnancement et la mise en cache sont la raison d'être du modèle.", "Citez les principales règles happens-before.", "Donnez un exemple concret de code incorrect."],
    commonMistakes: ["Penser qu'une écriture est immédiatement visible par les autres threads.", "Croire que seules les écritures nécessitent une synchronisation, et pas les lectures."],
    followUpQuestions: ["Qu'est-ce que la publication sûre (safe publication) ?", "Pourquoi le double-checked locking nécessite-t-il volatile ?"],
  },
  "java-027": {
    question: "Quelle est la différence entre le JDK, le JRE et la JVM ?",
    intent: "Le recruteur vérifie que vous connaissez les composants de base de la plateforme Java.",
    expectedAnswer:
      "La JVM, Java Virtual Machine, exécute le bytecode : elle charge les classes, les vérifie, interprète et compile le code à la volée (JIT) et gère la mémoire grâce au garbage collector. Le JRE, Java Runtime Environment, regroupait historiquement la JVM et les bibliothèques standard nécessaires pour exécuter des applications. Le JDK, Java Development Kit, contient tout ce que contient le JRE, plus des outils de développement comme le compilateur javac, jar, jshell et des outils de diagnostic comme jcmd. Depuis Java 11, Oracle ne distribue plus de JRE séparé : on utilise le JDK ou on construit un runtime minimal avec jlink.",
    explanation:
      "Connaître ces couches aide à configurer des serveurs de build ou des images Docker, ou à diagnostiquer des problèmes à l'exécution.",
    tips: ["Décrivez ce que contient chacun d'eux.", "Mentionnez jlink et l'absence de JRE séparé dans les versions modernes de Java."],
    commonMistakes: ["Dire que la JVM compile le code source Java, alors que c'est javac qui le fait."],
    followUpQuestions: ["Qu'est-ce que le bytecode ?", "Comment construiriez-vous une image Docker légère pour un service Java ?"],
  },
  "java-028": {
    question: "Décrivez les principales zones mémoire de la JVM.",
    intent: "Le recruteur vérifie votre modèle mental de la mémoire de la JVM, utile pour le tuning et le dépannage.",
    expectedAnswer:
      "Le heap stocke les objets et les tableaux et il est partagé par tous les threads ; il est géré par le garbage collector et généralement divisé en jeune et vieille génération. Chaque thread possède sa propre pile (stack), qui contient une frame par appel de méthode avec les variables locales et les résultats intermédiaires ; une récursion trop profonde provoque une StackOverflowError. Le Metaspace, qui a remplacé la PermGen en Java 8, stocke les métadonnées des classes en mémoire native. Il existe aussi le code cache, où est stocké le code natif compilé par le JIT, ainsi que d'autres zones de mémoire native utilisées par les threads, les direct buffers et la JVM elle-même. -Xmx limite le heap, mais la mémoire totale du processus est plus importante, ce qui compte lorsqu'on définit les limites mémoire d'un conteneur.",
    explanation:
      "Comprendre ces zones aide à interpréter les messages OutOfMemoryError, qui indiquent la zone épuisée, et à dimensionner correctement les conteneurs.",
    tips: ["Distinguez le heap partagé des piles propres à chaque thread.", "Précisez que la mémoire totale dépasse la taille du heap."],
    commonMistakes: ["Fixer la limite mémoire du conteneur à la même valeur que -Xmx.", "Parler encore de PermGen pour une version moderne de Java."],
    followUpQuestions: ["Qu'est-ce qui provoque une « OutOfMemoryError: Metaspace » ?", "Comment la JVM détecte-t-elle les limites mémoire d'un conteneur ?"],
  },
  "java-029": {
    question: "Comment analyseriez-vous une consommation CPU élevée dans une application Java en cours d'exécution ?",
    intent: "Le recruteur vérifie vos compétences pratiques de dépannage sur la JVM.",
    expectedAnswer:
      "Je vérifierais d'abord si le CPU est consommé par le code applicatif ou par le garbage collector, à l'aide des logs GC ou des métriques : des collectes fréquentes indiquent une pression mémoire plutôt qu'un problème de code. Pour trouver le code chaud, je prendrais plusieurs thread dumps à quelques secondes d'intervalle avec jcmd <pid> Thread.print ou jstack, et je chercherais les threads RUNNABLE qui apparaissent dans la même pile à chaque fois, par exemple une boucle serrée, une regex coûteuse ou de la sérialisation. Sous Linux, top -H affiche les identifiants des threads natifs les plus actifs, que l'on peut faire correspondre au thread dump après conversion en hexadécimal. Un profileur comme async-profiler ou Java Flight Recorder fournit un flame graph bien plus précis, avec un faible surcoût. Je ferais ensuite le lien avec les déploiements récents ou les variations de trafic.",
    explanation:
      "La méthode consiste à distinguer le CPU consommé par le GC de celui de l'application, puis à utiliser des thread dumps ou du profilage pour trouver les piles chaudes. Le rapprochement avec les changements récents accélère l'analyse des causes.",
    tips: ["Évoquez d'abord le GC comme cause possible.", "Expliquez comment des thread dumps répétés révèlent les points chauds.", "Citez un profileur à faible surcoût."],
    commonMistakes: ["Redémarrer le service sans collecter d'éléments de diagnostic.", "Tirer des conclusions à partir d'un seul thread dump."],
    followUpQuestions: ["Qu'est-ce que Java Flight Recorder ?", "Comment lit-on un flame graph ?"],
  },
  "java-030": {
    question: "Comment choisissez-vous et réglez-vous le garbage collector d'un service Java ?",
    intent: "Le recruteur évalue vos connaissances avancées en performance de la JVM et votre approche du tuning fondée sur des mesures.",
    expectedAnswer:
      "Je pars des objectifs du service : les API sensibles à la latence se soucient des temps de pause, les traitements batch du débit, et les petits conteneurs de l'empreinte mémoire. G1 est le collecteur par défaut et offre un bon équilibre pour la plupart des services, avec des heaps allant de quelques centaines de mégaoctets à plusieurs dizaines de gigaoctets ; son principal réglage est un objectif de temps de pause, MaxGCPauseMillis. Pour une latence très faible avec de gros heaps, ZGC, générationnel depuis Java 21, maintient des pauses généralement inférieures à la milliseconde, au prix d'un surcoût en CPU et en mémoire. Parallel GC maximise le débit pour les traitements batch. Serial GC convient aux très petits conteneurs dotés d'un seul CPU. Avant tout réglage, j'active les logs GC avec -Xlog:gc*, je mesure sous une charge réaliste et j'examine les temps de pause, leur fréquence et le taux d'allocation. Souvent, la meilleure correction consiste à réduire les allocations ou à bien dimensionner le heap plutôt qu'à ajuster des options. Dans des conteneurs, je dimensionne le heap par rapport à la limite du conteneur, par exemple avec MaxRAMPercentage, en laissant de la place pour la mémoire hors heap.",
    explanation:
      "Le choix du GC dépend des objectifs, et le tuning doit s'appuyer sur des mesures. Les ingénieurs expérimentés corrigent souvent les schémas d'allocation avant de toucher aux options.",
    tips: ["Associez chaque collecteur à un objectif.", "Insistez sur les logs GC et les tests de charge.", "Mentionnez le dimensionnement dans les conteneurs."],
    commonMistakes: ["Copier des options JVM trouvées sur Internet sans mesurer.", "Définir un heap énorme qui allonge les pauses."],
    followUpQuestions: ["Que vous apprend le taux d'allocation ?", "Comment réduiriez-vous les allocations dans un chemin de code critique ?"],
  },
  "java-031": {
    question: "Comment réduiriez-vous le temps de démarrage et l'empreinte mémoire d'un microservice Java ?",
    intent: "Le recruteur vérifie vos connaissances modernes du déploiement dans des environnements cloud et serverless.",
    expectedAnswer:
      "Je commencerais par mesurer où passe le temps : chargement des classes, initialisation du contexte Spring, ouverture des connexions à la base de données ou caches chargés au démarrage. Au niveau du framework, les améliorations courantes sont l'initialisation paresseuse (lazy) des beans lorsque c'est sans risque, la suppression des auto-configurations et starters inutilisés, et l'absence de traitements lourds dans les constructeurs ou dans @PostConstruct. Au niveau de la JVM, le Class Data Sharing, en particulier les archives AppCDS, réduit le temps de chargement des classes, et le choix du bon GC et de la bonne taille de heap limite l'empreinte. Pour des gains plus importants, Spring Boot 3 prend en charge les images natives GraalVM grâce au traitement AOT : le démarrage tombe à quelques dizaines de millisecondes et la consommation mémoire est bien plus faible, mais les builds sont plus lents, la réflexion doit être déclarée, certaines bibliothèques sont incompatibles et le débit maximal peut être inférieur à celui obtenu avec le JIT. Une autre option est CRaC, qui restaure un instantané d'une JVM déjà chauffée, lorsque la plateforme le permet. Le choix dépend de la capacité du service à descendre à zéro instance, de la fréquence de ses démarrages et de l'importance des performances maximales.",
    explanation:
      "Optimiser le démarrage est un compromis entre complexité du build, compatibilité et performances à l'exécution. Les candidats avancés présentent les options avec leurs coûts.",
    tips: ["Commencez par la mesure.", "Comparez les options au niveau de la JVM avec les images natives.", "Expliquez les compromis des images natives."],
    commonMistakes: ["Recommander les images natives pour tous les services.", "Ignorer l'effet de la phase de chauffe (warm-up) sur les performances maximales."],
    followUpQuestions: ["Qu'est-ce que le traitement AOT dans Spring Boot 3 ?", "Pourquoi les images natives peuvent-elles avoir un débit maximal plus faible ?"],
  },
  "java-032": {
    question: "Qu'est-ce que Spring Boot, et en quoi diffère-t-il du Spring Framework ?",
    intent: "Le recruteur vérifie votre compréhension de base de l'écosystème Java le plus utilisé pour le développement back-end.",
    expectedAnswer:
      "Le Spring Framework fournit les fonctionnalités de base : injection de dépendances, gestion des transactions, web MVC, accès aux données et bien plus, mais il exigeait historiquement beaucoup de configuration. Spring Boot s'appuie sur Spring pour permettre de démarrer rapidement une application : les starters regroupent des dépendances compatibles, l'auto-configuration crée des beans en fonction des bibliothèques présentes dans le classpath et de vos propriétés, un serveur embarqué comme Tomcat permet d'exécuter l'application sous forme de simple jar, et Actuator fournit des health checks et des métriques. Le principe de convention plutôt que configuration signifie que vous ne configurez que ce qui diffère des valeurs par défaut.",
    explanation:
      "Spring Boot ne remplace pas Spring : il le packe et le configure avec des valeurs par défaut sensées, pour que les équipes se concentrent sur le code métier.",
    tips: ["Mentionnez les starters, l'auto-configuration et le serveur embarqué.", "Précisez que Boot est construit au-dessus de Spring."],
    commonMistakes: ["Présenter Spring Boot comme un framework distinct de Spring."],
    followUpQuestions: ["Comment l'auto-configuration décide-t-elle de ce qu'elle crée ?", "Qu'apporte Spring Boot Actuator ?"],
  },
  "java-033": {
    question: "Comment fonctionne l'auto-configuration de Spring Boot ?",
    intent: "Le recruteur veut voir que vous comprenez le mécanisme derrière la « magie » de Spring Boot et que vous savez le déboguer.",
    expectedAnswer:
      "Spring Boot fournit des classes d'auto-configuration, listées dans META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports depuis Spring Boot 3. Lorsque l'application démarre avec @SpringBootApplication, qui inclut @EnableAutoConfiguration, ces classes sont évaluées. Chacune est protégée par des conditions : @ConditionalOnClass ne crée des beans que si une bibliothèque est présente dans le classpath, @ConditionalOnMissingBean se retire si vous avez défini votre propre bean, et @ConditionalOnProperty dépend de valeurs de configuration. C'est pourquoi ajouter spring-boot-starter-data-jpa et une URL de datasource suffit pour obtenir un DataSource et un EntityManager configurés. Pour voir quelles configurations ont été appliquées ou non, vous pouvez démarrer avec --debug ou utiliser l'endpoint conditions d'Actuator. Pour remplacer une valeur par défaut, définissez votre propre bean ou renseignez les propriétés documentées.",
    explanation:
      "La configuration conditionnelle explique comment Boot s'adapte au classpath et pourquoi vos propres beans sont prioritaires. Savoir consulter le rapport des conditions est une compétence de débogage très pratique.",
    tips: ["Citez les principales annotations conditionnelles.", "Expliquez comment consulter le rapport des conditions."],
    commonMistakes: ["Exclure des auto-configurations à l'aveugle au lieu de comprendre les conflits."],
    followUpQuestions: ["Comment écririez-vous votre propre starter ?", "Pourquoi deux beans DataSource peuvent-ils faire échouer le démarrage ?"],
  },
  "java-034": {
    question: "Comment gérez-vous la configuration et les profils dans une application Spring Boot ?",
    intent: "Le recruteur vérifie vos bonnes pratiques en matière de configuration par environnement et de gestion des secrets.",
    expectedAnswer:
      "La configuration se trouve dans application.yml ou application.properties, avec des fichiers propres à un profil comme application-prod.yml, activés via spring.profiles.active. Spring Boot résout les propriétés à partir de nombreuses sources dans un ordre défini, et les variables d'environnement et les arguments de ligne de commande priment sur les fichiers, ce qui convient aux conteneurs et aux applications twelve-factor. Je lie les propriétés liées entre elles à des classes typées avec @ConfigurationProperties, souvent sous forme de records avec validation, plutôt que de disperser des annotations @Value. Les secrets comme les mots de passe ne doivent pas être commités : ils proviennent de variables d'environnement, d'un coffre-fort (vault) ou d'un gestionnaire de secrets cloud. Les profils doivent modifier la configuration, pas le comportement métier, afin que les environnements restent aussi proches que possible.",
    explanation:
      "Une configuration typée et externalisée, avec les secrets en dehors du code, est la pratique standard pour les services déployables.",
    example: "@ConfigurationProperties(\"payment\")\nrecord PaymentProperties(@NotBlank String apiUrl, Duration timeout) {}",
    tips: ["Préférez @ConfigurationProperties à de nombreux champs @Value.", "Expliquez d'où doivent provenir les secrets."],
    commonMistakes: ["Commiter des mots de passe dans application.yml.", "Utiliser des profils pour activer une logique métier différente en production."],
    followUpQuestions: ["Quel est l'ordre de priorité des sources de propriétés ?", "Comment rechargeriez-vous la configuration sans redémarrer ?"],
  },
  "java-035": {
    question: "Comment fonctionne @Transactional dans Spring, et quels sont ses pièges courants ?",
    intent: "Le recruteur vérifie que vous comprenez les transactions basées sur des proxys, une source fréquente de bugs subtils.",
    expectedAnswer:
      "Spring implémente @Transactional au moyen d'un proxy autour du bean. Lorsqu'une méthode est appelée via le proxy, celui-ci démarre une transaction ou rejoint une transaction existante, puis la valide (commit) au retour de la méthode ou l'annule (rollback) en cas d'exception. Les pièges découlent de cette conception. L'auto-invocation : appeler une méthode @Transactional depuis une autre méthode de la même classe contourne le proxy, donc aucune transaction n'est appliquée. Les méthodes privées ne sont pas interceptées. Par défaut, le rollback n'a lieu que pour les exceptions non vérifiées (unchecked) et les erreurs, pas pour les exceptions vérifiées (checked), sauf si vous définissez rollbackFor. La propagation compte : REQUIRED rejoint la transaction existante, tandis que REQUIRES_NEW la suspend et en démarre une nouvelle. Les transactions longues qui conservent des verrous en base pendant des appels à des services distants dégradent les performances. Enfin, readOnly = true est une indication qui peut activer des optimisations, pas une garantie de sécurité.",
    explanation:
      "Comprendre que les transactions sont appliquées par un proxy explique la plupart des surprises. Connaître les règles de rollback et de propagation évite des bugs de cohérence des données.",
    tips: ["Expliquez le mécanisme du proxy.", "Mentionnez l'auto-invocation et le rollback sur les exceptions vérifiées.", "Abordez la durée des transactions."],
    commonMistakes: ["Placer @Transactional sur des méthodes privées.", "Appeler des API externes à l'intérieur d'une longue transaction."],
    followUpQuestions: ["Quand utiliseriez-vous REQUIRES_NEW ?", "Comment testez-vous le comportement transactionnel ?"],
  },
  "java-036": {
    question: "Comment diagnostiqueriez-vous et corrigeriez-vous le problème N+1 dans une application Spring Data JPA ?",
    intent: "Le recruteur évalue vos connaissances avancées sur les performances d'un ORM, un problème très courant en production.",
    expectedAnswer:
      "Le problème N+1 survient lorsque le chargement d'une liste de N entités déclenche une requête pour la liste, puis une requête supplémentaire par entité pour charger une association lazy, par exemple en chargeant des commandes puis leur client un par un. Je le détecterais en activant les logs SQL ou les statistiques dans un test, en utilisant des outils comme les statistiques Hibernate ou datasource-proxy pour compter les requêtes, ou en repérant de nombreuses requêtes similaires dans les traces APM. Les corrections dépendent du cas d'usage : un JOIN FETCH dans une requête JPQL ou un @EntityGraph pour charger l'association dans la même requête ; le chargement par lots avec @BatchSize ou hibernate.default_batch_fetch_size, afin que les chargements lazy soient regroupés avec des clauses IN ; ou, pour les écrans en lecture seule, une projection DTO qui sélectionne exactement les colonnes nécessaires. Je serais prudent lorsqu'il s'agit de charger plusieurs collections à la fois, ce qui provoque des produits cartésiens ou une MultipleBagFetchException, ainsi qu'avec la pagination combinée à des fetch joins sur des collections, qu'Hibernate applique en mémoire. J'ajouterais un test qui vérifie le nombre de requêtes pour que le problème ne réapparaisse pas.",
    explanation:
      "Les candidats avancés connaissent plusieurs corrections et leurs compromis, et ils préviennent les régressions grâce à des tests sur le nombre de requêtes.",
    tips: ["Expliquez comment le détecter avec les logs ou le nombre de requêtes.", "Proposez plusieurs corrections et précisez quand chacune convient.", "Mentionnez les pièges de la pagination et des collections multiples."],
    commonMistakes: ["Passer tout le chargement en EAGER.", "Ignorer le problème parce qu'il est invisible avec de petits jeux de données de test."],
    followUpQuestions: ["Pourquoi le chargement EAGER est-il généralement un mauvais choix par défaut ?", "Qu'est-ce que le paramètre open-session-in-view et pourquoi est-il controversé ?"],
  },
  "java-037": {
    question: "Comment rendriez-vous un service Spring Boot prêt pour la production ?",
    intent: "Le recruteur évalue votre maturité opérationnelle : observabilité, résilience, sécurité et pratiques de déploiement.",
    expectedAnswer:
      "Pour l'observabilité, j'exposerais des sondes de santé, de readiness et de liveness avec Actuator, j'exporterais les métriques via Micrometer vers Prometheus ou la plateforme utilisée, j'utiliserais des logs JSON structurés avec un identifiant de corrélation ou de trace, et j'ajouterais du tracing distribué avec OpenTelemetry. Pour la résilience, chaque appel sortant doit avoir un timeout, et j'ajouterais des retries avec backoff uniquement pour les opérations idempotentes, ainsi que des disjoncteurs (circuit breakers) avec Resilience4j pour les dépendances instables. Les pools de connexions à la base de données et les pools de threads seraient dimensionnés et surveillés. Pour la sécurité : Spring Security avec une authentification adaptée, la validation des entrées, des secrets provenant d'un coffre-fort ou de l'environnement, l'analyse des vulnérabilités des dépendances et des endpoints Actuator restreints. Pour le déploiement : un arrêt gracieux (graceful shutdown) afin que les requêtes en cours se terminent, des migrations de base de données avec Flyway ou Liquibase, une configuration externalisée et des réglages mémoire adaptés aux conteneurs. Enfin, je définirais des objectifs de niveau de service (SLO) et des alertes sur les symptômes ressentis par les utilisateurs, comme le taux d'erreur et la latence.",
    explanation:
      "La mise en production couvre l'observabilité, la résilience, la sécurité et le déploiement. Une réponse structurée qui couvre chaque domaine témoigne d'une expérience opérationnelle senior.",
    tips: ["Organisez votre réponse par domaine.", "Présentez les timeouts comme non négociables.", "Incluez l'arrêt gracieux et les migrations."],
    commonMistakes: ["Exposer publiquement tous les endpoints Actuator.", "Ajouter des retries sur des opérations non idempotentes."],
    followUpQuestions: ["Quelle est la différence entre les sondes de liveness et de readiness ?", "Comment déploieriez-vous une migration de base de données non rétrocompatible ?"],
  },
  "java-038": {
    question: "Quelles sont les principales méthodes HTTP utilisées dans une API REST, et que signifie chacune ?",
    intent: "Le recruteur vérifie vos connaissances de base en REST et votre bonne utilisation de la sémantique HTTP.",
    expectedAnswer:
      "GET lit une ressource et ne doit pas modifier l'état. POST crée une ressource ou déclenche un traitement ; il n'est pas idempotent, donc l'envoyer deux fois peut créer deux ressources. PUT remplace entièrement une ressource à une URL connue et il est idempotent. PATCH met à jour partiellement une ressource. DELETE supprime une ressource et il est idempotent : supprimer deux fois aboutit au même état. Par exemple, GET /orders/42 lit une commande, POST /orders en crée une et PATCH /orders/42 met à jour son statut.",
    explanation:
      "Utiliser correctement les méthodes HTTP rend les API prévisibles et permet aux caches, aux proxys et aux clients de se comporter correctement, par exemple en relançant sans risque les requêtes idempotentes.",
    tips: ["Mentionnez les notions de méthode sûre (safe) et d'idempotence.", "Donnez des exemples d'URL."],
    commonMistakes: ["Utiliser GET pour modifier des données.", "Utiliser POST pour tout."],
    followUpQuestions: ["Que signifie « idempotent » ?", "Quand utiliseriez-vous PUT plutôt que PATCH ?"],
  },
  "java-039": {
    question: "Quels codes de statut HTTP une API REST doit-elle renvoyer dans les situations courantes ?",
    intent: "Le recruteur vérifie que vous concevez des API qui communiquent clairement leurs résultats aux clients.",
    expectedAnswer:
      "En cas de succès : 200 OK pour une lecture ou une mise à jour réussie avec un corps de réponse, 201 Created après la création d'une ressource, idéalement avec un en-tête Location, et 204 No Content lorsqu'il n'y a pas de corps, par exemple après une suppression. Pour les erreurs client : 400 Bad Request pour une entrée invalide, 401 Unauthorized lorsque l'authentification est absente ou invalide, 403 Forbidden lorsque l'utilisateur est authentifié mais n'a pas les droits, 404 Not Found, 409 Conflict pour un état conflictuel comme un doublon, 422 Unprocessable Entity pour les erreurs de validation métier dans de nombreuses API, et 429 Too Many Requests pour la limitation de débit (rate limiting). Pour les erreurs serveur : 500 Internal Server Error, et 503 Service Unavailable en cas de surcharge temporaire. Les erreurs doivent être accompagnées d'un corps cohérent, par exemple au format Problem Details.",
    explanation:
      "Des codes de statut corrects permettent aux clients de traiter les résultats automatiquement. Un format d'erreur cohérent facilite le débogage pour les consommateurs de l'API.",
    tips: ["Distinguez 401 de 403.", "Mentionnez un format standard pour le corps des erreurs."],
    commonMistakes: ["Renvoyer 200 avec un message d'erreur dans le corps.", "Renvoyer 500 pour une saisie utilisateur invalide."],
    followUpQuestions: ["Qu'est-ce que le format Problem Details de la RFC 9457 ?", "Comment renverriez-vous des erreurs de validation portant sur plusieurs champs ?"],
  },
  "java-040": {
    question: "Comment versionnez-vous une API REST et gérez-vous les changements non rétrocompatibles ?",
    intent: "Le recruteur vérifie votre maturité en conception d'API et votre respect de la compatibilité pour les clients.",
    expectedAnswer:
      "La meilleure approche consiste à éviter le plus longtemps possible les changements non rétrocompatibles : ajouter des champs optionnels ou de nouveaux endpoints reste rétrocompatible, et les clients doivent ignorer les champs inconnus. Lorsqu'un changement cassant est nécessaire, comme la suppression d'un champ ou la modification de son sens, j'introduirais une nouvelle version. Les stratégies courantes sont une version dans le chemin de l'URL, comme /v2/orders, simple et visible, ou une version dans un en-tête ou dans le media type, qui garde des URL stables mais se découvre moins facilement. Je ferais tourner les deux versions en parallèle, je communiquerais un calendrier de dépréciation, je marquerais les endpoints dépréciés avec les en-têtes Deprecation et Sunset et je surveillerais l'utilisation de l'ancienne version avant de la supprimer. Les tests de contrat aident à garantir que les clients existants ne sont pas cassés par accident.",
    explanation:
      "Le versionnement consiste à gérer le changement pour des consommateurs que vous ne contrôlez pas. Surveiller l'utilisation et communiquer sur la dépréciation compte autant que le mécanisme technique.",
    tips: ["Expliquez ce qui constitue un changement non rétrocompatible.", "Mentionnez un processus de dépréciation."],
    commonMistakes: ["Créer une nouvelle version pour chaque petit changement.", "Supprimer une ancienne version sans vérifier qui l'utilise encore."],
    followUpQuestions: ["Comment documentez-vous une API, par exemple avec OpenAPI ?", "Comment feriez-vous migrer des applications mobiles qui se mettent à jour lentement ?"],
  },
  "java-041": {
    question: "Comment implémenteriez-vous la pagination, le filtrage et le tri dans une API REST ?",
    intent: "Le recruteur vérifie votre approche pratique de la conception d'API pour de grands volumes de données.",
    expectedAnswer:
      "Pour le filtrage et le tri, j'utiliserais des paramètres de requête, comme /orders?status=PAID&sort=createdAt,desc, en validant les champs autorisés afin que les clients ne puissent pas trier sur des colonnes non indexées ou sensibles. Pour la pagination, il existe deux approches principales. La pagination par offset, avec page et size, est simple et permet d'accéder directement à une page, mais elle devient lente sur de grands offsets, car la base de données parcourt quand même les lignes ignorées, et les résultats peuvent se décaler si les données changent entre deux requêtes. La pagination par curseur ou keyset renvoie un curseur basé sur le dernier élément, par exemple sa date de création et son ID, et la requête suivante utilise WHERE (created_at, id) < (?, ?) ; elle est rapide et stable pour des données volumineuses ou changeantes, mais ne permet pas d'accéder à une page arbitraire. J'imposerais toujours une taille de page maximale et je renverrais des métadonnées ou des liens vers la page suivante.",
    explanation:
      "Le choix entre pagination par offset et par keyset dépend du volume de données et des besoins des utilisateurs. Valider les champs de tri et plafonner la taille des pages protège la base de données.",
    tips: ["Comparez la pagination par offset et par keyset.", "Mentionnez une taille de page maximale et la validation."],
    commonMistakes: ["Renvoyer des listes non bornées.", "Autoriser le tri sur n'importe quelle colonne sans index."],
    followUpQuestions: ["Comment Spring Data prend-il en charge la pagination ?", "Comment implémenteriez-vous un défilement infini sur mobile ?"],
  },
  "java-042": {
    question: "Comment rendre un endpoint POST sûr à relancer, par exemple pour des paiements ?",
    intent: "Le recruteur évalue vos compétences avancées en conception d'API fiables dans les systèmes distribués.",
    expectedAnswer:
      "À cause des pannes réseau, un client ne peut pas toujours savoir si une requête a été traitée ; il peut donc la relancer et provoquer des doublons, par exemple débiter un client deux fois. J'utiliserais une clé d'idempotence : le client génère une clé unique, comme un UUID, pour chaque opération logique et l'envoie dans un en-tête comme Idempotency-Key. Le serveur stocke la clé avec l'empreinte de la requête et le résultat dans la même transaction que l'opération métier, protégée par une contrainte d'unicité. Si une requête arrive avec une clé connue, le serveur renvoie la réponse stockée au lieu de la traiter à nouveau ; si une requête portant la même clé est encore en cours, il renvoie un conflit ou attend ; si la même clé arrive avec un contenu différent, il la rejette. Les clés expirent après une durée définie. Côté client, les relances utilisent un backoff exponentiel avec jitter. Ce pattern, utilisé par les prestataires de paiement, permet un traitement effectivement exactly-once au-dessus d'une livraison at-least-once.",
    explanation:
      "Les clés d'idempotence transforment des opérations risquées en opérations relançables sans danger. Le détail essentiel est de stocker la clé de façon atomique avec l'opération.",
    tips: ["Expliquez pourquoi des relances se produisent.", "Décrivez le stockage de la clé de façon atomique avec le résultat.", "Traitez les doublons concurrents et les contenus divergents."],
    commonMistakes: ["Vérifier les doublons sans contrainte d'unicité, ce qui laisse une race condition.", "Utiliser un horodatage comme clé."],
    followUpQuestions: ["Combien de temps conserveriez-vous les clés d'idempotence ?", "Quel est le lien avec le pattern outbox ?"],
  },
  "java-043": {
    question: "Qu'est-ce que l'injection de dépendances, et pourquoi est-elle utile ?",
    intent: "Le recruteur vérifie votre compréhension d'un principe de conception central utilisé par Spring et la plupart des frameworks modernes.",
    expectedAnswer:
      "L'injection de dépendances signifie qu'une classe reçoit de l'extérieur les objets dont elle dépend, au lieu de les créer elle-même. Par exemple, un OrderService reçoit un PaymentGateway dans son constructeur au lieu d'appeler new StripeGateway(). Cela réduit le couplage, car le service dépend d'une interface, facilite les tests, car on peut lui passer une fausse passerelle, et permet à un conteneur comme Spring de créer et d'assembler les objets selon la configuration. L'injection par constructeur est à privilégier, car les dépendances sont explicites, peuvent être final et l'objet est toujours entièrement initialisé.",
    explanation:
      "L'injection de dépendances est l'application pratique du principe d'inversion des dépendances. Son principal bénéfice au quotidien est la testabilité.",
    example: "class OrderService {\n  private final PaymentGateway gateway;\n  OrderService(PaymentGateway gateway) { this.gateway = gateway; }\n}",
    tips: ["Opposez-la à la création des dépendances avec new.", "Recommandez l'injection par constructeur."],
    commonMistakes: ["Confondre l'injection de dépendances avec le simple fait d'utiliser Spring.", "Utiliser l'injection par champ partout."],
    followUpQuestions: ["Pourquoi l'injection par champ est-elle déconseillée ?", "Qu'est-ce qu'un conteneur IoC ?"],
  },
  "java-044": {
    question: "Que sont les scopes de beans dans Spring, et quel problème peut poser leur mélange ?",
    intent: "Le recruteur vérifie votre compréhension du cycle de vie des beans et d'un piège classique de l'injection.",
    expectedAnswer:
      "Le scope par défaut est singleton : une seule instance par contexte d'application, partagée par tous les utilisateurs, qui doit donc être sans état ou thread-safe. Prototype crée une nouvelle instance chaque fois que le bean est demandé au conteneur. Les applications web disposent aussi des scopes request et session. Le piège classique consiste à injecter un bean de scope prototype ou request dans un singleton : l'injection n'a lieu qu'une seule fois, à la création du singleton, qui conserve donc indéfiniment la même instance. Les solutions sont d'injecter un ObjectProvider et d'appeler getObject() au moment voulu, d'utiliser un proxy de scope avec proxyMode, ou de recourir à l'injection de méthode avec @Lookup.",
    explanation:
      "Les scopes définissent le cycle de vie et le partage des beans. La plupart des bugs viennent d'un état propre à une requête stocké dans des singletons, ou d'une injection qui n'a lieu qu'une seule fois.",
    tips: ["Insistez sur le fait que les singletons sont partagés entre requêtes concurrentes.", "Expliquez le piège du prototype injecté dans un singleton et une solution."],
    commonMistakes: ["Stocker des données utilisateur dans un champ d'un service singleton."],
    followUpQuestions: ["Comment fonctionne un proxy de scope ?", "Quand utiliseriez-vous le scope prototype ?"],
  },
  "java-045": {
    question: "Comment résolvez-vous une situation où Spring trouve deux beans du même type ?",
    intent: "Le recruteur vérifie vos compétences pratiques de dépannage Spring et vos choix de configuration.",
    expectedAnswer:
      "Spring échoue avec une NoUniqueBeanDefinitionException lorsqu'un point d'injection correspond à plusieurs beans. Les options : désigner un bean par défaut avec @Primary ; sélectionner un bean précis au point d'injection avec @Qualifier et un nom ; les injecter tous sous forme de List<PaymentGateway> ou de Map<String, PaymentGateway> lorsque le code doit choisir dynamiquement, par exemple selon le type de paiement ; ou utiliser des conditions comme @ConditionalOnProperty ou des profils afin qu'un seul soit créé dans chaque environnement. Le bon choix dépend de l'intention : un bean par défaut avec des remplacements ponctuels correspond à @Primary, tandis qu'une stratégie choisie à l'exécution correspond à l'injection d'une map.",
    explanation:
      "Cette question montre si vous savez associer un mécanisme de configuration à l'intention de conception, au lieu d'appliquer des annotations par essais et erreurs.",
    tips: ["Énumérez les options.", "Expliquez quelle option correspond à quelle intention."],
    commonMistakes: ["Renommer des beans au hasard jusqu'à ce que l'erreur disparaisse."],
    followUpQuestions: ["Comment implémenteriez-vous un registre de stratégies avec Spring ?", "Quel est le nom d'un bean par défaut ?"],
  },
  "java-046": {
    question: "Qu'est-ce qu'une dépendance circulaire dans Spring, et comment la corriger proprement ?",
    intent: "Le recruteur évalue votre jugement en conception : traiter les dépendances circulaires comme un défaut de conception plutôt que comme un problème de configuration.",
    expectedAnswer:
      "Une dépendance circulaire se produit lorsque le bean A a besoin de B et que B a besoin de A, directement ou via une chaîne plus longue. Avec l'injection par constructeur, Spring ne peut créer aucun des deux beans, et depuis Spring Boot 2.6, les références circulaires sont interdites par défaut, même avec l'injection par champ. Des contournements techniques existent, comme @Lazy sur l'un des points d'injection ou l'injection par setter, mais ils masquent le vrai problème : deux classes sont trop fortement couplées ou une classe a trop de responsabilités. Les corrections appropriées consistent à extraire la logique commune dans un troisième bean dont les deux peuvent dépendre, à découper un service trop gros par responsabilité, à inverser l'une des dépendances au moyen d'une interface appartenant au module de plus bas niveau, ou à remplacer un appel direct par un événement applicatif lorsqu'un côté a seulement besoin de notifier l'autre. Après la correction, le graphe de dépendances doit être acyclique, ce qui rend aussi les modules plus faciles à tester et à séparer par la suite.",
    explanation:
      "Les dépendances circulaires signalent des problèmes de conception. Les candidats avancés corrigent la conception plutôt que de s'appuyer sur des proxys lazy, et ils connaissent le comportement par défaut de Spring Boot.",
    tips: ["Expliquez pourquoi l'injection par constructeur échoue.", "Mentionnez le comportement par défaut depuis Spring Boot 2.6.", "Proposez des corrections de conception, pas seulement @Lazy."],
    commonMistakes: ["Activer spring.main.allow-circular-references comme correction permanente.", "Passer à l'injection par champ pour masquer le cycle."],
    followUpQuestions: ["Comment les événements applicatifs réduisent-ils le couplage ?", "Comment détecteriez-vous automatiquement les cycles entre packages ?"],
  },
  "java-047": {
    question: "Quels sont les avantages et les inconvénients des microservices par rapport à un monolithe ?",
    intent: "Le recruteur vérifie que vous avez un jugement architectural équilibré plutôt qu'un simple enthousiasme pour une tendance.",
    expectedAnswer:
      "Les microservices découpent une application en petits services déployés indépendamment, chacun possédant ses propres données. Avantages : les équipes peuvent déployer et faire évoluer la capacité des services indépendamment, les pannes peuvent être isolées et chaque service peut utiliser la technologie qui lui convient. Inconvénients : les appels réseau ajoutent de la latence et de nouveaux modes de défaillance, la cohérence des données entre services devient plus difficile, les tests et le débogage nécessitent du tracing distribué, et l'exploitation exige une CI/CD, une supervision et une infrastructure matures. Un monolithe modulaire bien structuré est souvent un meilleur point de départ pour une petite équipe, les services étant extraits lorsqu'un besoin clair apparaît, comme une montée en charge indépendante ou l'autonomie des équipes.",
    explanation:
      "Les recruteurs apprécient les candidats qui voient les microservices comme un compromis guidé par des besoins d'organisation et de montée en charge.",
    tips: ["Présentez les deux côtés.", "Mentionnez le monolithe modulaire comme alternative."],
    commonMistakes: ["Présenter les microservices comme toujours meilleurs.", "Découper les services par couche technique plutôt que par capacité métier."],
    followUpQuestions: ["Comment définiriez-vous les frontières des services ?", "Comment les services communiquent-ils ?"],
  },
  "java-048": {
    question: "Comparez les appels REST synchrones et la messagerie asynchrone entre microservices.",
    intent: "Le recruteur vérifie votre compréhension des modes de communication et de leur impact sur le couplage et la fiabilité.",
    expectedAnswer:
      "Les appels synchrones avec REST ou gRPC sont simples et donnent une réponse immédiate, ce qui convient aux requêtes comme la vérification d'un prix. Mais ils créent un couplage temporel : si le service appelé est lent ou indisponible, l'appelant en subit les conséquences, et les longues chaînes d'appels multiplient la latence et le risque de panne. Timeouts, retries et disjoncteurs (circuit breakers) sont alors indispensables. La messagerie asynchrone avec un broker comme Kafka ou RabbitMQ découple les services dans le temps : le producteur publie un événement comme OrderPlaced et poursuit son traitement, et les consommateurs le traitent quand ils le peuvent. Elle améliore la résilience et permet à de nouveaux consommateurs de s'abonner sans modifier le producteur, mais elle implique une cohérence à terme (eventual consistency), un débogage plus difficile, des messages en double qui exigent des consommateurs idempotents, ainsi que la gestion de l'ordre des messages et des schémas. De nombreux systèmes utilisent des appels synchrones pour les lectures et des événements pour les changements d'état.",
    explanation:
      "Ce choix influe sur le couplage, la cohérence et le comportement en cas de panne. Une réponse équilibrée donne un cas d'usage pour chaque approche.",
    tips: ["Mentionnez le couplage temporel.", "Expliquez la cohérence à terme et les consommateurs idempotents."],
    commonMistakes: ["Construire de longues chaînes d'appels synchrones.", "Supposer que les messages sont livrés exactement une fois."],
    followUpQuestions: ["Comment géreriez-vous un message qui échoue systématiquement ?", "Qu'est-ce qu'une dead-letter queue ?"],
  },
  "java-049": {
    question: "Comment maintenez-vous la cohérence des données entre microservices sans transactions distribuées ?",
    intent: "Le recruteur évalue vos compétences avancées en conception de systèmes distribués : sagas, outbox et idempotence.",
    expectedAnswer:
      "Le commit à deux phases entre services est fragile et rarement pris en charge par les brokers modernes ; j'accepterais donc la cohérence à terme et je concevrais le système en conséquence. Une saga découpe un processus métier en transactions locales, chacune dans un seul service, avec des actions de compensation en cas d'échec. Par exemple, passer une commande réserve le stock, débite le paiement et confirme la commande ; si le paiement échoue, la réservation de stock est annulée. Les sagas peuvent être chorégraphiées, chaque service réagissant aux événements, ou orchestrées par un coordinateur qui suit l'état, ce qui est plus facile à comprendre pour des flux complexes. Pour publier les événements de façon fiable, j'utiliserais le pattern transactional outbox : le service écrit la modification métier et l'événement dans une table outbox au sein de la même transaction locale, puis un relais ou un outil de change data capture comme Debezium le publie sur le broker. Les consommateurs doivent être idempotents, par exemple en enregistrant les identifiants des messages traités, car la livraison est at-least-once. Je concevrais aussi des états visibles par les utilisateurs, comme « paiement en attente », et je surveillerais les sagas bloquées.",
    explanation:
      "Les sagas, l'outbox et les consommateurs idempotents constituent la boîte à outils standard. Les réponses avancées prennent aussi en compte les états intermédiaires visibles par les utilisateurs et la supervision.",
    tips: ["Expliquez pourquoi on évite les transactions distribuées.", "Décrivez la saga avec compensation et le pattern outbox.", "Mentionnez l'idempotence et la supervision."],
    commonMistakes: ["Publier un événement après le commit sans outbox, au risque de perdre des événements.", "Oublier que les compensations peuvent elles aussi échouer."],
    followUpQuestions: ["Chorégraphie ou orchestration : laquelle choisiriez-vous et pourquoi ?", "Comment gérez-vous une compensation qui échoue ?"],
  },
  "java-050": {
    question: "Comment découperiez-vous un monolithe en microservices ?",
    intent: "Le recruteur évalue vos compétences en architecture stratégique et votre gestion des risques pendant une migration.",
    expectedAnswer:
      "Je commencerais par interroger l'objectif : des déploiements indépendants plus rapides, la montée en charge d'un point chaud ou l'autonomie des équipes, car l'objectif détermine ce qu'il faut extraire en premier. J'identifierais ensuite les frontières à partir des capacités métier, en m'appuyant sur des notions du domain-driven design comme les bounded contexts, et j'examinerais le couplage du code et des données, par exemple les tables partagées. Avant d'extraire quoi que ce soit, je modulariserais souvent le monolithe en interne, en imposant des frontières entre modules pour rendre les dépendances explicites. J'extrairais d'abord un service à forte valeur et faiblement couplé, en utilisant le pattern strangler fig : router les appels relatifs à cette capacité vers le nouveau service au moyen d'une façade ou d'une gateway, garder le monolithe comme solution de repli pendant la transition et migrer ses données, avec une période de synchronisation si nécessaire. Chaque étape doit pouvoir être livrée et annulée. En parallèle, j'investirais dans les prérequis : une CI/CD par service, de l'observabilité avec du tracing et des tests de contrat. Je mesurerais si chaque extraction a réellement atteint l'objectif avant de continuer, et j'accepterais que certaines parties restent dans un monolithe bien structuré.",
    explanation:
      "Les migrations réussies sont incrémentales, guidées par un objectif et réversibles. Évoquer d'abord la modularisation et la séparation des données témoigne d'une expérience concrète.",
    tips: ["Partez de l'objectif métier.", "Mentionnez la modularisation avant l'extraction.", "Expliquez le pattern strangler fig et la migration des données."],
    commonMistakes: ["Proposer une réécriture complète en big bang.", "Extraire des services qui partagent encore les mêmes tables de base de données."],
    followUpQuestions: ["Comment découpez-vous une base de données partagée ?", "Qu'est-ce qui vous ferait arrêter la migration ?"],
  },
};
