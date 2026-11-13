import type { Lesson } from '../types';

export const workplaceB: Lesson[] = [
  // ---------------------------------------------------------------------------
  // wp-11 — Deadlines and scope
  // ---------------------------------------------------------------------------
  {
    id: 'wp-11',
    moduleId: 'workplace',
    topic: 'communication',
    title: 'Discussing deadlines and negotiating scope',
    titleTranslation: {
      fr: 'Discuter des délais et négocier le périmètre',
      es: 'Hablar de plazos y negociar el alcance',
    },
    level: 'advanced',
    premium: true,
    estimatedMinutes: 10,
    roles: ['any'],
    objective:
      'Push back on an unrealistic deadline diplomatically and propose trade-offs between scope, time and quality.',
    objectiveTranslation: {
      fr: 'Contester un délai irréaliste avec diplomatie et proposer des compromis entre périmètre, délai et qualité.',
      es: 'Cuestionar un plazo poco realista con diplomacia y proponer compromisos entre alcance, tiempo y calidad.',
    },
    situation:
      'Your product manager wants a new checkout feature shipped in two weeks, but your estimate is closer to four. You need to explain the risk and negotiate what can realistically be delivered.',
    situationTranslation: {
      fr: 'Votre product manager veut livrer une nouvelle fonctionnalité de paiement en deux semaines, mais votre estimation est plutôt de quatre. Vous devez expliquer le risque et négocier ce qui peut être livré de façon réaliste.',
      es: 'Tu product manager quiere lanzar una nueva funcionalidad de pago en dos semanas, pero tu estimación se acerca más a cuatro. Tienes que explicar el riesgo y negociar lo que se puede entregar de forma realista.',
    },
    vocabulary: [
      {
        term: 'scope creep',
        definition:
          'The gradual, uncontrolled growth of a project as new requirements are added after work has started.',
        translation: { fr: 'dérive du périmètre', es: 'desviación del alcance' },
      },
      {
        term: 'trade-off',
        definition:
          'A situation where you accept less of one thing in order to get more of another.',
        translation: { fr: 'compromis', es: 'compromiso / concesión' },
      },
      {
        term: 'MVP (minimum viable product)',
        definition:
          'The smallest version of a feature or product that still delivers real value to users.',
        translation: {
          fr: 'MVP (produit minimum viable)',
          es: 'MVP (producto mínimo viable)',
        },
      },
      {
        term: 'buffer',
        definition:
          'Extra time added to a plan to absorb unexpected problems or delays.',
        translation: { fr: 'marge de sécurité', es: 'margen de seguridad' },
      },
      {
        term: 'descope',
        definition:
          'To remove features or requirements from a planned piece of work so it can be delivered on time.',
        translation: {
          fr: 'réduire le périmètre',
          es: 'reducir el alcance',
        },
      },
    ],
    expressions: [
      {
        phrase: "I want to be upfront about the timeline.",
        usage:
          'Use it to signal early and honestly that a deadline is at risk, before you explain why.',
        translation: {
          fr: 'Je préfère être transparent sur le calendrier.',
          es: 'Quiero ser franco con el calendario.',
        },
      },
      {
        phrase: "Realistically, we're looking at four weeks rather than two.",
        usage:
          'Use it to give a more honest estimate without sounding negative or defensive.',
        translation: {
          fr: 'Pour être réaliste, il faut plutôt compter quatre semaines que deux.',
          es: 'Siendo realistas, hablamos de cuatro semanas en lugar de dos.',
        },
      },
      {
        phrase: 'If the date is fixed, then something else has to give.',
        usage:
          'Use it to explain that a fixed deadline requires a compromise on scope or quality.',
        translation: {
          fr: 'Si la date est figée, il faut lâcher du lest ailleurs.',
          es: 'Si la fecha es fija, tendremos que ceder en otra cosa.',
        },
      },
      {
        phrase: 'What if we ship a first version without X and follow up with it next sprint?',
        usage:
          'Use it to propose a phased delivery as a constructive alternative.',
        translation: {
          fr: 'Et si on livrait une première version sans X et qu\'on l\'ajoutait au sprint suivant ?',
          es: '¿Y si lanzamos una primera versión sin X y la añadimos en el siguiente sprint?',
        },
      },
      {
        phrase: "I'd rather flag this now than miss the date later.",
        usage:
          'Use it to justify raising a concern early and show that you are being responsible.',
        translation: {
          fr: 'Je préfère le signaler maintenant plutôt que de rater l\'échéance plus tard.',
          es: 'Prefiero avisarlo ahora que no llegar a la fecha más adelante.',
        },
      },
    ],
    dialogue: {
      context:
        'Amara, a backend developer, meets Tom, the product manager, to discuss the new checkout deadline.',
      lines: [
        {
          speaker: 'Tom',
          text: 'So, can we get the new checkout live by the end of the month? Marketing has a campaign planned.',
          translation: {
            fr: 'Alors, on peut mettre le nouveau checkout en production d\'ici la fin du mois ? Le marketing a prévu une campagne.',
            es: 'Entonces, ¿podemos tener el nuevo checkout en producción a final de mes? Marketing tiene una campaña planeada.',
          },
        },
        {
          speaker: 'Amara',
          text: "I want to be upfront about the timeline. Realistically, we're looking at four weeks, not two. The payment provider integration alone is a big unknown.",
          translation: {
            fr: 'Je préfère être transparente sur le calendrier. Pour être réaliste, il faut compter quatre semaines, pas deux. Rien que l\'intégration du prestataire de paiement est une grosse inconnue.',
            es: 'Quiero ser franca con el calendario. Siendo realistas, hablamos de cuatro semanas, no dos. Solo la integración con el proveedor de pagos ya es una gran incógnita.',
          },
        },
        {
          speaker: 'Tom',
          text: "Hmm. The campaign date isn't really negotiable.",
          translation: {
            fr: 'Hum. La date de la campagne n\'est pas vraiment négociable.',
            es: 'Mmm. La fecha de la campaña no es muy negociable.',
          },
        },
        {
          speaker: 'Amara',
          text: 'Understood. If the date is fixed, then something else has to give. What if we ship card payments first and add PayPal and saved cards next sprint?',
          translation: {
            fr: 'Compris. Si la date est figée, il faut lâcher du lest ailleurs. Et si on livrait d\'abord le paiement par carte, et qu\'on ajoutait PayPal et les cartes enregistrées au sprint suivant ?',
            es: 'Entendido. Si la fecha es fija, tendremos que ceder en otra cosa. ¿Y si lanzamos primero el pago con tarjeta y añadimos PayPal y las tarjetas guardadas en el siguiente sprint?',
          },
        },
        {
          speaker: 'Tom',
          text: 'That could work. Would card payments alone be solid enough for the campaign traffic?',
          translation: {
            fr: 'Ça pourrait marcher. Le paiement par carte seul serait-il assez solide pour le trafic de la campagne ?',
            es: 'Podría funcionar. ¿Solo el pago con tarjeta aguantaría el tráfico de la campaña?',
          },
        },
        {
          speaker: 'Amara',
          text: "Yes, as long as we keep a few days of buffer for load testing. I'd rather not cut that, because a failed payment is much worse than a missing option.",
          translation: {
            fr: 'Oui, à condition de garder quelques jours de marge pour les tests de charge. Je préfère ne pas rogner là-dessus, parce qu\'un paiement qui échoue est bien pire qu\'une option manquante.',
            es: 'Sí, siempre que dejemos unos días de margen para las pruebas de carga. Prefiero no recortar eso, porque un pago fallido es mucho peor que una opción que falta.',
          },
        },
        {
          speaker: 'Tom',
          text: "Fair point. Let's go with that. Can you write up the reduced scope so I can share it with marketing?",
          translation: {
            fr: 'C\'est juste. Partons là-dessus. Tu peux rédiger le périmètre réduit pour que je le partage avec le marketing ?',
            es: 'Tienes razón. Vamos con eso. ¿Puedes redactar el alcance reducido para que se lo pase a marketing?',
          },
        },
        {
          speaker: 'Amara',
          text: "Sure, I'll send it this afternoon. And thanks for being flexible. I'd rather flag this now than miss the date later.",
          translation: {
            fr: 'Bien sûr, je te l\'envoie cet après-midi. Et merci pour ta flexibilité. Je préfère le signaler maintenant plutôt que de rater l\'échéance plus tard.',
            es: 'Claro, te lo envío esta tarde. Y gracias por ser flexible. Prefiero avisarlo ahora que no llegar a la fecha más adelante.',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'wp-11-q1',
        type: 'choice',
        prompt:
          'Your manager insists on a fixed deadline that is too short. Which reply is the most constructive?',
        options: [
          "That's impossible, we can't do it.",
          'Fine, we will work weekends.',
          'If the date is fixed, could we descope the reporting part and deliver it next sprint?',
          'Nobody told me about this deadline.',
        ],
        correctIndex: 2,
        explanation:
          'It accepts the constraint and proposes a concrete trade-off on scope, which keeps the discussion moving.',
      },
      {
        id: 'wp-11-q2',
        type: 'fill',
        prompt: 'We keep adding small requests after the sprint starts. This is classic scope ___.',
        options: ['creep', 'crawl', 'drift off', 'leak'],
        correctIndex: 0,
        explanation:
          '"Scope creep" is the standard term for requirements gradually growing after work has begun.',
      },
      {
        id: 'wp-11-q3',
        type: 'choice',
        prompt: 'What does "I\'d rather flag this now than miss the date later" communicate?',
        options: [
          'The speaker is refusing to do the work.',
          'The speaker is raising a risk early to act responsibly.',
          'The speaker has already missed the deadline.',
        ],
        correctIndex: 1,
        explanation:
          'To "flag" something means to raise it as a concern; saying it early shows responsibility, not refusal.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // wp-12 — One-on-ones
  // ---------------------------------------------------------------------------
  {
    id: 'wp-12',
    moduleId: 'workplace',
    topic: 'management',
    title: 'One-on-one meetings with your manager',
    titleTranslation: {
      fr: 'Les entretiens individuels avec votre manager',
      es: 'Reuniones individuales con tu manager',
    },
    level: 'intermediate',
    premium: true,
    estimatedMinutes: 8,
    roles: ['any'],
    objective:
      'Use your one-on-one to share progress, raise concerns, ask for feedback and talk about your career goals.',
    objectiveTranslation: {
      fr: 'Utiliser votre entretien individuel pour partager vos avancées, soulever des préoccupations, demander du feedback et parler de vos objectifs de carrière.',
      es: 'Aprovechar tu reunión individual para compartir avances, plantear inquietudes, pedir feedback y hablar de tus objetivos profesionales.',
    },
    situation:
      'You have a 30-minute one-on-one with your team lead every two weeks. This time you want to mention that code reviews are slowing you down and that you would like to grow towards a senior role.',
    situationTranslation: {
      fr: 'Vous avez un one-on-one de 30 minutes avec votre team lead toutes les deux semaines. Cette fois, vous voulez mentionner que les code reviews vous ralentissent et que vous aimeriez évoluer vers un poste senior.',
      es: 'Tienes una reunión one-on-one de 30 minutos con tu team lead cada dos semanas. Esta vez quieres comentar que las code reviews te están frenando y que te gustaría crecer hacia un puesto senior.',
    },
    vocabulary: [
      {
        term: 'one-on-one (1:1)',
        definition:
          'A regular private meeting between an employee and their manager.',
        translation: { fr: 'entretien individuel (one-on-one)', es: 'reunión individual (one-on-one)' },
      },
      {
        term: 'blocker',
        definition:
          'Something that stops you from making progress on your work.',
        translation: { fr: 'point bloquant', es: 'bloqueo / impedimento' },
      },
      {
        term: 'career path',
        definition:
          'The sequence of roles and skills you plan to develop over time in your job.',
        translation: { fr: 'parcours de carrière', es: 'trayectoria profesional' },
      },
      {
        term: 'stretch goal',
        definition:
          'An ambitious objective that is slightly beyond your current abilities and helps you grow.',
        translation: { fr: 'objectif ambitieux', es: 'objetivo ambicioso' },
      },
      {
        term: 'constructive feedback',
        definition:
          'Specific, helpful comments about what someone could do better.',
        translation: { fr: 'feedback constructif', es: 'feedback constructivo' },
      },
    ],
    expressions: [
      {
        phrase: "There's something I'd like to bring up.",
        usage:
          'Use it to introduce a topic or concern you want to discuss, in a calm way.',
        translation: {
          fr: 'Il y a un sujet que j\'aimerais aborder.',
          es: 'Hay algo que me gustaría comentar.',
        },
      },
      {
        phrase: 'Is there anything I could be doing differently?',
        usage:
          'Use it to ask your manager for honest, constructive feedback.',
        translation: {
          fr: 'Y a-t-il quelque chose que je pourrais faire différemment ?',
          es: '¿Hay algo que podría hacer de otra manera?',
        },
      },
      {
        phrase: "I'd like to take on more responsibility.",
        usage:
          'Use it to show ambition and open a conversation about growth.',
        translation: {
          fr: 'J\'aimerais prendre plus de responsabilités.',
          es: 'Me gustaría asumir más responsabilidades.',
        },
      },
      {
        phrase: 'What would I need to show to move to the next level?',
        usage:
          'Use it to ask for clear, concrete criteria for a promotion.',
        translation: {
          fr: 'Qu\'est-ce que je devrais démontrer pour passer au niveau supérieur ?',
          es: '¿Qué tendría que demostrar para pasar al siguiente nivel?',
        },
      },
      {
        phrase: 'Can we follow up on this next time?',
        usage:
          'Use it to keep a topic open and make sure it is not forgotten.',
        translation: {
          fr: 'On peut en reparler la prochaine fois ?',
          es: '¿Podemos retomarlo la próxima vez?',
        },
      },
    ],
    dialogue: {
      context:
        'Kenji, a frontend developer, is in his regular one-on-one with his team lead, Priya.',
      lines: [
        {
          speaker: 'Priya',
          text: "Hi Kenji. How are things going? Anything on your mind this week?",
          translation: {
            fr: 'Salut Kenji. Comment ça va ? Quelque chose te préoccupe cette semaine ?',
            es: 'Hola, Kenji. ¿Cómo va todo? ¿Algo que te ronde la cabeza esta semana?',
          },
        },
        {
          speaker: 'Kenji',
          text: "Things are good overall. The search page is almost done. But there's something I'd like to bring up: my pull requests often wait two or three days for a review.",
          translation: {
            fr: 'Dans l\'ensemble, ça va bien. La page de recherche est presque terminée. Mais il y a un sujet que j\'aimerais aborder : mes pull requests attendent souvent deux ou trois jours avant d\'être relues.',
            es: 'En general, bien. La página de búsqueda está casi terminada. Pero hay algo que me gustaría comentar: mis pull requests suelen esperar dos o tres días a que alguien las revise.',
          },
        },
        {
          speaker: 'Priya',
          text: "Thanks for telling me. That's a real blocker. I'll raise it at the retro and suggest a review rota.",
          translation: {
            fr: 'Merci de me le dire. C\'est un vrai point bloquant. J\'en parlerai à la rétro et je proposerai un roulement pour les reviews.',
            es: 'Gracias por decírmelo. Es un bloqueo real. Lo plantearé en la retro y propondré un turno rotativo para las reviews.',
          },
        },
        {
          speaker: 'Kenji',
          text: "Great, thanks. Also, I'd like to take on more responsibility. What would I need to show to move to a senior role?",
          translation: {
            fr: 'Super, merci. Autre chose : j\'aimerais prendre plus de responsabilités. Qu\'est-ce que je devrais démontrer pour passer à un poste senior ?',
            es: 'Genial, gracias. Además, me gustaría asumir más responsabilidades. ¿Qué tendría que demostrar para pasar a un puesto senior?',
          },
        },
        {
          speaker: 'Priya',
          text: "Good question. Mainly technical ownership: leading a feature from design to release, and mentoring others. How about leading the design for the new filters?",
          translation: {
            fr: 'Bonne question. Surtout la responsabilité technique : porter une fonctionnalité de la conception à la mise en production, et accompagner les autres. Et si tu pilotais la conception des nouveaux filtres ?',
            es: 'Buena pregunta. Sobre todo, responsabilidad técnica: liderar una funcionalidad desde el diseño hasta la entrega, y mentorizar a otros. ¿Qué tal si lideras el diseño de los nuevos filtros?',
          },
        },
        {
          speaker: 'Kenji',
          text: 'I would love that. Is there anything I could be doing differently right now?',
          translation: {
            fr: 'Avec plaisir. Y a-t-il quelque chose que je pourrais faire différemment dès maintenant ?',
            es: 'Me encantaría. ¿Hay algo que podría hacer de otra manera desde ya?',
          },
        },
        {
          speaker: 'Priya',
          text: 'One thing: share your progress earlier. Sometimes I only hear about problems at the end of the sprint.',
          translation: {
            fr: 'Une chose : partage ton avancement plus tôt. Parfois, je n\'apprends les problèmes qu\'à la fin du sprint.',
            es: 'Una cosa: comparte tus avances antes. A veces solo me entero de los problemas al final del sprint.',
          },
        },
        {
          speaker: 'Kenji',
          text: "That's fair, I'll work on it. Can we follow up on the senior role next time?",
          translation: {
            fr: 'C\'est juste, je vais y travailler. On peut reparler du poste senior la prochaine fois ?',
            es: 'Es justo, trabajaré en ello. ¿Podemos retomar lo del puesto senior la próxima vez?',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'wp-12-q1',
        type: 'fill',
        prompt: "There's something I'd like to ___ up about our release process.",
        options: ['take', 'bring', 'make', 'give'],
        correctIndex: 1,
        explanation:
          '"Bring something up" means to introduce a topic for discussion.',
      },
      {
        id: 'wp-12-q2',
        type: 'choice',
        prompt: 'Which question best asks your manager for clear promotion criteria?',
        options: [
          'Why am I not senior yet?',
          'Can I have a raise?',
          'Is my work okay?',
          'What would I need to show to move to the next level?',
        ],
        correctIndex: 3,
        explanation:
          'It is specific and forward-looking, so the manager can answer with concrete expectations.',
      },
      {
        id: 'wp-12-q3',
        type: 'choice',
        prompt: 'In a one-on-one, a "blocker" is…',
        options: [
          'something that stops you from progressing',
          'a colleague who disagrees with you',
          'a task you finished early',
        ],
        correctIndex: 0,
        explanation:
          'A blocker is any obstacle that prevents your work from moving forward.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // wp-13 — Client requirements call
  // ---------------------------------------------------------------------------
  {
    id: 'wp-13',
    moduleId: 'workplace',
    topic: 'clients',
    title: 'Talking to clients: a requirements call',
    titleTranslation: {
      fr: 'Parler aux clients : un appel de recueil des besoins',
      es: 'Hablar con clientes: una llamada de requisitos',
    },
    level: 'advanced',
    premium: true,
    estimatedMinutes: 11,
    roles: ['any', 'fullstack', 'architect'],
    objective:
      'Ask open and clarifying questions, uncover the real business need, and confirm requirements without technical jargon.',
    objectiveTranslation: {
      fr: 'Poser des questions ouvertes et de clarification, découvrir le vrai besoin métier et confirmer les exigences sans jargon technique.',
      es: 'Hacer preguntas abiertas y aclaratorias, descubrir la necesidad real del negocio y confirmar los requisitos sin jerga técnica.',
    },
    situation:
      'A client wants "an export button" in their dashboard. You are on a call to understand what they actually need before your team commits to a solution.',
    situationTranslation: {
      fr: 'Un client veut « un bouton d\'export » dans son tableau de bord. Vous êtes en appel pour comprendre ce dont il a réellement besoin avant que votre équipe ne s\'engage sur une solution.',
      es: 'Un cliente quiere «un botón de exportar» en su panel. Estás en una llamada para entender lo que realmente necesita antes de que tu equipo se comprometa con una solución.',
    },
    vocabulary: [
      {
        term: 'stakeholder',
        definition:
          'Any person or group that is affected by a project or has an interest in its outcome.',
        translation: { fr: 'partie prenante', es: 'parte interesada' },
      },
      {
        term: 'use case',
        definition:
          'A description of how a specific user interacts with a system to achieve a goal.',
        translation: { fr: 'cas d\'usage', es: 'caso de uso' },
      },
      {
        term: 'acceptance criteria',
        definition:
          'The conditions a feature must meet to be considered complete and accepted by the client.',
        translation: { fr: 'critères d\'acceptation', es: 'criterios de aceptación' },
      },
      {
        term: 'pain point',
        definition:
          'A specific problem or frustration that users experience in their current workflow.',
        translation: { fr: 'point de friction', es: 'punto de dolor / problema clave' },
      },
      {
        term: 'out of scope',
        definition:
          'Not included in the work that has been agreed for a project or release.',
        translation: { fr: 'hors périmètre', es: 'fuera del alcance' },
      },
    ],
    expressions: [
      {
        phrase: 'Could you walk me through how you do this today?',
        usage:
          'Use it to understand the current workflow before suggesting any solution.',
        translation: {
          fr: 'Pourriez-vous me montrer comment vous procédez aujourd\'hui ?',
          es: '¿Podría explicarme paso a paso cómo lo hacen hoy en día?',
        },
      },
      {
        phrase: "What problem are you ultimately trying to solve?",
        usage:
          'Use it to move from the requested feature to the underlying business need.',
        translation: {
          fr: 'Au fond, quel problème cherchez-vous à résoudre ?',
          es: 'En el fondo, ¿qué problema intentan resolver?',
        },
      },
      {
        phrase: 'Just so I understand correctly, you mean…',
        usage:
          'Use it to rephrase what the client said and check that you understood.',
        translation: {
          fr: 'Juste pour être sûr de bien comprendre, vous voulez dire…',
          es: 'Solo para asegurarme de que lo entiendo bien, se refiere a…',
        },
      },
      {
        phrase: 'How would you know that this is working well?',
        usage:
          'Use it to define success and turn it into acceptance criteria.',
        translation: {
          fr: 'Comment sauriez-vous que cela fonctionne bien ?',
          es: '¿Cómo sabrían que esto funciona bien?',
        },
      },
      {
        phrase: "Let me summarize what we've agreed, and I'll send it in writing.",
        usage:
          'Use it at the end of a call to confirm decisions and avoid misunderstandings later.',
        translation: {
          fr: 'Je résume ce que nous avons convenu, et je vous l\'enverrai par écrit.',
          es: 'Déjeme resumir lo que hemos acordado, y se lo enviaré por escrito.',
        },
      },
    ],
    dialogue: {
      context:
        'Lucía, a full-stack developer, is on a video call with Mr. Okafor, an operations manager at a client company.',
      lines: [
        {
          speaker: 'Mr. Okafor',
          text: 'We basically need an export button on the orders dashboard. Excel, ideally.',
          translation: {
            fr: 'En gros, il nous faut un bouton d\'export sur le tableau de bord des commandes. En Excel, idéalement.',
            es: 'Básicamente necesitamos un botón de exportar en el panel de pedidos. A Excel, idealmente.',
          },
        },
        {
          speaker: 'Lucía',
          text: "Sure. Before we decide on the format, could you walk me through what you do with the data once it's exported?",
          translation: {
            fr: 'Bien sûr. Avant de choisir le format, pourriez-vous me montrer ce que vous faites des données une fois exportées ?',
            es: 'Claro. Antes de decidir el formato, ¿podría explicarme qué hacen con los datos una vez exportados?',
          },
        },
        {
          speaker: 'Mr. Okafor',
          text: 'Every Monday, my assistant copies the numbers into a spreadsheet and builds a chart of late deliveries for the weekly meeting.',
          translation: {
            fr: 'Chaque lundi, mon assistante copie les chiffres dans un tableur et fait un graphique des livraisons en retard pour la réunion hebdomadaire.',
            es: 'Cada lunes, mi asistente copia los números en una hoja de cálculo y hace un gráfico de las entregas con retraso para la reunión semanal.',
          },
        },
        {
          speaker: 'Lucía',
          text: 'I see. So what problem are you ultimately trying to solve: getting the raw data, or seeing late deliveries at a glance?',
          translation: {
            fr: 'Je vois. Alors, au fond, quel problème cherchez-vous à résoudre : obtenir les données brutes, ou voir les retards de livraison d\'un coup d\'œil ?',
            es: 'Entiendo. Entonces, en el fondo, ¿qué problema intentan resolver: obtener los datos en bruto o ver las entregas con retraso de un vistazo?',
          },
        },
        {
          speaker: 'Mr. Okafor',
          text: "Honestly, the second one. The manual work takes about two hours, and mistakes happen.",
          translation: {
            fr: 'Honnêtement, la deuxième option. Le travail manuel prend environ deux heures, et il y a des erreurs.',
            es: 'Sinceramente, lo segundo. El trabajo manual lleva unas dos horas y se cometen errores.',
          },
        },
        {
          speaker: 'Lucía',
          text: 'Just so I understand correctly, a weekly late-deliveries report, generated automatically, would remove that pain point?',
          translation: {
            fr: 'Juste pour être sûre de bien comprendre : un rapport hebdomadaire des retards de livraison, généré automatiquement, éliminerait ce point de friction ?',
            es: 'Solo para asegurarme de que lo entiendo bien: ¿un informe semanal de entregas con retraso, generado automáticamente, resolvería ese problema?',
          },
        },
        {
          speaker: 'Mr. Okafor',
          text: "Exactly. But we'd still like a CSV export for audits.",
          translation: {
            fr: 'Exactement. Mais on aimerait quand même un export CSV pour les audits.',
            es: 'Exacto. Pero aun así nos gustaría una exportación CSV para las auditorías.',
          },
        },
        {
          speaker: 'Lucía',
          text: "That makes sense. Let me summarize what we've agreed, and I'll send it in writing today, including what's out of scope for the first release.",
          translation: {
            fr: 'C\'est logique. Je résume ce que nous avons convenu, et je vous l\'envoie par écrit aujourd\'hui, y compris ce qui est hors périmètre pour la première version.',
            es: 'Tiene sentido. Déjeme resumir lo que hemos acordado y se lo envío por escrito hoy, incluido lo que queda fuera del alcance de la primera versión.',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'wp-13-q1',
        type: 'choice',
        prompt: 'A client asks for a specific feature. What is the best first step?',
        options: [
          'Start coding it immediately.',
          'Tell them it is a bad idea.',
          'Ask about the problem behind the request and their current workflow.',
          'Send them a technical architecture diagram.',
        ],
        correctIndex: 2,
        explanation:
          'Understanding the real need first often leads to a better and cheaper solution than the one requested.',
      },
      {
        id: 'wp-13-q2',
        type: 'fill',
        prompt: 'Multi-language support is ___ of scope for the first release.',
        options: ['away', 'off', 'beyond', 'out'],
        correctIndex: 3,
        explanation:
          '"Out of scope" is the fixed expression for something not included in the agreed work.',
      },
      {
        id: 'wp-13-q3',
        type: 'choice',
        prompt: 'Which question helps you define acceptance criteria?',
        options: [
          'How would you know that this is working well?',
          'Which database do you prefer?',
          'Can you pay more for this?',
        ],
        correctIndex: 0,
        explanation:
          'Asking how the client will measure success turns their expectations into testable acceptance criteria.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // wp-14 — Chat messages
  // ---------------------------------------------------------------------------
  {
    id: 'wp-14',
    moduleId: 'workplace',
    topic: 'writing',
    title: 'Writing clear chat messages (Slack / Teams)',
    titleTranslation: {
      fr: 'Écrire des messages clairs sur le chat (Slack / Teams)',
      es: 'Escribir mensajes claros en el chat (Slack / Teams)',
    },
    level: 'beginner',
    premium: false,
    estimatedMinutes: 6,
    roles: ['any', 'student'],
    objective:
      'Write short, clear chat messages that give context, ask one clear question and respect your colleagues\' time.',
    objectiveTranslation: {
      fr: 'Écrire des messages courts et clairs qui donnent du contexte, posent une seule question précise et respectent le temps de vos collègues.',
      es: 'Escribir mensajes cortos y claros que den contexto, hagan una sola pregunta concreta y respeten el tiempo de tus compañeros.',
    },
    situation:
      'You need help from a colleague in another team. Instead of writing "Hi" and waiting, you want to send one complete, easy-to-answer message.',
    situationTranslation: {
      fr: 'Vous avez besoin de l\'aide d\'un collègue d\'une autre équipe. Au lieu d\'écrire « Salut » et d\'attendre, vous voulez envoyer un seul message complet et facile à traiter.',
      es: 'Necesitas ayuda de un compañero de otro equipo. En lugar de escribir «Hola» y esperar, quieres enviar un único mensaje completo y fácil de responder.',
    },
    vocabulary: [
      {
        term: 'thread',
        definition:
          'A chain of replies attached to one message, which keeps a conversation organized.',
        translation: { fr: 'fil de discussion', es: 'hilo' },
      },
      {
        term: 'channel',
        definition:
          'A shared chat space for a team or a topic.',
        translation: { fr: 'canal', es: 'canal' },
      },
      {
        term: 'to mention (@someone)',
        definition:
          'To tag a person in a message so they get a notification.',
        translation: { fr: 'mentionner (@quelqu\'un)', es: 'mencionar (@alguien)' },
      },
      {
        term: 'heads-up',
        definition:
          'A short warning or piece of information given in advance.',
        translation: { fr: 'petit avertissement / info', es: 'aviso' },
      },
      {
        term: 'ETA',
        definition:
          'Estimated time of arrival; in chat, when you expect something to be ready.',
        translation: { fr: 'délai estimé', es: 'tiempo estimado' },
      },
    ],
    expressions: [
      {
        phrase: 'Quick question about the login API:',
        usage:
          'Use it to start a message and announce the topic straight away.',
        translation: {
          fr: 'Petite question sur l\'API de login :',
          es: 'Una pregunta rápida sobre la API de login:',
        },
      },
      {
        phrase: 'No rush, whenever you have a minute.',
        usage:
          'Use it to show that your request is not urgent.',
        translation: {
          fr: 'Rien d\'urgent, quand tu as une minute.',
          es: 'Sin prisa, cuando tengas un momento.',
        },
      },
      {
        phrase: 'Just a heads-up: the staging server will be down at 3 p.m.',
        usage:
          'Use it to warn people about something before it happens.',
        translation: {
          fr: 'Pour info : le serveur de staging sera indisponible à 15 h.',
          es: 'Un aviso: el servidor de staging estará caído a las 15:00.',
        },
      },
      {
        phrase: "Let's move this to a thread.",
        usage:
          'Use it to keep a busy channel clean by continuing a discussion in replies.',
        translation: {
          fr: 'Continuons dans un fil.',
          es: 'Sigamos en un hilo.',
        },
      },
      {
        phrase: 'Thanks, that fixed it!',
        usage:
          'Use it to close the conversation and confirm the problem is solved.',
        translation: {
          fr: 'Merci, ça a réglé le problème !',
          es: '¡Gracias, eso lo arregló!',
        },
      },
    ],
    dialogue: {
      context:
        'Marco, a junior developer, sends a message to Amara from the platform team on Slack.',
      lines: [
        {
          speaker: 'Marco',
          text: 'Hi Amara! Quick question about the login API: I get a 401 error on staging, but it works locally. Do I need a new token for staging?',
          translation: {
            fr: 'Salut Amara ! Petite question sur l\'API de login : j\'ai une erreur 401 sur staging, mais ça marche en local. Il me faut un nouveau token pour staging ?',
            es: '¡Hola, Amara! Una pregunta rápida sobre la API de login: me sale un error 401 en staging, pero en local funciona. ¿Necesito un token nuevo para staging?',
          },
        },
        {
          speaker: 'Marco',
          text: 'No rush, whenever you have a minute.',
          translation: {
            fr: 'Rien d\'urgent, quand tu as une minute.',
            es: 'Sin prisa, cuando tengas un momento.',
          },
        },
        {
          speaker: 'Amara',
          text: 'Hi Marco! Yes, staging uses a different auth server. You can get a token from the dev portal.',
          translation: {
            fr: 'Salut Marco ! Oui, staging utilise un autre serveur d\'authentification. Tu peux obtenir un token sur le portail développeur.',
            es: '¡Hola, Marco! Sí, staging usa otro servidor de autenticación. Puedes conseguir un token en el portal de desarrolladores.',
          },
        },
        {
          speaker: 'Marco',
          text: 'Got it. Do I need special access for the portal?',
          translation: {
            fr: 'Compris. Il me faut un accès spécial pour le portail ?',
            es: 'Entendido. ¿Necesito un acceso especial para el portal?',
          },
        },
        {
          speaker: 'Amara',
          text: 'No, your normal account works. Here is the link to the docs page.',
          translation: {
            fr: 'Non, ton compte habituel suffit. Voici le lien vers la page de documentation.',
            es: 'No, tu cuenta normal funciona. Aquí tienes el enlace a la página de documentación.',
          },
        },
        {
          speaker: 'Marco',
          text: 'Thanks, that fixed it! I will add a note to our README.',
          translation: {
            fr: 'Merci, ça a réglé le problème ! Je vais ajouter une note dans notre README.',
            es: '¡Gracias, eso lo arregló! Voy a añadir una nota en nuestro README.',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'wp-14-q1',
        type: 'choice',
        prompt: 'Which chat message is the clearest?',
        options: [
          'Hi',
          'Hi, are you there?',
          'Hi! The build fails on main with a missing env variable. Do you know which one we need?',
        ],
        correctIndex: 2,
        explanation:
          'It gives context and a clear question in one message, so the colleague can answer right away.',
      },
      {
        id: 'wp-14-q2',
        type: 'fill',
        prompt: 'Just a ___: I will deploy the new version at 5 p.m.',
        options: ['heads-down', 'heads-up', 'head-start', 'headline'],
        correctIndex: 1,
        explanation:
          'A "heads-up" is a short advance warning or piece of information.',
      },
      {
        id: 'wp-14-q3',
        type: 'choice',
        prompt: 'What does "No rush" tell the other person?',
        options: [
          'Your request is not urgent.',
          'You are angry.',
          'You need the answer immediately.',
          'You are leaving the company.',
        ],
        correctIndex: 0,
        explanation:
          '"No rush" means the person can answer when it is convenient for them.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // wp-15 — Emails to stakeholders
  // ---------------------------------------------------------------------------
  {
    id: 'wp-15',
    moduleId: 'workplace',
    topic: 'writing',
    title: 'Writing professional emails to stakeholders',
    titleTranslation: {
      fr: 'Rédiger des e-mails professionnels aux parties prenantes',
      es: 'Escribir correos profesionales a las partes interesadas',
    },
    level: 'intermediate',
    premium: true,
    estimatedMinutes: 9,
    roles: ['any'],
    objective:
      'Write a structured status email with a clear subject line, a short summary, the key points and a call to action.',
    objectiveTranslation: {
      fr: 'Rédiger un e-mail de suivi structuré avec un objet clair, un bref résumé, les points clés et une demande d\'action.',
      es: 'Redactar un correo de estado estructurado con un asunto claro, un breve resumen, los puntos clave y una llamada a la acción.',
    },
    situation:
      'A production incident delayed a release. You need to email non-technical stakeholders to explain the impact, the new date and what you need from them.',
    situationTranslation: {
      fr: 'Un incident en production a retardé une mise en production. Vous devez écrire aux parties prenantes non techniques pour expliquer l\'impact, la nouvelle date et ce dont vous avez besoin de leur part.',
      es: 'Un incidente en producción ha retrasado una entrega. Tienes que escribir a las partes interesadas no técnicas para explicar el impacto, la nueva fecha y lo que necesitas de ellas.',
    },
    vocabulary: [
      {
        term: 'subject line',
        definition:
          'The short title of an email that tells the reader what it is about.',
        translation: { fr: 'objet (de l\'e-mail)', es: 'asunto (del correo)' },
      },
      {
        term: 'TL;DR',
        definition:
          '"Too long; didn\'t read": a one- or two-line summary at the top of a message.',
        translation: { fr: 'TL;DR (résumé en bref)', es: 'TL;DR (resumen breve)' },
      },
      {
        term: 'call to action',
        definition:
          'A clear request telling the reader exactly what you need them to do.',
        translation: { fr: 'demande d\'action', es: 'llamada a la acción' },
      },
      {
        term: 'to cc',
        definition:
          'To send a copy of an email to someone who should be informed but does not need to act.',
        translation: { fr: 'mettre en copie', es: 'poner en copia' },
      },
      {
        term: 'root cause',
        definition:
          'The fundamental reason a problem happened, not just its visible symptoms.',
        translation: { fr: 'cause racine', es: 'causa raíz' },
      },
    ],
    expressions: [
      {
        phrase: "I'm writing to update you on…",
        usage:
          'Use it to open a status email and state its purpose immediately.',
        translation: {
          fr: 'Je vous écris pour faire le point sur…',
          es: 'Les escribo para ponerles al día sobre…',
        },
      },
      {
        phrase: 'In short, the release will move to Thursday.',
        usage:
          'Use it to give the main message early, before the details.',
        translation: {
          fr: 'En bref, la mise en production est reportée à jeudi.',
          es: 'En resumen, la entrega se traslada al jueves.',
        },
      },
      {
        phrase: 'Could you please confirm by end of day tomorrow?',
        usage:
          'Use it as a polite call to action with a clear deadline.',
        translation: {
          fr: 'Pourriez-vous confirmer d\'ici demain en fin de journée ?',
          es: '¿Podrían confirmarlo antes de que acabe el día de mañana?',
        },
      },
      {
        phrase: 'We apologize for the inconvenience.',
        usage:
          'Use it to acknowledge the impact on others in a professional tone.',
        translation: {
          fr: 'Nous vous prions de nous excuser pour la gêne occasionnée.',
          es: 'Disculpen las molestias.',
        },
      },
      {
        phrase: "Please don't hesitate to reach out if you have any questions.",
        usage:
          'Use it as a friendly, professional closing line.',
        translation: {
          fr: 'N\'hésitez pas à me contacter si vous avez des questions.',
          es: 'No duden en ponerse en contacto conmigo si tienen alguna pregunta.',
        },
      },
    ],
    dialogue: {
      context:
        'Priya, a tech lead, asks her colleague Tom to review a draft email to stakeholders before she sends it.',
      lines: [
        {
          speaker: 'Priya',
          text: 'Tom, could you check my email to the sales team about the delay? I want it to be clear for non-technical readers.',
          translation: {
            fr: 'Tom, tu peux relire mon e-mail à l\'équipe commerciale sur le retard ? Je veux qu\'il soit clair pour des lecteurs non techniques.',
            es: 'Tom, ¿puedes revisar mi correo al equipo de ventas sobre el retraso? Quiero que sea claro para lectores no técnicos.',
          },
        },
        {
          speaker: 'Tom',
          text: 'Sure. The subject line just says "Update". I would make it specific, like "Release 3.2 moved to Thursday: action needed".',
          translation: {
            fr: 'Bien sûr. L\'objet dit juste « Mise à jour ». Je le rendrais plus précis, par exemple « Version 3.2 reportée à jeudi : action requise ».',
            es: 'Claro. El asunto solo dice «Actualización». Yo lo haría más concreto, por ejemplo «Versión 3.2 aplazada al jueves: acción necesaria».',
          },
        },
        {
          speaker: 'Priya',
          text: 'Good idea. What about the first paragraph?',
          translation: {
            fr: 'Bonne idée. Et le premier paragraphe ?',
            es: 'Buena idea. ¿Y el primer párrafo?',
          },
        },
        {
          speaker: 'Tom',
          text: 'It starts with the database migration details. Most readers will stop there. Put the TL;DR first: new date, impact, and what you need from them.',
          translation: {
            fr: 'Il commence par les détails de la migration de base de données. La plupart des lecteurs s\'arrêteront là. Mets le TL;DR en premier : nouvelle date, impact et ce que tu attends d\'eux.',
            es: 'Empieza con los detalles de la migración de la base de datos. La mayoría de los lectores se quedará ahí. Pon el TL;DR primero: nueva fecha, impacto y lo que necesitas de ellos.',
          },
        },
        {
          speaker: 'Priya',
          text: 'Right. And I can move the root cause to a short section at the end for anyone curious.',
          translation: {
            fr: 'D\'accord. Et je peux déplacer la cause racine dans une courte section à la fin pour les curieux.',
            es: 'Vale. Y puedo pasar la causa raíz a una sección corta al final para quien tenga curiosidad.',
          },
        },
        {
          speaker: 'Tom',
          text: 'Exactly. Also, your call to action is hidden. Make it a separate line: "Could you please confirm by end of day tomorrow?"',
          translation: {
            fr: 'Exactement. Et ta demande d\'action est noyée dans le texte. Mets-la sur une ligne à part : « Pourriez-vous confirmer d\'ici demain en fin de journée ? »',
            es: 'Exacto. Además, tu llamada a la acción está escondida. Ponla en una línea aparte: «¿Podrían confirmarlo antes de que acabe el día de mañana?».',
          },
        },
        {
          speaker: 'Priya',
          text: 'Perfect. Should I cc the support team too?',
          translation: {
            fr: 'Parfait. Je mets aussi l\'équipe support en copie ?',
            es: 'Perfecto. ¿Pongo también en copia al equipo de soporte?',
          },
        },
        {
          speaker: 'Tom',
          text: 'Yes, they will get customer questions, so they should be informed.',
          translation: {
            fr: 'Oui, ils vont recevoir des questions de clients, donc ils doivent être informés.',
            es: 'Sí, van a recibir preguntas de clientes, así que deberían estar informados.',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'wp-15-q1',
        type: 'choice',
        prompt: 'Which subject line is the most useful for busy stakeholders?',
        options: [
          'Update',
          'Some news',
          'Release 3.2 moved to Thursday: confirmation needed',
          'Hello team',
        ],
        correctIndex: 2,
        explanation:
          'A good subject line states the topic and whether action is required, so readers can prioritize.',
      },
      {
        id: 'wp-15-q2',
        type: 'fill',
        prompt: "I'm writing to ___ you on the status of the payment migration.",
        options: ['update', 'inform about', 'tell', 'notice'],
        correctIndex: 0,
        explanation:
          '"Update someone on something" is the natural structure; "inform about" would need "you" before "about".',
      },
      {
        id: 'wp-15-q3',
        type: 'choice',
        prompt: 'When should you cc someone on an email?',
        options: [
          'When they must do most of the work.',
          'When they should be informed but do not need to act.',
          'When you want to hide them from other recipients.',
        ],
        correctIndex: 1,
        explanation:
          'People in cc are kept informed; hiding recipients is what bcc is for.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // wp-16 — Introducing yourself
  // ---------------------------------------------------------------------------
  {
    id: 'wp-16',
    moduleId: 'workplace',
    topic: 'team',
    title: 'Introducing yourself to a new team',
    titleTranslation: {
      fr: 'Se présenter à une nouvelle équipe',
      es: 'Presentarte a un nuevo equipo',
    },
    level: 'beginner',
    premium: false,
    estimatedMinutes: 6,
    roles: ['any', 'student'],
    objective:
      'Introduce yourself briefly with your name, role, background and a personal detail, and ask simple questions to your new colleagues.',
    objectiveTranslation: {
      fr: 'Vous présenter brièvement avec votre nom, votre rôle, votre parcours et un détail personnel, et poser des questions simples à vos nouveaux collègues.',
      es: 'Presentarte brevemente con tu nombre, tu puesto, tu experiencia y un detalle personal, y hacer preguntas sencillas a tus nuevos compañeros.',
    },
    situation:
      'It is your first day. Your team lead asks you to introduce yourself at the start of the daily stand-up.',
    situationTranslation: {
      fr: 'C\'est votre premier jour. Votre team lead vous demande de vous présenter au début du daily stand-up.',
      es: 'Es tu primer día. Tu team lead te pide que te presentes al comienzo de la daily stand-up.',
    },
    vocabulary: [
      {
        term: 'onboarding',
        definition:
          'The process of helping a new employee learn the job, tools and team.',
        translation: { fr: 'intégration (onboarding)', es: 'incorporación (onboarding)' },
      },
      {
        term: 'background',
        definition:
          'Your previous experience, studies and skills.',
        translation: { fr: 'parcours', es: 'experiencia / trayectoria' },
      },
      {
        term: 'stand-up',
        definition:
          'A short daily team meeting where everyone shares what they are working on.',
        translation: { fr: 'stand-up (réunion quotidienne)', es: 'stand-up (reunión diaria)' },
      },
      {
        term: 'buddy',
        definition:
          'A colleague who helps a new person during their first weeks.',
        translation: { fr: 'parrain / marraine', es: 'compañero de acogida' },
      },
      {
        term: 'tech stack',
        definition:
          'The set of languages, frameworks and tools a team uses.',
        translation: { fr: 'stack technique', es: 'stack tecnológico' },
      },
    ],
    expressions: [
      {
        phrase: "Hi everyone, I'm Lucía. I've just joined as a backend developer.",
        usage:
          'Use it to give your name and role in one simple sentence.',
        translation: {
          fr: 'Bonjour à tous, je suis Lucía. Je viens de rejoindre l\'équipe en tant que développeuse backend.',
          es: 'Hola a todos, soy Lucía. Acabo de incorporarme como desarrolladora backend.',
        },
      },
      {
        phrase: 'Before this, I worked on payment systems for three years.',
        usage:
          'Use it to share your background in a short way.',
        translation: {
          fr: 'Avant ça, j\'ai travaillé sur des systèmes de paiement pendant trois ans.',
          es: 'Antes de esto, trabajé en sistemas de pago durante tres años.',
        },
      },
      {
        phrase: "I'm really looking forward to working with you.",
        usage:
          'Use it to end your introduction in a warm, positive way.',
        translation: {
          fr: 'J\'ai vraiment hâte de travailler avec vous.',
          es: 'Tengo muchas ganas de trabajar con vosotros.',
        },
      },
      {
        phrase: 'Outside of work, I love hiking.',
        usage:
          'Use it to add a small personal detail so people can connect with you.',
        translation: {
          fr: 'En dehors du travail, j\'adore la randonnée.',
          es: 'Fuera del trabajo, me encanta hacer senderismo.',
        },
      },
      {
        phrase: 'Who should I ask about access to the repositories?',
        usage:
          'Use it to ask a practical question during your first days.',
        translation: {
          fr: 'À qui dois-je m\'adresser pour avoir accès aux dépôts ?',
          es: '¿A quién debo preguntar para tener acceso a los repositorios?',
        },
      },
    ],
    dialogue: {
      context:
        'At the daily stand-up, team lead Marco welcomes Lucía, who has just joined the team.',
      lines: [
        {
          speaker: 'Marco',
          text: "Good morning, everyone. Before we start, we have a new team member. Lucía, would you like to introduce yourself?",
          translation: {
            fr: 'Bonjour à tous. Avant de commencer, nous avons une nouvelle collègue. Lucía, tu veux te présenter ?',
            es: 'Buenos días a todos. Antes de empezar, tenemos una nueva compañera. Lucía, ¿quieres presentarte?',
          },
        },
        {
          speaker: 'Lucía',
          text: "Sure. Hi everyone, I'm Lucía. I've just joined as a backend developer. Before this, I worked on payment systems for three years, mostly with Java and Spring.",
          translation: {
            fr: 'Bien sûr. Bonjour à tous, je suis Lucía. Je viens de rejoindre l\'équipe en tant que développeuse backend. Avant ça, j\'ai travaillé sur des systèmes de paiement pendant trois ans, surtout avec Java et Spring.',
            es: 'Claro. Hola a todos, soy Lucía. Acabo de incorporarme como desarrolladora backend. Antes de esto, trabajé en sistemas de pago durante tres años, sobre todo con Java y Spring.',
          },
        },
        {
          speaker: 'Lucía',
          text: "Outside of work, I love hiking. I'm really looking forward to working with you.",
          translation: {
            fr: 'En dehors du travail, j\'adore la randonnée. J\'ai vraiment hâte de travailler avec vous.',
            es: 'Fuera del trabajo, me encanta hacer senderismo. Tengo muchas ganas de trabajar con vosotros.',
          },
        },
        {
          speaker: 'Kenji',
          text: "Welcome, Lucía! I'm Kenji, I work on the mobile app. I'll be your buddy for the first few weeks.",
          translation: {
            fr: 'Bienvenue, Lucía ! Moi, c\'est Kenji, je travaille sur l\'appli mobile. Je serai ton parrain pendant les premières semaines.',
            es: '¡Bienvenida, Lucía! Soy Kenji, trabajo en la app móvil. Seré tu compañero de acogida durante las primeras semanas.',
          },
        },
        {
          speaker: 'Lucía',
          text: 'Thanks, Kenji! Who should I ask about access to the repositories?',
          translation: {
            fr: 'Merci, Kenji ! À qui dois-je m\'adresser pour avoir accès aux dépôts ?',
            es: '¡Gracias, Kenji! ¿A quién debo preguntar para tener acceso a los repositorios?',
          },
        },
        {
          speaker: 'Kenji',
          text: "Just ask me. I'll send you the onboarding checklist after the stand-up.",
          translation: {
            fr: 'Demande-moi, tout simplement. Je t\'envoie la checklist d\'onboarding après le stand-up.',
            es: 'Pregúntame a mí. Te envío la checklist de onboarding después de la stand-up.',
          },
        },
        {
          speaker: 'Marco',
          text: "Great. Welcome aboard, Lucía! Okay, let's start the stand-up.",
          translation: {
            fr: 'Parfait. Bienvenue à bord, Lucía ! Bon, commençons le stand-up.',
            es: 'Genial. ¡Bienvenida a bordo, Lucía! Bueno, empecemos la stand-up.',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'wp-16-q1',
        type: 'fill',
        prompt: "Hi everyone, I'm Kenji. I've just ___ as a QA engineer.",
        options: ['joined', 'entered', 'arrived to', 'come in'],
        correctIndex: 0,
        explanation:
          '"I\'ve just joined (the team) as…" is the natural way to say you are new in a role.',
      },
      {
        id: 'wp-16-q2',
        type: 'choice',
        prompt: 'What is a "buddy" during onboarding?',
        options: [
          'Your new manager',
          'A colleague who helps you during your first weeks',
          'A tool for chatting',
          'A type of contract',
        ],
        correctIndex: 1,
        explanation:
          'A buddy is a colleague assigned to help a new person settle in and answer questions.',
      },
      {
        id: 'wp-16-q3',
        type: 'choice',
        prompt: 'Which sentence is a good way to end your introduction?',
        options: [
          'That is all, I think.',
          'I hope this job is better than my last one.',
          "I'm really looking forward to working with you.",
        ],
        correctIndex: 2,
        explanation:
          'It is warm and positive, and it does not say anything negative about a previous job.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // wp-17 — Pair programming
  // ---------------------------------------------------------------------------
  {
    id: 'wp-17',
    moduleId: 'workplace',
    topic: 'collaboration',
    title: 'Pair programming: thinking out loud together',
    titleTranslation: {
      fr: 'Pair programming : réfléchir à voix haute ensemble',
      es: 'Pair programming: pensar en voz alta juntos',
    },
    level: 'intermediate',
    premium: true,
    estimatedMinutes: 9,
    roles: ['any', 'java', 'react', 'fullstack'],
    objective:
      'Explain what you are doing as you code, suggest ideas without taking over, and switch roles smoothly during a pairing session.',
    objectiveTranslation: {
      fr: 'Expliquer ce que vous faites en codant, suggérer des idées sans prendre le contrôle, et changer de rôle facilement pendant une session de pair programming.',
      es: 'Explicar lo que haces mientras programas, sugerir ideas sin acaparar y cambiar de rol con fluidez durante una sesión de pair programming.',
    },
    situation:
      'You are pairing remotely with a colleague to fix a bug where a discount is applied twice. One of you types (the driver) and the other guides (the navigator).',
    situationTranslation: {
      fr: 'Vous faites du pair programming à distance avec un collègue pour corriger un bug où une remise est appliquée deux fois. L\'un tape le code (le driver) et l\'autre guide (le navigator).',
      es: 'Estás haciendo pair programming en remoto con un compañero para arreglar un bug en el que un descuento se aplica dos veces. Uno escribe (el driver) y el otro guía (el navigator).',
    },
    vocabulary: [
      {
        term: 'driver',
        definition:
          'In pair programming, the person who controls the keyboard and writes the code.',
        translation: { fr: 'driver (celui qui tape)', es: 'driver (quien escribe)' },
      },
      {
        term: 'navigator',
        definition:
          'In pair programming, the person who reviews each line, thinks ahead and suggests direction.',
        translation: { fr: 'navigator (celui qui guide)', es: 'navigator (quien guía)' },
      },
      {
        term: 'edge case',
        definition:
          'An unusual input or situation at the limits of what the code is expected to handle.',
        translation: { fr: 'cas limite', es: 'caso límite' },
      },
      {
        term: 'to step through',
        definition:
          'To run code line by line with a debugger to see what happens at each step.',
        translation: { fr: 'exécuter pas à pas', es: 'ejecutar paso a paso' },
      },
      {
        term: 'to swap',
        definition:
          'To exchange roles, for example when the driver becomes the navigator.',
        translation: { fr: 'échanger (les rôles)', es: 'intercambiar (los roles)' },
      },
    ],
    expressions: [
      {
        phrase: "Okay, so what I'm trying to do here is…",
        usage:
          'Use it to think out loud and explain your intention before you type.',
        translation: {
          fr: 'Bon, ce que j\'essaie de faire ici, c\'est…',
          es: 'Vale, lo que intento hacer aquí es…',
        },
      },
      {
        phrase: 'What do you think about extracting this into a function?',
        usage:
          'Use it to suggest an idea as a question, so your partner stays in control.',
        translation: {
          fr: 'Qu\'est-ce que tu penses de l\'extraire dans une fonction ?',
          es: '¿Qué te parece extraer esto a una función?',
        },
      },
      {
        phrase: 'Hang on, can we go back to line 42 for a second?',
        usage:
          'Use it to politely pause the driver when you notice something.',
        translation: {
          fr: 'Attends, on peut revenir à la ligne 42 une seconde ?',
          es: 'Espera, ¿podemos volver a la línea 42 un momento?',
        },
      },
      {
        phrase: "I'm not sure, let's write a test and find out.",
        usage:
          'Use it to settle a doubt with evidence instead of debating.',
        translation: {
          fr: 'Je ne suis pas sûr, écrivons un test pour en avoir le cœur net.',
          es: 'No estoy seguro, escribamos un test y lo comprobamos.',
        },
      },
      {
        phrase: 'Do you want to swap? You can drive for a bit.',
        usage:
          'Use it to offer to change roles and keep both people engaged.',
        translation: {
          fr: 'On échange ? Tu peux prendre le clavier un moment.',
          es: '¿Cambiamos? Puedes llevar el teclado un rato.',
        },
      },
    ],
    dialogue: {
      context:
        'Tom is driving and Amara is navigating while they debug a double discount in the cart service.',
      lines: [
        {
          speaker: 'Tom',
          text: "Okay, so what I'm trying to do here is find where the discount gets applied. I'll search for applyDiscount.",
          translation: {
            fr: 'Bon, ce que j\'essaie de faire ici, c\'est de trouver où la remise est appliquée. Je cherche applyDiscount.',
            es: 'Vale, lo que intento hacer aquí es encontrar dónde se aplica el descuento. Voy a buscar applyDiscount.',
          },
        },
        {
          speaker: 'Amara',
          text: "Hang on, it's called in two places: the cart controller and the pricing service. That might be our bug.",
          translation: {
            fr: 'Attends, elle est appelée à deux endroits : le contrôleur du panier et le service de tarification. C\'est peut-être ça, notre bug.',
            es: 'Espera, se llama en dos sitios: el controlador del carrito y el servicio de precios. Puede que ese sea nuestro bug.',
          },
        },
        {
          speaker: 'Tom',
          text: 'Good catch. Let me put a breakpoint in both and step through the checkout flow.',
          translation: {
            fr: 'Bien vu. Je mets un point d\'arrêt dans les deux et j\'exécute le parcours de paiement pas à pas.',
            es: 'Bien visto. Pongo un breakpoint en los dos y ejecuto el flujo de pago paso a paso.',
          },
        },
        {
          speaker: 'Amara',
          text: "Yep, both are hit. What do you think about removing the call in the controller? Pricing logic should live in the service anyway.",
          translation: {
            fr: 'Oui, les deux sont déclenchés. Qu\'est-ce que tu penses de supprimer l\'appel dans le contrôleur ? De toute façon, la logique de prix devrait être dans le service.',
            es: 'Sí, se ejecutan los dos. ¿Qué te parece quitar la llamada del controlador? De todos modos, la lógica de precios debería estar en el servicio.',
          },
        },
        {
          speaker: 'Tom',
          text: "Agreed. But what about the edge case where the cart is updated without going through the service?",
          translation: {
            fr: 'D\'accord. Mais que se passe-t-il dans le cas limite où le panier est mis à jour sans passer par le service ?',
            es: 'De acuerdo. Pero ¿qué pasa con el caso límite en el que el carrito se actualiza sin pasar por el servicio?',
          },
        },
        {
          speaker: 'Amara',
          text: "I'm not sure that can happen. Let's write a test and find out.",
          translation: {
            fr: 'Je ne suis pas sûre que ça puisse arriver. Écrivons un test pour en avoir le cœur net.',
            es: 'No estoy segura de que eso pueda pasar. Escribamos un test y lo comprobamos.',
          },
        },
        {
          speaker: 'Tom',
          text: 'Sounds good. Actually, do you want to swap? You can drive and write the test while I check the other callers.',
          translation: {
            fr: 'Ça marche. En fait, on échange ? Tu prends le clavier et tu écris le test pendant que je vérifie les autres appels.',
            es: 'Me parece bien. De hecho, ¿cambiamos? Tú llevas el teclado y escribes el test mientras yo reviso las otras llamadas.',
          },
        },
        {
          speaker: 'Amara',
          text: "Sure, share the session with me. I'll start with a test that adds one item with a ten percent discount.",
          translation: {
            fr: 'Bien sûr, partage-moi la session. Je commence par un test qui ajoute un article avec une remise de dix pour cent.',
            es: 'Claro, compárteme la sesión. Empiezo con un test que añade un artículo con un descuento del diez por ciento.',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'wp-17-q1',
        type: 'choice',
        prompt: 'In pair programming, what does the navigator do?',
        options: [
          'Types all the code.',
          'Reviews the code, thinks ahead and suggests direction.',
          'Deploys the code to production.',
          'Writes the documentation after the session.',
        ],
        correctIndex: 1,
        explanation:
          'The driver types; the navigator watches each step, spots problems and thinks about the bigger picture.',
      },
      {
        id: 'wp-17-q2',
        type: 'fill',
        prompt: "Let's ___ through the function with the debugger to see where the value changes.",
        options: ['walk', 'run', 'go', 'step'],
        correctIndex: 3,
        explanation:
          '"Step through" is the standard phrase for executing code line by line in a debugger.',
      },
      {
        id: 'wp-17-q3',
        type: 'choice',
        prompt: 'Which is the most collaborative way to suggest a change to your pair?',
        options: [
          'What do you think about extracting this into a function?',
          'No, that is wrong. Give me the keyboard.',
          'Just do what I say.',
        ],
        correctIndex: 0,
        explanation:
          'Framing the idea as a question invites discussion and keeps the driver involved.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // wp-18 — Disagreeing politely
  // ---------------------------------------------------------------------------
  {
    id: 'wp-18',
    moduleId: 'workplace',
    topic: 'collaboration',
    title: 'Disagreeing politely in technical discussions',
    titleTranslation: {
      fr: 'Exprimer son désaccord poliment dans les discussions techniques',
      es: 'Discrepar con educación en las discusiones técnicas',
    },
    level: 'advanced',
    premium: true,
    estimatedMinutes: 10,
    roles: ['any', 'architect'],
    objective:
      'Express disagreement with hedging and evidence, acknowledge the other view, and move the team towards a decision.',
    objectiveTranslation: {
      fr: 'Exprimer un désaccord avec nuance et des arguments factuels, reconnaître le point de vue de l\'autre et amener l\'équipe vers une décision.',
      es: 'Expresar desacuerdo con matices y datos, reconocer el punto de vista del otro y llevar al equipo hacia una decisión.',
    },
    situation:
      'In an architecture meeting, a senior colleague proposes splitting the monolith into microservices right away. You think it is premature and want to say so without creating conflict.',
    situationTranslation: {
      fr: 'Lors d\'une réunion d\'architecture, un collègue senior propose de découper le monolithe en microservices tout de suite. Vous pensez que c\'est prématuré et vous voulez le dire sans créer de conflit.',
      es: 'En una reunión de arquitectura, un compañero senior propone dividir el monolito en microservicios de inmediato. Crees que es prematuro y quieres decirlo sin crear conflicto.',
    },
    vocabulary: [
      {
        term: 'to push back',
        definition:
          'To resist or challenge a proposal, usually in a professional and reasoned way.',
        translation: { fr: 'contester / s\'opposer', es: 'oponerse / cuestionar' },
      },
      {
        term: 'premature',
        definition:
          'Done too early, before the conditions or the evidence justify it.',
        translation: { fr: 'prématuré', es: 'prematuro' },
      },
      {
        term: 'operational overhead',
        definition:
          'The extra effort and cost needed to run, monitor and maintain a system.',
        translation: { fr: 'charge opérationnelle', es: 'carga operativa' },
      },
      {
        term: 'spike',
        definition:
          'A short, time-boxed investigation to reduce uncertainty before committing to a solution.',
        translation: { fr: 'spike (étude exploratoire)', es: 'spike (investigación acotada)' },
      },
      {
        term: 'to disagree and commit',
        definition:
          'To voice your disagreement, then fully support the team\'s final decision.',
        translation: {
          fr: 'exprimer son désaccord puis s\'engager',
          es: 'discrepar y comprometerse',
        },
      },
    ],
    expressions: [
      {
        phrase: 'I see where you\'re coming from, but I have a slightly different take.',
        usage:
          'Use it to acknowledge the other person\'s view before offering your own.',
        translation: {
          fr: 'Je comprends ton point de vue, mais j\'ai une approche un peu différente.',
          es: 'Entiendo tu punto de vista, pero lo veo de forma un poco distinta.',
        },
      },
      {
        phrase: "I'm not entirely convinced that's the right move at this stage.",
        usage:
          'Use it to disagree with hedging, focusing on timing rather than the idea itself.',
        translation: {
          fr: 'Je ne suis pas tout à fait convaincu que ce soit la bonne décision à ce stade.',
          es: 'No estoy del todo convencido de que sea la decisión adecuada en este momento.',
        },
      },
      {
        phrase: 'Could we look at the data before we decide?',
        usage:
          'Use it to shift the discussion from opinions to evidence.',
        translation: {
          fr: 'On pourrait regarder les données avant de décider ?',
          es: '¿Podríamos revisar los datos antes de decidir?',
        },
      },
      {
        phrase: 'What would it take to change your mind?',
        usage:
          'Use it to find out which evidence or criteria would settle the debate.',
        translation: {
          fr: 'Qu\'est-ce qui pourrait te faire changer d\'avis ?',
          es: '¿Qué haría falta para que cambiaras de opinión?',
        },
      },
      {
        phrase: "I still have reservations, but I'm happy to go with the team's decision.",
        usage:
          'Use it to disagree and commit, keeping the relationship positive.',
        translation: {
          fr: 'J\'ai encore des réserves, mais je suis prêt à suivre la décision de l\'équipe.',
          es: 'Sigo teniendo reservas, pero acepto con gusto la decisión del equipo.',
        },
      },
    ],
    dialogue: {
      context:
        'During an architecture review, Marco proposes migrating to microservices, and Priya disagrees.',
      lines: [
        {
          speaker: 'Marco',
          text: 'The monolith is getting hard to work with. I think we should start splitting it into microservices this quarter.',
          translation: {
            fr: 'Le monolithe devient difficile à faire évoluer. Je pense qu\'on devrait commencer à le découper en microservices ce trimestre.',
            es: 'El monolito se está volviendo difícil de mantener. Creo que deberíamos empezar a dividirlo en microservicios este trimestre.',
          },
        },
        {
          speaker: 'Priya',
          text: "I see where you're coming from, but I have a slightly different take. I'm not entirely convinced that's the right move at this stage.",
          translation: {
            fr: 'Je comprends ton point de vue, mais j\'ai une approche un peu différente. Je ne suis pas tout à fait convaincue que ce soit la bonne décision à ce stade.',
            es: 'Entiendo tu punto de vista, pero lo veo de forma un poco distinta. No estoy del todo convencida de que sea la decisión adecuada en este momento.',
          },
        },
        {
          speaker: 'Marco',
          text: 'Why not? Deployments take forever, and teams keep stepping on each other\'s toes.',
          translation: {
            fr: 'Pourquoi pas ? Les déploiements prennent une éternité, et les équipes se marchent sans arrêt sur les pieds.',
            es: '¿Por qué no? Los despliegues tardan una eternidad y los equipos se pisan continuamente.',
          },
        },
        {
          speaker: 'Priya',
          text: "Those are real problems. My concern is the operational overhead: we only have two people on-call, and we don't have distributed tracing yet. We might end up with a distributed monolith.",
          translation: {
            fr: 'Ce sont de vrais problèmes. Ce qui m\'inquiète, c\'est la charge opérationnelle : nous n\'avons que deux personnes d\'astreinte, et pas encore de tracing distribué. On risque de se retrouver avec un monolithe distribué.',
            es: 'Son problemas reales. Lo que me preocupa es la carga operativa: solo tenemos dos personas de guardia y todavía no tenemos trazabilidad distribuida. Podríamos acabar con un monolito distribuido.',
          },
        },
        {
          speaker: 'Marco',
          text: "Fair, but I still think the slow deployments are the bigger risk.",
          translation: {
            fr: 'C\'est juste, mais je pense toujours que la lenteur des déploiements est le plus gros risque.',
            es: 'Es justo, pero sigo pensando que los despliegues lentos son el mayor riesgo.',
          },
        },
        {
          speaker: 'Priya',
          text: 'Could we look at the data before we decide? If most of the deployment time is the test suite, modularizing the monolith might solve it more cheaply.',
          translation: {
            fr: 'On pourrait regarder les données avant de décider ? Si l\'essentiel du temps de déploiement vient de la suite de tests, modulariser le monolithe pourrait régler le problème à moindre coût.',
            es: '¿Podríamos revisar los datos antes de decidir? Si la mayor parte del tiempo de despliegue es la batería de tests, modularizar el monolito podría resolverlo de forma más barata.',
          },
        },
        {
          speaker: 'Marco',
          text: "Okay, that's reasonable. What if we do a two-week spike: measure the pipeline and extract one service as a pilot?",
          translation: {
            fr: 'D\'accord, c\'est raisonnable. Et si on faisait un spike de deux semaines : mesurer le pipeline et extraire un service à titre de pilote ?',
            es: 'Vale, es razonable. ¿Y si hacemos un spike de dos semanas: medir el pipeline y extraer un servicio como piloto?',
          },
        },
        {
          speaker: 'Priya',
          text: "That works for me. And if the pilot goes well, I'm happy to go with the migration, even if I still have some reservations.",
          translation: {
            fr: 'Ça me va. Et si le pilote se passe bien, je suis prête à suivre la migration, même si j\'ai encore quelques réserves.',
            es: 'Me parece bien. Y si el piloto sale bien, acepto la migración con gusto, aunque todavía tenga algunas reservas.',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'wp-18-q1',
        type: 'choice',
        prompt: 'Which sentence disagrees most diplomatically?',
        options: [
          'That idea makes no sense.',
          "I'm not entirely convinced that's the right move at this stage.",
          'You are wrong about microservices.',
          'We tried that before and it failed.',
        ],
        correctIndex: 1,
        explanation:
          'Hedging ("not entirely", "at this stage") softens the disagreement and focuses on timing, not the person.',
      },
      {
        id: 'wp-18-q2',
        type: 'fill',
        prompt: "I see where you're coming ___, but I have a different take.",
        options: ['to', 'out', 'from', 'by'],
        correctIndex: 2,
        explanation:
          '"I see where you\'re coming from" is a fixed phrase meaning "I understand your point of view".',
      },
      {
        id: 'wp-18-q3',
        type: 'choice',
        prompt: 'What does "disagree and commit" mean?',
        options: [
          'Keep arguing until everyone agrees with you.',
          'Say nothing to avoid conflict.',
          'Voice your concerns, then fully support the final decision.',
        ],
        correctIndex: 2,
        explanation:
          'You share your disagreement openly, and once the team decides, you commit to making the decision succeed.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // wp-19 — Handover before vacation
  // ---------------------------------------------------------------------------
  {
    id: 'wp-19',
    moduleId: 'workplace',
    topic: 'team',
    title: 'Handing over your work before a vacation',
    titleTranslation: {
      fr: 'Passer le relais avant de partir en vacances',
      es: 'Traspasar tu trabajo antes de las vacaciones',
    },
    level: 'intermediate',
    premium: true,
    estimatedMinutes: 8,
    roles: ['any', 'devops'],
    objective:
      'Organize a clear handover: current status, open risks, where to find things and who to contact while you are away.',
    objectiveTranslation: {
      fr: 'Organiser une passation claire : état actuel, risques en cours, où trouver les informations et qui contacter pendant votre absence.',
      es: 'Organizar un traspaso claro: estado actual, riesgos abiertos, dónde encontrar las cosas y a quién contactar mientras estás fuera.',
    },
    situation:
      'You are going on vacation for two weeks tomorrow. A colleague will take over your work on a database migration that is halfway done.',
    situationTranslation: {
      fr: 'Vous partez en vacances deux semaines demain. Un collègue va reprendre votre travail sur une migration de base de données à moitié terminée.',
      es: 'Mañana te vas de vacaciones dos semanas. Un compañero va a encargarse de tu trabajo en una migración de base de datos que está a medias.',
    },
    vocabulary: [
      {
        term: 'handover',
        definition:
          'The process of passing your responsibilities and knowledge to another person.',
        translation: { fr: 'passation', es: 'traspaso' },
      },
      {
        term: 'to take over',
        definition:
          'To become responsible for a task that someone else was doing.',
        translation: { fr: 'reprendre', es: 'hacerse cargo de' },
      },
      {
        term: 'out-of-office (OOO)',
        definition:
          'Away from work; also the automatic email reply that says so.',
        translation: { fr: 'absent (message d\'absence)', es: 'fuera de la oficina (respuesta automática)' },
      },
      {
        term: 'runbook',
        definition:
          'A document with step-by-step instructions for operating a system or handling a known problem.',
        translation: { fr: 'runbook (procédure d\'exploitation)', es: 'runbook (manual de operaciones)' },
      },
      {
        term: 'point of contact',
        definition:
          'The person others should go to for questions about a specific topic.',
        translation: { fr: 'interlocuteur référent', es: 'persona de contacto' },
      },
    ],
    expressions: [
      {
        phrase: "Let me bring you up to speed on where things are.",
        usage:
          'Use it to start a handover and explain the current status.',
        translation: {
          fr: 'Je vais te mettre au courant de l\'état d\'avancement.',
          es: 'Déjame ponerte al día de cómo están las cosas.',
        },
      },
      {
        phrase: 'The main thing to watch out for is…',
        usage:
          'Use it to highlight the biggest risk your colleague must know about.',
        translation: {
          fr: 'Le principal point de vigilance, c\'est…',
          es: 'Lo principal que hay que vigilar es…',
        },
      },
      {
        phrase: "Everything is documented in the ticket and the runbook.",
        usage:
          'Use it to point your colleague to written information they can rely on.',
        translation: {
          fr: 'Tout est documenté dans le ticket et le runbook.',
          es: 'Todo está documentado en el ticket y en el runbook.',
        },
      },
      {
        phrase: 'If anything urgent comes up, Tom is the point of contact.',
        usage:
          'Use it to say who can help while you are away.',
        translation: {
          fr: 'En cas d\'urgence, c\'est Tom l\'interlocuteur référent.',
          es: 'Si surge algo urgente, la persona de contacto es Tom.',
        },
      },
      {
        phrase: "I'll be offline, but I'll check messages when I'm back on the 20th.",
        usage:
          'Use it to set clear expectations about your availability.',
        translation: {
          fr: 'Je serai déconnecté, mais je regarderai mes messages à mon retour le 20.',
          es: 'Estaré desconectado, pero revisaré los mensajes cuando vuelva el día 20.',
        },
      },
    ],
    dialogue: {
      context:
        'On her last day before vacation, Amara hands over a database migration to Kenji.',
      lines: [
        {
          speaker: 'Amara',
          text: "Thanks for taking over the migration, Kenji. Let me bring you up to speed on where things are.",
          translation: {
            fr: 'Merci de reprendre la migration, Kenji. Je vais te mettre au courant de l\'état d\'avancement.',
            es: 'Gracias por hacerte cargo de la migración, Kenji. Déjame ponerte al día de cómo están las cosas.',
          },
        },
        {
          speaker: 'Kenji',
          text: 'Sure. How far along are you?',
          translation: {
            fr: 'Bien sûr. Tu en es où ?',
            es: 'Claro. ¿Cuánto llevas hecho?',
          },
        },
        {
          speaker: 'Amara',
          text: "The new tables are created and the backfill script has run on staging. The production backfill is planned for Wednesday night.",
          translation: {
            fr: 'Les nouvelles tables sont créées et le script de backfill a tourné sur staging. Le backfill en production est prévu mercredi soir.',
            es: 'Las tablas nuevas están creadas y el script de backfill se ha ejecutado en staging. El backfill en producción está previsto para el miércoles por la noche.',
          },
        },
        {
          speaker: 'Kenji',
          text: 'Okay. Is there anything risky I should know about?',
          translation: {
            fr: 'D\'accord. Il y a quelque chose de risqué que je devrais savoir ?',
            es: 'Vale. ¿Hay algo arriesgado que debería saber?',
          },
        },
        {
          speaker: 'Amara',
          text: "The main thing to watch out for is table locks. Run the script in batches of ten thousand rows, never all at once. Everything is documented in the ticket and the runbook.",
          translation: {
            fr: 'Le principal point de vigilance, ce sont les verrous sur les tables. Lance le script par lots de dix mille lignes, jamais tout d\'un coup. Tout est documenté dans le ticket et le runbook.',
            es: 'Lo principal que hay que vigilar son los bloqueos de tablas. Ejecuta el script en lotes de diez mil filas, nunca todo de golpe. Todo está documentado en el ticket y en el runbook.',
          },
        },
        {
          speaker: 'Kenji',
          text: 'Got it. And if something goes wrong during the backfill?',
          translation: {
            fr: 'Compris. Et si quelque chose se passe mal pendant le backfill ?',
            es: 'Entendido. ¿Y si algo sale mal durante el backfill?',
          },
        },
        {
          speaker: 'Amara',
          text: "There's a rollback section in the runbook. If anything urgent comes up, Tom is the point of contact; he reviewed the whole design.",
          translation: {
            fr: 'Il y a une section rollback dans le runbook. En cas d\'urgence, c\'est Tom l\'interlocuteur référent ; il a relu toute la conception.',
            es: 'Hay una sección de rollback en el runbook. Si surge algo urgente, la persona de contacto es Tom; él revisó todo el diseño.',
          },
        },
        {
          speaker: 'Kenji',
          text: 'Perfect. Enjoy your vacation, and please actually disconnect!',
          translation: {
            fr: 'Parfait. Profite bien de tes vacances, et déconnecte vraiment !',
            es: 'Perfecto. Disfruta de las vacaciones, ¡y desconecta de verdad!',
          },
        },
        {
          speaker: 'Amara',
          text: "I will! I'll be offline, but I'll check messages when I'm back on the 20th.",
          translation: {
            fr: 'Promis ! Je serai déconnectée, mais je regarderai mes messages à mon retour le 20.',
            es: '¡Lo haré! Estaré desconectada, pero revisaré los mensajes cuando vuelva el día 20.',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'wp-19-q1',
        type: 'fill',
        prompt: 'Before I leave, let me bring you up to ___ on the project.',
        options: ['date', 'speed', 'level', 'time'],
        correctIndex: 1,
        explanation:
          '"Bring someone up to speed" means to give them all the latest information they need.',
      },
      {
        id: 'wp-19-q2',
        type: 'choice',
        prompt: 'What is a runbook?',
        options: [
          'A list of team holidays.',
          'A log of all deployments.',
          'A performance review document.',
          'Step-by-step instructions for operating a system or handling known problems.',
        ],
        correctIndex: 3,
        explanation:
          'A runbook tells people exactly what to do for routine operations or incidents, which is why it is key in a handover.',
      },
      {
        id: 'wp-19-q3',
        type: 'choice',
        prompt: 'Which item is the most important to include in a handover?',
        options: [
          'The main risks and who to contact if something goes wrong.',
          'Your vacation destination.',
          'A list of every commit you made this year.',
        ],
        correctIndex: 0,
        explanation:
          'Your colleague needs to know the risks and where to get help, so they can act safely while you are away.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // wp-20 — Asking for and offering help
  // ---------------------------------------------------------------------------
  {
    id: 'wp-20',
    moduleId: 'workplace',
    topic: 'collaboration',
    title: 'Asking for help and offering help',
    titleTranslation: {
      fr: 'Demander de l\'aide et proposer son aide',
      es: 'Pedir ayuda y ofrecer ayuda',
    },
    level: 'beginner',
    premium: false,
    estimatedMinutes: 6,
    roles: ['any', 'student'],
    objective:
      'Ask for help politely, explain what you have already tried, and offer help to colleagues in a friendly way.',
    objectiveTranslation: {
      fr: 'Demander de l\'aide poliment, expliquer ce que vous avez déjà essayé et proposer votre aide à vos collègues de façon amicale.',
      es: 'Pedir ayuda con educación, explicar lo que ya has probado y ofrecer ayuda a tus compañeros de forma amable.',
    },
    situation:
      'You have been stuck on a failing test for an hour. You decide to ask a colleague for help, and later you notice another colleague who looks stuck too.',
    situationTranslation: {
      fr: 'Vous êtes bloqué sur un test qui échoue depuis une heure. Vous décidez de demander de l\'aide à un collègue, et plus tard vous remarquez une autre collègue qui semble bloquée elle aussi.',
      es: 'Llevas una hora atascado con un test que falla. Decides pedir ayuda a un compañero y, más tarde, ves a otra compañera que también parece atascada.',
    },
    vocabulary: [
      {
        term: 'stuck',
        definition:
          'Unable to make progress because you do not know how to solve a problem.',
        translation: { fr: 'bloqué', es: 'atascado' },
      },
      {
        term: 'to figure out',
        definition:
          'To understand something or find the solution to a problem.',
        translation: { fr: 'comprendre / trouver', es: 'averiguar / entender' },
      },
      {
        term: 'failing test',
        definition:
          'An automated test that does not pass.',
        translation: { fr: 'test qui échoue', es: 'test que falla' },
      },
      {
        term: 'error message',
        definition:
          'The text a program shows when something goes wrong.',
        translation: { fr: 'message d\'erreur', es: 'mensaje de error' },
      },
      {
        term: 'to give someone a hand',
        definition:
          'To help someone with a task.',
        translation: { fr: 'donner un coup de main à quelqu\'un', es: 'echarle una mano a alguien' },
      },
    ],
    expressions: [
      {
        phrase: 'Do you have five minutes? I could use some help.',
        usage:
          'Use it to ask for help politely and show that it will not take long.',
        translation: {
          fr: 'Tu as cinq minutes ? J\'aurais besoin d\'un peu d\'aide.',
          es: '¿Tienes cinco minutos? Me vendría bien un poco de ayuda.',
        },
      },
      {
        phrase: "I've already tried clearing the cache, but it didn't work.",
        usage:
          'Use it to explain what you tried, so your colleague does not repeat it.',
        translation: {
          fr: 'J\'ai déjà essayé de vider le cache, mais ça n\'a pas marché.',
          es: 'Ya he probado a borrar la caché, pero no ha funcionado.',
        },
      },
      {
        phrase: "I can't figure out why this test is failing.",
        usage:
          'Use it to describe your problem clearly.',
        translation: {
          fr: 'Je n\'arrive pas à comprendre pourquoi ce test échoue.',
          es: 'No consigo entender por qué falla este test.',
        },
      },
      {
        phrase: 'Need a hand with that?',
        usage:
          'Use it to offer help in a friendly, informal way.',
        translation: {
          fr: 'Besoin d\'un coup de main ?',
          es: '¿Te echo una mano?',
        },
      },
      {
        phrase: 'Thanks a lot, I really appreciate it.',
        usage:
          'Use it to thank someone who has helped you.',
        translation: {
          fr: 'Merci beaucoup, c\'est vraiment sympa.',
          es: 'Muchas gracias, te lo agradezco de verdad.',
        },
      },
    ],
    dialogue: {
      context:
        'Kenji asks Lucía for help with a failing test, and later offers help to Amara.',
      lines: [
        {
          speaker: 'Kenji',
          text: 'Hi Lucía, do you have five minutes? I could use some help.',
          translation: {
            fr: 'Salut Lucía, tu as cinq minutes ? J\'aurais besoin d\'un peu d\'aide.',
            es: 'Hola, Lucía, ¿tienes cinco minutos? Me vendría bien un poco de ayuda.',
          },
        },
        {
          speaker: 'Lucía',
          text: 'Sure, what is it?',
          translation: {
            fr: 'Bien sûr, qu\'est-ce qu\'il y a ?',
            es: 'Claro, ¿qué pasa?',
          },
        },
        {
          speaker: 'Kenji',
          text: "I can't figure out why this test is failing. The error message says the date is wrong. I've already tried clearing the cache, but it didn't work.",
          translation: {
            fr: 'Je n\'arrive pas à comprendre pourquoi ce test échoue. Le message d\'erreur dit que la date est incorrecte. J\'ai déjà essayé de vider le cache, mais ça n\'a pas marché.',
            es: 'No consigo entender por qué falla este test. El mensaje de error dice que la fecha es incorrecta. Ya he probado a borrar la caché, pero no ha funcionado.',
          },
        },
        {
          speaker: 'Lucía',
          text: 'Hmm, does it fail on the CI server too, or only on your machine?',
          translation: {
            fr: 'Hum, il échoue aussi sur le serveur de CI, ou seulement sur ta machine ?',
            es: 'Mmm, ¿falla también en el servidor de CI o solo en tu máquina?',
          },
        },
        {
          speaker: 'Kenji',
          text: 'Only on my machine.',
          translation: {
            fr: 'Seulement sur ma machine.',
            es: 'Solo en mi máquina.',
          },
        },
        {
          speaker: 'Lucía',
          text: "Then it's probably the time zone. The CI server uses UTC. Try setting the time zone in the test.",
          translation: {
            fr: 'Alors c\'est sûrement le fuseau horaire. Le serveur de CI est en UTC. Essaie de définir le fuseau horaire dans le test.',
            es: 'Entonces seguramente es la zona horaria. El servidor de CI usa UTC. Prueba a fijar la zona horaria en el test.',
          },
        },
        {
          speaker: 'Kenji',
          text: 'It passes now! Thanks a lot, I really appreciate it.',
          translation: {
            fr: 'Il passe maintenant ! Merci beaucoup, c\'est vraiment sympa.',
            es: '¡Ahora pasa! Muchas gracias, te lo agradezco de verdad.',
          },
        },
        {
          speaker: 'Kenji',
          text: 'Amara, you look stuck too. Need a hand with that?',
          translation: {
            fr: 'Amara, tu as l\'air bloquée toi aussi. Besoin d\'un coup de main ?',
            es: 'Amara, tú también pareces atascada. ¿Te echo una mano?',
          },
        },
      ],
    },
    quiz: [
      {
        id: 'wp-20-q1',
        type: 'choice',
        prompt: 'Which is the best way to ask a colleague for help?',
        options: [
          'Fix my code.',
          'Do you have five minutes? I could use some help with a failing test.',
          'Why is your code broken?',
        ],
        correctIndex: 1,
        explanation:
          'It is polite, it says how long it may take, and it explains the topic.',
      },
      {
        id: 'wp-20-q2',
        type: 'fill',
        prompt: "I can't ___ out why the build is so slow.",
        options: ['find', 'think', 'figure', 'look'],
        correctIndex: 2,
        explanation:
          '"Figure out" means to understand or find the solution to something.',
      },
      {
        id: 'wp-20-q3',
        type: 'choice',
        prompt: 'Why should you say what you have already tried?',
        options: [
          'To show that you are better than your colleague.',
          'To make the conversation longer.',
          'Because it is a company rule.',
          'So your colleague does not suggest the same things again.',
        ],
        correctIndex: 3,
        explanation:
          'Sharing what you tried saves time and helps your colleague focus on new ideas.',
      },
    ],
  },
];
