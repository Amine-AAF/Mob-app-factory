import type { QuestionText, TextTable } from '@/types/content';

/** Questions software 001-025 : fondamentaux, POO, structures de données, algorithmes (partie). */
export const frA: TextTable<QuestionText> = {
  'sw-001': {
    question: "Quelle est la différence entre un langage compilé et un langage interprété ?",
    intent: "Le recruteur vérifie que vous comprenez comment le code source devient quelque chose qu'une machine exécute, et que vous évitez les étiquettes trop simplistes.",
    expectedAnswer:
      "Un langage compilé est traduit à l'avance en code machine ou en une autre forme de bas niveau avant son exécution, comme le C ou le Go. Un langage interprété est exécuté par un programme qui lit et exécute le source plus ou moins directement, comme les scripts shell classiques. En pratique, la plupart des langages modernes mélangent les deux : Java et C# sont compilés en bytecode qu'une machine virtuelle interprète puis compile à la volée (JIT), et les moteurs JavaScript compilent le code le plus sollicité à l'exécution. « Compilé » et « interprété » décrivent donc des implémentations plutôt que les langages eux-mêmes.",
    explanation:
      "La compilation anticipée (AOT) détecte de nombreuses erreurs tôt et offre généralement un démarrage et une exécution plus rapides, tandis que l'interprétation apporte de la souplesse et des itérations rapides. La compilation à la volée (JIT) combine les deux en optimisant le code exécuté le plus souvent.",
    example: "Java : javac Main.java → Main.class (bytecode) → la JVM l'interprète et compile en JIT les méthodes les plus sollicitées en code natif.",
    tips: ["Précisez que la distinction porte sur les implémentations, pas sur les langages.", "Donnez un exemple mixte comme Java ou JavaScript."],
    commonMistakes: ["Affirmer que les langages interprétés sont toujours lents.", "Classer Java comme purement interprété ou purement compilé."],
    followUpQuestions: ["Que fait un compilateur JIT ?", "Pourquoi le temps de démarrage peut-il compter pour des fonctions serverless ?"],
  },
  'sw-002': {
    question: "Quelle est la différence entre un type valeur et un type référence ?",
    intent: "Le recruteur veut savoir si vous comprenez comment les données sont copiées et partagées, ce qui explique de nombreux bugs du quotidien.",
    expectedAnswer:
      "Lorsque vous affectez un type valeur, la valeur elle-même est copiée : modifier la copie n'affecte pas l'original. Avec un type référence, la variable contient une référence vers un objet ; l'affectation copie la référence, si bien que les deux variables pointent vers le même objet et qu'une modification faite via l'une est visible via l'autre. En Java, les primitifs comme int sont des valeurs et les objets sont manipulés par référence ; en JavaScript, les nombres et les chaînes se comportent comme des valeurs, tandis que les objets et les tableaux sont partagés par référence.",
    explanation:
      "Cette distinction explique pourquoi modifier un tableau passé à une fonction le modifie aussi pour l'appelant, et pourquoi comparer deux objets avec == peut comparer leurs identités plutôt que leurs contenus.",
    example: "const a = [1, 2]; const b = a; b.push(3); // a vaut maintenant [1, 2, 3] car a et b partagent le même tableau",
    tips: ["Utilisez un petit exemple de code pour illustrer le partage.", "Évoquez l'égalité : comparaison d'identité ou de contenu."],
    commonMistakes: ["Dire que Java passe les objets par référence ; Java passe toujours par valeur, cette valeur étant une référence pour les objets."],
    followUpQuestions: ["Comment copieriez-vous un objet sans partager ses données imbriquées ?", "Qu'est-ce que l'immutabilité change ici ?"],
  },
  'sw-003': {
    question: "Quelle est la différence entre la pile (stack) et le tas (heap) ?",
    intent: "Le recruteur vérifie votre modèle mental de la mémoire : où vivent les données locales, combien de temps, et pourquoi c'est important.",
    expectedAnswer:
      "La pile stocke les cadres d'appel des fonctions : variables locales, paramètres et adresses de retour. Elle grandit et rétrécit automatiquement au fil des appels et des retours de fonctions, ce qui rend l'allocation très rapide, mais sa taille est limitée et les données disparaissent à la fin de la fonction. Le tas stocke les données dont la durée de vie n'est pas liée à un seul appel, comme les objets créés avec new. Il est plus grand et plus souple, mais l'allocation y est plus lente et la mémoire doit être libérée, soit manuellement comme en C, soit par un ramasse-miettes (garbage collector) comme en Java ou en JavaScript.",
    explanation:
      "Comprendre ces deux zones aide à expliquer les erreurs de stack overflow lors de récursions profondes, les fuites mémoire sur le tas, et pourquoi renvoyer un pointeur vers une variable locale est dangereux dans des langages comme le C.",
    tips: ["Reliez la pile aux appels de fonctions et le tas à la durée de vie des objets.", "Citez une erreur typique pour chacun, comme le stack overflow et les fuites mémoire."],
    commonMistakes: ["Dire que tous les objets Java sont sur la pile.", "Oublier que chaque thread possède sa propre pile."],
    followUpQuestions: ["Qu'est-ce qui provoque un stack overflow ?", "Comment le garbage collector décide-t-il de ce qu'il faut libérer ?"],
  },
  'sw-004': {
    question: "Expliquez la différence entre programmation synchrone et asynchrone.",
    intent: "Le recruteur veut voir si vous comprenez le blocage, la concurrence et la manière dont un programme reste réactif en attendant des entrées-sorties.",
    expectedAnswer:
      "En code synchrone, chaque opération attend la fin de la précédente. Si une étape attend un appel réseau ou une lecture de fichier, tout le thread est bloqué pendant ce temps. En code asynchrone, une opération longue est lancée et le programme continue ; le résultat est traité plus tard via un callback, une promesse ou un future, souvent avec la syntaxe async/await. Cela permet à un seul thread de servir de nombreuses requêtes pendant l'attente des entrées-sorties, comme dans Node.js, ou de garder une interface utilisateur réactive. Asynchrone ne signifie pas automatiquement parallèle : le travail peut être entrelacé sur un seul thread. Les contreparties sont une gestion des erreurs plus complexe, des problèmes d'ordonnancement et un débogage plus difficile.",
    explanation:
      "La plupart des applications passent une grande partie de leur temps à attendre des entrées-sorties. Les modèles asynchrones utilisent ce temps d'attente pour faire autre chose, ce qui améliore le débit et la réactivité, mais ils exigent une gestion rigoureuse des erreurs et de l'état partagé.",
    example: "async function load() { const res = await fetch(url); return res.json(); } // le thread est libre pendant que la requête est en cours",
    tips: ["Distinguez asynchrone et parallèle.", "Citez un environnement d'exécution concret comme Node.js ou le thread UI d'une application mobile."],
    commonMistakes: ["Penser que le code asynchrone s'exécute plus vite par lui-même.", "Oublier de gérer les promesses rejetées ou les exceptions."],
    followUpQuestions: ["Qu'est-ce que l'event loop ?", "Comment lancer plusieurs opérations asynchrones en même temps et attendre qu'elles soient toutes terminées ?"],
  },
  'sw-005': {
    question: "Quelle est la différence entre un processus et un thread ?",
    intent: "Le recruteur vérifie votre compréhension de la façon dont les systèmes d'exploitation exécutent les programmes et des compromis entre modèles de concurrence.",
    expectedAnswer:
      "Un processus est un programme en cours d'exécution, avec son propre espace mémoire isolé et ses ressources, comme les descripteurs de fichiers. Un thread est une unité d'exécution à l'intérieur d'un processus ; les threads d'un même processus partagent sa mémoire, mais chacun a sa propre pile et ses propres registres. Créer des threads et basculer de l'un à l'autre coûte moins cher qu'avec des processus, et le partage de mémoire facilite la communication, mais il crée aussi des risques comme les race conditions, qui nécessitent de la synchronisation. Les processus sont mieux isolés : un plantage dans l'un n'affecte généralement pas les autres, c'est pourquoi les navigateurs exécutent les onglets dans des processus séparés.",
    explanation:
      "Le choix entre processus et threads met en balance l'isolation et la sûreté d'un côté, la performance et la facilité de communication de l'autre. Beaucoup de systèmes combinent les deux, par exemple plusieurs processus workers disposant chacun d'un pool de threads.",
    tips: ["Présentez la mémoire partagée à la fois comme l'avantage et le risque des threads.", "Donnez un exemple concret comme les onglets d'un navigateur ou les workers d'un serveur web."],
    commonMistakes: ["Dire que les threads ont une mémoire séparée.", "Ignorer le coût de la synchronisation."],
    followUpQuestions: ["Qu'est-ce qu'une race condition ?", "Que sont les threads légers ou les coroutines ?"],
  },
  'sw-006': {
    question: "Que signifie l'immutabilité et pourquoi est-elle utile ?",
    intent: "Le recruteur veut voir si vous comprenez comment les données immuables réduisent les bugs et simplifient la concurrence et la gestion d'état.",
    expectedAnswer:
      "Un objet immuable ne peut pas être modifié après sa création ; pour le « modifier », on crée un nouvel objet avec les nouvelles valeurs. Le code devient plus facile à raisonner, car une valeur que vous recevez ne peut pas changer dans votre dos. Les données peuvent aussi être partagées entre threads sans verrou, la détection de changement devient peu coûteuse par simple comparaison de références, comme React le fait avec l'état, et les copies défensives deviennent inutiles. Exemples : String et les records en Java, ou les objets gelés et les copies par spread en JavaScript. Le coût est un surplus d'allocations, que les structures de données persistantes réduisent en partageant les parties inchangées.",
    explanation:
      "Beaucoup de bugs viennent d'un état mutable partagé. L'immutabilité élimine toute une classe de problèmes et constitue un fondement de la programmation fonctionnelle et des frameworks UI modernes.",
    example: "const next = { ...user, name: 'Ana' }; // user est inchangé ; next est un nouvel objet",
    tips: ["Donnez un bénéfice en matière de concurrence et un autre en matière de gestion d'état.", "Reconnaissez le coût en performance et expliquez comment on l'atténue."],
    commonMistakes: ["Confondre une référence constante (const, final) avec un objet immuable.", "Penser que l'immutabilité nuit toujours aux performances."],
    followUpQuestions: ["Une List déclarée final en Java est-elle immuable ?", "Comment fonctionnent les structures de données persistantes ?"],
  },
  'sw-007': {
    question: "Comment fonctionnent les ramasse-miettes (garbage collectors), et quels problèmes peuvent-ils causer en production ?",
    intent: "Le recruteur évalue une connaissance approfondie du runtime et votre capacité à diagnostiquer des problèmes de mémoire et de latence.",
    expectedAnswer:
      "Un garbage collector traçant part de racines, comme les variables de la pile et les champs statiques, et marque chaque objet atteignable depuis elles ; les objets inatteignables sont récupérés. La plupart des collecteurs sont générationnels : ils partent du principe que la plupart des objets meurent jeunes, et collectent donc fréquemment une petite jeune génération et rarement l'ancienne génération. Les collecteurs modernes, comme G1, ZGC ou Shenandoah sur la JVM, effectuent l'essentiel du travail de manière concurrente pour garder des pauses courtes. Les problèmes en production incluent des temps de pause qui augmentent la latence, une forte consommation CPU pour la collecte lorsque l'allocation est excessive, et des fuites mémoire quand des objets restent atteignables par erreur, par exemple via des caches statiques ou des listeners jamais retirés. Le diagnostic s'appuie sur les logs GC, les heap dumps et le profilage des allocations, et les correctifs vont de la réduction des allocations au réglage de la taille du tas ou au choix d'un collecteur à faibles pauses.",
    explanation:
      "Le GC supprime la gestion manuelle de la mémoire, mais pas les problèmes de mémoire. Les candidats confirmés savent que les fuites dans les langages managés tiennent à des références involontaires, et que le comportement du GC affecte directement la latence et le débit.",
    tips: ["Expliquez l'atteignabilité à partir des racines.", "Mentionnez l'hypothèse générationnelle.", "Décrivez comment vous investigueriez une fuite ou des pauses longues."],
    commonMistakes: ["Affirmer que les fuites mémoire sont impossibles avec un garbage collector.", "Recommander System.gc() comme correctif."],
    followUpQuestions: ["Comment analyseriez-vous un heap dump ?", "Quand choisiriez-vous un collecteur à faibles pauses ?"],
  },
  'sw-008': {
    question: "Quels sont les quatre grands principes de la programmation orientée objet ?",
    intent: "Le recruteur vérifie vos bases en POO et votre capacité à illustrer chaque principe par un exemple concret.",
    expectedAnswer:
      "L'encapsulation cache l'état interne derrière des méthodes, afin qu'un objet protège sa propre cohérence. L'abstraction n'expose que le nécessaire, par exemple une interface PaymentService sans ses détails d'implémentation. L'héritage permet à une classe de réutiliser et d'étendre une autre classe, comme SavingsAccount qui étend Account. Le polymorphisme permet à du code de travailler avec un type général pendant que chaque type concret fournit son propre comportement, par exemple en appelant shape.area() sur des cercles et des rectangles.",
    explanation:
      "Ces principes visent à maîtriser la complexité : limiter ce que chaque partie du code doit connaître, réutiliser des comportements et permettre d'ajouter de nouveaux types sans modifier le code existant.",
    tips: ["Donnez un court exemple par principe.", "Montrez que vous savez que l'héritage n'est pas le seul moyen de réutiliser du code."],
    commonMistakes: ["Réciter des définitions sans exemple.", "Confondre abstraction et encapsulation."],
    followUpQuestions: ["Quelle est la différence entre abstraction et encapsulation ?", "Quand éviteriez-vous l'héritage ?"],
  },
  'sw-009': {
    question: "Quelle est la différence entre une classe abstraite et une interface ?",
    intent: "Le recruteur veut voir si vous savez quand utiliser chaque construction et comment les langages les traitent.",
    expectedAnswer:
      "Une interface définit un contrat : un ensemble de méthodes qu'une classe s'engage à fournir. Une classe peut implémenter plusieurs interfaces. Une classe abstraite est une implémentation partielle : elle peut avoir des champs, des constructeurs et des méthodes implémentées, mais ne peut pas être instanciée, et une classe ne peut en étendre qu'une seule dans des langages comme Java ou C#. Utilisez une interface pour décrire une capacité partagée par des classes sans lien entre elles, comme Comparable, et une classe abstraite lorsque des classes étroitement liées partagent de l'état et du code. Depuis Java 8, les interfaces peuvent aussi avoir des méthodes default, ce qui réduit l'écart, mais elles ne peuvent toujours pas contenir d'état d'instance.",
    explanation:
      "Le choix relève de la modélisation : les relations « sait faire » correspondent aux interfaces, les relations « est une sorte de, avec une implémentation partagée » aux classes abstraites.",
    tips: ["Évoquez l'implémentation multiple face à l'héritage simple.", "Donnez un exemple de chaque."],
    commonMistakes: ["Dire qu'en Java moderne les interfaces ne peuvent contenir aucun corps de méthode.", "Utiliser des classes abstraites uniquement pour partager une seule méthode utilitaire."],
    followUpQuestions: ["À quoi servent les méthodes default ?", "Pourquoi beaucoup de développeurs préfèrent-ils les interfaces pour les dépendances ?"],
  },
  'sw-010': {
    question: "Qu'est-ce que le polymorphisme, et comment fonctionne la liaison dynamique (dynamic dispatch) ?",
    intent: "Le recruteur vérifie que vous comprenez le comportement à l'exécution du code orienté objet, et pas seulement le vocabulaire.",
    expectedAnswer:
      "Le polymorphisme signifie que du code écrit pour un type général peut fonctionner avec de nombreux types concrets. Avec le polymorphisme de sous-typage, lorsque vous appelez une méthode via une référence du type parent, le runtime sélectionne l'implémentation de la classe réelle de l'objet : c'est la liaison dynamique. En Java, les méthodes non statiques, non final et non private sont résolues ainsi, généralement via une table de méthodes virtuelles par classe. La surcharge (overloading) est différente : elle est résolue à la compilation en fonction des types de paramètres déclarés. Le polymorphisme permet d'ajouter de nouveaux types sans modifier le code qui les utilise, ce qui sert le principe ouvert/fermé.",
    explanation:
      "Savoir que la redéfinition (overriding) est résolue à l'exécution et la surcharge à la compilation explique des comportements surprenants et aide à concevoir du code extensible.",
    example: "Notifier n = new SmsNotifier(); n.send(msg); // c'est SmsNotifier.send qui s'exécute, bien que n soit déclaré comme Notifier",
    tips: ["Distinguez la redéfinition (à l'exécution) de la surcharge (à la compilation).", "Expliquez en quoi le polymorphisme facilite l'extension."],
    commonMistakes: ["Penser que les méthodes statiques sont redéfinies de façon polymorphe.", "Confondre surcharge et redéfinition."],
    followUpQuestions: ["Quelles autres formes de polymorphisme existent, comme les génériques ?", "Comment remplaceriez-vous un long switch sur le type par du polymorphisme ?"],
  },
  'sw-011': {
    question: "Pourquoi beaucoup de développeurs préfèrent-ils la composition à l'héritage ?",
    intent: "Le recruteur veut mesurer votre maturité en conception : comprendre les coûts de l'héritage et la souplesse de la composition.",
    expectedAnswer:
      "L'héritage crée un couplage fort : une sous-classe dépend des détails d'implémentation du parent, si bien qu'une modification du parent peut casser les sous-classes, et les hiérarchies profondes deviennent difficiles à comprendre. Il est aussi figé à la compilation. La composition construit le comportement en combinant des objets : une classe détient des références vers des collaborateurs et leur délègue le travail. Cela garde les classes petites, permet de changer de comportement à l'exécution ou dans les tests, et évite d'imposer une relation « est un » là où elle n'existe pas vraiment. L'héritage reste utile pour de vraies relations de sous-typage avec des classes de base stables, mais la composition est généralement le choix par défaut le plus sûr.",
    explanation:
      "Le problème de la classe de base fragile (fragile base class) et les hiérarchies rigides sont des sources fréquentes de difficultés de conception. La composition associée aux interfaces offre la réutilisation de l'héritage avec un couplage plus lâche.",
    example: "Au lieu de class LoggingRepository extends Repository, écrivez class LoggingRepository implements Repository { private final Repository inner; ... } et déléguez les appels.",
    tips: ["Nommez le problème de la classe de base fragile.", "Montrez un exemple de délégation."],
    commonMistakes: ["Affirmer qu'il ne faut jamais utiliser l'héritage.", "Construire des hiérarchies profondes pour partager de petits bouts de code."],
    followUpQuestions: ["Quels design patterns reposent sur la composition ?", "Quand l'héritage est-il le bon choix ?"],
  },
  'sw-012': {
    question: "Expliquez les principes SOLID.",
    intent: "Le recruteur vérifie que vous connaissez les grandes règles de conception et que vous savez les relier à de vraies décisions de code.",
    expectedAnswer:
      "Responsabilité unique (single responsibility) : une classe ne devrait avoir qu'une seule raison de changer. Ouvert/fermé (open/closed) : le code doit être ouvert à l'extension mais fermé à la modification, par exemple en ajoutant une nouvelle implémentation plutôt qu'en modifiant un switch. Substitution de Liskov : un sous-type doit pouvoir être utilisé partout où son parent est attendu sans casser le comportement. Ségrégation des interfaces : préférez plusieurs petites interfaces ciblées à une grosse interface qui force les classes à implémenter des méthodes dont elles n'ont pas besoin. Inversion des dépendances : le code de haut niveau doit dépendre d'abstractions, pas de détails concrets de bas niveau, ce que l'injection de dépendances facilite. Ce sont des lignes directrices pour réduire le couplage, pas des règles à appliquer mécaniquement.",
    explanation:
      "Les recruteurs apprécient les exemples concrets et la nuance : SOLID aide à garder un code facile à faire évoluer, mais l'appliquer à l'excès peut créer des abstractions inutiles.",
    tips: ["Donnez un exemple par principe si le temps le permet.", "Montrez que vous équilibrez SOLID et simplicité."],
    commonMistakes: ["Réciter l'acronyme sans le comprendre.", "Confondre inversion des dépendances et injection de dépendances."],
    followUpQuestions: ["Donnez un exemple de violation du principe de Liskov.", "Quand l'application de SOLID devient-elle de la sur-ingénierie ?"],
  },
  'sw-013': {
    question: "Donnez un exemple de violation du principe de substitution de Liskov et expliquez comment vous la corrigeriez.",
    intent: "Le recruteur évalue une réflexion de conception avancée : savoir reconnaître une relation d'héritage sémantiquement fausse.",
    expectedAnswer:
      "Une violation classique est Square qui étend Rectangle. Rectangle permet de définir la largeur et la hauteur indépendamment ; un Square doit les garder égales, donc son setWidth modifie aussi la hauteur. Du code qui travaille avec un Rectangle, par exemple en fixant la largeur à 5 et la hauteur à 4 et en attendant une aire de 20, ne fonctionne plus lorsqu'il reçoit un Square. Le sous-type a affaibli une garantie donnée par le parent. Un autre cas fréquent est une ReadOnlyList qui lève une exception sur add tout en héritant d'une List mutable. Les corrections possibles : ne pas utiliser l'héritage pour ces types, modéliser les formes comme des valeurs immuables avec une interface Shape commune n'exposant que l'aire, ou découper les interfaces en capacités de lecture et d'écriture afin que chaque type ne promette que ce qu'il peut tenir.",
    explanation:
      "Liskov porte sur les contrats comportementaux, pas seulement sur les signatures de méthodes. Un sous-type doit accepter au moins ce que le parent accepte et garantir au moins ce que le parent garantit.",
    tips: ["Expliquez l'attente rompue du point de vue du code appelant.", "Proposez une correction de conception, pas seulement le diagnostic."],
    commonMistakes: ["Penser que si le code compile, la substitution est valide.", "Corriger le problème avec des tests instanceof dans le code appelant."],
    followUpQuestions: ["Quel est le lien entre préconditions, postconditions et principe de Liskov ?", "La liste non modifiable de Java constitue-t-elle une violation ?"],
  },
  'sw-014': {
    question: "Comment concevriez-vous un modèle de domaine dans lequel les états invalides sont impossibles à représenter ?",
    intent: "Le recruteur veut voir des compétences avancées en modélisation : utiliser les types et l'encapsulation pour faire respecter les règles métier.",
    expectedAnswer:
      "Je placerais la validation dans les types eux-mêmes. Au lieu de faire circuler des chaînes et des nombres bruts, je créerais de petits value objects comme EmailAddress ou Money, qui se valident à la création et sont immuables : une instance invalide ne peut donc jamais exister. Les entités exposeraient des méthodes métier, comme order.ship(), plutôt que des setters publics, et ces méthodes vérifieraient les transitions : une commande ne peut pas être expédiée avant d'être payée. Pour des états portant des données différentes, j'utiliserais un ensemble fermé de types, par exemple des sealed interfaces ou des unions discriminées où un PaidOrder porte une référence de paiement et un DraftOrder non. Des factories ou des constructeurs imposeraient les champs obligatoires. Résultat : la plupart des règles sont vérifiées une seule fois, à la frontière, et le reste du code peut faire confiance aux objets qu'il reçoit.",
    explanation:
      "Rendre les états illégaux non représentables réduit les vérifications défensives disséminées dans le code et transforme de nombreux bugs d'exécution en erreurs de compilation. Cette approche combine encapsulation, immutabilité et types expressifs.",
    example: "sealed interface Order permits Draft, Paid, Shipped {} // Shipped possède un trackingNumber ; Draft ne peut pas être expédié car il n'a pas de méthode ship().",
    tips: ["Mentionnez les value objects et les transitions d'état contrôlées.", "Montrez comment le système de types vous aide.", "Expliquez où la validation a lieu."],
    commonMistakes: ["S'appuyer sur des setters publics et des if éparpillés.", "Créer tellement de types que les changements simples deviennent coûteux."],
    followUpQuestions: ["Comment gérez-vous les erreurs de validation des saisies utilisateur ?", "Comment cette approche s'articule-t-elle avec les ORM ?"],
  },
  'sw-015': {
    question: "Quelle est la différence entre un tableau et une liste chaînée ?",
    intent: "Le recruteur vérifie votre compréhension de l'organisation en mémoire et du coût des opérations courantes.",
    expectedAnswer:
      "Un tableau stocke ses éléments de manière contiguë en mémoire : l'accès à un élément par son indice se fait en temps constant, O(1), et le parcours tire bien parti du cache. Insérer ou supprimer au milieu coûte O(n), car il faut décaler les éléments. Une liste chaînée stocke des nœuds qui pointent vers le nœud suivant : l'insertion ou la suppression à un nœud connu est en O(1), mais trouver un élément par son indice coûte O(n) et les nœuds sont dispersés en mémoire, ce qui pénalise le cache. En pratique, les tableaux dynamiques comme ArrayList ou les tableaux JavaScript sont le bon choix par défaut dans la plupart des cas.",
    explanation:
      "La notation Big O ne dit pas tout : la localité mémoire rend souvent les tableaux plus rapides, même pour des opérations où les listes chaînées semblent meilleures sur le papier.",
    tips: ["Comparez l'accès, l'insertion et l'utilisation mémoire.", "Précisez que les tableaux dynamiques sont le choix courant par défaut."],
    commonMistakes: ["Dire que les listes chaînées sont toujours plus rapides pour l'insertion sans tenir compte de la recherche nécessaire pour trouver la position."],
    followUpQuestions: ["Comment un tableau dynamique s'agrandit-il ?", "Dans quel cas utiliseriez-vous vraiment une liste chaînée ?"],
  },
  'sw-016': {
    question: "Qu'est-ce qu'une table de hachage et comment fonctionne-t-elle ?",
    intent: "Le recruteur veut voir si vous comprenez l'une des structures de données les plus utilisées et ses caractéristiques de performance.",
    expectedAnswer:
      "Une table de hachage stocke des paires clé-valeur. Une fonction de hachage convertit la clé en un nombre qui détermine un bucket dans un tableau interne. Pour rechercher une clé, la table calcule son hash et va directement au bucket, si bien que la recherche, l'insertion et la suppression sont en O(1) en moyenne. Deux clés peuvent tomber dans le même bucket, c'est une collision, gérée soit en chaînant les entrées dans une liste, soit en sondant un autre emplacement (probing). Quand la table devient trop pleine, elle se redimensionne et redistribue les entrées. Les performances se dégradent si beaucoup de clés entrent en collision : une bonne fonction de hachage et une égalité correcte sont donc essentielles.",
    explanation:
      "Les tables de hachage sont au cœur des maps, des sets, des caches et des index. Comprendre les collisions et le redimensionnement explique leur comportement moyen et dans le pire cas.",
    tips: ["Expliquez le hachage, les buckets et les collisions.", "Mentionnez le redimensionnement et le facteur de charge (load factor)."],
    commonMistakes: ["Dire que les recherches sont toujours en O(1), sans exception.", "Oublier que les clés doivent avoir un hash et une égalité cohérents."],
    followUpQuestions: ["Que se passe-t-il si vous modifiez une clé après l'avoir insérée ?", "Pourquoi des objets égaux doivent-ils avoir des hash codes égaux ?"],
  },
  'sw-017': {
    question: "Quand utiliseriez-vous une pile, une file ou une file de priorité ?",
    intent: "Le recruteur vérifie que vous savez choisir la bonne structure pour un problème et justifier ce choix.",
    expectedAnswer:
      "Une pile fonctionne en dernier entré, premier sorti (LIFO) : elle est utile pour un historique d'annulation, l'analyse d'expressions imbriquées, le parcours en profondeur et le suivi des appels de fonctions. Une file fonctionne en premier entré, premier sorti (FIFO) : elle est utile pour traiter des tâches dans leur ordre d'arrivée, le parcours en largeur et la mise en tampon de messages entre un producteur et un consommateur. Une file de priorité renvoie toujours l'élément de plus haute priorité ; elle est généralement implémentée avec un tas binaire, qui offre une insertion et un retrait en O(log n) : utile pour ordonnancer des jobs par urgence, pour l'algorithme du plus court chemin de Dijkstra ou pour conserver les k meilleurs éléments d'un flux.",
    explanation:
      "Choisir une structure en fonction de l'ordre dans lequel les éléments doivent être traités est une compétence de base, mais très fréquemment évaluée en entretien.",
    tips: ["Donnez au moins un cas d'usage réel pour chacune.", "Mentionnez le tas comme implémentation habituelle de la file de priorité."],
    commonMistakes: ["Implémenter une file de priorité avec une liste triée sans discuter du coût."],
    followUpQuestions: ["Comment implémenteriez-vous une file à l'aide de deux piles ?", "Comment trouver les k plus grands éléments d'un flux ?"],
  },
  'sw-018': {
    question: "Qu'est-ce qu'un arbre binaire de recherche, et pourquoi peut-il devenir lent ?",
    intent: "Le recruteur veut voir si vous comprenez les structures arborescentes et l'importance de l'équilibrage.",
    expectedAnswer:
      "Un arbre binaire de recherche (BST) est un arbre dont chaque nœud a au plus deux enfants, toutes les valeurs du sous-arbre gauche étant inférieures au nœud et toutes celles du sous-arbre droit supérieures. Cet ordre permet la recherche, l'insertion et la suppression en O(log n) lorsque l'arbre est équilibré, car chaque étape divise par deux le nombre de nœuds restants. Mais si les valeurs sont insérées dans l'ordre trié, l'arbre dégénère en chaîne et les opérations passent en O(n). Les arbres auto-équilibrés, comme les arbres rouge-noir ou les arbres AVL, corrigent cela en effectuant des rotations de nœuds pour garder une hauteur logarithmique ; le TreeMap de Java utilise un arbre rouge-noir.",
    explanation:
      "L'idée clé est que la performance dépend de la hauteur. L'équilibrage garantit une hauteur logarithmique, et donc des performances prévisibles.",
    tips: ["Expliquez la propriété d'ordre.", "Mentionnez le pire cas de l'insertion triée et les arbres équilibrés."],
    commonMistakes: ["Dire que les opérations sur un BST sont toujours en O(log n)."],
    followUpQuestions: ["Comment parcourir un BST dans l'ordre trié ?", "Quand utiliseriez-vous une tree map plutôt qu'une hash map ?"],
  },
  'sw-019': {
    question: "Qu'est-ce qu'un graphe, et comment le représenteriez-vous en code ?",
    intent: "Le recruteur vérifie que vous savez modéliser des relations et choisir une représentation selon les opérations nécessaires.",
    expectedAnswer:
      "Un graphe est un ensemble de nœuds reliés par des arêtes, qui peuvent être orientées ou non, pondérées ou non. Il modélise des réseaux, des dépendances, des itinéraires ou des relations sociales. Les deux représentations principales sont la liste d'adjacence, où chaque nœud stocke la liste de ses voisins, et la matrice d'adjacence, un tableau à deux dimensions où la cellule [i][j] indique la présence d'une arête. Les listes d'adjacence utilisent une mémoire proportionnelle au nombre de nœuds plus le nombre d'arêtes et conviennent aux graphes peu denses, ce qui est le cas de la plupart des graphes réels. Les matrices utilisent O(n²) en mémoire mais répondent en temps constant à la question « existe-t-il une arête entre i et j ? », ce qui convient aux graphes petits ou denses.",
    explanation:
      "Le choix de la représentation dépend de la densité du graphe et des opérations dont vous avez le plus besoin, comme parcourir les voisins ou tester l'existence d'une arête.",
    tips: ["Donnez un exemple concret de graphe.", "Comparez les coûts en mémoire et en opérations des deux représentations."],
    commonMistakes: ["Utiliser une matrice pour un énorme graphe peu dense."],
    followUpQuestions: ["Comment détecter un cycle dans un graphe orienté ?", "Comment trouveriez-vous le plus court chemin entre deux nœuds ?"],
  },
  'sw-020': {
    question: "Comment concevriez-vous un cache LRU avec des opérations get et put en O(1) ?",
    intent: "Le recruteur évalue votre capacité à combiner des structures de données pour répondre à des exigences de performance précises.",
    expectedAnswer:
      "Je combinerais une hash map et une liste doublement chaînée. La map associe chaque clé à un pointeur vers son nœud dans la liste, ce qui donne une recherche en O(1). La liste maintient les entrées triées par utilisation récente : la plus récemment utilisée en tête, la moins récemment utilisée en queue. Sur un get, je trouve le nœud via la map, je le déplace en tête et je renvoie la valeur. Sur un put, si la clé existe, je mets à jour la valeur et je déplace le nœud en tête ; sinon, je crée un nœud en tête et je l'ajoute à la map, et si la capacité est dépassée, je supprime le nœud de queue et retire sa clé de la map. Toutes les opérations sont en O(1), car déplacer ou supprimer un nœud dans une liste doublement chaînée ne modifie que quelques pointeurs. En Java, LinkedHashMap avec l'ordre d'accès et removeEldestEntry fournit ce comportement clé en main. Pour un usage concurrent, j'ajouterais du verrouillage ou j'utiliserais une bibliothèque de cache dédiée.",
    explanation:
      "Cette question classique teste la composition de structures : la map fournit la recherche rapide, la liste fournit la mise à jour rapide de l'ordre. Mentionner les implémentations existantes et la sûreté en environnement multithread montre une sensibilité à la production.",
    tips: ["Expliquez pourquoi chaque structure est nécessaire.", "Déroulez get et put étape par étape.", "Évoquez la thread safety et les bibliothèques existantes."],
    commonMistakes: ["Utiliser une liste simplement chaînée, ce qui rend la suppression en O(n).", "Oublier de retirer la clé de la map lors de l'éviction."],
    followUpQuestions: ["Comment le rendriez-vous thread-safe ?", "Comment ajouteriez-vous une expiration basée sur le temps ?"],
  },
  'sw-021': {
    question: "Que sont les tries et les filtres de Bloom, et quand les utiliseriez-vous ?",
    intent: "Le recruteur vérifie une connaissance avancée de structures spécialisées et de leurs compromis.",
    expectedAnswer:
      "Un trie est un arbre dont chaque arête représente un caractère, de sorte que les mots partageant un préfixe partagent un chemin. Rechercher un mot ou lister tous les mots ayant un préfixe donné prend un temps proportionnel à la longueur du mot, et non au nombre de mots, ce qui rend les tries utiles pour l'autocomplétion, la correction orthographique et les tables de routage. Leur coût est la mémoire, que les tries compressés réduisent. Un filtre de Bloom est un ensemble probabiliste compact : il utilise plusieurs fonctions de hachage pour positionner des bits dans un tableau de bits. Il peut répondre « certainement absent » ou « peut-être présent » ; les faux positifs sont possibles mais pas les faux négatifs, et on ne peut normalement pas en retirer d'éléments. Il est utile pour éviter des recherches coûteuses, par exemple vérifier qu'une clé peut exister avant de lire sur disque, comme le font des bases de données telles que Cassandra, ou filtrer les URL déjà visitées dans un crawler.",
    explanation:
      "Ces deux structures sacrifient la généralité au profit de l'efficacité dans un cas d'usage précis : les requêtes par préfixe pour les tries, les tests d'appartenance économes en mémoire pour les filtres de Bloom.",
    tips: ["Expliquez précisément la propriété de faux positifs des filtres de Bloom.", "Citez un système réel qui utilise chaque structure."],
    commonMistakes: ["Dire qu'un filtre de Bloom peut produire des faux négatifs.", "Ignorer le coût mémoire des tries."],
    followUpQuestions: ["Comment choisir la taille d'un filtre de Bloom ?", "Comment implémenteriez-vous une autocomplétion classée par popularité ?"],
  },
  'sw-022': {
    question: "Que décrit la notation Big O ?",
    intent: "Le recruteur vérifie que vous savez raisonner sur la manière dont les algorithmes passent à l'échelle avec la taille des données.",
    expectedAnswer:
      "La notation Big O décrit comment le temps d'exécution ou la consommation mémoire d'un algorithme croît avec la taille de l'entrée, en se concentrant sur le terme dominant et en ignorant les constantes. O(1) correspond à un temps constant, comme l'accès à un élément d'un tableau par son indice. O(log n) croît très lentement, comme la recherche dichotomique. O(n) est linéaire, comme un parcours unique d'une liste. O(n log n) est typique des tris efficaces, et O(n²) apparaît avec des boucles imbriquées sur les mêmes données. Elle décrit généralement le pire cas, même si l'on parle aussi du cas moyen, par exemple pour les tables de hachage.",
    explanation:
      "Big O aide à comparer des approches avant d'écrire du code et explique pourquoi un algorithme qui fonctionne sur cent éléments peut échouer sur un million.",
    example: "Détecter des doublons avec deux boucles imbriquées est en O(n²) ; ajouter les éléments dans un HashSet et tester l'appartenance est en O(n) en moyenne.",
    tips: ["Donnez un exemple pour chaque complexité courante.", "Précisez qu'en pratique les constantes comptent pour de petites entrées."],
    commonMistakes: ["Penser que Big O donne le temps d'exécution exact.", "Oublier la complexité en espace."],
    followUpQuestions: ["Quelle est la complexité de la recherche dichotomique, et pourquoi ?", "Un algorithme en O(n²) peut-il être plus rapide qu'un algorithme en O(n log n) ?"],
  },
  'sw-023': {
    question: "Comment fonctionne la recherche dichotomique (binary search), et que nécessite-t-elle ?",
    intent: "Le recruteur veut voir une compréhension précise d'un algorithme fondamental, y compris de ses cas limites.",
    expectedAnswer:
      "La recherche dichotomique trouve une valeur dans une collection triée en comparant à chaque itération la cible avec l'élément du milieu. Si la cible est plus petite, la recherche continue dans la moitié gauche ; si elle est plus grande, dans la moitié droite. Chaque étape divise par deux l'espace de recherche, d'où une complexité en O(log n) : environ 20 étapes pour un million d'éléments. Elle exige que les données soient triées et permettent un accès direct par indice. Les pièges courants sont les erreurs de décalage d'un (off-by-one) dans les bornes de la boucle et le calcul du milieu sous la forme (low + high) / 2, qui peut provoquer un dépassement d'entier dans certains langages ; low + (high - low) / 2 évite ce problème.",
    explanation:
      "La recherche dichotomique est simple à décrire mais facile à mal implémenter. Mentionner les cas limites montre que vous l'avez réellement codée.",
    example: "while (low <= high) { int mid = low + (high - low) / 2; if (a[mid] == t) return mid; if (a[mid] < t) low = mid + 1; else high = mid - 1; }",
    tips: ["Énoncez d'abord l'exigence de données triées.", "Citez un cas limite comme le dépassement d'entier ou les tableaux vides."],
    commonMistakes: ["Appliquer la recherche dichotomique à des données non triées.", "Des boucles infinies dues à une mauvaise mise à jour des bornes."],
    followUpQuestions: ["Comment trouveriez-vous la première occurrence d'une valeur en double ?", "Peut-on faire une recherche dichotomique efficace sur une liste chaînée ?"],
  },
  'sw-024': {
    question: "Comparez le tri rapide (quicksort) et le tri fusion (merge sort).",
    intent: "Le recruteur vérifie votre compréhension des algorithmes de tri classiques, de leur complexité et de leurs compromis pratiques.",
    expectedAnswer:
      "Les deux reposent sur le principe « diviser pour régner » et s'exécutent en O(n log n) en moyenne. Le tri fusion coupe le tableau en deux, trie récursivement chaque moitié puis les fusionne ; il est toujours en O(n log n) et il est stable, c'est-à-dire que les éléments égaux conservent leur ordre, mais il nécessite O(n) de mémoire supplémentaire pour les tableaux. Le quicksort choisit un pivot, partitionne les éléments plus petits et plus grands que le pivot, puis trie chaque côté ; il trie en place avec peu de mémoire supplémentaire et il est très rapide en pratique grâce à la localité du cache, mais son pire cas est en O(n²) lorsque les pivots sont mal choisis, ce que les pivots aléatoires ou la médiane de trois rendent improbable. Il n'est pas stable. Les bibliothèques réelles utilisent des hybrides : Java trie les objets avec TimSort, un algorithme stable fondé sur la fusion, et les types primitifs avec un quicksort à double pivot.",
    explanation:
      "Cette comparaison met en évidence les compromis entre performance garantie, stabilité et mémoire. Savoir ce qu'utilisent réellement les bibliothèques standard démontre une connaissance pratique.",
    tips: ["Comparez le pire cas, la mémoire et la stabilité.", "Mentionnez ce qu'utilise la bibliothèque standard de votre langage."],
    commonMistakes: ["Dire que le quicksort est toujours en O(n log n).", "Oublier la stabilité comme critère."],
    followUpQuestions: ["Pourquoi la stabilité compte-t-elle lorsqu'on trie selon plusieurs champs ?", "Comment trieriez-vous des données qui ne tiennent pas en mémoire ?"],
  },
  'sw-025': {
    question: "Quelle est la différence entre le parcours en largeur (BFS) et le parcours en profondeur (DFS) ?",
    intent: "Le recruteur vérifie vos connaissances en parcours de graphes et votre capacité à choisir l'approche adaptée.",
    expectedAnswer:
      "Le parcours en largeur explore un graphe niveau par niveau à partir du nœud de départ, à l'aide d'une file : il visite d'abord tous les voisins directs, puis leurs voisins, et ainsi de suite. Dans un graphe non pondéré, il trouve le plus court chemin en nombre d'arêtes. Le parcours en profondeur va le plus loin possible le long d'une branche avant de revenir en arrière, à l'aide d'une pile ou de la récursion. Il est utile pour détecter des cycles, effectuer un tri topologique et explorer tous les chemins possibles, comme dans les puzzles. Les deux s'exécutent en O(V + E) avec une liste d'adjacence. Le BFS peut consommer plus de mémoire sur des graphes larges car il stocke un niveau entier, tandis que le DFS peut atteindre les limites de récursion sur des graphes très profonds. Les deux ont besoin d'un ensemble de nœuds visités pour éviter les boucles infinies dans les graphes comportant des cycles.",
    explanation:
      "Le choix entre BFS et DFS dépend de votre besoin : les plus courts chemins et les résultats les plus proches favorisent le BFS, tandis que l'exploration exhaustive et l'ordonnancement des dépendances favorisent le DFS.",
    tips: ["Mentionnez la structure de données sous-jacente à chacun.", "Donnez un cas d'usage où chacun est clairement meilleur."],
    commonMistakes: ["Oublier l'ensemble des nœuds visités.", "Utiliser le BFS pour les plus courts chemins dans des graphes pondérés."],
    followUpQuestions: ["Comment trouveriez-vous le plus court chemin dans un graphe pondéré ?", "Comment implémenter un DFS sans récursion ?"],
  },
};
