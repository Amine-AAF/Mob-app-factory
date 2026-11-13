import type { QuestionText, TextTable } from '@/types/content';

/** Questions Java 001-025 : fondamentaux, collections, streams, concurrence (partie). */
export const frA: TextTable<QuestionText> = {
  'java-001': {
    question: "Quelle est la différence entre == et equals() en Java ?",
    intent: "Le recruteur vérifie une distinction fondamentale à l'origine de nombreux bugs réels, notamment avec les chaînes et les types wrapper.",
    expectedAnswer:
      "Pour les objets, == compare les références : le résultat est vrai uniquement si les deux variables pointent vers le même objet en mémoire. equals() compare l'égalité logique telle que la classe la définit. String redéfinit equals() pour comparer les caractères : new String(\"a\") == new String(\"a\") vaut donc false, alors que equals() renvoie true. Pour les primitifs comme int, == compare directement les valeurs. Si une classe ne redéfinit pas equals(), elle hérite d'Object.equals(), qui se comporte comme ==.",
    explanation:
      "Utiliser == sur des chaînes peut sembler fonctionner grâce au string pool, qui réutilise les chaînes littérales, mais cela échoue avec des chaînes construites à l'exécution. Le même piège existe avec les valeurs Integer situées hors de la petite plage mise en cache.",
    example: "Integer a = 1000, b = 1000; a == b  // false : objets différents\na.equals(b)  // true",
    tips: ["Citez le string pool pour expliquer pourquoi == semble parfois fonctionner.", "Utilisez Objects.equals(a, b) pour éviter une NullPointerException."],
    commonMistakes: ["Comparer des chaînes avec ==.", "Oublier que les types wrapper comme Integer sont des objets."],
    followUpQuestions: ["Quel est le contrat entre equals() et hashCode() ?", "Qu'est-ce que le cache d'Integer ?"],
  },
  'java-002': {
    question: "Quel est le contrat entre equals() et hashCode(), et pourquoi est-il important ?",
    intent: "Le recruteur veut s'assurer que vous comprenez comment les collections basées sur le hachage s'appuient sur ces deux méthodes.",
    expectedAnswer:
      "Si deux objets sont égaux au sens d'equals(), ils doivent renvoyer le même hashCode(). L'inverse n'est pas exigé : des objets différents peuvent partager un même code de hachage. HashMap et HashSet utilisent d'abord hashCode() pour trouver le bucket, puis equals() pour trouver l'entrée exacte. Si vous redéfinissez equals() sans hashCode(), deux objets égaux peuvent atterrir dans des buckets différents : un set peut alors contenir des doublons et les recherches dans une map échouent. Les deux méthodes doivent s'appuyer sur les mêmes champs, et ces champs ne doivent pas changer tant que l'objet sert de clé.",
    explanation:
      "C'est ce contrat qui fait fonctionner les collections à base de hachage. Les records et les générateurs des IDE produisent des implémentations cohérentes, ce qui évite la plupart des erreurs.",
    tips: ["Redéfinissez toujours les deux méthodes ensemble.", "Précisez que les records les génèrent automatiquement."],
    commonMistakes: ["Redéfinir uniquement equals().", "Utiliser des champs mutables dans hashCode() pour des objets stockés comme clés."],
    followUpQuestions: ["Que se passe-t-il si une clé change après avoir été insérée dans une HashMap ?", "Comment implémenteriez-vous equals() pour une classe avec héritage ?"],
  },
  'java-003': {
    question: "Pourquoi String est-elle immuable en Java, et quand faut-il utiliser StringBuilder ?",
    intent: "Le recruteur vérifie votre compréhension de l'immutabilité et de ses conséquences sur les performances.",
    expectedAnswer:
      "Une String ne peut pas être modifiée après sa création ; des méthodes comme concat() ou replace() renvoient une nouvelle String. L'immutabilité permet de partager les chaînes sans risque entre threads, autorise la JVM à réutiliser les littéraux dans le string pool, en fait des clés fiables pour une HashMap et protège des valeurs comme des chemins de fichiers ou des noms de classes contre toute modification après vérification. L'inconvénient : construire une chaîne par concaténations successives dans une boucle crée de nombreux objets temporaires. StringBuilder est un buffer mutable prévu pour ce cas : on ajoute dans la boucle et on appelle toString() une seule fois.",
    explanation:
      "Le compilateur optimise déjà les concaténations simples au sein d'une même expression ; StringBuilder compte donc surtout dans les boucles ou pour construire de grandes chaînes étape par étape.",
    example: "StringBuilder sb = new StringBuilder();\nfor (String line : lines) sb.append(line).append('\\n');\nString text = sb.toString();",
    tips: ["Donnez au moins deux raisons de l'immutabilité.", "Précisez quand StringBuilder fait réellement la différence."],
    commonMistakes: ["Utiliser StringBuilder partout, même pour une simple concaténation.", "Confondre StringBuilder avec StringBuffer, qui est synchronisé."],
    followUpQuestions: ["Qu'est-ce que le string pool ?", "Quelle est la différence entre StringBuilder et StringBuffer ?"],
  },
  'java-004': {
    question: "Quelle est la différence entre exceptions checked et unchecked ? Comment choisir ?",
    intent: "Le recruteur veut voir si vous comprenez la conception des exceptions en Java et si vous savez l'appliquer judicieusement dans une API.",
    expectedAnswer:
      "Les exceptions checked étendent Exception sans étendre RuntimeException ; le compilateur oblige l'appelant à les intercepter ou à les déclarer avec throws. IOException et SQLException en sont des exemples. Les exceptions unchecked étendent RuntimeException, comme IllegalArgumentException ou NullPointerException, et le compilateur n'impose pas leur traitement. Une règle courante consiste à utiliser des exceptions checked pour les situations récupérables que l'appelant peut raisonnablement gérer, et des exceptions unchecked pour les erreurs de programmation ou les cas que l'appelant ne peut pas corriger. En pratique, de nombreux frameworks modernes comme Spring privilégient les exceptions unchecked, car les exceptions checked se propagent dans les signatures et finissent souvent interceptées puis ignorées. Quel que soit le choix, une exception doit porter un message clair et la cause d'origine.",
    explanation:
      "Le débat sur les exceptions checked oppose l'obligation de traitement à la simplicité des API. Connaître la règle générale et le comportement des frameworks montre un jugement pragmatique.",
    tips: ["Donnez des exemples de chaque type.", "Expliquez la règle et la façon dont Spring gère les exceptions liées à la base de données.", "Mentionnez la conservation de la cause lors de l'encapsulation."],
    commonMistakes: ["Intercepter Exception et ne rien faire.", "Encapsuler une exception sans transmettre la cause d'origine."],
    followUpQuestions: ["Qu'est-ce que le try-with-resources ?", "Comment concevriez-vous la gestion des erreurs d'une API REST ?"],
  },
  'java-005': {
    question: "Expliquez les mots-clés final et finally, ainsi que la méthode finalize().",
    intent: "Le recruteur vérifie une connaissance précise de trois notions aux noms proches mais sans rapport entre elles, dont l'une est dépréciée.",
    expectedAnswer:
      "final est un modificateur : une variable final ne peut pas être réaffectée, une méthode final ne peut pas être redéfinie et une classe final ne peut pas être étendue, comme String. Attention : une référence final vers un objet mutable ne rend pas l'objet immuable. finally est un bloc placé après try/catch qui s'exécute qu'une exception survienne ou non ; il sert au nettoyage, même si le try-with-resources est désormais la manière privilégiée de fermer les ressources. finalize() était une méthode appelée par le garbage collector avant de récupérer un objet ; elle est peu fiable, lente, dépréciée depuis Java 9 et marquée pour suppression depuis Java 18. Il faut utiliser Cleaner ou le try-with-resources à la place.",
    explanation:
      "Cette question classique teste la précision. Mentionner que finalize() est dépréciée et que final n'implique pas l'immutabilité montre des connaissances à jour et rigoureuses.",
    tips: ["Soulignez qu'une référence final peut toujours pointer vers un objet mutable.", "Précisez que finalize() est dépréciée."],
    commonMistakes: ["Compter sur finalize() pour libérer des ressources.", "Croire qu'une liste final ne peut pas être modifiée."],
    followUpQuestions: ["Le bloc finally s'exécute-t-il si le bloc try fait un return ?", "Comment fonctionne le try-with-resources ?"],
  },
  'java-006': {
    question: "Que sont les records Java et quand les utiliseriez-vous ?",
    intent: "Le recruteur vérifie votre connaissance du Java moderne (16+) et de la modélisation de données immuables.",
    expectedAnswer:
      "Un record est une manière concise de déclarer un porteur de données immuable. À partir d'une déclaration comme record Point(int x, int y) {}, le compilateur génère des champs private final, un constructeur canonique, les accesseurs x() et y(), ainsi que equals(), hashCode() et toString() fondés sur tous les composants. Les records sont idéaux pour les DTO, les réponses d'API, les value objects et les clés de map. Vous pouvez ajouter une validation dans un constructeur compact, des méthodes de fabrique statiques et des méthodes supplémentaires. Limites : un record ne peut pas étendre une autre classe, ses champs ne peuvent pas être réaffectés, et son immutabilité est superficielle : la List contenue dans un record reste modifiable, sauf si vous en faites une copie défensive.",
    explanation:
      "Les records suppriment le code répétitif et rendent l'intention explicite : ce type est une donnée. Évoquer l'immutabilité superficielle et les constructeurs compacts montre une expérience concrète.",
    example: "record Money(BigDecimal amount, String currency) {\n  Money { if (amount.signum() < 0) throw new IllegalArgumentException(\"negative\"); }\n}",
    tips: ["Énumérez ce que le compilateur génère.", "Mentionnez la validation dans un constructeur compact.", "Expliquez l'immutabilité superficielle."],
    commonMistakes: ["Utiliser des records comme entités JPA, qui exigent la mutabilité et un constructeur sans argument.", "Supposer que les collections imbriquées sont immuables."],
    followUpQuestions: ["Un record peut-il implémenter une interface ?", "Comment les records fonctionnent-ils avec la sérialisation Jackson ?"],
  },
  'java-007': {
    question: "Comment les sealed classes et le pattern matching pour switch fonctionnent-ils ensemble en Java moderne ?",
    intent: "Le recruteur évalue votre maîtrise à jour de Java 21 et votre capacité à modéliser des hiérarchies de types fermées.",
    expectedAnswer:
      "Une classe ou interface sealed liste précisément les classes autorisées à l'étendre, via la clause permits, par exemple sealed interface Payment permits Card, Transfer, Wallet. Depuis Java 21, switch prend en charge le pattern matching sur les types, avec la déconstruction de records et des gardes introduites par when. Lorsque vous faites un switch sur un type sealed, le compilateur connaît tous les sous-types possibles et peut donc vérifier l'exhaustivité : si vous traitez chaque type autorisé, aucune branche default n'est nécessaire, et si un nouveau sous-type est ajouté plus tard, tout switch non exhaustif cesse de compiler. On obtient ainsi des types algébriques comparables à ceux des langages fonctionnels : vous modélisez un ensemble fermé de cas et le compilateur garantit qu'ils sont tous traités. Dans bien des cas, cela remplace le pattern visitor et les enchaînements de instanceof.",
    explanation:
      "La vérification d'exhaustivité est le bénéfice clé : ajouter un cas devient une liste de tâches à la compilation au lieu d'un bug à l'exécution. Les candidats avancés font le lien avec la modélisation du domaine.",
    example: "String describe(Payment p) {\n  return switch (p) {\n    case Card c when c.amount() > 1000 -> \"large card payment\";\n    case Card c -> \"card\";\n    case Transfer t -> \"transfer to \" + t.iban();\n    case Wallet w -> \"wallet\";\n  };\n}",
    tips: ["Expliquez la vérification d'exhaustivité.", "Mentionnez les record patterns et les gardes.", "Comparez avec le pattern visitor ou les enchaînements de instanceof."],
    commonMistakes: ["Ajouter une branche default qui masque les cas manquants.", "Confondre sealed et final."],
    followUpQuestions: ["Que signifie non-sealed ?", "Comment modéliseriez-vous les états d'une commande avec des types sealed ?"],
  },
  'java-008': {
    question: "Quelle est la différence entre List, Set et Map en Java ?",
    intent: "Le recruteur vérifie que vous savez choisir le bon type de collection pour une tâche donnée.",
    expectedAnswer:
      "Une List est une collection ordonnée qui accepte les doublons et l'accès par index, typiquement ArrayList. Un Set contient des éléments uniques : HashSet ne garantit aucun ordre, LinkedHashSet conserve l'ordre d'insertion et TreeSet maintient les éléments triés. Une Map stocke des paires clé-valeur avec des clés uniques : HashMap pour une recherche rapide, LinkedHashMap pour l'ordre d'insertion et TreeMap pour des clés triées. Map n'est pas un sous-type de Collection. Choisissez une List pour une séquence, un Set lorsque l'unicité compte et une Map lorsque vous recherchez des valeurs par clé.",
    explanation:
      "Choisir la bonne interface exprime l'intention et apporte les garanties et les performances adaptées au cas d'usage.",
    tips: ["Citez les principales implémentations et leur ordre.", "Donnez un cas d'usage pour chacune."],
    commonMistakes: ["Utiliser une List et appeler contains() à répétition là où un Set serait plus rapide."],
    followUpQuestions: ["Quand utiliseriez-vous une TreeMap ?", "Comment HashSet vérifie-t-il l'unicité ?"],
  },
  'java-009': {
    question: "Comment fonctionne HashMap en interne ?",
    intent: "Le recruteur attend une compréhension approfondie de l'une des classes les plus utilisées et de son comportement en termes de performances.",
    expectedAnswer:
      "HashMap stocke ses entrées dans un tableau de buckets. Lors d'un put, elle appelle hashCode(), mélange les bits et s'en sert pour calculer l'index du bucket. Si le bucket est vide, l'entrée y est stockée ; sinon, il y a collision et l'entrée est ajoutée à ce bucket, qui est une liste chaînée. Depuis Java 8, lorsqu'un bucket dépasse huit entrées et que la table est assez grande, la liste devient un arbre équilibré, ce qui fait passer le pire cas de O(n) à O(log n). Lors d'un get, HashMap retrouve le bucket et utilise equals() pour trouver la clé correspondante. Lorsque le nombre d'entrées dépasse la capacité multipliée par le load factor, 0,75 par défaut, la table double de taille et les entrées sont redistribuées. HashMap accepte une clé null et n'est pas thread-safe.",
    explanation:
      "Connaître les buckets, les collisions, la treeification et le redimensionnement explique la performance moyenne en O(1), l'importance de bons codes de hachage et le coût potentiel du redimensionnement.",
    tips: ["Expliquez le hachage, les collisions et le rôle d'equals().", "Mentionnez le load factor et le redimensionnement.", "Évoquez la treeification depuis Java 8."],
    commonMistakes: ["Affirmer que HashMap conserve l'ordre d'insertion.", "L'utiliser en concurrence sans synchronisation."],
    followUpQuestions: ["Pourquoi définir une capacité initiale ?", "Pourquoi HashMap n'est-elle pas sûre avec des écritures concurrentes ?"],
  },
  'java-010': {
    question: "Quelle est la différence entre Comparable et Comparator ?",
    intent: "Le recruteur vérifie comment vous définissez l'ordre des objets et si vous écrivez un code de tri propre.",
    expectedAnswer:
      "Comparable est implémentée par la classe elle-même, via compareTo(), pour définir son ordre naturel ; par exemple, String se trie par ordre alphabétique. Une classe ne peut avoir qu'un seul ordre naturel. Comparator est un objet distinct qui définit un ordre, ce qui permet d'en avoir plusieurs : par prix, par date, décroissant. Depuis Java 8, Comparator propose des méthodes de fabrique et de combinaison, comme Comparator.comparing(Product::price).thenComparing(Product::name).reversed(), qui rendent le code de tri lisible. L'ordre naturel doit être cohérent avec equals() lorsque les objets sont utilisés dans des sets ou des maps triés.",
    explanation:
      "Comparable sert à l'ordre unique et évident d'un type ; Comparator sert à tous les autres. Les méthodes modernes de Comparator évitent les comparaisons manuelles sources d'erreurs.",
    example: "products.sort(Comparator.comparing(Product::category).thenComparing(Product::price, Comparator.reverseOrder()));",
    tips: ["Montrez le style moderne Comparator.comparing.", "Mentionnez la cohérence avec equals() pour TreeSet et TreeMap."],
    commonMistakes: ["Implémenter compare par soustraction, ce qui peut provoquer un dépassement d'entier.", "Imposer un ordre naturel à une classe qui n'en a pas d'évident."],
    followUpQuestions: ["Que se passe-t-il dans un TreeSet si compareTo est incohérent avec equals ?", "Comment gérez-vous les valeurs null lors d'un tri ?"],
  },
  'java-011': {
    question: "Qu'est-ce qu'une ConcurrentModificationException et comment l'éviter ?",
    intent: "Le recruteur vérifie votre connaissance pratique du comportement des itérateurs et de la modification sûre des collections.",
    expectedAnswer:
      "La plupart des collections standard comme ArrayList et HashMap ont des itérateurs fail-fast : si la collection est modifiée structurellement pendant l'itération par autre chose que l'itérateur lui-même, l'appel suivant lève une ConcurrentModificationException. Cela arrive même avec un seul thread, par exemple en supprimant des éléments dans une boucle for-each. Pour l'éviter, utilisez iterator.remove(), utilisez removeIf(), par exemple list.removeIf(o -> o.isCancelled()), collectez les modifications et appliquez-les après la boucle, ou construisez une nouvelle collection filtrée avec les streams. En code multithread, utilisez des collections concurrentes comme ConcurrentHashMap ou CopyOnWriteArrayList, dont les itérateurs ne lèvent pas cette exception.",
    explanation:
      "Cette exception est une détection au mieux (best-effort) d'une erreur de programmation, pas une garantie de concurrence. La solution consiste à modifier les collections de manière contrôlée.",
    tips: ["Précisez que cela arrive aussi en code monothread.", "Proposez removeIf() comme correction la plus simple."],
    commonMistakes: ["Intercepter l'exception au lieu de corriger la boucle.", "Croire que les itérateurs fail-fast rendent le code thread-safe."],
    followUpQuestions: ["Comment fonctionne CopyOnWriteArrayList et quand est-ce un mauvais choix ?", "Pourquoi parle-t-on de détection best-effort ?"],
  },
  'java-012': {
    question: "Comparez HashMap, Collections.synchronizedMap et ConcurrentHashMap pour un usage concurrent.",
    intent: "Le recruteur évalue une connaissance avancée de la concurrence et votre capacité à éviter des race conditions subtiles.",
    expectedAnswer:
      "HashMap n'est pas thread-safe : des écritures concurrentes peuvent perdre des mises à jour ou corrompre son état interne. Collections.synchronizedMap enveloppe une map avec un verrou unique sur chaque méthode : chaque appel est sûr, mais tous les threads se disputent le même verrou et vous devez encore synchroniser manuellement les itérations et les actions composées. ConcurrentHashMap est conçue pour la concurrence : les lectures sont en grande partie sans verrou et les écritures ne verrouillent que le bin concerné, ce qui offre un bien meilleur débit. Elle n'accepte ni clés ni valeurs null, ses itérateurs sont faiblement cohérents (weakly consistent) et ne lèvent jamais de ConcurrentModificationException, et elle fournit des opérations composées atomiques comme putIfAbsent, computeIfAbsent et merge. Le piège principal est le check-then-act : if (!map.containsKey(k)) map.put(k, v) n'est pas atomique, même sur une ConcurrentHashMap ; il faut utiliser computeIfAbsent ou merge.",
    explanation:
      "Des méthodes individuellement thread-safe ne rendent pas atomiques des séquences d'appels. Les candidats avancés savent que les opérations composées doivent passer par les API atomiques.",
    example: "counts.merge(word, 1, Integer::sum); // incrément atomique dans une ConcurrentHashMap",
    tips: ["Expliquez la granularité des verrous.", "Mettez en avant le problème du check-then-act et les méthodes atomiques.", "Mentionnez l'interdiction des null."],
    commonMistakes: ["Enchaîner containsKey puis put sur une map concurrente.", "Exécuter un traitement long ou bloquant dans computeIfAbsent."],
    followUpQuestions: ["Pourquoi ConcurrentHashMap refuse-t-elle les valeurs null ?", "Que signifie une itération faiblement cohérente ?"],
  },
  'java-013': {
    question: "Quelle est la différence entre List.of(), Arrays.asList() et Collections.unmodifiableList() ?",
    intent: "Le recruteur vérifie une connaissance précise des garanties d'immutabilité, qui surprennent souvent les développeurs en production.",
    expectedAnswer:
      "List.of(), disponible depuis Java 9, crée une liste réellement immuable : tout add, remove ou set lève une UnsupportedOperationException, et les éléments null sont refusés. Arrays.asList() renvoie une liste de taille fixe adossée au tableau d'origine : impossible d'ajouter ou de supprimer, mais set() fonctionne et écrit dans le tableau, et les modifications du tableau sont visibles dans la liste ; elle accepte les null. Collections.unmodifiableList() renvoie une vue en lecture seule d'une autre liste : vous ne pouvez pas la modifier via la vue, mais si la liste sous-jacente change, la vue reflète ces changements ; elle n'est donc pas immuable. Pour renvoyer une copie sûre depuis une méthode, utilisez List.copyOf(), qui crée une copie immuable, ou enveloppez une copie défensive.",
    explanation:
      "La différence entre une copie et une vue est le concept central. Les bugs apparaissent lorsque le code suppose qu'une vue non modifiable ne peut pas changer.",
    tips: ["Distinguez les copies immuables des vues en lecture seule.", "Mentionnez la gestion des null.", "Proposez List.copyOf() pour les copies défensives."],
    commonMistakes: ["Renvoyer une liste interne simplement enveloppée dans unmodifiableList en supposant que l'appelant voit un instantané figé.", "Appeler add() sur le résultat d'Arrays.asList()."],
    followUpQuestions: ["Comment exposeriez-vous de manière sûre un champ de type collection depuis une classe ?", "Un record contenant un List.of() est-il entièrement immuable ?"],
  },
  'java-014': {
    question: "Qu'est-ce qu'un Stream en Java, et quelle est la différence entre opérations intermédiaires et terminales ?",
    intent: "Le recruteur vérifie votre compréhension de base de l'API Streams et de son évaluation paresseuse.",
    expectedAnswer:
      "Un Stream est une séquence d'éléments qui prend en charge des opérations déclaratives comme le filtrage, la transformation et la réduction, sans stocker lui-même de données. Les opérations intermédiaires comme filter, map et sorted renvoient un nouveau stream et sont paresseuses : rien ne se passe tant qu'une opération terminale n'est pas appelée. Les opérations terminales comme collect, forEach, count ou findFirst déclenchent le traitement et produisent un résultat. Un stream ne peut être consommé qu'une seule fois. Par exemple, orders.stream().filter(o -> o.isPaid()).map(Order::total).reduce(BigDecimal.ZERO, BigDecimal::add) calcule le total des commandes payées.",
    explanation:
      "L'évaluation paresseuse permet au stream de combiner efficacement les opérations et de s'arrêter tôt, par exemple avec findFirst ou limit.",
    tips: ["Donnez un court exemple de pipeline.", "Précisez qu'un stream ne s'utilise qu'une fois."],
    commonMistakes: ["S'attendre à ce qu'un pipeline sans opération terminale fasse quelque chose.", "Réutiliser un stream déjà consommé."],
    followUpQuestions: ["Que signifie le short-circuiting dans les streams ?", "Quand préféreriez-vous une simple boucle ?"],
  },
  'java-015': {
    question: "Quelle est la différence entre map() et flatMap() dans les streams ?",
    intent: "Le recruteur vérifie votre compréhension des transformations de streams et des données imbriquées.",
    expectedAnswer:
      "map() transforme chaque élément en exactement un nouvel élément : un Stream<Order> transformé avec Order::customer donne un Stream<Customer>. flatMap() transforme chaque élément en un stream d'éléments et aplatit tous ces streams en un seul. Si chaque Order possède une List<Item>, orders.stream().map(Order::items) donne un Stream<List<Item>>, tandis que orders.stream().flatMap(o -> o.items().stream()) donne un Stream<Item> contenant tous les articles. La même idée existe sur Optional : map enveloppe le résultat, flatMap évite un Optional d'Optional lorsque la fonction renvoie déjà un Optional.",
    explanation:
      "flatMap s'utilise dès qu'un élément produit zéro, un ou plusieurs résultats et que l'on veut une seule séquence à plat.",
    tips: ["Prenez un exemple de listes imbriquées.", "Mentionnez aussi Optional.flatMap."],
    commonMistakes: ["Se retrouver avec un Stream<List<T>> et itérer deux fois.", "Utiliser flatMap alors que map suffit."],
    followUpQuestions: ["Que fait mapMulti ?", "Comment obtiendriez-vous les noms de produits distincts sur l'ensemble des commandes ?"],
  },
  'java-016': {
    question: "Comment faut-il utiliser Optional, et comment ne faut-il pas l'utiliser ?",
    intent: "Le recruteur vérifie votre sens de la conception d'API et votre connaissance des mauvais usages courants d'Optional.",
    expectedAnswer:
      "Optional est conçu comme type de retour pour les méthodes susceptibles de ne pas avoir de résultat, comme findById(), afin d'obliger l'appelant à traiter explicitement le cas vide. Les bons usages incluent map, filter, orElse, orElseGet pour des valeurs par défaut coûteuses et orElseThrow pour échouer avec une exception claire. Il ne doit pas être utilisé pour les champs, les paramètres de méthode ou les collections : une collection vide exprime déjà « aucun résultat », et les champs Optional ajoutent un surcoût et ne sont pas sérialisables. Appeler get() sans vérification va à l'encontre de l'objectif ; utilisez plutôt orElseThrow(). Enfin, une variable Optional ne doit jamais elle-même valoir null.",
    explanation:
      "Optional documente l'absence de valeur dans la signature de la méthode. Son intérêt vient du traitement fluide du cas vide, pas de l'enveloppement systématique de chaque valeur potentiellement null.",
    example: "String city = repo.findById(id).map(User::address).map(Address::city).orElse(\"unknown\");",
    tips: ["Énoncez l'usage prévu comme type de retour.", "Opposez orElse à orElseGet."],
    commonMistakes: ["Utiliser Optional comme champ ou paramètre.", "Appeler get() directement.", "Renvoyer Optional<List<T>> au lieu d'une liste vide."],
    followUpQuestions: ["Pourquoi orElse évalue-t-il son argument même lorsqu'une valeur est présente ?", "Comment géreriez-vous l'absence de valeur dans un contrôleur REST ?"],
  },
  'java-017': {
    question: "Comment regrouperiez-vous et agrégeriez-vous des données avec les Collectors ?",
    intent: "Le recruteur vérifie votre usage pratique des collectors pour des tâches de reporting courantes.",
    expectedAnswer:
      "Collectors.groupingBy regroupe les éléments selon une clé et renvoie une Map. Avec un collector aval (downstream), vous pouvez agréger chaque groupe : counting(), summingInt(), averagingDouble(), mapping() ou toSet(). Par exemple, orders.stream().collect(Collectors.groupingBy(Order::customerId, Collectors.summingInt(Order::quantity))) donne la quantité totale par client. partitioningBy sépare les éléments en une Map<Boolean, List<T>> selon un prédicat. toMap construit directement une map mais lève une exception en cas de clés en double, sauf si vous fournissez une fonction de fusion. Si l'ordre compte, vous pouvez passer une fabrique de map comme TreeMap::new.",
    explanation:
      "Les collectors remplacent de nombreuses boucles manuelles alimentant des maps. Connaître les collectors aval et le comportement de toMap face aux clés en double évite des bugs fréquents.",
    example: "Map<Status, Long> countByStatus = tickets.stream().collect(Collectors.groupingBy(Ticket::status, Collectors.counting()));",
    tips: ["Montrez groupingBy avec un collector aval.", "Mentionnez la fonction de fusion de toMap."],
    commonMistakes: ["Utiliser toMap sans gérer les clés en double.", "Écrire des boucles imbriquées là où un collector serait plus clair."],
    followUpQuestions: ["Comment obtiendriez-vous le meilleur produit par catégorie ?", "Qu'est-ce que Collectors.teeing ?"],
  },
  'java-018': {
    question: "Quand faut-il utiliser les parallel streams, et quels sont les risques ?",
    intent: "Le recruteur évalue votre jugement avancé sur le parallélisme dans la JVM et ses coûts cachés.",
    expectedAnswer:
      "Un parallel stream découpe sa source, traite les parties sur le ForkJoinPool commun, puis combine les résultats. Il peut être utile pour un traitement intensif en CPU sur de grands volumes, avec des sources qui se découpent bien comme ArrayList ou les tableaux, lorsque les opérations sont sans état et indépendantes. Il n'aide souvent pas, voire ralentit, avec de petites collections, des sources qui se découpent mal comme LinkedList ou les streams issus d'I/O, des opérations soumises à des contraintes d'ordre comme findFirst ou sorted, ou lorsque la combinaison des résultats est coûteuse. Les risques incluent l'état mutable partagé, source de race conditions, et les I/O bloquantes dans le pipeline, qui épuisent le pool commun utilisé par toute la JVM, y compris par d'autres bibliothèques et par les tâches par défaut de CompletableFuture. Sur un serveur qui traite déjà de nombreuses requêtes en parallèle, les parallel streams améliorent rarement le débit. La règle est de mesurer avec un benchmark réaliste, par exemple avec JMH, avant de les utiliser.",
    explanation:
      "Les parallel streams sont une optimisation, pas un choix par défaut. Une réponse avancée évoque le pool commun, les caractéristiques de la source de données et la nécessité de mesurer.",
    tips: ["Listez les conditions où ils aident et celles où ils pénalisent.", "Mentionnez le ForkJoinPool commun partagé.", "Insistez sur la mesure."],
    commonMistakes: ["Ajouter .parallel() pour accélérer des appels à la base de données ou HTTP.", "Modifier une liste partagée dans le forEach d'un parallel stream."],
    followUpQuestions: ["Comment exécuteriez-vous un parallel stream sur un pool personnalisé ?", "Pourquoi sorted() réduit-il le bénéfice du parallélisme ?"],
  },
  'java-019': {
    question: "Quels sont les pièges courants lorsqu'on écrit des pipelines de streams en code de production ?",
    intent: "Le recruteur évalue si vous utilisez les streams pour la lisibilité et la justesse du code, et non par effet de mode.",
    expectedAnswer:
      "Le premier piège, ce sont les effets de bord : modifier un état externe dans map ou forEach rend les pipelines difficiles à comprendre et dangereux en parallèle ; les résultats doivent être produits avec collect ou reduce. Le deuxième est de mal s'appuyer sur l'évaluation paresseuse, par exemple en utilisant peek() pour de la logique ou en ayant des opérations ignorées à cause du short-circuiting. Troisièmement, les exceptions checked s'intègrent mal dans les lambdas, ce qui conduit à des encapsulations maladroites ; une boucle est parfois plus claire. Quatrièmement, les pièges de performance : trier ou collecter de grandes listes intermédiaires, le boxing avec Stream<Integer> au lieu d'IntStream, ou appeler la base de données dans un map, ce qui génère des requêtes N+1. Cinquièmement, la lisibilité : des pipelines très longs avec des lambdas imbriquées sont plus difficiles à déboguer qu'une boucle avec des méthodes utilitaires bien nommées. Enfin, toMap sans fonction de fusion ou groupingBy sur des clés null lèvent une exception à l'exécution. J'utilise les streams pour des transformations claires et je garde les flux de contrôle complexes dans des boucles ou des méthodes extraites.",
    explanation:
      "Les streams sont un outil pour exprimer clairement des transformations. Les développeurs seniors savent quand ils nuisent à la lisibilité, aux performances ou à la gestion des erreurs.",
    tips: ["Regroupez les pièges par justesse, performance et lisibilité.", "Mentionnez les streams de primitifs pour éviter le boxing.", "Montrez que vous utilisez encore des boucles quand elles sont plus claires."],
    commonMistakes: ["Utiliser peek() pour de la logique métier.", "Construire d'énormes pipelines sur une ligne que personne ne peut déboguer."],
    followUpQuestions: ["Comment déboguez-vous un pipeline de stream ?", "Comment gérez-vous les exceptions checked dans les lambdas ?"],
  },
  'java-020': {
    question: "Comment créer et exécuter une tâche sur un autre thread en Java moderne ?",
    intent: "Le recruteur vérifie vos bases en concurrence et si vous utilisez des abstractions modernes plutôt que des threads bruts.",
    expectedAnswer:
      "L'approche bas niveau consiste à créer un Thread avec un Runnable et à appeler start(), et non run(), qui s'exécuterait sur le thread courant. Dans du code moderne, on soumet généralement les tâches à un ExecutorService, qui gère un pool de threads : executor.submit(() -> doWork()) renvoie un Future permettant de récupérer le résultat ou d'annuler la tâche. Les executors réutilisent les threads, limitent la concurrence et rendent l'arrêt explicite. Callable ressemble à Runnable mais renvoie une valeur et peut lever des exceptions checked. Depuis Java 21, les virtual threads permettent de créer à faible coût un thread par tâche, par exemple avec Executors.newVirtualThreadPerTaskExecutor().",
    explanation:
      "Créer un thread brut pour chaque tâche est coûteux et difficile à gérer. Les executors et, plus récemment, les virtual threads sont les outils standard.",
    tips: ["Mentionnez la différence entre start() et run().", "Privilégiez ExecutorService et montrez son arrêt."],
    commonMistakes: ["Appeler run() au lieu de start().", "Oublier d'arrêter un executor."],
    followUpQuestions: ["Quelle est la différence entre Runnable et Callable ?", "Que se passe-t-il si une tâche lève une exception dans un executor ?"],
  },
  'java-021': {
    question: "Que font synchronized et volatile ?",
    intent: "Le recruteur vérifie votre compréhension de la visibilité et de l'atomicité dans la concurrence Java.",
    expectedAnswer:
      "synchronized garantit l'exclusion mutuelle : un seul thread à la fois peut exécuter un bloc synchronized sur le même objet moniteur. Il garantit aussi la visibilité : les modifications faites dans le bloc sont visibles par le prochain thread qui acquiert le même verrou. volatile ne garantit que la visibilité et l'ordonnancement pour une seule variable : chaque lecture voit la dernière écriture, mais les opérations composées ne deviennent pas atomiques. Un volatile boolean convient donc comme indicateur d'arrêt, mais count++ sur un volatile int reste une race condition, car il s'agit d'une lecture, d'un incrément et d'une écriture. Pour des compteurs atomiques, utilisez AtomicInteger ou LongAdder, ou protégez l'opération avec un verrou.",
    explanation:
      "La distinction clé oppose visibilité et atomicité. De nombreux bugs de concurrence viennent de l'idée que volatile rend les opérations atomiques.",
    tips: ["Séparez visibilité et atomicité.", "Donnez un usage correct de volatile et un usage incorrect."],
    commonMistakes: ["Utiliser volatile pour un compteur.", "Synchroniser sur des objets différents en croyant le code protégé."],
    followUpQuestions: ["Quelle est la différence entre synchronized et ReentrantLock ?", "Comment fonctionne AtomicInteger ?"],
  },
  'java-022': {
    question: "Qu'est-ce qu'un deadlock, et comment l'éviter ?",
    intent: "Le recruteur vérifie que vous savez reconnaître et éviter une défaillance classique de la concurrence.",
    expectedAnswer:
      "Un deadlock survient lorsque deux threads ou plus détiennent chacun un verrou et attendent un verrou détenu par un autre, si bien qu'aucun ne peut progresser. Exemple typique : le thread A verrouille le compte 1 puis attend le compte 2, tandis que le thread B verrouille le compte 2 puis attend le compte 1. Les stratégies de prévention consistent à toujours acquérir les verrous dans le même ordre global, par exemple par identifiant de compte ; à garder les verrous le moins longtemps possible et à ne jamais appeler du code inconnu en détenant un verrou ; à utiliser tryLock avec un timeout via ReentrantLock pour qu'un thread puisse renoncer ; et à réduire les verrous partagés grâce à des structures de plus haut niveau comme les collections concurrentes ou les files de messages. Les thread dumps, obtenus avec jstack ou des outils de monitoring, montrent les threads en deadlock et les verrous impliqués.",
    explanation:
      "Un deadlock nécessite une attente circulaire. Briser ce cycle, le plus souvent par un ordre d'acquisition des verrous cohérent, est la prévention la plus fiable.",
    tips: ["Donnez l'exemple des deux comptes.", "Présentez l'ordre d'acquisition des verrous comme la correction principale.", "Expliquez comment détecter un deadlock."],
    commonMistakes: ["Ajouter des verrous pour corriger une race condition sans réfléchir à leur ordre d'acquisition."],
    followUpQuestions: ["Qu'est-ce qu'un livelock ?", "Comment détecteriez-vous un deadlock en production ?"],
  },
  'java-023': {
    question: "Comment fonctionnent les pools de threads, et comment les dimensionner ?",
    intent: "Le recruteur vérifie votre connaissance pratique des executors et de la gestion des ressources.",
    expectedAnswer:
      "Un pool de threads conserve un ensemble de threads de travail qui prennent les tâches dans une file, ce qui évite le coût de création d'un thread par tâche et limite ce qui s'exécute simultanément. ThreadPoolExecutor se configure avec une taille de base (core), une taille maximale, une file et une politique de rejet lorsque les deux sont saturés. Le dimensionnement dépend du travail : pour des tâches CPU-bound, environ le nombre de cœurs suffit, car davantage de threads ne fait qu'ajouter des changements de contexte ; pour des tâches I/O-bound, les threads passent du temps à attendre, donc davantage de threads est utile, à peu près le nombre de cœurs multiplié par un plus le rapport entre temps d'attente et temps de calcul. Les files non bornées, utilisées par Executors.newFixedThreadPool, peuvent masquer une surcharge jusqu'à épuisement de la mémoire ; le code de production utilise donc souvent une file bornée et une politique de rejet explicite, et surveille la taille de la file.",
    explanation:
      "La configuration d'un pool est une décision de capacity planning. Mentionner les files bornées et les politiques de rejet montre une expérience de la production.",
    tips: ["Distinguez le travail CPU-bound du travail I/O-bound.", "Mentionnez le risque des files non bornées."],
    commonMistakes: ["Créer un nouveau pool à chaque requête.", "Utiliser un pool énorme pour du travail CPU-bound."],
    followUpQuestions: ["Quelles politiques de rejet existent ?", "Comment les virtual threads changent-ils le dimensionnement des pools ?"],
  },
  'java-024': {
    question: "Comment combineriez-vous plusieurs appels asynchrones avec CompletableFuture ?",
    intent: "Le recruteur évalue des compétences avancées en programmation asynchrone, y compris la gestion des erreurs et des executors.",
    expectedAnswer:
      "Je lancerais chaque appel indépendant avec supplyAsync, en passant un executor dédié plutôt que de compter sur le ForkJoinPool commun, surtout pour des I/O bloquantes. Pour les appels qui dépendent d'un résultat précédent, j'utilise thenCompose, qui enchaîne des étapes asynchrones sans imbriquer de futures ; thenApply sert aux transformations synchrones. Pour des appels indépendants, thenCombine fusionne deux résultats et allOf attend plusieurs futures ; après allOf, je récupère les résultats avec join(), qui ne bloque plus à ce stade. La gestion des erreurs passe par exceptionally ou handle pour fournir une solution de repli, et par orTimeout ou completeOnTimeout, depuis Java 9, pour éviter d'attendre indéfiniment. Je m'assure aussi que les exceptions sont journalisées avec leur contexte, car un future en échec que personne n'observe peut disparaître silencieusement. Par exemple, pour construire une page produit, je récupérerais le produit, le prix et le stock en parallèle, je les combinerais, et j'afficherais « stock inconnu » si le service de stock dépasse son timeout.",
    explanation:
      "Les points essentiels sont la composition (thenCompose ou thenApply), le fan-out parallèle (allOf, thenCombine), des executors explicites ainsi que des timeouts et solutions de repli robustes.",
    example: "var price = supplyAsync(() -> pricing.get(id), ioPool);\nvar stock = supplyAsync(() -> inventory.get(id), ioPool).completeOnTimeout(Stock.UNKNOWN, 300, MILLISECONDS);\nreturn price.thenCombine(stock, ProductView::new);",
    tips: ["Opposez thenApply et thenCompose.", "Mentionnez toujours les timeouts et un executor dédié.", "Montrez la gestion des erreurs."],
    commonMistakes: ["Appeler get() juste après supplyAsync, ce qui rend le code synchrone.", "Exécuter des appels bloquants sur le pool commun."],
    followUpQuestions: ["Comment les virtual threads simplifieraient-ils ce code ?", "Comment propagez-vous un contexte de requête comme un trace ID ?"],
  },
  'java-025': {
    question: "Que sont les virtual threads de Java 21, et dans quels cas sont-ils utiles ?",
    intent: "Le recruteur vérifie votre connaissance à jour du projet Loom et de ses implications pratiques pour les serveurs.",
    expectedAnswer:
      "Les virtual threads sont des threads légers gérés par la JVM plutôt que par le système d'exploitation. De nombreux virtual threads s'exécutent sur un petit pool de threads de plateforme porteurs (carrier threads). Lorsqu'un virtual thread effectue une opération bloquante comme une lecture sur socket, la JVM le démonte de son carrier, qui peut alors exécuter un autre virtual thread. Il devient ainsi possible de créer des millions de threads et de conserver un style simple, bloquant, avec un thread par requête, tout en obtenant un débit comparable à celui du code asynchrone. Ils sont utiles pour les charges I/O-bound comme les services web qui appellent des bases de données et des API. Ils n'accélèrent pas le travail CPU-bound. Points d'attention : mettre des virtual threads en pool n'a aucun intérêt ; les caches en ThreadLocal deviennent coûteux avec un grand nombre de threads ; de longs blocs synchronized autour d'appels bloquants pouvaient épingler (pinning) le carrier thread, une limitation que le JDK 24 a en grande partie levée ; et les ressources en aval, comme les pools de connexions à la base de données, limitent toujours la concurrence réelle, ce qui peut nécessiter des sémaphores. Spring Boot 3.2+ permet de les activer avec spring.threads.virtual.enabled=true.",
    explanation:
      "Les virtual threads changent le modèle de coût des threads, pas la vitesse de calcul. Les candidats avancés connaissent aussi les pièges comme le pinning, l'usage de ThreadLocal et les limites des ressources en aval.",
    tips: ["Expliquez le montage et le démontage sur les carrier threads.", "Dites clairement ce qu'ils n'accélèrent pas.", "Mentionnez les pièges pratiques et le support de Spring Boot."],
    commonMistakes: ["Placer des virtual threads dans un pool de taille fixe.", "S'attendre à un traitement CPU-bound plus rapide."],
    followUpQuestions: ["Qu'est-ce que le pinning ?", "Comment les virtual threads se comparent-ils à la programmation réactive ?"],
  },
};
