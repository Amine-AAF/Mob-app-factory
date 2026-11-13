import type { Lesson } from '../types';

export const technicalA: Lesson[] = [
  // ---------------------------------------------------------------------------
  // te-01 Programming fundamentals
  // ---------------------------------------------------------------------------
  {
    id: 'te-01',
    moduleId: 'technical',
    topic: 'fundamentals',
    title: 'Programming fundamentals: talking about code',
    titleTranslation: {
      fr: 'Les bases de la programmation : parler du code',
      es: 'Fundamentos de programación: hablar de código',
    },
    level: 'beginner',
    premium: false,
    estimatedMinutes: 7,
    roles: ['any', 'student'],
    objective:
      'Describe simple code out loud: variables, functions, loops, conditions and return values.',
    objectiveTranslation: {
      fr: 'Décrire du code simple à voix haute : variables, fonctions, boucles, conditions et valeurs de retour.',
      es: 'Describir código sencillo en voz alta: variables, funciones, bucles, condiciones y valores de retorno.',
    },
    situation:
      'A new teammate asks you to explain a small function you wrote that calculates a shopping cart total.',
    situationTranslation: {
      fr: 'Un nouveau collègue vous demande d\'expliquer une petite fonction que vous avez écrite et qui calcule le total d\'un panier.',
      es: 'Un nuevo compañero te pide que le expliques una pequeña función que escribiste y que calcula el total de un carrito de compra.',
    },
    vocabulary: [
      {
        term: 'variable',
        definition: 'A named place in memory that stores a value your code can read or change.',
        translation: { fr: 'variable', es: 'variable' },
      },
      {
        term: 'function',
        definition: 'A named block of code that does one task and can be called many times.',
        translation: { fr: 'fonction', es: 'función' },
      },
      {
        term: 'loop',
        definition: 'Code that repeats a set of instructions, for example once for each item in a list.',
        translation: { fr: 'boucle', es: 'bucle' },
      },
      {
        term: 'condition',
        definition: 'A true-or-false check that decides which part of the code runs.',
        translation: { fr: 'condition', es: 'condición' },
      },
      {
        term: 'return value',
        definition: 'The result a function sends back to the code that called it.',
        translation: { fr: 'valeur de retour', es: 'valor de retorno' },
      },
    ],
    expressions: [
      {
        phrase: 'This function takes a list of items and returns the total.',
        usage: 'Use "takes ... and returns ..." to describe a function\'s input and output in one sentence.',
        translation: {
          fr: 'Cette fonction prend une liste d\'articles et renvoie le total.',
          es: 'Esta función recibe una lista de artículos y devuelve el total.',
        },
      },
      {
        phrase: 'We loop through each item and add its price.',
        usage: 'Use "loop through" or "iterate over" to explain what happens for every element.',
        translation: {
          fr: 'On parcourt chaque article et on ajoute son prix.',
          es: 'Recorremos cada artículo y sumamos su precio.',
        },
      },
      {
        phrase: 'If the cart is empty, it returns zero.',
        usage: 'Use "if ..., it ..." to describe a condition and what happens in that case.',
        translation: {
          fr: 'Si le panier est vide, elle renvoie zéro.',
          es: 'Si el carrito está vacío, devuelve cero.',
        },
      },
      {
        phrase: 'This variable holds the running total.',
        usage: 'Use "holds" or "stores" to say what a variable contains.',
        translation: {
          fr: 'Cette variable contient le total cumulé.',
          es: 'Esta variable guarda el total acumulado.',
        },
      },
      {
        phrase: 'Where is this function called from?',
        usage: 'Ask this when you want to know which part of the code uses a function.',
        translation: {
          fr: 'D\'où cette fonction est-elle appelée ?',
          es: '¿Desde dónde se llama a esta función?',
        },
      },
    ],
    dialogue: {
      context: 'Kenji, a junior developer, asks Amara to walk him through her cart total function.',
      lines: [
        {
          speaker: 'Kenji',
          text: 'Hi Amara, can you walk me through the calculateTotal function?',
          translation: {
            fr: 'Salut Amara, tu peux m\'expliquer la fonction calculateTotal ?',
            es: 'Hola Amara, ¿me puedes explicar la función calculateTotal?',
          },
        },
        {
          speaker: 'Amara',
          text: 'Sure. It takes a list of cart items and returns the total price.',
          translation: {
            fr: 'Bien sûr. Elle prend une liste d\'articles du panier et renvoie le prix total.',
            es: 'Claro. Recibe una lista de artículos del carrito y devuelve el precio total.',
          },
        },
        {
          speaker: 'Kenji',
          text: 'OK. And what does the total variable do?',
          translation: {
            fr: 'D\'accord. Et à quoi sert la variable total ?',
            es: 'Vale. ¿Y para qué sirve la variable total?',
          },
        },
        {
          speaker: 'Amara',
          text: 'It starts at zero. Then we loop through each item and add the price times the quantity.',
          translation: {
            fr: 'Elle commence à zéro. Ensuite, on parcourt chaque article et on ajoute le prix multiplié par la quantité.',
            es: 'Empieza en cero. Luego recorremos cada artículo y sumamos el precio por la cantidad.',
          },
        },
        {
          speaker: 'Kenji',
          text: 'What happens if the list is empty?',
          translation: {
            fr: 'Que se passe-t-il si la liste est vide ?',
            es: '¿Qué pasa si la lista está vacía?',
          },
        },
        {
          speaker: 'Amara',
          text: "The loop doesn't run, so the function just returns zero.",
          translation: {
            fr: 'La boucle ne s\'exécute pas, donc la fonction renvoie simplement zéro.',
            es: 'El bucle no se ejecuta, así que la función simplemente devuelve cero.',
          },
        },
        {
          speaker: 'Kenji',
          text: 'And this if statement at the end?',
          translation: {
            fr: 'Et ce if à la fin ?',
            es: '¿Y este if al final?',
          },
        },
        {
          speaker: 'Amara',
          text: 'If the total is over 50 euros, we apply free shipping. Otherwise, we add the shipping cost.',
          translation: {
            fr: 'Si le total dépasse 50 euros, on applique la livraison gratuite. Sinon, on ajoute les frais de port.',
            es: 'Si el total supera los 50 euros, aplicamos envío gratis. Si no, sumamos el coste de envío.',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'te-01-q1',
        type: 'fill',
        prompt: 'This function ___ a user ID and returns the user\'s name.',
        options: ['gives', 'takes', 'holds', 'loops'],
        correctIndex: 1,
        explanation: 'We say a function "takes" an input (a parameter) and "returns" an output.',
      },
      {
        id: 'te-01-q2',
        type: 'choice',
        prompt: 'Which sentence correctly describes a loop?',
        options: [
          'We return each order to the database.',
          'We hold every order in one condition.',
          'We iterate over the orders and check their status.',
        ],
        correctIndex: 2,
        explanation: '"Iterate over" (or "loop through") is the natural way to describe repeating code for each element.',
      },
      {
        id: 'te-01-q3',
        type: 'choice',
        prompt: 'What is a "return value"?',
        options: [
          'The result a function sends back to its caller',
          'The first value stored in a variable',
          'The number of times a loop runs',
          'An error shown to the user',
        ],
        correctIndex: 0,
        explanation: 'A return value is what a function gives back to the code that called it.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // te-02 Java
  // ---------------------------------------------------------------------------
  {
    id: 'te-02',
    moduleId: 'technical',
    topic: 'java',
    title: 'Java: classes, objects and the JVM',
    titleTranslation: {
      fr: 'Java : classes, objets et la JVM',
      es: 'Java: clases, objetos y la JVM',
    },
    level: 'intermediate',
    premium: false,
    estimatedMinutes: 8,
    roles: ['java', 'fullstack', 'student'],
    objective:
      'Explain how a Java class is designed and how Java code runs on the JVM, using precise vocabulary.',
    objectiveTranslation: {
      fr: 'Expliquer comment une classe Java est conçue et comment le code Java s\'exécute sur la JVM, avec un vocabulaire précis.',
      es: 'Explicar cómo se diseña una clase Java y cómo se ejecuta el código Java en la JVM, con un vocabulario preciso.',
    },
    situation:
      'During a code review, a colleague asks why you made a field private and added an interface.',
    situationTranslation: {
      fr: 'Pendant une code review, un collègue vous demande pourquoi vous avez rendu un champ privé et ajouté une interface.',
      es: 'Durante una code review, un compañero te pregunta por qué hiciste privado un campo y añadiste una interfaz.',
    },
    vocabulary: [
      {
        term: 'class',
        definition: 'A blueprint that defines the fields and methods its objects will have.',
        translation: { fr: 'classe', es: 'clase' },
      },
      {
        term: 'instance',
        definition: 'A concrete object created from a class, usually with the new keyword.',
        translation: { fr: 'instance', es: 'instancia' },
      },
      {
        term: 'encapsulation',
        definition: 'Hiding an object\'s internal state and exposing it only through controlled methods.',
        translation: { fr: 'encapsulation', es: 'encapsulamiento' },
      },
      {
        term: 'bytecode',
        definition: 'The platform-independent code the Java compiler produces and the JVM executes.',
        translation: { fr: 'bytecode', es: 'bytecode' },
      },
      {
        term: 'garbage collector',
        definition: 'The part of the JVM that automatically frees memory used by objects that are no longer reachable.',
        translation: { fr: 'ramasse-miettes (garbage collector)', es: 'recolector de basura (garbage collector)' },
      },
    ],
    expressions: [
      {
        phrase: 'I made the field private so it can only be changed through this method.',
        usage: 'Use this to justify encapsulation in a code review.',
        translation: {
          fr: 'J\'ai rendu le champ privé pour qu\'il ne puisse être modifié que par cette méthode.',
          es: 'Hice el campo privado para que solo se pueda modificar a través de este método.',
        },
      },
      {
        phrase: 'This class implements the PaymentProvider interface.',
        usage: 'Use "implements" for interfaces and "extends" for inheritance from a class.',
        translation: {
          fr: 'Cette classe implémente l\'interface PaymentProvider.',
          es: 'Esta clase implementa la interfaz PaymentProvider.',
        },
      },
      {
        phrase: 'We create a new instance for each request.',
        usage: 'Use this to describe when and how often objects are created.',
        translation: {
          fr: 'On crée une nouvelle instance pour chaque requête.',
          es: 'Creamos una nueva instancia para cada petición.',
        },
      },
      {
        phrase: 'The code compiles to bytecode, and the JVM runs it on any platform.',
        usage: 'Use this to explain Java portability in simple terms.',
        translation: {
          fr: 'Le code est compilé en bytecode, et la JVM l\'exécute sur n\'importe quelle plateforme.',
          es: 'El código se compila a bytecode y la JVM lo ejecuta en cualquier plataforma.',
        },
      },
      {
        phrase: 'We could make this class immutable to avoid side effects.',
        usage: 'Use "we could" to suggest a design improvement politely.',
        translation: {
          fr: 'On pourrait rendre cette classe immuable pour éviter les effets de bord.',
          es: 'Podríamos hacer esta clase inmutable para evitar efectos secundarios.',
        },
      },
    ],
    dialogue: {
      context: 'Marco reviews Priya\'s pull request, which adds a new payment class in a Java service.',
      lines: [
        {
          speaker: 'Marco',
          text: 'Nice PR. Quick question: why is the balance field private now?',
          translation: {
            fr: 'Belle PR. Petite question : pourquoi le champ balance est-il privé maintenant ?',
            es: 'Buena PR. Una pregunta rápida: ¿por qué el campo balance ahora es privado?',
          },
        },
        {
          speaker: 'Priya',
          text: 'Other classes were changing it directly. Now it can only be updated through the debit and credit methods.',
          translation: {
            fr: 'D\'autres classes le modifiaient directement. Maintenant, il ne peut être mis à jour que par les méthodes debit et credit.',
            es: 'Otras clases lo modificaban directamente. Ahora solo se puede actualizar mediante los métodos debit y credit.',
          },
        },
        {
          speaker: 'Marco',
          text: 'Makes sense. And the new interface?',
          translation: {
            fr: 'Logique. Et la nouvelle interface ?',
            es: 'Tiene sentido. ¿Y la nueva interfaz?',
          },
        },
        {
          speaker: 'Priya',
          text: 'CardProvider and BankTransferProvider both implement PaymentProvider, so the checkout code does not depend on a concrete class.',
          translation: {
            fr: 'CardProvider et BankTransferProvider implémentent tous les deux PaymentProvider, donc le code du checkout ne dépend pas d\'une classe concrète.',
            es: 'CardProvider y BankTransferProvider implementan PaymentProvider, así que el código del checkout no depende de una clase concreta.',
          },
        },
        {
          speaker: 'Marco',
          text: 'Good. Are we creating a new provider instance for every payment?',
          translation: {
            fr: 'Bien. Est-ce qu\'on crée une nouvelle instance de provider pour chaque paiement ?',
            es: 'Bien. ¿Estamos creando una nueva instancia del provider para cada pago?',
          },
        },
        {
          speaker: 'Priya',
          text: "Yes, but they're small and short-lived, so the garbage collector handles them easily.",
          translation: {
            fr: 'Oui, mais elles sont petites et éphémères, donc le garbage collector les gère facilement.',
            es: 'Sí, pero son pequeñas y de vida corta, así que el garbage collector las gestiona sin problema.',
          },
        },
        {
          speaker: 'Marco',
          text: 'Fair enough. We could also make the Payment class a record, since it never changes.',
          translation: {
            fr: 'D\'accord. On pourrait aussi faire de la classe Payment un record, puisqu\'elle ne change jamais.',
            es: 'Vale. También podríamos convertir la clase Payment en un record, ya que nunca cambia.',
          },
        },
        {
          speaker: 'Priya',
          text: "Good idea. I'll update it and push a new commit.",
          translation: {
            fr: 'Bonne idée. Je la modifie et je pousse un nouveau commit.',
            es: 'Buena idea. La actualizo y subo un nuevo commit.',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'te-02-q1',
        type: 'fill',
        prompt: 'The OrderService class ___ the Auditable interface.',
        options: ['extends', 'inherits', 'implements', 'instantiates'],
        correctIndex: 2,
        explanation: 'In Java, a class "implements" an interface and "extends" another class.',
      },
      {
        id: 'te-02-q2',
        type: 'choice',
        prompt: 'What does the JVM execute?',
        options: ['Java source files (.java)', 'Bytecode (.class files)', 'Machine code written by the developer'],
        correctIndex: 1,
        explanation: 'The compiler turns .java source into bytecode, which the JVM interprets or JIT-compiles at runtime.',
      },
      {
        id: 'te-02-q3',
        type: 'choice',
        prompt: 'Your colleague asks why a field is private. Which answer best explains encapsulation?',
        options: [
          'So the garbage collector can remove it faster.',
          'So the class compiles to smaller bytecode.',
          'So other classes can read it directly.',
          'So its state can only change through controlled methods.',
        ],
        correctIndex: 3,
        explanation: 'Encapsulation means protecting internal state and exposing it only through methods you control.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // te-03 Spring Boot
  // ---------------------------------------------------------------------------
  {
    id: 'te-03',
    moduleId: 'technical',
    topic: 'java',
    title: 'Spring Boot: describing a service',
    titleTranslation: {
      fr: 'Spring Boot : décrire un service',
      es: 'Spring Boot: describir un servicio',
    },
    level: 'intermediate',
    premium: true,
    estimatedMinutes: 9,
    roles: ['java', 'fullstack'],
    objective:
      'Describe the layers of a Spring Boot service and explain how dependency injection and configuration work.',
    objectiveTranslation: {
      fr: 'Décrire les couches d\'un service Spring Boot et expliquer le fonctionnement de l\'injection de dépendances et de la configuration.',
      es: 'Describir las capas de un servicio Spring Boot y explicar cómo funcionan la inyección de dependencias y la configuración.',
    },
    situation:
      'You are onboarding a new backend developer and presenting the structure of your team\'s order service.',
    situationTranslation: {
      fr: 'Vous accueillez un nouveau développeur backend et vous présentez la structure du service de commandes de votre équipe.',
      es: 'Estás incorporando a un nuevo desarrollador backend y le presentas la estructura del servicio de pedidos de tu equipo.',
    },
    vocabulary: [
      {
        term: 'bean',
        definition: 'An object created and managed by the Spring container.',
        translation: { fr: 'bean', es: 'bean' },
      },
      {
        term: 'dependency injection',
        definition: 'A technique where the framework provides an object\'s dependencies instead of the object creating them itself.',
        translation: { fr: 'injection de dépendances', es: 'inyección de dependencias' },
      },
      {
        term: 'controller',
        definition: 'The layer that receives HTTP requests and returns responses.',
        translation: { fr: 'contrôleur (controller)', es: 'controlador (controller)' },
      },
      {
        term: 'repository',
        definition: 'The layer that reads and writes data, usually in a database.',
        translation: { fr: 'repository (couche d\'accès aux données)', es: 'repositorio (capa de acceso a datos)' },
      },
      {
        term: 'profile',
        definition: 'A named set of configuration, such as dev or prod, that Spring activates at startup.',
        translation: { fr: 'profil', es: 'perfil' },
      },
    ],
    expressions: [
      {
        phrase: 'The controller delegates the business logic to the service layer.',
        usage: 'Use "delegates to" to explain how responsibilities are split between layers.',
        translation: {
          fr: 'Le controller délègue la logique métier à la couche service.',
          es: 'El controller delega la lógica de negocio en la capa de servicio.',
        },
      },
      {
        phrase: 'We use constructor injection, so the dependencies are explicit and easy to mock.',
        usage: 'Use this to justify a common Spring best practice.',
        translation: {
          fr: 'On utilise l\'injection par constructeur, donc les dépendances sont explicites et faciles à mocker.',
          es: 'Usamos inyección por constructor, así que las dependencias son explícitas y fáciles de mockear.',
        },
      },
      {
        phrase: 'The database URL comes from application.yml, and it\'s overridden per profile.',
        usage: 'Use this to explain where configuration lives and how it changes between environments.',
        translation: {
          fr: 'L\'URL de la base vient d\'application.yml, et elle est surchargée selon le profil.',
          es: 'La URL de la base de datos viene de application.yml y se sobrescribe según el perfil.',
        },
      },
      {
        phrase: 'This method is transactional, so if anything fails, the whole operation rolls back.',
        usage: 'Use this to describe the effect of @Transactional in plain words.',
        translation: {
          fr: 'Cette méthode est transactionnelle, donc si quelque chose échoue, toute l\'opération est annulée (rollback).',
          es: 'Este método es transaccional, así que si algo falla, toda la operación hace rollback.',
        },
      },
      {
        phrase: 'Spring Boot auto-configures most of this for us.',
        usage: 'Use this to explain why there is little setup code.',
        translation: {
          fr: 'Spring Boot configure automatiquement la plupart de ces éléments pour nous.',
          es: 'Spring Boot configura automáticamente la mayor parte de esto por nosotros.',
        },
      },
    ],
    dialogue: {
      context: 'Lucía presents the order service to Tom, who has just joined the backend team.',
      lines: [
        {
          speaker: 'Lucía',
          text: "Let's start with the big picture. The order service has three main layers: controller, service and repository.",
          translation: {
            fr: 'Commençons par la vue d\'ensemble. Le service de commandes a trois couches principales : controller, service et repository.',
            es: 'Empecemos por la visión general. El servicio de pedidos tiene tres capas principales: controller, service y repository.',
          },
        },
        {
          speaker: 'Tom',
          text: 'So the OrderController handles the REST endpoints?',
          translation: {
            fr: 'Donc l\'OrderController gère les endpoints REST ?',
            es: '¿Entonces el OrderController gestiona los endpoints REST?',
          },
        },
        {
          speaker: 'Lucía',
          text: 'Exactly. It validates the input and delegates everything else to OrderService.',
          translation: {
            fr: 'Exactement. Il valide l\'entrée et délègue tout le reste à OrderService.',
            es: 'Exacto. Valida la entrada y delega todo lo demás en OrderService.',
          },
        },
        {
          speaker: 'Tom',
          text: 'How does the controller get the service? I don\'t see any "new" keyword.',
          translation: {
            fr: 'Comment le controller obtient-il le service ? Je ne vois aucun mot-clé « new ».',
            es: '¿Cómo obtiene el controller el servicio? No veo ninguna palabra clave "new".',
          },
        },
        {
          speaker: 'Lucía',
          text: 'Spring injects it through the constructor. OrderService is a bean, so the container creates it and wires it in.',
          translation: {
            fr: 'Spring l\'injecte via le constructeur. OrderService est un bean, donc le conteneur le crée et le branche.',
            es: 'Spring lo inyecta a través del constructor. OrderService es un bean, así que el contenedor lo crea y lo conecta.',
          },
        },
        {
          speaker: 'Tom',
          text: 'Got it. And where do we configure the database?',
          translation: {
            fr: 'Compris. Et où est-ce qu\'on configure la base de données ?',
            es: 'Entendido. ¿Y dónde configuramos la base de datos?',
          },
        },
        {
          speaker: 'Lucía',
          text: 'In application.yml. Locally we run the dev profile with a database in Docker, and prod reads the credentials from environment variables.',
          translation: {
            fr: 'Dans application.yml. En local, on utilise le profil dev avec une base dans Docker, et la prod lit les identifiants depuis des variables d\'environnement.',
            es: 'En application.yml. En local usamos el perfil dev con una base de datos en Docker, y producción lee las credenciales de variables de entorno.',
          },
        },
        {
          speaker: 'Tom',
          text: 'What about createOrder? It writes to two tables.',
          translation: {
            fr: 'Et createOrder ? Elle écrit dans deux tables.',
            es: '¿Y createOrder? Escribe en dos tablas.',
          },
        },
        {
          speaker: 'Lucía',
          text: "It's annotated with @Transactional, so if the second insert fails, the first one rolls back too.",
          translation: {
            fr: 'Elle est annotée avec @Transactional, donc si la deuxième insertion échoue, la première est aussi annulée.',
            es: 'Está anotada con @Transactional, así que si la segunda inserción falla, la primera también hace rollback.',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'te-03-q1',
        type: 'choice',
        prompt: 'Which layer should contain the main business logic in a typical Spring Boot service?',
        options: ['The controller', 'The service layer', 'The repository', 'application.yml'],
        correctIndex: 1,
        explanation: 'Controllers handle HTTP, repositories handle data access, and the service layer holds the business logic.',
      },
      {
        id: 'te-03-q2',
        type: 'fill',
        prompt: 'We use constructor ___, so Spring passes the dependencies in when it creates the bean.',
        options: ['injection', 'inheritance', 'configuration'],
        correctIndex: 0,
        explanation: 'With constructor injection, Spring provides the dependencies as constructor arguments.',
      },
      {
        id: 'te-03-q3',
        type: 'choice',
        prompt: 'How would you explain @Transactional to a colleague?',
        options: [
          'It makes the method run in a separate thread.',
          'It caches the result of the method.',
          'If any step fails, all the database changes in the method are rolled back.',
        ],
        correctIndex: 2,
        explanation: '@Transactional wraps the method in a transaction: by default, an unchecked exception rolls back all its changes.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // te-04 React
  // ---------------------------------------------------------------------------
  {
    id: 'te-04',
    moduleId: 'technical',
    topic: 'frontend',
    title: 'React: components, props and state',
    titleTranslation: {
      fr: 'React : composants, props et state',
      es: 'React: componentes, props y estado',
    },
    level: 'intermediate',
    premium: false,
    estimatedMinutes: 8,
    roles: ['react', 'fullstack'],
    objective:
      'Explain how React components pass data with props, manage state and re-render.',
    objectiveTranslation: {
      fr: 'Expliquer comment les composants React transmettent des données via les props, gèrent leur state et se re-rendent.',
      es: 'Explicar cómo los componentes de React pasan datos con props, gestionan el estado y se vuelven a renderizar.',
    },
    situation:
      'In a pairing session, you and a colleague are figuring out why a product list does not update after a filter changes.',
    situationTranslation: {
      fr: 'Pendant une session de pair programming, vous cherchez avec un collègue pourquoi une liste de produits ne se met pas à jour après le changement d\'un filtre.',
      es: 'En una sesión de pair programming, tú y un compañero intentáis averiguar por qué una lista de productos no se actualiza al cambiar un filtro.',
    },
    vocabulary: [
      {
        term: 'component',
        definition: 'A reusable function that returns a piece of UI.',
        translation: { fr: 'composant', es: 'componente' },
      },
      {
        term: 'props',
        definition: 'Read-only inputs that a parent component passes to a child component.',
        translation: { fr: 'props (propriétés)', es: 'props (propiedades)' },
      },
      {
        term: 'state',
        definition: 'Data owned by a component that can change over time and triggers a re-render when it does.',
        translation: { fr: 'state (état)', es: 'estado (state)' },
      },
      {
        term: 're-render',
        definition: 'When React calls a component again to update what appears on the screen.',
        translation: { fr: 'nouveau rendu (re-render)', es: 'nuevo renderizado (re-render)' },
      },
      {
        term: 'hook',
        definition: 'A special function, such as useState or useEffect, that lets a component use React features.',
        translation: { fr: 'hook', es: 'hook' },
      },
    ],
    expressions: [
      {
        phrase: 'The parent passes the selected filter down as a prop.',
        usage: 'Use "pass down as a prop" to describe data flowing from parent to child.',
        translation: {
          fr: 'Le parent transmet le filtre sélectionné en tant que prop.',
          es: 'El padre pasa el filtro seleccionado como prop.',
        },
      },
      {
        phrase: 'We should lift the state up to the common parent.',
        usage: 'Use this when two sibling components need to share the same data.',
        translation: {
          fr: 'On devrait remonter le state jusqu\'au parent commun.',
          es: 'Deberíamos subir el estado al componente padre común.',
        },
      },
      {
        phrase: "The component doesn't re-render because we're mutating the array directly.",
        usage: 'Use this to explain a classic React bug: state must be replaced, not mutated.',
        translation: {
          fr: 'Le composant ne se re-rend pas parce qu\'on modifie le tableau directement.',
          es: 'El componente no se vuelve a renderizar porque estamos mutando el array directamente.',
        },
      },
      {
        phrase: 'This effect runs whenever the filter changes.',
        usage: 'Use this to describe a useEffect and its dependency array.',
        translation: {
          fr: 'Cet effet s\'exécute chaque fois que le filtre change.',
          es: 'Este efecto se ejecuta cada vez que cambia el filtro.',
        },
      },
      {
        phrase: 'Could we extract this into its own component?',
        usage: 'Use this to suggest splitting a large component politely.',
        translation: {
          fr: 'On pourrait extraire ça dans un composant à part ?',
          es: '¿Podríamos extraer esto a su propio componente?',
        },
      },
    ],
    dialogue: {
      context: 'Amara and Tom are pair programming on a product list page that does not update correctly.',
      lines: [
        {
          speaker: 'Tom',
          text: "When I click a category, the list doesn't change. Any idea why?",
          translation: {
            fr: 'Quand je clique sur une catégorie, la liste ne change pas. Une idée de la raison ?',
            es: 'Cuando hago clic en una categoría, la lista no cambia. ¿Alguna idea de por qué?',
          },
        },
        {
          speaker: 'Amara',
          text: 'Let\'s check. Where is the selected category stored?',
          translation: {
            fr: 'Regardons. Où est stockée la catégorie sélectionnée ?',
            es: 'Vamos a ver. ¿Dónde se guarda la categoría seleccionada?',
          },
        },
        {
          speaker: 'Tom',
          text: 'In the FilterBar component, with useState.',
          translation: {
            fr: 'Dans le composant FilterBar, avec useState.',
            es: 'En el componente FilterBar, con useState.',
          },
        },
        {
          speaker: 'Amara',
          text: "That's the problem. ProductList is a sibling, so it never receives that value.",
          translation: {
            fr: 'Voilà le problème. ProductList est un composant frère, donc il ne reçoit jamais cette valeur.',
            es: 'Ese es el problema. ProductList es un componente hermano, así que nunca recibe ese valor.',
          },
        },
        {
          speaker: 'Tom',
          text: 'So we should lift the state up to the ProductsPage?',
          translation: {
            fr: 'Donc on devrait remonter le state jusqu\'à ProductsPage ?',
            es: '¿Entonces deberíamos subir el estado a ProductsPage?',
          },
        },
        {
          speaker: 'Amara',
          text: 'Yes. The page owns the state, passes the category down to ProductList as a prop, and gives FilterBar an onChange callback.',
          translation: {
            fr: 'Oui. La page possède le state, transmet la catégorie à ProductList en prop, et donne à FilterBar un callback onChange.',
            es: 'Sí. La página es dueña del estado, pasa la categoría a ProductList como prop y le da a FilterBar un callback onChange.',
          },
        },
        {
          speaker: 'Tom',
          text: 'And then ProductList re-renders when the category changes?',
          translation: {
            fr: 'Et ensuite ProductList se re-rend quand la catégorie change ?',
            es: '¿Y luego ProductList se vuelve a renderizar cuando cambia la categoría?',
          },
        },
        {
          speaker: 'Amara',
          text: 'Exactly. When the state in the parent updates, React re-renders it and its children with the new props.',
          translation: {
            fr: 'Exactement. Quand le state du parent est mis à jour, React le re-rend, ainsi que ses enfants, avec les nouvelles props.',
            es: 'Exacto. Cuando se actualiza el estado del padre, React lo vuelve a renderizar junto con sus hijos con las nuevas props.',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'te-04-q1',
        type: 'choice',
        prompt: 'Two sibling components need the same data. What do you suggest?',
        options: [
          'Mutate the props in one of them.',
          'Lift the state up to their common parent.',
          'Copy the state into both components.',
          'Call useEffect in the child.',
        ],
        correctIndex: 1,
        explanation: 'Lifting state up to the closest common parent lets it pass the same data down to both children.',
      },
      {
        id: 'te-04-q2',
        type: 'fill',
        prompt: 'Props are ___: a child component should never modify them.',
        options: ['asynchronous', 'global', 'read-only'],
        correctIndex: 2,
        explanation: 'Props are read-only inputs; to change data, the child calls a callback and the owner updates its state.',
      },
      {
        id: 'te-04-q3',
        type: 'choice',
        prompt: 'Which sentence correctly explains a common re-render bug?',
        options: [
          "The list doesn't update because we push to the state array instead of setting a new array.",
          "The list doesn't update because the component has too many props.",
          "The list doesn't update because hooks only work in class components.",
        ],
        correctIndex: 0,
        explanation: 'React compares state by reference, so mutating an array in place does not trigger a re-render.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // te-05 JavaScript and TypeScript
  // ---------------------------------------------------------------------------
  {
    id: 'te-05',
    moduleId: 'technical',
    topic: 'frontend',
    title: 'JavaScript and TypeScript: types and async code',
    titleTranslation: {
      fr: 'JavaScript et TypeScript : types et code asynchrone',
      es: 'JavaScript y TypeScript: tipos y código asíncrono',
    },
    level: 'intermediate',
    premium: true,
    estimatedMinutes: 9,
    roles: ['react', 'fullstack'],
    objective:
      'Discuss TypeScript types and asynchronous JavaScript (promises, async/await) clearly with your team.',
    objectiveTranslation: {
      fr: 'Discuter clairement des types TypeScript et du JavaScript asynchrone (promesses, async/await) avec votre équipe.',
      es: 'Hablar con claridad con tu equipo sobre los tipos de TypeScript y el JavaScript asíncrono (promesas, async/await).',
    },
    situation:
      'A teammate\'s pull request has a function that sometimes returns undefined and an API call that is not awaited.',
    situationTranslation: {
      fr: 'La pull request d\'un collègue contient une fonction qui renvoie parfois undefined et un appel d\'API qui n\'est pas attendu avec await.',
      es: 'La pull request de un compañero tiene una función que a veces devuelve undefined y una llamada a la API que no se espera con await.',
    },
    vocabulary: [
      {
        term: 'type annotation',
        definition: 'An explicit label in TypeScript that says what type a variable, parameter or return value has.',
        translation: { fr: 'annotation de type', es: 'anotación de tipo' },
      },
      {
        term: 'union type',
        definition: 'A type that can be one of several types, such as string | undefined.',
        translation: { fr: 'type union', es: 'tipo unión' },
      },
      {
        term: 'promise',
        definition: 'An object that represents a value that will be available later, or an error.',
        translation: { fr: 'promesse (promise)', es: 'promesa (promise)' },
      },
      {
        term: 'await',
        definition: 'A keyword that pauses an async function until a promise settles.',
        translation: { fr: 'await (attendre)', es: 'await (esperar)' },
      },
      {
        term: 'type narrowing',
        definition: 'When TypeScript infers a more specific type after a check, such as an if statement.',
        translation: { fr: 'affinage de type (narrowing)', es: 'estrechamiento de tipo (narrowing)' },
      },
    ],
    expressions: [
      {
        phrase: 'This function can return undefined, so the return type should be User | undefined.',
        usage: 'Use this to point out that a type does not match what the code really does.',
        translation: {
          fr: 'Cette fonction peut renvoyer undefined, donc le type de retour devrait être User | undefined.',
          es: 'Esta función puede devolver undefined, así que el tipo de retorno debería ser User | undefined.',
        },
      },
      {
        phrase: "We're not awaiting this call, so errors won't be caught.",
        usage: 'Use this to flag a missing await in a code review.',
        translation: {
          fr: 'On n\'attend pas cet appel avec await, donc les erreurs ne seront pas interceptées.',
          es: 'No estamos haciendo await de esta llamada, así que los errores no se capturarán.',
        },
      },
      {
        phrase: 'Can we avoid using any here?',
        usage: 'Use this to suggest a stricter type instead of turning off type checking.',
        translation: {
          fr: 'On peut éviter d\'utiliser any ici ?',
          es: '¿Podemos evitar usar any aquí?',
        },
      },
      {
        phrase: 'These two requests are independent, so we can run them in parallel with Promise.all.',
        usage: 'Use this to suggest a performance improvement for async code.',
        translation: {
          fr: 'Ces deux requêtes sont indépendantes, donc on peut les lancer en parallèle avec Promise.all.',
          es: 'Estas dos peticiones son independientes, así que podemos ejecutarlas en paralelo con Promise.all.',
        },
      },
      {
        phrase: 'After the null check, TypeScript narrows the type to User.',
        usage: 'Use this to explain why the compiler stops complaining after a check.',
        translation: {
          fr: 'Après la vérification de null, TypeScript affine le type en User.',
          es: 'Después de comprobar null, TypeScript estrecha el tipo a User.',
        },
      },
    ],
    dialogue: {
      context: 'Kenji reviews Lucía\'s TypeScript pull request during a short video call.',
      lines: [
        {
          speaker: 'Kenji',
          text: 'I left a couple of comments on findUser. It says it returns User, but it can return undefined.',
          translation: {
            fr: 'J\'ai laissé quelques commentaires sur findUser. Elle indique qu\'elle renvoie User, mais elle peut renvoyer undefined.',
            es: 'Dejé un par de comentarios en findUser. Dice que devuelve User, pero puede devolver undefined.',
          },
        },
        {
          speaker: 'Lucía',
          text: 'Right, when the ID is not found. I used a type assertion to make the error go away.',
          translation: {
            fr: 'Oui, quand l\'ID n\'est pas trouvé. J\'ai utilisé une assertion de type pour faire disparaître l\'erreur.',
            es: 'Sí, cuando no se encuentra el ID. Usé una aserción de tipo para que desapareciera el error.',
          },
        },
        {
          speaker: 'Kenji',
          text: "I'd rather change the return type to User | undefined. Then the callers have to handle that case.",
          translation: {
            fr: 'Je préférerais changer le type de retour en User | undefined. Comme ça, les appelants doivent gérer ce cas.',
            es: 'Preferiría cambiar el tipo de retorno a User | undefined. Así quien la llama tiene que gestionar ese caso.',
          },
        },
        {
          speaker: 'Lucía',
          text: 'Fair point. And the second comment?',
          translation: {
            fr: 'C\'est juste. Et le deuxième commentaire ?',
            es: 'Buen punto. ¿Y el segundo comentario?',
          },
        },
        {
          speaker: 'Kenji',
          text: "In saveProfile, you call the API but you don't await it. If it fails, the try/catch won't catch the error.",
          translation: {
            fr: 'Dans saveProfile, tu appelles l\'API mais tu ne fais pas de await. Si l\'appel échoue, le try/catch n\'interceptera pas l\'erreur.',
            es: 'En saveProfile llamas a la API pero no haces await. Si falla, el try/catch no capturará el error.',
          },
        },
        {
          speaker: 'Lucía',
          text: 'Oh, good catch. I\'ll add the await.',
          translation: {
            fr: 'Ah, bien vu. J\'ajoute le await.',
            es: 'Ah, bien visto. Añado el await.',
          },
        },
        {
          speaker: 'Kenji',
          text: 'Also, loading the profile and the settings are independent, so you could use Promise.all.',
          translation: {
            fr: 'Aussi, le chargement du profil et celui des paramètres sont indépendants, donc tu pourrais utiliser Promise.all.',
            es: 'Además, cargar el perfil y la configuración son operaciones independientes, así que podrías usar Promise.all.',
          },
        },
        {
          speaker: 'Lucía',
          text: 'Nice, that should make the page load faster. I\'ll push the changes this afternoon.',
          translation: {
            fr: 'Super, ça devrait accélérer le chargement de la page. Je pousse les modifications cet après-midi.',
            es: 'Genial, así la página debería cargar más rápido. Subo los cambios esta tarde.',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'te-05-q1',
        type: 'fill',
        prompt: "We're not ___ this promise, so the error won't be caught by the try/catch.",
        options: ['returning', 'awaiting', 'typing', 'narrowing'],
        correctIndex: 1,
        explanation: 'Without await, the async function continues and a rejected promise escapes the try/catch block.',
      },
      {
        id: 'te-05-q2',
        type: 'choice',
        prompt: 'Which type correctly describes a value that is either a string or missing?',
        options: ['string & undefined', 'any', 'string | undefined'],
        correctIndex: 2,
        explanation: 'A union type (|) means the value can be one type or the other.',
      },
      {
        id: 'te-05-q3',
        type: 'choice',
        prompt: 'Two API calls do not depend on each other. What is the best suggestion?',
        options: [
          'Await the first, then the second, to keep the order.',
          'Remove the types so the calls are faster.',
          'Use a type assertion on both results.',
          'Run them in parallel with Promise.all.',
        ],
        correctIndex: 3,
        explanation: 'Promise.all starts both requests at once and waits for both, which reduces the total waiting time.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // te-06 REST APIs
  // ---------------------------------------------------------------------------
  {
    id: 'te-06',
    moduleId: 'technical',
    topic: 'apis',
    title: 'REST APIs: endpoints, methods and status codes',
    titleTranslation: {
      fr: 'API REST : endpoints, méthodes et codes de statut',
      es: 'APIs REST: endpoints, métodos y códigos de estado',
    },
    level: 'intermediate',
    premium: false,
    estimatedMinutes: 8,
    roles: ['any', 'fullstack', 'java', 'react', 'qa'],
    objective:
      'Describe REST endpoints, HTTP methods and status codes accurately when designing or debugging an API.',
    objectiveTranslation: {
      fr: 'Décrire avec précision les endpoints REST, les méthodes HTTP et les codes de statut lors de la conception ou du débogage d\'une API.',
      es: 'Describir con precisión los endpoints REST, los métodos HTTP y los códigos de estado al diseñar o depurar una API.',
    },
    situation:
      'A frontend developer and a backend developer agree on the contract for a new orders API.',
    situationTranslation: {
      fr: 'Une développeuse frontend et un développeur backend se mettent d\'accord sur le contrat d\'une nouvelle API de commandes.',
      es: 'Una desarrolladora frontend y un desarrollador backend acuerdan el contrato de una nueva API de pedidos.',
    },
    vocabulary: [
      {
        term: 'endpoint',
        definition: 'A specific URL and HTTP method that clients call, such as GET /orders.',
        translation: { fr: 'endpoint (point de terminaison)', es: 'endpoint (punto de acceso)' },
      },
      {
        term: 'payload',
        definition: 'The data sent in the body of a request or response, often JSON.',
        translation: { fr: 'payload (corps de la requête)', es: 'payload (cuerpo de la petición)' },
      },
      {
        term: 'status code',
        definition: 'A three-digit number in the response that tells the client what happened, such as 200 or 404.',
        translation: { fr: 'code de statut', es: 'código de estado' },
      },
      {
        term: 'idempotent',
        definition: 'Describes a request that has the same effect whether you send it once or several times.',
        translation: { fr: 'idempotent', es: 'idempotente' },
      },
      {
        term: 'pagination',
        definition: 'Splitting a large list of results into smaller pages.',
        translation: { fr: 'pagination', es: 'paginación' },
      },
    ],
    expressions: [
      {
        phrase: 'A POST to /orders creates a new order and returns 201 Created.',
        usage: 'Use this pattern to describe an endpoint: method, path, effect and status code.',
        translation: {
          fr: 'Un POST sur /orders crée une nouvelle commande et renvoie 201 Created.',
          es: 'Un POST a /orders crea un nuevo pedido y devuelve 201 Created.',
        },
      },
      {
        phrase: 'If the order doesn\'t exist, the API returns a 404.',
        usage: 'Use this to describe error behavior clearly.',
        translation: {
          fr: 'Si la commande n\'existe pas, l\'API renvoie une 404.',
          es: 'Si el pedido no existe, la API devuelve un 404.',
        },
      },
      {
        phrase: 'Validation errors should be a 400 with a clear error message, not a 500.',
        usage: 'Use this to separate client errors (4xx) from server errors (5xx).',
        translation: {
          fr: 'Les erreurs de validation devraient renvoyer une 400 avec un message clair, pas une 500.',
          es: 'Los errores de validación deberían ser un 400 con un mensaje claro, no un 500.',
        },
      },
      {
        phrase: 'PUT is idempotent, so the client can safely retry it.',
        usage: 'Use this when discussing retries and network failures.',
        translation: {
          fr: 'PUT est idempotent, donc le client peut le relancer sans risque.',
          es: 'PUT es idempotente, así que el cliente puede reintentarlo sin problema.',
        },
      },
      {
        phrase: 'Can we paginate this endpoint? The list could get really long.',
        usage: 'Use this to raise a performance concern about returning too much data.',
        translation: {
          fr: 'On peut paginer cet endpoint ? La liste pourrait devenir très longue.',
          es: '¿Podemos paginar este endpoint? La lista podría hacerse muy larga.',
        },
      },
    ],
    dialogue: {
      context: 'Priya (frontend) and Marco (backend) define the contract for the new orders API.',
      lines: [
        {
          speaker: 'Priya',
          text: 'For the orders page, I need to list a customer\'s orders. What endpoint should I call?',
          translation: {
            fr: 'Pour la page des commandes, j\'ai besoin de lister les commandes d\'un client. Quel endpoint je dois appeler ?',
            es: 'Para la página de pedidos necesito listar los pedidos de un cliente. ¿A qué endpoint llamo?',
          },
        },
        {
          speaker: 'Marco',
          text: 'GET /customers/{id}/orders. It\'s paginated, so pass page and size as query parameters.',
          translation: {
            fr: 'GET /customers/{id}/orders. C\'est paginé, donc passe page et size en paramètres de requête.',
            es: 'GET /customers/{id}/orders. Está paginado, así que pasa page y size como parámetros de consulta.',
          },
        },
        {
          speaker: 'Priya',
          text: 'Great. And to create an order?',
          translation: {
            fr: 'Parfait. Et pour créer une commande ?',
            es: 'Genial. ¿Y para crear un pedido?',
          },
        },
        {
          speaker: 'Marco',
          text: 'POST /orders with the items in the payload. It returns 201 Created and the new order in the body.',
          translation: {
            fr: 'POST /orders avec les articles dans le payload. Ça renvoie 201 Created et la nouvelle commande dans le corps.',
            es: 'POST /orders con los artículos en el payload. Devuelve 201 Created y el nuevo pedido en el cuerpo.',
          },
        },
        {
          speaker: 'Priya',
          text: 'What happens if an item is out of stock?',
          translation: {
            fr: 'Que se passe-t-il si un article est en rupture de stock ?',
            es: '¿Qué pasa si un artículo está agotado?',
          },
        },
        {
          speaker: 'Marco',
          text: 'You\'ll get a 409 Conflict with an error code you can show to the user. Invalid input is a 400.',
          translation: {
            fr: 'Tu recevras une 409 Conflict avec un code d\'erreur que tu pourras afficher à l\'utilisateur. Une entrée invalide renvoie une 400.',
            es: 'Recibirás un 409 Conflict con un código de error que puedes mostrar al usuario. Una entrada no válida es un 400.',
          },
        },
        {
          speaker: 'Priya',
          text: 'And if the session has expired?',
          translation: {
            fr: 'Et si la session a expiré ?',
            es: '¿Y si la sesión ha caducado?',
          },
        },
        {
          speaker: 'Marco',
          text: 'Then it\'s a 401, and you should redirect to the login page. I\'ll document all of this in the OpenAPI spec today.',
          translation: {
            fr: 'Dans ce cas, c\'est une 401, et tu dois rediriger vers la page de connexion. Je documente tout ça dans la spec OpenAPI aujourd\'hui.',
            es: 'Entonces es un 401 y deberías redirigir a la página de inicio de sesión. Hoy documento todo esto en la especificación OpenAPI.',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'te-06-q1',
        type: 'choice',
        prompt: 'A client sends a request with a missing required field. Which status code fits best?',
        options: ['400 Bad Request', '500 Internal Server Error', '201 Created', '204 No Content'],
        correctIndex: 0,
        explanation: 'Invalid input is a client error, so it belongs in the 4xx range; 400 is the usual choice.',
      },
      {
        id: 'te-06-q2',
        type: 'fill',
        prompt: 'DELETE /orders/42 is ___: calling it twice leaves the system in the same state as calling it once.',
        options: ['paginated', 'asynchronous', 'idempotent'],
        correctIndex: 2,
        explanation: 'An idempotent request has the same effect no matter how many times it is repeated.',
      },
      {
        id: 'te-06-q3',
        type: 'choice',
        prompt: 'What is the difference between 401 and 403?',
        options: [
          '401 means the server crashed; 403 means the resource was moved.',
          '401 means the client is not authenticated; 403 means it is authenticated but not allowed.',
          '401 means the resource is missing; 403 means the request was too large.',
        ],
        correctIndex: 1,
        explanation: '401 Unauthorized means valid credentials are missing; 403 Forbidden means the user is known but lacks permission.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // te-07 Microservices
  // ---------------------------------------------------------------------------
  {
    id: 'te-07',
    moduleId: 'technical',
    topic: 'architecture',
    title: 'Microservices: boundaries and trade-offs',
    titleTranslation: {
      fr: 'Microservices : frontières et compromis',
      es: 'Microservicios: límites y compromisos',
    },
    level: 'advanced',
    premium: true,
    estimatedMinutes: 11,
    roles: ['architect', 'java', 'devops', 'fullstack'],
    objective:
      'Discuss service boundaries and the trade-offs of microservices with nuance, hedging and precise vocabulary.',
    objectiveTranslation: {
      fr: 'Discuter des frontières entre services et des compromis des microservices avec nuance, prudence et un vocabulaire précis.',
      es: 'Debatir los límites entre servicios y los compromisos de los microservicios con matices, prudencia y un vocabulario preciso.',
    },
    situation:
      'In an architecture meeting, the team debates whether to split the billing module out of the monolith.',
    situationTranslation: {
      fr: 'Lors d\'une réunion d\'architecture, l\'équipe débat de l\'opportunité d\'extraire le module de facturation du monolithe.',
      es: 'En una reunión de arquitectura, el equipo debate si separar el módulo de facturación del monolito.',
    },
    vocabulary: [
      {
        term: 'bounded context',
        definition: 'A part of the domain with its own model and language, often used to define a service boundary.',
        translation: { fr: 'contexte délimité (bounded context)', es: 'contexto delimitado (bounded context)' },
      },
      {
        term: 'coupling',
        definition: 'How much one component depends on another; tight coupling makes independent changes hard.',
        translation: { fr: 'couplage', es: 'acoplamiento' },
      },
      {
        term: 'eventual consistency',
        definition: 'A model where data across services may differ briefly but converges to the same state over time.',
        translation: { fr: 'cohérence à terme (eventual consistency)', es: 'consistencia eventual' },
      },
      {
        term: 'distributed monolith',
        definition: 'A system split into services that are still so tightly coupled they must be deployed together.',
        translation: { fr: 'monolithe distribué', es: 'monolito distribuido' },
      },
      {
        term: 'operational overhead',
        definition: 'The extra work of running, monitoring and deploying more moving parts.',
        translation: { fr: 'charge opérationnelle', es: 'sobrecarga operativa' },
      },
    ],
    expressions: [
      {
        phrase: "I'm not convinced the boundary is in the right place yet.",
        usage: 'Use this to disagree diplomatically without rejecting the whole idea.',
        translation: {
          fr: 'Je ne suis pas encore convaincu que la frontière soit au bon endroit.',
          es: 'Todavía no estoy convencido de que el límite esté en el sitio correcto.',
        },
      },
      {
        phrase: 'The main trade-off is independent deployments versus more operational overhead.',
        usage: 'Use "the main trade-off is X versus Y" to frame a balanced decision.',
        translation: {
          fr: 'Le principal compromis, c\'est des déploiements indépendants contre plus de charge opérationnelle.',
          es: 'El principal compromiso es tener despliegues independientes a cambio de más sobrecarga operativa.',
        },
      },
      {
        phrase: 'If both services share the same tables, we risk ending up with a distributed monolith.',
        usage: 'Use this to warn about a common architectural anti-pattern.',
        translation: {
          fr: 'Si les deux services partagent les mêmes tables, on risque de se retrouver avec un monolithe distribué.',
          es: 'Si ambos servicios comparten las mismas tablas, corremos el riesgo de acabar con un monolito distribuido.',
        },
      },
      {
        phrase: 'Are we comfortable with eventual consistency for invoices?',
        usage: 'Use this to check whether the business accepts a consequence of the design.',
        translation: {
          fr: 'Est-ce qu\'on est à l\'aise avec une cohérence à terme pour les factures ?',
          es: '¿Nos parece aceptable la consistencia eventual para las facturas?',
        },
      },
      {
        phrase: 'It might be worth starting with a well-defined module inside the monolith.',
        usage: 'Use "it might be worth ..." to propose a cautious alternative.',
        translation: {
          fr: 'Ça vaudrait peut-être la peine de commencer par un module bien délimité à l\'intérieur du monolithe.',
          es: 'Quizá valga la pena empezar con un módulo bien definido dentro del monolito.',
        },
      },
    ],
    dialogue: {
      context: 'Amara, a staff engineer, and Kenji, a team lead, discuss extracting billing into its own service.',
      lines: [
        {
          speaker: 'Kenji',
          text: 'Billing changes every sprint, and every change means redeploying the whole monolith. I think it should be its own service.',
          translation: {
            fr: 'La facturation change à chaque sprint, et chaque changement oblige à redéployer tout le monolithe. Je pense que ça devrait être un service à part.',
            es: 'La facturación cambia en cada sprint, y cada cambio implica volver a desplegar todo el monolito. Creo que debería ser un servicio propio.',
          },
        },
        {
          speaker: 'Amara',
          text: "I see the appeal. My concern is that billing reads the orders tables directly. If we split it as it is, we'd still be tightly coupled.",
          translation: {
            fr: 'Je comprends l\'intérêt. Ce qui m\'inquiète, c\'est que la facturation lit directement les tables de commandes. Si on la sépare telle quelle, on resterait fortement couplés.',
            es: 'Entiendo el atractivo. Lo que me preocupa es que facturación lee directamente las tablas de pedidos. Si la separamos tal cual, seguiríamos muy acoplados.',
          },
        },
        {
          speaker: 'Kenji',
          text: 'So we would need an API or events between orders and billing.',
          translation: {
            fr: 'Donc il nous faudrait une API ou des événements entre les commandes et la facturation.',
            es: 'Entonces necesitaríamos una API o eventos entre pedidos y facturación.',
          },
        },
        {
          speaker: 'Amara',
          text: 'Right, and billing would own its data. That probably means eventual consistency: an invoice could appear a few seconds after the order.',
          translation: {
            fr: 'Exactement, et la facturation posséderait ses propres données. Ça implique sans doute une cohérence à terme : une facture pourrait apparaître quelques secondes après la commande.',
            es: 'Exacto, y facturación sería dueña de sus datos. Eso probablemente implica consistencia eventual: una factura podría aparecer unos segundos después del pedido.',
          },
        },
        {
          speaker: 'Kenji',
          text: "Product said that's acceptable. What else worries you?",
          translation: {
            fr: 'Le Product a dit que c\'était acceptable. Qu\'est-ce qui t\'inquiète d\'autre ?',
            es: 'Producto dijo que eso es aceptable. ¿Qué más te preocupa?',
          },
        },
        {
          speaker: 'Amara',
          text: 'The operational overhead. Another pipeline, more monitoring, and network failures we don\'t have today.',
          translation: {
            fr: 'La charge opérationnelle. Un pipeline de plus, plus de monitoring, et des pannes réseau qu\'on n\'a pas aujourd\'hui.',
            es: 'La sobrecarga operativa. Otro pipeline, más monitorización y fallos de red que hoy no tenemos.',
          },
        },
        {
          speaker: 'Kenji',
          text: 'Fair. What would you suggest?',
          translation: {
            fr: 'C\'est juste. Que proposerais-tu ?',
            es: 'Es justo. ¿Qué propondrías?',
          },
        },
        {
          speaker: 'Amara',
          text: "It might be worth isolating billing as a module first, with its own schema. If the boundary holds for a couple of months, extracting it will be much safer.",
          translation: {
            fr: 'Ça vaudrait peut-être la peine d\'isoler d\'abord la facturation dans un module, avec son propre schéma. Si la frontière tient quelques mois, l\'extraction sera beaucoup plus sûre.',
            es: 'Quizá valga la pena aislar primero facturación como un módulo, con su propio esquema. Si el límite se mantiene un par de meses, extraerlo será mucho más seguro.',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'te-07-q1',
        type: 'choice',
        prompt: 'Two "microservices" share a database and must always be deployed together. What is this called?',
        options: ['A bounded context', 'A distributed monolith', 'Eventual consistency', 'A service mesh'],
        correctIndex: 1,
        explanation: 'A distributed monolith has the costs of distribution without the benefit of independent deployment.',
      },
      {
        id: 'te-07-q2',
        type: 'choice',
        prompt: 'Which sentence disagrees most diplomatically in an architecture meeting?',
        options: [
          'This boundary is wrong.',
          'Microservices are always a bad idea.',
          "I'm not sure the boundary is in the right place yet. Could we look at the data dependencies?",
        ],
        correctIndex: 2,
        explanation: 'Hedging ("I\'m not sure ... yet") plus a constructive question keeps the discussion open and respectful.',
      },
      {
        id: 'te-07-q3',
        type: 'fill',
        prompt: 'The main ___ is faster independent releases versus more operational complexity.',
        options: ['coupling', 'boundary', 'overhead', 'trade-off'],
        correctIndex: 3,
        explanation: 'A "trade-off" is a balance between a benefit and a cost; "the main trade-off is X versus Y" is a common pattern.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // te-08 Event-driven architecture and Kafka
  // ---------------------------------------------------------------------------
  {
    id: 'te-08',
    moduleId: 'technical',
    topic: 'architecture',
    title: 'Event-driven architecture and Kafka',
    titleTranslation: {
      fr: 'Architecture événementielle et Kafka',
      es: 'Arquitectura orientada a eventos y Kafka',
    },
    level: 'advanced',
    premium: true,
    estimatedMinutes: 11,
    roles: ['architect', 'java', 'devops'],
    objective:
      'Explain event-driven designs and Kafka concepts (topics, partitions, consumer groups, delivery guarantees) precisely.',
    objectiveTranslation: {
      fr: 'Expliquer avec précision les architectures événementielles et les concepts de Kafka (topics, partitions, groupes de consommateurs, garanties de livraison).',
      es: 'Explicar con precisión los diseños orientados a eventos y los conceptos de Kafka (topics, particiones, grupos de consumidores, garantías de entrega).',
    },
    situation:
      'After an incident where some customers received duplicate emails, the team reviews how the notification consumer processes events.',
    situationTranslation: {
      fr: 'Après un incident où certains clients ont reçu des e-mails en double, l\'équipe examine la façon dont le consumer de notifications traite les événements.',
      es: 'Tras un incidente en el que algunos clientes recibieron correos duplicados, el equipo revisa cómo el consumer de notificaciones procesa los eventos.',
    },
    vocabulary: [
      {
        term: 'topic',
        definition: 'A named stream in Kafka where producers write events and consumers read them.',
        translation: { fr: 'topic', es: 'topic' },
      },
      {
        term: 'partition',
        definition: 'An ordered, append-only log that a topic is split into; order is guaranteed only within a partition.',
        translation: { fr: 'partition', es: 'partición' },
      },
      {
        term: 'consumer group',
        definition: 'A set of consumers that share the work of reading a topic, each partition being read by one member.',
        translation: { fr: 'groupe de consommateurs (consumer group)', es: 'grupo de consumidores (consumer group)' },
      },
      {
        term: 'offset',
        definition: 'The position of an event in a partition, which a consumer commits to record its progress.',
        translation: { fr: 'offset (position)', es: 'offset (posición)' },
      },
      {
        term: 'at-least-once delivery',
        definition: 'A guarantee that every event is processed, but some may be processed more than once.',
        translation: { fr: 'livraison au moins une fois (at-least-once)', es: 'entrega al menos una vez (at-least-once)' },
      },
    ],
    expressions: [
      {
        phrase: 'The order service publishes an OrderPlaced event, and the other services react to it.',
        usage: 'Use this to describe the basic producer/consumer flow without tight coupling.',
        translation: {
          fr: 'Le service de commandes publie un événement OrderPlaced, et les autres services y réagissent.',
          es: 'El servicio de pedidos publica un evento OrderPlaced y los demás servicios reaccionan a él.',
        },
      },
      {
        phrase: 'We key the messages by order ID, so all events for one order land in the same partition.',
        usage: 'Use this to explain how you preserve ordering for a given entity.',
        translation: {
          fr: 'On utilise l\'ID de commande comme clé des messages, donc tous les événements d\'une commande arrivent dans la même partition.',
          es: 'Usamos el ID del pedido como clave de los mensajes, así que todos los eventos de un pedido caen en la misma partición.',
        },
      },
      {
        phrase: 'Since delivery is at-least-once, the consumer needs to be idempotent.',
        usage: 'Use this to connect a delivery guarantee to a design requirement.',
        translation: {
          fr: 'Comme la livraison est au moins une fois, le consumer doit être idempotent.',
          es: 'Como la entrega es al menos una vez, el consumer tiene que ser idempotente.',
        },
      },
      {
        phrase: 'The consumer crashed before committing the offset, so it reprocessed the batch.',
        usage: 'Use this to explain the root cause of duplicate processing.',
        translation: {
          fr: 'Le consumer a planté avant de commiter l\'offset, donc il a retraité le lot.',
          es: 'El consumer se cayó antes de hacer commit del offset, así que volvió a procesar el lote.',
        },
      },
      {
        phrase: "Adding consumers won't help beyond the number of partitions.",
        usage: 'Use this to explain a scaling limit of consumer groups.',
        translation: {
          fr: 'Ajouter des consumers ne servira à rien au-delà du nombre de partitions.',
          es: 'Añadir consumers no ayudará más allá del número de particiones.',
        },
      },
    ],
    dialogue: {
      context: 'Tom and Priya review the root cause of duplicate notification emails during a post-incident meeting.',
      lines: [
        {
          speaker: 'Priya',
          text: 'So, what caused the duplicate emails yesterday?',
          translation: {
            fr: 'Alors, qu\'est-ce qui a causé les e-mails en double hier ?',
            es: 'Entonces, ¿qué causó los correos duplicados de ayer?',
          },
        },
        {
          speaker: 'Tom',
          text: 'One of the notification consumers was restarted during a deployment. It had sent the emails but hadn\'t committed its offsets yet.',
          translation: {
            fr: 'Un des consumers de notifications a été redémarré pendant un déploiement. Il avait envoyé les e-mails mais n\'avait pas encore commité ses offsets.',
            es: 'Uno de los consumers de notificaciones se reinició durante un despliegue. Había enviado los correos, pero aún no había hecho commit de sus offsets.',
          },
        },
        {
          speaker: 'Priya',
          text: 'So after the rebalance, another consumer in the group picked up those partitions and reprocessed the same events.',
          translation: {
            fr: 'Donc après le rééquilibrage, un autre consumer du groupe a récupéré ces partitions et a retraité les mêmes événements.',
            es: 'Entonces, tras el rebalanceo, otro consumer del grupo tomó esas particiones y volvió a procesar los mismos eventos.',
          },
        },
        {
          speaker: 'Tom',
          text: "Exactly. That's expected with at-least-once delivery. The real issue is that our consumer isn't idempotent.",
          translation: {
            fr: 'Exactement. C\'est normal avec une livraison au moins une fois. Le vrai problème, c\'est que notre consumer n\'est pas idempotent.',
            es: 'Exacto. Es lo esperado con entrega al menos una vez. El problema real es que nuestro consumer no es idempotente.',
          },
        },
        {
          speaker: 'Priya',
          text: 'Could we switch to exactly-once instead?',
          translation: {
            fr: 'On ne pourrait pas passer à exactly-once à la place ?',
            es: '¿Podríamos cambiar a exactly-once en su lugar?',
          },
        },
        {
          speaker: 'Tom',
          text: "Kafka's exactly-once semantics only cover reads and writes within Kafka. Sending an email is an external side effect, so it wouldn't fully solve this.",
          translation: {
            fr: 'Les garanties exactly-once de Kafka ne couvrent que les lectures et écritures dans Kafka. Envoyer un e-mail est un effet externe, donc ça ne réglerait pas complètement le problème.',
            es: 'La semántica exactly-once de Kafka solo cubre lecturas y escrituras dentro de Kafka. Enviar un correo es un efecto externo, así que no lo resolvería del todo.',
          },
        },
        {
          speaker: 'Priya',
          text: 'Then I suggest we store the event ID before sending and skip any event we have already handled.',
          translation: {
            fr: 'Dans ce cas, je propose qu\'on enregistre l\'ID de l\'événement avant l\'envoi et qu\'on ignore tout événement déjà traité.',
            es: 'Entonces propongo que guardemos el ID del evento antes de enviar y que ignoremos cualquier evento ya procesado.',
          },
        },
        {
          speaker: 'Tom',
          text: "Agreed. I'll write that up as the main action item, with a deduplication table keyed by event ID.",
          translation: {
            fr: 'D\'accord. Je le note comme action principale, avec une table de déduplication indexée par ID d\'événement.',
            es: 'De acuerdo. Lo apunto como acción principal, con una tabla de deduplicación con el ID del evento como clave.',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'te-08-q1',
        type: 'choice',
        prompt: 'In Kafka, where is message order guaranteed?',
        options: [
          'Across all partitions of a topic',
          'Across all topics in the cluster',
          'Within a single partition',
          'Only inside a consumer group',
        ],
        correctIndex: 2,
        explanation: 'Kafka guarantees order only within a partition, which is why related events share the same key.',
      },
      {
        id: 'te-08-q2',
        type: 'fill',
        prompt: 'Because delivery is at-least-once, the consumer must be ___ so duplicates cause no harm.',
        options: ['idempotent', 'partitioned', 'synchronous'],
        correctIndex: 0,
        explanation: 'An idempotent consumer can process the same event twice with the same result as processing it once.',
      },
      {
        id: 'te-08-q3',
        type: 'choice',
        prompt: 'A topic has 6 partitions and the consumer group has 10 consumers. What happens?',
        options: [
          'All 10 consumers share each partition equally.',
          'Only 6 consumers receive partitions; 4 stay idle.',
          'Kafka automatically creates 4 new partitions.',
        ],
        correctIndex: 1,
        explanation: 'Each partition is assigned to one consumer in the group, so consumers beyond the partition count stay idle.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // te-09 Databases and SQL
  // ---------------------------------------------------------------------------
  {
    id: 'te-09',
    moduleId: 'technical',
    topic: 'data',
    title: 'Databases and SQL',
    titleTranslation: {
      fr: 'Bases de données et SQL',
      es: 'Bases de datos y SQL',
    },
    level: 'intermediate',
    premium: true,
    estimatedMinutes: 9,
    roles: ['any', 'java', 'fullstack', 'qa'],
    objective:
      'Talk about tables, queries, joins, indexes and transactions when debugging a slow query.',
    objectiveTranslation: {
      fr: 'Parler de tables, de requêtes, de jointures, d\'index et de transactions en déboguant une requête lente.',
      es: 'Hablar de tablas, consultas, joins, índices y transacciones al depurar una consulta lenta.',
    },
    situation:
      'The orders report has become very slow, and you investigate the SQL query with a colleague.',
    situationTranslation: {
      fr: 'Le rapport des commandes est devenu très lent, et vous analysez la requête SQL avec un collègue.',
      es: 'El informe de pedidos se ha vuelto muy lento e investigas la consulta SQL con un compañero.',
    },
    vocabulary: [
      {
        term: 'primary key',
        definition: 'A column, or set of columns, that uniquely identifies each row in a table.',
        translation: { fr: 'clé primaire', es: 'clave primaria' },
      },
      {
        term: 'foreign key',
        definition: 'A column that references the primary key of another table to link related rows.',
        translation: { fr: 'clé étrangère', es: 'clave foránea' },
      },
      {
        term: 'join',
        definition: 'A query operation that combines rows from two or more tables based on a related column.',
        translation: { fr: 'jointure (join)', es: 'join (combinación)' },
      },
      {
        term: 'index',
        definition: 'A data structure that helps the database find rows quickly without scanning the whole table.',
        translation: { fr: 'index', es: 'índice' },
      },
      {
        term: 'execution plan',
        definition: 'The steps the database chooses to run a query, shown with a command such as EXPLAIN.',
        translation: { fr: 'plan d\'exécution', es: 'plan de ejecución' },
      },
    ],
    expressions: [
      {
        phrase: 'The query joins orders with customers on customer_id.',
        usage: 'Use "joins X with Y on column" to describe a join clearly.',
        translation: {
          fr: 'La requête fait une jointure entre orders et customers sur customer_id.',
          es: 'La consulta hace un join de orders con customers por customer_id.',
        },
      },
      {
        phrase: "It's doing a full table scan because there's no index on created_at.",
        usage: 'Use this to explain why a query is slow after reading the execution plan.',
        translation: {
          fr: 'Elle fait un parcours complet de la table parce qu\'il n\'y a pas d\'index sur created_at.',
          es: 'Está haciendo un escaneo completo de la tabla porque no hay índice en created_at.',
        },
      },
      {
        phrase: "Let's run EXPLAIN and see what the planner is doing.",
        usage: 'Use this to propose checking the execution plan before guessing.',
        translation: {
          fr: 'Lançons EXPLAIN pour voir ce que fait le planificateur.',
          es: 'Ejecutemos EXPLAIN y veamos qué está haciendo el planificador.',
        },
      },
      {
        phrase: 'An index will speed up reads, but it adds a small cost to every write.',
        usage: 'Use this to mention the trade-off of adding an index.',
        translation: {
          fr: 'Un index accélérera les lectures, mais il ajoute un petit coût à chaque écriture.',
          es: 'Un índice acelerará las lecturas, pero añade un pequeño coste a cada escritura.',
        },
      },
      {
        phrase: 'We should wrap both updates in a transaction.',
        usage: 'Use this when several changes must succeed or fail together.',
        translation: {
          fr: 'On devrait regrouper les deux mises à jour dans une transaction.',
          es: 'Deberíamos envolver ambas actualizaciones en una transacción.',
        },
      },
    ],
    dialogue: {
      context: 'Marco and Lucía look at why the monthly orders report now takes almost a minute to load.',
      lines: [
        {
          speaker: 'Lucía',
          text: 'The monthly report used to load in two seconds. Now it takes almost a minute.',
          translation: {
            fr: 'Le rapport mensuel se chargeait en deux secondes. Maintenant, il met presque une minute.',
            es: 'El informe mensual antes cargaba en dos segundos. Ahora tarda casi un minuto.',
          },
        },
        {
          speaker: 'Marco',
          text: "The orders table has grown a lot. Let's run EXPLAIN ANALYZE on the query.",
          translation: {
            fr: 'La table orders a beaucoup grossi. Lançons EXPLAIN ANALYZE sur la requête.',
            es: 'La tabla orders ha crecido mucho. Ejecutemos EXPLAIN ANALYZE sobre la consulta.',
          },
        },
        {
          speaker: 'Lucía',
          text: 'It filters orders by created_at and joins them with customers on customer_id.',
          translation: {
            fr: 'Elle filtre les commandes par created_at et fait une jointure avec customers sur customer_id.',
            es: 'Filtra los pedidos por created_at y hace un join con customers por customer_id.',
          },
        },
        {
          speaker: 'Marco',
          text: "Look here: a sequential scan on orders. There's no index on created_at, so it reads every row.",
          translation: {
            fr: 'Regarde ici : un parcours séquentiel sur orders. Il n\'y a pas d\'index sur created_at, donc elle lit toutes les lignes.',
            es: 'Mira aquí: un escaneo secuencial en orders. No hay índice en created_at, así que lee todas las filas.',
          },
        },
        {
          speaker: 'Lucía',
          text: 'Should we add an index on created_at, then?',
          translation: {
            fr: 'On devrait ajouter un index sur created_at, alors ?',
            es: 'Entonces, ¿añadimos un índice en created_at?',
          },
        },
        {
          speaker: 'Marco',
          text: 'Yes. It will slow down inserts a little, but this table is read far more often than it\'s written.',
          translation: {
            fr: 'Oui. Ça ralentira un peu les insertions, mais cette table est beaucoup plus lue qu\'écrite.',
            es: 'Sí. Ralentizará un poco las inserciones, pero esta tabla se lee mucho más de lo que se escribe.',
          },
        },
        {
          speaker: 'Lucía',
          text: 'Can we create it in production without locking the table?',
          translation: {
            fr: 'On peut le créer en production sans verrouiller la table ?',
            es: '¿Podemos crearlo en producción sin bloquear la tabla?',
          },
        },
        {
          speaker: 'Marco',
          text: "In PostgreSQL, yes, with CREATE INDEX CONCURRENTLY. It takes longer, but writes aren't blocked.",
          translation: {
            fr: 'Avec PostgreSQL, oui, avec CREATE INDEX CONCURRENTLY. C\'est plus long, mais les écritures ne sont pas bloquées.',
            es: 'En PostgreSQL, sí, con CREATE INDEX CONCURRENTLY. Tarda más, pero no bloquea las escrituras.',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'te-09-q1',
        type: 'fill',
        prompt: 'The query is slow because the database is doing a full table ___.',
        options: ['join', 'scan', 'key', 'commit'],
        correctIndex: 1,
        explanation: 'A "full table scan" means the database reads every row because no suitable index exists.',
      },
      {
        id: 'te-09-q2',
        type: 'choice',
        prompt: 'What is the main cost of adding an index?',
        options: [
          'Writes become slightly slower and the index uses extra storage.',
          'The table can no longer be joined.',
          'Reads become slower.',
        ],
        correctIndex: 0,
        explanation: 'Every insert, update or delete must also update the index, and the index takes disk space.',
      },
      {
        id: 'te-09-q3',
        type: 'choice',
        prompt: 'The column orders.customer_id points to customers.id. What is orders.customer_id?',
        options: ['A primary key', 'An execution plan', 'An index scan', 'A foreign key'],
        correctIndex: 3,
        explanation: 'A foreign key references the primary key of another table to link related rows.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // te-10 Git
  // ---------------------------------------------------------------------------
  {
    id: 'te-10',
    moduleId: 'technical',
    topic: 'tools',
    title: 'Git: branches, commits and merge conflicts',
    titleTranslation: {
      fr: 'Git : branches, commits et conflits de merge',
      es: 'Git: ramas, commits y conflictos de merge',
    },
    level: 'beginner',
    premium: false,
    estimatedMinutes: 7,
    roles: ['any', 'student'],
    objective:
      'Talk about your Git work: branches, commits, pushing, pulling and fixing merge conflicts.',
    objectiveTranslation: {
      fr: 'Parler de votre travail avec Git : branches, commits, push, pull et résolution des conflits de merge.',
      es: 'Hablar de tu trabajo con Git: ramas, commits, push, pull y resolución de conflictos de merge.',
    },
    situation:
      'You try to merge your feature branch and Git reports a conflict. You ask a teammate for help.',
    situationTranslation: {
      fr: 'Vous essayez de merger votre branche de fonctionnalité et Git signale un conflit. Vous demandez de l\'aide à un collègue.',
      es: 'Intentas hacer merge de tu rama de funcionalidad y Git muestra un conflicto. Le pides ayuda a un compañero.',
    },
    vocabulary: [
      {
        term: 'branch',
        definition: 'A separate line of work in a repository, so you can change code without affecting main.',
        translation: { fr: 'branche', es: 'rama' },
      },
      {
        term: 'commit',
        definition: 'A saved snapshot of your changes, with a message that explains them.',
        translation: { fr: 'commit', es: 'commit' },
      },
      {
        term: 'push',
        definition: 'To send your local commits to the remote repository.',
        translation: { fr: 'pousser (push)', es: 'subir (push)' },
      },
      {
        term: 'pull',
        definition: 'To download new commits from the remote repository and merge them into your branch.',
        translation: { fr: 'récupérer (pull)', es: 'traer (pull)' },
      },
      {
        term: 'merge conflict',
        definition: 'When Git cannot combine two changes automatically because they touch the same lines.',
        translation: { fr: 'conflit de merge', es: 'conflicto de merge' },
      },
    ],
    expressions: [
      {
        phrase: "I'll create a new branch for this feature.",
        usage: 'Use this when you start new work.',
        translation: {
          fr: 'Je vais créer une nouvelle branche pour cette fonctionnalité.',
          es: 'Voy a crear una nueva rama para esta funcionalidad.',
        },
      },
      {
        phrase: "I've committed my changes but I haven't pushed them yet.",
        usage: 'Use this to explain that your work is saved locally only.',
        translation: {
          fr: 'J\'ai commité mes changements, mais je ne les ai pas encore poussés.',
          es: 'He hecho commit de mis cambios, pero todavía no los he subido.',
        },
      },
      {
        phrase: 'I have a merge conflict in the config file.',
        usage: 'Use this to tell a teammate exactly where the problem is.',
        translation: {
          fr: 'J\'ai un conflit de merge dans le fichier de config.',
          es: 'Tengo un conflicto de merge en el archivo de configuración.',
        },
      },
      {
        phrase: 'Pull the latest changes from main before you start.',
        usage: 'Use this to give simple advice that reduces conflicts.',
        translation: {
          fr: 'Fais un pull des derniers changements de main avant de commencer.',
          es: 'Haz pull de los últimos cambios de main antes de empezar.',
        },
      },
      {
        phrase: 'Which version should we keep, yours or mine?',
        usage: 'Use this when two people changed the same lines.',
        translation: {
          fr: 'Quelle version on garde, la tienne ou la mienne ?',
          es: '¿Qué versión dejamos, la tuya o la mía?',
        },
      },
    ],
    dialogue: {
      context: 'Tom, a student intern, asks Priya for help with his first merge conflict.',
      lines: [
        {
          speaker: 'Tom',
          text: 'Priya, do you have a minute? I have a merge conflict and I\'m not sure what to do.',
          translation: {
            fr: 'Priya, tu as une minute ? J\'ai un conflit de merge et je ne sais pas trop quoi faire.',
            es: 'Priya, ¿tienes un minuto? Tengo un conflicto de merge y no sé muy bien qué hacer.',
          },
        },
        {
          speaker: 'Priya',
          text: 'Sure. Which file is it in?',
          translation: {
            fr: 'Bien sûr. C\'est dans quel fichier ?',
            es: 'Claro. ¿En qué archivo está?',
          },
        },
        {
          speaker: 'Tom',
          text: 'In header.css. I pulled main into my branch and Git stopped.',
          translation: {
            fr: 'Dans header.css. J\'ai fait un pull de main dans ma branche et Git s\'est arrêté.',
            es: 'En header.css. Hice pull de main en mi rama y Git se detuvo.',
          },
        },
        {
          speaker: 'Priya',
          text: 'OK. Open the file. The part between the markers shows your version and the version from main.',
          translation: {
            fr: 'D\'accord. Ouvre le fichier. La partie entre les marqueurs montre ta version et celle de main.',
            es: 'Vale. Abre el archivo. La parte entre los marcadores muestra tu versión y la de main.',
          },
        },
        {
          speaker: 'Tom',
          text: 'I see. Someone changed the same color that I changed.',
          translation: {
            fr: 'Je vois. Quelqu\'un a changé la même couleur que moi.',
            es: 'Ya veo. Alguien cambió el mismo color que yo.',
          },
        },
        {
          speaker: 'Priya',
          text: 'Which version is correct? Check the design ticket.',
          translation: {
            fr: 'Quelle version est la bonne ? Vérifie le ticket de design.',
            es: '¿Qué versión es la correcta? Revisa el ticket de diseño.',
          },
        },
        {
          speaker: 'Tom',
          text: 'Mine is correct. So I delete the other lines and the markers?',
          translation: {
            fr: 'C\'est la mienne. Donc je supprime les autres lignes et les marqueurs ?',
            es: 'La mía es la correcta. ¿Entonces borro las otras líneas y los marcadores?',
          },
        },
        {
          speaker: 'Priya',
          text: 'Yes. Then add the file, commit, and push your branch again.',
          translation: {
            fr: 'Oui. Ensuite, ajoute le fichier, fais un commit et pousse de nouveau ta branche.',
            es: 'Sí. Luego añade el archivo, haz commit y vuelve a subir tu rama.',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'te-10-q1',
        type: 'fill',
        prompt: "I've committed my changes, but I haven't ___ them to the remote yet.",
        options: ['pulled', 'branched', 'pushed', 'merged'],
        correctIndex: 2,
        explanation: 'You "push" local commits to the remote repository so others can see them.',
      },
      {
        id: 'te-10-q2',
        type: 'choice',
        prompt: 'When does a merge conflict usually happen?',
        options: [
          'When two branches change the same lines of the same file',
          'When you create a new branch',
          'When you write a long commit message',
        ],
        correctIndex: 0,
        explanation: 'Git cannot decide automatically which change to keep when both sides edit the same lines.',
      },
      {
        id: 'te-10-q3',
        type: 'choice',
        prompt: 'What is good advice to reduce merge conflicts?',
        options: [
          'Never commit until the feature is finished.',
          'Pull the latest changes from main often.',
          'Work directly on main.',
          'Delete the remote repository.',
        ],
        correctIndex: 1,
        explanation: 'Pulling main often keeps your branch close to the latest code, so conflicts are smaller and easier to fix.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // te-11 CI/CD
  // ---------------------------------------------------------------------------
  {
    id: 'te-11',
    moduleId: 'technical',
    topic: 'devops',
    title: 'CI/CD pipelines',
    titleTranslation: {
      fr: 'Pipelines CI/CD',
      es: 'Pipelines de CI/CD',
    },
    level: 'intermediate',
    premium: true,
    estimatedMinutes: 9,
    roles: ['devops', 'any', 'qa'],
    objective:
      'Describe the stages of a CI/CD pipeline and talk about failed builds, flaky tests and deployments.',
    objectiveTranslation: {
      fr: 'Décrire les étapes d\'un pipeline CI/CD et parler de builds en échec, de tests instables et de déploiements.',
      es: 'Describir las etapas de un pipeline de CI/CD y hablar de builds fallidos, tests inestables y despliegues.',
    },
    situation:
      'Your pull request is blocked because the pipeline failed, and you discuss it with the DevOps engineer.',
    situationTranslation: {
      fr: 'Votre pull request est bloquée parce que le pipeline a échoué, et vous en parlez avec l\'ingénieure DevOps.',
      es: 'Tu pull request está bloqueada porque el pipeline ha fallado y lo hablas con la ingeniera DevOps.',
    },
    vocabulary: [
      {
        term: 'continuous integration',
        definition: 'The practice of merging code often and automatically building and testing every change.',
        translation: { fr: 'intégration continue', es: 'integración continua' },
      },
      {
        term: 'continuous delivery',
        definition: 'Keeping the code always ready to release, with deployments that are automated and repeatable.',
        translation: { fr: 'livraison continue', es: 'entrega continua' },
      },
      {
        term: 'stage',
        definition: 'One step of a pipeline, such as build, test or deploy.',
        translation: { fr: 'étape (stage)', es: 'etapa (stage)' },
      },
      {
        term: 'flaky test',
        definition: 'A test that sometimes passes and sometimes fails without any code change.',
        translation: { fr: 'test instable (flaky)', es: 'test inestable (flaky)' },
      },
      {
        term: 'artifact',
        definition: 'A file produced by the build, such as a JAR or a Docker image, that later stages deploy.',
        translation: { fr: 'artefact', es: 'artefacto' },
      },
    ],
    expressions: [
      {
        phrase: 'The pipeline failed at the test stage.',
        usage: 'Use this to say exactly where a pipeline broke.',
        translation: {
          fr: 'Le pipeline a échoué à l\'étape de test.',
          es: 'El pipeline ha fallado en la etapa de test.',
        },
      },
      {
        phrase: "This test is flaky. It passed when I re-ran the job.",
        usage: 'Use this to report an unreliable test, ideally with evidence.',
        translation: {
          fr: 'Ce test est instable. Il est passé quand j\'ai relancé le job.',
          es: 'Este test es inestable. Pasó cuando volví a ejecutar el job.',
        },
      },
      {
        phrase: 'Every merge to main triggers a deployment to staging.',
        usage: 'Use this to describe what starts a pipeline and where it deploys.',
        translation: {
          fr: 'Chaque merge sur main déclenche un déploiement en staging.',
          es: 'Cada merge a main dispara un despliegue en staging.',
        },
      },
      {
        phrase: 'We build the artifact once and promote the same one to production.',
        usage: 'Use this to explain a reliable delivery practice.',
        translation: {
          fr: 'On construit l\'artefact une seule fois et on promeut ce même artefact en production.',
          es: 'Construimos el artefacto una sola vez y promovemos ese mismo artefacto a producción.',
        },
      },
      {
        phrase: 'Can we add a manual approval step before prod?',
        usage: 'Use this to suggest a safety gate in the pipeline.',
        translation: {
          fr: 'On peut ajouter une étape de validation manuelle avant la prod ?',
          es: '¿Podemos añadir un paso de aprobación manual antes de producción?',
        },
      },
    ],
    dialogue: {
      context: 'Kenji\'s pull request is blocked by a red pipeline, so he messages Amara from the platform team.',
      lines: [
        {
          speaker: 'Kenji',
          text: "Hi Amara, my PR is blocked. The pipeline failed at the test stage, but I didn't touch that code.",
          translation: {
            fr: 'Salut Amara, ma PR est bloquée. Le pipeline a échoué à l\'étape de test, mais je n\'ai pas touché à ce code.',
            es: 'Hola Amara, mi PR está bloqueada. El pipeline falló en la etapa de test, pero no toqué ese código.',
          },
        },
        {
          speaker: 'Amara',
          text: 'Which test failed?',
          translation: {
            fr: 'Quel test a échoué ?',
            es: '¿Qué test falló?',
          },
        },
        {
          speaker: 'Kenji',
          text: 'PaymentTimeoutTest. I re-ran the job and it passed the second time.',
          translation: {
            fr: 'PaymentTimeoutTest. J\'ai relancé le job et il est passé la deuxième fois.',
            es: 'PaymentTimeoutTest. Volví a ejecutar el job y pasó la segunda vez.',
          },
        },
        {
          speaker: 'Amara',
          text: "Yeah, that one is flaky. It depends on timing, so it fails when the runners are busy. There's already a ticket to fix it.",
          translation: {
            fr: 'Oui, celui-là est instable. Il dépend du timing, donc il échoue quand les runners sont chargés. Il y a déjà un ticket pour le corriger.',
            es: 'Sí, ese es inestable. Depende de los tiempos, así que falla cuando los runners están ocupados. Ya hay un ticket para arreglarlo.',
          },
        },
        {
          speaker: 'Kenji',
          text: 'Good to know. Once I merge, does it go straight to production?',
          translation: {
            fr: 'Bon à savoir. Une fois que je merge, ça part directement en production ?',
            es: 'Es bueno saberlo. Cuando haga merge, ¿va directamente a producción?',
          },
        },
        {
          speaker: 'Amara',
          text: 'No. Every merge to main builds a Docker image and deploys it to staging automatically.',
          translation: {
            fr: 'Non. Chaque merge sur main construit une image Docker et la déploie automatiquement en staging.',
            es: 'No. Cada merge a main construye una imagen Docker y la despliega automáticamente en staging.',
          },
        },
        {
          speaker: 'Kenji',
          text: 'And production?',
          translation: {
            fr: 'Et la production ?',
            es: '¿Y producción?',
          },
        },
        {
          speaker: 'Amara',
          text: 'After the smoke tests pass, someone approves the release, and the same image is promoted to prod.',
          translation: {
            fr: 'Une fois les smoke tests passés, quelqu\'un valide la release, et la même image est promue en prod.',
            es: 'Cuando pasan los smoke tests, alguien aprueba la release y la misma imagen se promueve a producción.',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'te-11-q1',
        type: 'choice',
        prompt: 'A test fails, then passes when you re-run the job without changing anything. What is it?',
        options: ['A smoke test', 'A flaky test', 'An artifact', 'A stage'],
        correctIndex: 1,
        explanation: 'A flaky test gives different results without any code change, often because of timing or shared state.',
      },
      {
        id: 'te-11-q2',
        type: 'fill',
        prompt: 'Every merge to main ___ a new build and a deployment to staging.',
        options: ['triggers', 'approves', 'reverts'],
        correctIndex: 0,
        explanation: 'An event such as a merge "triggers" (starts) a pipeline run.',
      },
      {
        id: 'te-11-q3',
        type: 'choice',
        prompt: 'Why do teams build the artifact once and promote the same one to production?',
        options: [
          'To make the build stage slower and safer.',
          'Because production cannot run tests.',
          'So that what was tested in staging is exactly what runs in production.',
        ],
        correctIndex: 2,
        explanation: 'Rebuilding for each environment could produce a different artifact; promoting one artifact keeps releases consistent.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // te-12 Docker
  // ---------------------------------------------------------------------------
  {
    id: 'te-12',
    moduleId: 'technical',
    topic: 'devops',
    title: 'Docker: images and containers',
    titleTranslation: {
      fr: 'Docker : images et conteneurs',
      es: 'Docker: imágenes y contenedores',
    },
    level: 'intermediate',
    premium: true,
    estimatedMinutes: 9,
    roles: ['devops', 'fullstack', 'java'],
    objective:
      'Explain the difference between images and containers and talk about Dockerfiles, layers, ports and volumes.',
    objectiveTranslation: {
      fr: 'Expliquer la différence entre images et conteneurs et parler de Dockerfiles, de couches, de ports et de volumes.',
      es: 'Explicar la diferencia entre imágenes y contenedores y hablar de Dockerfiles, capas, puertos y volúmenes.',
    },
    situation:
      'A colleague cannot reach the app running in a container on their laptop, and the image is very large.',
    situationTranslation: {
      fr: 'Une collègue n\'arrive pas à accéder à l\'application qui tourne dans un conteneur sur son ordinateur, et l\'image est très lourde.',
      es: 'Una compañera no consigue acceder a la aplicación que se ejecuta en un contenedor en su portátil, y la imagen es muy pesada.',
    },
    vocabulary: [
      {
        term: 'image',
        definition: 'A read-only template that contains an application and everything it needs to run.',
        translation: { fr: 'image', es: 'imagen' },
      },
      {
        term: 'container',
        definition: 'A running, isolated instance of an image.',
        translation: { fr: 'conteneur', es: 'contenedor' },
      },
      {
        term: 'Dockerfile',
        definition: 'A text file with the instructions used to build an image.',
        translation: { fr: 'Dockerfile', es: 'Dockerfile' },
      },
      {
        term: 'layer',
        definition: 'A cached, read-only step of an image, created by an instruction such as RUN or COPY.',
        translation: { fr: 'couche (layer)', es: 'capa (layer)' },
      },
      {
        term: 'volume',
        definition: 'Storage managed outside the container so data survives when the container is removed.',
        translation: { fr: 'volume', es: 'volumen' },
      },
    ],
    expressions: [
      {
        phrase: 'The image is the template; the container is what actually runs.',
        usage: 'Use this to explain the core difference simply.',
        translation: {
          fr: 'L\'image, c\'est le modèle ; le conteneur, c\'est ce qui s\'exécute réellement.',
          es: 'La imagen es la plantilla; el contenedor es lo que realmente se ejecuta.',
        },
      },
      {
        phrase: 'You need to map the container port to a port on your machine.',
        usage: 'Use this when someone cannot reach an app running in a container.',
        translation: {
          fr: 'Il faut mapper le port du conteneur sur un port de ta machine.',
          es: 'Tienes que mapear el puerto del contenedor a un puerto de tu máquina.',
        },
      },
      {
        phrase: 'If we copy the dependency files first, Docker can cache that layer.',
        usage: 'Use this to suggest faster builds by ordering Dockerfile instructions.',
        translation: {
          fr: 'Si on copie d\'abord les fichiers de dépendances, Docker peut mettre cette couche en cache.',
          es: 'Si copiamos primero los archivos de dependencias, Docker puede cachear esa capa.',
        },
      },
      {
        phrase: 'A multi-stage build would make the final image much smaller.',
        usage: 'Use this to propose separating the build tools from the runtime image.',
        translation: {
          fr: 'Un build multi-stage rendrait l\'image finale beaucoup plus légère.',
          es: 'Un build multi-stage haría que la imagen final fuera mucho más pequeña.',
        },
      },
      {
        phrase: "Don't store data inside the container; use a volume.",
        usage: 'Use this to warn that container file systems are temporary.',
        translation: {
          fr: 'Ne stocke pas de données dans le conteneur ; utilise un volume.',
          es: 'No guardes datos dentro del contenedor; usa un volumen.',
        },
      },
    ],
    dialogue: {
      context: 'Lucía helps Marco, who is running the API in Docker locally for the first time.',
      lines: [
        {
          speaker: 'Marco',
          text: "The container is running, but I can't open localhost:8080 in my browser.",
          translation: {
            fr: 'Le conteneur tourne, mais je n\'arrive pas à ouvrir localhost:8080 dans mon navigateur.',
            es: 'El contenedor está en marcha, pero no puedo abrir localhost:8080 en el navegador.',
          },
        },
        {
          speaker: 'Lucía',
          text: 'Did you publish the port? The app listens on 8080 inside the container, but that is not exposed to your machine by default.',
          translation: {
            fr: 'Tu as publié le port ? L\'appli écoute sur 8080 dans le conteneur, mais ce port n\'est pas exposé sur ta machine par défaut.',
            es: '¿Publicaste el puerto? La app escucha en el 8080 dentro del contenedor, pero por defecto no está expuesto a tu máquina.',
          },
        },
        {
          speaker: 'Marco',
          text: 'Ah, I forgot the -p flag. So I run it with -p 8080:8080?',
          translation: {
            fr: 'Ah, j\'ai oublié l\'option -p. Donc je le lance avec -p 8080:8080 ?',
            es: 'Ah, olvidé la opción -p. ¿Entonces lo ejecuto con -p 8080:8080?',
          },
        },
        {
          speaker: 'Lucía',
          text: 'Exactly: host port first, then container port. By the way, why is the image almost two gigabytes?',
          translation: {
            fr: 'Exactement : le port de l\'hôte d\'abord, puis celui du conteneur. Au fait, pourquoi l\'image fait presque deux gigaoctets ?',
            es: 'Exacto: primero el puerto del host y luego el del contenedor. Por cierto, ¿por qué la imagen ocupa casi dos gigas?',
          },
        },
        {
          speaker: 'Marco',
          text: 'It includes the full JDK and Maven, because we build the JAR inside the image.',
          translation: {
            fr: 'Elle contient tout le JDK et Maven, parce qu\'on construit le JAR dans l\'image.',
            es: 'Incluye todo el JDK y Maven, porque construimos el JAR dentro de la imagen.',
          },
        },
        {
          speaker: 'Lucía',
          text: 'A multi-stage build would fix that. Build in the first stage, then copy only the JAR into a small runtime image.',
          translation: {
            fr: 'Un build multi-stage réglerait ça. On construit dans la première étape, puis on copie seulement le JAR dans une petite image d\'exécution.',
            es: 'Un build multi-stage lo resolvería. Construyes en la primera etapa y luego copias solo el JAR a una imagen de ejecución pequeña.',
          },
        },
        {
          speaker: 'Marco',
          text: 'Nice. And the builds are slow too. Maven downloads everything every time.',
          translation: {
            fr: 'Super. Et les builds sont lents aussi. Maven retélécharge tout à chaque fois.',
            es: 'Genial. Y los builds también son lentos. Maven descarga todo cada vez.',
          },
        },
        {
          speaker: 'Lucía',
          text: 'Copy pom.xml and download the dependencies before you copy the source code. Then that layer stays cached until the dependencies change.',
          translation: {
            fr: 'Copie pom.xml et télécharge les dépendances avant de copier le code source. Comme ça, cette couche reste en cache tant que les dépendances ne changent pas.',
            es: 'Copia pom.xml y descarga las dependencias antes de copiar el código fuente. Así esa capa se queda en caché hasta que cambien las dependencias.',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'te-12-q1',
        type: 'choice',
        prompt: 'Which sentence correctly describes images and containers?',
        options: [
          'A container is a template; an image is a running process.',
          'An image is a read-only template; a container is a running instance of it.',
          'Images and containers are the same thing.',
        ],
        correctIndex: 1,
        explanation: 'You build an image once and can start many containers from it.',
      },
      {
        id: 'te-12-q2',
        type: 'fill',
        prompt: 'To keep the database data when the container is removed, store it in a ___.',
        options: ['layer', 'Dockerfile', 'port', 'volume'],
        correctIndex: 3,
        explanation: 'A volume lives outside the container\'s writable layer, so its data survives container removal.',
      },
      {
        id: 'te-12-q3',
        type: 'choice',
        prompt: 'In "docker run -p 3000:8080 my-app", what does 3000 refer to?',
        options: [
          'The port on the host machine',
          'The port inside the container',
          'The image version',
          'The number of containers to start',
        ],
        correctIndex: 0,
        explanation: 'The -p flag uses the format host_port:container_port.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // te-13 Kubernetes
  // ---------------------------------------------------------------------------
  {
    id: 'te-13',
    moduleId: 'technical',
    topic: 'devops',
    title: 'Kubernetes: pods, deployments and scaling',
    titleTranslation: {
      fr: 'Kubernetes : pods, déploiements et mise à l\'échelle',
      es: 'Kubernetes: pods, deployments y escalado',
    },
    level: 'advanced',
    premium: true,
    estimatedMinutes: 12,
    roles: ['devops', 'architect'],
    objective:
      'Discuss Kubernetes workloads, probes, rollouts and autoscaling precisely during an incident or a design review.',
    objectiveTranslation: {
      fr: 'Discuter avec précision des workloads Kubernetes, des probes, des rollouts et de l\'autoscaling lors d\'un incident ou d\'une revue de conception.',
      es: 'Hablar con precisión de workloads de Kubernetes, probes, rollouts y autoescalado durante un incidente o una revisión de diseño.',
    },
    situation:
      'During a traffic peak, pods of the checkout service keep restarting, and you investigate with the platform team.',
    situationTranslation: {
      fr: 'Pendant un pic de trafic, les pods du service de checkout redémarrent sans arrêt, et vous enquêtez avec l\'équipe plateforme.',
      es: 'Durante un pico de tráfico, los pods del servicio de checkout se reinician una y otra vez, e investigas con el equipo de plataforma.',
    },
    vocabulary: [
      {
        term: 'pod',
        definition: 'The smallest deployable unit in Kubernetes: one or more containers that share a network and storage.',
        translation: { fr: 'pod', es: 'pod' },
      },
      {
        term: 'deployment',
        definition: 'A resource that keeps a desired number of identical pods running and manages rolling updates.',
        translation: { fr: 'deployment (déploiement)', es: 'deployment (despliegue)' },
      },
      {
        term: 'liveness probe',
        definition: 'A health check; if it keeps failing, the kubelet restarts the container.',
        translation: { fr: 'sonde de vivacité (liveness probe)', es: 'sonda de vida (liveness probe)' },
      },
      {
        term: 'readiness probe',
        definition: 'A check that decides whether a pod should receive traffic from a Service.',
        translation: { fr: 'sonde de disponibilité (readiness probe)', es: 'sonda de disponibilidad (readiness probe)' },
      },
      {
        term: 'Horizontal Pod Autoscaler',
        definition: 'A controller that adds or removes pod replicas based on metrics such as CPU usage.',
        translation: { fr: 'Horizontal Pod Autoscaler (mise à l\'échelle horizontale)', es: 'Horizontal Pod Autoscaler (escalado horizontal)' },
      },
    ],
    expressions: [
      {
        phrase: 'The pods are in CrashLoopBackOff, so Kubernetes keeps restarting them with a growing delay.',
        usage: 'Use this to describe a pod status precisely during an incident.',
        translation: {
          fr: 'Les pods sont en CrashLoopBackOff, donc Kubernetes les redémarre sans cesse avec un délai croissant.',
          es: 'Los pods están en CrashLoopBackOff, así que Kubernetes los reinicia una y otra vez con un retraso creciente.',
        },
      },
      {
        phrase: 'It looks like the liveness probe is too aggressive under load.',
        usage: 'Use "it looks like" to share a hypothesis without claiming certainty.',
        translation: {
          fr: 'On dirait que la liveness probe est trop agressive sous charge.',
          es: 'Parece que la liveness probe es demasiado agresiva bajo carga.',
        },
      },
      {
        phrase: 'The readiness probe should fail first, so the pod stops getting traffic instead of being killed.',
        usage: 'Use this to explain the different roles of the two probes.',
        translation: {
          fr: 'La readiness probe devrait échouer en premier, pour que le pod ne reçoive plus de trafic au lieu d\'être tué.',
          es: 'La readiness probe debería fallar primero, para que el pod deje de recibir tráfico en lugar de ser eliminado.',
        },
      },
      {
        phrase: "The HPA can't scale beyond the max replicas we set.",
        usage: 'Use this to point out a configuration limit on autoscaling.',
        translation: {
          fr: 'Le HPA ne peut pas dépasser le nombre maximal de réplicas qu\'on a défini.',
          es: 'El HPA no puede escalar por encima del número máximo de réplicas que configuramos.',
        },
      },
      {
        phrase: "If the new version misbehaves, we can roll back the deployment.",
        usage: 'Use this to reassure people about a risky rollout.',
        translation: {
          fr: 'Si la nouvelle version pose problème, on peut faire un rollback du deployment.',
          es: 'Si la nueva versión da problemas, podemos hacer rollback del deployment.',
        },
      },
    ],
    dialogue: {
      context: 'Priya, an SRE, and Kenji, a backend lead, investigate restarting checkout pods during a sales peak.',
      lines: [
        {
          speaker: 'Kenji',
          text: 'Checkout latency is spiking, and half of the pods are restarting. What are you seeing?',
          translation: {
            fr: 'La latence du checkout s\'envole, et la moitié des pods redémarrent. Qu\'est-ce que tu observes ?',
            es: 'La latencia del checkout se está disparando y la mitad de los pods se están reiniciando. ¿Qué ves tú?',
          },
        },
        {
          speaker: 'Priya',
          text: "Several pods are in CrashLoopBackOff. The events show the liveness probe failing: one-second timeout, three failures, then a restart.",
          translation: {
            fr: 'Plusieurs pods sont en CrashLoopBackOff. Les événements montrent que la liveness probe échoue : timeout d\'une seconde, trois échecs, puis un redémarrage.',
            es: 'Varios pods están en CrashLoopBackOff. Los eventos muestran que la liveness probe falla: timeout de un segundo, tres fallos y luego un reinicio.',
          },
        },
        {
          speaker: 'Kenji',
          text: 'So the app is slow under load, not actually dead, and Kubernetes is killing it anyway.',
          translation: {
            fr: 'Donc l\'appli est lente sous la charge, pas vraiment morte, et Kubernetes la tue quand même.',
            es: 'O sea, la app va lenta bajo carga, no está realmente caída, y Kubernetes la mata de todas formas.',
          },
        },
        {
          speaker: 'Priya',
          text: 'That seems to be the case. And each restart puts more pressure on the remaining pods, so it cascades.',
          translation: {
            fr: 'C\'est ce qu\'il semble. Et chaque redémarrage met plus de pression sur les pods restants, donc ça fait boule de neige.',
            es: 'Eso parece. Y cada reinicio aumenta la presión sobre los pods restantes, así que se produce un efecto en cascada.',
          },
        },
        {
          speaker: 'Kenji',
          text: "Why isn't the HPA adding more replicas?",
          translation: {
            fr: 'Pourquoi le HPA n\'ajoute-t-il pas plus de réplicas ?',
            es: '¿Por qué el HPA no añade más réplicas?',
          },
        },
        {
          speaker: 'Priya',
          text: "It already has: we've hit the max of ten. I'd suggest raising it to twenty for now and relaxing the liveness timeout.",
          translation: {
            fr: 'Il l\'a déjà fait : on a atteint le maximum de dix. Je suggère de le monter à vingt pour l\'instant et d\'assouplir le timeout de la liveness probe.',
            es: 'Ya lo ha hecho: hemos llegado al máximo de diez. Propongo subirlo a veinte por ahora y relajar el timeout de la liveness probe.',
          },
        },
        {
          speaker: 'Kenji',
          text: 'Agreed. Longer term, the readiness probe should take busy pods out of rotation before liveness kicks in.',
          translation: {
            fr: 'D\'accord. À plus long terme, la readiness probe devrait retirer les pods surchargés du trafic avant que la liveness probe n\'intervienne.',
            es: 'De acuerdo. A más largo plazo, la readiness probe debería sacar del tráfico los pods saturados antes de que actúe la liveness probe.',
          },
        },
        {
          speaker: 'Priya',
          text: "Exactly. I'll apply the change now and watch the rollout. If anything looks off, we roll back.",
          translation: {
            fr: 'Exactement. J\'applique le changement maintenant et je surveille le rollout. Si quelque chose cloche, on fait un rollback.',
            es: 'Exacto. Aplico el cambio ahora y vigilo el rollout. Si algo no cuadra, hacemos rollback.',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'te-13-q1',
        type: 'choice',
        prompt: 'What happens when a readiness probe fails?',
        options: [
          'The container is restarted immediately.',
          'The node is removed from the cluster.',
          'The pod stops receiving traffic from the Service until it is ready again.',
          'The deployment is rolled back.',
        ],
        correctIndex: 2,
        explanation: 'A failing readiness probe removes the pod from the Service endpoints; restarting is the job of the liveness probe.',
      },
      {
        id: 'te-13-q2',
        type: 'fill',
        prompt: "The HPA can't add more pods because we've reached the maximum number of ___.",
        options: ['replicas', 'probes', 'namespaces'],
        correctIndex: 0,
        explanation: 'The Horizontal Pod Autoscaler scales the number of replicas between the minimum and maximum you configure.',
      },
      {
        id: 'te-13-q3',
        type: 'choice',
        prompt: 'Which sentence shares a hypothesis with appropriate caution during an incident?',
        options: [
          'Kubernetes is broken.',
          'It looks like the liveness probe is too aggressive under load.',
          'The probes are definitely the only problem.',
        ],
        correctIndex: 1,
        explanation: '"It looks like" signals a reasoned hypothesis, which is appropriate before the root cause is confirmed.',
      },
    ],
  },
];
