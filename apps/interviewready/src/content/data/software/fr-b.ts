import type { QuestionText, TextTable } from '@/types/content';

/** Questions logicielles 026-050 : algorithmes (partie), design patterns, clean code, tests, débogage. */
export const frB: TextTable<QuestionText> = {
  "sw-026": {
    question: "Qu'est-ce que la programmation dynamique ? Donnez un exemple.",
    intent: "Le recruteur vérifie que vous savez reconnaître les problèmes à sous-problèmes qui se chevauchent et les optimiser.",
    expectedAnswer:
      "La programmation dynamique résout un problème en le décomposant en sous-problèmes qui se chevauchent, en résolvant chacun une seule fois et en réutilisant les résultats stockés. Elle s'applique quand le problème possède une sous-structure optimale, c'est-à-dire qu'une solution optimale se construit à partir des solutions optimales des sous-problèmes. Il existe deux approches : top-down avec mémoïsation, où une fonction récursive met ses résultats en cache, et bottom-up, où l'on remplit un tableau en partant des plus petits cas. Un exemple simple est Fibonacci : la récursion naïve est exponentielle car elle recalcule les mêmes valeurs, alors que stocker les résultats la ramène à O(n). Parmi les exemples concrets, on trouve le calcul du nombre minimal de pièces pour un montant donné, la distance d'édition entre deux chaînes ou la plus longue sous-séquence commune.",
    explanation:
      "La compétence clé consiste à repérer les sous-problèmes répétés dans une solution récursive. Une fois identifiés, la mise en cache transforme un temps exponentiel en temps polynomial.",
    example: "coins(amount) = 1 + min(coins(amount - c) for c in denominations), avec les résultats stockés dans un tableau de 0 à amount.",
    tips: ["Partez d'une formulation récursive, puis ajoutez la mémoïsation.", "Précisez la complexité en temps et en espace de la version optimisée."],
    commonMistakes: ["Confondre programmation dynamique et simple récursion.", "L'utiliser alors que les sous-problèmes ne se chevauchent pas."],
    followUpQuestions: ["Pouvez-vous réduire la mémoire utilisée par votre tableau ?", "Quelle est la différence entre les algorithmes gloutons et la programmation dynamique ?"],
  },
  "sw-027": {
    question: "Comment trouveriez-vous le plus court chemin dans un graphe pondéré, et quelles sont les limites de votre approche ?",
    intent: "Le recruteur évalue votre maîtrise des algorithmes avancés et votre attention aux préconditions, comme les poids négatifs.",
    expectedAnswer:
      "Pour des poids non négatifs, j'utiliserais l'algorithme de Dijkstra. Il maintient une file de priorité de nœuds triés selon leur meilleure distance actuelle depuis la source. Il retire à chaque fois le nœud le plus proche et, pour chaque voisin, vérifie si passer par ce nœud donne un chemin plus court ; si c'est le cas, il met à jour la distance et ajoute le voisin dans la file. Avec un tas binaire, il s'exécute en O((V + E) log V). Il échoue avec des arêtes de poids négatif, car un nœud retiré de la file est considéré comme définitif. Pour des poids négatifs, j'utiliserais Bellman-Ford, qui relâche toutes les arêtes V - 1 fois en O(V × E) et peut aussi détecter les cycles négatifs. Quand une bonne heuristique existe, comme la distance géographique sur une carte, A* explore moins de nœuds que Dijkstra en privilégiant ceux qui semblent plus proches de la cible. Pour de très grands réseaux routiers, les systèmes précalculent des structures comme les contraction hierarchies.",
    explanation:
      "Une réponse de niveau avancé indique l'algorithme, sa complexité et surtout ses hypothèses. Savoir quand Dijkstra est inadapté et quelle alternative utiliser montre une vraie compréhension.",
    tips: ["Énoncez explicitement l'hypothèse de poids non négatifs.", "Donnez la complexité en précisant la structure de données utilisée.", "Montrez que vous connaissez A* ou d'autres optimisations."],
    commonMistakes: ["Utiliser un BFS sur un graphe pondéré.", "Appliquer Dijkstra avec des poids négatifs."],
    followUpQuestions: ["Comment reconstruisez-vous le chemin, et pas seulement sa longueur ?", "Comment géreriez-vous un graphe qui change fréquemment ?"],
  },
  "sw-028": {
    question: "Comment traiteriez-vous un jeu de données trop volumineux pour tenir en mémoire, par exemple pour trouver les éléments les plus fréquents ?",
    intent: "Le recruteur vérifie que vous savez adapter les algorithmes aux contraintes réelles : mémoire, disque et distribution.",
    expectedAnswer:
      "D'abord, j'éviterais de tout charger : je lirais les données en flux et ne garderais que le nécessaire. Pour des comptages exacts avec beaucoup d'éléments distincts, je partitionnerais les données en hachant chaque élément vers l'un de plusieurs fichiers, afin qu'un même élément aille toujours dans le même fichier. Chaque fichier est alors assez petit pour être compté en mémoire avec une table de hachage, et je conserve les k meilleurs résultats de chacun avec un tas min de taille k, avant de les fusionner. Si une réponse approximative est acceptable, un algorithme de streaming comme le Count-Min Sketch combiné à un tas, ou l'algorithme de Misra-Gries, trouve les éléments fréquents avec une mémoire fixe. À plus grande échelle, c'est la même idée de partitionnement qu'appliquent MapReduce ou Spark sur plusieurs machines : associer les éléments à des clés, redistribuer par clé, puis agréger les comptes. Je demanderais aussi si le résultat doit être exact et à quelle fréquence il doit être calculé, car cela change la meilleure conception.",
    explanation:
      "Cette question évalue la capacité à combiner hachage, tas et streaming avec une vision système. Poser la question de l'exactitude et de la fréquence montre que vous concevez en fonction des besoins.",
    tips: ["Mentionnez le partitionnement par hachage pour regrouper les clés identiques.", "Proposez à la fois une approche exacte et une approche approximative.", "Posez des questions pour clarifier les besoins."],
    commonMistakes: ["Proposer simplement d'acheter plus de mémoire.", "Trier tout le jeu de données sans tenir compte du coût d'un tri externe."],
    followUpQuestions: ["Comment fonctionne un Count-Min Sketch ?", "Comment géreriez-vous une clé très surreprésentée qui rend une partition trop volumineuse ?"],
  },
  "sw-029": {
    question: "Qu'est-ce qu'un design pattern ? Citez-en quelques-uns que vous avez utilisés.",
    intent: "Le recruteur vérifie que vous voyez les patterns comme des solutions réutilisables et que vous savez les relier à du code réel.",
    expectedAnswer:
      "Un design pattern est une solution connue et réutilisable à un problème de conception récurrent, décrite indépendamment d'un langage précis. Les patterns donnent aux développeurs un vocabulaire commun. Parmi les plus courants : la Factory, qui centralise la création d'objets ; la Strategy, qui permet d'interchanger des algorithmes derrière une interface, par exemple différents moyens de paiement ; l'Observer, où des objets s'abonnent à des événements, utilisé dans les event listeners ; l'Adapter, qui enveloppe une classe existante pour la rendre conforme à l'interface attendue ; et le Decorator, qui ajoute un comportement en enveloppant un objet, par exemple pour ajouter du logging autour d'un service.",
    explanation:
      "Les recruteurs s'intéressent moins aux noms qu'à votre capacité à savoir quand un pattern résout un vrai problème. Relier chaque pattern à quelque chose que vous avez construit rend la réponse crédible.",
    tips: ["Choisissez des patterns que vous avez réellement utilisés.", "Expliquez le problème que chacun a résolu."],
    commonMistakes: ["Énumérer de nombreux patterns sans exemples.", "Utiliser des patterns là où du code simple suffirait."],
    followUpQuestions: ["Quel pattern des frameworks comme Spring utilisent-ils massivement ?", "Quand un pattern relève-t-il de la sur-ingénierie ?"],
  },
  "sw-030": {
    question: "Expliquez le pattern Strategy et dans quels cas vous l'utiliseriez.",
    intent: "Le recruteur attend une compréhension concrète d'un pattern comportemental très répandu.",
    expectedAnswer:
      "Le pattern Strategy définit une famille d'algorithmes interchangeables derrière une interface commune et permet au client d'en choisir un à l'exécution. Par exemple, un service de paiement de commande peut utiliser une interface ShippingCostStrategy avec des implémentations pour la livraison standard, express et le retrait en magasin. Le service appelle strategy.calculate(order) sans savoir laquelle il utilise. Cela remplace de longues chaînes de if/else ou de switch sur un type, permet d'ajouter facilement une nouvelle option sans modifier le code existant et rend chaque stratégie testable isolément. Dans les langages où les fonctions sont des citoyens de première classe, une stratégie peut simplement être une fonction passée en paramètre.",
    explanation:
      "Strategy est une application directe du polymorphisme et du principe ouvert/fermé. Savoir qu'une lambda peut jouer le même rôle montre une compréhension moderne.",
    example: "interface DiscountStrategy { Money apply(Order o); } — new NoDiscount(), new PercentageDiscount(10), new BuyTwoGetOne() sont choisies par configuration.",
    tips: ["Partez du problème : des conditions qui ne cessent de grossir.", "Précisez que des fonctions peuvent remplacer de petites classes de stratégie."],
    commonMistakes: ["Créer une interface de stratégie pour une seule implémentation qui ne changera jamais."],
    followUpQuestions: ["Comment choisiriez-vous la stratégie à l'exécution ?", "En quoi Strategy diffère-t-il de State ?"],
  },
  "sw-031": {
    question: "Qu'est-ce que le pattern Observer ? Quels problèmes peut-il poser ?",
    intent: "Le recruteur vérifie votre compréhension de la conception événementielle et de ses pièges.",
    expectedAnswer:
      "Dans le pattern Observer, un sujet tient une liste d'observateurs et les notifie lorsque son état change. Les observateurs s'inscrivent et se désinscrivent eux-mêmes, si bien que le sujet n'a pas besoin de connaître leurs types concrets. C'est la base des event listeners dans les interfaces, des flux réactifs et des événements métier. Parmi les problèmes : des fuites mémoire quand des observateurs oublient de se désabonner et restent référencés, un ordre de notification imprévisible, des cascades de mises à jour difficiles à déboguer, et des exceptions dans un observateur qui affectent les autres. Une notification synchrone peut aussi ralentir le sujet, c'est pourquoi beaucoup de systèmes diffusent les événements de manière asynchrone via une file ou un bus d'événements.",
    explanation:
      "Observer découple les producteurs des consommateurs, mais ce découplage rend les flux plus difficiles à suivre. Connaître les pièges montre une vraie expérience du code événementiel.",
    tips: ["Donnez un cas d'usage réel, comme les listeners d'interface ou les événements métier.", "Évoquez le désabonnement et les fuites mémoire."],
    commonMistakes: ["Négliger la gestion des erreurs entre observateurs.", "Oublier de retirer les listeners, par exemple dans les effets React."],
    followUpQuestions: ["Quel est le lien avec la messagerie publish/subscribe ?", "Comment nettoyez-vous les listeners dans le cycle de vie d'un composant ?"],
  },
  "sw-032": {
    question: "Pourquoi le pattern Singleton est-il souvent considéré comme un anti-pattern ?",
    intent: "Le recruteur veut voir votre esprit critique face à un pattern simple mais souvent mal utilisé.",
    expectedAnswer:
      "Un Singleton garantit qu'une classe n'a qu'une seule instance et fournit un accès global à celle-ci. Le problème vient de cet accès global : n'importe quel code peut l'atteindre, ce qui masque les dépendances, crée un couplage implicite et complique les tests, car on ne peut pas facilement le remplacer par une doublure. Les singletons qui portent un état mutable posent aussi des problèmes de concurrence et rendent le comportement dépendant de l'ordre d'exécution des tests. Une meilleure approche consiste généralement à avoir une instance unique gérée par un conteneur d'injection de dépendances, comme les beans Spring qui sont des singletons par défaut, et à l'injecter explicitement. On conserve ainsi « une seule instance » sans l'accès global, et on peut la substituer dans les tests.",
    explanation:
      "La distinction entre avoir une seule instance et y accéder globalement est l'idée clé. L'injection de dépendances conserve l'avantage et supprime la plupart des inconvénients.",
    tips: ["Séparez l'idée d'instance unique de celle d'accès global.", "Proposez l'injection de dépendances comme alternative."],
    commonMistakes: ["Affirmer que les singletons ne devraient jamais exister.", "Oublier la thread-safety lors de l'initialisation paresseuse."],
    followUpQuestions: ["Comment rendriez-vous un singleton paresseux thread-safe en Java ?", "Quel est le scope par défaut d'un bean Spring ?"],
  },
  "sw-033": {
    question: "Comment décidez-vous d'introduire un design pattern ou une abstraction dans votre code ?",
    intent: "Le recruteur évalue votre jugement d'ingénieur : éviter à la fois le code rigide et la sur-ingénierie.",
    expectedAnswer:
      "Je pars de la pression réelle au changement, pas du pattern. Si un morceau de code n'a qu'une implémentation et aucune variation prévisible, je le garde concret et simple. J'introduis une abstraction quand je constate un vrai besoin : une deuxième implémentation arrive, une dépendance doit être remplacée dans les tests, ou une condition grossit à chaque nouveau cas. Une règle utile consiste à attendre la deuxième ou la troisième occurrence avant de généraliser, pour que l'abstraction repose sur des exemples réels plutôt que sur des suppositions. Je pense aussi à ceux qui maintiendront le code : une abstraction doit faciliter le prochain changement pour l'équipe, et son nom doit exprimer le domaine, pas le pattern. Quand j'en introduis une, je privilégie la forme la plus simple, par exemple un paramètre de type fonction avant une hiérarchie Strategy complète, et je documente sa raison d'être.",
    explanation:
      "Les ingénieurs expérimentés équilibrent flexibilité et simplicité. S'appuyer sur des signes concrets de changement, comme des cas répétés ou des besoins de test, pour justifier une abstraction évite la complexité spéculative.",
    tips: ["Mentionnez la « règle de trois » ou le fait d'attendre une variation réelle.", "Parlez du coût d'une abstraction pour ceux qui lisent le code.", "Donnez un exemple tiré de votre expérience."],
    commonMistakes: ["Ajouter des interfaces partout « au cas où ».", "Refuser toute abstraction et dupliquer la logique partout."],
    followUpQuestions: ["Parlez-moi d'une abstraction que vous avez regrettée.", "Comment supprimez-vous une abstraction devenue inutile ?"],
  },
  "sw-034": {
    question: "Expliquez l'architecture hexagonale (ports et adaptateurs). Quel problème résout-elle ?",
    intent: "Le recruteur vérifie vos connaissances en architecture et votre compréhension du sens des dépendances dans de vraies applications.",
    expectedAnswer:
      "L'architecture hexagonale place la logique métier au centre et l'isole des détails techniques. Le cœur définit des ports : des interfaces qui décrivent ce dont il a besoin, comme OrderRepository ou PaymentGateway, et ce qu'il offre, comme un cas d'usage PlaceOrder. Les adaptateurs implémentent ces ports pour des technologies précises : un repository JPA, un client HTTP vers le prestataire de paiement, un contrôleur REST ou un listener de messages qui appelle le cas d'usage. Les dépendances pointent vers l'intérieur, si bien que le cœur n'importe ni framework ni code d'accès à la base. Les règles métier deviennent testables sans infrastructure, on peut remplacer une base de données ou un prestataire avec un impact limité, et les montées de version du framework restent à l'écart du domaine. Le coût : davantage d'interfaces et de code de mapping, ce qui se justifie pour des domaines complexes mais s'avère souvent excessif pour de simples services CRUD.",
    explanation:
      "L'essentiel est l'inversion de dépendances à l'échelle de l'architecture. Les recruteurs apprécient les candidats qui précisent aussi quand l'approche ne vaut pas son surcoût.",
    tips: ["Expliquez les ports et adaptateurs avec des noms concrets.", "Insistez sur le sens des dépendances.", "Indiquez dans quels cas c'est disproportionné."],
    commonMistakes: ["La confondre avec une simple architecture en couches.", "Laisser les annotations du framework fuiter dans le modèle de domaine."],
    followUpQuestions: ["Quel est le lien avec la clean architecture ?", "Comment testeriez-vous un cas d'usage dans cette architecture ?"],
  },
  "sw-035": {
    question: "Selon vous, qu'est-ce qui rend un code « propre » ?",
    intent: "Le recruteur veut comprendre vos exigences de qualité et vérifier qu'elles servent la lisibilité et la maintenance.",
    expectedAnswer:
      "Pour moi, un code propre est un code qu'un autre développeur peut comprendre et modifier sans risque. Cela implique des noms clairs qui expriment l'intention, de petites fonctions qui font une seule chose, un formatage cohérent et aucune logique dupliquée. Cela signifie aussi gérer les erreurs explicitement, garder les effets de bord visibles et avoir des tests qui documentent le comportement. Les commentaires expliquent pourquoi on fait quelque chose, pas ce que fait le code. Enfin, un code propre respecte les conventions de l'équipe et de la base de code, même quand j'aurais personnellement fait un autre choix.",
    explanation:
      "Les recruteurs cherchent des critères pratiques centrés sur le lecteur et sur la sécurité des modifications, pas sur un style personnel ou un dogme.",
    tips: ["Mettez l'accent sur la lisibilité et la sécurité des modifications.", "Mentionnez les conventions de l'équipe."],
    commonMistakes: ["Assimiler code propre et code court.", "Être dogmatique à propos d'un livre ou d'une règle."],
    followUpQuestions: ["Comment bien nommer une fonction ?", "Quand les commentaires sont-ils nécessaires ?"],
  },
  "sw-036": {
    question: "Comment donnez-vous et recevez-vous des retours lors des revues de code ?",
    intent: "Le recruteur vérifie vos compétences de collaboration et si, dans vos équipes, les revues améliorent le code sans abîmer les relations.",
    expectedAnswer:
      "Quand je relis, je cherche d'abord à comprendre l'objectif du changement, puis je me concentre sur la justesse, les risques, la lisibilité et les tests plutôt que sur le style personnel, qui devrait être géré par des linters et des formateurs. Je formule mes commentaires sous forme de questions ou de suggestions argumentées, par exemple « Cette valeur peut-elle être null quand l'utilisateur n'est pas connecté ? », et je signale les points mineurs comme optionnels pour que l'auteur sache ce qui compte vraiment. Je mentionne aussi ce qui est bien fait. Quand je reçois une revue, je pars du principe que l'intention est bonne, je demande des précisions quand je ne suis pas d'accord et j'explique mon raisonnement. Si une discussion s'éternise, je propose un court appel plutôt qu'un long fil de commentaires. J'essaie aussi de garder des pull requests petites pour que les revues soient plus rapides et plus utiles.",
    explanation:
      "Une bonne culture de revue de code allie rigueur technique et respect. Distinguer les commentaires bloquants des optionnels et garder des changements petits sont des signes d'expérience.",
    tips: ["Indiquez ce que vous vérifiez en premier.", "Montrez comment vous formulez vos commentaires.", "Parlez de la taille des pull requests."],
    commonMistakes: ["Se focaliser sur des problèmes de style qu'un outil pourrait détecter.", "Écrire des commentaires qui jugent la personne plutôt que le code."],
    followUpQuestions: ["Que faites-vous quand vous êtes en profond désaccord avec un relecteur ?", "Combien de temps une revue devrait-elle prendre ?"],
  },
  "sw-037": {
    question: "Qu'est-ce que la dette technique, et comment la gérez-vous ?",
    intent: "Le recruteur veut voir si vous comprenez la dette comme un compromis et si vous savez la gérer avec pragmatisme.",
    expectedAnswer:
      "La dette technique est le coût futur créé en choisissant aujourd'hui une solution plus rapide ou plus simple, ou par du code qui ne correspond plus au système tel qu'il a évolué. Comme une dette financière, elle peut être un choix raisonnable si elle est contractée délibérément, mais ses « intérêts » se manifestent par des changements plus lents, davantage de bugs et une intégration des nouveaux arrivants plus difficile. Pour la gérer, je la rends visible en recensant les éléments de dette avec leur impact, je corrige les petits problèmes au fil de mes modifications, selon l'idée de « laisser le code en meilleur état qu'on l'a trouvé », et je priorise les chantiers plus importants selon la mesure dans laquelle ils freinent le travail réellement prévu. J'explique la dette aux product managers en termes de vitesse de livraison et de risque, pour qu'elle puisse être planifiée au même titre que les fonctionnalités.",
    explanation:
      "Les recruteurs apprécient les candidats qui voient la dette comme un arbitrage métier et la relient à des coûts concrets, au lieu de considérer tout code ancien comme mauvais.",
    tips: ["Distinguez la dette délibérée de la dette accidentelle.", "Expliquez comment vous la priorisez.", "Montrez comment vous l'expliquez à des non-développeurs."],
    commonMistakes: ["Proposer une réécriture complète comme solution.", "Ignorer la dette jusqu'à ce qu'une crise force à agir."],
    followUpQuestions: ["Comment convainquez-vous un product manager de planifier du travail sur la dette ?", "Quand une réécriture est-elle justifiée ?"],
  },
  "sw-038": {
    question: "Comment aborderiez-vous le refactoring d'un gros module legacy sans aucun test ?",
    intent: "Le recruteur évalue une pratique d'ingénierie avancée et consciente des risques sur du code réel.",
    expectedAnswer:
      "Je commencerais par comprendre pourquoi le module doit évoluer et je limiterais le périmètre à la zone sur laquelle nous devons réellement travailler, plutôt que de tout refactorer. Ensuite, je protégerais le comportement actuel avec des tests de caractérisation : des tests qui capturent ce que fait le code aujourd'hui, y compris ses comportements étranges, souvent à haut niveau, comme une API ou un scénario de bout en bout, en utilisant si possible des entrées et sorties réelles issues des logs de production. Pour rendre le code testable, j'appliquerais de petits refactorings sûrs, comme l'extraction de méthodes ou l'introduction de seams pour remplacer des dépendances, idéalement avec les refactorings automatisés de l'IDE. Puis j'améliorerais la conception par petites étapes, chacune livrable et relue, éventuellement selon l'approche strangler fig : du nouveau code remplace progressivement les anciens chemins derrière la même interface, avec des feature flags et du monitoring pour comparer les résultats. Tout au long du processus, je tiendrais l'équipe et le product owner informés des risques et de l'avancement.",
    explanation:
      "Un refactoring sûr de code legacy repose sur des tests de caractérisation, de petites étapes réversibles et un remplacement incrémental. Les réponses avancées insistent sur la gestion des risques et la communication, pas seulement sur les techniques de code.",
    tips: ["Mentionnez les tests de caractérisation.", "Insistez sur de petites étapes livrables.", "Expliquez comment vous surveilleriez le comportement après les changements."],
    commonMistakes: ["Proposer d'emblée une réécriture complète.", "Refactorer et modifier le comportement dans la même étape."],
    followUpQuestions: ["Qu'est-ce qu'un seam dans du code legacy ?", "Comment convaincriez-vous votre manager de consacrer du temps à ce travail ?"],
  },
  "sw-039": {
    question: "Comment choisissez-vous de bons noms pour les variables, les fonctions et les classes ?",
    intent: "Le recruteur vérifie votre attention à la lisibilité, l'une des compétences quotidiennes les plus déterminantes.",
    expectedAnswer:
      "Un bon nom indique au lecteur ce qu'une chose représente ou fait sans qu'il ait besoin de lire son implémentation. Je nomme les variables d'après leur sens dans le domaine, par exemple overdueInvoices plutôt que list2, et j'inclus les unités quand c'est pertinent, comme timeoutSeconds. Les fonctions reçoivent des groupes verbaux qui décrivent leur effet, comme sendReminderEmail, et les booléens se lisent comme des questions, comme isExpired. Les classes sont des noms issus du domaine métier. J'évite les abréviations que l'équipe ne partage pas et je garde des noms cohérents : si la base de code parle de customer, je n'introduis pas client pour le même concept. Si une fonction est difficile à nommer, c'est souvent qu'elle en fait trop et qu'il faut la découper.",
    explanation:
      "Nommer est une activité de conception : la difficulté à nommer quelque chose révèle souvent des responsabilités floues. La cohérence avec le vocabulaire du domaine aide toute l'équipe.",
    tips: ["Donnez des exemples de bons et de mauvais noms.", "Mentionnez la cohérence avec le vocabulaire du domaine."],
    commonMistakes: ["Utiliser partout des noms génériques comme data, manager ou handle.", "Encoder les types dans les noms au lieu du sens."],
    followUpQuestions: ["Comment renommez-vous un élément utilisé dans toute une grosse base de code ?", "Qu'est-ce que l'ubiquitous language ?"],
  },
  "sw-040": {
    question: "Quelle est la différence entre tests unitaires, tests d'intégration et tests de bout en bout ?",
    intent: "Le recruteur vérifie votre compréhension de la pyramide des tests et de l'intérêt de chaque niveau.",
    expectedAnswer:
      "Un test unitaire vérifie un petit morceau de code, comme une fonction ou une classe, de manière isolée, généralement avec ses dépendances remplacées par des doublures ; il est rapide et indique précisément où se situe l'échec. Un test d'intégration vérifie que plusieurs parties fonctionnent réellement ensemble, par exemple un repository avec une vraie base de données ou un service qui en appelle un autre. Un test de bout en bout exécute un scénario utilisateur complet à travers tout le système, comme une inscription via l'interface. Les tests unitaires sont nombreux et peu coûteux, les tests de bout en bout sont peu nombreux, plus lents et plus fragiles, et les tests d'intégration se situent entre les deux. Une bonne stratégie combine les trois.",
    explanation:
      "La pyramide des tests équilibre vitesse, confiance et coût de maintenance. Chaque niveau détecte des types de bugs différents.",
    tips: ["Donnez un exemple pour chaque niveau.", "Évoquez les compromis entre vitesse et fiabilité."],
    commonMistakes: ["S'appuyer uniquement sur des tests de bout en bout.", "Appeler test unitaire n'importe quel test automatisé."],
    followUpQuestions: ["Qu'est-ce qui rend un test de bout en bout instable ?", "Que testeriez-vous à chaque niveau pour une fonctionnalité de connexion ?"],
  },
  "sw-041": {
    question: "Qu'est-ce qu'un mock, et quand faut-il en utiliser un ?",
    intent: "Le recruteur vérifie que vous comprenez les doublures de test et leurs risques.",
    expectedAnswer:
      "Un mock est une doublure de test qui remplace une vraie dépendance et permet de vérifier comment votre code interagit avec elle, par exemple en contrôlant qu'un service d'e-mail a été appelé une fois avec la bonne adresse. Parmi les doublures apparentées, on trouve les stubs, qui renvoient des réponses préparées, et les fakes, qui sont des implémentations simples et fonctionnelles, comme un repository en mémoire. Les mocks sont utiles pour les dépendances lentes, peu fiables ou ayant des effets de bord, comme les prestataires de paiement. En abuser est risqué : les tests deviennent liés aux détails d'implémentation et peuvent passer alors que l'intégration réelle est cassée.",
    explanation:
      "Les doublures de test rendent les tests unitaires rapides et ciblés. Connaître la différence entre mocks, stubs et fakes, ainsi que le coût de l'excès de mocks, montre de la maturité.",
    tips: ["Distinguez mocks, stubs et fakes.", "Évoquez le risque d'un usage excessif des mocks."],
    commonMistakes: ["Mocker la classe testée elle-même.", "Mocker de simples value objects."],
    followUpQuestions: ["Pourquoi un fake en mémoire peut-il être préférable à un mock ?", "Comment testez-vous du code qui dépend de l'heure courante ?"],
  },
  "sw-042": {
    question: "Qu'est-ce que le développement piloté par les tests, et quels sont ses avantages et ses limites ?",
    intent: "Le recruteur veut voir si vous comprenez le TDD comme une pratique de conception, et pas seulement comme du test.",
    expectedAnswer:
      "Le développement piloté par les tests est un cycle : écrire un petit test en échec qui décrit le prochain comportement, écrire le code le plus simple pour le faire passer, puis refactorer en gardant les tests au vert. Ses avantages : une boucle de feedback rapide, une couverture de tests élevée par effet de bord et un code conçu pour être testable, avec de petites unités et des dépendances explicites. Il aide aussi à clarifier les besoins avant de coder. Ses limites : il est plus difficile à appliquer au travail exploratoire, aux interfaces utilisateur ou aux besoins flous, il peut produire des tests trop liés à l'implémentation s'il est appliqué mécaniquement, et il demande de la discipline et de la pratique. Beaucoup d'équipes l'appliquent de manière sélective, pour la logique métier et les corrections de bugs.",
    explanation:
      "Une réponse nuancée sur le TDD montre que vous connaissez la pratique et ses compromis, au lieu de répéter un dogme pour ou contre.",
    tips: ["Décrivez le cycle red-green-refactor.", "Donnez une vision équilibrée des cas où il aide."],
    commonMistakes: ["Décrire le TDD comme le fait d'« écrire les tests après le code ».", "Le présenter comme toujours ou jamais approprié."],
    followUpQuestions: ["Comment utilisez-vous le TDD pour corriger un bug ?", "Quelle est la différence entre TDD et BDD ?"],
  },
  "sw-043": {
    question: "Comment décidez-vous quoi tester et quel niveau de couverture est suffisant ?",
    intent: "Le recruteur vérifie que vous raisonnez en termes de risques plutôt que de courir après des indicateurs.",
    expectedAnswer:
      "Je concentre les tests là où une défaillance serait coûteuse ou probable : règles métier, calculs impliquant de l'argent, contrôles de sécurité, conditions complexes et code qui a déjà eu des bugs. Je teste les cas limites, comme les entrées vides, les bornes et les données invalides, pas seulement le cas nominal. Le pourcentage de couverture est un signal utile pour trouver les zones non testées, mais un chiffre élevé ne prouve pas que les assertions sont pertinentes. Je préfère 70 % de couverture avec des tests solides sur la logique critique plutôt que 95 % avec des tests qui ne font qu'exécuter le code. Chaque correction de bug s'accompagne aussi d'un test qui le reproduit d'abord.",
    explanation:
      "Les recruteurs apprécient les stratégies de test fondées sur les risques et la compréhension que la couverture mesure l'exécution, pas la justesse.",
    tips: ["Expliquez comment vous priorisez selon le risque.", "Mentionnez les tests de non-régression pour les bugs."],
    commonMistakes: ["Fixer 100 % de couverture comme objectif.", "Tester des getters triviaux en ignorant la logique complexe."],
    followUpQuestions: ["Qu'est-ce que le mutation testing ?", "Comment testez-vous la gestion des erreurs ?"],
  },
  "sw-044": {
    question: "Comment concevriez-vous une stratégie de test pour un système composé de plusieurs microservices ?",
    intent: "Le recruteur évalue votre capacité à concevoir des tests au-delà des frontières entre services, en équilibrant confiance et rapidité.",
    expectedAnswer:
      "Au sein de chaque service, je garderais une base solide de tests unitaires rapides pour la logique métier et des tests d'intégration contre les vraies dépendances que le service possède, comme sa base de données, à l'aide de conteneurs via Testcontainers. Entre services, le principal risque est l'incompatibilité des contrats, j'utiliserais donc des tests de contrat pilotés par le consommateur, par exemple avec Pact : chaque consommateur publie ses attentes et le fournisseur les vérifie dans son pipeline, ce qui détecte les changements cassants avant le déploiement sans lancer tout le système. Par-dessus, je conserverais un petit nombre de tests de bout en bout couvrant les parcours métier les plus critiques, comme passer et payer une commande, dans un environnement partagé. Comme tout ne peut pas être testé avant la production, j'ajouterais des déploiements canary ou progressifs, des feature flags et un bon monitoring avec des vérifications synthétiques sur les flux clés, afin de détecter les problèmes et de revenir en arrière rapidement. La gestion des données de test et la reproductibilité des environnements font aussi partie de la stratégie.",
    explanation:
      "Dans les systèmes distribués, les tests de bout en bout exhaustifs ne passent pas à l'échelle. Les tests de contrat et les filets de sécurité en production en remplacent une grande partie, une idée clé au niveau avancé.",
    tips: ["Mentionnez explicitement les tests de contrat.", "Gardez peu de tests de bout en bout, et uniquement critiques.", "Incluez les pratiques de test en production."],
    commonMistakes: ["S'appuyer sur une grosse suite de bout en bout, lente, pour chaque changement.", "Mocker les autres services partout sans vérifier les contrats réels."],
    followUpQuestions: ["Comment les tests de contrat s'intègrent-ils dans un pipeline de CI ?", "Comment gérez-vous les données de test entre services ?"],
  },
  "sw-045": {
    question: "Une suite de tests est devenue lente et instable. Comment la répareriez-vous ?",
    intent: "Le recruteur vérifie votre expérience pratique avancée de la fiabilité des tests et de la productivité des développeurs.",
    expectedAnswer:
      "D'abord, je mesurerais : identifier les tests les plus lents et ceux qui échouent de façon intermittente, à partir de l'historique de la CI et des rapports de tests. Pour les tests instables, je chercherais les causes classiques : dépendance au timing avec des sleeps fixes, état partagé entre tests, ordre d'exécution, appels réseau réels, date courante ou données aléatoires sans graine fixe. Les corrections consistent à attendre des conditions explicites au lieu de dormir, isoler les données par test, contrôler le temps et l'aléatoire, et remplacer les appels externes par des fakes ou des conteneurs locaux. Je mettrais en quarantaine les tests qui ne peuvent pas être corrigés immédiatement, avec un responsable et une échéance, plutôt que de laisser l'équipe ignorer les builds rouges. Pour la vitesse, je déplacerais les vérifications vers le niveau le plus bas pertinent de la pyramide, j'exécuterais les tests en parallèle, je réutiliserais les mises en place coûteuses comme les conteneurs, et je ne lancerais que les tests impactés sur les pull requests, avec la suite complète sur la branche principale. Je suivrais l'instabilité et la durée dans le temps pour que l'amélioration perdure.",
    explanation:
      "Les tests instables détruisent la confiance dans la CI. Une approche systématique, fondée sur les données, qui corrige les causes profondes et protège la branche principale témoigne d'une responsabilité de niveau senior.",
    tips: ["Commencez par mesurer.", "Listez les causes classiques d'instabilité.", "Expliquez comment vous éviteriez les régressions à l'avenir."],
    commonMistakes: ["Ajouter des relances automatiques partout et masquer le problème.", "Supprimer des tests sans comprendre ce qu'ils couvraient."],
    followUpQuestions: ["Comment testez-vous du code asynchrone sans sleeps ?", "Que doit-il se passer quand un test instable bloque une mise en production ?"],
  },
  "sw-046": {
    question: "Comment abordez-vous le débogage d'un problème que vous ne comprenez pas encore ?",
    intent: "Le recruteur veut voir une démarche méthodique plutôt que des modifications au hasard.",
    expectedAnswer:
      "Je commence par reproduire le problème de façon fiable et par noter précisément les étapes, les entrées et l'environnement. Ensuite, je lis attentivement le message d'erreur et la stack trace, et je consulte les logs autour du moment de l'échec. Je formule une hypothèse sur la cause et je la teste, par exemple en ajoutant des logs, en utilisant un débogueur avec des points d'arrêt ou en simplifiant l'entrée jusqu'à ce que le problème disparaisse. Si le problème est apparu récemment, je compare avec une version qui fonctionne, parfois avec git bisect pour trouver le changement qui l'a introduit. Une fois le bug corrigé, j'ajoute un test qui le reproduit pour qu'il ne puisse pas revenir.",
    explanation:
      "Le débogage est une démarche scientifique : reproduire, observer, formuler une hypothèse, tester. Les recruteurs veulent voir que vous réduisez le champ de recherche de façon systématique.",
    tips: ["Mentionnez d'abord la reproduction.", "Décrivez vos outils : logs, débogueur, bisect.", "Terminez par un test de non-régression."],
    commonMistakes: ["Modifier le code au hasard jusqu'à ce que ça marche.", "Ignorer le message d'erreur."],
    followUpQuestions: ["Que faites-vous si vous n'arrivez pas à reproduire le bug ?", "Comment fonctionne git bisect ?"],
  },
  "sw-047": {
    question: "Comment débogueriez-vous un problème qui ne survient qu'en production ?",
    intent: "Le recruteur vérifie votre expérience pratique de l'observabilité et de l'investigation sans risque sur des systèmes en production.",
    expectedAnswer:
      "D'abord, j'évaluerais l'impact et, si nécessaire, je l'atténuerais, par exemple par un rollback ou en désactivant un feature flag, avant d'investiguer en profondeur. Ensuite, je rassemblerais des éléments sans perturber les utilisateurs : logs filtrés par identifiant de requête ou de corrélation, métriques montrant quand le problème a commencé, traces montrant où le temps est passé, et changements récents comme des déploiements ou des mises à jour de configuration. Je comparerais la production aux environnements de test pour trouver les différences : volume de données, configuration, versions ou profils de trafic. Si besoin, j'ajouterais des logs ciblés ou je reproduirais le problème avec des données de production anonymisées dans un environnement sûr. Après la correction, je rédigerais une courte revue d'incident et j'améliorerais le monitoring pour que le problème soit détecté plus tôt la prochaine fois.",
    explanation:
      "Le débogage en production repose sur l'observabilité et sur l'identification de ce qui diffère des autres environnements. Atténuer d'abord, investiguer ensuite, prévenir enfin : c'est l'ordre professionnel.",
    tips: ["Mentionnez l'atténuation avant l'investigation.", "Expliquez comment vous utilisez logs, métriques et traces.", "Parlez des différences entre environnements."],
    commonMistakes: ["Déboguer directement sur les serveurs de production sans précaution.", "Négliger les déploiements récents comme cause probable."],
    followUpQuestions: ["Qu'est-ce qu'un correlation ID ?", "Comment déboguez-vous en présence de données sensibles en production ?"],
  },
  "sw-048": {
    question: "Comment trouvez-vous et corrigez-vous une fuite mémoire ?",
    intent: "Le recruteur vérifie votre expérience des problèmes de ressources et des outils de profilage.",
    expectedAnswer:
      "Le premier signe est généralement une mémoire qui augmente régulièrement dans le temps sans jamais être libérée, aboutissant parfois à des erreurs out-of-memory ou à de longues pauses du garbage collector. Je la confirmerais avec le monitoring, puis je prendrais des snapshots du tas à différents moments et je les comparerais pour voir quels objets ne cessent de croître, avec des outils comme un analyseur de heap dump pour la JVM ou l'onglet Mémoire des outils de développement du navigateur. Je suivrais ensuite les références qui retiennent ces objets. Les causes fréquentes sont les caches sans limite de taille, les listeners ou abonnements jamais retirés, les collections statiques, les ressources non fermées et les closures qui capturent de gros objets. Après la correction, je lancerais un test de charge pour vérifier que la mémoire se stabilise.",
    explanation:
      "Dans les langages managés, les fuites viennent de références conservées involontairement. Comparer des snapshots et remonter les chemins de rétention est la méthode standard.",
    tips: ["Expliquez comment vous confirmez la fuite avec des données.", "Listez les causes typiques.", "Vérifiez la correction sous charge."],
    commonMistakes: ["Se contenter d'augmenter les limites mémoire.", "Supposer que le garbage collector rend les fuites impossibles."],
    followUpQuestions: ["Qu'est-ce qu'un chemin de rétention (retaining path) ?", "Comment limiteriez-vous un cache en toute sécurité ?"],
  },
  "sw-049": {
    question: "Comment investigueriez-vous un bug qui survient de manière aléatoire, par exemple une race condition présumée ?",
    intent: "Le recruteur évalue votre capacité à déboguer des problèmes de concurrence et de timing, réputés difficiles à reproduire.",
    expectedAnswer:
      "Je commencerais par recueillir un maximum de contexte sur chaque occurrence : horodatages, identifiants de thread ou de requête, entrées et ce qui s'exécutait en même temps, pour repérer des motifs comme une forte charge ou des requêtes simultanées sur les mêmes données. Une race condition se manifeste souvent par des mises à jour perdues, des doublons ou des états incohérents. Pour la reproduire, j'augmenterais sa probabilité : exécuter le scénario de nombreuses fois en parallèle, ajouter des délais artificiels aux endroits suspects ou utiliser des outils de stress test. La revue de code est essentielle : je chercherais l'état mutable partagé, les séquences check-then-act sans verrou, les opérations read-modify-write non atomiques et les hypothèses sur l'ordre d'exécution. Les corrections dépendent du cas : rendre les opérations atomiques, utiliser des contraintes en base de données ou un verrouillage optimiste avec une colonne de version, une synchronisation correcte, ou une refonte pour éviter l'état partagé, par exemple avec des données immuables ou un writer unique. J'écrirais un test concurrent qui échouait avant la correction et passe systématiquement après, et je maintiendrais la surveillance, car ces bugs peuvent rester cachés.",
    explanation:
      "Les bugs de concurrence demandent une reproduction probabiliste, un raisonnement rigoureux sur le code et des corrections qui traitent l'atomicité, pas seulement le timing. Les réponses avancées combinent les trois.",
    tips: ["Expliquez comment vous rendez le bug plus susceptible d'apparaître.", "Citez les schémas de concurrence typiques qui causent des bugs.", "Proposez des corrections au niveau de la base de données comme du code."],
    commonMistakes: ["Ajouter des sleeps ou des relances pour masquer le symptôme.", "Tout synchroniser et créer des deadlocks ou des goulots d'étranglement."],
    followUpQuestions: ["Quelle est la différence entre verrouillage optimiste et pessimiste ?", "Comment détecteriez-vous un deadlock ?"],
  },
  "sw-050": {
    question: "Expliquez-moi comment vous pilotez la réponse à un incident de production grave.",
    intent: "Le recruteur veut voir une responsabilité de niveau senior : coordination, communication, atténuation et apprentissage sous pression.",
    expectedAnswer:
      "D'abord, je m'assure que l'incident est déclaré et que les rôles sont clairs : une personne coordonne, d'autres investiguent, et quelqu'un gère la communication avec le support et les parties prenantes pour que les ingénieurs puissent se concentrer. J'évalue l'impact, quels utilisateurs, quelles fonctionnalités et depuis quand, et je fixe un niveau de sévérité. La priorité est de rétablir le service, pas de trouver la correction parfaite : j'examine les changements récents et j'applique l'atténuation sûre la plus rapide, comme un rollback, un feature flag, une montée en charge ou un failover. Nous tenons une chronologie partagée des observations et des actions, ce qui évite le travail en double et facilite la revue. Les parties prenantes reçoivent des points réguliers et courts avec ce que nous savons, ce que nous faisons et l'heure du prochain point. Une fois le service stable, nous le confirmons avec les métriques, puis nous corrigeons proprement la cause racine. Ensuite, j'organise une revue post-incident sans recherche de coupable qui identifie les facteurs contributifs, comme des alertes manquantes ou des pratiques de déploiement risquées, et qui débouche sur quelques actions concrètes avec responsables et échéances, que nous suivons jusqu'à leur réalisation.",
    explanation:
      "Piloter un incident combine jugement technique, coordination et communication. L'atténuation avant la cause racine, des rôles clairs et un apprentissage sans recherche de coupable sont les pratiques centrales des équipes matures.",
    tips: ["Séparez les rôles : coordination, investigation, communication.", "Privilégiez l'atténuation plutôt qu'une correction parfaite.", "Décrivez la revue sans recherche de coupable et les actions de suivi."],
    commonMistakes: ["Laisser tout le monde investiguer sans coordination.", "Terminer le récit au retour du service, sans en tirer d'enseignements."],
    followUpQuestions: ["Comment choisissez-vous entre un rollback et une correction en avant ?", "Qu'est-ce qui rend une revue post-incident véritablement sans recherche de coupable ?"],
  },
};
