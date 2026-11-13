import type { Lesson } from '../types';

/**
 * Workplace English, part A: meetings, agile ceremonies, everyday
 * communication and feedback.
 */
export const workplaceA: Lesson[] = [
  // ---------------------------------------------------------------------------
  // wp-01 — Daily stand-up: giving your first update
  // ---------------------------------------------------------------------------
  {
    id: 'wp-01',
    moduleId: 'workplace',
    topic: 'meetings',
    title: 'Daily stand-up: giving your first update',
    titleTranslation: {
      fr: 'Daily stand-up : donner votre premier point',
      es: 'Daily stand-up: dar tu primera actualización',
    },
    level: 'beginner',
    premium: false,
    estimatedMinutes: 7,
    roles: ['any'],
    objective:
      'Give a short, clear stand-up update using the "yesterday, today, blockers" structure.',
    objectiveTranslation: {
      fr: 'Donner un point court et clair en stand-up avec la structure « hier, aujourd\'hui, blocages ».',
      es: 'Dar una actualización breve y clara en el stand-up con la estructura «ayer, hoy, bloqueos».',
    },
    situation:
      'It is your first week on a new team. Every morning at 9:30 the team has a 15-minute stand-up call, and today it is your turn to speak.',
    situationTranslation: {
      fr: 'C\'est votre première semaine dans une nouvelle équipe. Chaque matin à 9 h 30, l\'équipe fait un stand-up de 15 minutes, et aujourd\'hui c\'est à vous de parler.',
      es: 'Es tu primera semana en un equipo nuevo. Cada mañana a las 9:30 el equipo tiene un stand-up de 15 minutos y hoy te toca hablar.',
    },
    vocabulary: [
      {
        term: 'stand-up',
        definition:
          'A short daily team meeting where each person shares what they did, what they will do and any problems.',
        translation: { fr: 'stand-up (réunion quotidienne)', es: 'stand-up (reunión diaria)' },
      },
      {
        term: 'update',
        definition: 'A short report on the current state of your work.',
        translation: { fr: 'point d\'avancement', es: 'actualización' },
      },
      {
        term: 'blocker',
        definition: 'Something that stops you from continuing your work.',
        translation: { fr: 'blocage', es: 'bloqueo' },
      },
      {
        term: 'ticket',
        definition: 'A task or bug recorded in a tracking tool such as Jira.',
        translation: { fr: 'ticket', es: 'ticket' },
      },
      {
        term: 'on track',
        definition: 'Progressing as planned and likely to finish on time.',
        translation: { fr: 'dans les temps', es: 'según lo previsto' },
      },
    ],
    expressions: [
      {
        phrase: 'Yesterday I worked on...',
        usage: 'Use it to start your update with what you did on the previous working day.',
        translation: { fr: 'Hier, j\'ai travaillé sur...', es: 'Ayer trabajé en...' },
      },
      {
        phrase: 'Today I\'m going to...',
        usage: 'Use it to say what you plan to do today.',
        translation: { fr: 'Aujourd\'hui, je vais...', es: 'Hoy voy a...' },
      },
      {
        phrase: 'No blockers for me.',
        usage: 'Use it to say that nothing is stopping your work.',
        translation: { fr: 'Pas de blocage de mon côté.', es: 'Ningún bloqueo por mi parte.' },
      },
      {
        phrase: 'I\'m still getting set up.',
        usage: 'Use it in your first days when you are installing tools or getting access.',
        translation: { fr: 'Je suis encore en train de m\'installer.', es: 'Todavía me estoy configurando el entorno.' },
      },
      {
        phrase: 'That\'s it from me.',
        usage: 'Use it to show you have finished your update so the next person can speak.',
        translation: { fr: 'C\'est tout pour moi.', es: 'Eso es todo por mi parte.' },
      },
    ],
    dialogue: {
      context: 'The morning stand-up call; the team lead asks the new developer to go next.',
      lines: [
        {
          speaker: 'Priya (Team lead)',
          text: 'Morning, everyone. Kenji, do you want to go next?',
          translation: {
            fr: 'Bonjour à tous. Kenji, tu veux passer ensuite ?',
            es: 'Buenos días a todos. Kenji, ¿quieres ir ahora?',
          },
        },
        {
          speaker: 'Kenji',
          text: 'Sure. Yesterday I set up my local environment and read the onboarding docs.',
          translation: {
            fr: 'Bien sûr. Hier, j\'ai configuré mon environnement local et j\'ai lu la doc d\'onboarding.',
            es: 'Claro. Ayer configuré mi entorno local y leí la documentación de onboarding.',
          },
        },
        {
          speaker: 'Priya (Team lead)',
          text: 'Great. Is everything running on your machine?',
          translation: {
            fr: 'Super. Tout tourne bien sur ta machine ?',
            es: 'Genial. ¿Funciona todo en tu máquina?',
          },
        },
        {
          speaker: 'Kenji',
          text: 'Yes, the app runs locally now. Today I\'m going to pick up my first ticket, the typo on the login page.',
          translation: {
            fr: 'Oui, l\'appli tourne en local maintenant. Aujourd\'hui, je vais prendre mon premier ticket, la faute de frappe sur la page de connexion.',
            es: 'Sí, la aplicación ya funciona en local. Hoy voy a coger mi primer ticket, la errata de la página de login.',
          },
        },
        {
          speaker: 'Priya (Team lead)',
          text: 'Nice, that\'s a good one to start with. Any blockers?',
          translation: {
            fr: 'Parfait, c\'est un bon ticket pour commencer. Des blocages ?',
            es: 'Bien, es un buen ticket para empezar. ¿Algún bloqueo?',
          },
        },
        {
          speaker: 'Kenji',
          text: 'Just one: I don\'t have access to the staging server yet.',
          translation: {
            fr: 'Juste un : je n\'ai pas encore accès au serveur de staging.',
            es: 'Solo uno: todavía no tengo acceso al servidor de staging.',
          },
        },
        {
          speaker: 'Priya (Team lead)',
          text: 'Okay, I\'ll ask DevOps to give you access after this call.',
          translation: {
            fr: 'D\'accord, je demanderai à l\'équipe DevOps de te donner l\'accès après l\'appel.',
            es: 'Vale, le pediré al equipo de DevOps que te dé acceso después de la llamada.',
          },
        },
        {
          speaker: 'Kenji',
          text: 'Thanks. That\'s it from me.',
          translation: {
            fr: 'Merci. C\'est tout pour moi.',
            es: 'Gracias. Eso es todo por mi parte.',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'wp-01-q1',
        type: 'choice',
        prompt: 'What are the three parts of a classic stand-up update?',
        options: [
          'Goals, budget, deadline',
          'Yesterday, today, blockers',
          'Problem, solution, result',
          'Design, code, deploy',
        ],
        correctIndex: 1,
        explanation:
          'A classic stand-up update covers what you did yesterday, what you will do today, and anything blocking you.',
      },
      {
        id: 'wp-01-q2',
        type: 'fill',
        prompt: 'No ___ for me. Everything is going fine.',
        options: ['blockers', 'tickets', 'updates'],
        correctIndex: 0,
        explanation:
          '"No blockers for me" means nothing is stopping your work, which matches "everything is going fine".',
      },
      {
        id: 'wp-01-q3',
        type: 'choice',
        prompt: 'Which sentence is the most natural way to end your update?',
        options: [
          'My speech is now terminated.',
          'I have no more words.',
          'That\'s it from me.',
        ],
        correctIndex: 2,
        explanation:
          '"That\'s it from me" is short, friendly and tells the team the next person can speak.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // wp-02 — Reporting blockers
  // ---------------------------------------------------------------------------
  {
    id: 'wp-02',
    moduleId: 'workplace',
    topic: 'meetings',
    title: 'Reporting blockers',
    titleTranslation: {
      fr: 'Signaler un blocage',
      es: 'Informar de bloqueos',
    },
    level: 'beginner',
    premium: false,
    estimatedMinutes: 7,
    roles: ['any'],
    objective:
      'Explain clearly what is blocking you, what you have already tried and what help you need.',
    objectiveTranslation: {
      fr: 'Expliquer clairement ce qui vous bloque, ce que vous avez déjà essayé et l\'aide dont vous avez besoin.',
      es: 'Explicar con claridad qué te bloquea, qué has probado ya y qué ayuda necesitas.',
    },
    situation:
      'You cannot run the integration tests because the test database is down. You need to tell the team in the stand-up and ask for help.',
    situationTranslation: {
      fr: 'Vous ne pouvez pas lancer les tests d\'intégration car la base de données de test est en panne. Vous devez le dire à l\'équipe pendant le stand-up et demander de l\'aide.',
      es: 'No puedes ejecutar los tests de integración porque la base de datos de pruebas está caída. Tienes que decírselo al equipo en el stand-up y pedir ayuda.',
    },
    vocabulary: [
      {
        term: 'to be blocked',
        definition: 'To be unable to continue your work because of a problem you cannot solve alone.',
        translation: { fr: 'être bloqué', es: 'estar bloqueado' },
      },
      {
        term: 'dependency',
        definition: 'Something or someone your work needs before it can move forward.',
        translation: { fr: 'dépendance', es: 'dependencia' },
      },
      {
        term: 'workaround',
        definition: 'A temporary way to avoid a problem without really fixing it.',
        translation: { fr: 'solution de contournement', es: 'solución provisional' },
      },
      {
        term: 'to escalate',
        definition: 'To take a problem to someone with more authority or knowledge so it gets solved faster.',
        translation: { fr: 'faire remonter', es: 'escalar' },
      },
      {
        term: 'access',
        definition: 'Permission to use a system, server or tool.',
        translation: { fr: 'accès', es: 'acceso' },
      },
    ],
    expressions: [
      {
        phrase: 'I\'m blocked on...',
        usage: 'Use it to name the exact task or problem that is stopping you.',
        translation: { fr: 'Je suis bloqué sur...', es: 'Estoy bloqueado con...' },
      },
      {
        phrase: 'I\'ve already tried...',
        usage: 'Use it to show what you did before asking for help, so people don\'t suggest the same thing.',
        translation: { fr: 'J\'ai déjà essayé...', es: 'Ya he probado...' },
      },
      {
        phrase: 'Could someone help me with...?',
        usage: 'Use it to ask the team for help politely.',
        translation: { fr: 'Quelqu\'un pourrait m\'aider avec... ?', es: '¿Alguien me podría ayudar con...?' },
      },
      {
        phrase: 'I\'m waiting on...',
        usage: 'Use it when your work depends on another person or team.',
        translation: { fr: 'J\'attends...', es: 'Estoy esperando a...' },
      },
      {
        phrase: 'In the meantime, I\'ll work on...',
        usage: 'Use it to show you will stay productive while the blocker is solved.',
        translation: { fr: 'En attendant, je vais travailler sur...', es: 'Mientras tanto, voy a trabajar en...' },
      },
    ],
    dialogue: {
      context: 'At the stand-up, Amara explains that she cannot run the integration tests.',
      lines: [
        {
          speaker: 'Marco (Scrum master)',
          text: 'Amara, how is the payment ticket going?',
          translation: {
            fr: 'Amara, où en est le ticket sur le paiement ?',
            es: 'Amara, ¿cómo va el ticket del pago?',
          },
        },
        {
          speaker: 'Amara',
          text: 'The code is done, but I\'m blocked on the integration tests. The test database is down.',
          translation: {
            fr: 'Le code est terminé, mais je suis bloquée sur les tests d\'intégration. La base de données de test est en panne.',
            es: 'El código está terminado, pero estoy bloqueada con los tests de integración. La base de datos de pruebas está caída.',
          },
        },
        {
          speaker: 'Marco (Scrum master)',
          text: 'Since when?',
          translation: {
            fr: 'Depuis quand ?',
            es: '¿Desde cuándo?',
          },
        },
        {
          speaker: 'Amara',
          text: 'Since yesterday afternoon. I\'ve already tried restarting the container, but I get a connection error.',
          translation: {
            fr: 'Depuis hier après-midi. J\'ai déjà essayé de redémarrer le conteneur, mais j\'ai une erreur de connexion.',
            es: 'Desde ayer por la tarde. Ya he probado a reiniciar el contenedor, pero me da un error de conexión.',
          },
        },
        {
          speaker: 'Tom',
          text: 'I think the database credentials changed. I can help you after the stand-up.',
          translation: {
            fr: 'Je pense que les identifiants de la base ont changé. Je peux t\'aider après le stand-up.',
            es: 'Creo que han cambiado las credenciales de la base de datos. Te puedo ayudar después del stand-up.',
          },
        },
        {
          speaker: 'Amara',
          text: 'That would be great, thanks. In the meantime, I\'ll work on the unit tests.',
          translation: {
            fr: 'Ce serait super, merci. En attendant, je vais travailler sur les tests unitaires.',
            es: 'Sería genial, gracias. Mientras tanto, voy a trabajar en los tests unitarios.',
          },
        },
        {
          speaker: 'Marco (Scrum master)',
          text: 'Good. If it\'s still not fixed by lunch, let me know and I\'ll escalate it.',
          translation: {
            fr: 'Bien. Si ce n\'est toujours pas réglé à midi, préviens-moi et je ferai remonter le problème.',
            es: 'Bien. Si a la hora de comer sigue sin arreglarse, avísame y lo escalaré.',
          },
        },
        {
          speaker: 'Amara',
          text: 'Will do.',
          translation: {
            fr: 'Ça marche.',
            es: 'De acuerdo.',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'wp-02-q1',
        type: 'fill',
        prompt: 'I\'m ___ on the deployment because I don\'t have access to the server.',
        options: ['finished', 'blocked', 'started', 'ready'],
        correctIndex: 1,
        explanation:
          '"I\'m blocked on..." means you cannot continue the task; the missing access explains why.',
      },
      {
        id: 'wp-02-q2',
        type: 'choice',
        prompt: 'Why is it useful to say "I\'ve already tried..." when reporting a blocker?',
        options: [
          'It shows you are more senior than your colleagues.',
          'It makes the meeting longer.',
          'It saves time, because people won\'t suggest things you have already done.',
        ],
        correctIndex: 2,
        explanation:
          'Sharing what you have already tried helps others skip obvious suggestions and focus on new ideas.',
      },
      {
        id: 'wp-02-q3',
        type: 'choice',
        prompt: 'What is a "workaround"?',
        options: [
          'A temporary way to avoid a problem without really fixing it',
          'A long meeting about a problem',
          'A permanent fix for a bug',
          'A task that nobody wants to do',
        ],
        correctIndex: 0,
        explanation:
          'A workaround lets you keep going while the real problem is still there, waiting for a proper fix.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // wp-03 — Sprint planning: estimating and committing
  // ---------------------------------------------------------------------------
  {
    id: 'wp-03',
    moduleId: 'workplace',
    topic: 'agile',
    title: 'Sprint planning: estimating and committing',
    titleTranslation: {
      fr: 'Sprint planning : estimer et s\'engager',
      es: 'Sprint planning: estimar y comprometerse',
    },
    level: 'intermediate',
    premium: false,
    estimatedMinutes: 9,
    roles: ['any'],
    objective:
      'Discuss estimates, express uncertainty and agree on what the team can realistically commit to in a sprint.',
    objectiveTranslation: {
      fr: 'Discuter des estimations, exprimer une incertitude et se mettre d\'accord sur ce que l\'équipe peut réellement s\'engager à livrer dans un sprint.',
      es: 'Hablar de estimaciones, expresar incertidumbre y acordar a qué puede comprometerse el equipo de forma realista en un sprint.',
    },
    situation:
      'Your team is in sprint planning. The product owner wants a new CSV export feature in this sprint, and the team needs to estimate it in story points.',
    situationTranslation: {
      fr: 'Votre équipe est en sprint planning. Le product owner veut une nouvelle fonctionnalité d\'export CSV dans ce sprint, et l\'équipe doit l\'estimer en story points.',
      es: 'Tu equipo está en el sprint planning. El product owner quiere una nueva funcionalidad de exportación a CSV en este sprint y el equipo tiene que estimarla en story points.',
    },
    vocabulary: [
      {
        term: 'story points',
        definition: 'A relative unit teams use to estimate the effort, complexity and risk of a task.',
        translation: { fr: 'story points', es: 'story points' },
      },
      {
        term: 'velocity',
        definition: 'The average number of story points a team completes in one sprint.',
        translation: { fr: 'vélocité', es: 'velocidad' },
      },
      {
        term: 'backlog',
        definition: 'The ordered list of work that the team has not done yet.',
        translation: { fr: 'backlog', es: 'backlog' },
      },
      {
        term: 'capacity',
        definition: 'How much work the team can take on in a sprint, considering holidays and other duties.',
        translation: { fr: 'capacité', es: 'capacidad' },
      },
      {
        term: 'acceptance criteria',
        definition: 'The conditions a story must meet to be considered done.',
        translation: { fr: 'critères d\'acceptation', es: 'criterios de aceptación' },
      },
    ],
    expressions: [
      {
        phrase: 'I\'d say it\'s a five.',
        usage: 'Use it to give your estimate in story points without sounding too certain.',
        translation: { fr: 'Je dirais que c\'est un cinq.', es: 'Yo diría que es un cinco.' },
      },
      {
        phrase: 'There\'s a lot of uncertainty around...',
        usage: 'Use it to explain why an estimate might be risky or higher than expected.',
        translation: { fr: 'Il y a beaucoup d\'incertitude autour de...', es: 'Hay mucha incertidumbre con respecto a...' },
      },
      {
        phrase: 'Can we split this story?',
        usage: 'Use it when a story is too big to finish in one sprint.',
        translation: { fr: 'On peut découper cette story ?', es: '¿Podemos dividir esta historia?' },
      },
      {
        phrase: 'I don\'t think we can commit to that.',
        usage: 'Use it to push back politely when the scope is bigger than the team\'s capacity.',
        translation: { fr: 'Je ne pense pas qu\'on puisse s\'engager là-dessus.', es: 'No creo que podamos comprometernos a eso.' },
      },
      {
        phrase: 'What does "done" look like for this one?',
        usage: 'Use it to ask for clear acceptance criteria before estimating.',
        translation: { fr: 'À quoi ressemble le « terminé » pour celle-ci ?', es: '¿Qué significa «terminado» en esta?' },
      },
    ],
    dialogue: {
      context: 'Sprint planning: the team estimates the CSV export story.',
      lines: [
        {
          speaker: 'Lucía (Product owner)',
          text: 'Next up is the CSV export. Users want to download their invoices as a spreadsheet.',
          translation: {
            fr: 'Ensuite, l\'export CSV. Les utilisateurs veulent télécharger leurs factures sous forme de tableur.',
            es: 'Lo siguiente es la exportación a CSV. Los usuarios quieren descargar sus facturas en una hoja de cálculo.',
          },
        },
        {
          speaker: 'Tom',
          text: 'What does "done" look like for this one? Do we need filters, or just a full export?',
          translation: {
            fr: 'À quoi ressemble le « terminé » pour celle-ci ? On a besoin de filtres, ou juste d\'un export complet ?',
            es: '¿Qué significa «terminado» en esta? ¿Necesitamos filtros o solo una exportación completa?',
          },
        },
        {
          speaker: 'Lucía (Product owner)',
          text: 'Filters by date range would be nice, but the full export is the priority.',
          translation: {
            fr: 'Des filtres par période seraient un plus, mais l\'export complet est la priorité.',
            es: 'Los filtros por rango de fechas estarían bien, pero la prioridad es la exportación completa.',
          },
        },
        {
          speaker: 'Kenji',
          text: 'Then I\'d say it\'s an eight. Some customers have thousands of invoices, so we\'ll probably need to stream the file.',
          translation: {
            fr: 'Alors je dirais que c\'est un huit. Certains clients ont des milliers de factures, donc il faudra sans doute générer le fichier en streaming.',
            es: 'Entonces yo diría que es un ocho. Algunos clientes tienen miles de facturas, así que probablemente tendremos que generar el archivo en streaming.',
          },
        },
        {
          speaker: 'Tom',
          text: 'I agree. There\'s a lot of uncertainty around performance. Can we split this story?',
          translation: {
            fr: 'Je suis d\'accord. Il y a beaucoup d\'incertitude sur les performances. On peut découper cette story ?',
            es: 'Estoy de acuerdo. Hay mucha incertidumbre con el rendimiento. ¿Podemos dividir esta historia?',
          },
        },
        {
          speaker: 'Lucía (Product owner)',
          text: 'Sure. Full export this sprint, date filters next sprint?',
          translation: {
            fr: 'Bien sûr. L\'export complet dans ce sprint, les filtres par date au prochain ?',
            es: 'Claro. La exportación completa en este sprint y los filtros por fecha en el siguiente, ¿vale?',
          },
        },
        {
          speaker: 'Kenji',
          text: 'That works. The full export alone is closer to a five.',
          translation: {
            fr: 'Ça me va. L\'export complet seul, c\'est plutôt un cinq.',
            es: 'Me parece bien. La exportación completa sola es más bien un cinco.',
          },
        },
        {
          speaker: 'Tom',
          text: 'With Amara on holiday next week, our capacity is about thirty points, so we can commit to it.',
          translation: {
            fr: 'Avec Amara en congé la semaine prochaine, notre capacité est d\'environ trente points, donc on peut s\'y engager.',
            es: 'Con Amara de vacaciones la semana que viene, nuestra capacidad es de unos treinta puntos, así que podemos comprometernos.',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'wp-03-q1',
        type: 'choice',
        prompt: 'What does "velocity" mean in Scrum?',
        options: [
          'How fast the application responds to requests',
          'The number of meetings in a sprint',
          'The speed at which a developer types code',
          'The average number of story points a team completes per sprint',
        ],
        correctIndex: 3,
        explanation:
          'Velocity is a team metric: the average amount of work, in story points, completed in one sprint.',
      },
      {
        id: 'wp-03-q2',
        type: 'fill',
        prompt: 'This story is too big for one sprint. Can we ___ it into two smaller stories?',
        options: ['merge', 'split', 'deploy'],
        correctIndex: 1,
        explanation:
          'To "split" a story means to divide it into smaller pieces that can each be finished in a sprint.',
      },
      {
        id: 'wp-03-q3',
        type: 'choice',
        prompt: 'Your team is already at full capacity. Which reply pushes back politely?',
        options: [
          'I don\'t think we can commit to that this sprint.',
          'No. That\'s impossible.',
          'Fine, we\'ll just work at the weekend.',
        ],
        correctIndex: 0,
        explanation:
          '"I don\'t think we can commit to that" is honest and polite, and it keeps the discussion open.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // wp-04 — Sprint review: demoing your work
  // ---------------------------------------------------------------------------
  {
    id: 'wp-04',
    moduleId: 'workplace',
    topic: 'agile',
    title: 'Sprint review: demoing your work',
    titleTranslation: {
      fr: 'Sprint review : faire la démo de votre travail',
      es: 'Sprint review: hacer la demo de tu trabajo',
    },
    level: 'intermediate',
    premium: true,
    estimatedMinutes: 9,
    roles: ['any'],
    objective:
      'Present a feature to stakeholders: introduce it, walk through it, handle questions and mention known limitations.',
    objectiveTranslation: {
      fr: 'Présenter une fonctionnalité aux parties prenantes : l\'introduire, la parcourir, répondre aux questions et mentionner les limites connues.',
      es: 'Presentar una funcionalidad a los stakeholders: introducirla, recorrerla paso a paso, responder preguntas y mencionar las limitaciones conocidas.',
    },
    situation:
      'At the end of the sprint, you demo the new password reset flow to the product owner and a few people from customer support.',
    situationTranslation: {
      fr: 'À la fin du sprint, vous faites la démo du nouveau parcours de réinitialisation du mot de passe au product owner et à quelques personnes du support client.',
      es: 'Al final del sprint, haces la demo del nuevo flujo de restablecimiento de contraseña al product owner y a varias personas de atención al cliente.',
    },
    vocabulary: [
      {
        term: 'demo',
        definition: 'A live presentation that shows how a feature works.',
        translation: { fr: 'démo', es: 'demo' },
      },
      {
        term: 'stakeholder',
        definition: 'A person who is affected by or interested in the project, such as a manager, client or user.',
        translation: { fr: 'partie prenante', es: 'parte interesada' },
      },
      {
        term: 'user flow',
        definition: 'The sequence of steps a user follows to complete a task in the product.',
        translation: { fr: 'parcours utilisateur', es: 'flujo de usuario' },
      },
      {
        term: 'edge case',
        definition: 'An unusual situation at the limits of normal use, where bugs often appear.',
        translation: { fr: 'cas limite', es: 'caso límite' },
      },
      {
        term: 'known limitation',
        definition: 'Something the feature does not do yet, which the team is aware of.',
        translation: { fr: 'limite connue', es: 'limitación conocida' },
      },
    ],
    expressions: [
      {
        phrase: 'Let me walk you through it.',
        usage: 'Use it to start showing a feature step by step.',
        translation: { fr: 'Je vais vous le montrer étape par étape.', es: 'Os lo enseño paso a paso.' },
      },
      {
        phrase: 'As you can see here...',
        usage: 'Use it to point the audience to something on the screen.',
        translation: { fr: 'Comme vous pouvez le voir ici...', es: 'Como podéis ver aquí...' },
      },
      {
        phrase: 'One thing to note is...',
        usage: 'Use it to mention a limitation or an important detail honestly.',
        translation: { fr: 'Un point à noter...', es: 'Algo a tener en cuenta es...' },
      },
      {
        phrase: 'That\'s a good question. Let me check and get back to you.',
        usage: 'Use it when you don\'t know the answer during the demo.',
        translation: {
          fr: 'Bonne question. Je vérifie et je reviens vers vous.',
          es: 'Buena pregunta. Lo compruebo y te digo algo.',
        },
      },
      {
        phrase: 'This is planned for the next sprint.',
        usage: 'Use it to answer a request for something that is not built yet.',
        translation: { fr: 'C\'est prévu pour le prochain sprint.', es: 'Está previsto para el próximo sprint.' },
      },
    ],
    dialogue: {
      context: 'Sprint review: Priya demos the password reset flow on a shared screen.',
      lines: [
        {
          speaker: 'Priya',
          text: 'This sprint we finished the new password reset flow. Let me walk you through it.',
          translation: {
            fr: 'Ce sprint, on a terminé le nouveau parcours de réinitialisation du mot de passe. Je vais vous le montrer étape par étape.',
            es: 'En este sprint hemos terminado el nuevo flujo de restablecimiento de contraseña. Os lo enseño paso a paso.',
          },
        },
        {
          speaker: 'Priya',
          text: 'The user clicks "Forgot password", enters their email, and, as you can see here, gets a confirmation message.',
          translation: {
            fr: 'L\'utilisateur clique sur « Mot de passe oublié », saisit son e-mail et, comme vous pouvez le voir ici, reçoit un message de confirmation.',
            es: 'El usuario hace clic en «He olvidado mi contraseña», introduce su correo y, como podéis ver aquí, recibe un mensaje de confirmación.',
          },
        },
        {
          speaker: 'Marco (Support)',
          text: 'What happens if the email isn\'t registered?',
          translation: {
            fr: 'Que se passe-t-il si l\'e-mail n\'est pas enregistré ?',
            es: '¿Qué pasa si el correo no está registrado?',
          },
        },
        {
          speaker: 'Priya',
          text: 'We show the same message. That\'s on purpose, so attackers can\'t find out which emails have accounts.',
          translation: {
            fr: 'On affiche le même message. C\'est voulu, pour que les attaquants ne puissent pas savoir quels e-mails ont un compte.',
            es: 'Mostramos el mismo mensaje. Es a propósito, para que los atacantes no puedan averiguar qué correos tienen cuenta.',
          },
        },
        {
          speaker: 'Lucía (Product owner)',
          text: 'Makes sense. How long is the reset link valid?',
          translation: {
            fr: 'Logique. Combien de temps le lien de réinitialisation est-il valable ?',
            es: 'Tiene sentido. ¿Cuánto tiempo es válido el enlace?',
          },
        },
        {
          speaker: 'Priya',
          text: 'Thirty minutes, and it only works once. One thing to note is that the email isn\'t translated yet. It\'s English only for now.',
          translation: {
            fr: 'Trente minutes, et il ne fonctionne qu\'une fois. Un point à noter : l\'e-mail n\'est pas encore traduit. Il est uniquement en anglais pour l\'instant.',
            es: 'Treinta minutos, y solo funciona una vez. Algo a tener en cuenta es que el correo todavía no está traducido. De momento solo está en inglés.',
          },
        },
        {
          speaker: 'Marco (Support)',
          text: 'A lot of our users are in Spain. When will the Spanish version be ready?',
          translation: {
            fr: 'Beaucoup de nos utilisateurs sont en Espagne. Quand la version espagnole sera-t-elle prête ?',
            es: 'Muchos de nuestros usuarios están en España. ¿Cuándo estará lista la versión en español?',
          },
        },
        {
          speaker: 'Priya',
          text: 'Translations are planned for the next sprint. I\'ll share the exact date once the ticket is estimated.',
          translation: {
            fr: 'Les traductions sont prévues pour le prochain sprint. Je vous donnerai la date exacte une fois le ticket estimé.',
            es: 'Las traducciones están previstas para el próximo sprint. Os daré la fecha exacta cuando el ticket esté estimado.',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'wp-04-q1',
        type: 'fill',
        prompt: 'Let me walk you ___ the new checkout flow.',
        options: ['over', 'through', 'about', 'across'],
        correctIndex: 1,
        explanation:
          '"Walk someone through something" means showing or explaining it step by step.',
      },
      {
        id: 'wp-04-q2',
        type: 'choice',
        prompt: 'A stakeholder asks a question you can\'t answer during the demo. What is the best reply?',
        options: [
          'I don\'t know. Next question.',
          'That\'s a good question. Let me check and get back to you.',
          'That\'s not my job.',
        ],
        correctIndex: 1,
        explanation:
          'It is honest, professional and promises a follow-up instead of guessing.',
      },
      {
        id: 'wp-04-q3',
        type: 'choice',
        prompt: 'Why did Priya mention that the email is English only?',
        options: [
          'To be transparent about a known limitation',
          'To blame the translation team',
          'To make the demo shorter',
          'Because the product owner asked her to hide it',
        ],
        correctIndex: 0,
        explanation:
          'Mentioning known limitations openly builds trust and avoids surprises after the release.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // wp-05 — Retrospectives
  // ---------------------------------------------------------------------------
  {
    id: 'wp-05',
    moduleId: 'workplace',
    topic: 'agile',
    title: 'Retrospectives: what went well and what to improve',
    titleTranslation: {
      fr: 'Rétrospectives : ce qui a bien marché et ce qu\'il faut améliorer',
      es: 'Retrospectivas: qué fue bien y qué mejorar',
    },
    level: 'intermediate',
    premium: true,
    estimatedMinutes: 9,
    roles: ['any'],
    objective:
      'Share positive points and problems in a retrospective without blaming anyone, and suggest concrete action items.',
    objectiveTranslation: {
      fr: 'Partager les points positifs et les problèmes en rétrospective sans accuser personne, et proposer des actions concrètes.',
      es: 'Compartir los puntos positivos y los problemas en una retrospectiva sin culpar a nadie, y proponer acciones concretas.',
    },
    situation:
      'The sprint is over. The release went out, but two hotfixes were needed because some changes were merged without enough testing. Now it is the retrospective.',
    situationTranslation: {
      fr: 'Le sprint est terminé. La release est sortie, mais il a fallu deux hotfixes car certaines modifications avaient été mergées sans assez de tests. C\'est maintenant l\'heure de la rétrospective.',
      es: 'El sprint ha terminado. La release salió, pero hicieron falta dos hotfixes porque algunos cambios se mergearon sin suficientes pruebas. Ahora toca la retrospectiva.',
    },
    vocabulary: [
      {
        term: 'retrospective',
        definition: 'A meeting at the end of a sprint where the team reflects on how it worked and how to improve.',
        translation: { fr: 'rétrospective', es: 'retrospectiva' },
      },
      {
        term: 'action item',
        definition: 'A specific task agreed in a meeting, with an owner, to improve something.',
        translation: { fr: 'action à mener', es: 'acción a realizar' },
      },
      {
        term: 'hotfix',
        definition: 'An urgent fix deployed quickly to production to solve a serious bug.',
        translation: { fr: 'hotfix (correctif urgent)', es: 'hotfix (corrección urgente)' },
      },
      {
        term: 'blameless',
        definition: 'Focused on the process and the system, not on finding a person to blame.',
        translation: { fr: 'sans recherche de coupable', es: 'sin culpables' },
      },
      {
        term: 'pain point',
        definition: 'A recurring problem that makes work slower or more frustrating.',
        translation: { fr: 'point de friction', es: 'punto de fricción' },
      },
    ],
    expressions: [
      {
        phrase: 'Something that went really well was...',
        usage: 'Use it to start with a positive point and recognise good work.',
        translation: { fr: 'Une chose qui s\'est vraiment bien passée, c\'est...', es: 'Algo que salió muy bien fue...' },
      },
      {
        phrase: 'One thing we could improve is...',
        usage: 'Use it to raise a problem in a neutral, constructive way.',
        translation: { fr: 'Une chose qu\'on pourrait améliorer, c\'est...', es: 'Algo que podríamos mejorar es...' },
      },
      {
        phrase: 'I don\'t think it\'s anyone\'s fault, but...',
        usage: 'Use it to keep the discussion blameless before describing a problem.',
        translation: { fr: 'Je ne pense pas que ce soit la faute de quelqu\'un, mais...', es: 'No creo que sea culpa de nadie, pero...' },
      },
      {
        phrase: 'What if we tried...?',
        usage: 'Use it to suggest a change as an experiment rather than an order.',
        translation: { fr: 'Et si on essayait de... ?', es: '¿Y si probáramos a...?' },
      },
      {
        phrase: 'Who wants to own this?',
        usage: 'Use it to make sure every action item has a person responsible for it.',
        translation: { fr: 'Qui veut s\'en charger ?', es: '¿Quién quiere encargarse de esto?' },
      },
    ],
    dialogue: {
      context: 'The sprint retrospective; the scrum master asks the team for their points.',
      lines: [
        {
          speaker: 'Marco (Scrum master)',
          text: 'Let\'s start with the positives. What went well this sprint?',
          translation: {
            fr: 'Commençons par le positif. Qu\'est-ce qui s\'est bien passé ce sprint ?',
            es: 'Empecemos por lo positivo. ¿Qué salió bien en este sprint?',
          },
        },
        {
          speaker: 'Amara',
          text: 'Something that went really well was pairing with Kenji on the search feature. We finished it two days early.',
          translation: {
            fr: 'Une chose qui s\'est vraiment bien passée, c\'est le pair programming avec Kenji sur la recherche. On l\'a terminée avec deux jours d\'avance.',
            es: 'Algo que salió muy bien fue programar en pareja con Kenji la funcionalidad de búsqueda. La terminamos con dos días de antelación.',
          },
        },
        {
          speaker: 'Marco (Scrum master)',
          text: 'Great to hear. And what could we improve?',
          translation: {
            fr: 'Ça fait plaisir à entendre. Et qu\'est-ce qu\'on pourrait améliorer ?',
            es: 'Me alegra oírlo. ¿Y qué podríamos mejorar?',
          },
        },
        {
          speaker: 'Tom',
          text: 'I don\'t think it\'s anyone\'s fault, but we needed two hotfixes after the release. Some pull requests were merged without a second review.',
          translation: {
            fr: 'Je ne pense pas que ce soit la faute de quelqu\'un, mais on a eu besoin de deux hotfixes après la release. Certaines pull requests ont été mergées sans deuxième relecture.',
            es: 'No creo que sea culpa de nadie, pero hicieron falta dos hotfixes después de la release. Algunas pull requests se mergearon sin una segunda revisión.',
          },
        },
        {
          speaker: 'Amara',
          text: 'True. We were rushing at the end of the sprint.',
          translation: {
            fr: 'C\'est vrai. On était pressés à la fin du sprint.',
            es: 'Es verdad. Íbamos con prisas al final del sprint.',
          },
        },
        {
          speaker: 'Tom',
          text: 'What if we tried branch protection, so every pull request needs one approval before merging?',
          translation: {
            fr: 'Et si on essayait la protection de branche, pour que chaque pull request ait besoin d\'une approbation avant le merge ?',
            es: '¿Y si probáramos la protección de ramas, para que cada pull request necesite una aprobación antes del merge?',
          },
        },
        {
          speaker: 'Marco (Scrum master)',
          text: 'I like that. Who wants to own this?',
          translation: {
            fr: 'J\'aime bien l\'idée. Qui veut s\'en charger ?',
            es: 'Me gusta. ¿Quién quiere encargarse de esto?',
          },
        },
        {
          speaker: 'Tom',
          text: 'I\'ll set it up in the repo settings tomorrow, and we can review how it went at the next retro.',
          translation: {
            fr: 'Je la configure demain dans les paramètres du repo, et on fera le point à la prochaine rétro.',
            es: 'Lo configuro mañana en los ajustes del repo y vemos cómo ha ido en la próxima retro.',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'wp-05-q1',
        type: 'choice',
        prompt: 'What does a "blameless" retrospective focus on?',
        options: [
          'Finding the person who made the mistake',
          'Only the positive points of the sprint',
          'The process and the system, not individual people',
          'The budget of the project',
        ],
        correctIndex: 2,
        explanation:
          'A blameless approach looks at why the process allowed a problem, so people feel safe to speak honestly.',
      },
      {
        id: 'wp-05-q2',
        type: 'fill',
        prompt: 'What if we ___ adding a checklist to the pull request template?',
        options: ['tried', 'try to be', 'have tried'],
        correctIndex: 0,
        explanation:
          '"What if we tried + -ing" is the natural pattern for suggesting an experiment; the past form makes it sound softer.',
      },
      {
        id: 'wp-05-q3',
        type: 'choice',
        prompt: 'Which is a good action item?',
        options: [
          'Be more careful next time.',
          'Tom enables branch protection on the main repo by Friday.',
          'Everyone should test more.',
        ],
        correctIndex: 1,
        explanation:
          'A good action item is specific, has an owner and a deadline, so the team can check whether it was done.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // wp-06 — Project status meetings
  // ---------------------------------------------------------------------------
  {
    id: 'wp-06',
    moduleId: 'workplace',
    topic: 'meetings',
    title: 'Project status meetings',
    titleTranslation: {
      fr: 'Réunions de suivi de projet',
      es: 'Reuniones de seguimiento del proyecto',
    },
    level: 'intermediate',
    premium: true,
    estimatedMinutes: 9,
    roles: ['any', 'architect'],
    objective:
      'Report project status to managers clearly: progress, risks, decisions needed and next steps.',
    objectiveTranslation: {
      fr: 'Présenter clairement l\'état d\'un projet aux managers : avancement, risques, décisions à prendre et prochaines étapes.',
      es: 'Informar con claridad del estado de un proyecto a los responsables: avance, riesgos, decisiones pendientes y próximos pasos.',
    },
    situation:
      'You are the technical lead on a migration from an on-premise server to the cloud. Every Thursday you give a status update to the engineering manager and the product manager.',
    situationTranslation: {
      fr: 'Vous êtes le lead technique d\'une migration d\'un serveur on-premise vers le cloud. Chaque jeudi, vous faites un point d\'avancement avec l\'engineering manager et le product manager.',
      es: 'Eres el líder técnico de una migración de un servidor on-premise a la nube. Cada jueves das una actualización de estado al engineering manager y al product manager.',
    },
    vocabulary: [
      {
        term: 'milestone',
        definition: 'An important point in a project, often linked to a date or a deliverable.',
        translation: { fr: 'jalon', es: 'hito' },
      },
      {
        term: 'at risk',
        definition: 'In danger of not being finished on time or as planned.',
        translation: { fr: 'en risque', es: 'en riesgo' },
      },
      {
        term: 'mitigation',
        definition: 'An action taken to reduce the impact or likelihood of a risk.',
        translation: { fr: 'mesure d\'atténuation', es: 'medida de mitigación' },
      },
      {
        term: 'scope',
        definition: 'The full list of features and work included in a project.',
        translation: { fr: 'périmètre', es: 'alcance' },
      },
      {
        term: 'go-live',
        definition: 'The moment a system is released and starts being used for real.',
        translation: { fr: 'mise en production', es: 'puesta en producción' },
      },
    ],
    expressions: [
      {
        phrase: 'Overall, we\'re on track for...',
        usage: 'Use it to give the big picture first, before the details.',
        translation: { fr: 'Dans l\'ensemble, nous sommes dans les temps pour...', es: 'En general, vamos según lo previsto para...' },
      },
      {
        phrase: 'The main risk right now is...',
        usage: 'Use it to highlight the most important problem that could cause a delay.',
        translation: { fr: 'Le principal risque en ce moment, c\'est...', es: 'El principal riesgo ahora mismo es...' },
      },
      {
        phrase: 'To mitigate that, we\'re...',
        usage: 'Use it to explain what you are doing about a risk.',
        translation: { fr: 'Pour limiter ce risque, nous...', es: 'Para mitigarlo, estamos...' },
      },
      {
        phrase: 'We need a decision on...',
        usage: 'Use it to ask managers clearly for something only they can decide.',
        translation: { fr: 'Nous avons besoin d\'une décision sur...', es: 'Necesitamos una decisión sobre...' },
      },
      {
        phrase: 'Next steps are...',
        usage: 'Use it to finish your update with what will happen next.',
        translation: { fr: 'Les prochaines étapes sont...', es: 'Los próximos pasos son...' },
      },
    ],
    dialogue: {
      context: 'The weekly status meeting about the cloud migration.',
      lines: [
        {
          speaker: 'Lucía (Engineering manager)',
          text: 'Kenji, where are we with the migration?',
          translation: {
            fr: 'Kenji, où en est-on avec la migration ?',
            es: 'Kenji, ¿cómo vamos con la migración?',
          },
        },
        {
          speaker: 'Kenji',
          text: 'Overall, we\'re on track for the go-live on March 15th. Four of the six services are already running in the cloud.',
          translation: {
            fr: 'Dans l\'ensemble, nous sommes dans les temps pour la mise en production du 15 mars. Quatre des six services tournent déjà dans le cloud.',
            es: 'En general, vamos según lo previsto para la puesta en producción del 15 de marzo. Cuatro de los seis servicios ya funcionan en la nube.',
          },
        },
        {
          speaker: 'Amara (Product manager)',
          text: 'Good news. What about the last two?',
          translation: {
            fr: 'Bonne nouvelle. Et les deux derniers ?',
            es: 'Buenas noticias. ¿Y los dos últimos?',
          },
        },
        {
          speaker: 'Kenji',
          text: 'The main risk right now is the reporting service. It depends on an old file share that doesn\'t exist in the cloud.',
          translation: {
            fr: 'Le principal risque en ce moment, c\'est le service de reporting. Il dépend d\'un ancien partage de fichiers qui n\'existe pas dans le cloud.',
            es: 'El principal riesgo ahora mismo es el servicio de informes. Depende de una carpeta compartida antigua que no existe en la nube.',
          },
        },
        {
          speaker: 'Lucía (Engineering manager)',
          text: 'How serious is that?',
          translation: {
            fr: 'C\'est grave à quel point ?',
            es: '¿Hasta qué punto es grave?',
          },
        },
        {
          speaker: 'Kenji',
          text: 'It could cost us a week. To mitigate that, we\'re moving the files to object storage in parallel.',
          translation: {
            fr: 'Ça pourrait nous coûter une semaine. Pour limiter ce risque, nous migrons les fichiers vers un stockage objet en parallèle.',
            es: 'Podría costarnos una semana. Para mitigarlo, estamos pasando los archivos a un almacenamiento de objetos en paralelo.',
          },
        },
        {
          speaker: 'Kenji',
          text: 'We also need a decision on the old reports from before 2019. Do we migrate them or archive them?',
          translation: {
            fr: 'Nous avons aussi besoin d\'une décision sur les anciens rapports d\'avant 2019. On les migre ou on les archive ?',
            es: 'También necesitamos una decisión sobre los informes antiguos de antes de 2019. ¿Los migramos o los archivamos?',
          },
        },
        {
          speaker: 'Amara (Product manager)',
          text: 'Let me check with the finance team and confirm by Monday.',
          translation: {
            fr: 'Je vérifie avec l\'équipe finance et je confirme d\'ici lundi.',
            es: 'Lo consulto con el equipo de finanzas y lo confirmo antes del lunes.',
          },
        },
        {
          speaker: 'Kenji',
          text: 'Perfect. Next steps are finishing the file migration and running a load test next Wednesday.',
          translation: {
            fr: 'Parfait. Les prochaines étapes : terminer la migration des fichiers et lancer un test de charge mercredi prochain.',
            es: 'Perfecto. Los próximos pasos son terminar la migración de archivos y hacer una prueba de carga el miércoles que viene.',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'wp-06-q1',
        type: 'choice',
        prompt: 'In a status meeting, what should you usually say first?',
        options: [
          'Every technical detail of the last week',
          'The overall status, for example "We\'re on track"',
          'A list of people who were late',
        ],
        correctIndex: 1,
        explanation:
          'Managers need the big picture first; details come after, if they are useful.',
      },
      {
        id: 'wp-06-q2',
        type: 'fill',
        prompt: 'The main ___ right now is that the vendor API is not ready yet.',
        options: ['milestone', 'scope', 'risk', 'go-live'],
        correctIndex: 2,
        explanation:
          'A "risk" is something that could cause a delay or a problem; an API that is not ready fits that meaning.',
      },
      {
        id: 'wp-06-q3',
        type: 'choice',
        prompt: 'What is a "mitigation"?',
        options: [
          'A meeting to discuss the budget',
          'A new feature added to the scope',
          'The final release date',
          'An action that reduces the impact or likelihood of a risk',
        ],
        correctIndex: 3,
        explanation:
          'A mitigation is what you do to make a risk less likely or less harmful, like migrating the files in parallel.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // wp-07 — Asking for clarification
  // ---------------------------------------------------------------------------
  {
    id: 'wp-07',
    moduleId: 'workplace',
    topic: 'communication',
    title: 'Asking for clarification',
    titleTranslation: {
      fr: 'Demander des précisions',
      es: 'Pedir aclaraciones',
    },
    level: 'beginner',
    premium: false,
    estimatedMinutes: 6,
    roles: ['any', 'student'],
    objective:
      'Ask people to repeat, explain or confirm something politely when you don\'t understand.',
    objectiveTranslation: {
      fr: 'Demander poliment de répéter, d\'expliquer ou de confirmer quelque chose quand vous ne comprenez pas.',
      es: 'Pedir con educación que te repitan, expliquen o confirmen algo cuando no lo entiendes.',
    },
    situation:
      'A senior colleague explains a new task to you quickly on a call. She uses an acronym you don\'t know, and you are not sure about the deadline.',
    situationTranslation: {
      fr: 'Une collègue senior vous explique rapidement une nouvelle tâche pendant un appel. Elle utilise un acronyme que vous ne connaissez pas, et vous n\'êtes pas sûr de la date limite.',
      es: 'Una compañera sénior te explica rápidamente una tarea nueva en una llamada. Usa unas siglas que no conoces y no estás seguro de la fecha límite.',
    },
    vocabulary: [
      {
        term: 'to clarify',
        definition: 'To make something easier to understand by giving more details.',
        translation: { fr: 'clarifier', es: 'aclarar' },
      },
      {
        term: 'acronym',
        definition: 'A short word made from the first letters of other words, like API or SLA.',
        translation: { fr: 'acronyme', es: 'sigla' },
      },
      {
        term: 'requirement',
        definition: 'Something that a feature or system must do.',
        translation: { fr: 'exigence', es: 'requisito' },
      },
      {
        term: 'deadline',
        definition: 'The date or time by which something must be finished.',
        translation: { fr: 'date limite', es: 'fecha límite' },
      },
      {
        term: 'to rephrase',
        definition: 'To say something again using different words.',
        translation: { fr: 'reformuler', es: 'reformular' },
      },
    ],
    expressions: [
      {
        phrase: 'Sorry, could you say that again?',
        usage: 'Use it when you didn\'t hear or understand what someone said.',
        translation: { fr: 'Pardon, tu peux répéter ?', es: 'Perdona, ¿puedes repetirlo?' },
      },
      {
        phrase: 'What does ... stand for?',
        usage: 'Use it to ask what an acronym means.',
        translation: { fr: 'Que signifie ... ?', es: '¿Qué significa ...?' },
      },
      {
        phrase: 'Just to make sure I understand...',
        usage: 'Use it before repeating the task in your own words to check you got it right.',
        translation: { fr: 'Juste pour être sûr d\'avoir bien compris...', es: 'Solo para asegurarme de que lo entiendo...' },
      },
      {
        phrase: 'Do you mean...?',
        usage: 'Use it to check one possible meaning of what someone said.',
        translation: { fr: 'Tu veux dire... ?', es: '¿Quieres decir...?' },
      },
      {
        phrase: 'Could you give me an example?',
        usage: 'Use it when an explanation is too abstract.',
        translation: { fr: 'Tu pourrais me donner un exemple ?', es: '¿Me puedes dar un ejemplo?' },
      },
    ],
    dialogue: {
      context: 'A short video call; Priya explains a new task to Tom, a junior developer.',
      lines: [
        {
          speaker: 'Priya',
          text: 'So, we need to add rate limiting to the public API. The SLA says we can\'t go above two hundred milliseconds.',
          translation: {
            fr: 'Donc, on doit ajouter du rate limiting sur l\'API publique. Le SLA dit qu\'on ne peut pas dépasser deux cents millisecondes.',
            es: 'Bueno, tenemos que añadir rate limiting a la API pública. El SLA dice que no podemos pasar de doscientos milisegundos.',
          },
        },
        {
          speaker: 'Tom',
          text: 'Sorry, what does SLA stand for?',
          translation: {
            fr: 'Pardon, que signifie SLA ?',
            es: 'Perdona, ¿qué significa SLA?',
          },
        },
        {
          speaker: 'Priya',
          text: 'Service Level Agreement. It\'s our promise to customers about performance and availability.',
          translation: {
            fr: 'Service Level Agreement, l\'accord de niveau de service. C\'est notre engagement envers les clients sur les performances et la disponibilité.',
            es: 'Service Level Agreement, el acuerdo de nivel de servicio. Es nuestro compromiso con los clientes sobre rendimiento y disponibilidad.',
          },
        },
        {
          speaker: 'Tom',
          text: 'Got it, thanks. Do you mean the rate limiter itself must not add more than two hundred milliseconds?',
          translation: {
            fr: 'Compris, merci. Tu veux dire que le rate limiter lui-même ne doit pas ajouter plus de deux cents millisecondes ?',
            es: 'Entendido, gracias. ¿Quieres decir que el propio rate limiter no debe añadir más de doscientos milisegundos?',
          },
        },
        {
          speaker: 'Priya',
          text: 'No, the whole response time must stay under two hundred. The limiter should add only a few milliseconds.',
          translation: {
            fr: 'Non, c\'est le temps de réponse total qui doit rester sous deux cents. Le limiteur ne doit ajouter que quelques millisecondes.',
            es: 'No, el tiempo de respuesta total tiene que quedarse por debajo de doscientos. El limitador solo debería añadir unos pocos milisegundos.',
          },
        },
        {
          speaker: 'Tom',
          text: 'Okay. Just to make sure I understand: I add the limiter, keep total latency under two hundred milliseconds, and when is the deadline?',
          translation: {
            fr: 'D\'accord. Juste pour être sûr d\'avoir bien compris : j\'ajoute le limiteur, je garde la latence totale sous deux cents millisecondes, et c\'est pour quand ?',
            es: 'Vale. Solo para asegurarme de que lo entiendo: añado el limitador, mantengo la latencia total por debajo de doscientos milisegundos, ¿y para cuándo es?',
          },
        },
        {
          speaker: 'Priya',
          text: 'End of next week. Exactly right.',
          translation: {
            fr: 'Fin de la semaine prochaine. C\'est exactement ça.',
            es: 'Para finales de la semana que viene. Exacto.',
          },
        },
        {
          speaker: 'Tom',
          text: 'Great. I\'ll send you a short summary in Slack so we\'re on the same page.',
          translation: {
            fr: 'Super. Je t\'envoie un petit résumé sur Slack pour qu\'on soit bien alignés.',
            es: 'Genial. Te mando un pequeño resumen por Slack para que estemos en la misma página.',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'wp-07-q1',
        type: 'fill',
        prompt: 'Sorry, what does CI ___ for?',
        options: ['mean', 'stand', 'say', 'go'],
        correctIndex: 1,
        explanation:
          'The fixed expression is "What does X stand for?" to ask what the letters of an acronym mean.',
      },
      {
        id: 'wp-07-q2',
        type: 'choice',
        prompt: 'You want to check that you understood a task correctly. What do you say?',
        options: [
          'Just to make sure I understand, you want me to fix the login bug first?',
          'I understand everything, obviously.',
          'Why are you explaining this?',
        ],
        correctIndex: 0,
        explanation:
          '"Just to make sure I understand..." followed by the task in your own words is a polite way to confirm.',
      },
      {
        id: 'wp-07-q3',
        type: 'choice',
        prompt: 'Your colleague\'s explanation is too abstract. What is the best question?',
        options: [
          'Can you speak slower?',
          'Is this important?',
          'Could you give me an example?',
        ],
        correctIndex: 2,
        explanation:
          'Asking for an example turns an abstract idea into something concrete and easier to understand.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // wp-08 — Explaining a delay
  // ---------------------------------------------------------------------------
  {
    id: 'wp-08',
    moduleId: 'workplace',
    topic: 'communication',
    title: 'Explaining a delay',
    titleTranslation: {
      fr: 'Expliquer un retard',
      es: 'Explicar un retraso',
    },
    level: 'intermediate',
    premium: true,
    estimatedMinutes: 8,
    roles: ['any'],
    objective:
      'Announce a delay early and honestly, explain the cause, give a new estimate and propose options.',
    objectiveTranslation: {
      fr: 'Annoncer un retard tôt et honnêtement, en expliquer la cause, donner une nouvelle estimation et proposer des options.',
      es: 'Anunciar un retraso pronto y con honestidad, explicar la causa, dar una nueva estimación y proponer opciones.',
    },
    situation:
      'You promised to deliver a new notifications feature on Friday. On Tuesday you discover that the third-party push service has changed its API, so you will not finish on time.',
    situationTranslation: {
      fr: 'Vous avez promis de livrer une nouvelle fonctionnalité de notifications vendredi. Mardi, vous découvrez que le service de push tiers a modifié son API, et vous ne finirez pas à temps.',
      es: 'Prometiste entregar una nueva funcionalidad de notificaciones el viernes. El martes descubres que el servicio de push externo ha cambiado su API, así que no vas a terminar a tiempo.',
    },
    vocabulary: [
      {
        term: 'delay',
        definition: 'A situation where something happens later than planned.',
        translation: { fr: 'retard', es: 'retraso' },
      },
      {
        term: 'heads-up',
        definition: 'An early warning about something that is going to happen.',
        translation: { fr: 'avertissement (prévenir à l\'avance)', es: 'aviso previo' },
      },
      {
        term: 'revised estimate',
        definition: 'A new, updated prediction of when the work will be finished.',
        translation: { fr: 'estimation révisée', es: 'estimación revisada' },
      },
      {
        term: 'breaking change',
        definition: 'A change to an API or library that makes existing code stop working.',
        translation: { fr: 'changement cassant (breaking change)', es: 'cambio incompatible (breaking change)' },
      },
      {
        term: 'trade-off',
        definition: 'A choice where you gain one thing but lose another, like speed versus quality.',
        translation: { fr: 'compromis', es: 'compromiso (trade-off)' },
      },
    ],
    expressions: [
      {
        phrase: 'I wanted to give you a heads-up that...',
        usage: 'Use it to announce bad news early, before it becomes a surprise.',
        translation: { fr: 'Je voulais te prévenir que...', es: 'Quería avisarte de que...' },
      },
      {
        phrase: 'It\'s taking longer than expected because...',
        usage: 'Use it to explain the real cause of the delay without excuses.',
        translation: { fr: 'Ça prend plus de temps que prévu parce que...', es: 'Está llevando más tiempo de lo previsto porque...' },
      },
      {
        phrase: 'My revised estimate is...',
        usage: 'Use it to give a new, realistic date.',
        translation: { fr: 'Mon estimation révisée, c\'est...', es: 'Mi estimación revisada es...' },
      },
      {
        phrase: 'We have two options:...',
        usage: 'Use it to help the other person decide instead of only giving bad news.',
        translation: { fr: 'Nous avons deux options :...', es: 'Tenemos dos opciones:...' },
      },
      {
        phrase: 'I\'ll keep you posted.',
        usage: 'Use it to promise regular updates until the problem is solved.',
        translation: { fr: 'Je te tiens au courant.', es: 'Te mantengo informado.' },
      },
    ],
    dialogue: {
      context: 'Tuesday afternoon; Amara calls the product owner about the notifications feature.',
      lines: [
        {
          speaker: 'Amara',
          text: 'Hi Lucía, do you have five minutes? I wanted to give you a heads-up about the notifications feature.',
          translation: {
            fr: 'Salut Lucía, tu as cinq minutes ? Je voulais te prévenir à propos de la fonctionnalité de notifications.',
            es: 'Hola, Lucía, ¿tienes cinco minutos? Quería avisarte sobre la funcionalidad de notificaciones.',
          },
        },
        {
          speaker: 'Lucía (Product owner)',
          text: 'Sure. Is there a problem?',
          translation: {
            fr: 'Bien sûr. Il y a un problème ?',
            es: 'Claro. ¿Hay algún problema?',
          },
        },
        {
          speaker: 'Amara',
          text: 'It\'s taking longer than expected. The push provider released a breaking change last week, and our integration doesn\'t work with the new version.',
          translation: {
            fr: 'Ça prend plus de temps que prévu. Le fournisseur de push a publié un breaking change la semaine dernière, et notre intégration ne marche pas avec la nouvelle version.',
            es: 'Está llevando más tiempo de lo previsto. El proveedor de push publicó un cambio incompatible la semana pasada y nuestra integración no funciona con la nueva versión.',
          },
        },
        {
          speaker: 'Lucía (Product owner)',
          text: 'I see. So Friday isn\'t realistic anymore?',
          translation: {
            fr: 'Je vois. Donc vendredi, ce n\'est plus réaliste ?',
            es: 'Ya veo. ¿Entonces el viernes ya no es realista?',
          },
        },
        {
          speaker: 'Amara',
          text: 'Not for the full feature. My revised estimate is next Wednesday.',
          translation: {
            fr: 'Pas pour la fonctionnalité complète. Mon estimation révisée, c\'est mercredi prochain.',
            es: 'No para la funcionalidad completa. Mi estimación revisada es el miércoles que viene.',
          },
        },
        {
          speaker: 'Amara',
          text: 'We have two options: we ship email notifications on Friday and add push next week, or we wait and release everything on Wednesday.',
          translation: {
            fr: 'Nous avons deux options : on livre les notifications par e-mail vendredi et on ajoute le push la semaine prochaine, ou on attend et on sort tout mercredi.',
            es: 'Tenemos dos opciones: sacamos las notificaciones por correo el viernes y añadimos las push la semana que viene, o esperamos y lo lanzamos todo el miércoles.',
          },
        },
        {
          speaker: 'Lucía (Product owner)',
          text: 'Let\'s ship email on Friday. Marketing really wants something for the newsletter.',
          translation: {
            fr: 'Livrons l\'e-mail vendredi. Le marketing veut vraiment quelque chose pour la newsletter.',
            es: 'Saquemos el correo el viernes. Marketing quiere de verdad algo para la newsletter.',
          },
        },
        {
          speaker: 'Amara',
          text: 'Sounds good. Thanks for being flexible. I\'ll keep you posted on the push part.',
          translation: {
            fr: 'Ça marche. Merci pour ta flexibilité. Je te tiens au courant pour la partie push.',
            es: 'Me parece bien. Gracias por ser flexible. Te mantengo informada sobre la parte de push.',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'wp-08-q1',
        type: 'choice',
        prompt: 'When is the best time to announce a delay?',
        options: [
          'On the deadline day, if you really have to',
          'As soon as you know about it',
          'Only if someone asks you',
          'After the next sprint review',
        ],
        correctIndex: 1,
        explanation:
          'Announcing a delay early gives the team time to adapt plans and choose between options.',
      },
      {
        id: 'wp-08-q2',
        type: 'fill',
        prompt: 'I wanted to give you a ___ that the release might slip to Monday.',
        options: ['heads-up', 'hand-off', 'stand-up', 'check-in'],
        correctIndex: 0,
        explanation:
          'A "heads-up" is an early warning; "give someone a heads-up" is the fixed expression.',
      },
      {
        id: 'wp-08-q3',
        type: 'choice',
        prompt: 'What is a "breaking change"?',
        options: [
          'A change that improves performance',
          'A short pause during a long meeting',
          'A change to an API that makes existing code stop working',
        ],
        correctIndex: 2,
        explanation:
          'A breaking change is not backward compatible, so code that used the old version must be updated.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // wp-09 — Giving constructive feedback
  // ---------------------------------------------------------------------------
  {
    id: 'wp-09',
    moduleId: 'workplace',
    topic: 'feedback',
    title: 'Giving constructive feedback',
    titleTranslation: {
      fr: 'Donner un feedback constructif',
      es: 'Dar feedback constructivo',
    },
    level: 'advanced',
    premium: true,
    estimatedMinutes: 11,
    roles: ['any', 'architect'],
    objective:
      'Give specific, balanced and diplomatic feedback that focuses on behaviour and impact, not on the person.',
    objectiveTranslation: {
      fr: 'Donner un feedback précis, équilibré et diplomate, centré sur le comportement et son impact, et non sur la personne.',
      es: 'Dar feedback concreto, equilibrado y diplomático, centrado en el comportamiento y su impacto, no en la persona.',
    },
    situation:
      'You are a senior developer mentoring a colleague. His code is technically strong, but his pull requests are huge and often lack descriptions, so reviews take days. You have a one-to-one with him.',
    situationTranslation: {
      fr: 'Vous êtes développeur senior et vous accompagnez un collègue. Son code est techniquement solide, mais ses pull requests sont énormes et souvent sans description, donc les revues prennent des jours. Vous avez un one-to-one avec lui.',
      es: 'Eres desarrollador sénior y mentor de un compañero. Su código es técnicamente sólido, pero sus pull requests son enormes y a menudo no tienen descripción, así que las revisiones tardan días. Tienes una reunión one-to-one con él.',
    },
    vocabulary: [
      {
        term: 'constructive',
        definition: 'Intended to help someone improve, rather than to criticise them.',
        translation: { fr: 'constructif', es: 'constructivo' },
      },
      {
        term: 'one-to-one',
        definition: 'A private, regular meeting between two people, often a manager or mentor and a team member.',
        translation: { fr: 'entretien individuel (one-to-one)', es: 'reunión individual (one-to-one)' },
      },
      {
        term: 'impact',
        definition: 'The effect that an action or behaviour has on other people or on the project.',
        translation: { fr: 'impact', es: 'impacto' },
      },
      {
        term: 'actionable',
        definition: 'Specific enough that the person knows exactly what to do next.',
        translation: { fr: 'exploitable (concret)', es: 'accionable (concreto)' },
      },
      {
        term: 'to come across as',
        definition: 'To give a particular impression to other people, whether or not it is intended.',
        translation: { fr: 'donner l\'impression d\'être', es: 'dar la impresión de ser' },
      },
    ],
    expressions: [
      {
        phrase: 'Do you have a moment for some feedback?',
        usage: 'Use it to ask permission first, so the person is ready to listen.',
        translation: { fr: 'Tu as un moment pour un petit feedback ?', es: '¿Tienes un momento para darte algo de feedback?' },
      },
      {
        phrase: 'I\'ve noticed that...',
        usage: 'Use it to describe an observable fact without judging the person.',
        translation: { fr: 'J\'ai remarqué que...', es: 'He notado que...' },
      },
      {
        phrase: 'The impact is that...',
        usage: 'Use it to explain why the behaviour matters for the team or the project.',
        translation: { fr: 'La conséquence, c\'est que...', es: 'El impacto es que...' },
      },
      {
        phrase: 'Have you considered...?',
        usage: 'Use it to suggest an improvement as an option, which sounds less directive than an order.',
        translation: { fr: 'Tu as envisagé de... ?', es: '¿Has pensado en...?' },
      },
      {
        phrase: 'How does that sound to you?',
        usage: 'Use it to invite the other person\'s view and turn feedback into a conversation.',
        translation: { fr: 'Qu\'est-ce que tu en penses ?', es: '¿Qué te parece?' },
      },
      {
        phrase: 'This might just be my perspective, but...',
        usage: 'Use it to soften a point and show you are open to being wrong.',
        translation: { fr: 'C\'est peut-être juste mon point de vue, mais...', es: 'Puede que sea solo mi punto de vista, pero...' },
      },
    ],
    dialogue: {
      context: 'A one-to-one meeting; Priya gives Marco feedback on his pull requests.',
      lines: [
        {
          speaker: 'Priya',
          text: 'Before we wrap up, do you have a moment for some feedback on code reviews?',
          translation: {
            fr: 'Avant qu\'on termine, tu as un moment pour un petit feedback sur les revues de code ?',
            es: 'Antes de terminar, ¿tienes un momento para darte algo de feedback sobre las revisiones de código?',
          },
        },
        {
          speaker: 'Marco',
          text: 'Sure, go ahead.',
          translation: {
            fr: 'Bien sûr, vas-y.',
            es: 'Claro, adelante.',
          },
        },
        {
          speaker: 'Priya',
          text: 'First, your caching refactor was excellent. The way you isolated the invalidation logic made it really easy to test.',
          translation: {
            fr: 'D\'abord, ton refactoring du cache était excellent. La façon dont tu as isolé la logique d\'invalidation l\'a rendu vraiment facile à tester.',
            es: 'Primero, tu refactorización de la caché fue excelente. La forma en que aislaste la lógica de invalidación hizo que fuera muy fácil de probar.',
          },
        },
        {
          speaker: 'Priya',
          text: 'That said, I\'ve noticed that your last few pull requests were quite large, over two thousand lines, and most didn\'t have a description.',
          translation: {
            fr: 'Cela dit, j\'ai remarqué que tes dernières pull requests étaient assez grosses, plus de deux mille lignes, et la plupart n\'avaient pas de description.',
            es: 'Dicho esto, he notado que tus últimas pull requests eran bastante grandes, de más de dos mil líneas, y la mayoría no tenía descripción.',
          },
        },
        {
          speaker: 'Priya',
          text: 'The impact is that reviewers keep postponing them, so your work sits for days before it\'s merged.',
          translation: {
            fr: 'La conséquence, c\'est que les relecteurs les repoussent sans cesse, donc ton travail attend des jours avant d\'être mergé.',
            es: 'El impacto es que los revisores las van posponiendo, así que tu trabajo se queda parado días antes de que se haga el merge.',
          },
        },
        {
          speaker: 'Marco',
          text: 'Hmm, I hadn\'t looked at it that way. I thought one big PR would be easier to follow.',
          translation: {
            fr: 'Hmm, je ne l\'avais pas vu sous cet angle. Je pensais qu\'une grosse PR serait plus facile à suivre.',
            es: 'Mmm, no lo había visto así. Pensaba que una PR grande sería más fácil de seguir.',
          },
        },
        {
          speaker: 'Priya',
          text: 'That\'s fair. This might just be my perspective, but have you considered splitting them by layer, say the schema change first, then the service, then the UI?',
          translation: {
            fr: 'C\'est compréhensible. C\'est peut-être juste mon point de vue, mais tu as envisagé de les découper par couche, par exemple d\'abord le changement de schéma, puis le service, puis l\'UI ?',
            es: 'Es razonable. Puede que sea solo mi punto de vista, pero ¿has pensado en dividirlas por capas, por ejemplo primero el cambio de esquema, luego el servicio y luego la interfaz?',
          },
        },
        {
          speaker: 'Priya',
          text: 'And a two-line description of what changed and how to test it would help a lot. How does that sound to you?',
          translation: {
            fr: 'Et une description de deux lignes sur ce qui a changé et comment le tester aiderait beaucoup. Qu\'est-ce que tu en penses ?',
            es: 'Y una descripción de dos líneas sobre qué ha cambiado y cómo probarlo ayudaría mucho. ¿Qué te parece?',
          },
        },
        {
          speaker: 'Marco',
          text: 'Makes sense. I\'ll try it on the next feature, and maybe you could tell me if the size feels right?',
          translation: {
            fr: 'Ça se tient. Je vais essayer sur la prochaine fonctionnalité, et tu pourrais peut-être me dire si la taille te paraît bonne ?',
            es: 'Tiene sentido. Lo probaré en la próxima funcionalidad, y ¿quizá podrías decirme si el tamaño te parece adecuado?',
          },
        },
        {
          speaker: 'Priya',
          text: 'Happy to. Thanks for being so open about it.',
          translation: {
            fr: 'Avec plaisir. Merci d\'être aussi ouvert.',
            es: 'Encantada. Gracias por tomártelo de forma tan abierta.',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'wp-09-q1',
        type: 'choice',
        prompt: 'Which sentence is the most constructive?',
        options: [
          'Your pull requests are terrible.',
          'You never think about the reviewers.',
          'I\'ve noticed your last PRs were over 2,000 lines, and reviews took several days.',
          'Everyone is complaining about your code.',
        ],
        correctIndex: 2,
        explanation:
          'It describes specific, observable facts and their consequence, without judging the person.',
      },
      {
        id: 'wp-09-q2',
        type: 'fill',
        prompt: 'Have you ___ adding a short description to each pull request?',
        options: ['considered', 'suggested', 'decided'],
        correctIndex: 0,
        explanation:
          '"Have you considered + -ing?" offers an idea as an option, which sounds diplomatic rather than directive.',
      },
      {
        id: 'wp-09-q3',
        type: 'choice',
        prompt: 'Why did Priya end with "How does that sound to you?"',
        options: [
          'To end the meeting quickly',
          'To invite Marco\'s opinion and make the feedback a two-way conversation',
          'To check whether Marco heard her clearly on the call',
        ],
        correctIndex: 1,
        explanation:
          'An open question gives the other person space to respond and makes them part of the solution.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // wp-10 — Receiving feedback gracefully
  // ---------------------------------------------------------------------------
  {
    id: 'wp-10',
    moduleId: 'workplace',
    topic: 'feedback',
    title: 'Receiving feedback gracefully',
    titleTranslation: {
      fr: 'Recevoir un feedback avec élégance',
      es: 'Recibir feedback con buena actitud',
    },
    level: 'intermediate',
    premium: true,
    estimatedMinutes: 8,
    roles: ['any'],
    objective:
      'Respond to feedback calmly: thank the person, ask questions to understand, and agree on next steps.',
    objectiveTranslation: {
      fr: 'Réagir calmement à un feedback : remercier la personne, poser des questions pour comprendre et convenir des prochaines étapes.',
      es: 'Responder al feedback con calma: dar las gracias, hacer preguntas para entender y acordar los próximos pasos.',
    },
    situation:
      'During a code review, a senior colleague leaves several comments on your pull request. Later, on a call, she tells you that your error handling is too generic and makes debugging hard.',
    situationTranslation: {
      fr: 'Lors d\'une revue de code, une collègue senior laisse plusieurs commentaires sur votre pull request. Plus tard, en appel, elle vous dit que votre gestion des erreurs est trop générique et complique le débogage.',
      es: 'Durante una revisión de código, una compañera sénior deja varios comentarios en tu pull request. Más tarde, en una llamada, te dice que tu gestión de errores es demasiado genérica y dificulta la depuración.',
    },
    vocabulary: [
      {
        term: 'defensive',
        definition: 'Reacting to criticism by protecting yourself or arguing, instead of listening.',
        translation: { fr: 'sur la défensive', es: 'a la defensiva' },
      },
      {
        term: 'to take something on board',
        definition: 'To accept an idea or a piece of advice and think about using it.',
        translation: { fr: 'prendre en compte', es: 'tener en cuenta' },
      },
      {
        term: 'follow-up',
        definition: 'An action or conversation that continues something discussed earlier.',
        translation: { fr: 'suivi', es: 'seguimiento' },
      },
      {
        term: 'to push back',
        definition: 'To disagree politely with a suggestion or decision.',
        translation: { fr: 'exprimer son désaccord', es: 'objetar' },
      },
      {
        term: 'stack trace',
        definition: 'A list of the method calls that were active when an error happened, used for debugging.',
        translation: { fr: 'stack trace (pile d\'appels)', es: 'stack trace (traza de la pila)' },
      },
    ],
    expressions: [
      {
        phrase: 'Thanks for pointing that out.',
        usage: 'Use it to show you appreciate the feedback, even if it is uncomfortable.',
        translation: { fr: 'Merci de me l\'avoir signalé.', es: 'Gracias por señalarlo.' },
      },
      {
        phrase: 'Could you show me an example of what you mean?',
        usage: 'Use it to understand the feedback better instead of guessing.',
        translation: { fr: 'Tu pourrais me montrer un exemple de ce que tu veux dire ?', es: '¿Me puedes enseñar un ejemplo de lo que quieres decir?' },
      },
      {
        phrase: 'That makes sense. I\'ll take that on board.',
        usage: 'Use it to accept the feedback and show you will act on it.',
        translation: { fr: 'C\'est logique. Je vais en tenir compte.', es: 'Tiene sentido. Lo tendré en cuenta.' },
      },
      {
        phrase: 'I see your point, but I\'m wondering if...',
        usage: 'Use it to disagree politely and offer another view.',
        translation: { fr: 'Je comprends ton point de vue, mais je me demande si...', es: 'Entiendo lo que dices, pero me pregunto si...' },
      },
      {
        phrase: 'Would you mind having another look once I\'ve updated it?',
        usage: 'Use it to ask for a follow-up review after you make changes.',
        translation: {
          fr: 'Ça t\'ennuierait de rejeter un œil une fois que je l\'aurai mis à jour ?',
          es: '¿Te importaría volver a echarle un vistazo cuando lo haya actualizado?',
        },
      },
    ],
    dialogue: {
      context: 'A short call after a code review; Lucía explains her comments to Kenji.',
      lines: [
        {
          speaker: 'Lucía',
          text: 'Overall, the PR looks good, but the error handling is a bit too generic. You catch every exception and just log "Something went wrong".',
          translation: {
            fr: 'Dans l\'ensemble, la PR est bien, mais la gestion des erreurs est un peu trop générique. Tu attrapes toutes les exceptions et tu logues juste « Something went wrong ».',
            es: 'En general, la PR está bien, pero la gestión de errores es un poco demasiado genérica. Capturas todas las excepciones y solo registras «Something went wrong».',
          },
        },
        {
          speaker: 'Kenji',
          text: 'Thanks for pointing that out. Could you show me an example of what you mean?',
          translation: {
            fr: 'Merci de me l\'avoir signalé. Tu pourrais me montrer un exemple de ce que tu veux dire ?',
            es: 'Gracias por señalarlo. ¿Me puedes enseñar un ejemplo de lo que quieres decir?',
          },
        },
        {
          speaker: 'Lucía',
          text: 'Sure. In the payment service, if the bank API times out, we lose the original exception and the stack trace. Debugging that in production would be painful.',
          translation: {
            fr: 'Bien sûr. Dans le service de paiement, si l\'API de la banque expire, on perd l\'exception d\'origine et la stack trace. Déboguer ça en production serait pénible.',
            es: 'Claro. En el servicio de pagos, si la API del banco da timeout, perdemos la excepción original y el stack trace. Depurar eso en producción sería un dolor de cabeza.',
          },
        },
        {
          speaker: 'Kenji',
          text: 'That makes sense. I\'ll take that on board. Should I catch the timeout separately?',
          translation: {
            fr: 'C\'est logique. Je vais en tenir compte. Je devrais attraper le timeout séparément ?',
            es: 'Tiene sentido. Lo tendré en cuenta. ¿Debería capturar el timeout por separado?',
          },
        },
        {
          speaker: 'Lucía',
          text: 'Yes, and keep the original exception as the cause when you rethrow it.',
          translation: {
            fr: 'Oui, et garde l\'exception d\'origine comme cause quand tu la relances.',
            es: 'Sí, y conserva la excepción original como causa cuando la vuelvas a lanzar.',
          },
        },
        {
          speaker: 'Kenji',
          text: 'Okay. You also suggested adding retries everywhere. I see your point, but I\'m wondering if retrying payments could charge a customer twice.',
          translation: {
            fr: 'D\'accord. Tu as aussi suggéré d\'ajouter des retries partout. Je comprends ton point de vue, mais je me demande si relancer les paiements ne risque pas de débiter un client deux fois.',
            es: 'Vale. También sugeriste añadir reintentos en todas partes. Entiendo lo que dices, pero me pregunto si reintentar los pagos podría cobrar dos veces a un cliente.',
          },
        },
        {
          speaker: 'Lucía',
          text: 'Good catch. Only retry if the request uses an idempotency key. Otherwise, leave it out.',
          translation: {
            fr: 'Bien vu. Ne fais des retries que si la requête utilise une clé d\'idempotence. Sinon, laisse tomber.',
            es: 'Bien visto. Reintenta solo si la petición usa una clave de idempotencia. Si no, déjalo.',
          },
        },
        {
          speaker: 'Kenji',
          text: 'Great, I\'ll update it this afternoon. Would you mind having another look once I\'ve updated it?',
          translation: {
            fr: 'Parfait, je la mets à jour cet après-midi. Ça t\'ennuierait de rejeter un œil une fois que je l\'aurai mise à jour ?',
            es: 'Genial, la actualizo esta tarde. ¿Te importaría volver a echarle un vistazo cuando la haya actualizado?',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'wp-10-q1',
        type: 'choice',
        prompt: 'A reviewer says your function is too long. Which reply is the most professional?',
        options: [
          'It works, so it\'s fine.',
          'Thanks for pointing that out. Which part would you extract first?',
          'Your code is longer than mine.',
          'OK.',
        ],
        correctIndex: 1,
        explanation:
          'It thanks the reviewer and asks a follow-up question to understand the feedback better.',
      },
      {
        id: 'wp-10-q2',
        type: 'fill',
        prompt: 'That makes sense. I\'ll take that on ___.',
        options: ['table', 'deck', 'board', 'track'],
        correctIndex: 2,
        explanation:
          '"Take something on board" is a fixed expression meaning to accept advice and consider it.',
      },
      {
        id: 'wp-10-q3',
        type: 'choice',
        prompt: 'You disagree with part of the feedback. How can you push back politely?',
        options: [
          'You\'re wrong about this.',
          'I\'ll just ignore that comment.',
          'I see your point, but I\'m wondering if this could cause duplicate payments.',
        ],
        correctIndex: 2,
        explanation:
          '"I see your point, but I\'m wondering if..." acknowledges the other view and raises a concern respectfully.',
      },
    ],
  },
];
