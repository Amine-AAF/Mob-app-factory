import type { QuizText, TextTable } from '@/types/content';

/** French text for quiz items A: software, Java, frontend, general and behavioral (85 items). */
export const frA: TextTable<QuizText> = {
  // Software development (25)
  'q-sw-001': {
    prompt: "Quelle est la complexité temporelle moyenne de la recherche d'une clé dans une table de hachage ?",
    options: ["O(log n)", "O(1)", "O(n)", "O(n log n)"],
    explanation: "La fonction de hachage envoie directement la clé vers un compartiment : la recherche se fait donc en temps constant en moyenne. De nombreuses collisions peuvent la dégrader dans le pire des cas.",
  },
  'q-sw-002': {
    prompt: "Quelle condition est nécessaire pour utiliser la recherche dichotomique ?",
    options: ["Les valeurs doivent être uniques", "Les données doivent être stockées dans une liste chaînée", "Les données doivent être triées", "La collection doit contenir moins de 1 000 éléments"],
    explanation: "La recherche dichotomique compare avec l'élément du milieu et élimine la moitié des données à chaque étape, ce qui ne fonctionne que si les données sont triées.",
  },
  'q-sw-003': {
    prompt: "La notation Big O donne le temps d'exécution exact d'un algorithme en millisecondes.",
    explanation: "La notation Big O décrit la croissance du temps d'exécution ou de la mémoire en fonction de la taille de l'entrée, sans tenir compte des constantes. Elle ne donne pas de durée exacte.",
  },
  'q-sw-004': {
    prompt: "Quelle structure de données suit le principe « dernier entré, premier sorti » ?",
    options: ["Pile", "File", "File de priorité", "Table de hachage"],
    explanation: "Une pile renvoie d'abord l'élément ajouté le plus récemment, ce qui est utile pour un historique d'annulation et un parcours en profondeur.",
  },
  'q-sw-005': {
    prompt: "Quel principe de la POO cache l'état interne d'un objet derrière des méthodes ?",
    options: ["Héritage", "Polymorphisme", "Abstraction", "Encapsulation"],
    explanation: "L'encapsulation garde les champs privés et expose le comportement par des méthodes : l'objet protège ainsi sa propre cohérence.",
  },
  'q-sw-006': {
    prompt: "La surcharge de méthode est résolue à l'exécution selon le type réel de l'objet.",
    explanation: "La surcharge est résolue à la compilation à partir des types de paramètres déclarés. C'est la redéfinition (overriding) qui est résolue à l'exécution par liaison dynamique.",
  },
  'q-sw-007': {
    prompt: "Quel principe SOLID indique qu'un sous-type doit pouvoir être utilisé partout où son type parent est attendu ?",
    options: ["Responsabilité unique", "Substitution de Liskov", "Ségrégation des interfaces", "Inversion des dépendances"],
    explanation: "Le principe de substitution de Liskov exige que les sous-types respectent le comportement promis par leur parent, pas seulement les signatures de ses méthodes.",
  },
  'q-sw-008': {
    prompt: "Quel design pattern permet d'interchanger des algorithmes derrière une interface commune ?",
    options: ["Observer", "Singleton", "Strategy", "Adapter"],
    explanation: "Le pattern Strategy définit une famille d'algorithmes derrière une même interface : le client peut en choisir un à l'exécution sans longues conditions.",
  },
  'q-sw-009': {
    prompt: "Une critique courante du pattern Singleton est que l'accès global masque les dépendances et rend les tests plus difficiles.",
    explanation: "Le code peut atteindre un singleton de n'importe où, ce qui crée un couplage implicite. Injecter une instance unique par injection de dépendances évite ce problème.",
  },
  'q-sw-010': {
    prompt: "Quel type de test vérifie un scénario utilisateur complet à travers tout le système ?",
    options: ["Test unitaire", "Test d'intégration", "Test de contrat", "Test de bout en bout"],
    explanation: "Les tests de bout en bout exécutent des parcours utilisateur complets, comme une inscription via l'interface. Ils donnent confiance mais sont plus lents et plus fragiles.",
  },
  'q-sw-011': {
    prompt: "En développement piloté par les tests (TDD), quelle est la première étape du cycle ?",
    options: ["Écrire un petit test qui échoue", "Refactoriser le code existant", "Écrire l'implémentation complète", "Mesurer la couverture de code"],
    explanation: "Le TDD suit le cycle rouge, vert, refactorisation : écrire un test qui échoue, le faire passer avec le code le plus simple, puis améliorer la conception.",
  },
  'q-sw-012': {
    prompt: "Une suite de tests avec 100 % de couverture de code prouve que le code n'a aucun bug.",
    explanation: "La couverture montre seulement quelles lignes ont été exécutées. Des tests peuvent exécuter du code sans assertions utiles, et les scénarios oubliés restent non testés.",
  },
  'q-sw-013': {
    prompt: "Quelle doit généralement être votre première étape pour déboguer un problème signalé ?",
    options: ["Réécrire le module suspect", "Reproduire le problème de façon fiable", "Ajouter des serveurs", "Demander aux utilisateurs de vider leur cache"],
    explanation: "Reproduire le bug avec des étapes et des entrées connues vous permet de tester des hypothèses et de confirmer que votre correctif fonctionne réellement.",
  },
  'q-sw-014': {
    prompt: "Quelle commande Git aide à trouver le commit qui a introduit un bug par recherche dichotomique dans l'historique ?",
    options: ["git blame", "git log", "git bisect", "git stash"],
    explanation: "git bisect teste les commits entre une version connue comme bonne et une version connue comme mauvaise, en divisant l'intervalle par deux à chaque fois jusqu'à trouver le commit fautif.",
  },
  'q-sw-015': {
    prompt: "Les fuites de mémoire ne peuvent pas se produire dans les langages dotés d'un ramasse-miettes.",
    explanation: "Un ramasse-miettes ne libère que les objets inaccessibles. Les objets conservés par erreur, par exemple dans des caches non bornés ou des listeners, provoquent quand même des fuites.",
  },
  'q-sw-016': {
    prompt: "Où sont généralement stockées les variables locales d'une fonction ?",
    options: ["Sur la pile", "Uniquement dans le tas", "Uniquement dans le cache du processeur", "Sur le disque"],
    explanation: "Chaque appel de fonction reçoit un cadre de pile contenant les variables locales et les paramètres, qui disparaît au retour de la fonction.",
  },
  'q-sw-017': {
    prompt: "Que permet le code asynchrone à un seul thread ?",
    options: ["Exécuter plusieurs tâches gourmandes en CPU réellement en parallèle", "Se passer de toute gestion d'erreurs", "Travailler sur d'autres tâches en attendant les E/S", "Contourner la boucle d'événements"],
    explanation: "Pendant qu'une opération réseau ou fichier est en attente, le thread peut traiter d'autres travaux. Asynchrone ne signifie pas automatiquement parallèle.",
  },
  'q-sw-018': {
    prompt: "Les threads d'un même processus partagent le même espace mémoire.",
    explanation: "Les threads partagent la mémoire du processus, ce qui facilite la communication mais impose une synchronisation pour éviter les situations de concurrence (race conditions).",
  },
  'q-sw-019': {
    prompt: "Quel nom de fonction respecte le mieux les bonnes pratiques de nommage du clean code ?",
    options: ["doStuff()", "handle2()", "sendInvoiceReminder()", "mgr()"],
    explanation: "Un bon nom de fonction est un groupe verbal qui décrit son effet : le lecteur la comprend sans ouvrir son implémentation.",
  },
  'q-sw-020': {
    prompt: "Qu'est-ce que la dette technique ?",
    options: ["L'argent dû aux éditeurs de logiciels", "Le coût futur du choix d'une solution plus rapide ou plus simple aujourd'hui", "Le nombre de bugs ouverts dans un outil de suivi", "Les serveurs inutilisés dans le cloud"],
    explanation: "Comme une dette financière, la dette technique peut être un choix raisonnable, mais ses « intérêts » se traduisent par des évolutions plus lentes et davantage de bugs.",
  },
  'q-sw-021': {
    prompt: "Quelle combinaison offre des opérations get et put en O(1) pour un cache LRU ?",
    options: ["Une table de hachage et une liste doublement chaînée", "Un tableau trié et une recherche dichotomique", "Uniquement un arbre binaire de recherche", "Une pile et une file"],
    explanation: "La table de hachage offre une recherche en temps constant et la liste doublement chaînée garde les entrées triées par utilisation récente, avec déplacements et suppressions en temps constant.",
  },
  'q-sw-022': {
    prompt: "Un filtre de Bloom peut renvoyer des faux négatifs : il peut indiquer qu'un élément est absent alors qu'il a été ajouté.",
    explanation: "Les filtres de Bloom peuvent renvoyer des faux positifs mais jamais de faux négatifs, ce qui les rend utiles pour éviter en toute sécurité des recherches coûteuses.",
  },
  'q-sw-023': {
    prompt: "Pourquoi l'algorithme de Dijkstra est-il inadapté aux graphes ayant des arêtes de poids négatif ?",
    options: ["Il ne fonctionne que sur des arbres", "Il ne peut pas utiliser de file de priorité", "Il considère comme définitif un nœud retiré de la file", "Il manque de mémoire"],
    explanation: "Dijkstra suppose qu'une plus courte distance est définitive dès qu'un nœud est retiré. Des arêtes négatives peuvent ensuite produire un chemin plus court : on utilise alors Bellman-Ford.",
  },
  'q-sw-024': {
    prompt: "Dans un système de microservices, quelle pratique détecte le mieux les changements d'API cassants entre services avant le déploiement ?",
    options: ["Davantage de tests manuels", "Les tests de contrat pilotés par le consommateur", "Uniquement des suites de bout en bout plus grandes", "La désactivation du versionnage"],
    explanation: "Les tests de contrat permettent à chaque consommateur de publier ses attentes, que le fournisseur vérifie dans son pipeline sans exécuter tout le système.",
  },
  'q-sw-025': {
    prompt: "Lors d'un incident grave, rétablir rapidement le service passe généralement avant la recherche du correctif parfait de la cause racine.",
    explanation: "Une mesure d'atténuation comme un rollback ou un feature flag limite d'abord l'impact sur les utilisateurs. La cause racine est corrigée proprement une fois le service stabilisé.",
  },

  // Java & Spring Boot (25)
  'q-java-001': {
    prompt: "En Java, que compare == pour deux références d'objets ?",
    options: ["Leur contenu", "Leurs codes de hachage", "Leurs références, c'est-à-dire s'il s'agit du même objet", "Leurs représentations textuelles"],
    explanation: "Pour les objets, == vérifie l'identité. equals() compare l'égalité logique définie par la classe, par exemple le contenu d'une String.",
  },
  'q-java-002': {
    prompt: "Si deux objets sont égaux selon equals(), ils doivent renvoyer le même hashCode().",
    explanation: "Les collections basées sur le hachage utilisent hashCode() pour trouver le compartiment : des objets égaux avec des codes de hachage différents cassent HashMap et HashSet.",
  },
  'q-java-003': {
    prompt: "Dans quel cas StringBuilder est-il le plus utile ?",
    options: ["Comparer deux chaînes", "Construire une chaîne étape par étape dans une boucle", "Stocker des mots de passe de façon sécurisée", "Convertir une seule fois des nombres en texte"],
    explanation: "String est immuable : des concaténations répétées dans une boucle créent de nombreux objets temporaires. StringBuilder ajoute le texte dans un tampon modifiable.",
  },
  'q-java-004': {
    prompt: "Laquelle de ces exceptions est une exception vérifiée (checked) en Java ?",
    options: ["IOException", "NullPointerException", "IllegalArgumentException", "ArithmeticException"],
    explanation: "IOException hérite d'Exception mais pas de RuntimeException : le compilateur oblige donc les appelants à l'intercepter ou à la déclarer.",
  },
  'q-java-005': {
    prompt: "Déclarer une variable List comme final rend la liste elle-même immuable.",
    explanation: "final empêche seulement de réaffecter la variable. La liste peut toujours être modifiée, sauf s'il s'agit d'une liste immuable comme List.of().",
  },
  'q-java-006': {
    prompt: "Que génère automatiquement le compilateur pour un record Java ?",
    options: ["Des setters pour chaque champ", "Un constructeur sans argument", "Des accesseurs, equals(), hashCode() et toString()", "Une classe builder"],
    explanation: "Les records sont des porteurs de données immuables : le compilateur génère des champs private final, un constructeur canonique, des accesseurs et des méthodes basées sur la valeur.",
  },
  'q-java-007': {
    prompt: "Quelle collection choisir pour stocker des éléments uniques dans un ordre trié ?",
    options: ["ArrayList", "HashSet", "LinkedList", "TreeSet"],
    explanation: "TreeSet garde des éléments uniques triés grâce à un arbre rouge-noir. HashSet garantit l'unicité mais aucun ordre.",
  },
  'q-java-008': {
    prompt: "Depuis Java 8, un compartiment de HashMap comportant de nombreuses collisions peut être converti en arbre équilibré.",
    explanation: "Quand un compartiment dépasse un seuil et que la table est assez grande, il est transformé en arbre, ce qui améliore le pire cas de O(n) à O(log n).",
  },
  'q-java-009': {
    prompt: "Quelle est la façon la plus simple et sûre de supprimer d'une ArrayList les éléments qui respectent une condition ?",
    options: ["Appeler remove() dans une boucle for-each", "Utiliser list.removeIf(condition)", "Mettre les éléments à null", "Intercepter ConcurrentModificationException"],
    explanation: "removeIf modifie la liste en toute sécurité. Supprimer dans une boucle for-each déclenche une ConcurrentModificationException, même dans du code monothread.",
  },
  'q-java-010': {
    prompt: "Sur une ConcurrentHashMap, quelle approche incrémente un compteur de façon atomique ?",
    options: ["if (!map.containsKey(k)) map.put(k, 1)", "map.put(k, map.get(k) + 1)", "map.merge(k, 1, Integer::sum)", "synchronized sur un nouvel Object à chaque fois"],
    explanation: "merge effectue la lecture et la mise à jour en une seule opération atomique. Les séquences « vérifier puis agir » ne sont pas atomiques, même sur une map concurrente.",
  },
  'q-java-011': {
    prompt: "Collections.unmodifiableList() renvoie une copie indépendante qui ne change jamais.",
    explanation: "Elle renvoie une vue en lecture seule. Les modifications de la liste sous-jacente restent visibles à travers cette vue. List.copyOf() crée une copie immuable.",
  },
  'q-java-012': {
    prompt: "Quand un pipeline de stream Java traite-t-il réellement ses éléments ?",
    options: ["Lorsque filter() est appelé", "Lorsque le stream est créé", "Lorsqu'une opération terminale comme collect() est appelée", "Immédiatement après chaque map()"],
    explanation: "Les opérations intermédiaires sont paresseuses. Le traitement ne commence que lorsqu'une opération terminale est invoquée.",
  },
  'q-java-013': {
    prompt: "Quelle opération transforme un Stream<Order> en Stream<Item> lorsque chaque commande contient une liste d'articles ?",
    options: ["map(Order::items)", "flatMap(o -> o.items().stream())", "filter(Order::items)", "reduce(Order::items)"],
    explanation: "flatMap associe chaque élément à un stream et aplatit les résultats. map donnerait un Stream<List<Item>>.",
  },
  'q-java-014': {
    prompt: "Optional est conçu principalement comme type de retour, et non pour des champs ou des paramètres de méthode.",
    explanation: "Optional signale qu'un résultat peut être absent. L'utiliser pour des champs ou des paramètres ajoute un surcoût et complique les API.",
  },
  'q-java-015': {
    prompt: "Dans quelle situation un stream parallèle est-il peu adapté ?",
    options: ["Un traitement gourmand en CPU sur une grande ArrayList", "L'appel d'une API HTTP distante pour chaque élément", "La somme d'un grand tableau de primitives", "Des transformations sans état d'éléments indépendants"],
    explanation: "Des E/S bloquantes dans un stream parallèle monopolisent le ForkJoinPool partagé. Les streams parallèles aident surtout pour du travail limité par le CPU sur des sources divisibles.",
  },
  'q-java-016': {
    prompt: "Que se passe-t-il si vous appelez run() au lieu de start() sur un Thread ?",
    options: ["Un nouveau thread est créé deux fois", "Le code s'exécute sur le thread courant", "Une exception est levée", "La JVM s'arrête"],
    explanation: "start() crée un nouveau thread qui appelle ensuite run(). Appeler run() directement exécute simplement la méthode sur le thread appelant.",
  },
  'q-java-017': {
    prompt: "Déclarer un compteur int comme volatile rend count++ thread-safe.",
    explanation: "volatile garantit la visibilité, pas l'atomicité. count++ est une lecture, un incrément et une écriture : utilisez AtomicInteger ou un verrou.",
  },
  'q-java-018': {
    prompt: "Quelle est la façon la plus fiable d'éviter les interblocages (deadlocks) entre deux verrous ?",
    options: ["Utiliser plus de threads", "Toujours acquérir les verrous dans le même ordre global", "Augmenter la taille du tas", "Appeler System.gc() régulièrement"],
    explanation: "Un interblocage nécessite un cycle d'attente. Acquérir les verrous dans un ordre cohérent rompt ce cycle.",
  },
  'q-java-019': {
    prompt: "Pour quelle charge de travail les threads virtuels de Java 21 apportent-ils le plus de bénéfices ?",
    options: ["Les calculs limités par le CPU", "Les services limités par les E/S avec de nombreux appels bloquants simultanés", "Les scripts batch monothread", "Les calculs sur GPU"],
    explanation: "Les threads virtuels sont démontés pendant qu'ils attendent des E/S : de nombreuses requêtes peuvent donc attendre à faible coût. Ils n'accélèrent pas le travail limité par le CPU.",
  },
  'q-java-020': {
    prompt: "Où la JVM stocke-t-elle les métadonnées des classes depuis Java 8 ?",
    options: ["PermGen", "La jeune génération", "Metaspace", "La pile du thread"],
    explanation: "Metaspace a remplacé PermGen dans Java 8 et stocke les métadonnées des classes en mémoire native.",
  },
  'q-java-021': {
    prompt: "La limite mémoire d'un conteneur doit être égale à la valeur -Xmx de la JVM.",
    explanation: "La JVM utilise aussi de la mémoire hors tas, comme le metaspace, les piles des threads et le cache de code : le conteneur a donc besoin de plus que la taille du tas.",
  },
  'q-java-022': {
    prompt: "Pourquoi une méthode @Transactional appelée depuis une autre méthode de la même classe s'exécute-t-elle souvent sans transaction ?",
    options: ["Spring ignore les annotations sur les méthodes publiques", "L'appel contourne le proxy Spring", "Les transactions ne fonctionnent qu'avec des interfaces", "La méthode doit être static"],
    explanation: "Spring applique les transactions via un proxy. Un auto-appel invoque la méthode directement sur l'objet : le proxy n'intervient donc pas.",
  },
  'q-java-023': {
    prompt: "Quel code de statut HTTP convient à la requête d'un utilisateur authentifié qui n'a pas l'autorisation ?",
    options: ["401 Unauthorized", "403 Forbidden", "404 Not Found", "500 Internal Server Error"],
    explanation: "401 signifie que l'authentification est absente ou invalide ; 403 signifie que l'utilisateur est connu mais n'est pas autorisé à effectuer l'action.",
  },
  'q-java-024': {
    prompt: "Dans une API REST, PUT et DELETE sont censés être idempotents.",
    explanation: "Répéter un PUT ou un DELETE laisse la ressource dans le même état : les clients peuvent donc les relancer sans risque. POST n'est pas idempotent.",
  },
  'q-java-025': {
    prompt: "Quel pattern publie des événements de façon fiable en même temps qu'une modification en base de données dans un microservice ?",
    options: ["Un commit en deux phases entre tous les services", "Le transactional outbox", "Une base de données partagée entre les services", "L'interrogation régulière de l'interface utilisateur"],
    explanation: "L'outbox enregistre l'événement dans la même transaction locale que la modification métier, puis un relais le publie : les événements ne sont donc pas perdus.",
  },

  // Frontend (25)
  'q-fe-001': {
    prompt: "Quelle affirmation sur const en JavaScript est correcte ?",
    options: ["Un objet const ne peut pas être modifié", "Une variable const ne peut pas être réaffectée", "const a une portée de fonction", "Les variables const sont hissées et initialisées à undefined"],
    explanation: "const empêche la réaffectation de la liaison, mais les objets et tableaux qui lui sont affectés peuvent toujours être modifiés.",
  },
  'q-fe-002': {
    prompt: 'En JavaScript, 0 == "" est évalué à true.',
    explanation: "L'égalité souple convertit les deux valeurs avant de les comparer, ce qui donne des résultats surprenants. L'égalité stricte === évite ce problème.",
  },
  'q-fe-003': {
    prompt: "Que renvoie count ?? 10 lorsque count vaut 0 ?",
    options: ["10", "0", "undefined", "null"],
    explanation: "L'opérateur de coalescence des nuls ne remplace que null ou undefined. count || 10 renverrait 10, car 0 est une valeur falsy.",
  },
  'q-fe-004': {
    prompt: 'Dans quel ordre ces messages sont-ils affichés ? console.log("A"); setTimeout(() => console.log("B")); Promise.resolve().then(() => console.log("C")); console.log("D");',
    options: ["A, B, C, D", "A, D, B, C", "A, D, C, B", "A, C, D, B"],
    explanation: "Le code synchrone s'exécute d'abord, puis les microtâches comme les callbacks de promesses, puis les macrotâches comme les timers.",
  },
  'q-fe-005': {
    prompt: "fetch() rejette sa promesse lorsque le serveur répond avec un HTTP 404.",
    explanation: "fetch ne rejette qu'en cas d'échec réseau. Vous devez vérifier response.ok ou le code de statut pour détecter les erreurs HTTP.",
  },
  'q-fe-006': {
    prompt: "Qu'est-ce qu'une closure (fermeture) en JavaScript ?",
    options: ["Une fonction qui ne peut pas être appelée deux fois", "Une fonction accompagnée des variables de la portée où elle a été créée", "Un moyen de fermer des onglets du navigateur", "Une méthode privée de classe"],
    explanation: "Les closures permettent aux fonctions internes de garder l'accès aux variables externes après le retour de la fonction externe.",
  },
  'q-fe-007': {
    prompt: "Pourquoi les modules ES permettent-ils un meilleur tree shaking que CommonJS ?",
    options: ["Ils se chargent plus vite via HTTP", "Leurs imports et exports sont statiques et analysables avant l'exécution", "Ils sont toujours plus petits", "Ils ne peuvent pas importer d'autres modules"],
    explanation: "Les bundlers peuvent analyser les graphes d'imports statiques et supprimer les exports inutilisés. Les appels require de CommonJS sont dynamiques et résolus à l'exécution.",
  },
  'q-fe-008': {
    prompt: "Quel type TypeScript privilégier pour des données dont vous n'avez pas encore validé la forme ?",
    options: ["any", "unknown", "never", "object"],
    explanation: "unknown accepte n'importe quelle valeur mais vous oblige à affiner son type avant de l'utiliser, ce qui préserve la sûreté du typage. any désactive complètement les vérifications.",
  },
  'q-fe-009': {
    prompt: "Les types TypeScript sont vérifiés à l'exécution dans le navigateur.",
    explanation: "Les types sont effacés lors de la compilation. Une validation à l'exécution, par exemple avec une bibliothèque de schémas, est nécessaire pour les données externes.",
  },
  'q-fe-010': {
    prompt: "Quel type utilitaire crée un type sans la propriété password de User ?",
    options: ['Pick<User, "password">', "Partial<User>", 'Omit<User, "password">', "Required<User>"],
    explanation: "Omit supprime les clés indiquées. Pick ne conserverait que la propriété password.",
  },
  'q-fe-011': {
    prompt: "Qu'est-ce qui rend un type union « discriminé » ?",
    options: ["Il utilise le mot-clé class", "Tous ses membres partagent une propriété littérale comme status", "Il ne contient que des types primitifs", "Il est déclaré avec une interface"],
    explanation: "Une propriété littérale commune permet à TypeScript d'affiner le type après l'avoir vérifiée, et rend possibles les switch exhaustifs.",
  },
  'q-fe-012': {
    prompt: "En React, quelle affirmation sur les props est correcte ?",
    options: ["Un composant peut modifier ses propres props", "Les props sont des entrées en lecture seule transmises par le parent", "Les props sont stockées dans le localStorage", "Les props remplacent complètement le state"],
    explanation: "Les props viennent du parent et doivent être traitées en lecture seule. Le state appartient au composant, qui le met à jour lui-même.",
  },
  'q-fe-013': {
    prompt: "Utiliser l'index du tableau comme key est toujours sûr, même lorsque les éléments de la liste peuvent être réordonnés.",
    explanation: "En cas de réordonnancement, d'insertion ou de filtrage, les keys basées sur l'index font associer à React les mauvais éléments, ce qui peut mélanger leur state.",
  },
  'q-fe-014': {
    prompt: "Quand la fonction de nettoyage d'un useEffect s'exécute-t-elle ?",
    options: ["Uniquement au premier rendu", "Avant que l'effet ne s'exécute à nouveau et au démontage du composant", "Uniquement au rechargement de la page", "Jamais automatiquement"],
    explanation: "Le nettoyage supprime les listeners, timers ou abonnements de l'exécution précédente, ce qui évite les fuites et les mises à jour obsolètes.",
  },
  'q-fe-015': {
    prompt: "Que fait généralement l'appel de setCount(count + 1) deux fois dans le même gestionnaire de clic ?",
    options: ["Il incrémente de 2", "Il incrémente de 1", "Il lève une erreur", "Il réinitialise le compteur"],
    explanation: "Les deux appels lisent le même instantané de count. Utilisez la forme avec fonction de mise à jour setCount(c => c + 1) pour incrémenter deux fois.",
  },
  'q-fe-016': {
    prompt: "Deux composants qui appellent le même hook personnalisé partagent le même state.",
    explanation: "Chaque appel à un hook crée un state indépendant. Les hooks personnalisés partagent de la logique, pas des données.",
  },
  'q-fe-017': {
    prompt: "Pourquoi React.memo peut-il ne pas empêcher un nouveau rendu ?",
    options: ["memo ne fonctionne que dans les composants de classe", "Le parent transmet une nouvelle prop objet ou fonction à chaque rendu", "Le composant utilise JSX", "Le composant n'a pas de state"],
    explanation: "memo compare les props de façon superficielle. De nouvelles identités d'objets ou de fonctions font paraître les props différentes ; useMemo et useCallback préservent l'identité.",
  },
  'q-fe-018': {
    prompt: "Quel est un avantage clé des React Server Components ?",
    options: ["Ils exécutent les animations plus vite", "Ils n'ajoutent pas de JavaScript pour ces composants au bundle client", "Ils remplacent le CSS", "Ils fonctionnent sans serveur"],
    explanation: "Les Server Components s'exécutent sur le serveur et envoient un résultat sérialisé : leur code n'a donc pas besoin d'être téléchargé par le navigateur.",
  },
  'q-fe-019': {
    prompt: "Que rend React Native sur l'appareil ?",
    options: ["Du HTML dans une WebView", "Des vues natives de la plateforme", "Uniquement des dessins sur canvas", "Des documents PDF"],
    explanation: "React Native utilise des composants React mais rend de véritables vues natives, et non une page web.",
  },
  'q-fe-020': {
    prompt: "FlatList ne rend que les éléments proches de la zone visible au lieu de la liste entière.",
    explanation: "FlatList virtualise la liste, ce qui maintient des coûts de mémoire et de rendu faibles pour les longues listes.",
  },
  'q-fe-021': {
    prompt: "Où une application mobile doit-elle stocker un jeton d'authentification ?",
    options: ["AsyncStorage", "Une variable globale", "Un stockage sécurisé reposant sur le Keystore ou le Keychain", "Dans le bundle de l'application"],
    explanation: "Les jetons sont sensibles. Un stockage sécurisé comme expo-secure-store utilise l'Android Keystore ou le Keychain iOS.",
  },
  'q-fe-022': {
    prompt: "Avec box-sizing: border-box, que comprend la propriété width ?",
    options: ["Uniquement le contenu", "Le contenu, le padding et la bordure", "Le contenu et la marge", "Uniquement la bordure"],
    explanation: "border-box inclut le padding et la bordure dans la largeur, ce qui rend le dimensionnement plus facile à raisonner.",
  },
  'q-fe-023': {
    prompt: "Quel est le ratio de contraste minimal recommandé par les WCAG pour un texte courant de taille normale (niveau AA) ?",
    options: ["2:1", "3:1", "4,5:1", "10:1"],
    explanation: "Le niveau AA des WCAG exige au moins 4,5:1 pour le texte normal et 3:1 pour le grand texte, afin que le texte reste lisible pour davantage de personnes.",
  },
  'q-fe-024': {
    prompt: "Quel Core Web Vital mesure la réactivité aux interactions de l'utilisateur ?",
    options: ["LCP", "CLS", "INP", "TTFB"],
    explanation: "Interaction to Next Paint a remplacé First Input Delay en 2024. LCP mesure le chargement et CLS la stabilité visuelle.",
  },
  'q-fe-025': {
    prompt: "Les ressources statiques dont le nom de fichier contient un hachage du contenu peuvent être mises en cache sans risque pendant très longtemps.",
    explanation: "Un nouveau déploiement change le nom du fichier : les navigateurs récupèrent donc la nouvelle version, tandis que les anciens fichiers en cache restent valides.",
  },

  // General (5)
  'q-gen-001': {
    prompt: "Quelle structure fonctionne bien pour répondre à « Parlez-moi de vous » ?",
    options: ["Toute votre histoire depuis l'école", "Présent, passé, futur", "Une liste de loisirs", "Vos prétentions salariales"],
    explanation: "Présentez votre poste actuel, l'expérience qui vous y a mené et pourquoi ce poste est l'étape suivante, en une à deux minutes environ.",
  },
  'q-gen-002': {
    prompt: "« Je suis trop perfectionniste » est généralement considéré comme une excellente réponse à la question sur les faiblesses.",
    explanation: "Les recruteurs y voient une qualité déguisée. Une vraie faiblesse, non critique, accompagnée d'actions d'amélioration concrètes, est plus crédible.",
  },
  'q-gen-003': {
    prompt: "Quelle est la meilleure façon d'expliquer pourquoi vous quittez votre poste actuel ?",
    options: ["Critiquer votre manager", "Mettre l'accent sur ce vers quoi vous allez", "Dire que vous vous ennuyiez", "Éviter la question"],
    explanation: "Des raisons positives, tournées vers l'évolution, rassurent le recruteur et montrent votre professionnalisme envers votre employeur actuel.",
  },
  'q-gen-004': {
    prompt: "Comment vous préparer à la question « Que savez-vous de notre entreprise ? »",
    options: ["Mémoriser la date de création", "Vous renseigner sur le produit, les clients et l'actualité récente, et les relier à votre intérêt", "Lire uniquement l'intitulé du poste", "Demander au recruteur de l'expliquer"],
    explanation: "Les recruteurs attendent que vous sachiez ce que fait l'entreprise et pourquoi elle vous intéresse, pas que vous récitiez son histoire.",
  },
  'q-gen-005': {
    prompt: "Quand on vous demande où vous vous voyez dans cinq ans, il vaut mieux décrire une direction en termes de compétences et d'impact plutôt qu'un intitulé de poste précis.",
    explanation: "Une direction réaliste et cohérente avec le poste est plus crédible qu'un intitulé rigide ou qu'une ambition que l'entreprise ne peut pas offrir.",
  },

  // Behavioral (5)
  'q-beh-001': {
    prompt: "Que signifient les lettres de la méthode STAR ?",
    options: ["Strategy, Task, Analysis, Review (Stratégie, Tâche, Analyse, Revue)", "Situation, Task, Action, Result (Situation, Tâche, Action, Résultat)", "Skills, Talent, Ambition, Results (Compétences, Talent, Ambition, Résultats)", "Situation, Team, Approach, Risk (Situation, Équipe, Approche, Risque)"],
    explanation: "La méthode STAR structure les réponses comportementales : le contexte, votre responsabilité, ce que vous avez fait et le résultat mesurable.",
  },
  'q-beh-002': {
    prompt: "Dans une réponse STAR, quelle partie doit généralement être la plus longue ?",
    options: ["Situation", "Tâche (Task)", "Action", "Résultat (Result)"],
    explanation: "L'Action montre ce que vous avez fait personnellement, et c'est précisément ce que les recruteurs veulent évaluer.",
  },
  'q-beh-003': {
    prompt: "Dans les réponses comportementales, dire « nous » tout du long vaut mieux que dire « je », car cela montre l'esprit d'équipe.",
    explanation: "Les recruteurs ont besoin de connaître votre contribution. Décrivez vos actions avec « je » et reconnaissez le mérite des autres lorsque c'est justifié.",
  },
  'q-beh-004': {
    prompt: "Qu'est-ce qui fait une bonne réponse sur une erreur que vous avez commise ?",
    options: ["Choisir une erreur causée par un collègue", "Dire que vous ne faites jamais d'erreurs", "L'assumer, en limiter l'impact et expliquer le garde-fou que vous avez ajouté", "Décrire en détail une erreur catastrophique"],
    explanation: "Les recruteurs recherchent l'honnêteté, une réaction rapide et un apprentissage qui empêche l'erreur de se reproduire.",
  },
  'q-beh-005': {
    prompt: "Lorsque vous êtes en désaccord avec votre manager, en parler en privé avec des éléments concrets puis respecter la décision finale est une approche professionnelle.",
    explanation: "Cela montre à la fois le courage de remettre en question et la loyauté de soutenir la décision, tout en réduisant les risques lorsque c'est possible.",
  },
};
