import type { Lesson } from '../types';

export const technicalB: Lesson[] = [
  // ---------------------------------------------------------------------------
  // te-14 Cloud infrastructure
  // ---------------------------------------------------------------------------
  {
    id: 'te-14',
    moduleId: 'technical',
    topic: 'cloud',
    title: 'Cloud infrastructure: regions, services and costs',
    titleTranslation: {
      fr: 'Infrastructure cloud : régions, services et coûts',
      es: 'Infraestructura cloud: regiones, servicios y costes',
    },
    level: 'intermediate',
    premium: true,
    estimatedMinutes: 9,
    roles: ['devops', 'architect', 'fullstack'],
    objective: 'Talk clearly about where your services run in the cloud, why, and what they cost.',
    objectiveTranslation: {
      fr: 'Parler clairement de l\'endroit où tournent vos services dans le cloud, de la raison de ce choix et de leur coût.',
      es: 'Hablar con claridad de dónde se ejecutan tus servicios en la nube, por qué y cuánto cuestan.',
    },
    situation: 'Your team is reviewing the monthly cloud bill and deciding whether to add a second region.',
    situationTranslation: {
      fr: 'Votre équipe examine la facture cloud mensuelle et se demande s\'il faut ajouter une deuxième région.',
      es: 'Tu equipo está revisando la factura mensual de la nube y decidiendo si añadir una segunda región.',
    },
    vocabulary: [
      {
        term: 'region',
        definition: 'A geographic area where a cloud provider runs a group of data centers, such as Western Europe.',
        translation: { fr: 'région', es: 'región' },
      },
      {
        term: 'availability zone',
        definition: 'One or more isolated data centers inside a region, with separate power and networking.',
        translation: { fr: 'zone de disponibilité', es: 'zona de disponibilidad' },
      },
      {
        term: 'managed service',
        definition: 'A service that the cloud provider operates for you, such as a hosted database, so you do not patch or maintain servers.',
        translation: { fr: 'service managé', es: 'servicio gestionado' },
      },
      {
        term: 'egress',
        definition: 'Data leaving a cloud network, which providers usually charge for, unlike most incoming traffic.',
        translation: { fr: 'trafic sortant (egress)', es: 'tráfico de salida (egress)' },
      },
      {
        term: 'autoscaling',
        definition: 'Automatically adding or removing instances based on load, such as CPU usage or request count.',
        translation: { fr: 'mise à l\'échelle automatique (autoscaling)', es: 'escalado automático (autoscaling)' },
      },
    ],
    expressions: [
      {
        phrase: 'We\'re running in a single region, spread across three availability zones.',
        usage: 'Use it to describe your current setup precisely and show the level of redundancy you already have.',
        translation: {
          fr: 'Nous tournons dans une seule région, répartis sur trois zones de disponibilité.',
          es: 'Estamos en una sola región, repartidos en tres zonas de disponibilidad.',
        },
      },
      {
        phrase: 'Most of the bill comes from compute; storage is almost negligible.',
        usage: 'Use it to point people to the biggest cost driver before discussing savings.',
        translation: {
          fr: 'L\'essentiel de la facture vient du compute ; le stockage est presque négligeable.',
          es: 'La mayor parte de la factura viene del cómputo; el almacenamiento es casi insignificante.',
        },
      },
      {
        phrase: 'If we switched to a managed database, we\'d pay more but spend less time on maintenance.',
        usage: 'Use it to present a trade-off between direct cost and engineering effort.',
        translation: {
          fr: 'Si on passait à une base de données managée, on paierait plus cher mais on passerait moins de temps sur la maintenance.',
          es: 'Si pasáramos a una base de datos gestionada, pagaríamos más pero dedicaríamos menos tiempo al mantenimiento.',
        },
      },
      {
        phrase: 'Watch out for egress costs if the two regions sync a lot of data.',
        usage: 'Use it to warn about a hidden cost that people often forget.',
        translation: {
          fr: 'Attention aux coûts d\'egress si les deux régions synchronisent beaucoup de données.',
          es: 'Cuidado con los costes de egress si las dos regiones sincronizan muchos datos.',
        },
      },
      {
        phrase: 'We\'re over-provisioned at night, so autoscaling could cut that down.',
        usage: 'Use it to suggest a concrete optimization based on usage patterns.',
        translation: {
          fr: 'On est surdimensionnés la nuit, donc l\'autoscaling pourrait réduire ça.',
          es: 'Por la noche estamos sobredimensionados, así que el autoscaling podría reducirlo.',
        },
      },
    ],
    dialogue: {
      context: 'Kenji (DevOps engineer) and Amara (engineering manager) discuss the cloud bill and a possible second region.',
      lines: [
        {
          speaker: 'Amara',
          text: 'The cloud bill went up fifteen percent last month. Do we know why?',
          translation: {
            fr: 'La facture cloud a augmenté de quinze pour cent le mois dernier. On sait pourquoi ?',
            es: 'La factura de la nube subió un quince por ciento el mes pasado. ¿Sabemos por qué?',
          },
        },
        {
          speaker: 'Kenji',
          text: 'Mostly compute. We added instances for the product launch and never scaled them back down.',
          translation: {
            fr: 'Surtout le compute. On a ajouté des instances pour le lancement du produit et on ne les a jamais réduites.',
            es: 'Sobre todo el cómputo. Añadimos instancias para el lanzamiento del producto y nunca las redujimos.',
          },
        },
        {
          speaker: 'Amara',
          text: 'Can we fix that without risking another outage like the one in March?',
          translation: {
            fr: 'On peut corriger ça sans risquer une autre panne comme celle de mars ?',
            es: '¿Podemos arreglarlo sin arriesgarnos a otra caída como la de marzo?',
          },
        },
        {
          speaker: 'Kenji',
          text: 'Yes. If we turn on autoscaling, we only pay for extra capacity during peaks. We\'re over-provisioned at night.',
          translation: {
            fr: 'Oui. Si on active l\'autoscaling, on ne paie la capacité supplémentaire que pendant les pics. On est surdimensionnés la nuit.',
            es: 'Sí. Si activamos el autoscaling, solo pagamos la capacidad extra en los picos. Por la noche estamos sobredimensionados.',
          },
        },
        {
          speaker: 'Amara',
          text: 'And the second region the architects suggested? Is that worth it?',
          translation: {
            fr: 'Et la deuxième région que les architectes ont proposée ? Ça vaut le coup ?',
            es: '¿Y la segunda región que propusieron los arquitectos? ¿Merece la pena?',
          },
        },
        {
          speaker: 'Kenji',
          text: 'We\'re already spread across three availability zones, so we survive a data center failure. A second region only protects us if the whole region goes down.',
          translation: {
            fr: 'On est déjà répartis sur trois zones de disponibilité, donc on survit à la panne d\'un data center. Une deuxième région ne nous protège que si toute la région tombe.',
            es: 'Ya estamos repartidos en tres zonas de disponibilidad, así que aguantamos la caída de un centro de datos. Una segunda región solo nos protege si cae toda la región.',
          },
        },
        {
          speaker: 'Amara',
          text: 'So it\'s mainly a cost question.',
          translation: {
            fr: 'Donc c\'est surtout une question de coût.',
            es: 'Entonces es sobre todo una cuestión de coste.',
          },
        },
        {
          speaker: 'Kenji',
          text: 'Pretty much. It would roughly double our compute, plus egress costs for replicating data. I\'ll put the numbers in a short doc.',
          translation: {
            fr: 'En gros, oui. Ça doublerait à peu près notre compute, plus les coûts d\'egress pour répliquer les données. Je mettrai les chiffres dans un petit document.',
            es: 'Básicamente. Duplicaría más o menos nuestro cómputo, más los costes de egress por replicar datos. Pondré los números en un documento corto.',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'te-14-q1',
        type: 'choice',
        prompt: 'Your service runs in three availability zones in one region. What does this protect you against?',
        options: [
          'The failure of an entire region',
          'Bugs in your application code',
          'High egress costs',
          'The failure of a single data center',
        ],
        correctIndex: 3,
        explanation: 'Availability zones are isolated data centers inside one region, so spreading across them protects you from a single data center failure, not a full regional outage.',
      },
      {
        id: 'te-14-q2',
        type: 'fill',
        prompt: 'Be careful with ___ costs: moving lots of data out of the cloud can get expensive.',
        options: ['ingress', 'compute', 'storage', 'egress'],
        correctIndex: 3,
        explanation: '"Egress" is data leaving the provider\'s network, and it is usually billed, while most incoming (ingress) traffic is free.',
      },
      {
        id: 'te-14-q3',
        type: 'choice',
        prompt: 'Which sentence best presents a trade-off to your manager?',
        options: [
          'Managed databases are better.',
          'We must use a managed database now.',
          'A managed database costs more, but it would save us hours of maintenance every month.',
          'I don\'t like maintaining databases.',
        ],
        correctIndex: 2,
        explanation: 'It states both sides, the higher cost and the time saved, which helps a manager make a decision.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // te-15 Testing
  // ---------------------------------------------------------------------------
  {
    id: 'te-15',
    moduleId: 'technical',
    topic: 'quality',
    title: 'Testing: unit, integration and end-to-end',
    titleTranslation: {
      fr: 'Les tests : unitaires, d\'intégration et end-to-end',
      es: 'Pruebas: unitarias, de integración y end-to-end',
    },
    level: 'intermediate',
    premium: true,
    estimatedMinutes: 9,
    roles: ['qa', 'java', 'react', 'fullstack'],
    objective: 'Explain which kinds of tests you have, what each one covers, and where the gaps are.',
    objectiveTranslation: {
      fr: 'Expliquer quels types de tests vous avez, ce que chacun couvre et où se trouvent les lacunes.',
      es: 'Explicar qué tipos de pruebas tenéis, qué cubre cada una y dónde están las carencias.',
    },
    situation: 'A bug reached production and the team is discussing how to improve the test strategy.',
    situationTranslation: {
      fr: 'Un bug est arrivé en production et l\'équipe discute de la manière d\'améliorer la stratégie de test.',
      es: 'Un bug llegó a producción y el equipo está hablando de cómo mejorar la estrategia de pruebas.',
    },
    vocabulary: [
      {
        term: 'unit test',
        definition: 'A fast test that checks one small piece of code, such as a function or class, in isolation.',
        translation: { fr: 'test unitaire', es: 'prueba unitaria' },
      },
      {
        term: 'integration test',
        definition: 'A test that checks that several components work together, for example a service and a real database.',
        translation: { fr: 'test d\'intégration', es: 'prueba de integración' },
      },
      {
        term: 'end-to-end test',
        definition: 'A test that drives the whole system the way a user would, often through the UI or public API.',
        translation: { fr: 'test end-to-end (de bout en bout)', es: 'prueba end-to-end (de extremo a extremo)' },
      },
      {
        term: 'mock',
        definition: 'A fake object that replaces a real dependency in a test and lets you check how it was called.',
        translation: { fr: 'mock (simulacre)', es: 'mock (simulación)' },
      },
      {
        term: 'flaky test',
        definition: 'A test that sometimes passes and sometimes fails without any change to the code.',
        translation: { fr: 'test instable (flaky)', es: 'prueba inestable (flaky)' },
      },
    ],
    expressions: [
      {
        phrase: 'The unit tests passed because the database was mocked.',
        usage: 'Use it to explain why a bug was not caught: the test never touched the real dependency.',
        translation: {
          fr: 'Les tests unitaires passaient parce que la base de données était mockée.',
          es: 'Las pruebas unitarias pasaban porque la base de datos estaba simulada con un mock.',
        },
      },
      {
        phrase: 'We don\'t have an integration test that covers this path.',
        usage: 'Use it to name a specific gap in test coverage without blaming anyone.',
        translation: {
          fr: 'On n\'a pas de test d\'intégration qui couvre ce chemin.',
          es: 'No tenemos ninguna prueba de integración que cubra este flujo.',
        },
      },
      {
        phrase: 'End-to-end tests are valuable, but they\'re slow and harder to maintain.',
        usage: 'Use it to explain why you should not test everything end to end.',
        translation: {
          fr: 'Les tests end-to-end sont précieux, mais ils sont lents et plus difficiles à maintenir.',
          es: 'Las pruebas end-to-end son valiosas, pero son lentas y más difíciles de mantener.',
        },
      },
      {
        phrase: 'This test is flaky; it fails about one run in ten.',
        usage: 'Use it to report an unreliable test with a concrete frequency.',
        translation: {
          fr: 'Ce test est instable ; il échoue environ une fois sur dix.',
          es: 'Esta prueba es inestable; falla más o menos una de cada diez veces.',
        },
      },
      {
        phrase: 'Let\'s write a failing test that reproduces the bug before we fix it.',
        usage: 'Use it to propose a disciplined way to fix a bug and prevent regressions.',
        translation: {
          fr: 'Écrivons un test qui échoue et reproduit le bug avant de le corriger.',
          es: 'Escribamos una prueba que falle y reproduzca el bug antes de corregirlo.',
        },
      },
    ],
    dialogue: {
      context: 'Lucía (QA engineer) and Tom (backend developer) look at why a pricing bug reached production.',
      lines: [
        {
          speaker: 'Tom',
          text: 'I don\'t get it. All the tests were green when we merged.',
          translation: {
            fr: 'Je ne comprends pas. Tous les tests étaient au vert quand on a mergé.',
            es: 'No lo entiendo. Todas las pruebas estaban en verde cuando hicimos el merge.',
          },
        },
        {
          speaker: 'Lucía',
          text: 'They were, but the unit tests mock the repository. The bug is in the SQL query itself.',
          translation: {
            fr: 'Oui, mais les tests unitaires mockent le repository. Le bug est dans la requête SQL elle-même.',
            es: 'Sí, pero las pruebas unitarias simulan el repositorio con un mock. El bug está en la propia consulta SQL.',
          },
        },
        {
          speaker: 'Tom',
          text: 'So nothing actually ran that query against a real database.',
          translation: {
            fr: 'Donc rien n\'a vraiment exécuté cette requête sur une vraie base de données.',
            es: 'O sea, que nada ejecutó de verdad esa consulta contra una base de datos real.',
          },
        },
        {
          speaker: 'Lucía',
          text: 'Exactly. We don\'t have an integration test for the discount path. I\'d add one with a containerized database.',
          translation: {
            fr: 'Exactement. On n\'a pas de test d\'intégration pour le cas des remises. J\'en ajouterais un avec une base de données conteneurisée.',
            es: 'Exacto. No tenemos prueba de integración para el flujo de descuentos. Yo añadiría una con una base de datos en un contenedor.',
          },
        },
        {
          speaker: 'Tom',
          text: 'Should we add an end-to-end test too, through the checkout page?',
          translation: {
            fr: 'On devrait aussi ajouter un test end-to-end, via la page de paiement ?',
            es: '¿Deberíamos añadir también una prueba end-to-end, a través de la página de pago?',
          },
        },
        {
          speaker: 'Lucía',
          text: 'Maybe one happy path. End-to-end tests are slow, and our suite already has two flaky ones.',
          translation: {
            fr: 'Peut-être un seul cas nominal. Les tests end-to-end sont lents, et notre suite en a déjà deux instables.',
            es: 'Quizá solo un caso feliz. Las pruebas end-to-end son lentas y nuestra suite ya tiene dos inestables.',
          },
        },
        {
          speaker: 'Tom',
          text: 'Fair. I\'ll write a failing integration test first, then fix the query.',
          translation: {
            fr: 'D\'accord. J\'écris d\'abord un test d\'intégration qui échoue, puis je corrige la requête.',
            es: 'Vale. Primero escribo una prueba de integración que falle y luego corrijo la consulta.',
          },
        },
        {
          speaker: 'Lucía',
          text: 'Perfect. Tag me on the pull request and I\'ll review the test cases.',
          translation: {
            fr: 'Parfait. Mentionne-moi sur la pull request et je relirai les cas de test.',
            es: 'Perfecto. Etiquétame en la pull request y reviso los casos de prueba.',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'te-15-q1',
        type: 'choice',
        prompt: 'A bug is in a SQL query, but the repository is mocked in all tests. Which test would most likely catch it?',
        options: [
          'A unit test with a mocked repository',
          'An integration test against a real database',
          'A linter check',
          'A UI snapshot test',
        ],
        correctIndex: 1,
        explanation: 'Only a test that runs the real query against a real (or containerized) database can detect a bug inside the query itself.',
      },
      {
        id: 'te-15-q2',
        type: 'fill',
        prompt: 'This test is ___: it fails randomly even when nobody changes the code.',
        options: ['flaky', 'mocked', 'green', 'covered'],
        correctIndex: 0,
        explanation: 'A "flaky" test gives inconsistent results without code changes, often because of timing or shared state.',
      },
      {
        id: 'te-15-q3',
        type: 'choice',
        prompt: 'Why do teams usually have fewer end-to-end tests than unit tests?',
        options: [
          'End-to-end tests are slower and more expensive to maintain.',
          'End-to-end tests cannot find real bugs.',
          'Unit tests check the whole system.',
          'End-to-end tests only run in production.',
        ],
        correctIndex: 0,
        explanation: 'End-to-end tests exercise the full stack, so they take longer to run and break more often when the UI or environment changes.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // te-16 Debugging out loud
  // ---------------------------------------------------------------------------
  {
    id: 'te-16',
    moduleId: 'technical',
    topic: 'quality',
    title: 'Debugging out loud',
    titleTranslation: {
      fr: 'Déboguer à voix haute',
      es: 'Depurar en voz alta',
    },
    level: 'beginner',
    premium: false,
    estimatedMinutes: 7,
    roles: ['any', 'student', 'qa'],
    objective: 'Describe what you see, what you expect and what you are trying while you debug with a colleague.',
    objectiveTranslation: {
      fr: 'Décrire ce que vous voyez, ce que vous attendez et ce que vous essayez pendant que vous déboguez avec un collègue.',
      es: 'Describir lo que ves, lo que esperas y lo que estás probando mientras depuras con un compañero.',
    },
    situation: 'You share your screen with a teammate because a page shows an error and you cannot find the cause.',
    situationTranslation: {
      fr: 'Vous partagez votre écran avec un collègue parce qu\'une page affiche une erreur et vous ne trouvez pas la cause.',
      es: 'Compartes tu pantalla con un compañero porque una página muestra un error y no encuentras la causa.',
    },
    vocabulary: [
      {
        term: 'breakpoint',
        definition: 'A marker in the code where the debugger pauses the program so you can inspect it.',
        translation: { fr: 'point d\'arrêt', es: 'punto de interrupción' },
      },
      {
        term: 'stack trace',
        definition: 'The list of function calls that were active when an error happened.',
        translation: { fr: 'stack trace (pile d\'appels)', es: 'stack trace (traza de la pila)' },
      },
      {
        term: 'to reproduce',
        definition: 'To make a bug happen again on purpose, by repeating the same steps.',
        translation: { fr: 'reproduire', es: 'reproducir' },
      },
      {
        term: 'null',
        definition: 'A value that means "nothing"; using it as if it were an object often causes an error.',
        translation: { fr: 'null (valeur nulle)', es: 'null (valor nulo)' },
      },
      {
        term: 'to step through',
        definition: 'To run code one line at a time in a debugger to see what happens.',
        translation: { fr: 'exécuter pas à pas', es: 'ejecutar paso a paso' },
      },
    ],
    expressions: [
      {
        phrase: 'I expected this to return a list, but it returns null.',
        usage: 'Use it to compare what should happen with what really happens. This is the start of every good bug description.',
        translation: {
          fr: 'Je m\'attendais à ce que ça renvoie une liste, mais ça renvoie null.',
          es: 'Esperaba que esto devolviera una lista, pero devuelve null.',
        },
      },
      {
        phrase: 'I can reproduce it every time.',
        usage: 'Use it to say the bug is not random, which makes it easier to fix.',
        translation: {
          fr: 'Je peux le reproduire à chaque fois.',
          es: 'Puedo reproducirlo siempre.',
        },
      },
      {
        phrase: 'Let me put a breakpoint here.',
        usage: 'Use it to tell your colleague what you are going to do next.',
        translation: {
          fr: 'Je vais mettre un point d\'arrêt ici.',
          es: 'Voy a poner un punto de interrupción aquí.',
        },
      },
      {
        phrase: 'The stack trace points to line 42.',
        usage: 'Use it to show where the error comes from.',
        translation: {
          fr: 'La stack trace pointe vers la ligne 42.',
          es: 'La stack trace apunta a la línea 42.',
        },
      },
      {
        phrase: 'Okay, so that rules out the API.',
        usage: 'Use it when a test shows that one possible cause is not the problem.',
        translation: {
          fr: 'Bon, donc ce n\'est pas l\'API.',
          es: 'Vale, entonces queda descartada la API.',
        },
      },
    ],
    dialogue: {
      context: 'Marco (junior developer) shares his screen with Priya (senior developer) to debug a profile page.',
      lines: [
        {
          speaker: 'Marco',
          text: 'Can you look at this? The profile page crashes when I open it.',
          translation: {
            fr: 'Tu peux regarder ça ? La page de profil plante quand je l\'ouvre.',
            es: '¿Puedes mirar esto? La página de perfil falla cuando la abro.',
          },
        },
        {
          speaker: 'Priya',
          text: 'Sure. Can you reproduce it every time?',
          translation: {
            fr: 'Bien sûr. Tu peux le reproduire à chaque fois ?',
            es: 'Claro. ¿Puedes reproducirlo siempre?',
          },
        },
        {
          speaker: 'Marco',
          text: 'Yes. The stack trace points to line 42. It says "cannot read property name of null".',
          translation: {
            fr: 'Oui. La stack trace pointe vers la ligne 42. Elle dit « cannot read property name of null ».',
            es: 'Sí. La stack trace apunta a la línea 42. Dice «cannot read property name of null».',
          },
        },
        {
          speaker: 'Priya',
          text: 'So the user object is null. Is the API returning data?',
          translation: {
            fr: 'Donc l\'objet user est null. Est-ce que l\'API renvoie des données ?',
            es: 'Entonces el objeto user es null. ¿La API está devolviendo datos?',
          },
        },
        {
          speaker: 'Marco',
          text: 'Let me check the network tab. Yes, the API returns the user correctly.',
          translation: {
            fr: 'Je regarde l\'onglet réseau. Oui, l\'API renvoie bien l\'utilisateur.',
            es: 'Miro la pestaña de red. Sí, la API devuelve el usuario correctamente.',
          },
        },
        {
          speaker: 'Priya',
          text: 'Okay, so that rules out the API. Put a breakpoint on line 42 and step through.',
          translation: {
            fr: 'Bon, donc ce n\'est pas l\'API. Mets un point d\'arrêt à la ligne 42 et avance pas à pas.',
            es: 'Vale, entonces queda descartada la API. Pon un punto de interrupción en la línea 42 y ve paso a paso.',
          },
        },
        {
          speaker: 'Marco',
          text: 'Oh, I see. The page renders before the data arrives. I expected the user to be loaded already.',
          translation: {
            fr: 'Ah, je vois. La page s\'affiche avant que les données arrivent. Je pensais que l\'utilisateur était déjà chargé.',
            es: 'Ah, ya veo. La página se renderiza antes de que lleguen los datos. Pensaba que el usuario ya estaba cargado.',
          },
        },
        {
          speaker: 'Priya',
          text: 'That\'s it. Show a loading state while the user is null, and the crash should go away.',
          translation: {
            fr: 'C\'est ça. Affiche un état de chargement tant que user est null, et le crash devrait disparaître.',
            es: 'Eso es. Muestra un estado de carga mientras el usuario sea null y el fallo debería desaparecer.',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'te-16-q1',
        type: 'fill',
        prompt: 'I expected an array, ___ it returns null.',
        options: ['so', 'but', 'because', 'and then'],
        correctIndex: 1,
        explanation: '"But" introduces a contrast between what you expected and what really happened.',
      },
      {
        id: 'te-16-q2',
        type: 'choice',
        prompt: 'What does "I can reproduce it" mean?',
        options: [
          'I can fix the bug.',
          'I can make the bug happen again.',
          'I can copy the code.',
          'I can deploy the code again.',
        ],
        correctIndex: 1,
        explanation: 'To reproduce a bug means to make it happen again by repeating the same steps.',
      },
      {
        id: 'te-16-q3',
        type: 'choice',
        prompt: 'You want the program to pause on a specific line. What do you use?',
        options: ['A stack trace', 'A commit', 'A breakpoint', 'A log level'],
        correctIndex: 2,
        explanation: 'A breakpoint tells the debugger to pause execution at that line so you can inspect variables.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // te-17 Explaining a technical problem
  // ---------------------------------------------------------------------------
  {
    id: 'te-17',
    moduleId: 'technical',
    topic: 'communication',
    title: 'Explaining a technical problem',
    titleTranslation: {
      fr: 'Expliquer un problème technique',
      es: 'Explicar un problema técnico',
    },
    level: 'intermediate',
    premium: false,
    estimatedMinutes: 8,
    roles: ['any'],
    objective: 'Describe a technical problem in a clear structure: symptoms, impact, what you have tried and what you need.',
    objectiveTranslation: {
      fr: 'Décrire un problème technique de façon structurée : symptômes, impact, ce que vous avez essayé et ce dont vous avez besoin.',
      es: 'Describir un problema técnico con una estructura clara: síntomas, impacto, lo que has probado y lo que necesitas.',
    },
    situation: 'You are blocked by an issue and need to ask another team for help in a short call.',
    situationTranslation: {
      fr: 'Vous êtes bloqué par un problème et devez demander de l\'aide à une autre équipe lors d\'un court appel.',
      es: 'Estás bloqueado por un problema y necesitas pedir ayuda a otro equipo en una llamada corta.',
    },
    vocabulary: [
      {
        term: 'symptom',
        definition: 'What you can observe when something is wrong, such as an error message or a slow page.',
        translation: { fr: 'symptôme', es: 'síntoma' },
      },
      {
        term: 'root cause',
        definition: 'The underlying reason a problem happens, as opposed to its visible effects.',
        translation: { fr: 'cause racine', es: 'causa raíz' },
      },
      {
        term: 'intermittent',
        definition: 'Happening only some of the time, not consistently.',
        translation: { fr: 'intermittent', es: 'intermitente' },
      },
      {
        term: 'workaround',
        definition: 'A temporary way to avoid a problem without actually fixing it.',
        translation: { fr: 'solution de contournement', es: 'solución provisional (workaround)' },
      },
      {
        term: 'blocker',
        definition: 'An issue that stops you or your team from making progress.',
        translation: { fr: 'point bloquant', es: 'bloqueo' },
      },
    ],
    expressions: [
      {
        phrase: 'Here\'s what we\'re seeing: about one request in twenty times out.',
        usage: 'Use it to start with observable symptoms and, if possible, a number.',
        translation: {
          fr: 'Voilà ce qu\'on observe : environ une requête sur vingt part en timeout.',
          es: 'Esto es lo que vemos: más o menos una de cada veinte peticiones da timeout.',
        },
      },
      {
        phrase: 'It started on Tuesday, right after the library upgrade.',
        usage: 'Use it to give a timeline and a possible trigger without claiming it is the cause.',
        translation: {
          fr: 'Ça a commencé mardi, juste après la mise à jour de la bibliothèque.',
          es: 'Empezó el martes, justo después de actualizar la librería.',
        },
      },
      {
        phrase: 'So far we\'ve ruled out the network and the database.',
        usage: 'Use it to save people time by listing what you have already checked.',
        translation: {
          fr: 'Pour l\'instant, on a écarté le réseau et la base de données.',
          es: 'De momento hemos descartado la red y la base de datos.',
        },
      },
      {
        phrase: 'We have a workaround, but it\'s not sustainable.',
        usage: 'Use it to explain the current situation and why a real fix is still needed.',
        translation: {
          fr: 'On a une solution de contournement, mais elle n\'est pas tenable à long terme.',
          es: 'Tenemos un workaround, pero no es sostenible.',
        },
      },
      {
        phrase: 'What I need from you is someone who knows the auth service.',
        usage: 'Use it to end with a clear, specific request.',
        translation: {
          fr: 'Ce dont j\'ai besoin, c\'est de quelqu\'un qui connaît le service d\'authentification.',
          es: 'Lo que necesito es alguien que conozca el servicio de autenticación.',
        },
      },
    ],
    dialogue: {
      context: 'Amara (backend developer) calls Kenji from the platform team about intermittent timeouts.',
      lines: [
        {
          speaker: 'Amara',
          text: 'Thanks for jumping on. I\'ll keep it short. We\'re seeing intermittent timeouts when our service calls the auth service.',
          translation: {
            fr: 'Merci de te joindre à l\'appel. Je fais court. On a des timeouts intermittents quand notre service appelle le service d\'authentification.',
            es: 'Gracias por conectarte. Seré breve. Tenemos timeouts intermitentes cuando nuestro servicio llama al servicio de autenticación.',
          },
        },
        {
          speaker: 'Kenji',
          text: 'How often, roughly?',
          translation: {
            fr: 'À peu près à quelle fréquence ?',
            es: '¿Con qué frecuencia, más o menos?',
          },
        },
        {
          speaker: 'Amara',
          text: 'About one request in twenty. It started on Tuesday, right after we upgraded our HTTP client library.',
          translation: {
            fr: 'Environ une requête sur vingt. Ça a commencé mardi, juste après la mise à jour de notre bibliothèque client HTTP.',
            es: 'Más o menos una de cada veinte peticiones. Empezó el martes, justo después de actualizar nuestra librería de cliente HTTP.',
          },
        },
        {
          speaker: 'Kenji',
          text: 'What have you checked so far?',
          translation: {
            fr: 'Qu\'est-ce que vous avez vérifié jusqu\'ici ?',
            es: '¿Qué habéis comprobado hasta ahora?',
          },
        },
        {
          speaker: 'Amara',
          text: 'We\'ve ruled out the network; latency between the services is normal. Our workaround is a retry, but it doubles the load on your side.',
          translation: {
            fr: 'On a écarté le réseau ; la latence entre les services est normale. Notre contournement, c\'est un retry, mais ça double la charge de votre côté.',
            es: 'Hemos descartado la red; la latencia entre los servicios es normal. Nuestro workaround es un reintento, pero duplica la carga en vuestro lado.',
          },
        },
        {
          speaker: 'Kenji',
          text: 'Good to know. Did the upgrade change the connection pool settings?',
          translation: {
            fr: 'Bon à savoir. Est-ce que la mise à jour a modifié les paramètres du pool de connexions ?',
            es: 'Es bueno saberlo. ¿La actualización cambió la configuración del pool de conexiones?',
          },
        },
        {
          speaker: 'Amara',
          text: 'That\'s a good question. I don\'t know yet. What I need from you is access to the auth service logs for Tuesday.',
          translation: {
            fr: 'Bonne question. Je ne sais pas encore. Ce dont j\'ai besoin, c\'est d\'accéder aux logs du service d\'authentification de mardi.',
            es: 'Buena pregunta. Todavía no lo sé. Lo que necesito es acceso a los logs del servicio de autenticación del martes.',
          },
        },
        {
          speaker: 'Kenji',
          text: 'I can share those today. Check the pool defaults in the meantime; that kind of upgrade often changes them.',
          translation: {
            fr: 'Je peux te les partager aujourd\'hui. En attendant, vérifie les valeurs par défaut du pool ; ce genre de mise à jour les change souvent.',
            es: 'Te los puedo pasar hoy. Mientras tanto, revisa los valores por defecto del pool; ese tipo de actualización suele cambiarlos.',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'te-17-q1',
        type: 'choice',
        prompt: 'What is the best way to start explaining a problem to another team?',
        options: [
          'Your service is broken.',
          'Here\'s what we\'re seeing: about 5% of our calls to your service time out since Tuesday.',
          'I think it\'s probably your fault.',
          'Do you have a minute? It\'s complicated.',
        ],
        correctIndex: 1,
        explanation: 'It starts with observable symptoms, a number and a timeline, and it does not blame anyone.',
      },
      {
        id: 'te-17-q2',
        type: 'fill',
        prompt: 'So far we\'ve ___ out the network, so it\'s probably something in the code.',
        options: ['ruled', 'checked', 'found', 'taken'],
        correctIndex: 0,
        explanation: '"To rule out" means to decide that something is not the cause.',
      },
      {
        id: 'te-17-q3',
        type: 'choice',
        prompt: 'What is a "workaround"?',
        options: [
          'The permanent fix for the root cause',
          'A meeting to discuss the issue',
          'A report written after an incident',
          'A temporary way to avoid the problem without fixing it',
        ],
        correctIndex: 3,
        explanation: 'A workaround lets you keep working despite a problem, but the root cause is still there.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // te-18 Describing a software architecture
  // ---------------------------------------------------------------------------
  {
    id: 'te-18',
    moduleId: 'technical',
    topic: 'communication',
    title: 'Describing a software architecture',
    titleTranslation: {
      fr: 'Décrire une architecture logicielle',
      es: 'Describir una arquitectura de software',
    },
    level: 'advanced',
    premium: true,
    estimatedMinutes: 11,
    roles: ['architect', 'java', 'fullstack'],
    objective: 'Walk someone through a system architecture: components, data flow, and the trade-offs behind each decision.',
    objectiveTranslation: {
      fr: 'Présenter une architecture à quelqu\'un : composants, flux de données et compromis derrière chaque décision.',
      es: 'Explicar a alguien la arquitectura de un sistema: componentes, flujo de datos y los compromisos detrás de cada decisión.',
    },
    situation: 'A new senior engineer joins the team and you present the order-processing architecture on a whiteboard.',
    situationTranslation: {
      fr: 'Un nouvel ingénieur senior rejoint l\'équipe et vous présentez l\'architecture de traitement des commandes sur un tableau blanc.',
      es: 'Un nuevo ingeniero sénior se une al equipo y le presentas la arquitectura de procesamiento de pedidos en una pizarra.',
    },
    vocabulary: [
      {
        term: 'message broker',
        definition: 'A component, such as a queue or event stream, that receives messages from producers and delivers them to consumers.',
        translation: { fr: 'broker de messages', es: 'bróker de mensajes' },
      },
      {
        term: 'eventual consistency',
        definition: 'A guarantee that replicas or services will agree on the same data after some time, but not necessarily immediately.',
        translation: { fr: 'cohérence à terme', es: 'consistencia eventual' },
      },
      {
        term: 'coupling',
        definition: 'How much one component depends on the internal details or availability of another.',
        translation: { fr: 'couplage', es: 'acoplamiento' },
      },
      {
        term: 'single point of failure',
        definition: 'A component whose failure brings down the whole system because nothing can take over.',
        translation: { fr: 'point de défaillance unique', es: 'punto único de fallo' },
      },
      {
        term: 'bounded context',
        definition: 'In domain-driven design, a clear boundary within which a domain model and its terms have one consistent meaning.',
        translation: { fr: 'contexte borné (bounded context)', es: 'contexto delimitado (bounded context)' },
      },
    ],
    expressions: [
      {
        phrase: 'At a high level, there are three main pieces.',
        usage: 'Use it to give the big picture before going into details, so the listener has a mental map.',
        translation: {
          fr: 'Dans les grandes lignes, il y a trois composants principaux.',
          es: 'A grandes rasgos, hay tres piezas principales.',
        },
      },
      {
        phrase: 'The order service publishes an event, and the billing service consumes it asynchronously.',
        usage: 'Use it to describe data flow and make clear which communication is synchronous or asynchronous.',
        translation: {
          fr: 'Le service de commandes publie un événement, et le service de facturation le consomme de manière asynchrone.',
          es: 'El servicio de pedidos publica un evento y el servicio de facturación lo consume de forma asíncrona.',
        },
      },
      {
        phrase: 'We chose this deliberately to decouple the two services, at the cost of eventual consistency.',
        usage: 'Use it to explain a decision together with the price you pay for it.',
        translation: {
          fr: 'On l\'a choisi délibérément pour découpler les deux services, au prix d\'une cohérence à terme.',
          es: 'Lo elegimos a propósito para desacoplar los dos servicios, a costa de una consistencia eventual.',
        },
      },
      {
        phrase: 'If I\'m honest, the shared database is our weakest point.',
        usage: 'Use it to admit a known weakness candidly, which builds trust with experienced listeners.',
        translation: {
          fr: 'Pour être honnête, la base de données partagée est notre point le plus faible.',
          es: 'Siendo sincero, la base de datos compartida es nuestro punto más débil.',
        },
      },
      {
        phrase: 'Arguably, that\'s fine at our current scale, but it won\'t hold if traffic triples.',
        usage: 'Use it to hedge: accept a decision for now while flagging the limit where it stops working.',
        translation: {
          fr: 'On peut considérer que ça suffit à notre échelle actuelle, mais ça ne tiendra pas si le trafic triple.',
          es: 'Se podría decir que vale a nuestra escala actual, pero no aguantará si el tráfico se triplica.',
        },
      },
    ],
    dialogue: {
      context: 'Priya (architect) explains the order-processing architecture to Tom, a newly hired senior engineer.',
      lines: [
        {
          speaker: 'Priya',
          text: 'At a high level, there are three main pieces: the API gateway, the order service and the billing service.',
          translation: {
            fr: 'Dans les grandes lignes, il y a trois composants principaux : l\'API gateway, le service de commandes et le service de facturation.',
            es: 'A grandes rasgos, hay tres piezas principales: el API gateway, el servicio de pedidos y el servicio de facturación.',
          },
        },
        {
          speaker: 'Tom',
          text: 'How do the order and billing services talk to each other? Synchronous calls?',
          translation: {
            fr: 'Comment les services de commandes et de facturation communiquent-ils ? Par des appels synchrones ?',
            es: '¿Cómo se comunican los servicios de pedidos y facturación? ¿Con llamadas síncronas?',
          },
        },
        {
          speaker: 'Priya',
          text: 'No. When an order is placed, the order service publishes an event to the message broker, and billing consumes it asynchronously.',
          translation: {
            fr: 'Non. Quand une commande est passée, le service de commandes publie un événement sur le broker de messages, et la facturation le consomme de manière asynchrone.',
            es: 'No. Cuando se hace un pedido, el servicio de pedidos publica un evento en el bróker de mensajes y facturación lo consume de forma asíncrona.',
          },
        },
        {
          speaker: 'Tom',
          text: 'So if billing is down, orders still go through?',
          translation: {
            fr: 'Donc si la facturation est en panne, les commandes passent quand même ?',
            es: '¿O sea, que si facturación está caído, los pedidos siguen entrando?',
          },
        },
        {
          speaker: 'Priya',
          text: 'Exactly. We chose that deliberately to reduce coupling. The trade-off is eventual consistency: an invoice can appear a few seconds after the order.',
          translation: {
            fr: 'Exactement. On l\'a choisi délibérément pour réduire le couplage. Le compromis, c\'est la cohérence à terme : une facture peut apparaître quelques secondes après la commande.',
            es: 'Exacto. Lo elegimos a propósito para reducir el acoplamiento. El precio es la consistencia eventual: una factura puede aparecer unos segundos después del pedido.',
          },
        },
        {
          speaker: 'Tom',
          text: 'Makes sense. Are there any parts you\'re not happy with?',
          translation: {
            fr: 'Ça se tient. Il y a des parties dont vous n\'êtes pas satisfaits ?',
            es: 'Tiene sentido. ¿Hay alguna parte de la que no estéis contentos?',
          },
        },
        {
          speaker: 'Priya',
          text: 'If I\'m honest, both services still share one database. It\'s a single point of failure, and it blurs the bounded contexts.',
          translation: {
            fr: 'Pour être honnête, les deux services partagent encore une seule base de données. C\'est un point de défaillance unique, et ça brouille les bounded contexts.',
            es: 'Siendo sincera, los dos servicios todavía comparten una única base de datos. Es un punto único de fallo y difumina los bounded contexts.',
          },
        },
        {
          speaker: 'Tom',
          text: 'Is splitting it on the roadmap?',
          translation: {
            fr: 'La séparer, c\'est prévu dans la roadmap ?',
            es: '¿Separarla está en la hoja de ruta?',
          },
        },
        {
          speaker: 'Priya',
          text: 'Arguably it\'s fine at our current scale, but it won\'t hold if traffic triples. We\'re planning it for next quarter.',
          translation: {
            fr: 'On peut considérer que ça suffit à notre échelle actuelle, mais ça ne tiendra pas si le trafic triple. On le prévoit pour le trimestre prochain.',
            es: 'Se podría decir que vale a nuestra escala actual, pero no aguantará si el tráfico se triplica. Lo tenemos previsto para el próximo trimestre.',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'te-18-q1',
        type: 'choice',
        prompt: 'Two services communicate through a message broker. What is a typical consequence?',
        options: [
          'Data is always consistent immediately in both services.',
          'The services are more tightly coupled.',
          'The consumer may see changes with a short delay (eventual consistency).',
          'The producer must wait for the consumer to respond.',
        ],
        correctIndex: 2,
        explanation: 'Asynchronous messaging decouples services, but the consumer processes events later, so data becomes consistent eventually rather than instantly.',
      },
      {
        id: 'te-18-q2',
        type: 'fill',
        prompt: 'We chose this to decouple the services, at the ___ of some extra complexity.',
        options: ['value', 'cost', 'risk', 'loss'],
        correctIndex: 1,
        explanation: '"At the cost of" is the standard phrase to introduce the downside of a decision.',
      },
      {
        id: 'te-18-q3',
        type: 'choice',
        prompt: 'Which sentence hedges diplomatically about a design weakness?',
        options: [
          'This design is terrible.',
          'Arguably it\'s fine for now, but it won\'t scale if traffic triples.',
          'There are no problems with this design.',
          'Someone made a bad decision here.',
        ],
        correctIndex: 1,
        explanation: '"Arguably" softens the claim, and the sentence names a concrete limit instead of judging the design or people.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // te-19 Explaining a code change
  // ---------------------------------------------------------------------------
  {
    id: 'te-19',
    moduleId: 'technical',
    topic: 'communication',
    title: 'Explaining a code change: pull requests and code reviews',
    titleTranslation: {
      fr: 'Expliquer une modification de code : pull requests et code reviews',
      es: 'Explicar un cambio de código: pull requests y code reviews',
    },
    level: 'intermediate',
    premium: true,
    estimatedMinutes: 9,
    roles: ['any', 'java', 'react', 'fullstack'],
    objective: 'Describe what a change does and why, and give or respond to review comments constructively.',
    objectiveTranslation: {
      fr: 'Décrire ce que fait une modification et pourquoi, et formuler ou recevoir des commentaires de revue de façon constructive.',
      es: 'Describir qué hace un cambio y por qué, y hacer o responder comentarios de revisión de forma constructiva.',
    },
    situation: 'You opened a pull request that refactors a payment module, and a colleague is reviewing it.',
    situationTranslation: {
      fr: 'Vous avez ouvert une pull request qui refactorise un module de paiement, et un collègue est en train de la relire.',
      es: 'Has abierto una pull request que refactoriza un módulo de pagos y un compañero la está revisando.',
    },
    vocabulary: [
      {
        term: 'diff',
        definition: 'The set of lines added, removed or changed between two versions of the code.',
        translation: { fr: 'diff', es: 'diff' },
      },
      {
        term: 'nit',
        definition: 'A small, optional review comment about style or naming that should not block the merge.',
        translation: { fr: 'nit (remarque mineure)', es: 'nit (comentario menor)' },
      },
      {
        term: 'to refactor',
        definition: 'To restructure code to make it cleaner without changing what it does.',
        translation: { fr: 'refactoriser', es: 'refactorizar' },
      },
      {
        term: 'breaking change',
        definition: 'A change that forces other code or clients to be updated because the old behavior no longer works.',
        translation: { fr: 'changement cassant (breaking change)', es: 'cambio incompatible (breaking change)' },
      },
      {
        term: 'to approve',
        definition: 'To mark a pull request as acceptable to merge after reviewing it.',
        translation: { fr: 'approuver', es: 'aprobar' },
      },
    ],
    expressions: [
      {
        phrase: 'This PR extracts the retry logic into its own class. No behavior change.',
        usage: 'Use it at the top of a PR description to say what it does and set expectations for reviewers.',
        translation: {
          fr: 'Cette PR extrait la logique de retry dans sa propre classe. Aucun changement de comportement.',
          es: 'Esta PR extrae la lógica de reintentos a su propia clase. Sin cambios de comportamiento.',
        },
      },
      {
        phrase: 'The main thing to look at is the new error handling in PaymentClient.',
        usage: 'Use it to guide reviewers to the part of the diff that matters most.',
        translation: {
          fr: 'Le point principal à regarder, c\'est la nouvelle gestion d\'erreurs dans PaymentClient.',
          es: 'Lo principal que hay que mirar es el nuevo manejo de errores en PaymentClient.',
        },
      },
      {
        phrase: 'Nit: maybe rename this to something more descriptive? Not blocking.',
        usage: 'Use it to make a minor suggestion while making clear the author can merge anyway.',
        translation: {
          fr: 'Nit : peut-être renommer ça en quelque chose de plus parlant ? Pas bloquant.',
          es: 'Nit: ¿quizá renombrarlo a algo más descriptivo? No es bloqueante.',
        },
      },
      {
        phrase: 'What happens here if the response is empty?',
        usage: 'Use it to raise a potential bug as a question rather than an accusation.',
        translation: {
          fr: 'Qu\'est-ce qui se passe ici si la réponse est vide ?',
          es: '¿Qué pasa aquí si la respuesta viene vacía?',
        },
      },
      {
        phrase: 'Good catch, I\'ve pushed a fix.',
        usage: 'Use it to accept a valid review comment and show you addressed it.',
        translation: {
          fr: 'Bien vu, j\'ai poussé un correctif.',
          es: 'Bien visto, ya he subido una corrección.',
        },
      },
    ],
    dialogue: {
      context: 'Lucía reviews Marco\'s pull request and they discuss it in a quick call.',
      lines: [
        {
          speaker: 'Marco',
          text: 'Thanks for reviewing. Basically, this PR extracts the retry logic into its own class. There should be no behavior change.',
          translation: {
            fr: 'Merci pour la revue. En gros, cette PR extrait la logique de retry dans sa propre classe. Il ne devrait y avoir aucun changement de comportement.',
            es: 'Gracias por revisarla. Básicamente, esta PR extrae la lógica de reintentos a su propia clase. No debería haber cambios de comportamiento.',
          },
        },
        {
          speaker: 'Lucía',
          text: 'Overall it looks much cleaner. I left a few comments, mostly nits.',
          translation: {
            fr: 'Dans l\'ensemble, c\'est beaucoup plus propre. J\'ai laissé quelques commentaires, surtout des nits.',
            es: 'En general queda mucho más limpio. He dejado algunos comentarios, sobre todo nits.',
          },
        },
        {
          speaker: 'Marco',
          text: 'Great. Anything blocking?',
          translation: {
            fr: 'Super. Quelque chose de bloquant ?',
            es: 'Genial. ¿Algo bloqueante?',
          },
        },
        {
          speaker: 'Lucía',
          text: 'One thing. Before, we retried only on timeouts. Now it looks like we also retry on 400 errors. Is that intentional?',
          translation: {
            fr: 'Une chose. Avant, on ne réessayait que sur les timeouts. Là, on dirait qu\'on réessaie aussi sur les erreurs 400. C\'est voulu ?',
            es: 'Una cosa. Antes solo reintentábamos con los timeouts. Ahora parece que también reintentamos con los errores 400. ¿Es intencionado?',
          },
        },
        {
          speaker: 'Marco',
          text: 'Oh, no, good catch. A 400 means the request itself is wrong, so retrying won\'t help.',
          translation: {
            fr: 'Ah non, bien vu. Une 400 veut dire que la requête elle-même est incorrecte, donc réessayer ne servira à rien.',
            es: 'Ah, no, bien visto. Un 400 significa que la propia petición es incorrecta, así que reintentar no sirve de nada.',
          },
        },
        {
          speaker: 'Lucía',
          text: 'Exactly. Could you add a test for that case too?',
          translation: {
            fr: 'Exactement. Tu pourrais aussi ajouter un test pour ce cas ?',
            es: 'Exacto. ¿Podrías añadir también una prueba para ese caso?',
          },
        },
        {
          speaker: 'Marco',
          text: 'Sure. I\'ll push a fix and a test this afternoon.',
          translation: {
            fr: 'Bien sûr. Je pousse un correctif et un test cet après-midi.',
            es: 'Claro. Subo la corrección y una prueba esta tarde.',
          },
        },
        {
          speaker: 'Lucía',
          text: 'Perfect. Once that\'s in, I\'ll approve.',
          translation: {
            fr: 'Parfait. Dès que c\'est fait, j\'approuve.',
            es: 'Perfecto. En cuanto esté, la apruebo.',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'te-19-q1',
        type: 'choice',
        prompt: 'What does "Nit: not blocking" mean in a review comment?',
        options: [
          'The PR cannot be merged until this is fixed.',
          'It\'s a minor suggestion; the author can merge without changing it.',
          'The reviewer found a security problem.',
          'The reviewer did not read the code.',
        ],
        correctIndex: 1,
        explanation: 'A "nit" is a small, optional remark, and "not blocking" confirms it should not prevent the merge.',
      },
      {
        id: 'te-19-q2',
        type: 'choice',
        prompt: 'Which review comment is the most constructive?',
        options: [
          'This is wrong.',
          'Why would you do this?',
          'What happens here if the list is empty? I think it might throw.',
          'Rewrite this.',
        ],
        correctIndex: 2,
        explanation: 'It asks a specific question and explains the concern, so the author can understand and respond.',
      },
      {
        id: 'te-19-q3',
        type: 'fill',
        prompt: 'This PR only moves code around. It\'s a pure refactor with no ___ change.',
        options: ['behavior', 'breaking', 'review', 'diff'],
        correctIndex: 0,
        explanation: '"No behavior change" tells reviewers the code does exactly the same thing as before, only structured differently.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // te-20 Describing an API
  // ---------------------------------------------------------------------------
  {
    id: 'te-20',
    moduleId: 'technical',
    topic: 'communication',
    title: 'Describing an API to another team',
    titleTranslation: {
      fr: 'Présenter une API à une autre équipe',
      es: 'Describir una API a otro equipo',
    },
    level: 'intermediate',
    premium: true,
    estimatedMinutes: 9,
    roles: ['java', 'fullstack', 'react', 'architect'],
    objective: 'Explain endpoints, authentication, errors and limits so another team can integrate with your API.',
    objectiveTranslation: {
      fr: 'Expliquer les endpoints, l\'authentification, les erreurs et les limites pour qu\'une autre équipe puisse s\'intégrer à votre API.',
      es: 'Explicar los endpoints, la autenticación, los errores y los límites para que otro equipo pueda integrarse con tu API.',
    },
    situation: 'The mobile team wants to use your new notifications API and has booked a call with you.',
    situationTranslation: {
      fr: 'L\'équipe mobile veut utiliser votre nouvelle API de notifications et a organisé un appel avec vous.',
      es: 'El equipo de móvil quiere usar tu nueva API de notificaciones y ha reservado una llamada contigo.',
    },
    vocabulary: [
      {
        term: 'endpoint',
        definition: 'A specific URL and HTTP method that a client calls to perform one operation, such as POST /notifications.',
        translation: { fr: 'endpoint (point de terminaison)', es: 'endpoint (punto de acceso)' },
      },
      {
        term: 'payload',
        definition: 'The data sent in the body of a request or response, often in JSON.',
        translation: { fr: 'payload (corps de la requête)', es: 'payload (cuerpo de la petición)' },
      },
      {
        term: 'rate limit',
        definition: 'The maximum number of requests a client is allowed to make in a given time window.',
        translation: { fr: 'limite de débit (rate limit)', es: 'límite de peticiones (rate limit)' },
      },
      {
        term: 'pagination',
        definition: 'Splitting a large list of results into pages that the client requests one at a time.',
        translation: { fr: 'pagination', es: 'paginación' },
      },
      {
        term: 'idempotent',
        definition: 'Describes an operation that has the same effect whether it is called once or several times.',
        translation: { fr: 'idempotent', es: 'idempotente' },
      },
    ],
    expressions: [
      {
        phrase: 'You authenticate with a bearer token in the Authorization header.',
        usage: 'Use it to explain the first thing every client needs: how to get access.',
        translation: {
          fr: 'Vous vous authentifiez avec un bearer token dans le header Authorization.',
          es: 'Os autenticáis con un bearer token en la cabecera Authorization.',
        },
      },
      {
        phrase: 'The list endpoint is paginated; you pass the cursor from the previous response.',
        usage: 'Use it to describe how clients should fetch large result sets.',
        translation: {
          fr: 'L\'endpoint de liste est paginé ; vous passez le curseur de la réponse précédente.',
          es: 'El endpoint de listado está paginado; pasáis el cursor de la respuesta anterior.',
        },
      },
      {
        phrase: 'If you exceed the rate limit, you\'ll get a 429, so back off and retry.',
        usage: 'Use it to explain an error and the expected client behavior.',
        translation: {
          fr: 'Si vous dépassez la limite, vous recevrez une 429 ; il faut alors attendre et réessayer.',
          es: 'Si superáis el límite, recibiréis un 429, así que esperad y reintentad.',
        },
      },
      {
        phrase: 'Send an idempotency key so retries don\'t create duplicates.',
        usage: 'Use it to explain how clients can retry safely on a non-idempotent operation like POST.',
        translation: {
          fr: 'Envoyez une clé d\'idempotence pour que les retries ne créent pas de doublons.',
          es: 'Enviad una clave de idempotencia para que los reintentos no creen duplicados.',
        },
      },
      {
        phrase: 'We won\'t make breaking changes without bumping the version.',
        usage: 'Use it to reassure consumers about stability and versioning.',
        translation: {
          fr: 'On ne fera pas de breaking changes sans changer de version.',
          es: 'No haremos cambios incompatibles sin subir la versión.',
        },
      },
    ],
    dialogue: {
      context: 'Tom (backend developer) presents the notifications API to Amara from the mobile team.',
      lines: [
        {
          speaker: 'Tom',
          text: 'So, the API has three endpoints: create a notification, list notifications, and mark one as read.',
          translation: {
            fr: 'Alors, l\'API a trois endpoints : créer une notification, lister les notifications et en marquer une comme lue.',
            es: 'Bueno, la API tiene tres endpoints: crear una notificación, listar notificaciones y marcar una como leída.',
          },
        },
        {
          speaker: 'Amara',
          text: 'How do we authenticate?',
          translation: {
            fr: 'Comment on s\'authentifie ?',
            es: '¿Cómo nos autenticamos?',
          },
        },
        {
          speaker: 'Tom',
          text: 'With a bearer token in the Authorization header, the same one the app already gets at login.',
          translation: {
            fr: 'Avec un bearer token dans le header Authorization, le même que celui que l\'app reçoit déjà à la connexion.',
            es: 'Con un bearer token en la cabecera Authorization, el mismo que la app ya recibe al iniciar sesión.',
          },
        },
        {
          speaker: 'Amara',
          text: 'Some users have thousands of notifications. Do we get them all at once?',
          translation: {
            fr: 'Certains utilisateurs ont des milliers de notifications. On les reçoit toutes d\'un coup ?',
            es: 'Algunos usuarios tienen miles de notificaciones. ¿Nos llegan todas de golpe?',
          },
        },
        {
          speaker: 'Tom',
          text: 'No, the list is paginated, fifty per page. Each response includes a cursor you pass to get the next page.',
          translation: {
            fr: 'Non, la liste est paginée, cinquante par page. Chaque réponse contient un curseur que vous passez pour obtenir la page suivante.',
            es: 'No, el listado está paginado, cincuenta por página. Cada respuesta incluye un cursor que pasáis para obtener la página siguiente.',
          },
        },
        {
          speaker: 'Amara',
          text: 'And if the network drops while we\'re creating a notification? We don\'t want duplicates.',
          translation: {
            fr: 'Et si le réseau coupe pendant qu\'on crée une notification ? On ne veut pas de doublons.',
            es: '¿Y si se cae la red mientras creamos una notificación? No queremos duplicados.',
          },
        },
        {
          speaker: 'Tom',
          text: 'Good point. Send an idempotency key in the header. If you retry with the same key, we return the original result instead of creating a new one.',
          translation: {
            fr: 'Bonne remarque. Envoyez une clé d\'idempotence dans le header. Si vous réessayez avec la même clé, on renvoie le résultat initial au lieu d\'en créer un nouveau.',
            es: 'Buena observación. Enviad una clave de idempotencia en la cabecera. Si reintentáis con la misma clave, devolvemos el resultado original en lugar de crear uno nuevo.',
          },
        },
        {
          speaker: 'Amara',
          text: 'Great. Any limits we should know about?',
          translation: {
            fr: 'Super. Il y a des limites qu\'on devrait connaître ?',
            es: 'Genial. ¿Hay algún límite que debamos conocer?',
          },
        },
        {
          speaker: 'Tom',
          text: 'A hundred requests per minute per user. Above that you get a 429 with a Retry-After header. It\'s all in the OpenAPI spec I\'ll send you.',
          translation: {
            fr: 'Cent requêtes par minute et par utilisateur. Au-delà, vous recevez une 429 avec un header Retry-After. Tout est dans la spec OpenAPI que je vais vous envoyer.',
            es: 'Cien peticiones por minuto y usuario. Por encima, recibís un 429 con una cabecera Retry-After. Está todo en la especificación OpenAPI que os voy a enviar.',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'te-20-q1',
        type: 'choice',
        prompt: 'A client sends too many requests. Which HTTP status code does the API usually return?',
        options: ['401 Unauthorized', '404 Not Found', '429 Too Many Requests', '500 Internal Server Error'],
        correctIndex: 2,
        explanation: '429 Too Many Requests is the standard status for rate limiting, often with a Retry-After header.',
      },
      {
        id: 'te-20-q2',
        type: 'fill',
        prompt: 'PUT and DELETE are designed to be ___: calling them twice has the same effect as calling them once.',
        options: ['paginated', 'idempotent', 'asynchronous', 'versioned'],
        correctIndex: 1,
        explanation: 'An idempotent operation produces the same result no matter how many times it is repeated; HTTP defines PUT and DELETE as idempotent.',
      },
      {
        id: 'te-20-q3',
        type: 'choice',
        prompt: 'Why would you ask clients to send an idempotency key with a POST request?',
        options: [
          'To make the request faster',
          'To authenticate the user',
          'So a retried request does not create a duplicate',
          'To enable pagination',
        ],
        correctIndex: 2,
        explanation: 'POST is not idempotent by default; the key lets the server recognize a retry and return the original result.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // te-21 Explaining a database schema
  // ---------------------------------------------------------------------------
  {
    id: 'te-21',
    moduleId: 'technical',
    topic: 'communication',
    title: 'Explaining a database schema',
    titleTranslation: {
      fr: 'Expliquer un schéma de base de données',
      es: 'Explicar un esquema de base de datos',
    },
    level: 'intermediate',
    premium: true,
    estimatedMinutes: 9,
    roles: ['java', 'fullstack', 'architect'],
    objective: 'Describe tables, relationships, keys and indexes clearly, and justify modeling choices.',
    objectiveTranslation: {
      fr: 'Décrire clairement les tables, relations, clés et index, et justifier les choix de modélisation.',
      es: 'Describir con claridad tablas, relaciones, claves e índices, y justificar las decisiones de modelado.',
    },
    situation: 'You explain the schema of a booking system to a developer who will build a new reporting feature.',
    situationTranslation: {
      fr: 'Vous expliquez le schéma d\'un système de réservation à un développeur qui va créer une nouvelle fonctionnalité de reporting.',
      es: 'Explicas el esquema de un sistema de reservas a un desarrollador que va a crear una nueva funcionalidad de informes.',
    },
    vocabulary: [
      {
        term: 'primary key',
        definition: 'A column or set of columns that uniquely identifies each row in a table.',
        translation: { fr: 'clé primaire', es: 'clave primaria' },
      },
      {
        term: 'foreign key',
        definition: 'A column that references the primary key of another table and enforces the relationship between them.',
        translation: { fr: 'clé étrangère', es: 'clave foránea' },
      },
      {
        term: 'one-to-many relationship',
        definition: 'A relationship where one row in a table can be linked to many rows in another, like one customer with many bookings.',
        translation: { fr: 'relation un-à-plusieurs', es: 'relación uno a muchos' },
      },
      {
        term: 'index',
        definition: 'A data structure that speeds up lookups on certain columns, at the cost of extra storage and slower writes.',
        translation: { fr: 'index', es: 'índice' },
      },
      {
        term: 'to denormalize',
        definition: 'To duplicate some data across tables on purpose to make reads faster or simpler.',
        translation: { fr: 'dénormaliser', es: 'desnormalizar' },
      },
    ],
    expressions: [
      {
        phrase: 'Each booking belongs to exactly one customer, and a customer can have many bookings.',
        usage: 'Use it to describe a one-to-many relationship in plain words.',
        translation: {
          fr: 'Chaque réservation appartient à exactement un client, et un client peut avoir plusieurs réservations.',
          es: 'Cada reserva pertenece a un único cliente, y un cliente puede tener muchas reservas.',
        },
      },
      {
        phrase: 'customer_id is a foreign key to the customers table.',
        usage: 'Use it to explain how two tables are linked.',
        translation: {
          fr: 'customer_id est une clé étrangère vers la table customers.',
          es: 'customer_id es una clave foránea a la tabla customers.',
        },
      },
      {
        phrase: 'There\'s a join table between rooms and amenities, because it\'s many-to-many.',
        usage: 'Use it to explain why an extra table exists.',
        translation: {
          fr: 'Il y a une table de jointure entre rooms et amenities, parce que c\'est du plusieurs-à-plusieurs.',
          es: 'Hay una tabla intermedia entre rooms y amenities, porque es una relación muchos a muchos.',
        },
      },
      {
        phrase: 'We added a composite index on hotel_id and check_in_date for the search query.',
        usage: 'Use it to justify an index by linking it to a real query.',
        translation: {
          fr: 'On a ajouté un index composite sur hotel_id et check_in_date pour la requête de recherche.',
          es: 'Añadimos un índice compuesto sobre hotel_id y check_in_date para la consulta de búsqueda.',
        },
      },
      {
        phrase: 'We denormalized the total price to avoid recalculating it on every read.',
        usage: 'Use it to explain a deliberate deviation from a fully normalized design.',
        translation: {
          fr: 'On a dénormalisé le prix total pour éviter de le recalculer à chaque lecture.',
          es: 'Desnormalizamos el precio total para no recalcularlo en cada lectura.',
        },
      },
    ],
    dialogue: {
      context: 'Kenji (backend lead) explains the booking schema to Lucía, who is starting work on reports.',
      lines: [
        {
          speaker: 'Kenji',
          text: 'The core table is bookings. Each booking belongs to exactly one customer, and customer_id is a foreign key to the customers table.',
          translation: {
            fr: 'La table centrale, c\'est bookings. Chaque réservation appartient à exactement un client, et customer_id est une clé étrangère vers la table customers.',
            es: 'La tabla principal es bookings. Cada reserva pertenece a un único cliente, y customer_id es una clave foránea a la tabla customers.',
          },
        },
        {
          speaker: 'Lucía',
          text: 'And a booking can include several rooms?',
          translation: {
            fr: 'Et une réservation peut inclure plusieurs chambres ?',
            es: '¿Y una reserva puede incluir varias habitaciones?',
          },
        },
        {
          speaker: 'Kenji',
          text: 'Yes, that\'s the booking_items table: one row per room per booking. So bookings to booking_items is one-to-many.',
          translation: {
            fr: 'Oui, c\'est la table booking_items : une ligne par chambre et par réservation. Donc bookings vers booking_items, c\'est du un-à-plusieurs.',
            es: 'Sí, esa es la tabla booking_items: una fila por habitación y reserva. Así que bookings con booking_items es uno a muchos.',
          },
        },
        {
          speaker: 'Lucía',
          text: 'I noticed bookings has a total_price column. Isn\'t that just the sum of the items?',
          translation: {
            fr: 'J\'ai remarqué que bookings a une colonne total_price. Ce n\'est pas juste la somme des items ?',
            es: 'He visto que bookings tiene una columna total_price. ¿No es simplemente la suma de los items?',
          },
        },
        {
          speaker: 'Kenji',
          text: 'It is. We denormalized it on purpose, because the booking list page was summing items on every read. The trade-off is we must keep it in sync when items change.',
          translation: {
            fr: 'Si. On l\'a dénormalisé exprès, parce que la page de liste des réservations faisait la somme des items à chaque lecture. Le compromis, c\'est qu\'on doit la garder synchronisée quand les items changent.',
            es: 'Sí. La desnormalizamos a propósito, porque la página de listado de reservas sumaba los items en cada lectura. El precio es que hay que mantenerla sincronizada cuando cambian los items.',
          },
        },
        {
          speaker: 'Lucía',
          text: 'For my reports I\'ll filter by hotel and date range a lot. Is that indexed?',
          translation: {
            fr: 'Pour mes rapports, je vais beaucoup filtrer par hôtel et par plage de dates. C\'est indexé ?',
            es: 'Para mis informes voy a filtrar mucho por hotel y rango de fechas. ¿Está indexado?',
          },
        },
        {
          speaker: 'Kenji',
          text: 'There\'s a composite index on hotel_id and check_in_date. Put hotel_id in the filter, or the index won\'t help much.',
          translation: {
            fr: 'Il y a un index composite sur hotel_id et check_in_date. Mets hotel_id dans le filtre, sinon l\'index ne servira pas à grand-chose.',
            es: 'Hay un índice compuesto sobre hotel_id y check_in_date. Incluye hotel_id en el filtro o el índice no ayudará mucho.',
          },
        },
        {
          speaker: 'Lucía',
          text: 'Got it. I\'ll run the queries against a read replica so I don\'t slow down production.',
          translation: {
            fr: 'Compris. Je lancerai les requêtes sur un réplica en lecture pour ne pas ralentir la production.',
            es: 'Entendido. Lanzaré las consultas contra una réplica de lectura para no ralentizar producción.',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'te-21-q1',
        type: 'choice',
        prompt: 'Students can take many courses, and each course has many students. How is this usually modeled?',
        options: [
          'A join table with a foreign key to each table',
          'A single column in the students table',
          'A primary key on the courses table only',
          'An index on the student name',
        ],
        correctIndex: 0,
        explanation: 'A many-to-many relationship needs a join table that holds pairs of foreign keys, one to each side.',
      },
      {
        id: 'te-21-q2',
        type: 'fill',
        prompt: 'order_id in the order_lines table is a ___ key that points to the orders table.',
        options: ['primary', 'foreign', 'composite', 'unique'],
        correctIndex: 1,
        explanation: 'A foreign key references the primary key of another table and enforces the link between them.',
      },
      {
        id: 'te-21-q3',
        type: 'choice',
        prompt: 'What is the main downside of adding an index?',
        options: [
          'Reads become slower.',
          'It deletes duplicate rows.',
          'It removes the need for a primary key.',
          'It uses extra storage and makes writes a bit slower.',
        ],
        correctIndex: 3,
        explanation: 'Indexes speed up reads, but they take space and must be updated on every insert, update or delete.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // te-22 Discussing performance
  // ---------------------------------------------------------------------------
  {
    id: 'te-22',
    moduleId: 'technical',
    topic: 'communication',
    title: 'Discussing performance',
    titleTranslation: {
      fr: 'Parler de performance',
      es: 'Hablar de rendimiento',
    },
    level: 'advanced',
    premium: true,
    estimatedMinutes: 10,
    roles: ['java', 'fullstack', 'devops', 'architect'],
    objective: 'Discuss latency, throughput and bottlenecks precisely, using data rather than impressions.',
    objectiveTranslation: {
      fr: 'Parler précisément de latence, de débit et de goulots d\'étranglement, en s\'appuyant sur des données plutôt que sur des impressions.',
      es: 'Hablar con precisión de latencia, rendimiento y cuellos de botella, basándote en datos y no en impresiones.',
    },
    situation: 'The search page got slower after a release, and the team meets to analyze the metrics.',
    situationTranslation: {
      fr: 'La page de recherche est devenue plus lente après une release, et l\'équipe se réunit pour analyser les métriques.',
      es: 'La página de búsqueda se volvió más lenta después de una release y el equipo se reúne para analizar las métricas.',
    },
    vocabulary: [
      {
        term: 'p99 latency',
        definition: 'The response time that 99% of requests are faster than; it shows how the slowest requests behave.',
        translation: { fr: 'latence p99', es: 'latencia p99' },
      },
      {
        term: 'throughput',
        definition: 'How much work a system handles per unit of time, such as requests per second.',
        translation: { fr: 'débit', es: 'rendimiento (throughput)' },
      },
      {
        term: 'bottleneck',
        definition: 'The part of a system that limits overall performance because everything else waits on it.',
        translation: { fr: 'goulot d\'étranglement', es: 'cuello de botella' },
      },
      {
        term: 'N+1 query problem',
        definition: 'A pattern where code runs one query to get a list, then one extra query per item, instead of a single query.',
        translation: { fr: 'problème des requêtes N+1', es: 'problema de consultas N+1' },
      },
      {
        term: 'cache hit ratio',
        definition: 'The percentage of requests served from the cache instead of the slower underlying source.',
        translation: { fr: 'taux de succès du cache', es: 'tasa de aciertos de la caché' },
      },
    ],
    expressions: [
      {
        phrase: 'The median looks fine, but p99 jumped from 300 milliseconds to over two seconds.',
        usage: 'Use it to show why averages or medians can hide a real problem for some users.',
        translation: {
          fr: 'La médiane a l\'air correcte, mais le p99 est passé de 300 millisecondes à plus de deux secondes.',
          es: 'La mediana parece bien, pero el p99 ha pasado de 300 milisegundos a más de dos segundos.',
        },
      },
      {
        phrase: 'Before we optimize anything, let\'s profile it and find where the time actually goes.',
        usage: 'Use it to push back politely against guessing and premature optimization.',
        translation: {
          fr: 'Avant d\'optimiser quoi que ce soit, profilons pour voir où le temps passe réellement.',
          es: 'Antes de optimizar nada, hagamos profiling para ver dónde se va realmente el tiempo.',
        },
      },
      {
        phrase: 'The trace suggests the bottleneck is the database, not the application server.',
        usage: 'Use it to point to the limiting component while hedging with "suggests".',
        translation: {
          fr: 'La trace laisse penser que le goulot d\'étranglement est la base de données, pas le serveur applicatif.',
          es: 'La traza sugiere que el cuello de botella es la base de datos, no el servidor de aplicaciones.',
        },
      },
      {
        phrase: 'Caching would help, but it introduces a staleness problem we\'d need to think through.',
        usage: 'Use it to acknowledge a solution while raising its main risk.',
        translation: {
          fr: 'Un cache aiderait, mais il introduit un problème de données périmées auquel il faudrait réfléchir.',
          es: 'Una caché ayudaría, pero introduce un problema de datos obsoletos que tendríamos que pensar bien.',
        },
      },
      {
        phrase: 'I\'d rather measure the impact under realistic load before we call it fixed.',
        usage: 'Use it to insist on validation with data before closing an issue.',
        translation: {
          fr: 'Je préférerais mesurer l\'impact sous une charge réaliste avant de dire que c\'est corrigé.',
          es: 'Preferiría medir el impacto con una carga realista antes de darlo por resuelto.',
        },
      },
    ],
    dialogue: {
      context: 'Priya (tech lead) and Marco (backend developer) look at dashboards after the search page slowed down.',
      lines: [
        {
          speaker: 'Marco',
          text: 'Average response time only went up by about ten percent. I\'m not sure it\'s a big deal.',
          translation: {
            fr: 'Le temps de réponse moyen n\'a augmenté que d\'environ dix pour cent. Je ne suis pas sûr que ce soit grave.',
            es: 'El tiempo medio de respuesta solo ha subido un diez por ciento más o menos. No sé si es para tanto.',
          },
        },
        {
          speaker: 'Priya',
          text: 'The average hides it. Look at p99: it jumped from 300 milliseconds to over two seconds. One user in a hundred is waiting a long time.',
          translation: {
            fr: 'La moyenne le cache. Regarde le p99 : il est passé de 300 millisecondes à plus de deux secondes. Un utilisateur sur cent attend longtemps.',
            es: 'La media lo esconde. Mira el p99: ha pasado de 300 milisegundos a más de dos segundos. Uno de cada cien usuarios espera mucho.',
          },
        },
        {
          speaker: 'Marco',
          text: 'Fair point. My guess is the new filters. Should I add a cache in front of the search service?',
          translation: {
            fr: 'C\'est vrai. Je pense que ce sont les nouveaux filtres. Je devrais ajouter un cache devant le service de recherche ?',
            es: 'Es verdad. Sospecho que son los nuevos filtros. ¿Debería poner una caché delante del servicio de búsqueda?',
          },
        },
        {
          speaker: 'Priya',
          text: 'Before we optimize anything, let\'s look at a trace for a slow request and see where the time actually goes.',
          translation: {
            fr: 'Avant d\'optimiser quoi que ce soit, regardons une trace d\'une requête lente pour voir où le temps passe réellement.',
            es: 'Antes de optimizar nada, miremos la traza de una petición lenta para ver dónde se va realmente el tiempo.',
          },
        },
        {
          speaker: 'Marco',
          text: 'Okay, here\'s one. There are... over two hundred database calls for a single search.',
          translation: {
            fr: 'D\'accord, en voilà une. Il y a... plus de deux cents appels à la base de données pour une seule recherche.',
            es: 'Vale, aquí hay una. Hay... más de doscientas llamadas a la base de datos para una sola búsqueda.',
          },
        },
        {
          speaker: 'Priya',
          text: 'That looks like an N+1 problem. We load the results, then fetch the categories one by one for each item.',
          translation: {
            fr: 'Ça ressemble à un problème N+1. On charge les résultats, puis on récupère les catégories une par une pour chaque élément.',
            es: 'Eso tiene pinta de problema N+1. Cargamos los resultados y luego obtenemos las categorías una a una para cada elemento.',
          },
        },
        {
          speaker: 'Marco',
          text: 'So the bottleneck is the query pattern, not the search engine. A cache would have hidden that.',
          translation: {
            fr: 'Donc le goulot d\'étranglement, c\'est le schéma de requêtes, pas le moteur de recherche. Un cache l\'aurait masqué.',
            es: 'Entonces el cuello de botella es el patrón de consultas, no el motor de búsqueda. Una caché lo habría ocultado.',
          },
        },
        {
          speaker: 'Priya',
          text: 'Exactly. Batch the category lookup into one query, then let\'s run a load test and compare p99 before we call it fixed.',
          translation: {
            fr: 'Exactement. Regroupe la récupération des catégories en une seule requête, puis lançons un test de charge et comparons le p99 avant de dire que c\'est corrigé.',
            es: 'Exacto. Agrupa la consulta de categorías en una sola, y luego hagamos una prueba de carga y comparemos el p99 antes de darlo por resuelto.',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'te-22-q1',
        type: 'choice',
        prompt: 'Why can p99 latency be more useful than the average?',
        options: [
          'It is always lower than the average.',
          'It shows how the slowest requests behave, which the average can hide.',
          'It measures throughput.',
          'It only counts successful requests.',
        ],
        correctIndex: 1,
        explanation: 'p99 is the time 99% of requests stay under, so it exposes the long tail of slow requests that an average smooths out.',
      },
      {
        id: 'te-22-q2',
        type: 'fill',
        prompt: 'The code runs one query for the list and then one per item. That\'s a classic ___ problem.',
        options: ['N+1', 'cache', 'race condition', 'memory leak'],
        correctIndex: 0,
        explanation: 'The N+1 query problem is one query for the list plus N queries for the items, usually fixed by joining or batching.',
      },
      {
        id: 'te-22-q3',
        type: 'choice',
        prompt: 'A colleague wants to add a cache immediately. What is the most professional response?',
        options: [
          'Caches are always a bad idea.',
          'Sure, just do it.',
          'Let\'s profile first so we fix the real bottleneck rather than hide it.',
          'Performance doesn\'t matter for this page.',
        ],
        correctIndex: 2,
        explanation: 'Measuring first avoids optimizing the wrong thing; a cache can mask an underlying issue such as an N+1 query.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // te-23 Explaining a security vulnerability
  // ---------------------------------------------------------------------------
  {
    id: 'te-23',
    moduleId: 'technical',
    topic: 'communication',
    title: 'Explaining a security vulnerability',
    titleTranslation: {
      fr: 'Expliquer une vulnérabilité de sécurité',
      es: 'Explicar una vulnerabilidad de seguridad',
    },
    level: 'advanced',
    premium: true,
    estimatedMinutes: 10,
    roles: ['any', 'fullstack', 'devops', 'architect'],
    objective: 'Explain a vulnerability, its severity and its fix precisely and calmly, without exaggerating or minimizing the risk.',
    objectiveTranslation: {
      fr: 'Expliquer une vulnérabilité, sa gravité et son correctif avec précision et calme, sans exagérer ni minimiser le risque.',
      es: 'Explicar una vulnerabilidad, su gravedad y su corrección con precisión y calma, sin exagerar ni minimizar el riesgo.',
    },
    situation: 'During a code review you found an authorization flaw and must explain it to your team lead.',
    situationTranslation: {
      fr: 'Pendant une code review, vous avez trouvé une faille d\'autorisation et devez l\'expliquer à votre team lead.',
      es: 'Durante una code review has encontrado un fallo de autorización y tienes que explicárselo a tu team lead.',
    },
    vocabulary: [
      {
        term: 'IDOR (insecure direct object reference)',
        definition: 'A flaw where a user can access another user\'s data just by changing an identifier, because the server does not check ownership.',
        translation: { fr: 'IDOR (référence directe non sécurisée à un objet)', es: 'IDOR (referencia directa insegura a objetos)' },
      },
      {
        term: 'attack surface',
        definition: 'All the points where an attacker could try to enter or extract data from a system.',
        translation: { fr: 'surface d\'attaque', es: 'superficie de ataque' },
      },
      {
        term: 'to exploit',
        definition: 'To take advantage of a vulnerability to do something the system should not allow.',
        translation: { fr: 'exploiter', es: 'explotar' },
      },
      {
        term: 'mitigation',
        definition: 'A measure that reduces the risk or impact of a vulnerability, even if it does not remove it completely.',
        translation: { fr: 'mesure d\'atténuation', es: 'mitigación' },
      },
      {
        term: 'responsible disclosure',
        definition: 'Reporting a vulnerability privately to the people who can fix it before making it public.',
        translation: { fr: 'divulgation responsable', es: 'divulgación responsable' },
      },
    ],
    expressions: [
      {
        phrase: 'Any logged-in user can read another user\'s invoices by changing the ID in the URL.',
        usage: 'Use it to describe who can exploit the flaw and how, in one concrete sentence.',
        translation: {
          fr: 'N\'importe quel utilisateur connecté peut lire les factures d\'un autre en changeant l\'ID dans l\'URL.',
          es: 'Cualquier usuario autenticado puede leer las facturas de otro cambiando el ID en la URL.',
        },
      },
      {
        phrase: 'The endpoint checks authentication but not authorization.',
        usage: 'Use it to name the root cause precisely: the server knows who you are but not what you may access.',
        translation: {
          fr: 'L\'endpoint vérifie l\'authentification mais pas l\'autorisation.',
          es: 'El endpoint comprueba la autenticación pero no la autorización.',
        },
      },
      {
        phrase: 'We have no evidence it has been exploited, but we can\'t rule it out yet.',
        usage: 'Use it to stay factual: neither panic nor false reassurance.',
        translation: {
          fr: 'On n\'a aucune preuve que ça a été exploité, mais on ne peut pas encore l\'exclure.',
          es: 'No tenemos pruebas de que se haya explotado, pero todavía no podemos descartarlo.',
        },
      },
      {
        phrase: 'I\'d rate it high severity, given that it exposes personal data.',
        usage: 'Use it to give your assessment of severity and the reason behind it.',
        translation: {
          fr: 'Je l\'évaluerais comme de gravité élevée, étant donné qu\'elle expose des données personnelles.',
          es: 'Yo le daría una gravedad alta, dado que expone datos personales.',
        },
      },
      {
        phrase: 'Let\'s keep the details out of public channels until it\'s patched.',
        usage: 'Use it to limit who knows about the flaw while it can still be exploited.',
        translation: {
          fr: 'Gardons les détails hors des canaux publics tant que ce n\'est pas corrigé.',
          es: 'Mantengamos los detalles fuera de los canales públicos hasta que esté parcheado.',
        },
      },
    ],
    dialogue: {
      context: 'Amara (developer) tells Tom (team lead) about a flaw she found while reviewing a pull request.',
      lines: [
        {
          speaker: 'Amara',
          text: 'Do you have a minute? I found something in the invoices API, and I\'d rather discuss it in private.',
          translation: {
            fr: 'Tu as une minute ? J\'ai trouvé quelque chose dans l\'API des factures, et je préfère en parler en privé.',
            es: '¿Tienes un minuto? He encontrado algo en la API de facturas y prefiero hablarlo en privado.',
          },
        },
        {
          speaker: 'Tom',
          text: 'Sure. What is it?',
          translation: {
            fr: 'Bien sûr. Qu\'est-ce que c\'est ?',
            es: 'Claro. ¿Qué pasa?',
          },
        },
        {
          speaker: 'Amara',
          text: 'It\'s an IDOR. Any logged-in user can read another user\'s invoices by changing the invoice ID in the URL.',
          translation: {
            fr: 'C\'est une IDOR. N\'importe quel utilisateur connecté peut lire les factures d\'un autre en changeant l\'ID de facture dans l\'URL.',
            es: 'Es un IDOR. Cualquier usuario autenticado puede leer las facturas de otro cambiando el ID de factura en la URL.',
          },
        },
        {
          speaker: 'Tom',
          text: 'How is that possible? The endpoint requires a token.',
          translation: {
            fr: 'Comment c\'est possible ? L\'endpoint exige un token.',
            es: '¿Cómo es posible? El endpoint exige un token.',
          },
        },
        {
          speaker: 'Amara',
          text: 'It checks authentication but not authorization. It confirms who you are, but it never checks that the invoice belongs to you.',
          translation: {
            fr: 'Il vérifie l\'authentification mais pas l\'autorisation. Il confirme qui tu es, mais il ne vérifie jamais que la facture t\'appartient.',
            es: 'Comprueba la autenticación pero no la autorización. Confirma quién eres, pero nunca comprueba que la factura sea tuya.',
          },
        },
        {
          speaker: 'Tom',
          text: 'That\'s serious. Has anyone used it?',
          translation: {
            fr: 'C\'est grave. Quelqu\'un l\'a utilisé ?',
            es: 'Es grave. ¿Alguien lo ha usado?',
          },
        },
        {
          speaker: 'Amara',
          text: 'We have no evidence it\'s been exploited, but we can\'t rule it out yet. The IDs are sequential, so they\'re easy to guess. I\'d rate it high severity.',
          translation: {
            fr: 'On n\'a aucune preuve que ça a été exploité, mais on ne peut pas encore l\'exclure. Les ID sont séquentiels, donc faciles à deviner. Je l\'évaluerais comme de gravité élevée.',
            es: 'No tenemos pruebas de que se haya explotado, pero todavía no podemos descartarlo. Los ID son secuenciales, así que son fáciles de adivinar. Yo le daría gravedad alta.',
          },
        },
        {
          speaker: 'Tom',
          text: 'Agreed. What\'s the fix?',
          translation: {
            fr: 'D\'accord. Quel est le correctif ?',
            es: 'De acuerdo. ¿Cuál es la solución?',
          },
        },
        {
          speaker: 'Amara',
          text: 'Check ownership on the server for every request. I can have a patch ready today. Meanwhile, let\'s ask security to search the access logs, and keep the details out of public channels.',
          translation: {
            fr: 'Vérifier la propriété côté serveur à chaque requête. Je peux avoir un patch prêt aujourd\'hui. En attendant, demandons à l\'équipe sécurité de fouiller les logs d\'accès, et gardons les détails hors des canaux publics.',
            es: 'Comprobar la propiedad en el servidor en cada petición. Puedo tener un parche listo hoy. Mientras tanto, pidamos a seguridad que revise los logs de acceso y mantengamos los detalles fuera de los canales públicos.',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'te-23-q1',
        type: 'choice',
        prompt: 'What is the difference between authentication and authorization?',
        options: [
          'They mean exactly the same thing.',
          'Authentication checks who you are; authorization checks what you are allowed to access.',
          'Authorization checks who you are; authentication checks what you are allowed to access.',
          'Authentication is only for admins.',
        ],
        correctIndex: 1,
        explanation: 'Authentication verifies identity, while authorization decides which resources or actions that identity is permitted to use.',
      },
      {
        id: 'te-23-q2',
        type: 'fill',
        prompt: 'We have no evidence it\'s been exploited, but we can\'t ___ it out yet.',
        options: ['rule', 'find', 'point', 'work'],
        correctIndex: 0,
        explanation: '"Can\'t rule it out" means you cannot be sure it did not happen, which is an honest, calm way to describe uncertainty.',
      },
      {
        id: 'te-23-q3',
        type: 'choice',
        prompt: 'Where should you first discuss an unpatched vulnerability?',
        options: [
          'In the company-wide public channel',
          'On social media, to warn users',
          'Privately with your lead or the security team',
          'Nowhere, just fix it quietly without telling anyone',
        ],
        correctIndex: 2,
        explanation: 'Sharing details privately with the people who can fix it limits the risk of exploitation, while still making sure it is handled properly.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // te-24 Reporting an incident
  // ---------------------------------------------------------------------------
  {
    id: 'te-24',
    moduleId: 'technical',
    topic: 'incidents',
    title: 'Reporting an incident',
    titleTranslation: {
      fr: 'Signaler un incident',
      es: 'Informar de un incidente',
    },
    level: 'intermediate',
    premium: false,
    estimatedMinutes: 8,
    roles: ['any', 'devops', 'qa'],
    objective: 'Raise and update an incident clearly: what is broken, who is affected, what you are doing and when the next update is.',
    objectiveTranslation: {
      fr: 'Déclarer et suivre un incident clairement : ce qui ne marche pas, qui est touché, ce que vous faites et quand aura lieu le prochain point.',
      es: 'Abrir y actualizar un incidente con claridad: qué está roto, a quién afecta, qué estás haciendo y cuándo será la próxima actualización.',
    },
    situation: 'You are on call and alerts show that users cannot log in. You open the incident channel.',
    situationTranslation: {
      fr: 'Vous êtes d\'astreinte et les alertes montrent que les utilisateurs ne peuvent plus se connecter. Vous ouvrez le canal d\'incident.',
      es: 'Estás de guardia y las alertas muestran que los usuarios no pueden iniciar sesión. Abres el canal de incidentes.',
    },
    vocabulary: [
      {
        term: 'on call',
        definition: 'Being the person responsible for responding to alerts and incidents during a given period.',
        translation: { fr: 'd\'astreinte', es: 'de guardia' },
      },
      {
        term: 'severity',
        definition: 'A level, such as SEV1 or SEV2, that describes how serious an incident is and how urgently it must be handled.',
        translation: { fr: 'niveau de gravité', es: 'nivel de gravedad' },
      },
      {
        term: 'incident commander',
        definition: 'The person who coordinates the response to an incident and makes decisions, rather than debugging themselves.',
        translation: { fr: 'responsable de l\'incident (incident commander)', es: 'coordinador del incidente (incident commander)' },
      },
      {
        term: 'to mitigate',
        definition: 'To reduce the impact of a problem quickly, for example by rolling back, even before you understand the root cause.',
        translation: { fr: 'atténuer', es: 'mitigar' },
      },
      {
        term: 'postmortem',
        definition: 'A blameless written review after an incident that explains what happened and how to prevent it next time.',
        translation: { fr: 'postmortem (retour d\'expérience)', es: 'postmortem (análisis posterior)' },
      },
    ],
    expressions: [
      {
        phrase: 'I\'m declaring a SEV1: users can\'t log in on web or mobile.',
        usage: 'Use it to open an incident with a severity and a one-line description of the impact.',
        translation: {
          fr: 'Je déclare un SEV1 : les utilisateurs ne peuvent plus se connecter sur le web ni sur mobile.',
          es: 'Declaro un SEV1: los usuarios no pueden iniciar sesión ni en web ni en móvil.',
        },
      },
      {
        phrase: 'I\'ll be incident commander. Kenji, can you investigate the auth service?',
        usage: 'Use it to make roles explicit so people do not all do the same thing.',
        translation: {
          fr: 'Je serai incident commander. Kenji, tu peux investiguer le service d\'authentification ?',
          es: 'Yo seré el incident commander. Kenji, ¿puedes investigar el servicio de autenticación?',
        },
      },
      {
        phrase: 'Impact: about 40% of login attempts are failing since 14:05.',
        usage: 'Use it to state the impact with a number and a start time.',
        translation: {
          fr: 'Impact : environ 40 % des tentatives de connexion échouent depuis 14 h 05.',
          es: 'Impacto: alrededor del 40 % de los intentos de inicio de sesión fallan desde las 14:05.',
        },
      },
      {
        phrase: 'We\'re rolling back the last deploy to mitigate.',
        usage: 'Use it to say what action is being taken right now to reduce impact.',
        translation: {
          fr: 'On fait un rollback du dernier déploiement pour atténuer l\'impact.',
          es: 'Estamos haciendo rollback del último despliegue para mitigar.',
        },
      },
      {
        phrase: 'Next update in 15 minutes, or sooner if anything changes.',
        usage: 'Use it to end every update with a clear time, so people stop asking for news.',
        translation: {
          fr: 'Prochain point dans 15 minutes, ou plus tôt si quelque chose change.',
          es: 'Próxima actualización en 15 minutos, o antes si cambia algo.',
        },
      },
    ],
    dialogue: {
      context: 'Lucía (on-call engineer) opens an incident channel and coordinates with Kenji.',
      lines: [
        {
          speaker: 'Lucía',
          text: 'I\'m declaring a SEV1. Users can\'t log in on web or mobile. Alerts started at 14:05.',
          translation: {
            fr: 'Je déclare un SEV1. Les utilisateurs ne peuvent plus se connecter sur le web ni sur mobile. Les alertes ont commencé à 14 h 05.',
            es: 'Declaro un SEV1. Los usuarios no pueden iniciar sesión ni en web ni en móvil. Las alertas empezaron a las 14:05.',
          },
        },
        {
          speaker: 'Kenji',
          text: 'I\'m here. What do you need?',
          translation: {
            fr: 'Je suis là. Tu as besoin de quoi ?',
            es: 'Aquí estoy. ¿Qué necesitas?',
          },
        },
        {
          speaker: 'Lucía',
          text: 'I\'ll be incident commander. Can you check the auth service? About 40% of login attempts are failing.',
          translation: {
            fr: 'Je serai incident commander. Tu peux regarder le service d\'authentification ? Environ 40 % des tentatives de connexion échouent.',
            es: 'Yo seré la incident commander. ¿Puedes revisar el servicio de autenticación? Alrededor del 40 % de los inicios de sesión fallan.',
          },
        },
        {
          speaker: 'Kenji',
          text: 'On it. There was a deploy to auth at 14:00. The new pods are throwing connection errors to the session store.',
          translation: {
            fr: 'Je m\'en occupe. Il y a eu un déploiement sur auth à 14 h. Les nouveaux pods ont des erreurs de connexion vers le session store.',
            es: 'Voy. Hubo un despliegue en auth a las 14:00. Los nuevos pods están dando errores de conexión con el almacén de sesiones.',
          },
        },
        {
          speaker: 'Lucía',
          text: 'Okay. Let\'s mitigate first and investigate later. Can you roll back that deploy?',
          translation: {
            fr: 'D\'accord. On atténue d\'abord et on investigue ensuite. Tu peux faire un rollback de ce déploiement ?',
            es: 'Vale. Primero mitigamos y luego investigamos. ¿Puedes hacer rollback de ese despliegue?',
          },
        },
        {
          speaker: 'Kenji',
          text: 'Rolling back now. It should take about five minutes.',
          translation: {
            fr: 'Rollback en cours. Ça devrait prendre environ cinq minutes.',
            es: 'Haciendo rollback ahora. Debería tardar unos cinco minutos.',
          },
        },
        {
          speaker: 'Lucía',
          text: 'Update for everyone: login failures since 14:05, likely caused by the 14:00 auth deploy. Rollback in progress. Next update in 15 minutes.',
          translation: {
            fr: 'Point pour tout le monde : échecs de connexion depuis 14 h 05, probablement causés par le déploiement auth de 14 h. Rollback en cours. Prochain point dans 15 minutes.',
            es: 'Actualización para todos: fallos de inicio de sesión desde las 14:05, probablemente causados por el despliegue de auth de las 14:00. Rollback en curso. Próxima actualización en 15 minutos.',
          },
        },
        {
          speaker: 'Kenji',
          text: 'Rollback done. Error rate is back to normal.',
          translation: {
            fr: 'Rollback terminé. Le taux d\'erreur est revenu à la normale.',
            es: 'Rollback terminado. La tasa de errores ha vuelto a la normalidad.',
          },
        },
        {
          speaker: 'Lucía',
          text: 'Great work. I\'ll keep monitoring for 30 minutes before resolving, and I\'ll schedule a postmortem for tomorrow.',
          translation: {
            fr: 'Excellent travail. Je continue à surveiller pendant 30 minutes avant de clôturer, et je planifie un postmortem pour demain.',
            es: 'Buen trabajo. Seguiré monitorizando 30 minutos antes de cerrarlo y programaré un postmortem para mañana.',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'te-24-q1',
        type: 'choice',
        prompt: 'During an incident, what should you usually do first?',
        options: [
          'Mitigate the impact, for example by rolling back',
          'Find the root cause, however long it takes',
          'Write the postmortem',
          'Find out who made the mistake',
        ],
        correctIndex: 0,
        explanation: 'Restoring service for users comes first; the deeper investigation and the postmortem can happen once the impact is under control.',
      },
      {
        id: 'te-24-q2',
        type: 'fill',
        prompt: 'Rollback in progress. Next ___ in 15 minutes.',
        options: ['deploy', 'update', 'incident', 'alert'],
        correctIndex: 1,
        explanation: 'Ending with "Next update in X minutes" tells stakeholders when to expect news, which reduces interruptions.',
      },
      {
        id: 'te-24-q3',
        type: 'choice',
        prompt: 'What is a good incident postmortem?',
        options: [
          'A document that names the person to blame',
          'An alert that wakes up the on-call engineer',
          'A blameless review of what happened and how to prevent it',
          'A list of all deploys from last year',
        ],
        correctIndex: 2,
        explanation: 'Postmortems focus on systems and processes, not individuals, so that people share information openly.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // te-25 Describing a deployment
  // ---------------------------------------------------------------------------
  {
    id: 'te-25',
    moduleId: 'technical',
    topic: 'incidents',
    title: 'Describing a deployment',
    titleTranslation: {
      fr: 'Décrire un déploiement',
      es: 'Describir un despliegue',
    },
    level: 'intermediate',
    premium: true,
    estimatedMinutes: 9,
    roles: ['devops', 'fullstack', 'java', 'qa'],
    objective: 'Explain how a release will roll out, how you will monitor it, and how you can roll it back.',
    objectiveTranslation: {
      fr: 'Expliquer comment une release va être déployée, comment vous allez la surveiller et comment la rollbacker.',
      es: 'Explicar cómo se va a desplegar una release, cómo la vais a monitorizar y cómo podéis hacer rollback.',
    },
    situation: 'Before a risky release, you walk the team through the deployment plan in the release meeting.',
    situationTranslation: {
      fr: 'Avant une release risquée, vous présentez le plan de déploiement à l\'équipe lors de la réunion de release.',
      es: 'Antes de una release arriesgada, explicas el plan de despliegue al equipo en la reunión de release.',
    },
    vocabulary: [
      {
        term: 'canary release',
        definition: 'Sending a small percentage of real traffic to the new version first, and increasing it only if metrics stay healthy.',
        translation: { fr: 'déploiement canary', es: 'despliegue canary' },
      },
      {
        term: 'blue-green deployment',
        definition: 'Running two identical environments and switching traffic from the old one to the new one in a single step.',
        translation: { fr: 'déploiement blue-green', es: 'despliegue blue-green' },
      },
      {
        term: 'feature flag',
        definition: 'A configuration switch that turns a feature on or off at runtime without deploying new code.',
        translation: { fr: 'feature flag (interrupteur de fonctionnalité)', es: 'feature flag (interruptor de funcionalidad)' },
      },
      {
        term: 'rollback',
        definition: 'Returning to the previous working version after a problem with a release.',
        translation: { fr: 'rollback (retour arrière)', es: 'rollback (vuelta atrás)' },
      },
      {
        term: 'database migration',
        definition: 'A versioned script that changes the database schema or data as part of a release.',
        translation: { fr: 'migration de base de données', es: 'migración de base de datos' },
      },
    ],
    expressions: [
      {
        phrase: 'We\'ll start with a canary at 5% of traffic and watch the error rate for 30 minutes.',
        usage: 'Use it to describe a gradual rollout with a clear checkpoint.',
        translation: {
          fr: 'On va commencer par un canary à 5 % du trafic et surveiller le taux d\'erreur pendant 30 minutes.',
          es: 'Empezaremos con un canary al 5 % del tráfico y vigilaremos la tasa de errores durante 30 minutos.',
        },
      },
      {
        phrase: 'The new checkout is behind a feature flag, so we can turn it off without redeploying.',
        usage: 'Use it to explain how you can disable a feature quickly if something goes wrong.',
        translation: {
          fr: 'Le nouveau checkout est derrière un feature flag, donc on peut le désactiver sans redéployer.',
          es: 'El nuevo checkout está detrás de un feature flag, así que podemos desactivarlo sin volver a desplegar.',
        },
      },
      {
        phrase: 'The migration is backward compatible, so the old version still works with the new schema.',
        usage: 'Use it to reassure people that rollback will not break because of database changes.',
        translation: {
          fr: 'La migration est rétrocompatible, donc l\'ancienne version fonctionne toujours avec le nouveau schéma.',
          es: 'La migración es retrocompatible, así que la versión anterior sigue funcionando con el nuevo esquema.',
        },
      },
      {
        phrase: 'If p99 latency goes above one second, we roll back automatically.',
        usage: 'Use it to define a measurable rollback criterion in advance.',
        translation: {
          fr: 'Si la latence p99 dépasse une seconde, on fait un rollback automatiquement.',
          es: 'Si la latencia p99 supera un segundo, hacemos rollback automáticamente.',
        },
      },
      {
        phrase: 'We\'re deploying outside peak hours to limit the blast radius.',
        usage: 'Use it to explain timing choices that reduce how many users could be affected.',
        translation: {
          fr: 'On déploie en dehors des heures de pointe pour limiter le rayon d\'impact.',
          es: 'Desplegamos fuera de las horas punta para limitar el alcance del impacto.',
        },
      },
    ],
    dialogue: {
      context: 'Marco (DevOps engineer) presents the deployment plan for the new checkout to Priya (QA lead).',
      lines: [
        {
          speaker: 'Marco',
          text: 'The plan for tomorrow: we deploy the new checkout at 10 a.m., outside peak hours, as a canary at 5% of traffic.',
          translation: {
            fr: 'Le plan pour demain : on déploie le nouveau checkout à 10 h, en dehors des heures de pointe, en canary à 5 % du trafic.',
            es: 'El plan para mañana: desplegamos el nuevo checkout a las 10, fuera de las horas punta, como canary al 5 % del tráfico.',
          },
        },
        {
          speaker: 'Priya',
          text: 'What are you watching during the canary?',
          translation: {
            fr: 'Qu\'est-ce que vous surveillez pendant le canary ?',
            es: '¿Qué vais a vigilar durante el canary?',
          },
        },
        {
          speaker: 'Marco',
          text: 'Error rate, p99 latency and payment success rate. If any of them gets worse than the baseline, we roll back automatically.',
          translation: {
            fr: 'Le taux d\'erreur, la latence p99 et le taux de paiements réussis. Si l\'un d\'eux est pire que la référence, on fait un rollback automatiquement.',
            es: 'La tasa de errores, la latencia p99 y la tasa de pagos correctos. Si alguna empeora respecto a la referencia, hacemos rollback automáticamente.',
          },
        },
        {
          speaker: 'Priya',
          text: 'There\'s a database migration in this release. Does that make rollback risky?',
          translation: {
            fr: 'Il y a une migration de base de données dans cette release. Ça rend le rollback risqué ?',
            es: 'Hay una migración de base de datos en esta release. ¿Eso hace que el rollback sea arriesgado?',
          },
        },
        {
          speaker: 'Marco',
          text: 'No, the migration only adds a nullable column, so it\'s backward compatible. The old version just ignores it.',
          translation: {
            fr: 'Non, la migration ajoute seulement une colonne nullable, donc elle est rétrocompatible. L\'ancienne version l\'ignore simplement.',
            es: 'No, la migración solo añade una columna nullable, así que es retrocompatible. La versión anterior simplemente la ignora.',
          },
        },
        {
          speaker: 'Priya',
          text: 'Good. And if we find a functional bug that the metrics don\'t catch?',
          translation: {
            fr: 'Bien. Et si on trouve un bug fonctionnel que les métriques ne détectent pas ?',
            es: 'Bien. ¿Y si encontramos un bug funcional que las métricas no detectan?',
          },
        },
        {
          speaker: 'Marco',
          text: 'The new flow is also behind a feature flag. You can turn it off in seconds without redeploying.',
          translation: {
            fr: 'Le nouveau parcours est aussi derrière un feature flag. Vous pouvez le désactiver en quelques secondes sans redéployer.',
            es: 'El nuevo flujo también está detrás de un feature flag. Podéis desactivarlo en segundos sin volver a desplegar.',
          },
        },
        {
          speaker: 'Priya',
          text: 'Perfect. My team will run the smoke tests on the canary as soon as it\'s live.',
          translation: {
            fr: 'Parfait. Mon équipe lancera les smoke tests sur le canary dès qu\'il sera en ligne.',
            es: 'Perfecto. Mi equipo lanzará los smoke tests sobre el canary en cuanto esté activo.',
          },
        },
        {
          speaker: 'Marco',
          text: 'Great. If everything looks healthy after 30 minutes, we\'ll go to 25%, then 100% by the afternoon.',
          translation: {
            fr: 'Super. Si tout va bien au bout de 30 minutes, on passe à 25 %, puis à 100 % dans l\'après-midi.',
            es: 'Genial. Si todo va bien a los 30 minutos, pasamos al 25 % y luego al 100 % por la tarde.',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'te-25-q1',
        type: 'choice',
        prompt: 'What is a canary release?',
        options: [
          'Deploying to all users at once at midnight',
          'Testing only in a local environment',
          'Deleting the old version before deploying',
          'Sending a small share of real traffic to the new version first, then increasing it',
        ],
        correctIndex: 3,
        explanation: 'A canary exposes a small percentage of users to the new version so problems are detected before everyone is affected.',
      },
      {
        id: 'te-25-q2',
        type: 'fill',
        prompt: 'The feature is behind a feature ___, so we can switch it off without a new deploy.',
        options: ['branch', 'flag', 'gate', 'canary'],
        correctIndex: 1,
        explanation: 'A feature flag is a runtime switch that enables or disables a feature without deploying new code.',
      },
      {
        id: 'te-25-q3',
        type: 'choice',
        prompt: 'Why does a backward-compatible migration matter for rollback?',
        options: [
          'It lets the previous version of the code keep working with the updated schema.',
          'It makes the deploy faster.',
          'It deletes old data automatically.',
          'It removes the need for testing.',
        ],
        correctIndex: 0,
        explanation: 'If the old code still works with the new schema, you can roll back the application without undoing the database change.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // te-26 Explaining a production issue to non-technical stakeholders
  // ---------------------------------------------------------------------------
  {
    id: 'te-26',
    moduleId: 'technical',
    topic: 'incidents',
    title: 'Explaining a production issue to non-technical stakeholders',
    titleTranslation: {
      fr: 'Expliquer un problème de production à des interlocuteurs non techniques',
      es: 'Explicar un problema de producción a personas no técnicas',
    },
    level: 'advanced',
    premium: true,
    estimatedMinutes: 10,
    roles: ['any', 'architect', 'devops'],
    objective: 'Translate a technical incident into business impact, current status and next steps, without jargon and without overpromising.',
    objectiveTranslation: {
      fr: 'Traduire un incident technique en impact métier, état actuel et prochaines étapes, sans jargon et sans promettre plus que ce qu\'on peut tenir.',
      es: 'Traducir un incidente técnico en impacto de negocio, estado actual y próximos pasos, sin jerga y sin prometer de más.',
    },
    situation: 'Customers could not complete payments for 40 minutes, and the head of sales asks you what happened.',
    situationTranslation: {
      fr: 'Les clients n\'ont pas pu finaliser leurs paiements pendant 40 minutes, et la directrice commerciale vous demande ce qui s\'est passé.',
      es: 'Los clientes no pudieron completar pagos durante 40 minutos y la directora de ventas te pregunta qué pasó.',
    },
    vocabulary: [
      {
        term: 'business impact',
        definition: 'The effect of a technical problem on customers, revenue or operations, described in business terms.',
        translation: { fr: 'impact métier', es: 'impacto en el negocio' },
      },
      {
        term: 'third-party provider',
        definition: 'An external company whose service your system depends on, such as a payment processor.',
        translation: { fr: 'prestataire tiers', es: 'proveedor externo' },
      },
      {
        term: 'downtime',
        definition: 'A period during which a system or feature is unavailable to users.',
        translation: { fr: 'temps d\'indisponibilité', es: 'tiempo de inactividad' },
      },
      {
        term: 'fallback',
        definition: 'An alternative option that a system switches to automatically when the main one fails.',
        translation: { fr: 'solution de repli', es: 'alternativa de respaldo (fallback)' },
      },
      {
        term: 'safeguard',
        definition: 'A measure put in place to prevent a problem or reduce its effects.',
        translation: { fr: 'garde-fou', es: 'salvaguarda' },
      },
    ],
    expressions: [
      {
        phrase: 'In short: between 2:10 and 2:50, customers couldn\'t pay by card. It\'s fixed now.',
        usage: 'Use it to open with the summary: what users experienced, for how long, and the current status.',
        translation: {
          fr: 'En bref : entre 14 h 10 et 14 h 50, les clients ne pouvaient pas payer par carte. C\'est réglé maintenant.',
          es: 'En resumen: entre las 14:10 y las 14:50, los clientes no podían pagar con tarjeta. Ya está solucionado.',
        },
      },
      {
        phrase: 'Think of it like a shop whose card terminal stopped working while the shop itself stayed open.',
        usage: 'Use an analogy to make a technical cause understandable without jargon.',
        translation: {
          fr: 'C\'est un peu comme un magasin dont le terminal de paiement est tombé en panne alors que le magasin restait ouvert.',
          es: 'Es como una tienda a la que se le estropea el datáfono mientras la tienda sigue abierta.',
        },
      },
      {
        phrase: 'We estimate around 600 orders were affected; we\'ll confirm the exact figure by tomorrow.',
        usage: 'Use it to give an honest estimate while making clear it is not final.',
        translation: {
          fr: 'On estime qu\'environ 600 commandes ont été touchées ; on confirmera le chiffre exact d\'ici demain.',
          es: 'Calculamos que se vieron afectados unos 600 pedidos; confirmaremos la cifra exacta mañana.',
        },
      },
      {
        phrase: 'I can\'t promise it will never happen again, but we can make it much less likely.',
        usage: 'Use it to avoid overpromising while still showing commitment.',
        translation: {
          fr: 'Je ne peux pas promettre que ça n\'arrivera plus jamais, mais on peut le rendre beaucoup moins probable.',
          es: 'No puedo prometer que no vuelva a pasar nunca, pero sí podemos hacer que sea mucho menos probable.',
        },
      },
      {
        phrase: 'What would help from your side is a short message to the key accounts.',
        usage: 'Use it to give non-technical stakeholders a concrete action they can take.',
        translation: {
          fr: 'Ce qui nous aiderait de votre côté, c\'est un court message aux comptes clés.',
          es: 'Lo que nos ayudaría por vuestra parte es un mensaje breve a las cuentas clave.',
        },
      },
    ],
    dialogue: {
      context: 'Tom (engineering lead) explains a payment outage to Lucía, the head of sales.',
      lines: [
        {
          speaker: 'Lucía',
          text: 'I\'ve had three customers call me this afternoon saying they couldn\'t pay. What happened?',
          translation: {
            fr: 'Trois clients m\'ont appelée cet après-midi pour dire qu\'ils n\'avaient pas pu payer. Que s\'est-il passé ?',
            es: 'Esta tarde me han llamado tres clientes diciendo que no podían pagar. ¿Qué ha pasado?',
          },
        },
        {
          speaker: 'Tom',
          text: 'In short: between 2:10 and 2:50, customers couldn\'t pay by card. Everything else worked, and it\'s fixed now.',
          translation: {
            fr: 'En bref : entre 14 h 10 et 14 h 50, les clients ne pouvaient pas payer par carte. Tout le reste fonctionnait, et c\'est réglé maintenant.',
            es: 'En resumen: entre las 14:10 y las 14:50, los clientes no podían pagar con tarjeta. Todo lo demás funcionaba y ya está solucionado.',
          },
        },
        {
          speaker: 'Lucía',
          text: 'Okay. But why did it happen? Was it something we did?',
          translation: {
            fr: 'D\'accord. Mais pourquoi c\'est arrivé ? C\'est quelque chose qu\'on a fait ?',
            es: 'Vale. Pero ¿por qué ha pasado? ¿Fue algo que hicimos nosotros?',
          },
        },
        {
          speaker: 'Tom',
          text: 'The root cause was an outage at our payment provider. Think of it like a shop whose card terminal stopped working while the shop itself stayed open.',
          translation: {
            fr: 'La cause racine, c\'était une panne chez notre prestataire de paiement. C\'est un peu comme un magasin dont le terminal de paiement est tombé en panne alors que le magasin restait ouvert.',
            es: 'La causa raíz fue una caída en nuestro proveedor de pagos. Es como una tienda a la que se le estropea el datáfono mientras la tienda sigue abierta.',
          },
        },
        {
          speaker: 'Lucía',
          text: "So it wasn't our fault?",
          translation: {
            fr: "Donc ce n'était pas de notre faute ?",
            es: '¿Entonces no fue culpa nuestra?',
          },
        },
        {
          speaker: 'Tom',
          text: 'Not directly. That said, our part is that we had no fallback. A second provider would have kept payments going.',
          translation: {
            fr: 'Pas directement. Cela dit, notre part de responsabilité, c\'est qu\'on n\'avait pas de solution de repli. Un second prestataire aurait permis de continuer les paiements.',
            es: 'No directamente. Dicho esto, nuestra parte es que no teníamos alternativa de respaldo. Un segundo proveedor habría mantenido los pagos funcionando.',
          },
        },
        {
          speaker: 'Lucía',
          text: 'How many customers were affected?',
          translation: {
            fr: 'Combien de clients ont été touchés ?',
            es: '¿Cuántos clientes se vieron afectados?',
          },
        },
        {
          speaker: 'Tom',
          text: 'We estimate around 600 orders. We\'ll confirm the exact figure by tomorrow, and we can send you the list of accounts.',
          translation: {
            fr: 'On estime environ 600 commandes. On confirmera le chiffre exact d\'ici demain, et on peut vous envoyer la liste des comptes.',
            es: 'Calculamos unos 600 pedidos. Confirmaremos la cifra exacta mañana y podemos enviarte la lista de cuentas.',
          },
        },
        {
          speaker: 'Lucía',
          text: 'Can you guarantee this won\'t happen again?',
          translation: {
            fr: 'Vous pouvez garantir que ça ne se reproduira pas ?',
            es: '¿Podéis garantizar que no volverá a pasar?',
          },
        },
        {
          speaker: 'Tom',
          text: 'I can\'t promise it will never happen, but we\'re adding a backup provider as a safeguard. What would help from your side is a short message to the key accounts.',
          translation: {
            fr: 'Je ne peux pas promettre que ça n\'arrivera jamais, mais on ajoute un prestataire de secours comme garde-fou. Ce qui nous aiderait de votre côté, c\'est un court message aux comptes clés.',
            es: 'No puedo prometer que no vuelva a pasar nunca, pero estamos añadiendo un proveedor de respaldo como salvaguarda. Lo que nos ayudaría por vuestra parte es un mensaje breve a las cuentas clave.',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'te-26-q1',
        type: 'choice',
        prompt: 'How should you open an explanation of an outage for a non-technical manager?',
        options: [
          'With the full stack trace',
          'With the name of the developer who deployed last',
          'With a list of every service you checked',
          'With what users experienced, how long it lasted, and the current status',
        ],
        correctIndex: 3,
        explanation: 'Stakeholders need the business impact and status first; technical details can follow if they ask.',
      },
      {
        id: 'te-26-q2',
        type: 'choice',
        prompt: 'The sales director asks: "Can you guarantee this won\'t happen again?" What is the best answer?',
        options: [
          'Yes, absolutely. It will never happen again.',
          'No, these things just happen.',
          'I can\'t promise that, but we\'re adding a backup provider to make it much less likely.',
          'You should ask the payment provider.',
        ],
        correctIndex: 2,
        explanation: 'It is honest about uncertainty, avoids overpromising and shows a concrete action to reduce the risk.',
      },
      {
        id: 'te-26-q3',
        type: 'fill',
        prompt: 'We ___ around 600 orders were affected; we\'ll confirm the exact number tomorrow.',
        options: ['guarantee', 'estimate', 'promise', 'deny'],
        correctIndex: 1,
        explanation: '"Estimate" signals an approximate figure, which matches the follow-up promise to confirm the exact number later.',
      },
    ],
  },
];
