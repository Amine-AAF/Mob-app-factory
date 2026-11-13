import type { QuestionText, TextTable } from '@/types/content';

/** Questions frontend 001-025 : JavaScript, TypeScript, React. */
export const frA: TextTable<QuestionText> = {
  'fe-001': {
    question: "Quelle est la différence entre var, let et const en JavaScript ?",
    intent: "Le recruteur vérifie vos connaissances de base sur la portée des variables et pourquoi le code moderne évite var.",
    expectedAnswer:
      "var a une portée de fonction et est hissée (hoisting) : la variable est disponible dans toute la fonction et initialisée à undefined avant sa déclaration, ce qui provoque des bugs surprenants, par exemple dans des boucles avec des callbacks. let et const ont une portée de bloc : elles n'existent qu'à l'intérieur du bloc { } le plus proche, et y accéder avant leur déclaration lève une erreur à cause de la zone morte temporelle (temporal dead zone). const empêche de réaffecter la variable, mais ne rend pas la valeur immuable : vous pouvez toujours faire un push dans un tableau déclaré avec const. Le code moderne utilise const par défaut et let lorsqu'une réaffectation est nécessaire.",
    explanation:
      "La portée de bloc rend la durée de vie des variables prévisible. Savoir que const concerne la liaison (binding) et non la valeur évite une idée reçue fréquente.",
    example: "const items = [];\nitems.push(1); // autorisé\nitems = [2];   // TypeError: assignment to constant variable",
    tips: ["Évoquez la portée de bloc et la zone morte temporelle.", "Précisez que const ne fige pas les objets."],
    commonMistakes: ["Affirmer que les valeurs déclarées avec const sont immuables.", "Utiliser var dans du nouveau code."],
    followUpQuestions: ["Qu'est-ce que le hoisting ?", "Comment rendriez-vous un objet réellement immuable ?"],
  },
  'fe-002': {
    question: "Quelle est la différence entre == et === en JavaScript ?",
    intent: "Le recruteur vérifie votre compréhension de la coercition de types, une source fréquente de bugs.",
    expectedAnswer:
      "=== est l'égalité stricte : elle renvoie true uniquement si les deux valeurs ont le même type et la même valeur, sans conversion. == est l'égalité faible : elle convertit les opérandes vers un type commun avant de comparer, ce qui donne des résultats surprenants, comme 0 == \"\" qui vaut true, \"1\" == 1 qui vaut true et null == undefined qui vaut true. La plupart des guides de style recommandent d'utiliser systématiquement ===. Une exception courante est value == null, qui teste à la fois null et undefined en une seule expression. Pour les objets, les deux opérateurs comparent les références, pas les contenus.",
    explanation:
      "Les règles de coercition implicite sont complexes ; l'égalité stricte rend donc le code plus prévisible et plus lisible.",
    tips: ["Donnez un ou deux exemples de coercition surprenants.", "Précisez que les objets sont comparés par référence."],
    commonMistakes: ["Penser que === compare le contenu des objets.", "Utiliser == par habitude."],
    followUpQuestions: ["Comment compareriez-vous deux objets par valeur ?", "Qu'est-ce que Object.is() fait différemment de === ?"],
  },
  'fe-003': {
    question: "Quelle est la différence entre null et undefined, et que sont les valeurs falsy ?",
    intent: "Le recruteur vérifie des fondamentaux qui influencent les conditions et les valeurs par défaut dans le code du quotidien.",
    expectedAnswer:
      "undefined signifie qu'aucune valeur n'a été affectée : variable non initialisée, propriété absente ou fonction sans return. null est une absence de valeur explicite, posée par le développeur. Les valeurs falsy sont false, 0, -0, 0n, \"\", null, undefined et NaN ; tout le reste, y compris \"0\", [] et {}, est truthy. C'est important pour les valeurs par défaut : count || 10 remplace 0 par 10, ce qui peut être faux, alors que count ?? 10 ne remplace que null ou undefined. Le chaînage optionnel, user?.address?.city, évite les erreurs lorsqu'une propriété de la chaîne vaut null ou undefined.",
    explanation:
      "Comprendre les valeurs falsy explique pourquoi || peut écraser silencieusement des valeurs valides comme 0 ou une chaîne vide, et pourquoi ?? existe.",
    tips: ["Énumérez les valeurs falsy.", "Opposez || et ??."],
    commonMistakes: ["Utiliser || pour des valeurs par défaut alors que 0 ou \"\" sont des valeurs valides.", "Penser qu'un tableau vide est falsy."],
    followUpQuestions: ["Que renvoie typeof null ?", "Comment le chaînage optionnel fonctionne-t-il avec les appels de fonction ?"],
  },
  'fe-004': {
    question: "Qu'est-ce qu'une closure, et où les utilise-t-on en pratique ?",
    intent: "Le recruteur vérifie votre compréhension d'un concept central de JavaScript qui explique de nombreux comportements, y compris ceux des hooks React.",
    expectedAnswer:
      "Une closure (fermeture) est une fonction accompagnée des variables de la portée dans laquelle elle a été créée. La fonction interne garde l'accès à ces variables même après le retour de la fonction externe. Les closures servent à conserver un état privé, comme dans une fabrique de compteurs où count n'est pas accessible de l'extérieur ; dans les callbacks et les gestionnaires d'événements qui mémorisent des valeurs de leur contexte de création ; dans les fabriques de fonctions et l'application partielle ; et dans React, où chaque rendu crée de nouvelles fonctions de gestion qui capturent les props et l'état (state) de ce rendu. Un piège classique était var dans une boucle avec setTimeout : tous les callbacks partageaient la même variable, ce que let résout en créant une nouvelle liaison à chaque itération.",
    explanation:
      "Les closures sont le moyen par lequel les fonctions JavaScript transportent leur contexte. Elles expliquent les valeurs obsolètes dans les effets React comme les motifs d'état privé.",
    example: "function makeCounter() { let count = 0; return () => ++count; }\nconst next = makeCounter(); next(); next(); // 2",
    tips: ["Donnez un exemple de code simple.", "Reliez les closures aux hooks React ou aux callbacks."],
    commonMistakes: ["Définir les closures comme des « fonctions dans des fonctions » sans mentionner les variables capturées."],
    followUpQuestions: ["Qu'est-ce qu'une stale closure (closure obsolète) dans React ?", "Les closures peuvent-elles provoquer des fuites mémoire ?"],
  },
  'fe-005': {
    question: "Comment la valeur de this est-elle déterminée en JavaScript ?",
    intent: "Le recruteur vérifie votre compréhension d'un sujet déroutant qui affecte les callbacks et les méthodes de classe.",
    expectedAnswer:
      "Pour les fonctions classiques, this dépend de la manière dont la fonction est appelée, et non de l'endroit où elle est définie. Appelée comme une méthode, obj.method(), this vaut obj. Appelée comme une simple fonction, this vaut undefined en mode strict et dans les modules. Avec new, this est l'objet nouvellement créé. call, apply et bind fixent this explicitement. Les fonctions fléchées n'ont pas leur propre this : elles utilisent le this de la portée englobante au moment de leur création. C'est pourquoi passer une méthode de classe comme callback, par exemple button.addEventListener(\"click\", this.handle), perd this, sauf si vous la liez avec bind ou la définissez comme propriété fléchée.",
    explanation:
      "La règle du site d'appel explique la plupart des erreurs « this is undefined ». Les fonctions fléchées sont la solution moderne habituelle pour les callbacks.",
    tips: ["Indiquez que c'est le site d'appel qui détermine this.", "Expliquez pourquoi les fonctions fléchées se comportent différemment."],
    commonMistakes: ["Utiliser une fonction fléchée comme méthode d'objet qui a besoin de son propre this.", "Penser que this désigne la fonction elle-même."],
    followUpQuestions: ["Que renvoie bind ?", "Pourquoi les composants de classe React nécessitaient-ils du binding ?"],
  },
  'fe-006': {
    question: "Expliquez la boucle d'événements (event loop) de JavaScript, y compris les microtâches et les macrotâches.",
    intent: "Le recruteur vérifie que vous comprenez comment le code asynchrone est ordonnancé, ce qui explique les bugs d'ordre d'exécution.",
    expectedAnswer:
      "JavaScript s'exécute sur un seul thread principal avec une pile d'appels. Quand la pile est vide, la boucle d'événements prend du travail dans des files d'attente. Les macrotâches, aussi appelées tâches, comprennent les timers de setTimeout, les entrées/sorties et les événements utilisateur. Les microtâches comprennent les callbacks de promesses, les reprises après await et queueMicrotask. Après chaque macrotâche, le moteur exécute toutes les microtâches en attente avant le rendu et avant la macrotâche suivante. Ainsi, pour console.log(1); setTimeout(() => console.log(2)); Promise.resolve().then(() => console.log(3)); console.log(4); la sortie est 1, 4, 3, 2. Un long traitement synchrone bloque tout, y compris le rendu et les saisies de l'utilisateur ; c'est pourquoi les calculs lourds doivent être découpés ou déplacés dans un Web Worker.",
    explanation:
      "Savoir que les microtâches s'exécutent avant la tâche suivante explique l'ordre d'exécution, et pourquoi un flot de microtâches peut figer la page.",
    tips: ["Utilisez un court exemple d'ordre d'exécution.", "Précisez que bloquer la pile fige l'interface."],
    commonMistakes: ["Penser que setTimeout(fn, 0) s'exécute immédiatement.", "Croire que les promesses s'exécutent sur un autre thread."],
    followUpQuestions: ["Où se situe requestAnimationFrame ?", "En quoi la boucle d'événements de Node.js est-elle différente ?"],
  },
  'fe-007': {
    question: "Comment gérez-vous les erreurs avec les promesses et async/await ?",
    intent: "Le recruteur vérifie votre capacité à écrire du code asynchrone robuste, y compris pour les opérations concurrentes et les rejets non gérés.",
    expectedAnswer:
      "Avec async/await, j'entoure les appels attendus d'un try/catch et j'utilise finally pour le nettoyage, par exemple masquer un indicateur de chargement. Avec des chaînes de promesses, un .catch() à la fin gère les erreurs de toutes les étapes précédentes. Un rejet non géré est un bug : il peut être journalisé ou faire planter un processus Node ; chaque promesse doit donc être attendue ou avoir un catch. Pour plusieurs opérations indépendantes, Promise.all les exécute en parallèle mais rejette dès que l'une échoue, tandis que Promise.allSettled attend la fin de toutes et rapporte chaque résultat, ce qui convient aux échecs partiels. Promise.race et Promise.any aident pour les délais d'expiration et les solutions de repli. Pour les appels réseau, je gère aussi explicitement les réponses non 2xx, car fetch ne rejette qu'en cas d'erreur réseau, pas sur un HTTP 404 ou 500.",
    explanation:
      "Une bonne gestion des erreurs asynchrones couvre à la fois les appels individuels et les groupes d'appels, et connaît le piège propre à fetch concernant les erreurs HTTP.",
    example: "const res = await fetch(url);\nif (!res.ok) throw new Error(`HTTP ${res.status}`);\nconst data = await res.json();",
    tips: ["Opposez Promise.all et Promise.allSettled.", "Précisez que fetch ne rejette pas sur les erreurs HTTP."],
    commonMistakes: ["Oublier le await d'une promesse à l'intérieur d'un try/catch.", "Attendre des appels indépendants l'un après l'autre alors qu'ils pourraient s'exécuter en parallèle."],
    followUpQuestions: ["Comment ajouteriez-vous un délai d'expiration à fetch ?", "Comment annulez-vous une requête avec AbortController ?"],
  },
  'fe-008': {
    question: "Comment fonctionne l'héritage prototypal, et quel est le lien avec les classes ES ?",
    intent: "Le recruteur évalue votre compréhension approfondie du modèle objet de JavaScript qui se cache derrière la syntaxe moderne.",
    expectedAnswer:
      "Chaque objet possède un lien interne vers un autre objet, son prototype. Quand vous lisez une propriété que l'objet ne possède pas, JavaScript la recherche le long de la chaîne de prototypes jusqu'à la trouver ou atteindre null. Les méthodes définies sur le prototype d'un constructeur sont partagées par toutes les instances, ce qui économise de la mémoire. Les classes ES2015 sont essentiellement une syntaxe au-dessus de ce mécanisme : class Dog extends Animal fait hériter Dog.prototype de Animal.prototype, les méthodes sont placées sur le prototype, et super appelle l'implémentation parente. Les classes apportent toutefois de vraies différences : elles s'exécutent toujours en mode strict, ne peuvent pas être appelées sans new, et prennent en charge les champs privés avec #, réellement inaccessibles de l'extérieur, contrairement aux conventions avec un underscore. Object.create(proto) crée directement un objet avec le prototype choisi. Comprendre ce mécanisme explique pourquoi instanceof parcourt la chaîne de prototypes et pourquoi modifier un prototype natif affecte tous les objets, ce qui est une mauvaise pratique.",
    explanation:
      "Les classes n'ont pas remplacé les prototypes ; elles les ont rendus plus faciles à utiliser. Les candidats avancés connaissent à la fois le mécanisme et les ajouts propres aux classes.",
    tips: ["Expliquez la recherche de propriété le long de la chaîne.", "Montrez ce que la syntaxe de classe apporte au-delà du sucre syntaxique.", "Mentionnez les champs privés."],
    commonMistakes: ["Dire que les classes JavaScript fonctionnent comme les classes Java.", "Étendre les prototypes natifs dans le code applicatif."],
    followUpQuestions: ["Que renvoie Object.getPrototypeOf pour une instance de classe ?", "En quoi les champs privés diffèrent-ils des closures pour la confidentialité ?"],
  },
  'fe-009': {
    question: "Quelle est la différence entre les modules ES et CommonJS, et pourquoi est-ce important pour le bundling ?",
    intent: "Le recruteur vérifie votre connaissance de l'outillage moderne : systèmes de modules, tree shaking et interopérabilité.",
    expectedAnswer:
      "CommonJS, le système historique de Node.js, utilise require() et module.exports. Il est dynamique : require peut s'exécuter n'importe où, même de façon conditionnelle, et les exports sont résolus à l'exécution, avec un chargement synchrone. Les modules ES utilisent import et export. Leur structure est statique : les imports sont déclarés au premier niveau et analysés avant l'exécution, les liaisons sont vivantes (live bindings), et le chargement peut être asynchrone ; l'import() dynamique renvoie une promesse, ce qui permet le code splitting. Comme le graphe d'imports est connu statiquement, des bundlers comme Vite, webpack ou esbuild peuvent faire du tree shaking, c'est-à-dire supprimer les exports jamais utilisés, ce qui est bien plus difficile avec CommonJS. C'est pourquoi les bibliothèques publient des builds en modules ES et se déclarent sans effets de bord dans package.json. L'interopérabilité peut être délicate : importer du CommonJS depuis de l'ESM donne un export par défaut, et les paquets doubles (dual packages) doivent éviter de charger deux copies de la même bibliothèque, ce qui peut casser des singletons ou des vérifications instanceof.",
    explanation:
      "La nature statique des modules ES permet le tree shaking et un meilleur outillage. Les candidats avancés connaissent aussi les pièges d'interopérabilité.",
    tips: ["Opposez résolution statique et résolution dynamique.", "Expliquez le tree shaking et l'option sideEffects.", "Mentionnez l'import dynamique pour le code splitting."],
    commonMistakes: ["Penser que le tree shaking fonctionne automatiquement quel que soit le style d'import.", "Importer toute une bibliothèque utilitaire pour une seule fonction."],
    followUpQuestions: ["Que change \"type\": \"module\" dans Node.js ?", "Comment découpez-vous un gros bundle par route ?"],
  },
  'fe-010': {
    question: "Qu'apporte TypeScript à JavaScript, et quelle est la différence entre any et unknown ?",
    intent: "Le recruteur vérifie vos bases en TypeScript et vos habitudes en matière de sûreté des types.",
    expectedAnswer:
      "TypeScript ajoute un système de types statique au-dessus de JavaScript : les types sont vérifiés à la compilation et effacés à l'exécution, si bien que le résultat est du JavaScript classique. Il détecte des erreurs comme les fautes de frappe, les propriétés manquantes ou les mauvais arguments avant l'exécution du code, et améliore l'autocomplétion et le refactoring dans l'éditeur. any désactive la vérification de types pour une valeur : vous pouvez en faire n'importe quoi, ce qui va à l'encontre du but recherché. unknown accepte aussi n'importe quelle valeur, mais vous devez la restreindre, par exemple avec typeof ou une fonction de validation, avant de l'utiliser. unknown est le choix sûr pour les données de sources externes comme JSON.parse ou les réponses d'API.",
    explanation:
      "Les types n'existent qu'à la compilation. Choisir unknown plutôt que any préserve la sûreté des types là où les données ne sont pas encore fiables.",
    tips: ["Précisez que les types sont effacés à l'exécution.", "Expliquez pourquoi unknown est plus sûr que any."],
    commonMistakes: ["Utiliser any pour faire taire les erreurs.", "Croire que TypeScript valide les données à l'exécution."],
    followUpQuestions: ["À quoi sert le type never ?", "Comment validez-vous les données d'une API à l'exécution ?"],
  },
  'fe-011': {
    question: "Quelle est la différence entre une interface et un alias de type en TypeScript ?",
    intent: "Le recruteur vérifie votre connaissance pratique des déclarations TypeScript et des conventions d'équipe.",
    expectedAnswer:
      "Les deux peuvent décrire la forme d'un objet et sont largement interchangeables pour cela. Les interfaces peuvent être étendues avec extends et fusionnées : déclarer deux fois la même interface ajoute des propriétés, ce qui est utile pour enrichir les types d'une bibliothèque. Les alias de type sont plus flexibles : ils peuvent nommer des unions comme \"small\" | \"large\", des tuples, des primitifs, des types de fonction, et ils fonctionnent avec les types mappés et conditionnels. Une convention courante consiste à utiliser des interfaces pour les formes d'objets publiques et des types pour les unions et les types calculés, mais la cohérence au sein d'une base de code compte davantage que le choix lui-même.",
    explanation:
      "Les vraies différences sont la fusion de déclarations et la puissance expressive des alias de type. Les équipes choisissent généralement une convention.",
    tips: ["Mentionnez la fusion de déclarations et les unions.", "Dites que la cohérence compte davantage que le choix."],
    commonMistakes: ["Affirmer que l'un est toujours meilleur que l'autre."],
    followUpQuestions: ["Quand la fusion de déclarations est-elle utile ?", "Comment étend-on un alias de type ?"],
  },
  'fe-012': {
    question: "Que sont les génériques en TypeScript ? Donnez un exemple.",
    intent: "Le recruteur vérifie que vous savez écrire des fonctions et des composants réutilisables et sûrs du point de vue des types.",
    expectedAnswer:
      "Les génériques permettent d'écrire du code qui fonctionne avec de nombreux types tout en préservant la relation entre eux. Au lieu de renvoyer any, une fonction comme function first<T>(items: T[]): T | undefined renvoie le même type que les éléments du tableau : first([1, 2]) est un number, first([\"a\"]) est une string. Les contraintes limitent les types acceptés, par exemple <T extends { id: string }> garantit que T possède un id. Les génériques sont utilisés dans les collections, les utilitaires d'API comme fetchJson<T>(url): Promise<T>, les composants React comme un List<T> avec une prop renderItem, et les types utilitaires.",
    explanation:
      "Les génériques apportent la réutilisabilité sans perdre l'information de type. Les contraintes les rendent sûrs lorsque le code a besoin de certaines propriétés.",
    example: "function byId<T extends { id: string }>(items: T[]): Map<string, T> {\n  return new Map(items.map((i) => [i.id, i]));\n}",
    tips: ["Montrez une fonction avec une contrainte.", "Mentionnez un composant React ou un utilitaire d'API générique."],
    commonMistakes: ["Utiliser any au lieu d'un paramètre de type.", "Ajouter des génériques utilisés une seule fois et qui n'apportent aucune sûreté."],
    followUpQuestions: ["Qu'est-ce qu'un paramètre de type par défaut ?", "Pourquoi fetchJson<T>() n'est-il pas vraiment sûr sans validation ?"],
  },
  'fe-013': {
    question: "Que sont les unions discriminées et la restriction de type (narrowing) en TypeScript ?",
    intent: "Le recruteur vérifie vos compétences de modélisation, qui évitent les états invalides dans le code frontend.",
    expectedAnswer:
      "Une union discriminée est une union de types objets qui partagent une propriété littérale, le discriminant. Par exemple, type RequestState = { status: \"loading\" } | { status: \"success\"; data: User[] } | { status: \"error\"; message: string }. La restriction de type (narrowing) signifie que TypeScript affine le type après une vérification : à l'intérieur de if (state.status === \"success\"), il sait que state.data existe. Le narrowing fonctionne aussi avec typeof, instanceof, l'opérateur in et des type guards personnalisés. Avec un switch sur le discriminant et une branche default qui affecte la valeur à never, le compilateur signale tout nouveau cas ajouté mais non géré. Cela évite les combinaisons impossibles, comme avoir à la fois des données et une erreur.",
    explanation:
      "Les unions discriminées modélisent les états explicitement et laissent le compilateur imposer une gestion correcte, ce qui est particulièrement utile pour l'état de l'interface.",
    example: "switch (state.status) {\n  case \"loading\": return <Spinner />;\n  case \"error\": return <Error msg={state.message} />;\n  case \"success\": return <UserList users={state.data} />;\n}",
    tips: ["Modélisez un état loading/success/error.", "Mentionnez la vérification d'exhaustivité avec never."],
    commonMistakes: ["Utiliser plusieurs booléens optionnels comme isLoading et hasError qui peuvent se contredire."],
    followUpQuestions: ["Comment écrivez-vous un type guard personnalisé ?", "Que fait l'opérateur satisfies ?"],
  },
  'fe-014': {
    question: "Quels types utilitaires TypeScript utilisez-vous le plus, et pourquoi ?",
    intent: "Le recruteur vérifie votre aisance pratique avec les outils de types intégrés qui réduisent la duplication.",
    expectedAnswer:
      "Partial<T> rend toutes les propriétés optionnelles, ce qui est utile pour les données de mise à jour. Required<T> fait l'inverse. Pick<T, K> et Omit<T, K> créent des types avec un sous-ensemble de propriétés, par exemple Omit<User, \"password\"> pour un profil public. Readonly<T> empêche la réaffectation des propriétés. Record<K, V> type des dictionnaires comme Record<Locale, string>. ReturnType<typeof fn> et Parameters<typeof fn> extraient des types à partir de fonctions, et Awaited<T> déballe les promesses. NonNullable<T> retire null et undefined. Ils permettent de dériver les types d'une source de vérité unique au lieu de dupliquer des définitions qui peuvent diverger.",
    explanation:
      "Les types utilitaires gardent les types liés cohérents entre eux. Dériver les types réduit la maintenance et les erreurs lorsque les modèles évoluent.",
    tips: ["Donnez un usage concret pour chaque type que vous citez.", "Insistez sur la source de vérité unique."],
    commonMistakes: ["Recopier des interfaces à la main au lieu de les dériver.", "Utiliser Partial alors que seuls certains champs devraient être optionnels."],
    followUpQuestions: ["Comment Pick est-il implémenté avec des types mappés ?", "Comment rendriez-vous des propriétés imbriquées readonly ?"],
  },
  'fe-015': {
    question: "Expliquez les types mappés, les types conditionnels et le mot-clé infer.",
    intent: "Le recruteur évalue vos connaissances avancées de TypeScript, utilisées dans les bibliothèques et les utilitaires partagés.",
    expectedAnswer:
      "Un type mappé crée un nouveau type en itérant sur les clés d'un autre : { [K in keyof T]?: T[K] } est la façon dont Partial fonctionne. Des modificateurs comme readonly et ? peuvent être ajoutés ou retirés avec + et -, et le remappage de clés avec as permet de renommer les clés, par exemple pour produire des noms d'accesseurs comme getName à partir de name. Un type conditionnel choisit un type en fonction d'une condition : T extends string ? \"text\" : \"other\". Les types conditionnels se distribuent sur les unions : en appliquer un à A | B l'applique à chaque membre, et c'est ainsi que fonctionnent Exclude et Extract. infer déclare une variable de type à l'intérieur d'un type conditionnel pour capturer une partie d'un type : type ElementType<T> = T extends (infer U)[] ? U : never extrait le type des éléments d'un tableau, et ReturnType utilise infer pour capturer le type de retour d'une fonction. Ces outils permettent d'écrire des types qui suivent automatiquement vos données, mais ils doivent être utilisés avec retenue, car des types complexes ralentissent la compilation et sont difficiles à lire pour vos collègues.",
    explanation:
      "Les types mappés et conditionnels sont les briques de base des types utilitaires standard. Les candidats avancés connaissent aussi la distribution et le coût en lisibilité.",
    example: "type Getters<T> = { [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K] };",
    tips: ["Montrez comment un type utilitaire standard est construit.", "Mentionnez les types conditionnels distributifs.", "Mettez en garde contre la complexité."],
    commonMistakes: ["Écrire des types astucieux que personne d'autre ne peut maintenir.", "Être surpris par la distribution sur les unions."],
    followUpQuestions: ["Comment empêchez-vous un type conditionnel de se distribuer ?", "Comment typeriez-vous un deep partial (Partial récursif) ?"],
  },
  'fe-016': {
    question: "Comment garantissez-vous la sûreté des types aux frontières d'une application frontend, par exemple pour les réponses d'API ?",
    intent: "Le recruteur vérifie votre compréhension avancée de l'écart entre les types à la compilation et les données à l'exécution.",
    expectedAnswer:
      "Les types TypeScript disparaissent à l'exécution : déclarer const user: User = await res.json() n'est donc qu'une promesse faite au compilateur ; si l'API change ou renvoie un objet d'erreur, le code plantera quelque part, loin de la cause. Aux frontières, comme les réponses d'API, le local storage, les paramètres d'URL et les saisies de formulaires, je valide les données à l'exécution avec une bibliothèque de schémas comme zod ou valibot, et je dérive le type statique du schéma avec z.infer, pour n'avoir qu'une seule source de vérité. Les données invalides sont traitées à la frontière, avec une erreur claire et de la journalisation. Quand je maîtrise le back-end, je préfère générer les types et les clients à partir d'une spécification OpenAPI, ou partager les schémas dans un monorepo, tout en continuant à valider les entrées critiques. Je sépare aussi le modèle métier des types de transport, en convertissant les DTO de l'API en modèles d'interface à un seul endroit, pour que les changements côté back-end ne se propagent pas dans tous les composants.",
    explanation:
      "La validation à l'exécution aux frontières transforme une corruption silencieuse en erreurs explicites et localisées. Dériver les types de schémas ou de contrats évite qu'ils divergent.",
    example: "const User = z.object({ id: z.string(), email: z.string().email() });\ntype User = z.infer<typeof User>;\nconst user = User.parse(await res.json());",
    tips: ["Expliquez clairement l'effacement des types.", "Mentionnez les types dérivés de schémas.", "Parlez des clients générés à partir d'OpenAPI."],
    commonMistakes: ["Forcer le type des réponses d'API avec as.", "Valider partout au lieu de valider une seule fois à la frontière."],
    followUpQuestions: ["Quel est le coût de la validation à l'exécution sur des payloads volumineux ?", "Comment gérez-vous les versions d'API côté client ?"],
  },
  'fe-017': {
    question: "En React, quelle est la différence entre les props et l'état (state) ?",
    intent: "Le recruteur vérifie le modèle mental le plus fondamental de React.",
    expectedAnswer:
      "Les props sont des entrées transmises à un composant par son parent ; le composant doit les traiter en lecture seule. L'état (state) est une donnée possédée et gérée par le composant lui-même, créée avec useState ou useReducer, et sa mise à jour via le setter déclenche un nouveau rendu du composant. Quand plusieurs composants ont besoin des mêmes données, l'état est remonté vers leur parent commun le plus proche et redescendu sous forme de props, avec des callbacks pour le modifier. L'interface est une fonction des props et de l'état : vous ne modifiez pas le DOM directement, vous mettez à jour l'état et React met à jour l'écran.",
    explanation:
      "Comprendre à qui appartiennent les données, qui peut les modifier et comment les changements descendent, est la base de toute conception React.",
    tips: ["Mentionnez la remontée de l'état (lifting state up).", "Insistez sur le fait que les props sont en lecture seule."],
    commonMistakes: ["Muter directement les props ou les objets d'état.", "Recopier des props dans l'état sans raison."],
    followUpQuestions: ["Quand utiliseriez-vous useReducer plutôt que useState ?", "Qu'est-ce qu'un état dérivé ?"],
  },
  'fe-018': {
    question: "Pourquoi React a-t-il besoin d'une key lors du rendu de listes ?",
    intent: "Le recruteur vérifie votre compréhension de la réconciliation dans une situation courante qui provoque de vrais bugs.",
    expectedAnswer:
      "Quand une liste est rendue à nouveau, React utilise les keys pour faire correspondre les éléments du rendu précédent avec ceux du nouveau. Avec des keys stables et uniques, comme un id issu des données, React peut déplacer, ajouter ou supprimer les bons éléments et conserver l'état et les nœuds DOM de chacun. Si vous utilisez l'index du tableau comme key et que la liste est réordonnée, filtrée ou reçoit des insertions, React associe les éléments par position : un état comme le texte d'un champ ou une case cochée peut se retrouver sur la mauvaise ligne, et le rendu est moins efficace. Les keys basées sur l'index ne sont acceptables que pour des listes statiques dont l'ordre ne change jamais.",
    explanation:
      "Les keys donnent aux éléments une identité d'un rendu à l'autre. De mauvaises keys provoquent des bugs d'état subtils, pas seulement des avertissements.",
    tips: ["Expliquez ce qui se passe mal avec des keys basées sur l'index.", "Utilisez un identifiant stable issu des données."],
    commonMistakes: ["Utiliser Math.random() comme key, ce qui détruit et recrée (remount) les éléments à chaque rendu."],
    followUpQuestions: ["Comment utiliser une key pour réinitialiser l'état d'un composant ?", "Qu'est-ce que la réconciliation ?"],
  },
  'fe-019': {
    question: "Comment fonctionne useEffect, et quand avez-vous besoin d'une fonction de nettoyage ?",
    intent: "Le recruteur vérifie l'utilisation correcte des effets, l'une des API React les plus mal utilisées.",
    expectedAnswer:
      "useEffect exécute une fonction après que React a appliqué (commit) le rendu à l'écran. Le tableau de dépendances contrôle quand elle s'exécute de nouveau : après chaque rendu sans tableau, une seule fois après le montage avec un tableau vide, ou lorsqu'une des valeurs listées change. Toute valeur du composant utilisée dans l'effet doit figurer dans les dépendances, ce que vérifie la règle eslint des hooks. La fonction de nettoyage, renvoyée par l'effet, s'exécute avant la réexécution de l'effet et lors du démontage du composant. Elle est nécessaire pour retirer des écouteurs d'événements, effacer des timers, fermer des abonnements ou annuler des requêtes avec AbortController, afin que des effets obsolètes ne mettent pas à jour l'état. En développement, le Strict Mode exécute les effets deux fois pour révéler les nettoyages manquants. Les effets servent à se synchroniser avec des systèmes externes ; le calcul de valeurs à partir des props ou de l'état doit plutôt se faire pendant le rendu.",
    explanation:
      "Voir les effets comme une synchronisation avec des systèmes externes, et non comme des méthodes de cycle de vie, évite la plupart des mauvaises utilisations.",
    example: "useEffect(() => {\n  const controller = new AbortController();\n  load(id, controller.signal).then(setData);\n  return () => controller.abort();\n}, [id]);",
    tips: ["Expliquez les différentes options du tableau de dépendances.", "Donnez un exemple de nettoyage.", "Précisez que les valeurs dérivées n'ont pas besoin d'effets."],
    commonMistakes: ["Omettre des dépendances pour éviter des réexécutions.", "Utiliser des effets pour calculer un état dérivé."],
    followUpQuestions: ["Pourquoi le Strict Mode exécute-t-il les effets deux fois ?", "Qu'est-ce qu'une race condition dans les effets de chargement de données ?"],
  },
  'fe-020': {
    question: "Pourquoi une valeur d'état semble-t-elle parfois ne pas se mettre à jour juste après l'appel à setState ?",
    intent: "Le recruteur vérifie votre compréhension des instantanés de rendu, du batching et des closures obsolètes.",
    expectedAnswer:
      "Appeler le setter ne modifie pas la variable dans le rendu en cours ; cela planifie un nouveau rendu, et la nouvelle valeur est disponible au rendu suivant. Chaque rendu possède son propre instantané des props et de l'état, capturé par les fonctions créées pendant ce rendu. Ainsi, setCount(count + 1) appelé deux fois dans le même gestionnaire n'incrémente que d'une unité, car les deux appels lisent le même instantané. La forme fonctionnelle, setCount(c => c + 1), utilise la dernière valeur en attente. React 18 regroupe aussi (batching) les mises à jour issues des gestionnaires d'événements, des timeouts et des promesses en un seul rendu. Les closures obsolètes apparaissent quand un effet ou un intervalle conserve une ancienne fonction qui a capturé un ancien état ; les solutions sont la forme fonctionnelle, des dépendances correctes ou une ref pour les valeurs qui ne doivent pas déclencher de rendu.",
    explanation:
      "Le modèle d'instantané explique de nombreux comportements déroutants. La forme fonctionnelle est la solution standard lorsque le nouvel état dépend de l'état précédent.",
    example: "setCount(c => c + 1);\nsetCount(c => c + 1); // +2 comme prévu",
    tips: ["Expliquez les instantanés de rendu.", "Utilisez l'exemple de la fonction de mise à jour.", "Mentionnez le batching dans React 18."],
    commonMistakes: ["Lire l'état juste après l'avoir modifié en s'attendant à obtenir la nouvelle valeur."],
    followUpQuestions: ["Quand utiliseriez-vous useRef plutôt que l'état ?", "Qu'est-ce que le batching automatique ?"],
  },
  'fe-021': {
    question: "Quelle est la différence entre composants contrôlés et non contrôlés dans les formulaires ?",
    intent: "Le recruteur vérifie votre connaissance des approches de gestion de formulaires et de leurs compromis.",
    expectedAnswer:
      "Dans un composant contrôlé, la valeur du champ provient de l'état React et les modifications passent par onChange : value={name} onChange={e => setName(e.target.value)}. React est la source de vérité unique, ce qui facilite la validation, le formatage et la logique conditionnelle, mais chaque frappe déclenche un nouveau rendu du composant. Dans un composant non contrôlé, c'est le DOM qui conserve la valeur, et vous la lisez au besoin avec une ref ou à partir des données du formulaire lors de la soumission, en utilisant defaultValue pour la valeur initiale. C'est plus simple et cela peut être plus performant pour les grands formulaires. Des bibliothèques comme React Hook Form utilisent surtout des champs non contrôlés avec des refs pour la performance, tout en proposant la validation.",
    explanation:
      "Les deux approches sont valables. Le choix dépend de la mesure dans laquelle l'interface doit réagir à chaque modification.",
    tips: ["Montrez brièvement les deux approches.", "Mentionnez les bibliothèques de formulaires et la performance."],
    commonMistakes: ["Faire passer un champ de contrôlé à non contrôlé, ce qui déclenche un avertissement.", "Définir value sans onChange."],
    followUpQuestions: ["Comment valideriez-vous un formulaire comportant de nombreux champs ?", "Qu'est-ce que les actions de formulaire de React 19 changent dans la gestion des formulaires ?"],
  },
  'fe-022': {
    question: "Qu'est-ce qu'un hook personnalisé, et quand faut-il en créer un ?",
    intent: "Le recruteur vérifie la réutilisation de logique avec état et la bonne conception des composants.",
    expectedAnswer:
      "Un hook personnalisé est une fonction dont le nom commence par use et qui appelle d'autres hooks. Il permet d'extraire une logique avec état des composants et de la réutiliser, par exemple useDebounce(value, delay), useOnlineStatus() ou useFetch(url). Chaque composant qui appelle le hook obtient son propre état indépendant : les hooks partagent de la logique, pas des données. J'en crée un lorsque la même combinaison d'état et d'effets apparaît dans plusieurs composants, ou lorsqu'un composant devient difficile à lire à cause d'une logique sans rapport avec le rendu. Les hooks personnalisés respectent les règles des hooks : on les appelle au premier niveau, jamais dans des conditions ou des boucles. Ils peuvent aussi être testés isolément avec renderHook.",
    explanation:
      "Les hooks personnalisés séparent le comportement de la présentation, ce qui rend les composants plus petits et la logique réutilisable et testable.",
    example: "function useDebounce<T>(value: T, ms = 300) {\n  const [v, setV] = useState(value);\n  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);\n  return v;\n}",
    tips: ["Expliquez que chaque appel possède son propre état.", "Donnez un exemple réaliste."],
    commonMistakes: ["Penser qu'un hook personnalisé partage l'état entre composants.", "Appeler des hooks de façon conditionnelle."],
    followUpQuestions: ["Comment partageriez-vous plutôt un état entre composants ?", "Comment testez-vous un hook personnalisé ?"],
  },
  'fe-023': {
    question: "Quand un composant React est-il rendu à nouveau, et en quoi memo, useMemo et useCallback aident-ils ?",
    intent: "Le recruteur évalue votre compréhension avancée des performances de rendu et du moment où l'optimisation en vaut la peine.",
    expectedAnswer:
      "Un composant est rendu à nouveau quand son état change, quand son parent est rendu à nouveau, ou quand un contexte qu'il consomme change. Rendre à nouveau un composant est généralement peu coûteux ; React compare ensuite le résultat et ne met à jour dans le DOM que ce qui a changé. Les problèmes apparaissent quand des composants coûteux sont rendus souvent. React.memo enveloppe un composant pour qu'il saute le rendu si ses props sont superficiellement égales aux précédentes. Comme les objets et les fonctions créés pendant le rendu du parent sont nouveaux à chaque fois, memo ne fonctionne que si ces props gardent la même identité, ce que fournissent useMemo, pour les valeurs calculées, et useCallback, pour les fonctions. useMemo est aussi utile pour des calculs réellement coûteux. Ces outils ajoutent de la complexité et consomment de la mémoire : je mesure donc d'abord avec le Profiler des React DevTools, et je corrige souvent la cause profonde à la place : descendre l'état au plus près de son utilisation, passer children en props, ou découper les contextes. Le React Compiler, introduit avec React 19, peut appliquer cette mémoïsation automatiquement.",
    explanation:
      "La mémoïsation consiste à préserver l'identité pour éviter du travail. Les réponses avancées insistent sur la mesure préalable et les corrections structurelles, et mentionnent le React Compiler.",
    tips: ["Citez les trois causes d'un nouveau rendu.", "Expliquez l'identité référentielle.", "Insistez sur le profilage avant toute optimisation."],
    commonMistakes: ["Tout envelopper par défaut dans useMemo et useCallback.", "Utiliser memo sur un composant qui reçoit une nouvelle prop objet à chaque rendu."],
    followUpQuestions: ["Comment un contexte provoque-t-il des rendus inutiles ?", "Qu'est-ce que le React Compiler change ?"],
  },
  'fe-024': {
    question: "Expliquez le rendu côté serveur, la génération statique et les React Server Components.",
    intent: "Le recruteur vérifie vos connaissances avancées des stratégies de rendu modernes de React et de leurs compromis.",
    expectedAnswer:
      "Avec le rendu côté client, le navigateur télécharge le JavaScript et construit la page, ce qui peut être lent pour le premier affichage et peu favorable au SEO. Le rendu côté serveur (SSR) génère le HTML sur le serveur à chaque requête, si bien que le contenu apparaît rapidement, puis l'hydratation attache React à ce HTML pour le rendre interactif. La génération statique rend les pages au moment du build, ce qui est idéal pour du contenu qui change rarement ; la régénération incrémentale les rafraîchit périodiquement. Les React Server Components vont plus loin : certains composants s'exécutent uniquement sur le serveur, peuvent accéder directement aux bases de données ou aux API et envoient un résultat sérialisé plutôt que leur code, si bien qu'ils n'ajoutent aucun JavaScript au bundle client. Les composants client, marqués avec \"use client\", gèrent l'interactivité et l'état. Des frameworks comme l'App Router de Next.js combinent ces approches avec le streaming et Suspense pour que les parties de la page arrivent progressivement. Les compromis incluent le coût et la complexité côté serveur, une séparation rigoureuse du code serveur et client, les erreurs d'hydratation (hydration mismatch) et un comportement de cache qu'il faut bien comprendre. Le choix dépend des besoins en SEO, de la fraîcheur des données et du niveau d'interactivité de la page.",
    explanation:
      "Chaque stratégie arbitre entre vitesse du premier chargement, interactivité, fraîcheur et coût. Les candidats avancés expliquent l'hydratation et ce que les Server Components retirent du bundle.",
    tips: ["Comparez les stratégies selon le moment où le HTML est généré.", "Expliquez l'hydratation.", "Expliquez ce que les Server Components envoient au client."],
    commonMistakes: ["Penser que le SSR supprime le besoin de JavaScript côté client.", "Importer du code réservé au serveur dans des composants client."],
    followUpQuestions: ["Qu'est-ce qui provoque une erreur d'hydratation ?", "Comment choisiriez-vous une stratégie pour une page produit de site e-commerce ?"],
  },
  'fe-025': {
    question: "Comment structureriez-vous une grande base de code React pour qu'elle reste maintenable ?",
    intent: "Le recruteur évalue votre jugement d'architecture pour des applications frontend développées par plusieurs équipes.",
    expectedAnswer:
      "J'organiserais le code par fonctionnalité plutôt que par type technique : un dossier features/checkout contenant ses composants, ses hooks, ses appels d'API et ses tests, avec un index public depuis lequel les autres fonctionnalités importent, au lieu de dossiers globaux components, hooks et services qui grossissent sans limite. L'interface partagée et générique va dans un design system aux composants documentés, idéalement dans Storybook. Je séparerais l'état serveur, géré par une bibliothèque de chargement de données comme TanStack Query, de l'état local de l'interface et du peu d'état client réellement global. Les composants suivraient une séparation claire : les composants de présentation reçoivent les données via les props, tandis que des composants conteneurs ou des hooks gèrent les données et les effets de bord. J'imposerais les frontières avec des règles de lint, par exemple en interdisant les imports depuis les éléments internes d'une autre fonctionnalité, j'utiliserais TypeScript en mode strict et une convention de dossiers cohérente. Les tests porteraient sur le comportement utilisateur avec Testing Library plutôt que sur les détails d'implémentation. À mesure que l'application grandit, le code splitting par route garde les bundles légers, et si des équipes ont besoin de livraisons indépendantes, un monorepo avec des packages ou, dans de rares cas, des micro-frontends peuvent aider.",
    explanation:
      "La maintenabilité vient de frontières claires, d'un design system partagé, de catégories d'état explicites et de conventions imposées. Les réponses avancées mentionnent l'outillage qui fait respecter la structure.",
    tips: ["Décrivez l'organisation par fonctionnalité.", "Distinguez l'état serveur de l'état client.", "Mentionnez la manière dont les frontières sont imposées."],
    commonMistakes: ["Tout mettre dans un store global.", "Se lancer dans les micro-frontends sans raison organisationnelle."],
    followUpQuestions: ["Quand les micro-frontends sont-ils justifiés ?", "Comment évitez-vous que le design system devienne un goulot d'étranglement ?"],
  },
};
