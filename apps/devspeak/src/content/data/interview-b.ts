import type { Lesson } from '../types';

export const interviewB: Lesson[] = [
  // ---------------------------------------------------------------------------
  // iv-11 — React: state management in a large application
  // ---------------------------------------------------------------------------
  {
    id: 'iv-11',
    moduleId: 'interview',
    topic: 'react',
    title: 'Explaining state management in a large React app',
    titleTranslation: {
      fr: "Expliquer la gestion d'état dans une grande application React",
      es: 'Explicar la gestión del estado en una aplicación React grande',
    },
    level: 'advanced',
    premium: true,
    estimatedMinutes: 11,
    roles: ['react', 'fullstack'],
    objective:
      'Explain how you separate different kinds of state and justify each tool choice with a clear trade-off.',
    objectiveTranslation: {
      fr: "Expliquer comment vous séparez les différents types d'état et justifier chaque choix d'outil par un compromis clair.",
      es: 'Explicar cómo separas los distintos tipos de estado y justificar cada elección de herramienta con un compromiso claro.',
    },
    situation:
      'You are in a senior front-end interview. The interviewer wants to know how you keep state predictable as both the application and the team grow.',
    situationTranslation: {
      fr: "Vous passez un entretien pour un poste front-end senior. L'intervieweur veut savoir comment vous gardez l'état prévisible quand l'application et l'équipe grandissent.",
      es: 'Estás en una entrevista para un puesto front-end senior. El entrevistador quiere saber cómo mantienes el estado predecible a medida que crecen la aplicación y el equipo.',
    },
    vocabulary: [
      {
        term: 'server state',
        definition:
          'Data that is owned by the backend and only cached on the client, such as a list of orders loaded from an API.',
        translation: { fr: 'état serveur', es: 'estado del servidor' },
      },
      {
        term: 'prop drilling',
        definition:
          'Passing props through several layers of components that do not use them, just so a deeply nested child can receive them.',
        translation: { fr: 'prop drilling (transmission de props en cascade)', es: 'prop drilling (paso de props en cascada)' },
      },
      {
        term: 'single source of truth',
        definition:
          'The principle that each piece of data is stored in exactly one place, so different parts of the UI never disagree.',
        translation: { fr: 'source unique de vérité', es: 'única fuente de verdad' },
      },
      {
        term: 'derived state',
        definition:
          'A value you can calculate from existing state or props, so it should be computed rather than stored separately.',
        translation: { fr: 'état dérivé', es: 'estado derivado' },
      },
      {
        term: 're-render',
        definition:
          'When React calls a component function again to produce updated output, usually because its state, props or context changed.',
        translation: { fr: 'nouveau rendu (re-render)', es: 'nuevo renderizado (re-render)' },
      },
    ],
    expressions: [
      {
        phrase: 'I separate state by where it lives and who owns it.',
        usage: 'Use it to open your answer with a clear principle before naming any library.',
        translation: {
          fr: "Je sépare l'état selon l'endroit où il vit et selon qui en est responsable.",
          es: 'Separo el estado según dónde vive y quién es su dueño.',
        },
      },
      {
        phrase: "That's a good fit when..., but it gets painful when...",
        usage: 'Use it to show you know both the strengths and the limits of a tool.',
        translation: {
          fr: "C'est un bon choix quand..., mais ça devient pénible quand...",
          es: 'Encaja bien cuando..., pero se vuelve complicado cuando...',
        },
      },
      {
        phrase: "I'd only reach for a global store when...",
        usage: 'Use it to show that you add complexity only when there is a real need.',
        translation: {
          fr: "Je n'utiliserais un store global que lorsque...",
          es: 'Solo recurriría a un store global cuando...',
        },
      },
      {
        phrase: 'The main trade-off is...',
        usage: 'Use it to name the cost of a decision honestly; senior interviewers listen for this.',
        translation: { fr: 'Le principal compromis, c\'est...', es: 'El principal compromiso es...' },
      },
      {
        phrase: 'In practice, what worked for us was...',
        usage: 'Use it to move from theory to a concrete example from your own experience.',
        translation: {
          fr: 'En pratique, ce qui a bien marché pour nous, c\'était...',
          es: 'En la práctica, lo que nos funcionó fue...',
        },
      },
    ],
    dialogue: {
      context: 'A senior React interview, about twenty minutes in, after the candidate has described their last project.',
      lines: [
        {
          speaker: 'Interviewer',
          text: 'Your last app had around forty screens. How did you manage state at that size?',
          translation: {
            fr: 'Votre dernière application comptait une quarantaine d\'écrans. Comment gériez-vous l\'état à cette échelle ?',
            es: 'Tu última aplicación tenía unas cuarenta pantallas. ¿Cómo gestionabas el estado a ese tamaño?',
          },
        },
        {
          speaker: 'Candidate',
          text: 'I separate state by where it lives and who owns it. Anything that comes from the API goes into TanStack Query, and UI state stays local in the component.',
          translation: {
            fr: "Je sépare l'état selon l'endroit où il vit et selon qui en est responsable. Tout ce qui vient de l'API va dans TanStack Query, et l'état d'interface reste local dans le composant.",
            es: 'Separo el estado según dónde vive y quién es su dueño. Todo lo que viene de la API va a TanStack Query, y el estado de la interfaz se queda local en el componente.',
          },
        },
        {
          speaker: 'Interviewer',
          text: 'And what about things that really are global, like the logged-in user?',
          translation: {
            fr: "Et pour ce qui est vraiment global, comme l'utilisateur connecté ?",
            es: '¿Y qué pasa con lo que de verdad es global, como el usuario que ha iniciado sesión?',
          },
        },
        {
          speaker: 'Candidate',
          text: "For values that rarely change, Context is fine. For state that updates often, I prefer a small store like Zustand, because every Context consumer re-renders when the value changes.",
          translation: {
            fr: "Pour des valeurs qui changent rarement, le Context suffit. Pour un état qui se met souvent à jour, je préfère un petit store comme Zustand, parce que chaque consommateur du Context refait un rendu quand la valeur change.",
            es: 'Para valores que cambian poco, Context está bien. Para estado que se actualiza a menudo, prefiero un store pequeño como Zustand, porque cada consumidor del Context se vuelve a renderizar cuando cambia el valor.',
          },
        },
        {
          speaker: 'Interviewer',
          text: 'Good. So when would you still choose Redux?',
          translation: {
            fr: 'Bien. Alors, dans quel cas choisiriez-vous encore Redux ?',
            es: 'Bien. Entonces, ¿cuándo seguirías eligiendo Redux?',
          },
        },
        {
          speaker: 'Candidate',
          text: "I'd only reach for Redux Toolkit when there's a lot of complex client-side logic, with many slices reacting to the same actions. The DevTools and strict patterns really help a large team there.",
          translation: {
            fr: "Je n'utiliserais Redux Toolkit que s'il y a beaucoup de logique complexe côté client, avec de nombreux slices qui réagissent aux mêmes actions. Les DevTools et les conventions strictes aident vraiment une grande équipe dans ce cas.",
            es: 'Solo recurriría a Redux Toolkit cuando hay mucha lógica compleja en el cliente, con muchos slices que reaccionan a las mismas acciones. Ahí las DevTools y los patrones estrictos ayudan mucho a un equipo grande.',
          },
        },
        {
          speaker: 'Interviewer',
          text: 'And the downside?',
          translation: { fr: 'Et l\'inconvénient ?', es: '¿Y la desventaja?' },
        },
        {
          speaker: 'Candidate',
          text: "The main trade-off is more boilerplate and a steeper learning curve for new joiners. For a typical CRUD app, I don't think it's worth it.",
          translation: {
            fr: "Le principal compromis, c'est davantage de code répétitif et une courbe d'apprentissage plus raide pour les nouveaux arrivants. Pour une application CRUD classique, je ne pense pas que ça vaille le coup.",
            es: 'El principal compromiso es más código repetitivo y una curva de aprendizaje más pronunciada para quienes se incorporan. Para una aplicación CRUD típica, no creo que merezca la pena.',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'iv-11-q1',
        type: 'choice',
        prompt: 'Which kind of state is usually best handled by a data-fetching library such as TanStack Query?',
        options: [
          'Whether a dropdown menu is open',
          'The text a user is currently typing',
          'A list of orders loaded from the backend API',
          'The active tab inside a single component',
        ],
        correctIndex: 2,
        explanation:
          'Data loaded from an API is server state: it needs caching, refetching and invalidation, which is exactly what data-fetching libraries provide.',
      },
      {
        id: 'iv-11-q2',
        type: 'fill',
        prompt: 'Passing props through many components that do not use them is called prop ___.',
        options: ['digging', 'drilling', 'dropping', 'drifting'],
        correctIndex: 1,
        explanation: '"Prop drilling" is the standard term in the React community for this pattern.',
      },
      {
        id: 'iv-11-q3',
        type: 'choice',
        prompt: 'Which sentence sounds most professional when you discuss a tool in a senior interview?',
        options: [
          'Redux is bad, everyone knows that.',
          'I always use the same library for everything.',
          "It doesn't really matter which one you pick.",
          'The main trade-off is extra boilerplate in exchange for very predictable updates.',
        ],
        correctIndex: 3,
        explanation:
          'Naming both the cost and the benefit shows balanced judgment, which is what senior interviewers are looking for.',
      },
    ],
    interview: {
      path: 'react',
      question: 'How do you manage state in a large React application?',
      questionTranslation: {
        fr: "Comment gérez-vous l'état dans une grande application React ?",
        es: '¿Cómo gestionas el estado en una aplicación React grande?',
      },
      explanation:
        'The interviewer is checking whether you understand that not all state is the same, whether you choose tools for a reason rather than out of habit, and whether you know the performance cost of patterns like Context. They also want to hear real experience behind the theory.',
      explanationTranslation: {
        fr: "L'intervieweur vérifie si vous comprenez que tous les états ne se valent pas, si vous choisissez vos outils pour une raison précise et non par habitude, et si vous connaissez le coût en performance de patterns comme le Context. Il veut aussi entendre une vraie expérience derrière la théorie.",
        es: 'El entrevistador comprueba si entiendes que no todo el estado es igual, si eliges las herramientas por una razón y no por costumbre, y si conoces el coste de rendimiento de patrones como Context. También quiere escuchar experiencia real detrás de la teoría.',
      },
      exampleAnswer:
        "I start by separating state by type instead of putting everything into one global store. Server state, meaning data that lives on the backend, goes into a data-fetching library like TanStack Query, which handles caching, deduplication and background refetching. Local UI state, like whether a modal is open, stays in the component with useState or useReducer. For the small amount of truly global client state, such as the current user or the theme, I use Context if it rarely changes, or a lightweight store like Zustand if it updates often, because every Context consumer re-renders on each change. I also keep filters and pagination in the URL, so they survive a refresh and can be shared. On my last project, moving API data out of Redux removed a lot of boilerplate and made our loading and error states much more consistent.",
      exampleAnswerTranslation: {
        fr: "Je commence par séparer l'état par type, au lieu de tout mettre dans un seul store global. L'état serveur, c'est-à-dire les données qui vivent sur le backend, va dans une bibliothèque de récupération de données comme TanStack Query, qui gère le cache, la déduplication et le rafraîchissement en arrière-plan. L'état d'interface local, par exemple savoir si une modale est ouverte, reste dans le composant avec useState ou useReducer. Pour la petite partie d'état client vraiment global, comme l'utilisateur courant ou le thème, j'utilise le Context s'il change rarement, ou un store léger comme Zustand s'il se met souvent à jour, parce que chaque consommateur du Context refait un rendu à chaque changement. Je garde aussi les filtres et la pagination dans l'URL, pour qu'ils survivent à un rafraîchissement et puissent être partagés. Sur mon dernier projet, sortir les données de l'API de Redux a supprimé beaucoup de code répétitif et a rendu nos états de chargement et d'erreur bien plus cohérents.",
        es: 'Empiezo separando el estado por tipo en lugar de meterlo todo en un único store global. El estado del servidor, es decir, los datos que viven en el backend, va a una librería de obtención de datos como TanStack Query, que se encarga de la caché, la deduplicación y la actualización en segundo plano. El estado local de la interfaz, como saber si un modal está abierto, se queda en el componente con useState o useReducer. Para la pequeña parte de estado del cliente que es realmente global, como el usuario actual o el tema, uso Context si cambia poco, o un store ligero como Zustand si se actualiza a menudo, porque cada consumidor del Context se vuelve a renderizar en cada cambio. También guardo los filtros y la paginación en la URL, para que sobrevivan a una recarga y se puedan compartir. En mi último proyecto, sacar los datos de la API de Redux eliminó mucho código repetitivo e hizo que nuestros estados de carga y error fueran mucho más coherentes.',
      },
      alternatives: [
        'The first thing I ask is whether the data belongs to the server or to the UI.',
        'I try to keep state as close as possible to where it is used.',
        "I avoid storing anything I can derive; I'd rather compute it during render.",
        'Context is great for dependency injection, but it is not a performance-friendly state manager on its own.',
      ],
      practice:
        'Pick a React project you know well. Write down three examples each of server state, local UI state and global client state, then record yourself explaining in under two minutes where each one lives and why.',
      selfAssessment: [
        'I distinguished server state from client state before naming any library.',
        'I explained the re-render cost of Context instead of just saying "I use Context".',
        'I named at least one trade-off of the tools I chose.',
        'I gave a concrete example or result from a real project.',
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // iv-12 — Full stack: what happens when a user submits a form
  // ---------------------------------------------------------------------------
  {
    id: 'iv-12',
    moduleId: 'interview',
    topic: 'fullstack',
    title: 'Walking through a form submission end to end',
    titleTranslation: {
      fr: "Décrire la soumission d'un formulaire de bout en bout",
      es: 'Describir el envío de un formulario de principio a fin',
    },
    level: 'intermediate',
    premium: true,
    estimatedMinutes: 10,
    roles: ['fullstack', 'react', 'java'],
    objective:
      'Describe the full journey of a form submission, from the browser to the database and back, in a clear sequence.',
    objectiveTranslation: {
      fr: "Décrire le parcours complet de la soumission d'un formulaire, du navigateur à la base de données et retour, dans un ordre clair.",
      es: 'Describir el recorrido completo del envío de un formulario, del navegador a la base de datos y de vuelta, en un orden claro.',
    },
    situation:
      'In a full-stack interview, you are asked to explain what happens, step by step, when a user clicks "Submit" on a sign-up form.',
    situationTranslation: {
      fr: "Lors d'un entretien full-stack, on vous demande d'expliquer, étape par étape, ce qui se passe quand un utilisateur clique sur « Envoyer » dans un formulaire d'inscription.",
      es: 'En una entrevista full-stack, te piden que expliques, paso a paso, qué ocurre cuando un usuario hace clic en «Enviar» en un formulario de registro.',
    },
    vocabulary: [
      {
        term: 'client-side validation',
        definition:
          'Checks that run in the browser before the request is sent, to give the user fast feedback.',
        translation: { fr: 'validation côté client', es: 'validación del lado del cliente' },
      },
      {
        term: 'payload',
        definition: 'The data carried in the body of a request or response, often formatted as JSON.',
        translation: { fr: 'payload (charge utile)', es: 'payload (carga útil)' },
      },
      {
        term: 'middleware',
        definition:
          'Code that runs before or after a request handler, for tasks such as authentication, logging or parsing.',
        translation: { fr: 'middleware', es: 'middleware' },
      },
      {
        term: 'transaction',
        definition:
          'A group of database operations that either all succeed or are all rolled back together.',
        translation: { fr: 'transaction', es: 'transacción' },
      },
      {
        term: 'idempotent',
        definition:
          'Describes an operation that has the same effect whether it is performed once or several times.',
        translation: { fr: 'idempotent', es: 'idempotente' },
      },
    ],
    expressions: [
      {
        phrase: 'Let me walk you through it step by step.',
        usage: 'Use it to signal that you are going to give a structured, ordered answer.',
        translation: {
          fr: 'Je vais vous le détailler étape par étape.',
          es: 'Te lo explico paso a paso.',
        },
      },
      {
        phrase: 'Once the request reaches the server, ...',
        usage: 'Use it as a transition between the front-end part and the back-end part of your answer.',
        translation: {
          fr: 'Une fois que la requête arrive sur le serveur, ...',
          es: 'Una vez que la petición llega al servidor, ...',
        },
      },
      {
        phrase: 'We never trust the client, so we validate again on the server.',
        usage: 'Use it to show you understand that browser checks can be bypassed.',
        translation: {
          fr: 'On ne fait jamais confiance au client, donc on valide à nouveau côté serveur.',
          es: 'Nunca confiamos en el cliente, así que validamos otra vez en el servidor.',
        },
      },
      {
        phrase: 'On the way back, ...',
        usage: 'Use it to describe what happens with the response after the server has done its work.',
        translation: { fr: 'Au retour, ...', es: 'A la vuelta, ...' },
      },
      {
        phrase: 'I can go deeper into any of those steps if you like.',
        usage: 'Use it at the end to invite follow-up questions without talking for too long.',
        translation: {
          fr: "Je peux approfondir n'importe laquelle de ces étapes si vous voulez.",
          es: 'Puedo profundizar en cualquiera de esos pasos si quieres.',
        },
      },
    ],
    dialogue: {
      context: 'A full-stack interview for a team that builds a React front end with a Java back end.',
      lines: [
        {
          speaker: 'Interviewer',
          text: 'Imagine a user fills in our sign-up form and clicks Submit. What happens next?',
          translation: {
            fr: "Imaginez qu'un utilisateur remplit notre formulaire d'inscription et clique sur Envoyer. Que se passe-t-il ensuite ?",
            es: 'Imagina que un usuario rellena nuestro formulario de registro y hace clic en Enviar. ¿Qué pasa después?',
          },
        },
        {
          speaker: 'Candidate',
          text: 'Let me walk you through it step by step. First, the form runs client-side validation, so the user sees mistakes like an invalid email straight away.',
          translation: {
            fr: "Je vais vous le détailler étape par étape. D'abord, le formulaire lance la validation côté client, pour que l'utilisateur voie tout de suite les erreurs, comme un email invalide.",
            es: 'Te lo explico paso a paso. Primero, el formulario ejecuta la validación del lado del cliente, así el usuario ve enseguida errores como un correo no válido.',
          },
        },
        {
          speaker: 'Interviewer',
          text: 'OK, and if the data looks valid?',
          translation: {
            fr: "D'accord, et si les données semblent valides ?",
            es: 'Vale, ¿y si los datos parecen válidos?',
          },
        },
        {
          speaker: 'Candidate',
          text: 'The submit handler sends a POST request with a JSON payload. Once the request reaches the server, middleware parses it and checks things like the CSRF token, then the controller validates the data again.',
          translation: {
            fr: "Le gestionnaire de soumission envoie une requête POST avec un payload JSON. Une fois que la requête arrive sur le serveur, un middleware la parse et vérifie des choses comme le jeton CSRF, puis le contrôleur valide à nouveau les données.",
            es: 'El manejador del envío manda una petición POST con un payload JSON. Una vez que la petición llega al servidor, un middleware la parsea y comprueba cosas como el token CSRF, y luego el controlador vuelve a validar los datos.',
          },
        },
        {
          speaker: 'Interviewer',
          text: 'Why validate twice?',
          translation: { fr: 'Pourquoi valider deux fois ?', es: '¿Por qué validar dos veces?' },
        },
        {
          speaker: 'Candidate',
          text: "Because we never trust the client. Anyone can skip the browser and call the API directly with curl.",
          translation: {
            fr: "Parce qu'on ne fait jamais confiance au client. N'importe qui peut contourner le navigateur et appeler l'API directement avec curl.",
            es: 'Porque nunca confiamos en el cliente. Cualquiera puede saltarse el navegador y llamar a la API directamente con curl.',
          },
        },
        {
          speaker: 'Interviewer',
          text: 'Fair. What if the user double-clicks the button?',
          translation: {
            fr: "C'est juste. Et si l'utilisateur double-clique sur le bouton ?",
            es: 'Tiene sentido. ¿Y si el usuario hace doble clic en el botón?',
          },
        },
        {
          speaker: 'Candidate',
          text: 'I disable the button while the request is pending, but I also rely on a unique constraint on the email column, so a second insert fails cleanly instead of creating a duplicate account.',
          translation: {
            fr: "Je désactive le bouton pendant que la requête est en cours, mais je m'appuie aussi sur une contrainte d'unicité sur la colonne email, pour qu'une deuxième insertion échoue proprement au lieu de créer un compte en double.",
            es: 'Desactivo el botón mientras la petición está en curso, pero también me apoyo en una restricción de unicidad en la columna del email, para que una segunda inserción falle limpiamente en lugar de crear una cuenta duplicada.',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'iv-12-q1',
        type: 'choice',
        prompt: 'Why must the server validate form data even if the browser already did?',
        options: [
          'Because browser validation is slower',
          'Because a client can bypass the browser and call the API directly',
          'Because HTML forms cannot validate emails',
          'Because JSON cannot carry validation rules',
        ],
        correctIndex: 1,
        explanation:
          'Client-side checks improve user experience, but they can be skipped, so the server is the real line of defense.',
      },
      {
        id: 'iv-12-q2',
        type: 'fill',
        prompt: 'An operation that has the same effect whether it runs once or twice is ___.',
        options: ['atomic', 'asynchronous', 'stateless', 'idempotent'],
        correctIndex: 3,
        explanation:
          '"Idempotent" is the precise term. Atomic means all-or-nothing, which is a different property.',
      },
      {
        id: 'iv-12-q3',
        type: 'choice',
        prompt: 'Which phrase is the most natural way to move from the front end to the back end in your answer?',
        options: [
          'Once the request reaches the server, ...',
          'After that is the server thing, ...',
          'Then the backend is making it, ...',
        ],
        correctIndex: 0,
        explanation:
          '"Once the request reaches the server" is a clear, natural transition. The other options are ungrammatical or vague.',
      },
    ],
    interview: {
      path: 'fullstack',
      question: 'Walk me through what happens when a user submits a form.',
      questionTranslation: {
        fr: "Expliquez-moi ce qui se passe quand un utilisateur soumet un formulaire.",
        es: 'Explícame qué ocurre cuando un usuario envía un formulario.',
      },
      explanation:
        'The interviewer is checking whether you understand the whole request lifecycle, not just your favorite layer. They listen for a logical order, security awareness such as server-side validation, and how you handle failures and edge cases like duplicate submissions.',
      explanationTranslation: {
        fr: "L'intervieweur vérifie si vous comprenez tout le cycle de vie d'une requête, et pas seulement votre couche préférée. Il attend un ordre logique, une conscience de la sécurité comme la validation côté serveur, et la manière dont vous gérez les échecs et les cas limites comme les soumissions en double.",
        es: 'El entrevistador comprueba si entiendes todo el ciclo de vida de una petición, no solo tu capa favorita. Busca un orden lógico, conciencia de seguridad como la validación en el servidor, y cómo gestionas los fallos y los casos límite, como los envíos duplicados.',
      },
      exampleAnswer:
        "Sure, let me walk through it in order. In the browser, the form first runs client-side validation for quick feedback. If it passes, the submit handler prevents the default page reload, disables the button and sends a POST request with a JSON payload over HTTPS. The request usually goes through a load balancer to one of the application servers. There, middleware handles things like authentication, CSRF protection and parsing. The controller validates the data again, because we can't trust the client, and then the service layer applies the business rules and writes to the database inside a transaction. The server responds with a 201 and the created resource, or a 400 with field-level errors. On the way back, the front end either shows a success message and redirects, or maps the errors to the right fields and re-enables the button.",
      exampleAnswerTranslation: {
        fr: "Bien sûr, je vais le faire dans l'ordre. Dans le navigateur, le formulaire lance d'abord une validation côté client pour donner un retour rapide. Si elle passe, le gestionnaire de soumission empêche le rechargement par défaut de la page, désactive le bouton et envoie une requête POST avec un payload JSON en HTTPS. La requête passe généralement par un load balancer jusqu'à l'un des serveurs d'application. Là, des middlewares s'occupent de l'authentification, de la protection CSRF et du parsing. Le contrôleur valide à nouveau les données, parce qu'on ne peut pas faire confiance au client, puis la couche service applique les règles métier et écrit dans la base de données dans une transaction. Le serveur répond avec un 201 et la ressource créée, ou un 400 avec des erreurs par champ. Au retour, le front end affiche un message de succès et redirige, ou associe les erreurs aux bons champs et réactive le bouton.",
        es: 'Claro, lo explico en orden. En el navegador, el formulario primero ejecuta una validación del lado del cliente para dar una respuesta rápida. Si pasa, el manejador del envío evita la recarga por defecto de la página, desactiva el botón y manda una petición POST con un payload JSON por HTTPS. Normalmente la petición pasa por un load balancer hasta uno de los servidores de aplicación. Allí, los middlewares se encargan de la autenticación, la protección CSRF y el parseo. El controlador vuelve a validar los datos, porque no podemos confiar en el cliente, y después la capa de servicio aplica las reglas de negocio y escribe en la base de datos dentro de una transacción. El servidor responde con un 201 y el recurso creado, o con un 400 con errores por campo. A la vuelta, el front end muestra un mensaje de éxito y redirige, o asigna los errores a los campos correctos y vuelve a activar el botón.',
      },
      alternatives: [
        'I like to split it into three parts: the browser, the server and the database.',
        'Before anything is sent, the form gives the user immediate feedback on obvious mistakes.',
        'The server is the source of truth, so it repeats every important check.',
        'If something fails, the API returns structured errors that the UI can map back to each field.',
      ],
      practice:
        'Draw a simple diagram of a form submission in your current stack, from the click to the database and back. Then explain it out loud in under two minutes, using at least three transition phrases such as "First", "Once the request reaches the server" and "On the way back".',
      selfAssessment: [
        'I described the steps in a clear, logical order from browser to database and back.',
        'I explained why validation happens on both the client and the server.',
        'I mentioned how errors are returned to the user, not only the happy path.',
        'I covered at least one edge case, such as double submission or a network failure.',
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // iv-13 — Full stack: securing a REST API
  // ---------------------------------------------------------------------------
  {
    id: 'iv-13',
    moduleId: 'interview',
    topic: 'fullstack',
    title: 'Explaining how you secure a REST API',
    titleTranslation: {
      fr: 'Expliquer comment sécuriser une API REST',
      es: 'Explicar cómo proteger una API REST',
    },
    level: 'advanced',
    premium: true,
    estimatedMinutes: 12,
    roles: ['fullstack', 'react', 'java'],
    objective:
      'Present API security as layered defenses and discuss authentication, authorization and token storage with precise vocabulary.',
    objectiveTranslation: {
      fr: "Présenter la sécurité d'une API comme des défenses en couches et parler d'authentification, d'autorisation et de stockage des jetons avec un vocabulaire précis.",
      es: 'Presentar la seguridad de una API como defensas en capas y hablar de autenticación, autorización y almacenamiento de tokens con un vocabulario preciso.',
    },
    situation:
      'You are interviewing for a senior full-stack role at a company that handles customer payment data. The interviewer asks how you would protect a public REST API.',
    situationTranslation: {
      fr: "Vous passez un entretien pour un poste full-stack senior dans une entreprise qui gère des données de paiement clients. L'intervieweur vous demande comment vous protégeriez une API REST publique.",
      es: 'Tienes una entrevista para un puesto full-stack senior en una empresa que maneja datos de pago de clientes. El entrevistador te pregunta cómo protegerías una API REST pública.',
    },
    vocabulary: [
      {
        term: 'authentication',
        definition: 'Verifying who a user or client is, for example by validating a token or a password.',
        translation: { fr: 'authentification', es: 'autenticación' },
      },
      {
        term: 'authorization',
        definition: 'Deciding what an authenticated user is allowed to do or which data they can access.',
        translation: { fr: 'autorisation', es: 'autorización' },
      },
      {
        term: 'rate limiting',
        definition: 'Restricting how many requests a client can make in a given time window.',
        translation: { fr: 'limitation de débit (rate limiting)', es: 'limitación de peticiones (rate limiting)' },
      },
      {
        term: 'least privilege',
        definition: 'Giving each user, service or token only the permissions it strictly needs.',
        translation: { fr: 'moindre privilège', es: 'mínimo privilegio' },
      },
      {
        term: 'HttpOnly cookie',
        definition: 'A cookie that JavaScript in the page cannot read, which reduces the impact of XSS attacks.',
        translation: { fr: 'cookie HttpOnly', es: 'cookie HttpOnly' },
      },
    ],
    expressions: [
      {
        phrase: 'I think about it in layers.',
        usage: 'Use it to show that you do not rely on a single security control.',
        translation: { fr: 'Je raisonne en couches.', es: 'Lo pienso por capas.' },
      },
      {
        phrase: "Authentication tells us who you are; authorization tells us what you're allowed to do.",
        usage: 'Use it to make the distinction between the two concepts crystal clear.',
        translation: {
          fr: "L'authentification nous dit qui vous êtes ; l'autorisation nous dit ce que vous avez le droit de faire.",
          es: 'La autenticación nos dice quién eres; la autorización nos dice qué puedes hacer.',
        },
      },
      {
        phrase: 'The most common gap I see is...',
        usage: 'Use it to show practical experience with real-world vulnerabilities.',
        translation: {
          fr: 'La faille la plus courante que je vois, c\'est...',
          es: 'El fallo más común que veo es...',
        },
      },
      {
        phrase: 'It depends on the threat model, but by default I would...',
        usage: 'Use it to acknowledge context while still giving a clear default position.',
        translation: {
          fr: 'Ça dépend du modèle de menace, mais par défaut je...',
          es: 'Depende del modelo de amenazas, pero por defecto yo...',
        },
      },
      {
        phrase: 'That comes with its own risk, which we mitigate by...',
        usage: 'Use it to show that every option has a downside and that you know how to handle it.',
        translation: {
          fr: 'Ça comporte son propre risque, que l\'on atténue en...',
          es: 'Eso tiene su propio riesgo, que mitigamos con...',
        },
      },
    ],
    dialogue: {
      context: 'A senior full-stack interview with a focus on security, for a payments product.',
      lines: [
        {
          speaker: 'Interviewer',
          text: 'We expose a public REST API to mobile and web clients. How would you secure it?',
          translation: {
            fr: 'Nous exposons une API REST publique à des clients mobiles et web. Comment la sécuriseriez-vous ?',
            es: 'Exponemos una API REST pública a clientes móviles y web. ¿Cómo la protegerías?',
          },
        },
        {
          speaker: 'Candidate',
          text: 'I think about it in layers. HTTPS everywhere, then authentication with OAuth 2.0 and short-lived access tokens, and then authorization checks on every single endpoint.',
          translation: {
            fr: "Je raisonne en couches. HTTPS partout, puis l'authentification avec OAuth 2.0 et des access tokens de courte durée, et ensuite des contrôles d'autorisation sur chaque endpoint.",
            es: 'Lo pienso por capas. HTTPS en todas partes, luego autenticación con OAuth 2.0 y access tokens de corta duración, y después comprobaciones de autorización en cada endpoint.',
          },
        },
        {
          speaker: 'Interviewer',
          text: 'Why do you stress "every endpoint"?',
          translation: {
            fr: 'Pourquoi insistez-vous sur « chaque endpoint » ?',
            es: '¿Por qué insistes en «cada endpoint»?',
          },
        },
        {
          speaker: 'Candidate',
          text: "Because the most common gap I see is broken object-level authorization. The user is logged in, but nobody checks that order 42 actually belongs to them.",
          translation: {
            fr: "Parce que la faille la plus courante que je vois, c'est une autorisation défaillante au niveau des objets. L'utilisateur est connecté, mais personne ne vérifie que la commande 42 lui appartient vraiment.",
            es: 'Porque el fallo más común que veo es la autorización rota a nivel de objeto. El usuario ha iniciado sesión, pero nadie comprueba que el pedido 42 sea realmente suyo.',
          },
        },
        {
          speaker: 'Interviewer',
          text: 'Good point. For the web app, where would you store the tokens?',
          translation: {
            fr: "Bonne remarque. Pour l'application web, où stockeriez-vous les jetons ?",
            es: 'Buen punto. Para la aplicación web, ¿dónde guardarías los tokens?',
          },
        },
        {
          speaker: 'Candidate',
          text: "It depends on the threat model, but by default I'd avoid localStorage, because any XSS can read it. I prefer a backend-for-frontend that keeps tokens server-side and gives the browser a Secure, HttpOnly, SameSite cookie.",
          translation: {
            fr: "Ça dépend du modèle de menace, mais par défaut j'éviterais le localStorage, parce que n'importe quelle faille XSS peut le lire. Je préfère un backend-for-frontend qui garde les jetons côté serveur et donne au navigateur un cookie Secure, HttpOnly et SameSite.",
            es: 'Depende del modelo de amenazas, pero por defecto evitaría localStorage, porque cualquier XSS puede leerlo. Prefiero un backend-for-frontend que guarde los tokens en el servidor y le dé al navegador una cookie Secure, HttpOnly y SameSite.',
          },
        },
        {
          speaker: 'Interviewer',
          text: "Cookies bring CSRF into the picture, though.",
          translation: {
            fr: 'Les cookies font pourtant entrer le CSRF en jeu.',
            es: 'Aunque las cookies traen el CSRF al escenario.',
          },
        },
        {
          speaker: 'Candidate',
          text: "Exactly. That comes with its own risk, which we mitigate with SameSite settings plus a CSRF token on state-changing requests.",
          translation: {
            fr: "Exactement. Ça comporte son propre risque, que l'on atténue avec les paramètres SameSite et un jeton CSRF sur les requêtes qui modifient l'état.",
            es: 'Exacto. Eso tiene su propio riesgo, que mitigamos con la configuración SameSite y un token CSRF en las peticiones que modifican el estado.',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'iv-13-q1',
        type: 'choice',
        prompt: 'A logged-in user can read another customer\'s invoice by changing the ID in the URL. What is the problem?',
        options: [
          'Missing authentication',
          'Missing rate limiting',
          'Broken object-level authorization',
          'An expired TLS certificate',
        ],
        correctIndex: 2,
        explanation:
          'The user is authenticated, but the API does not check that the object belongs to them, which is an authorization failure.',
      },
      {
        id: 'iv-13-q2',
        type: 'fill',
        prompt: 'Giving each service only the permissions it strictly needs follows the principle of least ___.',
        options: ['privilege', 'priority', 'permission', 'protection'],
        correctIndex: 0,
        explanation: '"Least privilege" is the established security term.',
      },
      {
        id: 'iv-13-q3',
        type: 'choice',
        prompt: 'Why is storing access tokens in localStorage often discouraged?',
        options: [
          'localStorage is cleared every time the page reloads',
          'localStorage cannot store strings longer than 100 characters',
          'Tokens in localStorage are automatically sent to every domain',
          'Any script running on the page, including injected XSS code, can read it',
        ],
        correctIndex: 3,
        explanation:
          'localStorage is fully readable by JavaScript, so a single XSS vulnerability can leak the token. HttpOnly cookies are not readable by scripts.',
      },
    ],
    interview: {
      path: 'fullstack',
      question: 'How do you secure a REST API?',
      questionTranslation: {
        fr: 'Comment sécurisez-vous une API REST ?',
        es: '¿Cómo proteges una API REST?',
      },
      explanation:
        'The interviewer is checking whether you see security as defense in depth rather than a single feature. They want a clear distinction between authentication and authorization, awareness of common vulnerabilities such as those in the OWASP API Security Top 10, and honest discussion of trade-offs like cookies versus tokens.',
      explanationTranslation: {
        fr: "L'intervieweur vérifie si vous voyez la sécurité comme une défense en profondeur plutôt que comme une seule fonctionnalité. Il attend une distinction claire entre authentification et autorisation, une connaissance des vulnérabilités courantes comme celles de l'OWASP API Security Top 10, et une discussion honnête des compromis, par exemple cookies contre jetons.",
        es: 'El entrevistador comprueba si ves la seguridad como defensa en profundidad y no como una única funcionalidad. Busca una distinción clara entre autenticación y autorización, conocimiento de vulnerabilidades comunes como las del OWASP API Security Top 10, y una discusión honesta de compromisos como cookies frente a tokens.',
      },
      exampleAnswer:
        "I think about it in layers. First, everything goes over HTTPS. For authentication, I'd use OAuth 2.0 or OpenID Connect with short-lived access tokens, and the API validates the signature, issuer, audience and expiry on every request. Authorization is where I see the most real bugs, so every endpoint checks not just the role but whether this user can access this specific resource. Then I validate all input against a schema and use parameterized queries to avoid injection. At the edge, I add rate limiting and a strict CORS policy. Secrets live in a vault, not in the code, and services follow least privilege. Finally, I make sure we log security events without logging sensitive data, and we run dependency scanning in CI. I usually use the OWASP API Security Top 10 as a checklist during reviews.",
      exampleAnswerTranslation: {
        fr: "Je raisonne en couches. D'abord, tout passe en HTTPS. Pour l'authentification, j'utiliserais OAuth 2.0 ou OpenID Connect avec des access tokens de courte durée, et l'API vérifie la signature, l'émetteur, l'audience et l'expiration à chaque requête. L'autorisation, c'est là que je vois le plus de vrais bugs, donc chaque endpoint vérifie non seulement le rôle, mais aussi si cet utilisateur peut accéder à cette ressource précise. Ensuite, je valide toutes les entrées avec un schéma et j'utilise des requêtes paramétrées pour éviter les injections. En bordure, j'ajoute du rate limiting et une politique CORS stricte. Les secrets sont dans un coffre-fort, pas dans le code, et les services suivent le principe du moindre privilège. Enfin, je m'assure qu'on journalise les événements de sécurité sans journaliser de données sensibles, et on lance un scan des dépendances dans la CI. J'utilise généralement l'OWASP API Security Top 10 comme checklist pendant les revues.",
        es: 'Lo pienso por capas. Primero, todo va por HTTPS. Para la autenticación, usaría OAuth 2.0 u OpenID Connect con access tokens de corta duración, y la API valida la firma, el emisor, la audiencia y la caducidad en cada petición. La autorización es donde veo más bugs reales, así que cada endpoint comprueba no solo el rol, sino si este usuario puede acceder a este recurso concreto. Después, valido todas las entradas con un esquema y uso consultas parametrizadas para evitar inyecciones. En el borde, añado rate limiting y una política CORS estricta. Los secretos están en un vault, no en el código, y los servicios siguen el principio de mínimo privilegio. Por último, me aseguro de registrar los eventos de seguridad sin registrar datos sensibles, y ejecutamos un análisis de dependencias en la CI. Normalmente uso el OWASP API Security Top 10 como checklist durante las revisiones.',
      },
      alternatives: [
        'Security for me is defense in depth: no single control should be the only thing protecting the data.',
        'Being logged in is not the same as being allowed; I check ownership on every resource.',
        'I treat every input as untrusted until it has been validated against a schema.',
        "I'd rather have short-lived tokens and refresh them than long-lived tokens that are hard to revoke.",
      ],
      practice:
        'List five layers of protection for an API you know, from the network to the logs. For each one, write one sentence explaining what attack it prevents. Then answer the question out loud in under two and a half minutes.',
      selfAssessment: [
        'I clearly distinguished authentication from authorization.',
        'I mentioned object-level access checks, not just roles.',
        'I covered input validation, rate limiting and secret management.',
        'I discussed at least one trade-off, such as token storage or token lifetime.',
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // iv-14 — DevOps: a CI/CD pipeline you have built
  // ---------------------------------------------------------------------------
  {
    id: 'iv-14',
    moduleId: 'interview',
    topic: 'devops',
    title: 'Describing a CI/CD pipeline you have built',
    titleTranslation: {
      fr: 'Décrire un pipeline CI/CD que vous avez construit',
      es: 'Describir un pipeline de CI/CD que has construido',
    },
    level: 'intermediate',
    premium: false,
    estimatedMinutes: 10,
    roles: ['devops'],
    objective:
      'Describe a real pipeline stage by stage, explain your design choices and mention a measurable result.',
    objectiveTranslation: {
      fr: 'Décrire un vrai pipeline étape par étape, expliquer vos choix de conception et mentionner un résultat mesurable.',
      es: 'Describir un pipeline real etapa por etapa, explicar tus decisiones de diseño y mencionar un resultado medible.',
    },
    situation:
      'In a DevOps interview, the hiring manager asks you to describe a CI/CD pipeline you set up yourself, from commit to production.',
    situationTranslation: {
      fr: "Lors d'un entretien DevOps, le responsable du recrutement vous demande de décrire un pipeline CI/CD que vous avez mis en place vous-même, du commit jusqu'à la production.",
      es: 'En una entrevista de DevOps, el responsable de contratación te pide que describas un pipeline de CI/CD que montaste tú mismo, desde el commit hasta producción.',
    },
    vocabulary: [
      {
        term: 'build artifact',
        definition: 'The output of a build, such as a Docker image or a JAR file, that is later deployed.',
        translation: { fr: 'artefact de build', es: 'artefacto de build' },
      },
      {
        term: 'container registry',
        definition: 'A service that stores and distributes container images, such as Docker images.',
        translation: { fr: 'registre de conteneurs', es: 'registro de contenedores' },
      },
      {
        term: 'smoke test',
        definition: 'A quick, basic test run after a deployment to check that the main features work.',
        translation: { fr: 'smoke test (test de fumée)', es: 'smoke test (prueba de humo)' },
      },
      {
        term: 'approval gate',
        definition: 'A step in a pipeline that waits for a person to approve before continuing.',
        translation: { fr: "étape d'approbation", es: 'puerta de aprobación' },
      },
      {
        term: 'rollback',
        definition: 'Returning a system to its previous working version after a failed release.',
        translation: { fr: 'rollback (retour arrière)', es: 'rollback (reversión)' },
      },
    ],
    expressions: [
      {
        phrase: 'The pipeline is triggered on every pull request.',
        usage: 'Use it to explain what starts the pipeline.',
        translation: {
          fr: 'Le pipeline est déclenché à chaque pull request.',
          es: 'El pipeline se activa con cada pull request.',
        },
      },
      {
        phrase: 'We build once and promote the same image through each environment.',
        usage: 'Use it to show you follow a key CI/CD good practice.',
        translation: {
          fr: 'On construit une seule fois et on promeut la même image dans chaque environnement.',
          es: 'Construimos una sola vez y promovemos la misma imagen por cada entorno.',
        },
      },
      {
        phrase: 'If anything fails, the pipeline stops and the team gets notified.',
        usage: 'Use it to explain how failures are handled.',
        translation: {
          fr: "Si quelque chose échoue, le pipeline s'arrête et l'équipe est prévenue.",
          es: 'Si algo falla, el pipeline se detiene y se avisa al equipo.',
        },
      },
      {
        phrase: 'I was responsible for...',
        usage: 'Use it to make your personal contribution clear, not just what the team did.',
        translation: { fr: "J'étais responsable de...", es: 'Yo era responsable de...' },
      },
      {
        phrase: 'As a result, we went from... to...',
        usage: 'Use it to describe a measurable improvement.',
        translation: {
          fr: 'Résultat, on est passés de... à...',
          es: 'Como resultado, pasamos de... a...',
        },
      },
    ],
    dialogue: {
      context: 'A DevOps interview with a hiring manager who used to be an SRE.',
      lines: [
        {
          speaker: 'Interviewer',
          text: 'Can you describe a CI/CD pipeline you built yourself?',
          translation: {
            fr: 'Pouvez-vous décrire un pipeline CI/CD que vous avez construit vous-même ?',
            es: '¿Puedes describir un pipeline de CI/CD que hayas construido tú mismo?',
          },
        },
        {
          speaker: 'Candidate',
          text: 'Sure. At my last job I was responsible for moving our services to GitHub Actions. The pipeline is triggered on every pull request and runs linting, unit tests and a Docker build.',
          translation: {
            fr: "Bien sûr. Dans mon dernier poste, j'étais responsable de la migration de nos services vers GitHub Actions. Le pipeline est déclenché à chaque pull request et lance le linting, les tests unitaires et un build Docker.",
            es: 'Claro. En mi último trabajo yo era responsable de pasar nuestros servicios a GitHub Actions. El pipeline se activa con cada pull request y ejecuta el linting, los tests unitarios y un build de Docker.',
          },
        },
        {
          speaker: 'Interviewer',
          text: 'And after the merge?',
          translation: { fr: 'Et après le merge ?', es: '¿Y después del merge?' },
        },
        {
          speaker: 'Candidate',
          text: 'We build the image once, tag it with the commit SHA and push it to our registry. Then it deploys automatically to staging with Helm, and we run smoke tests there.',
          translation: {
            fr: "On construit l'image une seule fois, on la tague avec le SHA du commit et on la pousse dans notre registre. Ensuite, elle se déploie automatiquement en staging avec Helm, et on y lance des smoke tests.",
            es: 'Construimos la imagen una sola vez, la etiquetamos con el SHA del commit y la subimos a nuestro registro. Después se despliega automáticamente en staging con Helm, y allí ejecutamos smoke tests.',
          },
        },
        {
          speaker: 'Interviewer',
          text: 'How did you handle secrets, like cloud credentials?',
          translation: {
            fr: 'Comment gériez-vous les secrets, comme les identifiants cloud ?',
            es: '¿Cómo gestionabas los secretos, como las credenciales de la nube?',
          },
        },
        {
          speaker: 'Candidate',
          text: "We used OIDC federation, so the pipeline gets short-lived cloud credentials instead of storing long-lived keys. Application secrets stayed in the cloud secret manager.",
          translation: {
            fr: "On utilisait la fédération OIDC, donc le pipeline obtient des identifiants cloud de courte durée au lieu de stocker des clés permanentes. Les secrets applicatifs restaient dans le gestionnaire de secrets du cloud.",
            es: 'Usábamos federación OIDC, así que el pipeline obtiene credenciales de la nube de corta duración en lugar de guardar claves permanentes. Los secretos de la aplicación se quedaban en el gestor de secretos de la nube.',
          },
        },
        {
          speaker: 'Interviewer',
          text: 'Nice. And production?',
          translation: { fr: 'Bien. Et la production ?', es: 'Bien. ¿Y producción?' },
        },
        {
          speaker: 'Candidate',
          text: 'Production has an approval gate and a rolling deployment. As a result, we went from a manual release every two weeks to several small releases a week.',
          translation: {
            fr: "La production a une étape d'approbation et un déploiement progressif. Résultat, on est passés d'une mise en production manuelle toutes les deux semaines à plusieurs petites mises en production par semaine.",
            es: 'Producción tiene una puerta de aprobación y un despliegue progresivo. Como resultado, pasamos de un despliegue manual cada dos semanas a varios despliegues pequeños por semana.',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'iv-14-q1',
        type: 'choice',
        prompt: 'Why is it good practice to build an image once and promote it through each environment?',
        options: [
          'It guarantees that production runs exactly what was tested in staging',
          'It makes the image smaller',
          'It removes the need for tests',
        ],
        correctIndex: 0,
        explanation:
          'Rebuilding for each environment can produce slightly different artifacts. Promoting the same image means you deploy what you tested.',
      },
      {
        id: 'iv-14-q2',
        type: 'fill',
        prompt: 'After deploying to staging, we run quick ___ tests to check that the main features still work.',
        options: ['load', 'smoke', 'mutation', 'fuzz'],
        correctIndex: 1,
        explanation: 'Smoke tests are fast, basic checks run right after a deployment.',
      },
      {
        id: 'iv-14-q3',
        type: 'choice',
        prompt: 'Which sentence best shows your personal contribution in an interview?',
        options: [
          'The team did a pipeline at some point.',
          'Pipelines are very important in DevOps.',
          'I was responsible for designing the pipeline and migrating our services to it.',
          'We had a pipeline, I think it used Jenkins.',
        ],
        correctIndex: 2,
        explanation:
          'Interviewers need to know what you did. "I was responsible for..." makes your role clear and specific.',
      },
    ],
    interview: {
      path: 'devops',
      question: 'Describe a CI/CD pipeline you have built.',
      questionTranslation: {
        fr: 'Décrivez un pipeline CI/CD que vous avez construit.',
        es: 'Describe un pipeline de CI/CD que hayas construido.',
      },
      explanation:
        'The interviewer is checking that you have hands-on experience, not just theory. They want to hear clear stages, sensible practices such as building once and handling secrets safely, your personal role, and the impact the pipeline had on the team.',
      explanationTranslation: {
        fr: "L'intervieweur vérifie que vous avez une expérience concrète, et pas seulement de la théorie. Il veut entendre des étapes claires, de bonnes pratiques comme construire une seule fois et gérer les secrets en toute sécurité, votre rôle personnel, et l'impact du pipeline sur l'équipe.",
        es: 'El entrevistador comprueba que tienes experiencia práctica y no solo teoría. Quiere oír etapas claras, buenas prácticas como construir una sola vez y gestionar los secretos de forma segura, tu papel personal y el impacto que tuvo el pipeline en el equipo.',
      },
      exampleAnswer:
        "At my last company, I built the pipeline for our main backend services using GitHub Actions. On every pull request, it runs linting, unit tests and a Docker build, and the PR can't be merged unless everything is green. When code is merged to main, we build the image once, tag it with the commit SHA, scan it for known vulnerabilities and push it to our registry. It then deploys automatically to staging with Helm, where we run smoke tests. Production uses the same image, behind a manual approval and a rolling update, so rolling back just means redeploying the previous tag. For credentials, we used OIDC instead of long-lived keys. Releases used to be a stressful afternoon every two weeks; afterwards, we were shipping small changes several times a week.",
      exampleAnswerTranslation: {
        fr: "Dans ma dernière entreprise, j'ai construit le pipeline de nos principaux services backend avec GitHub Actions. À chaque pull request, il lance le linting, les tests unitaires et un build Docker, et la PR ne peut pas être mergée tant que tout n'est pas vert. Quand le code est mergé sur main, on construit l'image une seule fois, on la tague avec le SHA du commit, on la scanne pour détecter les vulnérabilités connues et on la pousse dans notre registre. Elle se déploie ensuite automatiquement en staging avec Helm, où l'on lance des smoke tests. La production utilise la même image, derrière une approbation manuelle et une mise à jour progressive, donc revenir en arrière consiste simplement à redéployer le tag précédent. Pour les identifiants, on utilisait OIDC au lieu de clés permanentes. Avant, les mises en production étaient un après-midi stressant toutes les deux semaines ; ensuite, on livrait de petits changements plusieurs fois par semaine.",
        es: 'En mi última empresa, construí el pipeline de nuestros principales servicios backend con GitHub Actions. En cada pull request ejecuta el linting, los tests unitarios y un build de Docker, y la PR no se puede mergear si no está todo en verde. Cuando el código se mergea en main, construimos la imagen una sola vez, la etiquetamos con el SHA del commit, la analizamos en busca de vulnerabilidades conocidas y la subimos a nuestro registro. Después se despliega automáticamente en staging con Helm, donde ejecutamos smoke tests. Producción usa la misma imagen, tras una aprobación manual y una actualización progresiva, así que hacer rollback solo consiste en volver a desplegar el tag anterior. Para las credenciales, usábamos OIDC en lugar de claves permanentes. Antes, los despliegues eran una tarde estresante cada dos semanas; después, entregábamos cambios pequeños varias veces por semana.',
      },
      alternatives: [
        'Every merge to main produces a versioned, immutable image.',
        "Nothing reaches production that hasn't already run in staging.",
        'Rolling back is a one-click operation: we just redeploy the previous tag.',
        'My main goal was to make releases boring and predictable.',
      ],
      practice:
        'Draw the stages of a pipeline you have worked on, from commit to production. Next to each stage, write one sentence explaining why it is there. Then describe it out loud in under two minutes, ending with one concrete result.',
      selfAssessment: [
        'I described the stages in order, from pull request to production.',
        'I made my own role clear with phrases like "I built" or "I was responsible for".',
        'I mentioned how secrets and rollbacks were handled.',
        'I ended with a concrete, honest result, without exaggerating.',
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // iv-15 — DevOps: troubleshooting a pod in CrashLoopBackOff
  // ---------------------------------------------------------------------------
  {
    id: 'iv-15',
    moduleId: 'interview',
    topic: 'devops',
    title: 'Troubleshooting a pod in CrashLoopBackOff',
    titleTranslation: {
      fr: 'Diagnostiquer un pod en CrashLoopBackOff',
      es: 'Diagnosticar un pod en CrashLoopBackOff',
    },
    level: 'advanced',
    premium: true,
    estimatedMinutes: 12,
    roles: ['devops'],
    objective:
      'Explain a systematic Kubernetes debugging process and describe what each command and exit code tells you.',
    objectiveTranslation: {
      fr: "Expliquer une méthode de débogage Kubernetes systématique et décrire ce que chaque commande et chaque code de sortie vous apprend.",
      es: 'Explicar un proceso sistemático de depuración en Kubernetes y describir qué te indica cada comando y cada código de salida.',
    },
    situation:
      'In a platform engineering interview, you are given a scenario: a deployment has just been rolled out and one of the pods keeps restarting with the status CrashLoopBackOff.',
    situationTranslation: {
      fr: "Lors d'un entretien en platform engineering, on vous présente un scénario : un déploiement vient d'être lancé et l'un des pods redémarre sans arrêt avec le statut CrashLoopBackOff.",
      es: 'En una entrevista de platform engineering, te plantean un escenario: se acaba de lanzar un despliegue y uno de los pods se reinicia continuamente con el estado CrashLoopBackOff.',
    },
    vocabulary: [
      {
        term: 'CrashLoopBackOff',
        definition:
          'A Kubernetes status meaning a container keeps crashing and the kubelet waits longer and longer before restarting it.',
        translation: { fr: 'CrashLoopBackOff', es: 'CrashLoopBackOff' },
      },
      {
        term: 'exit code',
        definition: 'A number a process returns when it stops; 0 means success and other values indicate an error.',
        translation: { fr: 'code de sortie', es: 'código de salida' },
      },
      {
        term: 'OOMKilled',
        definition: 'A termination reason meaning the container used more memory than its limit and was killed.',
        translation: { fr: 'OOMKilled (tué pour manque de mémoire)', es: 'OOMKilled (terminado por falta de memoria)' },
      },
      {
        term: 'liveness probe',
        definition: 'A periodic health check; if it fails repeatedly, Kubernetes restarts the container.',
        translation: { fr: 'sonde de vivacité (liveness probe)', es: 'sonda de actividad (liveness probe)' },
      },
      {
        term: 'ephemeral container',
        definition: 'A temporary container you attach to a running pod for debugging, for example with kubectl debug.',
        translation: { fr: 'conteneur éphémère', es: 'contenedor efímero' },
      },
    ],
    expressions: [
      {
        phrase: 'My first step would be to look at the events.',
        usage: 'Use it to start your process in a calm, methodical way.',
        translation: {
          fr: 'Ma première étape serait de regarder les événements.',
          es: 'Mi primer paso sería mirar los eventos.',
        },
      },
      {
        phrase: 'That narrows it down to...',
        usage: 'Use it to show how each piece of evidence reduces the possible causes.',
        translation: { fr: 'Ça réduit les possibilités à...', es: 'Eso lo reduce a...' },
      },
      {
        phrase: "If that doesn't tell me anything, I'd...",
        usage: 'Use it to explain your next step when the first check gives no answer.',
        translation: {
          fr: "Si ça ne m'apprend rien, je...",
          es: 'Si eso no me dice nada, yo...',
        },
      },
      {
        phrase: 'The usual suspects are...',
        usage: 'Use it to list the most common causes of a problem in a natural way.',
        translation: { fr: 'Les suspects habituels sont...', es: 'Los sospechosos habituales son...' },
      },
      {
        phrase: 'Before changing anything, I want to understand why it failed.',
        usage: 'Use it to show you diagnose first instead of guessing.',
        translation: {
          fr: "Avant de changer quoi que ce soit, je veux comprendre pourquoi ça a échoué.",
          es: 'Antes de cambiar nada, quiero entender por qué falló.',
        },
      },
    ],
    dialogue: {
      context: 'A technical interview for a platform engineer, using a scenario-based question.',
      lines: [
        {
          speaker: 'Interviewer',
          text: "You've just deployed a new version and one pod is in CrashLoopBackOff. What do you do?",
          translation: {
            fr: 'Vous venez de déployer une nouvelle version et un pod est en CrashLoopBackOff. Que faites-vous ?',
            es: 'Acabas de desplegar una nueva versión y un pod está en CrashLoopBackOff. ¿Qué haces?',
          },
        },
        {
          speaker: 'Candidate',
          text: "My first step would be kubectl describe pod, to check the events, the last state and the exit code. Then kubectl logs with --previous, because the current container may have just restarted.",
          translation: {
            fr: "Ma première étape serait kubectl describe pod, pour vérifier les événements, le dernier état et le code de sortie. Ensuite kubectl logs avec --previous, parce que le conteneur actuel vient peut-être de redémarrer.",
            es: 'Mi primer paso sería kubectl describe pod, para revisar los eventos, el último estado y el código de salida. Después kubectl logs con --previous, porque puede que el contenedor actual se acabe de reiniciar.',
          },
        },
        {
          speaker: 'Interviewer',
          text: 'Say the exit code is 137.',
          translation: {
            fr: 'Disons que le code de sortie est 137.',
            es: 'Digamos que el código de salida es 137.',
          },
        },
        {
          speaker: 'Candidate',
          text: 'That means the process got a SIGKILL. If the reason says OOMKilled, it hit its memory limit, so I\'d compare the limit with real usage. If not, a failing liveness probe is a common cause.',
          translation: {
            fr: "Ça veut dire que le processus a reçu un SIGKILL. Si la raison indique OOMKilled, il a atteint sa limite mémoire, donc je comparerais la limite avec la consommation réelle. Sinon, une liveness probe qui échoue est une cause fréquente.",
            es: 'Eso significa que el proceso recibió un SIGKILL. Si el motivo dice OOMKilled, llegó a su límite de memoria, así que compararía el límite con el uso real. Si no, una liveness probe que falla es una causa habitual.',
          },
        },
        {
          speaker: 'Interviewer',
          text: 'And if the logs are completely empty?',
          translation: {
            fr: 'Et si les logs sont complètement vides ?',
            es: '¿Y si los logs están completamente vacíos?',
          },
        },
        {
          speaker: 'Candidate',
          text: "Then the container probably dies before the app even starts logging. The usual suspects are a wrong command or entrypoint, a missing ConfigMap or Secret, or a bad environment variable.",
          translation: {
            fr: "Alors le conteneur meurt probablement avant même que l'application commence à écrire des logs. Les suspects habituels sont une mauvaise commande ou un mauvais entrypoint, une ConfigMap ou un Secret manquant, ou une variable d'environnement incorrecte.",
            es: 'Entonces probablemente el contenedor muere antes de que la aplicación empiece a escribir logs. Los sospechosos habituales son un comando o entrypoint incorrecto, un ConfigMap o Secret que falta, o una variable de entorno errónea.',
          },
        },
        {
          speaker: 'Interviewer',
          text: 'How would you confirm that?',
          translation: { fr: 'Comment le confirmeriez-vous ?', es: '¿Cómo lo confirmarías?' },
        },
        {
          speaker: 'Candidate',
          text: "I'd use kubectl debug to start a copy of the pod with the command replaced by a sleep, then exec in and run the entrypoint by hand to see the real error.",
          translation: {
            fr: "J'utiliserais kubectl debug pour lancer une copie du pod en remplaçant la commande par un sleep, puis je m'y connecterais avec exec pour lancer l'entrypoint à la main et voir la vraie erreur.",
            es: 'Usaría kubectl debug para arrancar una copia del pod con el comando sustituido por un sleep, luego entraría con exec y ejecutaría el entrypoint a mano para ver el error real.',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'iv-15-q1',
        type: 'choice',
        prompt: 'Which command shows the logs of the container instance that crashed before the current restart?',
        options: [
          'kubectl get pods --watch',
          'kubectl rollout status',
          'kubectl top pod',
          'kubectl logs <pod> --previous',
        ],
        correctIndex: 3,
        explanation:
          'The --previous flag returns logs from the last terminated container, which is usually where the crash message is.',
      },
      {
        id: 'iv-15-q2',
        type: 'fill',
        prompt: 'If the termination reason is OOMKilled, the container exceeded its memory ___.',
        options: ['request', 'limit', 'quota', 'probe'],
        correctIndex: 1,
        explanation:
          'A container is OOM-killed when it goes above its memory limit. The request is only used for scheduling.',
      },
      {
        id: 'iv-15-q3',
        type: 'choice',
        prompt: 'Which phrase best shows a methodical approach in a troubleshooting interview?',
        options: [
          "I'd just restart the whole cluster.",
          "Before changing anything, I want to understand why it failed.",
          "I'd probably delete the deployment and try again.",
        ],
        correctIndex: 1,
        explanation:
          'Interviewers want to see that you gather evidence before acting, instead of guessing or taking risky actions.',
      },
    ],
    interview: {
      path: 'devops',
      question: 'How do you troubleshoot a pod in CrashLoopBackOff?',
      questionTranslation: {
        fr: 'Comment diagnostiquez-vous un pod en CrashLoopBackOff ?',
        es: '¿Cómo diagnosticas un pod en CrashLoopBackOff?',
      },
      explanation:
        'The interviewer is checking that you know Kubernetes well enough to debug under pressure. They listen for a methodical order, the right commands, the ability to interpret exit codes and termination reasons, and a plan for when the obvious checks give no answer.',
      explanationTranslation: {
        fr: "L'intervieweur vérifie que vous connaissez assez bien Kubernetes pour déboguer sous pression. Il attend un ordre méthodique, les bonnes commandes, la capacité à interpréter les codes de sortie et les raisons d'arrêt, et un plan pour le cas où les vérifications évidentes ne donnent rien.",
        es: 'El entrevistador comprueba que conoces Kubernetes lo bastante bien como para depurar bajo presión. Busca un orden metódico, los comandos correctos, la capacidad de interpretar los códigos de salida y los motivos de terminación, y un plan para cuando las comprobaciones obvias no dan respuesta.',
      },
      exampleAnswer:
        "CrashLoopBackOff just means the container keeps exiting and Kubernetes is backing off between restarts, so my job is to find out why it exits. I start with kubectl describe pod to see the events, the last state, the exit code and the termination reason. Then I check kubectl logs with the --previous flag, since that shows the output of the container that actually crashed. The exit code narrows it down: 137 usually means it was killed, often OOMKilled or a failing liveness probe, while 1 points to an application error. If the logs are empty, I look at configuration: a wrong command, a missing Secret or ConfigMap, or an environment variable. If I still can't see it, I use kubectl debug to run a copy with a sleep command and start the app by hand.",
      exampleAnswerTranslation: {
        fr: "CrashLoopBackOff veut simplement dire que le conteneur s'arrête sans cesse et que Kubernetes espace de plus en plus les redémarrages, donc mon travail est de comprendre pourquoi il s'arrête. Je commence par kubectl describe pod pour voir les événements, le dernier état, le code de sortie et la raison de l'arrêt. Ensuite, je regarde kubectl logs avec l'option --previous, puisqu'elle montre la sortie du conteneur qui a vraiment planté. Le code de sortie réduit les possibilités : 137 signifie généralement qu'il a été tué, souvent OOMKilled ou à cause d'une liveness probe qui échoue, alors que 1 indique une erreur applicative. Si les logs sont vides, je regarde la configuration : une mauvaise commande, un Secret ou une ConfigMap manquant, ou une variable d'environnement. Si je ne vois toujours rien, j'utilise kubectl debug pour lancer une copie avec une commande sleep et démarrer l'application à la main.",
        es: 'CrashLoopBackOff solo significa que el contenedor se cierra una y otra vez y que Kubernetes espera cada vez más entre reinicios, así que mi trabajo es averiguar por qué se cierra. Empiezo con kubectl describe pod para ver los eventos, el último estado, el código de salida y el motivo de terminación. Después reviso kubectl logs con la opción --previous, ya que muestra la salida del contenedor que realmente falló. El código de salida lo acota: 137 suele significar que lo mataron, a menudo por OOMKilled o por una liveness probe que falla, mientras que 1 apunta a un error de la aplicación. Si los logs están vacíos, miro la configuración: un comando incorrecto, un Secret o ConfigMap que falta, o una variable de entorno. Si aun así no lo veo, uso kubectl debug para ejecutar una copia con un comando sleep y arrancar la aplicación a mano.',
      },
      alternatives: [
        "The status itself isn't the error; it's a symptom that the container keeps exiting.",
        'I always check the previous container logs, because the current one may have nothing yet.',
        'An exit code of 137 tells me to look at memory limits and probes first.',
        "If it's a fresh rollout, I'd also compare the new manifest with the last working version.",
      ],
      practice:
        'Write a short troubleshooting checklist for CrashLoopBackOff with at least five commands or checks, in order. Then explain it out loud as if you were guiding a junior colleague on a call, using phrases like "My first step would be" and "That narrows it down to".',
      selfAssessment: [
        'I explained what CrashLoopBackOff actually means before jumping into commands.',
        'I mentioned kubectl describe and kubectl logs --previous.',
        'I interpreted at least one exit code or termination reason correctly.',
        'I had a next step for when the logs are empty.',
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // iv-16 — DevOps: explaining infrastructure as code
  // ---------------------------------------------------------------------------
  {
    id: 'iv-16',
    moduleId: 'interview',
    topic: 'devops',
    title: 'Explaining infrastructure as code',
    titleTranslation: {
      fr: "Expliquer l'infrastructure as code",
      es: 'Explicar la infraestructura como código',
    },
    level: 'intermediate',
    premium: true,
    estimatedMinutes: 9,
    roles: ['devops'],
    objective:
      'Define infrastructure as code clearly, explain its benefits and describe how you work with Terraform state and drift.',
    objectiveTranslation: {
      fr: "Définir clairement l'infrastructure as code, expliquer ses avantages et décrire comment vous travaillez avec l'état Terraform et la dérive de configuration.",
      es: 'Definir con claridad la infraestructura como código, explicar sus ventajas y describir cómo trabajas con el estado de Terraform y la deriva de configuración.',
    },
    situation:
      'In a DevOps interview, the interviewer asks you to explain infrastructure as code as if they were a developer who has only ever created servers by clicking in a cloud console.',
    situationTranslation: {
      fr: "Lors d'un entretien DevOps, l'intervieweur vous demande d'expliquer l'infrastructure as code comme s'il était un développeur qui n'a jamais créé de serveurs qu'en cliquant dans une console cloud.",
      es: 'En una entrevista de DevOps, el entrevistador te pide que expliques la infraestructura como código como si fuera un desarrollador que solo ha creado servidores haciendo clic en una consola de la nube.',
    },
    vocabulary: [
      {
        term: 'declarative',
        definition: 'Describing the desired end state and letting the tool work out the steps to reach it.',
        translation: { fr: 'déclaratif', es: 'declarativo' },
      },
      {
        term: 'state file',
        definition:
          'A file where a tool like Terraform records which real resources it manages and their current attributes.',
        translation: { fr: "fichier d'état (state file)", es: 'archivo de estado (state file)' },
      },
      {
        term: 'drift',
        definition: 'A difference between the infrastructure described in code and what actually exists in the cloud.',
        translation: { fr: 'dérive (drift)', es: 'deriva (drift)' },
      },
      {
        term: 'module',
        definition: 'A reusable, parameterized block of infrastructure code, such as a standard network or database setup.',
        translation: { fr: 'module', es: 'módulo' },
      },
      {
        term: 'state locking',
        definition: 'A mechanism that prevents two people or pipelines from changing the same state at the same time.',
        translation: { fr: "verrouillage de l'état", es: 'bloqueo del estado' },
      },
    ],
    expressions: [
      {
        phrase: 'In a nutshell, ...',
        usage: 'Use it to give a short, simple definition before going into detail.',
        translation: { fr: 'En résumé, ...', es: 'En pocas palabras, ...' },
      },
      {
        phrase: 'Instead of clicking around in the console, we...',
        usage: 'Use it to contrast the manual approach with the code-based one.',
        translation: {
          fr: 'Au lieu de cliquer un peu partout dans la console, on...',
          es: 'En lugar de ir haciendo clic por la consola, nosotros...',
        },
      },
      {
        phrase: 'The real benefit is that changes go through code review.',
        usage: 'Use it to highlight the most important advantage for a team.',
        translation: {
          fr: 'Le vrai avantage, c\'est que les changements passent par la code review.',
          es: 'La verdadera ventaja es que los cambios pasan por code review.',
        },
      },
      {
        phrase: 'Before applying anything, I always look at the plan.',
        usage: 'Use it to show that you work carefully with infrastructure changes.',
        translation: {
          fr: "Avant d'appliquer quoi que ce soit, je regarde toujours le plan.",
          es: 'Antes de aplicar nada, siempre reviso el plan.',
        },
      },
      {
        phrase: 'One thing to watch out for is...',
        usage: 'Use it to introduce a common pitfall.',
        translation: {
          fr: 'Une chose à surveiller, c\'est...',
          es: 'Algo con lo que hay que tener cuidado es...',
        },
      },
    ],
    dialogue: {
      context: 'A DevOps interview where the interviewer plays the role of a developer new to cloud infrastructure.',
      lines: [
        {
          speaker: 'Interviewer',
          text: "Let's say I've only ever created servers by hand in the console. How would you explain infrastructure as code to me?",
          translation: {
            fr: "Disons que je n'ai jamais créé de serveurs qu'à la main dans la console. Comment m'expliqueriez-vous l'infrastructure as code ?",
            es: 'Digamos que solo he creado servidores a mano en la consola. ¿Cómo me explicarías la infraestructura como código?',
          },
        },
        {
          speaker: 'Candidate',
          text: 'In a nutshell, instead of clicking around in the console, we describe the servers, networks and databases in files, and a tool like Terraform creates them for us.',
          translation: {
            fr: "En résumé, au lieu de cliquer un peu partout dans la console, on décrit les serveurs, les réseaux et les bases de données dans des fichiers, et un outil comme Terraform les crée pour nous.",
            es: 'En pocas palabras, en lugar de ir haciendo clic por la consola, describimos los servidores, las redes y las bases de datos en archivos, y una herramienta como Terraform los crea por nosotros.',
          },
        },
        {
          speaker: 'Interviewer',
          text: 'Why is that better than a good wiki page with instructions?',
          translation: {
            fr: "Pourquoi est-ce mieux qu'une bonne page de wiki avec des instructions ?",
            es: '¿Por qué es mejor que una buena página de wiki con instrucciones?',
          },
        },
        {
          speaker: 'Candidate',
          text: "Because the code is the documentation, and it can't go out of date. The real benefit is that changes go through code review, and we can recreate the same environment any time.",
          translation: {
            fr: "Parce que le code est la documentation, et il ne peut pas devenir obsolète. Le vrai avantage, c'est que les changements passent par la code review, et qu'on peut recréer le même environnement à tout moment.",
            es: 'Porque el código es la documentación y no puede quedarse desactualizado. La verdadera ventaja es que los cambios pasan por code review y podemos recrear el mismo entorno en cualquier momento.',
          },
        },
        {
          speaker: 'Interviewer',
          text: 'What happens if someone still changes something by hand?',
          translation: {
            fr: "Que se passe-t-il si quelqu'un modifie quand même quelque chose à la main ?",
            es: '¿Qué pasa si alguien aun así cambia algo a mano?',
          },
        },
        {
          speaker: 'Candidate',
          text: "That's called drift. The next terraform plan will show the difference, and we either bring the change into the code or let Terraform revert it.",
          translation: {
            fr: "C'est ce qu'on appelle la dérive. Le prochain terraform plan montrera la différence, et soit on intègre le changement dans le code, soit on laisse Terraform l'annuler.",
            es: 'Eso se llama deriva. El siguiente terraform plan mostrará la diferencia, y o bien llevamos el cambio al código o dejamos que Terraform lo revierta.',
          },
        },
        {
          speaker: 'Interviewer',
          text: 'And how do you stop it from happening in the first place?',
          translation: {
            fr: 'Et comment empêchez-vous que ça arrive au départ ?',
            es: '¿Y cómo evitas que ocurra desde el principio?',
          },
        },
        {
          speaker: 'Candidate',
          text: 'Mostly by limiting write access in the console to emergencies, and running the plan in CI on a schedule so drift shows up quickly.',
          translation: {
            fr: "Surtout en limitant l'accès en écriture à la console aux urgences, et en lançant le plan dans la CI de façon planifiée pour que la dérive apparaisse rapidement.",
            es: 'Sobre todo limitando el acceso de escritura en la consola a las emergencias y ejecutando el plan en la CI de forma programada para que la deriva aparezca rápido.',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'iv-16-q1',
        type: 'choice',
        prompt: 'What does "drift" mean in the context of infrastructure as code?',
        options: [
          'The real infrastructure no longer matches what is described in the code',
          'A slow increase in cloud costs over time',
          'Moving servers from one region to another',
          'A delay between a commit and a deployment',
        ],
        correctIndex: 0,
        explanation:
          'Drift happens when someone or something changes resources outside the code, so reality and code disagree.',
      },
      {
        id: 'iv-16-q2',
        type: 'fill',
        prompt: 'Terraform is ___: you describe the end state and it works out the steps.',
        options: ['imperative', 'interactive', 'declarative', 'procedural'],
        correctIndex: 2,
        explanation:
          'A declarative tool focuses on what you want, not on the sequence of commands to get there.',
      },
      {
        id: 'iv-16-q3',
        type: 'choice',
        prompt: 'Why should the Terraform state file be stored remotely with locking in a team?',
        options: [
          'Because local files cannot contain JSON',
          'So that two people cannot apply conflicting changes at the same time',
          'Because remote storage makes Terraform run faster',
        ],
        correctIndex: 1,
        explanation:
          'Remote state gives everyone the same view, and locking prevents concurrent applies from corrupting it.',
      },
    ],
    interview: {
      path: 'devops',
      question: 'Explain infrastructure as code.',
      questionTranslation: {
        fr: "Expliquez l'infrastructure as code.",
        es: 'Explica la infraestructura como código.',
      },
      explanation:
        'The interviewer is checking whether you can explain a core DevOps concept simply and accurately, and whether you have used it in practice. They want to hear the benefits for a team, not just a definition, and some awareness of real-world issues such as state management and drift.',
      explanationTranslation: {
        fr: "L'intervieweur vérifie si vous savez expliquer un concept DevOps fondamental de façon simple et exacte, et si vous l'avez utilisé en pratique. Il veut entendre les avantages pour une équipe, et pas seulement une définition, ainsi qu'une conscience des problèmes concrets comme la gestion de l'état et la dérive.",
        es: 'El entrevistador comprueba si sabes explicar un concepto básico de DevOps de forma sencilla y precisa, y si lo has usado en la práctica. Quiere oír las ventajas para un equipo, no solo una definición, y cierto conocimiento de problemas reales como la gestión del estado y la deriva.',
      },
      exampleAnswer:
        "Infrastructure as code means we define our infrastructure, things like networks, servers, databases and permissions, in version-controlled files instead of creating them by hand. With a declarative tool like Terraform, we describe the state we want, and the tool compares it with what exists and works out what to create, change or delete. For a team, the main benefits are that every change goes through a pull request and review, environments are reproducible, and the code itself documents the setup. In practice, I store the state remotely with locking, split common pieces into modules, and always review the plan before applying, ideally in CI. One thing to watch out for is drift, when someone changes a resource in the console. We run scheduled plans to detect it and keep console write access for emergencies only.",
      exampleAnswerTranslation: {
        fr: "L'infrastructure as code, c'est définir notre infrastructure, comme les réseaux, les serveurs, les bases de données et les permissions, dans des fichiers versionnés au lieu de la créer à la main. Avec un outil déclaratif comme Terraform, on décrit l'état souhaité, et l'outil le compare avec l'existant et détermine ce qu'il faut créer, modifier ou supprimer. Pour une équipe, les principaux avantages sont que chaque changement passe par une pull request et une revue, que les environnements sont reproductibles, et que le code lui-même documente la configuration. En pratique, je stocke l'état à distance avec un verrouillage, je regroupe les éléments communs dans des modules, et je relis toujours le plan avant de l'appliquer, idéalement dans la CI. Une chose à surveiller, c'est la dérive, quand quelqu'un modifie une ressource dans la console. On lance des plans planifiés pour la détecter et on réserve l'accès en écriture à la console aux urgences.",
        es: 'La infraestructura como código significa definir nuestra infraestructura, como redes, servidores, bases de datos y permisos, en archivos bajo control de versiones en lugar de crearla a mano. Con una herramienta declarativa como Terraform, describimos el estado que queremos y la herramienta lo compara con lo que existe y decide qué crear, cambiar o eliminar. Para un equipo, las principales ventajas son que cada cambio pasa por una pull request y una revisión, que los entornos son reproducibles y que el propio código documenta la configuración. En la práctica, guardo el estado en remoto con bloqueo, separo las piezas comunes en módulos y siempre reviso el plan antes de aplicarlo, idealmente en la CI. Algo con lo que hay que tener cuidado es la deriva, cuando alguien cambia un recurso en la consola. Ejecutamos planes programados para detectarla y reservamos el acceso de escritura en la consola solo para emergencias.',
      },
      alternatives: [
        'We treat infrastructure the same way we treat application code: versioned, reviewed and tested.',
        'If our staging environment disappeared tomorrow, we could rebuild it from the repository.',
        "The plan is basically a diff between what we have and what we want.",
        'I prefer small, frequent infrastructure changes to big, risky ones.',
      ],
      practice:
        'Explain infrastructure as code twice: first to a non-technical manager in three sentences, then to a senior engineer in about ninety seconds, mentioning state, plan and drift. Notice how your vocabulary changes between the two versions.',
      selfAssessment: [
        'I gave a short, clear definition before going into details.',
        'I explained at least two benefits for a team, not just for me.',
        'I mentioned state management and reviewing the plan before applying.',
        'I explained what drift is and how to detect or prevent it.',
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // iv-17 — QA: deciding what to test
  // ---------------------------------------------------------------------------
  {
    id: 'iv-17',
    moduleId: 'interview',
    topic: 'qa',
    title: 'Explaining how you decide what to test',
    titleTranslation: {
      fr: 'Expliquer comment vous décidez quoi tester',
      es: 'Explicar cómo decides qué probar',
    },
    level: 'intermediate',
    premium: false,
    estimatedMinutes: 9,
    roles: ['qa'],
    objective:
      'Describe a risk-based approach to test planning and explain how you prioritize and communicate when time is limited.',
    objectiveTranslation: {
      fr: 'Décrire une approche de planification des tests basée sur les risques et expliquer comment vous priorisez et communiquez quand le temps est limité.',
      es: 'Describir un enfoque de planificación de pruebas basado en riesgos y explicar cómo priorizas y comunicas cuando el tiempo es limitado.',
    },
    situation:
      'You are interviewing for a QA engineer role. The interviewer asks how you decide what to test when a new feature arrives with a deadline.',
    situationTranslation: {
      fr: "Vous passez un entretien pour un poste d'ingénieur QA. L'intervieweur vous demande comment vous décidez quoi tester quand une nouvelle fonctionnalité arrive avec une échéance.",
      es: 'Estás en una entrevista para un puesto de ingeniero de QA. El entrevistador te pregunta cómo decides qué probar cuando llega una nueva funcionalidad con fecha límite.',
    },
    vocabulary: [
      {
        term: 'risk-based testing',
        definition: 'Prioritizing tests according to how likely a failure is and how much damage it would cause.',
        translation: { fr: 'test basé sur les risques', es: 'pruebas basadas en riesgos' },
      },
      {
        term: 'acceptance criteria',
        definition: 'The conditions a feature must meet for the product owner to consider it done.',
        translation: { fr: "critères d'acceptation", es: 'criterios de aceptación' },
      },
      {
        term: 'critical path',
        definition: 'The main user journeys that the business depends on, such as sign-up or checkout.',
        translation: { fr: 'parcours critique', es: 'flujo crítico' },
      },
      {
        term: 'regression',
        definition: 'A bug where something that used to work stops working after a change.',
        translation: { fr: 'régression', es: 'regresión' },
      },
      {
        term: 'test coverage',
        definition: 'How much of the functionality or code is exercised by tests.',
        translation: { fr: 'couverture de tests', es: 'cobertura de pruebas' },
      },
    ],
    expressions: [
      {
        phrase: "We can't test everything, so I start with risk.",
        usage: 'Use it to open your answer with a realistic, professional principle.',
        translation: {
          fr: 'On ne peut pas tout tester, donc je commence par les risques.',
          es: 'No podemos probarlo todo, así que empiezo por los riesgos.',
        },
      },
      {
        phrase: 'What would hurt users the most if it broke?',
        usage: 'Use it to show the question you ask yourself when prioritizing.',
        translation: {
          fr: "Qu'est-ce qui pénaliserait le plus les utilisateurs si ça cassait ?",
          es: '¿Qué afectaría más a los usuarios si se rompiera?',
        },
      },
      {
        phrase: 'I usually check with the developers which areas they touched.',
        usage: 'Use it to show you collaborate with the team instead of testing in isolation.',
        translation: {
          fr: 'Je vérifie généralement avec les développeurs quelles zones ils ont modifiées.',
          es: 'Normalmente consulto con los desarrolladores qué zonas han tocado.',
        },
      },
      {
        phrase: "I make it visible what we haven't covered.",
        usage: 'Use it to show you communicate remaining risks honestly.',
        translation: {
          fr: "Je rends visible ce qu'on n'a pas couvert.",
          es: 'Hago visible lo que no hemos cubierto.',
        },
      },
      {
        phrase: "It's a conscious decision, not something we forgot.",
        usage: 'Use it to explain why some things are deliberately left out of testing.',
        translation: {
          fr: "C'est une décision consciente, pas un oubli.",
          es: 'Es una decisión consciente, no algo que se nos olvidó.',
        },
      },
    ],
    dialogue: {
      context: 'A QA interview with a test lead for an e-commerce team.',
      lines: [
        {
          speaker: 'Interviewer',
          text: 'A new feature lands two days before release. How do you decide what to test?',
          translation: {
            fr: 'Une nouvelle fonctionnalité arrive deux jours avant la mise en production. Comment décidez-vous quoi tester ?',
            es: 'Llega una nueva funcionalidad dos días antes del lanzamiento. ¿Cómo decides qué probar?',
          },
        },
        {
          speaker: 'Candidate',
          text: "We can't test everything, so I start with risk. I ask myself what would hurt users the most if it broke, and how likely it is to break.",
          translation: {
            fr: "On ne peut pas tout tester, donc je commence par les risques. Je me demande ce qui pénaliserait le plus les utilisateurs si ça cassait, et quelle est la probabilité que ça casse.",
            es: 'No podemos probarlo todo, así que empiezo por los riesgos. Me pregunto qué afectaría más a los usuarios si se rompiera y qué probabilidad hay de que se rompa.',
          },
        },
        {
          speaker: 'Interviewer',
          text: 'How do you judge how likely it is?',
          translation: {
            fr: 'Comment évaluez-vous cette probabilité ?',
            es: '¿Cómo valoras esa probabilidad?',
          },
        },
        {
          speaker: 'Candidate',
          text: 'I usually check with the developers which areas they touched, and I look at the bug history. Code that is new, complex or full of past bugs gets more attention.',
          translation: {
            fr: "Je vérifie généralement avec les développeurs quelles zones ils ont modifiées, et je regarde l'historique des bugs. Le code nouveau, complexe ou qui a déjà eu beaucoup de bugs reçoit plus d'attention.",
            es: 'Normalmente consulto con los desarrolladores qué zonas han tocado y miro el historial de bugs. El código nuevo, complejo o con muchos bugs en el pasado recibe más atención.',
          },
        },
        {
          speaker: 'Interviewer',
          text: "And if two days really isn't enough?",
          translation: {
            fr: 'Et si deux jours ne suffisent vraiment pas ?',
            es: '¿Y si dos días de verdad no son suficientes?',
          },
        },
        {
          speaker: 'Candidate',
          text: "Then I cover the critical paths first, like checkout and payment, and I make it visible what we haven't covered. The product owner can then decide if the risk is acceptable.",
          translation: {
            fr: "Alors je couvre d'abord les parcours critiques, comme la commande et le paiement, et je rends visible ce qu'on n'a pas couvert. Le product owner peut ensuite décider si le risque est acceptable.",
            es: 'Entonces cubro primero los flujos críticos, como el checkout y el pago, y hago visible lo que no hemos cubierto. Así el product owner puede decidir si el riesgo es aceptable.',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'iv-17-q1',
        type: 'choice',
        prompt: 'In risk-based testing, which two factors are usually combined to set priority?',
        options: [
          'Number of developers and sprint length',
          'Lines of code and test execution time',
          'Likelihood of failure and impact of failure',
          'Browser version and screen size',
        ],
        correctIndex: 2,
        explanation:
          'Risk is typically assessed as how likely something is to fail multiplied by how serious the consequences would be.',
      },
      {
        id: 'iv-17-q2',
        type: 'fill',
        prompt: 'A bug where a feature that used to work stops working after a change is called a ___.',
        options: ['regression', 'deviation', 'recession', 'reversal'],
        correctIndex: 0,
        explanation: '"Regression" is the standard testing term for a previously working feature that breaks.',
      },
      {
        id: 'iv-17-q3',
        type: 'choice',
        prompt: 'You do not have time to test a low-risk area. What is the most professional thing to say?',
        options: [
          "Don't worry, it's probably fine.",
          "I'll skip it and nobody will notice.",
          "We haven't tested the export screen; it's low risk, but I wanted you to know before we decide.",
        ],
        correctIndex: 2,
        explanation:
          'Being transparent about untested areas lets stakeholders make an informed decision about the risk.',
      },
    ],
    interview: {
      path: 'qa',
      question: 'How do you decide what to test?',
      questionTranslation: {
        fr: 'Comment décidez-vous quoi tester ?',
        es: '¿Cómo decides qué probar?',
      },
      explanation:
        'The interviewer is checking whether you think strategically rather than trying to test everything equally. They want to hear a clear prioritization method, collaboration with developers and product, and honest communication about what remains untested.',
      explanationTranslation: {
        fr: "L'intervieweur vérifie si vous pensez de manière stratégique au lieu d'essayer de tout tester de la même façon. Il veut entendre une méthode de priorisation claire, une collaboration avec les développeurs et le produit, et une communication honnête sur ce qui reste non testé.",
        es: 'El entrevistador comprueba si piensas de forma estratégica en lugar de intentar probarlo todo por igual. Quiere oír un método claro de priorización, colaboración con desarrolladores y producto, y una comunicación honesta sobre lo que queda sin probar.',
      },
      exampleAnswer:
        "Since we can never test everything, I start with risk. First, I read the acceptance criteria and ask the product owner which user journeys matter most to the business, like sign-up or checkout. Then I talk to the developers about what they changed, because new or complex code and areas with a history of bugs are more likely to break. I combine those two things, impact and likelihood, to decide where to go deep and where a quick check is enough. I also think about the right level: business rules are often better covered by unit or API tests, while I focus manual and end-to-end testing on real user flows. If time runs out, I make the gaps visible, so leaving something untested is a conscious decision by the team, not an accident.",
      exampleAnswerTranslation: {
        fr: "Comme on ne peut jamais tout tester, je commence par les risques. D'abord, je lis les critères d'acceptation et je demande au product owner quels parcours utilisateur comptent le plus pour le business, comme l'inscription ou la commande. Ensuite, je parle avec les développeurs de ce qu'ils ont modifié, parce que le code nouveau ou complexe et les zones qui ont déjà eu des bugs ont plus de chances de casser. Je combine ces deux éléments, l'impact et la probabilité, pour décider où aller en profondeur et où une vérification rapide suffit. Je réfléchis aussi au bon niveau : les règles métier sont souvent mieux couvertes par des tests unitaires ou d'API, alors que je concentre les tests manuels et end-to-end sur les vrais parcours utilisateur. Si le temps manque, je rends les lacunes visibles, pour que ne pas tester quelque chose soit une décision consciente de l'équipe, et non un accident.",
        es: 'Como nunca podemos probarlo todo, empiezo por los riesgos. Primero, leo los criterios de aceptación y le pregunto al product owner qué recorridos de usuario son más importantes para el negocio, como el registro o el checkout. Después hablo con los desarrolladores sobre lo que han cambiado, porque el código nuevo o complejo y las zonas con historial de bugs tienen más probabilidades de romperse. Combino esos dos factores, impacto y probabilidad, para decidir dónde profundizar y dónde basta con una comprobación rápida. También pienso en el nivel adecuado: las reglas de negocio suelen cubrirse mejor con tests unitarios o de API, mientras que yo centro las pruebas manuales y end-to-end en los flujos reales de usuario. Si se acaba el tiempo, hago visibles los huecos, para que dejar algo sin probar sea una decisión consciente del equipo y no un accidente.',
      },
      alternatives: [
        'My starting point is always: what is the worst thing that could happen to a user here?',
        'I look at where the code changed and where bugs have appeared before.',
        "Not every check needs to be an end-to-end test; I try to push tests down to the cheapest level that works.",
        'I would rather report a known gap than give false confidence.',
      ],
      practice:
        'Choose a feature from an app you use every day, such as a password reset. List eight possible tests, then rank them by impact and likelihood. Explain out loud in about ninety seconds which three you would run first and why.',
      selfAssessment: [
        'I explained that testing is prioritized by risk, not done equally everywhere.',
        'I mentioned both impact and likelihood of failure.',
        'I showed collaboration with developers and the product owner.',
        'I explained how I communicate what is not tested.',
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // iv-18 — QA: a bug you found and how you reported it
  // ---------------------------------------------------------------------------
  {
    id: 'iv-18',
    moduleId: 'interview',
    topic: 'qa',
    title: 'Describing a bug you found and reported',
    titleTranslation: {
      fr: 'Décrire un bug que vous avez trouvé et signalé',
      es: 'Describir un bug que encontraste y reportaste',
    },
    level: 'intermediate',
    premium: true,
    estimatedMinutes: 10,
    roles: ['qa'],
    objective:
      'Tell a clear story about a real bug and explain what makes a bug report useful for developers.',
    objectiveTranslation: {
      fr: 'Raconter clairement l\'histoire d\'un vrai bug et expliquer ce qui rend un rapport de bug utile pour les développeurs.',
      es: 'Contar con claridad la historia de un bug real y explicar qué hace que un informe de bug sea útil para los desarrolladores.',
    },
    situation:
      'In a QA interview, the interviewer asks for a concrete example of a bug you found, how you investigated it and how you reported it.',
    situationTranslation: {
      fr: "Lors d'un entretien QA, l'intervieweur vous demande un exemple concret de bug que vous avez trouvé, comment vous l'avez analysé et comment vous l'avez signalé.",
      es: 'En una entrevista de QA, el entrevistador te pide un ejemplo concreto de un bug que encontraste, cómo lo investigaste y cómo lo reportaste.',
    },
    vocabulary: [
      {
        term: 'steps to reproduce',
        definition: 'The exact sequence of actions someone can follow to make the bug happen again.',
        translation: { fr: 'étapes pour reproduire', es: 'pasos para reproducir' },
      },
      {
        term: 'expected vs. actual result',
        definition: 'What should have happened compared with what really happened.',
        translation: { fr: 'résultat attendu / résultat obtenu', es: 'resultado esperado / resultado obtenido' },
      },
      {
        term: 'severity',
        definition: 'How serious the impact of a bug is on users or the business.',
        translation: { fr: 'gravité (sévérité)', es: 'gravedad (severidad)' },
      },
      {
        term: 'priority',
        definition: 'How soon the team should fix a bug, decided together with the product owner.',
        translation: { fr: 'priorité', es: 'prioridad' },
      },
      {
        term: 'race condition',
        definition: 'A bug that appears when the result depends on the timing or order of events.',
        translation: { fr: 'situation de concurrence (race condition)', es: 'condición de carrera' },
      },
    ],
    expressions: [
      {
        phrase: 'I came across it while I was doing exploratory testing on...',
        usage: 'Use it to set the scene and explain how you found the bug.',
        translation: {
          fr: "Je suis tombé dessus en faisant des tests exploratoires sur...",
          es: 'Me lo encontré mientras hacía pruebas exploratorias en...',
        },
      },
      {
        phrase: 'At first I could only reproduce it occasionally.',
        usage: 'Use it to show that you investigated patiently when a bug was not obvious.',
        translation: {
          fr: "Au début, je n'arrivais à le reproduire que de temps en temps.",
          es: 'Al principio solo conseguía reproducirlo de vez en cuando.',
        },
      },
      {
        phrase: 'I wrote it up with clear steps, expected and actual results.',
        usage: 'Use it to describe the structure of a good bug report.',
        translation: {
          fr: "Je l'ai rédigé avec des étapes claires, le résultat attendu et le résultat obtenu.",
          es: 'Lo documenté con pasos claros y los resultados esperado y obtenido.',
        },
      },
      {
        phrase: 'I flagged it as high severity because...',
        usage: 'Use it to justify how serious you considered the bug.',
        translation: {
          fr: "Je l'ai classé en gravité élevée parce que...",
          es: 'Lo marqué con gravedad alta porque...',
        },
      },
      {
        phrase: 'Afterwards, we added a regression test so it would not come back.',
        usage: 'Use it to show you think about prevention, not only detection.',
        translation: {
          fr: "Ensuite, on a ajouté un test de non-régression pour qu'il ne revienne pas.",
          es: 'Después añadimos un test de regresión para que no volviera a aparecer.',
        },
      },
    ],
    dialogue: {
      context: 'A QA interview, using a behavioral question about past experience.',
      lines: [
        {
          speaker: 'Interviewer',
          text: 'Tell me about a bug you found that you are proud of.',
          translation: {
            fr: 'Parlez-moi d\'un bug que vous avez trouvé et dont vous êtes fier.',
            es: 'Háblame de un bug que encontraste y del que estés orgulloso.',
          },
        },
        {
          speaker: 'Candidate',
          text: 'I came across it while I was doing exploratory testing on our checkout. Sometimes a discount code was applied twice, so the customer paid less than they should.',
          translation: {
            fr: "Je suis tombé dessus en faisant des tests exploratoires sur notre tunnel de commande. Parfois, un code de réduction était appliqué deux fois, donc le client payait moins que prévu.",
            es: 'Me lo encontré mientras hacía pruebas exploratorias en nuestro checkout. A veces un código de descuento se aplicaba dos veces, así que el cliente pagaba menos de lo debido.',
          },
        },
        {
          speaker: 'Interviewer',
          text: 'Sometimes? How did you pin it down?',
          translation: {
            fr: 'Parfois ? Comment avez-vous réussi à le cerner ?',
            es: '¿A veces? ¿Cómo conseguiste acotarlo?',
          },
        },
        {
          speaker: 'Candidate',
          text: "At first I could only reproduce it occasionally. Then I throttled the network in the browser's dev tools and clicked Apply twice quickly. It happened every time, so it was clearly a race condition.",
          translation: {
            fr: "Au début, je n'arrivais à le reproduire que de temps en temps. Ensuite, j'ai ralenti le réseau dans les outils de développement du navigateur et j'ai cliqué deux fois rapidement sur Appliquer. Ça arrivait à chaque fois, donc c'était clairement une race condition.",
            es: 'Al principio solo conseguía reproducirlo de vez en cuando. Luego limité la red en las herramientas de desarrollo del navegador e hice clic dos veces rápido en Aplicar. Pasaba siempre, así que estaba claro que era una condición de carrera.',
          },
        },
        {
          speaker: 'Interviewer',
          text: 'What did your report look like?',
          translation: {
            fr: 'À quoi ressemblait votre rapport ?',
            es: '¿Cómo era tu informe?',
          },
        },
        {
          speaker: 'Candidate',
          text: 'I wrote it up with clear steps, expected and actual results, a short screen recording and the request IDs from the logs. I flagged it as high severity because it directly affected revenue.',
          translation: {
            fr: "Je l'ai rédigé avec des étapes claires, le résultat attendu et le résultat obtenu, un court enregistrement d'écran et les identifiants de requête tirés des logs. Je l'ai classé en gravité élevée parce qu'il avait un impact direct sur le chiffre d'affaires.",
            es: 'Lo documenté con pasos claros, los resultados esperado y obtenido, una grabación corta de pantalla y los IDs de las peticiones sacados de los logs. Lo marqué con gravedad alta porque afectaba directamente a los ingresos.',
          },
        },
        {
          speaker: 'Interviewer',
          text: 'Did you set the priority as well?',
          translation: {
            fr: 'Avez-vous aussi fixé la priorité ?',
            es: '¿También fijaste la prioridad?',
          },
        },
        {
          speaker: 'Candidate',
          text: "I suggested one, but the product owner made the final call. They agreed to fix it before the release, and afterwards we added a regression test so it wouldn't come back.",
          translation: {
            fr: "J'en ai proposé une, mais c'est le product owner qui a tranché. Il a accepté de le corriger avant la mise en production, et ensuite on a ajouté un test de non-régression pour qu'il ne revienne pas.",
            es: 'Propuse una, pero el product owner tomó la decisión final. Aceptó corregirlo antes del lanzamiento y después añadimos un test de regresión para que no volviera a aparecer.',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'iv-18-q1',
        type: 'choice',
        prompt: 'What is the main difference between severity and priority?',
        options: [
          'Severity is set by developers, priority by testers',
          'Severity describes the impact; priority describes how soon it should be fixed',
          'They mean exactly the same thing',
          'Priority only applies to security bugs',
        ],
        correctIndex: 1,
        explanation:
          'A bug can be severe but low priority (rare edge case) or minor but high priority (a typo on the home page).',
      },
      {
        id: 'iv-18-q2',
        type: 'fill',
        prompt: 'A good bug report always includes clear steps to ___ the problem.',
        options: ['repair', 'remove', 'reproduce', 'review'],
        correctIndex: 2,
        explanation: 'Developers need to reproduce a bug before they can fix it with confidence.',
      },
      {
        id: 'iv-18-q3',
        type: 'choice',
        prompt: 'Which bug report title is the most useful?',
        options: [
          'Discount code applied twice when "Apply" is clicked quickly on a slow network',
          'Checkout broken!!!',
          'Problem with discounts',
          'Please fix ASAP',
        ],
        correctIndex: 0,
        explanation:
          'A good title is specific: it says what happens and under which conditions, so the bug is easy to find and triage.',
      },
    ],
    interview: {
      path: 'qa',
      question: 'Describe a bug you found and how you reported it.',
      questionTranslation: {
        fr: "Décrivez un bug que vous avez trouvé et comment vous l'avez signalé.",
        es: 'Describe un bug que encontraste y cómo lo reportaste.',
      },
      explanation:
        'The interviewer is checking your investigation skills, the quality of your bug reports and how you work with developers and product. A structured story, such as Situation, Task, Action, Result, helps them see your reasoning, and a follow-up on prevention shows maturity.',
      explanationTranslation: {
        fr: "L'intervieweur évalue vos capacités d'investigation, la qualité de vos rapports de bug et votre façon de travailler avec les développeurs et le produit. Une histoire structurée, par exemple Situation, Tâche, Action, Résultat, l'aide à suivre votre raisonnement, et un mot sur la prévention montre votre maturité.",
        es: 'El entrevistador evalúa tu capacidad de investigación, la calidad de tus informes de bugs y cómo trabajas con desarrolladores y producto. Una historia estructurada, como Situación, Tarea, Acción, Resultado, le ayuda a ver tu razonamiento, y mencionar la prevención demuestra madurez.',
      },
      exampleAnswer:
        "On my last project, I was doing exploratory testing on the checkout and noticed that, now and then, a discount code was applied twice. At first I couldn't reproduce it reliably, so I tried slowing the network down in the browser's dev tools and clicking Apply twice. With a slow connection, it happened every time, which pointed to a race condition between two requests. In the report, I used a specific title, exact steps, expected and actual results, the environment, a short screen recording and the request IDs, so the developer could find the calls in the logs. I marked it as high severity because it affected revenue, and discussed the priority with the product owner. The fix made the endpoint idempotent and disabled the button while the request was pending. I then added an automated regression test for it.",
      exampleAnswerTranslation: {
        fr: "Sur mon dernier projet, je faisais des tests exploratoires sur le tunnel de commande et j'ai remarqué que, de temps en temps, un code de réduction était appliqué deux fois. Au début, je n'arrivais pas à le reproduire de façon fiable, alors j'ai essayé de ralentir le réseau dans les outils de développement du navigateur et de cliquer deux fois sur Appliquer. Avec une connexion lente, ça arrivait à chaque fois, ce qui indiquait une race condition entre deux requêtes. Dans le rapport, j'ai mis un titre précis, les étapes exactes, le résultat attendu et le résultat obtenu, l'environnement, un court enregistrement d'écran et les identifiants de requête, pour que le développeur retrouve les appels dans les logs. Je l'ai classé en gravité élevée parce qu'il touchait le chiffre d'affaires, et j'ai discuté de la priorité avec le product owner. Le correctif a rendu l'endpoint idempotent et a désactivé le bouton pendant la requête. J'ai ensuite ajouté un test de non-régression automatisé.",
        es: 'En mi último proyecto, estaba haciendo pruebas exploratorias en el checkout y me di cuenta de que, de vez en cuando, un código de descuento se aplicaba dos veces. Al principio no conseguía reproducirlo de forma fiable, así que probé a ralentizar la red en las herramientas de desarrollo del navegador y a hacer clic dos veces en Aplicar. Con una conexión lenta, pasaba siempre, lo que apuntaba a una condición de carrera entre dos peticiones. En el informe puse un título concreto, los pasos exactos, los resultados esperado y obtenido, el entorno, una grabación corta de pantalla y los IDs de las peticiones, para que el desarrollador encontrara las llamadas en los logs. Lo marqué con gravedad alta porque afectaba a los ingresos y hablé de la prioridad con el product owner. La corrección hizo que el endpoint fuera idempotente y desactivó el botón mientras la petición estaba en curso. Después añadí un test de regresión automatizado.',
      },
      alternatives: [
        'The tricky part was that it only happened under certain conditions.',
        'I always try to write a report that a developer can act on without asking me any questions.',
        'I attached logs and a recording, because a video often saves a long explanation.',
        'Finding the bug was only half the job; making sure it stays fixed was the other half.',
      ],
      practice:
        'Think of a real bug you found (or one you saw in an app). Write a full bug report for it: title, environment, steps, expected result, actual result, severity and attachments. Then tell the story out loud in under two minutes, using the Situation, Action, Result structure.',
      selfAssessment: [
        'I described how I found and isolated the bug, not just what it was.',
        'I listed the key parts of my report: title, steps, expected and actual results, evidence.',
        'I explained the difference between severity and priority, or who decided each one.',
        'I mentioned the outcome and how we prevented the bug from returning.',
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // iv-19 — Architect: designing a URL shortener
  // ---------------------------------------------------------------------------
  {
    id: 'iv-19',
    moduleId: 'interview',
    topic: 'architect',
    title: 'Designing a URL shortener in a system design interview',
    titleTranslation: {
      fr: "Concevoir un raccourcisseur d'URL en entretien de system design",
      es: 'Diseñar un acortador de URL en una entrevista de diseño de sistemas',
    },
    level: 'advanced',
    premium: true,
    estimatedMinutes: 12,
    roles: ['architect'],
    objective:
      'Lead a system design discussion: clarify requirements, estimate scale, propose a design and justify key decisions out loud.',
    objectiveTranslation: {
      fr: 'Mener une discussion de system design : clarifier les besoins, estimer la charge, proposer une conception et justifier à voix haute les décisions clés.',
      es: 'Dirigir una conversación de diseño de sistemas: aclarar los requisitos, estimar la escala, proponer un diseño y justificar en voz alta las decisiones clave.',
    },
    situation:
      'In a system design interview for an architect role, you are asked to design a service that turns long URLs into short links and redirects users.',
    situationTranslation: {
      fr: "Lors d'un entretien de system design pour un poste d'architecte, on vous demande de concevoir un service qui transforme de longues URL en liens courts et redirige les utilisateurs.",
      es: 'En una entrevista de diseño de sistemas para un puesto de arquitecto, te piden que diseñes un servicio que convierta URLs largas en enlaces cortos y redirija a los usuarios.',
    },
    vocabulary: [
      {
        term: 'read-heavy',
        definition: 'Describes a system that receives many more read requests than write requests.',
        translation: { fr: 'orienté lecture (read-heavy)', es: 'con predominio de lecturas (read-heavy)' },
      },
      {
        term: 'base62 encoding',
        definition: 'Representing a number using 62 characters: digits, lowercase and uppercase letters.',
        translation: { fr: 'encodage base62', es: 'codificación base62' },
      },
      {
        term: 'back-of-the-envelope estimate',
        definition: 'A quick, rough calculation used to understand the order of magnitude of a problem.',
        translation: { fr: 'estimation rapide (calcul de coin de table)', es: 'estimación rápida (cálculo aproximado)' },
      },
      {
        term: 'collision',
        definition: 'When two different inputs produce the same key or hash.',
        translation: { fr: 'collision', es: 'colisión' },
      },
      {
        term: 'hot key',
        definition: 'A key that receives a very large share of traffic, which can overload one server or partition.',
        translation: { fr: 'clé chaude (hot key)', es: 'clave caliente (hot key)' },
      },
    ],
    expressions: [
      {
        phrase: 'Before I start drawing boxes, can I clarify a few requirements?',
        usage: 'Use it to begin a design interview by asking questions instead of guessing.',
        translation: {
          fr: 'Avant de commencer à dessiner des boîtes, puis-je clarifier quelques besoins ?',
          es: 'Antes de empezar a dibujar cajas, ¿puedo aclarar algunos requisitos?',
        },
      },
      {
        phrase: "Let me do a quick back-of-the-envelope estimate.",
        usage: 'Use it to introduce rough numbers that guide your design.',
        translation: {
          fr: 'Laissez-moi faire une estimation rapide.',
          es: 'Déjame hacer una estimación rápida.',
        },
      },
      {
        phrase: "I'm going to assume..., but tell me if that's wrong.",
        usage: 'Use it to state an assumption openly and invite correction.',
        translation: {
          fr: "Je vais supposer que..., mais dites-moi si c'est faux.",
          es: 'Voy a suponer que..., pero dime si no es así.',
        },
      },
      {
        phrase: 'The key design decision here is...',
        usage: 'Use it to point the interviewer to the most important part of your design.',
        translation: {
          fr: 'La décision de conception clé ici, c\'est...',
          es: 'La decisión de diseño clave aquí es...',
        },
      },
      {
        phrase: 'If we needed to scale further, the next step would be...',
        usage: 'Use it to show how the design can evolve without overengineering it now.',
        translation: {
          fr: "S'il fallait monter encore en charge, l'étape suivante serait...",
          es: 'Si necesitáramos escalar más, el siguiente paso sería...',
        },
      },
    ],
    dialogue: {
      context: 'A forty-five-minute system design interview with a principal engineer, using a shared whiteboard.',
      lines: [
        {
          speaker: 'Interviewer',
          text: 'Let\'s design a URL shortener, something like a private version of a well-known link service.',
          translation: {
            fr: "Concevons un raccourcisseur d'URL, une sorte de version privée d'un service de liens bien connu.",
            es: 'Diseñemos un acortador de URL, algo como una versión privada de un servicio de enlaces muy conocido.',
          },
        },
        {
          speaker: 'Candidate',
          text: 'Sure. Before I start drawing boxes, can I clarify a few requirements? Do we need custom aliases, link expiry or click analytics?',
          translation: {
            fr: "Bien sûr. Avant de commencer à dessiner des boîtes, puis-je clarifier quelques besoins ? Avons-nous besoin d'alias personnalisés, d'expiration des liens ou de statistiques de clics ?",
            es: 'Claro. Antes de empezar a dibujar cajas, ¿puedo aclarar algunos requisitos? ¿Necesitamos alias personalizados, caducidad de los enlaces o analítica de clics?',
          },
        },
        {
          speaker: 'Interviewer',
          text: 'Analytics, yes. Custom aliases are nice to have. Assume about a hundred million new links a month.',
          translation: {
            fr: "Les statistiques, oui. Les alias personnalisés sont un plus. Partez sur environ cent millions de nouveaux liens par mois.",
            es: 'La analítica, sí. Los alias personalizados son un extra. Supón unos cien millones de enlaces nuevos al mes.',
          },
        },
        {
          speaker: 'Candidate',
          text: "Let me do a quick back-of-the-envelope estimate. That's roughly forty writes per second, and if reads are a hundred times higher, around four thousand redirects per second on average, so it's very read-heavy.",
          translation: {
            fr: "Laissez-moi faire une estimation rapide. Ça fait environ quarante écritures par seconde, et si les lectures sont cent fois plus nombreuses, environ quatre mille redirections par seconde en moyenne, donc c'est très orienté lecture.",
            es: 'Déjame hacer una estimación rápida. Eso son unas cuarenta escrituras por segundo y, si las lecturas son cien veces más, unas cuatro mil redirecciones por segundo de media, así que tiene un claro predominio de lecturas.',
          },
        },
        {
          speaker: 'Interviewer',
          text: 'OK. How do you generate the short code?',
          translation: {
            fr: "D'accord. Comment générez-vous le code court ?",
            es: 'Vale. ¿Cómo generas el código corto?',
          },
        },
        {
          speaker: 'Candidate',
          text: 'The key design decision here is to use a unique numeric ID and encode it in base62. Seven characters give us about 3.5 trillion combinations, which is plenty.',
          translation: {
            fr: "La décision de conception clé ici, c'est d'utiliser un identifiant numérique unique et de l'encoder en base62. Sept caractères nous donnent environ 3 500 milliards de combinaisons, ce qui est largement suffisant.",
            es: 'La decisión de diseño clave aquí es usar un ID numérico único y codificarlo en base62. Siete caracteres nos dan unos 3,5 billones de combinaciones, que es más que suficiente.',
          },
        },
        {
          speaker: 'Interviewer',
          text: 'Why not just hash the long URL?',
          translation: {
            fr: "Pourquoi ne pas simplement hacher l'URL longue ?",
            es: '¿Por qué no hacer simplemente un hash de la URL larga?',
          },
        },
        {
          speaker: 'Candidate',
          text: "You can, but once you truncate the hash to seven characters, collisions become a real concern, so you need a check-and-retry on every write. With an ID range per server, codes are unique by construction.",
          translation: {
            fr: "C'est possible, mais dès qu'on tronque le hash à sept caractères, les collisions deviennent un vrai problème, donc il faut une vérification avec nouvel essai à chaque écriture. Avec une plage d'identifiants par serveur, les codes sont uniques par construction.",
            es: 'Se puede, pero en cuanto truncas el hash a siete caracteres, las colisiones se convierten en un problema real, así que necesitas comprobar y reintentar en cada escritura. Con un rango de IDs por servidor, los códigos son únicos por diseño.',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'iv-19-q1',
        type: 'choice',
        prompt: 'Why might a URL shortener return a 302 redirect instead of a 301 if click analytics are required?',
        options: [
          'A 302 is faster for the browser to process',
          'A 301 is usually cached by browsers, so later clicks may never reach the server',
          'A 301 is not supported by mobile browsers',
          'A 302 automatically encrypts the destination URL',
        ],
        correctIndex: 1,
        explanation:
          'A 301 is a permanent redirect that browsers can cache, so repeat clicks skip the service and are not counted.',
      },
      {
        id: 'iv-19-q2',
        type: 'fill',
        prompt: 'With a hundred reads for every write, the system is clearly read-___.',
        options: ['only', 'bound', 'first', 'heavy'],
        correctIndex: 3,
        explanation: '"Read-heavy" is the usual way to describe a system dominated by read traffic.',
      },
      {
        id: 'iv-19-q3',
        type: 'choice',
        prompt: 'What is the best way to start a system design interview?',
        options: [
          'Ask clarifying questions about requirements and scale',
          'Immediately choose a database and draw the schema',
          'Explain every technology you know',
        ],
        correctIndex: 0,
        explanation:
          'Clarifying requirements first shows structured thinking and prevents you from designing the wrong system.',
      },
    ],
    interview: {
      path: 'architect',
      question: 'How would you design a URL shortener?',
      questionTranslation: {
        fr: "Comment concevriez-vous un raccourcisseur d'URL ?",
        es: '¿Cómo diseñarías un acortador de URL?',
      },
      explanation:
        'The interviewer is checking how you structure an open-ended problem: clarifying requirements, estimating scale, proposing a simple design and then improving it. They care less about one perfect answer and more about whether you can explain trade-offs, such as ID generation, caching and redirect types, clearly and out loud.',
      explanationTranslation: {
        fr: "L'intervieweur vérifie comment vous structurez un problème ouvert : clarifier les besoins, estimer la charge, proposer une conception simple puis l'améliorer. Il s'intéresse moins à une réponse parfaite qu'à votre capacité à expliquer clairement et à voix haute les compromis, comme la génération d'identifiants, le cache et les types de redirection.",
        es: 'El entrevistador comprueba cómo estructuras un problema abierto: aclarar los requisitos, estimar la escala, proponer un diseño sencillo y después mejorarlo. Le importa menos una respuesta perfecta que tu capacidad para explicar con claridad y en voz alta los compromisos, como la generación de IDs, la caché y los tipos de redirección.',
      },
      exampleAnswer:
        "I'd start by confirming requirements: create short links, redirect quickly, and track clicks, at around a hundred million new links a month. That's only about forty writes per second, but reads could be a hundred times higher, so the design should optimize redirects. The API is simple: a POST that creates a link and a GET on the short code that returns a redirect. For codes, I'd give each app server a range of IDs from a central counter and encode them in base62; seven characters is enough for trillions of links, with no collisions to handle. Mappings go into a key-value store partitioned by code, with a Redis cache in front for popular links. Because we need analytics, I'd return a 302 rather than a cacheable 301, and publish click events to a queue so counting never slows down the redirect.",
      exampleAnswerTranslation: {
        fr: "Je commencerais par confirmer les besoins : créer des liens courts, rediriger rapidement et suivre les clics, avec environ cent millions de nouveaux liens par mois. Ça ne fait qu'environ quarante écritures par seconde, mais les lectures pourraient être cent fois plus nombreuses, donc la conception doit optimiser les redirections. L'API est simple : un POST qui crée un lien et un GET sur le code court qui renvoie une redirection. Pour les codes, j'attribuerais à chaque serveur d'application une plage d'identifiants issue d'un compteur central et je les encoderais en base62 ; sept caractères suffisent pour des milliers de milliards de liens, sans collisions à gérer. Les correspondances vont dans une base clé-valeur partitionnée par code, avec un cache Redis devant pour les liens populaires. Comme on a besoin de statistiques, je renverrais un 302 plutôt qu'un 301 mis en cache, et je publierais les événements de clic dans une file pour que le comptage ne ralentisse jamais la redirection.",
        es: 'Empezaría confirmando los requisitos: crear enlaces cortos, redirigir rápido y registrar los clics, con unos cien millones de enlaces nuevos al mes. Eso son solo unas cuarenta escrituras por segundo, pero las lecturas podrían ser cien veces más, así que el diseño debe optimizar las redirecciones. La API es sencilla: un POST que crea un enlace y un GET sobre el código corto que devuelve una redirección. Para los códigos, asignaría a cada servidor de aplicación un rango de IDs de un contador central y los codificaría en base62; siete caracteres bastan para billones de enlaces, sin colisiones que gestionar. Las correspondencias van en un almacén clave-valor particionado por código, con una caché Redis delante para los enlaces populares. Como necesitamos analítica, devolvería un 302 en lugar de un 301 que se cachea, y publicaría los eventos de clic en una cola para que el conteo nunca ralentice la redirección.',
      },
      alternatives: [
        "I'd keep the first version simple and only add components when the numbers justify them.",
        'The redirect path is the hot path, so everything there should be as fast and cacheable as possible.',
        'For custom aliases, I would just check that the alias is free and reserve it with a conditional write.',
        "If one link went viral, I'd rely on the cache, and possibly a CDN, to avoid a hot key on a single partition.",
      ],
      practice:
        'Set a timer for ten minutes and design a URL shortener on paper. Write down your clarifying questions, a quick estimate, an API, and a simple diagram. Then explain your design out loud in under three minutes, naming at least two trade-offs.',
      selfAssessment: [
        'I asked clarifying questions before proposing a design.',
        'I used a quick estimate to show that the system is read-heavy.',
        'I explained how short codes are generated and how collisions are avoided.',
        'I justified at least one trade-off, such as 301 versus 302 or hashing versus IDs.',
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // iv-20 — Architect: a difficult architectural trade-off
  // ---------------------------------------------------------------------------
  {
    id: 'iv-20',
    moduleId: 'interview',
    topic: 'architect',
    title: 'Talking about a difficult architectural trade-off',
    titleTranslation: {
      fr: 'Parler d\'un compromis architectural difficile',
      es: 'Hablar de un compromiso de arquitectura difícil',
    },
    level: 'advanced',
    premium: true,
    estimatedMinutes: 11,
    roles: ['architect'],
    objective:
      'Tell a structured story about an architectural decision, explaining the options, the reasoning, the risks you accepted and what you learned.',
    objectiveTranslation: {
      fr: 'Raconter de façon structurée une décision d\'architecture en expliquant les options, le raisonnement, les risques acceptés et ce que vous avez appris.',
      es: 'Contar de forma estructurada una decisión de arquitectura, explicando las opciones, el razonamiento, los riesgos asumidos y lo que aprendiste.',
    },
    situation:
      'In the final round of an architect interview, a director asks you to describe a difficult trade-off you made and how you got the team to agree.',
    situationTranslation: {
      fr: "Lors du dernier tour d'un entretien d'architecte, un directeur vous demande de décrire un compromis difficile que vous avez fait et comment vous avez obtenu l'accord de l'équipe.",
      es: 'En la última ronda de una entrevista de arquitecto, una directora te pide que describas un compromiso difícil que tomaste y cómo conseguiste que el equipo estuviera de acuerdo.',
    },
    vocabulary: [
      {
        term: 'eventual consistency',
        definition: 'A model where different parts of a system may briefly disagree but converge to the same data over time.',
        translation: { fr: 'cohérence à terme', es: 'consistencia eventual' },
      },
      {
        term: 'temporal coupling',
        definition: 'When one service only works if another service is available at the same moment.',
        translation: { fr: 'couplage temporel', es: 'acoplamiento temporal' },
      },
      {
        term: 'outbox pattern',
        definition:
          'Writing an event to a database table in the same transaction as the business data, then publishing it reliably afterwards.',
        translation: { fr: 'pattern outbox', es: 'patrón outbox' },
      },
      {
        term: 'architecture decision record (ADR)',
        definition: 'A short document that captures an important decision, its context, the options and the consequences.',
        translation: {
          fr: "ADR (enregistrement de décision d'architecture)",
          es: 'ADR (registro de decisión de arquitectura)',
        },
      },
      {
        term: 'reconciliation job',
        definition: 'A scheduled process that compares data between systems and fixes any differences.',
        translation: { fr: 'tâche de réconciliation', es: 'proceso de conciliación' },
      },
    ],
    expressions: [
      {
        phrase: 'There was no obviously right answer.',
        usage: 'Use it to show that the decision was genuinely difficult.',
        translation: {
          fr: "Il n'y avait pas de bonne réponse évidente.",
          es: 'No había una respuesta claramente correcta.',
        },
      },
      {
        phrase: 'We weighed... against...',
        usage: 'Use it to describe how you compared two competing options or qualities.',
        translation: { fr: 'On a mis en balance... et...', es: 'Sopesamos... frente a...' },
      },
      {
        phrase: 'We accepted... in exchange for...',
        usage: 'Use it to state clearly what you gave up and what you gained.',
        translation: {
          fr: 'On a accepté... en échange de...',
          es: 'Aceptamos... a cambio de...',
        },
      },
      {
        phrase: 'To get buy-in, I...',
        usage: 'Use it to explain how you convinced colleagues or stakeholders.',
        translation: {
          fr: "Pour obtenir l'adhésion, j'ai...",
          es: 'Para conseguir el apoyo del equipo, yo...',
        },
      },
      {
        phrase: 'Looking back, I would...',
        usage: 'Use it to reflect honestly on what you would do differently.',
        translation: {
          fr: 'Avec le recul, je...',
          es: 'Mirándolo ahora, yo...',
        },
      },
    ],
    dialogue: {
      context: 'The final round of an architect interview with an engineering director.',
      lines: [
        {
          speaker: 'Interviewer',
          text: 'Tell me about a difficult architectural trade-off you had to make.',
          translation: {
            fr: "Parlez-moi d'un compromis architectural difficile que vous avez dû faire.",
            es: 'Háblame de un compromiso de arquitectura difícil que tuviste que tomar.',
          },
        },
        {
          speaker: 'Candidate',
          text: 'At my last company, the order service called the inventory service synchronously. Whenever inventory was slow, checkout failed, so we had to decide whether to keep that or move to events.',
          translation: {
            fr: "Dans ma dernière entreprise, le service de commandes appelait le service de stock de façon synchrone. Dès que le stock était lent, la commande échouait, donc on devait décider s'il fallait garder ça ou passer aux événements.",
            es: 'En mi última empresa, el servicio de pedidos llamaba de forma síncrona al servicio de inventario. Cada vez que el inventario iba lento, el checkout fallaba, así que teníamos que decidir si mantenerlo o pasar a eventos.',
          },
        },
        {
          speaker: 'Interviewer',
          text: 'Why was that hard? Events sound like the obvious choice.',
          translation: {
            fr: 'Pourquoi était-ce difficile ? Les événements semblent être le choix évident.',
            es: '¿Por qué fue difícil? Los eventos parecen la opción obvia.',
          },
        },
        {
          speaker: 'Candidate',
          text: "There was no obviously right answer. Events remove the temporal coupling, but the stock count is no longer guaranteed at the moment of purchase. We weighed availability against strict consistency.",
          translation: {
            fr: "Il n'y avait pas de bonne réponse évidente. Les événements suppriment le couplage temporel, mais le niveau de stock n'est plus garanti au moment de l'achat. On a mis en balance la disponibilité et la cohérence stricte.",
            es: 'No había una respuesta claramente correcta. Los eventos eliminan el acoplamiento temporal, pero el stock ya no está garantizado en el momento de la compra. Sopesamos la disponibilidad frente a la consistencia estricta.',
          },
        },
        {
          speaker: 'Interviewer',
          text: 'So what did you decide?',
          translation: { fr: 'Alors, qu\'avez-vous décidé ?', es: 'Entonces, ¿qué decidisteis?' },
        },
        {
          speaker: 'Candidate',
          text: "We accepted eventual consistency in exchange for a checkout that keeps working. Orders start as 'pending', we use the outbox pattern so no event is lost, and a reconciliation job catches the rare oversell.",
          translation: {
            fr: "On a accepté la cohérence à terme en échange d'un tunnel de commande qui continue de fonctionner. Les commandes commencent à l'état « en attente », on utilise le pattern outbox pour ne perdre aucun événement, et une tâche de réconciliation détecte les rares cas de survente.",
            es: 'Aceptamos la consistencia eventual a cambio de un checkout que siguiera funcionando. Los pedidos empiezan como «pendientes», usamos el patrón outbox para no perder ningún evento y un proceso de conciliación detecta los raros casos de sobreventa.',
          },
        },
        {
          speaker: 'Interviewer',
          text: 'Would you make the same decision today?',
          translation: {
            fr: 'Prendriez-vous la même décision aujourd\'hui ?',
            es: '¿Tomarías la misma decisión hoy?',
          },
        },
        {
          speaker: 'Candidate',
          text: 'Mostly, yes. Looking back, I would invest in distributed tracing much earlier, because debugging across events was harder than we expected at first.',
          translation: {
            fr: "Globalement, oui. Avec le recul, j'investirais beaucoup plus tôt dans le tracing distribué, parce que déboguer à travers les événements a été plus difficile que prévu au début.",
            es: 'En general, sí. Mirándolo ahora, invertiría mucho antes en trazabilidad distribuida, porque depurar a través de los eventos fue más difícil de lo que esperábamos al principio.',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'iv-20-q1',
        type: 'choice',
        prompt: 'What problem does the outbox pattern solve?',
        options: [
          'It makes database queries faster',
          'It encrypts messages between services',
          'It removes the need for a message broker',
          'It makes sure an event is published if, and only if, the business data was saved',
        ],
        correctIndex: 3,
        explanation:
          'Saving the event in the same transaction as the data avoids losing events or publishing events for changes that were rolled back.',
      },
      {
        id: 'iv-20-q2',
        type: 'fill',
        prompt: 'We accepted eventual consistency in ___ for higher availability.',
        options: ['return', 'exchange', 'place', 'change'],
        correctIndex: 1,
        explanation: '"In exchange for" is the natural phrase to say what you gained by giving something up.',
      },
      {
        id: 'iv-20-q3',
        type: 'choice',
        prompt: 'Which closing sentence shows the most maturity in this kind of answer?',
        options: [
          'Looking back, I would add distributed tracing earlier, because debugging events was harder than expected.',
          'Everything went perfectly and I would not change anything.',
          'It was the team\'s fault that it took so long.',
        ],
        correctIndex: 0,
        explanation:
          'Interviewers value honest reflection. Admitting what you would improve shows self-awareness without blaming others.',
      },
    ],
    interview: {
      path: 'architect',
      question: 'Tell me about a difficult architectural trade-off.',
      questionTranslation: {
        fr: "Parlez-moi d'un compromis architectural difficile.",
        es: 'Háblame de un compromiso de arquitectura difícil.',
      },
      explanation:
        'The interviewer is checking your judgment more than your technical knowledge. They want to see that you understood the context, compared real options, made the costs explicit, brought people along with the decision and reflected honestly on the outcome.',
      explanationTranslation: {
        fr: "L'intervieweur évalue votre jugement plus que vos connaissances techniques. Il veut voir que vous avez compris le contexte, comparé de vraies options, rendu les coûts explicites, embarqué les gens dans la décision et réfléchi honnêtement au résultat.",
        es: 'El entrevistador evalúa tu criterio más que tus conocimientos técnicos. Quiere ver que entendiste el contexto, comparaste opciones reales, hiciste explícitos los costes, sumaste a la gente a la decisión y reflexionaste con honestidad sobre el resultado.',
      },
      exampleAnswer:
        "At my last company, our order service called inventory synchronously to reserve stock. It was simple and always consistent, but every time inventory slowed down, checkout failed with it. The alternative was to publish an event and reserve stock asynchronously. We weighed availability against strict consistency, and the business told us that a failed checkout cost more than an occasional oversell. So we accepted eventual consistency in exchange for resilience. Orders were created as pending, we used the outbox pattern so no event could be lost, and a reconciliation job flagged any oversold items for customer support. To get buy-in, I wrote an ADR with both options and the risks, and we reviewed it with product and support, not just engineering. Checkout became far more stable. Looking back, I would have added distributed tracing earlier.",
      exampleAnswerTranslation: {
        fr: "Dans ma dernière entreprise, notre service de commandes appelait le service de stock de façon synchrone pour réserver les articles. C'était simple et toujours cohérent, mais chaque fois que le stock ralentissait, la commande échouait aussi. L'alternative était de publier un événement et de réserver le stock de façon asynchrone. On a mis en balance la disponibilité et la cohérence stricte, et le métier nous a dit qu'une commande échouée coûtait plus cher qu'une survente occasionnelle. On a donc accepté la cohérence à terme en échange de la résilience. Les commandes étaient créées à l'état « en attente », on utilisait le pattern outbox pour qu'aucun événement ne puisse être perdu, et une tâche de réconciliation signalait les articles survendus au support client. Pour obtenir l'adhésion, j'ai rédigé un ADR avec les deux options et les risques, et on l'a revu avec le produit et le support, pas seulement l'ingénierie. Le tunnel de commande est devenu beaucoup plus stable. Avec le recul, j'aurais ajouté le tracing distribué plus tôt.",
        es: 'En mi última empresa, nuestro servicio de pedidos llamaba de forma síncrona al de inventario para reservar el stock. Era sencillo y siempre consistente, pero cada vez que el inventario se ralentizaba, el checkout fallaba con él. La alternativa era publicar un evento y reservar el stock de forma asíncrona. Sopesamos la disponibilidad frente a la consistencia estricta, y el negocio nos dijo que un checkout fallido costaba más que una sobreventa ocasional. Así que aceptamos la consistencia eventual a cambio de resiliencia. Los pedidos se creaban como pendientes, usábamos el patrón outbox para que no se pudiera perder ningún evento y un proceso de conciliación señalaba al soporte al cliente los artículos sobrevendidos. Para conseguir el apoyo de todos, escribí un ADR con las dos opciones y los riesgos, y lo revisamos con producto y soporte, no solo con ingeniería. El checkout se volvió mucho más estable. Mirándolo ahora, habría añadido trazabilidad distribuida antes.',
      },
      alternatives: [
        'Both options were reasonable; the real question was which failure we could live with.',
        'I made sure the business, not just engineering, understood what we were giving up.',
        'We documented the decision in an ADR, so new team members could understand why we chose it.',
        "If the context changed, for example much higher stock pressure, I'd be open to revisiting it.",
      ],
      practice:
        'Choose a real technical decision you were part of. Write it down in five lines: context, options, decision, cost you accepted, and what you learned. Then tell the story out loud in under two and a half minutes, using "We weighed... against..." and "We accepted... in exchange for...".',
      selfAssessment: [
        'I described the context and why the decision was genuinely hard.',
        'I presented at least two real options and their costs.',
        'I explained how I got buy-in from other people or teams.',
        'I reflected honestly on the result and what I would do differently.',
      ],
    },
  },
];
